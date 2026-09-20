import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  DISTRICT_LABEL_SPRITE,
  CITY_METRIC_ICON_SPRITE,
  CITY_MAP_CONTROL_SPRITE,
  CITY_STATE_BADGE_SPRITE,
  getDistrictLabelStyle
} from "../src/ui/pages/city/DistrictVisualRegistry.js";


const ASSETS = Object.freeze([
  DISTRICT_LABEL_SPRITE,
  CITY_METRIC_ICON_SPRITE,
  CITY_MAP_CONTROL_SPRITE,
  CITY_STATE_BADGE_SPRITE
]);


test(
  "城市地图组件使用生成美术资源而不是代码绘制临时图形",
  () => {
    for (
      const path
      of ASSETS
    ) {
      assert.equal(
        fs.existsSync(
          path
        ),
        true,
        "缺少城市生成美术资源：" +
        path
      );
    }

    const normal =
      getDistrictLabelStyle(
        "cbd"
      );

    const active =
      getDistrictLabelStyle(
        "cbd",
        {
          selected:
            true
        }
      );

    const locked =
      getDistrictLabelStyle(
        "cbd",
        {
          locked:
            true
        }
      );

    assert.notEqual(
      normal,
      active
    );

    assert.notEqual(
      normal,
      locked
    );
  }
);


test(
  "城市标签地图控制和指标图标不再输出旧字符图形",
  () => {
    const view =
      fs.readFileSync(
        "src/ui/pages/city/CityMapView.js",
        "utf8"
      );

    const css =
      fs.readFileSync(
        "src/ui/pages/city/city-map.css",
        "utf8"
      );

    const registry =
      fs.readFileSync(
        "src/ui/pages/city/DistrictVisualRegistry.js",
        "utf8"
      );

    for (
      const obsolete
      of [
        ">＋</button>",
        ">－</button>",
        ">⌾</button>",
        'renderMetric("♟"',
        'renderMetric("●"',
        'renderMetric("⌂"',
        'renderMetric("▥"',
        'renderMetric("◉"',
        'renderMetric("▦"',
        "city-map-pin__icon"
      ]
    ) {
      assert.equal(
        view.includes(
          obsolete
        ),
        false,
        "仍残留代码图形：" +
        obsolete
      );
    }

    assert.equal(
      registry.includes(
        "city-labels.webp"
      ),
      true,
      "商圈标签资源必须由DistrictVisualRegistry统一管理"
    );

    assert.equal(
      css.includes(
        "--district-label-image"
      ),
      true,
      "城市CSS必须使用注册表下发的商圈标签图片变量"
    );

    assert.equal(
      view.includes(
        "getDistrictLabelStyle"
      ),
      true,
      "城市地图必须通过注册表选择标签美术"
    );

    for (
      const asset
      of [
        "city-metric-icons.webp",
        "city-map-controls.webp",
        "city-state-badges.webp"
      ]
    ) {
      assert.equal(
        css.includes(
          asset
        ),
        true,
        "城市CSS未接入资源：" +
        asset
      );
    }

    assert.equal(
      css.includes(
        ".city-map-pin.is-active::after"
      ),
      false
    );
  }
);
