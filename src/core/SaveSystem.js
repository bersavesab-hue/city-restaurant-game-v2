import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setItem(key, value) {
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

function resolveDefaultStorage() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.localStorage &&
    typeof globalThis.localStorage.getItem === "function"
  ) {
    return globalThis.localStorage;
  }

  return new MemoryStorage();
}

class SaveSystem {
  constructor({
    storage = resolveDefaultStorage(),
    prefix = "cityRestaurantGame"
  } = {}) {
    this.storage = storage;
    this.prefix = prefix;
  }

  getKey(slot = "auto") {
    return `${this.prefix}:${slot}`;
  }

  save(slot = "auto") {
    const snapshot = gameState.snapshot();

    const record = {
      formatVersion: 1,
      savedAt: Date.now(),
      state: snapshot
    };

    this.storage.setItem(
      this.getKey(slot),
      JSON.stringify(record)
    );

    eventBus.emit("save:completed", {
      slot,
      savedAt: record.savedAt
    });

    return record;
  }

  load(slot = "auto") {
    const raw = this.storage.getItem(this.getKey(slot));

    if (raw === null) {
      return null;
    }

    let record;

    try {
      record = JSON.parse(raw);
    } catch {
      throw new Error(`Save slot "${slot}" contains invalid JSON`);
    }

    if (
      !record ||
      record.formatVersion !== 1 ||
      !record.state ||
      typeof record.state !== "object"
    ) {
      throw new Error(`Save slot "${slot}" has an invalid format`);
    }

    gameState.replace(record.state, "save:load");

    eventBus.emit("save:loaded", {
      slot,
      savedAt: record.savedAt
    });

    return gameState.snapshot();
  }

  has(slot = "auto") {
    return this.storage.getItem(this.getKey(slot)) !== null;
  }

  remove(slot = "auto") {
    const existed = this.has(slot);

    this.storage.removeItem(this.getKey(slot));

    if (existed) {
      eventBus.emit("save:removed", { slot });
    }

    return existed;
  }
}

export const saveSystem = new SaveSystem();
export { SaveSystem, MemoryStorage };
