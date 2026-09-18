import { renovationSystem } from "./RenovationSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

class RenovationPriceIntegrationSystem {
  constructor() {
    this.registered = false;
    this.originalGetFurnitureDefinition = null;
    this.originalGetCatalog = null;
  }

  applyReference(item) {
    const reference =
      economicBaselineSystem
        .getFurnitureReferenceDetail(
          item.id
        );

    if (
      !reference ||
      !Number.isFinite(
        reference.price
      )
    ) {
      return item;
    }

    const macro =
      economicBaselineSystem
        .getSnapshot()
        .macro?.[
          item.type ===
          "decor"
            ? "renovationIndex"
            : "equipmentIndex"
        ] ??
      1;

    return {
      ...item,

      originalGameCost:
        item.cost,

      cost:
        Math.max(
          1,
          Math.round(
            reference.price *
            macro
          )
        ),

      costModel:
        "reality_1_to_1_v2",

      costCurrency:
        "CNY",

      costReference:
        reference
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
