import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { entitySystem } from "../src/core/EntitySystem.js";
import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { periodArchiveSystem } from "../src/systems/PeriodArchiveSystem.js";

test(
  "日报按完整月份压缩，旧月报继续压缩成年报",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "长期归档测试店"
      });

    for (
      let day = 1;
      day <= 420;
      day += 1
    ) {
      entitySystem.create(
        "daily_settlement",
        {
          restaurantId:
            restaurant.id,
          day,
          orders: 2,
          revenue: 100,
          ingredientCost: 20,
          payrollDue: 10,
          payrollPaid: 10,
          operatingProfit: 70,
          cashOperatingProfit: 70
        }
      );
    }

    periodArchiveSystem
      .archiveMonths(
        restaurant.id,
        800
      );

    assert.equal(
      entitySystem.count(
        "monthly_settlement"
      ),
      14
    );

    periodArchiveSystem
      .archiveYears(
        restaurant.id,
        1500
      );

    assert.equal(
      entitySystem.count(
        "yearly_settlement"
      ),
      1
    );

    const year =
      entitySystem.list(
        "yearly_settlement"
      )[0];

    assert.equal(year.days, 360);
    assert.equal(year.orders, 720);
    assert.equal(year.revenue, 36000);

    assert.equal(
      entitySystem.count(
        "monthly_settlement"
      ),
      2
    );
  }
);
