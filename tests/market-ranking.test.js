import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  operatingScheduleSystem,
  marketCompetitionSystem,
  marketRankingSystem
} = app.systems;

test(
  "商圈排名包含玩家和竞争店且份额接近100%",
  () => {
    districtSystem.load(
      [
        {
          id: "ranking_area",
          name: "排行测试商圈",
          trafficIndex: 75,
          rentMultiplier: 1,
          spendingPower: 65,
          competition: 50,

          customerMix: {
            office_worker: 70,
            resident: 30
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
          "ranking_area",

        name:
          "排行测试铺位",

        area: 80,
        seats: 20,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "玩家餐厅",

        locationId:
          property.id
      });

    operatingScheduleSystem.create({
      restaurantId:
        restaurant.id,

      openHour: 9,
      closeHour: 22
    });

    marketCompetitionSystem
      .ensureDistrict(
        "ranking_area"
      );

    const ranking =
      marketRankingSystem
        .getDistrictRanking(
          restaurant.id
        );

    assert.ok(
      ranking.totalStores >= 2
    );

    assert.ok(
      ranking.playerRank >= 1
    );

    assert.equal(
      ranking.ranking.filter(
        item => item.isPlayer
      ).length,
      1
    );

    const totalShare =
      ranking.ranking.reduce(
        (sum, item) =>
          sum +
          item.marketShare,
        0
      );

    assert.ok(
      Math.abs(
        totalShare - 100
      ) < 1
    );

    const threat =
      marketRankingSystem
        .getThreatSummary(
          restaurant.id
        );

    assert.ok(
      [
        "none",
        "low",
        "medium",
        "high"
      ].includes(
        threat.threatLevel
      )
    );
  }
);
