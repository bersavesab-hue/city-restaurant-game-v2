import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { operatingScheduleSystem } from "../src/systems/OperatingScheduleSystem.js";
import { dailySettlementSystem } from "../src/systems/DailySettlementSystem.js";

test(
  "经营循环基础：排班 + 员工 + 日结算",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "经营循环测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name: "测试厨师",
      roleId: "chef"
    });

    operatingScheduleSystem.create({
      restaurantId:
        restaurant.id,
      openHour: 9,
      closeHour: 22
    });

    operatingScheduleSystem.processHour(
      restaurant.id,
      9
    );

    assert.equal(
      restaurantSystem.isOpen(
        restaurant.id
      ),
      true
    );

    operatingScheduleSystem.processHour(
      restaurant.id,
      22
    );

    assert.equal(
      restaurantSystem.isOpen(
        restaurant.id
      ),
      false
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const settlement =
      dailySettlementSystem.settle(
        restaurant.id
      );

    assert.equal(
      settlement.restaurantId,
      restaurant.id
    );

    assert.ok(
      settlement.payroll > 0
    );

    assert.ok(
      financeSystem.getBalance(
        restaurant.id
      ) < before
    );
  }
);
