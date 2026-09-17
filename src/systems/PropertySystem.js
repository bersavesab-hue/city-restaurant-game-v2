import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { districtSystem } from "./DistrictSystem.js";

const STATUS = Object.freeze({
  AVAILABLE: "available",
  LEASED: "leased",
  LOCKED: "locked"
});

function requireProperty(id) {
  const property = entitySystem.get("property", id);

  if (!property) {
    throw new Error(`Property "${id}" does not exist`);
  }

  return property;
}

function requirePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be positive`);
  }
}

function requireOptionalPositiveNumber(value, name) {
  if (value !== null && value !== undefined) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be positive`);
    }
  }
}

function getDefaultGridSize(area) {
  const targetCells = Math.max(24, Math.ceil(area / 2));
  const width = Math.max(6, Math.ceil(Math.sqrt(targetCells * 1.5)));
  const height = Math.max(6, Math.ceil(targetCells / width));
  return { width, height };
}

function cloneList(value, name) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array`);
  }

  return structuredClone(value);
}

function normalizePolygon(polygon, width, height) {
  if (polygon === undefined || polygon === null) {
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
  }

  if (!Array.isArray(polygon) || polygon.length < 3) {
    throw new Error("Floor polygon must contain at least 3 points");
  }

  return polygon.map((point) => {
    if (
      !point ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      throw new Error("Floor polygon contains an invalid point");
    }

    return { x: point.x, y: point.y };
  });
}

function normalizeFloor(floor, index, fallbackArea) {
  const area = floor?.area ?? fallbackArea;
  const usableArea = floor?.usableArea ?? area;

  requirePositiveInteger(area, "Floor area");
  requirePositiveInteger(usableArea, "Floor usableArea");

  if (usableArea > area) {
    throw new RangeError("Floor usableArea cannot exceed floor area");
  }

  const defaultGrid = getDefaultGridSize(usableArea);
  const width = floor?.width ?? defaultGrid.width;
  const height = floor?.height ?? defaultGrid.height;

  requirePositiveInteger(width, "Floor width");
  requirePositiveInteger(height, "Floor height");

  const id = String(floor?.id ?? `floor_${index + 1}`);
  const label = String(floor?.label ?? `${index + 1}F`);

  return {
    id,
    label,
    floorNumber: Number.isInteger(floor?.floorNumber)
      ? floor.floorNumber
      : index + 1,
    area,
    usableArea,
    width,
    height,
    shape: floor?.shape ?? "rectangle",
    polygon: normalizePolygon(floor?.polygon, width, height),
    entrances: cloneList(floor?.entrances, "entrances"),
    windows: cloneList(floor?.windows, "windows"),
    columns: cloneList(floor?.columns, "columns"),
    fixedStructures: cloneList(
      floor?.fixedStructures,
      "fixedStructures"
    ),
    utilityPoints: cloneList(floor?.utilityPoints, "utilityPoints"),
    notes: floor?.notes ?? null
  };
}

function normalizeFloors(area, usableArea, floors) {
  if (floors === undefined || floors === null) {
    return [
      normalizeFloor(
        {
          id: "floor_1",
          label: "1F",
          floorNumber: 1,
          area,
          usableArea
        },
        0,
        area
      )
    ];
  }

  if (!Array.isArray(floors) || floors.length === 0) {
    throw new Error("floors must be a non-empty array");
  }

  const fallbackArea = Math.max(1, Math.floor(area / floors.length));
  const normalized = floors.map((floor, index) =>
    normalizeFloor(floor, index, fallbackArea)
  );

  const ids = new Set();
  for (const floor of normalized) {
    if (ids.has(floor.id)) {
      throw new Error(`Duplicate floor id "${floor.id}"`);
    }
    ids.add(floor.id);
  }

  return normalized;
}

class PropertySystem {
  create({
    districtId,
    name,
    area,
    usableArea = area,
    baseMonthlyRent,
    seats = 10,
    depositMonths = 2,
    floors = null,
    frontageMeters = null,
    ceilingHeight = null,
    parkingSpaces = 0,
    foodServiceAllowed = true,
    exhaustAllowed = true,
    renovationRules = null,
    tags = []
  }) {
    if (!districtSystem.exists(districtId)) {
      throw new Error(`District "${districtId}" does not exist`);
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Property name is required");
    }

    requirePositiveInteger(area, "Area");
    requirePositiveInteger(usableArea, "Usable area");

    if (usableArea > area) {
      throw new RangeError("Usable area cannot exceed area");
    }

    requirePositiveInteger(baseMonthlyRent, "Monthly rent");
    requirePositiveInteger(seats, "Seats");
    requirePositiveInteger(depositMonths, "Deposit months");

    if (!Number.isInteger(parkingSpaces) || parkingSpaces < 0) {
      throw new RangeError("parkingSpaces must be non-negative");
    }

    requireOptionalPositiveNumber(frontageMeters, "frontageMeters");
    requireOptionalPositiveNumber(ceilingHeight, "ceilingHeight");

    if (!Array.isArray(tags)) {
      throw new TypeError("tags must be an array");
    }

    const normalizedFloors = normalizeFloors(area, usableArea, floors);
    const district = districtSystem.get(districtId);
    const monthlyRent = Math.round(
      baseMonthlyRent * district.rentMultiplier
    );

    const property = entitySystem.create("property", {
      districtId,
      name: name.trim(),
      area,
      usableArea,
      seats,
      baseMonthlyRent,
      monthlyRent,
      depositMonths,
      floorCount: normalizedFloors.length,
      floors: normalizedFloors,
      frontageMeters,
      ceilingHeight,
      parkingSpaces,
      foodServiceAllowed: Boolean(foodServiceAllowed),
      exhaustAllowed: Boolean(exhaustAllowed),
      renovationRules: {
        allowPartitions: true,
        allowWallFinish: true,
        allowFloorFinish: true,
        allowCeilingFinish: true,
        ...(renovationRules ?? {})
      },
      tags: [...tags],
      layoutVersion: 1,
      status: STATUS.AVAILABLE,
      restaurantId: null
    });

    eventBus.emit("property:created", {
      property: structuredClone(property)
    });

    return property;
  }

  get(id) {
    return requireProperty(id);
  }

  getLayout(id) {
    const property = requireProperty(id);

    return {
      propertyId: property.id,
      layoutVersion: property.layoutVersion ?? 1,
      area: property.area,
      usableArea: property.usableArea ?? property.area,
      floorCount: property.floorCount ?? property.floors?.length ?? 1,
      floors: structuredClone(property.floors ?? []),
      renovationRules: structuredClone(property.renovationRules ?? {})
    };
  }

  getFloor(propertyId, floorId = null) {
    const property = requireProperty(propertyId);
    const floors = property.floors ?? [];

    if (floors.length === 0) {
      return null;
    }

    if (floorId === null) {
      return structuredClone(floors[0]);
    }

    const floor = floors.find((item) => item.id === floorId);
    return floor ? structuredClone(floor) : null;
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

  markLeased(propertyId, restaurantId) {
    const property = requireProperty(propertyId);

    if (property.status !== STATUS.AVAILABLE) {
      throw new Error(`Property "${propertyId}" is not available`);
    }

    return entitySystem.update("property", propertyId, {
      status: STATUS.LEASED,
      restaurantId
    });
  }

  release(propertyId) {
    return entitySystem.update("property", propertyId, {
      status: STATUS.AVAILABLE,
      restaurantId: null
    });
  }
}

export const propertySystem = new PropertySystem();

export {
  PropertySystem,
  STATUS as PROPERTY_STATUS,
  getDefaultGridSize
};
