import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  salesChannelSystem
} from "../src/systems/SalesChannelSystem.js";

import {
  orderSystem
} from "../src/systems/OrderSystem.js";

import {
  employeeWorkSystem
} from "../src/systems/EmployeeWorkSystem.js";

import {
  menuSystem
} from "../src/systems/MenuSystem.js";

import {
  recipeSystem
} from "../src/systems/RecipeSystem.js";

import {
  inventorySystem
} from "../src/systems/InventorySystem.js";

import {
  cookingSystem
} from "../src/systems/CookingSystem.js";

import {
  marketActionSystem
} from "../src/systems/MarketActionSystem.js";

test(
  "外卖订单自动扣除平台佣金和包装费并进入渠道经营统计与财务",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "外卖渠道测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 3,
        reputation: 30,
        customerSatisfaction: 80
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    salesChannelSystem
      .ensureRestaurantChannels(
        restaurant.id
      );

    salesChannelSystem.unlock(
      restaurant.id,
      "delivery"
    );

    salesChannelSystem.setActive(
      restaurant.id,
      "delivery",
      true
    );

    restaurantSystem.isOpen =
      () => true;

    employeeWorkSystem
      .requireChef =
      () => ({
        employee: {
          id:
            "employee_delivery_test"
        },

        effectiveSkill:
          80
      });

    employeeWorkSystem
      .recordWork =
      () => null;

    marketActionSystem
      .getModifiers =
      () => ({
        priceMultiplier: 1
      });

    menuSystem.get =
      () => ({
        id:
          "menu_delivery_test",

        restaurantId:
          restaurant.id,

        active: true,

        recipeId:
          "recipe_delivery_test",

        dishId:
          "dish_delivery_test",

        price:
          10000
      });

    menuSystem.recordSale =
      () => null;

    recipeSystem.get =
      () => ({
        id:
          "recipe_delivery_test",

        dishId:
          "dish_delivery_test",

        cookingMinutes: 10,

        ingredients: [],

        ingredientEfficiency: 1
      });

    inventorySystem
      .getAvailableQuantity =
      () => 999999;

    cookingSystem.cook =
      () => ({
        id:
          "cooking_delivery_test",

        ingredientCost:
          2000,

        qualityScore:
          85
      });

    const balanceBefore =
      financeSystem.getBalance(
        restaurant.id
      );

    const order =
      orderSystem.place({
        restaurantId:
          restaurant.id,

        customerId: null,

        channelId:
          "delivery",

        items: [
          {
            menuItemId:
              "menu_delivery_test",

            quantity: 1
          }
        ]
      });

    assert.equal(
      order.channelId,
      "delivery"
    );

    assert.equal(
      order.grossRevenue,
      10000
    );

    assert.equal(
      order.paidAmount,
      10000
    );

    assert.equal(
      order.channelCommission,
      1800
    );

    assert.equal(
      order.channelPackagingCost,
      180
    );

    assert.equal(
      order.channelFees,
      1980
    );

    assert.equal(
      order.channelNetRevenue,
      8020
    );

    assert.equal(
      order.grossProfit,
      6020
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      balanceBefore +
      8020
    );

    const commission =
      entitySystem.get(
        "finance_transaction",
        order
          .channelCommissionTransactionId
      );

    const packaging =
      entitySystem.get(
        "finance_transaction",
        order
          .channelPackagingTransactionId
      );

    assert.equal(
      commission.amount,
      1800
    );

    assert.equal(
      commission.transactionType,
      "expense"
    );

    assert.equal(
      packaging.amount,
      180
    );

    const dashboard =
      salesChannelSystem
        .getDashboard(
          restaurant.id
        );

    const delivery =
      dashboard.channels.find(
        item =>
          item.id ===
          "delivery"
      );

    assert.equal(
      delivery.lifetimeOrders,
      1
    );

    assert.equal(
      delivery.lifetimeGrossRevenue,
      10000
    );

    assert.equal(
      delivery.lifetimeNetRevenue,
      8020
    );

    assert.equal(
      delivery.performance.orderCount,
      1
    );

    assert.equal(
      delivery.performance
        .averageOrderValue,
      10000
    );

    assert.equal(
      delivery.performance.profit,
      6020
    );
  }
);
