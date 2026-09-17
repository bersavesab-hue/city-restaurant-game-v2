import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

test("游戏总入口加载完整经营系统", () => {
  assert.ok(app.core);
  assert.ok(app.systems);

  assert.ok(
    app.core.simulationSystem
      .list()
      .some(
        (item) =>
          item.name ===
          "restaurant_operations"
      )
  );

  assert.ok(
    app.systems.restaurantSystem
  );

  assert.ok(
    app.systems.orderSystem
  );

  assert.ok(
    app.systems.operatingCycleSystem
  );
});
