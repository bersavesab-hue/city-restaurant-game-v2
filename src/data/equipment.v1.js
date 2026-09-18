import {
  EQUIPMENT_TIER,
  EQUIPMENT_KIND,
  EQUIPMENT_ENERGY_TYPE
} from "./equipmentRules.js";

export const EQUIPMENT_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 65,
    families: 13,
    tiers: {
      T1: 13,
      T2: 13,
      T3: 13,
      T4: 13,
      T5: 13
    },
    cookingCapabilityCoverage: 18
  });

const FAMILIES =
  Object.freeze([
    {
      key: "wok_range",
      ids: [
        "gas_range",
        "induction_range",
        "dual_wok_range",
        "smart_wok_range",
        "flagship_wok_range"
      ],
      names: [
        "商用燃气灶",
        "商用电磁灶",
        "双头炒灶",
        "智能炒灶",
        "旗舰智能炒灶"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "range",
        "wok"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.MIXED,
      baseCapacity: 12,
      baseCost: 6000,
      baseRepair: 70,
      baseWear: 1.5,
      baseEnergy: 7.5,
      footprint: 2
    },
    {
      key: "steam_pot",
      ids: [
        "steam_oven",
        "steam_cabinet",
        "combi_steamer",
        "smart_steam_suite",
        "flagship_steam_suite"
      ],
      names: [
        "蒸烤一体机",
        "商用蒸柜",
        "专业蒸煮一体机",
        "智能蒸煮中心",
        "旗舰蒸煮中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "steamer",
        "pot",
        "stew_pot",
        "oven"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 14,
      baseCost: 9000,
      baseRepair: 90,
      baseWear: 1.2,
      baseEnergy: 8,
      footprint: 2
    },
    {
      key: "fry_griddle",
      ids: [
        "fryer",
        "flat_griddle",
        "fry_griddle_combo",
        "smart_fry_station",
        "flagship_fry_station"
      ],
      names: [
        "商用炸炉",
        "商用扒炉",
        "炸煎一体工作站",
        "智能炸煎中心",
        "旗舰炸煎中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "fryer",
        "flat_pan"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 12,
      baseCost: 7000,
      baseRepair: 80,
      baseWear: 1.6,
      baseEnergy: 6,
      footprint: 2
    },
    {
      key: "grill_roast",
      ids: [
        "char_grill",
        "commercial_grill",
        "grill_roaster",
        "smart_grill_center",
        "flagship_grill_center"
      ],
      names: [
        "炭火烧烤炉",
        "商用燃气烤炉",
        "烧烤烤制一体炉",
        "智能烧烤中心",
        "旗舰烧烤中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "grill",
        "roaster"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.MIXED,
      baseCapacity: 10,
      baseCost: 6500,
      baseRepair: 85,
      baseWear: 1.7,
      baseEnergy: 7,
      footprint: 2
    },
    {
      key: "oven",
      ids: [
        "convection_oven",
        "deck_oven",
        "commercial_oven",
        "smart_baking_oven",
        "flagship_baking_center"
      ],
      names: [
        "热风烤箱",
        "层炉",
        "商用烘焙炉",
        "智能烘焙炉",
        "旗舰烘焙中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "oven"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 9,
      baseCost: 7500,
      baseRepair: 80,
      baseWear: 1.1,
      baseEnergy: 6.5,
      footprint: 2
    },
    {
      key: "claypot_hotpot",
      ids: [
        "claypot_burner",
        "hotpot_burner",
        "multi_burner_station",
        "smart_claypot_station",
        "flagship_hotpot_station"
      ],
      names: [
        "砂锅炉",
        "商用涮煮炉",
        "多头煲仔炉",
        "智能砂锅工作站",
        "旗舰锅物中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "range",
        "claypot",
        "hotpot_burner"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.MIXED,
      baseCapacity: 10,
      baseCost: 5000,
      baseRepair: 65,
      baseWear: 1.4,
      baseEnergy: 5.5,
      footprint: 2
    },
    {
      key: "pressure_sous_vide",
      ids: [
        "pressure_cooker",
        "sous_vide_unit",
        "pressure_sous_vide_combo",
        "smart_slow_cook_center",
        "flagship_precision_cook"
      ],
      names: [
        "商用压力锅",
        "低温慢煮机",
        "高压低温一体机",
        "智能慢煮中心",
        "旗舰精准烹饪中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "pressure_cooker",
        "sous_vide"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 8,
      baseCost: 4500,
      baseRepair: 65,
      baseWear: 0.9,
      baseEnergy: 4,
      footprint: 1
    },
    {
      key: "cold_prep",
      ids: [
        "cold_prep_table",
        "pickling_station",
        "cold_prep_station",
        "smart_cold_prep",
        "flagship_cold_prep"
      ],
      names: [
        "冷餐操作台",
        "腌渍工作台",
        "专业冷加工台",
        "智能冷加工站",
        "旗舰冷加工中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "cold_prep",
        "pickling"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 10,
      baseCost: 3500,
      baseRepair: 45,
      baseWear: 0.7,
      baseEnergy: 1.8,
      footprint: 2
    },
    {
      key: "ferment_smoke",
      ids: [
        "fermentation_box",
        "smoker",
        "ferment_smoke_combo",
        "smart_flavor_chamber",
        "flagship_flavor_center"
      ],
      names: [
        "发酵箱",
        "商用烟熏炉",
        "发酵烟熏一体柜",
        "智能风味控制柜",
        "旗舰风味控制中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "fermentation",
        "smoker"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 6,
      baseCost: 5000,
      baseRepair: 70,
      baseWear: 0.8,
      baseEnergy: 3.2,
      footprint: 2
    },
    {
      key: "prep_station",
      ids: [
        "prep_station",
        "prep_counter_plus",
        "prep_station_pro",
        "smart_prep_station",
        "flagship_prep_center"
      ],
      names: [
        "后厨备餐台",
        "加强型备餐台",
        "专业备餐工作站",
        "智能备餐工作站",
        "旗舰备餐中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.KITCHEN,
      capabilities: [
        "cold_prep"
      ],
      energyType:
        EQUIPMENT_ENERGY_TYPE.NONE,
      baseCapacity: 8,
      baseCost: 3500,
      baseRepair: 45,
      baseWear: 0.8,
      baseEnergy: 0,
      footprint: 2
    },
    {
      key: "dishwasher",
      ids: [
        "dishwasher",
        "hood_dishwasher",
        "rack_dishwasher",
        "smart_dishwasher",
        "flagship_wash_center"
      ],
      names: [
        "商用洗碗机",
        "揭盖式洗碗机",
        "通道式洗碗机",
        "智能洗碗机",
        "旗舰洗消中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.SERVICE,
      capabilities: [],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 24,
      baseCost: 10000,
      baseRepair: 95,
      baseWear: 1.2,
      baseEnergy: 6,
      footprint: 2
    },
    {
      key: "checkout",
      ids: [
        "pos_terminal",
        "dual_pos_terminal",
        "smart_pos_terminal",
        "self_checkout_terminal",
        "flagship_checkout_center"
      ],
      names: [
        "收银POS机",
        "双屏收银POS",
        "智能收银终端",
        "自助收银终端",
        "旗舰收银中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.CHECKOUT,
      capabilities: [],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 30,
      baseCost: 4500,
      baseRepair: 55,
      baseWear: 0.5,
      baseEnergy: 0.3,
      footprint: 1
    },
    {
      key: "refrigeration",
      ids: [
        "refrigerator",
        "freezer",
        "reach_in_refrigerator",
        "smart_cold_storage",
        "flagship_cold_storage"
      ],
      names: [
        "商用冷藏柜",
        "商用冷冻柜",
        "立式冷藏冷冻柜",
        "智能冷藏系统",
        "旗舰冷链储存中心"
      ],
      equipmentKind:
        EQUIPMENT_KIND.SUPPORT,
      capabilities: [],
      energyType:
        EQUIPMENT_ENERGY_TYPE.ELECTRIC,
      baseCapacity: 0,
      baseCost: 9000,
      baseRepair: 85,
      baseWear: 0.4,
      baseEnergy: 2,
      footprint: 2
    }
  ]);

function roundMoney(
  value
) {
  return Math.max(
    1,
    Math.round(
      value / 10
    ) * 10
  );
}

function buildDefinitions() {
  const result = [];

  FAMILIES.forEach(
    family => {
      Object.values(
        EQUIPMENT_TIER
      ).forEach(
        (
          tier,
          index
        ) => {
          result.push({
            schemaVersion: 1,
            id:
              family.ids[index],
            name:
              family.names[index],
            familyId:
              family.key,
            capabilityTier:
              tier.id,
            equipmentKind:
              family.equipmentKind,
            capabilities: [
              ...family.capabilities
            ],
            energyType:
              family.energyType,
            capacityPerHour:
              Math.round(
                family.baseCapacity *
                tier.capacityMultiplier
              ),
            purchaseCost:
              roundMoney(
                family.baseCost *
                tier.costMultiplier
              ),
            repairCostPerPoint:
              roundMoney(
                family.baseRepair *
                (
                  0.85 +
                  tier.order * 0.15
                )
              ),
            wearPer100Guests:
              Number(
                (
                  family.baseWear *
                  tier.wearMultiplier
                ).toFixed(2)
              ),
            energyUsePerHour:
              Number(
                (
                  family.baseEnergy *
                  tier.energyMultiplier
                ).toFixed(2)
              ),
            footprintUnits:
              family.footprint,
            baseDurability:
              Math.min(
                160,
                Math.round(
                  100 *
                  tier.durabilityMultiplier
                )
              ),
            unlockLevel:
              tier.unlockLevel
          });
        }
      );
    }
  );

  return result;
}

export const EQUIPMENT_V1 =
  Object.freeze(
    buildDefinitions()
  );

export const EQUIPMENT_DEFINITION_MAP =
  Object.freeze(
    Object.fromEntries(
      EQUIPMENT_V1.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );
