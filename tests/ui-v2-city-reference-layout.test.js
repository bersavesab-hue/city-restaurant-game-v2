import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  CITY_REFERENCE_LAYOUT,
  CITY_REFERENCE_TYPOGRAPHY,
  CITY_RUNTIME_POLICY
} from "../src/ui-v2/tokens/ReferenceLayout.js";

test(
  "864x1536成品图只作为视觉像素母版并映射到432x768 CSS参考",
  () => {
    assert.deepEqual(
      CITY_REFERENCE_LAYOUT.artwork,
      {
        width: 864,
        height: 1536,
        pixelToCssScale: 0.5
      }
    );

    assert.deepEqual(
      CITY_REFERENCE_LAYOUT.cssReference,
      {
        width: 432,
        height: 768
      }
    );

    assert.equal(
      CITY_RUNTIME_POLICY.pixelToCssScale,
      0.5
    );

    assert.equal(
      CITY_RUNTIME_POLICY.fullPageScaling,
      false
    );
  }
);

test(
  "城市运行时固定区接近母版而高度差只交给地图",
  () => {
    const target =
      CITY_REFERENCE_LAYOUT.runtimeTargets;

    assert.equal(
      target.hud,
      52
    );

    assert.equal(
      target.hero,
      68
    );

    assert.equal(
      target.filters,
      48
    );

    assert.equal(
      target.detail,
      218
    );

    assert.equal(
      target.navigation,
      74
    );

    assert.equal(
      CITY_RUNTIME_POLICY.extraHeightTarget,
      "city-map"
    );
  }
);

test(
  "字体按视觉像素折算为受控CSS字号",
  () => {
    assert.equal(
      CITY_REFERENCE_TYPOGRAPHY.artworkPixels.pageTitle,
      46
    );

    assert.equal(
      CITY_REFERENCE_TYPOGRAPHY.runtimeCss.pageTitle,
      24
    );

    assert.equal(
      CITY_REFERENCE_TYPOGRAPHY.runtimeCss.metricValue,
      12
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
        "--ui-font-nav-label",
        "--ui-city-detail-height"
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

test(
  "城市详情维持六指标单排且页面不再用390px地图最小高",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/pages/city/city-page.css",
        "utf8"
      );

    const tokens =
      fs.readFileSync(
        "src/ui-v2/tokens/tokens.css",
        "utf8"
      );

    assert.match(
      css,
      /repeat\(\s*6,\s*minmax\(0,1fr\)\s*\)/
    );

    assert.match(
      css,
      /--ui-city-detail-height/
    );

    assert.doesNotMatch(
      tokens,
      /--ui-city-map-min-height:\s*390px/
    );
  }
);
