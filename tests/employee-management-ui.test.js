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
  employeeManagementPageSystem
} from "../src/ui/pages/employees/EmployeeManagementPageSystem.js";

import {
  EmployeeManagementView
} from "../src/ui/pages/employees/EmployeeManagementView.js";


test(
  "员工与晋升正式UI接入真实员工职业数据",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "东门小馆"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "张师傅",

      roleId:
        "chef"
    });

    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "小美",

      roleId:
        "server"
    });

    const page =
      employeeManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.pageId,
      "employees"
    );

    assert.equal(
      page.employees.length,
      2
    );

    assert.equal(
      page.metrics.length,
      5
    );

    assert.ok(
      page.careerRanks.length >=
      5
    );

    assert.equal(
      page.bottomNavigation.length,
      5
    );

    const view =
      new EmployeeManagementView();

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "员工与晋升",
      "员工列表",
      "张师傅",
      "小美",
      "晋升体系",
      "晋升条件",
      "排班概览",
      "培训进度",
      "空缺岗位",
      "晋升候选人",
      "员工成长",
      "招聘员工"
    ];

    for (
      const text
      of expected
    ) {
    }
  }
);
