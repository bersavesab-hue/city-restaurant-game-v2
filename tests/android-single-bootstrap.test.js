import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


function source(path) {
  return fs.readFileSync(
    new URL(
      "../" + path,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "Android只存在一个正式启动入口",
  () => {
    const build =
      source(
        "scripts/build-android-js.mjs"
      );

    assert.match(
      build,
      /src\/ui\/runtime\/AndroidPlaytestEntry\.js/
    );

    assert.doesNotMatch(
      build,
      /AndroidPlaytestEntryV2/
    );

    assert.equal(
      fs.existsSync(
        new URL(
          "../src/ui/runtime/AndroidPlaytestEntryV2.js",
          import.meta.url
        )
      ),
      false
    );
  }
);


test(
  "Android正式入口加载会员口碑联动和运行增强",
  () => {
    const runtime =
      source(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    assert.match(
      runtime,
      /CustomerLoyaltyIntegrationSystem/
    );

    assert.match(
      runtime,
      /WordOfMouthSystem/
    );

    assert.match(
      runtime,
      /runtime-enhancements\.css/
    );

    assert.match(
      runtime,
      /startRuntimeEnhancements\(\)/
    );
  }
);


test(
  "Android试玩版使用沉浸式全屏避免系统栏压住游戏HUD",
  () => {
    const activity =
      source(
        "android/app/src/main/java/com/cityrestaurant/game/MainActivity.java"
      );

    assert.match(
      activity,
      /applyImmersiveMode/
    );

    assert.match(
      activity,
      /WindowInsets\.Type\.statusBars/
    );

    assert.match(
      activity,
      /WindowInsets\.Type\.navigationBars/
    );

    assert.match(
      activity,
      /BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE/
    );

    assert.doesNotMatch(
      activity,
      /setOnApplyWindowInsetsListener/
    );
  }
);
