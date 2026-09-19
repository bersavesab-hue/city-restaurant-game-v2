import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

const repoRoot =
  path.resolve(
    path.dirname(
      fileURLToPath(
        import.meta.url
      )
    ),
    ".."
  );

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      repoRoot,
      relativePath
    ),
    "utf8"
  );
}

test(
  "旧UI入口文件已物理移除",
  () => {
    const deprecated = [
      "src/ui/pages/city/CityPropertyGameView.js",
      "src/ui/pages/city/city-property-game.css",
      "src/ui/renovation/RenovationMobileView.js",
      "src/ui/renovation/RenovationFloorplanMobileView.js",
      "src/ui/renovation/renovation-mobile.css",
      "src/ui/renovation/renovation-mobile-interactions.css",
      "src/ui/pages/restaurant/RestaurantHomeView.js",
      "src/ui/pages/restaurant/RestaurantHomePageSystem.js",
      "src/ui/pages/restaurant/RestaurantHomeDashboardSystem.js",
      "src/ui/pages/restaurant/restaurant-home.css",
      "src/ui/pages/restaurant/index.js"
    ];

    for (const relativePath of deprecated) {
      assert.equal(
        fs.existsSync(
          path.join(
            repoRoot,
            relativePath
          )
        ),
        false,
        `旧UI入口仍存在：${relativePath}`
      );
    }
  }
);

test(
  "Android只挂载正式城市房源与装修视图",
  () => {
    const runtime =
      read(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    assert.match(
      runtime,
      /CityPropertyView/
    );

    assert.match(
      runtime,
      /RenovationGameView/
    );

    assert.doesNotMatch(
      runtime,
      /CityPropertyGameView|RenovationMobileView|RenovationFloorplanMobileView|RestaurantHomeView|restaurant-home/
    );
  }
);

test(
  "公共UI出口不再暴露旧装修入口别名",
  () => {
    const publicUi =
      read(
        "src/ui/index.js"
      );

    const renovationBarrel =
      read(
        "src/ui/renovation/index.js"
      );

    for (const source of [
      publicUi,
      renovationBarrel
    ]) {
      assert.doesNotMatch(
        source,
        /BaseRenovationMobileView|mountRenovationMobilePage|mountRenovationFloorplanMobilePage/
      );
    }

    assert.match(
      publicUi,
      /RenovationGameView/
    );

    assert.doesNotMatch(
      publicUi,
      /RestaurantHomeView|restaurantHomePageSystem|pages\/restaurant/
    );
  }
);

test(
  "主题只加载当前正式页面样式",
  () => {
    const theme =
      read(
        "src/ui/theme/theme.css"
      );

    assert.match(
      theme,
      /city-property\.css/
    );

    assert.match(
      theme,
      /renovation-game\.css/
    );

    assert.doesNotMatch(
      theme,
      /city-property-game\.css|renovation-mobile\.css|renovation-mobile-interactions\.css|restaurant-home\.css/
    );
  }
);

test(
  "城市主导航只进入新地图主页",
  () => {
    const navigation =
      read(
        "src/ui/navigation/GameplayNavigationSystem.js"
      );

    assert.match(
      navigation,
      /city:\s*"city"/
    );

    assert.doesNotMatch(
      navigation,
      /city:\s*"properties"/
    );
  }
);


test(
  "页面注册表不再重复定义正式入口",
  () => {
    const core =
      read(
        "src/ui/registry/defaultPages.js"
      );

    const gameplay =
      read(
        "src/ui/registry/gameplayPages.js"
      );

    assert.doesNotMatch(
      gameplay,
      /"restaurant-home"/
    );

    assert.doesNotMatch(
      gameplay,
      /id:\s*\n?\s*"member-marketing"/
    );

    assert.match(
      core,
      /"member-marketing"/
    );
  }
);
