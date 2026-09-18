import {
  PROPERTY_TEMPLATE_SCHEMA_VERSION
} from "./propertyTemplateRules.js";

export const PROPERTY_TEMPLATE_DATASET_META =
  Object.freeze({
    schemaVersion:
      PROPERTY_TEMPLATE_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total: 22
  });

function leaseProfile({
  months,
  propertyFee,
  transferProbability,
  transferMultiple,
  rentFree,
  discount,
  renewal
}) {
  return Object.freeze({
    monthsRange:
      Object.freeze({
        min: months[0],
        max: months[1]
      }),
    propertyFeePerSqmRange:
      Object.freeze({
        min: propertyFee[0],
        max: propertyFee[1]
      }),
    transferFeeProbability:
      transferProbability,
    transferFeeRentMultipleRange:
      Object.freeze({
        min: transferMultiple[0],
        max: transferMultiple[1]
      }),
    rentFreeDaysRange:
      Object.freeze({
        min: rentFree[0],
        max: rentFree[1]
      }),
    maxDiscountRateRange:
      Object.freeze({
        min: discount[0],
        max: discount[1]
      }),
    renewalIncreaseRateRange:
      Object.freeze({
        min: renewal[0],
        max: renewal[1]
      })
  });
}

function kitchenProfile({
  water,
  gas,
  power,
  exhaust
}) {
  return Object.freeze({
    waterDrainQuality: water,
    gasAvailability: gas,
    powerCapacity: power,
    exhaustPotential: exhaust
  });
}

function template({
  id,
  name,
  baseWeight,
  area,
  usable,
  floors,
  shapes,
  frontage,
  ceiling,
  parking,
  parkingDistrictInfluence,
  entrances,
  naturalLight,
  columns,
  foodServiceProbability,
  exhaustProbability,
  rentRateMultiplier,
  deposit,
  listingLife,
  lease,
  kitchen,
  districtWeights
}) {
  return Object.freeze({
    schemaVersion:
      PROPERTY_TEMPLATE_SCHEMA_VERSION,
    id,
    name,
    baseWeight,
    areaRange:
      Object.freeze({
        min: area[0],
        max: area[1]
      }),
    usableRatioRange:
      Object.freeze({
        min: usable[0],
        max: usable[1]
      }),
    floorOptions:
      Object.freeze([
        ...floors
      ]),
    shapeWeights:
      Object.freeze({
        ...shapes
      }),
    frontageRange:
      Object.freeze({
        min: frontage[0],
        max: frontage[1]
      }),
    ceilingHeightRange:
      Object.freeze({
        min: ceiling[0],
        max: ceiling[1]
      }),
    parkingRange:
      Object.freeze({
        min: parking[0],
        max: parking[1]
      }),
    parkingDistrictInfluence,
    entranceCountRange:
      Object.freeze({
        min: entrances[0],
        max: entrances[1]
      }),
    naturalLightRange:
      Object.freeze({
        min: naturalLight[0],
        max: naturalLight[1]
      }),
    columnDensityPer1000Range:
      Object.freeze({
        min: columns[0],
        max: columns[1]
      }),
    foodServiceProbability,
    exhaustProbability,
    rentRateMultiplier,
    depositMonthsRange:
      Object.freeze({
        min: deposit[0],
        max: deposit[1]
      }),
    listingLifeDaysRange:
      Object.freeze({
        min: listingLife[0],
        max: listingLife[1]
      }),
    leaseProfile: lease,
    kitchenProfile: kitchen,
    districtWeights:
      Object.freeze({
        ...districtWeights
      })
  });
}

const LEASE_FLEXIBLE =
  leaseProfile({
    months: [6, 36],
    propertyFee: [0.5, 2.2],
    transferProbability: 0.42,
    transferMultiple: [0.3, 1.5],
    rentFree: [0, 10],
    discount: [0.03, 0.11],
    renewal: [0.03, 0.08]
  });

const LEASE_COMMERCIAL =
  leaseProfile({
    months: [12, 60],
    propertyFee: [1.2, 4.5],
    transferProbability: 0.28,
    transferMultiple: [0.4, 1.8],
    rentFree: [5, 25],
    discount: [0.02, 0.08],
    renewal: [0.04, 0.1]
  });

const LEASE_DESTINATION =
  leaseProfile({
    months: [24, 84],
    propertyFee: [0.6, 3.2],
    transferProbability: 0.18,
    transferMultiple: [0.5, 2.2],
    rentFree: [10, 45],
    discount: [0.04, 0.12],
    renewal: [0.03, 0.08]
  });

export const PROPERTY_TEMPLATES_V1 =
  Object.freeze([
    template({
      id: "corner_micro",
      name: "街角微型铺",
      baseWeight: 1.25,
      area: [18, 45],
      usable: [0.82, 0.94],
      floors: [1],
      shapes: {
        rectangle: 0.88,
        l_shape: 0.12
      },
      frontage: [2.2, 5.5],
      ceiling: [2.7, 3.5],
      parking: [0, 1],
      parkingDistrictInfluence: 0.15,
      entrances: [1, 1],
      naturalLight: [48, 78],
      columns: [0, 1],
      foodServiceProbability: 0.84,
      exhaustProbability: 0.66,
      rentRateMultiplier: 1.2,
      deposit: [1, 2],
      listingLife: [12, 30],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 62,
        gas: 48,
        power: 60,
        exhaust: 58
      }),
      districtWeights: {
        old_town: 1.4,
        residential: 1.25,
        university: 1.2,
        wholesale_market: 1.25,
        transport_hub: 0.9,
        premium_residential: 0.55
      }
    }),

    template({
      id: "breakfast_bay",
      name: "早餐便民铺",
      baseWeight: 1.05,
      area: [20, 60],
      usable: [0.84, 0.95],
      floors: [1],
      shapes: {
        rectangle: 0.94,
        l_shape: 0.06
      },
      frontage: [2.8, 7],
      ceiling: [2.7, 3.4],
      parking: [0, 2],
      parkingDistrictInfluence: 0.22,
      entrances: [1, 1],
      naturalLight: [55, 82],
      columns: [0, 0.6],
      foodServiceProbability: 0.95,
      exhaustProbability: 0.82,
      rentRateMultiplier: 1.1,
      deposit: [1, 2],
      listingLife: [10, 28],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 72,
        gas: 62,
        power: 64,
        exhaust: 70
      }),
      districtWeights: {
        residential: 1.45,
        transport_hub: 1.45,
        wholesale_market: 1.5,
        medical_cluster: 1.25,
        industrial_park: 1.2,
        nightlife: 0.35
      }
    }),

    template({
      id: "takeaway_unit",
      name: "外带外卖铺",
      baseWeight: 1.15,
      area: [18, 80],
      usable: [0.8, 0.94],
      floors: [1],
      shapes: {
        rectangle: 0.9,
        l_shape: 0.1
      },
      frontage: [2.2, 6],
      ceiling: [2.7, 3.6],
      parking: [0, 2],
      parkingDistrictInfluence: 0.18,
      entrances: [1, 1],
      naturalLight: [35, 72],
      columns: [0, 1],
      foodServiceProbability: 0.92,
      exhaustProbability: 0.8,
      rentRateMultiplier: 1.05,
      deposit: [1, 2],
      listingLife: [12, 32],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 76,
        gas: 66,
        power: 76,
        exhaust: 74
      }),
      districtWeights: {
        office_park: 1.55,
        tech_park: 1.6,
        university: 1.45,
        cbd: 1.35,
        residential: 1.2,
        transport_hub: 1.2
      }
    }),

    template({
      id: "community_small",
      name: "社区小铺",
      baseWeight: 1.3,
      area: [45, 100],
      usable: [0.82, 0.94],
      floors: [1],
      shapes: {
        rectangle: 0.86,
        l_shape: 0.14
      },
      frontage: [3.5, 8],
      ceiling: [2.8, 3.8],
      parking: [0, 4],
      parkingDistrictInfluence: 0.4,
      entrances: [1, 2],
      naturalLight: [52, 82],
      columns: [0, 1],
      foodServiceProbability: 0.94,
      exhaustProbability: 0.84,
      rentRateMultiplier: 1.04,
      deposit: [1, 3],
      listingLife: [14, 36],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 76,
        gas: 72,
        power: 68,
        exhaust: 76
      }),
      districtWeights: {
        residential: 1.55,
        suburban_community: 1.5,
        old_town: 1.2,
        medical_cluster: 1.2,
        premium_residential: 0.8
      }
    }),

    template({
      id: "community_corner",
      name: "社区转角铺",
      baseWeight: 0.95,
      area: [60, 140],
      usable: [0.8, 0.92],
      floors: [1],
      shapes: {
        rectangle: 0.72,
        l_shape: 0.28
      },
      frontage: [6, 13],
      ceiling: [2.9, 4],
      parking: [0, 5],
      parkingDistrictInfluence: 0.45,
      entrances: [1, 2],
      naturalLight: [68, 92],
      columns: [0, 1],
      foodServiceProbability: 0.96,
      exhaustProbability: 0.86,
      rentRateMultiplier: 1.1,
      deposit: [1, 3],
      listingLife: [14, 40],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 78,
        gas: 72,
        power: 72,
        exhaust: 78
      }),
      districtWeights: {
        residential: 1.45,
        premium_residential: 1.1,
        suburban_community: 1.5,
        old_town: 1.05
      }
    }),

    template({
      id: "street_standard",
      name: "标准临街铺",
      baseWeight: 1.45,
      area: [80, 220],
      usable: [0.8, 0.93],
      floors: [1, 1, 1, 2],
      shapes: {
        rectangle: 0.78,
        l_shape: 0.22
      },
      frontage: [4.5, 12],
      ceiling: [2.9, 4.2],
      parking: [0, 6],
      parkingDistrictInfluence: 0.48,
      entrances: [1, 2],
      naturalLight: [55, 88],
      columns: [0, 1.5],
      foodServiceProbability: 0.96,
      exhaustProbability: 0.9,
      rentRateMultiplier: 1,
      deposit: [1, 3],
      listingLife: [14, 42],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 82,
        gas: 78,
        power: 78,
        exhaust: 82
      }),
      districtWeights: {
        old_town: 1.2,
        residential: 1.25,
        nightlife: 1.1,
        cultural_creative: 1.1,
        commercial_core: 1.05
      }
    }),

    template({
      id: "street_wide_front",
      name: "宽门面临街铺",
      baseWeight: 0.9,
      area: [120, 320],
      usable: [0.8, 0.92],
      floors: [1, 1, 2],
      shapes: {
        rectangle: 0.84,
        l_shape: 0.16
      },
      frontage: [10, 22],
      ceiling: [3, 4.5],
      parking: [1, 10],
      parkingDistrictInfluence: 0.55,
      entrances: [1, 3],
      naturalLight: [70, 96],
      columns: [0, 1.8],
      foodServiceProbability: 0.98,
      exhaustProbability: 0.92,
      rentRateMultiplier: 1.08,
      deposit: [2, 3],
      listingLife: [16, 45],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 84,
        gas: 82,
        power: 82,
        exhaust: 86
      }),
      districtWeights: {
        commercial_core: 1.25,
        cbd: 1.15,
        nightlife: 1.15,
        sports_entertainment: 1.15,
        old_town: 0.9
      }
    }),

    template({
      id: "old_town_narrow",
      name: "老城纵深铺",
      baseWeight: 0.9,
      area: [50, 180],
      usable: [0.7, 0.88],
      floors: [1, 1, 2],
      shapes: {
        rectangle: 0.6,
        l_shape: 0.4
      },
      frontage: [2.5, 6],
      ceiling: [2.6, 3.6],
      parking: [0, 1],
      parkingDistrictInfluence: 0.1,
      entrances: [1, 1],
      naturalLight: [30, 62],
      columns: [0.5, 2.5],
      foodServiceProbability: 0.9,
      exhaustProbability: 0.76,
      rentRateMultiplier: 0.92,
      deposit: [1, 2],
      listingLife: [18, 50],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 66,
        gas: 64,
        power: 56,
        exhaust: 62
      }),
      districtWeights: {
        old_town: 2,
        cultural_creative: 1.35,
        residential: 0.85,
        cbd: 0.35,
        premium_residential: 0.25
      }
    }),

    template({
      id: "mall_inline",
      name: "商场标准餐饮铺",
      baseWeight: 0.78,
      area: [80, 260],
      usable: [0.72, 0.86],
      floors: [1],
      shapes: {
        rectangle: 0.94,
        l_shape: 0.06
      },
      frontage: [5, 14],
      ceiling: [3.2, 4.8],
      parking: [0, 3],
      parkingDistrictInfluence: 0.1,
      entrances: [1, 2],
      naturalLight: [20, 58],
      columns: [0, 1.2],
      foodServiceProbability: 1,
      exhaustProbability: 0.88,
      rentRateMultiplier: 1.32,
      deposit: [2, 4],
      listingLife: [18, 48],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 84,
        gas: 58,
        power: 92,
        exhaust: 84
      }),
      districtWeights: {
        commercial_core: 1.8,
        cbd: 1.5,
        sports_entertainment: 1.25,
        premium_residential: 0.9,
        old_town: 0.35
      }
    }),

    template({
      id: "mall_foodcourt",
      name: "商场美食档口",
      baseWeight: 0.86,
      area: [25, 100],
      usable: [0.72, 0.88],
      floors: [1],
      shapes: {
        rectangle: 0.98,
        l_shape: 0.02
      },
      frontage: [3.5, 9],
      ceiling: [3, 4.2],
      parking: [0, 1],
      parkingDistrictInfluence: 0.05,
      entrances: [1, 1],
      naturalLight: [15, 48],
      columns: [0, 0.6],
      foodServiceProbability: 1,
      exhaustProbability: 0.78,
      rentRateMultiplier: 1.22,
      deposit: [2, 4],
      listingLife: [14, 38],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 78,
        gas: 42,
        power: 92,
        exhaust: 76
      }),
      districtWeights: {
        commercial_core: 1.9,
        cbd: 1.45,
        sports_entertainment: 1.4,
        university: 1.1
      }
    }),

    template({
      id: "office_podium",
      name: "写字楼裙房铺",
      baseWeight: 0.92,
      area: [80, 300],
      usable: [0.76, 0.9],
      floors: [1, 1, 2],
      shapes: {
        rectangle: 0.9,
        l_shape: 0.1
      },
      frontage: [4, 12],
      ceiling: [2.9, 4.2],
      parking: [0, 5],
      parkingDistrictInfluence: 0.24,
      entrances: [1, 2],
      naturalLight: [42, 78],
      columns: [0.5, 2],
      foodServiceProbability: 0.96,
      exhaustProbability: 0.82,
      rentRateMultiplier: 1.16,
      deposit: [2, 4],
      listingLife: [14, 38],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 82,
        gas: 58,
        power: 88,
        exhaust: 78
      }),
      districtWeights: {
        office_park: 1.9,
        cbd: 1.6,
        tech_park: 1.65,
        convention_center: 1.2
      }
    }),

    template({
      id: "campus_unit",
      name: "校园配套餐饮铺",
      baseWeight: 0.78,
      area: [30, 120],
      usable: [0.78, 0.92],
      floors: [1],
      shapes: {
        rectangle: 0.9,
        l_shape: 0.1
      },
      frontage: [3, 8],
      ceiling: [2.8, 3.8],
      parking: [0, 1],
      parkingDistrictInfluence: 0.05,
      entrances: [1, 2],
      naturalLight: [42, 76],
      columns: [0, 1],
      foodServiceProbability: 1,
      exhaustProbability: 0.86,
      rentRateMultiplier: 0.82,
      deposit: [1, 2],
      listingLife: [10, 30],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 76,
        gas: 62,
        power: 76,
        exhaust: 76
      }),
      districtWeights: {
        university: 2.2,
        residential: 0.55,
        cbd: 0.25
      }
    }),

    template({
      id: "medical_support_unit",
      name: "医疗配套铺",
      baseWeight: 0.68,
      area: [35, 140],
      usable: [0.8, 0.92],
      floors: [1],
      shapes: {
        rectangle: 0.92,
        l_shape: 0.08
      },
      frontage: [3.5, 9],
      ceiling: [2.8, 3.8],
      parking: [0, 4],
      parkingDistrictInfluence: 0.28,
      entrances: [1, 2],
      naturalLight: [48, 82],
      columns: [0, 1],
      foodServiceProbability: 0.94,
      exhaustProbability: 0.74,
      rentRateMultiplier: 0.98,
      deposit: [1, 3],
      listingLife: [16, 42],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 84,
        gas: 48,
        power: 78,
        exhaust: 68
      }),
      districtWeights: {
        medical_cluster: 2.3,
        residential: 0.8,
        old_town: 0.65
      }
    }),

    template({
      id: "night_market_shop",
      name: "夜市餐饮铺",
      baseWeight: 0.72,
      area: [50, 180],
      usable: [0.78, 0.92],
      floors: [1],
      shapes: {
        rectangle: 0.78,
        l_shape: 0.22
      },
      frontage: [4, 11],
      ceiling: [2.8, 4],
      parking: [0, 3],
      parkingDistrictInfluence: 0.18,
      entrances: [1, 2],
      naturalLight: [38, 72],
      columns: [0, 1.2],
      foodServiceProbability: 0.98,
      exhaustProbability: 0.9,
      rentRateMultiplier: 1.08,
      deposit: [1, 3],
      listingLife: [12, 35],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 74,
        gas: 78,
        power: 72,
        exhaust: 84
      }),
      districtWeights: {
        nightlife: 2.1,
        sports_entertainment: 1.35,
        cultural_creative: 1.15,
        university: 1
      }
    }),

    template({
      id: "creative_loft",
      name: "文创挑高铺",
      baseWeight: 0.55,
      area: [100, 350],
      usable: [0.68, 0.86],
      floors: [1, 2],
      shapes: {
        rectangle: 0.62,
        l_shape: 0.38
      },
      frontage: [5, 14],
      ceiling: [3.8, 6.5],
      parking: [0, 4],
      parkingDistrictInfluence: 0.2,
      entrances: [1, 2],
      naturalLight: [70, 98],
      columns: [0.5, 2],
      foodServiceProbability: 0.88,
      exhaustProbability: 0.68,
      rentRateMultiplier: 1.06,
      deposit: [2, 3],
      listingLife: [20, 55],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 68,
        gas: 44,
        power: 82,
        exhaust: 62
      }),
      districtWeights: {
        cultural_creative: 2.4,
        old_town: 1.15,
        nightlife: 1.05,
        commercial_core: 0.85
      }
    }),

    template({
      id: "wholesale_fast_unit",
      name: "批发市场快餐铺",
      baseWeight: 0.78,
      area: [50, 160],
      usable: [0.82, 0.94],
      floors: [1],
      shapes: {
        rectangle: 0.9,
        l_shape: 0.1
      },
      frontage: [4, 10],
      ceiling: [2.9, 4.2],
      parking: [0, 8],
      parkingDistrictInfluence: 0.55,
      entrances: [1, 2],
      naturalLight: [45, 78],
      columns: [0, 1],
      foodServiceProbability: 0.98,
      exhaustProbability: 0.9,
      rentRateMultiplier: 0.7,
      deposit: [1, 2],
      listingLife: [10, 28],
      lease: LEASE_FLEXIBLE,
      kitchen: kitchenProfile({
        water: 78,
        gas: 82,
        power: 72,
        exhaust: 84
      }),
      districtWeights: {
        wholesale_market: 2.5,
        industrial_park: 1.2,
        transport_hub: 0.8
      }
    }),

    template({
      id: "transport_concourse",
      name: "枢纽通道铺",
      baseWeight: 0.62,
      area: [25, 120],
      usable: [0.7, 0.86],
      floors: [1],
      shapes: {
        rectangle: 0.98,
        l_shape: 0.02
      },
      frontage: [3, 10],
      ceiling: [2.8, 4],
      parking: [0, 1],
      parkingDistrictInfluence: 0.02,
      entrances: [1, 2],
      naturalLight: [20, 58],
      columns: [0, 1],
      foodServiceProbability: 0.96,
      exhaustProbability: 0.62,
      rentRateMultiplier: 1.3,
      deposit: [2, 4],
      listingLife: [10, 26],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 72,
        gas: 34,
        power: 92,
        exhaust: 58
      }),
      districtWeights: {
        transport_hub: 2.8,
        cbd: 0.65,
        convention_center: 0.75
      }
    }),

    template({
      id: "family_large",
      name: "家庭餐饮大铺",
      baseWeight: 0.7,
      area: [220, 600],
      usable: [0.78, 0.91],
      floors: [1, 1, 2],
      shapes: {
        rectangle: 0.76,
        l_shape: 0.24
      },
      frontage: [7, 18],
      ceiling: [3, 4.8],
      parking: [2, 18],
      parkingDistrictInfluence: 0.7,
      entrances: [1, 3],
      naturalLight: [58, 92],
      columns: [0.5, 2],
      foodServiceProbability: 0.99,
      exhaustProbability: 0.94,
      rentRateMultiplier: 0.92,
      deposit: [2, 3],
      listingLife: [18, 50],
      lease: LEASE_COMMERCIAL,
      kitchen: kitchenProfile({
        water: 88,
        gas: 86,
        power: 84,
        exhaust: 90
      }),
      districtWeights: {
        residential: 1.45,
        suburban_community: 1.8,
        premium_residential: 1.25,
        sports_entertainment: 0.9
      }
    }),

    template({
      id: "courtyard_property",
      name: "庭院型餐饮物业",
      baseWeight: 0.42,
      area: [250, 800],
      usable: [0.62, 0.82],
      floors: [1, 2],
      shapes: {
        rectangle: 0.46,
        l_shape: 0.54
      },
      frontage: [6, 18],
      ceiling: [3, 5],
      parking: [2, 20],
      parkingDistrictInfluence: 0.72,
      entrances: [2, 3],
      naturalLight: [78, 100],
      columns: [0, 1.5],
      foodServiceProbability: 0.96,
      exhaustProbability: 0.9,
      rentRateMultiplier: 0.9,
      deposit: [2, 3],
      listingLife: [24, 60],
      lease: LEASE_DESTINATION,
      kitchen: kitchenProfile({
        water: 82,
        gas: 82,
        power: 76,
        exhaust: 86
      }),
      districtWeights: {
        old_town: 1.4,
        cultural_creative: 1.55,
        suburban_resort: 1.6,
        waterfront_leisure: 1.35,
        premium_residential: 1.05
      }
    }),

    template({
      id: "standalone_parking",
      name: "独栋停车型餐饮物业",
      baseWeight: 0.46,
      area: [300, 1000],
      usable: [0.74, 0.9],
      floors: [1, 1, 2],
      shapes: {
        rectangle: 0.8,
        l_shape: 0.2
      },
      frontage: [9, 24],
      ceiling: [3.2, 5.2],
      parking: [8, 40],
      parkingDistrictInfluence: 0.85,
      entrances: [2, 3],
      naturalLight: [68, 96],
      columns: [0, 1.6],
      foodServiceProbability: 1,
      exhaustProbability: 0.98,
      rentRateMultiplier: 0.84,
      deposit: [2, 4],
      listingLife: [24, 65],
      lease: LEASE_DESTINATION,
      kitchen: kitchenProfile({
        water: 90,
        gas: 90,
        power: 86,
        exhaust: 94
      }),
      districtWeights: {
        suburban_community: 1.6,
        suburban_resort: 1.85,
        waterfront_leisure: 1.6,
        premium_residential: 1.3,
        industrial_park: 1.05
      }
    }),

    template({
      id: "flagship_duplex",
      name: "旗舰复式铺",
      baseWeight: 0.36,
      area: [800, 2200],
      usable: [0.72, 0.88],
      floors: [2, 2, 2, 3],
      shapes: {
        rectangle: 0.72,
        l_shape: 0.28
      },
      frontage: [12, 32],
      ceiling: [3.3, 6],
      parking: [4, 35],
      parkingDistrictInfluence: 0.65,
      entrances: [2, 4],
      naturalLight: [62, 95],
      columns: [1, 3.5],
      foodServiceProbability: 1,
      exhaustProbability: 0.96,
      rentRateMultiplier: 0.8,
      deposit: [2, 4],
      listingLife: [28, 72],
      lease: LEASE_DESTINATION,
      kitchen: kitchenProfile({
        water: 92,
        gas: 88,
        power: 94,
        exhaust: 92
      }),
      districtWeights: {
        commercial_core: 1.65,
        cbd: 1.35,
        convention_center: 1.45,
        sports_entertainment: 1.2,
        premium_residential: 1.1
      }
    }),

    template({
      id: "destination_complex",
      name: "目的型餐饮综合体",
      baseWeight: 0.2,
      area: [1800, 8000],
      usable: [0.66, 0.84],
      floors: [2, 3, 3, 4],
      shapes: {
        rectangle: 0.58,
        l_shape: 0.42
      },
      frontage: [16, 50],
      ceiling: [3.5, 7],
      parking: [20, 160],
      parkingDistrictInfluence: 0.92,
      entrances: [2, 5],
      naturalLight: [60, 96],
      columns: [1.5, 5],
      foodServiceProbability: 1,
      exhaustProbability: 0.99,
      rentRateMultiplier: 0.7,
      deposit: [2, 5],
      listingLife: [35, 90],
      lease: LEASE_DESTINATION,
      kitchen: kitchenProfile({
        water: 96,
        gas: 94,
        power: 98,
        exhaust: 96
      }),
      districtWeights: {
        suburban_resort: 1.9,
        waterfront_leisure: 1.75,
        convention_center: 1.55,
        tourist_scenic: 1.5,
        commercial_core: 1.15
      }
    })
  ]);
