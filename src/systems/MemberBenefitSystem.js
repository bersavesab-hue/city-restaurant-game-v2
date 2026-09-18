import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  customerLoyaltySystem
} from "./CustomerLoyaltySystem.js";

import {
  MEMBER_POINT_POLICY
} from "../data/memberProgramRules.js";

const COUPON_TYPE = Object.freeze({
  FIXED: "fixed",
  PERCENT: "percent"
});

const CAMPAIGN_AUDIENCE = Object.freeze({
  ALL: "all",
  REPEAT: "repeat",
  HIGH_VALUE: "high_value",
  AT_RISK: "at_risk"
});

function requireInteger(
  value,
  name,
  min = 0
) {
  if (
    !Number.isInteger(value) ||
    value < min
  ) {
    throw new RangeError(
      `${name} must be an integer >= ${min}`
    );
  }
}

function currentDay() {
  return gameState
    .getSection("time")
    .day;
}

class MemberBenefitSystem {
  requireMember(
    restaurantId,
    customerId
  ) {
    const member =
      customerLoyaltySystem
        .findMember(
          restaurantId,
          customerId
        );

    if (!member) {
      throw new Error(
        "Customer is not a member of this restaurant"
      );
    }

    return (
      customerLoyaltySystem
        .expirePointsForMember(
          member
        ) ??
      member
    );
  }

  issueCoupon({
    restaurantId,
    customerId,
    type = COUPON_TYPE.FIXED,
    value,
    minimumSpend = 0,
    maxDiscount = null,
    validDays = 7,
    source = "manual",
    campaignId = null,
    allowLevelStack = true,
    allowPointStack = true
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const member =
      this.requireMember(
        restaurantId,
        customerId
      );

    if (
      !Object.values(
        COUPON_TYPE
      ).includes(type)
    ) {
      throw new Error(
        "Unsupported coupon type"
      );
    }

    requireInteger(
      value,
      "value",
      1
    );

    requireInteger(
      minimumSpend,
      "minimumSpend",
      0
    );

    requireInteger(
      validDays,
      "validDays",
      1
    );

    if (
      maxDiscount !== null
    ) {
      requireInteger(
        maxDiscount,
        "maxDiscount",
        1
      );
    }

    if (
      type ===
        COUPON_TYPE.PERCENT &&
      value > 100
    ) {
      throw new RangeError(
        "Percent coupon cannot exceed 100"
      );
    }

    const day =
      currentDay();

    return entitySystem.create(
      "member_coupon",
      {
        restaurantId,
        customerId,

        memberProfileId:
          member.id,

        couponType: type,
        value,
        minimumSpend,
        maxDiscount,

        issuedDay:
          day,

        validFromDay:
          day,

        expiresDay:
          day +
          validDays -
          1,

        status:
          "available",

        source,
        campaignId,

        allowLevelStack,
        allowPointStack,

        usedDay:
          null,

        usedOrderId:
          null
      }
    );
  }

  listCoupons(
    restaurantId,
    customerId = null
  ) {
    const day =
      currentDay();

    const coupons =
      entitySystem.filter(
        "member_coupon",
        item =>
          item.restaurantId ===
            restaurantId &&
          (
            customerId === null ||
            item.customerId ===
              customerId
          )
      );

    for (
      const coupon
      of coupons
    ) {
      if (
        coupon.status ===
          "available" &&
        coupon.expiresDay <
          day
      ) {
        entitySystem.update(
          "member_coupon",
          coupon.id,
          {
            status:
              "expired"
          }
        );
      }
    }

    return entitySystem
      .filter(
        "member_coupon",
        item =>
          item.restaurantId ===
            restaurantId &&
          (
            customerId === null ||
            item.customerId ===
              customerId
          )
      );
  }

  getEligibleCoupons({
    restaurantId,
    customerId,
    subtotal
  }) {
    requireInteger(
      subtotal,
      "subtotal",
      0
    );

    return this
      .listCoupons(
        restaurantId,
        customerId
      )
      .filter(
        coupon =>
          coupon.status ===
            "available" &&
          subtotal >=
            coupon.minimumSpend
      );
  }

  getCouponDiscount(
    coupon,
    subtotal
  ) {
    if (!coupon) {
      return 0;
    }

    if (
      subtotal <
      coupon.minimumSpend
    ) {
      return 0;
    }

    if (
      coupon.couponType ===
      COUPON_TYPE.FIXED
    ) {
      return Math.min(
        subtotal,
        coupon.value
      );
    }

    let discount =
      Math.floor(
        subtotal *
        coupon.value /
        100
      );

    if (
      coupon.maxDiscount !==
        null
    ) {
      discount =
        Math.min(
          discount,
          coupon.maxDiscount
        );
    }

    return Math.min(
      subtotal,
      discount
    );
  }

  previewCheckout({
    restaurantId,
    customerId,
    subtotal,
    couponId = null,
    redeemPoints = 0
  }) {
    requireInteger(
      subtotal,
      "subtotal",
      0
    );

    requireInteger(
      redeemPoints,
      "redeemPoints",
      0
    );

    const member =
      this.requireMember(
        restaurantId,
        customerId
      );

    const level =
      customerLoyaltySystem
        .getLevel(
          member.levelId
        );

    const levelDiscountRate =
      level?.discount ?? 0;

    let levelDiscount =
      Math.min(
        subtotal,
        Math.floor(
          subtotal *
          levelDiscountRate /
          100
        )
      );

    let afterLevel =
      subtotal -
      levelDiscount;

    let coupon = null;

    if (couponId) {
      coupon =
        entitySystem.get(
          "member_coupon",
          couponId
        );

      if (
        !coupon ||
        coupon.restaurantId !==
          restaurantId ||
        coupon.customerId !==
          customerId ||
        coupon.status !==
          "available"
      ) {
        throw new Error(
          "Coupon is not available"
        );
      }

      const day =
        currentDay();

      if (
        day <
          coupon.validFromDay ||
        day >
          coupon.expiresDay
      ) {
        throw new Error(
          "Coupon is outside valid period"
        );
      }
    }

    if (
      coupon &&
      coupon.allowLevelStack ===
        false
    ) {
      levelDiscount = 0;
      afterLevel = subtotal;
    }

    const couponDiscount =
      this.getCouponDiscount(
        coupon,
        afterLevel
      );

    const afterCoupon =
      afterLevel -
      couponDiscount;

    const usablePoints =
      coupon &&
      coupon.allowPointStack ===
        false
        ? 0
        : Math.min(
            member.points,
            redeemPoints
          );

    const maxPointDiscount =
      Math.floor(
        afterCoupon *
        MEMBER_POINT_POLICY
          .maxRedemptionRate
      );

    const maxCombinedDiscount =
      Math.floor(
        subtotal *
        MEMBER_POINT_POLICY
          .maxCombinedDiscountRate
      );

    const remainingDiscountRoom =
      Math.max(
        0,
        maxCombinedDiscount -
        levelDiscount -
        couponDiscount
      );

    const pointDiscount =
      Math.min(
        usablePoints *
          MEMBER_POINT_POLICY
            .pointValue,
        maxPointDiscount,
        remainingDiscountRoom
      );

    const pointsUsed =
      Math.ceil(
        pointDiscount /
        MEMBER_POINT_POLICY
          .pointValue
      );

    const finalAmount =
      Math.max(
        0,
        afterCoupon -
        pointDiscount
      );

    return {
      restaurantId,
      customerId,

      subtotal,

      memberLevelId:
        member.levelId,

      levelDiscountRate,
      levelDiscount,

      couponId:
        coupon?.id ??
        null,

      couponDiscount,

      pointsRequested:
        redeemPoints,

      pointsUsed,

      pointDiscount,

      totalDiscount:
        levelDiscount +
        couponDiscount +
        pointDiscount,

      maxCombinedDiscountRate:
        MEMBER_POINT_POLICY
          .maxCombinedDiscountRate,

      stackPolicy: {
        levelDiscount:
          !coupon ||
          coupon.allowLevelStack !==
            false,

        coupon:
          Boolean(coupon),

        points:
          !coupon ||
          coupon.allowPointStack !==
            false
      },

      finalAmount
    };
  }

  commitCheckout({
    restaurantId,
    customerId,
    subtotal,
    couponId = null,
    redeemPoints = 0,
    orderId = null
  }) {
    const preview =
      this.previewCheckout({
        restaurantId,
        customerId,
        subtotal,
        couponId,
        redeemPoints
      });

    const member =
      this.requireMember(
        restaurantId,
        customerId
      );

    if (
      preview.pointsUsed > 0
    ) {
      customerLoyaltySystem
        .redeemPoints({
          restaurantId,
          customerId,
          points:
            preview.pointsUsed
        });
    }

    if (
      preview.couponId
    ) {
      entitySystem.update(
        "member_coupon",
        preview.couponId,
        {
          status:
            "used",

          usedDay:
            currentDay(),

          usedOrderId:
            orderId
        }
      );
    }

    const record =
      entitySystem.create(
        "member_benefit_record",
        {
          restaurantId,
          customerId,
          orderId,

          subtotal,

          levelDiscount:
            preview.levelDiscount,

          couponDiscount:
            preview.couponDiscount,

          pointDiscount:
            preview.pointDiscount,

          totalDiscount:
            preview.totalDiscount,

          finalAmount:
            preview.finalAmount,

          pointsUsed:
            preview.pointsUsed,

          couponId:
            preview.couponId,

          day:
            currentDay()
        }
      );

    return {
      ...preview,
      recordId:
        record.id
    };
  }

  getAudienceMembers(
    restaurantId,
    audience
  ) {
    const members =
      customerLoyaltySystem
        .getMembers(
          restaurantId
        );

    if (
      audience ===
      CAMPAIGN_AUDIENCE.ALL
    ) {
      return members;
    }

    if (
      audience ===
      CAMPAIGN_AUDIENCE.REPEAT
    ) {
      return members.filter(
        item =>
          item.visits >= 2
      );
    }

    if (
      audience ===
      CAMPAIGN_AUDIENCE.HIGH_VALUE
    ) {
      return members.filter(
        item =>
          item.totalSpend >=
          10000
      );
    }

    if (
      audience ===
      CAMPAIGN_AUDIENCE.AT_RISK
    ) {
      return customerLoyaltySystem
        .getAtRiskMembers(
          restaurantId
        );
    }

    throw new Error(
      "Unsupported campaign audience"
    );
  }

  launchCampaign({
    restaurantId,
    name,
    audience =
      CAMPAIGN_AUDIENCE.ALL,
    budget,
    couponType =
      COUPON_TYPE.FIXED,
    couponValue,
    minimumSpend = 0,
    maxDiscount = null,
    validDays = 7
  }) {
    restaurantSystem.get(
      restaurantId
    );

    if (
      typeof name !==
        "string" ||
      !name.trim()
    ) {
      throw new TypeError(
        "Campaign name is required"
      );
    }

    requireInteger(
      budget,
      "budget",
      1
    );

    requireInteger(
      couponValue,
      "couponValue",
      1
    );

    const members =
      this.getAudienceMembers(
        restaurantId,
        audience
      );

    financeSystem.expense(
      restaurantId,
      budget,
      FINANCE_CATEGORY.MARKETING,
      `会员营销：${name.trim()}`
    );

    const campaign =
      entitySystem.create(
        "loyalty_campaign",
        {
          restaurantId,

          name:
            name.trim(),

          audience,

          budget,

          launchedDay:
            currentDay(),

          recipientCount:
            members.length,

          conversionCount: 0,

          attributedRevenue: 0,
          attributedContributionProfit:
            0,
          discountCost: 0,

          status:
            "active",

          couponType,
          couponValue,
          minimumSpend,
          maxDiscount,
          validDays
        }
      );

    const issuedCoupons = [];

    for (
      const member
      of members
    ) {
      issuedCoupons.push(
        this.issueCoupon({
          restaurantId,

          customerId:
            member.customerId,

          type:
            couponType,

          value:
            couponValue,

          minimumSpend,

          maxDiscount,

          validDays,

          source:
            "campaign",

          campaignId:
            campaign.id
        })
      );
    }

    return {
      campaign,
      issuedCoupons
    };
  }

  recordCampaignConversion({
    campaignId,
    customerId,
    orderId,
    revenue,
    contributionProfit = null,
    discountCost = 0
  }) {
    requireInteger(
      revenue,
      "revenue",
      0
    );

    requireInteger(
      discountCost,
      "discountCost",
      0
    );

    if (
      contributionProfit !==
        null
    ) {
      requireInteger(
        Math.max(
          0,
          Math.round(
            contributionProfit
          )
        ),
        "contributionProfit",
        0
      );
    }

    const campaign =
      entitySystem.get(
        "loyalty_campaign",
        campaignId
      );

    if (!campaign) {
      throw new Error(
        "Campaign does not exist"
      );
    }

    const existing =
      entitySystem
        .filter(
          "campaign_conversion",
          item =>
            item.campaignId ===
              campaignId &&
            item.orderId ===
              orderId
        )[0];

    if (existing) {
      return existing;
    }

    const conversion =
      entitySystem.create(
        "campaign_conversion",
        {
          campaignId,

          restaurantId:
            campaign.restaurantId,

          customerId,
          orderId,
          revenue,

          contributionProfit:
            contributionProfit ===
              null
              ? revenue
              : Math.max(
                  0,
                  Math.round(
                    contributionProfit
                  )
                ),

          discountCost,

          day:
            currentDay()
        }
      );

    entitySystem.update(
      "loyalty_campaign",
      campaign.id,
      {
        conversionCount:
          campaign.conversionCount +
          1,

        attributedRevenue:
          campaign
            .attributedRevenue +
          revenue,

        attributedContributionProfit:
          (
            campaign
              .attributedContributionProfit ??
            0
          ) +
          (
            contributionProfit ===
              null
              ? revenue
              : Math.max(
                  0,
                  Math.round(
                    contributionProfit
                  )
                )
          ),

        discountCost:
          (
            campaign
              .discountCost ??
            0
          ) +
          discountCost
      }
    );

    return conversion;
  }

  getCampaignSummary(
    campaignId
  ) {
    const campaign =
      entitySystem.get(
        "loyalty_campaign",
        campaignId
      );

    if (!campaign) {
      throw new Error(
        "Campaign does not exist"
      );
    }

    const conversionRate =
      campaign.recipientCount > 0
        ? Number(
            (
              campaign
                .conversionCount /
              campaign
                .recipientCount *
              100
            ).toFixed(1)
          )
        : 0;

    const roi =
      campaign.budget > 0
        ? Number(
            (
              (
                campaign
                  .attributedRevenue -
                campaign.budget
              ) /
              campaign.budget *
              100
            ).toFixed(1)
          )
        : 0;

    const netMarketingCost =
      campaign.budget +
      (
        campaign.discountCost ??
        0
      );

    const contributionRoi =
      netMarketingCost > 0
        ? Number(
            (
              (
                (
                  campaign
                    .attributedContributionProfit ??
                  campaign
                    .attributedRevenue
                ) -
                netMarketingCost
              ) /
              netMarketingCost *
              100
            ).toFixed(1)
          )
        : 0;

    return {
      ...campaign,

      conversionRate,

      revenueRoi:
        roi,

      roi,

      netMarketingCost,

      contributionRoi
    };
  }

  listCampaigns(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "loyalty_campaign",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .map(
        item =>
          this.getCampaignSummary(
            item.id
          )
      )
      .sort(
        (a, b) =>
          b.launchedDay -
          a.launchedDay
      );
  }

  getDashboard(
    restaurantId
  ) {
    const campaigns =
      this.listCampaigns(
        restaurantId
      );

    const coupons =
      this.listCoupons(
        restaurantId
      );

    const benefitRecords =
      entitySystem.filter(
        "member_benefit_record",
        item =>
          item.restaurantId ===
          restaurantId
      );

    return {
      activeCoupons:
        coupons.filter(
          item =>
            item.status ===
            "available"
        ).length,

      usedCoupons:
        coupons.filter(
          item =>
            item.status ===
            "used"
        ).length,

      expiredCoupons:
        coupons.filter(
          item =>
            item.status ===
            "expired"
        ).length,

      totalDiscount:
        benefitRecords.reduce(
          (sum, item) =>
            sum +
            item.totalDiscount,
          0
        ),

      pointsRedeemed:
        benefitRecords.reduce(
          (sum, item) =>
            sum +
            item.pointsUsed,
          0
        ),

      campaignCount:
        campaigns.length,

      campaignSpend:
        campaigns.reduce(
          (sum, item) =>
            sum +
            item.budget,
          0
        ),

      attributedRevenue:
        campaigns.reduce(
          (sum, item) =>
            sum +
            item
              .attributedRevenue,
          0
        ),

      attributedContributionProfit:
        campaigns.reduce(
          (sum, item) =>
            sum +
            (
              item
                .attributedContributionProfit ??
              item
                .attributedRevenue
            ),
          0
        ),

      campaignDiscountCost:
        campaigns.reduce(
          (sum, item) =>
            sum +
            (
              item.discountCost ??
              0
            ),
          0
        ),

      campaigns
    };
  }
}

export const memberBenefitSystem =
  new MemberBenefitSystem();

export {
  MemberBenefitSystem,
  COUPON_TYPE,
  CAMPAIGN_AUDIENCE
};
