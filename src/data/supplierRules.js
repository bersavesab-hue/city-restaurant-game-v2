export const SUPPLIER_SCHEMA_VERSION = 1;

export const SUPPLIER_CAPABILITY_TIER =
  Object.freeze({
    T1: Object.freeze({
      id: "T1",
      level: 1,
      name: "基础供货",
      unlockLevel: 1,
      defaultQualityMin: 1,
      defaultQualityMax: 3,
      defaultReliability: 76,
      defaultDeliveryMinutes: 240,
      defaultPriceVolatility: 0.18,
      defaultMaxCreditDays: 0,
      gramMinimumOrder: 100,
      gramCapacityPerDay: 5000,
      pieceMinimumOrder: 2,
      pieceCapacityPerDay: 80
    }),
    T2: Object.freeze({
      id: "T2",
      level: 2,
      name: "稳定供货",
      unlockLevel: 2,
      defaultQualityMin: 2,
      defaultQualityMax: 3,
      defaultReliability: 82,
      defaultDeliveryMinutes: 180,
      defaultPriceVolatility: 0.14,
      defaultMaxCreditDays: 7,
      gramMinimumOrder: 150,
      gramCapacityPerDay: 12000,
      pieceMinimumOrder: 3,
      pieceCapacityPerDay: 160
    }),
    T3: Object.freeze({
      id: "T3",
      level: 3,
      name: "专业供货",
      unlockLevel: 4,
      defaultQualityMin: 2,
      defaultQualityMax: 4,
      defaultReliability: 88,
      defaultDeliveryMinutes: 120,
      defaultPriceVolatility: 0.1,
      defaultMaxCreditDays: 15,
      gramMinimumOrder: 250,
      gramCapacityPerDay: 25000,
      pieceMinimumOrder: 5,
      pieceCapacityPerDay: 300
    }),
    T4: Object.freeze({
      id: "T4",
      level: 4,
      name: "高端供货",
      unlockLevel: 6,
      defaultQualityMin: 3,
      defaultQualityMax: 5,
      defaultReliability: 94,
      defaultDeliveryMinutes: 90,
      defaultPriceVolatility: 0.07,
      defaultMaxCreditDays: 30,
      gramMinimumOrder: 400,
      gramCapacityPerDay: 50000,
      pieceMinimumOrder: 8,
      pieceCapacityPerDay: 600
    }),
    T5: Object.freeze({
      id: "T5",
      level: 5,
      name: "旗舰供货",
      unlockLevel: 8,
      defaultQualityMin: 4,
      defaultQualityMax: 5,
      defaultReliability: 98,
      defaultDeliveryMinutes: 60,
      defaultPriceVolatility: 0.04,
      defaultMaxCreditDays: 45,
      gramMinimumOrder: 600,
      gramCapacityPerDay: 100000,
      pieceMinimumOrder: 12,
      pieceCapacityPerDay: 1200
    })
  });

export const SUPPLIER_CAPABILITY_TIERS =
  Object.freeze(
    Object.values(
      SUPPLIER_CAPABILITY_TIER
    )
  );

export const SUPPLIER_TYPE =
  Object.freeze({
    COMPREHENSIVE: "comprehensive",
    MEAT_POULTRY: "meat_poultry",
    AQUATIC: "aquatic",
    PRODUCE_FRUIT: "produce_fruit",
    GRAIN_BEAN: "grain_bean",
    EGG_DAIRY: "egg_dairy",
    SEASONING_OIL: "seasoning_oil",
    DRY_GOODS: "dry_goods",
    BEVERAGE: "beverage",
    COLD_CHAIN: "cold_chain",
    PROCESSED: "processed",
    PREMIUM: "premium"
  });

export const SUPPLIER_TYPE_LIST =
  Object.freeze(
    Object.values(
      SUPPLIER_TYPE
    )
  );

export const SUPPLIER_PROCUREMENT_GROUPS =
  Object.freeze([
    "fresh_meat",
    "poultry",
    "aquatic",
    "produce",
    "fruit",
    "grain",
    "bean_products",
    "egg_dairy",
    "seasoning",
    "oil",
    "dry_goods",
    "beverage",
    "processed"
  ]);

export const SUPPLIER_PARTNERSHIP_STAGES =
  Object.freeze([
    Object.freeze({
      id: "new",
      name: "新合作",
      level: 1,
      minRelationship: 0,
      creditDays: 0
    }),
    Object.freeze({
      id: "regular",
      name: "稳定合作",
      level: 2,
      minRelationship: 45,
      creditDays: 3
    }),
    Object.freeze({
      id: "preferred",
      name: "优选合作",
      level: 3,
      minRelationship: 60,
      creditDays: 7
    }),
    Object.freeze({
      id: "key",
      name: "核心合作",
      level: 4,
      minRelationship: 75,
      creditDays: 15
    }),
    Object.freeze({
      id: "strategic",
      name: "战略合作",
      level: 5,
      minRelationship: 88,
      creditDays: 30
    })
  ]);

export function getSupplierCapabilityTier(
  id
) {
  return (
    SUPPLIER_CAPABILITY_TIERS.find(
      item =>
        item.id === id
    ) ??
    null
  );
}

export function validateSupplierTemplate(
  template
) {
  if (
    !template ||
    typeof template !== "object"
  ) {
    throw new TypeError(
      "Supplier template must be an object"
    );
  }

  if (
    template.schemaVersion !==
      SUPPLIER_SCHEMA_VERSION
  ) {
    throw new Error(
      "Supplier template has invalid schemaVersion"
    );
  }

  if (
    typeof template.id !== "string" ||
    !/^supplier_[a-z0-9_]+$/.test(
      template.id
    )
  ) {
    throw new Error(
      "Supplier template id must use supplier_* snake_case format"
    );
  }

  if (
    typeof template.name !== "string" ||
    !template.name.trim()
  ) {
    throw new Error(
      `Supplier "${template.id}" requires a name`
    );
  }

  const tier =
    getSupplierCapabilityTier(
      template.capabilityTier
    );

  if (!tier) {
    throw new Error(
      `Supplier "${template.id}" has invalid capabilityTier`
    );
  }

  if (
    !SUPPLIER_TYPE_LIST.includes(
      template.supplierType
    )
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid supplierType`
    );
  }

  if (
    !Array.isArray(
      template.supplyGroups
    ) ||
    template.supplyGroups.length ===
      0 ||
    new Set(
      template.supplyGroups
    ).size !==
      template.supplyGroups.length ||
    template.supplyGroups.some(
      group =>
        !SUPPLIER_PROCUREMENT_GROUPS.includes(
          group
        )
    )
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid supplyGroups`
    );
  }

  for (
    const [
      field,
      min,
      max
    ]
    of [
      ["priceIndex", 0.7, 1.5],
      ["priceVolatility", 0, 0.5],
      ["reliability", 0, 100],
      ["qualityMin", 1, 5],
      ["qualityMax", 1, 5],
      ["initialRelationship", 0, 100],
      ["minimumOrderFactor", 0.5, 2],
      ["capacityFactor", 0.5, 2]
    ]
  ) {
    if (
      !Number.isFinite(
        template[field]
      ) ||
      template[field] < min ||
      template[field] > max
    ) {
      throw new Error(
        `Supplier "${template.id}" has invalid ${field}`
      );
    }
  }

  if (
    template.qualityMin >
    template.qualityMax
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid quality range`
    );
  }

  if (
    !Number.isInteger(
      template.deliveryMinutes
    ) ||
    template.deliveryMinutes < 30 ||
    template.deliveryMinutes > 720
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid deliveryMinutes`
    );
  }

  if (
    !Number.isInteger(
      template.maxCreditDays
    ) ||
    template.maxCreditDays < 0 ||
    template.maxCreditDays > 60
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid maxCreditDays`
    );
  }

  if (
    !Number.isInteger(
      template.unlockLevel
    ) ||
    template.unlockLevel < 1 ||
    template.unlockLevel > 10
  ) {
    throw new Error(
      `Supplier "${template.id}" has invalid unlockLevel`
    );
  }

  return true;
}
