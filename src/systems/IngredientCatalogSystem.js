import { dataRegistry } from "../core/DataRegistry.js";
import {
  INGREDIENT_CATEGORY,
  INGREDIENT_UNIT,
  INGREDIENT_QUALITY,
  STORAGE_TYPE
} from "../data/ingredientRules.js";

const COLLECTION = "ingredients";

const validCategories = new Set(
  Object.values(INGREDIENT_CATEGORY)
);

const validUnits = new Set(
  Object.values(INGREDIENT_UNIT)
);

const validQualities = new Set(
  Object.values(INGREDIENT_QUALITY)
);

const validStorageTypes = new Set(
  Object.values(STORAGE_TYPE)
);

function validateIngredient(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError(
      "Ingredient must be an object"
    );
  }

  if (
    typeof item.id !== "string" ||
    item.id.trim() === ""
  ) {
    throw new Error(
      "Ingredient id is required"
    );
  }

  if (
    typeof item.name !== "string" ||
    item.name.trim() === ""
  ) {
    throw new Error(
      `Ingredient "${item.id}" requires a name`
    );
  }

  if (!validCategories.has(item.category)) {
    throw new Error(
      `Ingredient "${item.id}" has invalid category`
    );
  }

  if (!validUnits.has(item.unit)) {
    throw new Error(
      `Ingredient "${item.id}" has invalid unit`
    );
  }

  if (!validQualities.has(item.baseQuality)) {
    throw new Error(
      `Ingredient "${item.id}" has invalid baseQuality`
    );
  }

  if (!validStorageTypes.has(item.storageType)) {
    throw new Error(
      `Ingredient "${item.id}" has invalid storageType`
    );
  }

  if (
    !Number.isFinite(item.basePurchasePrice) ||
    item.basePurchasePrice < 0
  ) {
    throw new Error(
      `Ingredient "${item.id}" has invalid basePurchasePrice`
    );
  }

  if (
    !Number.isInteger(item.shelfLifeDays) ||
    item.shelfLifeDays <= 0
  ) {
    throw new Error(
      `Ingredient "${item.id}" has invalid shelfLifeDays`
    );
  }

  if (
    typeof item.edibleRate !== "number" ||
    item.edibleRate <= 0 ||
    item.edibleRate > 1
  ) {
    throw new Error(
      `Ingredient "${item.id}" has invalid edibleRate`
    );
  }

  if (
    typeof item.baseWasteRate !== "number" ||
    item.baseWasteRate < 0 ||
    item.baseWasteRate > 1
  ) {
    throw new Error(
      `Ingredient "${item.id}" has invalid baseWasteRate`
    );
  }


  if (
    item.procurementGroup !== undefined &&
    (
      typeof item.procurementGroup !== "string" ||
      !item.procurementGroup.trim()
    )
  ) {
    throw new Error(
      `Ingredient "${item.id}" has invalid procurementGroup`
    );
  }


  for (
    const field
    of [
      "allergenTags",
      "culinaryTags"
    ]
  ) {
    if (
      item[field] !== undefined &&
      (
        !Array.isArray(item[field]) ||
        item[field].some(
          value =>
            typeof value !== "string" ||
            !value.trim()
        )
      )
    ) {
      throw new Error(
        `Ingredient "${item.id}" has invalid ${field}`
      );
    }
  }


  return true;
}

class IngredientCatalogSystem {
  load(records, { overwrite = false } = {}) {
    if (!Array.isArray(records)) {
      throw new TypeError(
        "Ingredient records must be an array"
      );
    }

    for (const item of records) {
      validateIngredient(item);
    }

    return dataRegistry.register(
      COLLECTION,
      records,
      { overwrite }
    );
  }

  get(id) {
    return dataRegistry.get(
      COLLECTION,
      id
    );
  }

  getAll() {
    return dataRegistry.getAll(
      COLLECTION
    );
  }

  exists(id) {
    return dataRegistry.has(
      COLLECTION,
      id
    );
  }

  count() {
    return dataRegistry.count(
      COLLECTION
    );
  }

  getByCategory(category) {
    if (!validCategories.has(category)) {
      throw new Error(
        `Invalid ingredient category "${category}"`
      );
    }

    return this.getAll().filter(
      (item) =>
        item.category === category
    );
  }

  getByStorageType(storageType) {
    if (!validStorageTypes.has(storageType)) {
      throw new Error(
        `Invalid storage type "${storageType}"`
      );
    }

    return this.getAll().filter(
      (item) =>
        item.storageType === storageType
    );
  }
}

export const ingredientCatalogSystem =
  new IngredientCatalogSystem();

export {
  IngredientCatalogSystem,
  validateIngredient
};
