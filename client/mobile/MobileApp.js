import {
  app
} from "../../src/main.js";

import {
  createDevToolkit
} from "./DevToolkit.js";

import {
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

const activePage =
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
    allowedPages: [
      activePage
    ],
    getActivePage:
      () => activePage
  });

function render() {
  root.innerHTML = `
    <div
      class="screen-stage"
      data-screen-stage
      data-design-width="540"
      data-design-height="960"
    >
      <section class="page-host">
        ${renderHomePage()}
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
}

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

render();
