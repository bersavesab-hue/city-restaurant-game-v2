import { propertySystem } from "./PropertySystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

const BASIC_VENUES =
  new Set([
    "street_shop",
    "community_store",
    "campus_store",
    "industrial_canteen",
    "cloud_kitchen",
    "stall",
    "breakfast_store",
    "fast_service_store"
  ]);

const PREMIUM_VENUES =
  new Set([
    "mall_store",
    "clubhouse_restaurant",
    "rooftop_restaurant"
  ]);

const PRIVATE_DINING_VENUES =
  new Set([
    "villa_private_kitchen"
  ]);

const RESORT_VENUES =
  new Set([
    "mountain_resort",
    "farmhouse"
  ]);

function getUsableArea(
  property
) {
  return Math.max(
    1,
    Number(
      property.usableArea ??
      property.area
    ) ||
    1
  );
}

class RenovationRealityCostSystem {
  getRateModel(
    venueTypeId
  ) {
    const reference =
      economicBaselineSystem
        .getRenovationReference();

    if (
      PRIVATE_DINING_VENUES.has(
        venueTypeId
      )
    ) {
      return {
        tier:
          "private_dining",

        rate:
          reference
            .privateDiningPerSquareMeter
      };
    }

    if (
      RESORT_VENUES.has(
        venueTypeId
      )
    ) {
      return {
        tier:
          "standard_destination",

        rate:
          reference
            .standardPerSquareMeter,

        outdoorRate:
          reference
            .resortOutdoorPerSquareMeter
      };
    }

    if (
      PREMIUM_VENUES.has(
        venueTypeId
      )
    ) {
      return {
        tier:
          "premium",

        rate:
          reference
            .premiumPerSquareMeter
      };
    }

    if (
      BASIC_VENUES.has(
        venueTypeId
      )
    ) {
      return {
        tier:
          "basic",

        rate:
          reference
            .basicPerSquareMeter
      };
    }

    return {
      tier:
        "standard",

      rate:
        reference
          .standardPerSquareMeter
    };
  }


  calculateForProperty(
    propertyId
  ) {
    const property =
      propertySystem.get(
        propertyId
      );

    const venueTypeId =
      property.venueTypeId ??
      property.tags?.[0] ??
      "street_shop";

    const venue =
      venueTypeSystem.get(
        venueTypeId
      );

    const rateModel =
      this.getRateModel(
        venueTypeId
      );

    const area =
      getUsableArea(
        property
      );

    const baseRate =
      Math.max(
        0,
        Number(
          rateModel.rate
        ) ||
        0
      );

    const baseConstructionCost =
      Math.round(
        area *
        baseRate
      );

    const reference =
      economicBaselineSystem
        .getRenovationReference();

    return {
      propertyId,

      venueTypeId,

      venueName:
        venue?.name ??
        venueTypeId,

      area,

      tier:
        rateModel.tier,

      ratePerSquareMeter:
        baseRate,

      baseConstructionCost,

      outdoorRatePerSquareMeter:
        Number.isFinite(
          rateModel.outdoorRate
        )
          ? rateModel.outdoorRate
          : null,

      currency:
        "CNY",

      priceModel:
        "reality_1_to_1_v2",

      source: {
        sourceKind:
          reference.sourceKind ??
          null,

        sourceName:
          reference.sourceName ??
          null,

        sourceUrl:
          reference.sourceUrl ??
          null,

        observedPeriod:
          reference.observedPeriod ??
          null,

        marketRanges:
          structuredClone(
            reference.marketRanges ??
            {}
          ),

        note:
          reference.note ??
          null
      }
    };
  }


  calculateForLayout(
    layout
  ) {
    if (!layout?.propertyId) {
      return {
        propertyId:
          null,

        area:
          0,

        tier:
          "none",

        ratePerSquareMeter:
          0,

        baseConstructionCost:
          0,

        currency:
          "CNY",

        priceModel:
          "reality_1_to_1_v2",

        alreadyPaid:
          true,

        source:
          null
      };
    }

    const calculated =
      this.calculateForProperty(
        layout.propertyId
      );

    const alreadyPaid =
      Boolean(
        layout.baseRenovationPaid
      );

    return {
      ...calculated,

      alreadyPaid,

      baseConstructionCost:
        alreadyPaid
          ? 0
          : calculated
              .baseConstructionCost
    };
  }
}

export const renovationRealityCostSystem =
  new RenovationRealityCostSystem();

export {
  RenovationRealityCostSystem,
  BASIC_VENUES,
  PREMIUM_VENUES,
  PRIVATE_DINING_VENUES,
  RESORT_VENUES
};
