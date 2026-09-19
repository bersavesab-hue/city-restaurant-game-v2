import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { inventorySystem } from "../src/systems/InventorySystem.js";
import { supplierSystem } from "../src/systems/SupplierSystem.js";
import { autoProcurementSystem } from "../src/systems/AutoProcurementSystem.js";
import { dishCatalogSystem } from "../src/systems/DishCatalogSystem.js";
import { recipeSystem } from "../src/systems/RecipeSystem.js";
import { menuSystem } from "../src/systems/MenuSystem.js";
import { operatingScheduleSystem } from "../src/systems/OperatingScheduleSystem.js";

const {
  gameState,
  entitySystem,
  simulationSystem,
  schedulerSystem
} = app.core;

function createStressRestaurant() {
  gameState.reset();

  ingredientCatalogSystem.load([
    {
      id: "stress_rice",
      name: "压力测试大米",
      category: "grain",
      unit: "kg",
      storageType: "dry",
      basePurchasePrice: 100,
      shelfLifeDays: 30,
      edibleRate: 1,
      baseWasteRate: 0
    },
    {
      id: "stress_pork",
      name: "压力测试猪肉",
      category: "meat",
      unit: "kg",
      storageType: "chilled",
      basePurchasePrice: 400,
      shelfLifeDays: 5,
      edibleRate: 0.9,
      baseWasteRate: 0.05
    }
  ], { overwrite: true });

  dishCatalogSystem.load([
    {
      schemaVersion: 1,
      id: "stress_dish",
      name: "猪肉盖饭",
      category: "rice",
      basePrice: 3000,
      unlockLevel: 1,
      baseDifficulty: 30,
      defaultRecipeId: "recipe_stress_dish_standard"
    }
  ], { overwrite: true });

  recipeSystem.load([
    {
      schemaVersion: 1,
      id: "recipe_stress_dish_standard",
      variantId: "standard",
      name: "猪肉盖饭标准配方",
      dishId: "stress_dish",
      method: "stir_fry",
      difficulty: 30,
      cookingMinutes: 10,
      ingredients: [
        {
          ingredientId: "stress_rice",
          quantity: 0.2
        },
        {
          ingredientId: "stress_pork",
          quantity: 0.15
        }
      ]
    }
  ], { overwrite: true });

  const restaurant =
    restaurantSystem.create({
      name: "七天压力测试餐厅"
    });

  financeSystem.createAccount(
    restaurant.id,
    1000000
  );

  employeeSystem.hire({
    restaurantId: restaurant.id,
    name: "压力测试厨师",
    roleId: "chef"
  });

  employeeSystem.hire({
    restaurantId: restaurant.id,
    name: "压力测试服务员",
    roleId: "server"
  });

  inventorySystem.addBatch({
    restaurantId: restaurant.id,
    ingredientId: "stress_rice",
    quantity: 30,
    quality: 3
  });

  inventorySystem.addBatch({
    restaurantId: restaurant.id,
    ingredientId: "stress_pork",
    quantity: 30,
    quality: 3
  });

  const supplier =
    supplierSystem.create({
      name: "压力测试供应商",
      reliability: 90
    });

  supplierSystem.addOffer(
    supplier.id,
    "stress_rice",
    {
      priceVolatility: 0.05,
      deliveryMinutes: 60,
      capacityPerDay: 100,
      minimumOrder: 1
    }
  );

  supplierSystem.addOffer(
    supplier.id,
    "stress_pork",
    {
      priceVolatility: 0.05,
      deliveryMinutes: 60,
      capacityPerDay: 100,
      minimumOrder: 1
    }
  );

  autoProcurementSystem.setPolicy({
    restaurantId: restaurant.id,
    ingredientId: "stress_rice",
    supplierId: supplier.id,
    minimumQuantity: 5,
    targetQuantity: 30
  });

  autoProcurementSystem.setPolicy({
    restaurantId: restaurant.id,
    ingredientId: "stress_pork",
    supplierId: supplier.id,
    minimumQuantity: 5,
    targetQuantity: 30
  });

  menuSystem.addItem({
    restaurantId: restaurant.id,
    dishId: "stress_dish",
    recipeId: "recipe_stress_dish_standard",
    price: 3000
  });

  operatingScheduleSystem.create({
    restaurantId: restaurant.id,
    openHour: 9,
    closeHour: 24
  });

  return restaurant;
}

test(
  "连续自动经营7天不崩溃、不泄漏散客实体",
  () => {
    const restaurant =
      createStressRestaurant();

    const started =
      performance.now();

    simulationSystem.advance(
      7 * 24 * 60
    );

    const elapsed =
      Math.round(
        performance.now() - started
      );

    const time =
      gameState.getSection("time");

    const orders =
      entitySystem
        .list("customer_order")
        .filter(
          (item) =>
            item.restaurantId ===
            restaurant.id
        );

    const settlements =
      entitySystem
        .list("daily_settlement")
        .filter(
          (item) =>
            item.restaurantId ===
            restaurant.id
        );

    const finance =
      financeSystem.getSummary(
        restaurant.id
      );

    console.log(
      `7天压力测试: ${elapsed}ms, ` +
      `订单=${orders.length}, ` +
      `结算=${settlements.length}, ` +
      `实体=${gameState.getSection("data") ? entitySystem.listTypes().length : 0}, ` +
      `任务=${schedulerSystem.count()}`
    );

    assert.equal(
      time.day,
      8
    );

    assert.ok(
      orders.length > 0
    );

    assert.equal(
      settlements.length,
      7
    );

    assert.equal(
      entitySystem.count("customer"),
      0
    );

    assert.ok(
      Number.isFinite(
        finance.balance
      )
    );

    assert.ok(
      schedulerSystem.count() < 20
    );
  }
);
