import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  customerSegmentSystem
} from "../../../systems/CustomerSegmentSystem.js";

import {
  customerIdentitySystem
} from "../../../systems/CustomerIdentitySystem.js";

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

    const identitySummary =
      customerIdentitySystem
        .getSummary(
          restaurantId
        );

    const recognizedCustomers =
      customerIdentitySystem
        .getDetailedProfiles(
          restaurantId
        )
        .map(
          profile => {
            const segment =
              profile.segmentId
                ? customerSegmentSystem
                    .get(
                      profile.segmentId
                    )
                : null;

            const member =
              customerLoyaltySystem
                .findMember(
                  restaurantId,
                  profile.customerId
                );

            return {
              ...profile,

              segmentName:
                segment?.name ??
                profile.segmentId ??
                "未分类",

              member:
                Boolean(
                  member
                ),

              memberLevelId:
                member?.levelId ??
                null
            };
          }
        );

    return {
      pageId:
        "customers",

      title:
        "顾客与会员",

      restaurantId,

      identitySummary,

      recognizedCustomers,

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
