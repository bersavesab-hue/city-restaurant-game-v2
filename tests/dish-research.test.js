import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem,
  dishCatalogSystem,
  recipeSystem,
  dishResearchSystem,
  restaurantDishSystem
} = app.systems;

test(
  "自主研发菜品会生成真实菜品和菜谱",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "research_rice",
          name: "研发米",
          category: "grain",
          unit: "portion",
          storageType: "dry",
          basePurchasePrice: 5,
          shelfLifeDays: 30,
          edibleRate: 1,
          baseWasteRate: 0
        },
        {
          id: "research_meat",
          name: "研发肉",
          category: "meat",
          unit: "portion",
          storageType: "chilled",
          basePurchasePrice: 12,
          shelfLifeDays: 5,
          edibleRate: 0.9,
          baseWasteRate: 0.1
        },
        {
          id: "research_veg",
          name: "研发菜",
          category: "vegetable",
          unit: "portion",
          storageType: "chilled",
          basePurchasePrice: 4,
          shelfLifeDays: 5,
          edibleRate: 0.95,
          baseWasteRate: 0.05
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "自主研发测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const result =
      dishResearchSystem
        .research({
          restaurantId:
            restaurant.id,

          name:
            "招牌研发饭",

          category:
            "rice",

          method:
            "stir_fry",

          ingredients: [
            {
              ingredientId:
                "research_rice",
              quantity: 1
            },
            {
              ingredientId:
                "research_meat",
              quantity: 1
            },
            {
              ingredientId:
                "research_veg",
              quantity: 1
            }
          ]
        });

    assert.ok(
      result.dish.id
    );

    assert.ok(
      result.recipe.id
    );

    assert.equal(
      dishCatalogSystem
        .get(
          result.dish.id
        )
        .name,
      "招牌研发饭"
    );

    assert.equal(
      recipeSystem
        .get(
          result.recipe.id
        )
        .dishId,
      result.dish.id
    );

    const progress =
      restaurantDishSystem.get(
        restaurant.id,
        result.dish.id
      );

    assert.ok(
      progress
    );

    assert.equal(
      progress.masteryLevel,
      1
    );

    assert.equal(
      progress.dishRankName,
      "家常"
    );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        result.dish,
        "masteryLevel"
      ),
      false
    );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        result.dish,
        "dishRankName"
      ),
      false
    );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        result.dish,
        "qualityLevel"
      ),
      false
    );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        result.dish,
        "rarity"
      ),
      false
    );

    assert.ok(
      financeSystem
        .getBalance(
          restaurant.id
        ) <
      before
    );

    const randomResult =
      dishResearchSystem
        .researchRandom({
          restaurantId:
            restaurant.id
        });

    assert.ok(
      randomResult.dish
        .custom
    );

    const summary =
      dishResearchSystem
        .getResearchSummary(
          restaurant.id
        );

    assert.equal(
      summary.total,
      2
    );
  }
);
