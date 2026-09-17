import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  operatingAnalyticsSystem
} = app.systems;

test(
  "经营趋势比较与菜品健康接口完整",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "经营分析测试店"
      });

    const comparison =
      operatingAnalyticsSystem
        .compare(
          restaurant.id,
          "week"
        );

    assert.equal(
      comparison.period,
      "week"
    );

    assert.ok(
      comparison.current
    );

    assert.ok(
      comparison.previous
    );

    assert.ok(
      comparison.changes
    );

    const trend =
      operatingAnalyticsSystem
        .getTrend(
          restaurant.id,
          30
        );

    assert.ok(
      Array.isArray(trend)
    );

    const rankings =
      operatingAnalyticsSystem
        .getRankings(
          restaurant.id,
          7
        );

    assert.ok(
      Array.isArray(
        rankings.bySales
      )
    );

    assert.ok(
      Array.isArray(
        rankings.byRevenue
      )
    );

    assert.ok(
      Array.isArray(
        rankings.byProfit
      )
    );

    assert.ok(
      Array.isArray(
        rankings.warnings
      )
    );
  }
);
