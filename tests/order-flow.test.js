import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { inventorySystem } from "../src/systems/InventorySystem.js";
import { dishCatalogSystem } from "../src/systems/DishCatalogSystem.js";
import { recipeSystem } from "../src/systems/RecipeSystem.js";
import { menuSystem } from "../src/systems/MenuSystem.js";
import { customerSystem } from "../src/systems/CustomerSystem.js";
import { orderSystem } from "../src/systems/OrderSystem.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../src/data/recipeRules.js";

test("营业完整链路", () => {
  gameState.reset();

  ingredientCatalogSystem.load([
    {
      id: "rice",
      name: "大米",
      category: "grain",
      unit: "kg",
      storageType: "dry",
      basePurchasePrice: 500,
      shelfLifeDays: 30,
      edibleRate: 1,
      baseWasteRate: 0
    }
  ], { overwrite: true });

  dishCatalogSystem.load([
    {
      schemaVersion:
        DISH_SCHEMA_VERSION,
      id: "rice_bowl",
      name: "米饭",
      category: "rice",
      basePrice: 3000,
      unlockLevel: 1,
      baseDifficulty: 10,
      defaultRecipeId:
        getDefaultRecipeId(
          "rice_bowl"
        )
    }
  ], { overwrite: true });

  recipeSystem.load([
    {
      schemaVersion:
        RECIPE_SCHEMA_VERSION,
      id:
        getDefaultRecipeId(
          "rice_bowl"
        ),
      dishId: "rice_bowl",
      variantId: "standard",
      name: "标准做法",
      method: "boil",
      difficulty: 10,
      cookingMinutes: 5,
      ingredients: [
        {
          ingredientId: "rice",
          quantity: 0.2
        }
      ]
    }
  ], { overwrite: true });

  const restaurant =
    restaurantSystem.create({
      name: "测试餐厅"
    });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "测试厨师",
    roleId:
      "chef"
  });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  restaurantSystem.open(
    restaurant.id
  );

  inventorySystem.addBatch({
    restaurantId: restaurant.id,
    ingredientId: "rice",
    quantity: 10,
    quality: 3
  });

  const menuItem =
    menuSystem.addItem({
      restaurantId: restaurant.id,
      dishId: "rice_bowl",
      recipeId:
        getDefaultRecipeId(
          "rice_bowl"
        ),
      price: 3000
    });

  const customer =
    customerSystem.create({
      name: "测试顾客",
      budget: 10000
    });

  const before =
    financeSystem.getBalance(
      restaurant.id
    );

  const order =
    orderSystem.place({
      restaurantId: restaurant.id,
      customerId: customer.id,
      items: [
        {
          menuItemId: menuItem.id,
          quantity: 2
        }
      ]
    });

  assert.equal(order.status, "completed");
  assert.equal(order.totalRevenue, 6000);
  assert.ok(order.ingredientCost > 0);
  assert.equal(
    order.grossProfit,
    order.totalRevenue - order.ingredientCost
  );

  assert.equal(
    financeSystem.getBalance(restaurant.id),
    before + 6000
  );

  assert.equal(
    inventorySystem.getAvailableQuantity(
      restaurant.id,
      "rice"
    ),
    9.6
  );

  assert.equal(
    menuSystem.get(menuItem.id).soldCount,
    2
  );

  assert.equal(
    customerSystem.get(customer.id).visits,
    1
  );
});
