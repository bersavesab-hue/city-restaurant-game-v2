import { entitySystem } from "../core/EntitySystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { eventBus } from "../core/EventBus.js";

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

class OperatingScheduleSystem {
  find(restaurantId) {
    return entitySystem
      .list("operating_schedule")
      .find(
        (item) =>
          item.restaurantId ===
          restaurantId
      );
  }

  create({
    restaurantId,
    openHour = 9,
    closeHour = 22
  }) {
    requireRestaurant(restaurantId);

    if (
      !Number.isInteger(openHour) ||
      !Number.isInteger(closeHour) ||
      openHour < 0 ||
      openHour > 23 ||
      closeHour < 1 ||
      closeHour > 24 ||
      openHour >= closeHour
    ) {
      throw new RangeError(
        "Invalid operating hours"
      );
    }

    if (this.find(restaurantId)) {
      throw new Error(
        "Operating schedule already exists"
      );
    }

    return entitySystem.create(
      "operating_schedule",
      {
        restaurantId,
        openHour,
        closeHour,
        enabled: true
      }
    );
  }

  get(restaurantId) {
    return this.find(restaurantId);
  }

  processHour(
    restaurantId,
    hour
  ) {
    const schedule =
      this.find(restaurantId);

    if (!schedule || !schedule.enabled) {
      return;
    }

    if (
      hour === schedule.openHour &&
      !restaurantSystem.isOpen(
        restaurantId
      )
    ) {
      restaurantSystem.open(
        restaurantId
      );

      eventBus.emit(
        "operations:autoOpened",
        { restaurantId, hour }
      );
    }

    const closingHour =
      schedule.closeHour === 24
        ? 0
        : schedule.closeHour;

    if (
      hour === closingHour &&
      restaurantSystem.isOpen(
        restaurantId
      )
    ) {
      restaurantSystem.close(
        restaurantId
      );

      eventBus.emit(
        "operations:autoClosed",
        { restaurantId, hour }
      );
    }
  }
}

export const operatingScheduleSystem =
  new OperatingScheduleSystem();

export { OperatingScheduleSystem };
