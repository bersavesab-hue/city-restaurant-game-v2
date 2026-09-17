import { dataRegistry } from "../core/DataRegistry.js";

const COLLECTION = "dishes";

function validateDish(dish) {
  if (!dish || typeof dish !== "object") {
    throw new TypeError("Dish must be an object");
  }

  if (typeof dish.id !== "string" || !dish.id.trim()) {
    throw new Error("Dish id is required");
  }

  if (typeof dish.name !== "string" || !dish.name.trim()) {
    throw new Error(`Dish "${dish.id}" requires a name`);
  }

  if (typeof dish.category !== "string" || !dish.category.trim()) {
    throw new Error(`Dish "${dish.id}" requires a category`);
  }

  if (!Number.isInteger(dish.basePrice) || dish.basePrice <= 0) {
    throw new Error(`Dish "${dish.id}" has invalid basePrice`);
  }

  return true;
}

class DishCatalogSystem {
  load(records, { overwrite = false } = {}) {
    if (!Array.isArray(records)) {
      throw new TypeError("Dish records must be an array");
    }

    records.forEach(validateDish);

    return dataRegistry.register(
      COLLECTION,
      records,
      { overwrite }
    );
  }

  get(id) {
    return dataRegistry.get(COLLECTION, id);
  }

  getAll() {
    return dataRegistry.getAll(COLLECTION);
  }

  exists(id) {
    return dataRegistry.has(COLLECTION, id);
  }

  count() {
    return dataRegistry.count(COLLECTION);
  }

  getByCategory(category) {
    return this.getAll().filter(
      (dish) => dish.category === category
    );
  }
}

export const dishCatalogSystem =
  new DishCatalogSystem();

export {
  DishCatalogSystem,
  validateDish
};
