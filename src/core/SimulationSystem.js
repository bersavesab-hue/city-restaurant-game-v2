import { eventBus } from "./EventBus.js";
import { gameState } from "./GameState.js";
import { timeSystem } from "./TimeSystem.js";

function normalizeName(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError(
      "Simulation system name must be a non-empty string"
    );
  }

  return name.trim();
}

class SimulationSystem {
  constructor() {
    this.systems = new Map();
  }

  ensureState() {
    let state = gameState.getSection("simulation");

    if (!state) {
      state = {
        processedMinutes: 0,
        processedHours: 0,
        processedDays: 0,
        ticks: 0
      };

      gameState.setSection(
        "simulation",
        state,
        "simulation:initialize"
      );
    }

    return state;
  }

  register(name, hooks, options = {}) {
    const systemName = normalizeName(name);

    if (
      !hooks ||
      typeof hooks !== "object" ||
      Array.isArray(hooks)
    ) {
      throw new TypeError(
        "Simulation hooks must be an object"
      );
    }

    const allowedHooks = [
      "onMinute",
      "onHour",
      "onDay"
    ];

    const hasHook = allowedHooks.some(
      (hook) => typeof hooks[hook] === "function"
    );

    if (!hasHook) {
      throw new Error(
        `Simulation system "${systemName}" must define at least one hook`
      );
    }

    for (const hook of allowedHooks) {
      if (
        hooks[hook] !== undefined &&
        typeof hooks[hook] !== "function"
      ) {
        throw new TypeError(
          `${hook} must be a function`
        );
      }
    }

    if (
      this.systems.has(systemName) &&
      options.overwrite !== true
    ) {
      throw new Error(
        `Simulation system "${systemName}" already exists`
      );
    }

    const priority =
      options.priority ?? 100;

    if (!Number.isFinite(priority)) {
      throw new TypeError(
        "Simulation priority must be a number"
      );
    }

    this.systems.set(systemName, {
      name: systemName,
      hooks: {
        onMinute: hooks.onMinute,
        onHour: hooks.onHour,
        onDay: hooks.onDay
      },
      priority,
      enabled: options.enabled ?? true
    });

    eventBus.emit("simulation:registered", {
      name: systemName,
      priority
    });

    return systemName;
  }

  unregister(name) {
    const systemName = normalizeName(name);

    const removed =
      this.systems.delete(systemName);

    if (removed) {
      eventBus.emit(
        "simulation:unregistered",
        { name: systemName }
      );
    }

    return removed;
  }

  enable(name) {
    const system =
      this.getSystem(name);

    system.enabled = true;

    return true;
  }

  disable(name) {
    const system =
      this.getSystem(name);

    system.enabled = false;

    return true;
  }

  getSystem(name) {
    const systemName = normalizeName(name);

    const system =
      this.systems.get(systemName);

    if (!system) {
      throw new Error(
        `Simulation system "${systemName}" is not registered`
      );
    }

    return system;
  }

  getOrderedSystems() {
    return [...this.systems.values()]
      .filter((system) => system.enabled)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        return a.name.localeCompare(b.name);
      });
  }

  runHook(hookName, context) {
    const systems =
      this.getOrderedSystems();

    for (const system of systems) {
      const hook =
        system.hooks[hookName];

      if (!hook) {
        continue;
      }

      try {
        const result =
          hook(structuredClone(context));

        if (
          result &&
          typeof result.then === "function"
        ) {
          throw new Error(
            `Simulation hook "${system.name}.${hookName}" must be synchronous`
          );
        }
      } catch (error) {
        eventBus.emit(
          "simulation:systemError",
          {
            system: system.name,
            hook: hookName,
            message:
              error?.message ??
              "Unknown simulation error"
          }
        );

        throw error;
      }
    }
  }

  processOneMinute() {
    const previous =
      timeSystem.getTime();

    const current =
      timeSystem.advance(1);

    const context = {
      previous,
      current,
      deltaMinutes: 1
    };

    this.runHook(
      "onMinute",
      context
    );

    const simulation =
      this.ensureState();

    simulation.processedMinutes += 1;

    if (current.minute === 0) {
      this.runHook(
        "onHour",
        context
      );

      simulation.processedHours += 1;

      eventBus.emit(
        "simulation:hourProcessed",
        {
          time: structuredClone(current)
        }
      );
    }

    if (
      current.hour === 0 &&
      current.minute === 0
    ) {
      this.runHook(
        "onDay",
        context
      );

      simulation.processedDays += 1;

      eventBus.emit(
        "simulation:dayProcessed",
        {
          time: structuredClone(current)
        }
      );
    }

    gameState.setSection(
      "simulation",
      simulation,
      "simulation:minuteProcessed"
    );

    eventBus.emit(
      "simulation:minuteProcessed",
      {
        time: structuredClone(current)
      }
    );

    return current;
  }

  advance(minutes = 1) {
    if (
      !Number.isInteger(minutes) ||
      minutes <= 0
    ) {
      throw new RangeError(
        "Simulation minutes must be a positive integer"
      );
    }

    let current;

    for (
      let i = 0;
      i < minutes;
      i += 1
    ) {
      current =
        this.processOneMinute();
    }

    const simulation =
      this.ensureState();

    simulation.ticks += 1;

    gameState.setSection(
      "simulation",
      simulation,
      "simulation:advance"
    );

    eventBus.emit(
      "simulation:advanced",
      {
        minutes,
        time: structuredClone(current)
      }
    );

    return current;
  }

  tick(baseMinutes = 1) {
    if (
      !Number.isInteger(baseMinutes) ||
      baseMinutes <= 0
    ) {
      throw new RangeError(
        "Base minutes must be a positive integer"
      );
    }

    const runtime =
      gameState.getSection("runtime");

    if (runtime.paused) {
      return timeSystem.getTime();
    }

    return this.advance(
      baseMinutes * runtime.speed
    );
  }

  getStats() {
    return structuredClone(
      this.ensureState()
    );
  }

  list() {
    return [...this.systems.values()]
      .map((system) => ({
        name: system.name,
        priority: system.priority,
        enabled: system.enabled,
        hooks: Object.entries(system.hooks)
          .filter(
            ([, handler]) =>
              typeof handler === "function"
          )
          .map(([name]) => name)
      }))
      .sort(
        (a, b) =>
          a.priority - b.priority
      );
  }
}

export const simulationSystem =
  new SimulationSystem();

export { SimulationSystem };
