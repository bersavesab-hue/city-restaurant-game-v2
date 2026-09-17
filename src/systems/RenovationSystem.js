import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { propertyFloorplanSystem } from "./PropertyFloorplanSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";

const FURNITURE = Object.freeze({
  table_2: {
    id: "table_2",
    name: "双人桌",
    type: "table",
    width: 2,
    height: 1,
    cost: 900,
    seats: 2
  },

  table_4: {
    id: "table_4",
    name: "四人桌",
    type: "table",
    width: 2,
    height: 2,
    cost: 1600,
    seats: 4
  },

  booth_4: {
    id: "booth_4",
    name: "四人卡座",
    type: "table",
    width: 3,
    height: 2,
    cost: 2800,
    seats: 4,
    appeal: 0.01,
    requiresFeature: "advanced_renovation"
  },

  kitchen_station: {
    id: "kitchen_station",
    name: "基础灶台",
    type: "kitchen",
    width: 2,
    height: 2,
    cost: 4500,
    kitchenStations: 1
  },

  prep_counter: {
    id: "prep_counter",
    name: "备餐台",
    type: "kitchen_support",
    width: 2,
    height: 1,
    cost: 2600,
    kitchenEfficiency: 0.08,
    maxCount: 3,
    requiresFeature: "advanced_renovation"
  },

  cashier_counter: {
    id: "cashier_counter",
    name: "收银台",
    type: "service",
    width: 2,
    height: 1,
    cost: 1800,
    serviceEfficiency: 0.08,
    maxCount: 2
  },

  waiting_bench: {
    id: "waiting_bench",
    name: "等候长椅",
    type: "service",
    width: 2,
    height: 1,
    cost: 1200,
    queueEfficiency: 0.08,
    maxCount: 3
  },

  decor_plant: {
    id: "decor_plant",
    name: "绿植装饰",
    type: "decor",
    width: 1,
    height: 1,
    cost: 500,
    appeal: 0.01,
    maxCount: 8
  },

  decor_feature: {
    id: "decor_feature",
    name: "主题装饰",
    type: "decor",
    width: 2,
    height: 2,
    cost: 4200,
    appeal: 0.04,
    maxCount: 3,
    requiresFeature: "advanced_renovation"
  }
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function requireInteger(value, name) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer`);
  }
}

class RenovationSystem {
  getFurnitureDefinition(id) {
    const definition = FURNITURE[id];

    if (!definition) {
      throw new Error(`Unknown furniture "${id}"`);
    }

    return structuredClone(definition);
  }

  getCatalog(restaurantId = null) {
    return Object.values(FURNITURE).map((item) => ({
      ...structuredClone(item),
      unlocked:
        !item.requiresFeature ||
        restaurantId === null ||
        storeProgressSystem.isUnlocked(
          restaurantId,
          item.requiresFeature
        )
    }));
  }

  findLayout(restaurantId) {
    return entitySystem
      .list("renovation_layout")
      .find((item) => item.restaurantId === restaurantId);
  }

  getLayout(restaurantId) {
    restaurantSystem.get(restaurantId);
    return this.findLayout(restaurantId) ?? null;
  }

  getGridSize(area) {
    const targetCells = Math.max(24, Math.ceil(area / 2));
    const width = Math.max(
      6,
      Math.ceil(Math.sqrt(targetCells * 1.5))
    );
    const height = Math.max(
      6,
      Math.ceil(targetCells / width)
    );

    return { width, height };
  }

  getLayoutFloors(layout) {
    if (Array.isArray(layout.floors) && layout.floors.length > 0) {
      return layout.floors;
    }

    return [
      {
        id: "floor_1",
        label: "1F",
        floorNumber: 1,
        area: layout.width * layout.height,
        usableArea: layout.width * layout.height,
        width: layout.width,
        height: layout.height,
        shape: "rectangle",
        polygon: [
          { x: 0, y: 0 },
          { x: layout.width, y: 0 },
          { x: layout.width, y: layout.height },
          { x: 0, y: layout.height }
        ],
        entrances: [],
        windows: [],
        columns: [],
        fixedStructures: [],
        utilityPoints: []
      }
    ];
  }

  getFloor(layout, floorId = null) {
    const floors = this.getLayoutFloors(layout);
    const resolvedId =
      floorId ?? layout.activeFloorId ?? floors[0]?.id ?? null;
    const floor = floors.find((item) => item.id === resolvedId);

    if (!floor) {
      throw new Error(`Renovation floor "${resolvedId}" does not exist`);
    }

    return floor;
  }

  getPlacementFloorId(layout, placement) {
    return (
      placement.floorId ??
      layout.activeFloorId ??
      this.getLayoutFloors(layout)[0]?.id ??
      "floor_1"
    );
  }

  initialize(restaurantId) {
    const restaurant = restaurantSystem.get(restaurantId);

    if (this.findLayout(restaurantId)) {
      return this.findLayout(restaurantId);
    }

    if (!restaurant.locationId) {
      throw new Error("Restaurant requires a leased property before renovation");
    }

    const property = propertySystem.get(restaurant.locationId);
    const propertyLayout = propertySystem.getLayout(property.id);
    const fallbackGrid = this.getGridSize(property.usableArea ?? property.area);
    const floors = propertyLayout.floors?.length
      ? structuredClone(propertyLayout.floors)
      : [
          {
            id: "floor_1",
            label: "1F",
            floorNumber: 1,
            area: property.area,
            usableArea: property.usableArea ?? property.area,
            width: fallbackGrid.width,
            height: fallbackGrid.height,
            shape: "rectangle",
            polygon: [
              { x: 0, y: 0 },
              { x: fallbackGrid.width, y: 0 },
              { x: fallbackGrid.width, y: fallbackGrid.height },
              { x: 0, y: fallbackGrid.height }
            ],
            entrances: [],
            windows: [],
            columns: [],
            fixedStructures: [],
            utilityPoints: []
          }
        ];
    const defaultFloor = floors[0];
    const time = gameState.getSection("time");

    const layout = entitySystem.create("renovation_layout", {
      restaurantId,
      propertyId: property.id,
      propertyLayoutVersion: propertyLayout.layoutVersion ?? 1,
      floorCount: floors.length,
      floors,
      activeFloorId: defaultFloor.id,
      width: defaultFloor.width,
      height: defaultFloor.height,
      active: false,
      revision: 1,
      placements: [],
      nextPlacementNumber: 1,
      totalSpent: 0,
      createdDay: time.day,
      updatedDay: time.day,
      activatedDay: null
    });

    eventBus.emit("renovation:initialized", {
      restaurantId,
      layoutId: layout.id,
      propertyId: property.id,
      floorCount: floors.length,
      activeFloorId: defaultFloor.id
    });

    return layout;
  }

  requireLayout(restaurantId) {
    return this.findLayout(restaurantId) ?? this.initialize(restaurantId);
  }

  setActiveFloor(restaurantId, floorId) {
    const layout = this.requireLayout(restaurantId);
    const floor = this.getFloor(layout, floorId);

    return entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        activeFloorId: floor.id,
        width: floor.width,
        height: floor.height,
        revision: (layout.revision ?? 0) + 1,
        updatedDay: gameState.getSection("time").day
      }
    );
  }

  getSize(definition, rotation) {
    if (![0, 90].includes(rotation)) {
      throw new RangeError("Rotation must be 0 or 90");
    }

    return rotation === 90
      ? { width: definition.height, height: definition.width }
      : { width: definition.width, height: definition.height };
  }

  rectanglesOverlap(a, b) {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }

  validatePlacement(layout, placement, ignorePlacementId = null) {
    const definition = this.getFurnitureDefinition(placement.furnitureId);
    const size = this.getSize(definition, placement.rotation ?? 0);
    const floorId = this.getPlacementFloorId(layout, placement);
    const floor = this.getFloor(layout, floorId);

    requireInteger(placement.x, "x");
    requireInteger(placement.y, "y");

    if (placement.x < 0 || placement.y < 0) {
      throw new RangeError("Furniture position cannot be negative");
    }

    const rectangle = {
      x: placement.x,
      y: placement.y,
      width: size.width,
      height: size.height
    };

    if (layout.propertyId && Array.isArray(layout.floors)) {
      propertyFloorplanSystem.validatePlacement(
        layout.propertyId,
        floor.id,
        rectangle
      );
    } else if (
      placement.x + size.width > floor.width ||
      placement.y + size.height > floor.height
    ) {
      throw new Error("Furniture is outside renovation bounds");
    }

    for (const current of layout.placements ?? []) {
      if (current.id === ignorePlacementId) {
        continue;
      }

      if (this.getPlacementFloorId(layout, current) !== floor.id) {
        continue;
      }

      const currentDefinition = this.getFurnitureDefinition(
        current.furnitureId
      );
      const currentSize = this.getSize(
        currentDefinition,
        current.rotation ?? 0
      );

      if (
        this.rectanglesOverlap(rectangle, {
          x: current.x,
          y: current.y,
          width: currentSize.width,
          height: currentSize.height
        })
      ) {
        throw new Error("Furniture overlaps an existing placement");
      }
    }

    return true;
  }

  countByType(layout, type) {
    return (layout.placements ?? []).filter((placement) => {
      return this.getFurnitureDefinition(placement.furnitureId).type === type;
    }).length;
  }

  countFurniture(layout, furnitureId) {
    return (layout.placements ?? []).filter(
      (placement) => placement.furnitureId === furnitureId
    ).length;
  }

  validateLimits(restaurantId, layout, definition) {
    const limits = storeProgressSystem.getLimits(restaurantId);

    if (
      definition.type === "table" &&
      this.countByType(layout, "table") >= limits.tables
    ) {
      throw new Error(`Table limit reached: ${limits.tables}`);
    }

    if (
      definition.kitchenStations &&
      this.getOperationalModifiersFromLayout(layout).kitchenStations >=
        limits.kitchenStations
    ) {
      throw new Error(
        `Kitchen station limit reached: ${limits.kitchenStations}`
      );
    }

    if (
      definition.maxCount &&
      this.countFurniture(layout, definition.id) >= definition.maxCount
    ) {
      throw new Error(
        `Furniture limit reached for "${definition.id}": ${definition.maxCount}`
      );
    }
  }

  placeItem({
    restaurantId,
    furnitureId,
    x,
    y,
    rotation = 0,
    floorId = null
  }) {
    const layout = this.requireLayout(restaurantId);
    const definition = this.getFurnitureDefinition(furnitureId);

    if (
      definition.requiresFeature &&
      !storeProgressSystem.isUnlocked(
        restaurantId,
        definition.requiresFeature
      )
    ) {
      throw new Error(`Furniture "${furnitureId}" is not unlocked`);
    }

    this.validateLimits(restaurantId, layout, definition);

    const placement = {
      id: `placement_${layout.nextPlacementNumber ?? 1}`,
      furnitureId,
      floorId: floorId ?? layout.activeFloorId ?? this.getLayoutFloors(layout)[0].id,
      x,
      y,
      rotation
    };

    this.validatePlacement(layout, placement);

    financeSystem.expense(
      restaurantId,
      definition.cost,
      definition.type === "decor"
        ? FINANCE_CATEGORY.DECORATION
        : FINANCE_CATEGORY.EQUIPMENT,
      `装修购置：${definition.name}`
    );

    const time = gameState.getSection("time");
    const updated = entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        placements: [...(layout.placements ?? []), placement],
        nextPlacementNumber: (layout.nextPlacementNumber ?? 1) + 1,
        totalSpent: (layout.totalSpent ?? 0) + definition.cost,
        revision: (layout.revision ?? 0) + 1,
        updatedDay: time.day
      }
    );

    eventBus.emit("renovation:itemPlaced", {
      restaurantId,
      layoutId: layout.id,
      placement: structuredClone(placement)
    });

    return updated;
  }

  moveItem({
    restaurantId,
    placementId,
    x,
    y,
    rotation = null,
    floorId = null
  }) {
    const layout = this.requireLayout(restaurantId);
    const current = (layout.placements ?? []).find(
      (item) => item.id === placementId
    );

    if (!current) {
      throw new Error(`Placement "${placementId}" does not exist`);
    }

    const moved = {
      ...current,
      floorId:
        floorId ??
        current.floorId ??
        layout.activeFloorId ??
        this.getLayoutFloors(layout)[0].id,
      x,
      y,
      rotation: rotation ?? current.rotation ?? 0
    };

    this.validatePlacement(layout, moved, placementId);

    const time = gameState.getSection("time");
    const placements = layout.placements.map((item) =>
      item.id === placementId ? moved : item
    );

    return entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        placements,
        revision: (layout.revision ?? 0) + 1,
        updatedDay: time.day
      }
    );
  }

  removeItem(restaurantId, placementId) {
    const layout = this.requireLayout(restaurantId);
    const exists = (layout.placements ?? []).some(
      (item) => item.id === placementId
    );

    if (!exists) {
      throw new Error(`Placement "${placementId}" does not exist`);
    }

    const time = gameState.getSection("time");

    return entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        placements: layout.placements.filter(
          (item) => item.id !== placementId
        ),
        active: false,
        revision: (layout.revision ?? 0) + 1,
        updatedDay: time.day
      }
    );
  }

  getOperationalModifiersFromLayout(layout) {
    const result = {
      seats: 0,
      tables: 0,
      kitchenStations: 0,
      kitchenEfficiency: 1,
      serviceEfficiency: 1,
      queueEfficiency: 1,
      appealMultiplier: 1
    };

    for (const placement of layout.placements ?? []) {
      const item = this.getFurnitureDefinition(placement.furnitureId);

      result.seats += item.seats ?? 0;
      result.tables += item.type === "table" ? 1 : 0;
      result.kitchenStations += item.kitchenStations ?? 0;
      result.kitchenEfficiency += item.kitchenEfficiency ?? 0;
      result.serviceEfficiency += item.serviceEfficiency ?? 0;
      result.queueEfficiency += item.queueEfficiency ?? 0;
      result.appealMultiplier += item.appeal ?? 0;
    }

    result.kitchenEfficiency = clamp(result.kitchenEfficiency, 1, 1.3);
    result.serviceEfficiency = clamp(result.serviceEfficiency, 1, 1.2);
    result.queueEfficiency = clamp(result.queueEfficiency, 1, 1.25);
    result.appealMultiplier = clamp(result.appealMultiplier, 1, 1.15);

    return result;
  }

  getOperationalModifiers(restaurantId) {
    const layout = this.findLayout(restaurantId);

    if (!layout || !layout.active) {
      return {
        active: false,
        seats: null,
        tables: null,
        kitchenStations: null,
        kitchenEfficiency: 1,
        serviceEfficiency: 1,
        queueEfficiency: 1,
        appealMultiplier: 1
      };
    }

    return {
      active: true,
      ...this.getOperationalModifiersFromLayout(layout)
    };
  }

  activateLayout(restaurantId) {
    const layout = this.requireLayout(restaurantId);
    const modifiers = this.getOperationalModifiersFromLayout(layout);

    if (modifiers.seats < 2) {
      throw new Error("Active renovation requires at least 2 seats");
    }

    if (modifiers.kitchenStations < 1) {
      throw new Error("Active renovation requires at least 1 kitchen station");
    }

    const time = gameState.getSection("time");
    const updated = entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        active: true,
        activatedDay: time.day,
        updatedDay: time.day,
        revision: (layout.revision ?? 0) + 1
      }
    );

    eventBus.emit("renovation:activated", {
      restaurantId,
      layoutId: layout.id,
      modifiers
    });

    return updated;
  }

  deactivateLayout(restaurantId) {
    const layout = this.requireLayout(restaurantId);

    return entitySystem.update(
      "renovation_layout",
      layout.id,
      {
        active: false,
        revision: (layout.revision ?? 0) + 1,
        updatedDay: gameState.getSection("time").day
      }
    );
  }

  getKitchenCapacityPerHour(restaurantId) {
    const modifiers = this.getOperationalModifiers(restaurantId);

    if (!modifiers.active) {
      return Infinity;
    }

    return Math.max(
      1,
      Math.floor(
        modifiers.kitchenStations *
          8 *
          modifiers.kitchenEfficiency
      )
    );
  }

  getSummary(restaurantId) {
    const layout = this.findLayout(restaurantId);

    if (!layout) {
      return {
        restaurantId,
        initialized: false,
        active: false,
        placements: 0,
        totalSpent: 0,
        modifiers: this.getOperationalModifiers(restaurantId)
      };
    }

    let editingMode = null;

    if (layout.propertyId) {
      try {
        editingMode = propertyFloorplanSystem.getEditingMode(layout.propertyId);
      } catch {
        editingMode = null;
      }
    }

    return {
      restaurantId,
      initialized: true,
      active: layout.active,
      layoutId: layout.id,
      propertyId: layout.propertyId ?? null,
      propertyLayoutVersion: layout.propertyLayoutVersion ?? 1,
      floorCount: layout.floorCount ?? this.getLayoutFloors(layout).length,
      activeFloorId:
        layout.activeFloorId ?? this.getLayoutFloors(layout)[0]?.id ?? null,
      floors: structuredClone(this.getLayoutFloors(layout)),
      width: layout.width,
      height: layout.height,
      placements: layout.placements.length,
      totalSpent: layout.totalSpent ?? 0,
      revision: layout.revision ?? 1,
      editingMode,
      modifiers: layout.active
        ? this.getOperationalModifiers(restaurantId)
        : {
            active: false,
            ...this.getOperationalModifiersFromLayout(layout)
          }
    };
  }
}

export const renovationSystem = new RenovationSystem();

export {
  RenovationSystem,
  FURNITURE as RENOVATION_FURNITURE
};
