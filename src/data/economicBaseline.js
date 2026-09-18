export const ECONOMIC_BASELINE = {
  schemaVersion: 3,
  snapshotId: "cn_2026_09_real_price_snapshot",
  currency: "CNY",
  regionModel: "virtual_city_cn_reference",
  referenceCity: "郑州",
  referenceProvince: "河南",
  nominalCurrencyScale: 1,

  sourcePolicy: {
    mode: "reality_1_to_1",
    description: "所有金额使用现实人民币名义金额1:1，不做游戏化缩放；基准价来自可追溯现实公开数据快照。",
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
      "market_platform_sample",
      "market_equipment_sample",
      "derived_from_real_anchor",
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
    chef: {
      monthlySalary: 6530,
      roleFactor: 1.45,
      sourceKind: "derived_from_real_anchor"
    },

    server: {
      monthlySalary: 4143,
      roleFactor: 0.92,
      sourceKind: "derived_from_real_anchor"
    },

    cashier: {
      monthlySalary: 4278,
      roleFactor: 0.95,
      sourceKind: "derived_from_real_anchor"
    },

    kitchen_assistant: {
      monthlySalary: 4504,
      roleFactor: 1,
      sourceKind: "derived_from_real_anchor"
    },

    cleaner: {
      monthlySalary: 3693,
      roleFactor: 0.82,
      sourceKind: "derived_from_real_anchor"
    },

    delivery: {
      monthlySalary: 5179,
      roleFactor: 1.15,
      sourceKind: "derived_from_real_anchor"
    },

    manager: {
      monthlySalary: 8557,
      roleFactor: 1.9,
      sourceKind: "derived_from_real_anchor"
    }
  },

  commercialRentReference: {
    unit: "sqm_month",

    citywideAnchor: {
      dailyPerSquareMeter:
        2.1,

      monthlyPerSquareMeter:
        63,

      observedYear:
        2026,

      sourceKind:
        "commercial_listing_sample",

      sourceName:
        "58同城郑州商铺租金走势",

      sourceUrl:
        "https://zz.58.com/fangjia/shangpuzujin/",

      note:
        "2026年郑州商铺日均租金2.1元/㎡/天，按30天折算63元/㎡/月。虚拟商圈只应用位置系数，不改变人民币1:1尺度。"
    },

    districtFactor: {
      old_town:
        0.96,

      cbd:
        1.55,

      university:
        0.82,

      premium_residential:
        1.28,

      residential:
        0.76,

      transport_hub:
        1.34,

      industrial_park:
        0.64,

      nightlife:
        1.18,

      tourist_scenic:
        1.08,

      suburban_resort:
        0.72
    }
  },

  utilitiesReference: {
    electricityPerKwh:
      0.662973375,

    electricity: {
      billingClass:
        "工商业用电-单一制-不满1千伏",

      valueStatus:
        "last_fully_parsed_all_in_tariff",

      observedPeriod:
        "2024-11",

      currentTariffPublicationPeriod:
        "2026-09",

      currentTariffPublicationState:
        "published_monthly_table_requires_numeric_import",

      sourceKind:
        "utility_tariff",

      sourceName:
        "国网河南省电力公司代理购电工商业用户电价表",

      sourceUrl:
        "https://energydc.cn/policy/henan/2024-11/70b0d56e-d38e-11f0-9aa1-46a1f660a16d",

      currentPublicationIndexUrl:
        "https://energydc.cn/policy",

      note:
        "系统只使用已完整解析的工商业全口径电度电价，不把代理购电价格单独冒充终端电价。2026年9月河南表已发布，待数值导入后替换。"
    },

    waterPerTon:
      5.95,

    water: {
      billingClass:
        "非居民生活用水",

      observedPolicyDate:
        "2017-01-01",

      sourceKind:
        "utility_tariff",

      sourceName:
        "郑州市非居民用水综合水价",

      sourceUrl:
        "https://public.zhengzhou.gov.cn/D0105Y/173749.jhtml"
    },

    gasPerCubicMeter:
      4.55,

    gas: {
      billingClass:
        "市区非居民管道天然气",

      nonHeating:
        4.55,

      heatingSeason:
        4.8,

      observedPolicyDate:
        "2026-08-31",

      sourceKind:
        "utility_tariff",

      sourceName:
        "郑州市发展和改革委员会非居民管道燃气销售价格批复",

      sourceUrl:
        "https://public.zhengzhou.gov.cn/D300201X/10227654.jhtml"
    },

    wasteDisposalMonthlyBase:
      null,

    internetMonthlyBase:
      null,

    unsourcedChargesPolicy:
      "没有可追溯现实报价时不自动扣除固定垃圾清运费或宽带费。"
  },

  logisticsReference: {
    model:
      "same_city_small_van",

    includedKm:
      5,

    cityDeliveryBase:
      30,

    distanceCostPerKmAfterBase:
      3,

    coldChainMultiplier:
      null,

    rushMultiplier:
      null,

    observedPeriod:
      "2026-08",

    sourceKind:
      "market_platform_sample",

    sourceName:
      "同城货运市场计价样本（小面包车）",

    sourceUrl:
      "https://wuliu.huolala.cn/freight-query.html",

    note:
      "平台官方页面确认按重量/体积与线路动态报价；30元/5公里、超距约3元/公里为2026公开市场样本，正式订单仍允许供应商报价覆盖。"
  },

  renovationReference: {
    unit:
      "sqm",

    basicPerSquareMeter:
      1000,

    standardPerSquareMeter:
      1800,

    premiumPerSquareMeter:
      3000,

    privateDiningPerSquareMeter:
      3500,

    resortOutdoorPerSquareMeter:
      800,

    marketRanges: {
      basic:
        [800, 1200],

      standard:
        [1500, 2500],

      premium:
        [2500, 5000]
    },

    observedPeriod:
      "2026",

    sourceKind:
      "industry_market_sample",

    sourceName:
      "2026餐饮工装公开市场报价区间",

    sourceUrl:
      "https://www.csjcs.com/news/shangxun/Article-CvV4bF-476057.html",

    note:
      "装修费按真实人民币/㎡计价，设备另计；具体门店可因城市、面积、消防、排烟和材料等级产生真实差异。"
  },

  furnitureReference: {
    table_2:
      800,

    table_4:
      1200,

    booth_4:
      2800,

    kitchen_station:
      2200,

    prep_counter:
      700,

    cashier_counter:
      2500,

    waiting_bench:
      900,

    decor_plant:
      180,

    decor_feature:
      3000
  },

  furnitureMarketReference: {
    observedPeriod:
      "2026",

    sourceKind:
      "market_equipment_sample",

    sourceName:
      "2026餐饮商用家具与后厨设备公开市场样本",

    sourceUrl:
      "https://www.csjcs.com/news/shangxun/Article-LLEqnx-573803.html",

    note:
      "家具为同规格全新商用品的中位采购预算；后续可由具体供应商SKU报价覆盖。"
  },

  equipmentReference: {
    kitchenStation:
      2200,

    refrigerator:
      6969,

    freezer:
      6969,

    dishwasher:
      9600,

    exhaustSystem:
      5000,

    posTerminal:
      2500
  },

  equipmentMarketReference: {
    observedPeriod:
      "2026",

    sourceKind:
      "market_equipment_sample",

    samples: {
      kitchenStation: {
        marketRange:
          [1800, 3500],

        sourceName:
          "2026商用猛火灶公开市场区间",

        sourceUrl:
          "https://www.csjcs.com/news/shangxun/Article-LLEqnx-573803.html"
      },

      refrigerator: {
        referencePrice:
          6969,

        specification:
          "四门立式商用冷柜",

        sourceName:
          "苏宁易购圣托DHD03公开报价",

        sourceUrl:
          "https://www.suning.com/item/0070064032/12383643168.html"
      },

      posTerminal: {
        referencePrice:
          2500,

        sourceName:
          "智慧餐饮一体收银终端公开报价",

        sourceUrl:
          "https://www.kxsdd.cn/front/EFood/price"
      },

      exhaustSystem: {
        marketRange:
          [2500, 8000],

        sourceName:
          "2026低空油烟净化设备公开市场区间",

        sourceUrl:
          "https://www.csjcs.com/news/shangxun/Article-LLEqnx-573803.html"
      }
    }
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
