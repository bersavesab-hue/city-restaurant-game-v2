import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test(
  "homepage fixed chrome exposes the six top status slots",
  () => {
    for (
      const key
      of [
        "home-status-date",
        "home-status-time",
        "home-status-money",
        "home-status-rating",
        "home-status-level",
        "home-status-settings"
      ]
    ) {
      assert.ok(
        homePage.includes(
          `data-ui-component="${key}"`
        ),
        key
      );
    }
  }
);

test(
  "homepage fixed chrome exposes exactly five primary navigation slots",
  () => {
    for (
      const label
      of [
        "门店",
        "经营",
        "研发",
        "员工",
        "更多"
      ]
    ) {
      assert.ok(
        homePage.includes(
          `<strong>${label}</strong>`
        ),
        label
      );
    }

    assert.equal(
      (
        homePage.match(
          /class="home-nav-item(?: is-active)?"/g
        ) || []
      ).length,
      5
    );
  }
);

test(
  "fixed chrome stays inside top and bottom safe areas",
  () => {
    assert.match(
      css,
      /\.home-top-chrome\s*\{[\s\S]*?var\(--safe-top\)/
    );

    assert.match(
      css,
      /\.home-bottom-chrome\s*\{[\s\S]*?var\(--safe-bottom\)/
    );

    assert.match(
      css,
      /\.home-content-reserve\s*\{/
    );
  }
);

test(
  "step two remains static and does not bind gameplay data or routes",
  () => {
    assert.doesNotMatch(
      homePage,
      /data-bind=/
    );

    assert.doesNotMatch(
      homePage,
      /data-nav=/
    );

    assert.doesNotMatch(
      homePage,
      /<button/
    );
  }
);
