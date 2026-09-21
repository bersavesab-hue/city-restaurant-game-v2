import {
  buildHudModel,
  buildCityModel
} from "./LiveUiModel.js";

function setText(
  root,
  key,
  value
) {
  const element =
    root.querySelector(
      '[data-live="' +
      key +
      '"]'
    );

  if (!element) {
    return false;
  }

  element.textContent =
    String(
      value ?? ""
    );

  return true;
}

const DISTRICT_THUMB_PRESETS =
  Object.freeze({
    university: [58,18],
    cbd: [43,42],
    nightlife: [82,45],
    old_town: [19,72],
    waterfront_leisure: [77,75]
  });

function getDistrictThumbPosition(
  districtId
) {
  const preset =
    DISTRICT_THUMB_PRESETS[
      districtId
    ];

  if (preset) {
    return preset;
  }

  const text =
    String(
      districtId ??
      "district"
    );

  let hash = 0;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash =
      (
        hash * 31 +
        text.charCodeAt(
          index
        )
      ) >>>
      0;
  }

  return [
    18 + hash % 65,
    20 + (
      Math.floor(
        hash / 97
      ) %
      61
    )
  ];
}

function applyDistrictThumb(
  element,
  districtId
) {
  if (!element) {
    return;
  }

  const [
    x,
    y
  ] =
    getDistrictThumbPosition(
      districtId
    );

  element.dataset
    .districtId =
    String(
      districtId ??
      ""
    );

  element.style
    .setProperty(
      "--district-thumb-x",
      x + "%"
    );

  element.style
    .setProperty(
      "--district-thumb-y",
      y + "%"
    );
}

function scheduleRefresh(
  callback
) {
  let pending =
    false;

  return () => {
    if (pending) {
      return;
    }

    pending = true;

    const run = () => {
      pending = false;
      callback();
    };

    if (
      typeof requestAnimationFrame ===
      "function"
    ) {
      requestAnimationFrame(
        run
      );
      return;
    }

    queueMicrotask(
      run
    );
  };
}

function bindGlobalHudLive(
  root,
  app
) {
  if (
    !root ||
    !app
  ) {
    throw new TypeError(
      "HUD live binding requires root and app"
    );
  }

  const refresh = () => {
    const model =
      buildHudModel(
        app
      );

    setText(
      root,
      "hud-scope-title",
      model.scopeTitle
    );

    setText(
      root,
      "hud-scope-subtitle",
      model.scopeSubtitle
    );

    setText(
      root,
      "hud-date",
      model.date
    );

    setText(
      root,
      "hud-time",
      model.time
    );

    const moneyElement =
      root.querySelector(
        '[data-live="hud-money"]'
      );

    if (moneyElement) {
      moneyElement.textContent =
        model.moneyCompact;

      moneyElement.title =
        model.moneyFull;

      moneyElement.setAttribute(
        "aria-label",
        model.moneyFull
      );
    }

    setText(
      root,
      "hud-level",
      "Lv." +
      model.level
    );

    setText(
      root,
      "hud-rating",
      model.rating
    );

    const pause =
      root.querySelector(
        '[data-hud-action="toggle-pause"]'
      );

    if (pause) {
      pause.textContent =
        model.paused
          ? "▶"
          : "Ⅱ";

      pause.classList
        .toggle(
          "is-active",
          model.paused
        );
    }

    for (
      const button
      of root.querySelectorAll(
        "[data-hud-speed]"
      )
    ) {
      button.classList
        .toggle(
          "is-active",
          Number(
            button.dataset
              .hudSpeed
          ) ===
            model.speed &&
          !model.paused
        );
    }
  };

  const scheduled =
    scheduleRefresh(
      refresh
    );

  const onPause = () => {
    const runtime =
      app.core
        .gameState
        .getSection(
          "runtime"
        );

    if (
      runtime.paused
    ) {
      app.core
        .timeSystem
        .resume();
    } else {
      app.core
        .timeSystem
        .pause();
    }

    refresh();
  };

  const pauseButton =
    root.querySelector(
      '[data-hud-action="toggle-pause"]'
    );

  pauseButton
    ?.addEventListener(
      "click",
      onPause
    );

  const speedHandlers =
    [];

  for (
    const button
    of root.querySelectorAll(
      "[data-hud-speed]"
    )
  ) {
    const handler = () => {
      const speed =
        Number(
          button.dataset
            .hudSpeed
        );

      app.core
        .timeSystem
        .setSpeed(
          speed
        );

      app.core
        .timeSystem
        .resume();

      refresh();
    };

    speedHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const unsubscribers = [
    app.core
      .eventBus
      .on(
        "state:changed",
        scheduled
      ),

    app.core
      .eventBus
      .on(
        "state:replaced",
        scheduled
      ),

    app.core
      .eventBus
      .on(
        "state:reset",
        scheduled
      )
  ];

  refresh();

  return Object.freeze({
    refresh,

    destroy() {
      pauseButton
        ?.removeEventListener(
          "click",
          onPause
        );

      for (
        const [
          button,
          handler
        ]
        of speedHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      for (
        const unsubscribe
        of unsubscribers
      ) {
        unsubscribe();
      }
    }
  });
}

function districtMatchesFilter(
  district,
  filterId
) {
  switch (
    filterId
  ) {
    case "opened":
      return Boolean(
        district.opened
      );

    case "available":
      return (
        district.unlocked &&
        !district.opened &&
        district
          .availablePropertyCount >
          0
      );

    case "highPotential":
      return (
        district.unlocked &&
        district
          .opportunityScore >=
          66
      );

    case "locked":
      return !district.unlocked;

    default:
      return true;
  }
}

function bindCityFrameLive(
  root,
  app
) {
  if (
    !root ||
    !app
  ) {
    throw new TypeError(
      "City live binding requires root and app"
    );
  }

  let activeFilter =
    "all";

  let selectedDistrictId =
    "cbd";

  let latestModel =
    null;

  const refresh = () => {
    const model =
      buildCityModel(
        app,
        selectedDistrictId
      );

    latestModel =
      model;

    if (
      model.selected
    ) {
      selectedDistrictId =
        model.selected.id;
    }

    setText(
      root,
      "city-total",
      model.totalDistricts +
      "个商圈"
    );

    setText(
      root,
      "city-summary-subtitle",
      model.regionCount +
      "大区域 · 已开" +
      model.counts.opened +
      " · 可选" +
      model.counts.available
    );

    for (
      const [
        id,
        count
      ]
      of Object.entries(
        model.counts
      )
    ) {
      setText(
        root,
        "filter-" +
        id,
        count
      );
    }

    const districtMap =
      new Map(
        model.districts
          .map(
            district => [
              district.id,
              district
            ]
          )
      );

    const markerMap =
      new Map(
        model.markers
          .map(
            marker => [
              marker.id,
              marker
            ]
          )
      );

    for (
      const button
      of root.querySelectorAll(
        "[data-district-id]"
      )
    ) {
      const id =
        button.dataset
          .districtId;

      const marker =
        markerMap.get(
          id
        );

      const district =
        districtMap.get(
          id
        );

      if (
        marker
      ) {
        setText(
          root,
          "marker-title-" +
          id,
          marker.title
        );

        setText(
          root,
          "marker-meta-" +
          id,
          marker.meta
        );
      }

      button.classList
        .toggle(
          "is-selected",
          id ===
            selectedDistrictId
        );

      button.classList
        .toggle(
          "is-filtered-out",
          !district ||
          !districtMatchesFilter(
            district,
            activeFilter
          )
        );
    }

    for (
      const filter
      of root.querySelectorAll(
        "[data-city-filter]"
      )
    ) {
      filter.classList
        .toggle(
          "is-active",
          filter.dataset
            .cityFilter ===
            activeFilter
        );
    }

    const selected =
      model.selected;

    if (
      selected
    ) {
      setText(
        root,
        "detail-title",
        selected.name
      );

      setText(
        root,
        "detail-badge",
        selected.opened
          ? "已开店"
          : !selected.unlocked
            ? "待解锁"
            : selected.highPotential
              ? "高潜力"
              : selected
                  .availablePropertyCount >
                  0
                ? "可选址"
                : "观察"
      );

      setText(
        root,
        "detail-body",
        selected.description
      );

      applyDistrictThumb(
        root.querySelector(
          ".ui-v2-city-frame__thumbnail"
        ),
        selected.id
      );

      selected.metrics
        .forEach(
          (
            metric,
            index
          ) => {
            setText(
              root,
              "metric-label-" +
              index,
              metric.label
            );

            setText(
              root,
              "metric-value-" +
              index,
              metric.value
            );
          }
        );
    }

    setText(
      root,
      "opportunity-count",
      model
        .opportunities
        .length
    );

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const opportunity =
        model
          .opportunities[
            index
          ] ??
        null;

      const card =
        root.querySelector(
          '[data-opportunity-index="' +
          index +
          '"]'
        );

      card
        ?.classList
        .toggle(
          "is-empty",
          !opportunity
        );

      applyDistrictThumb(
        card?.querySelector(
          ".ui-v2-city-frame__opportunity-thumb"
        ),
        opportunity
          ?.districtId ??
        ""
      );

      setText(
        root,
        "opportunity-title-" +
        index,
        opportunity
          ?.title ??
        "暂无机会"
      );

      setText(
        root,
        "opportunity-body-" +
        index,
        opportunity
          ? (
              opportunity.badge +
              " · " +
              opportunity.body
            )
          : "等待市场变化"
      );
    }
  };

  const scheduled =
    scheduleRefresh(
      refresh
    );

  const filterHandlers =
    [];

  for (
    const button
    of root.querySelectorAll(
      "[data-city-filter]"
    )
  ) {
    const handler = () => {
      activeFilter =
        button.dataset
          .cityFilter ??
        "all";

      refresh();
    };

    filterHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const markerHandlers =
    [];

  for (
    const button
    of root.querySelectorAll(
      "[data-district-id]"
    )
  ) {
    const handler = () => {
      selectedDistrictId =
        button.dataset
          .districtId ??
        selectedDistrictId;

      refresh();
    };

    markerHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const propertyButton =
    root.querySelector(
      ".ui-v2-city-frame__primary-action"
    );

  const onPropertyClick = () => {
    if (
      !latestModel
        ?.selected
    ) {
      return;
    }

    app.core
      .eventBus
      .emit(
        "ui:openProperties",
        {
          districtId:
            latestModel
              .selected
              .id
        }
      );
  };

  propertyButton
    ?.addEventListener(
      "click",
      onPropertyClick
    );

  const unsubscribers = [
    app.core
      .eventBus
      .on(
        "state:changed",
        scheduled
      ),

    app.core
      .eventBus
      .on(
        "state:replaced",
        scheduled
      ),

    app.core
      .eventBus
      .on(
        "state:reset",
        scheduled
      )
  ];

  refresh();

  return Object.freeze({
    refresh,

    getState() {
      return {
        activeFilter,
        selectedDistrictId,
        model:
          latestModel
      };
    },

    destroy() {
      for (
        const [
          button,
          handler
        ]
        of filterHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      for (
        const [
          button,
          handler
        ]
        of markerHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      propertyButton
        ?.removeEventListener(
          "click",
          onPropertyClick
        );

      for (
        const unsubscribe
        of unsubscribers
      ) {
        unsubscribe();
      }
    }
  });
}

export {
  bindGlobalHudLive,
  bindCityFrameLive
};
