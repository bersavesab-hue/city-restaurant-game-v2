export const ADDITIONAL_VENUE_TYPES = [
  {
    id: "hub_store",
    name: "交通枢纽店",
    baseRentMultiplier: 1.22,
    maintenanceMultiplier: 1.05,
    parkingImportance: 0.1,
    reservationBias: 0.02,
    deliveryBias: 0.38,
    maxServiceStyle: "fast_service",
    targetSegments: {
      tourist: 1.25,
      office_worker: 1.1,
      blue_collar: 1.05,
      student: 1.02
    }
  },
  {
    id: "fast_service_store",
    name: "高周转快餐店",
    baseRentMultiplier: 1.05,
    maintenanceMultiplier: 0.98,
    parkingImportance: 0.12,
    reservationBias: 0.01,
    deliveryBias: 0.78,
    maxServiceStyle: "fast_service",
    targetSegments: {
      office_worker: 1.18,
      student: 1.15,
      blue_collar: 1.16,
      tourist: 1.05
    }
  },
  {
    id: "nightlife_store",
    name: "夜生活餐饮店",
    baseRentMultiplier: 1.12,
    maintenanceMultiplier: 1.08,
    parkingImportance: 0.24,
    reservationBias: 0.22,
    deliveryBias: 0.5,
    maxServiceStyle: "night_service",
    targetSegments: {
      nightlife: 1.4,
      student: 1.15,
      foodie: 1.1,
      office_worker: 0.95
    }
  },
  {
    id: "breakfast_store",
    name: "早餐店",
    baseRentMultiplier: 0.72,
    maintenanceMultiplier: 0.9,
    parkingImportance: 0.08,
    reservationBias: 0,
    deliveryBias: 0.65,
    maxServiceStyle: "fast_service",
    targetSegments: {
      senior: 1.28,
      office_worker: 1.22,
      resident: 1.18,
      student: 1.05
    }
  },
  {
    id: "old_brand_shop",
    name: "老字号门店",
    baseRentMultiplier: 1,
    maintenanceMultiplier: 1.08,
    parkingImportance: 0.22,
    reservationBias: 0.2,
    deliveryBias: 0.42,
    maxServiceStyle: "full_service",
    targetSegments: {
      resident: 1.22,
      senior: 1.22,
      tourist: 1.18,
      foodie: 1.12
    }
  },
  {
    id: "clubhouse_restaurant",
    name: "会所餐厅",
    baseRentMultiplier: 1.26,
    maintenanceMultiplier: 1.28,
    parkingImportance: 0.75,
    reservationBias: 0.92,
    deliveryBias: 0.02,
    maxServiceStyle: "private_dining",
    priceToleranceMultiplier: 1.22,
    targetSegments: {
      high_income: 1.38,
      business_guest: 1.4,
      foodie: 1.18
    }
  },
  {
    id: "stall",
    name: "餐饮档口",
    baseRentMultiplier: 0.48,
    maintenanceMultiplier: 0.72,
    parkingImportance: 0,
    reservationBias: 0,
    deliveryBias: 0.9,
    maxServiceStyle: "fast_service",
    seatCapMultiplier: 0.35,
    targetSegments: {
      student: 1.25,
      office_worker: 1.18,
      blue_collar: 1.12
    }
  }
];
