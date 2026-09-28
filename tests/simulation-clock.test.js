import test from "node:test";
import assert from "node:assert/strict";

import {
  GAME_MINUTES_PER_REAL_SECOND,
  MAX_CATCH_UP_MS,
  createSimulationClock
} from "../src/runtime/SimulationClock.js";


function createFixture() {
  let now =
    0;

  const advances = [];

  const runtime = {
    paused: false,
    speed: 1
  };

  const app = {
    core: {
      gameState: {
        getSection(
          name
        ) {
          if (
            name ===
            "runtime"
          ) {
            return {
              ...runtime
            };
          }

          return null;
        }
      },

      simulationSystem: {
        advance(
          minutes
        ) {
          advances.push(
            minutes
          );
        }
      }
    }
  };

  const clock =
    createSimulationClock(
      app,
      {
        now:
          () => now,

        setIntervalFn:
          () => 1,

        clearIntervalFn:
          () => {}
      }
    );

  return {
    clock,
    advances,
    runtime,

    setNow(value) {
      now = value;
    }
  };
}


test(
  "1x clock advances two game minutes per real second",
  () => {
    const fixture =
      createFixture();

    fixture.clock.start();

    fixture.setNow(
      500
    );

    assert.equal(
      fixture.clock.pulse(),
      1
    );

    fixture.setNow(
      1000
    );

    assert.equal(
      fixture.clock.pulse(),
      1
    );

    assert.deepEqual(
      fixture.advances,
      [
        1,
        1
      ]
    );

    assert.equal(
      GAME_MINUTES_PER_REAL_SECOND,
      2
    );
  }
);


test(
  "4x speed multiplies realtime conversion without changing the base rule",
  () => {
    const fixture =
      createFixture();

    fixture.runtime.speed =
      4;

    fixture.clock.start();

    fixture.setNow(
      500
    );

    assert.equal(
      fixture.clock.pulse(),
      4
    );

    assert.deepEqual(
      fixture.advances,
      [
        4
      ]
    );
  }
);


test(
  "clock restart resets elapsed baseline instead of granting offline catch-up",
  () => {
    const fixture =
      createFixture();

    fixture.clock.start();

    fixture.setNow(
      500
    );

    fixture.clock.pulse();

    fixture.clock.stop();

    fixture.setNow(
      60_000
    );

    fixture.clock.start();

    fixture.setNow(
      60_500
    );

    assert.equal(
      fixture.clock.pulse(),
      1
    );

    assert.deepEqual(
      fixture.advances,
      [
        1,
        1
      ]
    );
  }
);


test(
  "a delayed foreground pulse is capped to protect simulation from huge jumps",
  () => {
    const fixture =
      createFixture();

    fixture.clock.start();

    fixture.setNow(
      10_000
    );

    assert.equal(
      fixture.clock.pulse(),
      MAX_CATCH_UP_MS /
        1000 *
        GAME_MINUTES_PER_REAL_SECOND
    );

    assert.deepEqual(
      fixture.advances,
      [
        2
      ]
    );
  }
);
