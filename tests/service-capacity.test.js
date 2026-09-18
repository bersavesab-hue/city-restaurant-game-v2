import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  serviceCapacitySystem
} from "../src/systems/ServiceCapacitySystem.js";

import {
  capacityManagementPageSystem
} from "../src/ui/pages/capacity/CapacityManagementPageSystem.js";

import {
  CapacityManagementView
} from "../src/ui/pages/capacity/CapacityManagementView.js";

test(
  "门店产能系统计算桌位厨房前厅排队等待弃单和损失营业额",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "产能测试店"
      });

    restaurantSystem.setLevel(
      restaurant.id,
      2
    );

    serviceCapacitySystem
      .configure(
        restaurant.id,
        {
          seats: 20,
          tables: 8,

          averageMealMinutes:
            60,

          kitchenStations:
            2,

          kitchenPortionsPerHour:
            30,

          serviceGuestsPerHour:
            24,

          queueToleranceMinutes:
            10,

          maxQueueGuests:
            30
        }
      );

    const result =
      serviceCapacitySystem
        .simulateWindow({
          restaurantId:
            restaurant.id,

          arrivals: 50,

          dineInShare:
            0.8,

          durationMinutes:
            60,

          averageSpend:
            1000
        });

    assert.equal(
      result.dineInGuests,
      40
    );

    assert.equal(
      result.offPremiseGuests,
      10
    );

    assert.equal(
      result.capacity
        .seatingGuests,
      20
    );

    assert.equal(
      result.capacity
        .kitchenGuests,
      30
    );

    assert.equal(
      result.capacity
        .serviceGuests,
      24
    );

    assert.equal(
      result.servedGuests,
      30
    );

    assert.ok(
      result
        .estimatedWaitMinutes >
      0
    );

    assert.ok(
      result.abandonedGuests >
      0
    );

    assert.ok(
      result.lostRevenue >
      0
    );

    assert.ok(
      [
        "kitchen",
        "seating",
        "service"
      ].includes(
        result.bottleneck.id
      )
    );

    const page =
      capacityManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.last7Days.arrivals,
      50
    );

    assert.equal(
      page.last7Days.served,
      30
    );

    assert.ok(
      page.last7Days
        .lostRevenue >
      0
    );

    const view =
      new CapacityManagementView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /产能与排队/
    );

    assert.match(
      html,
      /厨房小时产能/
    );

    assert.match(
      html,
      /平均等待/
    );

    assert.match(
      html,
      /流失营业额/
    );
  }
);
