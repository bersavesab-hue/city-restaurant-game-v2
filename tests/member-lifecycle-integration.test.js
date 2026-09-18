import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  customerSystem
} from "../src/systems/CustomerSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  customerLoyaltySystem
} from "../src/systems/CustomerLoyaltySystem.js";

import {
  customerLoyaltyIntegrationSystem
} from "../src/systems/CustomerLoyaltyIntegrationSystem.js";

import {
  memberBenefitSystem
} from "../src/systems/MemberBenefitSystem.js";

import {
  memberMarketingPageSystem
} from "../src/ui/pages/marketing/MemberMarketingPageSystem.js";

import {
  MemberMarketingView
} from "../src/ui/pages/marketing/MemberMarketingView.js";

function createMember(
  name = "生命周期会员"
) {
  const restaurant =
    restaurantSystem.create({
      name:
        `${name}餐厅`
    });

  financeSystem.createAccount(
    restaurant.id,
    200000
  );

  const customer =
    customerSystem.create({
      name,
      budget: 100000
    });

  customerLoyaltySystem
    .enrollMember({
      restaurantId:
        restaurant.id,
      customerId:
        customer.id,
      segmentId:
        "resident"
    });

  return {
    restaurant,
    customer
  };
}

function reachSilver(
  restaurantId,
  customerId
) {
  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    customerLoyaltySystem
      .recordMemberVisit({
        restaurantId,
        customerId,
        spend: 1000,
        satisfaction: 85,
        orderId:
          `silver_${index}`,
        dishIds: []
      });
  }
}

test(
  "积分消费降低余额但不会让会员等级倒退",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "积分等级会员"
      );

    reachSilver(
      restaurant.id,
      customer.id
    );

    let profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
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
      profile.lifetimePoints,
      30
    );

    customerLoyaltySystem
      .redeemPoints({
        restaurantId:
          restaurant.id,
        customerId:
          customer.id,
        points: 20
      });

    profile =
      customerLoyaltySystem
        .recordMemberVisit({
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          spend: 0,
          satisfaction: 85,
          orderId:
            "post_redeem",
          dishIds: []
        });

    assert.equal(
      profile.points,
      10
    );

    assert.equal(
      profile.lifetimePoints,
      30
    );

    assert.equal(
      profile.levelId,
      "silver"
    );

    assert.equal(
      profile.lifetimeRedeemedPoints,
      20
    );
  }
);

test(
  "积分按批次180天到期且累计成长积分不被清空",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "积分过期会员"
      );

    customerLoyaltySystem
      .recordMemberVisit({
        restaurantId:
          restaurant.id,
        customerId:
          customer.id,
        spend: 1000,
        satisfaction: 80,
        orderId:
          "expiry_order",
        dishIds: []
      });

    let profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.points,
      10
    );

    assert.equal(
      profile.pointLots[0]
        .expiresDay,
      180
    );

    gameState.setSection(
      "time",
      {
        day: 181,
        hour: 8,
        minute: 0,
        totalMinutes:
          180 * 1440
      }
    );

    customerLoyaltySystem
      .processDay(
        181
      );

    profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.points,
      0
    );

    assert.equal(
      profile.lifetimePoints,
      10
    );

    assert.equal(
      profile.lifetimeExpiredPoints,
      10
    );

    assert.equal(
      profile.pointLots[0]
        .status,
      "expired"
    );
  }
);

test(
  "会员等级只因长期不活跃进入降级而不是因积分兑换降级",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "降级测试会员"
      );

    reachSilver(
      restaurant.id,
      customer.id
    );

    gameState.setSection(
      "time",
      {
        day: 121,
        hour: 8,
        minute: 0,
        totalMinutes:
          120 * 1440
      }
    );

    customerLoyaltySystem
      .processDay(
        121
      );

    const profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      profile.levelId,
      "member"
    );

    assert.equal(
      profile.highestLevelId,
      "silver"
    );
  }
);

test(
  "等级折扣单张券和积分叠加后总优惠不超过40%",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "优惠上限会员"
      );

    reachSilver(
      restaurant.id,
      customer.id
    );

    const coupon =
      memberBenefitSystem
        .issueCoupon({
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          type:
            "fixed",
          value: 1200,
          validDays: 7
        });

    const preview =
      memberBenefitSystem
        .previewCheckout({
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          subtotal: 2000,
          couponId:
            coupon.id,
          redeemPoints: 30
        });

    assert.equal(
      preview.levelDiscount,
      40
    );

    assert.equal(
      preview.couponDiscount,
      760
    );

    assert.equal(
      preview.pointDiscount,
      0
    );

    assert.equal(
      preview.totalDiscount,
      800
    );

    assert.equal(
      preview.finalAmount,
      1200
    );
  }
);

test(
  "优惠券可禁止与积分叠加",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "券叠加规则会员"
      );

    reachSilver(
      restaurant.id,
      customer.id
    );

    const coupon =
      memberBenefitSystem
        .issueCoupon({
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          type:
            "fixed",
          value: 100,
          validDays: 7,
          allowPointStack:
            false
        });

    const preview =
      memberBenefitSystem
        .previewCheckout({
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          subtotal: 2000,
          couponId:
            coupon.id,
          redeemPoints: 10
        });

    assert.equal(
      preview.couponDiscount,
      100
    );

    assert.equal(
      preview.pointDiscount,
      0
    );

    assert.equal(
      preview.stackPolicy.points,
      false
    );
  }
);

test(
  "高入会倾向客群的已识别顾客会进入会员生命周期",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "自动入会测试店"
      });

    const customer =
      customerSystem.create({
        name:
          "早餐通勤顾客",
        budget: 10000
      });

    const result =
      customerLoyaltyIntegrationSystem
        .processOrder({
          id:
            "auto_member_order",
          restaurantId:
            restaurant.id,
          customerId:
            customer.id,
          customerSegmentId:
            "breakfast_commuter",
          totalRevenue: 1200,
          averageQuality: 82,
          items: []
        });

    assert.equal(
      result.mode,
      "member"
    );

    const profile =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.ok(profile);

    assert.equal(
      profile.enrollmentSource,
      "behavioral_auto"
    );

    assert.equal(
      profile.visits,
      1
    );
  }
);

test(
  "会员营销同时保留营业额ROI并计算扣预算券成本后的贡献利润ROI",
  () => {
    gameState.reset();

    const {
      restaurant,
      customer
    } =
      createMember(
        "ROI测试会员"
      );

    reachSilver(
      restaurant.id,
      customer.id
    );

    const launched =
      memberBenefitSystem
        .launchCampaign({
          restaurantId:
            restaurant.id,
          name:
            "真实回报测试",
          audience:
            "repeat",
          budget: 600,
          couponType:
            "fixed",
          couponValue: 300,
          validDays: 7
        });

    memberBenefitSystem
      .recordCampaignConversion({
        campaignId:
          launched.campaign.id,
        customerId:
          customer.id,
        orderId:
          "roi_order",
        revenue: 2400,
        contributionProfit:
          1200,
        discountCost: 300
      });

    const campaign =
      memberBenefitSystem
        .getCampaignSummary(
          launched.campaign.id
        );

    assert.equal(
      campaign.roi,
      300
    );

    assert.equal(
      campaign.revenueRoi,
      300
    );

    assert.equal(
      campaign.netMarketingCost,
      900
    );

    assert.equal(
      campaign.contributionRoi,
      33.3
    );

    const page =
      memberMarketingPageSystem
        .getPage(
          restaurant.id
        );

    const html =
      new MemberMarketingView()
        .renderMarkup(
          page
        );

    assert.match(
      html,
      /积分有效期/
    );

    assert.match(
      html,
      /贡献利润ROI/
    );
  }
);
