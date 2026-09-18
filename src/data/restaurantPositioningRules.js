export const RESTAURANT_POSITIONING_SCHEMA_VERSION = 1;

export const POSITIONING_MARKETING_CATEGORIES = Object.freeze([
  "local_acquisition",
  "discount_conversion",
  "brand_building",
  "content_social",
  "delivery_growth",
  "community_scene",
  "member_retention",
  "group_business",
  "seasonal_event"
]);

function validateWeightMap(value, field, id, min = 0.2, max = 2) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `Positioning "${id}" has invalid ${field}`
    );
  }

  for (
    const [key, weight]
    of Object.entries(value)
  ) {
    if (
      !key ||
      !Number.isFinite(weight) ||
      weight < min ||
      weight > max
    ) {
      throw new Error(
        `Positioning "${id}" has invalid ${field}`
      );
    }
  }
}

export function validateRestaurantPositioning(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("Restaurant positioning must be an object");
  }

  if (
    item.schemaVersion !==
    RESTAURANT_POSITIONING_SCHEMA_VERSION
  ) {
    throw new Error(
      `Positioning "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z0-9_]+$/.test(item.id)
  ) {
    throw new Error(
      "Restaurant positioning requires a stable snake_case id"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim() ||
    typeof item.description !== "string" ||
    !item.description.trim()
  ) {
    throw new Error(
      `Positioning "${item.id}" requires name and description`
    );
  }

  if (
    !Number.isInteger(item.minRestaurantLevel) ||
    item.minRestaurantLevel < 1 ||
    item.minRestaurantLevel > 10
  ) {
    throw new Error(
      `Positioning "${item.id}" has invalid minRestaurantLevel`
    );
  }

  if (
    !Array.isArray(item.priceRange) ||
    item.priceRange.length !== 2 ||
    !item.priceRange.every(Number.isFinite) ||
    item.priceRange[0] <= 0 ||
    item.priceRange[0] > item.priceRange[1]
  ) {
    throw new Error(
      `Positioning "${item.id}" has invalid priceRange`
    );
  }

  validateWeightMap(item.targetSegments, "targetSegments", item.id);
  validateWeightMap(item.categoryWeights, "categoryWeights", item.id);
  validateWeightMap(item.venueWeights, "venueWeights", item.id);
  validateWeightMap(
    item.marketingCategoryWeights,
    "marketingCategoryWeights",
    item.id
  );

  for (const category of Object.keys(item.marketingCategoryWeights)) {
    if (!POSITIONING_MARKETING_CATEGORIES.includes(category)) {
      throw new Error(
        `Positioning "${item.id}" references invalid marketing category "${category}"`
      );
    }
  }

  const renovation = item.renovationProfile;
  if (
    !renovation ||
    !["throughput", "comfort", "appeal"].every(
      field =>
        Number.isFinite(renovation[field]) &&
        renovation[field] >= 0 &&
        renovation[field] <= 1
    )
  ) {
    throw new Error(
      `Positioning "${item.id}" has invalid renovationProfile`
    );
  }

  const total =
    renovation.throughput +
    renovation.comfort +
    renovation.appeal;

  if (Math.abs(total - 1) > 0.001) {
    throw new Error(
      `Positioning "${item.id}" renovationProfile must total 1`
    );
  }

  if (
    !Number.isFinite(item.competitionTolerance) ||
    item.competitionTolerance < 0 ||
    item.competitionTolerance > 1
  ) {
    throw new Error(
      `Positioning "${item.id}" has invalid competitionTolerance`
    );
  }

  return true;
}
