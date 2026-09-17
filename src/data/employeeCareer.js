export const EMPLOYEE_CAREER_RANKS = Object.freeze([
  {
    id: "apprentice",
    name: "学徒",
    order: 0,
    minExperience: 0,
    minWorkMinutes: 0,
    minPrimarySkill: 0,
    minLoyalty: 0,
    salaryMultiplier: 1
  },
  {
    id: "skilled",
    name: "熟手",
    order: 1,
    minExperience: 400,
    minWorkMinutes: 1200,
    minPrimarySkill: 35,
    minLoyalty: 35,
    salaryMultiplier: 1.08
  },
  {
    id: "core",
    name: "骨干",
    order: 2,
    minExperience: 1200,
    minWorkMinutes: 6000,
    minPrimarySkill: 50,
    minLoyalty: 45,
    salaryMultiplier: 1.18
  },
  {
    id: "expert",
    name: "名手",
    order: 3,
    minExperience: 2800,
    minWorkMinutes: 18000,
    minPrimarySkill: 68,
    minLoyalty: 55,
    salaryMultiplier: 1.35
  },
  {
    id: "master",
    name: "大师",
    order: 4,
    minExperience: 5200,
    minWorkMinutes: 42000,
    minPrimarySkill: 82,
    minLoyalty: 65,
    salaryMultiplier: 1.6
  }
]);

export const EMPLOYEE_TRAINING_PROGRAMS = Object.freeze({
  basic_training: {
    id: "basic_training",
    name: "基础岗位训练",
    cost: 600,
    experience: 120,
    primarySkillGain: 4,
    secondarySkillGain: 1,
    fatigueGain: 6,
    moodGain: 1,
    loyaltyGain: 0,
    minRank: "apprentice"
  },
  role_drill: {
    id: "role_drill",
    name: "岗位强化训练",
    cost: 1200,
    experience: 220,
    primarySkillGain: 6,
    secondarySkillGain: 2,
    fatigueGain: 10,
    moodGain: 1,
    loyaltyGain: 1,
    minRank: "apprentice"
  },
  advanced_workshop: {
    id: "advanced_workshop",
    name: "高级技能研修",
    cost: 2600,
    experience: 420,
    primarySkillGain: 8,
    secondarySkillGain: 4,
    fatigueGain: 14,
    moodGain: 2,
    loyaltyGain: 2,
    minRank: "core"
  }
});
