import {
  RESTAURANT_POSITIONING_SCHEMA_VERSION
} from "./restaurantPositioningRules.js";

function P({
  id,
  name,
  description,
  minRestaurantLevel = 1,
  priceRange,
  targetSegments,
  categoryWeights,
  venueWeights,
  renovationProfile,
  marketingCategoryWeights,
  competitionTolerance
}) {
  return Object.freeze({
    schemaVersion:
      RESTAURANT_POSITIONING_SCHEMA_VERSION,
    id,
    name,
    description,
    minRestaurantLevel,
    priceRange:
      Object.freeze([...priceRange]),
    targetSegments:
      Object.freeze({
        ...targetSegments
      }),
    categoryWeights:
      Object.freeze({
        default: 0.85,
        ...categoryWeights
      }),
    venueWeights:
      Object.freeze({
        default: 0.82,
        ...venueWeights
      }),
    renovationProfile:
      Object.freeze({
        ...renovationProfile
      }),
    marketingCategoryWeights:
      Object.freeze({
        local_acquisition: 1,
        discount_conversion: 1,
        brand_building: 1,
        content_social: 1,
        delivery_growth: 1,
        community_scene: 1,
        member_retention: 1,
        group_business: 1,
        seasonal_event: 1,
        ...marketingCategoryWeights
      }),
    competitionTolerance
  });
}

export const RESTAURANT_POSITIONINGS_V1 =
  Object.freeze([
    P({
      id: "quick_service",
      name: "快餐便餐",
      description: "强调高周转、标准化和快速出餐，适合通勤与单人高频消费。",
      priceRange: [0.75, 1.05],
      targetSegments: {
        office_worker: 1.3,
        student: 1.15,
        blue_collar: 1.12,
        solo_diner: 1.2,
        takeaway_commuter: 1.22
      },
      categoryWeights: {
        fast_food: 1.32,
        rice: 1.22,
        noodle: 1.18,
        set_meal: 1.2,
        dumpling_bun: 1.08,
        hotpot: 0.62
      },
      venueWeights: {
        fast_service_store: 1.35,
        hub_store: 1.2,
        office_restaurant: 1.18,
        street_shop: 1.1,
        stall: 1.08,
        cloud_kitchen: 1.08
      },
      renovationProfile: {
        throughput: 0.62,
        comfort: 0.18,
        appeal: 0.2
      },
      marketingCategoryWeights: {
        local_acquisition: 1.12,
        discount_conversion: 1.15,
        delivery_growth: 1.12
      },
      competitionTolerance: 0.72
    }),
    P({
      id: "family_dining",
      name: "家庭正餐",
      description: "覆盖家庭聚餐和社区熟客，强调菜品丰富、舒适和稳定复购。",
      priceRange: [0.9, 1.25],
      targetSegments: {
        resident: 1.3,
        family_with_children: 1.3,
        budget_family: 1.12,
        local_regular: 1.18,
        senior: 1.05
      },
      categoryWeights: {
        stir_fry: 1.3,
        soup: 1.16,
        hotpot: 1.12,
        rice: 1.08,
        cold_dish: 1.08,
        set_meal: 1.05
      },
      venueWeights: {
        community_store: 1.35,
        suburban_family_restaurant: 1.35,
        street_shop: 1.12,
        courtyard_restaurant: 1.08,
        farmhouse: 1.05
      },
      renovationProfile: {
        throughput: 0.25,
        comfort: 0.5,
        appeal: 0.25
      },
      marketingCategoryWeights: {
        community_scene: 1.25,
        member_retention: 1.18,
        seasonal_event: 1.12
      },
      competitionTolerance: 0.66
    }),
    P({
      id: "student_value",
      name: "学生实惠",
      description: "面向学生和年轻客群，以低客单、高频率和外卖自取为核心。",
      priceRange: [0.65, 0.95],
      targetSegments: {
        student: 1.4,
        solo_diner: 1.16,
        delivery_heavy: 1.12,
        young_couple: 1.05,
        social_group: 1.05
      },
      categoryWeights: {
        fast_food: 1.28,
        rice: 1.24,
        noodle: 1.24,
        snack: 1.18,
        dessert: 1.08,
        beverage: 1.08
      },
      venueWeights: {
        campus_store: 1.42,
        stall: 1.22,
        fast_service_store: 1.18,
        cloud_kitchen: 1.15,
        dessert_beverage_store: 1.06
      },
      renovationProfile: {
        throughput: 0.64,
        comfort: 0.16,
        appeal: 0.2
      },
      marketingCategoryWeights: {
        discount_conversion: 1.3,
        content_social: 1.16,
        delivery_growth: 1.2
      },
      competitionTolerance: 0.8
    }),
    P({
      id: "specialty_dining",
      name: "特色餐饮",
      description: "依靠特色菜和差异化体验吸引美食客与目的性消费。",
      priceRange: [0.95, 1.4],
      targetSegments: {
        foodie: 1.32,
        tourist: 1.25,
        premium_foodie: 1.12,
        young_couple: 1.08,
        weekend_leisure: 1.1
      },
      categoryWeights: {
        specialty: 1.4,
        hotpot: 1.24,
        barbecue: 1.2,
        stir_fry: 1.15,
        cold_dish: 1.08
      },
      venueWeights: {
        creative_theme_store: 1.3,
        old_brand_shop: 1.22,
        scenic_store: 1.16,
        courtyard_restaurant: 1.14,
        street_shop: 1.08
      },
      renovationProfile: {
        throughput: 0.18,
        comfort: 0.3,
        appeal: 0.52
      },
      marketingCategoryWeights: {
        brand_building: 1.24,
        content_social: 1.26,
        seasonal_event: 1.08
      },
      competitionTolerance: 0.62
    }),
    P({
      id: "office_lunch",
      name: "办公午餐",
      description: "针对写字楼工作日午餐，强调效率、套餐和稳定出餐。",
      priceRange: [0.82, 1.12],
      targetSegments: {
        office_worker: 1.42,
        young_professional: 1.26,
        business_guest: 1.05,
        takeaway_commuter: 1.18,
        delivery_heavy: 1.12
      },
      categoryWeights: {
        set_meal: 1.35,
        rice: 1.24,
        noodle: 1.16,
        fast_food: 1.2,
        soup: 1.05
      },
      venueWeights: {
        office_restaurant: 1.42,
        tech_park_light_meal: 1.28,
        fast_service_store: 1.2,
        mall_store: 1.08,
        cloud_kitchen: 1.08
      },
      renovationProfile: {
        throughput: 0.68,
        comfort: 0.18,
        appeal: 0.14
      },
      marketingCategoryWeights: {
        local_acquisition: 1.12,
        group_business: 1.24,
        delivery_growth: 1.14
      },
      competitionTolerance: 0.78
    }),
    P({
      id: "breakfast_convenience",
      name: "早餐便民",
      description: "服务早高峰通勤和社区刚需，依赖高效率、低等待和外带。",
      priceRange: [0.65, 0.95],
      targetSegments: {
        breakfast_commuter: 1.5,
        office_worker: 1.18,
        senior: 1.16,
        resident: 1.12,
        takeaway_commuter: 1.18
      },
      categoryWeights: {
        breakfast: 1.5,
        dumpling_bun: 1.28,
        beverage: 1.16,
        noodle: 1.08,
        snack: 1.06
      },
      venueWeights: {
        breakfast_store: 1.5,
        hub_store: 1.22,
        street_shop: 1.14,
        wholesale_fast_food: 1.1,
        deli_takeaway_store: 1.08
      },
      renovationProfile: {
        throughput: 0.72,
        comfort: 0.12,
        appeal: 0.16
      },
      marketingCategoryWeights: {
        local_acquisition: 1.18,
        discount_conversion: 1.1,
        community_scene: 1.08
      },
      competitionTolerance: 0.82
    }),
    P({
      id: "community_home_style",
      name: "社区家常",
      description: "服务周边居民和熟客，以家常口味、稳定价格和复购为主。",
      priceRange: [0.78, 1.08],
      targetSegments: {
        resident: 1.38,
        local_regular: 1.38,
        senior: 1.18,
        budget_family: 1.16,
        family_with_children: 1.12
      },
      categoryWeights: {
        stir_fry: 1.28,
        soup: 1.2,
        rice: 1.15,
        cold_dish: 1.12,
        dumpling_bun: 1.05
      },
      venueWeights: {
        community_store: 1.45,
        street_shop: 1.18,
        old_brand_shop: 1.08,
        suburban_family_restaurant: 1.12
      },
      renovationProfile: {
        throughput: 0.3,
        comfort: 0.46,
        appeal: 0.24
      },
      marketingCategoryWeights: {
        community_scene: 1.32,
        member_retention: 1.28,
        local_acquisition: 1.08
      },
      competitionTolerance: 0.7
    }),
    P({
      id: "delivery_first",
      name: "外卖优先",
      description: "将外卖和自取作为主要增长渠道，强调标准化、配送效率和单人餐。",
      minRestaurantLevel: 2,
      priceRange: [0.75, 1.1],
      targetSegments: {
        delivery_heavy: 1.5,
        solo_diner: 1.22,
        office_worker: 1.18,
        student: 1.16,
        late_shift_worker: 1.08
      },
      categoryWeights: {
        rice: 1.25,
        noodle: 1.18,
        fast_food: 1.28,
        set_meal: 1.22,
        snack: 1.08
      },
      venueWeights: {
        cloud_kitchen: 1.5,
        deli_takeaway_store: 1.35,
        tech_park_light_meal: 1.22,
        fast_service_store: 1.2,
        stall: 1.1
      },
      renovationProfile: {
        throughput: 0.8,
        comfort: 0.05,
        appeal: 0.15
      },
      marketingCategoryWeights: {
        delivery_growth: 1.4,
        discount_conversion: 1.12,
        content_social: 1.05
      },
      competitionTolerance: 0.86
    }),
    P({
      id: "healthy_light_meal",
      name: "健康轻食",
      description: "面向健康意识和年轻白领，突出轻负担、品质感和线上传播。",
      minRestaurantLevel: 2,
      priceRange: [0.95, 1.28],
      targetSegments: {
        health_conscious: 1.48,
        young_professional: 1.28,
        office_worker: 1.12,
        freelancer: 1.08,
        premium_foodie: 1.05
      },
      categoryWeights: {
        cold_dish: 1.3,
        soup: 1.18,
        rice: 1.08,
        beverage: 1.22,
        dessert: 1.05,
        fast_food: 0.72
      },
      venueWeights: {
        tech_park_light_meal: 1.45,
        mall_store: 1.18,
        medical_support_store: 1.2,
        street_shop: 1.06
      },
      renovationProfile: {
        throughput: 0.28,
        comfort: 0.28,
        appeal: 0.44
      },
      marketingCategoryWeights: {
        content_social: 1.24,
        brand_building: 1.18,
        local_acquisition: 1.08
      },
      competitionTolerance: 0.68
    }),
    P({
      id: "dessert_social",
      name: "甜品社交",
      description: "以甜品饮品、打卡和社交体验为主，面向年轻人与商场客群。",
      minRestaurantLevel: 2,
      priceRange: [0.88, 1.25],
      targetSegments: {
        young_couple: 1.36,
        student: 1.2,
        mall_shopper: 1.32,
        freelancer: 1.18,
        young_professional: 1.14
      },
      categoryWeights: {
        dessert: 1.5,
        beverage: 1.45,
        bakery: 1.28,
        snack: 1.12
      },
      venueWeights: {
        dessert_beverage_store: 1.5,
        mall_store: 1.28,
        creative_theme_store: 1.18,
        rooftop_restaurant: 1.08
      },
      renovationProfile: {
        throughput: 0.16,
        comfort: 0.28,
        appeal: 0.56
      },
      marketingCategoryWeights: {
        content_social: 1.4,
        brand_building: 1.18,
        seasonal_event: 1.16
      },
      competitionTolerance: 0.6
    }),
    P({
      id: "nightlife_social",
      name: "夜间聚餐",
      description: "服务夜生活和朋友聚会，强调氛围、分享型菜品和夜间场景。",
      minRestaurantLevel: 3,
      priceRange: [0.95, 1.35],
      targetSegments: {
        nightlife: 1.46,
        social_group: 1.4,
        young_couple: 1.18,
        late_shift_worker: 1.08,
        foodie: 1.08
      },
      categoryWeights: {
        barbecue: 1.4,
        hotpot: 1.34,
        cold_dish: 1.16,
        snack: 1.14,
        beverage: 1.22
      },
      venueWeights: {
        nightlife_store: 1.5,
        rooftop_restaurant: 1.24,
        street_shop: 1.08,
        creative_theme_store: 1.12
      },
      renovationProfile: {
        throughput: 0.2,
        comfort: 0.3,
        appeal: 0.5
      },
      marketingCategoryWeights: {
        content_social: 1.28,
        seasonal_event: 1.22,
        local_acquisition: 1.08
      },
      competitionTolerance: 0.72
    }),
    P({
      id: "business_dining",
      name: "商务宴请",
      description: "面向商务客和高收入客群，强调服务、私密性、预约和品质。",
      minRestaurantLevel: 4,
      priceRange: [1.15, 1.65],
      targetSegments: {
        business_guest: 1.5,
        high_income: 1.36,
        premium_foodie: 1.22,
        office_worker: 1.04
      },
      categoryWeights: {
        specialty: 1.3,
        stir_fry: 1.22,
        soup: 1.18,
        cold_dish: 1.12,
        set_meal: 1.12,
        fast_food: 0.5
      },
      venueWeights: {
        clubhouse_restaurant: 1.45,
        convention_restaurant: 1.34,
        office_restaurant: 1.18,
        courtyard_restaurant: 1.2,
        villa_private_kitchen: 1.26
      },
      renovationProfile: {
        throughput: 0.08,
        comfort: 0.48,
        appeal: 0.44
      },
      marketingCategoryWeights: {
        group_business: 1.38,
        brand_building: 1.22,
        member_retention: 1.12
      },
      competitionTolerance: 0.58
    }),
    P({
      id: "premium_private",
      name: "高端私厨",
      description: "低翻台、高客单和预约制体验，依赖品质、空间和高价值熟客。",
      minRestaurantLevel: 5,
      priceRange: [1.35, 2],
      targetSegments: {
        high_income: 1.5,
        premium_foodie: 1.5,
        business_guest: 1.32,
        foodie: 1.22,
        young_couple: 1.04
      },
      categoryWeights: {
        specialty: 1.45,
        soup: 1.22,
        stir_fry: 1.2,
        cold_dish: 1.16,
        dessert: 1.1,
        fast_food: 0.4
      },
      venueWeights: {
        villa_private_kitchen: 1.55,
        clubhouse_restaurant: 1.45,
        courtyard_restaurant: 1.26,
        waterfront_restaurant: 1.2,
        mountain_resort: 1.18
      },
      renovationProfile: {
        throughput: 0.04,
        comfort: 0.48,
        appeal: 0.48
      },
      marketingCategoryWeights: {
        brand_building: 1.38,
        member_retention: 1.28,
        group_business: 1.16,
        discount_conversion: 0.55
      },
      competitionTolerance: 0.48
    }),
    P({
      id: "tourism_destination",
      name: "文旅目的地餐饮",
      description: "面向游客和周末休闲客，以特色、环境和目的性消费为核心。",
      minRestaurantLevel: 3,
      priceRange: [1.05, 1.5],
      targetSegments: {
        tourist: 1.5,
        weekend_leisure: 1.42,
        foodie: 1.28,
        young_couple: 1.18,
        family_with_children: 1.08
      },
      categoryWeights: {
        specialty: 1.42,
        barbecue: 1.18,
        stir_fry: 1.18,
        dessert: 1.08,
        beverage: 1.08
      },
      venueWeights: {
        scenic_store: 1.5,
        farmhouse: 1.4,
        mountain_resort: 1.38,
        waterfront_restaurant: 1.4,
        courtyard_restaurant: 1.26
      },
      renovationProfile: {
        throughput: 0.1,
        comfort: 0.34,
        appeal: 0.56
      },
      marketingCategoryWeights: {
        content_social: 1.32,
        seasonal_event: 1.3,
        brand_building: 1.16
      },
      competitionTolerance: 0.64
    }),
    P({
      id: "banquet_gathering",
      name: "聚会宴席",
      description: "覆盖多人聚餐、宴席和活动需求，强调容量、预约和成桌出品。",
      minRestaurantLevel: 4,
      priceRange: [1.02, 1.45],
      targetSegments: {
        social_group: 1.45,
        family_with_children: 1.28,
        business_guest: 1.2,
        resident: 1.1,
        weekend_leisure: 1.12
      },
      categoryWeights: {
        stir_fry: 1.28,
        soup: 1.2,
        cold_dish: 1.16,
        hotpot: 1.1,
        specialty: 1.18,
        set_meal: 1.15
      },
      venueWeights: {
        convention_restaurant: 1.38,
        suburban_family_restaurant: 1.3,
        mountain_resort: 1.24,
        clubhouse_restaurant: 1.18,
        courtyard_restaurant: 1.2
      },
      renovationProfile: {
        throughput: 0.3,
        comfort: 0.38,
        appeal: 0.32
      },
      marketingCategoryWeights: {
        group_business: 1.4,
        seasonal_event: 1.24,
        community_scene: 1.08
      },
      competitionTolerance: 0.7
    }),
    P({
      id: "industrial_canteen",
      name: "园区团餐",
      description: "面向工业园和园区员工，以规模供餐、低波动和效率为核心。",
      minRestaurantLevel: 3,
      priceRange: [0.7, 1],
      targetSegments: {
        blue_collar: 1.5,
        late_shift_worker: 1.3,
        office_worker: 1.14,
        gig_worker: 1.08,
        solo_diner: 1.08
      },
      categoryWeights: {
        set_meal: 1.45,
        rice: 1.3,
        noodle: 1.18,
        soup: 1.12,
        fast_food: 1.18
      },
      venueWeights: {
        industrial_canteen: 1.55,
        wholesale_fast_food: 1.28,
        fast_service_store: 1.16,
        office_restaurant: 1.08
      },
      renovationProfile: {
        throughput: 0.82,
        comfort: 0.12,
        appeal: 0.06
      },
      marketingCategoryWeights: {
        group_business: 1.42,
        discount_conversion: 1.08,
        local_acquisition: 0.9
      },
      competitionTolerance: 0.9
    })
  ]);

export const RESTAURANT_POSITIONING_DATASET_META =
  Object.freeze({
    schemaVersion:
      RESTAURANT_POSITIONING_SCHEMA_VERSION,
    datasetVersion: "1.0.0",
    total:
      RESTAURANT_POSITIONINGS_V1.length,
    legacyIdsPreserved: 4
  });
