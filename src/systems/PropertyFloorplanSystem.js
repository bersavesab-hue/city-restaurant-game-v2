import { propertySystem } from "./PropertySystem.js";

function pointOnSegment(point, a, b) {
  const cross =
    (point.y - a.y) * (b.x - a.x) -
    (point.x - a.x) * (b.y - a.y);

  if (Math.abs(cross) > 1e-9) {
    return false;
  }

  const dot =
    (point.x - a.x) * (point.x - b.x) +
    (point.y - a.y) * (point.y - b.y);

  return dot <= 1e-9;
}

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];

    if (pointOnSegment(point, a, b)) {
      return true;
    }

    const intersects =
      (a.y > point.y) !== (b.y > point.y) &&
      point.x <
        ((b.x - a.x) * (point.y - a.y)) /
          (b.y - a.y) +
        a.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function rectanglesOverlap(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function normalizeObstacle(item, fallbackSize = 1) {
  if (!item || !Number.isFinite(item.x) || !Number.isFinite(item.y)) {
    return null;
  }

  return {
    id: item.id ?? null,
    type: item.type ?? "structure",
    x: item.x,
    y: item.y,
    width:
      Number.isFinite(item.width) && item.width > 0
        ? item.width
        : fallbackSize,
    height:
      Number.isFinite(item.height) && item.height > 0
        ? item.height
        : fallbackSize
  };
}

class PropertyFloorplanSystem {
  getFloor(propertyId, floorId = null) {
    const floor = propertySystem.getFloor(propertyId, floorId);

    if (!floor) {
      throw new Error(`Floor "${floorId ?? "default"}" does not exist`);
    }

    return floor;
  }

  getObstacles(propertyId, floorId = null) {
    const floor = this.getFloor(propertyId, floorId);

    return [
      ...(floor.columns ?? []).map(item => ({
        ...item,
        type: item.type ?? "column"
      })),
      ...(floor.fixedStructures ?? [])
    ]
      .map(item => normalizeObstacle(item))
      .filter(Boolean);
  }

  isRectangleInsideFloor(propertyId, floorId, rectangle) {
    const floor = this.getFloor(propertyId, floorId);
    const polygon = floor.polygon ?? [];

    if (
      !rectangle ||
      !Number.isFinite(rectangle.x) ||
      !Number.isFinite(rectangle.y) ||
      !Number.isFinite(rectangle.width) ||
      !Number.isFinite(rectangle.height) ||
      rectangle.width <= 0 ||
      rectangle.height <= 0
    ) {
      return false;
    }

    const corners = [
      { x: rectangle.x, y: rectangle.y },
      { x: rectangle.x + rectangle.width, y: rectangle.y },
      { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
      { x: rectangle.x, y: rectangle.y + rectangle.height }
    ];

    return corners.every(point => pointInPolygon(point, polygon));
  }

  findObstacleCollision(propertyId, floorId, rectangle) {
    return (
      this.getObstacles(propertyId, floorId).find(obstacle =>
        rectanglesOverlap(rectangle, obstacle)
      ) ?? null
    );
  }

  validatePlacement(propertyId, floorId, rectangle) {
    const floor = this.getFloor(propertyId, floorId);

    if (!this.isRectangleInsideFloor(propertyId, floor.id, rectangle)) {
      throw new Error("Placement is outside the rented floorplan");
    }

    const obstacle = this.findObstacleCollision(
      propertyId,
      floor.id,
      rectangle
    );

    if (obstacle) {
      throw new Error(
        `Placement collides with fixed structure "${obstacle.id ?? obstacle.type}"`
      );
    }

    return true;
  }

  getEditingMode(propertyId) {
    const property = propertySystem.get(propertyId);
    const usableArea = property.usableArea ?? property.area;

    if (usableArea <= 120 && (property.floorCount ?? 1) === 1) {
      return {
        mode: "direct",
        minimap: false,
        zoneNavigator: false,
        floorSelector: false
      };
    }

    if (usableArea <= 1000 && (property.floorCount ?? 1) === 1) {
      return {
        mode: "overview_edit",
        minimap: true,
        zoneNavigator: true,
        floorSelector: false
      };
    }

    return {
      mode: "floor_zone",
      minimap: true,
      zoneNavigator: true,
      floorSelector: (property.floorCount ?? 1) > 1
    };
  }
}

export const propertyFloorplanSystem = new PropertyFloorplanSystem();
export {
  PropertyFloorplanSystem,
  pointInPolygon,
  rectanglesOverlap
};
