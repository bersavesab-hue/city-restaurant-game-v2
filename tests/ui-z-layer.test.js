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
  "layer list reflects visual order for equal z values",
  () => {
    assert.match(
      toolkit,
      /if \(zDiff !== 0\)/
    );

    assert.match(
      toolkit,
      /order\.get\(b\.id\)/
    );

    assert.match(
      toolkit,
      /上方=画面前层/
    );
  }
);

test(
  "z field explains that z controls stacking only and warns on duplicates",
  () => {
    assert.match(
      toolkit,
      /Z 只控制前后覆盖，不会改变大小或位置/
    );

    assert.match(
      toolkit,
      /function sameZCount\(zIndex\)/
    );

    assert.match(
      toolkit,
      /同层时图层列表越靠上，画面越靠前/
    );
  }
);
