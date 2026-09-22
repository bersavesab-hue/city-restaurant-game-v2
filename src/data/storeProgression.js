import {
  STORE_PROGRESSION_SCHEMA_VERSION
} from "./storeProgressionRules.js";

function level({
  level,
  title,
  requiredExperience,
  limits,
  unlocks
}) {
  return Object.freeze({
    schemaVersion:
      STORE_PROGRESSION_SCHEMA_VERSION,
    level,
    title,
    requiredExperience,
    limits:
      Object.freeze({
        ...limits
      }),
    unlocks:
      Object.freeze([
        ...unlocks
      ])
  });
}

export const STORE_LEVELS =
  Object.freeze([
    level({
      level: 1,
      title: "街坊小店",
      requiredExperience: 0,
      limits: {
        employees: 4,
        menuItems: 8,
        tables: 6,
        kitchenStations: 2
      },
      unlocks: [
        "employee_management",
        "menu_management",
        "basic_inventory"
      ]
    }),
    level({
      level: 2,
      title: "稳定经营",
      requiredExperience: 500,
      limits: {
        employees: 6,
        menuItems: 12,
        tables: 8,
        kitchenStations: 3
      },
      unlocks: [
        "supplier_management"
      ]
    }),
    level({
      level: 3,
      title: "商圈新秀",
      requiredExperience: 1500,
      limits: {
        employees: 8,
        menuItems: 16,
        tables: 10,
        kitchenStations: 4
      },
      unlocks: [
        "marketing"
      ]
    }),
    level({
      level: 4,
      title: "成熟门店",
      requiredExperience: 3500,
      limits: {
        employees: 10,
        menuItems: 20,
        tables: 14,
        kitchenStations: 5
      },
      unlocks: [
        "advanced_renovation"
      ]
    }),
    level({
      level: 5,
      title: "招牌门店",
      requiredExperience: 7000,
      limits: {
        employees: 14,
        menuItems: 24,
        tables: 18,
        kitchenStations: 6
      },
      unlocks: [
        "dish_research"
      ]
    }),
    level({
      level: 6,
      title: "扩容餐厅",
      requiredExperience: 12000,
      limits: {
        employees: 18,
        menuItems: 28,
        tables: 22,
        kitchenStations: 7
      },
      unlocks: [
        "service_expansion"
      ]
    }),
    level({
      level: 7,
      title: "会员名店",
      requiredExperience: 20000,
      limits: {
        employees: 24,
        menuItems: 32,
        tables: 28,
        kitchenStations: 8
      },
      unlocks: [
        "membership"
      ]
    }),
    level({
      level: 8,
      title: "品质餐厅",
      requiredExperience: 32000,
      limits: {
        employees: 30,
        menuItems: 36,
        tables: 34,
        kitchenStations: 10
      },
      unlocks: [
        "premium_operations"
      ]
    }),
    level({
      level: 9,
      title: "大型餐厅",
      requiredExperience: 50000,
      limits: {
        employees: 38,
        menuItems: 42,
        tables: 40,
        kitchenStations: 12
      },
      unlocks: [
        "facility_expansion"
      ]
    }),
    level({
      level: 10,
      title: "城市旗舰店",
      requiredExperience: 75000,
      limits: {
        employees: 48,
        menuItems: 50,
        tables: 48,
        kitchenStations: 14
      },
      unlocks: [
        "flagship_operations"
      ]
    })
  ]);

export const STORE_PROGRESSION_DATASET_META =
  Object.freeze({
    schemaVersion:
      STORE_PROGRESSION_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    totalLevels:
      STORE_LEVELS.length,
    maxLevel:
      STORE_LEVELS[
        STORE_LEVELS.length - 1
      ].level
  });
