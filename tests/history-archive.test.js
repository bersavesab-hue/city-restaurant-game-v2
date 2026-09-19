import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { entitySystem } from "../src/core/EntitySystem.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { historyArchiveSystem } from "../src/systems/HistoryArchiveSystem.js";

test(
  "历史明细只保留最近30天",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name: "归档测试店"
      });

    const settlement =
      entitySystem.create(
        "daily_settlement",
        {
          restaurantId:
            restaurant.id,
          day: 1,
          orders: 1,
          revenue: 3000
        }
      );

    const archivedOrder =
      entitySystem.create(
        "customer_order",
        {
          restaurantId:
            restaurant.id,
          day: 1,
          totalRevenue: 3000,
          ingredientCost: 500,
          grossProfit: 2500,
          averageQuality: 80,
          items: [
            {
              dishId: "dish_a",
              quantity: 1,
              revenue: 3000,
              qualityScore: 80
            }
          ]
        }
      );

    entitySystem.create(
      "loyalty_order_record",
      {
        restaurantId:
          restaurant.id,
        orderId:
          archivedOrder.id,
        mode:
          "cohort"
      }
    );

    entitySystem.create(
      "cooking_record",
      {
        restaurantId:
          restaurant.id,
        day: 1,
        portions: 1,
        averageFreshness: 90,
        averageIngredientQuality: 3,
        chefSkill: 60
      }
    );

    entitySystem.create(
      "finance_transaction",
      {
        restaurantId:
          restaurant.id,
        day: 1,
        type: "income",
        category: "sales",
        amount: 3000
      }
    );

    const retainedOrder =
      entitySystem.create(
        "customer_order",
        {
          restaurantId:
            restaurant.id,
          day: 2,
          totalRevenue: 1000
        }
      );

    entitySystem.create(
      "loyalty_order_record",
      {
        restaurantId:
          restaurant.id,
        orderId:
          retainedOrder.id,
        mode:
          "cohort"
      }
    );

    historyArchiveSystem
      .processRestaurant(
        restaurant.id,
        32
      );

    const archived =
      entitySystem.get(
        "daily_settlement",
        settlement.id
      );

    assert.equal(
      archived.archived,
      true
    );

    assert.equal(
      archived.detailSummary
        .orders.orderCount,
      1
    );

    assert.equal(
      entitySystem
        .list("customer_order")
        .filter(x => x.day === 1)
        .length,
      0
    );

    assert.equal(
      entitySystem
        .list("cooking_record")
        .length,
      0
    );

    assert.equal(
      entitySystem
        .list("finance_transaction")
        .length,
      0
    );

    assert.equal(
      entitySystem
        .list("customer_order")
        .filter(x => x.day === 2)
        .length,
      1
    );

    assert.equal(
      entitySystem
        .list(
          "loyalty_order_record"
        )
        .some(
          item =>
            item.orderId ===
            archivedOrder.id
        ),
      false
    );

    assert.equal(
      entitySystem
        .list(
          "loyalty_order_record"
        )
        .some(
          item =>
            item.orderId ===
            retainedOrder.id
        ),
      true
    );
  }
);
