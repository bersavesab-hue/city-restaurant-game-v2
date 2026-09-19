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
          schemaVersion: 1,
          id: "choice_rice",
          name: "测试盖饭",
          category: "rice",
          basePrice: 1000,
          unlockLevel: 1,
          baseDifficulty: 10,
          defaultRecipeId: "recipe_choice_rice_standard"
        }
      ],
      {
        overwrite: true
      }
    );

    recipeSystem.load(
      [
        {
          schemaVersion: 1,
          id: "recipe_choice_rice_standard",
          variantId: "standard",
          name: "测试盖饭标准配方",
          dishId: "choice_rice",
          method: "stir_fry",
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
          "recipe_choice_rice_standard",
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
