import {
  app
} from "../../src/main.js";

import {
  buildHomeDashboardModel
} from "../../src/ui/HomeDashboardModel.js";

import {
  ensureUiPlaytestSeed
} from "./DemoSeed.js";

import {
  createDevToolkit
} from "./DevToolkit.js";

import homeLayout from "./layout/home.layout.json";

import {
  renderActionGrid,
  renderListCardRows,
  renderSegmentTabs
} from "./UiPrimitives.js";

ensureUiPlaytestSeed(app);

const root =
  document.querySelector("#app");

const sheetRoot =
  document.querySelector("#sheet-root");

let activePage = "store";
const NAV_ITEMS = [
  ["store", "门店", "⌂"],
  ["business", "经营", "▦"],
  ["research", "研发", "✦"],
  ["staff", "员工", "♟"],
  ["more", "更多", "•••"]
];

// Development-only switch. Set to false for production releases.
const DEV_MODE = true;

const devToolkit = DEV_MODE
  ? createDevToolkit({
      app,
      root,
      sheetRoot,
      allowedPages: NAV_ITEMS.map(([id]) => id),
      getActivePage: () => activePage
    })
  : null;

function homeLayoutStyle() {
  const sections =
    homeLayout.sections;

  return [
    `--home-hero-min:${sections.hero.minPx}px`,
    `--home-hero-vh:${sections.hero.tallVh}dvh`,
    `--home-hero-max:${sections.hero.maxPx}px`,
    `--home-opportunity-min:${sections.opportunity.minPx}px`,
    `--home-opportunity-vh:${sections.opportunity.tallVh}dvh`,
    `--home-opportunity-max:${sections.opportunity.maxPx}px`,
    `--home-upper-min:${sections.upperPanels.minPx}px`,
    `--home-upper-vh:${sections.upperPanels.tallVh}dvh`,
    `--home-upper-max:${sections.upperPanels.maxPx}px`,
    `--home-lower-min:${sections.lowerPanels.minPx}px`,
    `--home-lower-vh:${sections.lowerPanels.tallVh}dvh`,
    `--home-lower-max:${sections.lowerPanels.maxPx}px`,
    `--home-section-gap:${sections.gapPx}px`
  ].join(";");
}

function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value) || 0
    ).toLocaleString("zh-CN")
  );
}

function signedPercent(value) {
  const number =
    Math.round(
      Number(value) || 0
    );

  return (
    number > 0
      ? `+${number}%`
      : number < 0
        ? `${number}%`
        : "0%"
  );
}

function trendTone(value) {
  const number =
    Number(value) || 0;

  return number > 0
    ? "positive"
    : number < 0
      ? "negative"
      : "neutral";
}

function signalTone(value, inverse = false) {
  const number =
    Number(value) || 0;

  if (inverse) {
    return number >= 75
      ? "hot"
      : number >= 55
        ? "medium"
        : "good";
  }

  return number >= 75
    ? "hot"
    : number >= 55
      ? "medium"
      : "low";
}

function navMarkup() {
  return `
    <nav
      class="bottom-nav"
      data-layout-key="bottom-nav"
    >
      ${NAV_ITEMS.map(
        ([id, label, icon]) => `
          <button
            class="nav-item ${activePage === id ? "is-active" : ""}"
            data-nav="${id}"
            type="button"
          >
            <span class="nav-icon">${icon}</span>
            <span>${label}</span>
          </button>
        `
      ).join("")}
    </nav>
  `;
}

function sceneMarkup(model) {
  return `
    <section
      class="home-hero-shell"
      data-ui-component="home-hero-scene"
      data-layout-key="hero"
      aria-label="门店主页静态主视觉"
    >
      <img
        class="hero-artwork"
        src="assets/home/restaurant-hero.jpg"
        alt=""
        aria-hidden="true"
        decoding="async"
      />

      <header
        class="home-hud home-hud-overlay"
        data-ui-component="home-top-hud"
        data-layout-key="top-hud"
      >
        <div class="hud-card hud-day">
          <span class="hud-icon">☀</span>
          <div>
            <strong>第${model.time.day}天</strong>
            <small>经营日</small>
          </div>
        </div>

        <div class="hud-card hud-clock">
          <span class="hud-icon">◷</span>
          <div>
            <strong data-bind="clock">${model.time.clock}</strong>
            <small>${model.restaurant.status === "open" ? "● 营业中" : "已打烊"}</small>
          </div>
        </div>

        <div class="hud-card hud-money">
          <span class="hud-icon">¥</span>
          <div>
            <small>资金</small>
            <strong data-bind="balance">${money(model.money.balance)}</strong>
          </div>
        </div>

        <div class="hud-card hud-rating">
          <span class="hud-icon">★</span>
          <div>
            <small>星级评价</small>
            <strong>${model.restaurant.reviewScore.toFixed(1)}分</strong>
          </div>
        </div>

        <div class="hud-card hud-level">
          <span class="hud-icon">♛</span>
          <div>
            <small>Lv.${model.restaurant.level}</small>
            <strong>${model.restaurant.title}</strong>
          </div>
        </div>

        <button
          class="hud-settings"
          type="button"
          data-nav="more"
          aria-label="设置"
        >⚙</button>
      </header>

      <section
        class="home-metric-grid home-metric-overlay"
        data-ui-component="home-metrics"
        data-layout-key="kpi-grid"
      >
        <article class="home-metric-card revenue">
          <header>
            <span class="metric-symbol">¥</span>
            <small>今日营业额</small>
          </header>
          <strong data-bind="todayRevenue">${money(model.money.todayRevenue)}</strong>
          <span class="metric-trend ${trendTone(model.money.revenueTrend)}">
            ${model.money.revenueTrend >= 0 ? "↑" : "↓"} ${signedPercent(model.money.revenueTrend)}
          </span>
        </article>

        <article class="home-metric-card profit">
          <header>
            <span class="metric-symbol">▮</span>
            <small>今日利润</small>
          </header>
          <strong
            class="${model.money.todayProfit >= 0 ? "positive" : "negative"}"
            data-bind="todayProfit"
          >${money(model.money.todayProfit)}</strong>
          <span class="metric-trend ${trendTone(model.money.profitTrend)}">
            ${model.money.profitTrend >= 0 ? "↑" : "↓"} ${signedPercent(model.money.profitTrend)}
          </span>
        </article>

        <article class="home-metric-card satisfaction">
          <header>
            <span class="metric-symbol">☺</span>
            <small>满意度</small>
          </header>
          <strong>${Math.round(model.restaurant.satisfaction)}%</strong>
          <span class="metric-trend ${model.restaurant.satisfaction >= 80 ? "positive" : "neutral"}">
            ${model.restaurant.satisfaction >= 80 ? "口碑良好" : "继续提升"}
          </span>
        </article>

        <article class="home-metric-card staff">
          <header>
            <span class="metric-symbol">人</span>
            <small>在岗员工</small>
          </header>
          <strong>${model.operations.employees}</strong>
          <span class="metric-trend neutral">
            ${model.operations.employees >= 2 ? "工作正常" : "人手不足"} ›
          </span>
        </article>
      </section>
    </section>
  `;
}

function renderStore() {
  const model =
    buildHomeDashboardModel(
      app
    );

  if (model.empty) {
    return `
      <section class="empty-view">
        <h1>还没有门店</h1>
        <p>单店成长模式需要先创建第一家门店。</p>
      </section>
    `;
  }

  const progressPercent =
    Math.round(
      model.progress.progress *
      100
    );

  const district =
    model.district;

  const districtName =
    district?.name ??
    "暂未选址";

  const opportunityTags =
    model.opportunity.tags ??
    (
      district
        ? [
            district.name,
            `客流 ${district.trafficIndex}`,
            `外卖 ${district.deliveryDemand}`,
            district.mainCustomer
          ]
        : [
            "选址后显示商圈情报"
          ]
    );

  const districtSignals =
    district
      ? [
          {
            icon: "♨",
            label: "本区热度",
            value:
              district.trafficIndex >= 75
                ? "较高 ↑"
                : district.trafficIndex >= 55
                  ? "中等"
                  : "偏低",
            tone:
              signalTone(
                district.trafficIndex
              )
          },
          {
            icon: "●●",
            label: "主力客群",
            value:
              district.mainCustomer,
            tone: "blue"
          },
          {
            icon: "↗",
            label: "外卖热度",
            value:
              district.deliveryDemand >= 75
                ? "上升 ↑"
                : district.deliveryDemand >= 55
                  ? "稳定"
                  : "偏低",
            tone:
              signalTone(
                district.deliveryDemand
              )
          },
          {
            icon: "▮",
            label: "竞争强度",
            value:
              district.competition >= 75
                ? "较高"
                : district.competition >= 55
                  ? "中等"
                  : "较低",
            tone:
              signalTone(
                district.competition,
                true
              )
          }
        ]
      : [
          {
            icon: "♨",
            label: "本区热度",
            value: "--",
            tone: "neutral"
          },
          {
            icon: "●●",
            label: "主力客群",
            value: "--",
            tone: "neutral"
          },
          {
            icon: "↗",
            label: "外卖热度",
            value: "--",
            tone: "neutral"
          },
          {
            icon: "▮",
            label: "竞争强度",
            value: "--",
            tone: "neutral"
          }
        ];

  return `
    <div
      class="page-scroll home-scroll"
      data-home-layout-version="${homeLayout.version}"
      data-home-skin="segmented-static-v1"
      data-home-editor="${homeLayout.editor.mode}"
      style="${homeLayoutStyle()}"
    >
      ${sceneMarkup(model)}

      <section
        class="home-opportunity ${model.opportunity.tone}"
        data-ui-component="home-opportunity"
        data-layout-key="opportunity"
      >
        <header class="opportunity-band">
          <strong><span>⌖</span> 今日机会</strong>
          <em>把握商圈动态，让小店更进一步！</em>
          <button type="button" data-nav="business">查看完整商圈情报 ›</button>
        </header>

        <div class="opportunity-body">
          <div class="opportunity-copy">
            <h2>${model.opportunity.title}</h2>
            <p>${model.opportunity.detail}</p>

            <div class="opportunity-tags">
              ${opportunityTags.map(
                (tag, index) => `
                  <span class="tag-${index + 1}">${tag}</span>
                `
              ).join("")}
            </div>
          </div>

          <div class="opportunity-side">
            <div class="district-miniature">
              <span>${districtName}</span>
              <small>
                ${district
                  ? `机会指数 ${district.opportunityScore}`
                  : "等待正式选址"}
              </small>
            </div>

            <button type="button" data-nav="business">
              去经营
              <span>›</span>
            </button>
          </div>
        </div>
      </section>

      <div
        class="home-dual-grid"
        data-ui-component="home-growth-and-dialogue"
        data-layout-key="upper-panels"
      >
        <section
          class="home-panel growth-panel"
          data-layout-key="growth-panel"
        >
          <header class="home-panel-title">
            <strong><span>▣</span> 门店成长</strong>
            <small>从一家小店，做出一座城市的味道！</small>
          </header>

          <div class="home-panel-body growth-body">
            <div class="growth-stage">
              <div>
                <small>下一阶段</small>
                <h3>${model.progress.nextTitle ?? "已满级"}</h3>
              </div>
              <strong>${progressPercent}%</strong>
            </div>

            <div class="progress-track">
              <i
                data-bind="progress"
                style="width:${progressPercent}%"
              ></i>
            </div>

            <div class="growth-storefront">
              <span>门店升级</span>
              <small>当前 Lv.${model.restaurant.level}</small>
            </div>

            <div class="quick-actions">
              <button type="button" data-open-sheet="renovation">
                <b>◆</b><span>装修</span>
              </button>
              <button type="button" data-nav="staff">
                <b>●</b><span>员工</span>
              </button>
              <button type="button" data-nav="research">
                <b>♨</b><span>研发</span>
              </button>
              <button type="button" data-nav="business">
                <b>▮</b><span>经营</span>
              </button>
            </div>
          </div>
        </section>

        <section
          class="home-panel dialogue-panel"
          data-layout-key="dialogue-panel"
        >
          <header class="home-panel-title">
            <strong><span>●</span> 店内动态</strong>
            <button type="button" data-nav="staff">更多 ›</button>
          </header>

          <div class="home-panel-body dialogue-list">
            ${model.dialogue.slice(0, 2).map(
              item => `
                <article>
                  <div class="avatar">${item.speaker.slice(0,1)}</div>
                  <div class="dialogue-copy">
                    <div>
                      <strong>${item.speaker} <small>${item.role}</small></strong>
                      <time>${item.time}</time>
                    </div>
                    <p>${item.text}</p>
                  </div>
                </article>
              `
            ).join("")}
          </div>
        </section>
      </div>

      <div
        class="home-dual-grid lower-grid"
        data-ui-component="home-district-and-schedule"
        data-layout-key="lower-panels"
      >
        <section
          class="home-panel district-panel"
          data-layout-key="district-panel"
        >
          <header class="home-panel-title">
            <strong><span>⌖</span> 商圈情报</strong>
            <button type="button" data-nav="business">更多 ›</button>
          </header>

          <div class="home-panel-body">
            <div class="district-signal-grid">
              ${districtSignals.map(
                item => `
                  <article class="${item.tone}">
                    <b>${item.icon}</b>
                    <small>${item.label}</small>
                    <strong>${item.value}</strong>
                  </article>
                `
              ).join("")}
            </div>
          </div>
        </section>

        <section
          class="home-panel schedule-panel"
          data-layout-key="schedule-panel"
        >
          <header class="home-panel-title">
            <strong><span>▦</span> 今日日程</strong>
            <button
              type="button"
              data-advance="30"
            >推进 ›</button>
          </header>

          <div class="home-panel-body schedule-list">
            ${model.schedule.slice(0, 4).map(
              item => `
                <div class="${item.status}">
                  <i></i>
                  <time>${item.time}</time>
                  <span>${item.title}</span>
                  <b>
                    ${item.status === "done"
                      ? "已完成"
                      : item.status === "active"
                        ? "进行中"
                        : "未开始"}
                  </b>
                </div>
              `
            ).join("")}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderBusiness() {
  const model =
    buildHomeDashboardModel(
      app
    );

  return `
    <header class="section-header">
      <div>
        <span class="eyebrow">单页聚合</span>
        <h1>经营管理</h1>
      </div>
      <strong>${money(model.money.balance)}</strong>
    </header>

    <div class="page-scroll compact-page">
      ${renderSegmentTabs(
        ["菜单", "采购", "库存", "商圈", "营销"],
        { componentId: "business-tabs" }
      )}

      <section class="feature-card management-hero">
        <span class="eyebrow">经营概况</span>
        <h2>今天不再拆成五六个独立页面</h2>
        <p>菜单、采购、库存、商圈与营销共用这一套管理框架，通过页内标签切换。</p>

        <div class="metric-grid inner">
          <article>
            <span>今日收入</span>
            <strong>${money(model.money.todayRevenue)}</strong>
          </article>
          <article>
            <span>今日支出</span>
            <strong>${money(model.money.todayExpense)}</strong>
          </article>
          <article>
            <span>菜品数</span>
            <strong>${model.operations.activeMenuItems}</strong>
          </article>
          <article>
            <span>累计接待</span>
            <strong>${model.operations.totalServedGuests}</strong>
          </article>
        </div>
      </section>

      ${renderListCardRows(
        [
          { label: "菜单与定价", value: "统一管理 ›" },
          { label: "供应商与采购", value: "统一管理 ›" },
          { label: "库存与损耗", value: "统一管理 ›" },
          { label: "商圈与客流", value: "统一管理 ›" }
        ],
        { componentId: "business-list" }
      )}
    </div>
  `;
}

function renderStaff() {
  const restaurant =
    app.systems
      .restaurantSystem
      .list()[0];

  const employees =
    restaurant
      ? app.systems
          .employeeSystem
          .listByRestaurant(
            restaurant.id
          )
      : [];

  return `
    <header class="section-header">
      <div>
        <span class="eyebrow">统一员工页</span>
        <h1>员工</h1>
      </div>
      <strong>${employees.length} 人</strong>
    </header>

    <div class="page-scroll compact-page">
      ${renderSegmentTabs(
        ["在职", "招聘", "排班", "培训"],
        { componentId: "staff-tabs" }
      )}

      <section class="staff-list">
        ${employees.map(
          item => `
            <article>
              <div class="staff-avatar">${item.name.slice(0,1)}</div>
              <div>
                <strong>${item.name}</strong>
                <span>${item.roleId} · Lv.${item.level}</span>
              </div>
              <div class="staff-mood">
                心情 ${Math.round(item.mood ?? 70)}
              </div>
            </article>
          `
        ).join("")}
      </section>
    </div>
  `;
}

function renderResearch() {
  return `
    <header class="section-header">
      <div>
        <span class="eyebrow">单页研发中心</span>
        <h1>菜品研发</h1>
      </div>
      <strong>研发</strong>
    </header>

    <div class="page-scroll compact-page">
      ${renderSegmentTabs(
        ["研发", "配方", "菜品成长", "菜单策略"],
        { componentId: "research-tabs" }
      )}

      <section class="feature-card research-hero">
        <span class="eyebrow">研发工作台</span>
        <h2>菜品、配方和成长都收在同一页</h2>
        <p>后续正式美术只需要设计这一套研发框架，不再为每个细分功能单独制作页面。</p>
      </section>

      ${renderActionGrid(
        [
          { title: "自研菜品", detail: "从食材与工艺开始研发" },
          { title: "标准配方", detail: "查看与调整现有配方" },
          { title: "菜品升级", detail: "品质、熟练度与招牌化" },
          { title: "菜单策略", detail: "上架、下架与价格组合" }
        ],
        { componentId: "research-actions" }
      )}
    </div>
  `;
}

function renderMore() {
  const model =
    buildHomeDashboardModel(
      app
    );

  return `
    <header class="section-header">
      <div>
        <span class="eyebrow">收纳次级系统</span>
        <h1>更多</h1>
      </div>
    </header>

    <div class="page-scroll compact-page">
      ${renderListCardRows(
        [
          { label: "财务", value: `${money(model.money.balance)} ›` },
          { label: "会员体系", value: "查看 ›" },
          { label: "评价与口碑", value: `★ ${model.restaurant.reviewScore.toFixed(1)} ›` },
          { label: "排行榜与颁奖", value: "查看 ›" },
          { label: "任务与成就", value: "查看 ›" },
          { label: "设置", value: "›" }
        ],
        { componentId: "more-list" }
      )}
    </div>
  `;
}

function pageMarkup() {
  if (activePage === "business") {
    return renderBusiness();
  }

  if (activePage === "research") {
    return renderResearch();
  }

  if (activePage === "staff") {
    return renderStaff();
  }

  if (activePage === "more") {
    return renderMore();
  }

  return renderStore();
}

function render() {
  root.innerHTML = `
    <div class="mobile-shell">
      <section class="page-host">
        ${pageMarkup()}
      </section>
      ${navMarkup()}
    </div>
  `;

  bindEvents();
  devToolkit?.afterRender();
}

function bindEvents() {
  root
    .querySelectorAll("[data-nav]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          activePage =
            button.dataset.nav;
          render();
        }
      );
      button.dataset.devBound = "click";
    });



  root
    .querySelectorAll("[data-advance]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          app.core.timeSystem
            .advance(
              Number(
                button.dataset.advance
              )
            );
          render();
        }
      );
      button.dataset.devBound = "click";
    });

  root
    .querySelectorAll("[data-open-sheet]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          openSheet(
            button.dataset.openSheet
          )
      );
      button.dataset.devBound = "click";
    });
}

function openSheet(type) {
  if (type !== "renovation") {
    return;
  }

  const restaurant =
    app.systems
      .restaurantSystem
      .list()[0];

  const summary =
    restaurant
      ? (() => {
          try {
            return app.systems
              .renovationSystem
              .getSummary(
                restaurant.id
              );
          } catch {
            return null;
          }
        })()
      : null;

  sheetRoot.innerHTML = `
    <div class="sheet-backdrop" data-close-sheet></div>
    <section class="bottom-sheet">
      <div class="sheet-handle"></div>
      <header>
        <div>
          <span class="eyebrow">直接覆盖主页场景</span>
          <h2>装修管理</h2>
        </div>
        <button type="button" data-close-sheet>×</button>
      </header>

      <div class="segment-tabs renovation-tabs">
        <button class="is-active">布局</button>
        <button>桌椅</button>
        <button>厨房</button>
        <button>装饰</button>
      </div>

      <div class="renovation-preview">
        <div class="mini-floor">
          <span></span><span></span><span></span><span></span>
          <i></i><i></i>
        </div>
        <div>
          <strong>当前装修状态</strong>
          <p>
            ${summary
              ? "已连接 RenovationSystem，正式家具数据后续直接映射到这里。"
              : "当前还没有激活装修布局，可在开店流程完成后初始化。"}
          </p>
        </div>
      </div>

      <div class="sheet-actions">
        <button data-close-sheet type="button">返回门店</button>
        <button class="primary" type="button">进入装修配置</button>
      </div>
    </section>
  `;

  sheetRoot
    .querySelectorAll(
      "[data-close-sheet]"
    )
    .forEach(node => {
      node.addEventListener(
        "click",
        () => {
          sheetRoot.innerHTML = "";
          devToolkit?.afterRender();
        }
      );
      node.dataset.devBound = "click";
    });

  devToolkit?.afterRender();
}

const clockTimer =
  setInterval(
    () => {
      try {
        if (
          activePage === "store"
        ) {
          const model =
            buildHomeDashboardModel(
              app
            );

          const clock =
            root.querySelector(
              '[data-bind="clock"]'
            );

          if (clock) {
            clock.textContent =
              model.time.clock;
          }
        }
      } catch (error) {
        app.systems
          .feedbackSystem
          .captureRuntimeError(
            error,
            "mobile-ui-clock"
          );

        clearInterval(
          clockTimer
        );
      }
    },
    1000
  );

render();
