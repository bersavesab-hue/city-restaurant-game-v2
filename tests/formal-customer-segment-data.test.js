import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  CUSTOMER_SEGMENT_DATASET_META,
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import {
  validateFormalCustomerSegment
} from "../src/data/customerSegmentRules.js";

import { app } from "../src/main.js";

import {
  salesChannelSystem
} from "../src/systems/SalesChannelSystem.js";


const {
  restaurantSystem,
  financeSystem,
  customerSegmentSystem,
  customerChoiceSystem,
  customerExperienceSystem,
  trafficDemandSystem,
  seatingSystem
} = app.systems;


test(
  "正式顾客客群包固定28类并保留原10个ID",
  () => {
    assert.equal(
      CUSTOMER_SEGMENT_DATASET_META.total,
      28
    );

    assert.equal(
      CUSTOMER_SEGMENTS_V3.length,
      28
    );

    assert.equal(
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      ).size,
      28
    );

    for (
      const id
      of [
        "office_worker",
        "resident",
        "student",
        "blue_collar",
        "senior",
        "tourist",
        "high_income",
        "business_guest",
        "foodie",
        "nightlife"
      ]
    ) {
      assert.ok(
        CUSTOMER_SEGMENTS_V3.some(
          item =>
            item.id ===
            id
        ),
        id
      );
    }

    for (
      const segment
      of CUSTOMER_SEGMENTS_V3
    ) {
      assert.equal(
        validateFormalCustomerSegment(
          segment
        ),
        true,
        segment.id
      );

      assert.ok(
        segment.partySize.average >=
          segment.partySize.min &&
        segment.partySize.average <=
          segment.partySize.max
      );

      assert.ok(
        Object.values(
          segment.channelPreferences
        ).some(
          value =>
            value > 0
        )
      );
    }
  }
);


test(
  "商圈旧配比保留为主权重但新增客群会按亲和度混入",
  () => {
    const mix =
      trafficDemandSystem
        .getCustomerMix({
          id: "cbd",
          zoneType: "cbd",
          customerMix: {
            office_worker: 60,
            business_guest: 25,
            high_income: 15
          }
        });

    const total =
      mix.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.share,
        0
      );

    assert.ok(
      Math.abs(
        total -
        1
      ) <
      0.000001
    );

    assert.ok(
      mix.some(
        item =>
          item.segmentId ===
          "office_worker"
      )
    );

    assert.ok(
      mix.some(
        item =>
          item.segmentId ===
          "young_professional"
      )
    );

    assert.ok(
      mix.find(
        item =>
          item.segmentId ===
          "office_worker"
      ).share >
      mix.find(
        item =>
          item.segmentId ===
          "young_professional"
      ).share
    );
  }
);


test(
  "渠道偏好会根据门店已开启渠道改变客群需求匹配",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "客群渠道测试店"
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 3,
        reputation: 20,
        customerSatisfaction: 70
      }
    );

    financeSystem.createAccount(
      restaurant.id,
      500000
    );

    const segment =
      customerSegmentSystem.get(
        "delivery_heavy"
      );

    const dineInOnly =
      trafficDemandSystem
        .getChannelAccessFactor(
          restaurant.id,
          segment
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

    const withDelivery =
      trafficDemandSystem
        .getChannelAccessFactor(
          restaurant.id,
          segment
        );

    assert.ok(
      withDelivery >
      dineInOnly
    );

    assert.ok(
      withDelivery <=
      1.2
    );
  }
);


test(
  "朋友聚餐客产生的多人排队压力高于独食客",
  () => {
    const solo =
      seatingSystem
        .getCustomerBehavior({
          segments: [
            {
              segmentId:
                "solo_diner",
              expectedVisitors: 20
            }
          ]
        });

    const group =
      seatingSystem
        .getCustomerBehavior({
          segments: [
            {
              segmentId:
                "social_group",
              expectedVisitors: 20
            }
          ]
        });

    assert.equal(
      solo.averagePartySize,
      1
    );

    assert.ok(
      group.averagePartySize >
      solo.averagePartySize
    );

    assert.ok(
      group.averageDiningMinutes >
      solo.averageDiningMinutes
    );
  }
);


test(
  "菜品标签偏好会真实进入客群选菜评分",
  () => {
    const segment =
      customerSegmentSystem.get(
        "health_conscious"
      );

    const steamed =
      customerChoiceSystem
        .getTastePreference(
          segment,
          {
            tags: [
              "steam"
            ]
          }
        );

    const unrelated =
      customerChoiceSystem
        .getTastePreference(
          segment,
          {
            tags: [
              "barbecue"
            ]
          }
        );

    assert.ok(
      steamed >
      unrelated
    );
  }
);


test(
  "相同消费体验下高复购客群复购更高且高评价客群评论更多",
  () => {
    gameState.reset();

    const regularStore =
      restaurantSystem.create({
        name:
          "熟客倾向测试店"
      });

    const touristStore =
      restaurantSystem.create({
        name:
          "游客评价测试店"
      });

    const result = {
      completedOrders: 100,
      visitors: 100,
      rejectedVisitors: 0,
      failedOrders: 0,
      queuedVisitors: 0,
      queueAbandoned: 0,
      serviceRejectedVisitors: 0,
      averageQuality: 82,
      estimatedWaitMinutes: 2,
      queuePatienceMinutes: 20
    };

    const regularExperience =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            regularStore.id,
          demand: {
            segments: [
              {
                segmentId:
                  "local_regular",
                expectedVisitors:
                  100,
                priceFactor: 1
              }
            ]
          },
          result
        });

    const touristExperience =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            touristStore.id,
          demand: {
            segments: [
              {
                segmentId:
                  "tourist",
                expectedVisitors:
                  100,
                priceFactor: 1
              }
            ]
          },
          result
        });

    assert.ok(
      regularExperience
        .repeatRate >
      touristExperience
        .repeatRate
    );

    assert.ok(
      restaurantSystem.get(
        touristStore.id
      ).totalReviews >
      restaurantSystem.get(
        regularStore.id
      ).totalReviews
    );

    assert.ok(
      regularExperience
        .repeatPreference >
      touristExperience
        .repeatPreference
    );

    assert.ok(
      touristExperience
        .reviewPropensity >
      regularExperience
        .reviewPropensity
    );
  }
);
