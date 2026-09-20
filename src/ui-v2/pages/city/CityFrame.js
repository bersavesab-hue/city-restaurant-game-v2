const FILTERS =
  Object.freeze([
    "全部(20)",
    "已开店(3)",
    "可选址(8)",
    "高潜力(5)",
    "待解锁(4)"
  ]);

const MAP_MARKERS =
  Object.freeze([
    Object.freeze({
      id: "university",
      title: "大学城区域",
      meta: "5个商圈",
      x: 53,
      y: 11
    }),

    Object.freeze({
      id: "cbd",
      title: "CBD商务区",
      meta: "6个商圈",
      x: 40,
      y: 27
    }),

    Object.freeze({
      id: "nightlife",
      title: "夜生活区",
      meta: "4个商圈",
      x: 80,
      y: 34
    }),

    Object.freeze({
      id: "old-town",
      title: "老城商业区",
      meta: "4个商圈",
      x: 22,
      y: 64
    }),

    Object.freeze({
      id: "waterfront",
      title: "水岸休闲区",
      meta: "5个商圈",
      x: 74,
      y: 70
    })
  ]);

function renderCityFrame() {
  return (
    '<div class="ui-v2-city-frame" data-ui="city-frame">' +
      '<section class="ui-v2-city-frame__hero" data-ui-region="city-hero">' +
        '<div class="ui-v2-box ui-v2-box--hero-icon"></div>' +
        '<div class="ui-v2-city-frame__hero-copy">' +
          '<h1>城市地图</h1>' +
          '<p>发现优质商圈，拓展门店版图，让美食走进更多地方</p>' +
        '</div>' +
        '<div class="ui-v2-city-frame__summary" data-ui-box="hero-summary">' +
          '<span class="ui-v2-box ui-v2-box--hero-icon"></span>' +
          '<div>' +
            '<strong>20个商圈</strong>' +
            '<small>4大区域 · 等待你的探索</small>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__filters" data-ui-region="city-filters">' +
        FILTERS
          .map(
            (
              label,
              index
            ) => (
              '<button class="ui-v2-city-frame__filter' +
                (
                  index ===
                  0
                    ? ' is-active'
                    : ''
                ) +
                '" type="button">' +
                (
                  index ===
                  0
                    ? ''
                    : '<span class="ui-v2-box ui-v2-box--filter-icon"></span>'
                ) +
                '<strong>' +
                  label +
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
              '<div class="ui-v2-city-frame__marker" data-ui-box="map-marker" style="--marker-x:' +
                marker.x +
                '%;--marker-y:' +
                marker.y +
                '%">' +
                '<span class="ui-v2-box ui-v2-box--marker-icon"></span>' +
                '<div>' +
                  '<strong>' +
                    marker.title +
                  '</strong>' +
                  '<small>' +
                    marker.meta +
                  '</small>' +
                '</div>' +
              '</div>'
            )
          )
          .join(
            ""
          ) +
        '<div class="ui-v2-city-frame__map-controls">' +
          '<button type="button">＋</button>' +
          '<button type="button">－</button>' +
          '<button type="button">◎</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-city-frame__detail" data-ui-region="city-detail">' +
        '<div class="ui-v2-city-frame__detail-main">' +
          '<div class="ui-v2-city-frame__thumbnail" data-ui-box="detail-thumbnail"></div>' +
          '<div class="ui-v2-city-frame__detail-copy">' +
            '<div class="ui-v2-city-frame__detail-title-row">' +
              '<h2>CBD商务区</h2>' +
              '<span>高潜力</span>' +
            '</div>' +
            '<p>城市核心商务区，写字楼林立，上班族与商务客流稳定。</p>' +
          '</div>' +
          '<button class="ui-v2-city-frame__primary-action" type="button">查看房源</button>' +
        '</div>' +

        '<div class="ui-v2-city-frame__metrics">' +
          [
            ["客流量","12,800/天"],
            ["消费力","¥68/人"],
            ["平均租金","¥220/㎡/月"],
            ["竞争度","中等"],
            ["外卖需求","高"],
            ["可租房源","8套"]
          ]
            .map(
              item => (
                '<div class="ui-v2-city-frame__metric" data-ui-box="metric">' +
                  '<span class="ui-v2-box ui-v2-box--marker-icon"></span>' +
                  '<small>' +
                    item[0] +
                  '</small>' +
                  '<strong>' +
                    item[1] +
                  '</strong>' +
                '</div>'
              )
            )
            .join(
              ""
            ) +
        '</div>' +

        '<div class="ui-v2-city-frame__opportunity-header">' +
          '<h3>今日机会 <span>(3)</span></h3>' +
          '<button type="button">查看全部</button>' +
        '</div>' +

        '<div class="ui-v2-city-frame__opportunities">' +
          [
            "金融大厦周边",
            "中央广场",
            "科技园西区"
          ]
            .map(
              title => (
                '<div class="ui-v2-city-frame__opportunity" data-ui-box="opportunity">' +
                  '<span class="ui-v2-city-frame__opportunity-thumb"></span>' +
                  '<div>' +
                    '<strong>' +
                      title +
                    '</strong>' +
                    '<small>两行内容区域</small>' +
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
    destroy() {
      root.replaceChildren();
    }
  });
}

export {
  renderCityFrame,
  mountCityFrame
};
