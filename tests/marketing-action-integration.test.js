import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import { app } from "../src/main.js";

const {
  gameFoundationSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  marketActionSystem,
  trafficDemandSystem,
  customerExperienceSystem
} = app.systems;

function createLocatedRestaurant(
  districtId,
  name
) {
  const property =
    propertySystem.create({
      districtId,
      name:
        `${name}铺位`,
      area: 70,
      seats: 20,
      baseMonthlyRent:
        6000
    });

  const restaurant =
    restaurantSystem.create({
      name,
      locationId:
        property.id
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  return restaurant;
}

test(
  "定向营销会进入客群客流计算",
  () => {
    gameState.reset();

    gameFoundationSystem
      .initialize({
        seedProperties: false,
        overwriteReferenceData:
          true
      });

    const restaurant =
      createLocatedRestaurant(
        "university",
        "定向营销测试店"
      );

    const before =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          18
        );

    marketActionSystem
      .startAction(
        restaurant.id,
        "street_flyer"
      );

    const after =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          18
        );

    const beforeStudent =
      before.segments
        .find(
          item =>
            item.segmentId ===
            "student"
        );

    const afterStudent =
      after.segments
        .find(
          item =>
            item.segmentId ===
            "student"
        );

    assert.ok(
      after.expectedVisitors >
      before.expectedVisitors
    );

    assert.ok(
      afterStudent
        .marketingSegmentFactor >
      1
    );

    assert.ok(
      afterStudent
        .expectedVisitors >
      beforeStudent
        .expectedVisitors
    );
  }
);

test(
  "品质服务营销会进入顾客体验复购与评价计算",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "体验营销测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    restaurantSystem.setLevel(
      restaurant.id,
      2
    );

    marketActionSystem
      .startAction(
        restaurant.id,
        "quality_campaign"
      );

    const qualityResult =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            restaurant.id,

          demand: {
            segments: []
          },

          result: {
            completedOrders: 10,
            rejectedVisitors: 0,
            failedOrders: 0,
            queuedVisitors: 0,
            visitors: 10,
            averageQuality: 70,
            estimatedWaitMinutes: 0,
            queuePatienceMinutes: 12
          }
        });

    assert.equal(
      qualityResult
        .qualityScore,
      78
    );

    assert.ok(
      qualityResult
        .marketingEffects
        .reviewPropensityMultiplier >
      1
    );

    gameState.reset();

    const serviceRestaurant =
      restaurantSystem.create({
        name:
          "服务营销测试店"
      });

    financeSystem.createAccount(
      serviceRestaurant.id,
      100000
    );

    restaurantSystem.setLevel(
      serviceRestaurant.id,
      2
    );

    marketActionSystem
      .startAction(
        serviceRestaurant.id,
        "service_campaign"
      );

    const serviceResult =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            serviceRestaurant.id,

          demand: {
            segments: []
          },

          result: {
            completedOrders: 10,
            rejectedVisitors: 0,
            failedOrders: 0,
            queuedVisitors: 2,
            visitors: 10,
            averageQuality: 70,
            estimatedWaitMinutes: 3,
            queuePatienceMinutes: 12
          }
        });

    assert.ok(
      serviceResult
        .marketingEffects
        .serviceCapacityMultiplier >
      1
    );

    assert.ok(
      serviceResult
        .marketingEffects
        .repeatIntentMultiplier >
      1
    );
  }
);
