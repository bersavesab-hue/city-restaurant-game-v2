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

function safeList(callback) {
  try {
    const value = callback();
    return Array.isArray(value)
      ? value
      : [];
  } catch {
    return [];
  }
}

const DISTRICT_ART_IDS = new Set([
  "university",
  "cbd",
  "nightlife",
  "old_town",
  "waterfront_leisure"
]);

const OPPORTUNITY_ART_KEYS = Object.freeze([
  "tech", "office", "expo", "plaza",
  "finance", "food", "culture", "community",
  "sports", "university", "marina", "creative"
]);

const OPPORTUNITY_ART_RULES = Object.freeze([
  ["科技", "tech"], ["技术", "tech"],
  ["写字楼", "office"], ["办公", "office"],
  ["会展", "expo"], ["展览", "expo"],
  ["广场", "plaza"], ["金融", "finance"],
  ["银行", "finance"], ["美食", "food"],
  ["餐饮", "food"], ["文旅", "culture"],
  ["古城", "culture"], ["老城", "culture"],
  ["社区", "community"], ["居民", "community"],
  ["体育", "sports"], ["球场", "sports"],
  ["大学", "university"], ["校园", "university"],
  ["码头", "marina"], ["水岸", "marina"],
  ["滨水", "marina"], ["创意", "creative"],
  ["市集", "creative"]
]);

function applyDistrictArtwork(element, districtId) {
  if (element) {
    element.dataset.districtArt =
      DISTRICT_ART_IDS.has(districtId)
        ? districtId
        : "city";
  }
}

function applyOpportunityArtwork(element, opportunity) {
  if (!element) {
    return;
  }

  if (!opportunity) {
    element.dataset.opportunityArt = "";
    return;
  }

  const haystack = String(
    (opportunity.title ?? "") + " " +
    (opportunity.body ?? "")
  );
  const matched = OPPORTUNITY_ART_RULES.find(
    ([keyword]) => haystack.includes(keyword)
  );
  const seed = String(
    opportunity.id ?? opportunity.districtId ?? haystack
  );
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }

  element.dataset.opportunityArt =
    matched?.[1] ??
    OPPORTUNITY_ART_KEYS[hash % OPPORTUNITY_ART_KEYS.length];
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
  app,
  openQuickPanel
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

    const scopeIcon =
      root.querySelector(
        ".ui-v2-hud__scope-icon"
      );

    scopeIcon
      ?.classList
      .toggle(
        "is-store",
        model.storeCount <=
          1
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

  const scopeButton =
    root.querySelector(
      ".ui-v2-hud__scope"
    );

  const moneyButton =
    root.querySelector(
      ".ui-v2-hud__resource-action"
    );

  const onScopeClick = () =>
    openQuickPanel?.("scope");

  const onMoneyClick = () =>
    openQuickPanel?.("money");

  scopeButton?.addEventListener(
    "click",
    onScopeClick
  );

  moneyButton?.addEventListener(
    "click",
    onMoneyClick
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
      scopeButton?.removeEventListener(
        "click",
        onScopeClick
      );

      moneyButton?.removeEventListener(
        "click",
        onMoneyClick
      );

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

function bindGlobalNavLive(
  root,
  openQuickPanel
) {
  const handlers = [];

  for (
    const button
    of root.querySelectorAll(
      "[data-ui-destination]"
    )
  ) {
    const handler = () => {
      const destination =
        button.dataset.uiDestination;

      if (destination !== "city") {
        openQuickPanel(destination);
      }
    };

    button.addEventListener(
      "click",
      handler
    );
    handlers.push([
      button,
      handler
    ]);
  }

  return Object.freeze({
    destroy() {
      for (
        const [button,handler]
        of handlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }
    }
  });
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

  const frame =
    root.querySelector(
      '[data-ui="city-frame"]'
    );

  const mapStage =
    root.querySelector(
      ".ui-v2-city-frame__map"
    );

  const mapWorld =
    root.querySelector(
      ".ui-v2-city-frame__map-world"
    );

  const dialog =
    root.querySelector(
      '[data-ui="city-dialog"]'
    );

  let mapScale = 1;
  let mapPanX = 0;
  let mapPanY = 0;
  let dragState = null;

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
      "大区域 · " +
      (
        model.counts.opened >
          0
          ? "已开" +
            model.counts.opened +
            "家门店"
          : "等待你的探索"
      )
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
        ".ui-v2-city-frame__marker[data-district-id]"
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

      applyDistrictArtwork(
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

            setText(
              root,
              "metric-trend-" +
              index,
              metric.trend ??
              ""
            );

            const trend =
              root.querySelector(
                '[data-live="metric-trend-' +
                index +
                '"]'
              );

            if (trend) {
              trend.dataset.tone =
                metric.tone ??
                "neutral";
            }
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

      if (card) {
        card.dataset.districtId =
          opportunity
            ?.districtId ??
          "";
      }

      card
        ?.classList
        .toggle(
          "is-empty",
          !opportunity
        );

      applyOpportunityArtwork(
        card?.querySelector(
          ".ui-v2-city-frame__opportunity-thumb"
        ),
        opportunity
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
      ".ui-v2-city-frame__marker[data-district-id]"
    )
  ) {
    const handler = () => {
      selectedDistrictId =
        button.dataset
          .districtId ??
        selectedDistrictId;

      frame
        ?.classList
        .remove(
          "is-detail-closed"
        );

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

  const openDialog = (
    title,
    items,
    emptyMessage
  ) => {
    if (!dialog) {
      return;
    }

    const titleElement =
      dialog.querySelector(
        "[data-city-dialog-title]"
      );

    const listElement =
      dialog.querySelector(
        "[data-city-dialog-list]"
      );

    if (titleElement) {
      titleElement.textContent =
        title;
    }

    if (listElement) {
      listElement.replaceChildren();

      const records =
        items.length
          ? items
          : [
              {
                title:
                  emptyMessage,
                body: ""
              }
            ];

      for (
        const record
        of records
      ) {
        const article =
          root.ownerDocument
            .createElement(
              "article"
            );

        const heading =
          root.ownerDocument
            .createElement(
              "h3"
            );

        const body =
          root.ownerDocument
            .createElement(
              "p"
            );

        heading.textContent =
          record.title;

        body.textContent =
          record.body;

        article.append(heading);

        if (record.body) {
          article.append(body);
        }

        listElement.append(
          article
        );
      }
    }

    if (
      typeof dialog.showModal ===
        "function"
    ) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute(
        "open",
        ""
      );
    }
  };

  const onPropertyClick = () => {
    if (
      !latestModel
        ?.selected
    ) {
      return;
    }

    const properties =
      latestModel
        .selected
        .properties ??
      [];

    openDialog(
      latestModel
        .selected
        .name +
      " · 可租房源",
      properties.map(
        property => ({
          title:
            property.name,
          body:
            property.area +
            "㎡ · 月租 ¥" +
            Math.round(
              Number(
                property.monthlyRent
              ) ||
              0
            ).toLocaleString(
              "zh-CN"
            )
        })
      ),
      "当前暂无可租房源"
    );

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

  const openQuickPanel = kind => {
    const restaurants =
      safeList(() =>
        app.systems
          .restaurantSystem
          .list()
      );

    const storeItems =
      restaurants.map(
        restaurant => {
          const property =
            restaurant.locationId
              ? app.systems
                  .propertySystem
                  .get(
                    restaurant.locationId
                  )
              : null;

          return {
            title:
              restaurant.name ??
              "未命名门店",
            body:
              (property?.name ??
                "尚未选址") +
              " · Lv." +
              (restaurant.level ??
                1)
          };
        }
      );

    if (
      kind === "scope" ||
      kind === "store"
    ) {
      openDialog(
        kind === "scope"
          ? "管理视角"
          : "门店",
        storeItems,
        "尚未创建门店，可在城市地图查看房源"
      );
      return;
    }

    if (kind === "money") {
      const hud =
        buildHudModel(app);

      openDialog(
        "资金 · " +
          hud.moneyFull,
        restaurants.map(
          restaurant => ({
            title:
              restaurant.name ??
              "未命名门店",
            body:
              "账户余额 " +
              Math.round(
                Number(
                  app.systems
                    .financeSystem
                    .findAccount(
                      restaurant.id
                    )
                    ?.balance ??
                    0
                )
              ).toLocaleString(
                "zh-CN"
              ) +
              " 元"
          })
        ),
        "开设门店后可查看资金账户"
      );
      return;
    }

    if (kind === "operations") {
      openDialog(
        "经营",
        restaurants.map(
          restaurant => ({
            title:
              restaurant.name ??
              "未命名门店",
            body:
              "Lv." +
              (restaurant.level ??
                1) +
              " · " +
              (Number(
                restaurant.totalReviews
              ) ||
                0) +
              " 条评价"
          })
        ),
        "开设门店后可查看经营数据"
      );
      return;
    }

    if (kind === "employees") {
      const employees =
        safeList(() =>
          app.core
            .entitySystem
            .list("employee")
        );

      openDialog(
        "员工 · " +
          employees.length +
          "人",
        employees.map(
          employee => ({
            title:
              employee.name ??
              "员工",
            body:
              employee.position ??
              employee.role ??
              "待安排岗位"
          })
        ),
        "暂无员工"
      );
      return;
    }

    if (kind === "more") {
      const city =
        buildCityModel(
          app,
          selectedDistrictId
        );

      const hud =
        buildHudModel(app);

      openDialog(
        "城市进度",
        [
          {
            title: hud.date,
            body:
              "当前时间 " +
              hud.time
          },
          {
            title:
              city.totalDistricts +
              " 个商圈",
            body:
              city.regionCount +
              " 大区域 · 已开 " +
              city.counts.opened +
              " 家门店"
          }
        ],
        "暂无城市数据"
      );
    }
  };

  propertyButton
    ?.addEventListener(
      "click",
      onPropertyClick
    );

  const opportunityHandlers =
    [];

  for (
    const button
    of root.querySelectorAll(
      "[data-opportunity-index]"
    )
  ) {
    const handler = () => {
      const districtId =
        button.dataset
          .districtId;

      if (!districtId) {
        return;
      }

      selectedDistrictId =
        districtId;

      frame
        ?.classList
        .remove(
          "is-detail-closed"
        );

      refresh();
    };

    opportunityHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const closeDetailButton =
    root.querySelector(
      '[data-city-action="close-detail"]'
    );

  const onCloseDetail = () => {
    frame
      ?.classList
      .add(
        "is-detail-closed"
      );
  };

  closeDetailButton
    ?.addEventListener(
      "click",
      onCloseDetail
    );

  const opportunityAllButton =
    root.querySelector(
      '[data-city-action="open-opportunities"]'
    );

  const onOpenOpportunities = () => {
    const opportunities =
      latestModel
        ?.allOpportunities ??
      [];

    openDialog(
      "今日机会",
      opportunities.map(
        opportunity => ({
          title:
            opportunity.title,
          body:
            opportunity.badge +
            " · " +
            opportunity.body
        })
      ),
      "今日暂无新机会"
    );
  };

  opportunityAllButton
    ?.addEventListener(
      "click",
      onOpenOpportunities
    );

  const dialogCloseButton =
    dialog?.querySelector(
      "[data-city-dialog-close]"
    );

  const closeDialog = () => {
    if (!dialog) {
      return;
    }

    if (
      typeof dialog.close ===
        "function" &&
      dialog.open
    ) {
      dialog.close();
    } else {
      dialog.removeAttribute(
        "open"
      );
    }
  };

  const onDialogBackdrop = event => {
    if (
      event.target ===
      dialog
    ) {
      closeDialog();
    }
  };

  dialogCloseButton
    ?.addEventListener(
      "click",
      closeDialog
    );

  dialog
    ?.addEventListener(
      "click",
      onDialogBackdrop
    );

  const applyMapTransform = () => {
    if (
      !mapStage ||
      !mapWorld
    ) {
      return;
    }

    const maximumX =
      Math.max(
        0,
        (
          mapWorld.offsetWidth *
          mapScale -
          mapStage.clientWidth
        ) /
        2
      );

    const maximumY =
      Math.max(
        0,
        (
          mapWorld.offsetHeight *
          mapScale -
          mapStage.clientHeight
        ) /
        2
      );

    mapPanX =
      Math.max(
        -maximumX,
        Math.min(
          maximumX,
          mapPanX
        )
      );

    mapPanY =
      Math.max(
        -maximumY,
        Math.min(
          maximumY,
          mapPanY
        )
      );

    mapWorld.style
      .setProperty(
        "--ui-city-map-scale",
        String(
          mapScale
        )
      );

    mapWorld.style
      .setProperty(
        "--ui-city-pan-x",
        mapPanX +
        "px"
      );

    mapWorld.style
      .setProperty(
        "--ui-city-pan-y",
        mapPanY +
        "px"
      );
  };

  const mapControlHandlers =
    [];

  for (
    const button
    of root.querySelectorAll(
      "[data-city-map-action]"
    )
  ) {
    const handler = () => {
      const action =
        button.dataset
          .cityMapAction;

      if (
        action ===
        "locate"
      ) {
        mapScale = 1;
        mapPanX = 0;
        mapPanY = 0;
      } else {
        const delta =
          action ===
            "zoom-in"
            ? .12
            : -.12;

        mapScale =
          Math.max(
            1,
            Math.min(
              2,
              Number(
                (
                  mapScale +
                  delta
                ).toFixed(
                  2
                )
              )
            )
          );
      }

      applyMapTransform();
    };

    mapControlHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const onPointerDown = event => {
    if (
      event.button !==
        0 ||
      event.target
        ?.closest(
          "button"
        )
    ) {
      return;
    }

    dragState = {
      pointerId:
        event.pointerId,
      clientX:
        event.clientX,
      clientY:
        event.clientY,
      panX:
        mapPanX,
      panY:
        mapPanY
    };

    mapStage
      ?.classList
      .add(
        "is-dragging"
      );

    mapStage
      ?.setPointerCapture
      ?.(
        event.pointerId
      );
  };

  const onPointerMove = event => {
    if (
      !dragState ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    mapPanX =
      dragState.panX +
      event.clientX -
      dragState.clientX;

    mapPanY =
      dragState.panY +
      event.clientY -
      dragState.clientY;

    applyMapTransform();
  };

  const onPointerUp = event => {
    if (
      !dragState ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    dragState = null;

    mapStage
      ?.classList
      .remove(
        "is-dragging"
      );

    if (
      mapStage
        ?.hasPointerCapture
        ?.(
          event.pointerId
        )
    ) {
      mapStage.releasePointerCapture(
        event.pointerId
      );
    }
  };

  mapStage
    ?.addEventListener(
      "pointerdown",
      onPointerDown
    );

  mapStage
    ?.addEventListener(
      "pointermove",
      onPointerMove
    );

  mapStage
    ?.addEventListener(
      "pointerup",
      onPointerUp
    );

  mapStage
    ?.addEventListener(
      "pointercancel",
      onPointerUp
    );

  let resizeObserver = null;

  if (
    typeof globalThis
      .ResizeObserver ===
      "function" &&
    mapStage
  ) {
    resizeObserver =
      new globalThis.ResizeObserver(
        applyMapTransform
      );

    resizeObserver.observe(
      mapStage
    );
  } else {
    globalThis.addEventListener?.(
      "resize",
      applyMapTransform
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
  applyMapTransform();

  return Object.freeze({
    refresh,
    openQuickPanel,

    getState() {
      return {
        activeFilter,
        selectedDistrictId,
        mapScale,
        mapPanX,
        mapPanY,
        detailOpen:
          !frame
            ?.classList
            .contains(
              "is-detail-closed"
            ),
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
        const [
          button,
          handler
        ]
        of opportunityHandlers
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
        of mapControlHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      closeDetailButton
        ?.removeEventListener(
          "click",
          onCloseDetail
        );

      opportunityAllButton
        ?.removeEventListener(
          "click",
          onOpenOpportunities
        );

      dialogCloseButton
        ?.removeEventListener(
          "click",
          closeDialog
        );

      dialog
        ?.removeEventListener(
          "click",
          onDialogBackdrop
        );

      mapStage
        ?.removeEventListener(
          "pointerdown",
          onPointerDown
        );

      mapStage
        ?.removeEventListener(
          "pointermove",
          onPointerMove
        );

      mapStage
        ?.removeEventListener(
          "pointerup",
          onPointerUp
        );

      mapStage
        ?.removeEventListener(
          "pointercancel",
          onPointerUp
        );

      resizeObserver
        ?.disconnect();

      if (!resizeObserver) {
        globalThis.removeEventListener?.(
          "resize",
          applyMapTransform
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

export {
  bindGlobalHudLive,
  bindGlobalNavLive,
  bindCityFrameLive
};
