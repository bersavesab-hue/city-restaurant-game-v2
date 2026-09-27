import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app =
  fs.readFileSync(
    new URL(
      "../client/mobile/MobileApp.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "soft keyboard resize does not rebuild the dev editor",
  () => {
    assert.match(
      app,
      /editingDevField/
    );

    assert.match(
      app,
      /active\.closest\(\s*"#ui-dev-root"\s*\)/
    );

    assert.match(
      app,
      /if \(editingDevField\) \{\s*return;/
    );
  }
);
