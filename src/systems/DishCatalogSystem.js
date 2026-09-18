import { dataRegistry } from "../core/DataRegistry.js";
import { entitySystem } from "../core/EntitySystem.js";

import {
  DISH_SCHEMA_VERSION,
  DISH_ID_PATTERN,
  DISH_CATEGORY,
  DISH_UNLOCK_LEVEL_RANGE,
  DISH_DIFFICULTY_RANGE,
  getDefaultRecipeId
} from "../data/dishCatalogRules.js";

const COLLECTION = "dishes";
const CUSTOM_TYPE = "custom_dish";

const validCategories =
  new Set(
    Object.values(
      DISH_CATEGORY
    )
  );

const RUNTIME_ONLY_FIELDS =
  Object.freeze([
    "qualityScore",
    "qualityGrade",
    "qualityLevel",
    "rarity",
    "prestigeTitle",
    "masteryXp",
    "masteryLevel",
    "masteryQualityBonus",
    "dishRankId",
    "dishRankName",
    "dishRankOrder",
    "lifetimeSold",
    "lifetimeRevenue",
    "marketPerformance",
    "outputQuality"
  ]);

function validateDish(dish) {
  if (!dish || typeof dish !== "object") {
    throw new TypeError(
      "Dish must be an object"
    );
  }

  if (
    typeof dish.id !== "string" ||
    !DISH_ID_PATTERN.test(
      dish.id
    )
  ) {
    throw new Error(
      "Dish id must use stable snake_case lowercase format"
    );
  }

  if (
    dish.schemaVersion !==
      DISH_SCHEMA_VERSION
  ) {
    throw new Error(
      `Dish "${dish.id}" has invalid schemaVersion`
    );
  }

  if (
    typeof dish.name !== "string" ||
    !dish.name.trim()
  ) {
    throw new Error(
      `Dish "${dish.id}" requires a name`
    );
  }

  if (
    !validCategories.has(
      dish.category
    )
  ) {
    throw new Error(
      `Dish "${dish.id}" has invalid category`
    );
  }

  if (
    !Number.isInteger(
      dish.basePrice
    ) ||
    dish.basePrice <= 0
  ) {
    throw new Error(
      `Dish "${dish.id}" has invalid basePrice`
    );
  }

  if (
    !Number.isInteger(
      dish.unlockLevel
    ) ||
    dish.unlockLevel <
      DISH_UNLOCK_LEVEL_RANGE.min ||
    dish.unlockLevel >
      DISH_UNLOCK_LEVEL_RANGE.max
  ) {
    throw new Error(
      `Dish "${dish.id}" unlockLevel must be 1-10`
    );
  }

  if (
    !Number.isInteger(
      dish.baseDifficulty
    ) ||
    dish.baseDifficulty <
      DISH_DIFFICULTY_RANGE.min ||
    dish.baseDifficulty >
      DISH_DIFFICULTY_RANGE.max
  ) {
    throw new Error(
      `Dish "${dish.id}" baseDifficulty must be 1-100`
    );
  }

  if (
    typeof dish.defaultRecipeId !==
      "string" ||
    dish.defaultRecipeId !==
      getDefaultRecipeId(
        dish.id
      )
  ) {
    throw new Error(
      `Dish "${dish.id}" has invalid defaultRecipeId`
    );
  }

  if (
    dish.tags !== undefined &&
    (
      !Array.isArray(
        dish.tags
      ) ||
      dish.tags.some(
        tag =>
          typeof tag !==
            "string" ||
          !tag.trim()
      )
    )
  ) {
    throw new Error(
      `Dish "${dish.id}" has invalid tags`
    );
  }

  for (
    const field
    of RUNTIME_ONLY_FIELDS
  ) {
    if (
      Object.prototype
        .hasOwnProperty.call(
          dish,
          field
        )
    ) {
      throw new Error(
        `Dish "${dish.id}" must not define runtime field "${field}"`
      );
    }
  }

  return true;
}

class DishCatalogSystem {
  load(
    records,
    {
      overwrite = false
    } = {}
  ) {
    if (!Array.isArray(records)) {
      throw new TypeError(
        "Dish records must be an array"
      );
    }

    records.forEach(
      validateDish
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

  count() {
    return (
      dataRegistry.count(
        COLLECTION
      ) +
      entitySystem.count(
        CUSTOM_TYPE
      )
    );
  }

  getByCategory(category) {
    return this.getAll().filter(
      dish =>
        dish.category ===
        category
    );
  }

  getCustomByRestaurant(
    restaurantId
  ) {
    return entitySystem.filter(
      CUSTOM_TYPE,
      item =>
        item.ownerRestaurantId ===
        restaurantId
    );
  }
}

export const dishCatalogSystem =
  new DishCatalogSystem();

export {
  DishCatalogSystem,
  validateDish
};
