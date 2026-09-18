import { entitySystem } from "../core/EntitySystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

class PropertyVenueSystem {
  getVenueTypeId(property) {
    return property.venueTypeId ?? "street_shop";
  }

  getContext(propertyId) {
    const property = propertySystem.get(propertyId);
    const district = districtSystem.get(property.districtId);
    const venueTypeId = this.getVenueTypeId(property);
    const venueType = venueTypeSystem.get(venueTypeId);

    const compatibility =
      venueTypeSystem
        .evaluatePropertyFit(
          venueTypeId,
          property,
          district
        );

    return {
      property,
      district,
      venueTypeId,
      venueType,

      compatibility,

      districtAffinity:
        venueTypeSystem
          .getDistrictAffinity(
            venueTypeId,
            district
          ),

      rentMultiplier:
        economicBaselineSystem
          .getVenueRentMultiplier(
            venueType,
            district
          ),

      priceToleranceMultiplier:
        venueTypeSystem
          .getPriceToleranceMultiplier(
            venueTypeId
          ),

      maintenanceMultiplier:
        venueTypeSystem
          .getMaintenanceMultiplier(
            venueTypeId
          ),

      seatCapMultiplier:
        venueType
          .seatCapMultiplier,

      deliveryBias:
        venueType.deliveryBias,

      reservationBias:
        venueType.reservationBias,

      renovationProfile:
        structuredClone(
          venueType
            .renovationProfile
        ),

      propertyRequirements:
        structuredClone(
          venueType
            .propertyRequirements
        )
    };
  }

  setVenueType(propertyId, venueTypeId) {
    const venue =
      venueTypeSystem.get(
        venueTypeId
      );

    if (!venue) {
      throw new Error(
        `Unknown venue type "${venueTypeId}"`
      );
    }

    const property =
      propertySystem.get(
        propertyId
      );

    const district =
      districtSystem.get(
        property.districtId
      );

    const compatibility =
      venueTypeSystem
        .evaluatePropertyFit(
          venueTypeId,
          property,
          district
        );

    if (
      !compatibility.eligible
    ) {
      throw new Error(
        `Venue type "${venueTypeId}" is incompatible with property "${propertyId}": ${compatibility.reasons.join(", ")}`
      );
    }

    const frontageFactor =
      property.frontageMeters
        ? Math.max(
            0.88,
            Math.min(
              1.18,
              0.94 +
              property.frontageMeters /
                80
            )
          )
        : 1;

    const floorFactor =
      (
        property.floorCount ??
        1
      ) >
      1
        ? 0.92
        : 1;

    const rent =
      economicBaselineSystem
        .calculateMonthlyRent({
          districtId:
            district.id,

          area:
            property.usableArea ??
            property.area,

          venueType:
            venue,

          frontageFactor,

          floorFactor
        });

    if (!rent) {
      throw new Error(
        "Reality rent reference is unavailable for this property"
      );
    }

    return entitySystem.update(
      "property",
      property.id,
      {
        venueTypeId,

        baseMonthlyRent:
          rent.monthlyRent,

        monthlyRent:
          rent.monthlyRent,

        rentReferencePerSquareMeter:
          rent.referencePerSquareMeter,

        rentMultiplier:
          rent.multiplier,

        rentModel:
          "reality_1_to_1_v2",

        rentCurrency:
          "CNY",

        rentSource:
          rent.source
            ? structuredClone(
                rent.source
              )
            : null
      }
    );
  }

  getCompatibility(
    propertyId,
    venueTypeId
  ) {
    const property =
      propertySystem.get(
        propertyId
      );

    const district =
      districtSystem.get(
        property.districtId
      );

    return venueTypeSystem
      .evaluatePropertyFit(
        venueTypeId,
        property,
        district
      );
  }

  getRecommendations(
    propertyId,
    {
      limit = 5,
      includeIneligible =
        false
    } = {}
  ) {
    const property =
      propertySystem.get(
        propertyId
      );

    const district =
      districtSystem.get(
        property.districtId
      );

    return venueTypeSystem
      .recommendForProperty(
        property,
        district,
        {
          limit,
          includeIneligible
        }
      );
  }
}

export const propertyVenueSystem = new PropertyVenueSystem();
export { PropertyVenueSystem };
