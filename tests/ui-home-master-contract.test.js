import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const mobileApp =
  fs.readFileSync(
    new URL(
      "../client/mobile/MobileApp.js",
      import.meta.url
    ),
    "utf8"
  );

const homePage =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "mobile runtime renders the real playable bridge instead of a blank canvas",
  () => {
    assert.match(
      mobileApp,
      /createMobileGameController/
    );

    assert.match(
      mobileApp,
      /ensureStarterState/
    );

    assert.match(
      mobileApp,
      /data-game-action/
    );

    assert.match(
      homePage,
      /playable-bridge-v1/
    );

    assert.match(
      homePage,
      /data-coordinate-space="logical"/
    );

    for (
      const action
      of [
        "toggle-time",
        "speed",
        "toggle-restaurant",
        "purchase",
        "advance-hour",
        "save"
      ]
    ) {
      assert.ok(
        homePage.includes(
          `data-game-action="${action}"`
        ),
        action
      );
    }

    for (
      const label
      of [
        "可用资金",
        "今日营业额",
        "采购与库存",
        "营业菜单",
        "最近日结"
      ]
    ) {
      assert.ok(
        homePage.includes(
          label
        ),
        label
      );
    }

    assert.doesNotMatch(
      homePage,
      /¥ 86,240|第28天|12:15|★ 4\.7/
    );
  }
);


test(
  "playable bridge stays inside one non-scrolling logical screen",
  () => {
    for (
      const marker
      of [
        "--screen-scale",
        "--logical-width",
        "--logical-height",
        "--safe-top",
        ".screen-stage",
        ".home-editor-canvas",
        ".playtest-dashboard",
        ".playtest-kpi-grid",
        ".playtest-stock-list"
      ]
    ) {
      assert.ok(
        css.includes(
          marker
        ),
        marker
      );
    }

    assert.match(
      css,
      /\.playtest-dashboard\s*\{[\s\S]*?overflow:\s*hidden/
    );

    assert.doesNotMatch(
      css,
      /\.playtest-dashboard\s*\{[\s\S]*?overflow-y:\s*(auto|scroll)/
    );
  }
);


test(
  "editor keeps responsive logical coordinate support",
  () => {
    assert.match(
      toolkit,
      /city-restaurant-ui-dev-overrides\.v6/
    );

    assert.match(
      toolkit,
      /city-restaurant-ui-dev-project\.v6/
    );

    assert.match(
      toolkit,
      /component-layout-v7-typed-responsive-space/
    );

    assert.match(
      toolkit,
      /function uiScale\(\)/
    );

    assert.match(
      toolkit,
      /function logicalRect\(node\)/
    );
  }
);
