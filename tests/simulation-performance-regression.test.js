import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

import {
  gameState
} from "../src/core/GameState.js";

import {
  timeSystem
} from "../src/core/TimeSystem.js";

import {
  SimulationSystem
} from "../src/core/SimulationSystem.js";

import {
  schedulerSystem
} from "../src/core/SchedulerSystem.js";

import {
  eventBus
} from "../src/core/EventBus.js";


function resetCore() {
  gameState.reset();
  schedulerSystem.clear();
}


function createCounterSimulation() {
  const counters = {
    hours: 0,
    days: 0,
    longDays: 0
  };

  const simulation =
    new SimulationSystem();

  simulation.register(
    "performance_counter",
    {
      onHour() {
        counters.hours += 1;
      },

      onDay() {
        counters.days += 1;
      },

      onLongDay() {
        counters.longDays += 1;
      }
    }
  );

  return {
    simulation,
    counters
  };
}


function runAtSpeed(
  speed,
  simulatedMinutes = 1440
) {
  resetCore();

  timeSystem.resume();
  timeSystem.setSpeed(
    speed
  );

  const {
    simulation,
    counters
  } =
    createCounterSimulation();

  const ticks =
    simulatedMinutes /
    speed;

  assert.equal(
    Number.isInteger(ticks),
    true
  );

  for (
    let index = 0;
    index < ticks;
    index += 1
  ) {
    simulation.tick(1);
  }

  const time =
    gameState.getSection(
      "time"
    );

  const stats =
    simulation.getStats();

  return {
    time: {
      day:
        time.day,
      hour:
        time.hour,
      minute:
        time.minute,
      totalMinutes:
        time.totalMinutes
    },

    counters,

    stats: {
      processedMinutes:
        stats.processedMinutes,
      processedHours:
        stats.processedHours,
      processedDays:
        stats.processedDays
    }
  };
}


test(
  "1x 2x 4x推进相同模拟时长得到一致的整点跨日结果",
  () => {
    const normal =
      runAtSpeed(1);

    const double =
      runAtSpeed(2);

    const quadruple =
      runAtSpeed(4);

    assert.deepEqual(
      double,
      normal
    );

    assert.deepEqual(
      quadruple,
      normal
    );

    assert.equal(
      normal.time.day,
      2
    );

    assert.equal(
      normal.time.hour,
      8
    );

    assert.equal(
      normal.counters.hours,
      24
    );

    assert.equal(
      normal.counters.days,
      1
    );
  }
);


test(
  "快速推进跨越多个定时任务时不会漏触发或重复触发",
  () => {
    resetCore();

    const {
      simulation
    } =
      createCounterSimulation();

    const triggered = [];

    const unsubscribe =
      eventBus.on(
        "scheduler:triggered",
        ({ task }) => {
          triggered.push(
            task.action
          );
        }
      );

    try {
      schedulerSystem
        .scheduleAfter(
          15,
          "performance_once"
        );

      schedulerSystem
        .scheduleAfter(
          10,
          "performance_repeat",
          {},
          {
            repeatEvery:
              30
          }
        );

      simulation.advanceFast(
        185
      );
    } finally {
      unsubscribe();
    }

    assert.equal(
      triggered.filter(
        item =>
          item ===
          "performance_once"
      ).length,
      1
    );

    assert.equal(
      triggered.filter(
        item =>
          item ===
          "performance_repeat"
      ).length,
      6
    );

    const repeat =
      schedulerSystem
        .list()
        .find(
          item =>
            item.action ===
            "performance_repeat"
        );

    assert.ok(repeat);

    assert.equal(
      repeat.runCount,
      6
    );

    assert.equal(
      repeat.dueAt,
      190
    );
  }
);


test(
  "365天快速推进保持完整小时日统计且耗时受控",
  () => {
    resetCore();

    const {
      simulation,
      counters
    } =
      createCounterSimulation();

    const started =
      performance.now();

    simulation.advanceFast(
      365 * 1440
    );

    const elapsed =
      performance.now() -
      started;

    const stats =
      simulation.getStats();

    const time =
      gameState.getSection(
        "time"
      );

    assert.equal(
      stats.processedMinutes,
      365 * 1440
    );

    assert.equal(
      stats.processedHours,
      365 * 24
    );

    assert.equal(
      stats.processedDays,
      365
    );

    assert.equal(
      counters.hours,
      365 * 24
    );

    assert.equal(
      counters.days,
      365
    );

    assert.equal(
      time.day,
      366
    );

    assert.ok(
      elapsed < 20000,
      `365天快速推进耗时异常: ${elapsed.toFixed(1)}ms`
    );
  }
);


test(
  "20年长期推进保持常量级核心状态且不会退化为逐分钟循环",
  () => {
    resetCore();

    const {
      simulation,
      counters
    } =
      createCounterSimulation();

    const days =
      365 * 20;

    const started =
      performance.now();

    simulation.advanceLongTerm(
      days
    );

    const elapsed =
      performance.now() -
      started;

    const stats =
      simulation.getStats();

    const time =
      gameState.getSection(
        "time"
      );

    assert.equal(
      stats.processedDays,
      days
    );

    assert.equal(
      stats.processedHours,
      days * 24
    );

    assert.equal(
      stats.processedMinutes,
      days * 1440
    );

    assert.equal(
      counters.longDays,
      days
    );

    assert.equal(
      counters.days,
      days
    );

    assert.equal(
      counters.hours,
      0
    );

    assert.equal(
      time.day,
      days + 1
    );

    assert.ok(
      elapsed < 20000,
      `20年长期推进耗时异常: ${elapsed.toFixed(1)}ms`
    );
  }
);
