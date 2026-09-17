import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { recipeSystem } from "./RecipeSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";

function requireRestaurant(id) {
  const restaurant = entitySystem.get("restaurant", id);
  if (!restaurant) {
    throw new Error(`Restaurant "${id}" does not exist`);
  }
  return restaurant;
}

function requireMenuItem(id) {
  const item = entitySystem.get("menu_item", id);
  if (!item) {
    throw new Error(`Menu item "${id}" does not exist`);
  }
  return item;
}

class MenuSystem {
  addItem({ restaurantId, dishId, recipeId = null, price = null }) {
    requireRestaurant(restaurantId);

    const dish = dishCatalogSystem.get(dishId);
    if (!dish) {
      throw new Error(`Dish "${dishId}" does not exist`);
    }

    if (
      this.listByRestaurant(restaurantId)
        .some((item) => item.dishId === dishId)
    ) {
      throw new Error(`Dish "${dishId}" is already on the menu`);
    }

    const finalRecipeId =
      recipeId ??
      recipeSystem.getByDish(dishId)[0]?.id;

    const recipe = recipeSystem.get(finalRecipeId);

    if (!recipe || recipe.dishId !== dishId) {
      throw new Error("Invalid recipe for dish");
    }

    const limits =
      storeProgressSystem.getLimits(restaurantId);

    if (
      this.listByRestaurant(restaurantId).length >=
      limits.menuItems
    ) {
      throw new Error(
        `Menu item limit reached: ${limits.menuItems}`
      );
    }

    const finalPrice = price ?? dish.basePrice;

    if (
      !Number.isInteger(finalPrice) ||
      finalPrice <= 0
    ) {
      throw new RangeError(
        "Menu price must be positive"
      );
    }

    const item = entitySystem.create("menu_item", {
      restaurantId,
      dishId,
      recipeId: finalRecipeId,
      price: finalPrice,
      active: true,
      soldCount: 0,
      totalRevenue: 0
    });

    eventBus.emit("menu:itemAdded", {
      item: structuredClone(item)
    });

    return item;
  }

  get(id) {
    return requireMenuItem(id);
  }

  listByRestaurant(restaurantId, { activeOnly = false } = {}) {
    requireRestaurant(restaurantId);

    return entitySystem
      .list("menu_item")
      .filter(
        (item) =>
          item.restaurantId === restaurantId
      )
      .filter(
        (item) =>
          !activeOnly || item.active
      );
  }

  setPrice(id, price) {
    if (
      !Number.isInteger(price) ||
      price <= 0
    ) {
      throw new RangeError(
        "Menu price must be positive"
      );
    }

    return entitySystem.update(
      "menu_item",
      id,
      { price }
    );
  }

  setActive(id, active) {
    return entitySystem.update(
      "menu_item",
      id,
      { active: Boolean(active) }
    );
  }

  recordSale(id, quantity, revenue) {
    const item = requireMenuItem(id);

    return entitySystem.update(
      "menu_item",
      id,
      {
        soldCount:
          item.soldCount + quantity,
        totalRevenue:
          item.totalRevenue + revenue
      }
    );
  }
}

export const menuSystem = new MenuSystem();
export { MenuSystem };
