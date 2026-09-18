import part01 from "./ingredientAtlasParts/part01.js";
import part02 from "./ingredientAtlasParts/part02.js";
import part03 from "./ingredientAtlasParts/part03.js";
import part04 from "./ingredientAtlasParts/part04.js";
import part05 from "./ingredientAtlasParts/part05.js";
import part06 from "./ingredientAtlasParts/part06.js";
import part07 from "./ingredientAtlasParts/part07.js";
import part08 from "./ingredientAtlasParts/part08.js";
import part09 from "./ingredientAtlasParts/part09.js";

export const INGREDIENT_ATLAS_FORMAT = "image/webp";
export const INGREDIENT_ATLAS_COLUMNS = 16;
export const INGREDIENT_ATLAS_ROWS = 17;
export const INGREDIENT_ATLAS_SOURCE_CELL = 24;
export const INGREDIENT_ATLAS_SLOT_COUNT = 271;

const BASE64 =
  part01 +
  part02 +
  part03 +
  part04 +
  part05 +
  part06 +
  part07 +
  part08 +
  part09;

export const INGREDIENT_ATLAS_DATA_URI =
  `data:${INGREDIENT_ATLAS_FORMAT};base64,${BASE64}`;

export function getIngredientAtlasCssUrl() {
  return `url("${INGREDIENT_ATLAS_DATA_URI}")`;
}
