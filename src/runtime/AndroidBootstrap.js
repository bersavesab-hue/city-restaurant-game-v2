import {
  app
} from "../main.js";

import {
  mountAppShell
} from "../ui-v2/shell/AppShell.js";

import {
  mountCityFrame
} from "../ui-v2/pages/city/CityFrame.js";

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

globalThis.__CITY_RESTAURANT_UI__ =
  Object.freeze({
    shell,
    cityFrame,

    destroy() {
      cityFrame.destroy();
      shell.destroy();
    }
  });
