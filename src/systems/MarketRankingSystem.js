import { restaurantSystem } from "./RestaurantSystem.js";
import { trafficDemandSystem } from "./TrafficDemandSystem.js";
import { marketCompetitionSystem } from "./MarketCompetitionSystem.js";
import { marketInsightSystem } from "./MarketInsightSystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function round1(value) {
  return Math.round(
    value * 10
  ) / 10;
}

class MarketRankingSystem {
  getPlayerShare(
    restaurantId
  ) {
    const summary =
      marketInsightSystem.getSummary(
        restaurantId
      );

    if (
      Number.isFinite(
        summary.marketShare
      )
    ) {
      return clamp(
        summary.marketShare / 100,
        0,
        1
      );
    }

    const schedule =
      operatingScheduleSystem.get(
        restaurantId
      );

    if (
      schedule &&
      schedule.enabled
    ) {
      const demand =
        trafficDemandSystem
          .getDailyDemand(
            restaurantId,
            schedule.openHour,
            schedule.closeHour
          );

      let weight = 0;
      let total = 0;

      for (
        const hour
        of demand.hours
      ) {
        const amount =
          Math.max(
            0,
            hour.expectedVisitors ??
            0
          );

        weight += amount;

        total +=
          (hour.marketShare ?? 1) *
          amount;
      }

      if (weight > 0) {
        return clamp(
          total / weight,
          0,
          1
        );
      }
    }

    return clamp(
      trafficDemandSystem
        .getHourlyDemand(
          restaurantId,
          12
        )
        .marketShare ?? 1,
      0,
      1
    );
  }

  getCompetitorAppeals(
    district
  ) {
    const mix =
      trafficDemandSystem
        .getCustomerMix(
          district
        );

    const competitors =
      marketCompetitionSystem
        .ensureDistrict(
          district.id
        )
        .filter(
          item => item.active
        );

    return competitors.map(
      competitor => {
        let appeal = 0;

        for (const item of mix) {
          appeal +=
            item.share *
            marketCompetitionSystem
              .getCompetitorAppeal(
                competitor,
                item.segmentId
              );
        }

        return {
          competitor,
          appeal
        };
      }
    );
  }

  getDistrictRanking(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const district =
      trafficDemandSystem
        .getDistrictForRestaurant(
          restaurantId
        );

    if (!district) {
      return {
        restaurantId,
        districtId: null,
        playerRank: 1,
        totalStores: 1,
        ranking: []
      };
    }

    const playerShare =
      this.getPlayerShare(
        restaurantId
      );

    const competitors =
      this.getCompetitorAppeals(
        district
      );

    const totalAppeal =
      competitors.reduce(
        (sum, item) =>
          sum + item.appeal,
        0
      );

    const remainingShare =
      Math.max(
        0,
        1 - playerShare
      );

    const ranking = [
      {
        id: restaurantId,
        type: "player",
        name: restaurant.name,
        isPlayer: true,

        marketShare:
          round1(
            playerShare * 100
          ),

        reputation:
          restaurant.reputation ??
          0,

        reviewScore:
          restaurant.reviewScore ??
          3
      }
    ];

    for (
      const item
      of competitors
    ) {
      const share =
        totalAppeal > 0
          ? remainingShare *
            (
              item.appeal /
              totalAppeal
            )
          : 0;

      ranking.push({
        id:
          item.competitor.id,

        type:
          "competitor",

        name:
          item.competitor.name,

        isPlayer: false,

        marketShare:
          round1(
            share * 100
          ),

        priceIndex:
          item.competitor
            .priceIndex,

        qualityScore:
          item.competitor
            .qualityScore,

        reputation:
          item.competitor
            .reputation,

        serviceScore:
          item.competitor
            .serviceScore,

        strategy:
          item.competitor
            .strategy ??
          "stable",

        healthScore:
          item.competitor
            .healthScore ??
          null
      });
    }

    ranking.sort(
      (a, b) =>
        b.marketShare -
        a.marketShare
    );

    ranking.forEach(
      (item, index) => {
        item.rank =
          index + 1;
      }
    );

    const player =
      ranking.find(
        item =>
          item.isPlayer
      );

    return {
      restaurantId,

      districtId:
        district.id,

      districtName:
        district.name,

      playerRank:
        player?.rank ?? 1,

      playerMarketShare:
        player?.marketShare ?? 100,

      totalStores:
        ranking.length,

      ranking
    };
  }

  getThreatSummary(
    restaurantId
  ) {
    const market =
      this.getDistrictRanking(
        restaurantId
      );

    const player =
      market.ranking.find(
        item =>
          item.isPlayer
      );

    const competitors =
      market.ranking.filter(
        item =>
          !item.isPlayer
      );

    const strongest =
      competitors[0] ??
      null;

    if (!strongest) {
      return {
        ...market,
        threatLevel: "none",
        strongestCompetitor:
          null,
        shareGap: 0
      };
    }

    const gap =
      round1(
        strongest.marketShare -
        (
          player?.marketShare ??
          0
        )
      );

    let threatLevel =
      "low";

    if (
      strongest.marketShare >=
      (
        player?.marketShare ??
        0
      )
    ) {
      threatLevel =
        "high";
    } else if (
      gap >= -10
    ) {
      threatLevel =
        "medium";
    }

    return {
      ...market,

      threatLevel,

      strongestCompetitor:
        strongest,

      shareGap:
        gap
    };
  }
}

export const marketRankingSystem =
  new MarketRankingSystem();

export {
  MarketRankingSystem
};
