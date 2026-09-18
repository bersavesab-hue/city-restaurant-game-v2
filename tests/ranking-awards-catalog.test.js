import test from "node:test";
import assert from "node:assert/strict";

import {
  AWARD_DEFINITIONS,
  AWARD_PERIODS,
  AWARD_DIVISIONS
} from "../src/data/awardDefinitions.js";

import {
  RANKING_DEFINITIONS
} from "../src/systems/RankingCenterSystem.js";


test("奖项目录完整且ID唯一", () => {
  assert.equal(AWARD_DEFINITIONS.length, 61);

  const ids=
    AWARD_DEFINITIONS.map(
      item => item.id
    );

  assert.equal(
    new Set(ids).size,
    ids.length
  );

  assert.deepEqual(
    Object.keys(AWARD_PERIODS).sort(),
    [
      "annual",
      "monthly",
      "quarterly"
    ]
  );

  assert.equal(
    Object.keys(AWARD_DIVISIONS).length,
    8
  );
});


test("61个奖项的周期类别对象指标和奖励均合法", () => {
  const metrics=new Set([
    "marketShare",
    "reputationScore",
    "serviceScore",
    "qualityScore",
    "revenue",
    "profit",
    "profitMargin",
    "customerScore",
    "experienceGained",
    "quantity",
    "contributionProfit",
    "averageQuality",
    "innovationScore",
    "craftScore",
    "growthScore",
    "competitiveScore",
    "brandScore",
    "repeatRate",
    "costEfficiency",
    "teamScore",
    "signatureScore",
    "marginScore",
    "leadershipScore",
    "legendScore",
    "loyaltyScore"
  ]);

  for(const award of AWARD_DEFINITIONS){
    assert.ok(AWARD_PERIODS[award.period],award.id);

    assert.ok(
      Object.prototype.hasOwnProperty.call(
        AWARD_DIVISIONS,
        award.division
      ),
      award.id
    );

    assert.ok(
      ["restaurant","dish","employee"].includes(
        award.subject
      ),
      award.id
    );

    assert.ok(
      ["district","city","player","restaurant"].includes(
        award.scope
      ),
      award.id
    );

    assert.ok(
      metrics.has(award.metric),
      award.id
    );

    assert.ok(
      award.finalistCount >= 1,
      award.id
    );

    assert.ok(
      award.reward.reputation >= 0,
      award.id
    );

    assert.ok(
      award.reward.experience >= 0,
      award.id
    );
  }
});


test("排行榜定义完整且ID唯一", () => {
  assert.equal(RANKING_DEFINITIONS.length,19);

  const ids=
    RANKING_DEFINITIONS.map(
      item => item.id
    );

  assert.equal(
    new Set(ids).size,
    ids.length
  );
});
