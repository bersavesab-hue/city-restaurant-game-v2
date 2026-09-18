import { dataRegistry } from "../core/DataRegistry.js";
import {
  VENUE_TYPES_V2
} from "../data/venueTypes.v2.js";
import {
  validateVenueType
} from "../data/venueTypeRules.js";

const COLLECTION = "venue_types";
const ALL_VENUE_TYPES =
  VENUE_TYPES_V2;

class VenueTypeSystem {
  ensureLoaded({ overwrite = false } = {}) {
    const existing = dataRegistry.getAll(COLLECTION);

    const complete =
      ALL_VENUE_TYPES.every(
        item =>
          dataRegistry.has(
            COLLECTION,
            item.id
          )
      );

    if (
      overwrite ||
      !complete
    ) {
      for (
        const item
        of ALL_VENUE_TYPES
      ) {
        validateVenueType(
          item
        );
      }

      dataRegistry.register(
        COLLECTION,
        ALL_VENUE_TYPES,
        {
          overwrite: true
        }
      );
    }

    return dataRegistry.getAll(
      COLLECTION
    );
  }

  get(id) {
    this.ensureLoaded();
    return dataRegistry.get(COLLECTION, id);
  }

  getAll() {
    this.ensureLoaded();
    return dataRegistry.getAll(COLLECTION);
  }

  getSegmentMultiplier(venueTypeId, segmentId) {
    const venue = this.get(venueTypeId);
    if (!venue) return 1;
    return venue.targetSegments?.[segmentId] ?? 1;
  }

  getDistrictAffinity(
    venueTypeId,
    district
  ) {
    if (
      !district ||
      !venueTypeId
    ) {
      return 1;
    }

    return this
      .getDerivedDistrictAffinity(
        venueTypeId,
        district
      );
  }

  getPriceToleranceMultiplier(venueTypeId) {
    const venue = this.get(venueTypeId);
    return venue?.priceToleranceMultiplier ?? 1;
  }

  getWeekendDemandMultiplier(
    venueTypeId
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    return (
      venue
        ?.weekendDemandMultiplier ??
      1
    );
  }

  getEventCapacityMultiplier(
    venueTypeId
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    return (
      venue
        ?.eventCapacityMultiplier ??
      1
    );
  }

  getMaintenanceMultiplier(
    venueTypeId
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    return (
      venue
        ?.maintenanceMultiplier ??
      1
    );
  }

  getChannelCapability(
    venueTypeId,
    channelId
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    if (!venue) {
      return 1;
    }

    if (
      channelId ===
      "delivery"
    ) {
      return venue.deliveryBias;
    }

    if (
      channelId ===
      "reservation"
    ) {
      return venue.reservationBias;
    }

    if (
      channelId ===
      "dine_in"
    ) {
      return (
        venue.maxServiceStyle ===
          "delivery_only"
          ? 0
          : 1
      );
    }

    if (
      channelId ===
      "pickup"
    ) {
      return Math.max(
        0.5,
        Math.min(
          1.3,
          (
            venue.deliveryBias +
            0.8
          ) /
          1.5
        )
      );
    }

    return 1;
  }

  getDerivedDistrictAffinity(
    venueTypeId,
    district
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    if (
      !venue ||
      !district
    ) {
      return 1;
    }

    const explicit =
      district
        .venueAffinity?.[
          venueTypeId
        ];

    if (
      Number.isFinite(
        explicit
      )
    ) {
      return explicit;
    }

    const mix =
      district.customerMix ??
      {};

    let totalWeight = 0;
    let weightedFit = 0;

    for (
      const [
        segmentId,
        weight
      ]
      of Object.entries(
        mix
      )
    ) {
      if (
        !Number.isFinite(
          weight
        ) ||
        weight <= 0
      ) {
        continue;
      }

      totalWeight +=
        weight;

      weightedFit +=
        weight *
        (
          venue
            .targetSegments?.[
              segmentId
            ] ??
          1
        );
    }

    if (
      totalWeight <= 0
    ) {
      return 1;
    }

    return Math.max(
      0.65,
      Math.min(
        1.35,
        weightedFit /
        totalWeight
      )
    );
  }

  evaluatePropertyFit(
    venueTypeId,
    property,
    district = null
  ) {
    const venue =
      this.get(
        venueTypeId
      );

    if (!venue) {
      throw new Error(
        `Unknown venue type "${venueTypeId}"`
      );
    }

    if (
      !property ||
      typeof property !== "object"
    ) {
      throw new TypeError(
        "Property is required for venue compatibility"
      );
    }

    const requirements =
      venue.propertyRequirements;

    const usableArea =
      property.usableArea ??
      property.area ??
      0;

    const floorCount =
      property.floorCount ??
      property.floors?.length ??
      1;

    const reasons = [];
    const warnings = [];

    if (
      property.foodServiceAllowed ===
      false
    ) {
      reasons.push(
        "food_service_not_allowed"
      );
    }

    if (
      usableArea <
      venue.minArea
    ) {
      reasons.push(
        "area_too_small"
      );
    }

    if (
      usableArea >
      venue.maxArea
    ) {
      reasons.push(
        "area_too_large"
      );
    }

    if (
      requirements
        .requiresExhaust &&
      property.exhaustAllowed ===
        false
    ) {
      reasons.push(
        "exhaust_required"
      );
    }

    if (
      (
        property.parkingSpaces ??
        0
      ) <
      requirements
        .minParkingSpaces
    ) {
      reasons.push(
        "parking_insufficient"
      );
    }

    if (
      floorCount >
      requirements.maxFloors
    ) {
      reasons.push(
        "too_many_floors"
      );
    }

    if (
      requirements
        .minCeilingHeight >
        0
    ) {
      if (
        Number.isFinite(
          property.ceilingHeight
        )
      ) {
        if (
          property.ceilingHeight <
          requirements
            .minCeilingHeight
        ) {
          reasons.push(
            "ceiling_too_low"
          );
        }
      } else {
        warnings.push(
          "ceiling_unknown"
        );
      }
    }

    if (
      requirements
        .minFrontageMeters >
        0
    ) {
      if (
        Number.isFinite(
          property.frontageMeters
        )
      ) {
        if (
          property.frontageMeters <
          requirements
            .minFrontageMeters
        ) {
          reasons.push(
            "frontage_too_narrow"
          );
        }
      } else {
        warnings.push(
          "frontage_unknown"
        );
      }
    }

    const idealArea =
      Math.sqrt(
        venue.minArea *
        venue.maxArea
      );

    const areaDistance =
      idealArea > 0 &&
      usableArea > 0
        ? Math.abs(
            Math.log(
              usableArea /
              idealArea
            )
          )
        : 1;

    const areaScore =
      Math.max(
        35,
        Math.min(
          100,
          100 -
          areaDistance *
          34
        )
      );

    const districtAffinity =
      district
        ? this.getDistrictAffinity(
            venueTypeId,
            district
          )
        : 1;

    const parkingFit =
      Math.max(
        0,
        Math.min(
          100,
          45 +
          (
            property.parkingSpaces ??
            0
          ) *
          6 +
          (
            district
              ?.parkingConvenience ??
            50
          ) *
          0.35
        )
      );

    const score =
      Math.round(
        areaScore * 0.5 +
        Math.max(
          40,
          Math.min(
            100,
            70 +
            (
              districtAffinity -
              1
            ) *
            100
          )
        ) *
          0.35 +
        (
          100 -
          venue.parkingImportance *
          (
            100 -
            parkingFit
          )
        ) *
          0.15 -
        warnings.length *
          3
      );

    return {
      venueTypeId,
      venueName:
        venue.name,
      eligible:
        reasons.length ===
        0,
      score:
        Math.max(
          0,
          Math.min(
            100,
            score
          )
        ),
      areaScore:
        Math.round(
          areaScore
        ),
      districtAffinity:
        Number(
          districtAffinity
            .toFixed(3)
        ),
      reasons,
      warnings
    };
  }

  recommendForProperty(
    property,
    district = null,
    {
      limit = 5,
      includeIneligible =
        false
    } = {}
  ) {
    return this.getAll()
      .map(
        venue =>
          this.evaluatePropertyFit(
            venue.id,
            property,
            district
          )
      )
      .filter(
        item =>
          includeIneligible ||
          item.eligible
      )
      .sort(
        (a, b) =>
          Number(b.eligible) -
            Number(a.eligible) ||
          b.score -
            a.score ||
          a.venueTypeId
            .localeCompare(
              b.venueTypeId
            )
      )
      .slice(
        0,
        Math.max(
          1,
          limit
        )
      );
  }
}

export const venueTypeSystem = new VenueTypeSystem();
export { VenueTypeSystem, ALL_VENUE_TYPES };
