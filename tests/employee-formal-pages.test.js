import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  employeeSystem
} from "../src/systems/EmployeeSystem.js";

import {
  employeeRecruitmentPageSystem
} from "../src/ui/pages/employee-recruitment/EmployeeRecruitmentPageSystem.js";

import {
  employeeDetailPageSystem
} from "../src/ui/pages/employee-detail/EmployeeDetailPageSystem.js";

import {
  employeeTrainingPageSystem
} from "../src/ui/pages/employee-training/EmployeeTrainingPageSystem.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";


function createRestaurant() {
  gameState.reset();

  const restaurant =
    restaurantSystem.create({
      name:
        "员工正式页测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  return restaurant;
}


test(
  "员工招聘详情培训均进入正式运行时",
  () => {
    for (
      const id
      of [
        "employee_recruitment",
        "employee_detail",
        "employee_training"
      ]
    ) {
      assert.equal(
        formalPageRuntime.has(
          id
        ),
        true,
        id
      );
    }
  }
);


test(
  "招聘页使用真实人才池并可完成招聘",
  () => {
    const restaurant =
      createRestaurant();

    const page =
      employeeRecruitmentPageSystem
        .getPage(
          restaurant.id
        );

    assert.ok(
      page.candidates.length >
      0
    );

    const candidate =
      page.candidates[0];

    const employee =
      employeeRecruitmentPageSystem
        .hireCandidate(
          restaurant.id,
          candidate.id
        );

    assert.equal(
      employee.restaurantId,
      restaurant.id
    );

    assert.equal(
      employee.candidateId,
      candidate.id
    );
  }
);


test(
  "员工详情与培训页读取同一真实员工状态",
  () => {
    const restaurant =
      createRestaurant();

    const employee =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,

        name:
          "培训测试员",

        roleId:
          "chef"
      });

    const detail =
      employeeDetailPageSystem
        .getPage(
          restaurant.id,
          {
            employeeId:
              employee.id
          }
        );

    assert.equal(
      detail.employee.id,
      employee.id
    );

    const training =
      employeeTrainingPageSystem
        .getPage(
          restaurant.id,
          {
            employeeId:
              employee.id
          }
        );

    assert.equal(
      training.employee.id,
      employee.id
    );

    const program =
      training.programs
        .find(
          item =>
            item.id ===
            "basic_training"
        );

    assert.ok(
      program
    );

    const result =
      employeeTrainingPageSystem
        .train(
          restaurant.id,
          employee.id,
          program.id
        );

    assert.equal(
      result.employee
        .trainingCount,
      1
    );
  }
);
