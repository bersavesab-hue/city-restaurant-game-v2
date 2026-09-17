import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { gameState } from "../core/GameState.js";

import { dishResearchSystem } from "./DishResearchSystem.js";
import {
  DISH_TIERS,
  DISH_MASTERY_NAMES,
  OUTPUT_QUALITY_LEVELS
} from "../data/dishLifecycle.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentDay() {
  return gameState.getSection("time")?.day ?? 1;
}

function requireCustomDish(dishId) {
  const dish = entitySystem.get(
    "custom_dish",
    dishId
  );

  if (!dish) {
    throw new Error(
      `Custom dish "${dishId}" does not exist`
    );
  }

  return dish;
}

function outputQuality(score) {
  let result =
    OUTPUT_QUALITY_LEVELS[0];

  for (
    const level
    of OUTPUT_QUALITY_LEVELS
  ) {
    if (score >= level.min) {
      result = level;
    }
  }

  return {
    ...result,
    score
  };
}

class DishLifecycleSystem {
  ensureProfile(dishId) {
    const dish =
      requireCustomDish(dishId);

    const market =
      dish.marketPerformance ?? {
        sold: dish.lifetimeSold ?? 0,
        revenue:
          dish.lifetimeRevenue ?? 0,
        ingredientCost: 0,
        grossProfit: 0,
        grossMargin: 0,
        averageSalePrice: 0,
        averageOutputQuality:
          dish.qualityScore ?? 50,
        popularityScore: 20,
        reputationScore: 50,
        serviceCount: 0,
        lastSoldDay: null
      };

    const tier =
      this.calculateTier({
        ...dish,
        marketPerformance: market
      });

    const changes = {};

    if (!dish.dishTierId) {
      changes.dishTierId =
        tier.id;

      changes.dishTierOrder =
        tier.order;
    }

    if (!dish.marketPerformance) {
      changes.marketPerformance =
        market;
    }

    if (!dish.outputQuality) {
      changes.outputQuality =
        outputQuality(
          market.averageOutputQuality
        );
    }

    if (!dish.masteryName) {
      changes.masteryName =
        DISH_MASTERY_NAMES[
          dish.masteryLevel ?? 1
        ] ?? "生疏";
    }

    if (
      Object.keys(changes).length === 0
    ) {
      return dish;
    }

    return entitySystem.update(
      "custom_dish",
      dish.id,
      changes
    );
  }

  calculateTier(dish) {
    const quality =
      dish.qualityScore ?? 0;

    const mastery =
      dish.masteryLevel ?? 1;

    const market =
      dish.marketPerformance ?? {};

    const sold =
      market.sold ??
      dish.lifetimeSold ??
      0;

    const reputation =
      market.reputationScore ?? 0;

    let tier =
      DISH_TIERS[0];

    for (
      const candidate
      of DISH_TIERS
    ) {
      if (
        quality >=
          candidate.minQuality &&
        mastery >=
          candidate.minMastery &&
        sold >=
          candidate.minSold &&
        reputation >=
          candidate.minReputation
      ) {
        tier = candidate;
      }
    }

    return {
      ...tier
    };
  }

  getTier(dishId) {
    const dish =
      this.ensureProfile(dishId);

    return this.calculateTier(dish);
  }

  getMastery(dishId) {
    const dish =
      this.ensureProfile(dishId);

    const level =
      clamp(
        dish.masteryLevel ?? 1,
        1,
        5
      );

    return {
      level,
      name:
        DISH_MASTERY_NAMES[level]
    };
  }

  recordService({
    dishId,
    quantity,
    revenue,
    ingredientCost = 0,
    outputQualityScore = null
  }) {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new RangeError(
        "Dish service quantity must be positive"
      );
    }

    const dish =
      this.ensureProfile(dishId);

    const previousTier =
      this.calculateTier(dish);

    const old =
      dish.marketPerformance;

    const sold =
      old.sold + quantity;

    const nextRevenue =
      old.revenue +
      Math.max(0, revenue ?? 0);

    const nextCost =
      old.ingredientCost +
      Math.max(
        0,
        ingredientCost ?? 0
      );

    const grossProfit =
      nextRevenue -
      nextCost;

    const grossMargin =
      nextRevenue > 0
        ? Number(
            (
              grossProfit /
              nextRevenue
            ).toFixed(4)
          )
        : 0;

    const qualityScore =
      outputQualityScore ??
      dish.qualityScore ??
      50;

    const oldPortions =
      Math.max(
        0,
        old.sold
      );

    const averageOutputQuality =
      Math.round(
        (
          old.averageOutputQuality *
            oldPortions +
          qualityScore *
            quantity
        ) /
        Math.max(
          1,
          oldPortions +
            quantity
        )
      );

    const serviceCount =
      (old.serviceCount ?? 0) +
      1;

    let reputationDelta = 0;

    if (qualityScore >= 90) {
      reputationDelta = 5;
    } else if (qualityScore >= 80) {
      reputationDelta = 4;
    } else if (qualityScore >= 70) {
      reputationDelta = 2;
    } else if (qualityScore >= 60) {
      reputationDelta = 1;
    } else if (qualityScore < 50) {
      reputationDelta = -3;
    }

    if (
      grossMargin >= 0.6
    ) {
      reputationDelta += 1;
    }

    const reputationScore =
      clamp(
        (old.reputationScore ?? 50) +
          reputationDelta,
        0,
        100
      );

    const popularityScore =
      clamp(
        Math.round(
          15 +
          Math.log10(
            sold + 1
          ) * 20 +
          reputationScore * 0.35
        ),
        0,
        100
      );

    const averageSalePrice =
      sold > 0
        ? Number(
            (
              nextRevenue /
              sold
            ).toFixed(2)
          )
        : 0;

    const marketPerformance = {
      sold,
      revenue:
        nextRevenue,
      ingredientCost:
        nextCost,
      grossProfit,
      grossMargin,
      averageSalePrice,
      averageOutputQuality,
      popularityScore,
      reputationScore,
      serviceCount,
      lastSoldDay:
        currentDay()
    };

    const projected = {
      ...dish,
      marketPerformance
    };

    const nextTier =
      this.calculateTier(
        projected
      );

    const masteryLevel =
      clamp(
        dish.masteryLevel ?? 1,
        1,
        5
      );

    const updated =
      entitySystem.update(
        "custom_dish",
        dish.id,
        {
          marketPerformance,

          outputQuality:
            outputQuality(
              averageOutputQuality
            ),

          masteryName:
            DISH_MASTERY_NAMES[
              masteryLevel
            ],

          dishTierId:
            nextTier.id,

          dishTierOrder:
            nextTier.order
        }
      );

    if (
      nextTier.order >
      previousTier.order
    ) {
      eventBus.emit(
        "dish:tierPromoted",
        {
          dishId:
            dish.id,

          restaurantId:
            dish.ownerRestaurantId,

          oldTier:
            previousTier.id,

          newTier:
            nextTier.id,

          day:
            currentDay()
        }
      );
    }

    return updated;
  }

  getStatus(dishId) {
    const dish =
      this.ensureProfile(dishId);

    const tier =
      this.calculateTier(dish);

    const mastery =
      this.getMastery(dishId);

    const nextTier =
      DISH_TIERS.find(
        item =>
          item.order ===
          tier.order + 1
      ) ?? null;

    const market =
      dish.marketPerformance;

    const requirements =
      nextTier
        ? [
            {
              id: "quality",
              name: "研发品质",
              current:
                dish.qualityScore ?? 0,
              required:
                nextTier.minQuality,
              met:
                (dish.qualityScore ?? 0) >=
                nextTier.minQuality
            },
            {
              id: "mastery",
              name: "熟练度",
              current:
                dish.masteryLevel ?? 1,
              required:
                nextTier.minMastery,
              met:
                (dish.masteryLevel ?? 1) >=
                nextTier.minMastery
            },
            {
              id: "sales",
              name: "累计销量",
              current:
                market.sold,
              required:
                nextTier.minSold,
              met:
                market.sold >=
                nextTier.minSold
            },
            {
              id: "reputation",
              name: "菜品口碑",
              current:
                market.reputationScore,
              required:
                nextTier.minReputation,
              met:
                market.reputationScore >=
                nextTier.minReputation
            }
          ]
        : [];

    return {
      dishId:
        dish.id,

      name:
        dish.name,

      tier,

      nextTier,

      mastery,

      outputQuality:
        dish.outputQuality,

      researchQuality: {
        score:
          dish.qualityScore ?? 0,

        grade:
          dish.qualityGrade ?? null
      },

      market:
        structuredClone(
          market
        ),

      economics: {
        basePrice:
          dish.basePrice ?? 0,

        averageSalePrice:
          market.averageSalePrice,

        ingredientCost:
          market.ingredientCost,

        grossProfit:
          market.grossProfit,

        grossMargin:
          market.grossMargin
      },

      requirements
    };
  }

  listRestaurantDishes(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "custom_dish",
        item =>
          item.ownerRestaurantId ===
          restaurantId
      )
      .map(
        dish =>
          this.getStatus(
            dish.id
          )
      )
      .sort(
        (a, b) =>
          b.tier.order -
            a.tier.order ||
          b.market.reputationScore -
            a.market.reputationScore ||
          b.market.sold -
            a.market.sold
      );
  }

  getPortfolioSummary(
    restaurantId
  ) {
    const dishes =
      this.listRestaurantDishes(
        restaurantId
      );

    return {
      total:
        dishes.length,

      byTier:
        Object.fromEntries(
          DISH_TIERS.map(
            tier => [
              tier.id,
              dishes.filter(
                dish =>
                  dish.tier.id ===
                  tier.id
              ).length
            ]
          )
        ),

      totalSold:
        dishes.reduce(
          (sum, dish) =>
            sum +
            dish.market.sold,
          0
        ),

      totalRevenue:
        dishes.reduce(
          (sum, dish) =>
            sum +
            dish.market.revenue,
          0
        ),

      totalGrossProfit:
        dishes.reduce(
          (sum, dish) =>
            sum +
            dish.market.grossProfit,
          0
        ),

      signatureCount:
        dishes.filter(
          dish =>
            dish.tier.order >= 3
        ).length,

      topDish:
        dishes[0] ?? null
    };
  }

  developRandom({
    restaurantId,
    name = null
  }) {
    const result =
      dishResearchSystem
        .researchRandom({
          restaurantId,
          name
        });

    const dish =
      this.ensureProfile(
        result.dish.id
      );

    return {
      ...result,
      dish,
      lifecycle:
        this.getStatus(
          dish.id
        )
    };
  }
}

export const dishLifecycleSystem =
  new DishLifecycleSystem();

export {
  DishLifecycleSystem
};
