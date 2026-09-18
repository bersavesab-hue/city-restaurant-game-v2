import {
  DISHES_V1
} from "../data/dishes.v1.js";

import {
  RECIPES_V1
} from "../data/recipes.v1.js";

import {
  ingredientBootstrapSystem
} from "./IngredientBootstrapSystem.js";

import {
  dishCatalogSystem
} from "./DishCatalogSystem.js";

import {
  recipeSystem
} from "./RecipeSystem.js";


class DishRecipeBootstrapSystem {
  ensureLoaded({
    overwrite = true
  } = {}) {
    ingredientBootstrapSystem
      .ensureLoaded({
        overwrite: false
      });

    if (!overwrite) {
      const dishesReady =
        DISHES_V1.every(
          dish =>
            dishCatalogSystem.get(
              dish.id
            )
        );

      const recipesReady =
        RECIPES_V1.every(
          recipe =>
            recipeSystem.get(
              recipe.id
            )
        );

      if (
        dishesReady &&
        recipesReady
      ) {
        return {
          dishes:
            DISHES_V1.length,

          recipes:
            RECIPES_V1.length
        };
      }
    }

    dishCatalogSystem.load(
      DISHES_V1,
      {
        overwrite
      }
    );

    recipeSystem.load(
      RECIPES_V1,
      {
        overwrite
      }
    );

    return {
      dishes:
        DISHES_V1.length,

      recipes:
        RECIPES_V1.length
    };
  }
}


export const dishRecipeBootstrapSystem =
  new DishRecipeBootstrapSystem();


export {
  DishRecipeBootstrapSystem
};
