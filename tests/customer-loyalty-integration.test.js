import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  eventBus
} from "../src/core/EventBus.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  customerSystem
} from "../src/systems/CustomerSystem.js";

import {
  customerLoyaltySystem
} from "../src/systems/CustomerLoyaltySystem.js";

import {
  customerLoyaltyIntegrationSystem
} from "../src/systems/CustomerLoyaltyIntegrationSystem.js";

import {
  customerManagementPageSystem
} from "../src/ui/pages/customers/CustomerManagementPageSystem.js";

import {
  CustomerManagementView
} from "../src/ui/pages/customers/CustomerManagementView.js";

test(
  "营业订单自动进入会员复购和普通客群统计并显示管理页面",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "顾客系统测试店"
      });

    const customer =
      customerSystem.create({
        name:
          "会员顾客",
        budget: 10000
      });

    customerLoyaltySystem
      .enrollMember({
        restaurantId:
          restaurant.id,

        customerId:
          customer.id,

        segmentId:
          "office"
      });

    eventBus.emit(
      "order:completed",
      {
        order: {
          id:
            "order_member_001",

          restaurantId:
            restaurant.id,

          customerId:
            customer.id,

          aggregate: false,

          items: [
            {
              dishId:
                "dish_rice",

              quantity: 2
            },
            {
              dishId:
                "dish_soup",

              quantity: 1
            }
          ],

          totalRevenue: 1800,
          averageQuality: 86
        }
      }
    );

    let profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.visits,
      1
    );

    assert.equal(
      profile.totalSpend,
      1800
    );

    assert.equal(
      profile.favoriteDishes[0]
        .dishId,
      "dish_rice"
    );

    assert.equal(
      profile.favoriteDishes[0]
        .count,
      2
    );

    eventBus.emit(
      "order:completed",
      {
        order: {
          id:
            "order_member_001",

          restaurantId:
            restaurant.id,

          customerId:
            customer.id,

          items: [],

          totalRevenue: 1800,
          averageQuality: 86
        }
      }
    );

    profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.visits,
      1
    );

    eventBus.emit(
      "order:completed",
      {
        order: {
          id:
            "order_bulk_001",

          restaurantId:
            restaurant.id,

          customerId:
            null,

          aggregate: true,

          orderCount: 12,

          segmentId:
            "student",

          items: [
            {
              dishId:
                "dish_rice",

              quantity: 12
            }
          ],

          totalRevenue: 6000,
          averageQuality: 75
        }
      }
    );

    const dashboard =
      customerLoyaltySystem
        .getDashboard(
          restaurant.id
        );

    assert.equal(
      dashboard.members,
      1
    );

    assert.equal(
      dashboard.memberVisits,
      1
    );

    assert.equal(
      dashboard.memberRevenue,
      1800
    );

    assert.equal(
      dashboard.anonymousVisitors,
      12
    );

    assert.equal(
      dashboard.anonymousRevenue,
      6000
    );

    const page =
      customerManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.members.length,
      1
    );

    assert.equal(
      page.segments.length,
      1
    );

    const view =
      new CustomerManagementView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /顾客与会员/
    );

    assert.match(
      html,
      /会员顾客/
    );

    assert.match(
      html,
      /会员复购率/
    );

    assert.match(
      html,
      /客群画像/
    );

    assert.ok(
      customerLoyaltyIntegrationSystem
        .started
    );
  }
);
