import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  VENUE_TYPES_V2,
  VENUE_TYPE_DATASET_META
} from "../src/data/venueTypes.v2.js";

import {
  validateVenueType
} from "../src/data/venueTypeRules.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import { app } from "../src/main.js";

const {
  venueTypeSystem,
  propertyVenueSystem,
  propertySystem,
  restaurantSystem,
  seatingSystem,
  trafficDemandSystem,
  salesChannelSystem,
  renovationSystem,
  renovationPlanningSystem,
  propertyMarketSystem
} = app.systems;


test(
  "正式门店业态包固定30种并保留旧20个ID",
  () => {
    assert.equal(
      VENUE_TYPE_DATASET_META.total,
      30
    );

    assert.equal(
      VENUE_TYPES_V2.length,
      30
    );

    assert.equal(
      new Set(
        VENUE_TYPES_V2.map(
          item => item.id
        )
      ).size,
      30
    );

    for (
      const legacyId
      of [
        "street_shop",
        "mall_store",
        "community_store",
        "campus_store",
        "office_restaurant",
        "industrial_canteen",
        "scenic_store",
        "farmhouse",
        "mountain_resort",
        "villa_private_kitchen",
        "courtyard_restaurant",
        "rooftop_restaurant",
        "cloud_kitchen",
        "hub_store",
        "fast_service_store",
        "nightlife_store",
        "breakfast_store",
        "old_brand_shop",
        "clubhouse_restaurant",
        "stall"
      ]
    ) {
      assert.ok(
        VENUE_TYPES_V2.some(
          item =>
            item.id ===
            legacyId
        ),
        legacyId
      );
    }

    for (
      const venue
      of VENUE_TYPES_V2
    ) {
      assert.equal(
        validateVenueType(
          venue
        ),
        true,
        venue.id
      );
    }
  }
);


test(
  "所有业态客群引用都来自正式28类客群",
  () => {
    const segmentIds =
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      );

    for (
      const venue
      of VENUE_TYPES_V2
    ) {
      for (
        const segmentId
        of Object.keys(
          venue.targetSegments
        )
      ) {
        assert.ok(
          segmentIds.has(
            segmentId
          ),
          `${venue.id} -> ${segmentId}`
        );
      }
    }
  }
);


test(
  "铺位硬条件会阻止不合理业态并允许合适业态",
  () => {
    gameState.reset();

    const tooSmall =
      propertySystem.create({
        districtId:
          "residential",
        name:
          "业态硬条件小铺",
        area: 40,
        usableArea: 35,
        baseMonthlyRent: 4000,
        seats: 8,
        parkingSpaces: 0,
        exhaustAllowed: false
      });

    const badFit =
      propertyVenueSystem
        .getCompatibility(
          tooSmall.id,
          "villa_private_kitchen"
        );

    assert.equal(
      badFit.eligible,
      false
    );

    assert.ok(
      badFit.reasons.includes(
        "area_too_small"
      )
    );

    assert.ok(
      badFit.reasons.includes(
        "exhaust_required"
      )
    );

    assert.ok(
      badFit.reasons.includes(
        "parking_insufficient"
      )
    );

    assert.throws(
      () =>
        propertyVenueSystem
          .setVenueType(
            tooSmall.id,
            "villa_private_kitchen"
          ),
      /incompatible/
    );

    const suitable =
      propertySystem.create({
        districtId:
          "premium_residential",
        name:
          "业态适配私厨铺",
        area: 260,
        usableArea: 230,
        baseMonthlyRent: 18000,
        seats: 42,
        parkingSpaces: 4,
        frontageMeters: 9,
        ceilingHeight: 3.2,
        exhaustAllowed: true
      });

    const goodFit =
      propertyVenueSystem
        .getCompatibility(
          suitable.id,
          "villa_private_kitchen"
        );

    assert.equal(
      goodFit.eligible,
      true
    );

    const updated =
      propertyVenueSystem
        .setVenueType(
          suitable.id,
          "villa_private_kitchen"
        );

    assert.equal(
      updated.venueTypeId,
      "villa_private_kitchen"
    );
  }
);


test(
  "云厨房实际取消堂食座位并要求高厨房占比",
  () => {
    gameState.reset();

    const property =
      propertySystem.create({
        districtId:
          "residential",
        name:
          "云厨房规则测试铺",
        area: 120,
        usableArea: 100,
        baseMonthlyRent: 6000,
        seats: 30,
        parkingSpaces: 0,
        exhaustAllowed: true
      });

    propertyVenueSystem.setVenueType(
      property.id,
      "cloud_kitchen"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "云厨房规则测试店",
        locationId:
          property.id
      });

    assert.equal(
      seatingSystem.getSeatCount(
        restaurant.id
      ),
      0
    );

    renovationSystem.requireLayout(
      restaurant.id
    );

    const analysis =
      renovationPlanningSystem
        .getAnalysis(
          restaurant.id
        );

    assert.equal(
      analysis.zoning.venueTypeId,
      "cloud_kitchen"
    );

    assert.equal(
      analysis.zoning
        .minimumKitchenRatio,
      0.7
    );

    assert.ok(
      analysis.issues.includes(
        "venue_kitchen_ratio_below_minimum"
      )
    );

    assert.equal(
      analysis.issues.includes(
        "missing_dining_zone"
      ),
      false
    );

    assert.equal(
      analysis.issues.includes(
        "no_dining_tables"
      ),
      false
    );

    assert.equal(
      analysis.issues.includes(
        "no_cashier_counter"
      ),
      false
    );

    assert.equal(
      analysis.issues.includes(
        "no_waiting_area"
      ),
      false
    );
  }
);


test(
  "业态客群渠道和价格容忍倍率真实进入需求系统",
  () => {
    gameState.reset();

    const property =
      propertySystem.create({
        districtId:
          "office_park",
        name:
          "业态需求测试铺",
        area: 120,
        usableArea: 100,
        baseMonthlyRent: 10000,
        seats: 20,
        exhaustAllowed: true
      });

    propertyVenueSystem.setVenueType(
      property.id,
      "tech_park_light_meal"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "业态需求测试店",
        locationId:
          property.id
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 2,
        reputation: 10,
        customerSatisfaction: 60
      }
    );

    const context =
      trafficDemandSystem
        .getVenueContext(
          restaurant.id
        );

    assert.equal(
      context.venueTypeId,
      "tech_park_light_meal"
    );

    assert.ok(
      venueTypeSystem
        .getSegmentMultiplier(
          "tech_park_light_meal",
          "young_professional"
        ) >
      venueTypeSystem
        .getSegmentMultiplier(
          "tech_park_light_meal",
          "resident"
        )
    );

    const segment =
      app.systems
        .customerSegmentSystem
        .get(
          "delivery_heavy"
        );

    const before =
      trafficDemandSystem
        .getVenueChannelFactor(
          restaurant.id,
          segment,
          "tech_park_light_meal"
        );

    salesChannelSystem.unlock(
      restaurant.id,
      "delivery"
    );

    salesChannelSystem.setActive(
      restaurant.id,
      "delivery",
      true
    );

    const after =
      trafficDemandSystem
        .getVenueChannelFactor(
          restaurant.id,
          segment,
          "tech_park_light_meal"
        );

    assert.ok(
      after >= before
    );

    const demand =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          12
        );

    assert.equal(
      demand.venueTypeId,
      "tech_park_light_meal"
    );

    assert.equal(
      demand.venuePriceTolerance,
      venueTypeSystem
        .getPriceToleranceMultiplier(
          "tech_park_light_meal"
        )
    );
  }
);


test(
  "动态房源生成会预计算可执行的推荐业态",
  () => {
    gameState.reset();

    const property =
      propertyMarketSystem
        .createListing(
          "residential",
          901,
          1
        );

    const recommendations =
      property.marketMeta
        ?.recommendedVenueTypes ??
      [];

    assert.ok(
      recommendations.length >
      0
    );

    assert.ok(
      recommendations.length <=
      3
    );

    for (
      const item
      of recommendations
    ) {
      assert.ok(
        venueTypeSystem.get(
          item.id
        ),
        item.id
      );

      assert.ok(
        item.score >= 0 &&
        item.score <= 100
      );
    }
  }
);
