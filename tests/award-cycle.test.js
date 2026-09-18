import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  awardSystem
} from "../src/systems/AwardSystem.js";

import {
  honorArchiveSystem
} from "../src/systems/HonorArchiveSystem.js";


test("月季年结算日期正确且不会重复发奖", () => {
  gameState.reset();

  assert.deepEqual(
    awardSystem.getDuePeriods(31),
    ["monthly"]
  );

  assert.deepEqual(
    awardSystem.getDuePeriods(91),
    ["monthly","quarterly"]
  );

  assert.deepEqual(
    awardSystem.getDuePeriods(361),
    ["monthly","quarterly","annual"]
  );

  const restaurant=
    restaurantSystem.create({
      name:"颁奖测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  entitySystem.update(
    "restaurant",
    restaurant.id,
    {
      totalOperatingDays:30,
      reputation:65,
      reviewScore:4.5,
      customerSatisfaction:88,
      repeatRate:45
    }
  );

  for(let day=1;day<=30;day+=1){
    entitySystem.create(
      "daily_settlement",
      {
        restaurantId:restaurant.id,
        day,
        orders:20,
        revenue:2000,
        ingredientCost:600,
        payrollDue:300,
        operatingProfit:1100,
        experienceGained:100
      }
    );
  }

  const first=
    awardSystem.processPeriod(
      "monthly",
      30
    );

  assert.ok(
    first.results.length > 0
  );

  const honorCount=
    entitySystem.count(
      "honor_record"
    );

  const experience=
    restaurantSystem.get(
      restaurant.id
    ).experience;

  awardSystem.processPeriod(
    "monthly",
    30
  );

  assert.equal(
    entitySystem.count(
      "honor_record"
    ),
    honorCount
  );

  assert.equal(
    restaurantSystem.get(
      restaurant.id
    ).experience,
    experience
  );

  const summary=
    honorArchiveSystem.getSummary(
      restaurant.id
    );

  assert.equal(
    summary.totalHonors,
    honorCount
  );

  assert.ok(
    summary.prestigePoints > 0
  );
});


test("奖项查询API在首个周期结束前可安全调用", () => {
  gameState.reset();

  const restaurant=
    restaurantSystem.create({
      name:"空荣誉测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    10000
  );

  assert.deepEqual(
    awardSystem.getParticipation(
      restaurant.id
    ),
    []
  );

  assert.deepEqual(
    awardSystem.listRuns(),
    []
  );

  const progress=
    awardSystem.getCurrentProgress(
      "annual"
    );

  assert.equal(
    progress.totalDays,
    360
  );

  assert.equal(
    honorArchiveSystem
      .getSummary(
        restaurant.id
      )
      .totalHonors,
    0
  );
});
