import test from "node:test";
import assert from "node:assert/strict";

import {
  operationsHubPageSystem
} from "../src/ui/pages/operations-hub/OperationsHubPageSystem.js";

import {
  OperationsHubView
} from "../src/ui/pages/operations-hub/OperationsHubView.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";

import {
  pageRegistry
} from "../src/ui/registry/PageRegistry.js";


test(
  "经营入口使用确认版六个经营模块加排行榜和研发入口",
  () => {
    const page =
      operationsHubPageSystem
        .getPage();

    assert.equal(
      page.entries.length,
      8
    );

    assert.deepEqual(
      page.entries.map(
        item =>
          item.title
      ),
      [
        "菜品与菜单",
        "供应链与库存",
        "财务资金",
        "顾客与会员",
        "营销与渠道",
        "经营数据",
        "排行榜与荣誉",
        "研发菜品"
      ]
    );

    const view =
      new OperationsHubView();

    const html =
      view.renderMarkup(
        page
      );

    for (
      const text
      of [
        "经营中心",
        "今日营业额",
        "今日利润",
        "今日订单",
        "顾客满意度",
        "今日待办",
        "菜品与菜单",
        "供应链与库存",
        "财务资金",
        "顾客与会员",
        "营销与渠道",
        "经营数据",
        "排行榜与荣誉",
        "研发菜品"
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          text
        )
      );
    }

    assert.match(
      html,
      /rg-bottom-nav/
    );

    assert.equal(
      html.includes(
        "经营分析"
      ),
      false
    );

    assert.equal(
      html.includes(
        "市场与竞争"
      ),
      false
    );
  }
);


test(
  "点击经营主导航直接进入唯一经营首页",
  () => {
    gameplayNavigationSystem
      .reset();

    assert.ok(
      pageRegistry.has(
        "operations"
      )
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "operations"
        ),
      "operations"
    );

    const result =
      gameplayNavigationSystem
        .navigate(
          "operations"
        );

    assert.equal(
      result.pageId,
      "operations"
    );
  }
);
