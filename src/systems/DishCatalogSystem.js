import { dataRegistry } from "../core/DataRegistry.js";
import { entitySystem } from "../core/EntitySystem.js";

const COLLECTION = "dishes";
const CUSTOM_TYPE = "custom_dish";

function validateDish(dish) {
  if (!dish || typeof dish !== "object") {
    throw new TypeError(
      "Dish must be an object"
    );
  }

  if (
    typeof dish.id !== "string" ||
    !dish.id.trim()
  ) {
    throw new Error(
      "Dish id is required"
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
    typeof dish.category !== "string" ||
    !dish.category.trim()
  ) {
    throw new Error(
      `Dish "${dish.id}" requires a category`
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
