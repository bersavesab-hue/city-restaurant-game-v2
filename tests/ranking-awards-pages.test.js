import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  rankingCenterPageSystem
} from "../src/ui/pages/ranking/RankingCenterPageSystem.js";

import {
  awardsPageSystem
} from "../src/ui/pages/awards/AwardsPageSystem.js";

import {
  honorHallPageSystem
} from "../src/ui/pages/honors/HonorHallPageSystem.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";


test("排行榜奖项荣誉三个正式页面均已注册运行时", () => {
  assert.equal(
    formalPageRuntime.has(
      "ranking-center"
    ),
    true
  );

  assert.equal(
    formalPageRuntime.has(
      "awards-center"
    ),
    true
  );

  assert.equal(
    formalPageRuntime.has(
      "honor-hall"
    ),
    true
  );
});


test("三个页面在空奖项状态下均能生成页面模型", () => {
  gameState.reset();

  const restaurant=
    restaurantSystem.create({
      name:"榜单页面测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    10000
  );

  const ranking=
    rankingCenterPageSystem.getPage(
      restaurant.id
    );

  const awards=
    awardsPageSystem.getPage(
      restaurant.id
    );

  const hall=
    honorHallPageSystem.getPage(
      restaurant.id
    );

  assert.equal(
    ranking.pageId,
    "ranking-center"
  );

  assert.equal(
    ranking.boardCount,
    19
  );

  assert.equal(
    awards.pageId,
    "awards-center"
  );

  assert.equal(
    awards.totalAwardCount,
    60
  );

  assert.equal(
    hall.pageId,
    "honor-hall"
  );

  assert.equal(
    hall.summary.totalHonors,
    0
  );
});


test("经营主页存在排行榜奖项和荣誉馆入口", () => {
  const source=
    fs.readFileSync(
      new URL(
        "../src/ui/pages/operations-hub/OperationsHubPageSystem.js",
        import.meta.url
      ),
      "utf8"
    );

  assert.match(
    source,
    /ranking-center/
  );

  assert.match(
    source,
    /awards-center/
  );

  assert.match(
    source,
    /honor-hall/
  );
});
