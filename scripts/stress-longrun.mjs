import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

import { app } from "../src/main.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { inventorySystem } from "../src/systems/InventorySystem.js";
import { supplierSystem } from "../src/systems/SupplierSystem.js";
import { procurementSystem } from "../src/systems/ProcurementSystem.js";
import { autoProcurementSystem } from "../src/systems/AutoProcurementSystem.js";
import { dishCatalogSystem } from "../src/systems/DishCatalogSystem.js";
import { recipeSystem } from "../src/systems/RecipeSystem.js";
import { menuSystem } from "../src/systems/MenuSystem.js";
import { operatingScheduleSystem } from "../src/systems/OperatingScheduleSystem.js";

const {
  gameState,
  entitySystem,
  simulationSystem,
  schedulerSystem,
  saveSystem,
  dataRegistry
} = app.core;

gameState.reset();
dataRegistry.clear();
saveSystem.remove("stress-longrun");

ingredientCatalogSystem.load([
  {
    id: "stress_rice",
    name: "压力测试大米",
    category: "grain",
    unit: "kg",
    baseQuality: 3,
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
    baseQuality: 3,
    storageType: "chilled",
    basePurchasePrice: 400,
    shelfLifeDays: 5,
    edibleRate: 0.9,
    baseWasteRate: 0.05
  }
], { overwrite: true });

dishCatalogSystem.load([{
  id: "stress_dish",
  name: "猪肉盖饭",
  category: "rice",
  basePrice: 3000
}], { overwrite: true });

recipeSystem.load([{
  id: "stress_recipe",
  dishId: "stress_dish",
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
}], { overwrite: true });

const restaurant =
  restaurantSystem.create({
    name: "长期压力测试餐厅"
  });

financeSystem.createAccount(
  restaurant.id,
  100000000
);

for (let i = 1; i <= 2; i += 1) {
  employeeSystem.hire({
    restaurantId: restaurant.id,
    name: `测试厨师${i}`,
    roleId: "chef"
  });

  employeeSystem.hire({
    restaurantId: restaurant.id,
    name: `测试服务员${i}`,
    roleId: "server"
  });
}

for (const ingredientId of [
  "stress_rice",
  "stress_pork"
]) {
  inventorySystem.addBatch({
    restaurantId: restaurant.id,
    ingredientId,
    quantity: 60,
    quality: 3
  });
}

const supplier =
  supplierSystem.create({
    name: "长期压力供应商",
    reliability: 95
  });

for (const ingredientId of [
  "stress_rice",
  "stress_pork"
]) {
  supplierSystem.addOffer(
    supplier.id,
    ingredientId,
    {
      priceVolatility: 0.05,
      deliveryMinutes: 60,
      capacityPerDay: 100,
      minimumOrder: 1
    }
  );

  autoProcurementSystem.setPolicy({
    restaurantId: restaurant.id,
    ingredientId,
    supplierId: supplier.id,
    minimumQuantity: 15,
    targetQuantity: 60
  });
}

menuSystem.addItem({
  restaurantId: restaurant.id,
  dishId: "stress_dish",
  recipeId: "stress_recipe",
  price: 3000
});

operatingScheduleSystem.create({
  restaurantId: restaurant.id,
  openHour: 9,
  closeHour: 24
});

function checkpoint(days, started) {
  const settlements =
    entitySystem
      .list("daily_settlement")
      .filter(
        x => x.restaurantId === restaurant.id
      );

  const orders =
    entitySystem
      .list("customer_order")
      .filter(
        x => x.restaurantId === restaurant.id
      );

  const finance =
    financeSystem.getSummary(
      restaurant.id
    );

  const types =
    entitySystem.listTypes();

  const entityCount =
    types.reduce(
      (sum, type) =>
        sum + entitySystem.count(type),
      0
    );

  const pending =
    procurementSystem
      .listByRestaurant(
        restaurant.id,
        "pending"
      ).length;

  const ms =
    Math.round(
      performance.now() - started
    );

  console.log(
    `${days}天 | ${ms}ms | ` +
    `订单=${orders.length} | ` +
    `结算=${settlements.length} | ` +
    `实体=${entityCount} | ` +
    `任务=${schedulerSystem.count()} | ` +
    `待到货=${pending} | ` +
    `余额=${finance.balance}`
  );

  assert.equal(
    settlements.length,
    days
  );

  assert.equal(
    new Set(
      settlements.map(x => x.day)
    ).size,
    days
  );

  assert.equal(
    entitySystem.count("customer"),
    0
  );

  assert.ok(
    schedulerSystem.count() < 20
  );

  assert.ok(
    Number.isFinite(finance.balance)
  );

  assert.ok(finance.balance > 0);
}

console.log("开始长期压力测试...");

let started = performance.now();

simulationSystem.advance(
  7 * 1440
);

checkpoint(7, started);

started = performance.now();

simulationSystem.advance(
  23 * 1440
);

checkpoint(30, started);

const balanceBeforeSave =
  financeSystem.getBalance(
    restaurant.id
  );

saveSystem.save(
  "stress-longrun"
);

gameState.reset();
dataRegistry.clear();

saveSystem.load(
  "stress-longrun"
);

assert.equal(
  financeSystem.getBalance(
    restaurant.id
  ),
  balanceBeforeSave
);

assert.ok(
  ingredientCatalogSystem.get(
    "stress_rice"
  )
);

console.log("30天存档→清空→读档：通过");

started = performance.now();

simulationSystem.advance(
  335 * 1440
);

checkpoint(365, started);

assert.equal(
  gameState.getSection("time").day,
  366
);

assert.ok(
  inventorySystem
    .getAvailableQuantity(
      restaurant.id,
      "stress_rice"
    ) >= 0
);

assert.ok(
  inventorySystem
    .getAvailableQuantity(
      restaurant.id,
      "stress_pork"
    ) >= 0
);

console.log("✅ 7/30/365天长期压力测试全部通过");
