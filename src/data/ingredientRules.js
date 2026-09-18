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


export const INGREDIENT_QUALITY_LABELS =
  Object.freeze({
    1: "普通",
    2: "合格",
    3: "优良",
    4: "精品",
    5: "顶级"
  });


export const INGREDIENT_PROCUREMENT_GROUP =
  Object.freeze({
    FRESH_MEAT: "fresh_meat",
    POULTRY: "poultry",
    AQUATIC: "aquatic",
    PRODUCE: "produce",
    FRUIT: "fruit",
    GRAIN: "grain",
    BEAN_PRODUCTS: "bean_products",
    EGG_DAIRY: "egg_dairy",
    SEASONING: "seasoning",
    OIL: "oil",
    DRY_GOODS: "dry_goods",
    BEVERAGE: "beverage",
    PROCESSED: "processed"
  });


export const INGREDIENT_SCHEMA_VERSION = 1;
