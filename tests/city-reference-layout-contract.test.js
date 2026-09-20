import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test(
  "城市确认稿使用864×1536六段骨架且底栏不再fixed覆盖详情",
  () => {
    const css =
      fs.readFileSync(
        "src/ui/pages/city/city-map.css",
        "utf8"
      );

    assert.match(
      css,
      /grid-template-rows:\s*6\.25dvh\s*8\.4dvh\s*4\.55dvh\s*42\.65dvh\s*28\.25dvh\s*9\.9dvh/
    );

    assert.match(
      css,
      /\.city-map-game > \.rg-bottom-nav[\s\S]*?position:\s*relative/
    );

    assert.match(
      css,
      /\.city-map-game > \.rg-bottom-nav[\s\S]*?grid-row:\s*6/
    );

    assert.match(
      css,
      /city-main-map\.webp/
    );

    assert.doesNotMatch(
      css,
      /city-map-art-piece/
    );
  }
);

test(
  "城市标题筛选使用正式图片组件而不是临时彩色圆点",
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

    assert.match(
      view,
      /city-map-heading__title-icon/
    );

    assert.match(
      view,
      /city-map-heading__summary-icon/
    );

    assert.match(
      view,
      /city-map-filter__icon/
    );

    assert.doesNotMatch(
      view,
      /city-map-filter__dot/
    );

    assert.match(
      css,
      /city-state-badges\.webp/
    );

    assert.match(
      css,
      /city-metric-icons\.webp/
    );
  }
);
