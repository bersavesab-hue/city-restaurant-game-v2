import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  CITY_REFERENCE_LAYOUT,
  CITY_REFERENCE_TYPOGRAPHY,
  CITY_RUNTIME_POLICY
} from "../src/ui-v2/tokens/ReferenceLayout.js";

test(
  "城市母版严格锁定864x1536六区参考坐标",
  () => {
    assert.deepEqual(
      CITY_REFERENCE_LAYOUT.canvas,
      {
        width: 864,
        height: 1536
      }
    );

    const regions =
      CITY_REFERENCE_LAYOUT.regions;

    assert.equal(
      regions.hud.height +
      regions.hero.height +
      regions.filters.height +
      regions.map.height +
      regions.detail.height +
      regions.navigation.height,
      1536
    );

    assert.equal(
      regions.hero.y,
      94
    );

    assert.equal(
      regions.map.y,
      295
    );

    assert.equal(
      regions.detail.y,
      952
    );
  }
);

test(
  "城市适配只允许地图吸收额外纵向空间",
  () => {
    assert.equal(
      CITY_RUNTIME_POLICY.extraHeightTarget,
      "city-map"
    );

    assert.equal(
      CITY_RUNTIME_POLICY.minimumTouchTarget,
      48
    );

    assert.equal(
      CITY_RUNTIME_POLICY.textScaling,
      "bounded"
    );
  }
);

test(
  "城市字体层级保持统一而不是页面自行漂移",
  () => {
    assert.equal(
      CITY_REFERENCE_TYPOGRAPHY.pageTitle,
      46
    );

    assert.equal(
      CITY_REFERENCE_TYPOGRAPHY.metricValue,
      21
    );

    const tokens =
      fs.readFileSync(
        "src/ui-v2/tokens/tokens.css",
        "utf8"
      );

    for (
      const token
      of [
        "--ui-font-page-title",
        "--ui-font-page-subtitle",
        "--ui-font-filter",
        "--ui-font-detail-title",
        "--ui-font-metric-label",
        "--ui-font-metric-value",
        "--ui-font-nav-label"
      ]
    ) {
      assert.match(
        tokens,
        new RegExp(
          token
        )
      );
    }
  }
);
