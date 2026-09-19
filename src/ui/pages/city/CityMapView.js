import {
  cityMapDashboardSystem
} from "./CityMapDashboardSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      Number(value) ||
      0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function scoreClass(
  value
) {
  const score =
    Number(value) ||
    0;

  if (
    score >= 80
  ) {
    return "is-high";
  }

  if (
    score >= 60
  ) {
    return "is-good";
  }

  if (
    score >= 40
  ) {
    return "is-normal";
  }

  return "is-low";
}


function renderImageSlot(
  id,
  label,
  className = ""
) {
  return `
    <div
      class="
        city-image-slot
        ${className}
      "
      role="img"
      aria-label="${escapeHtml(
        label
      )}"
      data-image-slot="${escapeHtml(
        id
      )}"
    ></div>
  `;
}


class CityMapView {
  constructor({
    root,
    restaurantId = null,
    pageSystem =
      cityMapDashboardSystem,

    onNavigate = null
  }) {
    if (!root) {
      throw new Error(
        "CityMapView requires a root element"
      );
    }

    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.selectedDistrictId =
      null;

    this.page =
      null;

    this.boundClick =
      event =>
        this.handleClick(
          event
        );
  }


  mount() {
    this.refresh();

    this.root
      .addEventListener(
        "click",
        this.boundClick
      );

    return this;
  }


  destroy() {
    this.root
      .removeEventListener(
        "click",
        this.boundClick
      );

    this.root.innerHTML =
      "";
  }


  refresh() {
    this.page =
      this.pageSystem
        .getPage({
          restaurantId:
            this.restaurantId,

          selectedDistrictId:
            this.selectedDistrictId
        });

    this.selectedDistrictId =
      this.page.map
        .selectedDistrictId;

    this.render();

    return this.page;
  }


  renderTopbar(
    page
  ) {
    return renderGameTopBar(
      page.topBar,
      {
        subtitle:
          "城市选址中心"
      }
    );
  }


  renderNotice(
    page
  ) {
    return renderNoticeTicker(
      page.noticeTicker
    );
  }


  renderTitle(
    page
  ) {
    return renderPageTitle({
      title:
        "商圈与房源",

      subtitle:
        `开放${page.citySummary.districtCount}个商圈 · ${page.citySummary.propertyCount}套可租房源`,

      rightHtml:
        `
          <div class="city-title-slogan">
            选对位置，开创美食未来！
          </div>
        `
    });
  }


  renderSummary(
    page
  ) {
    const summary =
      page.citySummary;

    return `
      <section class="city-summary">

        <article>
          <span>
            开放商圈
          </span>

          <strong>
            ${
              summary
                .districtCount
            }
          </strong>

          <small>
            个
          </small>
        </article>


        <article>
          <span>
            可租房源
          </span>

          <strong>
            ${
              summary
                .propertyCount
            }
          </strong>

          <small>
            套
          </small>
        </article>


        <article>
          <span>
            平均客流
          </span>

          <strong>
            ${
              summary
                .averageTraffic
            }
          </strong>

          <small>
            /100
          </small>
        </article>


        <article>
          <span>
            平均消费力
          </span>

          <strong>
            ${
              summary
                .averageSpending
            }
          </strong>

          <small>
            /100
          </small>
        </article>


        <article>
          <span>
            平均竞争
          </span>

          <strong>
            ${
              summary
                .averageCompetition
            }
          </strong>

          <small>
            /100
          </small>
        </article>

      </section>
    `;
  }


  renderMap(
    page
  ) {
    return `
      <section class="city-map-panel">

        <div class="city-map-panel__canvas">

          ${renderImageSlot(
            "city-main-map",
            "城市地图底图",
            "city-image-slot--map"
          )}


          <div class="city-map-tools">
            <div
              class="city-map-compass"
              aria-hidden="true"
            >
              <strong>N</strong>
              <span>◆</span>
            </div>

            <button
              type="button"
              class="city-map-all-districts"
              data-action="navigate"
              data-page-id="properties"
            >
              全部${page.map.totalDistrictCount}商圈
            </button>
          </div>


          <div class="city-map-pins">

            ${
              page.map
                .districts
                .map(
                  district => `
                    <button
                      type="button"
                      class="
                        city-map-pin
                        ${
                          page.map
                            .selectedDistrictId ===
                          district.id
                            ? "is-active"
                            : ""
                        }
                      "
                      data-action="select-district"
                      data-district-id="${escapeHtml(
                        district.id
                      )}"
                      style="
                        left:${district.position.x}%;
                        top:${district.position.y}%;
                      "
                    >

                      <span class="city-map-pin__dot">
                        ●
                      </span>

                      <strong>
                        ${escapeHtml(
                          district.name
                        )}
                      </strong>

                      <small>
                        客流 ${
                          district
                            .trafficIndex
                        }
                        · 消费 ${
                          district
                            .spendingPower
                        }
                      </small>

                    </button>
                  `
                )
                .join("")
            }

          </div>


          <div class="city-map-legend">

            <span>
              <i class="is-active"></i>
              当前商圈
            </span>

            <span>
              <i></i>
              可选商圈
            </span>

          </div>

        </div>


        ${
          this.renderDistrictDetail(
            page.selectedDistrict
          )
        }

      </section>
    `;
  }


  renderDistrictDetail(
    district
  ) {
    if (!district) {
      return `
        <aside class="city-district-detail">

          <div class="city-district-empty">
            当前没有可用商圈
          </div>

        </aside>
      `;
    }

    return `
      <aside class="city-district-detail">

        <header>

          <div>
            <span>
              当前商圈
            </span>

            <strong>
              ${escapeHtml(
                district.name
              )}
            </strong>
          </div>

          <b>
            ${
              district
                .propertyCount
            }套
          </b>

        </header>


        <section class="city-district-scores">

          <article
            class="${scoreClass(
              district
                .trafficIndex
            )}"
          >

            <span>
              客流
            </span>

            <strong>
              ${
                district
                  .trafficIndex
            }
            </strong>

            <div>
              <i
                style="
                  width:${district.trafficIndex}%;
                "
              ></i>
            </div>

          </article>


          <article
            class="${scoreClass(
              district
                .spendingPower
            )}"
          >

            <span>
              消费力
            </span>

            <strong>
              ${
                district
                  .spendingPower
            }
            </strong>

            <div>
              <i
                style="
                  width:${district.spendingPower}%;
                "
              ></i>
            </div>

          </article>


          <article
            class="${scoreClass(
              district
                .competition
            )}"
          >

            <span>
              竞争
            </span>

            <strong>
              ${
                district
                  .competition
            }
            </strong>

            <div>
              <i
                style="
                  width:${district.competition}%;
                "
              ></i>
            </div>

          </article>

        </section>


        <section class="city-district-economy">

          <article>
            <span>
              平均房租
            </span>

            <strong>
              ${
                district
                  .averageRent >
                0
                  ? money(
                      district
                        .averageRent
                    )
                  : "--"
              }
            </strong>
          </article>

          <article>
            <span>
              可租房源
            </span>

            <strong>
              ${
                district
                  .propertyCount
              }套
            </strong>
          </article>

        </section>


        <section class="city-customer-mix">

          <header>
            客群结构
          </header>

          ${
            district
              .customerMix
              .length
              ? district
                  .customerMix
                  .slice(
                    0,
                    4
                  )
                  .map(
                    item => `
                      <article>

                        <span>
                          ${escapeHtml(
                            item.id
                          )}
                        </span>

                        <div>
                          <i
                            style="
                              width:${item.percent}%;
                            "
                          ></i>
                        </div>

                        <strong>
                          ${item.percent}%
                        </strong>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="city-customer-mix__empty">
                  暂无客群细分数据
                </div>
              `
          }

        </section>


        ${
          district
            .recommendedPropertyId
            ? `
              <section class="city-district-recommend">

                <span>
                  推荐关注
                </span>

                <strong>
                  ${escapeHtml(
                    district
                      .recommendedPropertyName
                  )}
                </strong>

              </section>
            `
            : ""
        }


        <button
          type="button"
          class="city-district-main-action"
          data-action="open-district-properties"
          data-district-id="${escapeHtml(
            district.id
          )}"
        >
          查看本商圈房源
        </button>

      </aside>
    `;
  }


  renderFilters() {
    const filters = [
      { label: "面积", value: "30㎡–10000㎡" },
      { label: "月租预算", value: "不限" },
      { label: "房型", value: "不限" },
      { label: "客流", value: "不限" },
      { label: "楼层", value: "不限" },
      { label: "餐饮条件", value: "可做餐饮" },
      { label: "后厨条件", value: "可排烟" }
    ];

    return `
      <section class="city-filter-panel city-filter-panel--compact">
        <div class="city-filter-grid">
          ${filters
            .map(
              (filter, index) => `
                <button
                  type="button"
                  class="${index === 0 ? "is-primary" : ""}"
                  data-action="navigate"
                  data-page-id="properties"
                >
                  <span>${filter.label}</span>
                  <strong>${filter.value}</strong>
                  <small>⌄</small>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  renderRecommended(
    page
  ) {
    return `
      <section class="city-property-recommend">

        <header>

          <div>
            <strong>
              今日推荐房源
            </strong>

            <span>
              根据房源品质、租金和商圈指标动态排序
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            全部房源 ›
          </button>

        </header>


        <div class="city-property-grid">

          ${
            page.recommendedProperties
              .length
              ? page
                  .recommendedProperties
                  .map(
                    property => `
                      <article class="city-property-card">

                        ${renderImageSlot(
                          property.imageSlot,
                          "房源实景",
                          "city-image-slot--property"
                        )}


                        <div class="city-property-card__body">

                          <header>

                            <div>
                              <strong>
                                ${escapeHtml(
                                  property.name
                                )}
                              </strong>

                              <span>
                                ${escapeHtml(
                                  property.districtName
                                )}
                              </span>
                            </div>

                            ${
                              property.qualityScore !==
                              null &&
                              property.qualityScore !==
                              undefined
                                ? `
                                  <b>
                                    ★
                                    ${property.qualityScore}
                                  </b>
                                `
                                : ""
                            }

                          </header>


                          <section class="city-property-main-info">

                            <article>
                              <span>
                                面积
                              </span>

                              <strong>
                                ${property.area}㎡
                              </strong>
                            </article>

                            <article>
                              <span>
                                月租
                              </span>

                              <strong>
                                ${money(
                                  property.monthlyRent
                                )}
                              </strong>
                            </article>

                            <article>
                              <span>
                                客流
                              </span>

                              <strong>
                                ${property.trafficIndex}
                              </strong>
                            </article>

                          </section>


                          <div class="city-property-tags">

                            ${
                              property
                                .foodServiceAllowed
                                ? `
                                  <span class="is-good">
                                    可餐饮
                                  </span>
                                `
                                : `
                                  <span class="is-bad">
                                    餐饮受限
                                  </span>
                                `
                            }

                            ${
                              property
                                .exhaustAllowed
                                ? `
                                  <span class="is-good">
                                    可排烟
                                  </span>
                                `
                                : `
                                  <span class="is-bad">
                                    不可排烟
                                  </span>
                                `
                            }

                            ${
                              property
                                .affordable
                                ? `
                                  <span class="is-gold">
                                    资金可承担
                                  </span>
                                `
                                : `
                                  <span class="is-bad">
                                    首付不足
                                  </span>
                                `
                            }

                          </div>


                          <button
                            type="button"
                            data-action="open-property"
                            data-property-id="${escapeHtml(
                              property.id
                            )}"
                          >
                            查看房源详情
                          </button>

                        </div>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="city-property-empty">
                  当前没有推荐房源
                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderBottomNav(
    page
  ) {
    return renderBottomNavigation(
      gameChromeSystem
        .getNavigation({
          restaurantId:
            this.restaurantId,

          activePageId:
            "city"
        })
    );
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="city-map-game">

        ${this.renderTopbar(
          page
        )}

        ${this.renderNotice(
          page
        )}

        ${this.renderTitle(
          page
        )}

        ${this.renderSummary(
          page
        )}

        ${this.renderMap(
          page
        )}

        ${this.renderFilters()}

        ${this.renderRecommended(
          page
        )}

        ${this.renderBottomNav(
          page
        )}

      </main>
    `;
  }


  render() {
    if (!this.page) {
      return;
    }

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );
  }


  handleClick(
    event
  ) {
    const target =
      event.target.closest?.(
        "[data-action]"
      );

    if (
      !target ||
      !this.root.contains(
        target
      )
    ) {
      return;
    }

    const action =
      target.dataset
        .action;


    if (
      action ===
      "select-district"
    ) {
      this.selectedDistrictId =
        target.dataset
          .districtId;

      this.refresh();

      return;
    }


    if (
      action ===
      "open-district-properties"
    ) {
      const districtId =
        target.dataset
          .districtId;

      this.onNavigate?.(
        "properties",
        this.restaurantId,
        {
          districtId
        }
      );

      return;
    }


    if (
      action ===
      "open-property"
    ) {
      this.onNavigate?.(
        "property_detail",
        this.restaurantId,
        {
          propertyId:
            target.dataset
              .propertyId
        }
      );

      return;
    }


    if (
      action ===
      "navigate"
    ) {
      const pageId =
        target.dataset
          .pageId;

      if (
        pageId &&
        typeof this
          .onNavigate ===
          "function"
      ) {
        this.onNavigate(
          pageId,
          this.restaurantId
        );
      }
    }
  }
}


export const cityMapView = {
  mount(options) {
    return new CityMapView(
      options
    ).mount();
  }
};


export {
  CityMapView
};
