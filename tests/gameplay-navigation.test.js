import test from "node:test";
import assert from "node:assert/strict";

import {
  pageRegistry
} from "../src/ui/registry/PageRegistry.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";

import {
  OperatingCommandCenterView
} from "../src/ui/pages/command-center/OperatingCommandCenterView.js";


test(
  "五个一级入口使用唯一正式ID且常用动作解析到真实功能页面",
  () => {
    gameplayNavigationSystem
      .reset();

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "restaurant"
        ),
      "restaurant"
    );

    assert.equal(
      gameplayNavigationSystem
        .resolveActionTarget(
          "employees"
        ),
      "employees"
    );

    assert.equal(
      gameplayNavigationSystem
        .resolveActionTarget(
          "supply"
        ),
      "supply"
    );

    assert.equal(
      gameplayNavigationSystem
        .resolveActionTarget(
          "menu-optimization"
        ),
      "menu-optimization"
    );

    const nav =
      gameplayNavigationSystem
        .navigate(
          "restaurant"
        );

    assert.equal(
      nav.pageId,
      "restaurant"
    );

    assert.equal(
      gameplayNavigationSystem
        .getCurrentPage()
        .id,
      "restaurant"
    );

    assert.ok(
      pageRegistry.has(
        "capacity"
      )
    );

    assert.ok(
      pageRegistry.has(
        "reputation"
      )
    );

    assert.ok(
      pageRegistry.has(
        "channels"
      )
    );

    const mainNavigation =
      gameplayNavigationSystem
        .getMainNavigation();

    assert.equal(
      mainNavigation.length,
      5
    );

    assert.equal(
      mainNavigation
        .find(
          item =>
            item.id ===
            "restaurant"
        )
        .active,
      true
    );
  }
);


test(
  "经营总控的去处理按钮携带真实页面目标",
  () => {
    const view =
      new OperatingCommandCenterView();

    const html =
      view.renderMarkup({
        day: 1,

        restaurant: {
          name:
            "导航测试店",

          reviewScore: 4
        },

        sales: {
          revenue: 0,
          profit: 0,
          orderCount: 0,
          channels: []
        },

        finance: {
          balance: 10000
        },

        capacity: {
          arrivals: 0,
          served: 0,
          abandonmentRate: 0,
          lostRevenue: 0
        },

        menu: {
          counts: {
            star: 0,
            cash_cow: 0,
            puzzle: 0,
            dog: 0
          }
        },

        inventory: {
          lowStockCount: 1,
          outOfStockCount: 0
        },

        workforce: {
          availableEmployees: 2,
          exhaustedEmployees: []
        },

        priorities: [
          {
            severity:
              "high",

            title:
              "库存即将不足",

            description:
              "1种食材库存偏低",

            target:
              "supply"
          }
        ]
      });

    assert.match(
      html,
      /data-page-target="supply"/
    );

    assert.match(
      html,
      /去处理/
    );
  }
);
