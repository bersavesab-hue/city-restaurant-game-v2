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

function parseSaveRecord(
  raw,
  slot
) {
  let record;

  try {
    record =
      JSON.parse(
        raw
      );
  } catch {
    throw new Error(
      `Save slot "${slot}" contains invalid JSON`
    );
  }

  if (
    Number.isInteger(
      record?.formatVersion
    ) &&
    record.formatVersion >
      CURRENT_SAVE_FORMAT_VERSION
  ) {
    const error =
      new Error(
        `Save slot "${slot}" uses future format version ${record.formatVersion}`
      );

    error.code =
      "SAVE_FUTURE_FORMAT";

    throw error;
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

  return record;
}

function canBackupRaw(
  raw,
  slot
) {
  try {
    parseSaveRecord(
      raw,
      slot
    );

    return true;
  } catch {
    return false;
  }
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

  getBackupKey(
    slot = "auto"
  ) {
    return `${this.getKey(slot)}:backup`;
  }

  createRecord() {
    const state =
      migrationSystem
        .migrateState(
          gameState.snapshot()
        );

    return {
      formatVersion:
        CURRENT_SAVE_FORMAT_VERSION,
      savedAt: Date.now(),
      state,
      registry:
        dataRegistry.snapshot()
    };
  }

  save(slot = "auto") {
    const record =
      this.createRecord();

    const serialized =
      JSON.stringify(
        record
      );

    const key =
      this.getKey(slot);

    const backupKey =
      this.getBackupKey(
        slot
      );

    const previousRaw =
      this.storage.getItem(
        key
      );

    let backupCreated =
      false;

    if (
      previousRaw !== null &&
      canBackupRaw(
        previousRaw,
        slot
      )
    ) {
      try {
        this.storage.setItem(
          backupKey,
          previousRaw
        );

        backupCreated =
          true;
      } catch (error) {
        eventBus.emit(
          "save:backupFailed",
          {
            slot,
            message:
              error?.message ??
              "Unknown backup write error"
          }
        );
      }
    }

    this.storage.setItem(
      key,
      serialized
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
          record.state.meta
            ?.schemaVersion,
        backupCreated
      }
    );

    return structuredClone(
      record
    );
  }

  applyRecord(
    record,
    {
      slot,
      source
    }
  ) {
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
        source,
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
        dataRegistry.snapshot(),
      source
    };
  }

  loadRaw(
    raw,
    {
      slot,
      source
    }
  ) {
    const record =
      parseSaveRecord(
        raw,
        slot
      );

    return this.applyRecord(
      record,
      {
        slot,
        source
      }
    );
  }

  shouldTryBackup(
    error
  ) {
    if (
      error?.code ===
        "SAVE_FUTURE_FORMAT"
    ) {
      return false;
    }

    if (
      typeof error?.message ===
        "string" &&
      error.message.includes(
        "Cannot downgrade state"
      )
    ) {
      return false;
    }

    return true;
  }

  load(slot = "auto") {
    const key =
      this.getKey(
        slot
      );

    const raw =
      this.storage.getItem(
        key
      );

    if (raw === null) {
      return null;
    }

    try {
      return this.loadRaw(
        raw,
        {
          slot,
          source:
            "primary"
        }
      );
    } catch (primaryError) {
      if (
        !this.shouldTryBackup(
          primaryError
        )
      ) {
        throw primaryError;
      }

      const backupRaw =
        this.storage.getItem(
          this.getBackupKey(
            slot
          )
        );

      if (backupRaw === null) {
        throw primaryError;
      }

      try {
        const loaded =
          this.loadRaw(
            backupRaw,
            {
              slot,
              source:
                "backup"
            }
          );

        try {
          this.storage.setItem(
            key,
            backupRaw
          );
        } catch {
          // Recovery remains valid in memory even if the primary key cannot be healed.
        }

        eventBus.emit(
          "save:recovered",
          {
            slot,
            primaryError:
              primaryError
                ?.message ??
              "Unknown primary save error"
          }
        );

        return loaded;
      } catch (backupError) {
        const error =
          new Error(
            `Save slot "${slot}" failed primary and backup recovery: ${primaryError.message}; backup: ${backupError.message}`
          );

        error.cause =
          primaryError;

        throw error;
      }
    }
  }

  has(slot = "auto") {
    return (
      this.storage.getItem(
        this.getKey(
          slot
        )
      ) !== null
    );
  }

  hasBackup(
    slot = "auto"
  ) {
    return (
      this.storage.getItem(
        this.getBackupKey(
          slot
        )
      ) !== null
    );
  }

  remove(slot = "auto") {
    const existed =
      this.has(slot) ||
      this.hasBackup(
        slot
      );

    this.storage.removeItem(
      this.getKey(
        slot
      )
    );

    this.storage.removeItem(
      this.getBackupKey(
        slot
      )
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
  MemoryStorage,
  parseSaveRecord
};
