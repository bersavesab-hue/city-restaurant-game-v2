import { eventBus } from "./EventBus.js";

function normalizeName(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError(
      "Command name must be a non-empty string"
    );
  }

  return name.trim();
}

class CommandSystem {
  constructor() {
    this.commands = new Map();
    this.executionCounter = 0;
  }

  register(name, handler, options = {}) {
    const commandName = normalizeName(name);

    if (typeof handler !== "function") {
      throw new TypeError(
        `Command "${commandName}" handler must be a function`
      );
    }

    if (
      this.commands.has(commandName) &&
      options.overwrite !== true
    ) {
      throw new Error(
        `Command "${commandName}" is already registered`
      );
    }

    this.commands.set(commandName, {
      handler,
      description: options.description ?? "",
      enabled: options.enabled ?? true
    });

    eventBus.emit("command:registered", {
      name: commandName
    });

    return commandName;
  }

  unregister(name) {
    const commandName = normalizeName(name);

    const removed =
      this.commands.delete(commandName);

    if (removed) {
      eventBus.emit("command:unregistered", {
        name: commandName
      });
    }

    return removed;
  }

  has(name) {
    return this.commands.has(
      normalizeName(name)
    );
  }

  enable(name) {
    const command = this.getDefinition(name);

    command.enabled = true;

    eventBus.emit("command:enabled", {
      name: normalizeName(name)
    });
  }

  disable(name) {
    const command = this.getDefinition(name);

    command.enabled = false;

    eventBus.emit("command:disabled", {
      name: normalizeName(name)
    });
  }

  getDefinition(name) {
    const commandName = normalizeName(name);
    const command =
      this.commands.get(commandName);

    if (!command) {
      throw new Error(
        `Command "${commandName}" is not registered`
      );
    }

    return command;
  }

  async execute(
    name,
    payload = {},
    context = {}
  ) {
    const commandName = normalizeName(name);
    const command =
      this.getDefinition(commandName);

    if (!command.enabled) {
      throw new Error(
        `Command "${commandName}" is disabled`
      );
    }

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new TypeError(
        "Command payload must be an object"
      );
    }

    this.executionCounter += 1;

    const executionId =
      `cmd_${String(
        this.executionCounter
      ).padStart(8, "0")}`;

    const commandContext = {
      ...context,
      executionId,
      commandName
    };

    eventBus.emit("command:before", {
      executionId,
      name: commandName,
      payload: structuredClone(payload)
    });

    try {
      const result =
        await command.handler(
          structuredClone(payload),
          commandContext
        );

      eventBus.emit("command:completed", {
        executionId,
        name: commandName,
        result
      });

      return result;
    } catch (error) {
      eventBus.emit("command:failed", {
        executionId,
        name: commandName,
        error: {
          name: error?.name ?? "Error",
          message:
            error?.message ??
            "Unknown command error"
        }
      });

      throw error;
    }
  }

  list() {
    return [...this.commands.entries()]
      .map(([name, command]) => ({
        name,
        description: command.description,
        enabled: command.enabled
      }));
  }

  clear() {
    const count = this.commands.size;

    this.commands.clear();

    eventBus.emit("command:cleared", {
      count
    });

    return count;
  }
}

export const commandSystem =
  new CommandSystem();

export { CommandSystem };
