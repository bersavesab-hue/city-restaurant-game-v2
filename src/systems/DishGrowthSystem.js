import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";

import {
  getDishMasteryLevel,
  getDishRank
} from "../data/dishRules.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

const IMPROVEMENTS =
  Object.freeze({
    quality: {
      id: "quality",
      name: "品质改良",
      requiredLevel: 2,
      baseCost: 1800
    },

    speed: {
      id: "speed",
      name: "流程优化",
      requiredLevel: 3,
      baseCost: 2200
    },

    cost: {
      id: "cost",
      name: "成本优化",
      requiredLevel: 3,
      baseCost: 2600
    }
  });

class DishGrowthSystem {
  getMasteryLevel(xp) {
    return getDishMasteryLevel(
      xp
    );
  }

  getRank(
    masteryLevel,
    qualityScore
  ) {
    return getDishRank({
      masteryLevel,
      qualityScore
    });
  }

  getMasteryQualityBonus(
    level
  ) {
    return [
      0,
      1,
      2,
      4,
      6
    ][
      clamp(
        level,
        1,
        5
      ) - 1
    ];
  }

  recordSale({
    menuItemId,
    quantity,
    revenue
  }) {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return null;
    }

    const menuItem =
      entitySystem.get(
        "menu_item",
        menuItemId
      );

    if (!menuItem) {
      return null;
    }

    const dish =
      entitySystem.get(
        "custom_dish",
        menuItem.dishId
      );

    if (!dish) {
      return null;
    }

    const oldLevel =
      dish.masteryLevel ??
      1;

    const masteryXp =
      (dish.masteryXp ?? 0) +
      quantity;

    const masteryLevel =
      this.getMasteryLevel(
        masteryXp
      );

    const rank =
      this.getRank(
        masteryLevel,
        dish.qualityScore ?? 50
      );

    const updated =
      entitySystem.update(
        "custom_dish",
        dish.id,
        {
          masteryXp,

          masteryLevel,

          masteryQualityBonus:
            this.getMasteryQualityBonus(
              masteryLevel
            ),

          dishRankId:
            rank.id,

          dishRankName:
            rank.name,

          dishRankOrder:
            rank.order,

          lifetimeSold:
            (dish.lifetimeSold ?? 0) +
            quantity,

          lifetimeRevenue:
            (dish.lifetimeRevenue ?? 0) +
            (revenue ?? 0),

          lastSoldDay:
            gameState.getSection(
              "time"
            ).day
        }
      );

    if (
      masteryLevel >
      oldLevel
    ) {
      eventBus.emit(
        "dish:masteryLeveled",
        {
          dishId:
            dish.id,

          restaurantId:
            dish
              .ownerRestaurantId,

          oldLevel,
          masteryLevel,

          dishRankId:
            rank.id,

          dishRankName:
            rank.name,

          dishRankOrder:
            rank.order
        }
      );
    }

    return updated;
  }

  getRestaurantAppealMultiplier(
    restaurantId
  ) {
    const dishes =
      entitySystem.filter(
        "custom_dish",
        item =>
          item.ownerRestaurantId ===
          restaurantId
      );

    let multiplier = 1;

    for (const dish of dishes) {
      const rankOrder =
        dish.dishRankOrder ??
        this.getRank(
          dish.masteryLevel ?? 1,
          dish.qualityScore ?? 50
        ).order;

      if (rankOrder >= 5) {
        multiplier =
          Math.max(
            multiplier,
            1.08
          );
      } else if (
        rankOrder >= 4
      ) {
        multiplier =
          Math.max(
            multiplier,
            1.04
          );
      } else if (
        rankOrder >= 3
      ) {
        multiplier =
          Math.max(
            multiplier,
            1.02
          );
      }
    }

    return multiplier;
  }

  improveRecipe({
    restaurantId,
    dishId,
    focus
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const definition =
      IMPROVEMENTS[
        focus
      ];

    if (!definition) {
      throw new Error(
        "Invalid improvement focus"
      );
    }

    const dish =
      entitySystem.get(
        "custom_dish",
        dishId
      );

    if (
      !dish ||
      dish.ownerRestaurantId !==
        restaurantId
    ) {
      throw new Error(
        "Custom dish does not belong to restaurant"
      );
    }

    const masteryLevel =
      dish.masteryLevel ??
      1;

    if (
      masteryLevel <
      definition.requiredLevel
    ) {
      throw new Error(
        `Dish mastery level ${definition.requiredLevel} required`
      );
    }

    const recipe =
      entitySystem.get(
        "custom_recipe",
        dish.recipeId
      );

    if (!recipe) {
      throw new Error(
        "Custom recipe does not exist"
      );
    }

    const attempts =
      dish.improvementAttempts ??
      0;

    const cost =
      Math.round(
        definition.baseCost +
        attempts * 250 +
        (
          dish.dishRankOrder ??
          this.getRank(
            masteryLevel,
            dish.qualityScore ?? 50
          ).order
        ) *
          300
      );

    if (
      financeSystem.getBalance(
        restaurantId
      ) < cost
    ) {
      throw new Error(
        "Insufficient funds for recipe improvement"
      );
    }

    financeSystem.expense(
      restaurantId,
      cost,
      FINANCE_CATEGORY.OTHER,
      `${definition.name}：${dish.name}`
    );

    const qualityScore =
      dish.qualityScore ??
      50;

    const successChance =
      clamp(
        0.72 +
        masteryLevel * 0.04 -
        qualityScore / 350 -
        attempts * 0.01,
        0.25,
        0.85
      );

    const success =
      randomSystem.chance(
        successChance
      );

    let nextQuality =
      qualityScore;

    const recipeChanges = {};

    if (success) {
      if (
        focus === "quality"
      ) {
        nextQuality =
          clamp(
            qualityScore +
            randomSystem.int(
              2,
              4
            ),
            1,
            100
          );
      }

      if (
        focus === "speed"
      ) {
        recipeChanges
          .cookingMinutes =
          Math.max(
            5,
            recipe.cookingMinutes -
            randomSystem.int(
              1,
              3
            )
          );
      }

      if (
        focus === "cost"
      ) {
        const current =
          Number.isFinite(
            recipe
              .ingredientEfficiency
          )
            ? recipe
                .ingredientEfficiency
            : 1;

        recipeChanges
          .ingredientEfficiency =
          Number(
            Math.max(
              0.85,
              current - 0.03
            ).toFixed(2)
          );
      }
    } else {
      nextQuality =
        clamp(
          qualityScore -
          randomSystem.int(
            1,
            2
          ),
          1,
          100
        );
    }

    const rank =
      this.getRank(
        masteryLevel,
        nextQuality
      );

    const time =
      gameState.getSection(
        "time"
      );

    const history = [
      ...(
        dish
          .improvementHistory ??
        []
      ),
      {
        day:
          time.day,

        focus,

        success,

        cost,

        qualityBefore:
          qualityScore,

        qualityAfter:
          nextQuality
      }
    ];

    if (
      history.length > 10
    ) {
      history.splice(
        0,
        history.length - 10
      );
    }

    const updatedDish =
      entitySystem.update(
        "custom_dish",
        dish.id,
        {
          qualityScore:
            nextQuality,

          dishRankId:
            rank.id,

          dishRankName:
            rank.name,

          dishRankOrder:
            rank.order,

          improvementAttempts:
            attempts + 1,

          successfulImprovements:
            (
              dish
                .successfulImprovements ??
              0
            ) +
            (
              success
                ? 1
                : 0
            ),

          improvementHistory:
            history
        }
      );

    const updatedRecipe =
      entitySystem.update(
        "custom_recipe",
        recipe.id,
        {
          ...recipeChanges,

          improvementAttempts:
            (
              recipe
                .improvementAttempts ??
              0
            ) + 1
        }
      );

    eventBus.emit(
      "dish:recipeImproved",
      {
        restaurantId,
        dishId,

        focus,
        success,
        cost,

        qualityScore:
          nextQuality
      }
    );

    return {
      success,

      successChance:
        Number(
          successChance
            .toFixed(3)
        ),

      cost,

      dish:
        updatedDish,

      recipe:
        updatedRecipe
    };
  }

  getStatus(
    dishId
  ) {
    const dish =
      entitySystem.get(
        "custom_dish",
        dishId
      );

    if (!dish) {
      return null;
    }

    return {
      dishId:
        dish.id,

      name:
        dish.name,

      masteryXp:
        dish.masteryXp ??
        0,

      masteryLevel:
        dish.masteryLevel ??
        1,

      dishRankId:
        (
          dish.dishRankId ??
          this.getRank(
            dish.masteryLevel ?? 1,
            dish.qualityScore ?? 50
          ).id
        ),

      dishRankName:
        (
          dish.dishRankName ??
          this.getRank(
            dish.masteryLevel ?? 1,
            dish.qualityScore ?? 50
          ).name
        ),

      dishRankOrder:
        (
          dish.dishRankOrder ??
          this.getRank(
            dish.masteryLevel ?? 1,
            dish.qualityScore ?? 50
          ).order
        ),

      masteryQualityBonus:
        dish
          .masteryQualityBonus ??
        0,

      qualityScore:
        dish.qualityScore,

      lifetimeSold:
        dish.lifetimeSold ??
        0,

      lifetimeRevenue:
        dish.lifetimeRevenue ??
        0,

      improvementAttempts:
        dish
          .improvementAttempts ??
        0,

      improvementHistory:
        dish
          .improvementHistory ??
        []
    };
  }

  getAvailableImprovements() {
    return Object.values(
      IMPROVEMENTS
    );
  }
}

export const dishGrowthSystem =
  new DishGrowthSystem();

export {
  DishGrowthSystem,
  IMPROVEMENTS as DISH_IMPROVEMENTS
};
