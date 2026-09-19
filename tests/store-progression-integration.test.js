import test from "node:test";
import assert from "node:assert/strict";

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
  storeProgressSystem
} from "../src/systems/StoreProgressSystem.js";

import {
  serviceCapacitySystem
} from "../src/systems/ServiceCapacitySystem.js";

import {
  moreHubPageSystem
} from "../src/ui/pages/more/MoreHubPageSystem.js";

import {
  operationsHubPageSystem
} from "../src/ui/pages/operations-hub/OperationsHubPageSystem.js";

import {
  StoreProgressView
} from "../src/ui/pages/progress/StoreProgressView.js";

import {
  storeProgressPageSystem
} from "../src/ui/pages/progress/StoreProgressPageSystem.js";

test(
  "一次获得足够经验可以连续升级且每级里程碑只记录一次",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "成长跨级测试店"
      });

    storeProgressSystem
      .addExperience(
        restaurant.id,
        3600
      );

    const updated =
      restaurantSystem.get(
        restaurant.id
      );

    assert.equal(
      updated.level,
      4
    );

    assert.equal(
      updated.experience,
      3600
    );

    const milestones =
      storeProgressSystem
        .getMilestones(
          restaurant.id
        );

    assert.deepEqual(
      milestones.map(
        item => item.level
      ),
      [4, 3, 2]
    );

    const lv4 =
      milestones.find(
        item =>
          item.level === 4
      );

    assert.deepEqual(
      lv4.limitIncrease,
      {
        employees: 2,
        menuItems: 4,
        tables: 4,
        kitchenStations: 1
      }
    );

    storeProgressSystem
      .addExperience(
        restaurant.id,
        100
      );

    assert.equal(
      storeProgressSystem
        .getMilestones(
          restaurant.id
        ).length,
      3
    );
  }
);

test(
  "产能手动配置不能绕过当前门店餐桌和厨房工位等级上限",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "成长产能测试店"
      });

    assert.throws(
      () =>
        serviceCapacitySystem
          .configure(
            restaurant.id,
            {
              seats: 40,
              tables: 7,
              kitchenStations: 2
            }
          ),
      /Table limit reached: 6/
    );

    restaurantSystem.setLevel(
      restaurant.id,
      2
    );

    assert.doesNotThrow(
      () =>
        serviceCapacitySystem
          .configure(
            restaurant.id,
            {
              seats: 40,
              tables: 8,
              kitchenStations: 3
            }
          )
    );

    assert.throws(
      () =>
        serviceCapacitySystem
          .configure(
            restaurant.id,
            {
              seats: 40,
              tables: 8,
              kitchenStations: 4
            }
          ),
      /Kitchen station limit reached: 3/
    );
  }
);

test(
  "第二门店入口Lv6开放且会员入口Lv7开放",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "成长入口测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    let page =
      moreHubPageSystem
        .getPage(
          restaurant.id
        );

    const findEntry =
      id =>
        page.groups
          .flatMap(
            group =>
              group.entries
          )
          .find(
            item =>
              item.id === id
          );

    assert.equal(
      findEntry(
        "member-marketing"
      ).state,
      "locked"
    );

    assert.equal(
      findEntry(
        "member-marketing"
      ).unlockLevel,
      7
    );

    restaurantSystem.setLevel(
      restaurant.id,
      6
    );

    page =
      moreHubPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.groups
        .flatMap(
          group =>
            group.entries
        )
        .find(
          item =>
            item.id ===
            "chain"
        ).state,
      "ready"
    );

    assert.equal(
      page.groups
        .flatMap(
          group =>
            group.entries
        )
        .find(
          item =>
            item.id ===
            "chain"
        ).unlockLevel,
      6
    );

    restaurantSystem.setLevel(
      restaurant.id,
      7
    );

    page =
      moreHubPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.groups
        .flatMap(
          group =>
            group.entries
        )
        .find(
          item =>
            item.id ===
            "member-marketing"
        ).state,
      "ready"
    );

    assert.equal(
      page.groups
        .flatMap(
          group =>
            group.entries
        )
        .find(
          item =>
            item.id ===
            "chain"
        ).state,
      "ready"
    );
  }
);

test(
  "市场策略主入口在Lv3前锁定并在Lv3开放",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "市场解锁测试店"
      });

    let page =
      operationsHubPageSystem
        .getPage(
          restaurant.id
        );

    let market =
      page.entries.find(
        item =>
          item.id ===
          "market"
      );

    assert.equal(
      market.state,
      "locked"
    );

    assert.equal(
      market.unlockLevel,
      3
    );

    restaurantSystem.setLevel(
      restaurant.id,
      3
    );

    page =
      operationsHubPageSystem
        .getPage(
          restaurant.id
        );

    market =
      page.entries.find(
        item =>
          item.id ===
          "market"
      );

    assert.equal(
      market.state,
      "ready"
    );
  }
);

test(
  "成长页面展示经验来源容量奖励和升级记录",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "成长页面测试店"
      });

    storeProgressSystem
      .addExperience(
        restaurant.id,
        600
      );

    const page =
      storeProgressPageSystem
        .getPage(
          restaurant.id
        );

    const html =
      new StoreProgressView()
        .renderMarkup(
          page
        );

    assert.match(
      html,
      /经验来源/
    );

    assert.match(
      html,
      /升级容量/
    );

    assert.match(
      html,
      /升级记录/
    );

    assert.match(
      html,
      /稳定经营/
    );
  }
);
