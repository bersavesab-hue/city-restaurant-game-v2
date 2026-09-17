import { dishResearchSystem } from "./DishResearchSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

class DishResearchCostIntegrationSystem {
  constructor() {
    this.registered = false;
    this.originalAnalyze = null;
  }

  calculateRealityIngredientCost(ingredients) {
    return ingredients.reduce((sum, item) => {
      const ingredient = ingredientCatalogSystem.get(item.ingredientId);
      if (!ingredient) return sum;

      const reference = economicBaselineSystem.getIngredientReference(item.ingredientId);
      const unitCost = reference?.normalizedUnitPrice ?? ingredient.basePurchasePrice;
      return sum + unitCost * item.quantity;
    }, 0);
  }

  register() {
    if (this.registered) return false;

    this.originalAnalyze = dishResearchSystem.analyze.bind(dishResearchSystem);

    dishResearchSystem.analyze = ({ ingredients, method }) => {
      const base = this.originalAnalyze({ ingredients, method });
      const estimatedCost = this.calculateRealityIngredientCost(ingredients);
      const gradeLevel =
        base.grade === "SS" ? 5 :
        base.grade === "S" ? 4 :
        base.grade === "A" ? 3 :
        base.grade === "B" ? 2 : 1;
      const markup = 2.1 + gradeLevel * 0.28;

      return {
        ...base,
        estimatedCost: Number(estimatedCost.toFixed(2)),
        suggestedPrice: Math.max(1, Math.round(estimatedCost * markup)),
        priceModel: "reality_baseline_v1"
      };
    };

    this.registered = true;
    return true;
  }
}

export const dishResearchCostIntegrationSystem = new DishResearchCostIntegrationSystem();
export { DishResearchCostIntegrationSystem };
