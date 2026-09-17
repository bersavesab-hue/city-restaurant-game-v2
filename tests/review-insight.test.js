import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  reviewInsightSystem
} = app.systems;

test(
  "经营问题能够被诊断且评价样本有上限",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "诊断测试店"
      });

    for (
      let i = 0;
      i < 30;
      i += 1
    ) {
      reviewInsightSystem.record({
        restaurantId:
          restaurant.id,

        experience: {
          satisfaction: 35,
          qualityScore: 40,
          priceScore: 40,
          serviceScore: 30
        },

        result: {
          visitors: 10,
          queuedVisitors: 8,
          queueAbandoned: 4,
          serviceRejectedVisitors: 2,
          failedOrders: 2
        }
      });
    }

    const diagnosis =
      reviewInsightSystem
        .getDiagnosis(
          restaurant.id
        );

    assert.ok(
      diagnosis.issues.length > 0
    );

    assert.ok(
      diagnosis.issues.some(
        item =>
          item.id ===
          "quality_low"
      )
    );

    assert.ok(
      diagnosis.issues.some(
        item =>
          item.id ===
          "queue_long"
      )
    );

    assert.ok(
      diagnosis.latestReviews.length <=
      20
    );
  }
);
