const FILTERS =
  Object.freeze([
    Object.freeze({id: "all",label: "全部"}),
    Object.freeze({id: "opened",label: "已开店"}),
    Object.freeze({id: "available",label: "可选址"}),
    Object.freeze({id: "highPotential",label: "高潜力"}),
    Object.freeze({id: "locked",label: "待解锁"})
  ]);

const MAP_MARKERS =
  Object.freeze([
    Object.freeze({
      id: "university",
      title: "大学城区域",
      meta: "5个商圈",
      x: 54,
      y: 9
    }),
    Object.freeze({
      id: "cbd",
      title: "CBD商务区域",
      meta: "6个商圈",
      x: 37,
      y: 29
    }),
    Object.freeze({
      id: "nightlife",
      title: "夜生活区域",
      meta: "4个商圈",
      x: 82,
      y: 40
    }),
    Object.freeze({
      id: "old_town",
      title: "老城商业区域",
      meta: "4个商圈",
      x: 27,
      y: 74
    }),
    Object.freeze({
      id: "waterfront_leisure",
      title: "水岸休闲区域",
      meta: "5个商圈",
      x: 78,
      y: 69
    })
  ]);

const METRICS =
  Object.freeze([
    Object.freeze(["客流量","—"]),
    Object.freeze(["消费力","—"]),
    Object.freeze(["平均租金","—"]),
    Object.freeze(["竞争度","—"]),
    Object.freeze(["外卖需求","—"]),
    Object.freeze(["可租房源","—"])
  ]);

const OPPORTUNITIES =
  Object.freeze([
    "机会加载中",
    "机会加载中",
    "机会加载中"
  ]);

function renderFilters() {
  return FILTERS
    .map(
      (
        filter,
        index
      ) => (
        '<button class="ui-v2-city-frame__filter' +
          (
            index === 0
              ? ' is-active'
              : ''
          ) +
          '" type="button" data-ui-box="filter" data-city-filter="' +
          filter.id +
          '">' +
          (
            index === 0
              ? ''
              : '<span class="ui-v2-city-frame__filter-icon" aria-hidden="true"></span>'
          ) +
          '<strong data-ui-text="filter">' +
            filter.label +
            '(<span data-live="filter-' +
            filter.id +
            '">0</span>)' +
          '</strong>' +
        '</button>'
      )
    )
    .join(
      ""
    );
}

function renderMarkers() {
  return MAP_MARKERS
    .map(
      marker => (
        '<button class="ui-v2-city-frame__marker" type="button" data-ui-box="map-marker" data-district-id="' +
          marker.id +
          '" style="--marker-x:' +
          marker.x +
          '%;--marker-y:' +
          marker.y +
          '%">' +
          '<span class="ui-v2-city-frame__marker-icon" data-ui-box="map-marker-icon" aria-hidden="true"></span>' +
          '<span class="ui-v2-city-frame__marker-copy">' +
            '<strong data-ui-text="marker-title" data-live="marker-title-' +
              marker.id +
              '">' +
              marker.title +
            '</strong>' +
            '<small data-ui-text="marker-meta" data-live="marker-meta-' +
              marker.id +
              '">' +
              marker.meta +
            '</small>' +
          '</span>' +
        '</button>'
      )
    )
    .join(
      ""
    );
}

function renderMetrics() {
  return METRICS
    .map(
      (
        item,
        index
      ) => (
        '<div class="ui-v2-city-frame__metric" data-ui-box="metric" data-metric-index="' +
          index +
          '">' +
          '<span class="ui-v2-city-frame__metric-icon" data-ui-box="metric-icon" aria-hidden="true"></span>' +
          '<span class="ui-v2-city-frame__metric-copy">' +
            '<small data-ui-text="metric-label" data-live="metric-label-' +
              index +
              '">' +
              item[0] +
            '</small>' +
            '<strong data-ui-text="metric-value" data-live="metric-value-' +
              index +
              '">' +
              item[1] +
            '</strong>' +
            '<em data-live="metric-trend-' +
              index +
              '"></em>' +
          '</span>' +
        '</div>'
      )
    )
    .join(
      ""
    );
}

function renderOpportunities() {
  return OPPORTUNITIES
    .map(
      (
        title,
        index
      ) => (
        '<button class="ui-v2-city-frame__opportunity" type="button" data-ui-box="opportunity" data-opportunity-index="' +
          index +
          '">' +
          '<span class="ui-v2-city-frame__opportunity-thumb" data-ui-box="opportunity-thumbnail"></span>' +
          '<span class="ui-v2-city-frame__opportunity-copy">' +
            '<strong data-ui-text="opportunity-title" data-live="opportunity-title-' +
              index +
              '">' +
              title +
            '</strong>' +
            '<small data-ui-text="opportunity-body" data-live="opportunity-body-' +
              index +
              '">等待动态机会</small>' +
          '</span>' +
          '<span class="ui-v2-city-frame__opportunity-chevron" aria-hidden="true"></span>' +
        '</button>'
      )
    )
    .join(
      ""
    );
}

function renderCityFrame() {
  return (
    '<div class="ui-v2-city-frame" data-ui="city-frame" data-ui-visual="approved-reference-v2">' +
      '<section class="ui-v2-city-frame__hero" data-ui-region="city-hero">' +
        '<div class="ui-v2-city-frame__hero-icon" data-ui-box="hero-icon" aria-hidden="true"></div>' +
        '<div class="ui-v2-city-frame__hero-copy">' +
          '<h1 data-ui-text="page-title">城市地图</h1>' +
          '<p data-ui-text="page-subtitle">发现优质商圈，拓展门店版图，让美食走进更多地方</p>' +
        '</div>' +
        '<div class="ui-v2-city-frame__summary" data-ui-box="hero-summary">' +
          '<span class="ui-v2-city-frame__summary-icon" aria-hidden="true"></span>' +
          '<div>' +
            '<strong data-live="city-total">20个商圈</strong>' +
            '<small data-live="city-summary-subtitle">4大区域 · 等待你的探索</small>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__filters" data-ui-region="city-filters" role="tablist" aria-label="商圈筛选">' +
        renderFilters() +
      '</section>' +

      '<section class="ui-v2-city-frame__map" data-ui-region="city-map">' +
        '<div class="ui-v2-city-frame__map-world" data-layer="map-world">' +
          '<div class="ui-v2-city-frame__map-art" data-ui-box="city-map-art" aria-hidden="true"></div>' +
          '<div class="ui-v2-city-frame__map-shade" aria-hidden="true"></div>' +
          '<svg class="ui-v2-city-frame__region-overlays" viewBox="0 0 864 660" preserveAspectRatio="none" aria-hidden="true">' +
            '<path class="is-campus" d="M248 95 L346 45 448 35 570 53 658 101 642 148 551 180 456 212 371 180 273 161 Z"/>' +
            '<path class="is-core" d="M45 262 L124 218 194 165 264 160 323 194 432 251 491 332 508 382 453 424 361 437 237 393 119 361 43 315 Z"/>' +
            '<path class="is-nightlife" d="M540 199 L623 155 678 115 748 132 824 188 860 231 859 320 774 341 700 330 611 297 Z"/>' +
            '<path class="is-lifestyle" d="M9 423 L95 398 174 422 250 446 315 489 374 565 300 606 195 650 88 630 5 571 Z"/>' +
            '<path class="is-waterfront" d="M578 444 L643 402 716 404 794 449 863 458 863 568 791 615 713 603 620 574 568 522 510 486 Z"/>' +
          '</svg>' +
          '<div class="ui-v2-city-frame__markers">' +
            renderMarkers() +
          '</div>' +
        '</div>' +
        '<div class="ui-v2-city-frame__map-motto" aria-hidden="true">' +
          '<span>让美食</span>' +
          '<span>点亮这座城市 ♡</span>' +
        '</div>' +
        '<div class="ui-v2-city-frame__map-controls" data-ui-box="map-controls" aria-label="地图控制">' +
          '<button type="button" data-ui-box="map-control" data-city-map-action="zoom-in" aria-label="放大"></button>' +
          '<button type="button" data-ui-box="map-control" data-city-map-action="zoom-out" aria-label="缩小"></button>' +
          '<button type="button" data-ui-box="map-control" data-city-map-action="locate" aria-label="复位地图"></button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__detail" data-ui-region="city-detail">' +
        '<div class="ui-v2-city-frame__detail-handle" data-ui-box="detail-handle"></div>' +
        '<button class="ui-v2-city-frame__detail-close" type="button" data-ui-box="detail-close" data-city-action="close-detail" aria-label="收起商圈详情">×</button>' +
        '<div class="ui-v2-city-frame__detail-main">' +
          '<div class="ui-v2-city-frame__thumbnail" data-ui-box="detail-thumbnail"></div>' +
          '<div class="ui-v2-city-frame__detail-copy">' +
            '<div class="ui-v2-city-frame__detail-title-row">' +
              '<h2 data-ui-text="detail-title" data-live="detail-title">CBD商务区</h2>' +
              '<span data-live="detail-badge">高潜力</span>' +
            '</div>' +
            '<p data-ui-text="detail-body" data-live="detail-body">正在读取商圈数据。</p>' +
          '</div>' +
          '<button class="ui-v2-city-frame__primary-action" type="button" data-ui-box="primary-action">查看房源</button>' +
        '</div>' +

        '<div class="ui-v2-city-frame__metrics" data-ui-box="metrics-row">' +
          renderMetrics() +
        '</div>' +

        '<div class="ui-v2-city-frame__opportunity-section">' +
          '<div class="ui-v2-city-frame__opportunity-header" data-ui-box="opportunity-header">' +
            '<h3 data-ui-text="section-title">今日机会 <span>(<span data-live="opportunity-count">0</span>)</span></h3>' +
            '<button type="button" data-city-action="open-opportunities">查看全部</button>' +
          '</div>' +
          '<div class="ui-v2-city-frame__opportunities" data-ui-box="opportunity-row">' +
            renderOpportunities() +
          '</div>' +
        '</div>' +
      '</section>' +

      '<dialog class="ui-v2-city-dialog" data-ui="city-dialog">' +
        '<header>' +
          '<h2 data-city-dialog-title>可租房源</h2>' +
          '<button type="button" data-city-dialog-close aria-label="关闭">×</button>' +
        '</header>' +
        '<div class="ui-v2-city-dialog__list" data-city-dialog-list></div>' +
      '</dialog>' +
    '</div>'
  );
}

function mountCityFrame(
  root
) {
  if (
    !root ||
    typeof root.querySelector !==
      "function"
  ) {
    throw new TypeError(
      "City frame root must be a DOM element"
    );
  }

  root.innerHTML =
    renderCityFrame();

  return Object.freeze({
    root,

    destroy() {
      root.replaceChildren();
    }
  });
}

export {
  FILTERS,
  MAP_MARKERS,
  renderCityFrame,
  mountCityFrame
};
