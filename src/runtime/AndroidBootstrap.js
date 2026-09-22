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
  mountStoreFrame
} from "../ui-v2/pages/store/StoreFrame.js";

import {
  bindGlobalHudLive,
  bindGlobalNavLive,
  bindCityFrameLive,
  bindStoreFrameLive
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

let activePage =
  null;

let pageFrame =
  null;

let pageLive =
  null;

let hudLive =
  null;

function setActiveNavigation(
  destination
) {
  for (
    const button
    of root.querySelectorAll(
      "[data-ui-destination]"
    )
  ) {
    const isActive =
      button.dataset
        .uiDestination ===
      destination;

    button.classList
      .toggle(
        "is-active",
        isActive
      );

    if (isActive) {
      button.setAttribute(
        "aria-current",
        "page"
      );
    } else {
      button.removeAttribute(
        "aria-current"
      );
    }
  }
}

function mountPrimaryPage(
  destination
) {
  if (
    destination !==
      "city" &&
    destination !==
      "store"
  ) {
    pageLive
      ?.openQuickPanel
      ?.(
        destination
      );

    return false;
  }

  if (
    destination ===
    activePage
  ) {
    return true;
  }

  pageLive?.destroy();
  pageFrame?.destroy();

  if (
    destination ===
    "store"
  ) {
    pageFrame =
      mountStoreFrame(
        shell.pageRoot
      );

    pageLive =
      bindStoreFrameLive(
        shell.pageRoot,
        app,
        mountPrimaryPage
      );
  } else {
    pageFrame =
      mountCityFrame(
        shell.pageRoot
      );

    pageLive =
      bindCityFrameLive(
        shell.pageRoot,
        app
      );
  }

  activePage =
    destination;

  setActiveNavigation(
    destination
  );

  hudLive?.refresh();

  return true;
}

mountPrimaryPage(
  "city"
);

hudLive =
  bindGlobalHudLive(
    root,
    app,
    kind =>
      pageLive
        ?.openQuickPanel
        ?.(
          kind
        )
  );

const navLive =
  bindGlobalNavLive(
    root,
    mountPrimaryPage
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
    hudLive,
    navLive,
    simulationClock,

    get activePage() {
      return activePage;
    },

    navigate:
      mountPrimaryPage,

    refresh() {
      hudLive.refresh();
      pageLive?.refresh();
    },

    destroy() {
      simulationClock.stop();

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      navLive.destroy();
      pageLive?.destroy();
      hudLive.destroy();
      pageFrame?.destroy();
      shell.destroy();
    }
  });
