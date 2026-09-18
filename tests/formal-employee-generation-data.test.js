import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  EMPLOYEE_NAMES_V1,
  EMPLOYEE_NAME_DATASET_META
} from "../src/data/employeeNames.v1.js";

import {
  EMPLOYEE_PROFILES_V1,
  EMPLOYEE_PROFILE_DATASET_META
} from "../src/data/employeeProfiles.v1.js";

import {
  EMPLOYEE_POTENTIAL_TIERS,
  EMPLOYEE_AGE_RANGE,
  EMPLOYEE_EXPERIENCE_MONTH_RANGE,
  validateEmployeeProfileTemplate
} from "../src/data/employeeGenerationRules.js";

import {
  EMPLOYEE_ROLES
} from "../src/data/employeeRoles.js";

import { app } from "../src/main.js";

import {
  employeeManagementPageSystem
} from "../src/ui/pages/employees/EmployeeManagementPageSystem.js";

const {
  restaurantSystem,
  financeSystem,
  employeeSystem,
  employeeGenerationSystem,
  employeeStaffingSystem,
  employeeCareerSystem
} = app.systems;


test(
  "正式员工生成包固定800姓名和60人格能力模板",
  () => {
    assert.equal(
      EMPLOYEE_NAME_DATASET_META.total,
      800
    );

    assert.equal(
      EMPLOYEE_NAMES_V1.length,
      800
    );

    assert.equal(
      new Set(
        EMPLOYEE_NAMES_V1
      ).size,
      800
    );

    assert.equal(
      EMPLOYEE_PROFILE_DATASET_META.total,
      60
    );

    assert.equal(
      EMPLOYEE_PROFILES_V1.length,
      60
    );

    assert.equal(
      new Set(
        EMPLOYEE_PROFILES_V1.map(
          item => item.id
        )
      ).size,
      60
    );

    for (
      const profile
      of EMPLOYEE_PROFILES_V1
    ) {
      assert.equal(
        validateEmployeeProfileTemplate(
          profile
        ),
        true,
        profile.id
      );
    }

    for (
      const roleId
      of Object.keys(
        EMPLOYEE_ROLES
      )
    ) {
      assert.ok(
        employeeGenerationSystem
          .getProfilesForRole(
            roleId
          )
          .length >= 20,
        roleId
      );
    }

    assert.deepEqual(
      EMPLOYEE_POTENTIAL_TIERS.map(
        item => item.id
      ),
      [
        1,
        2,
        3,
        4,
        5
      ]
    );
  }
);


test(
  "正式候选人生成遵守年龄经验潜力人格和薪资范围",
  () => {
    const role =
      employeeSystem.getRole(
        "chef"
      );

    const usedNames =
      new Set();

    const generated =
      Array.from(
        {
          length: 100
        },
        (
          _,
          index
        ) => {
          const item =
            employeeGenerationSystem
              .generateCandidate({
                seed:
                  1000 +
                  index,
                role,
                usedNames
              });

          usedNames.add(
            item.name
          );

          return item;
        }
      );

    assert.equal(
      new Set(
        generated.map(
          item => item.name
        )
      ).size,
      100
    );

    for (
      const item
      of generated
    ) {
      assert.ok(
        EMPLOYEE_NAMES_V1
          .includes(
            item.name
          )
      );

      assert.ok(
        item.age >=
          EMPLOYEE_AGE_RANGE.min &&
        item.age <=
          EMPLOYEE_AGE_RANGE.max
      );

      assert.ok(
        item.experienceMonths >=
          EMPLOYEE_EXPERIENCE_MONTH_RANGE.min &&
        item.experienceMonths <=
          EMPLOYEE_EXPERIENCE_MONTH_RANGE.max
      );

      assert.ok(
        item.potential >= 1 &&
        item.potential <= 5
      );

      assert.ok(
        EMPLOYEE_PROFILES_V1
          .some(
            profile =>
              profile.id ===
              item.profileId
          )
      );

      assert.ok(
        item.stability >= 20 &&
        item.stability <= 100
      );

      assert.ok(
        item.learning >= 20 &&
        item.learning <= 100
      );

      assert.ok(
        item.stressTolerance >= 20 &&
        item.stressTolerance <= 100
      );

      assert.ok(
        item.teamwork >= 20 &&
        item.teamwork <= 100
      );

      assert.ok(
        item.initiative >= 20 &&
        item.initiative <= 100
      );

      assert.ok(
        Number.isInteger(
          item.expectedSalary
        ) &&
        item.expectedSalary >=
          1000
      );
    }
  }
);


test(
  "招聘池使用正式生成器且录用后完整继承候选人属性",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "员工生成测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 10
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const candidates =
      employeeStaffingSystem
        .refreshTalentPool(
          restaurant.id,
          {
            count: 10,
            replace: true
          }
        );

    assert.equal(
      candidates.length,
      10
    );

    assert.equal(
      new Set(
        candidates.map(
          item => item.name
        )
      ).size,
      10
    );

    for (
      const candidate
      of candidates
    ) {
      assert.ok(
        EMPLOYEE_NAMES_V1
          .includes(
            candidate.name
          )
      );

      assert.ok(
        candidate.potential >= 1 &&
        candidate.potential <= 5
      );

      assert.ok(
        candidate.profileId
      );

      assert.ok(
        Array.isArray(
          candidate.traits
        ) &&
        candidate.traits.length >= 2
      );
    }

    const target =
      candidates[0];

    const hired =
      employeeStaffingSystem
        .hireCandidate({
          restaurantId:
            restaurant.id,
          candidateId:
            target.id
        });

    assert.equal(
      hired.name,
      target.name
    );

    assert.equal(
      hired.age,
      target.age
    );

    assert.equal(
      hired.industryExperienceMonths,
      target.experienceMonths
    );

    assert.equal(
      hired.potential,
      target.potential
    );

    assert.equal(
      hired.employeeProfileId,
      target.profileId
    );

    assert.equal(
      hired.employeeProfileName,
      target.profileName
    );

    assert.equal(
      hired.stability,
      target.stability
    );

    assert.equal(
      hired.learning,
      target.learning
    );

    assert.equal(
      hired.stressTolerance,
      target.stressTolerance
    );

    assert.deepEqual(
      hired.traits,
      target.traits
    );
  }
);


test(
  "招聘页面直接暴露正式人才池而不是岗位占位",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "招聘页面人才池测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 10
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const page =
      employeeManagementPageSystem
        .getRecruitmentPage(
          restaurant.id
        );

    assert.equal(
      page.pageId,
      "employee_recruitment"
    );

    assert.ok(
      page.candidates.length >
      0
    );

    assert.ok(
      page.candidates.every(
        candidate =>
          typeof candidate.name ===
            "string" &&
          candidate.age >= 18 &&
          candidate.age <= 55 &&
          candidate.potential >= 1 &&
          candidate.potential <= 5 &&
          typeof candidate.profileName ===
            "string" &&
          Number.isInteger(
            candidate.expectedSalary
          )
      )
    );

    assert.equal(
      page.candidates.some(
        candidate =>
          EMPLOYEE_NAMES_V1
            .includes(
              candidate.name
            )
      ),
      true
    );
  }
);


test(
  "潜力与学习力真实改变培训成长速度",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "员工成长倍率测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 10
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const low =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "低潜力测试员工",
        roleId:
          "chef"
      });

    const high =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "高潜力测试员工",
        roleId:
          "chef"
      });

    entitySystem.update(
      "employee",
      low.id,
      {
        potential: 1,
        potentialName: "普通",
        learning: 20
      }
    );

    entitySystem.update(
      "employee",
      high.id,
      {
        potential: 5,
        potentialName: "稀有",
        learning: 100
      }
    );

    const lowBefore =
      employeeSystem.get(
        low.id
      ).skills.cooking;

    const highBefore =
      employeeSystem.get(
        high.id
      ).skills.cooking;

    employeeCareerSystem.train(
      low.id,
      "role_drill"
    );

    employeeCareerSystem.train(
      high.id,
      "role_drill"
    );

    const lowGain =
      employeeSystem.get(
        low.id
      ).skills.cooking -
      lowBefore;

    const highGain =
      employeeSystem.get(
        high.id
      ).skills.cooking -
      highBefore;

    assert.ok(
      highGain >
      lowGain
    );
  }
);


test(
  "稳定性与抗压能力真实降低离职风险",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "员工离职风险测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 10
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const stable =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "稳定型测试员工",
        roleId:
          "server"
      });

    const volatile =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "波动型测试员工",
        roleId:
          "server"
      });

    const shared = {
      fatigue: 70,
      mood: 60,
      loyalty: 50,
      salaryArrears: 0
    };

    entitySystem.update(
      "employee",
      stable.id,
      {
        ...shared,
        stability: 90,
        stressTolerance: 90
      }
    );

    entitySystem.update(
      "employee",
      volatile.id,
      {
        ...shared,
        stability: 30,
        stressTolerance: 30
      }
    );

    const stableRisk =
      employeeStaffingSystem
        .getTurnoverRisk(
          stable.id
        );

    const volatileRisk =
      employeeStaffingSystem
        .getTurnoverRisk(
          volatile.id
        );

    assert.ok(
      volatileRisk.score >
      stableRisk.score
    );

    assert.equal(
      stableRisk.factors.stability,
      90
    );

    assert.equal(
      volatileRisk.factors.stressTolerance,
      30
    );
  }
);
