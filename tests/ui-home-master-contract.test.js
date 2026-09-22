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

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

test(
  "home master keeps the approved reference-inspired module structure",
  () => {
    for (
      const marker
      of [
        "home-top-hud",
        "home-hero-scene",
        "home-metrics",
        "home-opportunity",
        "home-growth-and-dialogue",
        "home-district-and-schedule"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(
          `data-ui-component="${marker}"`
        )
      );
    }

    assert.doesNotMatch(
      mobileApp,
      /store-heading/
    );

    assert.doesNotMatch(
      mobileApp,
      /speed-bar/
    );
  }
);

test(
  "home master CSS contains one responsive grid implementation",
  () => {
    assert.match(
      css,
      /\.home-hud\s*\{/
    );

    assert.match(
      css,
      /\.home-metric-grid\s*\{/
    );

    assert.match(
      css,
      /\.home-dual-grid\s*\{/
    );

    assert.match(
      css,
      /\.home-opportunity\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.store-heading\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.speed-bar\s*\{/
    );
  }
);
