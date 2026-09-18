import {
  INGREDIENTS_V1
} from "../data/ingredients.v1.js";

import {
  ingredientCatalogSystem
} from "./IngredientCatalogSystem.js";


class IngredientBootstrapSystem {
  ensureLoaded({
    overwrite = true
  } = {}) {
    if (
      ingredientCatalogSystem.count() >
        0 &&
      !overwrite
    ) {
      return ingredientCatalogSystem
        .count();
    }


    return ingredientCatalogSystem
      .load(
        INGREDIENTS_V1,
        {
          overwrite
        }
      );
  }
}


export const ingredientBootstrapSystem =
  new IngredientBootstrapSystem();


export {
  IngredientBootstrapSystem
};
