import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  financeSystem,
  marketActionSystem
} = app.systems;

test(
  "竞争行动扣除资金并产生真实限时效果",
  () => {
    const restaurant =
      restaurantSystem.create({
        name:
          "竞争行动测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      10000
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const action =
      marketActionSystem
        .startAction(
          restaurant.id,
          "flash_coupon"
        );

    const after =
      financeSystem.getBalance(
        restaurant.id
      );

    assert.equal(
      before - after,
      1000
    );

    const modifiers =
      marketActionSystem
        .getModifiers(
          restaurant.id
        );

    assert.equal(
      modifiers.priceMultiplier,
      0.9
    );

    assert.ok(
      modifiers.demandMultiplier >
      1
    );

    assert.equal(
      marketActionSystem
        .getActiveActions(
          restaurant.id
        ).length,
      1
    );

    marketActionSystem
      .processDay(
        action.endDay + 1
      );

    assert.equal(
      marketActionSystem
        .getActiveActions(
          restaurant.id
        ).length,
      0
    );
  }
);
