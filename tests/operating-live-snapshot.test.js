import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { entitySystem } from "../src/core/EntitySystem.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { OperatingCommandCenterSystem } from "../src/systems/OperatingCommandCenterSystem.js";

test("经营总控汇总最新营业小时客流订单瓶颈和员工疲劳", () => {
  gameState.reset();

  const restaurant = restaurantSystem.create({
    name: "营业现场测试店"
  });

  financeSystem.createAccount(restaurant.id, 100000);

  const time = gameState.getSection("time");

  entitySystem.create("employee", {
    restaurantId: restaurant.id,
    name: "厨师A",
    roleId: "chef",
    status: "active",
    fatigue: 80,
    mood: 60,
    loyalty: 60
  });

  entitySystem.create("employee", {
    restaurantId: restaurant.id,
    name: "服务员A",
    roleId: "server",
    status: "active",
    fatigue: 40,
    mood: 70,
    loyalty: 65
  });

  entitySystem.create("service_capacity_record", {
    restaurantId: restaurant.id,
    arrivals: 20,
    servedGuests: 15,
    waitingGuests: 3,
    abandonedGuests: 5,
    serviceRate: 75,
    abandonmentRate: 25,
    estimatedWaitMinutes: 12,
    lostRevenue: 140,
    bottleneck: {
      id: "kitchen",
      name: "厨房",
      ratio: 1.4
    },
    capacity: {
      seatingGuests: 20,
      serviceGuests: 18,
      kitchenGuests: 15
    },
    source: "actual_traffic",
    day: time.day,
    totalMinutes: time.totalMinutes
  });

  entitySystem.create("customer_order", {
    restaurantId: restaurant.id,
    status: "completed",
    day: time.day,
    createdAt: time.totalMinutes,
    channelId: "dine_in",
    totalRevenue: 280,
    paidAmount: 280,
    channelNetRevenue: 280,
    ingredientCost: 80,
    grossProfit: 200,
    averageQuality: 82,
    items: [
      {
        menuItemId: "menu_live",
        dishId: "dish_live",
        quantity: 10,
        revenue: 280
      }
    ]
  });

  const dashboard = new OperatingCommandCenterSystem().getDashboard(restaurant.id);

  assert.equal(dashboard.latestHour.arrivals, 20);
  assert.equal(dashboard.latestHour.served, 15);
  assert.equal(dashboard.latestHour.abandoned, 5);
  assert.equal(dashboard.latestHour.orders, 1);
  assert.equal(dashboard.latestHour.portions, 10);
  assert.equal(dashboard.latestHour.revenue, 280);
  assert.equal(dashboard.latestHour.averageQuality, 82);
  assert.equal(dashboard.latestHour.bottleneck.id, "kitchen");
  assert.equal(dashboard.workforcePulse.averageFatigue, 60);
  assert.equal(dashboard.workforcePulse.highFatigue, 1);
});
