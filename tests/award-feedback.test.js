import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  AwardFeedbackSystem
} from "../src/systems/AwardFeedbackSystem.js";


test("提名入围获奖会形成未读通知且不会重复", () => {
  gameState.reset();

  const fakeRanking={
    getBoards(){
      return [];
    }
  };

  const system=
    new AwardFeedbackSystem({
      rankingSystem:fakeRanking
    });

  const result={
    id:"award_result_test",
    awardId:"annual_test",
    awardName:"年度测试奖",
    period:"annual",
    periodKey:"Y1",
    division:"business",
    subjectType:"restaurant",
    endDay:360,
    resolvedDay:361,
    nominees:[
      {
        id:"restaurant_a",
        name:"测试门店",
        restaurantId:"restaurant_a",
        isPlayer:true,
        rank:1,
        stage:"winner",
        awardScore:98
      },
      {
        id:"dish_a",
        name:"测试菜",
        restaurantId:"restaurant_a",
        isPlayer:true,
        rank:2,
        stage:"finalist",
        awardScore:90
      }
    ]
  };

  assert.equal(
    system.recordResult(result).length,
    2
  );

  assert.equal(
    system.recordResult(result).length,
    0
  );

  const unread=
    system.getNotifications(
      "restaurant_a",
      {
        unreadOnly:true
      }
    );

  assert.equal(
    unread.length,
    2
  );

  assert.equal(
    unread.some(
      item =>
        item.action ===
        "award-ceremony"
    ),
    true
  );

  system.markResultRead(
    "restaurant_a",
    "award_result_test"
  );

  assert.equal(
    system.getUnreadCount(
      "restaurant_a"
    ),
    0
  );

  assert.equal(
    entitySystem.count(
      "award_notification"
    ),
    2
  );
});


test("排行榜反馈会计算冲前三差距", () => {
  const fakeRanking={
    getBoards(){
      return [
        {
          id:"city_brand",
          title:"全城品牌榜",
          format:"score",
          totalCandidates:4,
          rows:[
            {
              rank:1,
              id:"npc_1",
              score:100
            },
            {
              rank:2,
              id:"npc_2",
              score:90
            },
            {
              rank:3,
              id:"npc_3",
              score:80
            },
            {
              rank:4,
              id:"restaurant_a",
              score:70
            }
          ]
        }
      ];
    }
  };

  const system=
    new AwardFeedbackSystem({
      rankingSystem:fakeRanking
    });

  const chase=
    system.getRankingChase(
      "restaurant_a"
    );

  assert.equal(
    chase.length,
    1
  );

  assert.equal(
    chase[0].rank,
    4
  );

  assert.equal(
    chase[0].targetRank,
    3
  );

  assert.equal(
    chase[0].gap,
    10
  );

  assert.equal(
    chase[0].topThree,
    false
  );
});
