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
  moreHubPageSystem
} from "../src/ui/pages/more/MoreHubPageSystem.js";

import {
  MoreHubView
} from "../src/ui/pages/more/MoreHubView.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";


test("更多主入口直接落到唯一正式more", () => {
  assert.equal(
    gameplayNavigationSystem.getLandingPage("more"),
    "more"
  );

  assert.equal(
    formalPageRuntime.has("more"),
    true
  );
});


test("更多主页按确认稿保留三大区和十个正式入口", () => {
  gameState.reset();

  const restaurant =
    restaurantSystem.create({
      name: "更多页测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    10000
  );

  const page =
    moreHubPageSystem.getPage(
      restaurant.id
    );

  assert.deepEqual(
    page.groups.map(group => group.title),
    [
      "品牌与成长",
      "顾客与安全",
      "游戏服务"
    ]
  );

  assert.deepEqual(
    page.groups.map(group => group.entries.length),
    [4,3,3]
  );

  const titles =
    page.groups.flatMap(
      group =>
        group.entries.map(
          item => item.title
        )
    );

  assert.deepEqual(
    titles,
    [
      "连锁管理",
      "长期品牌基建",
      "排行榜",
      "荣誉殿堂",
      "会员营销",
      "评价反馈",
      "合规中心",
      "设置",
      "存档管理",
      "帮助与反馈"
    ]
  );

  const view =
    new MoreHubView();

  const html =
    view.renderMarkup(page);

  for (const text of [
    "更多",
    "品牌与成长",
    "顾客与安全",
    "游戏服务",
    "连锁管理",
    "长期品牌基建",
    "排行榜",
    "荣誉殿堂",
    "会员营销",
    "评价反馈",
    "合规中心",
    "设置",
    "存档管理",
    "帮助与反馈"
  ]) {
    assert.equal(
      html.includes(text),
      true,
      "更多页缺少：" + text
    );
  }

  assert.equal(
    html.includes("未读奖项"),
    false
  );

  assert.equal(
    html.includes("扩张与管理"),
    false
  );

  assert.equal(
    html.includes("测试反馈"),
    false
  );
});


test("Android运行时通过统一导航解析器进入more", () => {
  const source =
    fs.readFileSync(
      new URL(
        "../src/ui/runtime/AndroidPlaytestEntry.js",
        import.meta.url
      ),
      "utf8"
    );

  assert.equal(
    gameplayNavigationSystem.resolveNavigationTarget(
      "more"
    ),
    "more"
  );

  assert.match(
    source,
    /gameplayNavigationSystem[\s\S]*resolveNavigationTarget/
  );
});
