import { customerSegmentBootstrapSystem } from "./CustomerSegmentBootstrapSystem.js";
import { districtBootstrapSystem } from "./DistrictBootstrapSystem.js";
import { cityExpansionMigrationSystem } from "./CityExpansionMigrationSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { expandedPropertyBootstrapSystem } from "./ExpandedPropertyBootstrapSystem.js";
import { trafficDemandIntegrationSystem } from "./TrafficDemandIntegrationSystem.js";
import { supplierPriceIntegrationSystem } from "./SupplierPriceIntegrationSystem.js";
import { operatingCycleSystem } from "./OperatingCycleSystem.js";

class GameFoundationSystem {
  initialize({ seedProperties = false, overwriteReferenceData = true } = {}) {
    customerSegmentBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    cityExpansionMigrationSystem.migrateProperties();

    districtBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    venueTypeSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    if (seedProperties) {
      expandedPropertyBootstrapSystem.ensureLoaded();
    }

    trafficDemandIntegrationSystem.register();
    supplierPriceIntegrationSystem.register();
    operatingCycleSystem.register();

    return {
      customerSegments: customerSegmentBootstrapSystem.ensureLoaded(),
      districts: districtBootstrapSystem.ensureLoaded(),
      venueTypes: venueTypeSystem.getAll(),
      seedProperties
    };
  }
}

export const gameFoundationSystem = new GameFoundationSystem();
export { GameFoundationSystem };
