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
  "uploaded components use explicit semantic UI types",
  () => {
    for (
      const type
      of [
        "generic",
        "top_date",
        "top_time",
        "top_money",
        "top_rating",
        "top_level",
        "top_settings",
        "background"
      ]
    ) {
      assert.ok(
        toolkit.includes(
          `["${type}"`
        )
      );
    }

    assert.match(
      toolkit,
      /data-dev-upload-type/
    );

    assert.match(
      toolkit,
      /data-dev-ui-type/
    );
  }
);

test(
  "top HUD layout prefers uiType and validates missing or duplicate components",
  () => {
    assert.match(
      toolkit,
      /function inspectTopHud\(\)/
    );

    assert.match(
      toolkit,
      /item\.uiType ===\s*uiType/
    );

    assert.match(
      toolkit,
      /duplicates\.push/
    );

    assert.match(
      toolkit,
      /missing\.push/
    );
  }
);

test(
  "old components receive a compatible inferred uiType",
  () => {
    assert.match(
      toolkit,
      /if \(!item\.uiType\)/
    );

    assert.match(
      toolkit,
      /inferUiTypeFromName/
    );
  }
);

test(
  "type picker and type selector are styled for mobile editor",
  () => {
    assert.match(
      css,
      /\.dev-upload-type-picker\s*\{/
    );

    assert.match(
      css,
      /\.dev-type-field\s*\{/
    );
  }
);
