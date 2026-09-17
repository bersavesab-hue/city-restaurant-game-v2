export const EMPLOYEE_ROLES = Object.freeze({
  chef: {
    id: "chef",
    name: "厨师",
    baseSalary: 4500,
    primarySkill: "cooking",
    skillProfile: [
      "cooking",
      "speed",
      "quality",
      "innovation",
      "wasteControl",
      "stability"
    ]
  },

  server: {
    id: "server",
    name: "服务员",
    baseSalary: 3200,
    primarySkill: "service",
    skillProfile: [
      "service",
      "servingSpeed",
      "guestCare",
      "tableTurn",
      "peakPressure"
    ]
  },

  cashier: {
    id: "cashier",
    name: "收银员",
    baseSalary: 3400,
    primarySkill: "checkout",
    skillProfile: [
      "checkout",
      "accuracy",
      "upselling",
      "compliance",
      "speed"
    ]
  },

  kitchen_assistant: {
    id: "kitchen_assistant",
    name: "后厨帮工",
    baseSalary: 3100,
    primarySkill: "prep",
    skillProfile: [
      "prep",
      "kitchenSpeed",
      "wasteControl",
      "cleanliness",
      "stability"
    ]
  },

  cleaner: {
    id: "cleaner",
    name: "保洁员",
    baseSalary: 3000,
    primarySkill: "cleaning",
    skillProfile: [
      "cleaning",
      "hygiene",
      "efficiency",
      "inspection"
    ]
  },

  delivery: {
    id: "delivery",
    name: "配送员",
    baseSalary: 3600,
    primarySkill: "delivery",
    skillProfile: [
      "delivery",
      "route",
      "punctuality",
      "care",
      "peakPressure"
    ]
  },

  manager: {
    id: "manager",
    name: "店长",
    baseSalary: 6500,
    primarySkill: "management",
    skillProfile: [
      "management",
      "scheduling",
      "costControl",
      "morale",
      "promotionExecution"
    ]
  }
});
