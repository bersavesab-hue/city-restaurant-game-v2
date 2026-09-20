import { cityMapDashboardSystem } from "./CityMapDashboardSystem.js";
import { renderGameTopBar, renderNoticeTicker, renderBottomNavigation } from "../../components/GameChromeView.js";
import { gameChromeSystem } from "../../components/GameChromeSystem.js";

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function money(value) {
  return "¥" + Math.round(Number(value) || 0).toLocaleString("zh-CN");
}

class CityMapView {
  constructor({ root, restaurantId = null, pageSystem = cityMapDashboardSystem, onNavigate = null }) {
    if (!root) throw new Error("CityMapView requires a root element");
    this.root = root;
    this.restaurantId = restaurantId;
    this.pageSystem = pageSystem;
    this.onNavigate = onNavigate;
    this.selectedDistrictId = null;
    this.page = null;
    this.boundClick = event => this.handleClick(event);
  }

  mount() {
    this.refresh();
    this.root.addEventListener("click", this.boundClick);
    return this;
  }

  destroy() {
    this.root.removeEventListener("click", this.boundClick);
    this.root.innerHTML = "";
  }

  refresh() {
    this.page = this.pageSystem.getPage({ restaurantId: this.restaurantId, selectedDistrictId: this.selectedDistrictId });
    this.selectedDistrictId = this.page.map.selectedDistrictId;
    this.render();
    return this.page;
  }

  renderMap(page) {
    return `
      <section class="city-home-hero">
        <div class="city-home-map city-map-panel__canvas">
          <div class="city-map-artwork city-image-slot--map" role="img" aria-label="城市发展地图"></div>
          <div class="city-home-hero-copy">
            <span>城市经营版图</span><h1>城市发展</h1>
            <p>选择商圈、查看房源、分析客流，拓展你的美食版图。</p>
          </div>
          <div class="city-map-pins">
            ${page.map.districts.map(district => `
              <button type="button" class="city-map-pin ${page.map.selectedDistrictId === district.id ? "is-active" : ""}"
                data-action="select-district" data-district-id="${escapeHtml(district.id)}"
                style="left:${district.position.x}%;top:${district.position.y}%">
                <i></i><strong>${escapeHtml(district.name)}</strong>
              </button>
            `).join("")}
          </div>
        </div>
      </section>`;
  }

  renderSummary(page) {
    const summary = page.citySummary;
    const values = [
      ["🔥", "今日商圈热度", summary.averageTraffic, "客流指数"],
      ["⌂", "可租房源", summary.propertyCount, "实时房源"],
      ["▣", "开放商圈", summary.districtCount, "经营区域"],
      ["♟", "平均消费力", summary.averageSpending, "消费指数"]
    ];
    return `<section class="city-home-metrics">${values.map(([icon, label, value, detail]) => `
      <article><b>${icon}</b><div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div></article>
    `).join("")}</section>`;
  }

  renderRecommendation(page) {
    const district = page.selectedDistrict;
    if (!district) return "";
    return `
      <section class="city-home-recommendation">
        <header><strong>城市发展推荐</strong><b>1</b></header>
        <div>
          <span class="city-home-recommendation__badge">${escapeHtml(district.name)}</span>
          <section><strong>推荐在 ${escapeHtml(district.name)} 考察新铺位</strong>
            <p>客流 ${district.trafficIndex} · 消费力 ${district.spendingPower} · 当前可租 ${district.propertyCount} 套</p></section>
          <button type="button" data-action="open-district-properties" data-district-id="${escapeHtml(district.id)}">前往考察 ›</button>
        </div>
      </section>`;
  }

  renderActions(page) {
    const property = page.recommendedProperties[0] ?? null;
    const actions = [
      ["商圈地图", "查看全城商圈分布", "map", "city"],
      ["房源推荐", property ? `${escapeHtml(property.districtName)} · ${money(property.monthlyRent)}/月` : "精选优质铺位", "property", "properties"],
      ["客流分析", "洞察客流趋势变化", "traffic", "analytics"],
      ["周边竞店", "了解附近竞争对手", "competition", "market-strategy"],
      ["城区扩展", `已开放 ${page.citySummary.districtCount} 个商圈`, "expansion", "properties"],
      ["营销活动", "提升区域和品牌知名度", "marketing", "member-marketing"]
    ];
    return `<section class="city-home-actions">${actions.map(([title, subtitle, tone, target]) => `
      <button type="button" data-action="navigate" data-page-id="${target}" data-tone="${tone}">
        <span><strong>${title}</strong><small>${subtitle}</small></span><b>›</b>
      </button>`).join("")}</section>`;
  }

  renderBottomNav() {
    return renderBottomNavigation(gameChromeSystem.getNavigation({ restaurantId: this.restaurantId, activePageId: "city" }));
  }

  renderMarkup(page) {
    return `<main class="rg-screen city-map-game">
      ${renderGameTopBar(page.topBar, { subtitle: "城市发展中心" })}
      ${renderNoticeTicker(page.noticeTicker)}
      ${this.renderMap(page)}
      ${this.renderSummary(page)}
      ${this.renderRecommendation(page)}
      ${this.renderActions(page)}
      <aside class="city-home-tip"><b>💡</b><div><strong>城市小贴士</strong><span>优先选择人流稳定、交通便利的商圈，更容易获得长期稳定客流。</span></div></aside>
      ${this.renderBottomNav()}
    </main>`;
  }

  render() {
    if (this.page) this.root.innerHTML = this.renderMarkup(this.page);
  }

  handleClick(event) {
    const target = event.target.closest?.("[data-action]");
    if (!target || !this.root.contains(target)) return;
    const action = target.dataset.action;
    if (action === "select-district") {
      this.selectedDistrictId = target.dataset.districtId;
      this.refresh();
      return;
    }
    if (action === "open-district-properties") {
      this.onNavigate?.("properties", this.restaurantId, { districtId: target.dataset.districtId });
      return;
    }
    if (action === "navigate") {
      const pageId = target.dataset.pageId;
      if (pageId !== "city" && pageId) this.onNavigate?.(pageId, this.restaurantId);
    }
  }
}

export const cityMapView = { mount(options) { return new CityMapView(options).mount(); } };
export { CityMapView };
