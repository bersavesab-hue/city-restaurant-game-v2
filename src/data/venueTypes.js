export const VENUE_TYPES = [
  {
    id: "street_shop",
    name: "临街餐馆",
    baseRentMultiplier: 1,
    maintenanceMultiplier: 1,
    parkingImportance: 0.35,
    reservationBias: 0.2,
    deliveryBias: 0.65,
    maxServiceStyle: "full_service",
    targetSegments: {
      resident: 1.1,
      office_worker: 1.05,
      student: 1,
      tourist: 0.95
    }
  },
  {
    id: "mall_store",
    name: "商场餐厅",
    baseRentMultiplier: 1.35,
    maintenanceMultiplier: 1.12,
    parkingImportance: 0.5,
    reservationBias: 0.25,
    deliveryBias: 0.55,
    maxServiceStyle: "full_service",
    targetSegments: {
      office_worker: 1.15,
      resident: 1.05,
      high_income: 1.05,
      tourist: 1.05
    }
  },
  {
    id: "community_store",
    name: "社区店",
    baseRentMultiplier: 0.82,
    maintenanceMultiplier: 0.9,
    parkingImportance: 0.5,
    reservationBias: 0.18,
    deliveryBias: 0.75,
    maxServiceStyle: "full_service",
    targetSegments: {
      resident: 1.25,
      senior: 1.18,
      office_worker: 0.92
    }
  },
  {
    id: "campus_store",
    name: "校园店",
    baseRentMultiplier: 0.78,
    maintenanceMultiplier: 0.88,
    parkingImportance: 0.08,
    reservationBias: 0.05,
    deliveryBias: 0.88,
    maxServiceStyle: "fast_service",
    targetSegments: {
      student: 1.4,
      office_worker: 0.78,
      resident: 0.72
    }
  },
  {
    id: "office_restaurant",
    name: "写字楼餐厅",
    baseRentMultiplier: 1.28,
    maintenanceMultiplier: 1.02,
    parkingImportance: 0.22,
    reservationBias: 0.22,
    deliveryBias: 0.75,
    maxServiceStyle: "business",
    targetSegments: {
      office_worker: 1.35,
      business_guest: 1.18,
      high_income: 1.05
    }
  },
  {
    id: "industrial_canteen",
    name: "工业园餐厅/团餐",
    baseRentMultiplier: 0.66,
    maintenanceMultiplier: 0.95,
    parkingImportance: 0.28,
    reservationBias: 0.02,
    deliveryBias: 0.58,
    maxServiceStyle: "canteen",
    targetSegments: {
      blue_collar: 1.45,
      office_worker: 1.12,
      business_guest: 0.6
    }
  },
  {
    id: "scenic_store",
    name: "景区餐厅",
    baseRentMultiplier: 1.08,
    maintenanceMultiplier: 1.05,
    parkingImportance: 0.42,
    reservationBias: 0.12,
    deliveryBias: 0.25,
    maxServiceStyle: "full_service",
    targetSegments: {
      tourist: 1.45,
      foodie: 1.2,
      resident: 0.72
    }
  },
  {
    id: "farmhouse",
    name: "农家乐",
    baseRentMultiplier: 0.65,
    maintenanceMultiplier: 1.08,
    parkingImportance: 0.85,
    reservationBias: 0.55,
    deliveryBias: 0.18,
    maxServiceStyle: "destination",
    targetSegments: {
      resident: 1.1,
      tourist: 1.22,
      foodie: 1.18,
      senior: 1.05
    }
  },
  {
    id: "mountain_resort",
    name: "山庄",
    baseRentMultiplier: 0.9,
    maintenanceMultiplier: 1.38,
    parkingImportance: 1,
    reservationBias: 0.78,
    deliveryBias: 0.08,
    maxServiceStyle: "destination",
    eventCapacityMultiplier: 1.5,
    weekendDemandMultiplier: 1.35,
    targetSegments: {
      high_income: 1.22,
      business_guest: 1.28,
      tourist: 1.25,
      foodie: 1.18,
      resident: 0.92
    }
  },
  {
    id: "villa_private_kitchen",
    name: "别墅私厨",
    baseRentMultiplier: 1.08,
    maintenanceMultiplier: 1.22,
    parkingImportance: 0.72,
    reservationBias: 1,
    deliveryBias: 0.03,
    maxServiceStyle: "private_dining",
    seatCapMultiplier: 0.52,
    priceToleranceMultiplier: 1.28,
    qualityRequirementMultiplier: 1.22,
    targetSegments: {
      high_income: 1.45,
      business_guest: 1.42,
      foodie: 1.32,
      tourist: 0.82,
      student: 0.22,
      blue_collar: 0.25
    }
  },
  {
    id: "courtyard_restaurant",
    name: "庭院餐厅",
    baseRentMultiplier: 1.02,
    maintenanceMultiplier: 1.18,
    parkingImportance: 0.7,
    reservationBias: 0.65,
    deliveryBias: 0.18,
    maxServiceStyle: "destination",
    targetSegments: {
      high_income: 1.2,
      foodie: 1.25,
      resident: 1.02,
      tourist: 1.08
    }
  },
  {
    id: "rooftop_restaurant",
    name: "屋顶餐厅",
    baseRentMultiplier: 1.2,
    maintenanceMultiplier: 1.15,
    parkingImportance: 0.4,
    reservationBias: 0.62,
    deliveryBias: 0.15,
    maxServiceStyle: "experience",
    targetSegments: {
      nightlife: 1.3,
      high_income: 1.18,
      foodie: 1.2,
      tourist: 1.08
    }
  },
  {
    id: "cloud_kitchen",
    name: "纯外卖厨房",
    baseRentMultiplier: 0.52,
    maintenanceMultiplier: 0.82,
    parkingImportance: 0.05,
    reservationBias: 0,
    deliveryBias: 1.5,
    maxServiceStyle: "delivery_only",
    seatCapMultiplier: 0,
    targetSegments: {
      office_worker: 1.18,
      student: 1.18,
      resident: 1.05,
      nightlife: 1.05
    }
  }
];
