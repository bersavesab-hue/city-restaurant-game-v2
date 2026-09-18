import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { layoutFlowSystem } from "./LayoutFlowSystem.js";

class SeatingSystem {
  getSeatCount(
    restaurantId
  ) {
    const renovation =
      renovationSystem
        .getOperationalModifiers(
          restaurantId
        );

    if (
      renovation.active &&
      Number.isInteger(
        renovation.seats
      )
    ) {
      return Math.max(
        0,
        renovation.seats
      );
    }

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (!restaurant.locationId) {
      return 10;
    }

    try {
      const property =
        propertySystem.get(
          restaurant.locationId
        );

      return property.seats ?? 10;
    } catch {
      return 10;
    }
  }

  getCustomerBehavior(
    demand
  ) {
    const records =
      demand?.segments
        ?.filter(
          item =>
            item.expectedVisitors > 0
        ) ?? [];

    const totalWeight =
      records.reduce(
        (sum, item) =>
          sum +
          item.expectedVisitors,
        0
      );

    if (totalWeight <= 0) {
      return {
        averageDiningMinutes: 40,
        queuePatienceMinutes: 12
      };
    }

    let dining = 0;
    let patience = 0;

    for (const item of records) {
      const segment =
        customerSegmentSystem.get(
          item.segmentId
        );

      if (!segment) {
        continue;
      }

      const weight =
        item.expectedVisitors /
        totalWeight;

      dining +=
        segment.averageDiningMinutes *
        weight;

      patience +=
        segment.queuePatienceMinutes *
        weight;
    }

    return {
      averageDiningMinutes:
        Math.max(1, dining),

      queuePatienceMinutes:
        Math.max(0, patience)
    };
  }

  getHourlyCapacity(
    restaurantId,
    demand
  ) {
    const seats =
      this.getSeatCount(
        restaurantId
      );

    const behavior =
      this.getCustomerBehavior(
        demand
      );

    const renovation =
      renovationSystem
        .getOperationalModifiers(
          restaurantId
        );

    const flow =
      layoutFlowSystem
        .getOperationalEffects(
          restaurantId
        );

    const queueEfficiency =
      renovation.active
        ? renovation.queueEfficiency
        : 1;

    const queueCapacityBonus =
      renovation.active
        ? (
            renovation
              .queueCapacityBonus ??
            0
          )
        : 0;

    const queuePatienceMultiplier =
      flow.active
        ? flow.queuePatienceMultiplier
        : 1;

    const effectiveQueuePatience =
      Math.max(
        0,
        behavior.queuePatienceMinutes *
        queuePatienceMultiplier
      );

    const turnsPerHour =
      Math.max(
        1,
        60 /
        behavior.averageDiningMinutes
      );

    const theoreticalCapacity =
      Math.max(
        seats,
        Math.floor(
          seats *
          turnsPerHour
        )
      );

    const queueCapacity =
      Math.max(
        0,
        Math.floor(
          seats *
          (
            effectiveQueuePatience /
            behavior.averageDiningMinutes
          ) *
          turnsPerHour *
          queueEfficiency
        ) +
        queueCapacityBonus
      );

    const capacity =
      Math.max(
        seats,
        Math.min(
          theoreticalCapacity,
          seats +
          queueCapacity
        )
      );

    return {
      seats,

      averageDiningMinutes:
        behavior.averageDiningMinutes,

      baseQueuePatienceMinutes:
        behavior.queuePatienceMinutes,

      queuePatienceMinutes:
        effectiveQueuePatience,

      queuePatienceMultiplier,

      queueEfficiency,
      queueCapacityBonus,

      turnsPerHour,

      theoreticalCapacity,

      queueCapacity,

      capacity
    };
  }

  getHourFlow(
    restaurantId,
    incomingVisitors,
    demand
  ) {
    const info =
      this.getHourlyCapacity(
        restaurantId,
        demand
      );

    const acceptedVisitors =
      Math.min(
        incomingVisitors,
        info.capacity
      );

    const immediateVisitors =
      Math.min(
        incomingVisitors,
        info.seats
      );

    const queuedVisitors =
      Math.max(
        0,
        acceptedVisitors -
        immediateVisitors
      );

    const queueAbandoned =
      Math.max(
        0,
        incomingVisitors -
        acceptedVisitors
      );

    return {
      ...info,

      incomingVisitors,
      immediateVisitors,
      queuedVisitors,
      acceptedVisitors,
      queueAbandoned,

      turnoverRate:
        info.seats > 0
          ? acceptedVisitors /
            info.seats
          : 0
    };
  }
}

export const seatingSystem =
  new SeatingSystem();

export { SeatingSystem };
