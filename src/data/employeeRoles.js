export const EMPLOYEE_ROLES = Object.freeze({
  chef: {
    id: "chef",
    name: "厨师",
    baseSalary: 4500,
    primarySkill: "cooking"
  },

  server: {
    id: "server",
    name: "服务员",
    baseSalary: 3200,
    primarySkill: "service"
  },

  cashier: {
    id: "cashier",
    name: "收银员",
    baseSalary: 3400,
    primarySkill: "checkout"
  },

  cleaner: {
    id: "cleaner",
    name: "保洁员",
    baseSalary: 3000,
    primarySkill: "cleaning"
  },

  manager: {
    id: "manager",
    name: "店长",
    baseSalary: 6500,
    primarySkill: "management"
  }
});
