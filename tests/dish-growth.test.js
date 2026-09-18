import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem,
  dishResearchSystem,
  dishGrowthSystem,
  menuSystem
} = app.systems;

test(
  "研发菜销量会成长为招牌菜并支持配方改良",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "growth_rice",
          name: "成长米",
          category: "grain",
          unit: "portion",
          storageType: "dry",
          basePurchasePrice: 5,
          shelfLifeDays: 30,
          edibleRate: 1,
          baseWasteRate: 0
        },

        {
          id: "growth_meat",
          name: "成长肉",
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
        name:
          "成长测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const research =
      dishResearchSystem
        .research({
          restaurantId:
            restaurant.id,

          name:
            "成长招牌饭",

          category:
            "rice",

          method:
            "stir_fry",

          ingredients: [
            {
              ingredientId:
                "growth_rice",
              quantity: 1
            },
            {
              ingredientId:
                "growth_meat",
              quantity: 1
            }
          ]
        });

    const menu =
      menuSystem.addItem({
        restaurantId:
          restaurant.id,

        dishId:
          research.dish.id,

        recipeId:
          research.recipe.id,

        price:
          research.dish
            .basePrice
      });

    menuSystem.recordSale(
      menu.id,
      200,
      10000
    );

    const status =
      dishGrowthSystem
        .getStatus(
          research.dish.id
        );

    assert.ok(
      status.masteryLevel >= 4
    );

    assert.ok(
      status.lifetimeSold >= 200
    );

    assert.ok(
      [
        "优选",
        "招牌",
        "名菜",
        "镇店"
      ].includes(
        status.dishRankName
      )
    );

    assert.ok(
      dishGrowthSystem
        .getRestaurantAppealMultiplier(
          restaurant.id
        ) >= 1
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const result =
      dishGrowthSystem
        .improveRecipe({
          restaurantId:
            restaurant.id,

          dishId:
            research.dish.id,

          focus:
            "quality"
        });

    assert.equal(
      result.dish
        .improvementAttempts,
      1
    );

    assert.ok(
      financeSystem.getBalance(
        restaurant.id
      ) <
      before
    );

    assert.equal(
      typeof result.success,
      "boolean"
    );
  }
);
