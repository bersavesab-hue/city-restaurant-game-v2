import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { districtSystem } from "./DistrictSystem.js";

const STATUS = Object.freeze({
  AVAILABLE: "available",
  LEASED: "leased",
  LOCKED: "locked"
});

function requireProperty(id) {
  const property =
    entitySystem.get("property", id);

  if (!property) {
    throw new Error(
      `Property "${id}" does not exist`
    );
  }

  return property;
}

class PropertySystem {
  create({
    districtId,
    name,
    area,
    baseMonthlyRent,
    seats = 10,
    depositMonths = 2
  }) {
    if (!districtSystem.exists(districtId)) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Property name is required");
    }

    if (!Number.isInteger(area) || area <= 0) {
      throw new RangeError("Area must be positive");
    }

    if (
      !Number.isInteger(baseMonthlyRent) ||
      baseMonthlyRent <= 0
    ) {
      throw new RangeError(
        "Monthly rent must be positive"
      );
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      throw new RangeError("Seats must be positive");
    }

    const district =
      districtSystem.get(districtId);

    const monthlyRent =
      Math.round(
        baseMonthlyRent *
        district.rentMultiplier
      );

    const property =
      entitySystem.create(
        "property",
        {
          districtId,
          name: name.trim(),
          area,
          seats,
          baseMonthlyRent,
          monthlyRent,
          depositMonths,
          status: STATUS.AVAILABLE,
          restaurantId: null
        }
      );

    eventBus.emit(
      "property:created",
      {
        property:
          structuredClone(property)
      }
    );

    return property;
  }

  get(id) {
    return requireProperty(id);
  }

  list({
    districtId = null,
    availableOnly = false
  } = {}) {
    return entitySystem
      .list("property")
      .filter(
        (item) =>
          districtId === null ||
          item.districtId === districtId
      )
      .filter(
        (item) =>
          !availableOnly ||
          item.status === STATUS.AVAILABLE
      );
  }

  markLeased(
    propertyId,
    restaurantId
  ) {
    const property =
      requireProperty(propertyId);

    if (
      property.status !==
      STATUS.AVAILABLE
    ) {
      throw new Error(
        `Property "${propertyId}" is not available`
      );
    }

    return entitySystem.update(
      "property",
      propertyId,
      {
        status: STATUS.LEASED,
        restaurantId
      }
    );
  }

  release(propertyId) {
    return entitySystem.update(
      "property",
      propertyId,
      {
        status: STATUS.AVAILABLE,
        restaurantId: null
      }
    );
  }
}

export const propertySystem =
  new PropertySystem();

export {
  PropertySystem,
  STATUS as PROPERTY_STATUS
};
