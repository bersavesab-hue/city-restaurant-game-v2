import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../src/ui/runtime/AndroidPlaytestEntry.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "Android运行时使用统一正式页面运行器",
  () => {
    assert.match(
      source,
      /formalPageRuntime\.has/
    );

    assert.match(
      source,
      /formalPageRuntime\.mount/
    );

    assert.equal(
      source.includes(
        '"restaurant_home"'
      ),
      false
    );
  }
);


test(
  "Android运行时只保留一条正式页面点击导航链",
  () => {
    assert.equal(
      source.split(
        "/* data-page-navigation-listener */"
      ).length - 1,
      1
    );

    assert.match(
      source,
      /element\.dataset\s*\n\s*\.restaurantId\s*\?\?\s*\n\s*restaurantId/
    );
  }
);
