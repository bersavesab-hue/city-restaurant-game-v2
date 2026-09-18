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
  employeePromotionPageSystem
} from "../src/ui/pages/employee-promotion/EmployeePromotionPageSystem.js";

import {
  EmployeePromotionView
} from "../src/ui/pages/employee-promotion/EmployeePromotionView.js";


test(
  "晋升中心展示候选条件培训岗位缺口和晋升记录",
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
      employeePromotionPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.pageId,
      "employee_promotion"
    );

    assert.equal(
      page.candidates.length,
      2
    );

    assert.equal(
      page.metrics.length,
      4
    );

    assert.ok(
      page.vacancies.length >
      0
    );

    const view =
      new EmployeePromotionView();

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "晋升中心",
      "晋升候选员工",
      "张师傅",
      "小美",
      "晋升条件",
      "培训补足",
      "岗位空缺与编制需求",
      "晋升通报",
      "批量评估",
      "确认晋升"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `晋升页面缺少：${text}`
      );
    }
  }
);
