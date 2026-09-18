import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { timeSystem } from "../src/core/TimeSystem.js";
import { entitySystem } from "../src/core/EntitySystem.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { operatingCommandCenterPageSystem } from "../src/ui/pages/command-center/OperatingCommandCenterPageSystem.js";
import { OperatingCommandCenterView } from "../src/ui/pages/command-center/OperatingCommandCenterView.js";

test("第二天经营总控保留上一日经营结果并提供日分析入口", () => {
  gameState.reset();

  const restaurant = restaurantSystem.create({
    name: "日报体验测试店"
  });

  financeSystem.createAccount(restaurant.id, 100000);

  entitySystem.create("daily_settlement", {
    restaurantId: restaurant.id,
    day: 1,
    orders: 18,
    revenue: 3600,
    ingredientCost: 900,
    payrollDue: 300,
    operatingProfit: 2400,
    cashOperatingProfit: 2400,
    experienceGained: 216
  });

  timeSystem.advance(1440);

  const page = operatingCommandCenterPageSystem.getPage(restaurant.id);

  assert.equal(page.previousDay.day, 1);
  assert.equal(page.previousDay.orders, 18);
  assert.equal(page.previousDay.revenue, 3600);
  assert.equal(page.previousDay.operatingProfit, 2400);

  const html = new OperatingCommandCenterView().renderMarkup(page);

  assert.match(html, /昨日经营日报/);
  assert.match(html, /查看完整日报/);
  assert.match(html, /data-page-period="day"/);
});
