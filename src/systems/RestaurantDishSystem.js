import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";

import {
  DISH_MASTERY_NAMES,
  getDishRank
} from "../data/dishRules.js";

const ENTITY_TYPE =
  "restaurant_dish";

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

function progressId(
  restaurantId,
  dishId
) {
  return (
    `restaurant_dish__${restaurantId}__${dishId}`
  );
}

function requireDish(
  dishId
) {
  const dish =
    dishCatalogSystem.get(
      dishId
    );

  if (!dish) {
    throw new Error(
      `Dish "${dishId}" does not exist`
    );
  }

  return dish;
}

class RestaurantDishSystem {
  getId(
    restaurantId,
    dishId
  ) {
    return progressId(
      restaurantId,
      dishId
    );
  }

  get(
    restaurantId,
    dishId
  ) {
    return (
      entitySystem.get(
        ENTITY_TYPE,
        progressId(
          restaurantId,
          dishId
        )
      ) ??
      null
    );
  }

  exists(
    restaurantId,
    dishId
  ) {
    return (
      this.get(
        restaurantId,
        dishId
      ) !== null
    );
  }

  ensureOwned({
    restaurantId,
    dishId,
    initialRecipeQualityScore = null
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const dish =
      requireDish(
        dishId
      );

    const existing =
      this.get(
        restaurantId,
        dishId
      );

    if (existing) {
      return existing;
    }

    if (
      dish.custom &&
      dish.ownerRestaurantId !==
        restaurantId
    ) {
      throw new Error(
        "Custom dish does not belong to restaurant"
      );
    }

    const recipeQualityScore =
      clamp(
        Number.isFinite(
          initialRecipeQualityScore
        )
          ? initialRecipeQualityScore
          : (
              Number.isFinite(
                dish.researchScore
              )
                ? dish.researchScore
                : 60
            ),
        1,
        100
      );

    const masteryLevel = 1;

    const rank =
      getDishRank({
        masteryLevel,
        recipeQualityScore
      });

    const time =
      gameState.getSection(
        "time"
      );

    return entitySystem.create(
      ENTITY_TYPE,
      {
        restaurantId,
        dishId,

        sourceType:
          dish.custom
            ? "custom"
            : "catalog",

        acquiredDay:
          time.day,

        masteryXp: 0,
        masteryLevel,
        masteryName:
          DISH_MASTERY_NAMES[
            masteryLevel
          ],

        masteryQualityBonus: 0,

        recipeQualityScore,

        dishRankId:
          rank.id,

        dishRankName:
          rank.name,

        dishRankOrder:
          rank.order,

        lifetimeSold: 0,
        lifetimeRevenue: 0,
        lastSoldDay: null,

        improvementAttempts: 0,
        successfulImprovements: 0,
        improvementHistory: [],

        marketPerformance: {
          sold: 0,
          revenue: 0,
          ingredientCost: 0,
          grossProfit: 0,
          grossMargin: 0,
          averageSalePrice: 0,
          averageOutputQuality:
            null,
          popularityScore: 20,
          reputationScore: 50,
          serviceCount: 0,
          lastSoldDay: null
        },

        outputQuality:
          null
      },
      {
        id:
          progressId(
            restaurantId,
            dishId
          )
      }
    );
  }

  update(
    restaurantId,
    dishId,
    changes
  ) {
    const current =
      this.get(
        restaurantId,
        dishId
      );

    if (!current) {
      throw new Error(
        "Restaurant dish progress does not exist"
      );
    }

    return entitySystem.update(
      ENTITY_TYPE,
      current.id,
      changes
    );
  }

  listByRestaurant(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return entitySystem.filter(
      ENTITY_TYPE,
      item =>
        item.restaurantId ===
        restaurantId
    );
  }

  getDish(
    restaurantId,
    dishId
  ) {
    const progress =
      this.get(
        restaurantId,
        dishId
      );

    if (!progress) {
      return null;
    }

    return requireDish(
      progress.dishId
    );
  }
}

export const restaurantDishSystem =
  new RestaurantDishSystem();

export {
  RestaurantDishSystem,
  ENTITY_TYPE as RESTAURANT_DISH_ENTITY_TYPE
};
