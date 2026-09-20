import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  DISTRICT_THUMBNAIL_SPRITE,
  DISTRICT_VISUALS,
  resolveDistrictVisual
} from "../src/ui/pages/city/DistrictVisualRegistry.js";


const EXPECTED_DISTRICTS =
  Object.freeze([
    "old_town",
    "cbd",
    "university",
    "premium_residential",
    "residential",
    "transport_hub",
    "industrial_park",
    "nightlife",
    "tourist_scenic",
    "suburban_resort",
    "commercial_core",
    "office_park",
    "tech_park",
    "medical_cluster",
    "cultural_creative",
    "convention_center",
    "sports_entertainment",
    "wholesale_market",
    "suburban_community",
    "waterfront_leisure"
  ]);


test(
  "20个正式商圈全部拥有唯一缩略图图块",
  () => {
    assert.equal(
      Object.keys(
        DISTRICT_VISUALS
      ).length,
      20
    );

    for (
      const districtId
      of EXPECTED_DISTRICTS
    ) {
      assert.ok(
        DISTRICT_VISUALS[
          districtId
        ],
        districtId +
        "缺少商圈缩略图"
      );
    }

    const cells =
      Object.values(
        DISTRICT_VISUALS
      ).map(
        item =>
          item.row +
          ":" +
          item.column
      );

    assert.equal(
      new Set(
        cells
      ).size,
      20
    );
  }
);


test(
  "商圈缩略图精灵资源存在且兜底可用",
  () => {
    assert.equal(
      DISTRICT_THUMBNAIL_SPRITE,
      "assets/images/ui/city/district-thumbnails-sprite.webp"
    );

    assert.equal(
      fs.existsSync(
        DISTRICT_THUMBNAIL_SPRITE
      ),
      true
    );

    const fallback =
      resolveDistrictVisual(
        "__unknown_district__"
      );

    assert.equal(
      fallback.image,
      DISTRICT_THUMBNAIL_SPRITE
    );

    assert.equal(
      fallback.size,
      "400% 500%"
    );
  }
);


test(
  "城市详情今日机会和房源页统一读取商圈缩略图注册表",
  () => {
    const mapView =
      fs.readFileSync(
        "src/ui/pages/city/CityMapView.js",
        "utf8"
      );

    const propertyView =
      fs.readFileSync(
        "src/ui/pages/city/CityPropertyView.js",
        "utf8"
      );

    assert.match(
      mapView,
      /getDistrictThumbnailStyle/
    );

    assert.match(
      mapView,
      /city-district-sheet__thumb/
    );

    assert.match(
      mapView,
      /city-opportunity-card__image/
    );

    assert.match(
      propertyView,
      /property-district-card__thumb/
    );

    assert.match(
      propertyView,
      /getPropertyImageStyle/
    );

    assert.doesNotMatch(
      mapView,
      /--district-thumb-x/
    );
  }
);
