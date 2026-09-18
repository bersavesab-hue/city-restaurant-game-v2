export const SALES_CHANNEL_SCHEMA_VERSION = 1;

export const SALES_CHANNEL_IDS = Object.freeze([
  "dine_in",
  "pickup",
  "delivery",
  "reservation"
]);

export function validateSalesChannel(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("Sales channel must be an object");
  }

  if (
    item.schemaVersion !==
    SALES_CHANNEL_SCHEMA_VERSION
  ) {
    throw new Error(
      `Sales channel "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (!SALES_CHANNEL_IDS.includes(item.id)) {
    throw new Error(
      `Sales channel "${item.id}" has invalid id`
    );
  }

  for (const field of ["name", "description"]) {
    if (
      typeof item[field] !== "string" ||
      !item[field].trim()
    ) {
      throw new Error(
        `Sales channel "${item.id}" requires ${field}`
      );
    }
  }

  if (typeof item.defaultActive !== "boolean") {
    throw new Error(
      `Sales channel "${item.id}" has invalid defaultActive`
    );
  }

  if (
    !Number.isFinite(item.commissionRate) ||
    item.commissionRate < 0 ||
    item.commissionRate > 50
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid commissionRate`
    );
  }

  if (
    !Number.isInteger(item.packagingCostPerOrder) ||
    item.packagingCostPerOrder < 0
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid packagingCostPerOrder`
    );
  }

  for (const field of ["capacityMultiplier", "demandMultiplier"]) {
    if (
      !Number.isFinite(item[field]) ||
      item[field] <= 0 ||
      item[field] > 3
    ) {
      throw new Error(
        `Sales channel "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Number.isInteger(item.defaultOrderLimitPerHour) ||
    item.defaultOrderLimitPerHour < 1 ||
    item.defaultOrderLimitPerHour > 500
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid defaultOrderLimitPerHour`
    );
  }

  if (
    !Number.isFinite(item.defaultPriorityMultiplier) ||
    item.defaultPriorityMultiplier < 0.5 ||
    item.defaultPriorityMultiplier > 1.5
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid defaultPriorityMultiplier`
    );
  }

  const requirement = item.requirement;
  if (
    !requirement ||
    !Number.isInteger(requirement.restaurantLevel) ||
    requirement.restaurantLevel < 1 ||
    requirement.restaurantLevel > 10 ||
    !Number.isFinite(requirement.reputation) ||
    requirement.reputation < 0 ||
    !Number.isFinite(requirement.satisfaction) ||
    requirement.satisfaction < 0 ||
    requirement.satisfaction > 100
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid requirement`
    );
  }

  if (
    !Number.isFinite(item.onPremiseShare) ||
    item.onPremiseShare < 0 ||
    item.onPremiseShare > 1
  ) {
    throw new Error(
      `Sales channel "${item.id}" has invalid onPremiseShare`
    );
  }

  return true;
}
