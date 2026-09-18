export const EQUIPMENT_SCHEMA_VERSION = 1;

export const EQUIPMENT_TIER =
  Object.freeze({
    T1: Object.freeze({
      id: "T1",
      order: 1,
      name: "经济型",
      unlockLevel: 1,
      costMultiplier: 1,
      capacityMultiplier: 1,
      durabilityMultiplier: 1,
      wearMultiplier: 1,
      energyMultiplier: 1
    }),
    T2: Object.freeze({
      id: "T2",
      order: 2,
      name: "标准型",
      unlockLevel: 2,
      costMultiplier: 1.45,
      capacityMultiplier: 1.18,
      durabilityMultiplier: 1.08,
      wearMultiplier: 0.92,
      energyMultiplier: 0.94
    }),
    T3: Object.freeze({
      id: "T3",
      order: 3,
      name: "专业型",
      unlockLevel: 4,
      costMultiplier: 2.15,
      capacityMultiplier: 1.42,
      durabilityMultiplier: 1.18,
      wearMultiplier: 0.82,
      energyMultiplier: 0.88
    }),
    T4: Object.freeze({
      id: "T4",
      order: 4,
      name: "高端型",
      unlockLevel: 6,
      costMultiplier: 3.3,
      capacityMultiplier: 1.72,
      durabilityMultiplier: 1.3,
      wearMultiplier: 0.72,
      energyMultiplier: 0.8
    }),
    T5: Object.freeze({
      id: "T5",
      order: 5,
      name: "旗舰型",
      unlockLevel: 8,
      costMultiplier: 5,
      capacityMultiplier: 2.1,
      durabilityMultiplier: 1.45,
      wearMultiplier: 0.62,
      energyMultiplier: 0.72
    })
  });

export const EQUIPMENT_TIERS =
  Object.freeze(
    Object.values(
      EQUIPMENT_TIER
    )
  );

export const EQUIPMENT_KIND =
  Object.freeze({
    KITCHEN: "kitchen",
    SERVICE: "service",
    CHECKOUT: "checkout",
    SUPPORT: "support"
  });

export const EQUIPMENT_ENERGY_TYPE =
  Object.freeze({
    ELECTRIC: "electric",
    GAS: "gas",
    MIXED: "mixed",
    NONE: "none"
  });

export const EQUIPMENT_CAPABILITIES =
  Object.freeze([
    "range",
    "wok",
    "steamer",
    "pot",
    "stew_pot",
    "fryer",
    "flat_pan",
    "grill",
    "roaster",
    "oven",
    "claypot",
    "hotpot_burner",
    "pressure_cooker",
    "cold_prep",
    "pickling",
    "fermentation",
    "smoker",
    "sous_vide"
  ]);

export function getEquipmentTier(
  id
) {
  return (
    EQUIPMENT_TIERS.find(
      item =>
        item.id === id
    ) ??
    null
  );
}

export function validateEquipmentDefinition(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Equipment definition must be an object"
    );
  }

  if (
    item.schemaVersion !==
      EQUIPMENT_SCHEMA_VERSION
  ) {
    throw new Error(
      "Equipment has invalid schemaVersion"
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      item.id
    )
  ) {
    throw new Error(
      "Equipment id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Equipment "${item.id}" requires a name`
    );
  }

  if (!getEquipmentTier(
    item.capabilityTier
  )) {
    throw new Error(
      `Equipment "${item.id}" has invalid capabilityTier`
    );
  }

  if (
    !Object.values(
      EQUIPMENT_KIND
    ).includes(
      item.equipmentKind
    )
  ) {
    throw new Error(
      `Equipment "${item.id}" has invalid equipmentKind`
    );
  }

  if (
    !Object.values(
      EQUIPMENT_ENERGY_TYPE
    ).includes(
      item.energyType
    )
  ) {
    throw new Error(
      `Equipment "${item.id}" has invalid energyType`
    );
  }

  if (
    !Array.isArray(
      item.capabilities
    ) ||
    new Set(
      item.capabilities
    ).size !==
      item.capabilities.length ||
    item.capabilities.some(
      capability =>
        !EQUIPMENT_CAPABILITIES.includes(
          capability
        )
    )
  ) {
    throw new Error(
      `Equipment "${item.id}" has invalid capabilities`
    );
  }

  for (
    const field
    of [
      "capacityPerHour",
      "purchaseCost",
      "repairCostPerPoint",
      "wearPer100Guests",
      "energyUsePerHour",
      "footprintUnits"
    ]
  ) {
    if (
      !Number.isFinite(
        item[field]
      ) ||
      item[field] < 0
    ) {
      throw new Error(
        `Equipment "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Number.isInteger(
      item.unlockLevel
    ) ||
    item.unlockLevel < 1 ||
    item.unlockLevel > 10
  ) {
    throw new Error(
      `Equipment "${item.id}" has invalid unlockLevel`
    );
  }

  if (
    !Number.isInteger(
      item.baseDurability
    ) ||
    item.baseDurability < 60 ||
    item.baseDurability > 160
  ) {
    throw new Error(
      `Equipment "${item.id}" has invalid baseDurability`
    );
  }

  return true;
}
