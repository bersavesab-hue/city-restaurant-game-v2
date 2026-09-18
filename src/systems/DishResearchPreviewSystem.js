import {
  ingredientCatalogSystem
} from "./IngredientCatalogSystem.js";

import {
  economicBaselineSystem
} from "./EconomicBaselineSystem.js";


const METHOD_RULES =
  Object.freeze({
    stir_fry: { id: "stir_fry", name: "炒制", baseMinutes: 12, difficultyBonus: 15, techniqueScore: 76 },
    steam: { id: "steam", name: "蒸制", baseMinutes: 18, difficultyBonus: 10, techniqueScore: 80 },
    boil: { id: "boil", name: "煮制", baseMinutes: 15, difficultyBonus: 8, techniqueScore: 72 },
    stew: { id: "stew", name: "炖煮", baseMinutes: 35, difficultyBonus: 20, techniqueScore: 82 },
    fry: { id: "fry", name: "炸制", baseMinutes: 12, difficultyBonus: 18, techniqueScore: 74 },
    cold_mix: { id: "cold_mix", name: "凉拌", baseMinutes: 8, difficultyBonus: 5, techniqueScore: 70 },
    bake: { id: "bake", name: "烤制", baseMinutes: 25, difficultyBonus: 20, techniqueScore: 79 }
  });


const QUANTITY_RULES =
  Object.freeze({
    g: { min: 10, max: 1000, step: 10, defaultValue: 150 },
    kg: { min: 0.05, max: 5, step: 0.05, defaultValue: 0.2 },
    ml: { min: 10, max: 2000, step: 10, defaultValue: 100 },
    l: { min: 0.05, max: 5, step: 0.05, defaultValue: 0.2 },
    piece: { min: 1, max: 20, step: 1, defaultValue: 1 }
  });


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function getIngredientUnitCost(ingredient) {
  const reference = ingredient?.id
    ? economicBaselineSystem.getIngredientReference(ingredient.id)
    : null;

  return reference?.normalizedUnitPrice ?? ingredient.basePurchasePrice;
}


function calculateResolvedPreview({ ingredients, method }) {
  const methodRule = METHOD_RULES[method];

  if (!methodRule) {
    throw new Error(`Unknown cooking method "${method}"`);
  }

  if (!Array.isArray(ingredients) || ingredients.length < 2 || ingredients.length > 6) {
    throw new Error("Research requires 2-6 ingredients");
  }

  let totalQuantity = 0;
  let estimatedCost = 0;
  const categories = new Set();

  for (const item of ingredients) {
    if (!item.ingredient || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error("Invalid research ingredient");
    }

    const ingredient = item.ingredient;
    totalQuantity += item.quantity;
    estimatedCost += getIngredientUnitCost(ingredient) * item.quantity;
    categories.add(ingredient.category);
  }

  const ingredientScore = clamp(
    45 + ingredients.length * 5 + categories.size * 10,
    45,
    95
  );
  const diversityScore = clamp(40 + categories.size * 15, 40, 100);
  const fixedQualityPart =
    ingredientScore * 0.45 +
    diversityScore * 0.2 +
    methodRule.techniqueScore * 0.2;

  const minQuality = clamp(Math.round(fixedQualityPart + 35 * 0.15), 1, 100);
  const maxQuality = clamp(Math.round(fixedQualityPart + 100 * 0.15), 1, 100);
  const difficulty = Math.round(
    clamp(
      15 + ingredients.length * 7 + categories.size * 4 + methodRule.difficultyBonus,
      1,
      100
    )
  );
  const cookingMinutes = Math.max(5, Math.round(methodRule.baseMinutes + ingredients.length * 2));
  const researchCost = Math.max(
    500,
    Math.round(700 + ingredients.length * 250 + difficulty * 12)
  );

  const roundedCost = Number(estimatedCost.toFixed(2));
  const minSuggestedPrice = Math.max(
    1,
    Math.round(estimatedCost * (2.1 + minQuality * 0.009))
  );
  const maxSuggestedPrice = Math.max(
    1,
    Math.round(estimatedCost * (2.1 + maxQuality * 0.009))
  );

  return {
    ingredientCount: ingredients.length,
    categoryCount: categories.size,
    totalQuantity,
    ingredientScore: Math.round(ingredientScore),
    diversityScore: Math.round(diversityScore),
    difficulty,
    cookingMinutes,
    estimatedCost: roundedCost,
    researchCost,
    qualityRange: { min: minQuality, max: maxQuality },
    suggestedPriceRange: { min: minSuggestedPrice, max: maxSuggestedPrice },
    priceModel: "reality_baseline_v1"
  };
}


class DishResearchPreviewSystem {
  getMethodRules() {
    return structuredClone(METHOD_RULES);
  }

  getQuantityRule(unit) {
    return structuredClone(
      QUANTITY_RULES[unit] ?? { min: 0.1, max: 100, step: 0.1, defaultValue: 1 }
    );
  }

  getDefaultQuantity(ingredient) {
    return this.getQuantityRule(ingredient.unit).defaultValue;
  }

  preview({ ingredients, method, balance = null }) {
    if (!Array.isArray(ingredients)) {
      throw new Error("Research ingredients are required");
    }

    const used = new Set();
    const resolved = ingredients.map((item) => {
      if (
        !item ||
        typeof item.ingredientId !== "string" ||
        used.has(item.ingredientId)
      ) {
        throw new Error("Invalid or duplicate research ingredient");
      }

      const ingredient = ingredientCatalogSystem.get(item.ingredientId);
      if (!ingredient) {
        throw new Error("Unknown research ingredient");
      }

      const rule = this.getQuantityRule(ingredient.unit);
      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity < rule.min || quantity > rule.max) {
        throw new Error(
          `${ingredient.name}用量必须在${rule.min}–${rule.max}${ingredient.unit}`
        );
      }

      used.add(item.ingredientId);
      return { ingredient, quantity };
    });

    const result = calculateResolvedPreview({ ingredients: resolved, method });

    return {
      ...result,
      affordable:
        balance === null || balance === undefined
          ? null
          : balance >= result.researchCost,
      balance
    };
  }
}


export const dishResearchPreviewSystem = new DishResearchPreviewSystem();

export {
  DishResearchPreviewSystem,
  METHOD_RULES,
  QUANTITY_RULES,
  calculateResolvedPreview,
  getIngredientUnitCost
};
