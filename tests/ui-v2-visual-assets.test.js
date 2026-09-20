import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const REQUIRED_ASSETS =
  Object.freeze([
    "assets/ui-v2/city/city-map-master.webp",
    "assets/ui-v2/icons/shared/hud-store.svg",
    "assets/ui-v2/icons/shared/money.svg",
    "assets/ui-v2/icons/shared/crown.svg",
    "assets/ui-v2/icons/nav/city.svg",
    "assets/ui-v2/icons/nav/store.svg",
    "assets/ui-v2/icons/map/plus.svg",
    "assets/ui-v2/icons/map/locate.svg",
    "assets/ui-v2/icons/map/building.svg",
    "assets/ui-v2/icons/map/university.svg",
    "assets/ui-v2/icons/map/nightlife.svg",
    "assets/ui-v2/icons/metric/traffic.svg",
    "assets/ui-v2/icons/metric/spending.svg",
    "assets/ui-v2/icons/metric/rent.svg",
    "assets/ui-v2/icons/metric/competition.svg",
    "assets/ui-v2/icons/metric/delivery.svg",
    "assets/ui-v2/icons/metric/properties.svg",
    "assets/ui-v2/icons/action/search.svg",
    "assets/ui-v2/icons/regions/core.svg",
    "assets/ui-v2/icons/regions/campus.svg",
    "assets/ui-v2/icons/regions/nightlife.svg",
    "assets/ui-v2/icons/regions/lifestyle.svg"
  ]);

test(
  "城市正式视觉资源均为独立文件并进入仓库",
  () => {
    for (
      const asset
      of REQUIRED_ASSETS
    ) {
      assert.equal(
        fs.existsSync(
          asset
        ),
        true,
        asset
      );

      assert.ok(
        fs.statSync(
          asset
        ).size >
          80,
        asset
      );
    }
  }
);

test(
  "Android构建递归复制独立UI资源且视觉绑定样式最后加载",
  () => {
    const build =
      fs.readFileSync(
        "scripts/build-android-js.mjs",
        "utf8"
      );

    assert.match(
      build,
      /fs\.cpSync/
    );

    assert.match(
      build,
      /assets\/ui-v2/
    );

    const cityStyleIndex =
      build.indexOf(
        "src/ui-v2/pages/city/city-page.css"
      );

    const assetStyleIndex =
      build.indexOf(
        "src/ui-v2/assets/ui-assets.css"
      );

    assert.ok(
      cityStyleIndex >=
        0
    );

    assert.ok(
      assetStyleIndex >
        cityStyleIndex
    );
  }
);

test(
  "视觉绑定不再包含sprite atlas切图",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/assets/ui-assets.css",
        "utf8"
      );

    assert.doesNotMatch(
      css,
      /atlas/i
    );

    assert.match(
      css,
      /city-map-master\.webp/
    );

    assert.match(
      css,
      /icons\/shared\/money\.svg/
    );

    assert.match(
      css,
      /icons\/map\/locate\.svg/
    );

    assert.match(
      css,
      /icons\/metric\/traffic\.svg/
    );
  }
);

test(
  "城市页面保持一张正式地图加动态覆盖层",
  () => {
    const page =
      fs.readFileSync(
        "src/ui-v2/pages/city/CityPage.js",
        "utf8"
      );

    assert.equal(
      (
        page.match(
          /ui-v2-city-region-overlays/g
        ) ??
        []
      ).length,
      1
    );

    assert.match(
      page,
      /districtThemeClass/
    );

    assert.doesNotMatch(
      page,
      /<img[^>]+city-map-master/
    );
  }
);
