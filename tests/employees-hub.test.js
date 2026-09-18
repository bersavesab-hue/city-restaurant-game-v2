import test from "node:test";
import assert from "node:assert/strict";

import {
  employeesHubPageSystem
} from "../src/ui/pages/employees-hub/EmployeesHubPageSystem.js";

import {
  EmployeesHubView
} from "../src/ui/pages/employees-hub/EmployeesHubView.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";

import {
  pageRegistry
} from "../src/ui/registry/PageRegistry.js";


test(
  "员工入口只保留总览招聘排班和培训晋升三个入口",
  () => {
    const page =
      employeesHubPageSystem
        .getPage();

    assert.equal(
      page.entries.length,
      3
    );

    assert.deepEqual(
      page.entries.map(
        item =>
          item.title
      ),
      [
        "员工总览",
        "招聘与排班",
        "培训晋升"
      ]
    );

    const view =
      new EmployeesHubView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /员工总览/
    );

    assert.match(
      html,
      /招聘与排班/
    );

    assert.match(
      html,
      /培训晋升/
    );

    assert.match(
      html,
      /data-page-target="employee_roster"/
    );

    assert.match(
      html,
      /data-page-target="workforce-capacity"/
    );

    assert.match(
      html,
      /data-page-target="employee_training"/
    );

    assert.match(
      html,
      /data-page-target="employee_promotion"/
    );
  }
);


test(
  "点击员工主导航默认进入员工首页",
  () => {
    gameplayNavigationSystem
      .reset();

    assert.ok(
      pageRegistry.has(
        "employee_roster"
      )
    );

    assert.ok(
      pageRegistry.has(
        "workforce-capacity"
      )
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "employees"
        ),
      "employee_roster"
    );

    const result =
      gameplayNavigationSystem
        .navigate(
          "employees"
        );

    assert.equal(
      result.pageId,
      "employee_roster"
    );
  }
);
