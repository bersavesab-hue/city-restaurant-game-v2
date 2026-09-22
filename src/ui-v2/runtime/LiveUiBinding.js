import {
  formatCompactMoney,
  buildHudModel,
  buildCityModel,
  buildStoreModel
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

function resolveDistrictSelectionForFilter(
  districts,
  selectedDistrictId,
  filterId
) {
  const list =
    Array.isArray(districts)
      ? districts
      : [];

  const selected =
    list.find(
      district =>
        district.id ===
        selectedDistrictId
    );

  if (
    selected &&
    districtMatchesFilter(
      selected,
      filterId
    )
  ) {
    return selected.id;
  }

  return (
    list.find(
      district =>
        districtMatchesFilter(
          district,
          filterId
        )
    )
      ?.id ??
    selectedDistrictId ??
    null
  );
}

function bindGlobalNavLive(
  root,
  navigate
) {
  const handlers = [];

  for (
    const button
    of root.querySelectorAll(
      "[data-ui-destination]"
    )
  ) {
    const handler = () => {
      navigate?.(
        button.dataset
          .uiDestination
      );
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

  const dialog =
    root.querySelector(
      '[data-ui="city-dialog"]'
    );

  const refresh = () => {
    let model =
      buildCityModel(
        app,
        selectedDistrictId
      );

    const resolvedDistrictId =
      resolveDistrictSelectionForFilter(
        model.districts,
        model.selected?.id ??
          selectedDistrictId,
        activeFilter
      );

    if (
      resolvedDistrictId &&
      resolvedDistrictId !==
        model.selected?.id
    ) {
      selectedDistrictId =
        resolvedDistrictId;

      model =
        buildCityModel(
          app,
          selectedDistrictId
        );
    }

    latestModel =
      model;

    if (
      model.selected
    ) {
      selectedDistrictId =
        model.selected.id;
    }

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

      const isSelected =
        id ===
        selectedDistrictId;

      button.classList
        .toggle(
          "is-selected",
          isSelected
        );

      button.setAttribute(
        "aria-pressed",
        String(
          isSelected
        )
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
      const isActive =
        filter.dataset
          .cityFilter ===
        activeFilter;

      filter.classList
        .toggle(
          "is-active",
          isActive
        );

      filter.setAttribute(
        "aria-selected",
        String(
          isActive
        )
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

      const badgeState =
        selected.opened
          ? "opened"
          : !selected.unlocked
            ? "locked"
            : selected.highPotential
              ? "highPotential"
              : selected.availablePropertyCount > 0
                ? "available"
                : "observe";

      setText(
        root,
        "detail-badge",
        badgeState === "opened"
          ? "已开店"
          : badgeState === "locked"
            ? "待解锁"
            : badgeState === "highPotential"
              ? "高潜力"
              : badgeState === "available"
                ? "可选址"
                : "观察"
      );

      const badgeElement =
        root.querySelector(
          '[data-live="detail-badge"]'
        );

      if (badgeElement) {
        badgeElement.dataset.state =
          badgeState;
      }

      const propertyAction =
        root.querySelector(
          ".ui-v2-city-frame__primary-action"
        );

      if (propertyAction) {
        const hasProperties =
          selected.availablePropertyCount > 0;
        const enabled =
          selected.unlocked &&
          hasProperties;

        propertyAction.disabled =
          !enabled;
        propertyAction.setAttribute(
          "aria-disabled",
          String(!enabled)
        );
        propertyAction.dataset.districtId =
          selected.id;
        propertyAction.textContent =
          !selected.unlocked
            ? "待解锁"
            : hasProperties
              ? "查看房源"
              : "暂无房源";
      }

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

      const nextDistrictId =
        resolveDistrictSelectionForFilter(
          latestModel?.districts,
          selectedDistrictId,
          activeFilter
        );

      if (nextDistrictId) {
        selectedDistrictId =
          nextDistrictId;
      }

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

      activeFilter =
        "all";

      selectedDistrictId =
        districtId;

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
    openQuickPanel,

    getState() {
      return {
        activeFilter,
        selectedDistrictId,
        mapMode: "static",
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

      for (
        const unsubscribe
        of unsubscribers
      ) {
        unsubscribe();
      }
    }
  });
}

function escapeMarkup(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function bindStoreFrameLive(
  root,
  app,
  navigate
) {
  if (
    !root ||
    !app
  ) {
    throw new TypeError(
      "Store live binding requires root and app"
    );
  }

  let activeFilter =
    "all";

  let latestModel =
    null;

  const frame =
    root.querySelector(
      '[data-ui="store-frame"]'
    );

  const list =
    root.querySelector(
      "[data-store-list]"
    );

  const empty =
    root.querySelector(
      "[data-store-empty]"
    );

  const taskList =
    root.querySelector(
      "[data-store-task-list]"
    );

  const dialog =
    root.querySelector(
      '[data-ui="store-dialog"]'
    );

  const renderStores =
    model => {
      if (!list) {
        return;
      }

      const source =
        model.displayMode ===
          "single"
          ? model.stores
          : activeFilter ===
              "all"
            ? model.stores
            : model.stores
                .filter(
                  store =>
                    store.status ===
                    activeFilter
                );

      list.innerHTML =
        source.map(
          store =>
            '<article class="ui-v2-store-card">' +
              '<header>' +
                '<h3>' +
                  escapeMarkup(store.name) +
                '</h3>' +
                '<span class="ui-v2-store-card__status" data-state="' +
                  escapeMarkup(store.status) +
                '">' +
                  escapeMarkup(store.statusLabel) +
                '</span>' +
              '</header>' +
              '<div class="ui-v2-store-card__location">' +
                escapeMarkup(store.district) +
              '</div>' +
              '<div class="ui-v2-store-card__primary">' +
                '<strong>主门店</strong>' +
                '<small>当前唯一门店</small>' +
              '</div>' +
              '<div class="ui-v2-store-card__stats">' +
                '<span><small>今日营业额</small><strong>' +
                  escapeMarkup(
                    formatCompactMoney(store.revenue)
                  ) +
                '</strong></span>' +
                '<span><small>今日利润</small><strong>' +
                  escapeMarkup(
                    formatCompactMoney(store.profit)
                  ) +
                '</strong></span>' +
                '<span><small>满意度</small><strong>' +
                  escapeMarkup(store.satisfaction) +
                  '%</strong></span>' +
              '</div>' +
              '<footer>' +
                '<span>Lv.' +
                  escapeMarkup(store.level) +
                '</span>' +
                '<span>' +
                  escapeMarkup(store.manager) +
                '</span>' +
              '</footer>' +
            '</article>'
        ).join("");
    };

  const renderTasks =
    model => {
      if (!taskList) {
        return;
      }

      if (
        model.tasks.length ===
        0
      ) {
        taskList.innerHTML =
          '<div class="ui-v2-store-frame__task-empty">暂无待办，门店运营正常。</div>';
        return;
      }

      taskList.innerHTML =
        model.tasks
          .slice(0,6)
          .map(
            task =>
              '<article class="ui-v2-store-task">' +
                '<strong>' +
                  escapeMarkup(task.title) +
                '</strong>' +
                '<small>' +
                  escapeMarkup(task.body) +
                '</small>' +
              '</article>'
          )
          .join("");
    };

  const refresh = () => {
    const model =
      buildStoreModel(app);

    latestModel =
      model;

    if (frame) {
      frame.dataset.storeLayout =
        model.displayMode;
    }

    if (
      model.displayMode ===
      "single"
    ) {
      activeFilter =
        "all";
    }

    setText(
      root,
      "store-revenue",
      formatCompactMoney(
        model.totalRevenue
      )
    );
    setText(
      root,
      "store-profit",
      formatCompactMoney(
        model.totalProfit
      )
    );
    setText(
      root,
      "store-open",
      model.counts.open
    );
    setText(
      root,
      "store-satisfaction",
      model.averageSatisfaction +
      "%"
    );
    setText(
      root,
      "store-heading-count",
      "(" +
      model.counts.all +
      ")"
    );
    setText(
      root,
      "store-overview",
      model.displayMode ===
        "empty"
        ? "当前暂无门店"
        : model.displayMode ===
            "single"
          ? "当前仅有 1 家门店，直接展示完整经营信息"
          : (
              "营业 " +
              model.counts.open +
              " · 筹备 " +
              model.counts.preparing +
              " · 异常 " +
              model.counts.abnormal
            )
    );
    setText(
      root,
      "store-task-count",
      model.tasks.length +
      "项"
    );

    for (
      const button
      of root.querySelectorAll(
        "[data-store-filter]"
      )
    ) {
      const id =
        button.dataset.storeFilter;

      setText(
        root,
        "store-filter-" + id,
        model.counts[id] ?? 0
      );

      button.classList.toggle(
        "is-active",
        id === activeFilter
      );

      button.disabled =
        model.displayMode !==
        "multi";
    }

    const hasStores =
      model.stores.length > 0;

    empty?.classList.toggle(
      "is-hidden",
      hasStores
    );

    renderStores(model);
    renderTasks(model);

    for (
      const button
      of root.querySelectorAll(
        ".ui-v2-store-frame__action[data-store-action]"
      )
    ) {
      const action =
        button.dataset.storeAction;

      button.disabled =
        !hasStores &&
        action !==
          "opening";
    }
  };

  const scheduled =
    scheduleRefresh(refresh);

  const filterHandlers = [];

  for (
    const button
    of root.querySelectorAll(
      "[data-store-filter]"
    )
  ) {
    const handler = () => {
      if (
        latestModel?.displayMode !==
        "multi"
      ) {
        return;
      }

      activeFilter =
        button.dataset.storeFilter ??
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

  const actionHandlers = [];

  for (
    const button
    of root.querySelectorAll(
      "[data-store-action]"
    )
  ) {
    const handler = () => {
      const action =
        button.dataset.storeAction;

      if (
        action === "go-city" ||
        (
          action === "opening" &&
          !latestModel?.stores.length
        )
      ) {
        navigate?.("city");
        return;
      }

      app.core.eventBus.emit(
        "ui:storeAction",
        {
          action,
          storeCount:
            latestModel?.stores.length ?? 0,
          displayMode:
            latestModel?.displayMode ?? "empty"
        }
      );
    };

    actionHandlers.push([
      button,
      handler
    ]);

    button.addEventListener(
      "click",
      handler
    );
  }

  const openDialog = (
    title,
    items
  ) => {
    if (!dialog) {
      return;
    }

    const titleElement =
      dialog.querySelector(
        "[data-store-dialog-title]"
      );

    const listElement =
      dialog.querySelector(
        "[data-store-dialog-list]"
      );

    if (titleElement) {
      titleElement.textContent =
        title;
    }

    if (listElement) {
      listElement.innerHTML =
        (
          items.length
            ? items
            : [{title:"暂无数据",body:""}]
        )
          .map(
            item =>
              '<article><h3>' +
                escapeMarkup(item.title) +
              '</h3>' +
              (
                item.body
                  ? '<p>' +
                    escapeMarkup(item.body) +
                    '</p>'
                  : ''
              ) +
              '</article>'
          )
          .join("");
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

  const openQuickPanel =
    kind => {
      const model =
        latestModel ??
        buildStoreModel(app);

      if (
        kind === "scope" ||
        kind === "store"
      ) {
        openDialog(
          "旗下门店",
          model.stores.map(
            store => ({
              title: store.name,
              body:
                store.statusLabel +
                " · " +
                store.district
            })
          )
        );
        return;
      }

      if (
        kind === "money"
      ) {
        openDialog(
          "今日经营",
          [
            {
              title:
                "今日营业额 " +
                formatCompactMoney(
                  model.totalRevenue
                ),
              body:
                "今日利润 " +
                formatCompactMoney(
                  model.totalProfit
                )
            }
          ]
        );
        return;
      }

      openDialog(
        kind === "operations"
          ? "经营"
          : kind === "employees"
            ? "员工"
            : "更多",
        [
          {
            title:
              "该一级页面将在后续接入",
            body:
              "当前门店页与城市页已使用正式页面切换。"
          }
        ]
      );
    };

  const dialogCloseButton =
    dialog?.querySelector(
      "[data-store-dialog-close]"
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

  dialogCloseButton
    ?.addEventListener(
      "click",
      closeDialog
    );

  const unsubscribers = [
    app.core.eventBus.on(
      "state:changed",
      scheduled
    ),
    app.core.eventBus.on(
      "state:replaced",
      scheduled
    ),
    app.core.eventBus.on(
      "state:reset",
      scheduled
    )
  ];

  refresh();

  return Object.freeze({
    refresh,
    openQuickPanel,

    destroy() {
      for (
        const [button,handler]
        of filterHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      for (
        const [button,handler]
        of actionHandlers
      ) {
        button.removeEventListener(
          "click",
          handler
        );
      }

      dialogCloseButton
        ?.removeEventListener(
          "click",
          closeDialog
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
  districtMatchesFilter,
  resolveDistrictSelectionForFilter,
  bindGlobalHudLive,
  bindGlobalNavLive,
  bindCityFrameLive,
  bindStoreFrameLive
};
