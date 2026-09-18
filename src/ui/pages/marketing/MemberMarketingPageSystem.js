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

    return {
      pageId:
        "member-marketing",

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
