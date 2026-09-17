import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

class TimeSystem {
  advance(minutes = 1) {
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new RangeError("Minutes must be a positive integer");
    }

    const previous = gameState.getSection("time");

    const previousAbsolute =
      (previous.day - 1) * 1440 +
      previous.hour * 60 +
      previous.minute;

    const nextAbsolute = previousAbsolute + minutes;

    const day = Math.floor(nextAbsolute / 1440) + 1;
    const minutesOfDay = nextAbsolute % 1440;
    const hour = Math.floor(minutesOfDay / 60);
    const minute = minutesOfDay % 60;

    const next = {
      day,
      hour,
      minute,
      totalMinutes: previous.totalMinutes + minutes
    };

    gameState.setSection("time", next, "time:advance");

    const hoursCrossed =
      Math.floor(nextAbsolute / 60) -
      Math.floor(previousAbsolute / 60);

    const daysCrossed = day - previous.day;

    const payload = {
      minutesAdvanced: minutes,
      hoursCrossed,
      daysCrossed,
      previous,
      current: next
    };

    eventBus.emit("time:advanced", payload);

    if (hoursCrossed > 0) {
      eventBus.emit("time:hourChanged", payload);
    }

    if (daysCrossed > 0) {
      eventBus.emit("time:dayChanged", payload);
    }

    return next;
  }

  tick(baseMinutes = 1) {
    if (!Number.isInteger(baseMinutes) || baseMinutes <= 0) {
      throw new RangeError("Base minutes must be a positive integer");
    }

    const runtime = gameState.getSection("runtime");

    if (runtime.paused) {
      return gameState.getSection("time");
    }

    return this.advance(baseMinutes * runtime.speed);
  }

  pause() {
    gameState.patchSection(
      "runtime",
      { paused: true },
      "time:pause"
    );
  }

  resume() {
    gameState.patchSection(
      "runtime",
      { paused: false },
      "time:resume"
    );
  }

  setSpeed(speed) {
    const allowedSpeeds = [1, 2, 4];

    if (!allowedSpeeds.includes(speed)) {
      throw new RangeError("Speed must be 1, 2, or 4");
    }

    gameState.patchSection(
      "runtime",
      { speed },
      "time:setSpeed"
    );

    return speed;
  }

  getTime() {
    return gameState.getSection("time");
  }
}

export const timeSystem = new TimeSystem();
export { TimeSystem };
