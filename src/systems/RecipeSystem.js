import { dataRegistry } from "../core/DataRegistry.js";
import { entitySystem } from "../core/EntitySystem.js";

import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";

import {
  COOKING_METHOD_MAP
} from "../data/cookingMethods.v1.js";

import {
  RECIPE_SCHEMA_VERSION,
  RECIPE_VARIANT_ID_PATTERN,
  RECIPE_INGREDIENT_LIMITS,
  RECIPE_DIFFICULTY_RANGE,
  RECIPE_COOKING_MINUTES_RANGE,
  getRecipeId
} from "../data/recipeRules.js";

const COLLECTION = "recipes";
const CUSTOM_TYPE = "custom_recipe";

function validateRecipe(recipe) {
  if (
    !recipe ||
    typeof recipe !== "object"
  ) {
    throw new TypeError(
      "Recipe must be an object"
    );
  }

  if (
    recipe.schemaVersion !==
      RECIPE_SCHEMA_VERSION
  ) {
    throw new Error(
      "Recipe has invalid schemaVersion"
    );
  }

  if (
    typeof recipe.variantId !==
      "string" ||
    !RECIPE_VARIANT_ID_PATTERN.test(
      recipe.variantId
    )
  ) {
    throw new Error(
      "Recipe variantId must use stable snake_case lowercase format"
    );
  }

  if (
    typeof recipe.id !== "string" ||
    recipe.id !==
      getRecipeId(
        recipe.dishId,
        recipe.variantId
      )
  ) {
    throw new Error(
      "Recipe id does not match dishId and variantId"
    );
  }

  if (
    typeof recipe.name !== "string" ||
    !recipe.name.trim()
  ) {
    throw new Error(
      `Recipe "${recipe.id}" requires a name`
    );
  }

  if (
    !dishCatalogSystem.exists(
      recipe.dishId
    )
  ) {
    throw new Error(
      `Recipe "${recipe.id}" references unknown dish "${recipe.dishId}"`
    );
  }

  if (
    !COOKING_METHOD_MAP[
      recipe.method
    ]
  ) {
    throw new Error(
      `Recipe "${recipe.id}" references unknown cooking method "${recipe.method}"`
    );
  }

  if (
    !Array.isArray(
      recipe.ingredients
    ) ||
    recipe.ingredients.length <
      RECIPE_INGREDIENT_LIMITS.min ||
    recipe.ingredients.length >
      RECIPE_INGREDIENT_LIMITS.max
  ) {
    throw new Error(
      `Recipe "${recipe.id}" requires ${RECIPE_INGREDIENT_LIMITS.min}-${RECIPE_INGREDIENT_LIMITS.max} ingredients`
    );
  }

  const used =
    new Set();

  for (
    const item
    of recipe.ingredients
  ) {
    if (
      !item ||
      typeof item.ingredientId !==
        "string" ||
      !ingredientCatalogSystem
        .exists(
          item.ingredientId
        )
    ) {
      throw new Error(
        `Recipe "${recipe.id}" contains unknown ingredient`
      );
    }

    if (
      used.has(
        item.ingredientId
      )
    ) {
      throw new Error(
        `Recipe "${recipe.id}" contains duplicate ingredient "${item.ingredientId}"`
      );
    }

    used.add(
      item.ingredientId
    );

    if (
      !Number.isFinite(
        item.quantity
      ) ||
      item.quantity <= 0
    ) {
      throw new Error(
        `Recipe "${recipe.id}" has invalid quantity`
      );
    }
  }

  if (
    !Number.isInteger(
      recipe.difficulty
    ) ||
    recipe.difficulty <
      RECIPE_DIFFICULTY_RANGE.min ||
    recipe.difficulty >
      RECIPE_DIFFICULTY_RANGE.max
  ) {
    throw new Error(
      `Recipe "${recipe.id}" difficulty must be ${RECIPE_DIFFICULTY_RANGE.min}-${RECIPE_DIFFICULTY_RANGE.max}`
    );
  }

  if (
    !Number.isInteger(
      recipe.cookingMinutes
    ) ||
    recipe.cookingMinutes <
      RECIPE_COOKING_MINUTES_RANGE.min ||
    recipe.cookingMinutes >
      RECIPE_COOKING_MINUTES_RANGE.max
  ) {
    throw new Error(
      `Recipe "${recipe.id}" has invalid cookingMinutes`
    );
  }

  if (
    recipe.tags !== undefined &&
    (
      !Array.isArray(
        recipe.tags
      ) ||
      recipe.tags.some(
        tag =>
          typeof tag !==
            "string" ||
          !tag.trim()
      )
    )
  ) {
    throw new Error(
      `Recipe "${recipe.id}" has invalid tags`
    );
  }

  return true;
}

class RecipeSystem {
  load(
    records,
    {
      overwrite = false
    } = {}
  ) {
    if (!Array.isArray(records)) {
      throw new TypeError(
        "Recipe records must be an array"
      );
    }

    records.forEach(
      validateRecipe
    );

    return dataRegistry.register(
      COLLECTION,
      records,
      {
        overwrite
      }
    );
  }

  get(id) {
    return (
      dataRegistry.get(
        COLLECTION,
        id
      ) ??
      entitySystem.get(
        CUSTOM_TYPE,
        id
      )
    );
  }

  getAll() {
    return [
      ...dataRegistry.getAll(
        COLLECTION
      ),
      ...entitySystem.list(
        CUSTOM_TYPE
      )
    ];
  }

  exists(id) {
    return (
      dataRegistry.has(
        COLLECTION,
        id
      ) ||
      entitySystem.exists(
        CUSTOM_TYPE,
        id
      )
    );
  }

  getByDish(dishId) {
    return this.getAll().filter(
      recipe =>
        recipe.dishId ===
        dishId
    );
  }
}

export const recipeSystem =
  new RecipeSystem();

export {
  RecipeSystem,
  validateRecipe
};
