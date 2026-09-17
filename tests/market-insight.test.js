import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  operatingScheduleSystem,
  marketCompetitionSystem,
  marketInsightSystem
} = app.systems;

test(
  "市场份额会记录变化且历史不会无限增长",
  () => {
    districtSystem.load(
      [
        {
          id: "market_insight_area",
          name: "市场监控区",
          trafficIndex: 70,
          rentMultiplier: 1,
          spendingPower: 65,
          competition: 0,

          customerMix: {
            office_worker: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const property =
      propertySystem.create({
        districtId:
          "market_insight_area",

        name: "市场监控铺位",

        area: 80,
        seats: 20,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "市场监控测试店",

        locationId:
          property.id
      });

    operatingScheduleSystem.create({
      restaurantId:
        restaurant.id,

      openHour: 9,
      closeHour: 22
    });

    marketCompetitionSystem.create({
      districtId:
        "market_insight_area",

      name: "竞争测试店",

      priceIndex: 1,

      qualityScore: 75,

      reputation: 75,

      serviceScore: 75,

      segmentFocus:
        "office_worker"
    });

    for (
      let day = 1;
      day <= 40;
      day += 1
    ) {
      marketInsightSystem
        .recordDaily(
          restaurant.id,
          day
        );
    }

    const summary =
      marketInsightSystem
        .getSummary(
          restaurant.id
        );

    assert.ok(
      summary.marketShare >= 0 &&
      summary.marketShare <= 100
    );

    assert.ok(
      summary.competitorCount >= 1
    );

    assert.equal(
      summary.history.length,
      30
    );

    assert.ok(
      typeof summary.alert ===
      "string"
    );
  }
);
