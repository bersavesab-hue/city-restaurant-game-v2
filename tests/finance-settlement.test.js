import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { entitySystem } from "../src/core/EntitySystem.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { dailySettlementSystem } from "../src/systems/DailySettlementSystem.js";

test(
  "本金不计经营利润，日结算不可重复",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "财务测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name: "员工",
      roleId: "chef"
    });

    const initialSummary =
      financeSystem.getSummary(
        restaurant.id
      );

    assert.equal(
      initialSummary.lifetimeIncome,
      0
    );

    assert.equal(
      initialSummary.lifetimeProfit,
      0
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const first =
      dailySettlementSystem.settle(
        restaurant.id,
        1
      );

    const afterFirst =
      financeSystem.getBalance(
        restaurant.id
      );

    const second =
      dailySettlementSystem.settle(
        restaurant.id,
        1
      );

    const afterSecond =
      financeSystem.getBalance(
        restaurant.id
      );

    assert.equal(
      first.id,
      second.id
    );

    assert.equal(
      afterFirst,
      afterSecond
    );

    assert.ok(
      afterFirst < before
    );

    assert.equal(
      first.experienceGained,
      0
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).experience,
      0
    );

    assert.equal(
      entitySystem
        .list(
          "daily_settlement"
        ).filter(
          (item) =>
            item.restaurantId ===
            restaurant.id &&
            item.day === 1
        ).length,
      1
    );
  }
);

test(
  "资金不足时产生欠薪而不是假装已支付",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "欠薪测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      1
    );

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name: "高薪员工",
      roleId: "manager"
    });

    const settlement =
      dailySettlementSystem.settle(
        restaurant.id,
        1
      );

    assert.equal(
      settlement.payrollPaid,
      0
    );

    assert.ok(
      settlement.unpaidPayroll > 0
    );

    assert.equal(
      entitySystem
        .list(
          "payroll_arrear"
        ).length,
      1
    );
  }
);
