import { eventBus } from "./EventBus.js";

class DataRegistry {
  constructor() {
    this.collections = new Map();
  }

  register(name, records, { overwrite = false } = {}) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError("Registry name must be a non-empty string");
    }

    if (!Array.isArray(records)) {
      throw new TypeError(`Registry "${name}" data must be an array`);
    }

    if (this.collections.has(name) && !overwrite) {
      throw new Error(`Registry "${name}" already exists`);
    }

    const map = new Map();

    for (const record of records) {
      if (!record || typeof record !== "object") {
        throw new TypeError(`Registry "${name}" contains an invalid record`);
      }

      if (
        typeof record.id !== "string" ||
        record.id.trim() === ""
      ) {
        throw new Error(
          `Every record in registry "${name}" must have a string id`
        );
      }

      if (map.has(record.id)) {
        throw new Error(
          `Duplicate id "${record.id}" in registry "${name}"`
        );
      }

      map.set(record.id, structuredClone(record));
    }

    this.collections.set(name, map);

    eventBus.emit("data:registered", {
      name,
      count: map.size
    });

    return map.size;
  }

  hasCollection(name) {
    return this.collections.has(name);
  }

  get(name, id) {
    const collection = this.collections.get(name);

    if (!collection) {
      return undefined;
    }

    const record = collection.get(id);

    return record ? structuredClone(record) : undefined;
  }

  getAll(name) {
    const collection = this.collections.get(name);

    if (!collection) {
      return [];
    }

    return [...collection.values()].map((record) =>
      structuredClone(record)
    );
  }

  has(name, id) {
    return this.collections.get(name)?.has(id) ?? false;
  }

  removeCollection(name) {
    const removed = this.collections.delete(name);

    if (removed) {
      eventBus.emit("data:removed", { name });
    }

    return removed;
  }

  clear() {
    this.collections.clear();
    eventBus.emit("data:cleared");
  }

  listCollections() {
    return [...this.collections.keys()];
  }

  count(name) {
    return this.collections.get(name)?.size ?? 0;
  }
}

export const dataRegistry = new DataRegistry();
export { DataRegistry };
