import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  propertySystem,
  PROPERTY_STATUS
} from "./PropertySystem.js";

function requireRestaurant(id) {
  const restaurant =
    entitySystem.get("restaurant", id);

  if (!restaurant) {
    throw new Error(
      `Restaurant "${id}" does not exist`
    );
  }

  return restaurant;
}

function requireLease(id) {
  const lease =
    entitySystem.get("lease", id);

  if (!lease) {
    throw new Error(
      `Lease "${id}" does not exist`
    );
  }

  return lease;
}

class LeaseSystem {
  sign({
    restaurantId,
    propertyId,
    months = 12
  }) {
    requireRestaurant(restaurantId);

    if (!Number.isInteger(months) || months <= 0) {
      throw new RangeError(
        "Lease months must be positive"
      );
    }

    const property =
      propertySystem.get(propertyId);

    if (
      property.status !==
      PROPERTY_STATUS.AVAILABLE
    ) {
      throw new Error(
        "Property is not available"
      );
    }

    const existing =
      entitySystem
        .list("lease")
        .find(
          (lease) =>
            lease.restaurantId === restaurantId &&
            lease.status === "active"
        );

    if (existing) {
      throw new Error(
        "Restaurant already has an active lease"
      );
    }

    const deposit =
      property.monthlyRent *
      property.depositMonths;

    const upfront =
      deposit +
      property.monthlyRent;

    financeSystem.expense(
      restaurantId,
      upfront,
      FINANCE_CATEGORY.RENT,
      `签约铺位 ${property.name}`
    );

    const time =
      gameState.getSection("time");

    const lease =
      entitySystem.create(
        "lease",
        {
          restaurantId,
          propertyId,
          monthlyRent:
            property.monthlyRent,
          deposit,
          months,
          status: "active",
          startedAt:
            time.totalMinutes,
          lastRentDay:
            time.day,
          endedAt: null
        }
      );

    propertySystem.markLeased(
      propertyId,
      restaurantId
    );

    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        locationId:
          propertyId
      }
    );

    eventBus.emit(
      "lease:signed",
      {
        lease:
          structuredClone(lease)
      }
    );

    return lease;
  }

  get(id) {
    return requireLease(id);
  }

  getByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .list("lease")
      .find(
        (lease) =>
          lease.restaurantId === restaurantId &&
          lease.status === "active"
      );
  }

  chargeMonthlyRent(
    leaseId
  ) {
    const lease =
      requireLease(leaseId);

    if (lease.status !== "active") {
      throw new Error(
        "Lease is not active"
      );
    }

    financeSystem.expense(
      lease.restaurantId,
      lease.monthlyRent,
      FINANCE_CATEGORY.RENT,
      "月租金"
    );

    const time =
      gameState.getSection("time");

    return entitySystem.update(
      "lease",
      leaseId,
      {
        lastRentDay:
          time.day
      }
    );
  }

  terminate(leaseId) {
    const lease =
      requireLease(leaseId);

    if (lease.status !== "active") {
      return lease;
    }

    const time =
      gameState.getSection("time");

    const updated =
      entitySystem.update(
        "lease",
        leaseId,
        {
          status: "terminated",
          endedAt:
            time.totalMinutes
        }
      );

    propertySystem.release(
      lease.propertyId
    );

    entitySystem.update(
      "restaurant",
      lease.restaurantId,
      {
        locationId: null
      }
    );

    eventBus.emit(
      "lease:terminated",
      { leaseId }
    );

    return updated;
  }
}

export const leaseSystem =
  new LeaseSystem();

export { LeaseSystem };
