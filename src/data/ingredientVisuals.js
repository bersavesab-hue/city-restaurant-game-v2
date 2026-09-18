import {
  INGREDIENTS_V1
} from "./ingredients.v1.js";

export const INGREDIENT_IMAGE_DIRECTORY =
  "assets/images/ingredients";

function padIngredientIndex(
  value
) {
  return String(
    value
  ).padStart(
    3,
    "0"
  );
}

export const INGREDIENT_VISUALS =
  Object.freeze(
    INGREDIENTS_V1.map(
      (
        ingredient,
        offset
      ) => {
        const index =
          offset + 1;

        return Object.freeze({
          index,
          code:
            padIngredientIndex(
              index
            ),
          batch:
            Math.floor(
              offset / 10
            ) + 1,
          batchPosition:
            (
              offset %
              10
            ) + 1,
          id:
            ingredient.id,
          name:
            ingredient.name,
          category:
            ingredient.category,
          image:
            `${INGREDIENT_IMAGE_DIRECTORY}/${padIngredientIndex(index)}_${ingredient.id}.webp`
        });
      }
    )
  );

const INGREDIENT_VISUAL_MAP =
  new Map(
    INGREDIENT_VISUALS.map(
      visual => [
        visual.id,
        visual
      ]
    )
  );

export function getIngredientVisual(
  ingredientId
) {
  const visual =
    INGREDIENT_VISUAL_MAP.get(
      ingredientId
    );

  if (!visual) {
    throw new Error(
      `Ingredient visual "${ingredientId}" does not exist`
    );
  }

  return visual;
}

export function getIngredientImagePath(
  ingredientId
) {
  return getIngredientVisual(
    ingredientId
  ).image;
}

export function getIngredientVisualByIndex(
  index
) {
  if (
    !Number.isInteger(index) ||
    index < 1 ||
    index >
      INGREDIENT_VISUALS.length
  ) {
    throw new RangeError(
      "Ingredient visual index must be between 1 and 220"
    );
  }

  return INGREDIENT_VISUALS[
    index - 1
  ];
}
