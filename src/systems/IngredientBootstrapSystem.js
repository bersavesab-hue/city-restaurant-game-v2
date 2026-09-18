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
    let effectiveOverwrite =
      overwrite;

    if (!overwrite) {
      const complete =
        INGREDIENTS_V1.every(
          ingredient =>
            ingredientCatalogSystem.get(
              ingredient.id
            )
        );

      if (complete) {
        return INGREDIENTS_V1.length;
      }

      effectiveOverwrite =
        true;
    }


    return ingredientCatalogSystem
      .load(
        INGREDIENTS_V1,
        {
          overwrite:
            effectiveOverwrite
        }
      );
  }
}


export const ingredientBootstrapSystem =
  new IngredientBootstrapSystem();


export {
  IngredientBootstrapSystem
};
