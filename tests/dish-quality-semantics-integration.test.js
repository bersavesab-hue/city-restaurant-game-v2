import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  dishResearchSystem
} from "../src/systems/DishResearchSystem.js";

import {
  restaurantDishSystem
} from "../src/systems/RestaurantDishSystem.js";

import {
  dishLifecycleSystem
} from "../src/systems/DishLifecycleSystem.js";

test(
  "研发评分只决定初始配方品质而单次出品独立累计",
  () => {
    gameState.reset();

    ingredientCatalogSystem.load(
      [
        {
          id: "semantic_rice",
          name: "语义测试米",
          category: "grain",
          unit: "portion",
          storageType: "dry",
          basePurchasePrice: 5,
          shelfLifeDays: 30,
          edibleRate: 1,
          baseWasteRate: 0
        },
        {
          id: "semantic_meat",
          name: "语义测试肉",
          category: "meat",
          unit: "portion",
          storageType: "chilled",
          basePurchasePrice: 12,
          shelfLifeDays: 5,
          edibleRate: 0.9,
          baseWasteRate: 0.1
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      restaurantSystem.create({
        name: "菜品语义测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const result =
      dishResearchSystem.research({
        restaurantId:
          restaurant.id,
        name:
          "语义测试菜",
        category:
          "rice",
        method:
          "stir_fry",
        ingredients: [
          {
            ingredientId:
              "semantic_rice",
            quantity: 1
          },
          {
            ingredientId:
              "semantic_meat",
            quantity: 1
          }
        ]
      });

    let progress =
      restaurantDishSystem.get(
        restaurant.id,
        result.dish.id
      );

    assert.ok(
      Number.isInteger(
        result.analysis
          .researchScore
      )
    );

    assert.equal(
      result.dish
        .researchScore,
      result.analysis
        .researchScore
    );

    assert.equal(
      progress
        .recipeQualityScore,
      result.analysis
        .researchScore
    );

    assert.equal(
      progress.outputQuality,
      null
    );

    assert.equal(
      Object.prototype
        .hasOwnProperty.call(
          progress,
          "qualityScore"
        ),
      false
    );

    const beforeRecipeQuality =
      progress.recipeQualityScore;

    dishLifecycleSystem
      .recordService({
        restaurantId:
          restaurant.id,
        dishId:
          result.dish.id,
        quantity: 10,
        revenue: 1000,
        ingredientCost: 300,
        outputQualityScore: 95
      });

    progress =
      restaurantDishSystem.get(
        restaurant.id,
        result.dish.id
      );

    assert.equal(
      progress.recipeQualityScore,
      beforeRecipeQuality
    );

    assert.equal(
      progress
        .marketPerformance
        .averageOutputQuality,
      95
    );

    assert.equal(
      progress.outputQuality.grade,
      "S"
    );

    assert.equal(
      progress.dishRankName,
      "家常"
    );

    for (
      const forbidden
      of [
        "rarity",
        "qualityLevel"
      ]
    ) {
      assert.equal(
        Object.prototype
          .hasOwnProperty.call(
            result.dish,
            forbidden
          ),
        false
      );
    }
  }
);
