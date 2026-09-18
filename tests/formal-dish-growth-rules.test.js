import test from "node:test";
import assert from "node:assert/strict";

import {
  DISH_SCORE_SEMANTICS,
  DISH_RANK_LIST,
  DISH_MASTERY_THRESHOLDS,
  COOK_OUTPUT_LEVELS,
  getDishRank,
  getCookOutputGrade,
  validateDishGrowthRules
} from "../src/data/dishRules.js";

test(
  "菜品成长正式区分研发评分配方品质分和单次出品质量分",
  () => {
    assert.deepEqual(
      Object.keys(
        DISH_SCORE_SEMANTICS
      ),
      [
        "researchScore",
        "recipeQualityScore",
        "outputQualityScore"
      ]
    );

    assert.equal(
      validateDishGrowthRules(),
      true
    );
  }
);

test(
  "长期菜品只使用五级熟练度和五档品阶",
  () => {
    assert.equal(
      DISH_MASTERY_THRESHOLDS.length,
      5
    );

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
      getDishRank({
        masteryLevel: 1,
        recipeQualityScore: 100
      }).name,
      "家常"
    );

    assert.equal(
      getDishRank({
        masteryLevel: 5,
        recipeQualityScore: 95
      }).name,
      "镇店"
    );
  }
);

test(
  "单次出品只存在C B A S四档且不存在SS",
  () => {
    assert.deepEqual(
      COOK_OUTPUT_LEVELS.map(
        item => item.grade
      ),
      ["C", "B", "A", "S"]
    );

    assert.equal(
      getCookOutputGrade(100),
      "S"
    );

    assert.equal(
      COOK_OUTPUT_LEVELS.some(
        item => item.grade === "SS"
      ),
      false
    );
  }
);
