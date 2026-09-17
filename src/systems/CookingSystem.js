import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import { recipeSystem } from "./RecipeSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";
import { inventorySystem } from "./InventorySystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function requireRestaurant(id) {
  const restaurant =
    entitySystem.get("restaurant", id);

  if (!restaurant) {
    throw new Error(
      `Restaurant "${id}" does not exist`
    );
  }

  return restaurant;
}

function getUnitCost(batchId, ingredientId) {
  const batch =
    entitySystem.get(
      "inventory_batch",
      batchId
    );

  if (
    Number.isFinite(
      batch?.unitCost
    )
  ) {
    return batch.unitCost;
  }

  if (
    batch?.sourceType === "procurement" &&
    batch.sourceId
  ) {
    const order =
      entitySystem.get(
        "procurement_order",
        batch.sourceId
      );

    if (
      order &&
      Number.isFinite(order.unitPrice)
    ) {
      return order.unitPrice;
    }
  }

  const ingredient =
    ingredientCatalogSystem.get(
      ingredientId
    );

  return ingredient.basePurchasePrice;
}

class CookingSystem {
  cook({
    restaurantId,
    recipeId,
    portions = 1,
    chefSkill = 50
  }) {
    requireRestaurant(restaurantId);

    if (
      !Number.isInteger(portions) ||
      portions <= 0
    ) {
      throw new RangeError(
        "Portions must be a positive integer"
      );
    }

    if (
      !Number.isFinite(chefSkill) ||
      chefSkill < 0 ||
      chefSkill > 100
    ) {
      throw new RangeError(
        "Chef skill must be between 0 and 100"
      );
    }

    const recipe =
      recipeSystem.get(recipeId);

    if (!recipe) {
      throw new Error(
        `Recipe "${recipeId}" does not exist`
      );
    }

    const dish =
      dishCatalogSystem.get(
        recipe.dishId
      );

    if (!dish) {
      throw new Error(
        `Dish "${recipe.dishId}" does not exist`
      );
    }

    const requirements =
      recipe.ingredients.map(
        (item) => ({
          ...item,
          requiredQuantity:
            item.quantity * portions
        })
      );

    for (const item of requirements) {
      const available =
        inventorySystem
          .getAvailableQuantity(
            restaurantId,
            item.ingredientId
          );

      if (
        available <
        item.requiredQuantity
      ) {
        throw new Error(
          `Insufficient inventory for "${item.ingredientId}": available ${available}, required ${item.requiredQuantity}`
        );
      }
    }

    const consumed = [];

    let totalCost = 0;
    let qualityWeight = 0;
    let freshnessWeight = 0;
    let totalQuantity = 0;

    for (const item of requirements) {
      const result =
        inventorySystem.consume(
          restaurantId,
          item.ingredientId,
          item.requiredQuantity
        );

      for (const part of result.consumed) {
        const unitCost =
          getUnitCost(
            part.batchId,
            item.ingredientId
          );

        const cost =
          unitCost *
          part.quantity;

        totalCost += cost;

        qualityWeight +=
          part.quality *
          part.quantity;

        freshnessWeight +=
          part.freshness *
          part.quantity;

        totalQuantity +=
          part.quantity;

        consumed.push({
          ingredientId:
            item.ingredientId,
          batchId:
            part.batchId,
          quantity:
            part.quantity,
          quality:
            part.quality,
          freshness:
            part.freshness,
          unitCost,
          cost
        });
      }
    }

    const averageQuality =
      totalQuantity > 0
        ? qualityWeight /
          totalQuantity
        : 1;

    const averageFreshness =
      totalQuantity > 0
        ? freshnessWeight /
          totalQuantity
        : 0;

    const ingredientQualityScore =
      clamp(
        averageQuality / 5 * 100,
        0,
        100
      );

    const skillMatch =
      clamp(
        50 +
          chefSkill -
          recipe.difficulty,
        0,
        100
      );

    const qualityScore =
      Math.round(
        ingredientQualityScore * 0.4 +
        averageFreshness * 0.25 +
        chefSkill * 0.2 +
        skillMatch * 0.15
      );

    let qualityGrade = "C";

    if (qualityScore >= 90) {
      qualityGrade = "S";
    } else if (qualityScore >= 75) {
      qualityGrade = "A";
    } else if (qualityScore >= 60) {
      qualityGrade = "B";
    }

    const time =
      gameState.getSection("time");

    const cookingRecord =
      entitySystem.create(
        "cooking_record",
        {
          restaurantId,
          dishId:
            dish.id,
          recipeId,
          portions,

          ingredientCost:
            Math.round(totalCost),

          averageIngredientQuality:
            Number(
              averageQuality.toFixed(2)
            ),

          averageFreshness:
            Math.round(
              averageFreshness
            ),

          chefSkill,
          difficulty:
            recipe.difficulty,

          qualityScore,
          qualityGrade,

          consumed,

          cookedAt:
            time.totalMinutes,

          day:
            time.day,

          cookingMinutes:
            recipe.cookingMinutes
        }
      );

    eventBus.emit(
      "cooking:completed",
      {
        record:
          structuredClone(
            cookingRecord
          )
      }
    );

    return cookingRecord;
  }

  get(recordId) {
    const record =
      entitySystem.get(
        "cooking_record",
        recordId
      );

    if (!record) {
      throw new Error(
        `Cooking record "${recordId}" does not exist`
      );
    }

    return record;
  }

  listByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .list("cooking_record")
      .filter(
        (record) =>
          record.restaurantId ===
          restaurantId
      );
  }
}

export const cookingSystem =
  new CookingSystem();

export { CookingSystem };
