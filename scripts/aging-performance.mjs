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

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const index =
    Math.min(
      sorted.length - 1,
      Math.ceil(
        sorted.length * p
      ) - 1
    );

  return sorted[index];
}

function stats(values) {
  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return {
    avg:
      values.length > 0
        ? total /
          values.length
        : 0,

    p95:
      percentile(
        values,
        0.95
      ),

    p99:
      percentile(
        values,
        0.99
      ),

    max:
      values.length > 0
        ? Math.max(...values)
        : 0
  };
}

function ageTo(targetDays) {
  const currentDays =
    gameState
      .getSection("time")
      .day - 1;

  const remaining =
    targetDays -
    currentDays;

  if (remaining > 0) {
    simulationSystem
      .advanceLongTerm(
        remaining
      );
  }
}

function benchmarkNormalDay(label) {
  const normal = [];
  const hourly = [];
  const midnight = [];

  for (
    let minute = 0;
    minute < 1440;
    minute += 1
  ) {
    const started =
      performance.now();

    simulationSystem.advance(1);

    const elapsed =
      performance.now() -
      started;

    const time =
      gameState.getSection(
        "time"
      );

    if (
      time.hour === 0 &&
      time.minute === 0
    ) {
      midnight.push(elapsed);
    } else if (
      time.minute === 0
    ) {
      hourly.push(elapsed);
    } else {
      normal.push(elapsed);
    }
  }

  const a = stats(normal);
  const b = stats(hourly);
  const c = stats(midnight);

  const entities =
    entitySystem
      .listTypes()
      .reduce(
        (sum, type) =>
          sum +
          entitySystem.count(type),
        0
      );

  console.log(
    `${label} | 实体=${entities}`
  );

  console.log(
    `  普通分钟 avg=${a.avg.toFixed(3)}ms ` +
    `P95=${a.p95.toFixed(3)}ms ` +
    `P99=${a.p99.toFixed(3)}ms ` +
    `max=${a.max.toFixed(3)}ms`
  );

  console.log(
    `  整点     avg=${b.avg.toFixed(3)}ms ` +
    `P95=${b.p95.toFixed(3)}ms ` +
    `max=${b.max.toFixed(3)}ms`
  );

  console.log(
    `  跨日     ${c.max.toFixed(3)}ms`
  );

  return {
    normal: a,
    hourly: b,
    midnight: c.max,
    entities
  };
}

console.log(
  "开始长期存档老化性能测试..."
);

ageTo(365);
const year1 =
  benchmarkNormalDay("1年后");

ageTo(365 * 5);
const year5 =
  benchmarkNormalDay("5年后");

ageTo(365 * 10);
const year10 =
  benchmarkNormalDay("10年后");

ageTo(365 * 20);
const year20 =
  benchmarkNormalDay("20年后");

console.log("");
console.log(
  `20年/1年普通分钟P95倍率: ${
    (
      year20.normal.p95 /
      Math.max(
        year1.normal.p95,
        0.001
      )
    ).toFixed(2)
  }x`
);

console.log(
  `20年/1年整点P95倍率: ${
    (
      year20.hourly.p95 /
      Math.max(
        year1.hourly.p95,
        0.001
      )
    ).toFixed(2)
  }x`
);

assert.ok(
  Number.isFinite(
    year20.normal.p95
  ) &&
  Number.isFinite(
    year20.hourly.p95
  ) &&
  Number.isFinite(
    year20.midnight
  ),
  "20年老化性能统计必须保持有限数值"
);

assert.ok(
  year20.entities < 10000,
  `20年老化实体过多: ${year20.entities}`
);

assert.ok(
  year20.normal.p95 < 50,
  `20年普通分钟P95过慢: ${year20.normal.p95.toFixed(3)}ms`
);

assert.ok(
  year20.hourly.p95 < 1000,
  `20年整点P95过慢: ${year20.hourly.p95.toFixed(3)}ms`
);

assert.ok(
  year20.midnight < 5000,
  `20年跨日处理过慢: ${year20.midnight.toFixed(3)}ms`
);

console.log(
  "✅ 老化性能测试完成"
);
