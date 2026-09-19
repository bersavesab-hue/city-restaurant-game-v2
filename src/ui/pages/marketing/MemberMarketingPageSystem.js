import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  customerIdentitySystem
} from "../../../systems/CustomerIdentitySystem.js";

import {
  memberBenefitSystem
} from "../../../systems/MemberBenefitSystem.js";

import {
  MEMBER_POINT_POLICY
} from "../../../data/memberProgramRules.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class MemberMarketingPageSystem {
  getPage(
    restaurantId
  ) {
    const loyalty =
      customerLoyaltySystem
        .getDashboard(
          restaurantId
        );

    const marketing =
      memberBenefitSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      loyalty.pointsExpired >
      0
    ) {
      notices.push({
        id:
          "member_points_expired",

        type:
          "warning",

        title:
          "积分过期",

        message:
          `累计已有${loyalty.pointsExpired}积分过期`,

        priority:
          80
      });
    }

    if (
      marketing.campaigns
        .length >
      0
    ) {
      notices.push({
        id:
          "member_campaigns",

        type:
          "info",

        title:
          "会员活动",

        message:
          `当前已记录${marketing.campaigns.length}个会员营销活动`,

        priority:
          40
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices
        }
      );

    return {
      pageId:
        "member-marketing",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "会员营销",

      restaurantId,

      loyalty,
      marketing,

      identity:
        customerIdentitySystem
          .getSummary(
            restaurantId
          ),

      campaigns:
        marketing.campaigns,

      levels:
        customerLoyaltySystem
          .getLevels(),

      pointPolicy:
        structuredClone(
          MEMBER_POINT_POLICY
        )
    };
  }
}

export const memberMarketingPageSystem =
  new MemberMarketingPageSystem();

export {
  MemberMarketingPageSystem
};
