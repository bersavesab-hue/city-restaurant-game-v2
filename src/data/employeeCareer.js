import {
  EMPLOYEE_CAREER_SCHEMA_VERSION,
  TRAINING_CATEGORY
} from "./employeeCareerRules.js";

export const EMPLOYEE_CAREER_DATASET_META =
  Object.freeze({
    schemaVersion:
      EMPLOYEE_CAREER_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    roles: 7,
    careerRanks: 5,
    trainingPrograms: 20,
    legacyTrainingIdsPreserved: [
      "basic_training",
      "role_drill",
      "advanced_workshop"
    ]
  });

export const EMPLOYEE_CAREER_RANKS =
  Object.freeze([
    Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "apprentice",
      name: "学徒",
      order: 0,
      minExperience: 0,
      minWorkMinutes: 0,
      minPrimarySkill: 0,
      minLoyalty: 0,
      salaryMultiplier: 1
    }),
    Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "skilled",
      name: "熟手",
      order: 1,
      minExperience: 400,
      minWorkMinutes: 1200,
      minPrimarySkill: 35,
      minLoyalty: 35,
      salaryMultiplier: 1.08
    }),
    Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "core",
      name: "骨干",
      order: 2,
      minExperience: 1200,
      minWorkMinutes: 6000,
      minPrimarySkill: 50,
      minLoyalty: 45,
      salaryMultiplier: 1.18
    }),
    Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "expert",
      name: "名手",
      order: 3,
      minExperience: 2800,
      minWorkMinutes: 18000,
      minPrimarySkill: 68,
      minLoyalty: 55,
      salaryMultiplier: 1.35
    }),
    Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "master",
      name: "大师",
      order: 4,
      minExperience: 5200,
      minWorkMinutes: 42000,
      minPrimarySkill: 82,
      minLoyalty: 65,
      salaryMultiplier: 1.6
    })
  ]);

function program({
  id,
  name,
  category,
  roleIds = [],
  minRank = "apprentice",
  cost,
  experience,
  primarySkillGain,
  secondarySkillGain,
  fatigueGain,
  moodGain = 0,
  loyaltyGain = 0,
  focusSkillGains = {}
}) {
  return Object.freeze({
    schemaVersion:
      EMPLOYEE_CAREER_SCHEMA_VERSION,
    id,
    name,
    category,
    roleIds: Object.freeze([
      ...roleIds
    ]),
    minRank,
    cost,
    experience,
    primarySkillGain,
    secondarySkillGain,
    fatigueGain,
    moodGain,
    loyaltyGain,
    focusSkillGains:
      Object.freeze({
        ...focusSkillGains
      })
  });
}

export const EMPLOYEE_TRAINING_PROGRAMS =
  Object.freeze({
    basic_training: program({
      id: "basic_training",
      name: "基础岗位训练",
      category:
        TRAINING_CATEGORY.GENERAL,
      cost: 600,
      experience: 120,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 6,
      moodGain: 1
    }),

    role_drill: program({
      id: "role_drill",
      name: "岗位强化训练",
      category:
        TRAINING_CATEGORY.GENERAL,
      cost: 1200,
      experience: 220,
      primarySkillGain: 6,
      secondarySkillGain: 2,
      fatigueGain: 10,
      moodGain: 1,
      loyaltyGain: 1
    }),

    advanced_workshop: program({
      id: "advanced_workshop",
      name: "高级技能研修",
      category:
        TRAINING_CATEGORY.GENERAL,
      minRank: "core",
      cost: 2600,
      experience: 420,
      primarySkillGain: 8,
      secondarySkillGain: 4,
      fatigueGain: 14,
      moodGain: 2,
      loyaltyGain: 2
    }),

    peak_operation: program({
      id: "peak_operation",
      name: "高峰运营演练",
      category:
        TRAINING_CATEGORY.OPERATIONS,
      minRank: "skilled",
      cost: 1500,
      experience: 240,
      primarySkillGain: 4,
      secondarySkillGain: 2,
      fatigueGain: 11,
      moodGain: 1,
      focusSkillGains: {
        peakPressure: 4,
        speed: 2,
        kitchenSpeed: 2,
        servingSpeed: 2
      }
    }),

    team_collaboration: program({
      id: "team_collaboration",
      name: "跨岗位协作训练",
      category:
        TRAINING_CATEGORY.OPERATIONS,
      minRank: "skilled",
      cost: 1300,
      experience: 180,
      primarySkillGain: 3,
      secondarySkillGain: 2,
      fatigueGain: 7,
      moodGain: 3,
      loyaltyGain: 2
    }),

    food_service_safety: program({
      id: "food_service_safety",
      name: "食品与服务安全",
      category:
        TRAINING_CATEGORY.COMPLIANCE,
      cost: 900,
      experience: 140,
      primarySkillGain: 2,
      secondarySkillGain: 1,
      fatigueGain: 5,
      loyaltyGain: 1,
      focusSkillGains: {
        hygiene: 4,
        cleanliness: 4,
        compliance: 4,
        care: 2,
        stability: 2
      }
    }),

    chef_flavor_control: program({
      id: "chef_flavor_control",
      name: "厨师·风味与出品",
      category:
        TRAINING_CATEGORY.KITCHEN,
      roleIds: [
        "chef"
      ],
      minRank: "skilled",
      cost: 1800,
      experience: 260,
      primarySkillGain: 5,
      secondarySkillGain: 1,
      fatigueGain: 10,
      moodGain: 2,
      focusSkillGains: {
        quality: 5,
        innovation: 3
      }
    }),

    chef_speed_control: program({
      id: "chef_speed_control",
      name: "厨师·高峰出餐",
      category:
        TRAINING_CATEGORY.KITCHEN,
      roleIds: [
        "chef"
      ],
      minRank: "skilled",
      cost: 1700,
      experience: 240,
      primarySkillGain: 4,
      secondarySkillGain: 2,
      fatigueGain: 12,
      focusSkillGains: {
        speed: 5,
        stability: 3,
        wasteControl: 2
      }
    }),

    server_guest_care: program({
      id: "server_guest_care",
      name: "服务员·顾客照护",
      category:
        TRAINING_CATEGORY.SERVICE,
      roleIds: [
        "server"
      ],
      minRank: "apprentice",
      cost: 1000,
      experience: 180,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 6,
      moodGain: 2,
      focusSkillGains: {
        guestCare: 5
      }
    }),

    server_table_turn: program({
      id: "server_table_turn",
      name: "服务员·翻台与高峰",
      category:
        TRAINING_CATEGORY.SERVICE,
      roleIds: [
        "server"
      ],
      minRank: "skilled",
      cost: 1400,
      experience: 220,
      primarySkillGain: 4,
      secondarySkillGain: 2,
      fatigueGain: 9,
      focusSkillGains: {
        tableTurn: 5,
        servingSpeed: 4,
        peakPressure: 3
      }
    }),

    cashier_accuracy: program({
      id: "cashier_accuracy",
      name: "收银员·准确与规范",
      category:
        TRAINING_CATEGORY.SERVICE,
      roleIds: [
        "cashier"
      ],
      minRank: "apprentice",
      cost: 900,
      experience: 160,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 5,
      focusSkillGains: {
        accuracy: 5,
        compliance: 4
      }
    }),

    cashier_upselling: program({
      id: "cashier_upselling",
      name: "收银员·推荐销售",
      category:
        TRAINING_CATEGORY.SERVICE,
      roleIds: [
        "cashier"
      ],
      minRank: "skilled",
      cost: 1300,
      experience: 200,
      primarySkillGain: 3,
      secondarySkillGain: 2,
      fatigueGain: 7,
      moodGain: 1,
      focusSkillGains: {
        upselling: 6,
        speed: 2
      }
    }),

    kitchen_prep_efficiency: program({
      id: "kitchen_prep_efficiency",
      name: "后厨·备餐效率",
      category:
        TRAINING_CATEGORY.KITCHEN,
      roleIds: [
        "kitchen_assistant"
      ],
      minRank: "apprentice",
      cost: 950,
      experience: 180,
      primarySkillGain: 5,
      secondarySkillGain: 1,
      fatigueGain: 7,
      focusSkillGains: {
        kitchenSpeed: 5,
        cleanliness: 2
      }
    }),

    kitchen_waste_control: program({
      id: "kitchen_waste_control",
      name: "后厨·损耗控制",
      category:
        TRAINING_CATEGORY.KITCHEN,
      roleIds: [
        "kitchen_assistant"
      ],
      minRank: "skilled",
      cost: 1350,
      experience: 210,
      primarySkillGain: 3,
      secondarySkillGain: 2,
      fatigueGain: 7,
      focusSkillGains: {
        wasteControl: 6,
        stability: 3
      }
    }),

    cleaner_hygiene: program({
      id: "cleaner_hygiene",
      name: "保洁·卫生标准",
      category:
        TRAINING_CATEGORY.COMPLIANCE,
      roleIds: [
        "cleaner"
      ],
      minRank: "apprentice",
      cost: 800,
      experience: 150,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 6,
      focusSkillGains: {
        hygiene: 6
      }
    }),

    cleaner_inspection: program({
      id: "cleaner_inspection",
      name: "保洁·巡检与效率",
      category:
        TRAINING_CATEGORY.COMPLIANCE,
      roleIds: [
        "cleaner"
      ],
      minRank: "skilled",
      cost: 1100,
      experience: 190,
      primarySkillGain: 3,
      secondarySkillGain: 2,
      fatigueGain: 7,
      focusSkillGains: {
        inspection: 6,
        efficiency: 4
      }
    }),

    delivery_route: program({
      id: "delivery_route",
      name: "配送员·路线优化",
      category:
        TRAINING_CATEGORY.OPERATIONS,
      roleIds: [
        "delivery"
      ],
      minRank: "apprentice",
      cost: 1000,
      experience: 180,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 7,
      focusSkillGains: {
        route: 6,
        punctuality: 3
      }
    }),

    delivery_care: program({
      id: "delivery_care",
      name: "配送员·准时与保护",
      category:
        TRAINING_CATEGORY.OPERATIONS,
      roleIds: [
        "delivery"
      ],
      minRank: "skilled",
      cost: 1350,
      experience: 220,
      primarySkillGain: 3,
      secondarySkillGain: 2,
      fatigueGain: 8,
      focusSkillGains: {
        care: 5,
        punctuality: 5,
        peakPressure: 2
      }
    }),

    manager_scheduling: program({
      id: "manager_scheduling",
      name: "店长·排班与士气",
      category:
        TRAINING_CATEGORY.MANAGEMENT,
      roleIds: [
        "manager"
      ],
      minRank: "skilled",
      cost: 1800,
      experience: 260,
      primarySkillGain: 4,
      secondarySkillGain: 2,
      fatigueGain: 8,
      moodGain: 2,
      loyaltyGain: 2,
      focusSkillGains: {
        scheduling: 6,
        morale: 4
      }
    }),

    manager_cost_control: program({
      id: "manager_cost_control",
      name: "店长·成本与执行",
      category:
        TRAINING_CATEGORY.MANAGEMENT,
      roleIds: [
        "manager"
      ],
      minRank: "core",
      cost: 2400,
      experience: 360,
      primarySkillGain: 5,
      secondarySkillGain: 3,
      fatigueGain: 10,
      loyaltyGain: 2,
      focusSkillGains: {
        costControl: 6,
        promotionExecution: 5
      }
    })
  });
