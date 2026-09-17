import { eventBus } from "./core/EventBus.js";
import { gameState } from "./core/GameState.js";
import { timeSystem } from "./core/TimeSystem.js";
import { saveSystem } from "./core/SaveSystem.js";
import { dataRegistry } from "./core/DataRegistry.js";

function bindCoreEvents() {
  eventBus.on("time:advanced", ({ current }) => {
    console.log(
      `[TIME] Day ${current.day} ${String(current.hour).padStart(2, "0")}:${String(current.minute).padStart(2, "0")}`
    );
  });

  eventBus.on("save:completed", ({ slot }) => {
    console.log(`[SAVE] saved slot: ${slot}`);
  });

  eventBus.on("save:loaded", ({ slot }) => {
    console.log(`[SAVE] loaded slot: ${slot}`);
  });

  eventBus.on("data:registered", ({ name, count }) => {
    console.log(`[DATA] ${name}: ${count}`);
  });
}

function bootstrap() {
  bindCoreEvents();

  console.log("=== City Restaurant Game V2 ===");
  console.log("Core systems initialized.");

  return {
    eventBus,
    gameState,
    timeSystem,
    saveSystem,
    dataRegistry
  };
}

export const app = bootstrap();
export { bootstrap };
