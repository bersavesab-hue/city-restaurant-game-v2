import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const openingFlowSource =
  fs.readFileSync(
    new URL(
      "../src/systems/OpeningFlowSystem.js",
      import.meta.url
    ),
    "utf8"
  );


const openingPageSource =
  fs.readFileSync(
    new URL(
      "../src/ui/pages/opening/OpeningSetupPageSystem.js",
      import.meta.url
    ),
    "utf8"
  );


const androidSource =
  fs.readFileSync(
    new URL(
      "../src/ui/runtime/AndroidPlaytestEntry.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "开业完成后的唯一终点是经营总控",
  () => {
    assert.match(
      openingFlowSource,
      /hasOpened[\s\S]*?"operating-command-center"/
    );


    assert.match(
      openingPageSource,
      /nextPage:\s*"operating-command-center"/
    );
  }
);


test(
  "Android启动时恢复实际开店阶段",
  () => {
    assert.match(
      androidSource,
      /navigate\(\s*"restaurant"\s*\);/
    );
  }
);
