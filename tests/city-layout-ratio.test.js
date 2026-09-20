import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "城市正式稿使用1536高视口的固定纵向比例",
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

    for (const token of [
      "height: 8.4dvh",
      "height: 4.55dvh",
      "height: 42.65dvh",
      "height: 28.25dvh",
      "padding-bottom: 9.7dvh"
    ]) {
      assert.equal(
        city.includes(token),
        true,
        "城市纵向比例缺少：" + token
      );
    }

    assert.equal(
      chrome.includes(
        "height:\n    6.25dvh"
      ),
      true
    );

    assert.equal(
      chrome.includes(
        "height: 9.7dvh"
      ),
      true
    );

    assert.equal(
      chrome.includes(
        "safe-area-inset-top"
      ),
      false
    );
  }
);


test(
  "城市交互避免重复重建完整页面",
  () => {
    const view =
      fs.readFileSync(
        "src/ui/pages/city/CityMapView.js",
        "utf8"
      );

    const dashboard =
      fs.readFileSync(
        "src/ui/pages/city/CityMapDashboardSystem.js",
        "utf8"
      );

    assert.equal(
      view.includes(
        "this.refresh();\n      return;\n    }\n\n    if (action === \"open-district-properties\")"
      ),
      false
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
      dashboard.includes(
        "generateListings:\n            !hasExistingListings"
      ),
      true
    );
  }
);
