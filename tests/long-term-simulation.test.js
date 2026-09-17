import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  gameState,
  simulationSystem
} = app.core;

test(
  "长期模拟按天推进而不是逐小时推进",
  () => {
    gameState.reset();

    const before =
      simulationSystem.getStats();

    simulationSystem
      .advanceLongTerm(30);

    const time =
      gameState.getSection("time");

    const after =
      simulationSystem.getStats();

    assert.equal(
      time.day,
      31
    );

    assert.equal(
      after.processedDays -
      before.processedDays,
      30
    );

    assert.equal(
      after.processedHours -
      before.processedHours,
      720
    );

    assert.equal(
      after.processedMinutes -
      before.processedMinutes,
      43200
    );
  }
);
