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
  "top HUD size and top offset are editable and persisted locally",
  () => {
    assert.match(
      toolkit,
      /function topHudPresetSettings\(\)/
    );

    assert.match(
      toolkit,
      /uiPresets/
    );

    assert.match(
      toolkit,
      /data-dev-hud-preset="height"/
    );

    assert.match(
      toolkit,
      /data-dev-hud-preset="top"/
    );
  }
);

test(
  "HUD size presets can be applied without downloading another build",
  () => {
    for (
      const size
      of ["48", "56", "64", "72"]
    ) {
      assert.ok(
        toolkit.includes(
          `data-dev-hud-size="${size}"`
        )
      );
    }

    assert.match(
      toolkit,
      /function applyTopHudSizePreset/
    );

    assert.match(
      toolkit,
      /autoLayoutTopHud\(false\)/
    );
  }
);

test(
  "HUD local size controls are mobile styled",
  () => {
    assert.match(
      css,
      /\.dev-hud-size-fields\s*\{/
    );

    assert.match(
      css,
      /\.dev-hud-size-presets\s*\{/
    );
  }
);
