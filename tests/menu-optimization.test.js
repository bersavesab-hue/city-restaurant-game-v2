import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  menuOptimizationSystem
} from "../src/systems/MenuOptimizationSystem.js";

import {
  menuOptimizationPageSystem
} from "../src/ui/pages/menu-optimization/MenuOptimizationPageSystem.js";

import {
  MenuOptimizationView
} from "../src/ui/pages/menu-optimization/MenuOptimizationView.js";

test(
  "菜单调整支持改价置顶促销下架并比较调整前后经营效果",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "菜单调整测试店"
      });

    const menu =
      entitySystem.create(
        "menu_item",
        {
          restaurantId:
            restaurant.id,

          dishId:
            "dish_opt_test",

          recipeId:
            "recipe_opt_test",

          name:
            "测试招牌饭",

          price:
            1000,

          active:
            true,

          soldCount: 0,
          totalRevenue: 0
        }
      );

    // 调整前7天模拟数据
    for (
      let day = 1;
      day <= 7;
      day += 1
    ) {
      entitySystem.create(
        "customer_order",
        {
          restaurantId:
            restaurant.id,

          status:
            "completed",

          day,

          totalRevenue:
            2000,

          paidAmount:
            2000,

          channelNetRevenue:
            2000,

          ingredientCost:
            1000,

          items: [
            {
              menuItemId:
                menu.id,

              dishId:
                menu.dishId,

              quantity: 2,

              unitPrice: 1000,

              revenue: 2000,

              qualityScore: 80
            }
          ]
        }
      );
    }

    // 将当前时间推进到第8天
    const time =
      gameState.getSection(
        "time"
      );

    gameState.setSection(
      "time",
      {
        ...time,
        day: 8
      }
    );

    const priceAction =
      menuOptimizationSystem
        .changePrice({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id,

          newPrice:
            1200
        });

    assert.equal(
      priceAction.item.price,
      1200
    );

    const pinAction =
      menuOptimizationSystem
        .setPinned({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id,

          pinned: true,

          priority: 200
        });

    assert.equal(
      pinAction.item.menuPinned,
      true
    );

    assert.equal(
      pinAction.item.menuPriority,
      200
    );

    const promo =
      menuOptimizationSystem
        .startPromotion({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id,

          discountPercent: 25,

          durationDays: 3
        });

    assert.equal(
      promo.item.price,
      900
    );

    assert.equal(
      promo.promotion.originalPrice,
      1200
    );

    assert.equal(
      promo.promotion.promotionalPrice,
      900
    );

    const ended =
      menuOptimizationSystem
        .endPromotion({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id
        });

    assert.equal(
      ended.item.price,
      1200
    );

    const disabled =
      menuOptimizationSystem
        .setActive({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id,

          active: false
        });

    assert.equal(
      disabled.item.active,
      false
    );

    const enabled =
      menuOptimizationSystem
        .setActive({
          restaurantId:
            restaurant.id,

          menuItemId:
            menu.id,

          active: true
        });

    assert.equal(
      enabled.item.active,
      true
    );

    // 调整后模拟7天，销量和利润均提升
    for (
      let day = 8;
      day <= 14;
      day += 1
    ) {
      entitySystem.create(
        "customer_order",
        {
          restaurantId:
            restaurant.id,

          status:
            "completed",

          day,

          totalRevenue:
            3600,

          paidAmount:
            3600,

          channelNetRevenue:
            3600,

          ingredientCost:
            1200,

          items: [
            {
              menuItemId:
                menu.id,

              dishId:
                menu.dishId,

              quantity: 3,

              unitPrice: 1200,

              revenue: 3600,

              qualityScore: 82
            }
          ]
        }
      );
    }

    const now =
      gameState.getSection(
        "time"
      );

    gameState.setSection(
      "time",
      {
        ...now,
        day: 14
      }
    );

    const evaluation =
      menuOptimizationSystem
        .evaluateAction(
          priceAction.action.id
        );

    assert.equal(
      evaluation.complete,
      true
    );

    assert.equal(
      evaluation.result,
      "improved"
    );

    assert.ok(
      evaluation.delta.quantity >
      0
    );

    assert.ok(
      evaluation.delta
        .contributionProfit >
      0
    );

    const page =
      menuOptimizationPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new MenuOptimizationView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /菜单调整/
    );

    assert.match(
      html,
      /调整效果/
    );

    assert.match(
      html,
      /测试招牌饭/
    );
  }
);
