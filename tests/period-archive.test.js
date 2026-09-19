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

      entitySystem.create(
        "operating_cost_settlement",
        {
          restaurantId:
            restaurant.id,
          day,
          orders: 2,
          openHours: 10,
          total: 10,
          paid: 10,
          unpaid: 0,

          usage: {
            electricityKwh: 1,
            waterTon: 0.1,
            gasCubicMeter: 0.2
          },

          breakdown: {
            electricity: 4,
            water: 1,
            gas: 2,
            waste: 2,
            internet: 1
          }
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
      .archiveOperatingCostMonths(
        restaurant.id,
        800
      );

    assert.equal(
      entitySystem.count(
        "monthly_operating_cost_settlement"
      ),
      14
    );

    assert.equal(
      entitySystem.count(
        "operating_cost_settlement"
      ),
      0
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

    periodArchiveSystem
      .archiveOperatingCostYears(
        restaurant.id,
        1500
      );

    assert.equal(
      entitySystem.count(
        "yearly_operating_cost_settlement"
      ),
      1
    );

    assert.equal(
      entitySystem.count(
        "monthly_operating_cost_settlement"
      ),
      2
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

    const costYear =
      entitySystem.list(
        "yearly_operating_cost_settlement"
      )[0];

    assert.equal(
      costYear.days,
      360
    );

    assert.equal(
      costYear.total,
      3600
    );

    assert.equal(
      costYear.paid,
      3600
    );

    assert.equal(
      costYear.usage
        .electricityKwh,
      360
    );

    assert.equal(
      costYear.breakdown
        .internet,
      360
    );
  }
);
