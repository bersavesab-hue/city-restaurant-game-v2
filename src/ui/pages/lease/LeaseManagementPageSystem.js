import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  leaseSystem
} from "../../../systems/LeaseSystem.js";

import {
  propertyLeaseMarketSystem
} from "../../../systems/PropertyLeaseMarketSystem.js";

import {
  propertySystem
} from "../../../systems/PropertySystem.js";

import {
  gameState
} from "../../../core/GameState.js";


class LeaseManagementPageSystem {
  getPage(restaurantId) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const lease =
      leaseSystem.getByRestaurant(
        restaurantId
      ) ??
      null;

    const currentDay =
      gameState.getSection(
        "time"
      ).day;

    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    if (!lease) {
      return {
        pageId: "lease",
        title: "租约管理",
        restaurantId,
        restaurant,
        balance,
        hasLease: false,
        lease: null,
        property: null,
        renewalQuote: null,
        currentDay,
        daysRemaining: 0,
        nextRentInDays: null,
        nextPropertyFeeInDays: null,
        totalArrears: 0
      };
    }

    const property =
      propertySystem.get(
        lease.propertyId
      );

    let renewalQuote = null;

    try {
      renewalQuote =
        propertyLeaseMarketSystem
          .getRenewalQuote(
            lease.id,
            12
          );
    } catch {
      renewalQuote = null;
    }

    return {
      pageId: "lease",
      title: "租约管理",
      restaurantId,
      restaurant,
      balance,
      hasLease: true,
      lease:
        structuredClone(
          lease
        ),
      property:
        structuredClone(
          property
        ),
      renewalQuote,
      currentDay,
      daysRemaining:
        Math.max(
          0,
          lease.endDay -
          currentDay
        ),
      nextRentInDays:
        Number.isInteger(
          lease.nextRentDay
        )
          ? Math.max(
              0,
              lease.nextRentDay -
              currentDay
            )
          : null,
      nextPropertyFeeInDays:
        Number.isInteger(
          lease.nextPropertyFeeDay
        )
          ? Math.max(
              0,
              lease.nextPropertyFeeDay -
              currentDay
            )
          : null,
      totalArrears:
        (
          lease.unpaidRent ??
          0
        ) +
        (
          lease.unpaidPropertyFee ??
          0
        )
    };
  }


  renew(
    restaurantId,
    months = 12
  ) {
    const lease =
      leaseSystem.getByRestaurant(
        restaurantId
      );

    if (!lease) {
      throw new Error(
        "Restaurant does not have an active lease"
      );
    }

    return propertyLeaseMarketSystem
      .renewLease({
        leaseId:
          lease.id,
        months
      });
  }


  terminate(
    restaurantId
  ) {
    const lease =
      leaseSystem.getByRestaurant(
        restaurantId
      );

    if (!lease) {
      throw new Error(
        "Restaurant does not have an active lease"
      );
    }

    return leaseSystem.terminate(
      lease.id,
      {
        reason:
          "player_terminated"
      }
    );
  }
}


export const leaseManagementPageSystem =
  new LeaseManagementPageSystem();


export {
  LeaseManagementPageSystem
};
