import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const homePage =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "home has one dedicated full-screen background master layer",
  () => {
    assert.match(
      homePage,
      /home-background-layer/
    );

    assert.match(
      homePage,
      /data-background-slot="home"/
    );

    assert.match(
      homePage,
      /background-master-v1/
    );

    assert.match(
      css,
      /\.home-background-layer\s*\{/
    );

    assert.match(
      css,
      /position:\s*absolute/
    );

    assert.match(
      css,
      /inset:\s*0/
    );
  }
);

test(
  "editor has an explicit background upload path",
  () => {
    assert.match(
      toolkit,
      /data-dev-upload-background/
    );

    assert.match(
      toolkit,
      /chooseImage\("background"\)/
    );

    assert.match(
      toolkit,
      /role:\s*background\s*\?\s*"background"/
    );

    assert.match(
      toolkit,
      /state\.project\.components\s*=\s*state\.project\.components\.filter/
    );

    assert.match(
      toolkit,
      /item\.role\s*===\s*"background"/
    );
  }
);
