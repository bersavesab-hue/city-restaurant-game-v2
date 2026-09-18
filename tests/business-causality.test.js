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
