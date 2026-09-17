import { gameState } from "../core/GameState.js";
import { supplierSystem } from "./SupplierSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";
import { cityEconomySystem } from "./CityEconomySystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < String(value).length; index += 1) {
    hash ^= String(value).charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
      const time = gameState.getSection("time") ?? { day: 1 };
      const economy = cityEconomySystem.getState();
      const phase = (hashString(ingredientId) % 1000) / 1000 * Math.PI * 2;
      const volatility = clamp(offer?.priceVolatility ?? reference.volatility ?? 0.1, 0, 0.5);
      const marketWave = 1 + Math.sin((time.day ?? 1) * 0.47 + phase) * volatility;
      const relationshipDiscount = 1 - (supplier.relationship / 100) * 0.08;
      const qualityFactor = clamp(0.86 + (base.quality ?? 3) * 0.055, 0.9, 1.18);

      const calculated = economicBaselineSystem.calculateIngredientPrice({
        ingredientId,
        seasonFactor: economy.foodPriceIndex,
        supplyDemandFactor: marketWave,
        qualityFactor,
        contractFactor: (offer?.priceMultiplier ?? 1) * relationshipDiscount
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
        priceModel: "reality_baseline_v1"
      };
    };

    this.registered = true;
    return true;
  }
}

export const supplierPriceIntegrationSystem = new SupplierPriceIntegrationSystem();
export { SupplierPriceIntegrationSystem };
