import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { supplierSystem } from "../src/systems/SupplierSystem.js";
import { procurementSystem } from "../src/systems/ProcurementSystem.js";
import { autoProcurementSystem } from "../src/systems/AutoProcurementSystem.js";

test("安全库存自动补货且不会重复下单", () => {
  gameState.reset();

  ingredientCatalogSystem.load([{
    id: "restock_rice",
    name: "补货测试米",
    category: "grain",
    unit: "kg",
    baseQuality: 3,
    storageType: "dry",
    basePurchasePrice: 100,
    shelfLifeDays: 30,
    edibleRate: 1,
    baseWasteRate: 0
  }], { overwrite: true });

  const restaurant =
    restaurantSystem.create({
      name: "自动补货测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  const supplier =
    supplierSystem.create({
      name: "自动补货供应商",
      reliability: 100
    });

  supplierSystem.addOffer(
    supplier.id,
    "restock_rice",
    {
      priceVolatility: 0,
      deliveryMinutes: 60,
      capacityPerDay: 20,
      minimumOrder: 1
    }
  );

  autoProcurementSystem.setPolicy({
    restaurantId: restaurant.id,
    ingredientId: "restock_rice",
    supplierId: supplier.id,
    minimumQuantity: 2,
    targetQuantity: 10
  });

  autoProcurementSystem
    .processRestaurant(
      restaurant.id
    );

  assert.equal(
    procurementSystem.getPendingQuantity(
      restaurant.id,
      "restock_rice"
    ),
    10
  );

  autoProcurementSystem
    .processRestaurant(
      restaurant.id
    );

  assert.equal(
    procurementSystem.getPendingQuantity(
      restaurant.id,
      "restock_rice"
    ),
    10
  );
});
