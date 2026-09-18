import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  PricingDecisionImpactSystem
} from "../src/systems/PricingDecisionImpactSystem.js";

test("price decision review compares before and after operating windows", () => {
  gameState.reset();

  entitySystem.create(
    "menu_price_history",
    {
      restaurantId:
        "restaurant_demo",

      menuItemId:
        "menu_1",

      dishId:
        "dish_demo",

      previousPrice:
        20,

      nextPrice:
        24,

      priceRatio:
        1.2,

      changeRate:
        0.2,

      day: 1,

      totalMinutes:
        100
    }
  );

  const makeRow = ({
    totalMinutes,
    revenue,
    wait,
    satisfaction,
    review,
    repeat,
    segmentArrivals,
    priceFactor
  }) =>
    entitySystem.create(
      "business_causality_hour",
      {
        restaurantId:
          "restaurant_demo",

        day: 1,
        hour: 12,
        totalMinutes,

        outcomes: {
          arrivals:
            segmentArrivals,

          served:
            1,

          rejected:
            0,

          revenue,

          segmentOutcomes: [
            {
              segmentId:
                "student",

              expectedVisitors:
                segmentArrivals,

              arrivals:
                segmentArrivals,

              served: 1,

              rejected: 0,

              revenue,

              averageQuality:
                75,

              priceFactor
            }
          ]
        },

        experience: {
          satisfaction,

          estimatedWaitMinutes:
            wait
        },

        feedback: {
          reviewScore:
            review,

          repeatRate:
            repeat,

          reputation:
            20,

          wordOfMouthScore:
            0,

          wordOfMouthFactor:
            1
        },

        primaryCause: {
          id:
            "price",

          label:
            "价格接受度"
        }
      }
    );

  makeRow({
    totalMinutes: 40,
    revenue: 100,
    wait: 5,
    satisfaction: 75,
    review: 4.2,
    repeat: 40,
    segmentArrivals: 10,
    priceFactor: 1
  });

  makeRow({
    totalMinutes: 80,
    revenue: 100,
    wait: 5,
    satisfaction: 75,
    review: 4.2,
    repeat: 40,
    segmentArrivals: 10,
    priceFactor: 1
  });

  makeRow({
    totalMinutes: 120,
    revenue: 130,
    wait: 8,
    satisfaction: 70,
    review: 4.1,
    repeat: 38,
    segmentArrivals: 7,
    priceFactor: 0.82
  });

  makeRow({
    totalMinutes: 160,
    revenue: 130,
    wait: 8,
    satisfaction: 70,
    review: 4.1,
    repeat: 38,
    segmentArrivals: 7,
    priceFactor: 0.82
  });

  const makeOrder = ({
    createdAt,
    revenue,
    grossProfit
  }) =>
    entitySystem.create(
      "customer_order",
      {
        restaurantId:
          "restaurant_demo",

        status:
          "completed",

        aggregate:
          false,

        createdAt,

        totalRevenue:
          revenue,

        grossProfit
      }
    );

  makeOrder({
    createdAt: 40,
    revenue: 100,
    grossProfit: 50
  });

  makeOrder({
    createdAt: 80,
    revenue: 100,
    grossProfit: 50
  });

  makeOrder({
    createdAt: 120,
    revenue: 130,
    grossProfit: 75
  });

  makeOrder({
    createdAt: 160,
    revenue: 130,
    grossProfit: 75
  });

  const system =
    new PricingDecisionImpactSystem();

  const decision =
    system.getLatestDecision(
      "restaurant_demo",
      {
        windowHours: 6
      }
    );

  assert.ok(decision);

  assert.equal(
    decision.previousPrice,
    20
  );

  assert.equal(
    decision.nextPrice,
    24
  );

  assert.equal(
    decision.priceChangePercent,
    20
  );

  assert.equal(
    decision.delta.revenue,
    30
  );

  assert.equal(
    decision.delta.grossProfit,
    50
  );

  assert.equal(
    decision.delta.averageSpend,
    30
  );

  assert.equal(
    decision.delta.waitMinutes,
    3
  );

  assert.equal(
    decision.delta.satisfaction,
    -5
  );

  assert.equal(
    decision.delta.reviewScore,
    -0.1
  );

  assert.equal(
    decision.delta.repeatRate,
    -2
  );

  const student =
    decision.segments.find(
      item =>
        item.segmentId ===
        "student"
    );

  assert.ok(student);

  assert.equal(
    student.actualTrafficChange,
    -30
  );

  assert.equal(
    student.directPriceImpact,
    -18
  );
});
