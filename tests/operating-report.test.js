import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  operatingReportSystem
} = app.systems;

test(
  "经营报告可以生成日周月结构",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "报表测试店"
      });

    for (
      const period
      of [
        "day",
        "week",
        "month"
      ]
    ) {
      const report =
        operatingReportSystem
          .generate(
            restaurant.id,
            period
          );

      assert.equal(
        report.restaurantId,
        restaurant.id
      );

      assert.equal(
        report.period,
        period
      );

      assert.ok(
        report.finance
      );

      assert.ok(
        Array.isArray(
          report.dishes
        )
      );

      assert.ok(
        Array.isArray(
          report.advice
        )
      );
    }
  }
);
