import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  financeSystem,
  employeeSystem,
  employeeWorkSystem,
  employeeCareerSystem
} = app.systems;

test("员工支持岗位技能成长、培训、职级晋升和工资满意度", () => {
  const restaurant = restaurantSystem.create({
    name: "员工成长测试店"
  });

  financeSystem.createAccount(restaurant.id, 100000);

  const chef = employeeSystem.hire({
    restaurantId: restaurant.id,
    name: "晋升测试厨师",
    roleId: "chef"
  });

  assert.equal(chef.careerRankId, "apprentice");
  assert.equal(chef.promotionCount, 0);
  assert.ok(chef.skills.cooking >= 20);
  assert.ok("quality" in chef.skills);
  assert.ok("innovation" in chef.skills);

  const roles = employeeSystem.getRoles();
  assert.ok(roles.some(role => role.id === "kitchen_assistant"));
  assert.ok(roles.some(role => role.id === "delivery"));

  const beforeBalance = financeSystem.getBalance(restaurant.id);

  employeeCareerSystem.train(chef.id, "basic_training");
  employeeCareerSystem.train(chef.id, "role_drill");

  const afterTraining = employeeSystem.get(chef.id);
  assert.equal(afterTraining.trainingCount, 2);
  assert.ok(afterTraining.experience >= 340);
  assert.ok(afterTraining.skills.cooking >= chef.skills.cooking + 10);
  assert.equal(
    financeSystem.getBalance(restaurant.id),
    beforeBalance - 1800
  );

  employeeWorkSystem.recordWork(chef.id, 1200);

  const afterWork = employeeSystem.get(chef.id);
  assert.ok(afterWork.experience >= 740);
  assert.equal(afterWork.totalWorkMinutes, 1200);
  assert.ok(afterWork.skills.cooking >= chef.skills.cooking + 15);

  const promotion = employeeCareerSystem.getPromotionStatus(chef.id);
  assert.equal(promotion.current.id, "apprentice");
  assert.equal(promotion.next.id, "skilled");
  assert.equal(promotion.eligible, true);

  const promoted = employeeCareerSystem.promote(chef.id);
  assert.equal(promoted.careerRankId, "skilled");
  assert.equal(promoted.promotionCount, 1);
  assert.ok(promoted.salary >= 4860);

  const profile = employeeCareerSystem.getProfile(chef.id);
  assert.equal(profile.rank.name, "熟手");
  assert.equal(profile.role.name, "厨师");
  assert.ok(profile.salarySatisfaction.score >= 55);
  assert.ok(profile.trainingPrograms.length >= 3);
});
