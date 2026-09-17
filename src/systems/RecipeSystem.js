import { dataRegistry } from "../core/DataRegistry.js";
import { entitySystem } from "../core/EntitySystem.js";

import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";

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
    typeof recipe.id !== "string" ||
    !recipe.id.trim()
  ) {
    throw new Error(
      "Recipe id is required"
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
    !Array.isArray(
      recipe.ingredients
    ) ||
    recipe.ingredients.length ===
      0
  ) {
    throw new Error(
      `Recipe "${recipe.id}" requires ingredients`
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
    recipe.difficulty < 1 ||
    recipe.difficulty > 100
  ) {
    throw new Error(
      `Recipe "${recipe.id}" difficulty must be 1-100`
    );
  }

  if (
    !Number.isInteger(
      recipe.cookingMinutes
    ) ||
    recipe.cookingMinutes <= 0
  ) {
    throw new Error(
      `Recipe "${recipe.id}" has invalid cookingMinutes`
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
