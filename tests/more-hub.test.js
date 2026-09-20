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
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";


test("更多主入口直接落到唯一正式more", () => {
  assert.equal(
    gameplayNavigationSystem
      .getLandingPage("more"),
    "more"
  );

  assert.equal(
    formalPageRuntime.has(
      "more"
    ),
    true
  );
});


test("更多主页只保留已经接入的正式功能入口", () => {
  gameState.reset();

  const restaurant=
    restaurantSystem.create({
      name:"更多页测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    10000
  );

  const page=
    moreHubPageSystem.getPage(
      restaurant.id
    );

  const targets=
    page.groups
      .flatMap(
        group =>
          group.entries
      )
      .map(
        item =>
          item.target
      );

  for(const target of [
    "member-marketing",
    "honor-hall",
    "awards-center",
    "lease",
    "chain",
    "brand-investments",
    "feedback",
    "settings"
  ]){
    assert.ok(
      targets.includes(target),
      target
    );
  }

  const investmentEntry =
    page.groups
      .flatMap(
        group =>
          group.entries
      )
      .find(
        item =>
          item.id ===
          "brand-investments"
      );

  assert.equal(
    investmentEntry.state,
    "locked"
  );

  assert.equal(
    investmentEntry.unlockLevel,
    7
  );

});


test("Android运行时通过统一导航解析器进入more", () => {
  const source=
    fs.readFileSync(
      new URL(
        "../src/ui/runtime/AndroidPlaytestEntry.js",
        import.meta.url
      ),
      "utf8"
    );

  assert.equal(
    gameplayNavigationSystem
      .resolveNavigationTarget(
        "more"
      ),
    "more"
  );

  assert.match(
    source,
    /gameplayNavigationSystem[\s\S]*resolveNavigationTarget/
  );

  assert.doesNotMatch(
    source,
    /当前APK主要用于测试选址、房源、装修、开店、员工、菜品和统一UI/
  );
});
