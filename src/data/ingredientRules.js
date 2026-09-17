export const INGREDIENT_CATEGORY = Object.freeze({
  MEAT: "meat",
  POULTRY: "poultry",
  SEAFOOD: "seafood",
  VEGETABLE: "vegetable",
  FRUIT: "fruit",
  GRAIN: "grain",
  BEAN: "bean",
  EGG: "egg",
  DAIRY: "dairy",
  SEASONING: "seasoning",
  OIL: "oil",
  DRY_GOODS: "dry_goods",
  BEVERAGE: "beverage",
  OTHER: "other"
});

export const INGREDIENT_UNIT = Object.freeze({
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  LITER: "l",
  PIECE: "piece",
  PORTION: "portion"
});

export const INGREDIENT_QUALITY = Object.freeze({
  COMMON: 1,
  GOOD: 2,
  PREMIUM: 3,
  SUPERIOR: 4,
  RARE: 5
});

export const STORAGE_TYPE = Object.freeze({
  ROOM: "room",
  CHILLED: "chilled",
  FROZEN: "frozen",
  DRY: "dry"
});

export const FRESHNESS = Object.freeze({
  FRESH: "fresh",
  NORMAL: "normal",
  AGING: "aging",
  SPOILED: "spoiled"
});

export const FRESHNESS_THRESHOLDS = Object.freeze({
  FRESH: 80,
  NORMAL: 50,
  AGING: 20,
  SPOILED: 0
});

export function getFreshnessState(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("Freshness must be a number");
  }

  if (value < 0 || value > 100) {
    throw new RangeError(
      "Freshness must be between 0 and 100"
    );
  }

  if (value >= FRESHNESS_THRESHOLDS.FRESH) {
    return FRESHNESS.FRESH;
  }

  if (value >= FRESHNESS_THRESHOLDS.NORMAL) {
    return FRESHNESS.NORMAL;
  }

  if (value >= FRESHNESS_THRESHOLDS.AGING) {
    return FRESHNESS.AGING;
  }

  return FRESHNESS.SPOILED;
}
