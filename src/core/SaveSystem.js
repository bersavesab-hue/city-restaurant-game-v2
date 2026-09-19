import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";
import { dataRegistry } from "./DataRegistry.js";
import { migrationSystem } from "./MigrationSystem.js";

import {
  CURRENT_SAVE_FORMAT_VERSION,
  SUPPORTED_SAVE_FORMAT_VERSIONS
} from "./SaveSchema.js";

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

function prepareStateForMigration(
  record
) {
  const state =
    structuredClone(
      record.state
    );

  if (
    record.formatVersion ===
      1 &&
    !Number.isInteger(
      state?.meta
        ?.schemaVersion
    )
  ) {
    if (
      state.meta !==
        undefined &&
      (
        state.meta === null ||
        typeof state.meta !==
          "object" ||
        Array.isArray(
          state.meta
        )
      )
    ) {
      throw new Error(
        "Legacy save state meta is invalid"
      );
    }

    state.meta = {
      ...(state.meta ?? {}),
      schemaVersion: 1
    };
  }

  return state;
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
    const state =
      migrationSystem
        .migrateState(
          gameState.snapshot()
        );

    const record = {
      formatVersion:
        CURRENT_SAVE_FORMAT_VERSION,
      savedAt: Date.now(),
      state,
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
          record.savedAt,
        formatVersion:
          record.formatVersion,
        schemaVersion:
          state.meta
            ?.schemaVersion
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
      !SUPPORTED_SAVE_FORMAT_VERSIONS
        .includes(
          record.formatVersion
        ) ||
      !record.state ||
      typeof record.state !==
        "object" ||
      Array.isArray(
        record.state
      )
    ) {
      throw new Error(
        `Save slot "${slot}" has an invalid format`
      );
    }

    const stateForMigration =
      prepareStateForMigration(
        record
      );

    const migratedState =
      migrationSystem.migrateState(
        stateForMigration
      );

    const previousState =
      gameState.snapshot();

    const previousRegistry =
      dataRegistry.snapshot();

    try {
      if (
        record.formatVersion >=
          2 &&
        record.registry !==
          undefined &&
        record.registry !==
          null
      ) {
        dataRegistry.replace(
          record.registry
        );
      }

      gameState.replace(
        migratedState,
        "save:load"
      );
    } catch (error) {
      try {
        dataRegistry.replace(
          previousRegistry
        );
      } catch {
        // Preserve the original load error.
      }

      try {
        gameState.replace(
          previousState,
          "save:loadRollback"
        );
      } catch {
        // Preserve the original load error.
      }

      throw error;
    }

    eventBus.emit(
      "save:loaded",
      {
        slot,
        savedAt:
          record.savedAt,
        formatVersion:
          record.formatVersion,
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
