import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "城市确认稿锁定1536高度的五段正式布局",
  () => {
    const city =
      fs.readFileSync(
        "src/ui/pages/city/city-map.css",
        "utf8"
      );

    const chrome =
      fs.readFileSync(
        "src/ui/theme/game-chrome.css",
        "utf8"
      );

    for (
      const token
      of [
        "6.25dvh",
        "8.4dvh",
        "4.55dvh",
        "42.65dvh",
        "28.25dvh"
      ]
    ) {
      assert.equal(
        city.includes(
          token
        ),
        true,
        "城市纵向比例缺少：" +
        token
      );
    }

    assert.equal(
      city.includes(
        "city-map-region--"
      ),
      false,
      "旧CSS区域描边必须删除"
    );

    assert.equal(
      city.includes(
        "city-main-map.webp"
      ),
      false,
      "旧航拍城市底图不得继续引用"
    );

    assert.equal(
      chrome.includes(
        "height:\n    9.9dvh"
      ),
      true
    );
  }
);


test(
  "城市交互继续保持局部刷新",
  () => {
    const view =
      fs.readFileSync(
        "src/ui/pages/city/CityMapView.js",
        "utf8"
      );

    assert.equal(
      view.includes(
        "renderMapOnly()"
      ),
      true
    );

    assert.equal(
      view.includes(
        "renderDetailOnly()"
      ),
      true
    );

    assert.equal(
      view.includes(
        "city-map-region"
      ),
      false,
      "旧区域DOM必须删除"
    );
  }
);
