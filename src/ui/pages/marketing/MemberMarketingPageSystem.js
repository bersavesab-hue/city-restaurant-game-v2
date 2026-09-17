import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  memberBenefitSystem
} from "../../../systems/MemberBenefitSystem.js";

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
          .getLevels()
    };
  }
}

export const memberMarketingPageSystem =
  new MemberMarketingPageSystem();

export {
  MemberMarketingPageSystem
};
