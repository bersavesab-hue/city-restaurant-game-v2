
import {
  pageRegistry
} from "../registry/PageRegistry.js";

import "../registry/defaultPages.js";
import "../registry/gameplayPages.js";

const MAIN_LANDINGS =
  Object.freeze({
    city:
      "city",

    restaurant:
      "operating-command-center",

    operations:
      "operations-home",

    employees:
      "employee_roster",

    more:
      "more-home"
  });

const ACTION_TARGETS =
  Object.freeze({
    finance:
      "finance",

    analytics:
      "analytics",

    supply:
      "supply",

    inventory:
      "supply",

    employees:
      "employee_roster",

    staffing:
      "employee_roster",

    workforce:
      "workforce-capacity",

    schedule:
      "workforce-capacity",

    menu:
      "menu-optimization",

    "menu-optimization":
      "menu-optimization",

    capacity:
      "capacity",

    reputation:
      "reputation",

    channels:
      "channels",

    operations:
      "analytics",

    restaurant:
      "operating-command-center",

    "operating-command-center":
      "operating-command-center",

    customers:
      "customers",

    "member-marketing":
      "member-marketing",

    "menu-engineering":
      "menu-engineering",

    "equipment-maintenance":
      "equipment-maintenance",

    market:
      "market-strategy",

    competition:
      "market-strategy",

    "market-strategy":
      "market-strategy"
  });

class GameplayNavigationSystem {
  constructor() {
    this.currentPageId =
      "operating-command-center";

    this.history = [
      this.currentPageId
    ];
  }

  getLandingPage(
    mainPageId
  ) {
    return (
      MAIN_LANDINGS[
        mainPageId
      ] ??
      mainPageId
    );
  }

  resolveActionTarget(
    target
  ) {
    const requested =
      String(
        target ?? ""
      ).trim();

    if (!requested) {
      return (
        this.currentPageId
      );
    }

    const mapped =
      ACTION_TARGETS[
        requested
      ] ??
      requested;

    if (
      pageRegistry.has(
        mapped
      )
    ) {
      return mapped;
    }

    return (
      "operating-command-center"
    );
  }

  resolveNavigationTarget(
    pageId
  ) {
    const requested =
      String(
        pageId ?? ""
      ).trim();

    const landing =
      this.getLandingPage(
        requested
      );

    return (
      this.resolveActionTarget(
        landing
      )
    );
  }

  navigate(
    pageId,
    {
      unlockResolver = null
    } = {}
  ) {
    const target =
      this.resolveNavigationTarget(
        pageId
      );

    if (
      !pageRegistry.has(
        target
      )
    ) {
      throw new Error(
        `Unknown page "${target}"`
      );
    }

    if (
      !pageRegistry.isUnlocked(
        target,
        unlockResolver
      )
    ) {
      return {
        changed: false,

        reason:
          "locked",

        pageId:
          this.currentPageId
      };
    }

    if (
      target ===
      this.currentPageId
    ) {
      return {
        changed: false,

        reason:
          "same_page",

        pageId:
          target
      };
    }

    this.currentPageId =
      target;

    this.history.push(
      target
    );

    if (
      this.history.length >
      30
    ) {
      this.history.shift();
    }

    return {
      changed: true,

      reason:
        "navigated",

      pageId:
        target,

      page:
        pageRegistry.get(
          target
        )
    };
  }

  navigateAction(
    actionTarget,
    options = {}
  ) {
    return this.navigate(
      this.resolveActionTarget(
        actionTarget
      ),
      options
    );
  }

  back() {
    if (
      this.history.length <=
      1
    ) {
      return {
        changed: false,

        pageId:
          this.currentPageId
      };
    }

    this.history.pop();

    this.currentPageId =
      this.history[
        this.history.length -
        1
      ];

    return {
      changed: true,

      pageId:
        this.currentPageId,

      page:
        pageRegistry.get(
          this.currentPageId
        )
    };
  }

  getCurrentPage() {
    return pageRegistry.get(
      this.currentPageId
    );
  }

  getMainNavigation() {
    return pageRegistry
      .mainNavigation()
      .map(
        page => ({
          ...page,

          landingPageId:
            this.getLandingPage(
              page.id
            ),

          active:
            this.isMainPageActive(
              page.id
            )
        })
      );
  }

  isMainPageActive(
    mainPageId
  ) {
    const current =
      pageRegistry.get(
        this.currentPageId
      );

    if (
      current.id ===
      mainPageId
    ) {
      return true;
    }

    return (
      current.parent ===
      mainPageId
    );
  }


  reset() {
    this.currentPageId =
      "operating-command-center";

    this.history = [
      this.currentPageId
    ];
  }
}

export const gameplayNavigationSystem =
  new GameplayNavigationSystem();

export {
  GameplayNavigationSystem,
  MAIN_LANDINGS,
  ACTION_TARGETS
};
