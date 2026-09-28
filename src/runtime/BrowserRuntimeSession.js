import {
  createSimulationClock
} from "./SimulationClock.js";

const DEFAULT_AUTOSAVE_MS =
  30_000;

function positiveInteger(
  value,
  fallback
) {
  return (
    Number.isInteger(
      value
    ) &&
    value > 0
  )
    ? value
    : fallback;
}

function createBrowserRuntimeSession(
  app,
  {
    saveSlot = "auto",
    autosaveMs =
      DEFAULT_AUTOSAVE_MS,
    documentRef =
      globalThis.document,
    windowRef =
      globalThis.window,
    setIntervalFn =
      globalThis.setInterval
        ?.bind(
          globalThis
        ),
    clearIntervalFn =
      globalThis.clearInterval
        ?.bind(
          globalThis
        ),
    clockFactory =
      createSimulationClock
  } = {}
) {
  const core =
    app?.core;

  if (
    !core?.saveSystem ||
    !core?.timeSystem ||
    !core?.gameState ||
    !core?.eventBus
  ) {
    throw new TypeError(
      "Browser runtime session requires save, time, state and event systems"
    );
  }

  if (
    typeof setIntervalFn !==
      "function" ||
    typeof clearIntervalFn !==
      "function" ||
    typeof clockFactory !==
      "function"
  ) {
    throw new TypeError(
      "Browser runtime session requires timer functions"
    );
  }

  const interval =
    positiveInteger(
      autosaveMs,
      DEFAULT_AUTOSAVE_MS
    );

  const clock =
    clockFactory(
      app
    );

  let started =
    false;

  let suspended =
    false;

  let autosaveTimer =
    null;

  let saveBlocked =
    false;

  let loadError =
    null;

  let loadSource =
    null;

  function emit(
    name,
    payload = {}
  ) {
    core.eventBus.emit(
      name,
      payload
    );
  }

  function saveNow(
    reason =
      "manual"
  ) {
    if (
      !started ||
      saveBlocked
    ) {
      return null;
    }

    const record =
      core.saveSystem.save(
        saveSlot
      );

    emit(
      "runtime:autosaved",
      {
        reason,
        slot:
          saveSlot,
        savedAt:
          record.savedAt
      }
    );

    return record;
  }

  function suspend(
    reason
  ) {
    if (
      !started ||
      suspended
    ) {
      return false;
    }

    saveNow(
      reason
    );

    clock.stop();

    suspended =
      true;

    emit(
      "runtime:suspended",
      {
        reason
      }
    );

    return true;
  }

  function resume(
    reason
  ) {
    if (
      !started ||
      !suspended
    ) {
      return false;
    }

    clock.start();

    suspended =
      false;

    emit(
      "runtime:resumed",
      {
        reason
      }
    );

    return true;
  }

  function onVisibilityChange() {
    if (
      documentRef
        ?.visibilityState ===
      "hidden"
    ) {
      suspend(
        "visibility-hidden"
      );

      return;
    }

    if (
      documentRef
        ?.visibilityState ===
      "visible"
    ) {
      resume(
        "visibility-visible"
      );
    }
  }

  function onPageHide() {
    suspend(
      "pagehide"
    );
  }

  function attach() {
    documentRef
      ?.addEventListener?.(
        "visibilitychange",
        onVisibilityChange
      );

    windowRef
      ?.addEventListener?.(
        "pagehide",
        onPageHide
      );
  }

  function detach() {
    documentRef
      ?.removeEventListener?.(
        "visibilitychange",
        onVisibilityChange
      );

    windowRef
      ?.removeEventListener?.(
        "pagehide",
        onPageHide
      );
  }

  function start() {
    if (started) {
      return {
        started:
          false,
        loadSource,
        loadError
      };
    }

    let loaded =
      false;

    if (
      core.saveSystem.has(
        saveSlot
      )
    ) {
      try {
        const result =
          core.saveSystem.load(
            saveSlot
          );

        loaded =
          Boolean(
            result
          );

        loadSource =
          result?.source ??
          "primary";
      } catch (error) {
        loadError =
          error?.message ??
          "Unknown save load error";

        saveBlocked =
          true;

        core.timeSystem.pause();

        emit(
          "runtime:loadFailed",
          {
            slot:
              saveSlot,
            message:
              loadError
          }
        );
      }
    }

    if (
      !loaded &&
      !saveBlocked
    ) {
      core.timeSystem.resume();
    }

    started =
      true;

    attach();

    clock.start();

    if (!saveBlocked) {
      autosaveTimer =
        setIntervalFn(
          () => {
            if (!suspended) {
              saveNow(
                "interval"
              );
            }
          },
          interval
        );
    }

    emit(
      "runtime:sessionStarted",
      {
        loaded,
        loadSource,
        saveBlocked
      }
    );

    return {
      started:
        true,
      loaded,
      loadSource,
      loadError,
      saveBlocked
    };
  }

  function stop({
    save = true
  } = {}) {
    if (!started) {
      return false;
    }

    if (
      save &&
      !suspended
    ) {
      saveNow(
        "session-stop"
      );
    }

    if (
      autosaveTimer !==
        null
    ) {
      clearIntervalFn(
        autosaveTimer
      );

      autosaveTimer =
        null;
    }

    detach();

    clock.stop();

    started =
      false;

    suspended =
      false;

    emit(
      "runtime:sessionStopped"
    );

    return true;
  }

  return Object.freeze({
    start,
    stop,
    saveNow,
    suspend,
    resume,

    isStarted() {
      return started;
    },

    isSuspended() {
      return suspended;
    },

    isSaveBlocked() {
      return saveBlocked;
    },

    getLoadError() {
      return loadError;
    },

    getClock() {
      return clock;
    }
  });
}

export {
  DEFAULT_AUTOSAVE_MS,
  createBrowserRuntimeSession
};
