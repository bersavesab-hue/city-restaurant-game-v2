import { gameState } from "../core/GameState.js";
import { supplierSystem } from "./SupplierSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";
import { cityEconomySystem } from "./CityEconomySystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class SupplierPriceIntegrationSystem {
  constructor() {
    this.registered = false;
    this.originalGetQuote = null;
  }

  register() {
    if (this.registered) {
      return false;
    }

    this.originalGetQuote = supplierSystem.getQuote.bind(supplierSystem);

    supplierSystem.getQuote = (supplierId, ingredientId, quantity) => {
      const base = this.originalGetQuote(supplierId, ingredientId, quantity);
      const reference = economicBaselineSystem.getIngredientReference(ingredientId);

      if (!reference) {
        return base;
      }

      const supplier = supplierSystem.get(supplierId);
      const offer = supplierSystem.getOffer(supplierId, ingredientId);
      const relationshipDiscount =
        1 -
        (
          supplier.relationship /
          100
        ) *
        0.08;

      const qualityFactor =
        clamp(
          0.86 +
          (
            base.quality ??
            3
          ) *
          0.055,
          0.9,
          1.18
        );

      const calculated =
        economicBaselineSystem
          .calculateIngredientPrice({
            ingredientId,

            seasonFactor:
              1,

            supplyDemandFactor:
              1,

            qualityFactor,

            contractFactor:
              (
                offer
                  ?.priceMultiplier ??
                1
              ) *
              relationshipDiscount
          });

      if (!calculated) {
        return base;
      }

      const unitPrice = Math.max(0.001, Number(calculated.price.toFixed(4)));
      const totalPrice = Math.max(1, Math.round(unitPrice * quantity));

      return {
        ...base,
        unitPrice,
        totalPrice,
        referenceUnitPrice: reference.normalizedUnitPrice,
        marketPriceMultiplier: calculated.multiplier,
        priceModel: "reality_1_to_1_v2"
      };
    };

    this.registered = true;
    return true;
  }
}

export const supplierPriceIntegrationSystem = new SupplierPriceIntegrationSystem();
export { SupplierPriceIntegrationSystem };
