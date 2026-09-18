export const RECIPE_SCHEMA_VERSION = 1;

export const RECIPE_VARIANT_ID_PATTERN =
  /^[a-z][a-z0-9_]*$/;

export const RECIPE_INGREDIENT_LIMITS =
  Object.freeze({
    min: 1,
    max: 12
  });

export const RECIPE_DIFFICULTY_RANGE =
  Object.freeze({
    min: 1,
    max: 100
  });

export const RECIPE_COOKING_MINUTES_RANGE =
  Object.freeze({
    min: 1,
    max: 480
  });

export function getRecipeId(
  dishId,
  variantId = "standard"
) {
  return (
    `recipe_${dishId}_${variantId}`
  );
}
