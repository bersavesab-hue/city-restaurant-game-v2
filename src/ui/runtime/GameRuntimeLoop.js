import { gameState } from "../../core/GameState.js";
import { simulationSystem } from "../../core/SimulationSystem.js";
import { timeSystem } from "../../core/TimeSystem.js";

function pad(value) {
  return String(value).padStart(2, "0");
}

class GameRuntimeLoop {
  constructor({ realMillisecondsPerGameMinute = 1000 } = {}) {
    this.realMillisecondsPerGameMinute = realMillisecondsPerGameMinute;
    this.timer = null;
    this.callbacks = {};
  }

  start(callbacks = {}) {
    this.stop();
    this.callbacks = callbacks;

    this.timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }

      const before = timeSystem.getTime();

      try {
        simulationSystem.tick(1);
      } catch (error) {
        console.error("Simulation tick failed", error);
        this.callbacks.onError?.(error);
        return;
      }

      const after = timeSystem.getTime();

      if (after.totalMinutes === before.totalMinutes) {
        return;
      }

      this.callbacks.onMinute?.(after, before);

      if (after.hour !== before.hour || after.day !== before.day) {
        this.callbacks.onHour?.(after, before);
      }

      if (after.day !== before.day) {
        this.callbacks.onDay?.(after, before);
      }
    }, this.realMillisecondsPerGameMinute);

    return true;
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  pause() {
    timeSystem.pause();
    return gameState.getSection("runtime");
  }

  resume() {
    timeSystem.resume();
    return gameState.getSection("runtime");
  }

  togglePause() {
    const runtime = gameState.getSection("runtime");
    return runtime?.paused ? this.resume() : this.pause();
  }

  setSpeed(speed) {
    timeSystem.setSpeed(speed);
    return gameState.getSection("runtime");
  }

  getClockText() {
    const time = timeSystem.getTime();
    return {
      dayText: `第${time.day}天`,
      clockText: `${pad(time.hour)}:${pad(time.minute)}`,
      time
    };
  }
}

export const gameRuntimeLoop = new GameRuntimeLoop();
export { GameRuntimeLoop };
