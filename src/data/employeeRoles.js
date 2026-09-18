import {
  EMPLOYEE_CAREER_SCHEMA_VERSION
} from "./employeeCareerRules.js";

export const EMPLOYEE_ROLE_DATASET_META =
  Object.freeze({
    schemaVersion:
      EMPLOYEE_CAREER_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total: 7
  });

export const EMPLOYEE_ROLES =
  Object.freeze({
    chef: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "chef",
      name: "厨师",
      roleGroup: "kitchen",
      baseSalary: 6530,
      primarySkill: "cooking",
      skillProfile: [
        "cooking",
        "speed",
        "quality",
        "innovation",
        "wasteControl",
        "stability"
      ],
      operationalTags: [
        "cooking",
        "dish_quality",
        "kitchen_output"
      ]
    }),

    server: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "server",
      name: "服务员",
      roleGroup: "front_service",
      baseSalary: 4143,
      primarySkill: "service",
      skillProfile: [
        "service",
        "servingSpeed",
        "guestCare",
        "tableTurn",
        "peakPressure"
      ],
      operationalTags: [
        "table_service",
        "guest_care",
        "table_turn"
      ]
    }),

    cashier: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "cashier",
      name: "收银员",
      roleGroup: "front_service",
      baseSalary: 4278,
      primarySkill: "checkout",
      skillProfile: [
        "checkout",
        "accuracy",
        "upselling",
        "compliance",
        "speed"
      ],
      operationalTags: [
        "checkout",
        "accuracy",
        "upselling"
      ]
    }),

    kitchen_assistant: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "kitchen_assistant",
      name: "后厨帮工",
      roleGroup: "kitchen",
      baseSalary: 4504,
      primarySkill: "prep",
      skillProfile: [
        "prep",
        "kitchenSpeed",
        "wasteControl",
        "cleanliness",
        "stability"
      ],
      operationalTags: [
        "prep",
        "kitchen_support",
        "waste_control"
      ]
    }),

    cleaner: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "cleaner",
      name: "保洁员",
      roleGroup: "support",
      baseSalary: 3693,
      primarySkill: "cleaning",
      skillProfile: [
        "cleaning",
        "hygiene",
        "efficiency",
        "inspection"
      ],
      operationalTags: [
        "cleaning",
        "hygiene",
        "inspection"
      ]
    }),

    delivery: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "delivery",
      name: "配送员",
      roleGroup: "delivery",
      baseSalary: 5179,
      primarySkill: "delivery",
      skillProfile: [
        "delivery",
        "route",
        "punctuality",
        "care",
        "peakPressure"
      ],
      operationalTags: [
        "delivery",
        "route",
        "punctuality"
      ]
    }),

    manager: Object.freeze({
      schemaVersion:
        EMPLOYEE_CAREER_SCHEMA_VERSION,
      id: "manager",
      name: "店长",
      roleGroup: "management",
      baseSalary: 8557,
      primarySkill: "management",
      skillProfile: [
        "management",
        "scheduling",
        "costControl",
        "morale",
        "promotionExecution"
      ],
      operationalTags: [
        "management",
        "scheduling",
        "cost_control"
      ]
    })
  });
