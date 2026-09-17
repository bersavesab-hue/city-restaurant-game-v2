import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { employeeSystem } from "../src/systems/EmployeeSystem.js";
import { employeeWorkSystem } from "../src/systems/EmployeeWorkSystem.js";

test(
  "员工参与经营：厨师技能 + 服务容量 + 疲劳 + 恢复",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "员工循环测试店"
      });

    assert.throws(
      () =>
        employeeWorkSystem
          .requireChef(
            restaurant.id
          ),
      /No available chef/
    );

    const chef =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name: "测试厨师",
        roleId: "chef"
      });

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name: "测试服务员",
      roleId: "server"
    });

    const selected =
      employeeWorkSystem
        .requireChef(
          restaurant.id
        );

    assert.equal(
      selected.employee.id,
      chef.id
    );

    assert.ok(
      selected.effectiveSkill >= 1
    );

    assert.ok(
      employeeWorkSystem
        .getServiceCapacity(
          restaurant.id
        ) >= 2
    );

    const before =
      employeeSystem.get(
        chef.id
      ).fatigue;

    employeeWorkSystem.recordWork(
      chef.id,
      60
    );

    const afterWork =
      employeeSystem.get(
        chef.id
      ).fatigue;

    assert.ok(
      afterWork > before
    );

    employeeWorkSystem.recoverHour(
      restaurant.id
    );

    assert.ok(
      employeeSystem.get(
        chef.id
      ).fatigue <
      afterWork
    );
  }
);
