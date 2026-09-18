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
  restaurantHubPageSystem
} from "../src/ui/pages/restaurant-hub/RestaurantHubPageSystem.js";

import {
  RestaurantHubView
} from "../src/ui/pages/restaurant-hub/RestaurantHubView.js";


test(
  "门店主页包含正式UI核心结构",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "门店UI测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const page =
      restaurantHubPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.pageId,
      "restaurant-home"
    );

    assert.equal(
      page.restaurant.name,
      "门店UI测试店"
    );

    assert.equal(
      page.bottomNavigation.length,
      7
    );

    const view =
      new RestaurantHubView();

    const html =
      view.renderMarkup(
        page
      );

    const requiredTexts = [
      "门店UI测试店",
      "包厢管理",
      "开店进度",
      "下一步建议",
      "拓展新商圈",
      "进入装修",
      "城市",
      "门店",
      "装修",
      "人员",
      "市场",
      "研发",
      "更多"
    ];

    for (
      const text
      of requiredTexts
    ) {
      assert.equal(
        html.includes(text),
        true,
        `页面缺少文本：${text}`
      );
    }

    const requiredTargets = [
      "city",
      "restaurant",
      "renovation",
      "employees",
      "channels",
      "dishes",
      "more"
    ];

    for (
      const target
      of requiredTargets
    ) {
      assert.equal(
        html.includes(
          `data-page-target="${target}"`
        ),
        true,
        `页面缺少导航：${target}`
      );
    }
  }
);
