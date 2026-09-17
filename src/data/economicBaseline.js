export const ECONOMIC_BASELINE = {
  schemaVersion: 1,
  snapshotId: "cn_reference_2026q3_seed",
  currency: "CNY",
  regionModel: "virtual_city_cn_reference",

  sourcePolicy: {
    mode: "snapshot",
    description: "现实数据只作为基准锚点；游戏价格由基准值与城市、季节、供需、品质、事件、合同等系数组合计算。",
    supportedSourceKinds: [
      "official_statistics",
      "wholesale_market",
      "industry_report",
      "platform_index",
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
    pork: { unit: "kg", referencePrice: 26, volatility: 0.18 },
    chicken: { unit: "kg", referencePrice: 18, volatility: 0.14 },
    egg: { unit: "piece", referencePrice: 0.75, volatility: 0.11 },
    tomato: { unit: "kg", referencePrice: 7, volatility: 0.22 },
    pepper: { unit: "kg", referencePrice: 9, volatility: 0.24 },
    rice: { unit: "kg", referencePrice: 6, volatility: 0.08 },
    soy_sauce: { unit: "l", referencePrice: 18, volatility: 0.07 },
    oil: { unit: "l", referencePrice: 13, volatility: 0.12 }
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
