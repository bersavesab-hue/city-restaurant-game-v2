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

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../src/data/recipeRules.js";

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

dishCatalogSystem.load([{
  schemaVersion:
    DISH_SCHEMA_VERSION,
  id: "stress_dish",
  name: "猪肉盖饭",
  category: "rice",
  basePrice: 3000,
  unlockLevel: 1,
  baseDifficulty: 30,
  defaultRecipeId:
    getDefaultRecipeId(
      "stress_dish"
    ),
  tags: [
    "rice",
    "stir_fry"
  ]
}], { overwrite: true });

recipeSystem.load([{
  schemaVersion:
    RECIPE_SCHEMA_VERSION,
  id:
    getDefaultRecipeId(
      "stress_dish"
    ),
  dishId: "stress_dish",
  variantId: "standard",
  name: "压力测试标准做法",
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
  recipeId:
    getDefaultRecipeId(
      "stress_dish"
    ),
  price: 3000
});

operatingScheduleSystem.create({
  restaurantId: restaurant.id,
  openHour: 9,
  closeHour: 24
});

function getEntityCount() {
  return entitySystem
    .listTypes()
    .reduce(
      (sum, type) =>
        sum +
        entitySystem.count(type),
      0
    );
}

function getHistoryCoverage() {
  const daily =
    entitySystem.filter(
      "daily_settlement",
      x =>
        x.restaurantId ===
        restaurant.id
    );

  const monthly =
    entitySystem.filter(
      "monthly_settlement",
      x =>
        x.restaurantId ===
        restaurant.id
    );

  const yearly =
    entitySystem.filter(
      "yearly_settlement",
      x =>
        x.restaurantId ===
        restaurant.id
    );

  const coveredDays =
    daily.reduce(
      (n, x) => n + 1,
      0
    ) +
    monthly.reduce(
      (n, x) =>
        n + (x.days ?? 0),
      0
    ) +
    yearly.reduce(
      (n, x) =>
        n + (x.days ?? 0),
      0
    );

  return {
    daily,
    monthly,
    yearly,
    coveredDays
  };
}

function checkpoint(
  label,
  totalDays,
  started
) {
  const history =
    getHistoryCoverage();

  const entities =
    getEntityCount();

  const finance =
    financeSystem.getSummary(
      restaurant.id
    );

  const elapsed =
    Math.round(
      performance.now() -
      started
    );

  console.log(
    `${label} | ${elapsed}ms | ` +
    `实体=${entities} | ` +
    `日报=${history.daily.length} | ` +
    `月报=${history.monthly.length} | ` +
    `年报=${history.yearly.length} | ` +
    `覆盖=${history.coveredDays}天 | ` +
    `任务=${schedulerSystem.count()} | ` +
    `余额=${finance.balance}`
  );

  assert.equal(
    history.coveredDays,
    totalDays
  );

  assert.ok(
    history.daily.length <= 394
  );

  assert.ok(
    history.monthly.length <= 36
  );

  assert.equal(
    entitySystem.count(
      "customer"
    ),
    0
  );

  assert.ok(
    schedulerSystem.count() < 20
  );

  assert.ok(
    Number.isFinite(
      finance.balance
    )
  );

  return {
    elapsed,
    entities,
    history
  };
}

console.log(
  "开始1/5/10/20年长期压力测试..."
);

let totalDays = 0;
let started = performance.now();

simulationSystem.advanceLongTerm(
  365
);

totalDays += 365;

checkpoint(
  "1年",
  totalDays,
  started
);

started = performance.now();

simulationSystem.advanceLongTerm(
  365 * 4
);

totalDays += 365 * 4;

const year5 =
  checkpoint(
    "5年",
    totalDays,
    started
  );

saveSystem.save(
  "stress-longrun"
);

const savedBalance =
  financeSystem.getBalance(
    restaurant.id
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
  savedBalance
);

console.log(
  "5年存档→清空→读档：通过"
);

started = performance.now();

simulationSystem.advanceLongTerm(
  365 * 5
);

totalDays += 365 * 5;

checkpoint(
  "10年",
  totalDays,
  started
);

started = performance.now();

simulationSystem.advanceLongTerm(
  365 * 10
);

totalDays += 365 * 10;

const year20 =
  checkpoint(
    "20年",
    totalDays,
    started
  );

assert.equal(
  gameState
    .getSection("time")
    .day,
  totalDays + 1
);

assert.ok(
  year20.entities < 10000,
  `20年实体过多: ${year20.entities}`
);

assert.ok(
  year20.history.yearly.length >= 15,
  `20年年报过少: ${year20.history.yearly.length}`
);

assert.ok(
  year20.entities <
    year5.entities * 2 + 3000,
  "长期实体仍接近线性膨胀"
);

console.log(
  "✅ 1/5/10/20年长期压力测试全部通过"
);
