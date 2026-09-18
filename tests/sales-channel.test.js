import test from "node:test";
import assert from "node:assert/strict";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  salesChannelSystem
} from "../src/systems/SalesChannelSystem.js";

import {
  channelManagementPageSystem
} from "../src/ui/pages/channels/ChannelManagementPageSystem.js";

import {
  ChannelManagementView
} from "../src/ui/pages/channels/ChannelManagementView.js";

test(
  "销售渠道支持堂食自取外卖预约的解锁抽佣包装成本和收益测算",
  () => {
    const restaurant =
      restaurantSystem.create({
        name:
          "多渠道测试店"
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

    salesChannelSystem
      .ensureRestaurantChannels(
        restaurant.id
      );

    let channels =
      salesChannelSystem.list(
        restaurant.id
      );

    const dineIn =
      channels.find(
        item =>
          item.id ===
          "dine_in"
      );

    assert.equal(
      dineIn.unlocked,
      true
    );

    assert.equal(
      dineIn.active,
      true
    );

    const delivery =
      salesChannelSystem.unlock(
        restaurant.id,
        "delivery"
      );

    assert.equal(
      delivery.unlocked,
      true
    );

    salesChannelSystem.setActive(
      restaurant.id,
      "delivery",
      true
    );

    const settlement =
      salesChannelSystem
        .calculateSettlement({
          restaurantId:
            restaurant.id,

          channelId:
            "delivery",

          grossRevenue:
            10000,

          orderCount:
            5
        });

    assert.equal(
      settlement.commission,
      1800
    );

    assert.equal(
      settlement.packagingCost,
      900
    );

    assert.equal(
      settlement.fees,
      2700
    );

    assert.equal(
      settlement.netRevenue,
      7300
    );

    salesChannelSystem
      .recordSettlement(
        settlement
      );

    const dashboard =
      salesChannelSystem
        .getDashboard(
          restaurant.id
        );

    assert.equal(
      dashboard.totalOrders,
      5
    );

    assert.equal(
      dashboard.grossRevenue,
      10000
    );

    assert.equal(
      dashboard.netRevenue,
      7300
    );

    assert.equal(
      dashboard.totalFees,
      2700
    );

    assert.ok(
      dashboard.activeCount >= 2
    );

    const page =
      channelManagementPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new ChannelManagementView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /销售渠道/
    );

    assert.match(
      html,
      /堂食/
    );

    assert.match(
      html,
      /外卖/
    );

    assert.match(
      html,
      /渠道净收入/
    );
  }
);
