import { cityMapDashboardSystem } from "./CityMapDashboardSystem.js";
import { renderGameTopBar, renderBottomNavigation } from "../../components/GameChromeView.js";
import { gameChromeSystem } from "../../components/GameChromeSystem.js";

import {
  getDistrictThumbnailStyle,
  getDistrictLabelStyle
} from "./DistrictVisualRegistry.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return "¥" + Math.round(Number(value) || 0).toLocaleString("zh-CN");
}

function levelLabel(value, low = 40, high = 70) {
  const number = Number(value) || 0;
  if (number >= high) return "高";
  if (number >= low) return "中等";
  return "低";
}

const FILTERS = Object.freeze([
  ["all", "全部"],
  ["opened", "已开店"],
  ["available", "可选址"],
  ["potential", "高潜力"],
  ["locked", "待解锁"]
]);


function districtDescription(
  district
) {
  const traffic =
    Number(
      district?.trafficIndex
    ) ||
    0;

  const spending =
    Number(
      district?.spendingPower
    ) ||
    0;

  const competition =
    Number(
      district?.competition
    ) ||
    0;

  if (
    traffic >= 80 &&
    spending >= 75
  ) {
    return "城市核心商圈，客流稳定，消费能力强，适合品牌扩张。";
  }

  if (
    spending >= 75
  ) {
    return "消费能力较强，适合品质型门店与特色餐饮布局。";
  }

  if (
    traffic >= 80
  ) {
    return "客流活跃，用餐高峰明显，适合高周转经营模式。";
  }

  if (
    competition <= 40
  ) {
    return "竞争压力相对较低，适合稳步培育社区与长期客群。";
  }

  return "客群与消费结构相对均衡，适合根据定位灵活选址。";
}

class CityMapView {
  constructor({
    root,
    restaurantId = null,
    pageSystem = cityMapDashboardSystem,
    onNavigate = null
  }) {
    if (!root) throw new Error("CityMapView requires a root element");

    this.root = root;
    this.restaurantId = restaurantId;
    this.pageSystem = pageSystem;
    this.onNavigate = onNavigate;
    this.selectedDistrictId = null;
    this.filter = "all";
    this.zoom = 1;
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
    this.page = this.pageSystem.getPage({
      restaurantId: this.restaurantId,
      selectedDistrictId: this.selectedDistrictId
    });

    this.selectedDistrictId =
      this.page.map.selectedDistrictId;

    this.render();
    return this.page;
  }

  getFilteredDistricts(page) {
    const districts = page.map.districts ?? [];

    if (this.filter === "opened") {
      return districts.filter(item => item.hasOpenStore);
    }

    if (this.filter === "available") {
      return districts.filter(
        item => !item.locked && item.propertyCount > 0
      );
    }

    if (this.filter === "potential") {
      return districts.filter(
        item => !item.locked && item.highPotential
      );
    }

    if (this.filter === "locked") {
      return districts.filter(item => item.locked);
    }

    return districts;
  }

  renderHeader(page) {
    const count =
      page.citySummary?.districtCount ??
      page.map?.totalDistrictCount ??
      0;

    const areaCount =
      page.map?.areas?.length ??
      page.map?.totalAreaCount ??
      0;

    return (
      '<section class="city-map-heading">' +
        '<div class="city-map-heading__copy">' +
          '<h1><span class="city-map-heading__title-icon" aria-hidden="true"></span><span>城市地图</span></h1>' +
          '<p>发现优质商圈，拓展门店版图，让美食走进更多地方</p>' +
        '</div>' +
        '<div class="city-map-heading__summary">' +
          '<span class="city-map-heading__summary-icon" aria-hidden="true"></span>' +
          '<span class="city-map-heading__summary-copy">' +
            '<strong>' +
              count +
              ' 个商圈' +
            '</strong>' +
            '<small>' +
              areaCount +
              ' 大区域 · 等待你的探索' +
            '</small>' +
          '</span>' +
        '</div>' +
      '</section>'
    );
  }


  renderFilters(page) {
    const counts =
      page.filterCounts ?? {
        all:
          page.map?.districts?.length ??
          0,

        opened:
          0,

        available:
          0,

        potential:
          0,

        locked:
          0
      };

    return (
      '<nav class="city-map-filters" aria-label="城市商圈筛选">' +
        FILTERS.map(
          (
            [id, label],
            index
          ) =>
            '<button type="button" class="' +
              (
                this.filter ===
                id
                  ? "is-active"
                  : ""
              ) +
              '" data-action="set-filter" data-filter="' +
              id +
              '">' +
              '<span class="city-map-filter__icon city-map-filter__icon--' +
                id +
                '" aria-hidden="true"></span>' +
              '<strong>' +
                escapeHtml(
                  label
                ) +
                ' (' +
                (
                  counts[id] ??
                  0
                ) +
                ')' +
              '</strong>' +
            '</button>'
        ).join("") +
      '</nav>'
    );
  }


  renderMap(page) {
    const visible =
      this.getFilteredDistricts(
        page
      );

    const selectedId =
      page.map.selectedDistrictId;

    const priority =
      district =>
        (
          district.id ===
          selectedId
            ? 10000
            : 0
        ) +
        (
          district.hasOpenStore
            ? 2000
            : 0
        ) +
        (
          district.highPotential
            ? 1000
            : 0
        ) +
        (
          district.opportunityScore ??
          0
        );

    const displayed =
      [
        ...visible
      ]
        .sort(
          (
            a,
            b
          ) =>
            priority(b) -
            priority(a)
        )
        .slice(
          0,
          5
        );

    const selected =
      visible.find(
        district =>
          district.id ===
          selectedId
      );

    if (
      selected &&
      !displayed.some(
        district =>
          district.id ===
          selected.id
      )
    ) {
      displayed.unshift(
        selected
      );

      displayed.length =
        Math.min(
          displayed.length,
          5
        );
    }

    const pins =
      displayed.map(
        district => {
          const locked =
            district.locked ===
            true;

          const isSelected =
            selectedId ===
            district.id;

          const stateClass =
            isSelected
              ? "selected"
              : district.hasOpenStore
                ? "open"
                : district.highPotential
                  ? "potential"
                  : "";

          return (
            '<button type="button" class="city-map-pin ' +
            (
              isSelected
                ? "is-active "
                : ""
            ) +
            (
              locked
                ? "is-locked"
                : ""
            ) +
            '" data-action="' +
            (
              locked
                ? "locked-district"
                : "select-district"
            ) +
            '" data-district-id="' +
            escapeHtml(
              district.id
            ) +
            '" style="left:' +
            district.position.x +
            "%;top:" +
            district.position.y +
            "%;" +
            getDistrictLabelStyle(
              district.id,
              {
                selected:
                  isSelected,

                locked
              }
            ) +
            '">' +
              '<span class="city-map-pin__copy">' +
                '<strong>' +
                  escapeHtml(
                    district.name
                  ) +
                '</strong>' +
                '<small>' +
                  (
                    locked
                      ? "待解锁"
                      : (
                          district.areaDistrictCount ??
                          0
                        ) +
                        " 个商圈"
                  ) +
                '</small>' +
              '</span>' +
              (
                stateClass
                  ? '<span class="city-map-pin__state city-map-pin__state--' +
                    stateClass +
                    '" aria-hidden="true"></span>'
                  : ""
              ) +
            '</button>'
          );
        }
      ).join("");

    return (
      '<section class="city-map-viewport">' +
        '<div class="city-map-stage" style="--city-map-zoom:' +
          this.zoom +
        '">' +
          '<div class="city-map-artwork" role="img" aria-label="城市发展地图">' +
            '<span class="city-map-slogan" aria-hidden="true">让美食<br>点亮这座城市 ♡</span>' +
          '</div>' +
          '<div class="city-map-pins">' +
            pins +
          '</div>' +
        '</div>' +
        '<div class="city-map-controls" aria-label="地图控制">' +
          '<button type="button" class="city-map-control city-map-control--zoom-in" data-action="zoom-in" aria-label="放大地图"></button>' +
          '<button type="button" class="city-map-control city-map-control--zoom-out" data-action="zoom-out" aria-label="缩小地图"></button>' +
          '<button type="button" class="city-map-control city-map-control--locate" data-action="locate" aria-label="重置地图"></button>' +
        '</div>' +
      '</section>'
    );
  }


  renderMetric(
    iconName,
    label,
    value,
    sub = ""
  ) {
    return (
      '<article class="city-district-metric">' +
        '<span class="city-district-metric__icon city-district-metric__icon--' +
        escapeHtml(
          iconName
        ) +
        '" aria-hidden="true"></span>' +
        '<small>' +
        escapeHtml(
          label
        ) +
        '</small>' +
        '<strong>' +
        escapeHtml(
          value
        ) +
        '</strong>' +
        (
          sub
            ? '<b>' +
              escapeHtml(
                sub
              ) +
              '</b>'
            : ""
        ) +
      '</article>'
    );
  }

  renderOpportunity(item, index) {
    const tag =
      item.tag ??
      (
        item.qualityScore >= 80
          ? "高潜力"
          : item.affordable
            ? "可选址"
            : "关注"
      );

    const description =
      item.description ??
      (
        (item.districtName ?? "当前商圈") +
        " · " +
        (item.area ?? "--") +
        "㎡ · " +
        money(item.monthlyRent ?? 0) +
        "/月"
      );

    return (
      '<button type="button" class="city-opportunity-card city-opportunity-card--' +
      (index % 3) +
      '" data-action="open-district-properties" data-district-id="' +
      escapeHtml(item.districtId ?? "") +
      '">' +
        '<span class="city-opportunity-card__image" aria-hidden="true" style="' +
          getDistrictThumbnailStyle(
            item.districtId ??
            this.selectedDistrictId
          ) +
        '"></span>' +
        '<span class="city-opportunity-card__copy">' +
          '<span class="city-opportunity-card__title">' +
            '<strong>' +
            escapeHtml(item.name ?? item.districtName ?? "商圈机会") +
            '</strong>' +
            '<b>' + escapeHtml(tag) + '</b>' +
          '</span>' +
          '<small>' + escapeHtml(description) + '</small>' +
        '</span>' +
        '<span class="city-opportunity-card__arrow" aria-hidden="true"></span>' +
      '</button>'
    );
  }

  renderDetail(page) {
    const district =
      page.selectedDistrict;

    if (!district) {
      return (
        '<section class="city-district-sheet city-district-sheet--empty">' +
          '<div class="city-district-sheet__handle" aria-hidden="true"></div>' +
          '<div class="city-district-sheet__empty-copy">' +
            '<strong>请选择一个商圈</strong>' +
            '<small>点击地图上的可用商圈查看经营数据与房源机会</small>' +
          '</div>' +
        '</section>'
      );
    }

    const opportunities =
      page.opportunities ??
      [];

    const trafficPerDay =
      Math.max(
        0,
        Math.round(
          (
            district.trafficIndex ??
            0
          ) *
          160
        )
      );

    const rentPerSquareMetre =
      Number(
        district.averageRentPerSquareMetre
      ) ||
      (
        Number(
          district.averageRent
        ) ||
        0
      );

    return (
      '<section class="city-district-sheet">' +
        '<div class="city-district-sheet__handle" aria-hidden="true"></div>' +
        '<span class="city-district-sheet__close" aria-hidden="true">×</span>' +
        '<header class="city-district-sheet__header">' +
          '<div class="city-district-sheet__thumb" aria-hidden="true" style="' +
            getDistrictThumbnailStyle(
              district.id
            ) +
          '"></div>' +
          '<div class="city-district-sheet__identity">' +
            '<div><h2>' +
              escapeHtml(
                district.name
              ) +
            '</h2>' +
            (
              district.highPotential
                ? '<b>高潜力</b>'
                : district.hasOpenStore
                  ? '<b class="is-open">已开店</b>'
                  : ""
            ) +
            '</div>' +
            '<p>' +
              escapeHtml(
                districtDescription(
                  district
                )
              ) +
            '</p>' +
          '</div>' +
          '<button type="button" class="city-district-sheet__properties" data-action="open-district-properties" data-district-id="' +
          escapeHtml(district.id) +
          '"><span class="city-district-sheet__properties-icon" aria-hidden="true"></span><strong>查看房源</strong></button>' +
        '</header>' +
        '<div class="city-district-metrics">' +
          this.renderMetric("traffic", "客流量", trafficPerDay.toLocaleString("zh-CN") + "人/天", district.trafficIndex >= 60 ? "▲ 活跃" : "平稳") +
          this.renderMetric("spending", "消费力", "¥" + String(district.spendingPower ?? 0), district.spendingPower >= 60 ? "▲ 较强" : "中等") +
          this.renderMetric("rent", "平均租金", "¥" + Math.round(rentPerSquareMetre).toLocaleString("zh-CN") + "/㎡/月") +
          this.renderMetric("competition", "竞争度", levelLabel(district.competition)) +
          this.renderMetric("delivery", "外卖需求", levelLabel(district.deliveryDemand), district.deliveryDemand >= 60 ? "▲ 活跃" : "") +
          this.renderMetric("property", "可租房源", (district.propertyCount ?? 0) + "套") +
        '</div>' +
        '<section class="city-opportunities">' +
          '<header><div><span class="city-opportunities__emblem" aria-hidden="true"></span>' +
          '<strong>今日机会 (' +
          opportunities.length +
          ')</strong></div>' +
          '<button type="button" data-action="navigate" data-page-id="properties">查看全部</button></header>' +
          '<div class="city-opportunities__grid">' +
          (
            opportunities.length
              ? opportunities
                  .slice(0, 3)
                  .map((item, index) => this.renderOpportunity(item, index))
                  .join("")
              : '<div class="city-opportunities__empty">当前商圈暂无新的房源机会</div>'
          ) +
          '</div>' +
        '</section>' +
      '</section>'
    );
  }

  renderBottomNav() {
    return renderBottomNavigation(
      gameChromeSystem.getNavigation({
        restaurantId: this.restaurantId,
        activePageId: "city"
      })
    );
  }

  renderMarkup(page) {
    return (
      '<main class="rg-screen city-map-game">' +
        renderGameTopBar(
          page.topBar,
          {
            subtitle: "城市经营版图"
          }
        ) +
        this.renderHeader(page) +
        this.renderFilters(page) +
        this.renderMap(page) +
        this.renderDetail(page) +
        this.renderBottomNav() +
      '</main>'
    );
  }

  render() {
    if (this.page) {
      this.root.innerHTML =
        this.renderMarkup(
          this.page
        );
    }
  }


  replaceSection(
    selector,
    markup
  ) {
    const current =
      this.root
        .querySelector?.(
          selector
        );

    if (!current) {
      this.render();
      return;
    }

    current.outerHTML =
      markup;
  }


  renderFiltersOnly() {
    this.replaceSection(
      ".city-map-filters",
      this.renderFilters(
        this.page
      )
    );
  }


  renderMapOnly() {
    this.replaceSection(
      ".city-map-viewport",
      this.renderMap(
        this.page
      )
    );
  }


  renderDetailOnly() {
    const current =
      this.root
        .querySelector?.(
          ".city-district-sheet"
        );

    const markup =
      this.renderDetail(
        this.page
      );

    if (current) {
      current.outerHTML =
        markup;
      return;
    }

    const map =
      this.root
        .querySelector?.(
          ".city-map-viewport"
        );

    if (
      map &&
      markup
    ) {
      map.insertAdjacentHTML(
        "afterend",
        markup
      );
    }
  }


  selectDistrict(
    districtId
  ) {
    const district =
      this.page?.map?.districts
        ?.find(
          item =>
            item.id ===
            districtId &&
            !item.locked
        );

    if (!district) {
      return;
    }

    this.selectedDistrictId =
      district.id;

    this.page.map.selectedDistrictId =
      district.id;

    this.page.selectedDistrict =
      district;

    if (
      typeof this.pageSystem
        ?.getOpportunities ===
      "function"
    ) {
      this.page.opportunities =
        this.pageSystem
          .getOpportunities(
            this.page
              .recommendedProperties ??
              [],
            district.id
          );
    }

    this.renderMapOnly();
    this.renderDetailOnly();
  }


  handleClick(event) {
    const target =
      event.target.closest?.("[data-action]");

    if (!target || !this.root.contains(target)) {
      return;
    }

    const action = target.dataset.action;

    if (action === "set-filter") {
      this.filter =
        target.dataset.filter ??
        "all";

      this.renderFiltersOnly();
      this.renderMapOnly();
      return;
    }

    if (action === "select-district") {
      this.selectDistrict(
        target.dataset
          .districtId
      );
      return;
    }

    if (action === "open-district-properties") {
      const districtId =
        target.dataset.districtId ||
        this.selectedDistrictId;

      this.onNavigate?.(
        "properties",
        this.restaurantId,
        districtId
          ? { districtId }
          : {}
      );
      return;
    }

    if (action === "zoom-in") {
      this.zoom = Math.min(
        1.3,
        Number(
          (
            this.zoom +
            0.1
          ).toFixed(
            2
          )
        )
      );

      this.renderMapOnly();
      return;
    }

    if (action === "zoom-out") {
      this.zoom = Math.max(
        1,
        Number(
          (
            this.zoom -
            0.1
          ).toFixed(
            2
          )
        )
      );

      this.renderMapOnly();
      return;
    }

    if (action === "locate") {
      this.zoom = 1;
      this.renderMapOnly();
      return;
    }

    if (action === "navigate") {
      const pageId = target.dataset.pageId;

      if (
        pageId &&
        pageId !== "city"
      ) {
        this.onNavigate?.(
          pageId,
          this.restaurantId
        );
      }
    }
  }
}

export const cityMapView = {
  mount(options) {
    return new CityMapView(options).mount();
  }
};

export { CityMapView };
