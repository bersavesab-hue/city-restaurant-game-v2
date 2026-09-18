import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  awardCeremonyPageSystem
} from "../src/ui/pages/award-ceremony/AwardCeremonyPageSystem.js";

import {
  AwardCeremonyView
} from "../src/ui/pages/award-ceremony/AwardCeremonyView.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";


test("获奖结果可以生成正式颁奖页面", () => {
  gameState.reset();

  entitySystem.create(
    "award_result",
    {
      awardId:"annual_restaurant_of_year",
      awardName:"年度餐厅",
      period:"annual",
      periodKey:"Y1",
      division:"competition",
      subjectType:"restaurant",
      scope:"city",
      metric:"brandScore",
      prestige:5,
      endDay:360,
      winner:{
        id:"restaurant_a",
        name:"测试餐厅",
        restaurantId:"restaurant_a",
        isPlayer:true,
        rank:1,
        awardScore:96
      },
      finalists:[
        {
          id:"restaurant_a",
          name:"测试餐厅",
          restaurantId:"restaurant_a",
          isPlayer:true,
          rank:1,
          awardScore:96
        },
        {
          id:"npc_a",
          name:"竞争餐厅",
          restaurantId:null,
          isPlayer:false,
          rank:2,
          awardScore:91
        }
      ]
    },
    {
      id:"award_result_ceremony"
    }
  );

  entitySystem.create(
    "honor_record",
    {
      awardResultId:"award_result_ceremony",
      awardId:"annual_restaurant_of_year",
      awardName:"年度餐厅",
      period:"annual",
      periodKey:"Y1",
      division:"competition",
      subjectType:"restaurant",
      subjectId:"restaurant_a",
      subjectName:"测试餐厅",
      restaurantId:"restaurant_a",
      prestige:5,
      reward:{
        reputation:25,
        experience:2500
      },
      awardedDay:361
    }
  );

  const page=
    awardCeremonyPageSystem.getPage(
      "restaurant_a"
    );

  assert.equal(
    page.hasAward,
    true
  );

  assert.equal(
    page.award.name,
    "年度餐厅"
  );

  assert.equal(
    page.reward.reputation,
    25
  );

  const html=
    new AwardCeremonyView()
      .renderMarkup(
        page
      );

  assert.match(
    html,
    /正式颁奖/
  );

  assert.match(
    html,
    /测试餐厅/
  );

  assert.match(
    html,
    /data-image-slot="award-trophy"/
  );
});


test("颁奖典礼已经接入正式运行时", () => {
  assert.equal(
    formalPageRuntime.has(
      "award-ceremony"
    ),
    true
  );
});
