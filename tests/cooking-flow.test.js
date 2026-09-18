import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { inventorySystem } from "../src/systems/InventorySystem.js";
import { dishCatalogSystem } from "../src/systems/DishCatalogSystem.js";
import { recipeSystem } from "../src/systems/RecipeSystem.js";
import { cookingSystem } from "../src/systems/CookingSystem.js";

import {
  DISH_SCHEMA_VERSION
} from "../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../src/data/recipeRules.js";

test(
  "菜品完整链路：配方 -> 扣原料 -> 成本 -> 单次出品质量 -> 出品记录",
  () => {
    gameState.reset();

    ingredientCatalogSystem.load(
      [
        {
          id: "ingredient_rice",
          name: "米饭",
          category: "grain",
          unit: "kg",
          storageType: "dry",
          basePurchasePrice: 500,
          shelfLifeDays: 30,
          edibleRate: 1,
          baseWasteRate: 0
        },
        {
          id: "ingredient_pork",
          name: "猪肉",
          category: "meat",
          unit: "kg",
          storageType: "chilled",
          basePurchasePrice: 2000,
          shelfLifeDays: 3,
          edibleRate: 0.9,
          baseWasteRate: 0.05
        }
      ],
      { overwrite: true }
    );

    dishCatalogSystem.load(
      [
        {
          schemaVersion:
            DISH_SCHEMA_VERSION,
          id: "dish_pork_rice",
          name: "猪肉盖饭",
          category: "rice",
          basePrice: 2800,
          unlockLevel: 1,
          baseDifficulty: 35,
          defaultRecipeId:
            "recipe_pork_rice",
          tags: ["test"]
        }
      ],
      { overwrite: true }
    );

    recipeSystem.load(
      [
        {
          schemaVersion:
            RECIPE_SCHEMA_VERSION,
          id: "recipe_pork_rice",
          dishId:
            "dish_pork_rice",
          variantId:
            "standard",
          name:
            "标准做法",
          method:
            "boil",
          difficulty: 35,
          cookingMinutes: 12,
          ingredients: [
            {
              ingredientId:
                "ingredient_rice",
              quantity: 0.2
            },
            {
              ingredientId:
                "ingredient_pork",
              quantity: 0.15
            }
          ]
        }
      ],
      { overwrite: true }
    );

    const restaurant =
      restaurantSystem.create({
        name: "测试餐厅"
      });

    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,
      ingredientId:
        "ingredient_rice",
      quantity: 10,
      quality: 3
    });

    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,
      ingredientId:
        "ingredient_pork",
      quantity: 10,
      quality: 4
    });

    const riceBefore =
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "ingredient_rice"
        );

    const porkBefore =
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "ingredient_pork"
        );

    const result =
      cookingSystem.cook({
        restaurantId:
          restaurant.id,
        recipeId:
          "recipe_pork_rice",
        portions: 2,
        chefSkill: 70
      });

    assert.equal(
      result.dishId,
      "dish_pork_rice"
    );

    assert.equal(
      result.portions,
      2
    );

    assert.ok(
      result.ingredientCost > 0
    );

    assert.ok(
      result.outputQualityScore >= 0 &&
      result.outputQualityScore <= 100
    );

    assert.ok(
      ["C", "B", "A", "S"]
        .includes(
          result.outputGrade
        )
    );

    assert.equal(
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "ingredient_rice"
        ),
      riceBefore - 0.4
    );

    assert.equal(
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "ingredient_pork"
        ),
      porkBefore - 0.3
    );

    assert.equal(
      cookingSystem
        .listByRestaurant(
          restaurant.id
        ).length,
      1
    );
  }
);
