import {
  DISH_CATEGORY
} from "./dishCatalogRules.js";

export const COOKING_METHOD_SCHEMA_VERSION = 1;

export const COOKING_METHOD_DATASET_META =
  Object.freeze({
    schemaVersion:
      COOKING_METHOD_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total:
      22
  });

export const COOKING_METHOD_ID_PATTERN =
  /^[a-z][a-z0-9_]*$/;

export const COOKING_EQUIPMENT_CAPABILITY =
  Object.freeze({
    RANGE: "range",
    WOK: "wok",
    STEAMER: "steamer",
    POT: "pot",
    STEW_POT: "stew_pot",
    FRYER: "fryer",
    FLAT_PAN: "flat_pan",
    GRILL: "grill",
    ROASTER: "roaster",
    OVEN: "oven",
    CLAYPOT: "claypot",
    HOTPOT_BURNER: "hotpot_burner",
    PRESSURE_COOKER: "pressure_cooker",
    COLD_PREP: "cold_prep",
    PICKLING: "pickling",
    FERMENTATION: "fermentation",
    SMOKER: "smoker",
    SOUS_VIDE: "sous_vide"
  });

const VALID_EQUIPMENT_CAPABILITIES =
  new Set(
    Object.values(
      COOKING_EQUIPMENT_CAPABILITY
    )
  );

export const COOKING_METHODS_V1 =
  Object.freeze([
    {
      schemaVersion: 1,
      id: "stir_fry",
      name: "炒制",
      icon: "炒",
      description: "高温快速翻炒，出餐快、火候要求高",
      baseMinutes: 12,
      difficultyBonus: 15,
      techniqueScore: 76,
      defaultCategory: DISH_CATEGORY.STIR_FRY,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "wok"]
    },
    {
      schemaVersion: 1,
      id: "steam",
      name: "蒸制",
      icon: "蒸",
      description: "利用蒸汽加热，稳定保留食材风味",
      baseMinutes: 18,
      difficultyBonus: 10,
      techniqueScore: 80,
      defaultCategory: DISH_CATEGORY.RICE,
      requiresExhaust: false,
      equipmentCapabilities: ["steamer"]
    },
    {
      schemaVersion: 1,
      id: "boil",
      name: "煮制",
      icon: "煮",
      description: "水或汤汁持续加热，适合粉面和汤羹",
      baseMinutes: 15,
      difficultyBonus: 8,
      techniqueScore: 72,
      defaultCategory: DISH_CATEGORY.NOODLE,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "pot"]
    },
    {
      schemaVersion: 1,
      id: "stew",
      name: "炖煮",
      icon: "炖",
      description: "较长时间小火炖制，强调入味与稳定",
      baseMinutes: 35,
      difficultyBonus: 20,
      techniqueScore: 82,
      defaultCategory: DISH_CATEGORY.SOUP,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "stew_pot"]
    },
    {
      schemaVersion: 1,
      id: "braise",
      name: "红烧",
      icon: "烧",
      description: "煎炒后加汁烧制，强调收汁和复合风味",
      baseMinutes: 30,
      difficultyBonus: 22,
      techniqueScore: 84,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "wok"]
    },
    {
      schemaVersion: 1,
      id: "simmer",
      name: "煨煮",
      icon: "煨",
      description: "低火慢煨，适合汤品和软烂菜肴",
      baseMinutes: 45,
      difficultyBonus: 16,
      techniqueScore: 81,
      defaultCategory: DISH_CATEGORY.SOUP,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "stew_pot"]
    },
    {
      schemaVersion: 1,
      id: "blanch",
      name: "汆烫",
      icon: "汆",
      description: "短时间沸水加热，突出鲜嫩和效率",
      baseMinutes: 6,
      difficultyBonus: 7,
      techniqueScore: 74,
      defaultCategory: DISH_CATEGORY.COLD_DISH,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "pot"]
    },
    {
      schemaVersion: 1,
      id: "poach",
      name: "浸煮",
      icon: "浸",
      description: "较低温液体缓慢加热，控制嫩度",
      baseMinutes: 20,
      difficultyBonus: 17,
      techniqueScore: 83,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "pot"]
    },
    {
      schemaVersion: 1,
      id: "fry",
      name: "油炸",
      icon: "炸",
      description: "高温油炸形成酥脆口感，效率高",
      baseMinutes: 12,
      difficultyBonus: 18,
      techniqueScore: 74,
      defaultCategory: DISH_CATEGORY.FAST_FOOD,
      requiresExhaust: true,
      equipmentCapabilities: ["fryer"]
    },
    {
      schemaVersion: 1,
      id: "pan_fry",
      name: "香煎",
      icon: "煎",
      description: "少量油脂双面煎制，重视火候和上色",
      baseMinutes: 14,
      difficultyBonus: 16,
      techniqueScore: 79,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "flat_pan"]
    },
    {
      schemaVersion: 1,
      id: "grill",
      name: "烧烤",
      icon: "烤",
      description: "直接高温烤制，强调焦香和效率",
      baseMinutes: 18,
      difficultyBonus: 19,
      techniqueScore: 78,
      defaultCategory: DISH_CATEGORY.BARBECUE,
      requiresExhaust: true,
      equipmentCapabilities: ["grill"]
    },
    {
      schemaVersion: 1,
      id: "roast",
      name: "明火烤制",
      icon: "炙",
      description: "持续高温烤制大块食材，火候窗口较窄",
      baseMinutes: 32,
      difficultyBonus: 24,
      techniqueScore: 84,
      defaultCategory: DISH_CATEGORY.BARBECUE,
      requiresExhaust: true,
      equipmentCapabilities: ["roaster"]
    },
    {
      schemaVersion: 1,
      id: "bake",
      name: "烘焙",
      icon: "焙",
      description: "烤箱定温制作面点、甜品和焗制菜",
      baseMinutes: 25,
      difficultyBonus: 20,
      techniqueScore: 79,
      defaultCategory: DISH_CATEGORY.BAKERY,
      requiresExhaust: false,
      equipmentCapabilities: ["oven"]
    },
    {
      schemaVersion: 1,
      id: "claypot",
      name: "砂锅焖",
      icon: "焖",
      description: "密闭焖制聚合香气，出餐时间较长",
      baseMinutes: 28,
      difficultyBonus: 18,
      techniqueScore: 81,
      defaultCategory: DISH_CATEGORY.RICE,
      requiresExhaust: true,
      equipmentCapabilities: ["range", "claypot"]
    },
    {
      schemaVersion: 1,
      id: "hotpot",
      name: "涮煮",
      icon: "涮",
      description: "持续加热汤底并即时烫熟食材",
      baseMinutes: 10,
      difficultyBonus: 12,
      techniqueScore: 73,
      defaultCategory: DISH_CATEGORY.HOTPOT,
      requiresExhaust: true,
      equipmentCapabilities: ["hotpot_burner"]
    },
    {
      schemaVersion: 1,
      id: "pressure_cook",
      name: "高压炖煮",
      icon: "压",
      description: "利用压力缩短长时间炖制过程",
      baseMinutes: 24,
      difficultyBonus: 15,
      techniqueScore: 77,
      defaultCategory: DISH_CATEGORY.SOUP,
      requiresExhaust: false,
      equipmentCapabilities: ["pressure_cooker"]
    },
    {
      schemaVersion: 1,
      id: "cold_mix",
      name: "凉拌",
      icon: "拌",
      description: "冷加工调味，出餐快但依赖备料品质",
      baseMinutes: 8,
      difficultyBonus: 5,
      techniqueScore: 70,
      defaultCategory: DISH_CATEGORY.COLD_DISH,
      requiresExhaust: false,
      equipmentCapabilities: ["cold_prep"]
    },
    {
      schemaVersion: 1,
      id: "pickle",
      name: "腌渍",
      icon: "腌",
      description: "盐、糖、醋或酱料腌渍形成风味",
      baseMinutes: 20,
      difficultyBonus: 11,
      techniqueScore: 75,
      defaultCategory: DISH_CATEGORY.COLD_DISH,
      requiresExhaust: false,
      equipmentCapabilities: ["cold_prep", "pickling"]
    },
    {
      schemaVersion: 1,
      id: "ferment",
      name: "发酵",
      icon: "酵",
      description: "通过时间和温度控制形成发酵风味",
      baseMinutes: 60,
      difficultyBonus: 28,
      techniqueScore: 86,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: false,
      equipmentCapabilities: ["fermentation"]
    },
    {
      schemaVersion: 1,
      id: "smoke",
      name: "烟熏",
      icon: "熏",
      description: "利用烟气赋香并控制熟化程度",
      baseMinutes: 40,
      difficultyBonus: 26,
      techniqueScore: 85,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: true,
      equipmentCapabilities: ["smoker"]
    },
    {
      schemaVersion: 1,
      id: "sous_vide",
      name: "低温慢煮",
      icon: "低",
      description: "低温恒温长时间加热，稳定但设备要求高",
      baseMinutes: 90,
      difficultyBonus: 25,
      techniqueScore: 88,
      defaultCategory: DISH_CATEGORY.SPECIALTY,
      requiresExhaust: false,
      equipmentCapabilities: ["sous_vide"]
    },
    {
      schemaVersion: 1,
      id: "raw_prepare",
      name: "生食处理",
      icon: "鲜",
      description: "以切配、调味和低温控制为核心",
      baseMinutes: 10,
      difficultyBonus: 20,
      techniqueScore: 87,
      defaultCategory: DISH_CATEGORY.COLD_DISH,
      requiresExhaust: false,
      equipmentCapabilities: ["cold_prep"]
    }
  ]);

export const COOKING_METHOD_MAP =
  Object.freeze(
    Object.fromEntries(
      COOKING_METHODS_V1.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );

export function getCookingMethod(
  id
) {
  return (
    COOKING_METHOD_MAP[
      id
    ] ??
    null
  );
}

export function cookingMethodRequiresExhaust(
  id
) {
  return Boolean(
    getCookingMethod(
      id
    )?.requiresExhaust
  );
}


export function validateCookingMethod(
  method
) {
  if (
    !method ||
    typeof method !== "object"
  ) {
    throw new TypeError(
      "Cooking method must be an object"
    );
  }

  if (
    method.schemaVersion !==
      COOKING_METHOD_SCHEMA_VERSION
  ) {
    throw new Error(
      "Cooking method has invalid schemaVersion"
    );
  }

  if (
    typeof method.id !== "string" ||
    !COOKING_METHOD_ID_PATTERN.test(
      method.id
    )
  ) {
    throw new Error(
      "Cooking method id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof method.name !== "string" ||
    !method.name.trim()
  ) {
    throw new Error(
      `Cooking method "${method.id}" requires a name`
    );
  }

  if (
    !Number.isInteger(
      method.baseMinutes
    ) ||
    method.baseMinutes < 1 ||
    method.baseMinutes > 480
  ) {
    throw new Error(
      `Cooking method "${method.id}" has invalid baseMinutes`
    );
  }

  if (
    !Number.isInteger(
      method.difficultyBonus
    ) ||
    method.difficultyBonus < 0 ||
    method.difficultyBonus > 100
  ) {
    throw new Error(
      `Cooking method "${method.id}" has invalid difficultyBonus`
    );
  }

  if (
    !Number.isInteger(
      method.techniqueScore
    ) ||
    method.techniqueScore < 1 ||
    method.techniqueScore > 100
  ) {
    throw new Error(
      `Cooking method "${method.id}" has invalid techniqueScore`
    );
  }

  if (
    !Object.values(
      DISH_CATEGORY
    ).includes(
      method.defaultCategory
    )
  ) {
    throw new Error(
      `Cooking method "${method.id}" has invalid defaultCategory`
    );
  }

  if (
    typeof method.requiresExhaust !==
      "boolean"
  ) {
    throw new Error(
      `Cooking method "${method.id}" requires requiresExhaust`
    );
  }

  if (
    !Array.isArray(
      method.equipmentCapabilities
    ) ||
    method.equipmentCapabilities.length ===
      0 ||
    method.equipmentCapabilities.some(
      capability =>
        !VALID_EQUIPMENT_CAPABILITIES.has(
          capability
        )
    )
  ) {
    throw new Error(
      `Cooking method "${method.id}" has invalid equipmentCapabilities`
    );
  }

  return true;
}
