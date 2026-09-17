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

    if (
      !Number.isInteger(months) ||
      months <= 0
    ) {
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

    if (
      this.getByRestaurant(
        restaurantId
      )
    ) {
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

    if (
      financeSystem.getBalance(
        restaurantId
      ) < upfront
    ) {
      throw new Error(
        "Insufficient funds for lease"
      );
    }

    financeSystem.holdDeposit(
      restaurantId,
      deposit,
      `铺位押金 ${property.name}`
    );

    financeSystem.expense(
      restaurantId,
      property.monthlyRent,
      FINANCE_CATEGORY.RENT,
      `首月租金 ${property.name}`
    );

    const time =
      gameState.getSection("time");

    const startDay =
      time.day;

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

          startDay,

          nextRentDay:
            startDay + 30,

          endDay:
            startDay +
            months * 30,

          rentPayments: 1,

          unpaidRent: 0,

          startedAt:
            time.totalMinutes,

          lastRentDay:
            startDay,

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
          structuredClone(
            lease
          )
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
          lease.restaurantId ===
            restaurantId &&
          lease.status ===
            "active"
      );
  }

  chargeMonthlyRent(
    leaseId
  ) {
    const lease =
      requireLease(leaseId);

    if (
      lease.status !== "active"
    ) {
      throw new Error(
        "Lease is not active"
      );
    }

    const dueDay =
      lease.nextRentDay;

    const nextRentDay =
      dueDay + 30;

    if (
      financeSystem.getBalance(
        lease.restaurantId
      ) >= lease.monthlyRent
    ) {
      financeSystem.expense(
        lease.restaurantId,
        lease.monthlyRent,
        FINANCE_CATEGORY.RENT,
        `第${dueDay}日月租金`
      );

      const updated =
        entitySystem.update(
          "lease",
          leaseId,
          {
            lastRentDay:
              dueDay,

            nextRentDay,

            rentPayments:
              lease.rentPayments + 1
          }
        );

      return {
        paid: true,
        lease: updated
      };
    }

    const updated =
      entitySystem.update(
        "lease",
        leaseId,
        {
          lastRentDay:
            dueDay,

          nextRentDay,

          unpaidRent:
            lease.unpaidRent +
            lease.monthlyRent
        }
      );

    eventBus.emit(
      "lease:rentArrears",
      {
        leaseId,
        restaurantId:
          lease.restaurantId,
        amount:
          lease.monthlyRent,
        unpaidRent:
          updated.unpaidRent
      }
    );

    return {
      paid: false,
      lease: updated
    };
  }

  processDay(currentDay) {
    const leases =
      entitySystem
        .list("lease")
        .filter(
          (lease) =>
            lease.status ===
            "active"
        );

    for (
      const original
      of leases
    ) {
      let lease = original;

      while (
        lease.status === "active" &&
        lease.nextRentDay <
          lease.endDay &&
        currentDay >=
          lease.nextRentDay
      ) {
        lease =
          this.chargeMonthlyRent(
            lease.id
          ).lease;
      }

      if (
        lease.status === "active" &&
        currentDay >=
          lease.endDay
      ) {
        this.terminate(
          lease.id,
          {
            reason:
              "contract_expired"
          }
        );
      }
    }
  }

  terminate(
    leaseId,
    {
      reason = "manual"
    } = {}
  ) {
    const lease =
      requireLease(leaseId);

    if (
      lease.status !== "active"
    ) {
      return lease;
    }

    let remainingDeposit =
      lease.deposit;

    let remainingArrears =
      lease.unpaidRent ?? 0;

    let depositApplied = 0;

    if (
      remainingArrears > 0 &&
      remainingDeposit > 0
    ) {
      depositApplied =
        Math.min(
          remainingDeposit,
          remainingArrears
        );

      financeSystem.applyHeldDeposit(
        lease.restaurantId,
        depositApplied,
        FINANCE_CATEGORY.RENT,
        "押金抵扣欠租"
      );

      remainingDeposit -=
        depositApplied;

      remainingArrears -=
        depositApplied;
    }

    if (remainingDeposit > 0) {
      financeSystem.releaseDeposit(
        lease.restaurantId,
        remainingDeposit,
        "退还铺位押金"
      );
    }

    const time =
      gameState.getSection("time");

    const updated =
      entitySystem.update(
        "lease",
        leaseId,
        {
          status:
            "terminated",

          terminationReason:
            reason,

          endedAt:
            time.totalMinutes,

          depositApplied,

          depositRefunded:
            remainingDeposit,

          unpaidRent:
            remainingArrears
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
      {
        leaseId,
        reason
      }
    );

    return updated;
  }
}

export const leaseSystem =
  new LeaseSystem();

export { LeaseSystem };
