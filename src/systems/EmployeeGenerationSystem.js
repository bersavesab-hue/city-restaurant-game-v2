import {
  EMPLOYEE_NAMES_V1
} from "../data/employeeNames.v1.js";

import {
  EMPLOYEE_PROFILES_V1
} from "../data/employeeProfiles.v1.js";

import {
  EMPLOYEE_AGE_RANGE,
  EMPLOYEE_EXPERIENCE_MONTH_RANGE,
  EMPLOYEE_POTENTIAL_TIERS,
  getPotentialTier,
  validateEmployeeProfileTemplate
} from "../data/employeeGenerationRules.js";


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


function hashString(
  value
) {
  let hash =
    2166136261;

  for (
    const char
    of String(
      value
    )
  ) {
    hash ^=
      char.charCodeAt(
        0
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return hash >>> 0;
}


function random01(
  seed,
  salt = 0
) {
  let value =
    (
      seed +
      Math.imul(
        salt + 1,
        0x9e3779b1
      )
    ) >>>
    0;

  value ^=
    value >>> 16;

  value =
    Math.imul(
      value,
      0x7feb352d
    );

  value ^=
    value >>> 15;

  value =
    Math.imul(
      value,
      0x846ca68b
    );

  value ^=
    value >>> 16;

  return (
    value >>>
    0
  ) /
    4294967296;
}


function randomInt(
  seed,
  salt,
  min,
  max
) {
  return Math.floor(
    random01(
      seed,
      salt
    ) *
    (
      max -
      min +
      1
    )
  ) +
  min;
}


function chooseWeightedPotential(
  seed,
  salt
) {
  const roll =
    random01(
      seed,
      salt
    ) *
    EMPLOYEE_POTENTIAL_TIERS
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.weight,
        0
      );

  let cursor = 0;

  for (
    const tier
    of EMPLOYEE_POTENTIAL_TIERS
  ) {
    cursor +=
      tier.weight;

    if (
      roll <
      cursor
    ) {
      return tier.id;
    }
  }

  return 3;
}


class EmployeeGenerationSystem {
  getNamePool() {
    return [
      ...EMPLOYEE_NAMES_V1
    ];
  }


  getProfiles() {
    return EMPLOYEE_PROFILES_V1
      .map(
        profile => {
          validateEmployeeProfileTemplate(
            profile
          );

          return {
            ...profile,
            roleAffinity: [
              ...profile
                .roleAffinity
            ],
            traits: [
              ...profile.traits
            ]
          };
        }
      );
  }


  getProfilesForRole(
    roleId
  ) {
    return this.getProfiles()
      .filter(
        profile =>
          profile.roleAffinity
            .includes(
              roleId
            )
      );
  }


  getPotentialDefinition(
    potential
  ) {
    return getPotentialTier(
      potential
    );
  }


  generateCandidate({
    seed,
    role,
    usedNames =
      new Set()
  }) {
    if (
      !Number.isInteger(
        seed
      ) ||
      seed < 0
    ) {
      throw new TypeError(
        "Candidate seed must be a non-negative integer"
      );
    }

    if (
      !role ||
      typeof role.id !==
        "string"
    ) {
      throw new TypeError(
        "Candidate generation requires a role"
      );
    }

    const compatible =
      this.getProfilesForRole(
        role.id
      );

    if (
      compatible.length ===
      0
    ) {
      throw new Error(
        `No employee profiles support role "${role.id}"`
      );
    }

    const profile =
      compatible[
        randomInt(
          seed,
          1,
          0,
          compatible.length -
            1
        )
      ];

    let nameIndex =
      randomInt(
        seed,
        2,
        0,
        EMPLOYEE_NAMES_V1
          .length -
          1
      );

    for (
      let attempt = 0;
      attempt <
        EMPLOYEE_NAMES_V1.length;
      attempt += 1
    ) {
      const candidateName =
        EMPLOYEE_NAMES_V1[
          nameIndex
        ];

      if (
        !usedNames.has(
          candidateName
        )
      ) {
        break;
      }

      nameIndex =
        (
          nameIndex +
          1
        ) %
        EMPLOYEE_NAMES_V1
          .length;
    }

    const name =
      EMPLOYEE_NAMES_V1[
        nameIndex
      ];

    const age =
      randomInt(
        seed,
        3,
        EMPLOYEE_AGE_RANGE
          .min,
        EMPLOYEE_AGE_RANGE
          .max
      );

    const careerMonths =
      Math.min(
        EMPLOYEE_EXPERIENCE_MONTH_RANGE
          .max,
        Math.max(
          0,
          (
            age -
            EMPLOYEE_AGE_RANGE
              .min
          ) *
          12
        )
      );

    const rawExperience =
      careerMonths > 0
        ? randomInt(
            seed,
            4,
            0,
            careerMonths
          )
        : 0;

    const experienceMonths =
      clamp(
        Math.round(
          rawExperience *
          profile
            .experienceMultiplier
        ),
        EMPLOYEE_EXPERIENCE_MONTH_RANGE
          .min,
        EMPLOYEE_EXPERIENCE_MONTH_RANGE
          .max
      );

    const potential =
      chooseWeightedPotential(
        seed,
        5
      );

    const potentialDefinition =
      this.getPotentialDefinition(
        potential
      );

    const stability =
      clamp(
        profile
          .stabilityBase +
        randomInt(
          seed,
          6,
          -8,
          8
        ),
        20,
        100
      );

    const learning =
      clamp(
        profile.learning +
        randomInt(
          seed,
          7,
          -6,
          6
        ),
        20,
        100
      );

    const stressTolerance =
      clamp(
        profile
          .stressTolerance +
        randomInt(
          seed,
          8,
          -6,
          6
        ),
        20,
        100
      );

    const teamwork =
      clamp(
        profile.teamwork +
        randomInt(
          seed,
          9,
          -6,
          6
        ),
        20,
        100
      );

    const initiative =
      clamp(
        profile.initiative +
        randomInt(
          seed,
          10,
          -6,
          6
        ),
        20,
        100
      );

    const skillProfile =
      role.skillProfile ??
      [
        role.primarySkill
      ];

    const experienceSkillBonus =
      Math.min(
        34,
        Math.floor(
          experienceMonths /
          6
        )
      );

    const skills = {};

    skillProfile.forEach(
      (
        skill,
        index
      ) => {
        const primary =
          skill ===
          role.primarySkill;

        const raw =
          randomInt(
            seed,
            20 + index,
            16,
            30
          ) +
          experienceSkillBonus +
          (
            primary
              ? randomInt(
                  seed,
                  40 + index,
                  4,
                  12
                )
              : 0
          );

        const multiplier =
          primary
            ? profile
                .primarySkillMultiplier
            : profile
                .secondarySkillMultiplier;

        skills[skill] =
          clamp(
            Math.round(
              raw *
              multiplier
            ),
            1,
            82
          );
      }
    );

    const experienceSalaryBonus =
      Math.min(
        0.22,
        experienceMonths /
        240 *
        0.22
      );

    const potentialSalaryBonus =
      (
        potential -
        3
      ) *
      0.015;

    const salaryExpectationRate =
      clamp(
        profile
          .salaryExpectationMultiplier +
        experienceSalaryBonus +
        potentialSalaryBonus +
        (
          random01(
            seed,
            60
          ) -
          0.5
        ) *
        0.08,
        0.82,
        1.48
      );

    const expectedSalary =
      Math.max(
        1000,
        Math.round(
          role.baseSalary *
          salaryExpectationRate /
          100
        ) *
        100
      );

    const loyaltyStart =
      clamp(
        profile.loyaltyBase +
        randomInt(
          seed,
          61,
          -8,
          8
        ),
        30,
        90
      );

    const moodStart =
      clamp(
        profile.moodBase +
        randomInt(
          seed,
          62,
          -7,
          7
        ),
        45,
        92
      );

    return {
      name,

      age,
      experienceMonths,

      roleId:
        role.id,

      roleName:
        role.name,

      expectedSalary,

      salaryExpectationRate:
        Number(
          salaryExpectationRate
            .toFixed(
              3
            )
        ),

      skills,

      potential,

      potentialName:
        potentialDefinition
          ?.name ??
        "良好",

      growthMultiplier:
        potentialDefinition
          ?.growthMultiplier ??
        1,

      profileId:
        profile.id,

      profileName:
        profile.name,

      archetype:
        profile.archetype,

      orientation:
        profile.orientation,

      traits: [
        ...profile.traits
      ],

      stability,

      learning,
      stressTolerance,
      teamwork,
      initiative,

      loyaltyStart,
      moodStart
    };
  }
}


export const employeeGenerationSystem =
  new EmployeeGenerationSystem();


export {
  EmployeeGenerationSystem,
  hashString,
  random01,
  randomInt
};
