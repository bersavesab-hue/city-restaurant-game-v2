import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  MARKETING_ACTIONS_V1,
  MARKETING_ACTION_DATASET_META
} from "../src/data/marketingActions.v1.js";

import {
  MARKETING_ACTION_CATEGORIES,
  MARKETING_ACTION_CHANNELS,
  validateMarketingAction
} from "../src/data/marketingActionRules.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  financeSystem,
  salesChannelSystem,
  marketActionSystem
} = app.systems;

const LEGACY_IDS = [
  "local_ads",
  "flash_coupon",
  "quality_campaign",
  "service_campaign"
];

function createRestaurant(
  name = "营销测试店"
) {
  const restaurant =
    restaurantSystem.create({
      name
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  return restaurant;
}

test(
  "正式营销动作固定36项并覆盖9类",
  () => {
    assert.equal(
      MARKETING_ACTION_DATASET_META.total,
      36
    );

    assert.equal(
      MARKETING_ACTIONS_V1.length,
      36
    );

    assert.equal(
      new Set(
        MARKETING_ACTIONS_V1.map(
          item => item.id
        )
      ).size,
      36
    );

    const categories =
      new Set(
        MARKETING_ACTIONS_V1.map(
          item => item.category
        )
      );

    assert.equal(
      categories.size,
      9
    );

    for (
      const category
      of MARKETING_ACTION_CATEGORIES
    ) {
      assert.equal(
        MARKETING_ACTIONS_V1.filter(
          item =>
            item.category ===
            category
        ).length,
        4,
        category
      );
    }

    const ids =
      new Set(
        MARKETING_ACTIONS_V1.map(
          item => item.id
        )
      );

    for (
      const id
      of LEGACY_IDS
    ) {
      assert.ok(
        ids.has(id),
        id
      );
    }

    for (
      const item
      of MARKETING_ACTIONS_V1
    ) {
      assert.equal(
        validateMarketingAction(
          item
        ),
        true,
        item.id
      );
    }
  }
);

test(
  "营销动作只引用正式客群和正式销售渠道",
  () => {
    const segmentIds =
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      );

    for (
      const item
      of MARKETING_ACTIONS_V1
    ) {
      for (
        const segmentId
        of item.targetSegments
      ) {
        assert.ok(
          segmentIds.has(
            segmentId
          ),
          `${item.id} -> target ${segmentId}`
        );
      }

      for (
        const segmentId
        of Object.keys(
          item.modifiers
            .segmentMultipliers
        )
      ) {
        assert.ok(
          segmentIds.has(
            segmentId
          ),
          `${item.id} -> segment ${segmentId}`
        );
      }

      for (
        const channelId
        of item.requiredChannels
      ) {
        assert.ok(
          MARKETING_ACTION_CHANNELS
            .includes(
              channelId
            ),
          `${item.id} -> channel ${channelId}`
        );
      }

      for (
        const channelId
        of Object.keys(
          item.modifiers
            .channelMultipliers
        )
      ) {
        assert.ok(
          MARKETING_ACTION_CHANNELS
            .includes(
              channelId
            ),
          `${item.id} -> modifier channel ${channelId}`
        );
      }
    }
  }
);

test(
  "营销动作执行时会检查同类互斥和冷却",
  () => {
    gameState.reset();

    const restaurant =
      createRestaurant();

    assert.equal(
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "local_ads",
          1
        )
        .canStart,
      true
    );

    marketActionSystem
      .startAction(
        restaurant.id,
        "local_ads"
      );

    const exclusive =
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "street_flyer",
          1
        );

    assert.equal(
      exclusive.canStart,
      false
    );

    assert.ok(
      exclusive.reasons
        .includes(
          "exclusive_group"
        )
    );

    const cooldown =
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "local_ads",
          10
        );

    assert.equal(
      cooldown.canStart,
      false
    );

    assert.ok(
      cooldown.reasons
        .includes(
          "cooldown"
        )
    );

    assert.equal(
      cooldown.availableDay,
      11
    );

    assert.equal(
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "local_ads",
          11
        )
        .canStart,
      true
    );
  }
);

test(
  "外卖营销必须先满足门店等级并开启外卖渠道",
  () => {
    gameState.reset();

    const restaurant =
      createRestaurant(
        "渠道营销测试店"
      );

    let status =
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "delivery_new_customer"
        );

    assert.equal(
      status.canStart,
      false
    );

    assert.ok(
      status.reasons
        .includes(
          "restaurant_level"
        )
    );

    assert.ok(
      status.reasons
        .includes(
          "required_channel"
        )
    );

    restaurantSystem.setLevel(
      restaurant.id,
      2
    );

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        reputation: 10,
        customerSatisfaction: 60
      }
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

    status =
      marketActionSystem
        .getAvailability(
          restaurant.id,
          "delivery_new_customer"
        );

    assert.equal(
      status.canStart,
      true
    );

    marketActionSystem
      .startAction(
        restaurant.id,
        "delivery_new_customer"
      );

    const modifiers =
      marketActionSystem
        .getModifiers(
          restaurant.id
        );

    assert.ok(
      modifiers
        .channelMultipliers
        .delivery >
      1
    );

    assert.ok(
      modifiers
        .segmentMultipliers
        .delivery_heavy >
      1
    );
  }
);

test(
  "旧品质与服务动作现在存在真实可消费效果",
  () => {
    const quality =
      marketActionSystem
        .getDefinition(
          "quality_campaign"
        );

    const service =
      marketActionSystem
        .getDefinition(
          "service_campaign"
        );

    assert.equal(
      quality.modifiers
        .qualityBonus,
      8
    );

    assert.ok(
      quality.modifiers
        .reviewPropensityMultiplier >
      1
    );

    assert.ok(
      service.modifiers
        .serviceCapacityMultiplier >
      1
    );

    assert.ok(
      service.modifiers
        .repeatIntentMultiplier >
      1
    );
  }
);
