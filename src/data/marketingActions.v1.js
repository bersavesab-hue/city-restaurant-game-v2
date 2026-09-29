import {
  MARKETING_ACTION_SCHEMA_VERSION
} from "./marketingActionRules.js";

function A({
  id,
  name,
  category,
  description,
  cost,
  durationDays,
  cooldownDays,
  minRestaurantLevel,
  exclusiveGroup,
  requiredChannels = [],
  targetSegments = [],
  demand = 1,
  price = 1,
  appeal = 1,
  repeat = 1,
  review = 1,
  qualityBonus = 0,
  service = 1,
  segmentMultipliers = {},
  channelMultipliers = {}
}) {
  return Object.freeze({
    schemaVersion:
      MARKETING_ACTION_SCHEMA_VERSION,
    id,
    name,
    category,
    description,
    cost,
    durationDays,
    cooldownDays,
    minRestaurantLevel,
    exclusiveGroup,
    requiredChannels:
      Object.freeze(
        [...requiredChannels]
      ),
    targetSegments:
      Object.freeze(
        [...targetSegments]
      ),
    modifiers:
      Object.freeze({
        demandMultiplier:
          demand,
        priceMultiplier:
          price,
        marketAppealMultiplier:
          appeal,
        repeatIntentMultiplier:
          repeat,
        reviewPropensityMultiplier:
          review,
        qualityBonus,
        serviceCapacityMultiplier:
          service,
        segmentMultipliers:
          Object.freeze({
            ...segmentMultipliers
          }),
        channelMultipliers:
          Object.freeze({
            ...channelMultipliers
          })
      })
  });
}

export const MARKETING_ACTIONS_V1 =
  Object.freeze([
    A({
      id: "local_ads",
      name: "本地广告",
      category: "local_acquisition",
      description: "在门店周边投放基础曝光，稳定提升新客到店。",
      cost: 2000,
      durationDays: 5,
      cooldownDays: 5,
      minRestaurantLevel: 1,
      exclusiveGroup: "local_acquisition",
      targetSegments: [
        "resident",
        "office_worker",
        "local_regular"
      ],
      demand: 1.12,
      appeal: 1.08,
      segmentMultipliers: {
        resident: 1.08,
        office_worker: 1.06,
        local_regular: 1.05
      }
    }),
    A({
      id: "street_flyer",
      name: "周边传单推广",
      category: "local_acquisition",
      description: "低成本覆盖附近居民、学生和通勤客。",
      cost: 800,
      durationDays: 3,
      cooldownDays: 4,
      minRestaurantLevel: 1,
      exclusiveGroup: "local_acquisition",
      targetSegments: [
        "resident",
        "student",
        "breakfast_commuter"
      ],
      demand: 1.07,
      appeal: 1.03,
      segmentMultipliers: {
        resident: 1.08,
        student: 1.08,
        breakfast_commuter: 1.06
      }
    }),
    A({
      id: "nearby_search_boost",
      name: "附近搜索加热",
      category: "local_acquisition",
      description: "提高地图与本地搜索曝光，增强即时到店流量。",
      cost: 3200,
      durationDays: 6,
      cooldownDays: 7,
      minRestaurantLevel: 2,
      exclusiveGroup: "local_acquisition",
      targetSegments: [
        "young_professional",
        "tourist",
        "solo_diner"
      ],
      demand: 1.1,
      appeal: 1.1,
      review: 1.05,
      segmentMultipliers: {
        young_professional: 1.09,
        tourist: 1.11,
        solo_diner: 1.07
      }
    }),
    A({
      id: "district_media_package",
      name: "商圈媒体套餐",
      category: "local_acquisition",
      description: "覆盖商圈屏幕、社群和本地资讯入口，形成集中曝光。",
      cost: 6500,
      durationDays: 7,
      cooldownDays: 10,
      minRestaurantLevel: 4,
      exclusiveGroup: "local_acquisition",
      targetSegments: [
        "resident",
        "office_worker",
        "mall_shopper",
        "weekend_leisure"
      ],
      demand: 1.14,
      appeal: 1.13,
      review: 1.05,
      segmentMultipliers: {
        resident: 1.06,
        office_worker: 1.07,
        mall_shopper: 1.08,
        weekend_leisure: 1.08
      }
    }),

    A({
      id: "flash_coupon",
      name: "限时优惠",
      category: "discount_conversion",
      description: "短期降价换取更高转化，适合快速拉升客流。",
      cost: 1000,
      durationDays: 3,
      cooldownDays: 5,
      minRestaurantLevel: 1,
      exclusiveGroup: "discount",
      demand: 1.08,
      price: 0.9,
      appeal: 1.1,
      segmentMultipliers: {
        student: 1.1,
        budget_family: 1.08,
        blue_collar: 1.08
      }
    }),
    A({
      id: "weekday_value_meal",
      name: "工作日超值套餐",
      category: "discount_conversion",
      description: "用组合套餐刺激工作日午餐与单人就餐需求。",
      cost: 1400,
      durationDays: 5,
      cooldownDays: 6,
      minRestaurantLevel: 1,
      exclusiveGroup: "discount",
      targetSegments: [
        "office_worker",
        "solo_diner",
        "blue_collar"
      ],
      demand: 1.09,
      price: 0.94,
      appeal: 1.06,
      segmentMultipliers: {
        office_worker: 1.12,
        solo_diner: 1.1,
        blue_collar: 1.08
      }
    }),
    A({
      id: "group_buy_deal",
      name: "团购套餐",
      category: "discount_conversion",
      description: "用团购形式扩大新客覆盖，但会压低实际成交价格。",
      cost: 2600,
      durationDays: 7,
      cooldownDays: 10,
      minRestaurantLevel: 2,
      exclusiveGroup: "discount",
      targetSegments: [
        "young_couple",
        "social_group",
        "mall_shopper"
      ],
      demand: 1.13,
      price: 0.92,
      appeal: 1.09,
      segmentMultipliers: {
        young_couple: 1.09,
        social_group: 1.12,
        mall_shopper: 1.08
      }
    }),
    A({
      id: "off_peak_discount",
      name: "错峰优惠",
      category: "discount_conversion",
      description: "将部分需求引导到非高峰时段，降低空闲时段浪费。",
      cost: 1800,
      durationDays: 6,
      cooldownDays: 7,
      minRestaurantLevel: 2,
      exclusiveGroup: "discount",
      targetSegments: [
        "senior",
        "freelancer",
        "solo_diner"
      ],
      demand: 1.07,
      price: 0.95,
      appeal: 1.05,
      repeat: 1.04,
      segmentMultipliers: {
        senior: 1.12,
        freelancer: 1.1,
        solo_diner: 1.07
      }
    }),

    A({
      id: "quality_campaign",
      name: "品质强化",
      category: "brand_building",
      description: "围绕食材、制作与出品进行品质传播。",
      cost: 3500,
      durationDays: 7,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "brand",
      appeal: 1.07,
      qualityBonus: 8,
      repeat: 1.05,
      review: 1.08,
      segmentMultipliers: {
        foodie: 1.1,
        premium_foodie: 1.08
      }
    }),
    A({
      id: "service_campaign",
      name: "服务强化",
      category: "brand_building",
      description: "强化服务承诺和现场体验，提升口碑与复购。",
      cost: 2500,
      durationDays: 7,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "brand",
      appeal: 1.05,
      repeat: 1.08,
      review: 1.06,
      service: 1.2,
      segmentMultipliers: {
        family_with_children: 1.06,
        business_guest: 1.06,
        local_regular: 1.06
      }
    }),
    A({
      id: "signature_dish_branding",
      name: "招牌菜品牌化",
      category: "brand_building",
      description: "围绕核心招牌菜集中塑造门店记忆点。",
      cost: 5200,
      durationDays: 10,
      cooldownDays: 14,
      minRestaurantLevel: 3,
      exclusiveGroup: "brand",
      appeal: 1.12,
      repeat: 1.06,
      review: 1.1,
      segmentMultipliers: {
        foodie: 1.14,
        premium_foodie: 1.1,
        tourist: 1.08
      }
    }),
    A({
      id: "brand_story_campaign",
      name: "品牌故事传播",
      category: "brand_building",
      description: "通过品牌故事与门店理念提升长期认知和口碑。",
      cost: 8500,
      durationDays: 14,
      cooldownDays: 20,
      minRestaurantLevel: 5,
      exclusiveGroup: "brand",
      appeal: 1.15,
      repeat: 1.08,
      review: 1.12,
      segmentMultipliers: {
        local_regular: 1.08,
        foodie: 1.08,
        weekend_leisure: 1.06
      }
    }),

    A({
      id: "short_video_content",
      name: "短视频内容投放",
      category: "content_social",
      description: "制作短视频内容吸引年轻客群和社交型消费者。",
      cost: 2800,
      durationDays: 5,
      cooldownDays: 6,
      minRestaurantLevel: 2,
      exclusiveGroup: "content",
      appeal: 1.11,
      demand: 1.08,
      review: 1.08,
      targetSegments: [
        "young_professional",
        "student",
        "young_couple"
      ],
      segmentMultipliers: {
        young_professional: 1.11,
        student: 1.1,
        young_couple: 1.1
      }
    }),
    A({
      id: "food_blogger_visit",
      name: "美食博主探店",
      category: "content_social",
      description: "邀请垂直美食创作者到店，提升口碑曝光。",
      cost: 4800,
      durationDays: 6,
      cooldownDays: 10,
      minRestaurantLevel: 3,
      exclusiveGroup: "content",
      appeal: 1.13,
      demand: 1.09,
      review: 1.15,
      targetSegments: [
        "foodie",
        "premium_foodie",
        "young_professional"
      ],
      segmentMultipliers: {
        foodie: 1.14,
        premium_foodie: 1.12,
        young_professional: 1.08
      }
    }),
    A({
      id: "ugc_checkin_reward",
      name: "打卡分享奖励",
      category: "content_social",
      description: "鼓励顾客主动分享内容，用轻优惠换取社交传播。",
      cost: 2200,
      durationDays: 7,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "content",
      demand: 1.07,
      appeal: 1.08,
      review: 1.18,
      repeat: 1.04,
      targetSegments: [
        "student",
        "young_couple",
        "social_group"
      ],
      segmentMultipliers: {
        student: 1.08,
        young_couple: 1.08,
        social_group: 1.09
      }
    }),
    A({
      id: "city_influencer_campaign",
      name: "城市达人联投",
      category: "content_social",
      description: "多位本地达人集中发布内容，形成短期品牌声量。",
      cost: 12000,
      durationDays: 8,
      cooldownDays: 18,
      minRestaurantLevel: 5,
      exclusiveGroup: "content",
      appeal: 1.2,
      demand: 1.13,
      review: 1.16,
      targetSegments: [
        "foodie",
        "young_professional",
        "mall_shopper",
        "tourist"
      ],
      segmentMultipliers: {
        foodie: 1.1,
        young_professional: 1.1,
        mall_shopper: 1.08,
        tourist: 1.08
      }
    }),

    A({
      id: "delivery_new_customer",
      name: "外卖新客补贴",
      category: "delivery_growth",
      description: "针对外卖新客提供短期补贴，快速提升外卖订单。",
      cost: 2600,
      durationDays: 5,
      cooldownDays: 7,
      minRestaurantLevel: 2,
      exclusiveGroup: "delivery",
      requiredChannels: [
        "delivery"
      ],
      targetSegments: [
        "delivery_heavy",
        "office_worker",
        "student"
      ],
      demand: 1.05,
      price: 0.95,
      appeal: 1.06,
      channelMultipliers: {
        delivery: 1.22
      },
      segmentMultipliers: {
        delivery_heavy: 1.12,
        office_worker: 1.06,
        student: 1.07
      }
    }),
    A({
      id: "delivery_rank_boost",
      name: "外卖榜单加热",
      category: "delivery_growth",
      description: "购买平台曝光并优化活动位，提升外卖渠道转化。",
      cost: 4200,
      durationDays: 7,
      cooldownDays: 9,
      minRestaurantLevel: 3,
      exclusiveGroup: "delivery",
      requiredChannels: [
        "delivery"
      ],
      appeal: 1.08,
      demand: 1.06,
      channelMultipliers: {
        delivery: 1.28
      },
      segmentMultipliers: {
        delivery_heavy: 1.14,
        young_professional: 1.07
      }
    }),
    A({
      id: "pickup_discount",
      name: "自取优惠",
      category: "delivery_growth",
      description: "鼓励到店自取，降低配送依赖并扩大便捷消费。",
      cost: 1600,
      durationDays: 6,
      cooldownDays: 7,
      minRestaurantLevel: 1,
      exclusiveGroup: "delivery",
      requiredChannels: [
        "pickup"
      ],
      price: 0.96,
      demand: 1.05,
      channelMultipliers: {
        pickup: 1.3
      },
      segmentMultipliers: {
        takeaway_commuter: 1.12,
        office_worker: 1.06
      }
    }),
    A({
      id: "late_night_delivery",
      name: "夜间外卖推广",
      category: "delivery_growth",
      description: "集中覆盖夜班和夜生活客群，提升夜间外卖需求。",
      cost: 3000,
      durationDays: 7,
      cooldownDays: 8,
      minRestaurantLevel: 3,
      exclusiveGroup: "delivery",
      requiredChannels: [
        "delivery"
      ],
      channelMultipliers: {
        delivery: 1.24
      },
      segmentMultipliers: {
        late_shift_worker: 1.16,
        nightlife: 1.16,
        delivery_heavy: 1.1
      }
    }),

    A({
      id: "community_sampling",
      name: "社区试吃活动",
      category: "community_scene",
      description: "用小规模试吃吸引附近居民并建立熟客认知。",
      cost: 1800,
      durationDays: 3,
      cooldownDays: 7,
      minRestaurantLevel: 1,
      exclusiveGroup: "community",
      demand: 1.08,
      appeal: 1.07,
      repeat: 1.06,
      targetSegments: [
        "resident",
        "senior",
        "local_regular"
      ],
      segmentMultipliers: {
        resident: 1.12,
        senior: 1.08,
        local_regular: 1.1
      }
    }),
    A({
      id: "family_day",
      name: "亲子家庭日",
      category: "community_scene",
      description: "围绕家庭聚餐和亲子体验设计主题活动。",
      cost: 2600,
      durationDays: 2,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "community",
      demand: 1.1,
      appeal: 1.07,
      repeat: 1.07,
      targetSegments: [
        "family_with_children",
        "parent_child",
        "budget_family"
      ],
      segmentMultipliers: {
        family_with_children: 1.18,
        parent_child: 1.18,
        budget_family: 1.08
      }
    }),
    A({
      id: "neighborhood_partner",
      name: "邻里商户联动",
      category: "community_scene",
      description: "与附近商户交叉引流，扩大稳定本地客群。",
      cost: 3200,
      durationDays: 8,
      cooldownDays: 12,
      minRestaurantLevel: 3,
      exclusiveGroup: "community",
      demand: 1.08,
      appeal: 1.09,
      repeat: 1.08,
      targetSegments: [
        "resident",
        "local_regular",
        "weekend_leisure"
      ],
      segmentMultipliers: {
        resident: 1.1,
        local_regular: 1.12,
        weekend_leisure: 1.07
      }
    }),
    A({
      id: "community_sponsorship",
      name: "社区活动赞助",
      category: "community_scene",
      description: "通过社区活动赞助获得长期本地曝光和品牌好感。",
      cost: 6000,
      durationDays: 10,
      cooldownDays: 18,
      minRestaurantLevel: 4,
      exclusiveGroup: "community",
      appeal: 1.12,
      repeat: 1.09,
      review: 1.08,
      segmentMultipliers: {
        resident: 1.09,
        local_regular: 1.1,
        senior: 1.06
      }
    }),

    A({
      id: "member_welcome_bonus",
      name: "新会员欢迎礼",
      category: "member_retention",
      description: "强化首次入会后的第二次到店意愿。",
      cost: 1600,
      durationDays: 7,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "member",
      repeat: 1.12,
      appeal: 1.04,
      targetSegments: [
        "local_regular",
        "young_professional"
      ],
      segmentMultipliers: {
        local_regular: 1.08,
        young_professional: 1.05
      }
    }),
    A({
      id: "member_double_points",
      name: "会员双倍积分周",
      category: "member_retention",
      description: "用积分激励已有顾客增加到店频率。",
      cost: 2400,
      durationDays: 7,
      cooldownDays: 12,
      minRestaurantLevel: 3,
      exclusiveGroup: "member",
      repeat: 1.16,
      demand: 1.05,
      segmentMultipliers: {
        local_regular: 1.12,
        high_income: 1.05
      }
    }),
    A({
      id: "lapsed_member_recall",
      name: "沉睡会员召回",
      category: "member_retention",
      description: "针对长时间未到店会员进行定向召回。",
      cost: 3000,
      durationDays: 7,
      cooldownDays: 14,
      minRestaurantLevel: 3,
      exclusiveGroup: "member",
      repeat: 1.14,
      demand: 1.06,
      appeal: 1.04,
      segmentMultipliers: {
        local_regular: 1.14,
        resident: 1.05
      }
    }),
    A({
      id: "vip_member_night",
      name: "高价值会员专场",
      category: "member_retention",
      description: "面向高价值熟客打造预约式专属活动。",
      cost: 5200,
      durationDays: 3,
      cooldownDays: 18,
      minRestaurantLevel: 5,
      exclusiveGroup: "member",
      requiredChannels: [
        "reservation"
      ],
      repeat: 1.18,
      appeal: 1.08,
      review: 1.08,
      channelMultipliers: {
        reservation: 1.22
      },
      segmentMultipliers: {
        high_income: 1.12,
        premium_foodie: 1.1,
        business_guest: 1.08
      }
    }),

    A({
      id: "office_lunch_partnership",
      name: "写字楼午餐合作",
      category: "group_business",
      description: "与周边企业建立午餐合作，提高稳定工作日需求。",
      cost: 3200,
      durationDays: 10,
      cooldownDays: 12,
      minRestaurantLevel: 2,
      exclusiveGroup: "group_business",
      targetSegments: [
        "office_worker",
        "young_professional"
      ],
      demand: 1.07,
      repeat: 1.08,
      segmentMultipliers: {
        office_worker: 1.2,
        young_professional: 1.08
      }
    }),
    A({
      id: "corporate_group_meal",
      name: "企业团餐推广",
      category: "group_business",
      description: "针对企业批量订单与团队餐场景做专项推广。",
      cost: 4800,
      durationDays: 12,
      cooldownDays: 14,
      minRestaurantLevel: 3,
      exclusiveGroup: "group_business",
      requiredChannels: [
        "pickup"
      ],
      demand: 1.08,
      appeal: 1.06,
      channelMultipliers: {
        pickup: 1.14
      },
      segmentMultipliers: {
        business_guest: 1.12,
        office_worker: 1.12
      }
    }),
    A({
      id: "banquet_sales_push",
      name: "聚餐宴请推广",
      category: "group_business",
      description: "针对多人聚餐和商务宴请进行集中获客。",
      cost: 6200,
      durationDays: 10,
      cooldownDays: 15,
      minRestaurantLevel: 4,
      exclusiveGroup: "group_business",
      requiredChannels: [
        "reservation"
      ],
      appeal: 1.1,
      demand: 1.08,
      channelMultipliers: {
        reservation: 1.25
      },
      segmentMultipliers: {
        social_group: 1.14,
        business_guest: 1.14,
        family_with_children: 1.08
      }
    }),
    A({
      id: "conference_catering",
      name: "会务餐饮拓展",
      category: "group_business",
      description: "开发会议、会展和商务接待类订单。",
      cost: 9000,
      durationDays: 14,
      cooldownDays: 20,
      minRestaurantLevel: 6,
      exclusiveGroup: "group_business",
      requiredChannels: [
        "reservation",
        "pickup"
      ],
      appeal: 1.12,
      demand: 1.1,
      channelMultipliers: {
        reservation: 1.24,
        pickup: 1.1
      },
      segmentMultipliers: {
        business_guest: 1.18,
        high_income: 1.08
      }
    }),

    A({
      id: "holiday_menu_push",
      name: "节日菜单推广",
      category: "seasonal_event",
      description: "围绕节日限定菜单进行短期主题营销。",
      cost: 2800,
      durationDays: 5,
      cooldownDays: 10,
      minRestaurantLevel: 2,
      exclusiveGroup: "seasonal",
      demand: 1.1,
      appeal: 1.08,
      review: 1.05,
      segmentMultipliers: {
        family_with_children: 1.08,
        young_couple: 1.08,
        social_group: 1.08
      }
    }),
    A({
      id: "weekend_brunch_push",
      name: "周末休闲推广",
      category: "seasonal_event",
      description: "强化周末聚餐与休闲场景，吸引家庭和情侣。",
      cost: 2200,
      durationDays: 4,
      cooldownDays: 8,
      minRestaurantLevel: 2,
      exclusiveGroup: "seasonal",
      demand: 1.08,
      appeal: 1.06,
      segmentMultipliers: {
        weekend_leisure: 1.16,
        young_couple: 1.1,
        family_with_children: 1.08
      }
    }),
    A({
      id: "summer_cool_campaign",
      name: "夏季清凉主题",
      category: "seasonal_event",
      description: "突出清凉饮品、轻食和夏季消费场景。",
      cost: 3600,
      durationDays: 8,
      cooldownDays: 12,
      minRestaurantLevel: 3,
      exclusiveGroup: "seasonal",
      demand: 1.08,
      appeal: 1.08,
      segmentMultipliers: {
        young_professional: 1.08,
        student: 1.08,
        health_conscious: 1.1
      }
    }),
    A({
      id: "year_end_gathering",
      name: "年末聚餐推广",
      category: "seasonal_event",
      description: "针对年末公司、朋友和家庭聚餐集中投放。",
      cost: 7600,
      durationDays: 12,
      cooldownDays: 20,
      minRestaurantLevel: 5,
      exclusiveGroup: "seasonal",
      requiredChannels: [
        "reservation"
      ],
      demand: 1.14,
      appeal: 1.11,
      channelMultipliers: {
        reservation: 1.28
      },
      segmentMultipliers: {
        social_group: 1.16,
        business_guest: 1.12,
        family_with_children: 1.1
      }
    })
  ]);

export const MARKETING_ACTION_DATASET_META =
  Object.freeze({
    schemaVersion:
      MARKETING_ACTION_SCHEMA_VERSION,
    datasetVersion: "1.0.0",
    total:
      MARKETING_ACTIONS_V1.length,
    categories: 9,
    legacyIdsPreserved: 4
  });
