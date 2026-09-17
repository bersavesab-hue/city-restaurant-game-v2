import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";
import { trafficDemandSystem } from "./TrafficDemandSystem.js";
import { marketCompetitionSystem } from "./MarketCompetitionSystem.js";

function round1(value) {
  return Math.round(
    value * 10
  ) / 10;
}

class MarketInsightSystem {
  getAlert(
    share,
    change
  ) {
    if (share < 15) {
      return "critical_share";
    }

    if (change <= -5) {
      return "losing_share";
    }

    if (share >= 60) {
      return "dominant";
    }

    if (change >= 5) {
      return "gaining_share";
    }

    return "stable";
  }

  recordDaily(
    restaurantId,
    day
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const schedule =
      operatingScheduleSystem.get(
        restaurantId
      );

    if (
      !schedule ||
      !schedule.enabled
    ) {
      return null;
    }

    const district =
      trafficDemandSystem
        .getDistrictForRestaurant(
          restaurantId
        );

    if (!district) {
      return null;
    }

    const demand =
      trafficDemandSystem
        .getDailyDemand(
          restaurantId,
          schedule.openHour,
          schedule.closeHour
        );

    let totalWeight = 0;
    let shareTotal = 0;
    let competitionTotal = 0;

    for (
      const hour
      of demand.hours
    ) {
      const weight =
        Math.max(
          0,
          hour.expectedVisitors ??
          0
        );

      if (weight <= 0) {
        continue;
      }

      totalWeight += weight;

      shareTotal +=
        (hour.marketShare ?? 1) *
        weight;

      competitionTotal +=
        (
          hour.competitionFactor ??
          1
        ) *
        weight;
    }

    const marketShare =
      round1(
        (
          totalWeight > 0
            ? shareTotal /
              totalWeight
            : 1
        ) *
        100
      );

    const competitionFactor =
      round1(
        (
          totalWeight > 0
            ? competitionTotal /
              totalWeight
            : 1
        ) *
        100
      );

    const previousShare =
      Number.isFinite(
        restaurant.marketShare
      )
        ? restaurant.marketShare
        : marketShare;

    const marketShareChange =
      round1(
        marketShare -
        previousShare
      );

    const snapshot =
      marketCompetitionSystem
        .getDistrictSnapshot(
          district.id
        );

    const competitorCount =
      snapshot?.competitorCount ??
      0;

    const alert =
      this.getAlert(
        marketShare,
        marketShareChange
      );

    const history =
      (
        restaurant
          .marketShareHistory ??
        []
      )
      .filter(
        item =>
          item.day !== day
      );

    history.push({
      day,

      marketShare,

      marketShareChange,

      competitorCount,

      competitionFactor,

      alert
    });

    if (
      history.length > 30
    ) {
      history.splice(
        0,
        history.length - 30
      );
    }

    const updated =
      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          previousMarketShare:
            previousShare,

          marketShare,

          marketShareChange,

          competitorCount,

          competitionFactor,

          competitionAlert:
            alert,

          marketShareHistory:
            history
        }
      );

    if (
      alert !== "stable"
    ) {
      eventBus.emit(
        "market:alert",
        {
          restaurantId,
          districtId:
            district.id,
          day,
          marketShare,
          marketShareChange,
          alert
        }
      );
    }

    return updated;
  }

  processDay(day) {
    const restaurants =
      restaurantSystem.list();

    let processed = 0;

    for (
      const restaurant
      of restaurants
    ) {
      const result =
        this.recordDaily(
          restaurant.id,
          day
        );

      if (result) {
        processed += 1;
      }
    }

    return {
      processed
    };
  }

  getSummary(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    return {
      restaurantId,

      marketShare:
        restaurant.marketShare ??
        null,

      change:
        restaurant
          .marketShareChange ??
        0,

      competitorCount:
        restaurant
          .competitorCount ??
        0,

      competitionFactor:
        restaurant
          .competitionFactor ??
        100,

      alert:
        restaurant
          .competitionAlert ??
        "stable",

      history:
        restaurant
          .marketShareHistory ??
        []
    };
  }
}

export const marketInsightSystem =
  new MarketInsightSystem();

export {
  MarketInsightSystem
};
