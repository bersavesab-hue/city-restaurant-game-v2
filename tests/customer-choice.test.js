import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  ingredientCatalogSystem,
  dishCatalogSystem,
  recipeSystem,
  menuSystem,
  customerChoiceSystem
} = app.systems;

test(
  "高价菜对学生吸引力下降更明显",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "客群点菜测试店"
      });

    ingredientCatalogSystem.load(
      [
        {
          id: "choice_rice_raw",
          name: "测试大米",
          category: "grain",
          unit: "g",
          baseQuality: 2,
          storageType: "dry",
          basePurchasePrice: 5,
          shelfLifeDays: 180,
          edibleRate: 1,
          baseWasteRate: 0.02
        }
      ],
      {
        overwrite: true
      }
    );

    dishCatalogSystem.load(
      [
        {
          id: "choice_rice",
          name: "测试盖饭",
          category: "rice",
          basePrice: 1000
        }
      ],
      {
        overwrite: true
      }
    );

    recipeSystem.load(
      [
        {
          id: "choice_recipe",
          dishId: "choice_rice",
          difficulty: 10,
          cookingMinutes: 5,
          ingredients: [
            {
              ingredientId:
                "choice_rice_raw",
              quantity: 100
            }
          ]
        }
      ],
      {
        overwrite: true
      }
    );

    const item =
      menuSystem.addItem({
        restaurantId:
          restaurant.id,
        dishId: "choice_rice",
        recipeId:
          "choice_recipe",
        price: 1800
      });

    const student =
      customerChoiceSystem
        .scoreMenuItem(
          "student",
          item
        );

    const tourist =
      customerChoiceSystem
        .scoreMenuItem(
          "tourist",
          item
        );

    assert.ok(
      tourist > student
    );
  }
);
