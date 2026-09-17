export const CUSTOMER_SEGMENTS = [
  {
    id: "office_worker",
    name: "上班族",

    spendingPower: 65,
    priceSensitivity: 55,
    qualitySensitivity: 60,
    speedSensitivity: 85,

    hourWeights: {
      7: 20,
      8: 35,
      11: 70,
      12: 100,
      13: 75,
      17: 40,
      18: 70,
      19: 55
    }
  },

  {
    id: "resident",
    name: "周边居民",

    spendingPower: 55,
    priceSensitivity: 65,
    qualitySensitivity: 70,
    speedSensitivity: 40,

    hourWeights: {
      7: 30,
      8: 25,
      11: 35,
      12: 55,
      13: 40,
      17: 45,
      18: 80,
      19: 100,
      20: 70
    }
  },

  {
    id: "student",
    name: "学生",

    spendingPower: 30,
    priceSensitivity: 90,
    qualitySensitivity: 45,
    speedSensitivity: 55,

    hourWeights: {
      7: 20,
      11: 40,
      12: 80,
      13: 70,
      17: 60,
      18: 100,
      19: 80,
      20: 55
    }
  },

  {
    id: "tourist",
    name: "游客",

    spendingPower: 75,
    priceSensitivity: 35,
    qualitySensitivity: 80,
    speedSensitivity: 30,

    hourWeights: {
      10: 30,
      11: 50,
      12: 70,
      13: 75,
      14: 60,
      17: 50,
      18: 75,
      19: 90,
      20: 75
    }
  }
];
