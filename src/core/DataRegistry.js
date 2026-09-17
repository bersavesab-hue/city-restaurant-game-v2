import { eventBus } from "./EventBus.js";

const clone = (value) =>
  structuredClone(value);

class DataRegistry {
  constructor() {
    this.collections =
      new Map();
  }

  register(
    name,
    records,
    { overwrite = false } = {}
  ) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "Registry name must be a non-empty string"
      );
    }

    if (!Array.isArray(records)) {
      throw new TypeError(
        `Registry "${name}" data must be an array`
      );
    }

    if (
      this.collections.has(name) &&
      !overwrite
    ) {
      throw new Error(
        `Registry "${name}" already exists`
      );
    }

    const map = new Map();

    for (const record of records) {
      if (
        !record ||
        typeof record !== "object"
      ) {
        throw new TypeError(
          `Registry "${name}" contains an invalid record`
        );
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

      map.set(
        record.id,
        clone(record)
      );
    }

    this.collections.set(
      name,
      map
    );

    eventBus.emit(
      "data:registered",
      {
        name,
        count: map.size
      }
    );

    return map.size;
  }

  hasCollection(name) {
    return this.collections.has(
      name
    );
  }

  get(name, id) {
    const record =
      this.collections
        .get(name)
        ?.get(id);

    return record
      ? clone(record)
      : undefined;
  }

  getAll(name) {
    const collection =
      this.collections.get(name);

    if (!collection) {
      return [];
    }

    return [
      ...collection.values()
    ].map(clone);
  }

  has(name, id) {
    return (
      this.collections
        .get(name)
        ?.has(id) ?? false
    );
  }

  count(name) {
    return (
      this.collections
        .get(name)
        ?.size ?? 0
    );
  }

  listCollections() {
    return [
      ...this.collections.keys()
    ];
  }

  removeCollection(name) {
    const removed =
      this.collections.delete(name);

    if (removed) {
      eventBus.emit(
        "data:removed",
        { name }
      );
    }

    return removed;
  }

  snapshot() {
    const result = {};

    for (
      const [name, collection]
      of this.collections
    ) {
      result[name] = [
        ...collection.values()
      ].map(clone);
    }

    return result;
  }

  replace(snapshot) {
    if (
      !snapshot ||
      typeof snapshot !== "object" ||
      Array.isArray(snapshot)
    ) {
      throw new TypeError(
        "Registry snapshot must be an object"
      );
    }

    this.collections.clear();

    for (
      const [name, records]
      of Object.entries(snapshot)
    ) {
      this.register(
        name,
        records,
        { overwrite: true }
      );
    }

    eventBus.emit(
      "data:restored",
      {
        collections:
          this.listCollections(),
        collectionCount:
          this.collections.size
      }
    );

    return this.snapshot();
  }

  clear() {
    this.collections.clear();

    eventBus.emit(
      "data:cleared"
    );
  }
}

export const dataRegistry =
  new DataRegistry();

export { DataRegistry };
