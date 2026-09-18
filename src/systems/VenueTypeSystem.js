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
}

export const venueTypeSystem = new VenueTypeSystem();
export { VenueTypeSystem, ALL_VENUE_TYPES };
