import test from "node:test";
import assert from "node:assert/strict";

import {
  createBrowserRuntimeSession
} from "../src/runtime/BrowserRuntimeSession.js";


class FakeTarget {
  constructor() {
    this.listeners =
      new Map();

    this.visibilityState =
      "visible";
  }

  addEventListener(
    name,
    handler
  ) {
    if (
      !this.listeners.has(
        name
      )
    ) {
      this.listeners.set(
        name,
        new Set()
      );
    }

    this.listeners
      .get(
        name
      )
      .add(
        handler
      );
  }

  removeEventListener(
    name,
    handler
  ) {
    this.listeners
      .get(
        name
      )
      ?.delete(
        handler
      );
  }

  dispatch(name) {
    for (
      const handler
      of this.listeners
        .get(
          name
        ) ?? []
    ) {
      handler();
    }
  }
}


function createFixture({
  hasSave = false,
  loadResult = null,
  loadError = null
} = {}) {
  const documentRef =
    new FakeTarget();

  const windowRef =
    new FakeTarget();

  const calls = {
    resume: 0,
    pause: 0,
    save: 0,
    load: 0,
    clockStart: 0,
    clockStop: 0,
    intervalCreated: 0,
    intervalCleared: 0,
    events: []
  };

  const clock = {
    running: false,

    start() {
      calls.clockStart += 1;
      this.running = true;
      return true;
    },

    stop() {
      calls.clockStop += 1;
      this.running = false;
      return true;
    },

    isRunning() {
      return this.running;
    }
  };

  const app = {
    core: {
      saveSystem: {
        has() {
          return hasSave;
        },

        load() {
          calls.load += 1;

          if (loadError) {
            throw loadError;
          }

          return (
            loadResult ??
            {
              source:
                "primary"
            }
          );
        },

        save() {
          calls.save += 1;

          return {
            savedAt:
              123
          };
        }
      },

      timeSystem: {
        resume() {
          calls.resume += 1;
        },

        pause() {
          calls.pause += 1;
        }
      },

      gameState: {
        getSection() {
          return {
            paused: false,
            speed: 1
          };
        }
      },

      eventBus: {
        emit(
          name,
          payload
        ) {
          calls.events.push({
            name,
            payload
          });
        }
      }
    }
  };

  let intervalHandler =
    null;

  const session =
    createBrowserRuntimeSession(
      app,
      {
        documentRef,
        windowRef,

        clockFactory:
          () => clock,

        setIntervalFn(
          handler
        ) {
          calls.intervalCreated += 1;
          intervalHandler =
            handler;
          return 77;
        },

        clearIntervalFn() {
          calls.intervalCleared += 1;
        }
      }
    );

  return {
    session,
    documentRef,
    windowRef,
    calls,

    runInterval() {
      intervalHandler?.();
    }
  };
}


test(
  "fresh session resumes automatic game time and starts autosave",
  () => {
    const fixture =
      createFixture();

    const result =
      fixture.session.start();

    assert.equal(
      result.loaded,
      false
    );

    assert.equal(
      fixture.calls.resume,
      1
    );

    assert.equal(
      fixture.calls.clockStart,
      1
    );

    fixture.runInterval();

    assert.equal(
      fixture.calls.save,
      1
    );
  }
);


test(
  "valid existing save loads first and preserves its pause state",
  () => {
    const fixture =
      createFixture({
        hasSave: true,
        loadResult: {
          source:
            "backup"
        }
      });

    const result =
      fixture.session.start();

    assert.equal(
      result.loaded,
      true
    );

    assert.equal(
      result.loadSource,
      "backup"
    );

    assert.equal(
      fixture.calls.load,
      1
    );

    assert.equal(
      fixture.calls.resume,
      0
    );
  }
);


test(
  "background saves and stops the clock; foreground restarts without catch-up",
  () => {
    const fixture =
      createFixture();

    fixture.session.start();

    fixture.documentRef
      .visibilityState =
      "hidden";

    fixture.documentRef
      .dispatch(
        "visibilitychange"
      );

    assert.equal(
      fixture.calls.save,
      1
    );

    assert.equal(
      fixture.calls.clockStop,
      1
    );

    assert.equal(
      fixture.session
        .isSuspended(),
      true
    );

    fixture.documentRef
      .visibilityState =
      "visible";

    fixture.documentRef
      .dispatch(
        "visibilitychange"
      );

    assert.equal(
      fixture.calls.clockStart,
      2
    );

    assert.equal(
      fixture.session
        .isSuspended(),
      false
    );
  }
);


test(
  "unrecoverable load failure blocks autosave instead of overwriting the bad slot",
  () => {
    const fixture =
      createFixture({
        hasSave: true,
        loadError:
          new Error(
            "broken save"
          )
      });

    const result =
      fixture.session.start();

    assert.equal(
      result.saveBlocked,
      true
    );

    assert.equal(
      fixture.calls.pause,
      1
    );

    assert.equal(
      fixture.calls.intervalCreated,
      0
    );

    assert.equal(
      fixture.session.saveNow(),
      null
    );

    assert.equal(
      fixture.calls.save,
      0
    );
  }
);
