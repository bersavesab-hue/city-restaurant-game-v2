import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  EMPLOYEE_ROLES,
  EMPLOYEE_ROLE_DATASET_META
} from "../src/data/employeeRoles.js";

import {
  EMPLOYEE_CAREER_DATASET_META,
  EMPLOYEE_CAREER_RANKS,
  EMPLOYEE_TRAINING_PROGRAMS
} from "../src/data/employeeCareer.js";

import {
  EMPLOYEE_ROLE_IDS,
  EMPLOYEE_CAREER_STAGE_IDS,
  validateEmployeeRole,
  validateCareerRank,
  validateTrainingProgram
} from "../src/data/employeeCareerRules.js";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  financeSystem,
  employeeSystem,
  employeeCareerSystem
} = app.systems;


test(
  "正式员工职业包固定7岗位5阶段20培训",
  () => {
    assert.equal(
      EMPLOYEE_ROLE_DATASET_META.total,
      7
    );

    assert.equal(
      Object.keys(
        EMPLOYEE_ROLES
      ).length,
      7
    );

    assert.deepEqual(
      Object.keys(
        EMPLOYEE_ROLES
      ).sort(),
      [
        ...EMPLOYEE_ROLE_IDS
      ].sort()
    );

    for (
      const role
      of Object.values(
        EMPLOYEE_ROLES
      )
    ) {
      assert.equal(
        validateEmployeeRole(
          role
        ),
        true,
        role.id
      );
    }

    assert.equal(
      EMPLOYEE_CAREER_DATASET_META
        .careerRanks,
      5
    );

    assert.equal(
      EMPLOYEE_CAREER_RANKS.length,
      5
    );

    assert.deepEqual(
      EMPLOYEE_CAREER_RANKS
        .map(
          rank => rank.id
        ),
      [
        ...EMPLOYEE_CAREER_STAGE_IDS
      ]
    );

    assert.deepEqual(
      EMPLOYEE_CAREER_RANKS
        .map(
          rank => rank.order
        ),
      [
        0,
        1,
        2,
        3,
        4
      ]
    );

    for (
      const rank
      of EMPLOYEE_CAREER_RANKS
    ) {
      assert.equal(
        validateCareerRank(
          rank
        ),
        true,
        rank.id
      );
    }

    assert.equal(
      EMPLOYEE_CAREER_DATASET_META
        .trainingPrograms,
      20
    );

    const programs =
      Object.values(
        EMPLOYEE_TRAINING_PROGRAMS
      );

    assert.equal(
      programs.length,
      20
    );

    assert.equal(
      new Set(
        programs.map(
          item => item.id
        )
      ).size,
      20
    );

    for (
      const program
      of programs
    ) {
      assert.equal(
        validateTrainingProgram(
          program
        ),
        true,
        program.id
      );
    }
  }
);


test(
  "每个正式岗位都有2门专属培训且旧3培训ID保留",
  () => {
    const programs =
      Object.values(
        EMPLOYEE_TRAINING_PROGRAMS
      );

    const general =
      programs.filter(
        program =>
          program.roleIds.length ===
          0
      );

    const specific =
      programs.filter(
        program =>
          program.roleIds.length >
          0
      );

    assert.equal(
      general.length,
      6
    );

    assert.equal(
      specific.length,
      14
    );

    for (
      const roleId
      of EMPLOYEE_ROLE_IDS
    ) {
      assert.equal(
        specific.filter(
          program =>
            program.roleIds.includes(
              roleId
            )
        ).length,
        2,
        roleId
      );
    }

    for (
      const legacyId
      of [
        "basic_training",
        "role_drill",
        "advanced_workshop"
      ]
    ) {
      assert.ok(
        EMPLOYEE_TRAINING_PROGRAMS[
          legacyId
        ],
        legacyId
      );
    }
  }
);


test(
  "员工只看到通用培训和本岗位专属培训",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "培训可见性测试店"
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

    const chef =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "厨师培训测试",
        roleId:
          "chef"
      });

    const programs =
      employeeCareerSystem
        .getTrainingPrograms(
          chef.id
        );

    assert.equal(
      programs.length,
      8
    );

    assert.equal(
      programs.every(
        program =>
          program.roleIds.length ===
            0 ||
          program.roleIds.includes(
            "chef"
          )
      ),
      true
    );

    assert.equal(
      programs.some(
        program =>
          program.id ===
          "chef_flavor_control"
      ),
      true
    );

    assert.equal(
      programs.some(
        program =>
          program.id ===
          "server_guest_care"
      ),
      false
    );
  }
);


test(
  "跨岗位培训会被拒绝且阶段门槛真实生效",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "培训门槛测试店"
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

    const chef =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "培训门槛厨师",
        roleId:
          "chef"
      });

    assert.throws(
      () =>
        employeeCareerSystem
          .train(
            chef.id,
            "server_guest_care"
          ),
      /not available for role/
    );

    assert.throws(
      () =>
        employeeCareerSystem
          .train(
            chef.id,
            "chef_flavor_control"
          ),
      /requires rank 熟手/
    );

    assert.throws(
      () =>
        employeeCareerSystem
          .train(
            chef.id,
            "advanced_workshop"
          ),
      /requires rank 骨干/
    );
  }
);


test(
  "岗位专属培训的重点技能获得额外成长",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "重点技能培训测试店"
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

    const server =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name:
          "重点技能服务员",
        roleId:
          "server"
      });

    entitySystem.update(
      "employee",
      server.id,
      {
        potential: 3,
        learning: 50
      }
    );

    const before =
      employeeSystem.get(
        server.id
      );

    const guestCareBefore =
      before.skills.guestCare;

    const servingSpeedBefore =
      before.skills.servingSpeed;

    const result =
      employeeCareerSystem.train(
        server.id,
        "server_guest_care"
      );

    const after =
      result.employee;

    const guestCareGain =
      after.skills.guestCare -
      guestCareBefore;

    const servingSpeedGain =
      after.skills.servingSpeed -
      servingSpeedBefore;

    assert.ok(
      guestCareGain >
      servingSpeedGain
    );

    assert.equal(
      result.program.id,
      "server_guest_care"
    );
  }
);
