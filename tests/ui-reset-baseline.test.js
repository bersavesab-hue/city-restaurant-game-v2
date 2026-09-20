import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test(
  "0.9.0 UI归零基线不允许旧表现层回流",
  () => {
    assert.equal(
      fs.existsSync("src/ui"),
      false
    );

    assert.equal(
      fs.existsSync("assets"),
      false
    );

    assert.equal(
      fs.existsSync(
        "src/data/ingredientAtlas.js"
      ),
      false
    );

    assert.equal(
      fs.existsSync(
        "src/data/ingredientVisuals.js"
      ),
      false
    );

    const main =
      fs.readFileSync(
        "src/main.js",
        "utf8"
      );

    const build =
      fs.readFileSync(
        "scripts/build-android-js.mjs",
        "utf8"
      );

    assert.doesNotMatch(
      main,
      /\.\/ui\//
    );

    assert.doesNotMatch(
      main,
      /\bapp\.ui\b|\bui:\s*\{/
    );

    assert.match(
      build,
      /src\/runtime\/AndroidBootstrap\.js/
    );

    assert.doesNotMatch(
      build,
      /AndroidPlaytestEntry|assets\/images|game\.css/
    );
  }
);
