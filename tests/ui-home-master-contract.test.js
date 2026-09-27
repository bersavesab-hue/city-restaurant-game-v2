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
  "mobile runtime starts with responsive background and fixed static chrome",
  () => {
    assert.match(
      mobileApp,
      /installScreenAdapter/
    );

    assert.match(
      mobileApp,
      /renderHomePage/
    );

    assert.doesNotMatch(
      mobileApp,
      /renderBusiness|renderResearch|renderStaff|renderMore|bottom-nav|NAV_ITEMS/
    );

    assert.match(
      homePage,
      /background-master-v1/
    );

    assert.match(
      homePage,
      /data-coordinate-space="logical"/
    );

    assert.match(
      homePage,
      /home-top-chrome/
    );

    assert.match(
      homePage,
      /home-bottom-chrome/
    );

    assert.doesNotMatch(
      homePage,
      /<button|data-bind=|data-nav=/
    );
  }
);

test(
  "runtime CSS contains screen foundation and fixed homepage chrome",
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
        ".ui-anchor-top",
        ".ui-anchor-bottom",
        ".home-top-chrome",
        ".home-bottom-chrome",
        ".home-content-reserve"
      ]
    ) {
      assert.ok(
        css.includes(marker),
        marker
      );
    }

    assert.doesNotMatch(
      css,
      /segment-tabs|list-card|research-grid|staff-list|section-header|bottom-sheet/
    );
  }
);

test(
  "editor uses fresh responsive storage and logical coordinate scaling",
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
      /component-layout-v6-responsive-logical-space/
    );

    assert.match(
      toolkit,
      /function uiScale\(\)/
    );

    assert.match(
      toolkit,
      /function logicalRect\(node\)/
    );

    assert.match(
      toolkit,
      /uiScale\(\)/
    );
  }
);
