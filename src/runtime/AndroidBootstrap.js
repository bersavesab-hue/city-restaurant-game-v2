import {
  app
} from "../main.js";

import {
  mountAppShell
} from "../ui-v2/shell/AppShell.js";

import {
  buildCityPageModel,
  mountCityPage
} from "../ui-v2/pages/city/index.js";

globalThis.__CITY_RESTAURANT_CORE__ =
  app;

function formatInteger(
  value
) {
  return new Intl.NumberFormat(
    "zh-CN",
    {
      maximumFractionDigits: 0
    }
  ).format(
    Math.round(
      Number(value) ||
      0
    )
  );
}

function formatGameClock(
  time
) {
  const day =
    Math.max(
      1,
      Number(
        time?.day
      ) ||
      1
    );

  const hour =
    Math.max(
      0,
      Number(
        time?.hour
      ) ||
      0
    );

  const minute =
    Math.max(
      0,
      Number(
        time?.minute
      ) ||
      0
    );

  return {
    dateLabel:
      "第" +
      day +
      "天",

    timeLabel:
      String(
        hour
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        minute
      ).padStart(
        2,
        "0"
      )
  };
}

function buildRuntimeHudModel() {
  const restaurants =
    app.systems
      .restaurantSystem
      .list();

  const accounts =
    app.core
      .entitySystem
      .list(
        "finance_account"
      );

  const time =
    app.core
      .gameState
      .getSection(
        "time"
      );

  const runtime =
    app.core
      .gameState
      .getSection(
        "runtime"
      );

  const clock =
    formatGameClock(
      time
    );

  const money =
    accounts.reduce(
      (
        total,
        account
      ) =>
        total +
        (
          Number(
            account.balance
          ) ||
          0
        ),
      0
    );

  const levels =
    restaurants
      .map(
        item =>
          Number(
            item.level
          )
      )
      .filter(
        Number.isFinite
      );

  const ratings =
    restaurants
      .map(
        item =>
          Number(
            item.reviewScore
          )
      )
      .filter(
        Number.isFinite
      );

  const levelLabel =
    levels.length > 0
      ? "Lv." +
        Math.max(
          ...levels
        )
      : "Lv.—";

  const ratingLabel =
    ratings.length > 0
      ? (
          ratings.reduce(
            (
              total,
              value
            ) =>
              total +
              value,
            0
          ) /
          ratings.length
        ).toFixed(
          1
        )
      : "—";

  return {
    scopeTitle:
      restaurants.length > 1
        ? "集团视角"
        : "单店视角",

    scopeSubtitle:
      restaurants.length > 1
        ? (
            "管理旗下" +
            restaurants.length +
            "家门店"
          )
        : (
            restaurants[0]
              ?.name ??
            "尚未创建门店"
          ),

    dateLabel:
      clock.dateLabel,

    timeLabel:
      clock.timeLabel,

    weatherKey:
      "none",

    weatherLabel:
      "",

    moneyLabel:
      "¥" +
      formatInteger(
        money
      ),

    levelLabel,
    ratingLabel,

    paused:
      Boolean(
        runtime?.paused
      ),

    speed:
      Number(
        runtime?.speed
      ) ||
      1
  };
}

function buildRuntimeCityModel() {
  const districts =
    app.systems
      .districtSystem
      .getAll();

  const restaurants =
    app.systems
      .restaurantSystem
      .list();

  const properties =
    app.systems
      .propertySystem
      .list();

  return buildCityPageModel({
    districts,
    restaurants,
    properties,

    opportunityScore(
      district
    ) {
      return app.systems
        .districtSystem
        .getOpportunityScore(
          district
        );
    }
  });
}

const root =
  document.getElementById(
    "app"
  );

if (!root) {
  throw new Error(
    "UI V2 root #app is missing"
  );
}

const shell =
  mountAppShell(
    root,
    {
      activePageId:
        "city",

      hudModel:
        buildRuntimeHudModel(),

      onNavigate(
        pageId
      ) {
        app.core.eventBus.emit(
          "ui:navigate",
          {
            pageId
          }
        );
      },

      onAction({
        action,
        element
      }) {
        if (
          action ===
          "toggle-pause"
        ) {
          const runtime =
            app.core.gameState
              .getSection(
                "runtime"
              );

          if (
            runtime?.paused
          ) {
            app.core.timeSystem
              .resume();
          } else {
            app.core.timeSystem
              .pause();
          }

          return;
        }

        if (
          action ===
          "set-speed"
        ) {
          const speed =
            Number(
              element.dataset
                .speed
            );

          app.core.timeSystem
            .setSpeed(
              speed
            );
        }
      }
    }
  );

const cityPageRoot =
  root.querySelector(
    '[data-ui="page-content"]'
  );

if (!cityPageRoot) {
  throw new Error(
    "UI V2 page content region is missing"
  );
}

const cityPage =
  mountCityPage(
    cityPageRoot,
    buildRuntimeCityModel(),
    {
      onOpenProperties(
        districtId
      ) {
        app.core.eventBus.emit(
          "ui:city:openProperties",
          {
            districtId
          }
        );
      },

      onOpenOpportunities() {
        app.core.eventBus.emit(
          "ui:city:openOpportunities",
          {}
        );
      }
    }
  );

function refreshHud() {
  shell.updateHud(
    buildRuntimeHudModel()
  );
}

const unsubscribeState =
  app.core.eventBus.on(
    "state:changed",
    refreshHud
  );

const unsubscribeReplace =
  app.core.eventBus.on(
    "state:replaced",
    refreshHud
  );

const unsubscribeReset =
  app.core.eventBus.on(
    "state:reset",
    refreshHud
  );

globalThis.__CITY_RESTAURANT_UI__ =
  Object.freeze({
    shell,

    destroy() {
      unsubscribeState();
      unsubscribeReplace();
      unsubscribeReset();
      cityPage.destroy();
      shell.destroy();
    }
  });
