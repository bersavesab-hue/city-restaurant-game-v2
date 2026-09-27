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
  "mobile DEV tool is a non-blocking bottom sheet with long-press entry",
  () => {
    assert.match(
      toolkit,
      /setTimeout\(\(\) => \{[\s\S]*?togglePanel\(\)[\s\S]*?\}, 650\)/
    );

    assert.match(
      toolkit,
      /data-dev-dock/
    );

    assert.match(
      toolkit,
      /function undo\(\)/
    );

    assert.match(
      toolkit,
      /function redo\(\)/
    );

    assert.match(
      css,
      /\.ui-dev-sheet\s*\{/
    );

    assert.match(
      css,
      /\.ui-dev-sheet\.is-top\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.ui-dev-panel\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.ui-dev-fab\s*\{/
    );
  }
);

test(
  "DEV reset preserves unrelated game inline styles",
  () => {
    assert.match(
      toolkit,
      /function removeOverrideStyles\(overrides\)/
    );

    assert.doesNotMatch(
      toolkit,
      /removeAttribute\("style"\)/
    );
  }
);

test(
  "DEV editor exposes direct X Y W H Z numeric controls for uploaded components",
  () => {
    for (const property of ["x", "y", "width", "height", "zIndex"]) {
      assert.match(toolkit, new RegExp(`data-dev-exact="${property}"`));
    }

    assert.match(toolkit, /function setExactValue\(property, rawValue\)/);
    assert.match(toolkit, /逻辑坐标，不受手机分辨率影响/);
    assert.match(toolkit, /图层 Z=/);
  }
);


test(
  "precise XYWHZ inputs stay mounted while the mobile keyboard is open",
  () => {
    assert.doesNotMatch(
      toolkit,
      /setExactValue\(property, rawValue\)[\s\S]*?renderSelectionChrome\(\);\s*renderPanel\(\);/
    );

    assert.match(
      toolkit,
      /\[data-dev-exact\][\s\S]*?pointerdown[\s\S]*?stopPropagation/
    );
  }
);
