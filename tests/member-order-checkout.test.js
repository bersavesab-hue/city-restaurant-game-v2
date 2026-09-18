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
  customerSystem
} from "../src/systems/CustomerSystem.js";

import {
  customerLoyaltySystem
} from "../src/systems/CustomerLoyaltySystem.js";

import {
  memberBenefitSystem
} from "../src/systems/MemberBenefitSystem.js";

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

test(
  "会员订单按等级折扣优惠券和积分后的实付金额进入财务并自动统计营销转化",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "会员结账测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const customer =
      customerSystem.create({
        name:
          "结账会员",

        budget:
          10000
      });

    customerLoyaltySystem
      .enrollMember({
        restaurantId:
          restaurant.id,

        customerId:
          customer.id
      });

    for (
      let i = 0;
      i < 3;
      i += 1
    ) {
      customerLoyaltySystem
        .recordMemberVisit({
          restaurantId:
            restaurant.id,

          customerId:
            customer.id,

          spend:
            1000,

          satisfaction:
            85,

          orderId:
            `history_${i}`,

          dishIds: [
            "dish_test"
          ]
        });
    }

    assert.equal(
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        )
        .levelId,
      "silver"
    );

    const launched =
      memberBenefitSystem
        .launchCampaign({
          restaurantId:
            restaurant.id,

          name:
            "会员实付测试",

          audience:
            "repeat",

          budget:
            600,

          couponType:
            "fixed",

          couponValue:
            500,

          minimumSpend:
            1500,

          validDays:
            7
        });

    const coupon =
      launched.issuedCoupons[0];

    assert.ok(coupon);

    // ---- 隔离订单核心外部依赖，只测试真正结账链路 ----

    restaurantSystem.isOpen =
      () => true;

    employeeWorkSystem
      .requireChef =
      () => ({
        employee: {
          id:
            "employee_checkout_test"
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
        priceMultiplier:
          1
      });

    dishLifecycleSystem
      .recordService =
      () => null;

    menuSystem.get =
      () => ({
        id:
          "menu_checkout_test",

        restaurantId:
          restaurant.id,

        active:
          true,

        recipeId:
          "recipe_checkout_test",

        dishId:
          "dish_test",

        price:
          2000
      });

    menuSystem.recordSale =
      () => null;

    recipeSystem.get =
      () => ({
        id:
          "recipe_checkout_test",

        dishId:
          "dish_test",

        cookingMinutes:
          10,

        ingredients:
          [],

        ingredientEfficiency:
          1
      });

    inventorySystem
      .getAvailableQuantity =
      () => 999999;

    cookingSystem.cook =
      () => ({
        id:
          "cooking_checkout_test",

        ingredientCost:
          600,

        qualityScore:
          85
      });

    const balanceBeforeOrder =
      financeSystem.getBalance(
        restaurant.id
      );

    const order =
      orderSystem.place({
        restaurantId:
          restaurant.id,

        customerId:
          customer.id,

        items: [
          {
            menuItemId:
              "menu_checkout_test",

            quantity:
              1
          }
        ],

        couponId:
          coupon.id,

        redeemPoints:
          10
      });

    // 原价 2000
    assert.equal(
      order.grossRevenue,
      2000
    );

    // 银卡 2% = 40
    assert.equal(
      order.memberDiscount,
      40
    );

    // 满减券500
    assert.equal(
      order.couponDiscount,
      500
    );

    // 10积分抵100
    assert.equal(
      order.pointDiscount,
      100
    );

    assert.equal(
      order.totalDiscount,
      640
    );

    assert.equal(
      order.paidAmount,
      1360
    );

    assert.equal(
      order.totalRevenue,
      1360
    );

    assert.equal(
      order.grossProfit,
      760
    );

    assert.ok(
      order.benefitRecordId
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      balanceBeforeOrder +
      1360
    );

    const transaction =
      entitySystem.get(
        "finance_transaction",
        order.transactionId
      );

    assert.equal(
      transaction.amount,
      1360
    );

    assert.equal(
      transaction
        .transactionType,
      "income"
    );

    const usedCoupon =
      entitySystem.get(
        "member_coupon",
        coupon.id
      );

    assert.equal(
      usedCoupon.status,
      "used"
    );

    assert.equal(
      usedCoupon.usedOrderId,
      order.id
    );

    const campaign =
      memberBenefitSystem
        .getCampaignSummary(
          launched.campaign.id
        );

    assert.equal(
      campaign.conversionCount,
      1
    );

    assert.equal(
      campaign
        .attributedRevenue,
      1360
    );
  }
);
