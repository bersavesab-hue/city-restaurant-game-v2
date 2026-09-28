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

test(
  "top HUD preset uses final 540 logical layout sizes",
  () => {
    assert.match(
      toolkit,
      /function autoLayoutTopHud\(\)/
    );

    for (
      const token
      of [
        "width: 104",
        "width: 91",
        "width: 122",
        "width: 74",
        "width: 98",
        "width: 30",
        "height: 64"
      ]
    ) {
      assert.ok(
        toolkit.includes(token)
      );
    }
  }
);

test(
  "top HUD preset anchors against safe area and fills imported art",
  () => {
    assert.match(
      toolkit,
      /item\.positionParent =\s*"safe"/
    );

    assert.match(
      toolkit,
      /item\.objectFit =\s*"fill"/
    );

    assert.match(
      toolkit,
      /data-dev-auto-top-hud/
    );
  }
);
