export const STORE_PROGRESSION_SCHEMA_VERSION = 1;

export const STORE_EXPERIENCE_POLICY =
  Object.freeze({
    orderExperience:
      3,
    revenueUnit:
      1000,
    revenueExperience:
      1
  });

export const STORE_LIMIT_KEYS =
  Object.freeze([
    "employees",
    "menuItems",
    "tables",
    "kitchenStations"
  ]);

export function calculateStoreExperience({
  orders = 0,
  revenue = 0
} = {}) {
  const safeOrders =
    Math.max(
      0,
      Math.floor(
        Number(orders) || 0
      )
    );

  const safeRevenue =
    Math.max(
      0,
      Math.floor(
        Number(revenue) || 0
      )
    );

  const orderExperience =
    safeOrders *
    STORE_EXPERIENCE_POLICY
      .orderExperience;

  const revenueExperience =
    Math.floor(
      safeRevenue /
      STORE_EXPERIENCE_POLICY
        .revenueUnit
    ) *
    STORE_EXPERIENCE_POLICY
      .revenueExperience;

  return {
    total:
      orderExperience +
      revenueExperience,

    orders:
      safeOrders,

    revenue:
      safeRevenue,

    orderExperience,

    revenueExperience
  };
}

export function validateStoreLevelConfig(
  item,
  previous = null
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Store level config must be an object"
    );
  }

  if (
    item.schemaVersion !==
    STORE_PROGRESSION_SCHEMA_VERSION
  ) {
    throw new Error(
      `Store level ${item.level ?? "unknown"} has invalid schemaVersion`
    );
  }

  if (
    !Number.isInteger(
      item.level
    ) ||
    item.level < 1 ||
    item.level > 10
  ) {
    throw new Error(
      "Store level must be between 1 and 10"
    );
  }

  if (
    typeof item.title !==
      "string" ||
    !item.title.trim()
  ) {
    throw new Error(
      `Store level ${item.level} requires title`
    );
  }

  if (
    !Number.isInteger(
      item.requiredExperience
    ) ||
    item.requiredExperience < 0
  ) {
    throw new Error(
      `Store level ${item.level} has invalid requiredExperience`
    );
  }

  for (
    const key
    of STORE_LIMIT_KEYS
  ) {
    if (
      !Number.isInteger(
        item.limits?.[key]
      ) ||
      item.limits[key] < 1
    ) {
      throw new Error(
        `Store level ${item.level} has invalid limit ${key}`
      );
    }
  }

  if (
    !Array.isArray(
      item.unlocks
    )
  ) {
    throw new Error(
      `Store level ${item.level} unlocks must be an array`
    );
  }

  if (previous) {
    if (
      item.level !==
      previous.level + 1
    ) {
      throw new Error(
        "Store levels must be sequential"
      );
    }

    if (
      item.requiredExperience <=
      previous.requiredExperience
    ) {
      throw new Error(
        "Store experience thresholds must increase"
      );
    }

    for (
      const key
      of STORE_LIMIT_KEYS
    ) {
      if (
        item.limits[key] <
        previous.limits[key]
      ) {
        throw new Error(
          `Store limit ${key} cannot decrease`
        );
      }
    }
  }

  return true;
}
