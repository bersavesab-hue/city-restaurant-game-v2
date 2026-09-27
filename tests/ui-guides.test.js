import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/devtools.css",
      import.meta.url
    ),
    "utf8"
  );

test(
  "guide overlay shows real screen reference frame center and safe areas",
  () => {
    for (
      const marker
      of [
        "data-dev-guide-screen",
        "data-dev-guide-reference",
        "data-dev-guide-center-v",
        "data-dev-guide-center-h",
        "data-dev-guide-safe-top",
        "data-dev-guide-safe-bottom"
      ]
    ) {
      assert.ok(
        toolkit.includes(marker),
        marker
      );
    }

    assert.match(
      toolkit,
      /window\.__CITY_SCREEN__\?\.getMetrics/
    );

    assert.match(
      toolkit,
      /referenceLeft/
    );

    assert.match(
      toolkit,
      /safeTop/
    );

    assert.match(
      toolkit,
      /safeBottom/
    );
  }
);

test(
  "guides do not intercept editing gestures",
  () => {
    assert.match(
      css,
      /\.ui-dev-guides\s*\{[\s\S]*?pointer-events:\s*none/
    );
  }
);
