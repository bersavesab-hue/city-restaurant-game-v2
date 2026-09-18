import {
  RENOVATION_TEMPLATE_BUDGET_CLASS
} from "./renovationTemplateRules.js";

export const RENOVATION_TEMPLATE_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 24,
    legacyIdsPreserved: [
      "balanced",
      "quick_service",
      "family_dining"
    ]
  });

export const RENOVATION_TEMPLATES_V1 =
  Object.freeze([
    {
      schemaVersion: 1,
      id: "balanced",
      name: "均衡小店",
      minLevel: 1,
      minArea: 36,
      idealArea: 68,
      maxArea: 120,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [],
      tags: [
        "starter",
        "balanced",
        "small_store"
      ],
      items: [
        "kitchen_station",
        "cashier_counter",
        "table_4",
        "table_4",
        "table_2",
        "waiting_bench",
        "decor_plant",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "quick_service",
      name: "快餐高周转",
      minLevel: 1,
      minArea: 32,
      idealArea: 60,
      maxArea: 105,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "quick_service",
        "student_value"
      ],
      tags: [
        "fast_food",
        "turnover",
        "compact"
      ],
      items: [
        "kitchen_station",
        "cashier_counter",
        "table_2",
        "table_2",
        "table_2",
        "table_2",
        "waiting_bench",
        "queue_barrier",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "family_dining",
      name: "家庭正餐",
      minLevel: 1,
      minArea: 48,
      idealArea: 86,
      maxArea: 145,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "family_dining"
      ],
      tags: [
        "family",
        "dinner",
        "comfortable"
      ],
      items: [
        "kitchen_station",
        "cashier_counter",
        "table_4",
        "table_4",
        "table_4",
        "round_table_6",
        "waiting_bench",
        "decor_plant",
        "wall_art"
      ]
    },
    {
      schemaVersion: 1,
      id: "breakfast_compact",
      name: "早餐便民店",
      minLevel: 1,
      minArea: 28,
      idealArea: 48,
      maxArea: 80,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "quick_service",
        "student_value"
      ],
      tags: [
        "breakfast",
        "morning",
        "compact"
      ],
      items: [
        "kitchen_station",
        "cashier_counter",
        "table_2",
        "table_2",
        "communal_table_6",
        "waiting_bench",
        "queue_barrier",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "noodle_shop",
      name: "粉面小馆",
      minLevel: 1,
      minArea: 34,
      idealArea: 58,
      maxArea: 95,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "quick_service",
        "student_value"
      ],
      tags: [
        "noodle",
        "fast_meal",
        "compact"
      ],
      items: [
        "kitchen_station",
        "prep_counter_basic",
        "cashier_counter",
        "table_2",
        "table_2",
        "table_4",
        "waiting_bench",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "rice_bowl_shop",
      name: "盖饭小馆",
      minLevel: 1,
      minArea: 34,
      idealArea: 62,
      maxArea: 100,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "quick_service",
        "student_value"
      ],
      tags: [
        "rice",
        "fast_meal",
        "turnover"
      ],
      items: [
        "kitchen_station",
        "prep_counter_basic",
        "cashier_counter",
        "table_2",
        "table_2",
        "table_4",
        "waiting_bench",
        "queue_barrier"
      ]
    },
    {
      schemaVersion: 1,
      id: "student_value",
      name: "学生实惠店",
      minLevel: 1,
      minArea: 36,
      idealArea: 66,
      maxArea: 110,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "student_value"
      ],
      tags: [
        "student",
        "value",
        "high_density"
      ],
      items: [
        "kitchen_station",
        "cashier_counter",
        "communal_table_6",
        "communal_table_6",
        "table_2",
        "waiting_bench",
        "queue_barrier",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "takeaway_counter",
      name: "外带便餐店",
      minLevel: 1,
      minArea: 26,
      idealArea: 42,
      maxArea: 72,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.ECONOMY,
      positioningIds: [
        "quick_service"
      ],
      tags: [
        "takeaway",
        "compact",
        "queue"
      ],
      items: [
        "kitchen_station",
        "prep_counter_basic",
        "cashier_counter",
        "table_2",
        "waiting_bench",
        "queue_barrier",
        "queue_barrier",
        "decor_plant"
      ]
    },
    {
      schemaVersion: 1,
      id: "community_dining",
      name: "社区餐厅",
      minLevel: 2,
      minArea: 52,
      idealArea: 92,
      maxArea: 150,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "family_dining"
      ],
      tags: [
        "community",
        "family",
        "regulars"
      ],
      items: [
        "kitchen_station_standard",
        "prep_counter_standard",
        "cashier_counter_standard",
        "table_4_standard",
        "table_4_standard",
        "table_2_standard",
        "round_table_6_standard",
        "waiting_bench_standard",
        "decor_plant_standard"
      ]
    },
    {
      schemaVersion: 1,
      id: "office_lunch",
      name: "商务午餐店",
      minLevel: 2,
      minArea: 48,
      idealArea: 84,
      maxArea: 135,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "quick_service"
      ],
      tags: [
        "office",
        "lunch",
        "efficient"
      ],
      items: [
        "kitchen_station_standard",
        "prep_counter_standard",
        "pass_counter_standard",
        "cashier_counter_standard",
        "table_2_standard",
        "table_2_standard",
        "table_4_standard",
        "waiting_bench_standard",
        "service_station_standard",
        "decor_plant_standard"
      ]
    },
    {
      schemaVersion: 1,
      id: "beverage_cafe",
      name: "饮品轻食店",
      minLevel: 2,
      minArea: 42,
      idealArea: 76,
      maxArea: 125,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "student_value",
        "specialty_dining"
      ],
      tags: [
        "beverage",
        "cafe",
        "social"
      ],
      items: [
        "kitchen_station_standard",
        "cashier_counter_standard",
        "table_2_standard",
        "table_2_standard",
        "booth_4_standard",
        "waiting_bench_standard",
        "decor_plant_standard",
        "ambient_light_standard",
        "wall_art_standard"
      ]
    },
    {
      schemaVersion: 1,
      id: "bakery_cafe",
      name: "烘焙咖啡店",
      minLevel: 2,
      minArea: 46,
      idealArea: 82,
      maxArea: 130,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "bakery",
        "cafe",
        "display"
      ],
      items: [
        "kitchen_station_standard",
        "prep_counter_standard",
        "cashier_counter_standard",
        "table_2_standard",
        "table_4_standard",
        "booth_4_standard",
        "waiting_bench_standard",
        "decor_plant_standard",
        "ambient_light_standard"
      ]
    },
    {
      schemaVersion: 1,
      id: "dessert_shop",
      name: "甜品小店",
      minLevel: 2,
      minArea: 38,
      idealArea: 68,
      maxArea: 110,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.STANDARD,
      positioningIds: [
        "student_value",
        "specialty_dining"
      ],
      tags: [
        "dessert",
        "social",
        "comfort"
      ],
      items: [
        "kitchen_station_standard",
        "cashier_counter_standard",
        "table_2_standard",
        "table_2_standard",
        "booth_4_standard",
        "waiting_bench_standard",
        "decor_plant_standard",
        "wall_art_standard",
        "ambient_light_standard"
      ]
    },
    {
      schemaVersion: 1,
      id: "hotpot_social",
      name: "聚餐火锅店",
      minLevel: 4,
      minArea: 72,
      idealArea: 128,
      maxArea: 220,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "hotpot",
        "group",
        "dinner"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "pass_counter_pro",
        "cashier_counter_pro",
        "round_table_6_pro",
        "round_table_6_pro",
        "booth_6_pro",
        "waiting_bench_pro",
        "service_station_pro",
        "decor_feature",
        "partition_pro"
      ]
    },
    {
      schemaVersion: 1,
      id: "barbecue_social",
      name: "烧烤聚餐店",
      minLevel: 4,
      minArea: 68,
      idealArea: 118,
      maxArea: 210,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "barbecue",
        "group",
        "night"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "pass_counter_pro",
        "cashier_counter_pro",
        "table_4_pro",
        "table_4_pro",
        "booth_6_pro",
        "waiting_bench_pro",
        "service_station_pro",
        "ambient_light_pro",
        "decor_feature"
      ]
    },
    {
      schemaVersion: 1,
      id: "specialty_dining",
      name: "特色主题餐厅",
      minLevel: 4,
      minArea: 64,
      idealArea: 115,
      maxArea: 200,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "specialty",
        "theme",
        "destination"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "cashier_counter_pro",
        "table_4_pro",
        "round_table_6_pro",
        "booth_4",
        "waiting_bench_pro",
        "service_station_pro",
        "decor_feature",
        "wall_art_pro",
        "ambient_light_pro"
      ]
    },
    {
      schemaVersion: 1,
      id: "seafood_dining",
      name: "海鲜正餐厅",
      minLevel: 4,
      minArea: 76,
      idealArea: 135,
      maxArea: 230,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "seafood",
        "family",
        "premium"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "pass_counter_pro",
        "cashier_counter_pro",
        "round_table_6_pro",
        "round_table_6_pro",
        "booth_4",
        "waiting_bench_pro",
        "service_station_pro",
        "decor_feature",
        "wall_art_pro"
      ]
    },
    {
      schemaVersion: 1,
      id: "mall_casual",
      name: "商场休闲餐厅",
      minLevel: 4,
      minArea: 70,
      idealArea: 125,
      maxArea: 210,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "mall",
        "casual",
        "balanced"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "cashier_counter_pro",
        "table_2_pro",
        "table_4_pro",
        "booth_4",
        "booth_4",
        "waiting_bench_pro",
        "service_station_pro",
        "decor_feature",
        "ambient_light_pro"
      ]
    },
    {
      schemaVersion: 1,
      id: "farmhouse_dining",
      name: "农家聚餐馆",
      minLevel: 4,
      minArea: 82,
      idealArea: 145,
      maxArea: 260,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.PREMIUM,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "farmhouse",
        "family",
        "large_group"
      ],
      items: [
        "kitchen_station_pro",
        "prep_counter",
        "cashier_counter_pro",
        "round_table_6_pro",
        "round_table_6_pro",
        "communal_table_6_pro",
        "waiting_bench_pro",
        "service_station_pro",
        "decor_plant_pro",
        "wall_art_pro"
      ]
    },
    {
      schemaVersion: 1,
      id: "private_dining",
      name: "私厨雅间",
      minLevel: 6,
      minArea: 78,
      idealArea: 132,
      maxArea: 220,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.LUXURY,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "private",
        "quiet",
        "premium"
      ],
      items: [
        "kitchen_station_premium",
        "prep_counter_premium",
        "pass_counter_premium",
        "cashier_counter_premium",
        "round_table_6_premium",
        "booth_4_premium",
        "waiting_bench_premium",
        "service_station_premium",
        "decor_feature_premium",
        "partition_premium",
        "ambient_light_premium"
      ]
    },
    {
      schemaVersion: 1,
      id: "premium_dining",
      name: "高端正餐厅",
      minLevel: 6,
      minArea: 90,
      idealArea: 165,
      maxArea: 280,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.LUXURY,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "premium",
        "formal",
        "service"
      ],
      items: [
        "kitchen_station_premium",
        "prep_counter_premium",
        "pass_counter_premium",
        "cashier_counter_premium",
        "round_table_6_premium",
        "round_table_6_premium",
        "booth_6_premium",
        "waiting_bench_premium",
        "service_station_premium",
        "decor_feature_premium",
        "wall_art_premium",
        "ambient_light_premium"
      ]
    },
    {
      schemaVersion: 1,
      id: "banquet_dining",
      name: "宴请型餐厅",
      minLevel: 6,
      minArea: 110,
      idealArea: 200,
      maxArea: 340,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.LUXURY,
      positioningIds: [
        "family_dining",
        "specialty_dining"
      ],
      tags: [
        "banquet",
        "large_group",
        "formal"
      ],
      items: [
        "kitchen_station_premium",
        "prep_counter_premium",
        "pass_counter_premium",
        "cashier_counter_premium",
        "round_table_6_premium",
        "round_table_6_premium",
        "round_table_6_premium",
        "booth_6_premium",
        "waiting_bench_premium",
        "service_station_premium",
        "decor_feature_premium",
        "partition_premium"
      ]
    },
    {
      schemaVersion: 1,
      id: "rooftop_dining",
      name: "露台景观餐厅",
      minLevel: 6,
      minArea: 86,
      idealArea: 150,
      maxArea: 260,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.LUXURY,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "rooftop",
        "scenic",
        "social"
      ],
      items: [
        "kitchen_station_premium",
        "prep_counter_premium",
        "cashier_counter_premium",
        "table_2_premium",
        "table_4_premium",
        "booth_4_premium",
        "booth_4_premium",
        "waiting_bench_premium",
        "decor_plant_premium",
        "ambient_light_premium",
        "wall_art_premium"
      ]
    },
    {
      schemaVersion: 1,
      id: "chef_tasting",
      name: "主厨品鉴餐厅",
      minLevel: 8,
      minArea: 82,
      idealArea: 138,
      maxArea: 220,
      budgetClass:
        RENOVATION_TEMPLATE_BUDGET_CLASS.LUXURY,
      positioningIds: [
        "specialty_dining"
      ],
      tags: [
        "chef",
        "tasting",
        "flagship"
      ],
      items: [
        "kitchen_station_flagship",
        "prep_counter_flagship",
        "pass_counter_flagship",
        "cashier_counter_flagship",
        "table_2_flagship",
        "table_4_flagship",
        "booth_4_flagship",
        "waiting_bench_flagship",
        "service_station_flagship",
        "decor_feature_flagship",
        "partition_flagship",
        "ambient_light_flagship"
      ]
    }
  ]);

export const RENOVATION_TEMPLATE_MAP =
  Object.freeze(
    Object.fromEntries(
      RENOVATION_TEMPLATES_V1.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );
