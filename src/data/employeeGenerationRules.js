export const EMPLOYEE_GENERATION_SCHEMA_VERSION = 1;

export const EMPLOYEE_POTENTIAL_TIERS =
  Object.freeze([
    Object.freeze({
      id: 1,
      name: "普通",
      growthMultiplier: 0.85,
      weight: 24
    }),
    Object.freeze({
      id: 2,
      name: "可塑",
      growthMultiplier: 0.95,
      weight: 30
    }),
    Object.freeze({
      id: 3,
      name: "良好",
      growthMultiplier: 1,
      weight: 28
    }),
    Object.freeze({
      id: 4,
      name: "优秀",
      growthMultiplier: 1.15,
      weight: 14
    }),
    Object.freeze({
      id: 5,
      name: "稀有",
      growthMultiplier: 1.3,
      weight: 4
    })
  ]);

export const EMPLOYEE_AGE_RANGE =
  Object.freeze({
    min: 18,
    max: 55
  });

export const EMPLOYEE_EXPERIENCE_MONTH_RANGE =
  Object.freeze({
    min: 0,
    max: 240
  });

export function getPotentialTier(
  potential
) {
  return (
    EMPLOYEE_POTENTIAL_TIERS.find(
      item =>
        item.id === potential
    ) ??
    null
  );
}

export function getPotentialGrowthMultiplier(
  potential
) {
  return (
    getPotentialTier(
      potential
    )?.growthMultiplier ??
    1
  );
}

export function validateEmployeeProfileTemplate(
  profile
) {
  if (
    !profile ||
    typeof profile !== "object"
  ) {
    throw new TypeError(
      "Employee profile template must be an object"
    );
  }

  if (
    profile.schemaVersion !==
      EMPLOYEE_GENERATION_SCHEMA_VERSION
  ) {
    throw new Error(
      "Employee profile template has invalid schemaVersion"
    );
  }

  if (
    typeof profile.id !== "string" ||
    !/^employee_profile_[a-z0-9_]+$/.test(
      profile.id
    )
  ) {
    throw new Error(
      "Employee profile id must use employee_profile_* snake_case format"
    );
  }

  if (
    typeof profile.name !== "string" ||
    !profile.name.trim()
  ) {
    throw new Error(
      `Employee profile "${profile.id}" requires a name`
    );
  }

  if (
    !Array.isArray(
      profile.roleAffinity
    ) ||
    profile.roleAffinity.length ===
      0
  ) {
    throw new Error(
      `Employee profile "${profile.id}" requires roleAffinity`
    );
  }

  for (
    const field
    of [
      "stabilityBase",
      "learning",
      "stressTolerance",
      "teamwork",
      "initiative",
      "moodBase",
      "loyaltyBase"
    ]
  ) {
    if (
      !Number.isInteger(
        profile[field]
      ) ||
      profile[field] < 0 ||
      profile[field] > 100
    ) {
      throw new Error(
        `Employee profile "${profile.id}" has invalid ${field}`
      );
    }
  }

  for (
    const field
    of [
      "salaryExpectationMultiplier",
      "primarySkillMultiplier",
      "secondarySkillMultiplier",
      "experienceMultiplier"
    ]
  ) {
    if (
      !Number.isFinite(
        profile[field]
      ) ||
      profile[field] < 0.5 ||
      profile[field] > 1.6
    ) {
      throw new Error(
        `Employee profile "${profile.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Array.isArray(
      profile.traits
    ) ||
    profile.traits.length < 2 ||
    profile.traits.some(
      trait =>
        typeof trait !== "string" ||
        !trait.trim()
    )
  ) {
    throw new Error(
      `Employee profile "${profile.id}" has invalid traits`
    );
  }

  return true;
}
