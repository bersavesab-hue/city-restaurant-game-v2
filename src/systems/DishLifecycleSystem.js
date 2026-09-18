import { eventBus } from "../core/EventBus.js";
import { gameState } from "../core/GameState.js";

import { dishResearchSystem } from "./DishResearchSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { restaurantDishSystem } from "./RestaurantDishSystem.js";

import {
  DISH_RANK_LIST,
  DISH_MASTERY_NAMES,
  getDishRank,
  getCookOutputLevel
} from "../data/dishRules.js";

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function currentDay() {
  return (
    gameState.getSection(
      "time"
    )?.day ??
    1
  );
}

class DishLifecycleSystem {
  ensureProfile(
    restaurantId,
    dishId
  ) {
    const progress =
      restaurantDishSystem
        .ensureOwned({
          restaurantId,
          dishId
        });

    const rank =
      this.calculateRank(
        progress
      );

    const changes = {};

    if (
      progress.dishRankId !==
        rank.id ||
      progress.dishRankOrder !==
        rank.order ||
      progress.dishRankName !==
        rank.name
    ) {
      changes.dishRankId =
        rank.id;

      changes.dishRankName =
        rank.name;

      changes.dishRankOrder =
        rank.order;
    }

    const masteryLevel =
      clamp(
        progress.masteryLevel ?? 1,
        1,
        5
      );

    const masteryName =
      DISH_MASTERY_NAMES[
        masteryLevel
      ];

    if (
      progress.masteryName !==
      masteryName
    ) {
      changes.masteryName =
        masteryName;
    }

    if (
      !progress.outputQuality &&
      (
        progress
          .marketPerformance
          ?.serviceCount ??
        0
      ) > 0
    ) {
      changes.outputQuality =
        getCookOutputLevel(
          progress
            .marketPerformance
            ?.averageOutputQuality ??
          0
        );
    }

    if (
      Object.keys(
        changes
      ).length ===
      0
    ) {
      return progress;
    }

    return restaurantDishSystem
      .update(
        restaurantId,
        dishId,
        changes
      );
  }

  calculateRank(
    progress
  ) {
    return {
      ...getDishRank({
        masteryLevel:
          progress.masteryLevel ?? 1,
        recipeQualityScore:
          progress.recipeQualityScore ?? 60
      })
    };
  }

  getRank(
    restaurantId,
    dishId
  ) {
    return this.calculateRank(
      this.ensureProfile(
        restaurantId,
        dishId
      )
    );
  }

  getMastery(
    restaurantId,
    dishId
  ) {
    const progress =
      this.ensureProfile(
        restaurantId,
        dishId
      );

    const level =
      clamp(
        progress.masteryLevel ?? 1,
        1,
        5
      );

    return {
      level,
      name:
        DISH_MASTERY_NAMES[
          level
        ]
    };
  }

  recordService({
    restaurantId,
    dishId,
    quantity,
    revenue,
    ingredientCost = 0,
    outputQualityScore = null
  }) {
    if (
      !Number.isFinite(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new RangeError(
        "Dish service quantity must be positive"
      );
    }

    const progress =
      this.ensureProfile(
        restaurantId,
        dishId
      );

    const previousRank =
      this.calculateRank(
        progress
      );

    const old =
      progress.marketPerformance;

    const sold =
      old.sold +
      quantity;

    const nextRevenue =
      old.revenue +
      Math.max(
        0,
        revenue ?? 0
      );

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

    const outputScore =
      outputQualityScore ??
      progress
        .marketPerformance
        ?.averageOutputQuality ??
      progress.recipeQualityScore ??
      60;

    const oldPortions =
      Math.max(
        0,
        old.sold
      );

    const averageOutputQuality =
      Math.round(
        (
          (
            old.averageOutputQuality ??
            0
          ) *
            oldPortions +
          outputScore *
            quantity
        ) /
        Math.max(
          1,
          oldPortions +
            quantity
        )
      );

    const serviceCount =
      (
        old.serviceCount ??
        0
      ) +
      1;

    let reputationDelta = 0;

    if (outputScore >= 90) {
      reputationDelta = 5;
    } else if (
      outputScore >= 80
    ) {
      reputationDelta = 4;
    } else if (
      outputScore >= 70
    ) {
      reputationDelta = 2;
    } else if (
      outputScore >= 60
    ) {
      reputationDelta = 1;
    } else if (
      outputScore < 50
    ) {
      reputationDelta = -3;
    }

    if (
      grossMargin >=
      0.6
    ) {
      reputationDelta += 1;
    }

    const reputationScore =
      clamp(
        (
          old.reputationScore ??
          50
        ) +
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
          ) *
            20 +
          reputationScore *
            0.35
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

    const nextRank =
      this.calculateRank({
        ...progress,
        marketPerformance
      });

    const masteryLevel =
      clamp(
        progress.masteryLevel ??
          1,
        1,
        5
      );

    const updated =
      restaurantDishSystem
        .update(
          restaurantId,
          dishId,
          {
            marketPerformance,

            outputQuality:
              getCookOutputLevel(
                averageOutputQuality
              ),

            masteryName:
              DISH_MASTERY_NAMES[
                masteryLevel
              ],

            dishRankId:
              nextRank.id,

            dishRankName:
              nextRank.name,

            dishRankOrder:
              nextRank.order
          }
        );

    if (
      nextRank.order >
      previousRank.order
    ) {
      eventBus.emit(
        "dish:rankPromoted",
        {
          dishId,
          restaurantId,

          oldRank:
            previousRank.id,

          newRank:
            nextRank.id,

          day:
            currentDay()
        }
      );
    }

    return updated;
  }

  getStatus(
    restaurantId,
    dishId
  ) {
    const progress =
      this.ensureProfile(
        restaurantId,
        dishId
      );

    const dish =
      dishCatalogSystem.get(
        dishId
      );

    if (!dish) {
      return null;
    }

    const rank =
      this.calculateRank(
        progress
      );

    const mastery =
      this.getMastery(
        restaurantId,
        dishId
      );

    const nextRank =
      DISH_RANK_LIST.find(
        item =>
          item.order ===
          rank.order + 1
      ) ??
      null;

    const market =
      progress.marketPerformance;

    const requirements =
      nextRank
        ? [
            {
              id: "recipe_quality",
              name: "配方品质分",
              current:
                progress
                  .recipeQualityScore ??
                0,
              required:
                nextRank
                  .minRecipeQualityScore,
              met:
                (
                  progress
                    .recipeQualityScore ??
                  0
                ) >=
                nextRank
                  .minRecipeQualityScore
            },
            {
              id: "mastery",
              name: "熟练度",
              current:
                progress
                  .masteryLevel ??
                1,
              required:
                nextRank
                  .minMasteryLevel,
              met:
                (
                  progress
                    .masteryLevel ??
                  1
                ) >=
                nextRank
                  .minMasteryLevel
            }
          ]
        : [];

    return {
      dishId,
      name:
        dish.name,

      sourceType:
        progress.sourceType,

      acquiredDay:
        progress.acquiredDay,

      rank,
      nextRank,
      mastery,

      outputQuality:
        progress.outputQuality,

      recipeQualityScore:
        progress.recipeQualityScore,

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
    return restaurantDishSystem
      .listByRestaurant(
        restaurantId
      )
      .map(
        progress =>
          this.getStatus(
            restaurantId,
            progress.dishId
          )
      )
      .filter(
        Boolean
      )
      .sort(
        (a, b) =>
          b.rank.order -
            a.rank.order ||
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

      byRank:
        Object.fromEntries(
          DISH_RANK_LIST.map(
            rank => [
              rank.id,
              dishes.filter(
                dish =>
                  dish.rank.id ===
                  rank.id
              ).length
            ]
          )
        ),

      totalSold:
        dishes.reduce(
          (
            sum,
            dish
          ) =>
            sum +
            dish.market.sold,
          0
        ),

      totalRevenue:
        dishes.reduce(
          (
            sum,
            dish
          ) =>
            sum +
            dish.market.revenue,
          0
        ),

      totalGrossProfit:
        dishes.reduce(
          (
            sum,
            dish
          ) =>
            sum +
            dish
              .market
              .grossProfit,
          0
        ),

      signatureCount:
        dishes.filter(
          dish =>
            dish.rank.order >=
            3
        ).length,

      topDish:
        dishes[0] ??
        null
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

    const progress =
      this.ensureProfile(
        restaurantId,
        result.dish.id
      );

    return {
      ...result,
      progress,
      lifecycle:
        this.getStatus(
          restaurantId,
          result.dish.id
        )
    };
  }
}

export const dishLifecycleSystem =
  new DishLifecycleSystem();

export {
  DishLifecycleSystem
};
