import {
  RANDOM_EVENT_SCHEMA_VERSION
} from "./randomEventRules.js";

const ALL_SEASONS = Object.freeze({
  spring: 1,
  summer: 1,
  autumn: 1,
  winter: 1
});

const R = (min, max) =>
  Object.freeze({ min, max });

const freezeMap = value =>
  Object.freeze({ ...value });

function magnitude(
  severity,
  step = 0.03
) {
  return Number(
    (
      step *
      severity
    ).toFixed(3)
  );
}

function buildModifiers(
  channels,
  severity,
  polarity,
  segmentMultipliers = {}
) {
  const result = {
    demandMultiplier: 1,
    spendingMultiplier: 1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers:
      freezeMap(
        segmentMultipliers
      )
  };

  for (
    const [field, step]
    of Object.entries(channels)
  ) {
    const delta =
      magnitude(
        severity,
        Math.abs(step)
      );

    const direction =
      polarity === "negative"
        ? -1
        : polarity === "positive"
          ? 1
          : Math.sign(step);

    if (
      field ===
        "deliveryTimeMultiplier" ||
      field ===
        "supplyPriceMultiplier" ||
      field ===
        "payrollCostMultiplier" ||
      field ===
        "equipmentFailureMultiplier" ||
      field ===
        "operatingCostMultiplier" ||
      field ===
        "competitorPressureMultiplier"
    ) {
      result[field] =
        Number(
          (
            1 -
            direction *
            delta *
            Math.sign(step)
          ).toFixed(3)
        );
    } else {
      result[field] =
        Number(
          (
            1 +
            direction *
            delta *
            Math.sign(step)
          ).toFixed(3)
        );
    }
  }

  return Object.freeze(
    result
  );
}

function event({
  id,
  name,
  category,
  polarity,
  severity,
  weight,
  days,
  description,
  districtWeights,
  seasonWeights =
    ALL_SEASONS,
  channels = {},
  segmentMultipliers = {},
  modifiers = null
}) {
  return Object.freeze({
    schemaVersion:
      RANDOM_EVENT_SCHEMA_VERSION,
    id,
    name,
    category,
    polarity,
    severity,
    weight,
    durationRange:
      R(days[0], days[1]),
    description,
    districtWeights:
      freezeMap(
        districtWeights
      ),
    seasonWeights:
      freezeMap(
        seasonWeights
      ),
    modifiers:
      modifiers ??
      buildModifiers(
        channels,
        severity,
        polarity,
        segmentMultipliers
      )
  });
}

const DISTRICTS = Object.freeze({
  commercial: {
    commercial_core: 2.2,
    cbd: 1.8,
    convention_center: 2,
    sports_entertainment: 1.5,
    tourist_scenic: 1.35
  },
  infrastructure: {
    old_town: 1.8,
    cbd: 1.5,
    commercial_core: 1.6,
    transport_hub: 1.7,
    residential: 1.25
  },
  weather: {
    tourist_scenic: 1.4,
    suburban_resort: 1.4,
    waterfront_leisure: 1.4,
    transport_hub: 1.2,
    commercial_core: 1
  },
  education: {
    university: 3,
    tech_park: 0.8,
    residential: 0.7
  },
  office: {
    cbd: 2.3,
    office_park: 2.8,
    tech_park: 2.4,
    commercial_core: 1.5
  },
  community: {
    residential: 2.5,
    suburban_community: 2.7,
    old_town: 1.6,
    medical_cluster: 1.4,
    premium_residential: 1.2
  },
  competition: {
    commercial_core: 2.1,
    cbd: 1.9,
    nightlife: 1.8,
    university: 1.5,
    residential: 1.3
  },
  supply: {
    wholesale_market: 2.5,
    industrial_park: 1.4,
    old_town: 1.2,
    residential: 1.1,
    commercial_core: 1
  },
  labor: {
    industrial_park: 1.6,
    cbd: 1.4,
    office_park: 1.4,
    university: 1.25,
    commercial_core: 1.3
  },
  equipment: {
    industrial_park: 1.5,
    old_town: 1.4,
    wholesale_market: 1.3,
    transport_hub: 1.2,
    commercial_core: 1
  },
  compliance: {
    commercial_core: 1.6,
    old_town: 1.5,
    nightlife: 1.5,
    transport_hub: 1.35,
    wholesale_market: 1.35
  },
  reputation: {
    commercial_core: 1.6,
    cultural_creative: 2,
    university: 1.5,
    nightlife: 1.4,
    tourist_scenic: 1.4
  },
  cost: {
    cbd: 1.4,
    commercial_core: 1.4,
    industrial_park: 1.3,
    office_park: 1.2,
    residential: 1
  },
  delivery: {
    university: 2,
    office_park: 2.2,
    tech_park: 2.3,
    cbd: 1.8,
    residential: 1.7
  },
  opportunity: {
    commercial_core: 1.7,
    convention_center: 1.8,
    tourist_scenic: 1.6,
    cultural_creative: 1.5,
    sports_entertainment: 1.4
  }
});

const FAMILIES = [
  {
    category: "commercial",
    districtWeights: DISTRICTS.commercial,
    channels: {
      demandMultiplier: 0.035,
      spendingMultiplier: 0.018
    },
    items: [
      ["convention","附近展会","positive",3,12,[2,4]],
      ["shopping_festival","商圈购物节","positive",4,8,[2,5]],
      ["food_fair","城市美食节","positive",4,7,[2,4]],
      ["expo_week","大型博览周","positive",5,4,[3,6]],
      ["concert_weekend","演出周末","positive",3,8,[1,3]],
      ["office_conference","商务会议集中期","positive",2,9,[2,4]],
      ["wedding_peak","婚宴消费高峰","positive",3,8,[2,5]],
      ["tour_group_wave","团队游客集中到访","positive",3,8,[2,4]],
      ["mall_anniversary","商业体周年活动","positive",2,10,[2,4]],
      ["city_marathon","城市路跑活动","mixed",3,5,[1,2]]
    ]
  },
  {
    category: "infrastructure",
    districtWeights: DISTRICTS.infrastructure,
    channels: {
      demandMultiplier: 0.045,
      deliveryTimeMultiplier: 0.035
    },
    items: [
      ["road_construction","道路施工","negative",4,10,[4,8]],
      ["subway_maintenance","轨道交通检修","negative",3,7,[2,5]],
      ["parking_closure","公共停车区临时关闭","negative",2,8,[2,4]],
      ["utility_upgrade","市政管线升级","negative",2,7,[2,5]],
      ["street_renovation","街区立面改造","mixed",2,7,[3,6]],
      ["drainage_work","排水系统施工","negative",3,6,[2,5]],
      ["grid_upgrade","电网升级施工","mixed",2,6,[1,3]],
      ["bridge_repair","连接道路维修","negative",3,5,[3,6]],
      ["bus_route_change","公交线路临时调整","negative",2,8,[2,4]],
      ["plaza_reconstruction","公共广场改造","mixed",2,5,[4,7]]
    ]
  },
  {
    category: "weather",
    districtWeights: DISTRICTS.weather,
    channels: {
      demandMultiplier: 0.05,
      deliveryTimeMultiplier: 0.04,
      equipmentFailureMultiplier: 0.025
    },
    items: [
      ["severe_weather","恶劣天气","negative",4,8,[1,2]],
      ["heat_wave","持续高温","negative",3,8,[2,5]],
      ["cold_snap","突然降温","mixed",2,8,[1,3]],
      ["heavy_rain","连续强降雨","negative",3,9,[1,3]],
      ["snow_day","降雪天气","negative",3,5,[1,2]],
      ["typhoon_warning","强风天气预警","negative",5,3,[1,2]],
      ["clear_weekend","晴朗周末","positive",2,9,[1,2]],
      ["spring_bloom","春季踏青客流","positive",2,7,[2,4]],
      ["autumn_cool","秋高气爽","positive",2,7,[2,4]],
      ["air_quality_alert","空气质量提醒","negative",2,5,[1,3]]
    ]
  },
  {
    category: "education",
    districtWeights: DISTRICTS.education,
    channels: {
      demandMultiplier: 0.04,
      spendingMultiplier: 0.012
    },
    segmentMultipliers: {
      student: 1.25
    },
    items: [
      ["school_opening","学校开学","positive",3,8,[2,4]],
      ["exam_week","考试周","mixed",2,9,[3,6]],
      ["graduation_season","毕业季聚餐","positive",3,7,[3,6]],
      ["campus_festival","校园文化节","positive",4,6,[2,4]],
      ["winter_break","寒假开始","negative",3,6,[4,8]],
      ["summer_break","暑假开始","negative",4,5,[5,10]],
      ["orientation_week","新生报到周","positive",4,6,[3,6]],
      ["club_recruitment","社团招新活动","positive",2,8,[2,4]],
      ["scholarship_day","奖助发放期","positive",2,7,[2,4]],
      ["campus_sports_meet","校园运动会","positive",3,6,[2,3]]
    ]
  },
  {
    category: "office_cycle",
    districtWeights: DISTRICTS.office,
    channels: {
      demandMultiplier: 0.035,
      spendingMultiplier: 0.014
    },
    segmentMultipliers: {
      office_worker: 1.18
    },
    items: [
      ["office_holiday","写字楼集中休假","negative",4,7,[2,5]],
      ["payroll_week","发薪消费周","positive",2,10,[2,4]],
      ["quarter_end","季度冲刺期","positive",2,9,[3,5]],
      ["project_crunch","项目加班潮","positive",3,8,[3,6]],
      ["hiring_season","招聘旺季","positive",2,7,[3,5]],
      ["business_trip_wave","集中出差期","negative",2,6,[2,4]],
      ["remote_work_week","远程办公增加","negative",3,6,[3,6]],
      ["annual_meeting","企业年会季","positive",4,5,[3,7]],
      ["tax_filing_week","集中报税期","positive",2,6,[3,5]],
      ["year_end_close","年终结算期","mixed",3,5,[4,8]]
    ]
  },
  {
    category: "community",
    districtWeights: DISTRICTS.community,
    channels: {
      demandMultiplier: 0.032,
      playerAppealMultiplier: 0.012
    },
    segmentMultipliers: {
      resident: 1.16
    },
    items: [
      ["neighborhood_festival","商圈节庆活动","positive",4,9,[2,3]],
      ["community_market","社区市集","positive",3,9,[2,4]],
      ["family_weekend","亲子家庭周末","positive",2,10,[1,2]],
      ["senior_activity","社区长者活动","positive",2,7,[2,4]],
      ["night_market_open","夜市临时开放","mixed",3,7,[2,5]],
      ["residential_move_in","新住户集中入住","positive",3,6,[4,8]],
      ["local_sports_day","社区运动日","positive",2,8,[1,2]],
      ["charity_bazaar","公益市集","positive",2,7,[1,3]],
      ["banquet_wave","社区聚餐高峰","positive",3,7,[2,4]],
      ["neighborhood_cleanup","街区环境整治","mixed",2,8,[1,3]]
    ]
  },
  {
    category: "competition",
    districtWeights: DISTRICTS.competition,
    channels: {
      playerAppealMultiplier: 0.035,
      competitorPressureMultiplier: 0.035
    },
    items: [
      ["competitor_promotion","竞争店联合促销","negative",3,7,[2,4]],
      ["new_chain_opening","知名连锁新店开业","negative",4,5,[4,8]],
      ["price_war","商圈价格战","negative",4,5,[3,6]],
      ["rival_renovation","主要竞争店翻新","negative",2,7,[4,7]],
      ["rival_quality_upgrade","竞争店升级菜品","negative",3,6,[4,8]],
      ["rival_service_campaign","竞争店服务提升","negative",2,7,[3,6]],
      ["rival_delivery_subsidy","竞争店外卖补贴","negative",3,7,[2,5]],
      ["rival_media_buzz","竞争店媒体热度上升","negative",3,6,[2,4]],
      ["rival_closure","附近竞争店停业","positive",4,4,[4,10]],
      ["rival_expansion","竞争品牌新增分店","negative",4,4,[5,10]]
    ]
  },
  {
    category: "supply",
    districtWeights: DISTRICTS.supply,
    channels: {
      supplyPriceMultiplier: 0.035,
      deliveryTimeMultiplier: 0.018
    },
    items: [
      ["produce_shortage","蔬菜供应偏紧","negative",3,8,[3,6]],
      ["meat_price_spike","肉类采购价上涨","negative",4,6,[3,7]],
      ["seafood_abundance","水产集中到货","positive",3,7,[2,5]],
      ["grain_price_drop","主粮采购价回落","positive",2,8,[3,6]],
      ["cold_chain_delay","冷链配送延迟","negative",4,6,[2,4]],
      ["fresh_market_glut","生鲜市场供应充足","positive",3,8,[2,5]],
      ["oil_price_spike","食用油价格波动","negative",3,7,[3,6]],
      ["seasoning_shortage","调味品阶段缺货","negative",2,7,[2,5]],
      ["seasonal_harvest","应季食材丰收","positive",4,6,[4,8]],
      ["supplier_capacity_tight","供应商产能紧张","negative",3,7,[3,6]]
    ]
  },
  {
    category: "labor",
    districtWeights: DISTRICTS.labor,
    channels: {
      payrollCostMultiplier: 0.025,
      demandMultiplier: 0.006
    },
    items: [
      ["labor_shortage","餐饮用工紧张","negative",4,7,[4,8]],
      ["chef_recruitment_wave","厨师求职活跃","positive",3,6,[3,6]],
      ["wage_pressure","行业工资上涨","negative",3,8,[5,10]],
      ["student_part_time_supply","兼职学生增加","positive",2,8,[3,6]],
      ["holiday_staff_absence","假期员工缺勤增加","negative",3,6,[2,5]],
      ["training_grant","职业培训优惠期","positive",2,5,[4,8]],
      ["service_staff_surplus","服务员供给增加","positive",2,7,[3,6]],
      ["rider_labor_shortage","配送骑手用工紧张","negative",3,6,[2,5]],
      ["experienced_worker_return","熟练工求职增加","positive",3,5,[3,6]],
      ["local_hiring_fair","本地招聘会","positive",2,8,[2,4]]
    ]
  },
  {
    category: "equipment",
    districtWeights: DISTRICTS.equipment,
    channels: {
      equipmentFailureMultiplier: 0.035,
      operatingCostMultiplier: 0.012
    },
    items: [
      ["power_instability","供电波动","negative",4,5,[1,3]],
      ["gas_pressure_drop","燃气压力波动","negative",3,5,[1,3]],
      ["water_pressure_drop","供水压力波动","negative",2,6,[1,3]],
      ["refrigeration_stress","制冷设备高负荷","negative",3,7,[2,5]],
      ["service_discount","设备维保优惠期","positive",2,6,[3,6]],
      ["parts_shortage","维修配件短缺","negative",3,5,[3,6]],
      ["high_humidity_wear","高湿环境磨损","negative",2,6,[2,4]],
      ["low_temp_stress","低温设备负荷增加","negative",2,6,[2,4]],
      ["maintenance_campaign","集中保养活动","positive",3,5,[2,5]],
      ["utility_stability","公共能源供应稳定","positive",2,7,[3,6]]
    ]
  },
  {
    category: "compliance",
    districtWeights: DISTRICTS.compliance,
    channels: {
      playerAppealMultiplier: 0.012,
      operatingCostMultiplier: 0.012
    },
    items: [
      ["fire_inspection","消防安全检查期","mixed",3,6,[2,5]],
      ["food_safety_inspection","食品安全检查期","mixed",4,6,[2,5]],
      ["exhaust_inspection","排烟设施检查","mixed",3,5,[2,4]],
      ["waste_sorting_check","垃圾分类检查","mixed",2,6,[2,4]],
      ["license_review","经营证照复核","mixed",3,5,[2,5]],
      ["tax_compliance_week","财务合规检查周","mixed",2,5,[2,4]],
      ["price_label_check","明码标价检查","mixed",2,6,[1,3]],
      ["allergen_label_check","过敏原标识检查","mixed",2,5,[2,4]],
      ["delivery_hygiene_check","外卖卫生检查","mixed",3,6,[2,4]],
      ["noise_control","夜间噪声治理","negative",2,6,[2,5]]
    ]
  },
  {
    category: "reputation",
    districtWeights: DISTRICTS.reputation,
    channels: {
      playerAppealMultiplier: 0.035,
      demandMultiplier: 0.018
    },
    items: [
      ["local_media_feature","本地媒体餐饮专题","positive",3,7,[2,4]],
      ["viral_food_post","美食内容突然走红","positive",5,4,[2,5]],
      ["negative_review_wave","差评话题扩散","negative",4,5,[2,4]],
      ["influencer_visit","探店达人集中到访","positive",3,6,[1,3]],
      ["neighborhood_recommendation","邻里口碑推荐","positive",2,9,[3,6]],
      ["food_blogger_list","美食榜单讨论升温","positive",3,6,[2,5]],
      ["complaint_spike","消费投诉关注上升","negative",3,5,[2,4]],
      ["charity_praise","公益行为获得好评","positive",2,6,[2,4]],
      ["service_story","服务故事引发传播","positive",3,6,[2,4]],
      ["menu_trend","特色菜话题升温","positive",2,7,[3,5]]
    ]
  },
  {
    category: "cost",
    districtWeights: DISTRICTS.cost,
    channels: {
      operatingCostMultiplier: 0.03,
      spendingMultiplier: 0.006
    },
    items: [
      ["energy_price_rise","能源费用上涨","negative",4,7,[5,10]],
      ["energy_price_drop","能源费用回落","positive",3,6,[5,10]],
      ["water_tariff_adjustment","用水费用调整","negative",2,7,[4,8]],
      ["waste_fee_rise","垃圾处理费上涨","negative",2,6,[4,8]],
      ["packaging_cost_rise","包装耗材涨价","negative",3,7,[3,6]],
      ["cleaning_supply_discount","清洁用品降价","positive",2,7,[3,6]],
      ["seasonal_utility_peak","季节性能源高峰","negative",3,7,[5,10]],
      ["local_business_subsidy","经营成本补贴期","positive",3,4,[4,8]],
      ["insurance_fee_cycle","经营保险续费期","negative",2,4,[2,4]],
      ["service_fee_discount","物业服务费优惠","positive",2,5,[4,8]]
    ]
  },
  {
    category: "delivery",
    districtWeights: DISTRICTS.delivery,
    channels: {
      demandMultiplier: 0.02,
      deliveryTimeMultiplier: 0.035
    },
    segmentMultipliers: {
      delivery_heavy: 1.2
    },
    items: [
      ["delivery_platform_campaign","外卖平台流量活动","positive",4,7,[2,5]],
      ["delivery_rider_shortage","配送运力不足","negative",4,6,[2,5]],
      ["platform_outage","外卖平台短时故障","negative",5,3,[1,2]],
      ["rain_delivery_bonus","雨天外卖需求增加","mixed",3,8,[1,3]],
      ["pickup_demand_rise","到店自取需求增加","positive",2,8,[2,4]],
      ["office_group_order","企业团餐订单增加","positive",3,7,[2,5]],
      ["late_night_delivery_boom","夜间外卖需求增加","positive",3,7,[2,5]],
      ["delivery_zone_adjustment","配送范围调整","mixed",2,6,[3,6]],
      ["platform_rating_push","平台评分曝光增加","positive",2,6,[3,5]],
      ["dispatch_optimization","配送调度优化","positive",3,6,[3,6]]
    ]
  },
  {
    category: "opportunity",
    districtWeights: DISTRICTS.opportunity,
    channels: {
      demandMultiplier: 0.03,
      spendingMultiplier: 0.015,
      playerAppealMultiplier: 0.015
    },
    items: [
      ["tourism_campaign","城市文旅活动","positive",4,6,[3,7]],
      ["district_coupon","商圈消费券活动","positive",4,6,[3,6]],
      ["new_office_opening","大型办公项目启用","positive",3,5,[5,10]],
      ["new_residential_phase","新住宅集中交付","positive",3,5,[6,12]],
      ["convention_contract","会展餐饮需求增加","positive",4,5,[2,5]],
      ["corporate_catering_lead","企业团餐需求释放","positive",3,6,[3,6]],
      ["wedding_catering_wave","婚礼餐饮需求增加","positive",3,6,[3,6]],
      ["campus_catering_opportunity","校园团体餐需求增加","positive",3,5,[3,6]],
      ["festival_pop_up","节庆快闪经营机会","positive",3,7,[2,5]],
      ["cross_brand_collab","跨品牌联动热潮","positive",3,6,[3,6]]
    ]
  }
];

const LEGACY_MODIFIERS = Object.freeze({
  convention: {
    demandMultiplier: 1.18,
    spendingMultiplier: 1.08,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      office_worker: 1.15,
      tourist: 1.4
    }
  },
  road_construction: {
    demandMultiplier: 0.78,
    spendingMultiplier: 1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1.14,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      tourist: 0.8
    }
  },
  severe_weather: {
    demandMultiplier: 0.78,
    spendingMultiplier: 1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1.04,
    deliveryTimeMultiplier: 1.16,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1.1,
    operatingCostMultiplier: 1.06,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      tourist: 0.65,
      office_worker: 0.9,
      student: 0.9
    }
  },
  school_opening: {
    demandMultiplier: 1.06,
    spendingMultiplier: 1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      student: 1.45,
      resident: 1.05
    }
  },
  office_holiday: {
    demandMultiplier: 0.95,
    spendingMultiplier: 1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      office_worker: 0.45,
      resident: 1.08,
      tourist: 1.1
    }
  },
  neighborhood_festival: {
    demandMultiplier: 1.22,
    spendingMultiplier: 1.1,
    playerAppealMultiplier: 1,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1,
    segmentMultipliers: {
      resident: 1.2,
      tourist: 1.35
    }
  },
  competitor_promotion: {
    demandMultiplier: 0.96,
    spendingMultiplier: 1,
    playerAppealMultiplier: 0.9,
    supplyPriceMultiplier: 1,
    deliveryTimeMultiplier: 1,
    payrollCostMultiplier: 1,
    equipmentFailureMultiplier: 1,
    operatingCostMultiplier: 1,
    competitorPressureMultiplier: 1.12,
    segmentMultipliers: {}
  }
});

const records = [];

for (const family of FAMILIES) {
  for (
    const [
      id,
      name,
      polarity,
      severity,
      weight,
      days
    ]
    of family.items
  ) {
    records.push(
      event({
        id,
        name,
        category:
          family.category,
        polarity,
        severity,
        weight,
        days,
        description:
          `${name}正在影响当前商圈的餐饮经营环境。`,
        districtWeights:
          family.districtWeights,
        seasonWeights:
          ALL_SEASONS,
        channels:
          family.channels,
        segmentMultipliers:
          family.segmentMultipliers ??
          {},
        modifiers:
          LEGACY_MODIFIERS[id]
            ? Object.freeze({
                ...LEGACY_MODIFIERS[id],
                segmentMultipliers:
                  freezeMap(
                    LEGACY_MODIFIERS[id]
                      .segmentMultipliers
                  )
              })
            : null
      })
    );
  }
}

export const RANDOM_EVENTS_V1 =
  Object.freeze(records);

export const RANDOM_EVENT_DATASET_META =
  Object.freeze({
    schemaVersion:
      RANDOM_EVENT_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total:
      RANDOM_EVENTS_V1.length,
    categories:
      15,
    legacyIdsPreserved:
      7
  });
