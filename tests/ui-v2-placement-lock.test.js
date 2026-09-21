import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  UI_BOXES,
  UI_PLACEMENTS,
  UI_TEXT_SLOTS,
  UI_TYPOGRAPHY
} from "../src/ui-v2/contracts/UiFrameContract.js";

import {
  renderCityFrame
} from "../src/ui-v2/pages/city/CityFrame.js";

test(
  "HUD三栏位置锁死",
  () => {
    assert.deepEqual(
      UI_PLACEMENTS.hud.identity,
      {
        x: 12,
        y: 17,
        width: 211,
        height: 69
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.hud.simulation,
      {
        x: 231,
        y: 17,
        width: 298,
        height: 69
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.hud.resources,
      {
        x: 537,
        y: 17,
        width: 142,
        height: 69
      }
    );
  }
);

test(
  "Hero筛选地图控件位置锁死",
  () => {
    assert.deepEqual(
      UI_PLACEMENTS.hero.summary,
      {
        x: 461,
        y: 35,
        width: 218,
        height: 79
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.filters,
      {
        x: 12,
        y: 5,
        width: 667,
        height: 48,
        gap: 4
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.map.controls,
      {
        x: 625,
        y: 507,
        width: 54,
        height: 180,
        gap: 9
      }
    );
  }
);

test(
  "五个地图标签中心坐标锁死",
  () => {
    assert.deepEqual(
      UI_PLACEMENTS.map.markers,
      {
        university:
          {
            x: 366,
            y: 79
          },
        cbd:
          {
            x: 276,
            y: 193
          },
        nightlife:
          {
            x: 553,
            y: 243
          },
        oldTown:
          {
            x: 152,
            y: 458
          },
        waterfront:
          {
            x: 511,
            y: 501
          }
      }
    );
  }
);

test(
  "详情Sheet四层位置锁死",
  () => {
    assert.deepEqual(
      UI_PLACEMENTS.detail.thumbnail,
      {
        x: 20,
        y: 22,
        width: 110,
        height: 90
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.detail.primaryAction,
      {
        x: 479,
        y: 31,
        width: 184,
        height: 68
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.detail.metrics,
      {
        x: 18,
        y: 119,
        width: 655,
        height: 112,
        gap: 4
      }
    );

    assert.deepEqual(
      UI_PLACEMENTS.detail.opportunities,
      {
        x: 18,
        y: 284,
        width: 655,
        height: 86,
        gap: 8
      }
    );
  }
);

test(
  "详情拖拽条与关闭按钮成为正式固定盒",
  () => {
    assert.deepEqual(
      UI_BOXES.detailHandle,
      {
        width: 48,
        height: 4
      }
    );

    assert.deepEqual(
      UI_BOXES.detailClose,
      {
        width: 28,
        height: 28
      }
    );

    const html =
      renderCityFrame();

    assert.match(
      html,
      /data-ui-box="detail-handle"/
    );

    assert.match(
      html,
      /data-ui-box="detail-close"/
    );
  }
);

test(
  "文字基线与字号锁死",
  () => {
    assert.deepEqual(
      UI_TEXT_SLOTS.heroTitle,
      {
        x: 73,
        y: 26,
        width: 370,
        height: 42
      }
    );

    assert.deepEqual(
      UI_TEXT_SLOTS.detailBody,
      {
        x: 145,
        y: 60,
        width: 314,
        height: 43
      }
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.hudPrimary.size,
      18
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.markerTitle.size,
      17
    );

    assert.equal(
      UI_TYPOGRAPHY.roles.opportunityBody.size,
      11
    );
  }
);

test(
  "框架CSS不得再用媒体查询改变盒子位置",
  () => {
    for (
      const path
      of [
        "src/ui-v2/tokens/tokens.css",
        "src/ui-v2/components/components.css",
        "src/ui-v2/pages/city/city-frame.css"
      ]
    ) {
      const css =
        fs.readFileSync(
          path,
          "utf8"
        );

      assert.doesNotMatch(
        css,
        /@media/
      );
    }
  }
);

test(
  "正式静态资源填入锁定盒且禁止内嵌Base64",
  () => {
    const city =
      fs.readFileSync(
        "src/ui-v2/pages/city/city-frame.css",
        "utf8"
      );

    const components =
      fs.readFileSync(
        "src/ui-v2/components/components.css",
        "utf8"
      );

    const css =
      city +
      components;

    assert.match(
      css,
      /url\("ui-v2\/icons\//
    );

    assert.match(
      css,
      /ui-v2\/illustrations\/city-map-master\.webp/
    );

    assert.match(
      css,
      /ui-v2\/markers\/frame-cbd\.svg/
    );

    assert.match(
      css,
      /ui-v2\/markers\/pin-selected\.svg/
    );

    assert.match(
      css,
      /ui-v2\/illustrations\/city-map-master\.webp/
    );

    assert.doesNotMatch(
      css,
      /ui-v2-city-frame__map-grid/
    );

    assert.doesNotMatch(
      css,
      /data:image|base64/
    );

    for (
      const path
      of [
        "resources/ui-v2/icons/hud-store.svg",
        "resources/ui-v2/icons/hud-money.svg",
        "resources/ui-v2/icons/nav-city.svg",
        "resources/ui-v2/icons/filter-opened.svg",
        "resources/ui-v2/icons/marker-cbd.svg",
        "resources/ui-v2/icons/metric-traffic.svg",
        "resources/ui-v2/icons/map-locate.svg",
        "resources/ui-v2/illustrations/city-map-master.webp",
        "resources/ui-v2/markers/frame-university.svg",
        "resources/ui-v2/markers/frame-cbd.svg",
        "resources/ui-v2/markers/frame-nightlife.svg",
        "resources/ui-v2/markers/frame-oldtown.svg",
        "resources/ui-v2/markers/frame-waterfront.svg",
        "resources/ui-v2/markers/pin-selected.svg",
        "resources/ui-v2/illustrations/city-map-master.webp"
      ]
    ) {
      assert.equal(
        fs.existsSync(
          path
        ),
        true,
        path
      );
    }

    const build =
      fs.readFileSync(
        "scripts/build-android-js.mjs",
        "utf8"
      );

    assert.match(
      build,
      /resources\/ui-v2/
    );

    assert.match(
      build,
      /fs\.cpSync/
    );
  }
);
