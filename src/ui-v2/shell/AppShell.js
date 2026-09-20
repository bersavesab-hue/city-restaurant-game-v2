import {
  renderGlobalHud
} from "../components/GlobalHud.js";

import {
  renderGlobalNav
} from "../components/GlobalNav.js";

function renderAppShell() {
  return (
    '<div class="ui-v2-app" data-ui="app">' +
      '<div class="ui-v2-app-shell" data-ui="app-shell">' +
        renderGlobalHud() +
        '<main class="ui-v2-page-root" data-ui="page-root"></main>' +
        renderGlobalNav() +
      '</div>' +
    '</div>'
  );
}

function mountAppShell(
  root
) {
  if (
    !root ||
    typeof root.querySelector !==
      "function"
  ) {
    throw new TypeError(
      "AppShell root must be a DOM element"
    );
  }

  root.innerHTML =
    renderAppShell();

  const pageRoot =
    root.querySelector(
      '[data-ui="page-root"]'
    );

  if (!pageRoot) {
    throw new Error(
      "AppShell page root is missing"
    );
  }

  return Object.freeze({
    pageRoot,

    destroy() {
      root.replaceChildren();
    }
  });
}

export {
  renderAppShell,
  mountAppShell
};
