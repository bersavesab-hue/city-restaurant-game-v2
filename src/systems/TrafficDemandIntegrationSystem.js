import { gameState } from "../core/GameState.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { trafficDemandSystem } from "./TrafficDemandSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";
import { priceHistorySystem } from "./PriceHistorySystem.js";
import { cityEconomySystem } from "./CityEconomySystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class TrafficDemandIntegrationSystem {
  constructor() {
    this.registered = false;
    this.originalGetHourlyDemand = null;
  }

  getContext(restaurantId) {
    const restaurant = restaurantSystem.get(restaurantId);
    let property = null;
    let district = null;

    if (restaurant.locationId) {
      try {
        property = propertySystem.get(restaurant.locationId);
        district = districtSystem.get(property.districtId);
      } catch {
        property = null;
        district = null;
      }
    }

    const venueTypeId = property?.venueTypeId ?? "street_shop";
    const venue = venueTypeSystem.get(venueTypeId);
    const time = gameState.getSection("time") ?? { day: 1 };
    const weekday = ((time.day ?? 1) - 1) % 7;
    const weekend = weekday === 5 || weekday === 6;

    return {
      restaurant,
      property,
      district,
      venueTypeId,
      venue,
      weekend,
      districtAffinity: venueTypeSystem.getDistrictAffinity(venueTypeId, district),
      priceTolerance: venueTypeSystem.getPriceToleranceMultiplier(venueTypeId),
      weekendDemandMultiplier: weekend
        ? venueTypeSystem.getWeekendDemandMultiplier(venueTypeId)
        : 1,
      cityDemandMultiplier: district
        ? cityEconomySystem.getDemandMultiplier(district.id)
        : 1
    };
  }

  decorateResult(restaurantId, result) {
    const context = this.getContext(restaurantId);

    const softCityFactor = clamp(
      1 + (context.cityDemandMultiplier - 1) * 0.5,
      0.72,
      1.32
    );

    const districtVenueFactor = clamp(context.districtAffinity, 0.45, 1.55);
    const commonFactor =
      softCityFactor *
      districtVenueFactor *
      context.weekendDemandMultiplier;

    let expectedVisitors = 0;

    const segments = (result.segments ?? []).map((entry) => {
      const segment = customerSegmentSystem.get(entry.segmentId);

      if (!segment) {
        expectedVisitors += entry.expectedVisitors ?? 0;
        return entry;
      }

      const elasticity = economicBaselineSystem.calculatePriceElasticity({
        priceRatio: result.priceIndex ?? 1,
        priceSensitivity: segment.priceSensitivity,
        spendingPower: segment.spendingPower,
        venuePriceTolerance: context.priceTolerance
      });

      const previousPriceFactor = Math.max(0.08, entry.priceFactor ?? 1);
      const priceCorrection = clamp(
        elasticity.demandFactor / previousPriceFactor,
        0.45,
        1.65
      );

      const priceShock = priceHistorySystem.getShockMultiplier(
        restaurantId,
        segment,
        7
      );

      const venueSegmentFactor = clamp(
        venueTypeSystem.getSegmentMultiplier(context.venueTypeId, segment.id),
        0.25,
        1.55
      );

      const adjustedVisitors = Math.max(
        0,
        (entry.expectedVisitors ?? 0) *
          priceCorrection *
          priceShock *
          venueSegmentFactor *
          commonFactor
      );

      expectedVisitors += adjustedVisitors;

      return {
        ...entry,
        expectedVisitors: adjustedVisitors,
        priceFactor: elasticity.demandFactor,
        priceElasticityFactor: elasticity.demandFactor,
        priceShockFactor: priceShock,
        venueSegmentFactor,
        venueDistrictFactor: districtVenueFactor,
        cityEconomyFactor: softCityFactor,
        weekendVenueFactor: context.weekendDemandMultiplier
      };
    });

    return {
      ...result,
      expectedVisitors,
      segments,
      venueTypeId: context.venueTypeId,
      venueName: context.venue?.name ?? "临街餐馆",
      districtVenueFactor,
      cityEconomyFactor: softCityFactor,
      weekendVenueFactor: context.weekendDemandMultiplier,
      economicModel: "reality_baseline_v1"
    };
  }

  register() {
    if (this.registered) {
      return false;
    }

    this.originalGetHourlyDemand =
      trafficDemandSystem.getHourlyDemand.bind(trafficDemandSystem);

    trafficDemandSystem.getHourlyDemand = (restaurantId, hour) => {
      const base = this.originalGetHourlyDemand(restaurantId, hour);
      return this.decorateResult(restaurantId, base);
    };

    this.registered = true;
    return true;
  }
}

export const trafficDemandIntegrationSystem = new TrafficDemandIntegrationSystem();
export { TrafficDemandIntegrationSystem };
