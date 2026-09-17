export const DISH_TIERS = Object.freeze([
  {
    id: "home",
    name: "家常",
    order: 1,
    minQuality: 0,
    minMastery: 1,
    minSold: 0,
    minReputation: 0
  },
  {
    id: "selected",
    name: "优选",
    order: 2,
    minQuality: 55,
    minMastery: 2,
    minSold: 40,
    minReputation: 45
  },
  {
    id: "signature",
    name: "招牌",
    order: 3,
    minQuality: 68,
    minMastery: 3,
    minSold: 200,
    minReputation: 55
  },
  {
    id: "famous",
    name: "名菜",
    order: 4,
    minQuality: 80,
    minMastery: 4,
    minSold: 800,
    minReputation: 70
  },
  {
    id: "house_special",
    name: "镇店",
    order: 5,
    minQuality: 88,
    minMastery: 5,
    minSold: 2000,
    minReputation: 82
  }
]);

export const DISH_MASTERY_NAMES = Object.freeze({
  1: "生疏",
  2: "熟练",
  3: "精通",
  4: "拿手",
  5: "炉火纯青"
});

export const OUTPUT_QUALITY_LEVELS = Object.freeze([
  {
    id: "ordinary",
    name: "普通",
    min: 0
  },
  {
    id: "good",
    name: "良好",
    min: 60
  },
  {
    id: "refined",
    name: "精致",
    min: 75
  },
  {
    id: "perfect",
    name: "完美",
    min: 90
  }
]);
