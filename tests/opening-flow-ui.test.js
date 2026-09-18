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
  openingFlowSystem
} from "../src/systems/OpeningFlowSystem.js";

import {
  openingSetupPageSystem
} from "../src/ui/pages/opening/OpeningSetupPageSystem.js";

import {
  OpeningSetupView
} from "../src/ui/pages/opening/OpeningSetupView.js";


test(
  "新门店开店流程从真实选址签约开始",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "开店流程测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const status =
      openingFlowSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      status.canOpen,
      false
    );

    assert.equal(
      status.nextAction.id,
      "lease"
    );

    assert.equal(
      status.steps.length,
      9
    );

    const page =
      openingSetupPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new OpeningSetupView();

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "开店准备",
      "选址签约",
      "装修布局",
      "招聘员工",
      "设置菜单",
      "营业时间",
      "正式开业",
      "继续准备"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `开店流程缺少：${text}`
      );
    }
  }
);


test(
  "营业时间可以通过开店流程真实创建",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "营业时间测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    openingFlowSystem
      .configureSchedule(
        restaurant.id,
        {
          openHour: 9,
          closeHour: 22
        }
      );

    const status =
      openingFlowSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      status.schedule.openHour,
      9
    );

    assert.equal(
      status.schedule.closeHour,
      22
    );

    assert.equal(
      status.schedule.enabled,
      true
    );
  }
);
