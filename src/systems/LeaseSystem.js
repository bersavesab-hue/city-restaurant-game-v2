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

function requireNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be non-negative`);
  }
}

class LeaseSystem {
  sign({
    restaurantId,
    propertyId,
    months = 12,
    commercialTerms = null
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

    const monthlyRent =
      commercialTerms?.monthlyRent ??
      property.monthlyRent;
    const propertyFeeMonthly =
      commercialTerms?.propertyFeeMonthly ??
      0;
    const transferFee =
      commercialTerms?.transferFee ??
      0;
    const rentFreeDays =
      commercialTerms?.rentFreeDays ??
      0;

    if (!Number.isInteger(monthlyRent) || monthlyRent <= 0) {
      throw new RangeError("Monthly rent must be positive");
    }

    requireNonNegativeInteger(
      propertyFeeMonthly,
      "Property fee"
    );
    requireNonNegativeInteger(
      transferFee,
      "Transfer fee"
    );
    requireNonNegativeInteger(
      rentFreeDays,
      "Rent-free days"
    );

    if (rentFreeDays >= months * 30) {
      throw new RangeError(
        "Rent-free period must be shorter than lease term"
      );
    }

    const deposit =
      monthlyRent *
      property.depositMonths;

    const initialRent =
      rentFreeDays > 0
        ? 0
        : monthlyRent;

    const upfront =
      deposit +
      initialRent +
      propertyFeeMonthly +
      transferFee;

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

    if (transferFee > 0) {
      financeSystem.expense(
        restaurantId,
        transferFee,
        FINANCE_CATEGORY.OTHER,
        `铺位转让费 ${property.name}`
      );
    }

    if (propertyFeeMonthly > 0) {
      financeSystem.expense(
        restaurantId,
        propertyFeeMonthly,
        FINANCE_CATEGORY.UTILITIES,
        `首月物业费 ${property.name}`
      );
    }

    if (initialRent > 0) {
      financeSystem.expense(
        restaurantId,
        monthlyRent,
        FINANCE_CATEGORY.RENT,
        `首月租金 ${property.name}`
      );
    }

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

          monthlyRent,
          propertyFeeMonthly,
          transferFee,
          rentFreeDays,
          offerId:
            commercialTerms?.offerId ??
            null,

          deposit,

          months,

          status: "active",

          startDay,

          nextRentDay:
            startDay +
            (rentFreeDays > 0
              ? rentFreeDays
              : 30),

          nextPropertyFeeDay:
            propertyFeeMonthly > 0
              ? startDay + 30
              : null,

          endDay:
            startDay +
            months * 30,

          rentPayments:
            initialRent > 0
              ? 1
              : 0,

          propertyFeePayments:
            propertyFeeMonthly > 0
              ? 1
              : 0,

          unpaidRent: 0,
          unpaidPropertyFee: 0,

          renewalCount: 0,

          startedAt:
            time.totalMinutes,

          lastRentDay:
            initialRent > 0
              ? startDay
              : null,

          lastPropertyFeeDay:
            propertyFeeMonthly > 0
              ? startDay
              : null,

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
              (lease.rentPayments ?? 0) + 1
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
            (lease.unpaidRent ?? 0) +
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

  chargePropertyFee(leaseId) {
    const lease = requireLease(leaseId);

    if (lease.status !== "active") {
      throw new Error("Lease is not active");
    }

    if ((lease.propertyFeeMonthly ?? 0) <= 0) {
      return {
        paid: true,
        lease
      };
    }

    const dueDay = lease.nextPropertyFeeDay;

    if (!Number.isInteger(dueDay)) {
      return {
        paid: true,
        lease
      };
    }

    const nextPropertyFeeDay = dueDay + 30;

    if (
      financeSystem.getBalance(lease.restaurantId) >=
      lease.propertyFeeMonthly
    ) {
      financeSystem.expense(
        lease.restaurantId,
        lease.propertyFeeMonthly,
        FINANCE_CATEGORY.UTILITIES,
        `第${dueDay}日物业费`
      );

      return {
        paid: true,
        lease: entitySystem.update("lease", leaseId, {
          lastPropertyFeeDay: dueDay,
          nextPropertyFeeDay,
          propertyFeePayments:
            (lease.propertyFeePayments ?? 0) + 1
        })
      };
    }

    const updated = entitySystem.update("lease", leaseId, {
      lastPropertyFeeDay: dueDay,
      nextPropertyFeeDay,
      unpaidPropertyFee:
        (lease.unpaidPropertyFee ?? 0) +
        lease.propertyFeeMonthly
    });

    eventBus.emit("lease:propertyFeeArrears", {
      leaseId,
      restaurantId: lease.restaurantId,
      amount: lease.propertyFeeMonthly,
      unpaidPropertyFee: updated.unpaidPropertyFee
    });

    return {
      paid: false,
      lease: updated
    };
  }

  renew(
    leaseId,
    {
      months = 12,
      monthlyRent = null,
      propertyFeeMonthly = null
    } = {}
  ) {
    const lease = requireLease(leaseId);

    if (lease.status !== "active") {
      throw new Error("Lease is not active");
    }

    if (!Number.isInteger(months) || months <= 0) {
      throw new RangeError("Renewal months must be positive");
    }

    const nextMonthlyRent =
      monthlyRent ?? lease.monthlyRent;
    const nextPropertyFee =
      propertyFeeMonthly ??
      lease.propertyFeeMonthly ??
      0;

    if (
      !Number.isInteger(nextMonthlyRent) ||
      nextMonthlyRent <= 0
    ) {
      throw new RangeError("Renewal monthly rent must be positive");
    }

    requireNonNegativeInteger(
      nextPropertyFee,
      "Renewal property fee"
    );

    const property = propertySystem.get(lease.propertyId);
    const newDeposit =
      nextMonthlyRent *
      property.depositMonths;
    const depositDifference =
      newDeposit - lease.deposit;

    if (depositDifference > 0) {
      financeSystem.holdDeposit(
        lease.restaurantId,
        depositDifference,
        "续租补足押金"
      );
    } else if (depositDifference < 0) {
      financeSystem.releaseDeposit(
        lease.restaurantId,
        Math.abs(depositDifference),
        "续租退还多余押金"
      );
    }

    const updated = entitySystem.update(
      "lease",
      leaseId,
      {
        monthlyRent: nextMonthlyRent,
        propertyFeeMonthly: nextPropertyFee,
        deposit: newDeposit,
        months: lease.months + months,
        endDay: lease.endDay + months * 30,
        renewalCount: (lease.renewalCount ?? 0) + 1,
        lastRenewedDay:
          gameState.getSection("time").day
      }
    );

    eventBus.emit("lease:renewed", {
      leaseId,
      restaurantId: lease.restaurantId,
      months,
      monthlyRent: nextMonthlyRent,
      propertyFeeMonthly: nextPropertyFee,
      endDay: updated.endDay
    });

    return updated;
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

      while (
        lease.status === "active" &&
        Number.isInteger(lease.nextPropertyFeeDay) &&
        lease.nextPropertyFeeDay < lease.endDay &&
        currentDay >= lease.nextPropertyFeeDay
      ) {
        lease = this.chargePropertyFee(lease.id).lease;
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

    let remainingRentArrears =
      lease.unpaidRent ?? 0;
    let remainingPropertyFeeArrears =
      lease.unpaidPropertyFee ?? 0;
    let remainingArrears =
      remainingRentArrears +
      remainingPropertyFeeArrears;

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
        "押金抵扣租赁欠款"
      );

      remainingDeposit -=
        depositApplied;

      let remainingApplied = depositApplied;
      const rentApplied = Math.min(
        remainingRentArrears,
        remainingApplied
      );
      remainingRentArrears -= rentApplied;
      remainingApplied -= rentApplied;
      remainingPropertyFeeArrears = Math.max(
        0,
        remainingPropertyFeeArrears - remainingApplied
      );
      remainingArrears =
        remainingRentArrears +
        remainingPropertyFeeArrears;
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
            remainingRentArrears,

          unpaidPropertyFee:
            remainingPropertyFeeArrears,

          unpaidLeaseCharges:
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
