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
  "门店一级页管理按钮携带真实页面目标",
  () => {
    const view =
      new OperatingCommandCenterView();

    const html =
      view.renderMarkup({
        storePortfolio: {
          totals: {
            revenue: 0,
            profit: 0,
            guests: 0,
            satisfaction: 0
          },
          cards: [],
          filterCounts: {
            all: 0,
            open: 0,
            preparing: 0,
            abnormal: 0
          },
          capacity: 0,
          canCreateBranch: false,
          todos: []
        },
        navigation: []
      });

    for (const target of [
      "renovation",
      "equipment-management",
      "lease",
      "opening-setup"
    ]) {
      assert.match(
        html,
        new RegExp(
          'data-page-target="' +
          target +
          '"'
        )
      );
    }
  }
);
