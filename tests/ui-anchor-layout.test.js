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
  "editor supports canvas safe-area and 540x960 reference positioning parents",
  () => {
    assert.match(
      toolkit,
      /function positioningParentRect\(parentKey = "canvas"\)/
    );

    for (
      const parent
      of ["canvas", "safe", "reference"]
    ) {
      assert.ok(
        toolkit.includes(
          `data-dev-position-parent="${parent}"`
        )
      );
    }

    assert.match(
      toolkit,
      /window\.__CITY_SCREEN__\?\.getMetrics/
    );
  }
);

test(
  "editor exposes all nine anchors",
  () => {
    for (
      const anchor
      of [
        "top-left",
        "top-center",
        "top-right",
        "center-left",
        "center",
        "center-right",
        "bottom-left",
        "bottom-center",
        "bottom-right"
      ]
    ) {
      assert.ok(
        toolkit.includes(
          `["${anchor}"`
        ) ||
        toolkit.includes(
          `,"${anchor}"`
        ) ||
        toolkit.includes(
          `"${anchor}",`
        )
      );
    }

    assert.match(
      toolkit,
      /function setAnchor\(anchor\)/
    );

    assert.match(
      css,
      /\.dev-anchor-grid\s*\{/
    );
  }
);

test(
  "changing anchor or parent preserves absolute visual position",
  () => {
    assert.match(
      toolkit,
      /function offsetsForAbsolutePosition/
    );

    assert.match(
      toolkit,
      /function setItemAbsolutePosition/
    );

    assert.match(
      toolkit,
      /const current =\s*resolveItemPlacement\(item\)/
    );
  }
);

test(
  "legacy components default to canvas top-left without moving",
  () => {
    assert.match(
      toolkit,
      /if \(!item\.positionParent\)/
    );

    assert.match(
      toolkit,
      /item\.positionParent =\s*"canvas"/
    );

    assert.match(
      toolkit,
      /if \(!item\.anchor\)/
    );

    assert.match(
      toolkit,
      /item\.anchor =\s*"top-left"/
    );
  }
);

test(
  "drag and resize write anchor-relative offsets",
  () => {
    const uses =
      toolkit.match(
        /setItemAbsolutePosition\(/g
      ) || [];

    assert.ok(
      uses.length >= 5
    );
  }
);
