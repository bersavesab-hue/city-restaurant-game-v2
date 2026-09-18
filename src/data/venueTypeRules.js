export const VENUE_TYPE_SCHEMA_VERSION = 2;

export const VENUE_GROUPS =
  Object.freeze([
    "street",
    "commercial",
    "community",
    "institutional",
    "destination",
    "private",
    "delivery",
    "stall",
    "specialty"
  ]);

export const VENUE_SERVICE_STYLES =
  Object.freeze([
    "full_service",
    "fast_service",
    "business",
    "canteen",
    "destination",
    "private_dining",
    "experience",
    "delivery_only",
    "night_service"
  ]);

function rangeCheck(value, min, max, field, id) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `Venue type "${id}" has invalid ${field}`
    );
  }
}

export function validateVenueType(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("Venue type must be an object");
  }

  if (item.schemaVersion !== VENUE_TYPE_SCHEMA_VERSION) {
    throw new Error(
      `Venue type "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(item.id)
  ) {
    throw new Error(
      "Venue type id must use stable snake_case lowercase format"
    );
  }

  if (typeof item.name !== "string" || !item.name.trim()) {
    throw new Error(
      `Venue type "${item.id}" requires a name`
    );
  }

  if (!VENUE_GROUPS.includes(item.group)) {
    throw new Error(
      `Venue type "${item.id}" has invalid group`
    );
  }

  if (!VENUE_SERVICE_STYLES.includes(item.maxServiceStyle)) {
    throw new Error(
      `Venue type "${item.id}" has invalid maxServiceStyle`
    );
  }

  if (
    !Number.isInteger(item.minArea) ||
    !Number.isInteger(item.maxArea) ||
    item.minArea < 10 ||
    item.maxArea < item.minArea
  ) {
    throw new Error(
      `Venue type "${item.id}" has invalid area range`
    );
  }

  for (const [field, min, max] of [
    ["baseRentMultiplier", 0.2, 2.5],
    ["maintenanceMultiplier", 0.4, 2],
    ["parkingImportance", 0, 1.5],
    ["reservationBias", 0, 1.8],
    ["deliveryBias", 0, 1.8],
    ["seatCapMultiplier", 0, 1.6],
    ["priceToleranceMultiplier", 0.5, 1.6],
    ["qualityRequirementMultiplier", 0.5, 1.6],
    ["weekendDemandMultiplier", 0.5, 1.8],
    ["eventCapacityMultiplier", 0.5, 2]
  ]) {
    rangeCheck(
      item[field],
      min,
      max,
      field,
      item.id
    );
  }

  if (
    !item.propertyRequirements ||
    typeof item.propertyRequirements !== "object" ||
    Array.isArray(item.propertyRequirements)
  ) {
    throw new Error(
      `Venue type "${item.id}" requires propertyRequirements`
    );
  }

  const requirements = item.propertyRequirements;

  if (
    !Number.isInteger(requirements.minParkingSpaces) ||
    requirements.minParkingSpaces < 0 ||
    !Number.isInteger(requirements.maxFloors) ||
    requirements.maxFloors < 1 ||
    !Number.isFinite(requirements.minCeilingHeight) ||
    requirements.minCeilingHeight < 0 ||
    !Number.isFinite(requirements.minFrontageMeters) ||
    requirements.minFrontageMeters < 0 ||
    typeof requirements.requiresExhaust !== "boolean"
  ) {
    throw new Error(
      `Venue type "${item.id}" has invalid propertyRequirements`
    );
  }

  if (
    !item.renovationProfile ||
    typeof item.renovationProfile !== "object" ||
    Array.isArray(item.renovationProfile)
  ) {
    throw new Error(
      `Venue type "${item.id}" requires renovationProfile`
    );
  }

  rangeCheck(
    item.renovationProfile.minKitchenRatio,
    0,
    0.8,
    "renovationProfile.minKitchenRatio",
    item.id
  );

  rangeCheck(
    item.renovationProfile.queueSpaceBias,
    0,
    1.5,
    "renovationProfile.queueSpaceBias",
    item.id
  );

  if (
    !item.targetSegments ||
    typeof item.targetSegments !== "object" ||
    Array.isArray(item.targetSegments)
  ) {
    throw new Error(
      `Venue type "${item.id}" requires targetSegments`
    );
  }

  for (const [segmentId, multiplier] of Object.entries(item.targetSegments)) {
    if (
      !segmentId ||
      !Number.isFinite(multiplier) ||
      multiplier < 0.2 ||
      multiplier > 2
    ) {
      throw new Error(
        `Venue type "${item.id}" has invalid targetSegments`
      );
    }
  }

  return true;
}
