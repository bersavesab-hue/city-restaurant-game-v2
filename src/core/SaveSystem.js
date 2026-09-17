import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";
import { dataRegistry } from "./DataRegistry.js";
import { migrationSystem } from "./MigrationSystem.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.has(key)
      ? this.data.get(key)
      : null;
  }

  setItem(key, value) {
    this.data.set(
      key,
      String(value)
    );
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

function resolveDefaultStorage() {
  if (
    typeof globalThis !==
      "undefined" &&
    globalThis.localStorage &&
    typeof globalThis.localStorage
      .getItem === "function"
  ) {
    return globalThis.localStorage;
  }

  return new MemoryStorage();
}

class SaveSystem {
  constructor({
    storage =
      resolveDefaultStorage(),
    prefix =
      "cityRestaurantGame"
  } = {}) {
    this.storage = storage;
    this.prefix = prefix;
  }

  getKey(slot = "auto") {
    return `${this.prefix}:${slot}`;
  }

  save(slot = "auto") {
    const record = {
      formatVersion: 2,
      savedAt: Date.now(),
      state:
        gameState.snapshot(),
      registry:
        dataRegistry.snapshot()
    };

    this.storage.setItem(
      this.getKey(slot),
      JSON.stringify(record)
    );

    eventBus.emit(
      "save:completed",
      {
        slot,
        savedAt:
          record.savedAt
      }
    );

    return structuredClone(
      record
    );
  }

  load(slot = "auto") {
    const raw =
      this.storage.getItem(
        this.getKey(slot)
      );

    if (raw === null) {
      return null;
    }

    let record;

    try {
      record = JSON.parse(raw);
    } catch {
      throw new Error(
        `Save slot "${slot}" contains invalid JSON`
      );
    }

    if (
      !record ||
      ![1, 2].includes(
        record.formatVersion
      ) ||
      !record.state ||
      typeof record.state !==
        "object"
    ) {
      throw new Error(
        `Save slot "${slot}" has an invalid format`
      );
    }

    const migratedState =
      migrationSystem.migrateState(
        record.state
      );

    if (
      record.formatVersion >= 2 &&
      record.registry
    ) {
      dataRegistry.replace(
        record.registry
      );
    }

    gameState.replace(
      migratedState,
      "save:load"
    );

    eventBus.emit(
      "save:loaded",
      {
        slot,
        savedAt:
          record.savedAt,
        schemaVersion:
          migratedState.meta
            ?.schemaVersion
      }
    );

    return {
      state:
        gameState.snapshot(),
      registry:
        dataRegistry.snapshot()
    };
  }

  has(slot = "auto") {
    return (
      this.storage.getItem(
        this.getKey(slot)
      ) !== null
    );
  }

  remove(slot = "auto") {
    const existed =
      this.has(slot);

    this.storage.removeItem(
      this.getKey(slot)
    );

    if (existed) {
      eventBus.emit(
        "save:removed",
        { slot }
      );
    }

    return existed;
  }
}

export const saveSystem =
  new SaveSystem();

export {
  SaveSystem,
  MemoryStorage
};
