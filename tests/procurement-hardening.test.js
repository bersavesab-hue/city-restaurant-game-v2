import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { ingredientCatalogSystem } from "../src/systems/IngredientCatalogSystem.js";
import { supplierSystem } from "../src/systems/SupplierSystem.js";
import { procurementSystem } from "../src/systems/ProcurementSystem.js";

function setup() {
  gameState.reset();

  ingredientCatalogSystem.load([{
    id: "hardening_rice",
    name: "测试大米",
    category: "grain",
    unit: "kg",
    storageType: "dry",
    basePurchasePrice: 100,
    shelfLifeDays: 30,
    edibleRate: 1,
    baseWasteRate: 0
  }], { overwrite: true });

  const restaurant = restaurantSystem.create({
    name: "采购加固测试店"
  });

  financeSystem.createAccount(
    restaurant.id,
    10000
  );

  const supplier = supplierSystem.create({
    name: "测试供应商",
    reliability: 100
  });

  supplierSystem.addOffer(
    supplier.id,
    "hardening_rice",
    {
      priceVolatility: 0,
      deliveryMinutes: 60,
      capacityPerDay: 10,
      minimumOrder: 1
    }
  );

  return { restaurant, supplier };
}

test("取消采购后原路恢复费用", () => {
  const { restaurant, supplier } = setup();

  const before =
    financeSystem.getBalance(restaurant.id);

  const order = procurementSystem.purchase({
    restaurantId: restaurant.id,
    supplierId: supplier.id,
    ingredientId: "hardening_rice",
    quantity: 5
  });

  assert.ok(
    financeSystem.getBalance(restaurant.id) < before
  );

  procurementSystem.cancel(order.id);

  assert.equal(
    financeSystem.getBalance(restaurant.id),
    before
  );
});

test("供应商每日容量不能被多笔订单绕过", () => {
  const { restaurant, supplier } = setup();

  procurementSystem.purchase({
    restaurantId: restaurant.id,
    supplierId: supplier.id,
    ingredientId: "hardening_rice",
    quantity: 6
  });

  assert.equal(
    procurementSystem.getRemainingDailyCapacity(
      supplier.id,
      "hardening_rice"
    ),
    4
  );

  assert.throws(
    () => procurementSystem.purchase({
      restaurantId: restaurant.id,
      supplierId: supplier.id,
      ingredientId: "hardening_rice",
      quantity: 5
    }),
    /Remaining daily supply capacity/
  );
});
