import { renovationSystem } from "./RenovationSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

class RenovationPriceIntegrationSystem {
  constructor() {
    this.registered = false;
    this.originalGetFurnitureDefinition = null;
    this.originalGetCatalog = null;
  }

  applyReference(item) {
    const reference = economicBaselineSystem.getFurnitureReference(item.id);
    if (!Number.isFinite(reference)) {
      return item;
    }

    const macro = economicBaselineSystem.getSnapshot().macro?.[
      item.type === "decor" ? "renovationIndex" : "equipmentIndex"
    ] ?? 1;

    return {
      ...item,
      originalGameCost: item.cost,
      cost: Math.max(1, Math.round(reference * macro)),
      costModel: "reality_baseline_v1"
    };
  }

  register() {
    if (this.registered) return false;

    this.originalGetFurnitureDefinition =
      renovationSystem.getFurnitureDefinition.bind(renovationSystem);
    this.originalGetCatalog =
      renovationSystem.getCatalog.bind(renovationSystem);

    renovationSystem.getFurnitureDefinition = (id) =>
      this.applyReference(this.originalGetFurnitureDefinition(id));

    renovationSystem.getCatalog = (restaurantId = null) =>
      this.originalGetCatalog(restaurantId).map((item) => this.applyReference(item));

    this.registered = true;
    return true;
  }
}

export const renovationPriceIntegrationSystem = new RenovationPriceIntegrationSystem();
export { RenovationPriceIntegrationSystem };
