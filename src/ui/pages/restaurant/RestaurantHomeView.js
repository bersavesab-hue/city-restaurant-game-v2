import { restaurantHomePageSystem } from "./RestaurantHomePageSystem.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN")}`;
}

function metricValue(metric) {
  if (metric.format === "money") {
    return formatMoney(metric.value);
  }
  if (metric.format === "percent") {
    return `${metric.value}%`;
  }
  if (metric.format === "score") {
    return `${metric.value} / 5`;
  }
  return Number(metric.value ?? 0).toLocaleString("zh-CN");
}

class RestaurantHomeView {
  constructor({
    root,
    restaurantId,
    pageSystem = restaurantHomePageSystem,
    onNavigate = null,
    onRename = null
  }) {
    if (!root) {
      throw new Error("Restaurant home view requires a root element");
    }

    this.root = root;
    this.restaurantId = restaurantId;
    this.pageSystem = pageSystem;
    this.onNavigate = onNavigate;
    this.onRename = onRename;
    this.page = null;
    this.boundClick = event => this.handleClick(event);
  }

  mount() {
    this.page = this.pageSystem.getPage(this.restaurantId);
    this.root.addEventListener("click", this.boundClick);
    this.render();
    return this;
  }

  destroy() {
    this.root.removeEventListener("click", this.boundClick);
    this.root.innerHTML = "";
  }

  refresh(page = null) {
    this.page = page ?? this.pageSystem.getPage(this.restaurantId);
    this.render();
    return this.page;
  }

  render() {
    const page = this.page;
    if (!page) {
      return;
    }

    const notice = page.noticeTicker.current;
    const statusText = page.restaurant.status === "open"
      ? "营业中"
      : page.restaurant.status === "paused"
        ? "暂停营业"
        : "已闭店";

    this.root.innerHTML = `
      <main class="restaurant-home-page">
        <header class="restaurant-home-topbar">
          <button type="button" class="restaurant-home-name" data-action="rename">
            <span class="restaurant-home-name-main">${escapeHtml(page.topBar.restaurantName)}</span>
            <span class="restaurant-home-name-sub">Lv.${page.topBar.storeLevel} · ${escapeHtml(statusText)}</span>
          </button>
          <div class="restaurant-home-money">${formatMoney(page.topBar.balance)}</div>
          <div class="restaurant-home-clock">
            <span>${escapeHtml(page.topBar.clock.dateText)}</span>
            <strong>${escapeHtml(page.topBar.clock.clockText)}</strong>
          </div>
          <div class="restaurant-home-speed">
            <button type="button" data-action="pause">${page.topBar.clock.paused ? "▶" : "Ⅱ"}</button>
            ${page.actions.speeds.map(speed => `
              <button
                type="button"
                data-action="speed"
                data-speed="${speed}"
                class="${!page.topBar.clock.paused && page.topBar.clock.speed === speed ? "is-active" : ""}"
              >${speed}×</button>
            `).join("")}
          </div>
        </header>

        <button type="button" class="restaurant-home-notice" data-action="notice" ${notice?.action ? `data-page-id="${escapeHtml(notice.action)}"` : ""}>
          <span class="restaurant-home-notice-icon">通报</span>
          <span class="restaurant-home-notice-text">${notice ? escapeHtml(notice.message) : "暂无经营通报"}</span>
          <span class="restaurant-home-notice-count">${page.noticeTicker.unreadCount}</span>
        </button>

        <section class="restaurant-home-scene">
          <div class="restaurant-home-scene-bg">
            <div class="restaurant-home-signboard">
              <strong>${escapeHtml(page.restaurant.name)}</strong>
              <span>${escapeHtml(page.scene.propertyName)}</span>
            </div>
            <div class="restaurant-home-scene-floor">
              <div class="restaurant-home-scene-zone is-kitchen">厨房</div>
              <div class="restaurant-home-scene-zone is-dining">就餐区</div>
              <div class="restaurant-home-scene-zone is-service">前厅</div>
            </div>
          </div>

          <div class="restaurant-home-scene-status">
            <span>${page.scene.area ? `${page.scene.area}㎡` : "未租房"}</span>
            <span>${page.scene.seats} 座</span>
            <span>${page.scene.renovationActive ? `装修 ${page.scene.renovationGrade ?? "-"} ${page.scene.renovationScore ?? "-"}` : "装修未启用"}</span>
          </div>

          <button
            type="button"
            class="restaurant-home-business-toggle ${page.restaurant.status === "open" ? "is-open" : ""}"
            data-action="business"
            ${page.actions.canOpen || page.actions.canClose ? "" : "disabled"}
          >${page.restaurant.status === "closed" ? "开始营业" : "结束营业"}</button>
        </section>

        <section class="restaurant-home-metrics">
          ${page.keyMetrics.map(metric => `
            <article class="restaurant-home-metric">
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metricValue(metric))}</strong>
            </article>
          `).join("")}
        </section>

        <section class="restaurant-home-health">
          <article>
            <span>员工</span>
            <strong>${page.employees.active}/${page.employees.total}</strong>
            <small>平均心情 ${page.employees.averageMood}</small>
          </article>
          <article>
            <span>库存</span>
            <strong>${page.inventory.ingredientKinds} 种</strong>
            <small>${page.inventory.lowFreshnessBatches + page.inventory.spoiledBatches} 项需关注</small>
          </article>
          <article>
            <span>今日出品</span>
            <strong>${page.today.averageQuality || "-"}</strong>
            <small>订单 ${page.today.orders}</small>
          </article>
        </section>

        <section class="restaurant-home-actions">
          ${page.quickActions.map(action => `
            <button
              type="button"
              data-action="navigate"
              data-page-id="${escapeHtml(action.pageId)}"
              ${action.enabled ? "" : "disabled"}
            >
              <span>${escapeHtml(action.label)}</span>
              <small>${action.enabled ? "进入" : "未解锁"}</small>
            </button>
          `).join("")}
        </section>

        <nav class="restaurant-home-bottom-nav">
          ${page.navigation.map(item => `
            <button
              type="button"
              data-action="navigate"
              data-page-id="${escapeHtml(item.id)}"
              class="${item.active ? "is-active" : ""}"
            >${escapeHtml(item.title)}</button>
          `).join("")}
        </nav>
      </main>
    `;
  }

  handleClick(event) {
    const target = event.target.closest?.("[data-action]");
    if (!target || !this.root.contains(target)) {
      return;
    }

    const action = target.dataset.action;

    if (action === "navigate" || action === "notice") {
      const pageId = target.dataset.pageId;
      if (pageId && typeof this.onNavigate === "function") {
        this.onNavigate(pageId, this.restaurantId);
      }
      return;
    }

    if (action === "rename") {
      if (typeof this.onRename === "function") {
        this.onRename(this.page.restaurant.name, nextName => {
          if (nextName) {
            this.refresh(this.pageSystem.rename(this.restaurantId, nextName));
          }
        });
      }
      return;
    }

    if (action === "pause") {
      this.refresh(
        this.page.topBar.clock.paused
          ? this.pageSystem.resumeTime(this.restaurantId)
          : this.pageSystem.pauseTime(this.restaurantId)
      );
      return;
    }

    if (action === "speed") {
      this.refresh(
        this.pageSystem.setSpeed(
          this.restaurantId,
          Number(target.dataset.speed)
        )
      );
      return;
    }

    if (action === "business") {
      this.refresh(this.pageSystem.toggleBusiness(this.restaurantId));
    }
  }
}

export const restaurantHomeView = {
  mount(options) {
    return new RestaurantHomeView(options).mount();
  }
};

export { RestaurantHomeView };
