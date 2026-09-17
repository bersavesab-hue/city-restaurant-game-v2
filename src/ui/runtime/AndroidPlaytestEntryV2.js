import "./AndroidPlaytestEntry.js";
import "./runtime-enhancements.css";

import { gameState } from "../../core/GameState.js";
import { timeSystem } from "../../core/TimeSystem.js";
import { gameFoundationSystem } from "../../systems/GameFoundationSystem.js";
import { customerSegmentSystem } from "../../systems/CustomerSegmentSystem.js";
import { gameRuntimeLoop } from "./GameRuntimeLoop.js";
import { cityMapViewportRuntime } from "./CityMapViewportRuntime.js";

const SEGMENT_NAMES = new Map();

function refreshSegmentNames() {
  SEGMENT_NAMES.clear();
  for (const segment of customerSegmentSystem.getAll()) {
    SEGMENT_NAMES.set(segment.id, segment.name);
  }
}

function updateVisibleCustomerLabels() {
  document
    .querySelectorAll(".city-customer-mix article > span:first-child")
    .forEach((element) => {
      const id = element.textContent?.trim();
      const name = SEGMENT_NAMES.get(id);
      if (name) {
        element.textContent = name;
        element.dataset.segmentName = id;
      }
    });
}

function updateVisibleClock() {
  const clock = gameRuntimeLoop.getClockText();
  const runtime = gameState.getSection("runtime") ?? { paused: false, speed: 1 };

  document
    .querySelectorAll(".rg-topbar__clock strong")
    .forEach((element) => {
      element.textContent = clock.clockText;
    });

  document
    .querySelectorAll(".rg-topbar__clock small")
    .forEach((element) => {
      element.textContent = clock.dayText;
    });

  const timeLabel = document.querySelector(".rg-runtime-controls__time");
  if (timeLabel) {
    timeLabel.textContent = `${clock.dayText} ${clock.clockText}`;
  }

  document
    .querySelectorAll("[data-runtime-speed]")
    .forEach((button) => {
      button.classList.toggle(
        "is-active",
        !runtime.paused && Number(button.dataset.runtimeSpeed) === runtime.speed
      );
    });

  const pauseButton = document.querySelector('[data-runtime-action="pause"]');
  if (pauseButton) {
    pauseButton.textContent = runtime.paused ? "▶" : "Ⅱ";
    pauseButton.classList.toggle("is-active", runtime.paused);
  }
}

function ensureRuntimeControls() {
  let controls = document.querySelector(".rg-runtime-controls");

  if (!controls) {
    controls = document.createElement("div");
    controls.className = "rg-runtime-controls";
    controls.innerHTML = `
      <span class="rg-runtime-controls__time">第1天 08:00</span>
      <button type="button" data-runtime-action="pause">Ⅱ</button>
      <button type="button" data-runtime-speed="1">1×</button>
      <button type="button" data-runtime-speed="2">2×</button>
      <button type="button" data-runtime-speed="4">4×</button>
    `;
    document.body.appendChild(controls);
  }

  updateVisibleClock();
}

function handleRuntimeControl(event) {
  const speedButton = event.target.closest?.("[data-runtime-speed]");
  if (speedButton) {
    event.preventDefault();
    event.stopPropagation();
    gameRuntimeLoop.setSpeed(Number(speedButton.dataset.runtimeSpeed));
    gameRuntimeLoop.resume();
    updateVisibleClock();
    return;
  }

  const pauseButton = event.target.closest?.('[data-runtime-action="pause"]');
  if (pauseButton) {
    event.preventDefault();
    event.stopPropagation();
    gameRuntimeLoop.togglePause();
    updateVisibleClock();
  }
}

function initializeExpandedFoundation() {
  const result = gameFoundationSystem.initialize({
    seedProperties: true,
    overwriteReferenceData: true
  });

  refreshSegmentNames();

  const runtime = gameState.getSection("runtime");
  if (runtime?.paused) {
    timeSystem.resume();
  }

  return result;
}

function startSimulation() {
  gameRuntimeLoop.start({
    onMinute(current, previous) {
      updateVisibleClock();

      window.dispatchEvent(
        new CustomEvent("restaurant-game:minute", {
          detail: { current, previous }
        })
      );
    },

    onHour(current, previous) {
      updateVisibleCustomerLabels();

      window.dispatchEvent(
        new CustomEvent("restaurant-game:hour", {
          detail: { current, previous }
        })
      );
    },

    onDay(current, previous) {
      window.dispatchEvent(
        new CustomEvent("restaurant-game:day", {
          detail: { current, previous }
        })
      );
    }
  });
}

const observer = new MutationObserver(() => {
  ensureRuntimeControls();
  updateVisibleClock();
  updateVisibleCustomerLabels();
});

initializeExpandedFoundation();
ensureRuntimeControls();
document.addEventListener("click", handleRuntimeControl, true);
cityMapViewportRuntime.start(document);
observer.observe(document.body, { childList: true, subtree: true });
startSimulation();

window.__restaurantGameV2 = {
  foundation: gameFoundationSystem,
  runtimeLoop: gameRuntimeLoop,
  timeSystem,
  refreshClock: updateVisibleClock
};
