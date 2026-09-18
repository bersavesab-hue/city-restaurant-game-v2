import test from "node:test";
import assert from "node:assert/strict";

import {
  DISH_RANK_LIST,
  getDishMasteryLevel,
  getDishRank,
  getCookOutputGrade
} from "../src/data/dishRules.js";

test(
  "菜品成长只使用五档品阶和五级熟练度",
  () => {
    assert.deepEqual(
      DISH_RANK_LIST.map(
        item => item.name
      ),
      [
        "家常",
        "优选",
        "招牌",
        "名菜",
        "镇店"
      ]
    );

    assert.equal(
      getDishMasteryLevel(0),
      1
    );

    assert.equal(
      getDishMasteryLevel(25),
      2
    );

    assert.equal(
      getDishMasteryLevel(80),
      3
    );

    assert.equal(
      getDishMasteryLevel(180),
      4
    );

    assert.equal(
      getDishMasteryLevel(360),
      5
    );
  }
);

test(
  "菜品品阶同时受熟练度与菜品质量分控制",
  () => {
    assert.equal(
      getDishRank({
        masteryLevel: 1,
        qualityScore: 100
      }).name,
      "家常"
    );

    assert.equal(
      getDishRank({
        masteryLevel: 3,
        qualityScore: 70
      }).name,
      "招牌"
    );

    assert.equal(
      getDishRank({
        masteryLevel: 5,
        qualityScore: 85
      }).name,
      "名菜"
    );

    assert.equal(
      getDishRank({
        masteryLevel: 5,
        qualityScore: 95
      }).name,
      "镇店"
    );
  }
);

test(
  "单次出品只使用C B A S四档",
  () => {
    assert.equal(
      getCookOutputGrade(59),
      "C"
    );

    assert.equal(
      getCookOutputGrade(60),
      "B"
    );

    assert.equal(
      getCookOutputGrade(75),
      "A"
    );

    assert.equal(
      getCookOutputGrade(90),
      "S"
    );

    assert.notEqual(
      getCookOutputGrade(100),
      "SS"
    );
  }
);
