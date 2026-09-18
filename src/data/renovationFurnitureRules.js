export const RENOVATION_FURNITURE_SCHEMA_VERSION = 1;

export const FURNITURE_SPEC_TIER =
  Object.freeze({
    T1: Object.freeze({
      id: "T1",
      order: 1,
      name: "基础款",
      unlockLevel: 1,
      costMultiplier: 1,
      effectMultiplier: 1
    }),
    T2: Object.freeze({
      id: "T2",
      order: 2,
      name: "实用款",
      unlockLevel: 2,
      costMultiplier: 1.35,
      effectMultiplier: 1.15
    }),
    T3: Object.freeze({
      id: "T3",
      order: 3,
      name: "专业款",
      unlockLevel: 4,
      costMultiplier: 1.9,
      effectMultiplier: 1.35
    }),
    T4: Object.freeze({
      id: "T4",
      order: 4,
      name: "高端款",
      unlockLevel: 6,
      costMultiplier: 2.8,
      effectMultiplier: 1.6
    }),
    T5: Object.freeze({
      id: "T5",
      order: 5,
      name: "旗舰款",
      unlockLevel: 8,
      costMultiplier: 4.1,
      effectMultiplier: 1.9
    })
  });

export const FURNITURE_SPEC_TIERS =
  Object.freeze(
    Object.values(
      FURNITURE_SPEC_TIER
    )
  );

export const FURNITURE_TYPE =
  Object.freeze({
    TABLE: "table",
    KITCHEN: "kitchen",
    KITCHEN_SUPPORT:
      "kitchen_support",
    SERVICE: "service",
    DECOR: "decor"
  });

export const FURNITURE_ROLE =
  Object.freeze({
    DINING: "dining",
    KITCHEN_STATION:
      "kitchen_station",
    PREP: "prep",
    CASHIER: "cashier",
    WAITING: "waiting",
    SERVICE: "service",
    DECOR: "decor"
  });

const VALID_TYPES =
  new Set(
    Object.values(
      FURNITURE_TYPE
    )
  );

const VALID_ROLES =
  new Set(
    Object.values(
      FURNITURE_ROLE
    )
  );

export function getFurnitureSpecTier(
  id
) {
  return (
    FURNITURE_SPEC_TIERS.find(
      item =>
        item.id === id
    ) ??
    null
  );
}

export function hasFurnitureRole(
  definition,
  role
) {
  return Boolean(
    definition?.roles
      ?.includes(
        role
      )
  );
}

export function validateFurnitureDefinition(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Furniture definition must be an object"
    );
  }

  if (
    item.schemaVersion !==
      RENOVATION_FURNITURE_SCHEMA_VERSION
  ) {
    throw new Error(
      "Furniture has invalid schemaVersion"
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      item.id
    )
  ) {
    throw new Error(
      "Furniture id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Furniture "${item.id}" requires a name`
    );
  }

  if (
    typeof item.familyId !==
      "string" ||
    !item.familyId.trim()
  ) {
    throw new Error(
      `Furniture "${item.id}" requires familyId`
    );
  }

  if (
    !getFurnitureSpecTier(
      item.specTier
    )
  ) {
    throw new Error(
      `Furniture "${item.id}" has invalid specTier`
    );
  }

  if (
    !VALID_TYPES.has(
      item.type
    )
  ) {
    throw new Error(
      `Furniture "${item.id}" has invalid type`
    );
  }

  if (
    !Array.isArray(
      item.roles
    ) ||
    item.roles.length === 0 ||
    new Set(
      item.roles
    ).size !==
      item.roles.length ||
    item.roles.some(
      role =>
        !VALID_ROLES.has(
          role
        )
    )
  ) {
    throw new Error(
      `Furniture "${item.id}" has invalid roles`
    );
  }

  for (
    const field
    of [
      "width",
      "height",
      "cost",
      "unlockLevel"
    ]
  ) {
    if (
      !Number.isInteger(
        item[field]
      ) ||
      item[field] <= 0
    ) {
      throw new Error(
        `Furniture "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    item.unlockLevel < 1 ||
    item.unlockLevel > 10
  ) {
    throw new Error(
      `Furniture "${item.id}" has invalid unlockLevel`
    );
  }

  for (
    const field
    of [
      "seats",
      "kitchenStations",
      "queueCapacityBonus",
      "maxCount"
    ]
  ) {
    if (
      item[field] !== undefined &&
      (
        !Number.isInteger(
          item[field]
        ) ||
        item[field] < 0
      )
    ) {
      throw new Error(
        `Furniture "${item.id}" has invalid ${field}`
      );
    }
  }

  for (
    const field
    of [
      "kitchenEfficiency",
      "serviceEfficiency",
      "queueEfficiency",
      "appeal",
      "comfort"
    ]
  ) {
    if (
      item[field] !== undefined &&
      (
        !Number.isFinite(
          item[field]
        ) ||
        item[field] < 0 ||
        item[field] > 0.25
      )
    ) {
      throw new Error(
        `Furniture "${item.id}" has invalid ${field}`
      );
    }
  }

  return true;
}
