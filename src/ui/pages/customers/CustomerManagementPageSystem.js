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

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

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

    let balance =
      0;

    try {
      balance =
        financeSystem.getBalance(
          restaurantId
        );
    } catch {
      balance =
        0;
    }

    const atRiskMembers =
      dashboard.atRiskMembers
        .map(
          member =>
            customerLoyaltySystem
              .getMemberProfile(
                restaurantId,
                member.customerId
              )
        );

    const notices =
      [];

    if (
      atRiskMembers.length >
      0
    ) {
      notices.push({
        id:
          "customer_churn",

        type:
          "warning",

        title:
          "会员流失预警",

        message:
          `${atRiskMembers.length}名会员存在流失风险`,

        priority:
          90
      });
    }

    return {
      pageId:
        "customers",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance,

          storeLevel:
            restaurant.level ??
            1,

          reputation:
            restaurant.reputation ??
            0,

          time:
            gameState.getSection(
              "time"
            ),

          runtime:
            gameState.getSection(
              "runtime"
            ),

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

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

      atRiskMembers
    };
  }
}

export const customerManagementPageSystem =
  new CustomerManagementPageSystem();

export {
  CustomerManagementPageSystem
};
