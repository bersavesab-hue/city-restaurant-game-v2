import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  customerSegmentSystem
} from "../../../systems/CustomerSegmentSystem.js";

class CustomerManagementPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const dashboard =
      customerLoyaltySystem
        .getDashboard(
          restaurantId
        );

    const members =
      customerLoyaltySystem
        .getMembers(
          restaurantId
        )
        .map(
          member =>
            customerLoyaltySystem
              .getMemberProfile(
                restaurantId,
                member.customerId
              )
        );

    return {
      pageId:
        "customers",

      title:
        "顾客与会员",

      restaurantId,

      overview: {
        satisfaction:
          restaurant
            .customerSatisfaction ??
          0,

        repeatRate:
          restaurant.repeatRate ??
          0,

        reviewScore:
          restaurant.reviewScore ??
          0,

        reputation:
          restaurant.reputation ??
          0,

        totalServed:
          restaurant
            .totalServedGuests ??
          0
      },

      dashboard,

      members,

      levels:
        customerLoyaltySystem
          .getLevels(),

      segments:
        dashboard.segments
          .map(
            item => {
              const segment =
                customerSegmentSystem
                  .get(
                    item.segmentId
                  );

              return {
                ...item,

                name:
                  segment?.name ??
                  item.segmentId,

                ageRange:
                  segment?.ageRange ??
                  null,

                occupationTags:
                  segment
                    ?.occupationTags ??
                  [],

                spendingPower:
                  segment
                    ?.spendingPower ??
                  null,

                priceSensitivity:
                  segment
                    ?.priceSensitivity ??
                  null,

                repeatPreference:
                  segment
                    ?.repeatPreference ??
                  null,

                reviewPropensity:
                  segment
                    ?.reviewPropensity ??
                  null,

                partySize:
                  segment?.partySize ??
                  null,

                channelPreferences:
                  segment
                    ?.channelPreferences ??
                  null
              };
            }
          ),

      atRiskMembers:
        dashboard.atRiskMembers
          .map(
            member =>
              customerLoyaltySystem
                .getMemberProfile(
                  restaurantId,
                  member.customerId
                )
          )
    };
  }
}

export const customerManagementPageSystem =
  new CustomerManagementPageSystem();

export {
  CustomerManagementPageSystem
};
