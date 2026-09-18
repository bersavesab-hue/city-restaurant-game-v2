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
  "经营入口只展示五个核心经营分类",
  () => {
    const page =
      operationsHubPageSystem
        .getPage();

    assert.equal(
      page.entries.length,
      5
    );

    assert.deepEqual(
      page.entries.map(
        item =>
          item.title
      ),
      [
        "菜品与菜单",
        "供应链",
        "客流与渠道",
        "经营分析",
        "财务"
      ]
    );

    const view =
      new OperationsHubView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /菜品与菜单/
    );

    assert.match(
      html,
      /供应链/
    );

    assert.match(
      html,
      /客流与渠道/
    );

    assert.match(
      html,
      /经营分析/
    );

    assert.match(
      html,
      /财务/
    );

    assert.match(
      html,
      /data-page-target="menu-optimization"/
    );

    assert.match(
      html,
      /data-page-target="capacity"/
    );
  }
);


test(
  "点击经营主导航默认进入经营首页",
  () => {
    gameplayNavigationSystem
      .reset();

    assert.ok(
      pageRegistry.has(
        "operations-home"
      )
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "operations"
        ),
      "operations-home"
    );

    const result =
      gameplayNavigationSystem
        .navigate(
          "operations"
        );

    assert.equal(
      result.pageId,
      "operations-home"
    );
  }
);
