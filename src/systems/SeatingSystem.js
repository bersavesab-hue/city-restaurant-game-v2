import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";

class SeatingSystem {
  getSeatCount(
    restaurantId
  ) {
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
            behavior
              .queuePatienceMinutes /
            behavior
              .averageDiningMinutes
          ) *
          turnsPerHour
        )
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

      queuePatienceMinutes:
        behavior.queuePatienceMinutes,

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
