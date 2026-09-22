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
