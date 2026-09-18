import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { FormalPageRuntime } from "../src/ui/runtime/FormalPageRuntime.js";

test("经营总控跳转日报时会把day周期传给analytics", () => {
  gameState.reset();

  const restaurant = restaurantSystem.create({
    name: "路由参数测试店"
  });
  financeSystem.createAccount(restaurant.id, 50000);

  let clickHandler = null;
  let navigation = null;

  const root = {
    innerHTML: "",
    addEventListener(type, handler) {
      if (type === "click") clickHandler = handler;
    },
    removeEventListener() {},
    contains() { return true; }
  };

  const mounted = new FormalPageRuntime().mount({
    pageId: "operating-command-center",
    root,
    restaurantId: restaurant.id,
    onNavigate(pageId, nextRestaurantId, params) {
      navigation = { pageId, restaurantId: nextRestaurantId, params };
    }
  });

  clickHandler({
    target: {
      closest() {
        return {
          dataset: {
            pageTarget: "analytics",
            pagePeriod: "day"
          }
        };
      }
    }
  });

  assert.deepEqual(navigation, {
    pageId: "analytics",
    restaurantId: restaurant.id,
    params: { period: "day" }
  });

  mounted.destroy();
});
