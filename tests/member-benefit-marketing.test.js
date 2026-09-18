import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

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
  memberMarketingPageSystem
} from "../src/ui/pages/marketing/MemberMarketingPageSystem.js";

import {
  MemberMarketingView
} from "../src/ui/pages/marketing/MemberMarketingView.js";

test(
  "会员权益支持等级折扣积分优惠券定向营销和ROI",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "会员营销测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const customer =
      customerSystem.create({
        name:
          "复购会员",
        budget: 10000
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

          spend: 1000,

          satisfaction: 85,

          orderId:
            `history_${i}`,

          dishIds: [
            "dish_rice"
          ]
        });
    }

    const member =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      member.levelId,
      "silver"
    );

    assert.equal(
      member.points,
      30
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

          value: 500,

          minimumSpend:
            1500,

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

          redeemPoints: 10
        });

    assert.equal(
      preview.levelDiscount,
      40
    );

    assert.equal(
      preview.couponDiscount,
      500
    );

    assert.equal(
      preview.pointDiscount,
      100
    );

    assert.equal(
      preview.finalAmount,
      1360
    );

    const committed =
      memberBenefitSystem
        .commitCheckout({
          restaurantId:
            restaurant.id,

          customerId:
            customer.id,

          subtotal: 2000,

          couponId:
            coupon.id,

          redeemPoints: 10,

          orderId:
            "checkout_001"
        });

    assert.equal(
      committed.totalDiscount,
      640
    );

    const after =
      customerLoyaltySystem
        .getMemberProfile(
          restaurant.id,
          customer.id
        );

    assert.equal(
      after.points,
      20
    );

    assert.equal(
      memberBenefitSystem
        .listCoupons(
          restaurant.id,
          customer.id
        )[0].status,
      "used"
    );

    const balanceBefore =
      financeSystem.getBalance(
        restaurant.id
      );

    const launched =
      memberBenefitSystem
        .launchCampaign({
          restaurantId:
            restaurant.id,

          name:
            "老客召回券",

          audience:
            "repeat",

          budget: 600,

          couponType:
            "fixed",

          couponValue:
            300,

          minimumSpend:
            1200,

          validDays: 5
        });

    assert.equal(
      launched.campaign
        .recipientCount,
      1
    );

    assert.equal(
      launched.issuedCoupons.length,
      1
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      balanceBefore - 600
    );

    memberBenefitSystem
      .recordCampaignConversion({
        campaignId:
          launched.campaign.id,

        customerId:
          customer.id,

        orderId:
          "campaign_order_001",

        revenue: 2400
      });

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
      campaign.attributedRevenue,
      2400
    );

    assert.equal(
      campaign.conversionRate,
      100
    );

    assert.equal(
      campaign.roi,
      300
    );

    const page =
      memberMarketingPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.marketing
        .campaignCount,
      1
    );

    assert.equal(
      page.marketing
        .campaignSpend,
      600
    );

    const view =
      new MemberMarketingView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /会员营销/
    );

    assert.match(
      html,
      /会员权益/
    );

    assert.match(
      html,
      /营销活动/
    );

    assert.match(
      html,
      /ROI/
    );
  }
);
