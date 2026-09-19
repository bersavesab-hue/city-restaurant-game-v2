import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { timeSystem } from "../src/core/TimeSystem.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { supplierSystem } from "../src/systems/SupplierSystem.js";
import { procurementSystem } from "../src/systems/ProcurementSystem.js";
import { inventorySystem } from "../src/systems/InventorySystem.js";

test("采购完整链路：报价 -> 扣款 -> 到货 -> 入库", () => {
  gameState.reset();

  ingredientCatalogSystem.load(
    [
      {
        id: "ingredient_test_pork",
        name: "测试猪肉",
        category: "meat",
        unit: "kg",
        storageType: "chilled",
        basePurchasePrice: 2000,
        shelfLifeDays: 3,
        edibleRate: 0.9,
        baseWasteRate: 0.05
      }
    ],
    {
      overwrite: true
    }
  );

  const restaurant =
    restaurantSystem.create({
      name: "测试餐厅"
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  const supplier =
    supplierSystem.create({
      name: "测试供应商",
      relationship: 50,
      reliability: 100
    });

  supplierSystem.addOffer(
    supplier.id,
    "ingredient_test_pork",
    {
      priceMultiplier: 1,
      priceVolatility: 0,
      qualityMin: 2,
      qualityMax: 2,
      deliveryMinutes: 60,
      capacityPerDay: 100,
      minimumOrder: 1
    }
  );

  const balanceBefore =
    financeSystem.getBalance(
      restaurant.id
    );

  const order =
    procurementSystem.purchase({
      restaurantId:
        restaurant.id,
      supplierId:
        supplier.id,
      ingredientId:
        "ingredient_test_pork",
      quantity: 10
    });

  assert.equal(
    order.status,
    "pending"
  );

  assert.equal(
    financeSystem.getBalance(
      restaurant.id
    ),
    balanceBefore -
      order.totalPrice
  );

  assert.equal(
    inventorySystem
      .getAvailableQuantity(
        restaurant.id,
        "ingredient_test_pork"
      ),
    0
  );

  timeSystem.advance(60);

  const delivered =
    procurementSystem.get(
      order.id
    );

  assert.equal(
    delivered.status,
    "delivered"
  );

  assert.ok(
    delivered.inventoryBatchId
  );

  assert.equal(
    inventorySystem
      .getAvailableQuantity(
        restaurant.id,
        "ingredient_test_pork"
      ),
    10
  );
});
