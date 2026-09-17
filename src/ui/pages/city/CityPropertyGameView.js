import {
  cityPropertyPageSystem
} from "./CityPropertyPageSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value) || 0
    ).toLocaleString("zh-CN")
  );
}


function scoreTone(value) {
  const n = Number(value) || 0;

  if (n >= 80) {
    return "excellent";
  }

  if (n >= 60) {
    return "good";
  }

  if (n >= 40) {
    return "normal";
  }

  return "weak";
}


function getPropertyImage(
  property,
  index = 0
) {
  return (
    property.image ??
    property.coverImage ??
    `assets/images/ui/properties/property-${index % 6 + 1}.webp`
  );
}


class CityPropertyGameView {
  constructor({
    pageSystem =
      cityPropertyPageSystem,

    onNavigate = null
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.root = null;

    this.restaurantId =
      null;

    this.selectedPropertyId =
      null;

    this.months = 12;

    this.offerId = null;

    this.filters = {};
  }


  mount(
    root,
    {
      restaurantId = null
    } = {}
  ) {
    if (!root) {
      throw new Error(
        "CityPropertyGameView root is required"
      );
    }

    this.root = root;

    this.restaurantId =
      restaurantId;

    this.renderMarketplace();

    return this;
  }


  buildTopBar(balance) {
    if (!this.restaurantId) {
      return {
        restaurantName:
          "城市房产中心",

        balance:
          balance ?? 0,

        storeLevel: 1,

        reputation: 0,

        clock: {
          dateText: "",
          clockText: ""
        },

        weather: null
      };
    }

    const restaurant =
      restaurantSystem.get(
        this.restaurantId
      );

    return buildGlobalTopBarModel({
      restaurantName:
        restaurant.name,

      balance:
        balance ?? 0,

      storeLevel:
        restaurant.level,

      reputation:
        restaurant.reputation,

      time:
        gameState.getSection(
          "time"
        ),

      runtime:
        gameState.getSection(
          "runtime"
        ),

      currentStoreId:
        this.restaurantId
    });
  }


  getBottomNavigation() {
    return [
      {
        label: "城市",
        target: "city",
        icon: "city",
        active: true
      },
      {
        label: "门店",
        target: "restaurant",
        icon: "store"
      },
      {
        label: "经营",
        target: "operations",
        icon: "operations"
      },
      {
        label: "员工",
        target: "employees",
        icon: "employees"
      },
      {
        label: "更多",
        target: "more",
        icon: "more"
      }
    ];
  }


  buildNotices(model) {
    const notices = [];

    const urgent =
      model.properties
        .filter(
          item =>
            item.competition
              ?.daysUntilPossibleClaim !==
              null &&
            item.competition
              ?.daysUntilPossibleClaim <=
              3
        )
        .length;

    if (urgent > 0) {
      notices.push({
        id:
          "property_competition",

        type:
          "warning",

        title:
          "房源快讯",

        message:
          `${urgent}套优质房源近期可能被其他经营者抢租`,

        priority:
          100
      });
    }

    if (
      model.balance !== null
    ) {
      const affordable =
        model.properties
          .filter(
            item =>
              item.quote
                ?.affordable !==
                false
          )
          .length;

      notices.push({
        id:
          "property_affordable",

        type:
          "info",

        title:
          "选址建议",

        message:
          `当前资金可覆盖${affordable}套房源的签约首付`,

        priority:
          50
      });
    }

    return buildNoticeTickerModel(
      notices
    );
  }


  renderDistrictTabs(model) {
    return `
      <section class="property-district-panel">

        <header>
          <div>
            <strong>
              热门商圈
            </strong>

            <span>
              不同商圈拥有不同客群与经营压力
            </span>
          </div>

          <button
            type="button"
            data-filter-action="clear"
          >
            全城房源
          </button>
        </header>


        <div class="property-district-strip">

          ${
            model.districts
              .map(
                district => `
                  <button
                    type="button"
                    class="
                      property-district-card
                      ${
                        model.filters
                          .districtId ===
                        district.id
                          ? "is-active"
                          : ""
                      }
                    "
                    data-district-id="${escapeHtml(
                      district.id
                    )}"
                  >

                    <strong>
                      ${escapeHtml(
                        district.name
                      )}
                    </strong>

                    <div>
                      <span>
                        客流
                        <b>
                          ${district.trafficIndex}
                        </b>
                      </span>

                      <span>
                        消费
                        <b>
                          ${district.spendingPower}
                        </b>
                      </span>

                      <span>
                        竞争
                        <b>
                          ${district.competition}
                        </b>
                      </span>
                    </div>

                    <small>
                      ${district.propertyCount}
                      套可租
                    </small>

                  </button>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderFilterBar(model) {
    return `
      <section class="property-filter-bar">

        <div class="property-filter-group">

          <span>
            面积
          </span>

          <button
            type="button"
            data-area-filter="small"
            class="${
              this.filters.maxArea ===
              150
                ? "is-active"
                : ""
            }"
          >
            30–150㎡
          </button>

          <button
            type="button"
            data-area-filter="medium"
            class="${
              this.filters.minArea ===
                151 &&
              this.filters.maxArea ===
                500
                ? "is-active"
                : ""
            }"
          >
            151–500㎡
          </button>

          <button
            type="button"
            data-area-filter="large"
            class="${
              this.filters.minArea ===
              501
                ? "is-active"
                : ""
            }"
          >
            500㎡以上
          </button>

        </div>


        <div class="property-filter-group">

          <span>
            条件
          </span>

          <button
            type="button"
            data-toggle-filter="foodServiceOnly"
            class="${
              this.filters
                .foodServiceOnly
                ? "is-active"
                : ""
            }"
          >
            可做餐饮
          </button>

          <button
            type="button"
            data-toggle-filter="exhaustRequired"
            class="${
              this.filters
                .exhaustRequired
                ? "is-active"
                : ""
            }"
          >
            可排烟
          </button>

        </div>


        <div class="property-market-count">

          <strong>
            ${model.properties.length}
          </strong>

          <span>
            套房源
          </span>

        </div>

      </section>
    `;
  }


  renderPropertyCard(
    property,
    index
  ) {
    const urgent =
      property.competition
        ?.daysUntilPossibleClaim !==
        null &&
      property.competition
        ?.daysUntilPossibleClaim <=
        3;

    const district =
      property.district ?? {};

    return `
      <article
        class="property-game-card"
        data-property-id="${escapeHtml(
          property.id
        )}"
      >

        <div
          class="property-game-card__image"
          style="
            --property-image:
              url('${getPropertyImage(
                property,
                index
              )}');
          "
        >

          <div class="property-card-badges">

            ${
              property.source ===
              "market"
                ? `
                  <span class="is-blue">
                    动态房源
                  </span>
                `
                : ""
            }

            ${
              property.qualityScore !==
              null
                ? `
                  <span class="is-gold">
                    ★
                    房源评分
                    ${property.qualityScore}
                  </span>
                `
                : ""
            }

            ${
              urgent
                ? `
                  <span class="is-danger">
                    抢租风险
                  </span>
                `
                : ""
            }

          </div>


          <div class="property-image-footer">

            ${
              property.listing
                ?.remainingDays !==
                null
                ? `
                  <span>
                    ⏱
                    ${property.listing.remainingDays}
                    天后下架
                  </span>
                `
                : ""
            }

          </div>

        </div>


        <div class="property-game-card__body">

          <header>

            <div>
              <strong>
                ${escapeHtml(
                  property.name
                )}
              </strong>

              <span>
                📍
                ${escapeHtml(
                  property.districtName
                )}
              </span>
            </div>

            <div class="property-rent">

              <strong>
                ${money(
                  property.monthlyRent
                )}
              </strong>

              <span>
                /月
              </span>

            </div>

          </header>


          <section class="property-core-metrics">

            <article>
              <strong>
                ${property.area}㎡
              </strong>
              <span>
                建筑面积
              </span>
            </article>

            <article>
              <strong>
                ${property.usableArea}㎡
              </strong>
              <span>
                可用面积
              </span>
            </article>

            <article>
              <strong>
                ${property.floorCount}层
              </strong>
              <span>
                楼层
              </span>
            </article>

            <article>
              <strong>
                ${
                  property.frontageMeters ??
                  "-"
                }m
              </strong>
              <span>
                门面
              </span>
            </article>

          </section>


          <section class="property-district-metrics">

            <article
              class="${scoreTone(
                district.trafficIndex
              )}"
            >
              <span>
                客流
              </span>

              <strong>
                ${
                  district.trafficIndex ??
                  "-"
                }
              </strong>
            </article>

            <article
              class="${scoreTone(
                district.spendingPower
              )}"
            >
              <span>
                消费力
              </span>

              <strong>
                ${
                  district.spendingPower ??
                  "-"
                }
              </strong>
            </article>

            <article
              class="${scoreTone(
                district.competition
              )}"
            >
              <span>
                竞争
              </span>

              <strong>
                ${
                  district.competition ??
                  "-"
                }
              </strong>
            </article>

          </section>


          <div class="property-feature-tags">

            <span
              class="${
                property
                  .foodServiceAllowed
                  ? "is-good"
                  : "is-bad"
              }"
            >
              ${
                property
                  .foodServiceAllowed
                  ? "✓ 可做餐饮"
                  : "× 餐饮受限"
              }
            </span>

            <span
              class="${
                property
                  .exhaustAllowed
                  ? "is-good"
                  : "is-bad"
              }"
            >
              ${
                property
                  .exhaustAllowed
                  ? "✓ 可排烟"
                  : "× 不可排烟"
              }
            </span>

            ${
              property
                .leaseTerms
                ?.negotiable
                ? `
                  <span class="is-gold">
                    可议价
                  </span>
                `
                : ""
            }

            ${
              property.parkingSpaces >
              0
                ? `
                  <span>
                    ${property.parkingSpaces}
                    车位
                  </span>
                `
                : ""
            }

          </div>


          <footer>

            <div>
              <span>
                签约首付
              </span>

              <strong>
                ${money(
                  property.quote
                    ?.upfront
                )}
              </strong>
            </div>

            ${
              property.competition
                ?.daysUntilPossibleClaim !==
                null
                ? `
                  <small>
                    ${
                      property
                        .competition
                        .daysUntilPossibleClaim
                    }
                    天内可能被抢租
                  </small>
                `
                : ""
            }

            <button
              type="button"
              data-property-open="${escapeHtml(
                property.id
              )}"
            >
              查看详情
            </button>

          </footer>

        </div>

      </article>
    `;
  }


  renderMarketplace(
    filters = {}
  ) {
    this.offerId = null;

    this.filters = {
      ...this.filters,
      ...filters
    };

    const model =
      this.pageSystem
        .getMarketplace({
          restaurantId:
            this.restaurantId,

          ...this.filters
        });

    const topBar =
      this.buildTopBar(
        model.balance
      );

    const noticeTicker =
      this.buildNotices(
        model
      );

    this.root.innerHTML = `
      <main class="rg-screen property-game-page">

        ${renderGameTopBar(
          topBar,
          {
            subtitle:
              "城市选址 · 房源市场"
          }
        )}

        ${renderNoticeTicker(
          noticeTicker
        )}

        ${renderPageTitle({
          title:
            "城市与房源",

          backTarget:
            "restaurant",

          helpLabel:
            "选址指南"
        })}


        ${this.renderDistrictTabs(
          model
        )}

        ${this.renderFilterBar(
          model
        )}


        <section class="property-market-summary">

          <div>
            <strong>
              动态房源市场
            </strong>

            <span>
              每7天滚动更新 · NPC经营者也会参与抢租
            </span>
          </div>

          <div>
            <span>
              30–10000㎡
            </span>

            <span>
              真实户型
            </span>

            <span>
              可议价
            </span>
          </div>

        </section>


        <section class="property-game-list">

          ${
            model.properties.length
              ? model.properties
                  .map(
                    (
                      property,
                      index
                    ) =>
                      this.renderPropertyCard(
                        property,
                        index
                      )
                  )
                  .join("")
              : `
                <div class="property-game-empty">
                  <strong>
                    当前没有符合条件的房源
                  </strong>

                  <span>
                    调整面积或商圈筛选条件
                  </span>
                </div>
              `
          }

        </section>


        ${renderBottomNavigation(
          this.getBottomNavigation()
        )}

      </main>
    `;

    this.bindMarketplace();

    return model;
  }


  bindMarketplace() {
    this.root
      .querySelectorAll(
        "[data-district-id]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.renderMarketplace({
                districtId:
                  button.dataset
                    .districtId
              });
            }
          );
        }
      );

    this.root
      .querySelector(
        '[data-filter-action="clear"]'
      )
      ?.addEventListener(
        "click",
        () => {
          this.filters = {};
          this.renderMarketplace();
        }
      );

    this.root
      .querySelectorAll(
        "[data-area-filter]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const id =
                button.dataset
                  .areaFilter;

              if (
                id === "small"
              ) {
                this.renderMarketplace({
                  minArea: 30,
                  maxArea: 150
                });
              } else if (
                id === "medium"
              ) {
                this.renderMarketplace({
                  minArea: 151,
                  maxArea: 500
                });
              } else {
                this.renderMarketplace({
                  minArea: 501,
                  maxArea: null
                });
              }
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-toggle-filter]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const key =
                button.dataset
                  .toggleFilter;

              this.renderMarketplace({
                [key]:
                  !this.filters[
                    key
                  ]
              });
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-property-open]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              this.renderDetail(
                button.dataset
                  .propertyOpen
              )
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset
                  .pageTarget
              );
            }
          );
        }
      );
  }


  renderDetail(
    propertyId,
    offerId = null
  ) {
    this.selectedPropertyId =
      propertyId;

    const model =
      this.pageSystem
        .getPropertyDetail(
          propertyId,
          this.restaurantId,
          this.months,
          offerId
        );

    this.months =
      model.quote.months;

    this.offerId =
      model.activeOffer
        ?.status ===
        "accepted"
        ? model.activeOffer.id
        : offerId;


    const property =
      model.property;

    const district =
      model.district;

    const terms =
      model.leaseTerms;

    const quote =
      model.quote;

    const topBar =
      this.buildTopBar(
        this.restaurantId
          ? undefined
          : null
      );


    const notices =
      buildNoticeTickerModel([
        property.competition
          ?.daysUntilPossibleClaim !==
          null
          ? {
              title:
                "房源提醒",

              message:
                `预计${property.competition.daysUntilPossibleClaim}天内可能出现其他抢租者`,

              type:
                "warning",

              priority:
                80
            }
          : null
      ].filter(Boolean));


    this.root.innerHTML = `
      <main class="rg-screen property-detail-game-page">

        ${renderGameTopBar(
          topBar,
          {
            subtitle:
              "房源考察 · 合同决策"
          }
        )}

        ${renderNoticeTicker(
          notices
        )}

        ${renderPageTitle({
          title:
            "房源详情",

          backTarget:
            "properties",

          helpLabel:
            "租赁说明"
        })}


        <section class="property-detail-hero">

          <div
            class="property-detail-hero__image"
            style="
              --property-image:
                url('${getPropertyImage(
                  property,
                  0
                )}');
            "
          >

            <button
              type="button"
              class="property-detail-back"
              data-back-properties
            >
              ‹ 房源列表
            </button>

            <div class="property-detail-hero__badges">

              ${
                property.qualityScore !==
                null
                  ? `
                    <span>
                      ★
                      ${property.qualityScore}
                    </span>
                  `
                  : ""
              }

              ${
                terms.negotiable
                  ? `
                    <span>
                      可议价
                    </span>
                  `
                  : ""
              }

              ${
                property.source ===
                "market"
                  ? `
                    <span>
                      动态房源
                    </span>
                  `
                  : ""
              }

            </div>

          </div>


          <div class="property-detail-hero__info">

            <header>

              <div>
                <small>
                  📍
                  ${escapeHtml(
                    property.districtName
                  )}
                </small>

                <h2>
                  ${escapeHtml(
                    property.name
                  )}
                </h2>

                <span>
                  房东：
                  ${escapeHtml(
                    model.landlord
                      ?.name ??
                    "业主"
                  )}
                </span>
              </div>

              <div class="property-detail-rent">

                <strong>
                  ${money(
                    property.monthlyRent
                  )}
                </strong>

                <span>
                  /月
                </span>

              </div>

            </header>


            <section class="property-detail-spec-grid">

              <article>
                <strong>
                  ${property.area}㎡
                </strong>
                <span>
                  建筑面积
                </span>
              </article>

              <article>
                <strong>
                  ${property.usableArea}㎡
                </strong>
                <span>
                  可用面积
                </span>
              </article>

              <article>
                <strong>
                  ${property.floorCount}层
                </strong>
                <span>
                  楼层
                </span>
              </article>

              <article>
                <strong>
                  ${
                    property
                      .frontageMeters ??
                    "-"
                  }m
                </strong>
                <span>
                  门面宽度
                </span>
              </article>

              <article>
                <strong>
                  ${
                    property
                      .ceilingHeight ??
                    "-"
                  }m
                </strong>
                <span>
                  层高
                </span>
              </article>

              <article>
                <strong>
                  ${property.parkingSpaces}
                </strong>
                <span>
                  停车位
                </span>
              </article>

            </section>

          </div>

        </section>


        <section class="property-detail-grid">

          <div class="property-detail-main">

            <section class="property-detail-panel">

              <header>
                <strong>
                  商圈经营环境
                </strong>
              </header>

              <div class="property-detail-district">

                <article>
                  <span>
                    客流指数
                  </span>

                  <strong>
                    ${
                      district
                        ?.trafficIndex ??
                      "-"
                    }
                  </strong>

                  <div>
                    <i
                      style="
                        width:${
                          Math.min(
                            100,
                            district
                              ?.trafficIndex ??
                            0
                          )
                        }%
                      "
                    ></i>
                  </div>
                </article>

                <article>
                  <span>
                    消费能力
                  </span>

                  <strong>
                    ${
                      district
                        ?.spendingPower ??
                      "-"
                    }
                  </strong>

                  <div>
                    <i
                      style="
                        width:${
                          Math.min(
                            100,
                            district
                              ?.spendingPower ??
                            0
                          )
                        }%
                      "
                    ></i>
                  </div>
                </article>

                <article>
                  <span>
                    竞争程度
                  </span>

                  <strong>
                    ${
                      district
                        ?.competition ??
                      "-"
                    }
                  </strong>

                  <div>
                    <i
                      style="
                        width:${
                          Math.min(
                            100,
                            district
                              ?.competition ??
                            0
                          )
                        }%
                      "
                    ></i>
                  </div>
                </article>

              </div>

            </section>


            <section class="property-detail-panel">

              <header>
                <strong>
                  餐饮适配
                </strong>
              </header>

              <div class="property-suitability-grid">

                <article
                  class="${
                    model.suitability
                      .foodServiceAllowed
                      ? "is-good"
                      : "is-bad"
                  }"
                >
                  <strong>
                    ${
                      model.suitability
                        .foodServiceAllowed
                        ? "✓"
                        : "×"
                    }
                  </strong>

                  <span>
                    餐饮许可
                  </span>
                </article>

                <article
                  class="${
                    model.suitability
                      .exhaustAllowed
                      ? "is-good"
                      : "is-bad"
                  }"
                >
                  <strong>
                    ${
                      model.suitability
                        .exhaustAllowed
                        ? "✓"
                        : "×"
                    }
                  </strong>

                  <span>
                    排烟条件
                  </span>
                </article>

                <article>
                  <strong>
                    ${property.floorCount}
                  </strong>

                  <span>
                    可装修楼层
                  </span>
                </article>

                <article>
                  <strong>
                    ${
                      property.floors
                        ?.reduce(
                          (
                            sum,
                            floor
                          ) =>
                            sum +
                            (
                              floor
                                .entranceCount ??
                              0
                            ),
                          0
                        ) ??
                      0
                    }
                  </strong>

                  <span>
                    出入口
                  </span>
                </article>

              </div>

            </section>


            <section class="property-detail-panel">

              <header>
                <strong>
                  房源标签
                </strong>
              </header>

              <div class="property-detail-tags">

                ${
                  model.suitability
                    .tags
                    .length
                    ? model.suitability
                        .tags
                        .map(
                          tag => `
                            <span>
                              ${escapeHtml(
                                tag
                              )}
                            </span>
                          `
                        )
                        .join("")
                    : `
                      <span>
                        标准商用房源
                      </span>
                    `
                }

              </div>

            </section>

          </div>


          <aside class="property-contract-panel">

            <header>
              <strong>
                租赁方案
              </strong>

              <span>
                当前
                ${quote.months}
                个月
              </span>
            </header>


            <section class="property-contract-items">

              <article>
                <span>
                  月租
                </span>

                <strong>
                  ${money(
                    quote.monthlyRent
                  )}
                </strong>
              </article>

              <article>
                <span>
                  押金
                </span>

                <strong>
                  ${money(
                    quote.deposit
                  )}
                </strong>
              </article>

              <article>
                <span>
                  物业费/月
                </span>

                <strong>
                  ${money(
                    quote.propertyFeeMonthly
                  )}
                </strong>
              </article>

              <article>
                <span>
                  转让费
                </span>

                <strong>
                  ${money(
                    quote.transferFee
                  )}
                </strong>
              </article>

              <article>
                <span>
                  免租期
                </span>

                <strong>
                  ${quote.rentFreeDays}
                  天
                </strong>
              </article>

            </section>


            ${
              model.activeOffer
                ? `
                  <section
                    class="
                      property-negotiation-result
                      is-${escapeHtml(
                        model.activeOffer
                          .status
                      )}
                    "
                  >

                    <strong>
                      ${
                        model.activeOffer
                          .status ===
                        "accepted"
                          ? "房东已接受报价"
                          : "房东提出还价"
                      }
                    </strong>

                    <span>
                      月租
                      ${money(
                        model.activeOffer
                          .monthlyRent
                      )}
                    </span>

                  </section>
                `
                : ""
            }


            <section class="property-upfront-cost">

              <span>
                签约首付
              </span>

              <strong>
                ${money(
                  quote.upfront
                )}
              </strong>

              <small>
                ${
                  quote.affordable ===
                  false
                    ? "当前资金不足"
                    : "资金可承担"
                }
              </small>

            </section>


            <div class="property-contract-actions">

              ${
                model.leaseState
                  .canNegotiate &&
                !model.activeOffer
                  ? `
                    <button
                      type="button"
                      class="property-negotiate-button"
                      data-negotiate
                    >
                      与房东议价
                    </button>
                  `
                  : ""
              }

              ${
                model.activeOffer
                  ?.status ===
                "countered"
                  ? `
                    <button
                      type="button"
                      class="property-counter-button"
                      data-accept-counter
                    >
                      接受房东还价
                    </button>
                  `
                  : ""
              }

              <button
                type="button"
                class="property-sign-button"
                data-sign-lease
                ${
                  !this.restaurantId ||
                  !model.leaseState
                    .canSign ||
                  model.activeOffer
                    ?.status ===
                    "countered"
                    ? "disabled"
                    : ""
                }
              >
                ${
                  model.leaseState
                    .hasActiveLease
                    ? "当前门店已有租约"
                    : quote
                        .affordable ===
                        false
                      ? "资金不足"
                      : "确认签约"
                }
              </button>

            </div>

          </aside>

        </section>


        ${renderBottomNavigation(
          this.getBottomNavigation()
        )}

      </main>
    `;

    this.bindDetail(model);

    return model;
  }


  bindDetail(model) {
    this.root
      .querySelector(
        "[data-back-properties]"
      )
      ?.addEventListener(
        "click",
        () =>
          this.renderMarketplace()
      );


    this.root
      .querySelector(
        "[data-negotiate]"
      )
      ?.addEventListener(
        "click",
        () =>
          this.negotiateSelected(
            model
          )
      );


    this.root
      .querySelector(
        "[data-accept-counter]"
      )
      ?.addEventListener(
        "click",
        () => {
          const offer =
            this.pageSystem
              .acceptCounter(
                model.activeOffer.id
              );

          this.offerId =
            offer.id;

          this.renderDetail(
            this.selectedPropertyId,
            offer.id
          );
        }
      );


    this.root
      .querySelector(
        "[data-sign-lease]"
      )
      ?.addEventListener(
        "click",
        () =>
          this.signSelected()
      );


    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset
                  .pageTarget
              );
            }
          );
        }
      );
  }


  negotiateSelected(model) {
    if (
      !this.restaurantId ||
      !this.selectedPropertyId
    ) {
      throw new Error(
        "Restaurant and property must be selected before negotiation"
      );
    }

    const requestedRent =
      Math.round(
        model.property
          .monthlyRent *
        0.97
      );

    const requestedRentFreeDays =
      Math.min(
        7,
        model.leaseTerms
          .rentFreeMaxDays ??
        0
      );

    const result =
      this.pageSystem
        .negotiateLease({
          restaurantId:
            this.restaurantId,

          propertyId:
            this.selectedPropertyId,

          months:
            this.months,

          requestedRent,

          requestedRentFreeDays
        });

    this.offerId =
      result.offer.status ===
      "accepted"
        ? result.offer.id
        : null;

    this.renderDetail(
      this.selectedPropertyId,
      this.offerId
    );

    return result;
  }


  signSelected() {
    if (
      !this.restaurantId ||
      !this.selectedPropertyId
    ) {
      throw new Error(
        "Restaurant and property must be selected before lease signing"
      );
    }

    const detail =
      this.pageSystem
        .getPropertyDetail(
          this.selectedPropertyId,
          this.restaurantId,
          this.months,
          this.offerId
        );

    const offerId =
      detail.activeOffer
        ?.status ===
        "accepted"
        ? detail.activeOffer.id
        : null;

    const result =
      this.pageSystem
        .signLease({
          restaurantId:
            this.restaurantId,

          propertyId:
            this.selectedPropertyId,

          months:
            this.months,

          offerId
        });

    this.onNavigate?.(
      result.nextPage,
      result
    );

    return result;
  }
}


export const cityPropertyGameView =
  new CityPropertyGameView();

export {
  CityPropertyGameView
};
