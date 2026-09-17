import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  marketCompetitionSystem,
  trafficDemandSystem
} = app.systems;

test(
  "竞争店会抢占市场份额并降低玩家客流",
  () => {
    districtSystem.load(
      [
        {
          id:
            "competition_test",
          name:
            "竞争测试商圈",

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
          "competition_test",

        name:
          "竞争测试铺位",

        area: 60,

        seats: 20,

        baseMonthlyRent:
          5000
      });

    const restaurant =
      restaurantSystem.create({
        name:
          "玩家测试店",

        locationId:
          property.id
      });

    const before =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          12
        );

    marketCompetitionSystem
      .create({
        districtId:
          "competition_test",

        name:
          "强力竞争店",

        priceIndex: 1,

        qualityScore: 80,

        reputation: 75,

        serviceScore: 80,

        segmentFocus:
          "office_worker"
      });

    const after =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          12
        );

    assert.ok(
      after.marketShare < 1
    );

    assert.ok(
      after.competitionFactor < 1
    );

    assert.ok(
      after.expectedVisitors <
      before.expectedVisitors
    );

    const snapshot =
      marketCompetitionSystem
        .getDistrictSnapshot(
          "competition_test"
        );

    assert.equal(
      snapshot.competitorCount,
      1
    );
  }
);
