import { dataRegistry } from "../core/DataRegistry.js";

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
    return dataRegistry.has(COLLECTION, id);
  }
}

export const districtSystem = new DistrictSystem();

export {
  DistrictSystem,
  validateDistrict
};
