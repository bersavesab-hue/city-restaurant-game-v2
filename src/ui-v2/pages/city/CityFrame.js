const FILTERS =
  Object.freeze([
    Object.freeze({
      id: "all",
      label: "全部"
    }),
    Object.freeze({
      id: "opened",
      label: "已开店"
    }),
    Object.freeze({
      id: "available",
      label: "可选址"
    }),
    Object.freeze({
      id: "highPotential",
      label: "高潜力"
    }),
    Object.freeze({
      id: "locked",
      label: "待解锁"
    })
  ]);

const MAP_MARKERS =
  Object.freeze([
    Object.freeze({
      id: "university",
      title: "大学城",
      meta: "观察中",
      x: 52.9667,
      y: 11.0335
    }),

    Object.freeze({
      id: "cbd",
      title: "CBD商务区",
      meta: "高潜力",
      x: 39.9421,
      y: 26.9553
    }),

    Object.freeze({
      id: "nightlife",
      title: "夜生活区",
      meta: "观察中",
      x: 80.0289,
      y: 33.9385
    }),

    Object.freeze({
      id: "old_town",
      title: "老城商业区",
      meta: "观察中",
      x: 21.9971,
      y: 63.9665
    }),

    Object.freeze({
      id: "waterfront_leisure",
      title: "水岸休闲区",
      meta: "观察中",
      x: 73.9508,
      y: 69.9721
    })
  ]);

const METRICS =
  Object.freeze([
    Object.freeze([
      "客流量",
      "—"
    ]),
    Object.freeze([
      "消费力",
      "—"
    ]),
    Object.freeze([
      "平均租金",
      "—"
    ]),
    Object.freeze([
      "竞争度",
      "—"
    ]),
    Object.freeze([
      "外卖需求",
      "—"
    ]),
    Object.freeze([
      "可租房源",
      "—"
    ])
  ]);

const OPPORTUNITIES =
  Object.freeze([
    "机会加载中",
    "机会加载中",
    "机会加载中"
  ]);

function renderCityFrame() {
  return (
    '<div class="ui-v2-city-frame" data-ui="city-frame">' +

      '<section class="ui-v2-city-frame__hero" data-ui-region="city-hero">' +
        '<div class="ui-v2-box ui-v2-box--hero-icon ui-v2-city-frame__hero-icon" data-ui-box="hero-icon"></div>' +
        '<div class="ui-v2-city-frame__hero-copy">' +
          '<h1 data-ui-text="page-title">城市地图</h1>' +
          '<p data-ui-text="page-subtitle">发现优质商圈，拓展门店版图，让美食走进更多地方</p>' +
        '</div>' +
        '<div class="ui-v2-city-frame__summary" data-ui-box="hero-summary">' +
          '<span class="ui-v2-box ui-v2-box--hero-icon"></span>' +
          '<div>' +
            '<strong data-live="city-total">20个商圈</strong>' +
            '<small data-live="city-summary-subtitle">4大区域 · 等待你的探索</small>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__filters" data-ui-region="city-filters">' +
        FILTERS
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
                    : '<span class="ui-v2-box ui-v2-box--filter-icon"></span>'
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
          ) +
      '</section>' +

      '<section class="ui-v2-city-frame__map" data-ui-region="city-map">' +
        '<div class="ui-v2-city-frame__map-grid" aria-hidden="true"></div>' +
        MAP_MARKERS
          .map(
            marker => (
              '<button class="ui-v2-city-frame__marker" type="button" data-ui-box="map-marker" data-district-id="' +
                marker.id +
                '" style="--marker-x:' +
                marker.x +
                '%;--marker-y:' +
                marker.y +
                '%">' +
                '<span class="ui-v2-box ui-v2-box--marker-icon" data-ui-box="map-marker-icon"></span>' +
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
          ) +
        '<div class="ui-v2-city-frame__map-controls" data-ui-box="map-controls">' +
          '<button type="button" data-ui-box="map-control">＋</button>' +
          '<button type="button" data-ui-box="map-control">－</button>' +
          '<button type="button" data-ui-box="map-control">◎</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__detail" data-ui-region="city-detail">' +
        '<div class="ui-v2-city-frame__detail-handle" data-ui-box="detail-handle"></div>' +
        '<button class="ui-v2-city-frame__detail-close" type="button" data-ui-box="detail-close" aria-label="关闭">×</button>' +
        '<div class="ui-v2-city-frame__thumbnail" data-ui-box="detail-thumbnail"></div>' +

        '<div class="ui-v2-city-frame__detail-copy">' +
          '<div class="ui-v2-city-frame__detail-title-row">' +
            '<h2 data-ui-text="detail-title" data-live="detail-title">CBD商务区</h2>' +
            '<span data-live="detail-badge">高潜力</span>' +
          '</div>' +
          '<p data-ui-text="detail-body" data-live="detail-body">正在读取商圈数据。</p>' +
        '</div>' +

        '<button class="ui-v2-city-frame__primary-action" type="button" data-ui-box="primary-action">查看房源</button>' +

        '<div class="ui-v2-city-frame__metrics" data-ui-box="metrics-row">' +
          METRICS
            .map(
              (
                item,
                index
              ) => (
                '<div class="ui-v2-city-frame__metric" data-ui-box="metric" data-metric-index="' +
                  index +
                  '">' +
                  '<span class="ui-v2-box ui-v2-box--metric-icon" data-ui-box="metric-icon"></span>' +
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
                '</div>'
              )
            )
            .join(
              ""
            ) +
        '</div>' +

        '<div class="ui-v2-city-frame__opportunity-header" data-ui-box="opportunity-header">' +
          '<h3 data-ui-text="section-title">今日机会 <span>(<span data-live="opportunity-count">0</span>)</span></h3>' +
          '<button type="button">查看全部</button>' +
        '</div>' +

        '<div class="ui-v2-city-frame__opportunities" data-ui-box="opportunity-row">' +
          OPPORTUNITIES
            .map(
              (
                title,
                index
              ) => (
                '<div class="ui-v2-city-frame__opportunity" data-ui-box="opportunity" data-opportunity-index="' +
                  index +
                  '">' +
                  '<span class="ui-v2-city-frame__opportunity-thumb" data-ui-box="opportunity-thumbnail"></span>' +
                  '<div>' +
                    '<strong data-ui-text="opportunity-title" data-live="opportunity-title-' +
                      index +
                      '">' +
                      title +
                    '</strong>' +
                    '<small data-ui-text="opportunity-body" data-live="opportunity-body-' +
                      index +
                      '">等待动态机会</small>' +
                  '</div>' +
                  '<span>›</span>' +
                '</div>'
              )
            )
            .join(
              ""
            ) +
        '</div>' +
      '</section>' +
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
