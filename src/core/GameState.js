import { eventBus } from "./EventBus.js";

import {
  CURRENT_STATE_SCHEMA_VERSION
} from "./SaveSchema.js";

const clone = (value) => structuredClone(value);

function createInitialState() {
  const now = Date.now();

  return {
    meta: {
      schemaVersion:
        CURRENT_STATE_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now
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

    scheduler: {
      nextId: 1,
      tasks: []
    },

    simulation: {
      processedMinutes: 0,
      processedHours: 0,
      processedDays: 0,
      ticks: 0
    },

    data: {
      entities: {},
      entityCounters: {}
    }
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

  selectSection(section, selector) {
    if (typeof selector !== "function") {
      throw new TypeError(
        "Section selector must be a function"
      );
    }

    if (!(section in this.state)) {
      return undefined;
    }

    return clone(
      selector(this.state[section])
    );
  }

  emitChange(section, reason) {
    eventBus.emit("state:changed", {
      section,
      reason,
      updatedAt:
        this.state.meta?.updatedAt ?? null
    });
  }

  setSection(
    section,
    value,
    reason = "setSection"
  ) {
    this.state[section] = clone(value);

    this.touch();
    this.emitChange(section, reason);

    return clone(this.state[section]);
  }

  patchSection(
    section,
    changes,
    reason = "patchSection"
  ) {
    const current =
      this.state[section];

    if (
      current === null ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      throw new TypeError(
        `State section "${section}" is not patchable`
      );
    }

    this.state[section] = {
      ...current,
      ...clone(changes)
    };

    this.touch();
    this.emitChange(section, reason);

    return clone(this.state[section]);
  }

  mutateSection(
    section,
    mutator,
    reason = "mutateSection"
  ) {
    if (typeof mutator !== "function") {
      throw new TypeError(
        "Section mutator must be a function"
      );
    }

    const current =
      this.state[section];

    if (
      current === null ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      throw new TypeError(
        `State section "${section}" is not mutable`
      );
    }

    const result =
      mutator(current);

    this.touch();
    this.emitChange(section, reason);

    return result === undefined
      ? undefined
      : clone(result);
  }

  replace(
    nextState,
    reason = "replace"
  ) {
    if (
      !nextState ||
      typeof nextState !== "object" ||
      Array.isArray(nextState)
    ) {
      throw new TypeError(
        "Game state must be an object"
      );
    }

    this.state = clone(nextState);
    this.touch();

    eventBus.emit(
      "state:replaced",
      {
        reason,
        state: this.snapshot()
      }
    );

    return this.snapshot();
  }

  reset() {
    this.state =
      createInitialState();

    eventBus.emit(
      "state:reset",
      {
        state: this.snapshot()
      }
    );

    return this.snapshot();
  }

  touch() {
    if (!this.state.meta) {
      this.state.meta = {};
    }

    this.state.meta.updatedAt =
      Date.now();
  }
}

export const gameState =
  new GameState();

export {
  GameState,
  createInitialState
};
