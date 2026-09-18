import {
  mkdir,
  writeFile
} from "node:fs/promises";

import {
  INGREDIENT_ATLAS_DATA_URI
} from "../src/data/ingredientAtlas.js";

const OUTPUT_DIRECTORY =
  new URL(
    "../assets/images/ingredients/",
    import.meta.url
  );

const OUTPUT_FILE =
  new URL(
    "../assets/images/ingredients/ingredient-atlas-v1.webp",
    import.meta.url
  );

await mkdir(
  OUTPUT_DIRECTORY,
  {
    recursive: true
  }
);

const separator =
  INGREDIENT_ATLAS_DATA_URI.indexOf(
    ","
  );

if (
  separator < 0
) {
  throw new Error(
    "Ingredient atlas data URI is invalid"
  );
}

const base64 =
  INGREDIENT_ATLAS_DATA_URI.slice(
    separator + 1
  );

await writeFile(
  OUTPUT_FILE,
  Buffer.from(
    base64,
    "base64"
  )
);

console.log(
  "Ingredient atlas materialized:",
  OUTPUT_FILE.pathname
);
