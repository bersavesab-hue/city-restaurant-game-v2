import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  CITY_REFERENCE_LAYOUT,
  CITY_RUNTIME_POLICY
} from "../src/ui-v2/tokens/ReferenceLayout.js";

test(
  "864x1536母版按六段纵向比例直接映射到手机视口高度",
  () => {
    assert.deepEqual(
      CITY_REFERENCE_LAYOUT.artwork,
      {
        width: 864,
        height: 1536
      }
    );

    const regions =
      CITY_REFERENCE_LAYOUT.regions;

    const totalDvh =
      Object.values(
        regions
      ).reduce(
        (sum,region) =>
          sum +
          region.dvh,
        0
      );

    assert.ok(
      Math.abs(
        totalDvh -
        100
      ) <
        0.02
    );

    assert.equal(
      regions.map.dvh,
      42.77
    );

    assert.equal(
      regions.detail.dvh,
      28.32
    );
  }
);

test(
  "手机纵向结构锁定而横向只压缩内容",
  () => {
    assert.equal(
      CITY_RUNTIME_POLICY.verticalComposition,
      "viewport-height-locked"
    );

    assert.equal(
      CITY_RUNTIME_POLICY.horizontalCompression,
      "width-responsive"
    );

    assert.equal(
      CITY_RUNTIME_POLICY.safeInsets,
      "do-not-consume-vertical-rows"
    );

    assert.equal(
      CITY_RUNTIME_POLICY.fullPageScaling,
      false
    );
  }
);

test(
  "CSS使用dvh锁定HUD Hero 筛选 地图 详情和底栏",
  () => {
    const tokens =
      fs.readFileSync(
        "src/ui-v2/tokens/tokens.css",
        "utf8"
      );

    for (
      const value
      of [
        "6.12dvh",
        "8.79dvh",
        "4.30dvh",
        "42.77dvh",
        "28.32dvh",
        "9.70dvh"
      ]
    ) {
      assert.match(
        tokens,
        new RegExp(
          value.replace(
            ".",
            "\\."
          )
        )
      );
    }
  }
);

test(
  "城市页固定六段比例且六指标保持单排",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/pages/city/city-page.css",
        "utf8"
      );

    assert.match(
      css,
      /var\(--ui-city-map-height\)/
    );

    assert.match(
      css,
      /repeat\(\s*6,\s*minmax\(0,1fr\)\s*\)/
    );
  }
);
