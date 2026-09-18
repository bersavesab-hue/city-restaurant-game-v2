import {
  CUSTOMER_SEGMENT_SCHEMA_VERSION
} from "./customerSegmentRules.js";

export const CUSTOMER_SEGMENT_DATASET_META =
  Object.freeze({
    schemaVersion:
      CUSTOMER_SEGMENT_SCHEMA_VERSION,
    datasetVersion:
      "3.0.0",
    total: 28,
    legacyIdsPreserved: 10,
    channels: 4,
    districtTypes: 10
  });

const ZONES =
  Object.freeze([
    "old_town",
    "cbd",
    "university",
    "premium_residential",
    "residential",
    "transport_hub",
    "industrial_park",
    "nightlife",
    "tourist_scenic",
    "suburban_resort"
  ]);

function affinity(
  overrides = {}
) {
  return Object.freeze(
    Object.fromEntries(
      ZONES.map(
        zone => [
          zone,
          overrides[zone] ??
          0.7
        ]
      )
    )
  );
}

function segment({
  id,
  name,
  ageRange,
  occupationTags,
  spendingPower,
  priceSensitivity,
  qualitySensitivity,
  speedSensitivity,
  averageDiningMinutes,
  queuePatienceMinutes,
  partySize,
  repeatPreference,
  reviewPropensity,
  basePresence,
  channelPreferences,
  districtAffinity,
  categoryPreferences,
  tastePreferences = {},
  hourWeights
}) {
  return Object.freeze({
    schemaVersion:
      CUSTOMER_SEGMENT_SCHEMA_VERSION,
    id,
    name,
    ageRange:
      Object.freeze({
        ...ageRange
      }),
    occupationTags:
      Object.freeze([
        ...occupationTags
      ]),
    spendingPower,
    priceSensitivity,
    qualitySensitivity,
    speedSensitivity,
    averageDiningMinutes,
    queuePatienceMinutes,
    partySize:
      Object.freeze({
        ...partySize
      }),
    repeatPreference,
    reviewPropensity,
    basePresence,
    channelPreferences:
      Object.freeze({
        ...channelPreferences
      }),
    districtAffinity:
      affinity(
        districtAffinity
      ),
    categoryPreferences:
      Object.freeze({
        default: 1,
        ...categoryPreferences
      }),
    tastePreferences:
      Object.freeze({
        ...tastePreferences
      }),
    hourWeights:
      Object.freeze({
        ...hourWeights
      })
  });
}

export const CUSTOMER_SEGMENTS_V3 =
  Object.freeze([
    segment({
      id: "office_worker",
      name: "上班族",
      ageRange: { min: 22, max: 55 },
      occupationTags: ["office", "commuter"],
      spendingPower: 65,
      priceSensitivity: 58,
      qualitySensitivity: 60,
      speedSensitivity: 88,
      averageDiningMinutes: 28,
      queuePatienceMinutes: 8,
      partySize: { min: 1, max: 4, average: 1.8 },
      repeatPreference: 70,
      reviewPropensity: 42,
      basePresence: 5,
      channelPreferences: { dine_in: 1, pickup: 0.9, delivery: 0.8, reservation: 0.25 },
      districtAffinity: { cbd: 1.6, transport_hub: 1.25, industrial_park: 1.1, residential: 0.8 },
      categoryPreferences: { rice: 1.25, noodle: 1.2, fast_food: 1.3, set_meal: 1.2, stir_fry: 0.85, hotpot: 0.55, dessert: 0.55 },
      tastePreferences: { stir_fry: 1.08, braise: 1.05 },
      hourWeights: { 7: 25, 8: 40, 11: 75, 12: 100, 13: 78, 17: 42, 18: 72, 19: 58 }
    }),

    segment({
      id: "resident",
      name: "家庭居民",
      ageRange: { min: 25, max: 65 },
      occupationTags: ["resident", "family"],
      spendingPower: 58,
      priceSensitivity: 65,
      qualitySensitivity: 72,
      speedSensitivity: 38,
      averageDiningMinutes: 52,
      queuePatienceMinutes: 18,
      partySize: { min: 1, max: 6, average: 3.1 },
      repeatPreference: 86,
      reviewPropensity: 38,
      basePresence: 6,
      channelPreferences: { dine_in: 1, pickup: 0.55, delivery: 0.7, reservation: 0.45 },
      districtAffinity: { residential: 1.65, old_town: 1.25, premium_residential: 1.2, suburban_resort: 1.05 },
      categoryPreferences: { rice: 1, noodle: 0.9, stir_fry: 1.35, hotpot: 1.15, soup: 1.2, set_meal: 1.1, fast_food: 0.6 },
      tastePreferences: { braise: 1.12, stew: 1.08 },
      hourWeights: { 7: 30, 8: 25, 11: 35, 12: 58, 13: 42, 17: 48, 18: 82, 19: 100, 20: 75 }
    }),

    segment({
      id: "student",
      name: "学生",
      ageRange: { min: 16, max: 26 },
      occupationTags: ["student", "campus"],
      spendingPower: 30,
      priceSensitivity: 92,
      qualitySensitivity: 45,
      speedSensitivity: 58,
      averageDiningMinutes: 36,
      queuePatienceMinutes: 13,
      partySize: { min: 1, max: 6, average: 2.7 },
      repeatPreference: 78,
      reviewPropensity: 72,
      basePresence: 6,
      channelPreferences: { dine_in: 1, pickup: 0.85, delivery: 1.05, reservation: 0.08 },
      districtAffinity: { university: 1.9, nightlife: 1.15, transport_hub: 0.95, residential: 0.85 },
      categoryPreferences: { rice: 1.25, noodle: 1.3, fast_food: 1.4, snack: 1.3, dessert: 1.15, beverage: 1.1, stir_fry: 0.72 },
      tastePreferences: { fry: 1.12, barbecue: 1.1 },
      hourWeights: { 7: 20, 11: 42, 12: 85, 13: 72, 17: 65, 18: 100, 19: 88, 20: 68, 21: 45 }
    }),

    segment({
      id: "blue_collar",
      name: "产业工人",
      ageRange: { min: 20, max: 58 },
      occupationTags: ["industrial", "shift_worker"],
      spendingPower: 42,
      priceSensitivity: 82,
      qualitySensitivity: 52,
      speedSensitivity: 72,
      averageDiningMinutes: 32,
      queuePatienceMinutes: 10,
      partySize: { min: 1, max: 5, average: 2.3 },
      repeatPreference: 82,
      reviewPropensity: 26,
      basePresence: 5,
      channelPreferences: { dine_in: 1, pickup: 0.8, delivery: 0.55, reservation: 0.05 },
      districtAffinity: { industrial_park: 1.9, transport_hub: 1.1, residential: 0.95 },
      categoryPreferences: { rice: 1.4, noodle: 1.25, fast_food: 1.2, stir_fry: 1.05, set_meal: 1.2, soup: 0.9, dessert: 0.35 },
      tastePreferences: { stir_fry: 1.1, braise: 1.1 },
      hourWeights: { 6: 28, 7: 55, 11: 72, 12: 100, 13: 58, 17: 55, 18: 88, 19: 58 }
    }),

    segment({
      id: "senior",
      name: "中老年居民",
      ageRange: { min: 50, max: 80 },
      occupationTags: ["retired", "resident"],
      spendingPower: 46,
      priceSensitivity: 78,
      qualitySensitivity: 75,
      speedSensitivity: 28,
      averageDiningMinutes: 55,
      queuePatienceMinutes: 22,
      partySize: { min: 1, max: 5, average: 2.2 },
      repeatPreference: 90,
      reviewPropensity: 20,
      basePresence: 4,
      channelPreferences: { dine_in: 1, pickup: 0.25, delivery: 0.25, reservation: 0.35 },
      districtAffinity: { residential: 1.55, old_town: 1.4, suburban_resort: 1.05 },
      categoryPreferences: { rice: 1, noodle: 1, stir_fry: 1.2, soup: 1.35, cold_dish: 0.75, fast_food: 0.42 },
      tastePreferences: { steam: 1.15, stew: 1.12, boil: 1.1 },
      hourWeights: { 6: 35, 7: 68, 8: 52, 10: 25, 11: 62, 12: 82, 13: 48, 17: 50, 18: 72 }
    }),

    segment({
      id: "tourist",
      name: "游客",
      ageRange: { min: 18, max: 70 },
      occupationTags: ["tourist", "visitor"],
      spendingPower: 74,
      priceSensitivity: 38,
      qualitySensitivity: 82,
      speedSensitivity: 30,
      averageDiningMinutes: 58,
      queuePatienceMinutes: 21,
      partySize: { min: 1, max: 8, average: 3.3 },
      repeatPreference: 28,
      reviewPropensity: 76,
      basePresence: 4,
      channelPreferences: { dine_in: 1, pickup: 0.25, delivery: 0.2, reservation: 0.75 },
      districtAffinity: { tourist_scenic: 1.9, transport_hub: 1.45, old_town: 1.25, suburban_resort: 1.35 },
      categoryPreferences: { specialty: 1.4, stir_fry: 1.25, hotpot: 1.35, barbecue: 1.2, dessert: 1.05, fast_food: 0.55 },
      tastePreferences: { barbecue: 1.12, braise: 1.08 },
      hourWeights: { 10: 32, 11: 52, 12: 72, 13: 78, 14: 65, 17: 52, 18: 78, 19: 92, 20: 78 }
    }),

    segment({
      id: "high_income",
      name: "高收入客群",
      ageRange: { min: 28, max: 60 },
      occupationTags: ["executive", "professional", "affluent"],
      spendingPower: 92,
      priceSensitivity: 18,
      qualitySensitivity: 94,
      speedSensitivity: 32,
      averageDiningMinutes: 72,
      queuePatienceMinutes: 18,
      partySize: { min: 1, max: 6, average: 2.5 },
      repeatPreference: 72,
      reviewPropensity: 48,
      basePresence: 3,
      channelPreferences: { dine_in: 1, pickup: 0.18, delivery: 0.4, reservation: 1.25 },
      districtAffinity: { premium_residential: 1.9, cbd: 1.35, suburban_resort: 1.25, tourist_scenic: 1.05 },
      categoryPreferences: { specialty: 1.35, stir_fry: 1.28, hotpot: 1.22, dessert: 1.1, set_meal: 1.15, fast_food: 0.35 },
      tastePreferences: { roast: 1.1, braise: 1.08, grill: 1.08 },
      hourWeights: { 11: 25, 12: 48, 13: 38, 17: 40, 18: 72, 19: 100, 20: 92, 21: 62 }
    }),

    segment({
      id: "business_guest",
      name: "商务宴请",
      ageRange: { min: 28, max: 65 },
      occupationTags: ["business", "executive", "client_entertainment"],
      spendingPower: 96,
      priceSensitivity: 12,
      qualitySensitivity: 96,
      speedSensitivity: 22,
      averageDiningMinutes: 95,
      queuePatienceMinutes: 12,
      partySize: { min: 2, max: 10, average: 5.2 },
      repeatPreference: 58,
      reviewPropensity: 28,
      basePresence: 2.5,
      channelPreferences: { dine_in: 0.8, pickup: 0.05, delivery: 0.08, reservation: 1.7 },
      districtAffinity: { cbd: 1.9, premium_residential: 1.25, suburban_resort: 1.15 },
      categoryPreferences: { specialty: 1.45, stir_fry: 1.35, set_meal: 1.3, hotpot: 1.05, fast_food: 0.2 },
      tastePreferences: { steam: 1.08, braise: 1.12, roast: 1.1 },
      hourWeights: { 11: 22, 12: 45, 13: 35, 17: 35, 18: 72, 19: 100, 20: 90, 21: 55 }
    }),

    segment({
      id: "foodie",
      name: "美食爱好者",
      ageRange: { min: 20, max: 55 },
      occupationTags: ["foodie", "enthusiast"],
      spendingPower: 78,
      priceSensitivity: 32,
      qualitySensitivity: 100,
      speedSensitivity: 24,
      averageDiningMinutes: 68,
      queuePatienceMinutes: 25,
      partySize: { min: 1, max: 6, average: 2.4 },
      repeatPreference: 64,
      reviewPropensity: 92,
      basePresence: 3,
      channelPreferences: { dine_in: 1, pickup: 0.18, delivery: 0.3, reservation: 0.8 },
      districtAffinity: { old_town: 1.3, cbd: 1.1, nightlife: 1.25, tourist_scenic: 1.4, suburban_resort: 1.25 },
      categoryPreferences: { specialty: 1.5, stir_fry: 1.35, hotpot: 1.25, barbecue: 1.2, dessert: 1.12, fast_food: 0.48 },
      tastePreferences: { braise: 1.1, grill: 1.1, roast: 1.08 },
      hourWeights: { 10: 18, 11: 40, 12: 68, 13: 58, 17: 42, 18: 78, 19: 100, 20: 88, 21: 55 }
    }),

    segment({
      id: "nightlife",
      name: "夜生活客群",
      ageRange: { min: 20, max: 42 },
      occupationTags: ["nightlife", "social"],
      spendingPower: 62,
      priceSensitivity: 48,
      qualitySensitivity: 62,
      speedSensitivity: 35,
      averageDiningMinutes: 70,
      queuePatienceMinutes: 22,
      partySize: { min: 1, max: 8, average: 3.5 },
      repeatPreference: 55,
      reviewPropensity: 68,
      basePresence: 3.5,
      channelPreferences: { dine_in: 1, pickup: 0.35, delivery: 0.65, reservation: 0.55 },
      districtAffinity: { nightlife: 2, university: 1.05, cbd: 0.9 },
      categoryPreferences: { barbecue: 1.4, hotpot: 1.35, noodle: 1, fast_food: 0.9, stir_fry: 1.15, beverage: 1.2 },
      tastePreferences: { grill: 1.15, fry: 1.08 },
      hourWeights: { 18: 32, 19: 52, 20: 72, 21: 92, 22: 100, 23: 82 }
    }),

    segment({
      id: "young_professional",
      name: "年轻白领",
      ageRange: { min: 22, max: 35 },
      occupationTags: ["office", "young_professional"],
      spendingPower: 72,
      priceSensitivity: 48,
      qualitySensitivity: 72,
      speedSensitivity: 82,
      averageDiningMinutes: 34,
      queuePatienceMinutes: 10,
      partySize: { min: 1, max: 4, average: 1.9 },
      repeatPreference: 68,
      reviewPropensity: 70,
      basePresence: 3.5,
      channelPreferences: { dine_in: 0.9, pickup: 1, delivery: 1.05, reservation: 0.35 },
      districtAffinity: { cbd: 1.6, nightlife: 1.15, premium_residential: 1.05 },
      categoryPreferences: { rice: 1.15, fast_food: 1.18, set_meal: 1.15, dessert: 1.1, beverage: 1.12, specialty: 1.05 },
      tastePreferences: { stir_fry: 1.08, bake: 1.04 },
      hourWeights: { 8: 35, 11: 58, 12: 100, 13: 72, 17: 45, 18: 78, 19: 70, 20: 45 }
    }),

    segment({
      id: "freelancer",
      name: "自由职业者",
      ageRange: { min: 20, max: 45 },
      occupationTags: ["freelance", "remote_work"],
      spendingPower: 60,
      priceSensitivity: 55,
      qualitySensitivity: 70,
      speedSensitivity: 42,
      averageDiningMinutes: 62,
      queuePatienceMinutes: 20,
      partySize: { min: 1, max: 3, average: 1.4 },
      repeatPreference: 76,
      reviewPropensity: 74,
      basePresence: 2.5,
      channelPreferences: { dine_in: 1, pickup: 0.55, delivery: 0.8, reservation: 0.18 },
      districtAffinity: { residential: 1.2, old_town: 1.15, university: 1.05, nightlife: 1.05 },
      categoryPreferences: { beverage: 1.3, dessert: 1.2, bakery: 1.2, noodle: 1.05, rice: 1.05 },
      tastePreferences: { bake: 1.1, cold_mix: 1.05 },
      hourWeights: { 9: 40, 10: 62, 11: 65, 12: 72, 13: 78, 14: 68, 15: 58, 18: 55, 19: 50 }
    }),

    segment({
      id: "gig_worker",
      name: "灵活就业客群",
      ageRange: { min: 20, max: 48 },
      occupationTags: ["gig", "mobile_worker"],
      spendingPower: 44,
      priceSensitivity: 82,
      qualitySensitivity: 48,
      speedSensitivity: 84,
      averageDiningMinutes: 24,
      queuePatienceMinutes: 7,
      partySize: { min: 1, max: 2, average: 1.2 },
      repeatPreference: 62,
      reviewPropensity: 46,
      basePresence: 2.8,
      channelPreferences: { dine_in: 0.7, pickup: 1.25, delivery: 0.45, reservation: 0.03 },
      districtAffinity: { transport_hub: 1.45, cbd: 1.1, industrial_park: 1.2, nightlife: 1.05 },
      categoryPreferences: { fast_food: 1.4, rice: 1.25, noodle: 1.25, snack: 1.18, set_meal: 1.1 },
      tastePreferences: { fry: 1.06, stir_fry: 1.05 },
      hourWeights: { 7: 35, 8: 50, 11: 70, 12: 90, 13: 72, 16: 45, 18: 82, 19: 62, 22: 38 }
    }),

    segment({
      id: "family_with_children",
      name: "亲子家庭",
      ageRange: { min: 26, max: 48 },
      occupationTags: ["parent", "family"],
      spendingPower: 68,
      priceSensitivity: 58,
      qualitySensitivity: 82,
      speedSensitivity: 36,
      averageDiningMinutes: 66,
      queuePatienceMinutes: 16,
      partySize: { min: 2, max: 7, average: 4.1 },
      repeatPreference: 88,
      reviewPropensity: 58,
      basePresence: 3.5,
      channelPreferences: { dine_in: 1, pickup: 0.45, delivery: 0.65, reservation: 0.75 },
      districtAffinity: { residential: 1.55, premium_residential: 1.35, suburban_resort: 1.25, tourist_scenic: 1.05 },
      categoryPreferences: { stir_fry: 1.18, soup: 1.22, set_meal: 1.25, dessert: 1.2, hotpot: 1.05, fast_food: 0.72 },
      tastePreferences: { steam: 1.1, stew: 1.08 },
      hourWeights: { 11: 42, 12: 68, 13: 52, 17: 55, 18: 88, 19: 100, 20: 72 }
    }),

    segment({
      id: "young_couple",
      name: "年轻情侣",
      ageRange: { min: 20, max: 36 },
      occupationTags: ["couple", "young_adult"],
      spendingPower: 70,
      priceSensitivity: 45,
      qualitySensitivity: 78,
      speedSensitivity: 28,
      averageDiningMinutes: 78,
      queuePatienceMinutes: 20,
      partySize: { min: 2, max: 2, average: 2 },
      repeatPreference: 64,
      reviewPropensity: 78,
      basePresence: 2.8,
      channelPreferences: { dine_in: 1, pickup: 0.18, delivery: 0.45, reservation: 0.9 },
      districtAffinity: { nightlife: 1.45, cbd: 1.1, tourist_scenic: 1.2, old_town: 1.05 },
      categoryPreferences: { specialty: 1.25, dessert: 1.3, beverage: 1.18, barbecue: 1.12, hotpot: 1.08 },
      tastePreferences: { grill: 1.08, bake: 1.08 },
      hourWeights: { 12: 35, 13: 30, 17: 42, 18: 72, 19: 100, 20: 95, 21: 62 }
    }),

    segment({
      id: "budget_family",
      name: "实惠家庭",
      ageRange: { min: 28, max: 58 },
      occupationTags: ["family", "budget_conscious"],
      spendingPower: 44,
      priceSensitivity: 88,
      qualitySensitivity: 62,
      speedSensitivity: 42,
      averageDiningMinutes: 50,
      queuePatienceMinutes: 17,
      partySize: { min: 2, max: 6, average: 3.6 },
      repeatPreference: 92,
      reviewPropensity: 34,
      basePresence: 3.8,
      channelPreferences: { dine_in: 1, pickup: 0.7, delivery: 0.75, reservation: 0.25 },
      districtAffinity: { residential: 1.65, industrial_park: 1.05, old_town: 1.05 },
      categoryPreferences: { rice: 1.18, noodle: 1.08, stir_fry: 1.22, set_meal: 1.3, soup: 1.05, specialty: 0.62 },
      tastePreferences: { braise: 1.08, stew: 1.05 },
      hourWeights: { 7: 25, 11: 48, 12: 72, 17: 58, 18: 90, 19: 100, 20: 70 }
    }),

    segment({
      id: "health_conscious",
      name: "健康轻食客群",
      ageRange: { min: 20, max: 50 },
      occupationTags: ["fitness", "health_conscious"],
      spendingPower: 70,
      priceSensitivity: 38,
      qualitySensitivity: 88,
      speedSensitivity: 48,
      averageDiningMinutes: 42,
      queuePatienceMinutes: 14,
      partySize: { min: 1, max: 4, average: 1.7 },
      repeatPreference: 74,
      reviewPropensity: 68,
      basePresence: 2.2,
      channelPreferences: { dine_in: 0.85, pickup: 1, delivery: 0.9, reservation: 0.2 },
      districtAffinity: { cbd: 1.25, premium_residential: 1.35, university: 1.05 },
      categoryPreferences: { cold_dish: 1.35, soup: 1.3, rice: 0.95, beverage: 1.15, fast_food: 0.55, barbecue: 0.65 },
      tastePreferences: { cold_mix: 1.18, steam: 1.15, boil: 1.1 },
      hourWeights: { 7: 42, 8: 58, 11: 52, 12: 85, 13: 65, 17: 45, 18: 72, 19: 52 }
    }),

    segment({
      id: "breakfast_commuter",
      name: "通勤早餐客",
      ageRange: { min: 18, max: 58 },
      occupationTags: ["commuter", "morning"],
      spendingPower: 46,
      priceSensitivity: 74,
      qualitySensitivity: 52,
      speedSensitivity: 96,
      averageDiningMinutes: 16,
      queuePatienceMinutes: 5,
      partySize: { min: 1, max: 2, average: 1.1 },
      repeatPreference: 94,
      reviewPropensity: 22,
      basePresence: 3.2,
      channelPreferences: { dine_in: 0.55, pickup: 1.45, delivery: 0.35, reservation: 0 },
      districtAffinity: { transport_hub: 1.7, cbd: 1.35, residential: 1.1, industrial_park: 1.1 },
      categoryPreferences: { breakfast: 1.7, dumpling_bun: 1.35, beverage: 1.3, bakery: 1.15, noodle: 1.05, hotpot: 0.15 },
      tastePreferences: { steam: 1.08, pan_fry: 1.05 },
      hourWeights: { 5: 30, 6: 72, 7: 100, 8: 90, 9: 48, 10: 18 }
    }),

    segment({
      id: "late_shift_worker",
      name: "夜班职工",
      ageRange: { min: 20, max: 55 },
      occupationTags: ["shift_worker", "night_worker"],
      spendingPower: 48,
      priceSensitivity: 76,
      qualitySensitivity: 52,
      speedSensitivity: 74,
      averageDiningMinutes: 30,
      queuePatienceMinutes: 9,
      partySize: { min: 1, max: 4, average: 1.8 },
      repeatPreference: 84,
      reviewPropensity: 28,
      basePresence: 2.4,
      channelPreferences: { dine_in: 0.85, pickup: 1, delivery: 0.8, reservation: 0.02 },
      districtAffinity: { industrial_park: 1.55, nightlife: 1.4, transport_hub: 1.2 },
      categoryPreferences: { noodle: 1.35, rice: 1.3, fast_food: 1.2, barbecue: 1.12, soup: 1.05 },
      tastePreferences: { stir_fry: 1.08, grill: 1.08 },
      hourWeights: { 0: 72, 1: 52, 5: 42, 6: 60, 18: 42, 21: 65, 22: 90, 23: 100 }
    }),

    segment({
      id: "takeaway_commuter",
      name: "自取通勤客",
      ageRange: { min: 18, max: 55 },
      occupationTags: ["commuter", "takeaway"],
      spendingPower: 55,
      priceSensitivity: 68,
      qualitySensitivity: 54,
      speedSensitivity: 94,
      averageDiningMinutes: 14,
      queuePatienceMinutes: 5,
      partySize: { min: 1, max: 2, average: 1.1 },
      repeatPreference: 80,
      reviewPropensity: 36,
      basePresence: 2.5,
      channelPreferences: { dine_in: 0.35, pickup: 1.7, delivery: 0.5, reservation: 0 },
      districtAffinity: { transport_hub: 1.65, cbd: 1.35, university: 1.05 },
      categoryPreferences: { fast_food: 1.45, rice: 1.3, noodle: 1.25, set_meal: 1.25, snack: 1.15 },
      tastePreferences: { stir_fry: 1.05, fry: 1.04 },
      hourWeights: { 7: 45, 8: 65, 11: 75, 12: 100, 13: 62, 17: 52, 18: 82, 19: 55 }
    }),

    segment({
      id: "delivery_heavy",
      name: "外卖重度客",
      ageRange: { min: 18, max: 45 },
      occupationTags: ["delivery_user", "home_or_office"],
      spendingPower: 58,
      priceSensitivity: 64,
      qualitySensitivity: 60,
      speedSensitivity: 82,
      averageDiningMinutes: 30,
      queuePatienceMinutes: 4,
      partySize: { min: 1, max: 4, average: 1.6 },
      repeatPreference: 82,
      reviewPropensity: 74,
      basePresence: 2.8,
      channelPreferences: { dine_in: 0.15, pickup: 0.45, delivery: 1.8, reservation: 0 },
      districtAffinity: { cbd: 1.25, university: 1.2, residential: 1.35, premium_residential: 1.1 },
      categoryPreferences: { rice: 1.25, noodle: 1.18, fast_food: 1.35, set_meal: 1.3, stir_fry: 1.05 },
      tastePreferences: { stir_fry: 1.05, braise: 1.04 },
      hourWeights: { 11: 55, 12: 100, 13: 65, 17: 48, 18: 88, 19: 92, 20: 68, 21: 42 }
    }),

    segment({
      id: "mall_shopper",
      name: "商场休闲客",
      ageRange: { min: 18, max: 55 },
      occupationTags: ["shopper", "leisure"],
      spendingPower: 66,
      priceSensitivity: 48,
      qualitySensitivity: 70,
      speedSensitivity: 34,
      averageDiningMinutes: 58,
      queuePatienceMinutes: 20,
      partySize: { min: 1, max: 6, average: 2.8 },
      repeatPreference: 50,
      reviewPropensity: 62,
      basePresence: 2.5,
      channelPreferences: { dine_in: 1, pickup: 0.25, delivery: 0.2, reservation: 0.55 },
      districtAffinity: { cbd: 1.2, premium_residential: 1.2, nightlife: 1.15, tourist_scenic: 1.1 },
      categoryPreferences: { specialty: 1.15, dessert: 1.25, beverage: 1.2, hotpot: 1.1, barbecue: 1.08, fast_food: 0.8 },
      tastePreferences: { grill: 1.05, bake: 1.08 },
      hourWeights: { 10: 25, 11: 42, 12: 65, 13: 72, 14: 58, 17: 48, 18: 78, 19: 88, 20: 72 }
    }),

    segment({
      id: "parent_child",
      name: "亲子休闲客",
      ageRange: { min: 25, max: 48 },
      occupationTags: ["parent", "child_activity"],
      spendingPower: 64,
      priceSensitivity: 52,
      qualitySensitivity: 84,
      speedSensitivity: 34,
      averageDiningMinutes: 72,
      queuePatienceMinutes: 15,
      partySize: { min: 2, max: 6, average: 3.8 },
      repeatPreference: 80,
      reviewPropensity: 64,
      basePresence: 2.2,
      channelPreferences: { dine_in: 1, pickup: 0.2, delivery: 0.4, reservation: 0.7 },
      districtAffinity: { premium_residential: 1.45, residential: 1.4, tourist_scenic: 1.2, suburban_resort: 1.25 },
      categoryPreferences: { dessert: 1.35, set_meal: 1.25, soup: 1.15, stir_fry: 1.1, beverage: 1.15, barbecue: 0.8 },
      tastePreferences: { steam: 1.08, bake: 1.08 },
      hourWeights: { 10: 28, 11: 52, 12: 75, 13: 62, 16: 30, 17: 52, 18: 82, 19: 90, 20: 65 }
    }),

    segment({
      id: "social_group",
      name: "朋友聚餐客",
      ageRange: { min: 18, max: 45 },
      occupationTags: ["social", "group_dining"],
      spendingPower: 66,
      priceSensitivity: 46,
      qualitySensitivity: 68,
      speedSensitivity: 26,
      averageDiningMinutes: 88,
      queuePatienceMinutes: 24,
      partySize: { min: 3, max: 10, average: 5.1 },
      repeatPreference: 56,
      reviewPropensity: 72,
      basePresence: 2.8,
      channelPreferences: { dine_in: 1, pickup: 0.08, delivery: 0.25, reservation: 1.05 },
      districtAffinity: { nightlife: 1.65, university: 1.2, cbd: 1.05, tourist_scenic: 1.15 },
      categoryPreferences: { hotpot: 1.45, barbecue: 1.42, stir_fry: 1.15, cold_dish: 1.12, beverage: 1.15 },
      tastePreferences: { grill: 1.15, hotpot: 1.15 },
      hourWeights: { 17: 38, 18: 65, 19: 88, 20: 100, 21: 82, 22: 52 }
    }),

    segment({
      id: "solo_diner",
      name: "独食客",
      ageRange: { min: 18, max: 60 },
      occupationTags: ["solo", "convenience"],
      spendingPower: 52,
      priceSensitivity: 64,
      qualitySensitivity: 58,
      speedSensitivity: 72,
      averageDiningMinutes: 26,
      queuePatienceMinutes: 8,
      partySize: { min: 1, max: 1, average: 1 },
      repeatPreference: 84,
      reviewPropensity: 42,
      basePresence: 3,
      channelPreferences: { dine_in: 0.9, pickup: 1.05, delivery: 0.95, reservation: 0.02 },
      districtAffinity: { cbd: 1.15, university: 1.15, residential: 1.15, transport_hub: 1.1 },
      categoryPreferences: { rice: 1.3, noodle: 1.35, fast_food: 1.25, set_meal: 1.2, hotpot: 0.55 },
      tastePreferences: { stir_fry: 1.04, boil: 1.04 },
      hourWeights: { 7: 25, 11: 62, 12: 88, 13: 72, 17: 55, 18: 90, 19: 82, 20: 52 }
    }),

    segment({
      id: "local_regular",
      name: "街坊熟客",
      ageRange: { min: 25, max: 70 },
      occupationTags: ["local", "regular"],
      spendingPower: 54,
      priceSensitivity: 72,
      qualitySensitivity: 70,
      speedSensitivity: 42,
      averageDiningMinutes: 44,
      queuePatienceMinutes: 18,
      partySize: { min: 1, max: 5, average: 2.3 },
      repeatPreference: 98,
      reviewPropensity: 24,
      basePresence: 3.8,
      channelPreferences: { dine_in: 1, pickup: 0.65, delivery: 0.55, reservation: 0.18 },
      districtAffinity: { old_town: 1.55, residential: 1.6, industrial_park: 1.05 },
      categoryPreferences: { stir_fry: 1.25, rice: 1.12, noodle: 1.08, soup: 1.12, cold_dish: 1.05 },
      tastePreferences: { braise: 1.08, stir_fry: 1.08 },
      hourWeights: { 6: 22, 7: 42, 11: 58, 12: 78, 17: 55, 18: 88, 19: 100, 20: 68 }
    }),

    segment({
      id: "premium_foodie",
      name: "高端美食客",
      ageRange: { min: 25, max: 60 },
      occupationTags: ["foodie", "affluent"],
      spendingPower: 94,
      priceSensitivity: 12,
      qualitySensitivity: 100,
      speedSensitivity: 18,
      averageDiningMinutes: 92,
      queuePatienceMinutes: 24,
      partySize: { min: 1, max: 6, average: 2.6 },
      repeatPreference: 68,
      reviewPropensity: 88,
      basePresence: 1.8,
      channelPreferences: { dine_in: 0.9, pickup: 0.05, delivery: 0.12, reservation: 1.5 },
      districtAffinity: { premium_residential: 1.7, cbd: 1.3, tourist_scenic: 1.35, suburban_resort: 1.4 },
      categoryPreferences: { specialty: 1.65, stir_fry: 1.3, hotpot: 1.18, dessert: 1.2, set_meal: 1.25, fast_food: 0.2 },
      tastePreferences: { roast: 1.15, braise: 1.12, steam: 1.08 },
      hourWeights: { 11: 22, 12: 42, 13: 35, 17: 32, 18: 68, 19: 100, 20: 95, 21: 70 }
    }),

    segment({
      id: "weekend_leisure",
      name: "周末休闲客",
      ageRange: { min: 18, max: 60 },
      occupationTags: ["leisure", "weekend"],
      spendingPower: 62,
      priceSensitivity: 50,
      qualitySensitivity: 68,
      speedSensitivity: 28,
      averageDiningMinutes: 76,
      queuePatienceMinutes: 24,
      partySize: { min: 2, max: 8, average: 3.7 },
      repeatPreference: 46,
      reviewPropensity: 60,
      basePresence: 2.4,
      channelPreferences: { dine_in: 1, pickup: 0.2, delivery: 0.3, reservation: 0.8 },
      districtAffinity: { tourist_scenic: 1.35, suburban_resort: 1.55, old_town: 1.2, nightlife: 1.15 },
      categoryPreferences: { hotpot: 1.25, barbecue: 1.22, specialty: 1.25, dessert: 1.15, stir_fry: 1.05 },
      tastePreferences: { grill: 1.1, roast: 1.08 },
      hourWeights: { 10: 25, 11: 42, 12: 65, 13: 62, 16: 30, 17: 50, 18: 75, 19: 90, 20: 82, 21: 52 }
    }),

  ]);
