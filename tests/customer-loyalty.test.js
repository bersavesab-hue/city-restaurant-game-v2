import test from "node:test";
import assert from "node:assert/strict";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  customerSystem
} from "../src/systems/CustomerSystem.js";

import {
  customerLoyaltySystem
} from "../src/systems/CustomerLoyaltySystem.js";

test(
  "普通客群聚合且会员持久记录复购等级积分消费和偏好",
  () => {
    const restaurant =
      restaurantSystem.create({
        name:
          "会员测试店"
      });

    const customer =
      customerSystem.create({
        name:
          "长期顾客",
        budget: 10000
      });

    const other =
      customerSystem.create({
        name:
          "新会员",
        budget: 10000
      });

    customerLoyaltySystem
      .recordAnonymousTraffic({
        restaurantId:
          restaurant.id,

        segmentId:
          "office",

        visitors: 40,
        served: 30,
        revenue: 8000,
        satisfaction: 72
      });

    customerLoyaltySystem
      .recordAnonymousTraffic({
        restaurantId:
          restaurant.id,

        segmentId:
          "office",

        visitors: 10,
        served: 8,
        revenue: 2400,
        satisfaction: 80
      });

    customerLoyaltySystem
      .enrollMember({
        restaurantId:
          restaurant.id,

        customerId:
          customer.id,

        segmentId:
          "office"
      });

    customerLoyaltySystem
      .enrollMember({
        restaurantId:
          restaurant.id,

        customerId:
          other.id,

        segmentId:
          "student"
      });

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      customerLoyaltySystem
        .recordMemberVisit({
          restaurantId:
            restaurant.id,

          customerId:
            customer.id,

          spend: 1000,

          satisfaction:
            80 + index,

          orderId:
            `order_${index}`,

          dishIds: [
            "dish_rice",
            "dish_rice",
            "dish_soup"
          ]
        });
    }

    const profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.visits,
      3
    );

    assert.equal(
      profile.repeatVisits,
      2
    );

    assert.equal(
      profile.totalSpend,
      3000
    );

    assert.equal(
      profile.levelId,
      "silver"
    );

    assert.equal(
      profile.points,
      30
    );

    assert.equal(
      profile.favoriteDishes[0]
        .dishId,
      "dish_rice"
    );

    assert.equal(
      profile.favoriteDishes[0]
        .count,
      6
    );

    assert.equal(
      profile.isRepeatCustomer,
      true
    );

    const dashboard =
      customerLoyaltySystem
        .getDashboard(
          restaurant.id
        );

    assert.equal(
      dashboard.members,
      2
    );

    assert.equal(
      dashboard.repeatMembers,
      1
    );

    assert.equal(
      dashboard.memberRepeatRate,
      50
    );

    assert.equal(
      dashboard.memberVisits,
      3
    );

    assert.equal(
      dashboard.memberRevenue,
      3000
    );

    assert.equal(
      dashboard.anonymousVisitors,
      50
    );

    assert.equal(
      dashboard.anonymousServed,
      38
    );

    assert.equal(
      dashboard.anonymousRevenue,
      10400
    );

    assert.equal(
      dashboard.levelCounts.silver,
      1
    );

    assert.equal(
      dashboard.levelCounts.member,
      1
    );

    assert.equal(
      dashboard.segments.length,
      1
    );
  }
);
