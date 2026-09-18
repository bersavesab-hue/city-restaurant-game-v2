import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem,
  supplierSystem,
  supplierTradingSystem,
  procurementSystem
} = app.systems;

const {
  supplyManagementPageSystem
} = app.ui;

test(
  "供应链支持供应商等级每日报价批量折扣账期库存风险和自动采购",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "supply_test_meat",
          name: "供应链测试肉",
          category: "meat",
          unit: "kg",
          storageType: "chilled",
          basePurchasePrice: 40,
          shelfLifeDays: 5,
          edibleRate: .9,
          baseWasteRate: .1
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      restaurantSystem.create({
        name: "供应链测试餐厅"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const supplier =
      supplierSystem.create({
        name: "战略食材供应商",
        relationship: 90,
        reliability: 95
      });

    supplierSystem.addOffer(
      supplier.id,
      "supply_test_meat",
      {
        priceMultiplier: 1,
        priceVolatility: .15,
        qualityMin: 3,
        qualityMax: 5,
        deliveryMinutes: 120,
        capacityPerDay: 100,
        minimumOrder: 5
      }
    );

    const profile =
      supplierTradingSystem
        .getProfile(
          supplier.id
        );

    assert.equal(
      profile.tier.id,
      "strategic"
    );

    assert.equal(
      profile.creditDays,
      30
    );

    const quoteA =
      supplierTradingSystem
        .getDailyQuote(
          supplier.id,
          "supply_test_meat",
          50
        );

    const quoteB =
      supplierTradingSystem
        .getDailyQuote(
          supplier.id,
          "supply_test_meat",
          50
        );

    assert.equal(
      quoteA.unitPrice,
      quoteB.unitPrice
    );

    assert.equal(
      quoteA.bulkDiscount,
      .04
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const order =
      supplyManagementPageSystem
        .purchase({
          restaurantId:
            restaurant.id,
          supplierId:
            supplier.id,
          ingredientId:
            "supply_test_meat",
          quantity: 10,
          useCredit: true
        });

    assert.equal(
      order.paymentMode,
      "credit"
    );

    assert.equal(
      order.creditDays,
      30
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before
    );

    const payables =
      procurementSystem
        .listPayables(
          restaurant.id
        );

    assert.equal(
      payables.length,
      1
    );

    assert.equal(
      payables[0].status,
      "open"
    );

    supplyManagementPageSystem
      .setAutoPolicy({
        restaurantId:
          restaurant.id,
        ingredientId:
          "supply_test_meat",
        supplierId:
          supplier.id,
        minimumQuantity: 5,
        targetQuantity: 20,
        enabled: true
      });

    const page =
      supplyManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.summary.supplierCount,
      1
    );

    assert.equal(
      page.summary.pendingOrders,
      1
    );

    assert.equal(
      page.policies.length,
      1
    );

    assert.equal(
      page.payables.length,
      1
    );

    const settlement =
      procurementSystem
        .settlePayables(
          restaurant.id,
          payables[0].dueDay
        );

    assert.equal(
      settlement.paid,
      1
    );

    assert.equal(
      procurementSystem
        .listPayables(
          restaurant.id
        )[0]
        .status,
      "paid"
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before -
      payables[0].amount
    );
  }
);
