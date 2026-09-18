export const ECONOMIC_BASELINE = {
  schemaVersion: 3,
  snapshotId: "cn_2026_09_real_price_snapshot",
  currency: "CNY",
  regionModel: "virtual_city_cn_reference",

  sourcePolicy: {
    mode: "snapshot",
    description: "现实数据只作为基准锚点；游戏价格由基准值与城市、季节、供需、品质、事件、合同等系数组合计算。",
    pricingScale: 1,
    strictNominalRmb: true,
    refreshStrategy: "版本化现实价格快照。优先使用农业农村部、商务部、国家统计局及地方公开监测数据；无官方点价时使用可追溯市场样本，不允许业务页面写死或使用纯游戏化随机价格。",
    supportedSourceKinds: [
      "official_statistics",
      "wholesale_market",
      "industry_report",
      "platform_index",
      "utility_tariff",
      "commercial_listing_sample",
      "manual_reference"
    ]
  },

  macro: {
    consumerPriceIndex: 1,
    foodPriceIndex: 1,
    wageIndex: 1,
    commercialRentIndex: 1,
    energyIndex: 1,
    logisticsIndex: 1,
    renovationIndex: 1,
    equipmentIndex: 1
  },

  ingredientReference: {
    pork: {
      sourceUnit: "kg",
      gameUnit: "g",
      referencePrice: 17.48,
      volatility: 0.18,
      marketLevel: "wholesale",
      observedPeriod: "2026-09-07/2026-09-13",
      sourceKind: "official_wholesale_monitoring",
      sourceName: "商务部市场运行和消费促进司",
      sourceUrl: "https://cif.mofcom.gov.cn/cif/html/price_index/synpc_index/2026/9/1789612766076.html"
    },

    chicken: {
      sourceUnit: "kg",
      gameUnit: "g",
      referencePrice: 17.29,
      volatility: 0.14,
      marketLevel: "wholesale",
      observedDate: "2026-09-08",
      sourceKind: "official_wholesale_monitoring",
      sourceName: "农业农村部市场与信息化司",
      sourceUrl: "https://cif.mofcom.gov.cn/newsite/html/shenzhen/html/24454065/2026/9/9/1788943802796.html"
    },

    egg: {
      sourceUnit: "kg",
      gameUnit: "piece",
      referencePrice: 10.88,
      gramsPerPiece: 55,
      volatility: 0.11,
      marketLevel: "wholesale",
      observedDate: "2026-09-08",
      sourceKind: "official_wholesale_monitoring",
      sourceName: "农业农村部市场与信息化司",
      sourceUrl: "https://cif.mofcom.gov.cn/newsite/html/shenzhen/html/24454065/2026/9/9/1788943802796.html"
    },

    tomato: {
      sourceUnit: "kg",
      gameUnit: "g",
      referencePrice: 6.27,
      volatility: 0.22,
      marketLevel: "retail_36_city",
      observedPeriod: "2026-08-24/2026-08-30",
      sourceKind: "official_retail_monitoring",
      sourceName: "商务部市场运行和消费促进司",
      sourceUrl: "https://cif.mofcom.gov.cn/cif/html/nfcpdt_pc/2026/9/1788333058708.html"
    },

    pepper: {
      sourceUnit: "kg",
      gameUnit: "g",
      referencePrice: 7.65,
      volatility: 0.24,
      marketLevel: "retail_36_city",
      observedPeriod: "2026-09-07/2026-09-13",
      sourceKind: "official_retail_monitoring",
      sourceName: "商务部市场运行和消费促进司",
      sourceUrl: "https://cif.mofcom.gov.cn/cif/html/nfcpdt_pc/2026/9/1789611921994.html"
    },

    rice: {
      sourceUnit: "kg",
      gameUnit: "g",
      referencePrice: 6.41,
      volatility: 0.08,
      marketLevel: "retail_36_city",
      observedPeriod: "2026-09-07/2026-09-13",
      sourceKind: "official_retail_monitoring",
      sourceName: "商务部市场运行和消费促进司",
      sourceUrl: "https://cif.mofcom.gov.cn/cif/html/nfcpdt_pc/2026/9/1789611921994.html"
    },

    soy_sauce: {
      sourceUnit: "l",
      gameUnit: "ml",
      referencePrice: 18,
      volatility: 0.07,
      marketLevel: "market_sample",
      observedPeriod: "2026-Q3",
      sourceKind: "market_sample",
      sourceName: "大众商超调味品样本"
    },

    oil: {
      sourceUnit: "l",
      gameUnit: "ml",
      referencePrice: 12.66,
      volatility: 0.12,
      marketLevel: "retail_36_city",
      observedPeriod: "2026-09-07/2026-09-13",
      sourceKind: "official_retail_monitoring",
      sourceName: "商务部市场运行和消费促进司",
      sourceUrl: "https://cif.mofcom.gov.cn/cif/html/nfcpdt_pc/2026/9/1789611921994.html"
    }
  },

  laborMarketReference: {
    industry:
      "住宿和餐饮业",

    statisticalYear:
      2024,

    privateUnitAnnualAverage:
      54042,

    privateUnitMonthlyAverage:
      4503.5,

    sourceKind:
      "official_statistics",

    sourceName:
      "国家统计局",

    sourceUrl:
      "https://www.stats.gov.cn/WZWSREL2VuZ2xpc2gvUHJlc3NSZWxlYXNlLzIwMjUwNS90MjAyNTA1MjBfMTk1OTg4NS5odG1s"
  },

  laborReference: {
    chef: { monthlySalary: 6500, scarcity: 0.2 },
    server: { monthlySalary: 4200, scarcity: 0.12 },
    cashier: { monthlySalary: 4300, scarcity: 0.1 },
    kitchen_assistant: { monthlySalary: 4500, scarcity: 0.12 },
    cleaner: { monthlySalary: 3600, scarcity: 0.08 },
    delivery: { monthlySalary: 5200, scarcity: 0.15 },
    manager: { monthlySalary: 8500, scarcity: 0.25 }
  },

  commercialRentReference: {
    unit: "sqm_month",
    old_town: 85,
    cbd: 210,
    university: 75,
    premium_residential: 130,
    residential: 60,
    transport_hub: 160,
    industrial_park: 45,
    nightlife: 120,
    tourist_scenic: 95,
    suburban_resort: 38
  },

  utilitiesReference: {
    electricityPerKwh: 0.92,
    waterPerTon: 5.2,
    gasPerCubicMeter: 3.9,
    wasteDisposalMonthlyBase: 380,
    internetMonthlyBase: 180
  },

  logisticsReference: {
    cityDeliveryBase: 18,
    coldChainMultiplier: 1.45,
    rushMultiplier: 1.35,
    distanceCostPerKm: 2.4
  },

  renovationReference: {
    basicPerSquareMeter: 850,
    standardPerSquareMeter: 1450,
    premiumPerSquareMeter: 2600,
    privateDiningPerSquareMeter: 3200,
    resortOutdoorPerSquareMeter: 780
  },

  furnitureReference: {
    table_2: 1200,
    table_4: 2200,
    booth_4: 4200,
    kitchen_station: 12000,
    prep_counter: 3800,
    cashier_counter: 3200,
    waiting_bench: 1800,
    decor_plant: 600,
    decor_feature: 6200
  },

  equipmentReference: {
    kitchenStation: 12000,
    refrigerator: 6800,
    freezer: 7200,
    dishwasher: 9600,
    exhaustSystem: 18000,
    posTerminal: 2600
  },

  demandElasticity: {
    minDemandFactor: 0.08,
    maxDemandFactor: 1.55,
    markupStrength: 1.05,
    discountStrength: 0.32,
    spendingPowerRelief: 0.22,
    priceShockMemoryDays: 7,
    repeatCustomerShockWeight: 0.35
  }
};
