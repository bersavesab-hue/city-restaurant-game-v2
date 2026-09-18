import {
  DISTRICT_SCHEMA_VERSION
} from "./districtRules.js";

export const DISTRICT_DATASET_META =
  Object.freeze({
    schemaVersion:
      DISTRICT_SCHEMA_VERSION,
    datasetVersion:
      "2.0.0",
    total: 20,
    legacyIdsPreserved: 10
  });

const DEFAULT_EVENTS =
  Object.freeze({
    convention: 1,
    road_construction: 1,
    severe_weather: 1,
    school_opening: 1,
    office_holiday: 1,
    neighborhood_festival: 1,
    competitor_promotion: 1
  });

function district({
  id,
  name,
  zoneType,
  customerProfileType,
  x,
  y,
  trafficIndex,
  rentMultiplier,
  spendingPower,
  competition,
  seasonality,
  deliveryDemand,
  parkingConvenience,
  transitAccess,
  customerMix,
  venueAffinity,
  positioningAffinity,
  mealPeriodWeights,
  eventSensitivity = {}
}) {
  return Object.freeze({
    schemaVersion:
      DISTRICT_SCHEMA_VERSION,
    id,
    name,
    zoneType,
    customerProfileType,
    mapPosition:
      Object.freeze({
        x,
        y
      }),
    trafficIndex,
    rentMultiplier,
    spendingPower,
    competition,
    seasonality,
    deliveryDemand,
    parkingConvenience,
    transitAccess,
    customerMix:
      Object.freeze({
        ...customerMix
      }),
    venueAffinity:
      Object.freeze({
        ...venueAffinity
      }),
    positioningAffinity:
      Object.freeze({
        ...positioningAffinity
      }),
    mealPeriodWeights:
      Object.freeze({
        ...mealPeriodWeights
      }),
    eventSensitivity:
      Object.freeze({
        ...DEFAULT_EVENTS,
        ...eventSensitivity
      })
  });
}

export const CITY_DISTRICTS_V2 =
  Object.freeze([
    district({
      id: "old_town",
      name: "老城商业区",
      zoneType: "old_town",
      customerProfileType: "old_town",
      x: 18,
      y: 26,
      trafficIndex: 78,
      rentMultiplier: 0.96,
      spendingPower: 58,
      competition: 68,
      seasonality: 1.02,
      deliveryDemand: 58,
      parkingConvenience: 38,
      transitAccess: 78,
      customerMix: {
        resident: 24,
        senior: 14,
        tourist: 16,
        office_worker: 10,
        foodie: 8,
        student: 6,
        local_regular: 12,
        freelancer: 10
      },
      venueAffinity: {
        street_shop: 1.18,
        old_brand_shop: 1.22,
        courtyard_restaurant: 1.08,
        breakfast_store: 1.08,
        stall: 1.05,
        mall_store: 0.82
      },
      positioningAffinity: {
        quick_service: 1,
        family_dining: 1.12,
        student_value: 0.92,
        specialty_dining: 1.18
      },
      mealPeriodWeights: {
        breakfast: 1.12,
        lunch: 1.08,
        afternoon: 0.82,
        dinner: 1.18,
        late_night: 0.72
      },
      eventSensitivity: {
        road_construction: 1.2,
        neighborhood_festival: 1.25
      }
    }),

    district({
      id: "cbd",
      name: "CBD商务区",
      zoneType: "cbd",
      customerProfileType: "cbd",
      x: 48,
      y: 18,
      trafficIndex: 90,
      rentMultiplier: 1.55,
      spendingPower: 86,
      competition: 84,
      seasonality: 0.98,
      deliveryDemand: 88,
      parkingConvenience: 52,
      transitAccess: 96,
      customerMix: {
        office_worker: 32,
        business_guest: 16,
        high_income: 10,
        young_professional: 14,
        delivery_heavy: 8,
        takeaway_commuter: 8,
        foodie: 6,
        premium_foodie: 6
      },
      venueAffinity: {
        office_restaurant: 1.22,
        mall_store: 1.15,
        fast_service_store: 1.12,
        cloud_kitchen: 1.08,
        street_shop: 0.94,
        villa_private_kitchen: 0.82
      },
      positioningAffinity: {
        quick_service: 1.22,
        family_dining: 0.88,
        student_value: 0.76,
        specialty_dining: 1.08
      },
      mealPeriodWeights: {
        breakfast: 1.08,
        lunch: 1.38,
        afternoon: 0.88,
        dinner: 1.02,
        late_night: 0.52
      },
      eventSensitivity: {
        convention: 1.2,
        office_holiday: 1.4,
        road_construction: 1.18
      }
    }),

    district({
      id: "university",
      name: "大学城",
      zoneType: "university",
      customerProfileType: "university",
      x: 78,
      y: 23,
      trafficIndex: 82,
      rentMultiplier: 0.82,
      spendingPower: 43,
      competition: 59,
      seasonality: 0.9,
      deliveryDemand: 92,
      parkingConvenience: 28,
      transitAccess: 82,
      customerMix: {
        student: 48,
        young_professional: 6,
        freelancer: 8,
        delivery_heavy: 9,
        budget_family: 10,
        social_group: 8,
        nightlife: 6,
        foodie: 5
      },
      venueAffinity: {
        campus_store: 1.25,
        street_shop: 1.15,
        stall: 1.12,
        cloud_kitchen: 1.08,
        fast_service_store: 1.1,
        villa_private_kitchen: 0.38
      },
      positioningAffinity: {
        quick_service: 1.18,
        family_dining: 0.72,
        student_value: 1.4,
        specialty_dining: 0.92
      },
      mealPeriodWeights: {
        breakfast: 0.82,
        lunch: 1.18,
        afternoon: 1.05,
        dinner: 1.32,
        late_night: 1.18
      },
      eventSensitivity: {
        school_opening: 1.5,
        severe_weather: 1.15,
        neighborhood_festival: 1.18
      }
    }),

    district({
      id: "premium_residential",
      name: "高端住宅区",
      zoneType: "premium_residential",
      customerProfileType: "premium_residential",
      x: 22,
      y: 52,
      trafficIndex: 62,
      rentMultiplier: 1.28,
      spendingPower: 91,
      competition: 48,
      seasonality: 1.04,
      deliveryDemand: 72,
      parkingConvenience: 88,
      transitAccess: 56,
      customerMix: {
        high_income: 24,
        resident: 17,
        family_with_children: 14,
        premium_foodie: 12,
        health_conscious: 10,
        business_guest: 8,
        weekend_leisure: 8,
        young_couple: 7
      },
      venueAffinity: {
        villa_private_kitchen: 1.35,
        courtyard_restaurant: 1.2,
        clubhouse_restaurant: 1.18,
        mall_store: 1.02,
        street_shop: 0.86,
        cloud_kitchen: 0.72
      },
      positioningAffinity: {
        quick_service: 0.72,
        family_dining: 1.22,
        student_value: 0.55,
        specialty_dining: 1.28
      },
      mealPeriodWeights: {
        breakfast: 0.78,
        lunch: 0.92,
        afternoon: 1.05,
        dinner: 1.35,
        late_night: 0.55
      },
      eventSensitivity: {
        severe_weather: 0.82,
        neighborhood_festival: 1.15
      }
    }),

    district({
      id: "residential",
      name: "普通居民区",
      zoneType: "residential",
      customerProfileType: "residential",
      x: 47,
      y: 48,
      trafficIndex: 66,
      rentMultiplier: 0.76,
      spendingPower: 56,
      competition: 42,
      seasonality: 1,
      deliveryDemand: 78,
      parkingConvenience: 68,
      transitAccess: 62,
      customerMix: {
        resident: 28,
        senior: 13,
        budget_family: 14,
        family_with_children: 12,
        local_regular: 12,
        office_worker: 7,
        delivery_heavy: 8,
        solo_diner: 6
      },
      venueAffinity: {
        community_store: 1.25,
        street_shop: 1.12,
        breakfast_store: 1.08,
        cloud_kitchen: 1.02,
        villa_private_kitchen: 0.72,
        mall_store: 0.82
      },
      positioningAffinity: {
        quick_service: 1.02,
        family_dining: 1.3,
        student_value: 1.02,
        specialty_dining: 0.96
      },
      mealPeriodWeights: {
        breakfast: 1.05,
        lunch: 0.92,
        afternoon: 0.82,
        dinner: 1.36,
        late_night: 0.48
      },
      eventSensitivity: {
        neighborhood_festival: 1.25,
        road_construction: 1.08
      }
    }),

    district({
      id: "transport_hub",
      name: "交通枢纽区",
      zoneType: "transport_hub",
      customerProfileType: "transport_hub",
      x: 76,
      y: 50,
      trafficIndex: 98,
      rentMultiplier: 1.34,
      spendingPower: 63,
      competition: 88,
      seasonality: 1.08,
      deliveryDemand: 48,
      parkingConvenience: 44,
      transitAccess: 100,
      customerMix: {
        tourist: 18,
        office_worker: 14,
        takeaway_commuter: 18,
        breakfast_commuter: 12,
        gig_worker: 10,
        solo_diner: 8,
        student: 7,
        blue_collar: 7,
        foodie: 6
      },
      venueAffinity: {
        hub_store: 1.25,
        fast_service_store: 1.18,
        street_shop: 0.95,
        breakfast_store: 1.12,
        stall: 1.05,
        villa_private_kitchen: 0.3
      },
      positioningAffinity: {
        quick_service: 1.38,
        family_dining: 0.62,
        student_value: 1.08,
        specialty_dining: 0.72
      },
      mealPeriodWeights: {
        breakfast: 1.28,
        lunch: 1.2,
        afternoon: 0.95,
        dinner: 1.08,
        late_night: 0.8
      },
      eventSensitivity: {
        severe_weather: 1.3,
        road_construction: 1.35,
        convention: 1.08
      }
    }),

    district({
      id: "industrial_park",
      name: "工业园区",
      zoneType: "industrial_park",
      customerProfileType: "industrial_park",
      x: 18,
      y: 76,
      trafficIndex: 70,
      rentMultiplier: 0.64,
      spendingPower: 45,
      competition: 34,
      seasonality: 0.98,
      deliveryDemand: 66,
      parkingConvenience: 72,
      transitAccess: 48,
      customerMix: {
        blue_collar: 34,
        office_worker: 14,
        late_shift_worker: 14,
        gig_worker: 8,
        budget_family: 8,
        solo_diner: 7,
        takeaway_commuter: 7,
        resident: 8
      },
      venueAffinity: {
        industrial_canteen: 1.3,
        street_shop: 1.05,
        cloud_kitchen: 1.1,
        fast_service_store: 1.08,
        villa_private_kitchen: 0.28
      },
      positioningAffinity: {
        quick_service: 1.28,
        family_dining: 0.78,
        student_value: 1.18,
        specialty_dining: 0.62
      },
      mealPeriodWeights: {
        breakfast: 1.08,
        lunch: 1.42,
        afternoon: 0.58,
        dinner: 1.08,
        late_night: 0.82
      },
      eventSensitivity: {
        office_holiday: 1.25,
        road_construction: 1.1
      }
    }),

    district({
      id: "nightlife",
      name: "夜生活区",
      zoneType: "nightlife",
      customerProfileType: "nightlife",
      x: 45,
      y: 77,
      trafficIndex: 86,
      rentMultiplier: 1.18,
      spendingPower: 67,
      competition: 72,
      seasonality: 1.06,
      deliveryDemand: 74,
      parkingConvenience: 42,
      transitAccess: 76,
      customerMix: {
        nightlife: 26,
        social_group: 18,
        young_couple: 12,
        mall_shopper: 12,
        student: 8,
        foodie: 9,
        young_professional: 8,
        delivery_heavy: 7
      },
      venueAffinity: {
        nightlife_store: 1.3,
        street_shop: 1.12,
        rooftop_restaurant: 1.18,
        nightlife_store: 1.05,
        villa_private_kitchen: 0.82,
        breakfast_store: 0.4
      },
      positioningAffinity: {
        quick_service: 0.95,
        family_dining: 0.7,
        student_value: 0.88,
        specialty_dining: 1.32
      },
      mealPeriodWeights: {
        breakfast: 0.25,
        lunch: 0.62,
        afternoon: 0.82,
        dinner: 1.25,
        late_night: 1.5
      },
      eventSensitivity: {
        neighborhood_festival: 1.3,
        severe_weather: 1.22,
        competitor_promotion: 1.18
      }
    }),

    district({
      id: "tourist_scenic",
      name: "旅游景区",
      zoneType: "tourist_scenic",
      customerProfileType: "tourist_scenic",
      x: 74,
      y: 78,
      trafficIndex: 88,
      rentMultiplier: 1.08,
      spendingPower: 76,
      competition: 64,
      seasonality: 1.24,
      deliveryDemand: 28,
      parkingConvenience: 64,
      transitAccess: 68,
      customerMix: {
        tourist: 34,
        foodie: 13,
        mall_shopper: 11,
        weekend_leisure: 12,
        premium_foodie: 8,
        young_couple: 8,
        social_group: 7,
        high_income: 7
      },
      venueAffinity: {
        scenic_store: 1.28,
        courtyard_restaurant: 1.18,
        mountain_resort: 1.12,
        villa_private_kitchen: 0.95,
        street_shop: 0.9,
        industrial_canteen: 0.28
      },
      positioningAffinity: {
        quick_service: 0.82,
        family_dining: 1.02,
        student_value: 0.62,
        specialty_dining: 1.42
      },
      mealPeriodWeights: {
        breakfast: 0.82,
        lunch: 1.18,
        afternoon: 1.15,
        dinner: 1.28,
        late_night: 0.52
      },
      eventSensitivity: {
        severe_weather: 1.45,
        neighborhood_festival: 1.32,
        convention: 1.12
      }
    }),

    district({
      id: "suburban_resort",
      name: "山水郊区/度假区",
      zoneType: "suburban_resort",
      customerProfileType: "suburban_resort",
      x: 52,
      y: 94,
      trafficIndex: 48,
      rentMultiplier: 0.72,
      spendingPower: 79,
      competition: 28,
      seasonality: 1.3,
      deliveryDemand: 18,
      parkingConvenience: 94,
      transitAccess: 28,
      customerMix: {
        high_income: 14,
        resident: 10,
        tourist: 14,
        foodie: 12,
        weekend_leisure: 18,
        family_with_children: 12,
        business_guest: 10,
        premium_foodie: 10
      },
      venueAffinity: {
        mountain_resort: 1.4,
        farmhouse: 1.28,
        villa_private_kitchen: 1.3,
        courtyard_restaurant: 1.22,
        clubhouse_restaurant: 1.12,
        street_shop: 0.55
      },
      positioningAffinity: {
        quick_service: 0.52,
        family_dining: 1.15,
        student_value: 0.42,
        specialty_dining: 1.5
      },
      mealPeriodWeights: {
        breakfast: 0.72,
        lunch: 1.08,
        afternoon: 1.05,
        dinner: 1.32,
        late_night: 0.28
      },
      eventSensitivity: {
        severe_weather: 1.5,
        neighborhood_festival: 1.15
      }
    }),

    district({
      id: "commercial_core",
      name: "综合商业中心",
      zoneType: "commercial_core",
      customerProfileType: "cbd",
      x: 34,
      y: 34,
      trafficIndex: 94,
      rentMultiplier: 1.46,
      spendingPower: 78,
      competition: 90,
      seasonality: 1.03,
      deliveryDemand: 76,
      parkingConvenience: 66,
      transitAccess: 92,
      customerMix: {
        mall_shopper: 18,
        young_professional: 16,
        office_worker: 12,
        premium_foodie: 10,
        young_couple: 10,
        high_income: 8,
        foodie: 10,
        social_group: 8,
        tourist: 8
      },
      venueAffinity: {
        mall_store: 1.32,
        street_shop: 1.08,
        fast_service_store: 1.12,
        rooftop_restaurant: 1.08,
        office_restaurant: 1.05
      },
      positioningAffinity: {
        quick_service: 1.08,
        family_dining: 1.02,
        student_value: 0.75,
        specialty_dining: 1.25
      },
      mealPeriodWeights: {
        breakfast: 0.72,
        lunch: 1.18,
        afternoon: 1.1,
        dinner: 1.35,
        late_night: 0.78
      },
      eventSensitivity: {
        convention: 1.2,
        competitor_promotion: 1.3,
        neighborhood_festival: 1.25
      }
    }),

    district({
      id: "office_park",
      name: "写字楼园区",
      zoneType: "office_park",
      customerProfileType: "cbd",
      x: 61,
      y: 12,
      trafficIndex: 80,
      rentMultiplier: 1.12,
      spendingPower: 73,
      competition: 62,
      seasonality: 0.95,
      deliveryDemand: 94,
      parkingConvenience: 58,
      transitAccess: 86,
      customerMix: {
        office_worker: 36,
        young_professional: 20,
        delivery_heavy: 12,
        takeaway_commuter: 12,
        business_guest: 8,
        health_conscious: 6,
        solo_diner: 6
      },
      venueAffinity: {
        office_restaurant: 1.35,
        cloud_kitchen: 1.22,
        fast_service_store: 1.2,
        street_shop: 1,
        mall_store: 0.85
      },
      positioningAffinity: {
        quick_service: 1.4,
        family_dining: 0.62,
        student_value: 0.82,
        specialty_dining: 0.88
      },
      mealPeriodWeights: {
        breakfast: 1.08,
        lunch: 1.5,
        afternoon: 0.7,
        dinner: 0.72,
        late_night: 0.2
      },
      eventSensitivity: {
        office_holiday: 1.5,
        road_construction: 1.18,
        convention: 1.08
      }
    }),

    district({
      id: "tech_park",
      name: "科技园区",
      zoneType: "tech_park",
      customerProfileType: "cbd",
      x: 88,
      y: 38,
      trafficIndex: 76,
      rentMultiplier: 1.04,
      spendingPower: 76,
      competition: 54,
      seasonality: 0.97,
      deliveryDemand: 96,
      parkingConvenience: 62,
      transitAccess: 78,
      customerMix: {
        young_professional: 26,
        office_worker: 24,
        delivery_heavy: 14,
        health_conscious: 9,
        freelancer: 8,
        takeaway_commuter: 8,
        high_income: 6,
        foodie: 5
      },
      venueAffinity: {
        office_restaurant: 1.25,
        cloud_kitchen: 1.28,
        fast_service_store: 1.2,
        street_shop: 0.95,
        street_shop: 1.08
      },
      positioningAffinity: {
        quick_service: 1.35,
        family_dining: 0.68,
        student_value: 0.86,
        specialty_dining: 0.92
      },
      mealPeriodWeights: {
        breakfast: 0.92,
        lunch: 1.42,
        afternoon: 0.9,
        dinner: 0.88,
        late_night: 0.5
      },
      eventSensitivity: {
        office_holiday: 1.35,
        severe_weather: 0.9
      }
    }),

    district({
      id: "medical_cluster",
      name: "医疗生活区",
      zoneType: "medical_cluster",
      customerProfileType: "residential",
      x: 12,
      y: 44,
      trafficIndex: 74,
      rentMultiplier: 0.92,
      spendingPower: 57,
      competition: 46,
      seasonality: 1,
      deliveryDemand: 68,
      parkingConvenience: 54,
      transitAccess: 72,
      customerMix: {
        resident: 18,
        senior: 18,
        office_worker: 10,
        solo_diner: 10,
        health_conscious: 14,
        budget_family: 10,
        takeaway_commuter: 8,
        local_regular: 12
      },
      venueAffinity: {
        community_store: 1.18,
        street_shop: 1.12,
        fast_service_store: 1.05,
        breakfast_store: 1.1,
        cloud_kitchen: 0.92
      },
      positioningAffinity: {
        quick_service: 1.08,
        family_dining: 1.12,
        student_value: 1,
        specialty_dining: 0.78
      },
      mealPeriodWeights: {
        breakfast: 1.12,
        lunch: 1.18,
        afternoon: 0.82,
        dinner: 1.02,
        late_night: 0.45
      },
      eventSensitivity: {
        severe_weather: 0.88,
        road_construction: 1.2
      }
    }),

    district({
      id: "cultural_creative",
      name: "文创街区",
      zoneType: "cultural_creative",
      customerProfileType: "old_town",
      x: 32,
      y: 66,
      trafficIndex: 72,
      rentMultiplier: 1.02,
      spendingPower: 65,
      competition: 58,
      seasonality: 1.08,
      deliveryDemand: 54,
      parkingConvenience: 36,
      transitAccess: 74,
      customerMix: {
        mall_shopper: 20,
        foodie: 15,
        freelancer: 13,
        young_couple: 12,
        tourist: 12,
        young_professional: 10,
        weekend_leisure: 10,
        local_regular: 8
      },
      venueAffinity: {
        street_shop: 1.18,
        old_brand_shop: 1.12,
        courtyard_restaurant: 1.18,
        rooftop_restaurant: 1.08,
        street_shop: 1.12
      },
      positioningAffinity: {
        quick_service: 0.82,
        family_dining: 0.9,
        student_value: 0.78,
        specialty_dining: 1.42
      },
      mealPeriodWeights: {
        breakfast: 0.58,
        lunch: 0.95,
        afternoon: 1.22,
        dinner: 1.3,
        late_night: 0.92
      },
      eventSensitivity: {
        neighborhood_festival: 1.45,
        convention: 1.15,
        competitor_promotion: 1.18
      }
    }),

    district({
      id: "convention_center",
      name: "会展商务区",
      zoneType: "convention_center",
      customerProfileType: "cbd",
      x: 92,
      y: 61,
      trafficIndex: 82,
      rentMultiplier: 1.26,
      spendingPower: 80,
      competition: 60,
      seasonality: 1.12,
      deliveryDemand: 58,
      parkingConvenience: 74,
      transitAccess: 88,
      customerMix: {
        business_guest: 20,
        tourist: 16,
        office_worker: 15,
        high_income: 11,
        social_group: 12,
        premium_foodie: 8,
        young_professional: 10,
        foodie: 8
      },
      venueAffinity: {
        office_restaurant: 1.12,
        mall_store: 1.12,
        clubhouse_restaurant: 1.08,
        fast_service_store: 1.02,
        courtyard_restaurant: 1
      },
      positioningAffinity: {
        quick_service: 0.95,
        family_dining: 0.92,
        student_value: 0.62,
        specialty_dining: 1.28
      },
      mealPeriodWeights: {
        breakfast: 0.72,
        lunch: 1.28,
        afternoon: 0.92,
        dinner: 1.32,
        late_night: 0.5
      },
      eventSensitivity: {
        convention: 1.7,
        road_construction: 1.12,
        severe_weather: 1.1
      }
    }),

    district({
      id: "sports_entertainment",
      name: "体育娱乐区",
      zoneType: "sports_entertainment",
      customerProfileType: "nightlife",
      x: 66,
      y: 70,
      trafficIndex: 84,
      rentMultiplier: 1.08,
      spendingPower: 62,
      competition: 65,
      seasonality: 1.1,
      deliveryDemand: 52,
      parkingConvenience: 76,
      transitAccess: 76,
      customerMix: {
        social_group: 22,
        young_professional: 12,
        student: 12,
        nightlife: 14,
        mall_shopper: 10,
        young_couple: 10,
        foodie: 10,
        weekend_leisure: 10
      },
      venueAffinity: {
        fast_service_store: 1.2,
        nightlife_store: 1.18,
        street_shop: 1.12,
        mall_store: 1.06,
        nightlife_store: 1.1
      },
      positioningAffinity: {
        quick_service: 1.12,
        family_dining: 0.82,
        student_value: 0.92,
        specialty_dining: 1.18
      },
      mealPeriodWeights: {
        breakfast: 0.3,
        lunch: 0.78,
        afternoon: 0.92,
        dinner: 1.25,
        late_night: 1.25
      },
      eventSensitivity: {
        neighborhood_festival: 1.25,
        severe_weather: 1.3,
        competitor_promotion: 1.15
      }
    }),

    district({
      id: "wholesale_market",
      name: "批发市场区",
      zoneType: "wholesale_market",
      customerProfileType: "industrial_park",
      x: 8,
      y: 88,
      trafficIndex: 76,
      rentMultiplier: 0.58,
      spendingPower: 39,
      competition: 38,
      seasonality: 1.02,
      deliveryDemand: 42,
      parkingConvenience: 82,
      transitAccess: 52,
      customerMix: {
        blue_collar: 24,
        gig_worker: 15,
        takeaway_commuter: 14,
        breakfast_commuter: 13,
        budget_family: 12,
        local_regular: 8,
        resident: 8,
        solo_diner: 6
      },
      venueAffinity: {
        stall: 1.3,
        breakfast_store: 1.22,
        fast_service_store: 1.18,
        street_shop: 1.08,
        industrial_canteen: 1.05
      },
      positioningAffinity: {
        quick_service: 1.36,
        family_dining: 0.65,
        student_value: 1.25,
        specialty_dining: 0.5
      },
      mealPeriodWeights: {
        breakfast: 1.5,
        lunch: 1.28,
        afternoon: 0.52,
        dinner: 0.72,
        late_night: 0.35
      },
      eventSensitivity: {
        road_construction: 1.28,
        severe_weather: 1.12
      }
    }),

    district({
      id: "suburban_community",
      name: "近郊社区",
      zoneType: "suburban_community",
      customerProfileType: "residential",
      x: 28,
      y: 90,
      trafficIndex: 54,
      rentMultiplier: 0.62,
      spendingPower: 52,
      competition: 30,
      seasonality: 1.02,
      deliveryDemand: 70,
      parkingConvenience: 86,
      transitAccess: 42,
      customerMix: {
        resident: 22,
        budget_family: 18,
        family_with_children: 16,
        local_regular: 14,
        senior: 10,
        delivery_heavy: 8,
        solo_diner: 6,
        weekend_leisure: 6
      },
      venueAffinity: {
        community_store: 1.3,
        street_shop: 1.08,
        breakfast_store: 1.12,
        farmhouse: 0.95,
        cloud_kitchen: 0.92
      },
      positioningAffinity: {
        quick_service: 0.98,
        family_dining: 1.35,
        student_value: 1.02,
        specialty_dining: 0.82
      },
      mealPeriodWeights: {
        breakfast: 1.08,
        lunch: 0.86,
        afternoon: 0.72,
        dinner: 1.4,
        late_night: 0.35
      },
      eventSensitivity: {
        neighborhood_festival: 1.3,
        severe_weather: 0.9
      }
    }),

    district({
      id: "waterfront_leisure",
      name: "水岸休闲区",
      zoneType: "waterfront_leisure",
      customerProfileType: "tourist_scenic",
      x: 86,
      y: 92,
      trafficIndex: 68,
      rentMultiplier: 0.98,
      spendingPower: 72,
      competition: 44,
      seasonality: 1.22,
      deliveryDemand: 24,
      parkingConvenience: 78,
      transitAccess: 48,
      customerMix: {
        weekend_leisure: 20,
        young_couple: 16,
        tourist: 14,
        foodie: 12,
        premium_foodie: 10,
        family_with_children: 10,
        social_group: 10,
        high_income: 8
      },
      venueAffinity: {
        courtyard_restaurant: 1.22,
        rooftop_restaurant: 1.18,
        scenic_store: 1.16,
        farmhouse: 1.02,
        villa_private_kitchen: 1.05
      },
      positioningAffinity: {
        quick_service: 0.58,
        family_dining: 1.08,
        student_value: 0.48,
        specialty_dining: 1.48
      },
      mealPeriodWeights: {
        breakfast: 0.58,
        lunch: 1.02,
        afternoon: 1.25,
        dinner: 1.4,
        late_night: 0.62
      },
      eventSensitivity: {
        severe_weather: 1.5,
        neighborhood_festival: 1.3
      }
    })
  ]);
