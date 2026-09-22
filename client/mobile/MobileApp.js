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
let running = true;
let speed = 1;

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

function navMarkup() {
  return `
    <nav class="bottom-nav">
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
  const scene =
    model.microScene;

  return `
    <section
      class="micro-scene mood-${scene.mood}"
      data-scene
      aria-label="门店微动态场景"
    >
      <div class="scene-light scene-light-a"></div>
      <div class="scene-light scene-light-b"></div>
      <div class="scene-back-wall">
        <div class="scene-sign">
          <strong>${model.restaurant.name}</strong>
          <small>一餐一味 · 认真经营</small>
        </div>
      </div>

      <div class="scene-kitchen">
        <div class="stove">
          <span class="flame"></span>
          <span class="steam steam-a"></span>
          <span class="steam steam-b"></span>
        </div>

        <div class="character chef ${scene.chefActive ? "is-active" : "is-off"}">
          <span class="head"></span>
          <span class="hat"></span>
          <span class="body"></span>
          <span class="arm"></span>
        </div>
      </div>

      <div class="scene-floor">
        <div class="table table-left">
          <span class="plate"></span>
          <span class="plate plate-b"></span>
        </div>

        <div class="table table-right">
          <span class="plate"></span>
          <span class="cup"></span>
        </div>

        <div class="character guest guest-a">
          <span class="head"></span>
          <span class="body"></span>
        </div>

        <div class="character guest guest-b">
          <span class="head"></span>
          <span class="body"></span>
        </div>

        <div class="character server ${scene.serverActive ? "is-active" : "is-off"}">
          <span class="head"></span>
          <span class="body"></span>
          <span class="tray"></span>
        </div>

        <div class="scene-plant"></div>
        <div class="scene-window"></div>
      </div>

      <div class="scene-overlay">
        <span class="scene-state">
          <i></i>
          ${model.restaurant.status === "open" ? "营业中" : "已打烊"}
        </span>

        <button
          type="button"
          class="scene-action"
          data-open-sheet="renovation"
        >
          装修管理
        </button>
      </div>
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

  return `
    <header class="topbar">
      <div class="time-block">
        <strong>第 ${model.time.day} 天</strong>
        <span data-bind="clock">${model.time.clock}</span>
      </div>

      <div class="top-resource">
        <small>资金</small>
        <strong data-bind="balance">${money(model.money.balance)}</strong>
      </div>

      <div class="top-resource">
        <small>口碑</small>
        <strong>${Math.round(model.restaurant.reputation)}</strong>
      </div>

      <button
        class="icon-button"
        type="button"
        data-nav="more"
        aria-label="设置"
      >⚙</button>
    </header>

    <div class="page-scroll">
      <section class="store-heading">
        <div>
          <span class="eyebrow">Lv.${model.restaurant.level} · ${model.restaurant.title}</span>
          <h1>${model.restaurant.name}</h1>
        </div>

        <div class="review-chip">
          ★ ${model.restaurant.reviewScore.toFixed(1)}
        </div>
      </section>

      ${sceneMarkup(model)}

      <section class="speed-bar">
        <button
          class="${running ? "" : "is-active"}"
          data-run="toggle"
          type="button"
        >
          ${running ? "暂停" : "继续"}
        </button>

        ${[1,2,4].map(
          value => `
            <button
              class="${speed === value ? "is-active" : ""}"
              data-speed="${value}"
              type="button"
            >
              ${value}×
            </button>
          `
        ).join("")}
      </section>

      <section class="metric-grid">
        <article>
          <span>今日营业额</span>
          <strong data-bind="todayRevenue">${money(model.money.todayRevenue)}</strong>
        </article>

        <article>
          <span>今日利润</span>
          <strong
            class="${model.money.todayProfit >= 0 ? "positive" : "negative"}"
            data-bind="todayProfit"
          >${money(model.money.todayProfit)}</strong>
        </article>

        <article>
          <span>满意度</span>
          <strong>${Math.round(model.restaurant.satisfaction)}%</strong>
        </article>

        <article>
          <span>在岗员工</span>
          <strong>${model.operations.employees}</strong>
        </article>
      </section>

      <section class="feature-card opportunity ${model.opportunity.tone}">
        <div>
          <span class="eyebrow">动态经营目标</span>
          <h2>${model.opportunity.title}</h2>
          <p>${model.opportunity.detail}</p>
        </div>
        <button
          type="button"
          data-nav="business"
        >${model.opportunity.action}</button>
      </section>

      <section class="feature-card progress-card">
        <div class="section-title-row">
          <div>
            <span class="eyebrow">门店成长</span>
            <h2>下一阶段：${model.progress.nextTitle ?? "已满级"}</h2>
          </div>
          <strong>${progressPercent}%</strong>
        </div>

        <div class="progress-track">
          <i
            data-bind="progress"
            style="width:${progressPercent}%"
          ></i>
        </div>

        <div class="quick-actions">
          <button type="button" data-open-sheet="renovation">装修</button>
          <button type="button" data-nav="staff">员工</button>
          <button type="button" data-nav="research">研发</button>
          <button type="button" data-nav="business">经营</button>
        </div>
      </section>

      <section class="feature-card dialogue-card">
        <div class="section-title-row">
          <div>
            <span class="eyebrow">少量场景反馈</span>
            <h2>店里正在发生</h2>
          </div>
        </div>

        <div class="dialogue-list">
          ${model.dialogue.map(
            item => `
              <article>
                <div class="avatar">${item.speaker.slice(0,1)}</div>
                <div>
                  <strong>${item.speaker} <small>${item.role}</small></strong>
                  <p>${item.text}</p>
                </div>
              </article>
            `
          ).join("")}
        </div>
      </section>

      <section class="feature-card schedule-card">
        <div class="section-title-row">
          <div>
            <span class="eyebrow">推进日程</span>
            <h2>今日日程</h2>
          </div>
          <button
            type="button"
            class="text-button"
            data-advance="30"
          >推进30分钟</button>
        </div>

        <div class="schedule-list">
          ${model.schedule.map(
            item => `
              <div class="${item.done ? "done" : ""}">
                <time>${item.time}</time>
                <span>${item.title}</span>
                <i></i>
              </div>
            `
          ).join("")}
        </div>
      </section>
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
    .querySelectorAll("[data-speed]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          speed =
            Number(
              button.dataset.speed
            );

          app.systems
            .feedbackSystem
            ?.captureRuntimeError;

          render();
        }
      );
      button.dataset.devBound = "click";
    });

  root
    .querySelectorAll("[data-run]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          running = !running;
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

setInterval(
  () => {
    if (!running) {
      return;
    }

    try {
      app.core.timeSystem
        .advance(
          10 * speed
        );

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

      running = false;
    }
  },
  1200
);

render();
