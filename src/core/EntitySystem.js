import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

const clone = (value) => structuredClone(value);

function normalizeType(type) {
  if (typeof type !== "string" || type.trim() === "") {
    throw new TypeError("Entity type must be a non-empty string");
  }

  const normalized = type.trim().toLowerCase();

  if (!/^[a-z][a-z0-9_-]*$/.test(normalized)) {
    throw new Error(
      `Invalid entity type "${type}". Use lowercase letters, numbers, "_" or "-".`
    );
  }

  return normalized;
}

class EntitySystem {
  getData() {
    const data = gameState.getSection("data") ?? {};

    if (!data.entities) {
      data.entities = {};
    }

    if (!data.entityCounters) {
      data.entityCounters = {};
    }

    return data;
  }

  create(type, attributes = {}, options = {}) {
    const entityType = normalizeType(type);

    if (
      !attributes ||
      typeof attributes !== "object" ||
      Array.isArray(attributes)
    ) {
      throw new TypeError("Entity attributes must be an object");
    }

    const data = this.getData();

    if (!data.entities[entityType]) {
      data.entities[entityType] = {};
    }

    if (!data.entityCounters[entityType]) {
      data.entityCounters[entityType] = 0;
    }

    let id = options.id;

    if (id !== undefined) {
      if (typeof id !== "string" || id.trim() === "") {
        throw new TypeError("Custom entity id must be a non-empty string");
      }

      id = id.trim();
    } else {
      data.entityCounters[entityType] += 1;

      id = `${entityType}_${String(
        data.entityCounters[entityType]
      ).padStart(6, "0")}`;
    }

    if (data.entities[entityType][id]) {
      throw new Error(
        `Entity "${entityType}:${id}" already exists`
      );
    }

    const entity = {
      ...clone(attributes),
      id,
      type: entityType
    };

    data.entities[entityType][id] = entity;

    gameState.setSection(
      "data",
      data,
      `entity:create:${entityType}`
    );

    eventBus.emit("entity:created", {
      type: entityType,
      id,
      entity: clone(entity)
    });

    return clone(entity);
  }

  get(type, id) {
    const entityType = normalizeType(type);
    const data = this.getData();

    const entity = data.entities?.[entityType]?.[id];

    return entity ? clone(entity) : undefined;
  }

  exists(type, id) {
    return this.get(type, id) !== undefined;
  }

  update(type, id, changes) {
    const entityType = normalizeType(type);

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      throw new TypeError("Entity changes must be an object");
    }

    if ("id" in changes || "type" in changes) {
      throw new Error("Entity id and type cannot be changed");
    }

    const data = this.getData();
    const current = data.entities?.[entityType]?.[id];

    if (!current) {
      throw new Error(
        `Entity "${entityType}:${id}" does not exist`
      );
    }

    const updated = {
      ...current,
      ...clone(changes)
    };

    data.entities[entityType][id] = updated;

    gameState.setSection(
      "data",
      data,
      `entity:update:${entityType}`
    );

    eventBus.emit("entity:updated", {
      type: entityType,
      id,
      changes: clone(changes),
      entity: clone(updated)
    });

    return clone(updated);
  }

  remove(type, id) {
    const entityType = normalizeType(type);
    const data = this.getData();

    const entity = data.entities?.[entityType]?.[id];

    if (!entity) {
      return false;
    }

    delete data.entities[entityType][id];

    gameState.setSection(
      "data",
      data,
      `entity:remove:${entityType}`
    );

    eventBus.emit("entity:removed", {
      type: entityType,
      id,
      entity: clone(entity)
    });

    return true;
  }

  list(type) {
    const entityType = normalizeType(type);
    const data = this.getData();

    return Object.values(
      data.entities?.[entityType] ?? {}
    ).map(clone);
  }

  count(type) {
    return this.list(type).length;
  }

  clearType(type) {
    const entityType = normalizeType(type);
    const data = this.getData();

    const count = Object.keys(
      data.entities?.[entityType] ?? {}
    ).length;

    data.entities[entityType] = {};

    gameState.setSection(
      "data",
      data,
      `entity:clear:${entityType}`
    );

    eventBus.emit("entity:typeCleared", {
      type: entityType,
      count
    });

    return count;
  }

  listTypes() {
    const data = this.getData();

    return Object.keys(data.entities ?? {});
  }
}

export const entitySystem = new EntitySystem();
export { EntitySystem };
