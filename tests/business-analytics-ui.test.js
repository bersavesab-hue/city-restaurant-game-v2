import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem
} = app.systems;

const {
  entitySystem
} = app.core;

const {
  businessAnalyticsPageSystem
} = app.ui;

test(
  "经营数据中心汇总营收利润菜品员工采购库存和预警",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "经营数据测试店"
      });

    entitySystem.create(
      "daily_settlement",
      {
        restaurantId:
          restaurant.id,

        day: 1,

        orders: 20,

        revenue: 2000,

        ingredientCost: 600,

        payrollDue: 300,

        operatingProfit: 800
      }
    );

    entitySystem.create(
      "employee",
      {
        restaurantId:
          restaurant.id,

        name:
          "数据测试员工",

        roleId:
          "server",

        status:
          "active",

        fatigue: 82,

        mood: 60,

        loyalty: 35,

        turnoverRiskLevel:
          "high",

        salaryArrears: 0
      }
    );

    entitySystem.create(
      "supplier_payable",
      {
        restaurantId:
          restaurant.id,

        supplierId:
          "analytics_supplier",

        ingredientId:
          "analytics_ingredient",

        amount: 500,

        status:
          "overdue",

        dueDay: 1
      }
    );

    const page =
      businessAnalyticsPageSystem
        .getPage(
          restaurant.id,
          {
            period: "week"
          }
        );

    assert.equal(
      page.pageId,
      "analytics"
    );

    assert.equal(
      page.finance.revenue,
      2000
    );

    assert.equal(
      page.finance.profit,
      800
    );

    assert.equal(
      page.finance.orders,
      20
    );

    assert.equal(
      page.employees.total,
      1
    );

    assert.equal(
      page.employees.highFatigue,
      1
    );

    assert.equal(
      page.employees.turnoverWarning,
      1
    );

    assert.equal(
      page.supply.openPayablesAmount,
      500
    );

    assert.equal(
      page.supply.overdueAmount,
      500
    );

    assert.ok(
      page.alerts.some(
        alert =>
          alert.id ===
          "employee_fatigue"
      )
    );

    assert.ok(
      page.alerts.some(
        alert =>
          alert.id ===
          "supplier_overdue"
      )
    );

    assert.ok(
      Array.isArray(
        page.trend
      )
    );

    assert.ok(
      Array.isArray(
        page.decisions
      )
    );

    assert.equal(
      page.periods.length,
      3
    );
  }
);
