import {
  app
} from "../../src/main.js";

import {
  createDevToolkit
} from "./DevToolkit.js";

import {
  createMobileGameController
} from "./MobileGameController.js";

import {
  PRIMARY_NAV,
  renderHomePage
} from "./HomePage.js";

import {
  installScreenAdapter
} from "./ScreenAdapter.js";

import {
  createBrowserRuntimeSession
} from "../../src/runtime/BrowserRuntimeSession.js";

const root =
  document.querySelector("#app");

const sheetRoot =
  document.querySelector("#sheet-root");

const allowedPages =
  PRIMARY_NAV.map(
    item =>
      item.id
  );

let activePage =
  "store";

const runtimeSession =
  createBrowserRuntimeSession(
    app
  );

const runtimeStatus =
  runtimeSession.start();

window.__CITY_RUNTIME_SESSION__ =
  runtimeSession;

window.__CITY_RUNTIME_STATUS__ =
  runtimeStatus;

const gameController =
  createMobileGameController(
    app
  );

const starterState =
  gameController
    .ensureStarterState();

if (
  starterState.created &&
  !runtimeSession
    .isSaveBlocked()
) {
  runtimeSession.saveNow(
    "starter-created"
  );
}

window.__CITY_GAME_CONTROLLER__ =
  gameController;

const buildLabel =
  `v${__APP_VERSION__} · ${__BUILD_GIT_SHA__}`;

installScreenAdapter({
  baseWidth: 540,
  baseHeight: 960
});

const devToolkit =
  createDevToolkit({
    app,
    root,
    sheetRoot,
    allowedPages,
    getActivePage:
      () => activePage
  });

let renderedPage = null;

function render() {
  const scrollState = new Map();
  if (renderedPage === activePage) {
    for (const panel of root.querySelectorAll("[data-scroll-key]")) {
      scrollState.set(panel.dataset.scrollKey, {top: panel.scrollTop, left: panel.scrollLeft});
    }
  }
  const viewModel =
    gameController
      .getViewModel();

  root.innerHTML = `
    <div
      class="screen-stage"
      data-screen-stage
      data-design-width="540"
      data-design-height="960"
    >
      <section class="page-host">
        ${renderHomePage(
          viewModel,
          activePage
        )}
      </section>

      <div
        class="playtest-build-stamp"
        data-playtest-build-stamp
        aria-label="测试包版本"
      >
        ${buildLabel}
      </div>
    </div>
  `;

  devToolkit.afterRender();
  for (const panel of root.querySelectorAll("[data-scroll-key]")) {
    const saved = scrollState.get(panel.dataset.scrollKey);
    if (saved) {
      panel.scrollTop = saved.top;
      panel.scrollLeft = saved.left;
    }
  }
  renderedPage = activePage;
}

function shouldSkipRefresh() {
  const active =
    document.activeElement;

  if (
    active instanceof
      HTMLInputElement &&
    active.closest(
      "#ui-dev-root"
    )
  ) {
    return true;
  }

  return Boolean(
    document.querySelector(
      ".ui-dev-sheet"
    )
  );
}

root.addEventListener(
  "click",
  event => {
    const nav =
      event.target.closest(
        "[data-nav]"
      );

    if (nav) {
      const nextPage =
        nav.dataset.nav;

      if (
        allowedPages.includes(
          nextPage
        )
      ) {
        activePage =
          nextPage;

        const routeAction =
          nav.dataset
            .routeAction;

        if (
          routeAction
        ) {
          gameController
            .performAction(
              routeAction,
              nav.dataset
                .routeValue ??
              null
            );
        }

        render();
      }

      return;
    }

    const button =
      event.target.closest(
        "[data-game-action]"
      );

    if (
      !button ||
      button.disabled
    ) {
      return;
    }

    const action =
      button.dataset
        .gameAction;

    const value =
      button.dataset
        .gameValue ??
      null;

    gameController
      .performAction(
        action,
        value
      );

    render();
  }
);

window.addEventListener(
  "ui-screen-resize",
  () => {
    const active =
      document.activeElement;

    const editingDevField =
      active instanceof
        HTMLInputElement &&
      Boolean(
        active.closest(
          "#ui-dev-root"
        )
      );

    if (editingDevField) {
      return;
    }

    devToolkit.afterRender();
  }
);

setInterval(
  () => {
    if (
      !shouldSkipRefresh()
    ) {
      render();
    }
  },
  3000
);

render();
