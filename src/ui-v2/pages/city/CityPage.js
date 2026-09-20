import {
  escapeHtml
} from "../../utils/escapeHtml.js";

import {
  FILTER_IDS,
  formatInteger,
  getCompetitionLabel,
  getDemandLabel,
  isDistrictVisibleForFilter
} from "./CityPageModel.js";

function districtStateLabel(
  district
) {
  if (
    district.locked
  ) {
    return "待解锁";
  }

  if (
    district.opened
  ) {
    return "已开店";
  }

  if (
    district.highPotential
  ) {
    return "高潜力";
  }

  if (
    district.available
  ) {
    return "可选址";
  }

  return "观察中";
}

function districtStateClass(
  district
) {
  if (
    district.locked
  ) {
    return "is-locked";
  }

  if (
    district.opened
  ) {
    return "is-opened";
  }

  if (
    district.highPotential
  ) {
    return "is-potential";
  }

  return "is-available";
}

function renderFilters(
  model,
  activeFilter
) {
  return (
    '<div class="ui-v2-city-filters" role="tablist" aria-label="商圈筛选">' +
      model.filters
        .map(
          filter => (
            '<button class="ui-v2-city-filter ui-v2-hit-target' +
              (
                filter.id ===
                activeFilter
                  ? ' is-active'
                  : ''
              ) +
              '" type="button" data-city-filter="' +
              escapeHtml(
                filter.id
              ) +
              '" role="tab" aria-selected="' +
              (
                filter.id ===
                activeFilter
                  ? "true"
                  : "false"
              ) +
            '">' +
              '<span>' +
                escapeHtml(
                  filter.label
                ) +
              '</span>' +
              '<strong class="ui-v2-no-truncate-number">(' +
                escapeHtml(
                  filter.count
                ) +
              ')</strong>' +
            '</button>'
          )
        )
        .join(
          ""
        ) +
    '</div>'
  );
}

function renderMapMarker(
  district,
  selectedId
) {
  const selected =
    district.id ===
    selectedId;

  return (
    '<button class="ui-v2-city-marker ' +
      districtStateClass(
        district
      ) +
      (
        selected
          ? ' is-selected'
          : ''
      ) +
      '" type="button" data-city-district="' +
      escapeHtml(
        district.id
      ) +
      '" style="--city-marker-x:' +
      district.x +
      '%;--city-marker-y:' +
      district.y +
      '%" aria-pressed="' +
      (
        selected
          ? "true"
          : "false"
      ) +
    '">' +
      '<span class="ui-v2-city-marker__icon" data-image-slot="district-marker" data-image-key="' +
        escapeHtml(
          district.id
        ) +
        '" aria-hidden="true"></span>' +
      '<span class="ui-v2-city-marker__copy">' +
        '<strong>' +
          escapeHtml(
            district.name
          ) +
        '</strong>' +
        '<small>' +
          escapeHtml(
            districtStateLabel(
              district
            )
          ) +
        '</small>' +
      '</span>' +
    '</button>'
  );
}

function renderMap(
  model,
  activeFilter,
  selectedId
) {
  const visible =
    model.districts
      .filter(
        district =>
          isDistrictVisibleForFilter(
            district,
            activeFilter
          )
      )
      .sort(
        (a,b) => {
          const selectedWeight =
            Number(
              b.id ===
              selectedId
            ) -
            Number(
              a.id ===
              selectedId
            );

          if (
            selectedWeight !==
            0
          ) {
            return selectedWeight;
          }

          return (
            b.opportunityScore -
            a.opportunityScore
          );
        }
      )
      .slice(
        0,
        7
      );

  return (
    '<section class="ui-v2-city-map-stage" data-ui="city-map">' +
      '<div class="ui-v2-city-map-art" data-image-slot="city-map-master" aria-hidden="true"></div>' +
      '<div class="ui-v2-city-map-shade" aria-hidden="true"></div>' +
      '<div class="ui-v2-city-map-markers">' +
        visible
          .map(
            district =>
              renderMapMarker(
                district,
                selectedId
              )
          )
          .join(
            ""
          ) +
      '</div>' +
      '<div class="ui-v2-city-map-controls" aria-label="地图控制">' +
        '<button class="ui-v2-city-map-control ui-v2-hit-target" type="button" data-city-map-action="zoom-in" aria-label="放大">' +
          '<span data-image-slot="city-map-control" data-image-key="zoom-in" aria-hidden="true"></span>' +
        '</button>' +
        '<button class="ui-v2-city-map-control ui-v2-hit-target" type="button" data-city-map-action="zoom-out" aria-label="缩小">' +
          '<span data-image-slot="city-map-control" data-image-key="zoom-out" aria-hidden="true"></span>' +
        '</button>' +
        '<button class="ui-v2-city-map-control ui-v2-hit-target" type="button" data-city-map-action="locate" aria-label="定位">' +
          '<span data-image-slot="city-map-control" data-image-key="locate" aria-hidden="true"></span>' +
        '</button>' +
      '</div>' +
    '</section>'
  );
}

function renderMetric(
  iconKey,
  label,
  value,
  secondary = ""
) {
  return (
    '<div class="ui-v2-city-metric">' +
      '<span class="ui-v2-city-metric__icon" data-image-slot="city-metric-icon" data-image-key="' +
        escapeHtml(
          iconKey
        ) +
        '" aria-hidden="true"></span>' +
      '<span class="ui-v2-city-metric__copy">' +
        '<small>' +
          escapeHtml(
            label
          ) +
        '</small>' +
        '<strong class="ui-v2-no-truncate-number">' +
          escapeHtml(
            value
          ) +
        '</strong>' +
        (
          secondary
            ? (
                '<em>' +
                  escapeHtml(
                    secondary
                  ) +
                '</em>'
              )
            : ""
        ) +
      '</span>' +
    '</div>'
  );
}

function renderOpportunity(
  opportunity
) {
  return (
    '<button class="ui-v2-city-opportunity" type="button" data-city-district="' +
      escapeHtml(
        opportunity.districtId
      ) +
    '">' +
      '<span class="ui-v2-city-opportunity__image" data-image-slot="city-district-thumbnail" data-image-key="' +
        escapeHtml(
          opportunity.districtId
        ) +
        '" aria-hidden="true"></span>' +
      '<span class="ui-v2-city-opportunity__copy">' +
        '<strong>' +
          escapeHtml(
            opportunity.title
          ) +
        '</strong>' +
        '<small class="ui-v2-city-opportunity__tag">' +
          escapeHtml(
            opportunity.tag
          ) +
        '</small>' +
        '<span>' +
          escapeHtml(
            opportunity.detail
          ) +
        '</span>' +
      '</span>' +
      '<span class="ui-v2-city-opportunity__chevron" data-image-slot="chevron-right" aria-hidden="true"></span>' +
    '</button>'
  );
}

function renderDistrictDetail(
  district,
  opportunities
) {
  if (
    !district
  ) {
    return (
      '<section class="ui-v2-city-detail is-empty" data-ui="city-district-detail"></section>'
    );
  }

  return (
    '<section class="ui-v2-city-detail" data-ui="city-district-detail">' +
      '<div class="ui-v2-city-detail__handle" aria-hidden="true"></div>' +
      '<div class="ui-v2-city-detail__main">' +
        '<div class="ui-v2-city-detail__image" data-image-slot="city-district-thumbnail" data-image-key="' +
          escapeHtml(
            district.id
          ) +
          '" aria-hidden="true"></div>' +
        '<div class="ui-v2-city-detail__heading">' +
          '<div class="ui-v2-city-detail__title-row">' +
            '<h2>' +
              escapeHtml(
                district.name
              ) +
            '</h2>' +
            '<span class="ui-v2-city-status ' +
              districtStateClass(
                district
              ) +
            '">' +
              escapeHtml(
                districtStateLabel(
                  district
                )
              ) +
            '</span>' +
          '</div>' +
          '<p>' +
            escapeHtml(
              district.description
            ) +
          '</p>' +
        '</div>' +
        '<button class="ui-v2-city-property-button ui-v2-hit-target" type="button" data-city-action="open-properties" data-district-id="' +
          escapeHtml(
            district.id
          ) +
        '">' +
          '<span data-image-slot="search-property" aria-hidden="true"></span>' +
          '<strong>查看房源</strong>' +
        '</button>' +
      '</div>' +
      '<div class="ui-v2-city-metrics">' +
        renderMetric(
          "traffic",
          "客流量",
          formatInteger(
            district.traffic
          ) +
          "/天"
        ) +
        renderMetric(
          "spending",
          "消费力",
          "¥" +
          formatInteger(
            district.spending
          ) +
          "/人"
        ) +
        renderMetric(
          "rent",
          "平均租金",
          "¥" +
          formatInteger(
            district.rentPerSqm
          ) +
          "/㎡/月"
        ) +
        renderMetric(
          "competition",
          "竞争度",
          getCompetitionLabel(
            district.competition
          )
        ) +
        renderMetric(
          "delivery",
          "外卖需求",
          getDemandLabel(
            district.deliveryDemand
          )
        ) +
        renderMetric(
          "properties",
          "可租房源",
          formatInteger(
            district.availableProperties
          ) +
          "套"
        ) +
      '</div>' +
      '<div class="ui-v2-city-opportunities">' +
        '<div class="ui-v2-city-opportunities__header">' +
          '<div>' +
            '<span class="ui-v2-city-opportunities__icon" data-image-slot="opportunity" aria-hidden="true"></span>' +
            '<h3>今日机会</h3>' +
            '<strong class="ui-v2-no-truncate-number">(' +
              escapeHtml(
                opportunities.length
              ) +
            ')</strong>' +
          '</div>' +
          '<button type="button" data-city-action="open-opportunities">查看全部</button>' +
        '</div>' +
        '<div class="ui-v2-city-opportunities__list">' +
          opportunities
            .map(
              renderOpportunity
            )
            .join(
              ""
            ) +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function renderCityPage(
  model,
  {
    activeFilter = "all",
    selectedDistrictId = null
  } = {}
) {
  const selected =
    model.districts.find(
      item =>
        item.id ===
        selectedDistrictId
    ) ??
    model.selectedDistrict;

  const safeFilter =
    FILTER_IDS.includes(
      activeFilter
    )
      ? activeFilter
      : "all";

  return (
    '<div class="ui-v2-city-page" data-ui="city-page" data-city-filter="' +
      escapeHtml(
        safeFilter
      ) +
    '">' +
      '<section class="ui-v2-city-hero">' +
        '<div class="ui-v2-city-hero__map-icon" data-image-slot="city-title-icon" aria-hidden="true"></div>' +
        '<div class="ui-v2-city-hero__copy">' +
          '<h1>城市地图</h1>' +
          '<p>发现优质商圈，拓展门店版图，让美食走进更多地方</p>' +
        '</div>' +
        '<div class="ui-v2-city-hero__summary">' +
          '<div class="ui-v2-city-summary-card">' +
            '<span data-image-slot="district-count" aria-hidden="true"></span>' +
            '<div>' +
              '<strong class="ui-v2-no-truncate-number">' +
                escapeHtml(
                  model.totalDistricts
                ) +
                '个商圈</strong>' +
              '<small>全城潜力区域</small>' +
            '</div>' +
          '</div>' +
          '<div class="ui-v2-city-summary-card">' +
            '<span data-image-slot="opened-store-count" aria-hidden="true"></span>' +
            '<div>' +
              '<strong class="ui-v2-no-truncate-number">' +
                escapeHtml(
                  model.openedDistricts
                ) +
                '个已开店商圈</strong>' +
              '<small>持续拓展中</small>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      renderFilters(
        model,
        safeFilter
      ) +
      renderMap(
        model,
        safeFilter,
        selected?.id ??
        null
      ) +
      renderDistrictDetail(
        selected,
        model.opportunities
      ) +
    '</div>'
  );
}

function mountCityPage(
  container,
  model,
  {
    onOpenProperties = null,
    onOpenOpportunities = null
  } = {}
) {
  if (
    !container ||
    typeof container.addEventListener !==
      "function"
  ) {
    throw new TypeError(
      "City page container must be a DOM element"
    );
  }

  let activeFilter =
    "all";

  let selectedDistrictId =
    model.selectedDistrict
      ?.id ??
    null;

  function render() {
    container.innerHTML =
      renderCityPage(
        model,
        {
          activeFilter,
          selectedDistrictId
        }
      );
  }

  function handleClick(
    event
  ) {
    const target =
      event.target;

    if (
      !target ||
      typeof target.closest !==
        "function"
    ) {
      return;
    }

    const filter =
      target.closest(
        "[data-city-filter]"
      );

    if (
      filter &&
      container.contains(
        filter
      )
    ) {
      activeFilter =
        FILTER_IDS.includes(
          filter.dataset.cityFilter
        )
          ? filter.dataset.cityFilter
          : "all";

      const selected =
        model.districts.find(
          item =>
            item.id ===
            selectedDistrictId
        );

      if (
        selected &&
        !isDistrictVisibleForFilter(
          selected,
          activeFilter
        )
      ) {
        selectedDistrictId =
          model.districts.find(
            item =>
              isDistrictVisibleForFilter(
                item,
                activeFilter
              )
          )?.id ??
          null;
      }

      render();

      return;
    }

    const district =
      target.closest(
        "[data-city-district]"
      );

    if (
      district &&
      container.contains(
        district
      )
    ) {
      selectedDistrictId =
        district.dataset
          .cityDistrict;

      render();

      return;
    }

    const action =
      target.closest(
        "[data-city-action]"
      );

    if (
      !action ||
      !container.contains(
        action
      )
    ) {
      return;
    }

    if (
      action.dataset.cityAction ===
      "open-properties" &&
      typeof onOpenProperties ===
        "function"
    ) {
      onOpenProperties(
        action.dataset
          .districtId ??
        selectedDistrictId
      );
    }

    if (
      action.dataset.cityAction ===
      "open-opportunities" &&
      typeof onOpenOpportunities ===
        "function"
    ) {
      onOpenOpportunities();
    }
  }

  container.addEventListener(
    "click",
    handleClick
  );

  render();

  return Object.freeze({
    getState() {
      return {
        activeFilter,
        selectedDistrictId
      };
    },

    destroy() {
      container.removeEventListener(
        "click",
        handleClick
      );

      container.replaceChildren();
    }
  });
}

export {
  renderCityPage,
  mountCityPage
};
