import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const androidSource =
  fs.readFileSync(
    "src/ui/runtime/AndroidPlaytestEntry.js",
    "utf8"
  );

const mapSource =
  fs.readFileSync(
    "src/ui/runtime/CityMapViewportRuntime.js",
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
  "地图Runtime不再全局常驻",
  () => {
    const runtimeStart =
      androidSource.indexOf(
        "function startRuntimeSystems"
      );

    const saveStart =
      androidSource.indexOf(
        "function saveNow"
      );

    const block =
      androidSource.slice(
        runtimeStart,
        saveStart
      );

    assert.doesNotMatch(
      block,
      /cityMapViewportRuntime\.start/
    );
  }
);


test(
  "地图Runtime不再监听document.body全部DOM变化",
  () => {
    assert.doesNotMatch(
      mapSource,
      /MutationObserver/
    );

    assert.doesNotMatch(
      mapSource,
      /observe\(document\.body/
    );
  }
);
