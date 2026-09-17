import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class TrafficDemandSystem {
  getDistrictForRestaurant(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (!restaurant.locationId) {
      return null;
    }

    try {
      const property =
        propertySystem.get(
          restaurant.locationId
        );

      return districtSystem.get(
        property.districtId
      );
    } catch {
      return null;
    }
  }

  getFallbackDistrict() {
    return {
      id: "fallback",
      trafficIndex: 50,
      spendingPower: 50,
      competition: 20,
      customerMix: null
    };
  }

  getCustomerMix(district) {
    const segments =
      customerSegmentSystem
        .getAll();

    if (segments.length === 0) {
      return [];
    }

    const source =
      district?.customerMix;

    if (source) {
      const valid =
        Object.entries(source)
          .filter(
            ([id, weight]) =>
              customerSegmentSystem
                .exists(id) &&
              Number.isFinite(weight) &&
              weight > 0
          );

      const total =
        valid.reduce(
          (sum, [, weight]) =>
            sum + weight,
          0
        );

      if (total > 0) {
        return valid.map(
          ([segmentId, weight]) => ({
            segmentId,
            share:
              weight / total
          })
        );
      }
    }

    const share =
      1 / segments.length;

    return segments.map(
      segment => ({
        segmentId:
          segment.id,
        share
      })
    );
  }

  getMenuPriceIndex(
    restaurantId
  ) {
    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        {
          activeOnly: true
        }
      );

    if (menu.length === 0) {
      return 1;
    }

    const ratios = [];

    for (const item of menu) {
      const dish =
        dishCatalogSystem.get(
          item.dishId
        );

      if (
        dish &&
        dish.basePrice > 0
      ) {
        ratios.push(
          item.price /
          dish.basePrice
        );
      }
    }

    if (ratios.length === 0) {
      return 1;
    }

    return (
      ratios.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      ratios.length
    );
  }

  getHourlyDemand(
    restaurantId,
    hour
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const district =
      this.getDistrictForRestaurant(
        restaurantId
      ) ??
      this.getFallbackDistrict();

    const mix =
      this.getCustomerMix(
        district
      );

    const priceIndex =
      this.getMenuPriceIndex(
        restaurantId
      );

    const trafficFactor =
      clamp(
        district.trafficIndex /
          50,
        0.2,
        2.5
      );

    const competitionFactor =
      clamp(
        1 -
        district.competition *
          0.006,
        0.35,
        1
      );

    const districtSpendFactor =
      clamp(
        0.7 +
        district.spendingPower /
          200,
        0.7,
        1.2
      );

    const reputationFactor =
      clamp(
        1 +
        Math.min(
          restaurant.reputation ?? 0,
          100
        ) /
          200,
        1,
        1.5
      );

    const levelFactor =
      clamp(
        1 +
        Math.max(
          0,
          (restaurant.level ?? 1) -
            1
        ) *
          0.03,
        1,
        1.3
      );

    const segments = [];

    let expectedVisitors = 0;

    for (const item of mix) {
      const segment =
        customerSegmentSystem.get(
          item.segmentId
        );

      if (!segment) {
        continue;
      }

      const hourFactor =
        customerSegmentSystem
          .getHourWeight(
            segment.id,
            hour
          ) /
        100;

      const markup =
        Math.max(
          0,
          priceIndex - 1
        );

      const discount =
        Math.max(
          0,
          1 - priceIndex
        );

      const priceFactor =
        clamp(
          1 -
          markup *
            (
              segment
                .priceSensitivity /
              100
            ) *
            0.9 +
          discount *
            (
              segment
                .priceSensitivity /
              100
            ) *
            0.35 +
          (
            segment.spendingPower -
            50
          ) /
            300,
          0.35,
          1.35
        );

      const demand =
        4 *
        item.share *
        hourFactor *
        trafficFactor *
        competitionFactor *
        districtSpendFactor *
        priceFactor *
        reputationFactor *
        levelFactor;

      expectedVisitors += demand;

      segments.push({
        segmentId:
          segment.id,

        share:
          item.share,

        hourFactor,

        priceFactor,

        expectedVisitors:
          demand
      });
    }

    return {
      restaurantId,
      hour,

      districtId:
        district.id,

      expectedVisitors:
        Math.max(
          0,
          expectedVisitors
        ),

      priceIndex,

      trafficFactor,
      competitionFactor,
      districtSpendFactor,
      reputationFactor,
      levelFactor,

      segments
    };
  }

  getDailyDemand(
    restaurantId,
    openHour,
    closeHour
  ) {
    let expectedVisitors = 0;

    const hours = [];

    for (
      let hour = openHour;
      hour < closeHour;
      hour += 1
    ) {
      const result =
        this.getHourlyDemand(
          restaurantId,
          hour
        );

      expectedVisitors +=
        result.expectedVisitors;

      hours.push(result);
    }

    return {
      restaurantId,
      expectedVisitors,
      hours
    };
  }
}

export const trafficDemandSystem =
  new TrafficDemandSystem();

export { TrafficDemandSystem };
