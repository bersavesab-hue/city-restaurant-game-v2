import {
  dishCatalogSystem
} from "../../systems/DishCatalogSystem.js";

import {
  recipeSystem
} from "../../systems/RecipeSystem.js";

import {
  ingredientCatalogSystem
} from "../../systems/IngredientCatalogSystem.js";

import {
  composeDishVisual,
  createDishVisualPlan
} from "./DishVisualComposer.js";

import {
  getCachedDishVisual,
  putCachedDishVisual,
  getDishVisualObjectUrl
} from "./DishVisualCache.js";


function getRecipe(
  dish
) {
  if (
    dish?.recipeId
  ) {
    try {
      const recipe =
        recipeSystem.get(
          dish.recipeId
        );

      if (
        recipe
      ) {
        return recipe;
      }
    } catch {
      // fall through
    }
  }

  return (
    recipeSystem
      .getByDish(
        dish.id
      )[0] ??
    null
  );
}


function getIngredientRecords(
  recipe
) {
  return (
    recipe?.ingredients ??
    []
  )
    .map(
      item => {
        try {
          return ingredientCatalogSystem
            .get(
              item.ingredientId
            );
        } catch {
          return null;
        }
      }
    )
    .filter(
      Boolean
    );
}


export function getCustomDishVisualPlan(
  dishId
) {
  const dish =
    dishCatalogSystem.get(
      dishId
    );

  if (
    !dish ||
    !dish.custom
  ) {
    return null;
  }

  const recipe =
    getRecipe(
      dish
    );

  if (
    !recipe
  ) {
    return null;
  }

  return createDishVisualPlan({
    dish,
    recipe,
    ingredientRecords:
      getIngredientRecords(
        recipe
      )
  });
}


export async function getCustomDishVisualUrl(
  dishId
) {
  const dish =
    dishCatalogSystem.get(
      dishId
    );

  if (
    !dish ||
    !dish.custom
  ) {
    return null;
  }

  const recipe =
    getRecipe(
      dish
    );

  if (
    !recipe
  ) {
    return null;
  }

  const ingredientRecords =
    getIngredientRecords(
      recipe
    );

  const plan =
    createDishVisualPlan({
      dish,
      recipe,
      ingredientRecords
    });

  const cached =
    await getCachedDishVisual(
      plan.cacheKey
    );

  if (
    cached
  ) {
    return {
      url:
        getDishVisualObjectUrl(
          plan.cacheKey,
          cached
        ),

      plan,
      cached:
        true
    };
  }

  const result =
    await composeDishVisual({
      dish,
      recipe,
      ingredientRecords
    });

  if (
    result.blob
  ) {
    await putCachedDishVisual(
      plan.cacheKey,
      result.blob
    );

    return {
      url:
        getDishVisualObjectUrl(
          plan.cacheKey,
          result.blob
        ),

      plan,
      cached:
        false
    };
  }

  if (
    result.canvas &&
    typeof result.canvas
      .toDataURL ===
      "function"
  ) {
    return {
      url:
        result.canvas
          .toDataURL(
            "image/webp",
            0.9
          ),

      plan,
      cached:
        false
    };
  }

  return {
    url:
      null,

    plan,
    cached:
      false
  };
}
