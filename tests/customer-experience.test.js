import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  customerExperienceSystem,
  trafficDemandSystem
} = app.systems;

test(
  "顾客体验会影响评分复购口碑和后续客流",
  () => {
    const good =
      restaurantSystem.create({
        name: "体验优秀店"
      });

    const bad =
      restaurantSystem.create({
        name: "体验较差店"
      });

    const goodDemand = {
      segments: [
        {
          segmentId:
            "office_worker",
          expectedVisitors: 20,
          priceFactor: 1.1
        }
      ]
    };

    const badDemand = {
      segments: [
        {
          segmentId:
            "office_worker",
          expectedVisitors: 20,
          priceFactor: 0.5
        }
      ]
    };

    customerExperienceSystem
      .recordHour({
        restaurantId:
          good.id,

        demand:
          goodDemand,

        result: {
          visitors: 20,
          completedOrders: 20,
          rejectedVisitors: 0,
          failedOrders: 0,
          queuedVisitors: 0,
          averageQuality: 92
        }
      });

    customerExperienceSystem
      .recordHour({
        restaurantId:
          bad.id,

        demand:
          badDemand,

        result: {
          visitors: 10,
          completedOrders: 5,
          rejectedVisitors: 10,
          failedOrders: 5,
          queuedVisitors: 8,
          averageQuality: 40
        }
      });

    const goodStore =
      restaurantSystem.get(
        good.id
      );

    const badStore =
      restaurantSystem.get(
        bad.id
      );

    assert.ok(
      goodStore.customerSatisfaction >
      badStore.customerSatisfaction
    );

    assert.ok(
      goodStore.repeatRate >
      badStore.repeatRate
    );

    assert.ok(
      goodStore.reviewScore >
      badStore.reviewScore
    );

    assert.ok(
      goodStore.reputation >
      badStore.reputation
    );

    const goodTraffic =
      trafficDemandSystem
        .getHourlyDemand(
          good.id,
          12
        );

    const badTraffic =
      trafficDemandSystem
        .getHourlyDemand(
          bad.id,
          12
        );

    assert.ok(
      goodTraffic.expectedVisitors >
      badTraffic.expectedVisitors
    );
  }
);
