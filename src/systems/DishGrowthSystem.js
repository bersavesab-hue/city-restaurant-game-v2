import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { restaurantDishSystem } from "./RestaurantDishSystem.js";

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
    recipeQualityScore
  ) {
    return getDishRank({
      masteryLevel,
      recipeQualityScore
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

    const progress =
      restaurantDishSystem
        .ensureOwned({
          restaurantId:
            menuItem.restaurantId,
          dishId:
            menuItem.dishId
        });

    const oldLevel =
      progress.masteryLevel ??
      1;

    const masteryXp =
      (progress.masteryXp ?? 0) +
      quantity;

    const masteryLevel =
      this.getMasteryLevel(
        masteryXp
      );

    const rank =
      this.getRank(
        masteryLevel,
        progress.recipeQualityScore ?? 60
      );

    const updated =
      restaurantDishSystem
        .update(
          menuItem.restaurantId,
          menuItem.dishId,
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
              (
                progress
                  .lifetimeSold ??
                0
              ) +
              quantity,

            lifetimeRevenue:
              (
                progress
                  .lifetimeRevenue ??
                0
              ) +
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
            menuItem.dishId,

          restaurantId:
            menuItem.restaurantId,

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
      restaurantDishSystem
        .listByRestaurant(
          restaurantId
        );

    let multiplier = 1;

    for (const dish of dishes) {
      const rankOrder =
        dish.dishRankOrder ??
        this.getRank(
          dish.masteryLevel ?? 1,
          dish.recipeQualityScore ?? 60
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
      dishCatalogSystem.get(
        dishId
      );

    if (
      !dish ||
      !dish.custom ||
      dish.ownerRestaurantId !==
        restaurantId
    ) {
      throw new Error(
        "Recipe improvement currently requires an owned custom dish"
      );
    }

    const progress =
      restaurantDishSystem
        .ensureOwned({
          restaurantId,
          dishId
        });

    const masteryLevel =
      progress.masteryLevel ??
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
      progress.improvementAttempts ??
      0;

    const cost =
      Math.round(
        definition.baseCost +
        attempts * 250 +
        (
          progress.dishRankOrder ??
          this.getRank(
            masteryLevel,
            progress.recipeQualityScore ?? 60
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

    const recipeQualityScore =
      progress.recipeQualityScore ??
      60;

    const successChance =
      clamp(
        0.72 +
        masteryLevel * 0.04 -
        recipeQualityScore / 350 -
        attempts * 0.01,
        0.25,
        0.85
      );

    const success =
      randomSystem.chance(
        successChance
      );

    let nextQuality =
      recipeQualityScore;

    const recipeChanges = {};

    if (success) {
      if (
        focus === "quality"
      ) {
        nextQuality =
          clamp(
            recipeQualityScore +
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
          recipeQualityScore -
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
        progress
          .improvementHistory ??
        []
      ),
      {
        day:
          time.day,

        focus,

        success,

        cost,

        recipeQualityBefore:
          recipeQualityScore,

        recipeQualityAfter:
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
      restaurantDishSystem
        .update(
          restaurantId,
          dishId,
          {
            recipeQualityScore:
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
                progress
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

        recipeQualityScore:
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
    restaurantId,
    dishId
  ) {
    const progress =
      restaurantDishSystem.get(
        restaurantId,
        dishId
      );

    if (!progress) {
      return null;
    }

    const dish =
      dishCatalogSystem.get(
        dishId
      );

    if (!dish) {
      return null;
    }

    return {
      dishId,
      name:
        dish.name,

      masteryXp:
        progress.masteryXp ??
        0,

      masteryLevel:
        progress.masteryLevel ??
        1,

      dishRankId:
        progress.dishRankId,

      dishRankName:
        progress.dishRankName,

      dishRankOrder:
        progress.dishRankOrder,

      masteryQualityBonus:
        progress
          .masteryQualityBonus ??
        0,

      recipeQualityScore:
        progress.recipeQualityScore,

      lifetimeSold:
        progress.lifetimeSold ??
        0,

      lifetimeRevenue:
        progress.lifetimeRevenue ??
        0,

      improvementAttempts:
        progress
          .improvementAttempts ??
        0,

      improvementHistory:
        progress
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
