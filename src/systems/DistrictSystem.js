import { dataRegistry } from "../core/DataRegistry.js";
import {
  DISTRICT_SCHEMA_VERSION,
  validateFormalDistrict
} from "../data/districtRules.js";

const COLLECTION = "districts";

function validateDistrict(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("District must be an object");
  }

  if (typeof item.id !== "string" || !item.id.trim()) {
    throw new Error("District id is required");
  }

  if (typeof item.name !== "string" || !item.name.trim()) {
    throw new Error("District name is required");
  }

  if (
    !Number.isInteger(item.trafficIndex) ||
    item.trafficIndex < 0 ||
    item.trafficIndex > 100
  ) {
    throw new Error("trafficIndex must be 0-100");
  }

  if (
    typeof item.rentMultiplier !== "number" ||
    item.rentMultiplier <= 0
  ) {
    throw new Error("rentMultiplier must be positive");
  }

  if (
    !Number.isInteger(item.spendingPower) ||
    item.spendingPower < 0 ||
    item.spendingPower > 100
  ) {
    throw new Error("spendingPower must be 0-100");
  }

  if (
    !Number.isInteger(item.competition) ||
    item.competition < 0 ||
    item.competition > 100
  ) {
    throw new Error("competition must be 0-100");
  }

  if (
    item.customerMix !== undefined
  ) {
    if (
      !item.customerMix ||
      typeof item.customerMix !== "object" ||
      Array.isArray(item.customerMix)
    ) {
      throw new Error(
        "customerMix must be an object"
      );
    }

    let totalWeight = 0;

    for (
      const [
        segmentId,
        weight
      ]
      of Object.entries(
        item.customerMix
      )
    ) {
      if (
        !segmentId ||
        !Number.isFinite(weight) ||
        weight < 0
      ) {
        throw new Error(
          "Invalid customerMix"
        );
      }

      totalWeight += weight;
    }

    if (totalWeight <= 0) {
      throw new Error(
        "customerMix must contain positive weight"
      );
    }
  }

  if (
    item.schemaVersion ===
      DISTRICT_SCHEMA_VERSION
  ) {
    validateFormalDistrict(
      item
    );
  }

  return true;
}

class DistrictSystem {
  load(records, { overwrite = false } = {}) {
    if (!Array.isArray(records)) {
      throw new TypeError("District records must be an array");
    }

    records.forEach(validateDistrict);

    return dataRegistry.register(
      COLLECTION,
      records,
      { overwrite }
    );
  }

  get(id) {
    return dataRegistry.get(COLLECTION, id);
  }

  getAll() {
    return dataRegistry.getAll(COLLECTION);
  }

  exists(id) {
    return dataRegistry.has(
      COLLECTION,
      id
    );
  }

  getMealPeriod(
    hour
  ) {
    if (
      hour >= 5 &&
      hour <= 9
    ) {
      return "breakfast";
    }

    if (
      hour >= 10 &&
      hour <= 13
    ) {
      return "lunch";
    }

    if (
      hour >= 14 &&
      hour <= 16
    ) {
      return "afternoon";
    }

    if (
      hour >= 17 &&
      hour <= 21
    ) {
      return "dinner";
    }

    return "late_night";
  }

  getMealPeriodMultiplier(
    districtOrId,
    hour
  ) {
    const district =
      typeof districtOrId ===
        "string"
        ? this.get(
            districtOrId
          )
        : districtOrId;

    if (!district) {
      return 1;
    }

    const period =
      this.getMealPeriod(
        hour
      );

    return Number(
      district
        .mealPeriodWeights?.[
          period
        ] ??
      1
    );
  }

  getPositioningAffinity(
    districtOrId,
    positioningId
  ) {
    const district =
      typeof districtOrId ===
        "string"
        ? this.get(
            districtOrId
          )
        : districtOrId;

    if (
      !district ||
      !positioningId
    ) {
      return 1;
    }

    return Number(
      district
        .positioningAffinity?.[
          positioningId
        ] ??
      1
    );
  }

  getOpportunityScore(
    districtOrId
  ) {
    const district =
      typeof districtOrId ===
        "string"
        ? this.get(
            districtOrId
          )
        : districtOrId;

    if (!district) {
      return 0;
    }

    const traffic =
      district.trafficIndex ??
      50;

    const spending =
      district.spendingPower ??
      50;

    const competitionRelief =
      100 -
      (
        district.competition ??
        50
      );

    const transit =
      district.transitAccess ??
      50;

    const parking =
      district.parkingConvenience ??
      50;

    const delivery =
      district.deliveryDemand ??
      50;

    const rentRelief =
      Math.max(
        0,
        Math.min(
          100,
          120 -
          (
            district.rentMultiplier ??
            1
          ) *
          60
        )
      );

    return Math.round(
      traffic * 0.24 +
      spending * 0.2 +
      competitionRelief * 0.14 +
      transit * 0.1 +
      parking * 0.08 +
      delivery * 0.1 +
      rentRelief * 0.14
    );
  }
}

export const districtSystem = new DistrictSystem();

export {
  DistrictSystem,
  validateDistrict
};
