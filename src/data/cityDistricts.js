export const CITY_DISTRICTS = [
  {
    id: "old_town",
    name: "老城商业区",
    zoneType: "old_town",
    mapPosition: { x: 18, y: 26 },
    trafficIndex: 78,
    rentMultiplier: 0.96,
    spendingPower: 58,
    competition: 68,
    seasonality: 1.02,
    customerMix: {
      resident: 30,
      senior: 18,
      tourist: 22,
      office_worker: 12,
      foodie: 10,
      student: 8
    },
    venueAffinity: {
      street_shop: 1.18,
      old_brand_shop: 1.22,
      courtyard_restaurant: 1.08,
      mall_store: 0.82,
      villa_private_kitchen: 0.6
    }
  },
  {
    id: "cbd",
    name: "CBD商务区",
    zoneType: "cbd",
    mapPosition: { x: 48, y: 18 },
    trafficIndex: 90,
    rentMultiplier: 1.55,
    spendingPower: 86,
    competition: 84,
    seasonality: 0.98,
    customerMix: {
      office_worker: 44,
      business_guest: 22,
      high_income: 13,
      foodie: 8,
      resident: 7,
      tourist: 6
    },
    venueAffinity: {
      office_restaurant: 1.22,
      mall_store: 1.15,
      street_shop: 0.94,
      villa_private_kitchen: 0.82,
      cloud_kitchen: 0.96
    }
  },
  {
    id: "university",
    name: "大学城",
    zoneType: "university",
    mapPosition: { x: 78, y: 23 },
    trafficIndex: 82,
    rentMultiplier: 0.82,
    spendingPower: 43,
    competition: 59,
    seasonality: 0.9,
    customerMix: {
      student: 64,
      office_worker: 10,
      resident: 10,
      nightlife: 8,
      foodie: 5,
      tourist: 3
    },
    venueAffinity: {
      campus_store: 1.25,
      street_shop: 1.15,
      stall: 1.12,
      cloud_kitchen: 1.08,
      villa_private_kitchen: 0.38
    }
  },
  {
    id: "premium_residential",
    name: "高端住宅区",
    zoneType: "premium_residential",
    mapPosition: { x: 22, y: 52 },
    trafficIndex: 62,
    rentMultiplier: 1.28,
    spendingPower: 91,
    competition: 48,
    seasonality: 1.04,
    customerMix: {
      high_income: 36,
      resident: 26,
      business_guest: 12,
      foodie: 12,
      senior: 6,
      office_worker: 8
    },
    venueAffinity: {
      villa_private_kitchen: 1.35,
      courtyard_restaurant: 1.2,
      clubhouse_restaurant: 1.18,
      street_shop: 0.86,
      cloud_kitchen: 0.72
    }
  },
  {
    id: "residential",
    name: "普通居民区",
    zoneType: "residential",
    mapPosition: { x: 47, y: 48 },
    trafficIndex: 66,
    rentMultiplier: 0.76,
    spendingPower: 56,
    competition: 42,
    seasonality: 1,
    customerMix: {
      resident: 42,
      senior: 20,
      office_worker: 14,
      student: 10,
      blue_collar: 8,
      foodie: 6
    },
    venueAffinity: {
      community_store: 1.25,
      street_shop: 1.12,
      breakfast_store: 1.08,
      villa_private_kitchen: 0.72,
      mall_store: 0.82
    }
  },
  {
    id: "transport_hub",
    name: "交通枢纽区",
    zoneType: "transport_hub",
    mapPosition: { x: 76, y: 50 },
    trafficIndex: 98,
    rentMultiplier: 1.34,
    spendingPower: 63,
    competition: 88,
    seasonality: 1.08,
    customerMix: {
      tourist: 28,
      office_worker: 22,
      blue_collar: 15,
      resident: 10,
      student: 10,
      business_guest: 8,
      foodie: 7
    },
    venueAffinity: {
      hub_store: 1.25,
      fast_service_store: 1.18,
      street_shop: 0.95,
      villa_private_kitchen: 0.3,
      mountain_resort: 0.22
    }
  },
  {
    id: "industrial_park",
    name: "工业园区",
    zoneType: "industrial_park",
    mapPosition: { x: 18, y: 76 },
    trafficIndex: 70,
    rentMultiplier: 0.64,
    spendingPower: 45,
    competition: 34,
    seasonality: 0.98,
    customerMix: {
      blue_collar: 52,
      office_worker: 20,
      resident: 10,
      student: 5,
      senior: 5,
      business_guest: 8
    },
    venueAffinity: {
      industrial_canteen: 1.3,
      street_shop: 1.05,
      cloud_kitchen: 1.1,
      villa_private_kitchen: 0.28,
      mountain_resort: 0.2
    }
  },
  {
    id: "nightlife",
    name: "夜生活区",
    zoneType: "nightlife",
    mapPosition: { x: 45, y: 77 },
    trafficIndex: 86,
    rentMultiplier: 1.18,
    spendingPower: 67,
    competition: 72,
    seasonality: 1.06,
    customerMix: {
      nightlife: 42,
      student: 18,
      office_worker: 14,
      foodie: 12,
      tourist: 8,
      high_income: 6
    },
    venueAffinity: {
      nightlife_store: 1.3,
      street_shop: 1.12,
      rooftop_restaurant: 1.18,
      villa_private_kitchen: 0.82,
      breakfast_store: 0.4
    }
  },
  {
    id: "tourist_scenic",
    name: "旅游景区",
    zoneType: "tourist_scenic",
    mapPosition: { x: 74, y: 78 },
    trafficIndex: 88,
    rentMultiplier: 1.08,
    spendingPower: 76,
    competition: 64,
    seasonality: 1.24,
    customerMix: {
      tourist: 54,
      foodie: 16,
      resident: 8,
      high_income: 8,
      business_guest: 6,
      student: 8
    },
    venueAffinity: {
      scenic_store: 1.28,
      courtyard_restaurant: 1.18,
      mountain_resort: 1.12,
      villa_private_kitchen: 0.95,
      industrial_canteen: 0.28
    }
  },
  {
    id: "suburban_resort",
    name: "山水郊区/度假区",
    zoneType: "suburban_resort",
    mapPosition: { x: 52, y: 94 },
    trafficIndex: 48,
    rentMultiplier: 0.72,
    spendingPower: 79,
    competition: 28,
    seasonality: 1.3,
    customerMix: {
      high_income: 20,
      resident: 18,
      tourist: 24,
      foodie: 18,
      business_guest: 12,
      senior: 8
    },
    venueAffinity: {
      mountain_resort: 1.4,
      farmhouse: 1.28,
      villa_private_kitchen: 1.3,
      courtyard_restaurant: 1.22,
      street_shop: 0.55,
      mall_store: 0.4
    }
  }
];
