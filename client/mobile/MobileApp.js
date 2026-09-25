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

function satisfactionLabel(value) {
  const number =
    Number(value) || 0;

  if (number >= 85) {
    return "口碑很好";
  }

  if (number >= 70) {
    return "状态稳定";
  }

  return "有待提升";
}

function staffStatusLabel(value) {
  const number =
    Number(value) || 0;

  if (number >= 4) {
    return "工作正常";
  }

  if (number >= 2) {
    return "人手偏紧";
  }

  return "急需补员";
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

function renderStore() {
  const model =
    buildHomeDashboardModel(
      app
    );

  if (model.empty) {
    return `
      <section class="home-master-page">
        <picture class="home-master-picture" aria-hidden="true">
          <source
            media="(max-aspect-ratio: 1/2)"
            srcset="assets/home/home-master-20x9.webp"
          />
          <img
            class="home-master-artwork"
            src="assets/home/home-master.webp"
            alt=""
            decoding="async"
          />
        </picture>
      </section>
    `;
  }

  return `
    <section
      class="home-master-page"
      data-ui-component="home-master"
      data-home-master-version="8"
      aria-label="门店首页静态母版"
    >
      <picture class="home-master-picture" aria-hidden="true">
        <source
          media="(max-aspect-ratio: 1/2)"
          srcset="assets/home/home-master-20x9.webp"
        />
        <img
          class="home-master-artwork"
          src="assets/home/home-master.webp"
          alt=""
          decoding="async"
        />
      </picture>

      <div class="home-live-overlay" aria-label="首页实时经营数据">
        <div class="live-hud live-day">
          <strong>第${model.time.day}天</strong>
          <span>经营日</span>
        </div>

        <div class="live-hud live-clock">
          <strong data-bind="clock">${model.time.clock}</strong>
          <span>营业中</span>
        </div>

        <div class="live-hud live-money">
          <span>资金</span>
          <strong>${money(model.money.balance)}</strong>
        </div>

        <div class="live-hud live-rating">
          <span>星级评价</span>
          <strong>${model.restaurant.reviewScore.toFixed(1)}分</strong>
        </div>

        <div class="live-hud live-level">
          <strong>Lv.${model.restaurant.level}</strong>
          <span>${model.restaurant.title}</span>
        </div>

        <div class="live-kpi-grid">
          <article class="live-kpi">
            <span>今日营业额</span>
            <strong>${money(model.money.todayRevenue)}</strong>
            <em class="${trendTone(model.money.revenueTrend)}">
              ${model.money.revenueTrend >= 0 ? "↑" : "↓"}
              ${signedPercent(model.money.revenueTrend)}
            </em>
          </article>

          <article class="live-kpi">
            <span>今日利润</span>
            <strong>${money(model.money.todayProfit)}</strong>
            <em class="${trendTone(model.money.profitTrend)}">
              ${model.money.profitTrend >= 0 ? "↑" : "↓"}
              ${signedPercent(model.money.profitTrend)}
            </em>
          </article>

          <article class="live-kpi">
            <span>满意度</span>
            <strong>${Math.round(model.restaurant.satisfaction)}%</strong>
            <em>${satisfactionLabel(model.restaurant.satisfaction)}</em>
          </article>

          <article class="live-kpi">
            <span>在岗员工</span>
            <strong>${model.operations.employees}</strong>
            <em>${staffStatusLabel(model.operations.employees)}</em>
          </article>
        </div>

        <section class="live-opportunity">
          <strong>${model.opportunity.title}</strong>
          <p>${model.opportunity.detail}</p>
          <div class="live-opportunity-tags">
            ${(model.opportunity.tags ?? []).slice(0,4).map(tag => `
              <span>${tag}</span>
            `).join("")}
          </div>
        </section>

        <section class="live-growth">
          <span>下一阶段</span>
          <strong>
            ${model.progress.maxLevel
              ? model.progress.title
              : model.progress.nextTitle}
          </strong>
          <b>
            ${model.progress.maxLevel
              ? "MAX"
              : Math.round(model.progress.progress * 100) + "%"}
          </b>
          <i>
            <u style="width:${model.progress.maxLevel ? 100 : Math.round(model.progress.progress * 100)}%"></u>
          </i>
        </section>

        <section class="live-dialogue">
          ${model.dialogue.slice(0,3).map(item => `
            <article>
              <span class="live-dialogue-avatar">
                ${item.speaker.slice(0,1)}
              </span>
              <div>
                <header>
                  <strong>${item.speaker}</strong>
                  <em>${item.role}</em>
                  <time>${item.time}</time>
                </header>
                <p>${item.text}</p>
              </div>
            </article>
          `).join("")}
        </section>

        <section class="live-district">
          <div>
            <strong>${model.district ? model.district.trafficIndex : "--"}</strong>
          </div>
          <div>
            <strong>${model.district ? model.district.mainCustomer : "--"}</strong>
          </div>
          <div>
            <strong>${model.district ? model.district.deliveryDemand : "--"}</strong>
          </div>
          <div>
            <strong>${model.district ? model.district.competition : "--"}</strong>
          </div>
        </section>

        <section class="live-schedule">
          ${model.schedule.slice(0,4).map(item => `
            <article class="${item.status}">
              <i></i>
              <time>${item.time}</time>
              <span>${item.title}</span>
              <strong>
                ${item.status === "done"
                  ? "已完成"
                  : item.status === "active"
                    ? "进行中"
                    : "未开始"}
              </strong>
            </article>
          `).join("")}
        </section>
      </div>

      <div class="home-master-hotspots" aria-label="首页交互热区">
        <button class="home-hotspot hotspot-settings" type="button" data-nav="more" aria-label="设置"></button>

        <button class="home-hotspot hotspot-opportunity-more" type="button" data-nav="business" aria-label="查看完整商圈情报"></button>
        <button class="home-hotspot hotspot-opportunity-enter" type="button" data-nav="business" aria-label="去经营"></button>

        <button class="home-hotspot hotspot-renovation" type="button" data-open-sheet="renovation" aria-label="装修"></button>
        <button class="home-hotspot hotspot-staff-shortcut" type="button" data-nav="staff" aria-label="员工"></button>
        <button class="home-hotspot hotspot-research-shortcut" type="button" data-nav="research" aria-label="研发"></button>
        <button class="home-hotspot hotspot-business-shortcut" type="button" data-nav="business" aria-label="经营"></button>

        <button class="home-hotspot hotspot-dialogue-more" type="button" data-nav="staff" aria-label="店内动态更多"></button>
        <button class="home-hotspot hotspot-district-more" type="button" data-nav="business" aria-label="商圈情报更多"></button>
        <button class="home-hotspot hotspot-schedule-advance" type="button" data-advance="30" aria-label="推进日程"></button>

        <button class="home-hotspot hotspot-nav-store" type="button" data-nav="store" aria-label="门店"></button>
        <button class="home-hotspot hotspot-nav-business" type="button" data-nav="business" aria-label="经营"></button>
        <button class="home-hotspot hotspot-nav-research" type="button" data-nav="research" aria-label="研发"></button>
        <button class="home-hotspot hotspot-nav-staff" type="button" data-nav="staff" aria-label="员工"></button>
        <button class="home-hotspot hotspot-nav-more" type="button" data-nav="more" aria-label="更多"></button>
      </div>
    </section>
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
    <div class="mobile-shell ${activePage === "store" ? "store-master-shell" : ""}">
      <section class="page-host">
        ${pageMarkup()}
      </section>
      ${activePage === "store" ? "" : navMarkup()}
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
