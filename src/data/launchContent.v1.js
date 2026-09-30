export const LAUNCH_CONTENT_SCHEMA_VERSION =
  1;

function stage({
  id,
  name,
  subtitle,
  minLevel,
  maxLevel,
  focus,
  objectives,
  content
}) {
  return Object.freeze({
    schemaVersion:
      LAUNCH_CONTENT_SCHEMA_VERSION,
    id,
    name,
    subtitle,
    minLevel,
    maxLevel,
    focus:
      Object.freeze([
        ...focus
      ]),
    objectives:
      Object.freeze(
        objectives.map(
          item =>
            Object.freeze({
              ...item
            })
        )
      ),
    content:
      Object.freeze({
        dishIds:
          Object.freeze([
            ...content.dishIds
          ]),
        ingredientCategories:
          Object.freeze([
            ...content
              .ingredientCategories
          ]),
        supplierIds:
          Object.freeze([
            ...content.supplierIds
          ]),
        employeeRoleIds:
          Object.freeze([
            ...content
              .employeeRoleIds
          ]),
        marketingActionIds:
          Object.freeze([
            ...content
              .marketingActionIds
          ]),
        renovationTemplateIds:
          Object.freeze([
            ...content
              .renovationTemplateIds
          ])
      })
  });
}

export const LAUNCH_STAGES =
  Object.freeze([
    stage({
      id:
        "street_survival",
      name:
        "街坊立足",
      subtitle:
        "先把一家小店真正经营活下来",
      minLevel:
        1,
      maxLevel:
        3,
      focus: [
        "稳定供货",
        "做出基础菜单",
        "建立核心班底",
        "完成首次装修"
      ],
      objectives: [
        {
          id:
            "menu_count",
          label:
            "营业菜单达到 4 道",
          target:
            4
        },
        {
          id:
            "employees",
          label:
            "在册员工达到 3 人",
          target:
            3
        },
        {
          id:
            "renovation_active",
          label:
            "完成并启用首次装修",
          target:
            1
        },
        {
          id:
            "rating",
          label:
            "星级评价达到 3.8",
          target:
            3.8
        }
      ],
      content: {
        dishIds: [
          "egg_fried_rice",
          "tomato_egg_rice",
          "tofu_mushroom_rice",
          "chicken_noodle",
          "green_pepper_pork",
          "tomato_egg_soup",
          "braised_pork_belly_rice",
          "black_pepper_beef_rice"
        ],
        ingredientCategories: [
          "grain",
          "egg",
          "vegetable",
          "oil",
          "seasoning",
          "meat",
          "poultry",
          "bean"
        ],
        supplierIds: [
          "supplier_t1_comprehensive",
          "supplier_t1_produce_fruit",
          "supplier_t1_grain_bean",
          "supplier_t1_seasoning_oil"
        ],
        employeeRoleIds: [
          "chef",
          "server",
          "cashier",
          "cleaner"
        ],
        marketingActionIds: [
          "local_ads",
          "flash_coupon"
        ],
        renovationTemplateIds: [
          "balanced",
          "quick_service",
          "family_dining"
        ]
      }
    }),

    stage({
      id:
        "district_growth",
      name:
        "商圈成长",
      subtitle:
        "从能活下来，变成商圈里有竞争力的门店",
      minLevel:
        4,
      maxLevel:
        6,
      focus: [
        "扩充菜单结构",
        "建立专业岗位",
        "用活动主动拉动客流",
        "升级产能与就餐体验"
      ],
      objectives: [
        {
          id:
            "menu_count",
          label:
            "营业菜单达到 8 道",
          target:
            8
        },
        {
          id:
            "employees",
          label:
            "在册员工达到 5 人",
          target:
            5
        },
        {
          id:
            "marketing_runs",
          label:
            "累计开展 2 次营销活动",
          target:
            2
        },
        {
          id:
            "rating",
          label:
            "星级评价达到 4.1",
          target:
            4.1
        }
      ],
      content: {
        dishIds: [
          "seafood_noodle",
          "spicy_beef_hotpot",
          "grilled_ribs",
          "fish_home_set",
          "spiced_beef_shank",
          "braised_duck"
        ],
        ingredientCategories: [
          "seafood",
          "dry_goods"
        ],
        supplierIds: [
          "supplier_t2_meat_poultry",
          "supplier_t2_aquatic",
          "supplier_t2_cold_chain"
        ],
        employeeRoleIds: [
          "kitchen_assistant"
        ],
        marketingActionIds: [
          "quality_campaign",
          "short_video_content"
        ],
        renovationTemplateIds: [
          "office_lunch",
          "hotpot_social",
          "specialty_dining"
        ]
      }
    }),

    stage({
      id:
        "city_signature",
      name:
        "城市招牌",
      subtitle:
        "用稳定品质、团队与招牌菜把单店做到旗舰级",
      minLevel:
        7,
      maxLevel:
        10,
      focus: [
        "打造高价值招牌菜",
        "建立完整管理团队",
        "提升高峰产能",
        "完成旗舰级门店升级"
      ],
      objectives: [
        {
          id:
            "menu_count",
          label:
            "营业菜单达到 12 道",
          target:
            12
        },
        {
          id:
            "employees",
          label:
            "在册员工达到 8 人",
          target:
            8
        },
        {
          id:
            "marketing_runs",
          label:
            "累计开展 4 次营销活动",
          target:
            4
        },
        {
          id:
            "rating",
          label:
            "星级评价达到 4.4",
          target:
            4.4
        }
      ],
      content: {
        dishIds: [
          "shrimp_crab_hotpot",
          "braised_sea_cucumber",
          "braised_abalone",
          "seafood_grand_plate"
        ],
        ingredientCategories: [],
        supplierIds: [
          "supplier_t4_premium",
          "supplier_t5_comprehensive"
        ],
        employeeRoleIds: [
          "manager"
        ],
        marketingActionIds: [],
        renovationTemplateIds: [
          "private_dining",
          "premium_dining",
          "chef_tasting"
        ]
      }
    })
  ]);

export const LAUNCH_EVENT_IDS =
  Object.freeze([
    "convention",
    "road_construction",
    "heat_wave",
    "clear_weekend",
    "school_opening",
    "payroll_week",
    "neighborhood_festival",
    "competitor_promotion",
    "produce_shortage",
    "fresh_market_glut",
    "labor_shortage",
    "fire_inspection",
    "local_media_feature",
    "negative_review_wave",
    "energy_price_rise",
    "delivery_platform_campaign",
    "tourism_campaign",
    "district_coupon"
  ]);

function uniqueCumulative(
  field
) {
  return [
    ...new Set(
      LAUNCH_STAGES.flatMap(
        item =>
          item.content[field]
      )
    )
  ];
}

export const LAUNCH_CONTENT_TOTALS =
  Object.freeze({
    stages:
      LAUNCH_STAGES.length,
    dishes:
      uniqueCumulative(
        "dishIds"
      ).length,
    ingredientCategories:
      uniqueCumulative(
        "ingredientCategories"
      ).length,
    suppliers:
      uniqueCumulative(
        "supplierIds"
      ).length,
    employeeRoles:
      uniqueCumulative(
        "employeeRoleIds"
      ).length,
    marketingActions:
      uniqueCumulative(
        "marketingActionIds"
      ).length,
    renovationTemplates:
      uniqueCumulative(
        "renovationTemplateIds"
      ).length,
    randomEvents:
      LAUNCH_EVENT_IDS.length
  });

export const LAUNCH_CONTENT_DATASET_META =
  Object.freeze({
    schemaVersion:
      LAUNCH_CONTENT_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    mode:
      "single_store_launch",
    totals:
      LAUNCH_CONTENT_TOTALS
  });
