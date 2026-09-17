import { eventBus } from "./EventBus.js";

const clone = (value) => structuredClone(value);

function createInitialState() {
  return {
    meta: {
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },

    time: {
      day: 1,
      hour: 8,
      minute: 0,
      totalMinutes: 0
    },

    runtime: {
      paused: true,
      speed: 1
    },

    data: {}
  };
}

class GameState {
  constructor() {
    this.state = createInitialState();
  }

  snapshot() {
    return clone(this.state);
  }

  getSection(section) {
    if (!(section in this.state)) {
      return undefined;
    }

    return clone(this.state[section]);
  }

  setSection(section, value, reason = "setSection") {
    this.state[section] = clone(value);
    this.touch();

    eventBus.emit("state:changed", {
      section,
      reason,
      state: this.snapshot()
    });

    return this.getSection(section);
  }

  patchSection(section, changes, reason = "patchSection") {
    const current = this.state[section];

    if (
      current === null ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      throw new TypeError(`State section "${section}" is not patchable`);
    }

    this.state[section] = {
      ...current,
      ...clone(changes)
    };

    this.touch();

    eventBus.emit("state:changed", {
      section,
      reason,
      state: this.snapshot()
    });

    return this.getSection(section);
  }

  replace(nextState, reason = "replace") {
    if (!nextState || typeof nextState !== "object") {
      throw new TypeError("Game state must be an object");
    }

    this.state = clone(nextState);
    this.touch();

    eventBus.emit("state:replaced", {
      reason,
      state: this.snapshot()
    });

    return this.snapshot();
  }

  reset() {
    this.state = createInitialState();

    eventBus.emit("state:reset", {
      state: this.snapshot()
    });

    return this.snapshot();
  }

  touch() {
    if (!this.state.meta) {
      this.state.meta = {};
    }

    this.state.meta.updatedAt = Date.now();
  }
}

export const gameState = new GameState();
export { GameState, createInitialState };
