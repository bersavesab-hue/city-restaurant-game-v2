import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  randomSystem
} from "../src/core/RandomSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  customerIdentitySystem
} from "../src/systems/CustomerIdentitySystem.js";

import {
  customerLoyaltySystem
} from "../src/systems/CustomerLoyaltySystem.js";

import {
  customerLoyaltyIntegrationSystem
} from "../src/systems/CustomerLoyaltyIntegrationSystem.js";

import {
  MEMBER_IDENTITY_POLICY
} from "../src/data/memberProgramRules.js";


test(
  "Lv7之前不生成识别熟客，Lv7后才开启身份池",
  () => {
    gameState.reset();

    randomSystem.setSeed(
      "customer-identity-unlock"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "身份解锁测试店"
      });

    assert.equal(
      customerIdentitySystem
        .resolveVisit({
          restaurantId:
            restaurant.id,
          segmentId:
            "breakfast_commuter",
          force:
            true
        }),
      null
    );

    restaurantSystem.setLevel(
      restaurant.id,
      7
    );

    const resolved =
      customerIdentitySystem
        .resolveVisit({
          restaurantId:
            restaurant.id,
          segmentId:
            "breakfast_commuter",
          force:
            true
        });

    assert.ok(
      resolved?.customer?.id
    );

    assert.equal(
      resolved.profile
        .segmentId,
      "breakfast_commuter"
    );

    assert.equal(
      customerIdentitySystem
        .getSummary(
          restaurant.id
        )
        .recognizedCustomers,
      1
    );
  }
);


test(
  "Lv7识别熟客满足行为条件后自动入会并形成复购",
  () => {
    gameState.reset();

    randomSystem.setSeed(
      "customer-auto-membership"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "熟客入会测试店"
      });

    restaurantSystem.setLevel(
      restaurant.id,
      7
    );

    const resolved =
      customerIdentitySystem
        .resolveVisit({
          restaurantId:
            restaurant.id,
          segmentId:
            "breakfast_commuter",
          force:
            true
        });

    const first =
      customerLoyaltyIntegrationSystem
        .processOrder({
          id:
            "identity_member_order_1",
          restaurantId:
            restaurant.id,
          customerId:
            resolved.customer.id,
          customerSegmentId:
            "breakfast_commuter",
          totalRevenue:
            120,
          averageQuality:
            86,
          items: [
            {
              dishId:
                "dish_breakfast",
              quantity:
                1
            }
          ]
        });

    assert.equal(
      first.mode,
      "member"
    );

    let profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          resolved.customer.id
        );

    assert.ok(profile);

    assert.equal(
      profile
        .enrollmentSource,
      "behavioral_auto"
    );

    customerLoyaltyIntegrationSystem
      .processOrder({
        id:
          "identity_member_order_2",
        restaurantId:
          restaurant.id,
        customerId:
          resolved.customer.id,
        customerSegmentId:
          "breakfast_commuter",
        totalRevenue:
          120,
        averageQuality:
          86,
        items: [
          {
            dishId:
              "dish_breakfast",
            quantity:
              1
          }
        ]
      });

    profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          resolved.customer.id
        );

    assert.equal(
      profile.visits,
      2
    );

    assert.equal(
      profile.repeatVisits,
      1
    );

    assert.ok(
      customerLoyaltySystem
        .getSegmentRetentionMultiplier(
          restaurant.id,
          "breakfast_commuter"
        ) >
      1
    );
  }
);


test(
  "长期批量订单也会形成有限量真实会员而不会无限创建顾客实体",
  () => {
    gameState.reset();

    randomSystem.setSeed(
      "aggregate-member-lifecycle"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "批量会员测试店"
      });

    restaurantSystem.setLevel(
      restaurant.id,
      7
    );

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    for (
      let index = 0;
      index < 30;
      index += 1
    ) {
      customerLoyaltyIntegrationSystem
        .processOrder({
          id:
            `aggregate_member_${index}`,
          restaurantId:
            restaurant.id,
          customerId:
            null,
          customerSegmentId:
            "breakfast_commuter",
          aggregate:
            true,
          orderCount:
            10,
          totalRevenue:
            220,
          averageQuality:
            86,
          items: [
            {
              dishId:
                "dish_breakfast",
              quantity:
                10
            }
          ]
        });
    }

    const identity =
      customerIdentitySystem
        .getSummary(
          restaurant.id
        );

    const dashboard =
      customerLoyaltySystem
        .getDashboard(
          restaurant.id
        );

    assert.ok(
      identity
        .recognizedCustomers >
      0
    );

    assert.ok(
      identity
        .recognizedCustomers <=
      MEMBER_IDENTITY_POLICY
        .maxRecognizedCustomersPerSegment
    );

    assert.ok(
      dashboard.members >
      0
    );

    assert.ok(
      dashboard.memberVisits >
      0
    );

    assert.ok(
      dashboard
        .memberRepeatRate >
      0
    );

    assert.ok(
      customerLoyaltySystem
        .getSegmentRetentionMultiplier(
          restaurant.id,
          "breakfast_commuter"
        ) >
      1
    );
  }
);

test(
  "中等入会倾向熟客会在多次识别复购后自动入会",
  () => {
    gameState.reset();

    randomSystem.setSeed(
      "repeat-driven-membership"
    );

    const restaurant =
      restaurantSystem.create({
        name:
          "重复熟客入会测试店"
      });

    restaurantSystem.setLevel(
      restaurant.id,
      7
    );

    const resolved =
      customerIdentitySystem
        .resolveVisit({
          restaurantId:
            restaurant.id,
          segmentId:
            "office_worker",
          force:
            true
        });

    customerLoyaltyIntegrationSystem
      .processOrder({
        id:
          "repeat_member_order_1",
        restaurantId:
          restaurant.id,
        customerId:
          resolved.customer.id,
        customerSegmentId:
          "office_worker",
        totalRevenue:
          120,
        averageQuality:
          86,
        items: [
          {
            dishId:
              "dish_lunch",
            quantity:
              1
          }
        ]
      });

    assert.equal(
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          resolved.customer.id
        ),
      null
    );

    let profile =
      resolved.profile;

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      profile =
        customerIdentitySystem
          .touchProfile(
            profile
          );
    }

    customerLoyaltyIntegrationSystem
      .processOrder({
        id:
          "repeat_member_order_2",
        restaurantId:
          restaurant.id,
        customerId:
          resolved.customer.id,
        customerSegmentId:
          "office_worker",
        totalRevenue:
          120,
        averageQuality:
          86,
        items: [
          {
            dishId:
              "dish_lunch",
            quantity:
              1
          }
        ]
      });

    const member =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          resolved.customer.id
        );

    assert.ok(member);

    assert.equal(
      member.enrollmentSource,
      "behavioral_auto"
    );

    assert.equal(
      member.visits,
      1
    );
  }
);
