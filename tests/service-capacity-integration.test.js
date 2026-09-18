import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  trafficSystem
} from "../src/systems/TrafficSystem.js";

import {
  serviceCapacitySystem
} from "../src/systems/ServiceCapacitySystem.js";

import {
  menuSystem
} from "../src/systems/MenuSystem.js";

import {
  employeeWorkSystem
} from "../src/systems/EmployeeWorkSystem.js";

import {
  marketActionSystem
} from "../src/systems/MarketActionSystem.js";

import {
  seatingSystem
} from "../src/systems/SeatingSystem.js";

import {
  trafficDemandSystem
} from "../src/systems/TrafficDemandSystem.js";

import {
  customerChoiceSystem
} from "../src/systems/CustomerChoiceSystem.js";

import {
  orderSystem
} from "../src/systems/OrderSystem.js";

import {
  customerExperienceSystem
} from "../src/systems/CustomerExperienceSystem.js";

test(
  "每小时真实营业经过桌位前厅厨房三级产能并把弃单计入体验和产能记录",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "营业产能集成测试店"
      });

    restaurantSystem.setLevel(
      restaurant.id,
      6
    );

    serviceCapacitySystem
      .configure(
        restaurant.id,
        {
          seats: 100,
          tables: 20,

          averageMealMinutes:
            60,

          kitchenStations:
            1,

          kitchenPortionsPerHour:
            10,

          serviceGuestsPerHour:
            50,

          queueToleranceMinutes:
            10,

          maxQueueGuests:
            50
        }
      );

    // -----------------------------
    // 隔离外部条件，只验证真实营业链路
    // -----------------------------

    restaurantSystem.isOpen =
      () => true;

    menuSystem.listByRestaurant =
      () => [
        {
          id:
            "menu_capacity_test",

          restaurantId:
            restaurant.id,

          recipeId:
            "recipe_capacity_test",

          dishId:
            "dish_capacity_test",

          active: true,

          price: 1000
        }
      ];

    employeeWorkSystem
      .getBestChef =
      () => ({
        employee: {
          id:
            "chef_capacity_test"
        },

        effectiveSkill:
          80
      });

    employeeWorkSystem
      .getServiceCapacity =
      () => 50;

    marketActionSystem
      .getModifiers =
      () => ({
        serviceCapacityMultiplier:
          1
      });

    trafficDemandSystem
      .getHourlyDemand =
      () => ({
        expectedVisitors:
          40,

        segments: [
          {
            segmentId:
              "general",

            expectedVisitors:
              40
          }
        ]
      });

    seatingSystem.getHourFlow =
      () => ({
        acceptedVisitors:
          40,

        queuedVisitors:
          0,

        queueAbandoned:
          0,

        seats:
          100,

        turnoverRate:
          1
      });

    customerChoiceSystem
      .chooseMenuItem =
      () => ({
        id:
          "menu_capacity_test"
      });

    orderSystem.place =
      () => ({
        id:
          "capacity_order",

        totalRevenue:
          1000,

        averageQuality:
          85
      });

    customerExperienceSystem
      .recordHour =
      ({
        result
      }) => ({
        satisfaction:
          result.rejectedVisitors >
          0
            ? 60
            : 85
      });

    const result =
      trafficSystem.simulateHour(
        restaurant.id,
        {
          minVisitors: 40,
          maxVisitors: 40
        }
      );

    assert.equal(
      result.visitors,
      10
    );

    assert.equal(
      result.completedOrders,
      10
    );

    assert.equal(
      result.kitchenCapacity,
      10
    );

    assert.equal(
      result.kitchenRejectedVisitors,
      30
    );

    assert.equal(
      result.serviceRejectedVisitors,
      0
    );

    assert.equal(
      result.rejectedVisitors,
      30
    );

    assert.equal(
      result.revenue,
      10000
    );

    assert.ok(
      result.capacityRecord
    );

    assert.equal(
      result.capacityRecord
        .arrivals,
      40
    );

    assert.equal(
      result.capacityRecord
        .servedGuests,
      10
    );

    assert.equal(
      result.capacityRecord
        .abandonedGuests,
      30
    );

    assert.equal(
      result.capacityRecord
        .lostRevenue,
      30000
    );

    assert.equal(
      result.capacityRecord
        .bottleneck.id,
      "kitchen"
    );

    const dashboard =
      serviceCapacitySystem
        .getDashboard(
          restaurant.id
        );

    assert.equal(
      dashboard.last7Days
        .arrivals,
      40
    );

    assert.equal(
      dashboard.last7Days
        .served,
      10
    );

    assert.equal(
      dashboard.last7Days
        .abandoned,
      30
    );

    assert.equal(
      dashboard
        .dominantBottleneck,
      "kitchen"
    );
  }
);
