const DEFAULT_PULSE_MS = 250;
const GAME_MINUTES_PER_REAL_SECOND = 2;
const MAX_CATCH_UP_MS = 1000;

function defaultNow() {
  if (
    typeof globalThis.performance?.now ===
      "function"
  ) {
    return globalThis.performance.now();
  }

  return Date.now();
}

function createSimulationClock(
  app,
  {
    intervalMs =
      DEFAULT_PULSE_MS,
    now =
      defaultNow,
    setIntervalFn =
      globalThis.setInterval
        ?.bind(globalThis),
    clearIntervalFn =
      globalThis.clearInterval
        ?.bind(globalThis)
  } = {}
) {
  if (
    !app?.core
      ?.simulationSystem ||
    !app?.core
      ?.gameState
  ) {
    throw new TypeError(
      "Simulation clock requires app core simulationSystem and gameState"
    );
  }

  if (
    typeof now !== "function" ||
    typeof setIntervalFn !==
      "function" ||
    typeof clearIntervalFn !==
      "function"
  ) {
    throw new TypeError(
      "Simulation clock requires timer functions"
    );
  }

  let timerId = null;
  let lastNow = null;
  let minuteAccumulator = 0;

  const reset = () => {
    lastNow = now();
    minuteAccumulator = 0;
  };

  const pulse = () => {
    const currentNow = now();

    if (lastNow === null) {
      lastNow = currentNow;
      return 0;
    }

    const elapsedMs =
      Math.max(
        0,
        Math.min(
          MAX_CATCH_UP_MS,
          currentNow -
          lastNow
        )
      );

    lastNow = currentNow;

    const runtime =
      app.core
        .gameState
        .getSection(
          "runtime"
        ) ?? {
          paused: true,
          speed: 1
        };

    if (runtime.paused) {
      minuteAccumulator = 0;
      return 0;
    }

    const speed =
      [1,2,4].includes(
        Number(runtime.speed)
      )
        ? Number(runtime.speed)
        : 1;

    minuteAccumulator +=
      elapsedMs /
      1000 *
      GAME_MINUTES_PER_REAL_SECOND *
      speed;

    const wholeMinutes =
      Math.floor(
        minuteAccumulator
      );

    if (wholeMinutes <= 0) {
      return 0;
    }

    minuteAccumulator -=
      wholeMinutes;

    app.core
      .simulationSystem
      .advance(
        wholeMinutes
      );

    return wholeMinutes;
  };

  const start = () => {
    if (timerId !== null) {
      return false;
    }

    reset();

    timerId =
      setIntervalFn(
        pulse,
        intervalMs
      );

    return true;
  };

  const stop = () => {
    if (timerId === null) {
      return false;
    }

    clearIntervalFn(
      timerId
    );

    timerId = null;
    lastNow = null;
    minuteAccumulator = 0;

    return true;
  };

  return Object.freeze({
    start,
    stop,
    reset,
    pulse,

    isRunning() {
      return timerId !== null;
    }
  });
}

export {
  DEFAULT_PULSE_MS,
  GAME_MINUTES_PER_REAL_SECOND,
  createSimulationClock
};
