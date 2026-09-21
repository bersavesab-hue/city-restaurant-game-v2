import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  UI_REFERENCE,
  UI_REGIONS,
  UI_BOXES,
  UI_TYPOGRAPHY
} from "../src/ui-v2/contracts/UiFrameContract.js";

import {
  renderAppShell
} from "../src/ui-v2/shell/AppShell.js";

import {
  renderCityFrame
} from "../src/ui-v2/pages/city/CityFrame.js";

test(
  "864x1536母版六段框架严格闭合",
  () => {
    assert.deepEqual(
      UI_REFERENCE,
      {
        width: 864,
        height: 1536
      }
    );

    assert.equal(
      Object.values(
        UI_REGIONS
      ).reduce(
        (
          total,
          region
        ) =>
          total +
          region.height,
        0
      ),
      1536
    );

    assert.equal(
      UI_REGIONS.hud.height,
      118
    );

    assert.equal(
      UI_REGIONS.map.height,
      686
    );

    assert.equal(
      UI_REGIONS.detail.height,
      408
    );

    assert.equal(
      UI_REGIONS.navigation.y,
      1410
    );

    assert.equal(
      UI_REGIONS.navigation.height,
      126
    );
  }
);

test(
  "组件盒尺寸锁死",
  () => {
    assert.deepEqual(
      UI_BOXES.hudAvatar,
      {
        width: 90,
        height: 90
      }
    );

    assert.deepEqual(
      UI_BOXES.mapMarker,
      {
        width: 214,
        height: 58
      }
    );

    assert.deepEqual(
      UI_BOXES.primaryAction,
      {
        width: 221,
        height: 81
      }
    );

    assert.deepEqual(
      UI_BOXES.metric,
      {
        width: 133,
        height: 115
      }
    );

    assert.deepEqual(
      UI_BOXES.navigationIcon,
      {
        width: 60,
        height: 60
      }
    );
  }
);

test(
  "字体族字号字重契约锁死",
  () => {
    assert.deepEqual(
      UI_TYPOGRAPHY.weights,
      [
        500,
        600,
        700,
        800,
        900
      ]
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.pageTitle.size,
      56
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.pageTitle.weight,
      900
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.navigation.size,
      23
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.metricValue.size,
      23
    );
  }
);

test(
  "运行结构只有新框架",
  () => {
    const shell =
      renderAppShell();

    const city =
      renderCityFrame();

    assert.equal(
      (
        shell.match(
          /data-ui="global-hud"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        shell.match(
          /data-ui="global-nav"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        city.match(
          /data-ui-region="city-map"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        city.match(
          /data-ui-box="map-marker"/g
        ) ??
        []
      ).length,
      5
    );

    assert.equal(
      (
        city.match(
          /data-ui-box="city-map-art"/g
        ) ??
        []
      ).length,
      1
    );

    assert.doesNotMatch(
      city,
      /ui-v2-city-frame__map-grid/
    );

    assert.doesNotMatch(
      city,
      /hero-summary|city-total|city-summary-subtitle/
    );

    assert.doesNotMatch(
      city,
      /region-overlays|map-motto|让美食|点亮这座城市/
    );

    assert.match(city, /data-live="filter-all"/);
    assert.match(city, /data-live="detail-title"/);
  }
);

test(
  "旧UI实现与旧资源不允许回流",
  () => {
    for (
      const path
      of [
        "src/ui-v2/pages/city/CityPage.js",
        "src/ui-v2/pages/city/CityPageModel.js",
        "src/ui-v2/pages/city/CityMapVisualLayout.js",
        "src/ui-v2/assets/ui-assets.css",
        "src/ui-v2/assets/CityVisualAssetContract.js",
        "assets/ui-v2"
      ]
    ) {
      assert.equal(
        fs.existsSync(
          path
        ),
        false,
        path
      );
    }

    const build =
      fs.readFileSync(
        "scripts/build-android-js.mjs",
        "utf8"
      );

    assert.doesNotMatch(
      build,
      /assets\/ui-v2|ui-assets\.css|city-page\.css/
    );
  }
);
