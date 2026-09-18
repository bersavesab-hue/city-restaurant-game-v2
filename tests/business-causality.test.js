import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { entitySystem } from "../src/core/EntitySystem.js";
import { BusinessCausalitySystem } from "../src/systems/BusinessCausalitySystem.js";

test("causality identifies price pressure and queue pressure", () => {
  const system = new BusinessCausalitySystem();

  const priceCause =
    system.getPrimaryCause({
      demand: {
        competitionFactor: 1,
        segments: [
          {
            expectedVisitors: 10,
            priceFactor: 0.52
          }
        ]
      },

      result: {
        incomingVisitors: 10,
        rejectedVisitors: 0,
        estimatedWaitMinutes: 0,
        queuePatienceMinutes: 12
      },

      experience: {
        satisfaction: 62,
        qualityScore: 82,
        serviceScore: 90,
        comfortScore: 85
      }
    });

  assert.equal(
    priceCause.id,
    "price"
  );

  const queueCause =
    system.getPrimaryCause({
      demand: {
        competitionFactor: 1,
        segments: [
          {
            expectedVisitors: 10,
            priceFactor: 1
          }
        ]
      },

      result: {
        incomingVisitors: 10,
        rejectedVisitors: 3,
        estimatedWaitMinutes: 26,
        queuePatienceMinutes: 10
      },

      experience: {
        satisfaction: 55,
        qualityScore: 80,
        serviceScore: 72,
        comfortScore: 80
      }
    });

  assert.equal(
    queueCause.id,
    "queue"
  );
});

test("segment experience feeds back into future segment demand", () => {
  gameState.reset();

  const system =
    new BusinessCausalitySystem();

  entitySystem.create(
    "segment_experience_daily",
    {
      restaurantId: "restaurant_demo",
      day: 1,
      segmentId: "student",
      arrivals: 20,
      served: 12,
      rejected: 8,
      revenue: 300,
      satisfactionTotal: 45 * 12,
      satisfactionCount: 12
    }
  );

  const weak =
    system.getSegmentDemandMultiplier(
      "restaurant_demo",
      "student",
      7
    );

  entitySystem.clearType(
    "segment_experience_daily"
  );

  entitySystem.create(
    "segment_experience_daily",
    {
      restaurantId: "restaurant_demo",
      day: 1,
      segmentId: "student",
      arrivals: 20,
      served: 19,
      rejected: 1,
      revenue: 500,
      satisfactionTotal: 88 * 19,
      satisfactionCount: 19
    }
  );

  const strong =
    system.getSegmentDemandMultiplier(
      "restaurant_demo",
      "student",
      7
    );

  assert.ok(
    weak < 1
  );

  assert.ok(
    strong > weak
  );
});


test("segment price impact is visible in causality dashboard", () => {
  gameState.reset();

  entitySystem.clearType(
    "business_causality_hour"
  );

  entitySystem.clearType(
    "segment_experience_daily"
  );

  entitySystem.create(
    "business_causality_hour",
    {
      restaurantId:
        "restaurant_demo",

      day: 1,
      hour: 12,
      totalMinutes: 240,

      outcomes: {
        arrivals: 20,
        served: 16,
        rejected: 4,
        revenue: 800,

        segmentOutcomes: [
          {
            segmentId:
              "student",

            expectedVisitors: 12,
            arrivals: 12,
            served: 8,
            rejected: 4,
            revenue: 260,
            averageQuality: 72,
            priceFactor: 0.82
          },

          {
            segmentId:
              "high_income",

            expectedVisitors: 8,
            arrivals: 8,
            served: 8,
            rejected: 0,
            revenue: 540,
            averageQuality: 82,
            priceFactor: 0.98
          }
        ]
      },

      experience: {
        satisfaction: 70,
        estimatedWaitMinutes: 8
      },

      primaryCause: {
        id: "price",
        label: "价格接受度"
      }
    }
  );

  entitySystem.create(
    "segment_experience_daily",
    {
      restaurantId:
        "restaurant_demo",

      day: 1,
      segmentId:
        "student",

      arrivals: 12,
      served: 8,
      rejected: 4,
      revenue: 260,
      satisfactionTotal: 55 * 8,
      satisfactionCount: 8
    }
  );

  const system =
    new BusinessCausalitySystem();

  const dashboard =
    system.getDashboard(
      "restaurant_demo",
      7
    );

  const student =
    dashboard
      .segmentImpact
      .find(
        item =>
          item.segmentId ===
          "student"
      );

  const highIncome =
    dashboard
      .segmentImpact
      .find(
        item =>
          item.segmentId ===
          "high_income"
      );

  assert.ok(student);
  assert.ok(highIncome);

  assert.equal(
    student.priceTrafficImpact,
    -18
  );

  assert.equal(
    highIncome.priceTrafficImpact,
    -2
  );

  assert.equal(
    student.primaryDriver,
    "price"
  );
});
