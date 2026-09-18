export const COMPETITOR_TEMPLATE_SCHEMA_VERSION = 1;

export const COMPETITOR_STRENGTH_MIN = 1;
export const COMPETITOR_STRENGTH_MAX = 5;

export const COMPETITOR_STRATEGIES =
  Object.freeze([
    "stable",
    "discount",
    "premium",
    "quality",
    "service",
    "promotion"
  ]);

export const COMPETITOR_CATEGORIES =
  Object.freeze([
    "breakfast",
    "budget_quick",
    "community",
    "office_quick",
    "campus_value",
    "delivery_first",
    "mall_fast_casual",
    "family_dining",
    "local_specialty",
    "traditional_brand",
    "premium_dining",
    "private_kitchen",
    "hotpot_social",
    "late_night",
    "snack",
    "dessert_beverage",
    "healthy_light",
    "business_dining",
    "tourist_specialty",
    "farmhouse",
    "waterfront_seafood",
    "transport_fast",
    "industrial_meal",
    "medical_support",
    "wholesale_fast",
    "creative_theme",
    "convention_dining",
    "sports_food",
    "suburban_family",
    "chef_flagship"
  ]);

function validateRange(
  range,
  field,
  id,
  {
    min = -Infinity,
    max = Infinity,
    integer = false
  } = {}
) {
  if (
    !range ||
    typeof range !== "object" ||
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    range.min < min ||
    range.max > max ||
    range.min > range.max ||
    (
      integer &&
      (
        !Number.isInteger(range.min) ||
        !Number.isInteger(range.max)
      )
    )
  ) {
    throw new Error(
      `Competitor template "${id}" has invalid ${field}`
    );
  }
}

function validateWeights(
  value,
  field,
  id,
  {
    allowedKeys = null,
    requirePositive = false
  } = {}
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `Competitor template "${id}" requires ${field}`
    );
  }

  let total = 0;

  for (
    const [key, weight]
    of Object.entries(value)
  ) {
    if (
      !key ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      (
        allowedKeys &&
        !allowedKeys.includes(key)
      )
    ) {
      throw new Error(
        `Competitor template "${id}" has invalid ${field}`
      );
    }

    total += weight;
  }

  if (
    requirePositive &&
    total <= 0
  ) {
    throw new Error(
      `Competitor template "${id}" requires positive ${field}`
    );
  }
}

export function validateCompetitorTemplate(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Competitor template must be an object"
    );
  }

  if (
    item.schemaVersion !==
      COMPETITOR_TEMPLATE_SCHEMA_VERSION
  ) {
    throw new Error(
      `Competitor template "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z0-9_]+$/.test(item.id)
  ) {
    throw new Error(
      "Competitor template requires a stable snake_case id"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Competitor template "${item.id}" requires a name`
    );
  }

  if (
    !COMPETITOR_CATEGORIES.includes(
      item.category
    )
  ) {
    throw new Error(
      `Competitor template "${item.id}" has invalid category`
    );
  }

  if (
    !Number.isFinite(item.baseWeight) ||
    item.baseWeight <= 0
  ) {
    throw new Error(
      `Competitor template "${item.id}" has invalid baseWeight`
    );
  }

  validateRange(
    item.strengthRange,
    "strengthRange",
    item.id,
    {
      min: COMPETITOR_STRENGTH_MIN,
      max: COMPETITOR_STRENGTH_MAX,
      integer: true
    }
  );

  validateRange(
    item.priceIndexRange,
    "priceIndexRange",
    item.id,
    {
      min: 0.55,
      max: 1.8
    }
  );

  for (
    const field
    of [
      "dishStrengthRange",
      "serviceRange",
      "reputationRange"
    ]
  ) {
    validateRange(
      item[field],
      field,
      item.id,
      {
        min: 0,
        max: 100,
        integer: true
      }
    );
  }

  for (
    const field
    of [
      "marketingTendency",
      "expansionTendency",
      "discountAggression",
      "resilience",
      "innovationTendency"
    ]
  ) {
    if (
      !Number.isInteger(item[field]) ||
      item[field] < 0 ||
      item[field] > 100
    ) {
      throw new Error(
        `Competitor template "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Array.isArray(item.venueTypeFocus) ||
    item.venueTypeFocus.length === 0 ||
    item.venueTypeFocus.some(
      value =>
        typeof value !== "string" ||
        !value
    )
  ) {
    throw new Error(
      `Competitor template "${item.id}" requires venueTypeFocus`
    );
  }

  validateWeights(
    item.segmentWeights,
    "segmentWeights",
    item.id,
    {
      requirePositive: true
    }
  );

  validateWeights(
    item.districtWeights,
    "districtWeights",
    item.id,
    {
      requirePositive: true
    }
  );

  validateWeights(
    item.strategyWeights,
    "strategyWeights",
    item.id,
    {
      allowedKeys:
        COMPETITOR_STRATEGIES,
      requirePositive: true
    }
  );

  return true;
}
