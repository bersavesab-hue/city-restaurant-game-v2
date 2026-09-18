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
