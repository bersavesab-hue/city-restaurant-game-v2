import { entitySystem } from "../core/EntitySystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

class PropertyRentIntegrationSystem {
  calculate(property) {
    const district = districtSystem.get(property.districtId);
    if (!district) return null;

    const venueType = venueTypeSystem.get(property.venueTypeId ?? "street_shop");
    const frontageFactor = property.frontageMeters
      ? Math.max(0.88, Math.min(1.18, 0.94 + property.frontageMeters / 80))
      : 1;
    const floorFactor = (property.floorCount ?? 1) > 1 ? 0.92 : 1;

    return economicBaselineSystem.calculateMonthlyRent({
      districtId: district.id,
      area: property.usableArea ?? property.area,
      venueType,
      frontageFactor,
      floorFactor
    });
  }

  rebaseAvailableProperties() {
    let updated = 0;

    for (const property of propertySystem.list()) {
      if (property.status !== "available") continue;

      const calculation = this.calculate(property);
      if (!calculation) continue;

      entitySystem.update("property", property.id, {
        baseMonthlyRent: calculation.monthlyRent,
        monthlyRent: calculation.monthlyRent,
        rentReferencePerSquareMeter: calculation.referencePerSquareMeter,
        rentModel: "reality_baseline_v1"
      });
      updated += 1;
    }

    return updated;
  }
}

export const propertyRentIntegrationSystem = new PropertyRentIntegrationSystem();
export { PropertyRentIntegrationSystem };
