import test from "node:test";
import assert from "node:assert/strict";

import {
  COOKING_METHOD_DATASET_META,
  COOKING_METHODS_V1,
  COOKING_METHOD_MAP,
  cookingMethodRequiresExhaust,
  validateCookingMethod
} from "../src/data/cookingMethods.v1.js";

import {
  RECIPE_SCHEMA_VERSION,
  RECIPE_INGREDIENT_LIMITS,
  getRecipeId
} from "../src/data/recipeRules.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  validateRecipe
} from "../src/systems/RecipeSystem.js";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  dishCatalogSystem,
  recipeSystem
} = app.systems;

test(
  "正式烹饪方式包固定22种且ID唯一",
  () => {
    assert.equal(
      COOKING_METHOD_DATASET_META.total,
      22
    );

    assert.equal(
      COOKING_METHODS_V1.length,
      22
    );

    assert.equal(
      new Set(
        COOKING_METHODS_V1.map(
          item => item.id
        )
      ).size,
      22
    );

    for (
      const method
      of COOKING_METHODS_V1
    ) {
      assert.equal(
        validateCookingMethod(
          method
        ),
        true,
        method.id
      );

      assert.equal(
        COOKING_METHOD_MAP[
          method.id
        ].id,
        method.id
      );
    }

    assert.equal(
      cookingMethodRequiresExhaust(
        "stir_fry"
      ),
      true
    );

    assert.equal(
      cookingMethodRequiresExhaust(
        "cold_mix"
      ),
      false
    );

    assert.equal(
      cookingMethodRequiresExhaust(
        "sous_vide"
      ),
      false
    );
  }
);

test(
  "正式配方Schema锁定菜品变体方法食材难度和时间",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id:
            "recipe_schema_rice",

          name:
            "配方测试米",

          category:
            "grain",

          unit:
            "portion",

          storageType:
            "dry",

          basePurchasePrice:
            2,

          shelfLifeDays:
            30,

          edibleRate:
            1,

          baseWasteRate:
            0
        },
        {
          id:
            "recipe_schema_egg",

          name:
            "配方测试蛋",

          category:
            "egg",

          unit:
            "piece",

          storageType:
            "chilled",

          basePurchasePrice:
            1,

          shelfLifeDays:
            12,

          edibleRate:
            1,

          baseWasteRate:
            0
        }
      ],
      {
        overwrite:
          true
      }
    );

    const dishId =
      "recipe_schema_fried_rice";

    dishCatalogSystem.load(
      [
        {
          schemaVersion:
            DISH_SCHEMA_VERSION,

          id:
            dishId,

          name:
            "配方测试炒饭",

          category:
            "rice",

          basePrice:
            28,

          unlockLevel:
            1,

          baseDifficulty:
            35,

          defaultRecipeId:
            getDefaultRecipeId(
              dishId
            )
        }
      ],
      {
        overwrite:
          true
      }
    );

    const recipe = {
      schemaVersion:
        RECIPE_SCHEMA_VERSION,

      id:
        getRecipeId(
          dishId,
          "standard"
        ),

      dishId,

      variantId:
        "standard",

      name:
        "标准炒饭做法",

      method:
        "stir_fry",

      ingredients: [
        {
          ingredientId:
            "recipe_schema_rice",

          quantity:
            1
        },
        {
          ingredientId:
            "recipe_schema_egg",

          quantity:
            1
        }
      ],

      difficulty:
        35,

      cookingMinutes:
        12,

      tags: [
        "standard"
      ]
    };

    assert.equal(
      validateRecipe(
        recipe
      ),
      true
    );

    recipeSystem.load(
      [
        recipe
      ],
      {
        overwrite:
          true
      }
    );

    const requirements =
      recipeSystem
        .getOperationalRequirements(
          recipe.id
        );

    assert.equal(
      requirements
        .requiresExhaust,
      true
    );

    assert.deepEqual(
      requirements
        .equipmentCapabilities,
      [
        "range",
        "wok"
      ]
    );

    assert.equal(
      recipe.id,
      getDefaultRecipeId(
        dishId
      )
    );

    assert.equal(
      RECIPE_INGREDIENT_LIMITS.max,
      12
    );

    assert.throws(
      () =>
        validateRecipe({
          ...recipe,
          method:
            "unknown_method"
        }),
      /unknown cooking method/
    );

    assert.throws(
      () =>
        validateRecipe({
          ...recipe,
          id:
            "wrong_recipe_id"
        }),
      /does not match/
    );

    assert.throws(
      () =>
        validateRecipe({
          ...recipe,
          ingredients: [
            recipe.ingredients[0],
            recipe.ingredients[0]
          ]
        }),
      /duplicate ingredient/
    );
  }
);
