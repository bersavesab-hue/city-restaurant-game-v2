const ALL_ROLES =
  Object.freeze([
    "chef",
    "server",
    "cashier",
    "kitchen_assistant",
    "cleaner",
    "delivery",
    "manager"
  ]);

const ARCHETYPES =
  Object.freeze([
    {
      key: "steady",
      name: "稳健型",
      roles: ALL_ROLES,
      stability: 82,
      learning: 55,
      stress: 72,
      teamwork: 76,
      initiative: 52,
      mood: 70,
      loyalty: 66,
      salary: 0.96,
      primary: 1,
      secondary: 1,
      experience: 1,
      traits: [
        "稳定",
        "守规"
      ]
    },
    {
      key: "fast_learner",
      name: "学习型",
      roles: ALL_ROLES,
      stability: 64,
      learning: 88,
      stress: 62,
      teamwork: 66,
      initiative: 74,
      mood: 72,
      loyalty: 56,
      salary: 1.02,
      primary: 1.04,
      secondary: 1.04,
      experience: 0.85,
      traits: [
        "好学",
        "成长快"
      ]
    },
    {
      key: "veteran",
      name: "熟手型",
      roles: ALL_ROLES,
      stability: 76,
      learning: 48,
      stress: 82,
      teamwork: 70,
      initiative: 66,
      mood: 68,
      loyalty: 62,
      salary: 1.14,
      primary: 1.14,
      secondary: 1.08,
      experience: 1.35,
      traits: [
        "经验足",
        "抗压"
      ]
    },
    {
      key: "service_minded",
      name: "服务型",
      roles: [
        "server",
        "cashier",
        "manager",
        "delivery"
      ],
      stability: 72,
      learning: 62,
      stress: 70,
      teamwork: 86,
      initiative: 68,
      mood: 76,
      loyalty: 64,
      salary: 1,
      primary: 1.08,
      secondary: 1.04,
      experience: 1,
      traits: [
        "亲和",
        "协作"
      ]
    },
    {
      key: "craft_focused",
      name: "技术型",
      roles: [
        "chef",
        "kitchen_assistant",
        "cleaner"
      ],
      stability: 68,
      learning: 74,
      stress: 76,
      teamwork: 58,
      initiative: 76,
      mood: 66,
      loyalty: 58,
      salary: 1.08,
      primary: 1.13,
      secondary: 1.02,
      experience: 1.08,
      traits: [
        "专注",
        "技术强"
      ]
    },
    {
      key: "ambitious",
      name: "进取型",
      roles: ALL_ROLES,
      stability: 52,
      learning: 78,
      stress: 70,
      teamwork: 62,
      initiative: 90,
      mood: 72,
      loyalty: 46,
      salary: 1.12,
      primary: 1.08,
      secondary: 1.03,
      experience: 1,
      traits: [
        "进取",
        "要求高"
      ]
    },
    {
      key: "team_player",
      name: "团队型",
      roles: ALL_ROLES,
      stability: 78,
      learning: 60,
      stress: 68,
      teamwork: 92,
      initiative: 58,
      mood: 78,
      loyalty: 72,
      salary: 0.98,
      primary: 1,
      secondary: 1.08,
      experience: 0.95,
      traits: [
        "合群",
        "互助"
      ]
    },
    {
      key: "pressure_proof",
      name: "抗压型",
      roles: [
        "chef",
        "server",
        "cashier",
        "delivery",
        "manager"
      ],
      stability: 74,
      learning: 58,
      stress: 94,
      teamwork: 64,
      initiative: 70,
      mood: 65,
      loyalty: 60,
      salary: 1.06,
      primary: 1.07,
      secondary: 1.02,
      experience: 1.08,
      traits: [
        "抗压",
        "高峰稳定"
      ]
    },
    {
      key: "cost_conscious",
      name: "节约型",
      roles: [
        "chef",
        "kitchen_assistant",
        "manager",
        "cleaner"
      ],
      stability: 80,
      learning: 56,
      stress: 70,
      teamwork: 72,
      initiative: 58,
      mood: 68,
      loyalty: 70,
      salary: 0.94,
      primary: 1,
      secondary: 1.07,
      experience: 1,
      traits: [
        "节约",
        "损耗敏感"
      ]
    },
    {
      key: "creative",
      name: "创意型",
      roles: [
        "chef",
        "manager"
      ],
      stability: 56,
      learning: 84,
      stress: 60,
      teamwork: 60,
      initiative: 88,
      mood: 74,
      loyalty: 50,
      salary: 1.13,
      primary: 1.1,
      secondary: 1.04,
      experience: 0.92,
      traits: [
        "创意",
        "自主"
      ]
    },
    {
      key: "disciplined",
      name: "纪律型",
      roles: ALL_ROLES,
      stability: 88,
      learning: 52,
      stress: 80,
      teamwork: 74,
      initiative: 50,
      mood: 66,
      loyalty: 78,
      salary: 0.98,
      primary: 1.02,
      secondary: 1.03,
      experience: 1.08,
      traits: [
        "守时",
        "纪律强"
      ]
    },
    {
      key: "flexible",
      name: "灵活型",
      roles: ALL_ROLES,
      stability: 60,
      learning: 72,
      stress: 74,
      teamwork: 72,
      initiative: 76,
      mood: 76,
      loyalty: 54,
      salary: 1.03,
      primary: 1.04,
      secondary: 1.05,
      experience: 0.96,
      traits: [
        "灵活",
        "适应快"
      ]
    }
  ]);

const ORIENTATIONS =
  Object.freeze([
    {
      key: "balanced",
      name: "均衡",
      stability: 0,
      learning: 0,
      stress: 0,
      teamwork: 0,
      initiative: 0,
      salary: 0,
      primary: 0,
      secondary: 0,
      experience: 0
    },
    {
      key: "growth",
      name: "成长",
      stability: -4,
      learning: 8,
      stress: 0,
      teamwork: 0,
      initiative: 5,
      salary: 0.02,
      primary: 0,
      secondary: 0.02,
      experience: -0.08
    },
    {
      key: "stable",
      name: "稳定",
      stability: 8,
      learning: -3,
      stress: 4,
      teamwork: 3,
      initiative: -3,
      salary: -0.02,
      primary: 0,
      secondary: 0,
      experience: 0.05
    },
    {
      key: "performance",
      name: "绩效",
      stability: -2,
      learning: 2,
      stress: 6,
      teamwork: -2,
      initiative: 7,
      salary: 0.05,
      primary: 0.04,
      secondary: 0,
      experience: 0.04
    },
    {
      key: "team",
      name: "协作",
      stability: 3,
      learning: 0,
      stress: 2,
      teamwork: 8,
      initiative: -1,
      salary: 0,
      primary: 0,
      secondary: 0.04,
      experience: 0
    }
  ]);

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function buildProfiles() {
  const result = [];

  for (
    const archetype
    of ARCHETYPES
  ) {
    for (
      const orientation
      of ORIENTATIONS
    ) {
      result.push({
        schemaVersion: 1,

        id:
          `employee_profile_${archetype.key}_${orientation.key}`,

        name:
          `${archetype.name}·${orientation.name}`,

        archetype:
          archetype.key,

        orientation:
          orientation.key,

        roleAffinity: [
          ...archetype.roles
        ],

        stabilityBase:
          clamp(
            archetype.stability +
            orientation.stability,
            20,
            98
          ),

        learning:
          clamp(
            archetype.learning +
            orientation.learning,
            20,
            98
          ),

        stressTolerance:
          clamp(
            archetype.stress +
            orientation.stress,
            20,
            98
          ),

        teamwork:
          clamp(
            archetype.teamwork +
            orientation.teamwork,
            20,
            98
          ),

        initiative:
          clamp(
            archetype.initiative +
            orientation.initiative,
            20,
            98
          ),

        moodBase:
          archetype.mood,

        loyaltyBase:
          archetype.loyalty,

        salaryExpectationMultiplier:
          Number(
            (
              archetype.salary +
              orientation.salary
            ).toFixed(2)
          ),

        primarySkillMultiplier:
          Number(
            (
              archetype.primary +
              orientation.primary
            ).toFixed(2)
          ),

        secondarySkillMultiplier:
          Number(
            (
              archetype.secondary +
              orientation.secondary
            ).toFixed(2)
          ),

        experienceMultiplier:
          Number(
            (
              archetype.experience +
              orientation.experience
            ).toFixed(2)
          ),

        traits: [
          ...archetype.traits,
          orientation.name
        ]
      });
    }
  }

  return result;
}

export const EMPLOYEE_PROFILE_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 60,
    archetypes: 12,
    orientations: 5
  });

export const EMPLOYEE_PROFILES_V1 =
  Object.freeze(
    buildProfiles()
  );

export const EMPLOYEE_PROFILE_MAP =
  Object.freeze(
    Object.fromEntries(
      EMPLOYEE_PROFILES_V1.map(
        profile => [
          profile.id,
          profile
        ]
      )
    )
  );
