import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

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
