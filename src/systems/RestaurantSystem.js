import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { districtEventSystem } from "./DistrictEventSystem.js";

const STATUS = Object.freeze({
  CLOSED: "closed",
  OPEN: "open",
  PAUSED: "paused"
});

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

class RestaurantSystem {
  create({
    name,
    locationId = null
  }) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "Restaurant name must be a non-empty string"
      );
    }

    const time =
      gameState.getSection("time");

    const restaurant =
      entitySystem.create(
        "restaurant",
        {
          name: name.trim(),

          locationId,

          status: STATUS.CLOSED,

          level: 1,

          reputation: 0,

          customerSatisfaction: 50,
          repeatRate: 0,
          reviewScore: 3,
          totalReviews: 0,
          totalServedGuests: 0,
          totalRejectedGuests: 0,

          experience: 0,

          totalOperatingMinutes: 0,

          totalOperatingDays: 0,

          createdAt:
            time.totalMinutes,

          openedAt: null,

          firstOpenedAt: null,

          closedAt: null
        }
      );

    eventBus.emit(
      "restaurant:created",
      {
        restaurant:
          structuredClone(
            restaurant
          )
      }
    );

    return restaurant;
  }

  get(id) {
    return requireRestaurant(id);
  }

  list() {
    return entitySystem.list(
      "restaurant"
    );
  }

  count() {
    return entitySystem.count(
      "restaurant"
    );
  }

  rename(id, name) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "Restaurant name must be a non-empty string"
      );
    }

    const restaurant =
      requireRestaurant(id);

    const oldName =
      restaurant.name;

    const updated =
      entitySystem.update(
        "restaurant",
        id,
        {
          name: name.trim()
        }
      );

    eventBus.emit(
      "restaurant:renamed",
      {
        id,
        oldName,
        newName:
          updated.name
      }
    );

    return updated;
  }

  open(id) {
    const restaurant =
      requireRestaurant(id);

    if (
      restaurant.status ===
      STATUS.OPEN
    ) {
      throw new Error(
        `Restaurant "${id}" is already open`
      );
    }

    const time =
      gameState.getSection("time");

    const updated =
      entitySystem.update(
        "restaurant",
        id,
        {
          status:
            STATUS.OPEN,

          openedAt:
            time.totalMinutes,

          firstOpenedAt:
            Number.isFinite(
              restaurant.firstOpenedAt
            )
              ? restaurant.firstOpenedAt
              : time.totalMinutes,

          closedAt: null
        }
      );

    eventBus.emit(
      "restaurant:opened",
      {
        id,
        time:
          time.totalMinutes
      }
    );

    return updated;
  }

  pause(id) {
    const restaurant =
      requireRestaurant(id);

    if (
      restaurant.status !==
      STATUS.OPEN
    ) {
      throw new Error(
        `Restaurant "${id}" is not open`
      );
    }

    const updated =
      entitySystem.update(
        "restaurant",
        id,
        {
          status:
            STATUS.PAUSED
        }
      );

    eventBus.emit(
      "restaurant:paused",
      {
        id
      }
    );

    return updated;
  }

  resume(id) {
    const restaurant =
      requireRestaurant(id);

    if (
      restaurant.status !==
      STATUS.PAUSED
    ) {
      throw new Error(
        `Restaurant "${id}" is not paused`
      );
    }

    const updated =
      entitySystem.update(
        "restaurant",
        id,
        {
          status:
            STATUS.OPEN
        }
      );

    eventBus.emit(
      "restaurant:resumed",
      {
        id
      }
    );

    return updated;
  }

  close(id) {
    const restaurant =
      requireRestaurant(id);

    if (
      restaurant.status ===
      STATUS.CLOSED
    ) {
      return restaurant;
    }

    const time =
      gameState.getSection("time");

    let operatingMinutes = 0;

    if (
      restaurant.openedAt !==
      null
    ) {
      operatingMinutes =
        Math.max(
          0,
          time.totalMinutes -
          restaurant.openedAt
        );
    }

    const updated =
      entitySystem.update(
        "restaurant",
        id,
        {
          status:
            STATUS.CLOSED,

          totalOperatingMinutes:
            restaurant
              .totalOperatingMinutes +
            operatingMinutes,

          closedAt:
            time.totalMinutes,

          openedAt: null
        }
      );

    eventBus.emit(
      "restaurant:closed",
      {
        id,
        operatingMinutes
      }
    );

    return updated;
  }

  addExperience(
    id,
    amount
  ) {
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new RangeError(
        "Experience amount must be positive"
      );
    }

    const restaurant =
      requireRestaurant(id);

    return entitySystem.update(
      "restaurant",
      id,
      {
        experience:
          restaurant.experience +
          amount
      }
    );
  }

  changeReputation(
    id,
    amount
  ) {
    if (
      !Number.isFinite(amount)
    ) {
      throw new TypeError(
        "Reputation change must be a number"
      );
    }

    const restaurant =
      requireRestaurant(id);

    let eventMultiplier =
      1;

    if (restaurant.locationId) {
      const property =
        entitySystem.get(
          "property",
          restaurant.locationId
        );

      if (property) {
        eventMultiplier =
          districtEventSystem
            .getModifiers(
              property.districtId
            )
            .reputationChangeMultiplier ??
          1;
      }
    }

    const reputation =
      Math.max(
        0,
        Math.min(
          100,
          restaurant.reputation +
          amount *
          eventMultiplier
        )
      );

    return entitySystem.update(
      "restaurant",
      id,
      {
        reputation
      }
    );
  }

  setLevel(
    id,
    level
  ) {
    if (
      !Number.isInteger(level) ||
      level < 1
    ) {
      throw new RangeError(
        "Restaurant level must be a positive integer"
      );
    }

    return entitySystem.update(
      "restaurant",
      id,
      {
        level
      }
    );
  }

  isOpen(id) {
    return (
      requireRestaurant(id)
        .status ===
      STATUS.OPEN
    );
  }
}

export const restaurantSystem =
  new RestaurantSystem();

export {
  RestaurantSystem,
  STATUS as RESTAURANT_STATUS
};
