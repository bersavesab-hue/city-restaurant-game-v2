import { customerSegmentBootstrapSystem } from "./CustomerSegmentBootstrapSystem.js";
import { ingredientBootstrapSystem } from "./IngredientBootstrapSystem.js";
import { supplierBootstrapSystem } from "./SupplierBootstrapSystem.js";
import { dishRecipeBootstrapSystem } from "./DishRecipeBootstrapSystem.js";
import { districtBootstrapSystem } from "./DistrictBootstrapSystem.js";
import { cityExpansionMigrationSystem } from "./CityExpansionMigrationSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { expandedPropertyBootstrapSystem } from "./ExpandedPropertyBootstrapSystem.js";
import { propertyRentIntegrationSystem } from "./PropertyRentIntegrationSystem.js";
import { trafficDemandIntegrationSystem } from "./TrafficDemandIntegrationSystem.js";
import { supplierPriceIntegrationSystem } from "./SupplierPriceIntegrationSystem.js";
import { dishResearchCostIntegrationSystem } from "./DishResearchCostIntegrationSystem.js";
import { renovationPriceIntegrationSystem } from "./RenovationPriceIntegrationSystem.js";
import { economicOperatingCostSystem } from "./EconomicOperatingCostSystem.js";
import { operatingCycleSystem } from "./OperatingCycleSystem.js";

class GameFoundationSystem {
  initialize({ seedProperties = false, overwriteReferenceData = true } = {}) {
    customerSegmentBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    ingredientBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    supplierBootstrapSystem.ensureLoaded();

    dishRecipeBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    cityExpansionMigrationSystem.migrateProperties();

    districtBootstrapSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    venueTypeSystem.ensureLoaded({
      overwrite: overwriteReferenceData
    });

    renovationPriceIntegrationSystem.register();
    dishResearchCostIntegrationSystem.register();
    trafficDemandIntegrationSystem.register();
    supplierPriceIntegrationSystem.register();
    economicOperatingCostSystem.register();
    operatingCycleSystem.register();

    if (seedProperties) {
      expandedPropertyBootstrapSystem.ensureLoaded();
    }

    const rebasedProperties = propertyRentIntegrationSystem.rebaseAvailableProperties();

    return {
      customerSegments: customerSegmentBootstrapSystem.ensureLoaded(),
      ingredients: ingredientBootstrapSystem.ensureLoaded({
        overwrite: false
      }),
      dishRecipes: dishRecipeBootstrapSystem.ensureLoaded({
        overwrite: false
      }),
      suppliers: supplierBootstrapSystem.ensureLoaded(),
      districts: districtBootstrapSystem.ensureLoaded(),
      venueTypes: venueTypeSystem.getAll(),
      seedProperties,
      rebasedProperties
    };
  }
}

export const gameFoundationSystem = new GameFoundationSystem();
export { GameFoundationSystem };
