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

import {
  dishLifecycleSystem
} from "../src/systems/DishLifecycleSystem.js";

function createRestaurant(
  name = "渠道联动测试店"
) {
  const restaurant =
    restaurantSystem.create({
      name
    });

  entitySystem.update(
    "restaurant",
    restaurant.id,
    {
      level: 4,
      reputation: 40,
      customerSatisfaction: 85
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

  return restaurant;
}

function stubSingleDish(
  restaurantId
) {
  restaurantSystem.isOpen =
    () => true;

  employeeWorkSystem
    .requireChef =
    () => ({
      employee: {
        id:
          "channel_test_chef"
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
      priceMultiplier: 1,
      channelMultipliers: {}
    });

  dishLifecycleSystem
    .recordService =
    () => null;

  menuSystem.get =
    () => ({
      id:
        "channel_menu",
      restaurantId,
      active: true,
      recipeId:
        "channel_recipe",
      dishId:
        "channel_dish",
      price:
        10000
    });

  menuSystem.recordSale =
    () => null;

  recipeSystem.get =
    () => ({
      id:
        "channel_recipe",
      dishId:
        "channel_dish",
      cookingMinutes: 10,
      ingredients: [],
      ingredientEfficiency: 1
    });

  inventorySystem
    .getAvailableQuantity =
    () => 999999;

  let cookingCalls = 0;

  cookingSystem.cook =
    () => {
      cookingCalls += 1;

      return {
        id:
          `channel_cook_${cookingCalls}`,
        ingredientCost: 2000,
        qualityScore: 85
      };
    };

  return {
    getCookingCalls() {
      return cookingCalls;
    }
  };
}

test(
  "渠道小时容量会在第二单做菜前拦截",
  () => {
    gameState.reset();

    const restaurant =
      createRestaurant(
        "容量测试店"
      );

    salesChannelSystem
      .unlock(
        restaurant.id,
        "delivery"
      );

    salesChannelSystem
      .setActive(
        restaurant.id,
        "delivery",
        true
      );

    salesChannelSystem
      .configure(
        restaurant.id,
        "delivery",
        {
          orderLimitPerHour: 1
        }
      );

    const stub =
      stubSingleDish(
        restaurant.id
      );

    orderSystem.place({
      restaurantId:
        restaurant.id,
      channelId:
        "delivery",
      items: [
        {
          menuItemId:
            "channel_menu",
          quantity: 1
        }
      ]
    });

    assert.equal(
      stub.getCookingCalls(),
      1
    );

    assert.throws(
      () =>
        orderSystem.place({
          restaurantId:
            restaurant.id,
          channelId:
            "delivery",
          items: [
            {
              menuItemId:
                "channel_menu",
              quantity: 1
            }
          ]
        }),
      error =>
        error?.code ===
        "CHANNEL_CAPACITY_REACHED"
    );

    assert.equal(
      stub.getCookingCalls(),
      1
    );

    const capacity =
      salesChannelSystem
        .getCapacityStatus(
          restaurant.id,
          "delivery"
        );

    assert.equal(
      capacity.used,
      1
    );

    assert.equal(
      capacity.remaining,
      0
    );
  }
);

test(
  "客群偏好营销加成和渠道优先级共同改变分流权重",
  () => {
    gameState.reset();

    const restaurant =
      createRestaurant(
        "分流权重测试店"
      );

    salesChannelSystem
      .unlock(
        restaurant.id,
        "delivery"
      );

    salesChannelSystem
      .setActive(
        restaurant.id,
        "delivery",
        true
      );

    salesChannelSystem
      .configure(
        restaurant.id,
        "delivery",
        {
          priorityMultiplier:
            1.5
        }
      );

    const weights =
      salesChannelSystem
        .getDemandWeights(
          restaurant.id,
          {
            segment: {
              channelPreferences: {
                dine_in: 20,
                delivery: 80
              }
            },
            channelMultipliers: {
              delivery: 1.25
            }
          }
        );

    const byId =
      Object.fromEntries(
        weights.map(
          item => [
            item.channelId,
            item
          ]
        )
      );

    assert.ok(
      byId.delivery.weight >
      byId.dine_in.weight
    );

    assert.equal(
      byId.delivery
        .priorityMultiplier,
      1.5
    );

    assert.equal(
      byId.delivery
        .marketingMultiplier,
      1.25
    );
  }
);

test(
  "批量订单渠道结算不再引用未初始化变量且完整记录渠道利润",
  () => {
    gameState.reset();

    const restaurant =
      createRestaurant(
        "批量渠道测试店"
      );

    const stub =
      stubSingleDish(
        restaurant.id
      );

    const order =
      orderSystem.placeBulk({
        restaurantId:
          restaurant.id,
        menuItemId:
          "channel_menu",
        portions: 3,
        orderCount: 2,
        channelId:
          "dine_in"
      });

    assert.equal(
      stub.getCookingCalls(),
      1
    );

    assert.equal(
      order.channelId,
      "dine_in"
    );

    assert.equal(
      order.channelGrossRevenue,
      30000
    );

    assert.equal(
      order.channelFees,
      0
    );

    assert.equal(
      order.channelNetRevenue,
      30000
    );

    assert.equal(
      order.paidAmount,
      30000
    );

    const performance =
      salesChannelSystem
        .getChannelPerformance(
          restaurant.id,
          "dine_in"
        );

    assert.equal(
      performance.orderCount,
      2
    );

    assert.equal(
      performance
        .contributionProfit,
      28000
    );
  }
);

test(
  "渠道页面系统可调整优先级与小时接单上限",
  async () => {
    gameState.reset();

    const restaurant =
      createRestaurant(
        "渠道页面动作测试店"
      );

    const {
      channelManagementPageSystem
    } =
      await import(
        "../src/ui/pages/channels/ChannelManagementPageSystem.js"
      );

    channelManagementPageSystem
      .adjustPriority(
        restaurant.id,
        "dine_in",
        0.2
      );

    channelManagementPageSystem
      .adjustHourlyLimit(
        restaurant.id,
        "dine_in",
        4
      );

    const page =
      channelManagementPageSystem
        .getPage(
          restaurant.id
        );

    const dineIn =
      page.channels.find(
        item =>
          item.id ===
          "dine_in"
      );

    assert.equal(
      dineIn.priorityMultiplier,
      1.2
    );

    assert.equal(
      dineIn.orderLimitPerHour,
      40
    );
  }
);
