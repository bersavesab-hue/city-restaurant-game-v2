import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  CITY_DISTRICTS_V2,
  DISTRICT_DATASET_META
} from "../src/data/cityDistricts.v2.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import {
  VENUE_TYPES
} from "../src/data/venueTypes.js";

import {
  ADDITIONAL_VENUE_TYPES
} from "../src/data/venueTypes.additional.js";

import {
  validateFormalDistrict
} from "../src/data/districtRules.js";

import { app } from "../src/main.js";

import {
  districtEventSystem
} from "../src/systems/DistrictEventSystem.js";

import {
  cityPropertyPageSystem
} from "../src/ui/pages/city/CityPropertyPageSystem.js";


const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  customerSegmentSystem,
  trafficDemandSystem
} = app.systems;


test(
  "正式商圈包固定20个并保留原10个ID",
  () => {
    assert.equal(
      DISTRICT_DATASET_META.total,
      20
    );

    assert.equal(
      CITY_DISTRICTS_V2.length,
      20
    );

    assert.equal(
      new Set(
        CITY_DISTRICTS_V2.map(
          item => item.id
        )
      ).size,
      20
    );

    for (
      const legacyId
      of [
        "old_town",
        "cbd",
        "university",
        "premium_residential",
        "residential",
        "transport_hub",
        "industrial_park",
        "nightlife",
        "tourist_scenic",
        "suburban_resort"
      ]
    ) {
      assert.ok(
        CITY_DISTRICTS_V2.some(
          item =>
            item.id ===
            legacyId
        ),
        legacyId
      );
    }

    for (
      const district
      of CITY_DISTRICTS_V2
    ) {
      assert.equal(
        validateFormalDistrict(
          district
        ),
        true,
        district.id
      );
    }
  }
);


test(
  "所有商圈客群和铺位亲和引用都指向正式数据",
  () => {
    const segmentIds =
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      );

    const venueIds =
      new Set(
        [
          ...VENUE_TYPES,
          ...ADDITIONAL_VENUE_TYPES
        ].map(
          item => item.id
        )
      );

    for (
      const district
      of CITY_DISTRICTS_V2
    ) {
      for (
        const segmentId
        of Object.keys(
          district.customerMix
        )
      ) {
        assert.ok(
          segmentIds.has(
            segmentId
          ),
          `${district.id} -> ${segmentId}`
        );
      }

      for (
        const venueId
        of Object.keys(
          district.venueAffinity
        )
      ) {
        assert.ok(
          venueIds.has(
            venueId
          ),
          `${district.id} -> ${venueId}`
        );
      }
    }
  }
);


test(
  "不同商圈餐段与门店定位匹配产生真实差异",
  () => {
    const office =
      districtSystem.get(
        "office_park"
      );

    const university =
      districtSystem.get(
        "university"
      );

    assert.ok(
      districtSystem
        .getMealPeriodMultiplier(
          office,
          12
        ) >
      districtSystem
        .getMealPeriodMultiplier(
          office,
          15
        )
    );

    assert.ok(
      districtSystem
        .getPositioningAffinity(
          university,
          "student_value"
        ) >
      districtSystem
        .getPositioningAffinity(
          university,
          "family_dining"
        )
    );
  }
);


test(
  "交通停车和外卖环境会根据客群属性改变需求因子",
  () => {
    const group =
      customerSegmentSystem.get(
        "social_group"
      );

    const deliveryHeavy =
      customerSegmentSystem.get(
        "delivery_heavy"
      );

    const resort =
      districtSystem.get(
        "suburban_resort"
      );

    const transportHub =
      districtSystem.get(
        "transport_hub"
      );

    const officePark =
      districtSystem.get(
        "office_park"
      );

    const scenic =
      districtSystem.get(
        "tourist_scenic"
      );

    const resortAccess =
      trafficDemandSystem
        .getDistrictAccessFactor(
          resort,
          group
        );

    const hubAccess =
      trafficDemandSystem
        .getDistrictAccessFactor(
          transportHub,
          group
        );

    assert.ok(
      resortAccess >
      hubAccess
    );

    assert.ok(
      trafficDemandSystem
        .getDistrictDeliveryFactor(
          officePark,
          deliveryHeavy
        ) >
      trafficDemandSystem
        .getDistrictDeliveryFactor(
          scenic,
          deliveryHeavy
        )
    );
  }
);


test(
  "同一商圈事件会按区域敏感度产生不同影响幅度",
  () => {
    gameState.reset();

    districtEventSystem.startEvent(
      "tourist_scenic",
      "severe_weather",
      {
        startDay: 1,
        durationDays: 1
      }
    );

    districtEventSystem.startEvent(
      "premium_residential",
      "severe_weather",
      {
        startDay: 1,
        durationDays: 1
      }
    );

    const scenic =
      districtEventSystem
        .getModifiers(
          "tourist_scenic",
          "tourist"
        );

    const residential =
      districtEventSystem
        .getModifiers(
          "premium_residential",
          "tourist"
        );

    assert.ok(
      scenic.demandMultiplier <
      residential.demandMultiplier
    );
  }
);


test(
  "商圈机会分和房源推荐分进入选址数据层",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "商圈推荐测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const property =
      propertySystem.create({
        districtId:
          "commercial_core",
        name:
          "推荐分测试铺",
        area: 120,
        usableArea: 100,
        baseMonthlyRent: 8000,
        seats: 24,
        parkingSpaces: 6
      });

    const card =
      cityPropertyPageSystem
        .buildPropertyCard(
          property,
          restaurant.id
        );

    assert.ok(
      card.recommendation.score >
      0
    );

    assert.equal(
      card.recommendation
        .districtOpportunityScore,
      districtSystem
        .getOpportunityScore(
          "commercial_core"
        )
    );

    assert.equal(
      card.district
        .deliveryDemand,
      districtSystem.get(
        "commercial_core"
      ).deliveryDemand
    );

    assert.equal(
      card.district
        .transitAccess,
      districtSystem.get(
        "commercial_core"
      ).transitAccess
    );
  }
);
