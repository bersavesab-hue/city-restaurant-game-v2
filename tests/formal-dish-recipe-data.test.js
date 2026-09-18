import test from "node:test";
import assert from "node:assert/strict";

import {
  INGREDIENTS_V1
} from "../src/data/ingredients.v1.js";

import {
  DISH_DATASET_META,
  DISHES_V1
} from "../src/data/dishes.v1.js";

import {
  RECIPE_DATASET_META,
  RECIPES_V1
} from "../src/data/recipes.v1.js";

import {
  COOKING_METHODS_V1
} from "../src/data/cookingMethods.v1.js";

import {
  validateDish
} from "../src/systems/DishCatalogSystem.js";

import {
  validateRecipe
} from "../src/systems/RecipeSystem.js";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  dishCatalogSystem,
  recipeSystem,
  dishRecipeBootstrapSystem
} = app.systems;

test(
  "正式菜品包固定350道且16分类数量准确",
  () => {
    assert.equal(
      DISH_DATASET_META.total,
      350
    );

    assert.equal(
      DISHES_V1.length,
      350
    );

    assert.equal(
      new Set(
        DISHES_V1.map(
          item => item.id
        )
      ).size,
      350
    );

    assert.equal(
      new Set(
        DISHES_V1.map(
          item => item.name
        )
      ).size,
      350
    );

    const counts =
      Object.fromEntries(
        Object.keys(
          DISH_DATASET_META
            .categories
        ).map(
          category => [
            category,
            DISHES_V1.filter(
              dish =>
                dish.category ===
                category
            ).length
          ]
        )
      );

    assert.deepEqual(
      counts,
      DISH_DATASET_META
        .categories
    );

    for (
      const dish
      of DISHES_V1
    ) {
      assert.equal(
        validateDish(
          dish
        ),
        true,
        dish.id
      );
    }
  }
);

test(
  "453条正式配方完整覆盖350道菜220种食材和22种烹饪方式",
  () => {
    assert.equal(
      RECIPE_DATASET_META.total,
      453
    );

    assert.equal(
      RECIPE_DATASET_META
        .standardRecipeCount,
      350
    );

    assert.equal(
      RECIPE_DATASET_META
        .alternateRecipeCount,
      103
    );

    assert.equal(
      RECIPES_V1.length,
      453
    );

    const recipeIds =
      new Set(
        RECIPES_V1.map(
          item => item.id
        )
      );

    assert.equal(
      recipeIds.size,
      453
    );

    const recipesById =
      new Map(
        RECIPES_V1.map(
          item => [
            item.id,
            item
          ]
        )
      );

    for (
      const dish
      of DISHES_V1
    ) {
      const standard =
        recipesById.get(
          dish.defaultRecipeId
        );

      assert.ok(
        standard,
        dish.id
      );

      assert.equal(
        standard.dishId,
        dish.id
      );

      assert.equal(
        standard.variantId,
        "standard"
      );
    }

    const ingredientIds =
      new Set(
        INGREDIENTS_V1.map(
          item => item.id
        )
      );

    const usedIngredients =
      new Set();

    const methodIds =
      new Set(
        COOKING_METHODS_V1.map(
          item => item.id
        )
      );

    const usedMethods =
      new Set();

    for (
      const recipe
      of RECIPES_V1
    ) {
      assert.ok(
        DISHES_V1.some(
          dish =>
            dish.id ===
            recipe.dishId
        ),
        recipe.id
      );

      assert.ok(
        methodIds.has(
          recipe.method
        ),
        recipe.id
      );

      usedMethods.add(
        recipe.method
      );

      for (
        const ingredient
        of recipe.ingredients
      ) {
        assert.ok(
          ingredientIds.has(
            ingredient.ingredientId
          ),
          `${recipe.id} -> ${ingredient.ingredientId}`
        );

        usedIngredients.add(
          ingredient.ingredientId
        );
      }
    }

    assert.equal(
      ingredientIds.size,
      220
    );

    assert.equal(
      usedIngredients.size,
      220
    );

    assert.equal(
      methodIds.size,
      22
    );

    assert.equal(
      usedMethods.size,
      22
    );
  }
);

test(
  "正式菜品配方可以按220食材顺序完整Bootstrap并通过运行时校验",
  () => {
    ingredientCatalogSystem.load(
      INGREDIENTS_V1,
      {
        overwrite:
          true
      }
    );

    dishCatalogSystem.load(
      DISHES_V1,
      {
        overwrite:
          true
      }
    );

    for (
      const recipe
      of RECIPES_V1
    ) {
      assert.equal(
        validateRecipe(
          recipe
        ),
        true,
        recipe.id
      );
    }

    recipeSystem.load(
      RECIPES_V1,
      {
        overwrite:
          true
      }
    );

    const result =
      dishRecipeBootstrapSystem
        .ensureLoaded({
          overwrite:
            false
        });

    assert.deepEqual(
      result,
      {
        dishes: 350,
        recipes: 453
      }
    );

    assert.equal(
      dishCatalogSystem.getAll()
        .filter(
          dish =>
            !dish.custom
        )
        .length,
      350
    );

    assert.equal(
      recipeSystem.getAll()
        .filter(
          recipe =>
            !recipe
              .ownerRestaurantId
        )
        .length,
      453
    );
  }
);
