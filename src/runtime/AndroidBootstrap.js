import {
  app
} from "../main.js";

import {
  mountAppShell
} from "../ui-v2/shell/AppShell.js";

import {
  mountCityFrame
} from "../ui-v2/pages/city/CityFrame.js";

import {
  bindGlobalHudLive,
  bindGlobalNavLive,
  bindCityFrameLive
} from "../ui-v2/runtime/LiveUiBinding.js";

import {
  createSimulationClock
} from "./SimulationClock.js";

globalThis.__CITY_RESTAURANT_CORE__ =
  app;

const root =
  document.getElementById(
    "app"
  );

if (!root) {
  throw new Error(
    "UI root #app is missing"
  );
}

const shell =
  mountAppShell(
    root
  );

const cityFrame =
  mountCityFrame(
    shell.pageRoot
  );

const cityLive =
  bindCityFrameLive(
    shell.pageRoot,
    app
  );

const hudLive =
  bindGlobalHudLive(
    root,
    app,
    cityLive.openQuickPanel
  );

const navLive =
  bindGlobalNavLive(
    root,
    cityLive.openQuickPanel
  );

const simulationClock =
  createSimulationClock(
    app
  );

simulationClock.start();

const onVisibilityChange = () => {
  simulationClock.reset();
};

document.addEventListener(
  "visibilitychange",
  onVisibilityChange
);

globalThis.__CITY_RESTAURANT_UI__ =
  Object.freeze({
    shell,
    cityFrame,
    hudLive,
    navLive,
    cityLive,
    simulationClock,

    refresh() {
      hudLive.refresh();
      cityLive.refresh();
    },

    destroy() {
      simulationClock.stop();

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      navLive.destroy();
      cityLive.destroy();
      hudLive.destroy();
      cityFrame.destroy();
      shell.destroy();
    }
  });
