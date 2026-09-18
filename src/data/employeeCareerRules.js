export const EMPLOYEE_CAREER_SCHEMA_VERSION = 1;

export const EMPLOYEE_ROLE_IDS =
  Object.freeze([
    "chef",
    "server",
    "cashier",
    "kitchen_assistant",
    "cleaner",
    "delivery",
    "manager"
  ]);

export const EMPLOYEE_CAREER_STAGE_IDS =
  Object.freeze([
    "apprentice",
    "skilled",
    "core",
    "expert",
    "master"
  ]);

export const TRAINING_CATEGORY =
  Object.freeze({
    GENERAL: "general",
    OPERATIONS: "operations",
    SERVICE: "service",
    KITCHEN: "kitchen",
    MANAGEMENT: "management",
    COMPLIANCE: "compliance"
  });

export function validateEmployeeRole(
  role
) {
  if (
    !role ||
    typeof role !== "object"
  ) {
    throw new TypeError(
      "Employee role must be an object"
    );
  }

  if (
    role.schemaVersion !==
      EMPLOYEE_CAREER_SCHEMA_VERSION
  ) {
    throw new Error(
      "Employee role has invalid schemaVersion"
    );
  }

  if (
    !EMPLOYEE_ROLE_IDS.includes(
      role.id
    )
  ) {
    throw new Error(
      `Unknown employee role "${role.id}"`
    );
  }

  if (
    typeof role.name !== "string" ||
    !role.name.trim()
  ) {
    throw new Error(
      `Employee role "${role.id}" requires a name`
    );
  }

  if (
    !Number.isInteger(
      role.baseSalary
    ) ||
    role.baseSalary <= 0
  ) {
    throw new Error(
      `Employee role "${role.id}" has invalid baseSalary`
    );
  }

  if (
    typeof role.primarySkill !==
      "string" ||
    !role.primarySkill.trim()
  ) {
    throw new Error(
      `Employee role "${role.id}" requires primarySkill`
    );
  }

  if (
    !Array.isArray(
      role.skillProfile
    ) ||
    role.skillProfile.length < 4 ||
    !role.skillProfile.includes(
      role.primarySkill
    ) ||
    new Set(
      role.skillProfile
    ).size !==
      role.skillProfile.length
  ) {
    throw new Error(
      `Employee role "${role.id}" has invalid skillProfile`
    );
  }

  if (
    !Array.isArray(
      role.operationalTags
    ) ||
    role.operationalTags.length ===
      0
  ) {
    throw new Error(
      `Employee role "${role.id}" requires operationalTags`
    );
  }

  return true;
}

export function validateCareerRank(
  rank
) {
  if (
    !rank ||
    typeof rank !== "object"
  ) {
    throw new TypeError(
      "Career rank must be an object"
    );
  }

  if (
    rank.schemaVersion !==
      EMPLOYEE_CAREER_SCHEMA_VERSION
  ) {
    throw new Error(
      "Career rank has invalid schemaVersion"
    );
  }

  if (
    !EMPLOYEE_CAREER_STAGE_IDS.includes(
      rank.id
    )
  ) {
    throw new Error(
      `Unknown career rank "${rank.id}"`
    );
  }

  if (
    !Number.isInteger(
      rank.order
    ) ||
    rank.order < 0 ||
    rank.order > 4
  ) {
    throw new Error(
      `Career rank "${rank.id}" has invalid order`
    );
  }

  for (
    const field
    of [
      "minExperience",
      "minWorkMinutes",
      "minPrimarySkill",
      "minLoyalty"
    ]
  ) {
    if (
      !Number.isFinite(
        rank[field]
      ) ||
      rank[field] < 0
    ) {
      throw new Error(
        `Career rank "${rank.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Number.isFinite(
      rank.salaryMultiplier
    ) ||
    rank.salaryMultiplier < 1 ||
    rank.salaryMultiplier > 3
  ) {
    throw new Error(
      `Career rank "${rank.id}" has invalid salaryMultiplier`
    );
  }

  return true;
}

export function validateTrainingProgram(
  program
) {
  if (
    !program ||
    typeof program !== "object"
  ) {
    throw new TypeError(
      "Training program must be an object"
    );
  }

  if (
    program.schemaVersion !==
      EMPLOYEE_CAREER_SCHEMA_VERSION
  ) {
    throw new Error(
      "Training program has invalid schemaVersion"
    );
  }

  if (
    typeof program.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      program.id
    )
  ) {
    throw new Error(
      "Training program id must use snake_case"
    );
  }

  if (
    typeof program.name !== "string" ||
    !program.name.trim()
  ) {
    throw new Error(
      `Training program "${program.id}" requires a name`
    );
  }

  if (
    !Object.values(
      TRAINING_CATEGORY
    ).includes(
      program.category
    )
  ) {
    throw new Error(
      `Training program "${program.id}" has invalid category`
    );
  }

  if (
    !Array.isArray(
      program.roleIds
    ) ||
    program.roleIds.some(
      roleId =>
        !EMPLOYEE_ROLE_IDS.includes(
          roleId
        )
    ) ||
    new Set(
      program.roleIds
    ).size !==
      program.roleIds.length
  ) {
    throw new Error(
      `Training program "${program.id}" has invalid roleIds`
    );
  }

  if (
    !EMPLOYEE_CAREER_STAGE_IDS.includes(
      program.minRank
    )
  ) {
    throw new Error(
      `Training program "${program.id}" has invalid minRank`
    );
  }

  for (
    const field
    of [
      "cost",
      "experience",
      "primarySkillGain",
      "secondarySkillGain",
      "fatigueGain"
    ]
  ) {
    if (
      !Number.isInteger(
        program[field]
      ) ||
      program[field] < 0
    ) {
      throw new Error(
        `Training program "${program.id}" has invalid ${field}`
      );
    }
  }

  for (
    const field
    of [
      "moodGain",
      "loyaltyGain"
    ]
  ) {
    if (
      !Number.isInteger(
        program[field]
      ) ||
      program[field] < -20 ||
      program[field] > 20
    ) {
      throw new Error(
        `Training program "${program.id}" has invalid ${field}`
      );
    }
  }

  if (
    program.focusSkillGains !==
      undefined
  ) {
    if (
      !program.focusSkillGains ||
      typeof program
        .focusSkillGains !==
        "object" ||
      Array.isArray(
        program.focusSkillGains
      ) ||
      Object.values(
        program.focusSkillGains
      ).some(
        value =>
          !Number.isInteger(
            value
          ) ||
          value < 0 ||
          value > 12
      )
    ) {
      throw new Error(
        `Training program "${program.id}" has invalid focusSkillGains`
      );
    }
  }

  return true;
}
