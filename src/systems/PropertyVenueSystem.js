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

    return {
      property,
      district,
      venueTypeId,
      venueType,
      districtAffinity: venueTypeSystem.getDistrictAffinity(venueTypeId, district),
      rentMultiplier: economicBaselineSystem.getVenueRentMultiplier(venueType, district),
      priceToleranceMultiplier: venueTypeSystem.getPriceToleranceMultiplier(venueTypeId)
    };
  }

  setVenueType(propertyId, venueTypeId) {
    const venue = venueTypeSystem.get(venueTypeId);
    if (!venue) {
      throw new Error(`Unknown venue type "${venueTypeId}"`);
    }

    const property = propertySystem.get(propertyId);

    return entitySystem.update("property", property.id, {
      venueTypeId
    });
  }
}

export const propertyVenueSystem = new PropertyVenueSystem();
export { PropertyVenueSystem };
