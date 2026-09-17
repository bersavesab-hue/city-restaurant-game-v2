import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

const clone = (value) => structuredClone(value);

class SchedulerSystem {
  constructor() {
    eventBus.on("time:advanced", () => {
      this.processDueTasks();
    });
  }

  ensureState() {
    let scheduler = gameState.getSection("scheduler");

    if (!scheduler) {
      scheduler = {
        nextId: 1,
        tasks: []
      };

      gameState.setSection(
        "scheduler",
        scheduler,
        "scheduler:initialize"
      );
    }

    return scheduler;
  }

  getCurrentTime() {
    return gameState.getSection("time").totalMinutes;
  }

  scheduleAfter(
    delayMinutes,
    action,
    payload = {},
    options = {}
  ) {
    if (
      !Number.isInteger(delayMinutes) ||
      delayMinutes < 0
    ) {
      throw new RangeError(
        "Delay minutes must be a non-negative integer"
      );
    }

    return this.scheduleAt(
      this.getCurrentTime() + delayMinutes,
      action,
      payload,
      options
    );
  }

  scheduleAt(
    dueAt,
    action,
    payload = {},
    options = {}
  ) {
    if (!Number.isInteger(dueAt) || dueAt < 0) {
      throw new RangeError(
        "Due time must be a non-negative integer"
      );
    }

    if (
      typeof action !== "string" ||
      action.trim() === ""
    ) {
      throw new TypeError(
        "Scheduled action must be a non-empty string"
      );
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new TypeError(
        "Scheduled payload must be an object"
      );
    }

    const repeatEvery =
      options.repeatEvery ?? null;

    if (
      repeatEvery !== null &&
      (!Number.isInteger(repeatEvery) ||
        repeatEvery <= 0)
    ) {
      throw new RangeError(
        "repeatEvery must be a positive integer"
      );
    }

    const scheduler = this.ensureState();

    const id =
      `task_${String(scheduler.nextId).padStart(6, "0")}`;

    scheduler.nextId += 1;

    const task = {
      id,
      action: action.trim(),
      payload: clone(payload),
      dueAt,
      repeatEvery,
      runCount: 0,
      createdAt: this.getCurrentTime()
    };

    scheduler.tasks.push(task);

    scheduler.tasks.sort(
      (a, b) => a.dueAt - b.dueAt
    );

    gameState.setSection(
      "scheduler",
      scheduler,
      "scheduler:schedule"
    );

    eventBus.emit("scheduler:scheduled", {
      task: clone(task)
    });

    return clone(task);
  }

  cancel(taskId) {
    const scheduler = this.ensureState();

    const index = scheduler.tasks.findIndex(
      (task) => task.id === taskId
    );

    if (index === -1) {
      return false;
    }

    const [task] = scheduler.tasks.splice(index, 1);

    gameState.setSection(
      "scheduler",
      scheduler,
      "scheduler:cancel"
    );

    eventBus.emit("scheduler:cancelled", {
      task: clone(task)
    });

    return true;
  }

  processDueTasks() {
    const scheduler = this.ensureState();
    const now = this.getCurrentTime();

    const dueTasks = scheduler.tasks
      .filter((task) => task.dueAt <= now)
      .sort((a, b) => a.dueAt - b.dueAt);

    if (dueTasks.length === 0) {
      return [];
    }

    const triggered = [];

    for (const dueTask of dueTasks) {
      const index = scheduler.tasks.findIndex(
        (task) => task.id === dueTask.id
      );

      if (index === -1) {
        continue;
      }

      const task = scheduler.tasks[index];

      task.runCount += 1;

      const result = clone(task);

      triggered.push(result);

      eventBus.emit("scheduler:triggered", {
        task: result,
        currentTime: now
      });

      if (task.repeatEvery !== null) {
        do {
          task.dueAt += task.repeatEvery;
        } while (task.dueAt <= now);
      } else {
        scheduler.tasks.splice(index, 1);
      }
    }

    scheduler.tasks.sort(
      (a, b) => a.dueAt - b.dueAt
    );

    gameState.setSection(
      "scheduler",
      scheduler,
      "scheduler:process"
    );

    return triggered;
  }

  get(taskId) {
    const scheduler = this.ensureState();

    const task = scheduler.tasks.find(
      (item) => item.id === taskId
    );

    return task ? clone(task) : undefined;
  }

  list() {
    return this.ensureState().tasks.map(clone);
  }

  count() {
    return this.ensureState().tasks.length;
  }

  clear() {
    const scheduler = this.ensureState();
    const count = scheduler.tasks.length;

    scheduler.tasks = [];

    gameState.setSection(
      "scheduler",
      scheduler,
      "scheduler:clear"
    );

    eventBus.emit("scheduler:cleared", {
      count
    });

    return count;
  }
}

export const schedulerSystem =
  new SchedulerSystem();

export { SchedulerSystem };
