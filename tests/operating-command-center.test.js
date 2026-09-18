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
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  operatingCommandCenterSystem
} from "../src/systems/OperatingCommandCenterSystem.js";

import {
  operatingCommandCenterPageSystem
} from "../src/ui/pages/command-center/OperatingCommandCenterPageSystem.js";

import {
  OperatingCommandCenterView
} from "../src/ui/pages/command-center/OperatingCommandCenterView.js";


test(
  "经营总控中心汇总今日收入利润订单客流渠道和待处理问题",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "总控测试餐厅"
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    const day =
      gameState
        .getSection(
          "time"
        ).day;

    entitySystem.create(
      "customer_order",
      {
        restaurantId:
          restaurant.id,

        status:
          "completed",

        day,

        channelId:
          "dine_in",

        totalRevenue:
          5000,

        paidAmount:
          5000,

        channelNetRevenue:
          5000,

        ingredientCost:
          2000,

        grossProfit:
          3000,

        items: [
          {
            menuItemId:
              "menu_dashboard_test",

            dishId:
              "dish_dashboard_test",

            quantity: 5,

            unitPrice: 1000,

            revenue: 5000
          }
        ]
      }
    );

    entitySystem.create(
      "service_capacity_record",
      {
        restaurantId:
          restaurant.id,

        day,

        arrivals: 20,
        servedGuests: 15,
        waitingGuests: 3,
        abandonedGuests: 5,
        lostRevenue: 5000
      }
    );

    const dashboard =
      operatingCommandCenterSystem
        .getDashboard(
          restaurant.id
        );

    assert.equal(
      dashboard.sales.orderCount,
      1
    );

    assert.equal(
      dashboard.sales.revenue,
      5000
    );

    assert.equal(
      dashboard.sales.profit,
      3000
    );

    assert.equal(
      dashboard.capacity.arrivals,
      20
    );

    assert.equal(
      dashboard.capacity.abandoned,
      5
    );

    assert.equal(
      dashboard.sales
        .channels[0]
        .channelId,
      "dine_in"
    );

    assert.ok(
      dashboard.priorities.length >
      0
    );

    const page =
      operatingCommandCenterPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new OperatingCommandCenterView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /经营总控|今日经营/
    );

    assert.match(
      html,
      /今日营业额/
    );

    assert.match(
      html,
      /今天最该处理/
    );

    assert.match(
      html,
      /渠道收入/
    );
  }
);
