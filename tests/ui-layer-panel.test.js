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
  "layer manager persists lock and hidden state on project components",
  () => {
    assert.match(
      toolkit,
      /item\.locked\s*=/
    );

    assert.match(
      toolkit,
      /item\.hidden\s*=/
    );

    assert.match(
      toolkit,
      /wrapper\.dataset\.devLocked/
    );

    assert.match(
      toolkit,
      /wrapper\.dataset\.devHidden/
    );

    assert.match(
      toolkit,
      /wrapper\.style\.pointerEvents/
    );

    assert.match(
      toolkit,
      /wrapper\.style\.display/
    );
  }
);

test(
  "locked components cannot be dragged resized aligned or precisely moved",
  () => {
    assert.match(
      toolkit,
      /info\.locked/
    );

    assert.match(
      toolkit,
      /组件已锁定/
    );

    assert.match(
      css,
      /\.dev-precise-grid input:disabled/
    );
  }
);

test(
  "layer manager has a compact scrollable list",
  () => {
    assert.match(
      css,
      /\.dev-layer-list\s*\{/
    );

    assert.match(
      css,
      /max-height:\s*188px/
    );
  }
);
