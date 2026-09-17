import { dataRegistry } from "../core/DataRegistry.js";
import { VENUE_TYPES } from "../data/venueTypes.js";

const COLLECTION = "venue_types";

class VenueTypeSystem {
  ensureLoaded() {
    const existing = dataRegistry.getAll(COLLECTION);

    if (existing.length === 0) {
      dataRegistry.register(COLLECTION, VENUE_TYPES, { overwrite: true });
    }

    return dataRegistry.getAll(COLLECTION);
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
    if (!venue) {
      return 1;
    }

    return venue.targetSegments?.[segmentId] ?? 1;
  }

  getDistrictAffinity(venueTypeId, district) {
    if (!district || !venueTypeId) {
      return 1;
    }

    return district.venueAffinity?.[venueTypeId] ?? 1;
  }

  getPriceToleranceMultiplier(venueTypeId) {
    const venue = this.get(venueTypeId);
    return venue?.priceToleranceMultiplier ?? 1;
  }

  getWeekendDemandMultiplier(venueTypeId) {
    const venue = this.get(venueTypeId);
    return venue?.weekendDemandMultiplier ?? 1;
  }
}

export const venueTypeSystem = new VenueTypeSystem();
export { VenueTypeSystem };
