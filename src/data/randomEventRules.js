export const RANDOM_EVENT_SCHEMA_VERSION = 1;

export const RANDOM_EVENT_CATEGORIES = Object.freeze([
  "weather",
  "infrastructure",
  "community",
  "commercial",
  "education",
  "office_cycle",
  "competition",
  "supply",
  "labor",
  "equipment",
  "compliance",
  "reputation",
  "cost",
  "delivery",
  "opportunity"
]);

export const RANDOM_EVENT_POLARITIES = Object.freeze([
  "positive",
  "negative",
  "mixed"
]);

export const RANDOM_EVENT_MULTIPLIER_FIELDS = Object.freeze([
  "demandMultiplier",
  "spendingMultiplier",
  "playerAppealMultiplier",
  "supplyPriceMultiplier",
  "deliveryTimeMultiplier",
  "payrollCostMultiplier",
  "equipmentFailureMultiplier",
  "operatingCostMultiplier",
  "competitorPressureMultiplier"
]);

function finiteRange(range, field, id, min, max) {
  if (
    !range ||
    typeof range !== "object" ||
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    range.min < min ||
    range.max > max ||
    range.min > range.max
  ) {
    throw new Error(
      `Random event "${id}" has invalid ${field}`
    );
  }
}

function validateWeightMap(value, field, id) {
  if (value === undefined) {
    return;
  }

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.entries(value).some(
      ([key, weight]) =>
        !key ||
        !Number.isFinite(weight) ||
        weight < 0
    )
  ) {
    throw new Error(
      `Random event "${id}" has invalid ${field}`
    );
  }
}

export function validateRandomEvent(item) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Random event must be an object"
    );
  }

  if (
    item.schemaVersion !==
      RANDOM_EVENT_SCHEMA_VERSION
  ) {
    throw new Error(
      `Random event "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z0-9_]+$/.test(item.id)
  ) {
    throw new Error(
      "Random event requires a stable snake_case id"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Random event "${item.id}" requires a name`
    );
  }

  if (
    typeof item.description !== "string" ||
    !item.description.trim()
  ) {
    throw new Error(
      `Random event "${item.id}" requires a description`
    );
  }

  if (
    !RANDOM_EVENT_CATEGORIES.includes(
      item.category
    )
  ) {
    throw new Error(
      `Random event "${item.id}" has invalid category`
    );
  }

  if (
    !RANDOM_EVENT_POLARITIES.includes(
      item.polarity
    )
  ) {
    throw new Error(
      `Random event "${item.id}" has invalid polarity`
    );
  }

  if (
    !Number.isInteger(item.severity) ||
    item.severity < 1 ||
    item.severity > 5
  ) {
    throw new Error(
      `Random event "${item.id}" has invalid severity`
    );
  }

  if (
    !Number.isFinite(item.weight) ||
    item.weight <= 0
  ) {
    throw new Error(
      `Random event "${item.id}" has invalid weight`
    );
  }

  finiteRange(
    item.durationRange,
    "durationRange",
    item.id,
    1,
    30
  );

  if (
    !Number.isInteger(item.durationRange.min) ||
    !Number.isInteger(item.durationRange.max)
  ) {
    throw new Error(
      `Random event "${item.id}" duration must use integer days`
    );
  }

  validateWeightMap(
    item.districtWeights,
    "districtWeights",
    item.id
  );

  validateWeightMap(
    item.seasonWeights,
    "seasonWeights",
    item.id
  );

  const modifiers =
    item.modifiers ?? {};

  for (
    const field
    of RANDOM_EVENT_MULTIPLIER_FIELDS
  ) {
    const value =
      modifiers[field] ?? 1;

    if (
      !Number.isFinite(value) ||
      value < 0.45 ||
      value > 2
    ) {
      throw new Error(
        `Random event "${item.id}" has invalid modifier ${field}`
      );
    }
  }

  validateWeightMap(
    modifiers.segmentMultipliers,
    "modifiers.segmentMultipliers",
    item.id
  );

  return true;
}
