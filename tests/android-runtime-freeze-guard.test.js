import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const androidSource =
  fs.readFileSync(
    "src/ui/runtime/AndroidPlaytestEntry.js",
    "utf8"
  );


test(
  "普通页面导航不再同步执行全量存档",
  () => {
    assert.doesNotMatch(
      androidSource,
      /currentRoute\s*=\s*nextRoute;[\s\S]{0,80}saveNow\(\);[\s\S]{0,80}destroyCurrent\(\)/
    );
  }
);


test(
  "旧地图Runtime已从正式Android入口彻底删除",
  () => {
    assert.equal(
      fs.existsSync(
        "src/ui/runtime/CityMapViewportRuntime.js"
      ),
      false
    );

    assert.doesNotMatch(
      androidSource,
      /CityMapViewportRuntime|cityMapViewportRuntime/
    );
  }
);
