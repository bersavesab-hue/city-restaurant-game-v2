import {
  FURNITURE_SPEC_TIER,
  FURNITURE_TYPE,
  FURNITURE_ROLE
} from "./renovationFurnitureRules.js";

export const RENOVATION_FURNITURE_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 100,
    families: 20,
    tiers: {
      T1: 20,
      T2: 20,
      T3: 20,
      T4: 20,
      T5: 20
    }
  });

const FAMILIES =
  Object.freeze([
    {
      key: "table_2",
      ids: [
        "table_2",
        "table_2_standard",
        "table_2_pro",
        "table_2_premium",
        "table_2_flagship"
      ],
      names: [
        "基础双人桌",
        "实用双人桌",
        "专业双人桌",
        "高端双人桌",
        "旗舰双人桌"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 2,
      height: 1,
      baseCost: 900,
      seats: 2,
      comfort: 0.004
    },
    {
      key: "table_4",
      ids: [
        "table_4",
        "table_4_standard",
        "table_4_pro",
        "table_4_premium",
        "table_4_flagship"
      ],
      names: [
        "基础四人桌",
        "实用四人桌",
        "专业四人桌",
        "高端四人桌",
        "旗舰四人桌"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 2,
      height: 2,
      baseCost: 1600,
      seats: 4,
      comfort: 0.005
    },
    {
      key: "round_table_6",
      ids: [
        "round_table_6",
        "round_table_6_standard",
        "round_table_6_pro",
        "round_table_6_premium",
        "round_table_6_flagship"
      ],
      names: [
        "基础六人圆桌",
        "实用六人圆桌",
        "专业六人圆桌",
        "高端六人圆桌",
        "旗舰六人圆桌"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 3,
      height: 3,
      baseCost: 2600,
      seats: 6,
      comfort: 0.006
    },
    {
      key: "booth_4",
      ids: [
        "booth_4_basic",
        "booth_4_standard",
        "booth_4",
        "booth_4_premium",
        "booth_4_flagship"
      ],
      names: [
        "基础四人卡座",
        "实用四人卡座",
        "专业四人卡座",
        "高端四人卡座",
        "旗舰四人卡座"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 3,
      height: 2,
      baseCost: 1500,
      seats: 4,
      appeal: 0.008,
      comfort: 0.01
    },
    {
      key: "booth_6",
      ids: [
        "booth_6_basic",
        "booth_6_standard",
        "booth_6_pro",
        "booth_6_premium",
        "booth_6_flagship"
      ],
      names: [
        "基础六人卡座",
        "实用六人卡座",
        "专业六人卡座",
        "高端六人卡座",
        "旗舰六人卡座"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 4,
      height: 2,
      baseCost: 2400,
      seats: 6,
      appeal: 0.009,
      comfort: 0.012
    },
    {
      key: "communal_table_6",
      ids: [
        "communal_table_6",
        "communal_table_6_standard",
        "communal_table_6_pro",
        "communal_table_6_premium",
        "communal_table_6_flagship"
      ],
      names: [
        "基础六人长桌",
        "实用六人长桌",
        "专业六人长桌",
        "高端六人长桌",
        "旗舰六人长桌"
      ],
      type: FURNITURE_TYPE.TABLE,
      roles: [
        FURNITURE_ROLE.DINING
      ],
      width: 3,
      height: 1,
      baseCost: 2100,
      seats: 6,
      comfort: 0.004
    },
    {
      key: "kitchen_station",
      ids: [
        "kitchen_station",
        "kitchen_station_standard",
        "kitchen_station_pro",
        "kitchen_station_premium",
        "kitchen_station_flagship"
      ],
      names: [
        "基础厨房工位",
        "实用厨房工位",
        "专业厨房工位",
        "高端厨房工位",
        "旗舰厨房工位"
      ],
      type: FURNITURE_TYPE.KITCHEN,
      roles: [
        FURNITURE_ROLE.KITCHEN_STATION
      ],
      width: 2,
      height: 2,
      baseCost: 4500,
      kitchenStations: 1,
      kitchenEfficiency: 0.01
    },
    {
      key: "prep_counter",
      ids: [
        "prep_counter_basic",
        "prep_counter_standard",
        "prep_counter",
        "prep_counter_premium",
        "prep_counter_flagship"
      ],
      names: [
        "基础备餐台",
        "实用备餐台",
        "专业备餐台",
        "高端备餐台",
        "旗舰备餐台"
      ],
      type:
        FURNITURE_TYPE.KITCHEN_SUPPORT,
      roles: [
        FURNITURE_ROLE.PREP
      ],
      width: 2,
      height: 1,
      baseCost: 1500,
      kitchenEfficiency: 0.045,
      maxCount: 5
    },
    {
      key: "pass_counter",
      ids: [
        "pass_counter",
        "pass_counter_standard",
        "pass_counter_pro",
        "pass_counter_premium",
        "pass_counter_flagship"
      ],
      names: [
        "基础出餐台",
        "实用出餐台",
        "专业出餐台",
        "高端出餐台",
        "旗舰出餐台"
      ],
      type:
        FURNITURE_TYPE.KITCHEN_SUPPORT,
      roles: [
        FURNITURE_ROLE.PREP,
        FURNITURE_ROLE.SERVICE
      ],
      width: 2,
      height: 1,
      baseCost: 1800,
      kitchenEfficiency: 0.025,
      serviceEfficiency: 0.018,
      maxCount: 4
    },
    {
      key: "wash_sink",
      ids: [
        "wash_sink",
        "wash_sink_standard",
        "wash_sink_pro",
        "wash_sink_premium",
        "wash_sink_flagship"
      ],
      names: [
        "基础洗消池",
        "实用洗消池",
        "专业洗消池",
        "高端洗消池",
        "旗舰洗消池"
      ],
      type:
        FURNITURE_TYPE.KITCHEN_SUPPORT,
      roles: [
        FURNITURE_ROLE.PREP
      ],
      width: 2,
      height: 1,
      baseCost: 1200,
      kitchenEfficiency: 0.018,
      maxCount: 4
    },
    {
      key: "storage_rack",
      ids: [
        "storage_rack",
        "storage_rack_standard",
        "storage_rack_pro",
        "storage_rack_premium",
        "storage_rack_flagship"
      ],
      names: [
        "基础后厨货架",
        "实用后厨货架",
        "专业后厨货架",
        "高端后厨货架",
        "旗舰后厨货架"
      ],
      type:
        FURNITURE_TYPE.KITCHEN_SUPPORT,
      roles: [
        FURNITURE_ROLE.PREP
      ],
      width: 1,
      height: 2,
      baseCost: 900,
      kitchenEfficiency: 0.015,
      maxCount: 6
    },
    {
      key: "cashier_counter",
      ids: [
        "cashier_counter",
        "cashier_counter_standard",
        "cashier_counter_pro",
        "cashier_counter_premium",
        "cashier_counter_flagship"
      ],
      names: [
        "基础收银台",
        "实用收银台",
        "专业收银台",
        "高端收银台",
        "旗舰收银台"
      ],
      type: FURNITURE_TYPE.SERVICE,
      roles: [
        FURNITURE_ROLE.CASHIER,
        FURNITURE_ROLE.SERVICE
      ],
      width: 2,
      height: 1,
      baseCost: 1800,
      serviceEfficiency: 0.04,
      maxCount: 4
    },
    {
      key: "waiting_bench",
      ids: [
        "waiting_bench",
        "waiting_bench_standard",
        "waiting_bench_pro",
        "waiting_bench_premium",
        "waiting_bench_flagship"
      ],
      names: [
        "基础等候长椅",
        "实用等候长椅",
        "专业等候长椅",
        "高端等候长椅",
        "旗舰等候长椅"
      ],
      type: FURNITURE_TYPE.SERVICE,
      roles: [
        FURNITURE_ROLE.WAITING
      ],
      width: 2,
      height: 1,
      baseCost: 1200,
      queueEfficiency: 0.05,
      queueCapacityBonus: 2,
      comfort: 0.006,
      maxCount: 6
    },
    {
      key: "service_station",
      ids: [
        "service_station",
        "service_station_standard",
        "service_station_pro",
        "service_station_premium",
        "service_station_flagship"
      ],
      names: [
        "基础前厅服务柜",
        "实用前厅服务柜",
        "专业前厅服务柜",
        "高端前厅服务柜",
        "旗舰前厅服务柜"
      ],
      type: FURNITURE_TYPE.SERVICE,
      roles: [
        FURNITURE_ROLE.SERVICE
      ],
      width: 2,
      height: 1,
      baseCost: 1300,
      serviceEfficiency: 0.035,
      maxCount: 5
    },
    {
      key: "queue_barrier",
      ids: [
        "queue_barrier",
        "queue_barrier_standard",
        "queue_barrier_pro",
        "queue_barrier_premium",
        "queue_barrier_flagship"
      ],
      names: [
        "基础排队引导栏",
        "实用排队引导栏",
        "专业排队引导栏",
        "高端排队引导栏",
        "旗舰排队引导栏"
      ],
      type: FURNITURE_TYPE.SERVICE,
      roles: [
        FURNITURE_ROLE.WAITING
      ],
      width: 1,
      height: 1,
      baseCost: 500,
      queueEfficiency: 0.025,
      queueCapacityBonus: 2,
      maxCount: 10
    },
    {
      key: "decor_plant",
      ids: [
        "decor_plant",
        "decor_plant_standard",
        "decor_plant_pro",
        "decor_plant_premium",
        "decor_plant_flagship"
      ],
      names: [
        "基础绿植",
        "实用绿植组",
        "专业景观绿植",
        "高端景观绿植",
        "旗舰景观绿植"
      ],
      type: FURNITURE_TYPE.DECOR,
      roles: [
        FURNITURE_ROLE.DECOR
      ],
      width: 1,
      height: 1,
      baseCost: 500,
      appeal: 0.006,
      comfort: 0.008,
      maxCount: 12
    },
    {
      key: "decor_feature",
      ids: [
        "decor_feature_basic",
        "decor_feature_standard",
        "decor_feature",
        "decor_feature_premium",
        "decor_feature_flagship"
      ],
      names: [
        "基础主题摆件",
        "实用主题摆件",
        "专业主题装饰",
        "高端主题装饰",
        "旗舰主题装置"
      ],
      type: FURNITURE_TYPE.DECOR,
      roles: [
        FURNITURE_ROLE.DECOR
      ],
      width: 2,
      height: 2,
      baseCost: 2200,
      appeal: 0.03,
      comfort: 0.012,
      maxCount: 5
    },
    {
      key: "wall_art",
      ids: [
        "wall_art",
        "wall_art_standard",
        "wall_art_pro",
        "wall_art_premium",
        "wall_art_flagship"
      ],
      names: [
        "基础墙饰",
        "实用墙饰",
        "专业主题墙饰",
        "高端艺术墙饰",
        "旗舰艺术墙"
      ],
      type: FURNITURE_TYPE.DECOR,
      roles: [
        FURNITURE_ROLE.DECOR
      ],
      width: 1,
      height: 1,
      baseCost: 700,
      appeal: 0.012,
      comfort: 0.005,
      maxCount: 10
    },
    {
      key: "ambient_light",
      ids: [
        "ambient_light",
        "ambient_light_standard",
        "ambient_light_pro",
        "ambient_light_premium",
        "ambient_light_flagship"
      ],
      names: [
        "基础氛围灯",
        "实用氛围灯",
        "专业氛围灯",
        "高端氛围灯",
        "旗舰灯光系统"
      ],
      type: FURNITURE_TYPE.DECOR,
      roles: [
        FURNITURE_ROLE.DECOR
      ],
      width: 1,
      height: 1,
      baseCost: 800,
      appeal: 0.01,
      comfort: 0.014,
      maxCount: 10
    },
    {
      key: "partition",
      ids: [
        "partition",
        "partition_standard",
        "partition_pro",
        "partition_premium",
        "partition_flagship"
      ],
      names: [
        "基础空间隔断",
        "实用空间隔断",
        "专业空间隔断",
        "高端空间隔断",
        "旗舰空间隔断"
      ],
      type: FURNITURE_TYPE.DECOR,
      roles: [
        FURNITURE_ROLE.DECOR
      ],
      width: 1,
      height: 2,
      baseCost: 1000,
      appeal: 0.008,
      comfort: 0.012,
      maxCount: 8
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

function scaledEffect(
  value,
  multiplier
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return undefined;
  }

  return Number(
    (
      value *
      multiplier
    ).toFixed(3)
  );
}

function buildDefinitions() {
  const result = [];

  FAMILIES.forEach(
    family => {
      Object.values(
        FURNITURE_SPEC_TIER
      ).forEach(
        (
          tier,
          index
        ) => {
          const definition = {
            schemaVersion: 1,
            id:
              family.ids[index],
            name:
              family.names[index],
            familyId:
              family.key,
            specTier:
              tier.id,
            type:
              family.type,
            roles: [
              ...family.roles
            ],
            width:
              family.width,
            height:
              family.height,
            cost:
              roundMoney(
                family.baseCost *
                tier.costMultiplier
              ),
            unlockLevel:
              tier.unlockLevel,
            requiresFeature:
              tier.order >= 3
                ? "advanced_renovation"
                : null
          };

          for (
            const field
            of [
              "seats",
              "kitchenStations",
              "maxCount"
            ]
          ) {
            if (
              Number.isInteger(
                family[field]
              )
            ) {
              definition[field] =
                family[field];
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
            const value =
              scaledEffect(
                family[field],
                tier.effectMultiplier
              );

            if (
              value !== undefined
            ) {
              definition[field] =
                value;
            }
          }

          if (
            Number.isInteger(
              family
                .queueCapacityBonus
            )
          ) {
            definition
              .queueCapacityBonus =
                Math.max(
                  1,
                  Math.round(
                    family
                      .queueCapacityBonus *
                    tier.effectMultiplier
                  )
                );
          }

          result.push(
            definition
          );
        }
      );
    }
  );

  return result;
}

export const RENOVATION_FURNITURE_V1 =
  Object.freeze(
    buildDefinitions()
  );

export const RENOVATION_FURNITURE_MAP =
  Object.freeze(
    Object.fromEntries(
      RENOVATION_FURNITURE_V1.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );
