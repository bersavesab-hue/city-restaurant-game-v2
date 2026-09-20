import {
  renderGlobalHud
} from "../components/GlobalHud.js";

import {
  PRIMARY_NAV_ITEMS,
  renderGlobalNav
} from "../components/GlobalNav.js";

const PRIMARY_PAGE_IDS =
  Object.freeze(
    PRIMARY_NAV_ITEMS.map(
      item =>
        item.id
    )
  );

function normalizeActivePageId(
  pageId
) {
  return PRIMARY_PAGE_IDS.includes(
    pageId
  )
    ? pageId
    : "city";
}

function renderAppShell({
  activePageId = "city",
  hudModel = {},
  badges = {}
} = {}) {
  const activeId =
    normalizeActivePageId(
      activePageId
    );

  return (
    '<div class="ui-v2-app" data-ui="app" data-active-page="' +
      activeId +
    '">' +
      '<div class="ui-v2-app-shell" data-ui="app-shell">' +
        '<div class="ui-v2-safe-top" data-ui-region="safe-top" aria-hidden="true"></div>' +
        renderGlobalHud(
          hudModel
        ) +
        '<main class="ui-v2-page-content" data-ui="page-content" data-active-page="' +
          activeId +
        '"></main>' +
        renderGlobalNav({
          activeId,
          badges
        }) +
        '<div class="ui-v2-safe-bottom" data-ui-region="safe-bottom" aria-hidden="true"></div>' +
      '</div>' +
    '</div>'
  );
}

function mountAppShell(
  root,
  {
    activePageId = "city",
    hudModel = {},
    badges = {},
    onNavigate = null,
    onAction = null
  } = {}
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

  let activeId =
    normalizeActivePageId(
      activePageId
    );

  let currentHudModel = {
    ...hudModel
  };

  let currentBadges = {
    ...badges
  };

  root.innerHTML =
    renderAppShell({
      activePageId:
        activeId,
      hudModel:
        currentHudModel,
      badges:
        currentBadges
    });

  root.dataset.uiState =
    "shell";

  function updatePageIdentity() {
    const appElement =
      root.querySelector(
        '[data-ui="app"]'
      );

    const pageContent =
      root.querySelector(
        '[data-ui="page-content"]'
      );

    if (appElement) {
      appElement.dataset.activePage =
        activeId;
    }

    if (pageContent) {
      pageContent.dataset.activePage =
        activeId;
    }
  }

  function renderNav() {
    const current =
      root.querySelector(
        '[data-ui="global-nav"]'
      );

    if (!current) {
      return;
    }

    current.outerHTML =
      renderGlobalNav({
        activeId,
        badges:
          currentBadges
      });
  }

  function updateHud(
    nextModel = {}
  ) {
    currentHudModel = {
      ...nextModel
    };

    const current =
      root.querySelector(
        '[data-ui="global-hud"]'
      );

    if (!current) {
      return;
    }

    current.outerHTML =
      renderGlobalHud(
        currentHudModel
      );
  }

  function updateBadges(
    nextBadges = {}
  ) {
    currentBadges = {
      ...nextBadges
    };

    renderNav();
  }

  function setActivePage(
    pageId,
    {
      emit = true
    } = {}
  ) {
    const nextId =
      normalizeActivePageId(
        pageId
      );

    if (
      nextId ===
      activeId
    ) {
      return activeId;
    }

    activeId =
      nextId;

    updatePageIdentity();
    renderNav();

    if (
      emit &&
      typeof onNavigate ===
        "function"
    ) {
      onNavigate(
        activeId
      );
    }

    return activeId;
  }

  function handleClick(
    event
  ) {
    const target =
      event.target;

    if (
      !target ||
      typeof target.closest !==
        "function"
    ) {
      return;
    }

    const destination =
      target.closest(
        "[data-ui-destination]"
      );

    if (
      destination &&
      root.contains(
        destination
      )
    ) {
      setActivePage(
        destination.dataset
          .uiDestination
      );

      return;
    }

    const action =
      target.closest(
        "[data-ui-action]"
      );

    if (
      action &&
      root.contains(
        action
      ) &&
      typeof onAction ===
        "function"
    ) {
      onAction({
        action:
          action.dataset.uiAction,
        element:
          action
      });
    }
  }

  root.addEventListener(
    "click",
    handleClick
  );

  return Object.freeze({
    getActivePageId() {
      return activeId;
    },

    setActivePage,
    updateHud,
    updateBadges,

    destroy() {
      root.removeEventListener(
        "click",
        handleClick
      );

      root.replaceChildren();

      root.dataset.uiState =
        "destroyed";
    }
  });
}

export {
  PRIMARY_PAGE_IDS,
  normalizeActivePageId,
  renderAppShell,
  mountAppShell
};
