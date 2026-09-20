import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const REQUIRED_ASSETS =
  Object.freeze([
    "assets/ui-v2/shared/shared-ui-atlas.webp",
    "assets/ui-v2/city/city-map-atlas.webp",
    "assets/ui-v2/city/city-metric-atlas.webp",
    "assets/ui-v2/city/city-map-master.webp"
  ]);

test(
  "城市正式视觉资源全部进入仓库且不是空壳",
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
          1000,
        asset
      );
    }
  }
);

test(
  "Android构建复制UI资源且视觉绑定样式最后加载",
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
  "视觉绑定只引用规范化atlas和正式地图",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/assets/ui-assets.css",
        "utf8"
      );

    for (
      const name
      of [
        "shared-ui-atlas.webp",
        "city-map-atlas.webp",
        "city-metric-atlas.webp",
        "city-map-master.webp"
      ]
    ) {
      assert.match(
        css,
        new RegExp(
          name.replace(
            ".",
            "\\."
          )
        )
      );
    }

    assert.match(
      css,
      /ui-v2-city-region-art/
    );

    assert.match(
      css,
      /theme-yellow/
    );

    assert.match(
      css,
      /data-image-key="traffic"/
    );
  }
);

test(
  "城市页面已真正挂载区域美术层而不是重新造第二张地图",
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
