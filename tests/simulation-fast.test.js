import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";
import { eventBus } from "../src/core/EventBus.js";

const {
  gameState,
  simulationSystem,
  schedulerSystem
} = app.core;

test(
  "快速推进保持小时边界和定时任务",
  () => {
    gameState.reset();
    schedulerSystem.clear();

    let triggered = 0;

    const off =
      eventBus.on(
        "scheduler:triggered",
        ({ task }) => {
          if (
            task.action ===
            "test:fast"
          ) {
            triggered += 1;
          }
        }
      );

    schedulerSystem.scheduleAfter(
      75,
      "test:fast"
    );

    simulationSystem.advanceFast(
      125
    );

    const time =
      gameState.getSection(
        "time"
      );

    const stats =
      simulationSystem.getStats();

    assert.equal(
      time.totalMinutes,
      125
    );

    assert.equal(
      time.hour,
      10
    );

    assert.equal(
      time.minute,
      5
    );

    assert.equal(
      triggered,
      1
    );

    assert.equal(
      stats.processedMinutes,
      125
    );

    assert.equal(
      stats.processedHours,
      2
    );

    assert.equal(
      schedulerSystem.count(),
      0
    );

    off();
  }
);
