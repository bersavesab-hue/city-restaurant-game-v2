export const STORE_LEVELS = Object.freeze([
  {
    level: 1,
    requiredExperience: 0,
    limits: {
      employees: 4,
      menuItems: 8,
      tables: 6,
      kitchenStations: 2
    },
    unlocks: [
      "employee_management",
      "menu_management",
      "basic_inventory"
    ]
  },
  {
    level: 2,
    requiredExperience: 500,
    limits: {
      employees: 6,
      menuItems: 12,
      tables: 8,
      kitchenStations: 3
    },
    unlocks: [
      "supplier_management"
    ]
  },
  {
    level: 3,
    requiredExperience: 1500,
    limits: {
      employees: 8,
      menuItems: 16,
      tables: 10,
      kitchenStations: 4
    },
    unlocks: [
      "marketing"
    ]
  },
  {
    level: 4,
    requiredExperience: 3500,
    limits: {
      employees: 10,
      menuItems: 20,
      tables: 14,
      kitchenStations: 5
    },
    unlocks: [
      "advanced_renovation"
    ]
  },
  {
    level: 5,
    requiredExperience: 7000,
    limits: {
      employees: 14,
      menuItems: 24,
      tables: 18,
      kitchenStations: 6
    },
    unlocks: [
      "dish_research"
    ]
  },
  {
    level: 6,
    requiredExperience: 12000,
    limits: {
      employees: 18,
      menuItems: 28,
      tables: 22,
      kitchenStations: 7
    },
    unlocks: [
      "second_store"
    ]
  },
  {
    level: 7,
    requiredExperience: 20000,
    limits: {
      employees: 24,
      menuItems: 32,
      tables: 28,
      kitchenStations: 8
    },
    unlocks: [
      "membership"
    ]
  },
  {
    level: 8,
    requiredExperience: 32000,
    limits: {
      employees: 30,
      menuItems: 36,
      tables: 34,
      kitchenStations: 10
    },
    unlocks: [
      "chain_management"
    ]
  },
  {
    level: 9,
    requiredExperience: 50000,
    limits: {
      employees: 38,
      menuItems: 42,
      tables: 40,
      kitchenStations: 12
    },
    unlocks: [
      "central_kitchen"
    ]
  },
  {
    level: 10,
    requiredExperience: 75000,
    limits: {
      employees: 48,
      menuItems: 50,
      tables: 48,
      kitchenStations: 14
    },
    unlocks: [
      "regional_expansion"
    ]
  }
]);
