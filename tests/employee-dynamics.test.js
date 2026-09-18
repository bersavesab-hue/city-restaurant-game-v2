import test from "node:test";
import assert from "node:assert/strict";

import {
  EmployeeDynamicsSystem
} from "../src/systems/EmployeeDynamicsSystem.js";

import {
  StaffingRecommendationSystem
} from "../src/systems/StaffingRecommendationSystem.js";


test(
  "培训成长使用真实培训次数而不是技能数值",
  () => {
    const system =
      new EmployeeDynamicsSystem();

    const employee = {
      trainingCount:
        4
    };

    const progress =
      system.getTrainingProgress(
        employee
      );

    assert.equal(
      progress.count,
      4
    );

    assert.equal(
      progress.nextTarget,
      6
    );

    assert.equal(
      progress.percent,
      33
    );
  }
);


test(
  "推荐编制会随餐位和经营压力变化",
  () => {
    const system =
      new StaffingRecommendationSystem();

    const small =
      system.calculatePlan(
        {
          seats:
            20,

          operatingHours:
            10,

          averageDailyOrders:
            18,

          averageChefSkill:
            55,

          averageServerSkill:
            55,

          kitchenEfficiency:
            1,

          serviceEfficiency:
            1,

          deliveryRatio:
            0
        },
        {}
      );


    const large =
      system.calculatePlan(
        {
          seats:
            100,

          operatingHours:
            14,

          averageDailyOrders:
            180,

          averageChefSkill:
            45,

          averageServerSkill:
            45,

          kitchenEfficiency:
            1,

          serviceEfficiency:
            1,

          deliveryRatio:
            0
        },
        {}
      );


    const smallChef =
      small.find(
        item =>
          item.roleId ===
          "chef"
      ).recommended;


    const largeChef =
      large.find(
        item =>
          item.roleId ===
          "chef"
      ).recommended;


    const smallServer =
      small.find(
        item =>
          item.roleId ===
          "server"
      ).recommended;


    const largeServer =
      large.find(
        item =>
          item.roleId ===
          "server"
      ).recommended;


    assert.ok(
      largeChef >
      smallChef
    );

    assert.ok(
      largeServer >
      smallServer
    );
  }
);


test(
  "头像ID由员工身份稳定生成而不是列表顺序",
  () => {
    const system =
      new EmployeeDynamicsSystem();

    const employee = {
      id:
        "employee_abc",

      roleId:
        "chef"
    };


    const first =
      system.getAvatarId(
        employee
      );


    const second =
      system.getAvatarId(
        employee
      );


    assert.equal(
      first,
      second
    );

    assert.match(
      first,
      /^chef_\d{2}$/
    );
  }
);
