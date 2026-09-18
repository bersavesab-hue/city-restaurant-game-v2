const AWARD_PERIODS =
  Object.freeze({
    monthly: {
      id: "monthly",
      name: "月度",
      days: 30,
      prestige: 1
    },

    quarterly: {
      id: "quarterly",
      name: "季度",
      days: 90,
      prestige: 2
    },

    annual: {
      id: "annual",
      name: "年度",
      days: 360,
      prestige: 3
    }
  });


const AWARD_DIVISIONS =
  Object.freeze({
    competition: "市场竞争",
    business: "经营表现",
    customer: "顾客口碑",
    service: "服务品质",
    dish: "菜品荣誉",
    innovation: "研发创新",
    employee: "员工荣誉",
    team: "团队与成长"
  });


function award({
  id,
  name,
  period,
  division,
  subject,
  scope,
  metric,
  description,
  finalistCount = 3,
  minOperatingDays = 0,
  minOrders = 0,
  minQuantity = 0,
  minWorkMinutes = 0,
  roleIds = null,
  customOnly = false,
  maxAgeDays = null,
  prestige = null,
  reputationReward = null,
  experienceReward = null
}) {
  const periodConfig =
    AWARD_PERIODS[
      period
    ];


  return Object.freeze({
    id,
    name,
    period,
    division,
    subject,
    scope,
    metric,
    description,

    finalistCount,

    eligibility: {
      minOperatingDays,
      minOrders,
      minQuantity,
      minWorkMinutes,
      roleIds,
      customOnly,
      maxAgeDays
    },

    prestige:
      prestige ??
      periodConfig.prestige,

    reward: {
      reputation:
        reputationReward ??
        (
          period === "annual"
            ? 10
            : period === "quarterly"
              ? 5
              : 2
        ),

      experience:
        experienceReward ??
        (
          period === "annual"
            ? 900
            : period === "quarterly"
              ? 400
              : 120
        )
    }
  });
}


const AWARD_DEFINITIONS =
  Object.freeze([
    // ======================================================
    // 月度 · 市场 / 经营 / 顾客
    // ======================================================

    award({
      id: "monthly_district_popularity",
      name: "月度商圈人气餐厅",
      period: "monthly",
      division: "competition",
      subject: "restaurant",
      scope: "district",
      metric: "marketShare",
      description: "按本商圈市场份额评选当月最具人气餐厅",
      minOperatingDays: 3
    }),

    award({
      id: "monthly_district_reputation",
      name: "月度商圈口碑餐厅",
      period: "monthly",
      division: "customer",
      subject: "restaurant",
      scope: "district",
      metric: "reputationScore",
      description: "综合门店声望与顾客评价评选",
      minOperatingDays: 3
    }),

    award({
      id: "monthly_district_service",
      name: "月度商圈服务之星",
      period: "monthly",
      division: "service",
      subject: "restaurant",
      scope: "district",
      metric: "serviceScore",
      description: "比较顾客服务体验与竞争店服务能力",
      minOperatingDays: 3
    }),

    award({
      id: "monthly_district_quality",
      name: "月度商圈品质之星",
      period: "monthly",
      division: "service",
      subject: "restaurant",
      scope: "district",
      metric: "qualityScore",
      description: "按菜品出品质量与竞争店品质水平评选",
      minOperatingDays: 3
    }),

    award({
      id: "monthly_revenue_star",
      name: "月度营收之星",
      period: "monthly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "revenue",
      description: "玩家旗下门店月度营业额排名",
      minOperatingDays: 5,
      minOrders: 20
    }),

    award({
      id: "monthly_profit_star",
      name: "月度盈利之星",
      period: "monthly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profit",
      description: "玩家旗下门店月度经营利润排名",
      minOperatingDays: 5,
      minOrders: 20
    }),

    award({
      id: "monthly_profit_margin",
      name: "月度经营效率奖",
      period: "monthly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profitMargin",
      description: "在达到最低订单量后按经营利润率评选",
      minOperatingDays: 5,
      minOrders: 30
    }),

    award({
      id: "monthly_customer_favorite",
      name: "月度顾客最爱餐厅",
      period: "monthly",
      division: "customer",
      subject: "restaurant",
      scope: "player",
      metric: "customerScore",
      description: "综合满意度、评价与复购表现评选",
      minOperatingDays: 5,
      minOrders: 20
    }),

    award({
      id: "monthly_growth_star",
      name: "月度成长之星",
      period: "monthly",
      division: "team",
      subject: "restaurant",
      scope: "player",
      metric: "experienceGained",
      description: "按本月经营经验增长评选",
      minOperatingDays: 5
    }),

    // ======================================================
    // 月度 · 菜品
    // ======================================================

    award({
      id: "monthly_hot_dish",
      name: "月度热销菜",
      period: "monthly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "quantity",
      description: "按当月实际售出份数评选",
      minQuantity: 10
    }),

    award({
      id: "monthly_revenue_dish",
      name: "月度吸金菜品",
      period: "monthly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "revenue",
      description: "按当月菜品营业额评选",
      minQuantity: 10
    }),

    award({
      id: "monthly_profit_dish",
      name: "月度利润菜品",
      period: "monthly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "contributionProfit",
      description: "按菜品贡献利润评选",
      minQuantity: 10
    }),

    award({
      id: "monthly_quality_dish",
      name: "月度品质菜品",
      period: "monthly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "averageQuality",
      description: "按真实订单出品质量评选",
      minQuantity: 10
    }),

    award({
      id: "monthly_new_dish",
      name: "月度新锐菜品",
      period: "monthly",
      division: "innovation",
      subject: "dish",
      scope: "restaurant",
      metric: "innovationScore",
      description: "仅限自主研发新菜，综合品质、销量与研发成长",
      minQuantity: 5,
      customOnly: true,
      maxAgeDays: 30
    }),

    // ======================================================
    // 月度 · 员工
    // ======================================================

    award({
      id: "monthly_chef_star",
      name: "月度厨师之星",
      period: "monthly",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "craftScore",
      description: "综合厨艺、经验、工时、状态与忠诚度评选",
      minWorkMinutes: 300,
      roleIds: ["chef", "kitchen_assistant"]
    }),

    award({
      id: "monthly_service_star",
      name: "月度服务明星",
      period: "monthly",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "serviceScore",
      description: "综合服务技能、工时、情绪与忠诚度评选",
      minWorkMinutes: 300,
      roleIds: ["server", "cashier"]
    }),

    award({
      id: "monthly_employee_growth",
      name: "月度员工成长奖",
      period: "monthly",
      division: "team",
      subject: "employee",
      scope: "restaurant",
      metric: "growthScore",
      description: "综合经验、培训与晋升成长评选",
      minWorkMinutes: 180
    }),

    // ======================================================
    // 季度 · 门店与市场
    // ======================================================

    award({
      id: "quarter_district_champion",
      name: "季度商圈冠军",
      period: "quarterly",
      division: "competition",
      subject: "restaurant",
      scope: "district",
      metric: "competitiveScore",
      description: "综合市场份额、口碑、服务与品质评选商圈冠军",
      minOperatingDays: 20,
      finalistCount: 5
    }),

    award({
      id: "quarter_city_brand",
      name: "季度城市品牌榜首",
      period: "quarterly",
      division: "competition",
      subject: "restaurant",
      scope: "city",
      metric: "brandScore",
      description: "全城玩家门店与NPC竞争店共同参评",
      minOperatingDays: 20,
      finalistCount: 5
    }),

    award({
      id: "quarter_revenue",
      name: "季度营收大奖",
      period: "quarterly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "revenue",
      description: "按季度营业额评选玩家旗下门店",
      minOperatingDays: 20,
      minOrders: 80
    }),

    award({
      id: "quarter_profit",
      name: "季度利润大奖",
      period: "quarterly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profit",
      description: "按季度经营利润评选",
      minOperatingDays: 20,
      minOrders: 80
    }),

    award({
      id: "quarter_profit_margin",
      name: "季度精益经营奖",
      period: "quarterly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profitMargin",
      description: "兼顾样本量后按利润率评选",
      minOperatingDays: 20,
      minOrders: 100
    }),

    award({
      id: "quarter_customer_choice",
      name: "季度顾客选择奖",
      period: "quarterly",
      division: "customer",
      subject: "restaurant",
      scope: "player",
      metric: "customerScore",
      description: "综合满意度、评价分与复购率评选",
      minOperatingDays: 20,
      minOrders: 80
    }),

    award({
      id: "quarter_repeat_rate",
      name: "季度复购王",
      period: "quarterly",
      division: "customer",
      subject: "restaurant",
      scope: "player",
      metric: "repeatRate",
      description: "按顾客复购率评选",
      minOperatingDays: 20,
      minOrders: 80
    }),

    award({
      id: "quarter_service",
      name: "季度卓越服务奖",
      period: "quarterly",
      division: "service",
      subject: "restaurant",
      scope: "district",
      metric: "serviceScore",
      description: "玩家门店与商圈竞争店共同参评",
      minOperatingDays: 20,
      finalistCount: 5
    }),

    award({
      id: "quarter_quality",
      name: "季度卓越品质奖",
      period: "quarterly",
      division: "service",
      subject: "restaurant",
      scope: "district",
      metric: "qualityScore",
      description: "按餐食品质表现评选",
      minOperatingDays: 20,
      finalistCount: 5
    }),

    award({
      id: "quarter_supply_efficiency",
      name: "季度成本控制奖",
      period: "quarterly",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "costEfficiency",
      description: "在保证经营规模基础上按食材成本效率评选",
      minOperatingDays: 20,
      minOrders: 100
    }),

    award({
      id: "quarter_team_stability",
      name: "季度最佳稳定团队",
      period: "quarterly",
      division: "team",
      subject: "restaurant",
      scope: "player",
      metric: "teamScore",
      description: "综合员工忠诚度、情绪、疲劳与人员稳定性评选",
      minOperatingDays: 20
    }),

    // ======================================================
    // 季度 · 菜品与员工
    // ======================================================

    award({
      id: "quarter_signature_dish",
      name: "季度招牌菜",
      period: "quarterly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "signatureScore",
      description: "综合销量、营业额、贡献利润与品质评选",
      minQuantity: 30
    }),

    award({
      id: "quarter_innovation_dish",
      name: "季度创新菜",
      period: "quarterly",
      division: "innovation",
      subject: "dish",
      scope: "restaurant",
      metric: "innovationScore",
      description: "自主研发菜品专属，重视质量、成长和市场表现",
      minQuantity: 15,
      customOnly: true,
      maxAgeDays: 90
    }),

    award({
      id: "quarter_margin_dish",
      name: "季度高效菜品",
      period: "quarterly",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "marginScore",
      description: "综合毛利率和销量，避免低样本虚高",
      minQuantity: 30
    }),

    award({
      id: "quarter_chef",
      name: "季度金勺厨师",
      period: "quarterly",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "craftScore",
      description: "厨师与后厨岗位季度综合荣誉",
      minWorkMinutes: 1200,
      roleIds: ["chef", "kitchen_assistant"]
    }),

    award({
      id: "quarter_service_employee",
      name: "季度金牌服务员工",
      period: "quarterly",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "serviceScore",
      description: "服务与收银岗位季度综合荣誉",
      minWorkMinutes: 1200,
      roleIds: ["server", "cashier"]
    }),

    award({
      id: "quarter_manager",
      name: "季度管理之星",
      period: "quarterly",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "leadershipScore",
      description: "经理岗位综合能力、忠诚度与经验评选",
      minWorkMinutes: 1200,
      roleIds: ["manager"]
    }),

    award({
      id: "quarter_employee_growth",
      name: "季度人才成长奖",
      period: "quarterly",
      division: "team",
      subject: "employee",
      scope: "restaurant",
      metric: "growthScore",
      description: "按培训、晋升、经验与技能成长表现评选",
      minWorkMinutes: 900
    }),

    // ======================================================
    // 年度 · 顶级餐厅荣誉
    // ======================================================

    award({
      id: "annual_restaurant_of_year",
      name: "年度餐厅",
      period: "annual",
      division: "competition",
      subject: "restaurant",
      scope: "city",
      metric: "brandScore",
      description: "全城最高级别综合餐厅荣誉",
      minOperatingDays: 90,
      finalistCount: 8,
      prestige: 5,
      reputationReward: 25,
      experienceReward: 2500
    }),

    award({
      id: "annual_district_champion",
      name: "年度商圈冠军",
      period: "annual",
      division: "competition",
      subject: "restaurant",
      scope: "district",
      metric: "competitiveScore",
      description: "全年商圈综合竞争力最高的餐厅",
      minOperatingDays: 90,
      finalistCount: 5,
      prestige: 4
    }),

    award({
      id: "annual_brand",
      name: "年度品牌影响力餐厅",
      period: "annual",
      division: "competition",
      subject: "restaurant",
      scope: "city",
      metric: "reputationScore",
      description: "全城玩家门店与NPC共同参评品牌影响力",
      minOperatingDays: 90,
      finalistCount: 8,
      prestige: 4
    }),

    award({
      id: "annual_best_new_store",
      name: "年度最佳新店",
      period: "annual",
      division: "competition",
      subject: "restaurant",
      scope: "city",
      metric: "competitiveScore",
      description: "开业不满一年的餐厅共同角逐",
      minOperatingDays: 30,
      maxAgeDays: 360,
      finalistCount: 5,
      prestige: 4
    }),

    award({
      id: "annual_revenue",
      name: "年度营收王",
      period: "annual",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "revenue",
      description: "全年营业额最高的玩家门店",
      minOperatingDays: 90,
      minOrders: 300,
      prestige: 4
    }),

    award({
      id: "annual_profit",
      name: "年度盈利王",
      period: "annual",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profit",
      description: "全年经营利润最高的玩家门店",
      minOperatingDays: 90,
      minOrders: 300,
      prestige: 4
    }),

    award({
      id: "annual_profit_margin",
      name: "年度卓越经营效率奖",
      period: "annual",
      division: "business",
      subject: "restaurant",
      scope: "player",
      metric: "profitMargin",
      description: "在足够经营规模下评选最佳利润效率",
      minOperatingDays: 90,
      minOrders: 400,
      prestige: 4
    }),

    award({
      id: "annual_customer_choice",
      name: "年度顾客之选",
      period: "annual",
      division: "customer",
      subject: "restaurant",
      scope: "player",
      metric: "customerScore",
      description: "综合满意度、复购与评价的顾客大奖",
      minOperatingDays: 90,
      minOrders: 300,
      prestige: 4
    }),

    award({
      id: "annual_reputation",
      name: "年度最佳口碑餐厅",
      period: "annual",
      division: "customer",
      subject: "restaurant",
      scope: "district",
      metric: "reputationScore",
      description: "玩家与NPC竞争店共同评选年度口碑",
      minOperatingDays: 90,
      prestige: 4
    }),

    award({
      id: "annual_repeat",
      name: "年度回头客之王",
      period: "annual",
      division: "customer",
      subject: "restaurant",
      scope: "player",
      metric: "repeatRate",
      description: "全年顾客复购表现最佳门店",
      minOperatingDays: 90,
      minOrders: 300,
      prestige: 4
    }),

    award({
      id: "annual_service",
      name: "年度最佳服务餐厅",
      period: "annual",
      division: "service",
      subject: "restaurant",
      scope: "city",
      metric: "serviceScore",
      description: "全城服务体验最高级别荣誉",
      minOperatingDays: 90,
      prestige: 4
    }),

    award({
      id: "annual_quality",
      name: "年度最佳品质餐厅",
      period: "annual",
      division: "service",
      subject: "restaurant",
      scope: "city",
      metric: "qualityScore",
      description: "全城菜品品质最高级别荣誉",
      minOperatingDays: 90,
      prestige: 4
    }),

    award({
      id: "annual_growth",
      name: "年度成长餐厅",
      period: "annual",
      division: "team",
      subject: "restaurant",
      scope: "player",
      metric: "experienceGained",
      description: "按全年经营成长与经验积累评选",
      minOperatingDays: 60,
      prestige: 3
    }),

    award({
      id: "annual_team",
      name: "年度最佳团队",
      period: "annual",
      division: "team",
      subject: "restaurant",
      scope: "player",
      metric: "teamScore",
      description: "综合忠诚度、情绪、人员稳定与疲劳管理评选",
      minOperatingDays: 90,
      prestige: 4
    }),

    award({
      id: "annual_local_legend",
      name: "年度城市烟火传奇",
      period: "annual",
      division: "competition",
      subject: "restaurant",
      scope: "city",
      metric: "legendScore",
      description: "兼顾经营年限、品牌声望、服务与品质的长期荣誉",
      minOperatingDays: 120,
      finalistCount: 8,
      prestige: 5,
      reputationReward: 30,
      experienceReward: 3000
    }),

    // ======================================================
    // 年度 · 菜品
    // ======================================================

    award({
      id: "annual_signature_dish",
      name: "年度招牌菜",
      period: "annual",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "signatureScore",
      description: "全年销量、收入、利润与品质综合最高菜品",
      minQuantity: 100,
      prestige: 4
    }),

    award({
      id: "annual_best_selling_dish",
      name: "年度热销菜王",
      period: "annual",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "quantity",
      description: "全年累计销售份数最高菜品",
      minQuantity: 100,
      prestige: 3
    }),

    award({
      id: "annual_profit_dish",
      name: "年度黄金菜品",
      period: "annual",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "contributionProfit",
      description: "全年为门店贡献利润最高菜品",
      minQuantity: 100,
      prestige: 4
    }),

    award({
      id: "annual_quality_dish",
      name: "年度品质菜品",
      period: "annual",
      division: "dish",
      subject: "dish",
      scope: "restaurant",
      metric: "averageQuality",
      description: "全年稳定出品质量最高菜品",
      minQuantity: 100,
      prestige: 4
    }),

    award({
      id: "annual_innovation_dish",
      name: "年度最佳创新菜",
      period: "annual",
      division: "innovation",
      subject: "dish",
      scope: "restaurant",
      metric: "innovationScore",
      description: "自主研发菜品年度最高荣誉",
      minQuantity: 50,
      customOnly: true,
      maxAgeDays: 360,
      prestige: 5,
      reputationReward: 15,
      experienceReward: 1500
    }),

    // ======================================================
    // 年度 · 员工
    // ======================================================

    award({
      id: "annual_chef",
      name: "年度厨师",
      period: "annual",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "craftScore",
      description: "厨师与后厨岗位年度最高个人荣誉",
      minWorkMinutes: 5000,
      roleIds: ["chef", "kitchen_assistant"],
      prestige: 5
    }),

    award({
      id: "annual_service_employee",
      name: "年度服务员工",
      period: "annual",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "serviceScore",
      description: "服务与收银岗位年度最高个人荣誉",
      minWorkMinutes: 5000,
      roleIds: ["server", "cashier"],
      prestige: 5
    }),

    award({
      id: "annual_manager",
      name: "年度店长",
      period: "annual",
      division: "employee",
      subject: "employee",
      scope: "restaurant",
      metric: "leadershipScore",
      description: "经理岗位年度最高个人荣誉",
      minWorkMinutes: 5000,
      roleIds: ["manager"],
      prestige: 5
    }),

    award({
      id: "annual_employee_growth",
      name: "年度人才成长奖",
      period: "annual",
      division: "team",
      subject: "employee",
      scope: "restaurant",
      metric: "growthScore",
      description: "全年培训、晋升、经验和技能成长综合评选",
      minWorkMinutes: 3000,
      prestige: 4
    }),

    award({
      id: "annual_loyal_employee",
      name: "年度忠诚员工",
      period: "annual",
      division: "team",
      subject: "employee",
      scope: "restaurant",
      metric: "loyaltyScore",
      description: "兼顾忠诚度、工时与长期贡献评选",
      minWorkMinutes: 3000,
      prestige: 3
    })
  ]);


const AWARD_DEFINITION_MAP =
  Object.freeze(
    Object.fromEntries(
      AWARD_DEFINITIONS.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );


export {
  AWARD_PERIODS,
  AWARD_DIVISIONS,
  AWARD_DEFINITIONS,
  AWARD_DEFINITION_MAP
};
