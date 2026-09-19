import {
  restaurantHomeDashboardSystem
} from "./RestaurantHomeDashboardSystem.js";

import {
  renderGameTopBar,
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


function metricValue(
  metric
) {
  if (
    metric.format ===
    "money"
  ) {
    return money(
      metric.value
    );
  }

  if (
    metric.format ===
    "rating"
  ) {
    return (
      Number(
        metric.value ??
        0
      ).toFixed(
        1
      ) +
      "★"
    );
  }

  if (
    metric.format ===
    "decimal"
  ) {
    return String(
      metric.value ??
      0
    );
  }

  return Number(
    metric.value ??
    0
  ).toLocaleString(
    "zh-CN"
  );
}


function statusText(
  status
) {
  if (
    status ===
    "open"
  ) {
    return "营业中";
  }

  if (
    status ===
    "paused"
  ) {
    return "暂停营业";
  }

  return "已闭店";
}


function renderImageSlot({
  id,
  label,
  className = "",
  source = null,
  fallback = null,
  fit = "cover",
  customDishId = null
}) {
  return `
    <div
      class="
        restaurant-image-slot
        ${className}
      "
      role="img"
      aria-label="${escapeHtml(
        label
      )}"
      data-image-slot="${escapeHtml(
        id
      )}"
      ${source
        ? `data-image-src="${escapeHtml(
            source
          )}"`
        : ""}
      ${fallback
        ? `data-image-fallback="${escapeHtml(
            fallback
          )}"`
        : ""}
      ${customDishId
        ? `data-custom-dish-id="${escapeHtml(
            customDishId
          )}"`
        : ""}
      data-image-fit="${escapeHtml(
        fit
      )}"
    ></div>
  `;
}


class RestaurantHomeView {
  constructor({
    root,
    restaurantId,
    pageSystem =
      restaurantHomeDashboardSystem,

    onNavigate = null,
    onRename = null
  }) {
    if (!root) {
      throw new Error(
        "Restaurant home view requires a root element"
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

    this.onRename =
      onRename;

    this.page =
      null;

    this.boundClick =
      event =>
        this.handleClick(
          event
        );
  }


  mount() {
    this.page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.root
      .addEventListener(
        "click",
        this.boundClick
      );

    this.render();

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


  refresh(
    page = null
  ) {
    this.page =
      page ??
      this.pageSystem
        .getPage(
          this.restaurantId
        );

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
          "门店营业总览",

        showSpeedControls:
          true
      }
    );
  }


  renderNotice(
    page
  ) {
    const notice =
      page.noticeTicker
        .current;

    return `
      <button
        type="button"
        class="
          store-notice
          store-notice--${
            notice?.type ??
            "info"
          }
        "
        data-action="notice"
        ${
          notice?.action
            ? `data-page-id="${escapeHtml(
                notice.action
              )}"`
            : ""
        }
      >

        <span class="store-notice__label">
          公告
        </span>

        <strong>
          ${
            notice
              ? escapeHtml(
                  notice.title
                )
              : "经营通报"
          }
        </strong>

        <span class="store-notice__text">
          ${
            notice
              ? escapeHtml(
                  notice.message
                )
              : "当前没有新的经营提醒"
          }
        </span>

        <b>
          ${
            page.noticeTicker
              .unreadCount
          }
        </b>

      </button>
    `;
  }


  renderHero(
    page
  ) {
    return `
      <section class="store-hero">

        <div class="store-hero__image">

          ${renderImageSlot({
            id:
              "restaurant-hero",

            label:
              "门店实景主图",

            className:
              "restaurant-image-slot--hero",

            source:
              "assets/images/scenes/restaurants/restaurant-home-hero.webp",

            fallback:
              "assets/images/scenes/restaurants/command-center-hero.webp"
          })}

          <div class="store-hero__overlay">

            <strong>
              ${
                escapeHtml(
                  page.restaurant
                    .name
                )
              }
            </strong>

            <span>
              ${
                escapeHtml(
                  page.scene
                    .propertyName
                )
              }
            </span>

          </div>

        </div>


        <aside class="store-hero__summary">

          <header>
            <strong>
              门店概况
            </strong>

            <span
              class="
                store-status
                store-status--${
                  page.restaurant
                    .status
                }
              "
            >
              ${
                statusText(
                  page.restaurant
                    .status
                )
              }
            </span>
          </header>


          <div class="store-summary-grid">

            <article>
              <span>
                建筑面积
              </span>

              <strong>
                ${
                  page.scene.area
                    ? `${page.scene.area}㎡`
                    : "未选址"
                }
              </strong>
            </article>

            <article>
              <span>
                当前餐位
              </span>

              <strong>
                ${
                  page.scene
                    .seats
                }个
              </strong>
            </article>

            <article>
              <span>
                装修状态
              </span>

              <strong>
                ${
                  page.scene
                    .renovationActive
                    ? `${
                        page.scene
                          .renovationGrade ??
                        "-"
                      }级 · ${
                        page.scene
                          .renovationScore ??
                        "-"
                      }分`
                    : "未启用"
                }
              </strong>
            </article>

            <article>
              <span>
                月租
              </span>

              <strong>
                ${
                  page.lease
                    ? money(
                        page.lease
                          .monthlyRent
                      )
                    : "--"
                }
              </strong>
            </article>

            <article>
              <span>
                租约剩余
              </span>

              <strong>
                ${
                  page.lease
                    ? `${
                        page.lease
                          .remainingDays
                      }天`
                    : "--"
                }
              </strong>
            </article>

            <article>
              <span>
                今日营业计划
              </span>

              <strong>
                ${
                  page.operating
                    .schedule
                    ?.enabled
                    ? `${
                        page.operating
                          .scheduledHours
                      }小时`
                    : "未设置"
                }
              </strong>
            </article>

          </div>


          <div class="store-hero__buttons">

            <button
              type="button"
              data-action="navigate"
              data-page-id="renovation"
              ${
                page.scene
                  .propertyId
                  ? ""
                  : "disabled"
              }
            >
              装修布局
            </button>

            <button
              type="button"
              data-action="navigate"
              data-page-id="lease"
              ${
                page.scene
                  .propertyId
                  ? ""
                  : "disabled"
              }
            >
              租约管理
            </button>

          </div>

        </aside>

      </section>
    `;
  }


  renderPeriods(
    page
  ) {
    const schedule =
      page.operating
        .schedule;

    return `
      <section class="store-period-panel">

        <header>
          <div>
            <strong>
              今日营业时段
            </strong>

            <span>
              ${
                schedule?.enabled
                  ? `${String(
                      schedule
                        .openHour
                    ).padStart(
                      2,
                      "0"
                    )}:00–${String(
                      schedule
                        .closeHour
                    ).padStart(
                      2,
                      "0"
                    )}:00`
                  : "尚未设置营业时间"
              }
            </span>
          </div>

          <b>
            ${
              statusText(
                page.restaurant
                  .status
              )
            }
          </b>
        </header>


        <div class="store-periods">

          ${
            page.operating
              .periods
              .map(
                item => `
                  <article
                    class="
                      ${
                        item.enabled
                          ? "is-enabled"
                          : ""
                      }
                      ${
                        item.current
                          ? "is-current"
                          : ""
                      }
                    "
                  >

                    <span>
                      ${item.label}
                    </span>

                    <strong>
                      ${String(
                        item.start
                      ).padStart(
                        2,
                        "0"
                      )}:00
                    </strong>

                    <small>
                      ${
                        item.current
                          ? "当前时段"
                          : item.enabled
                            ? "营业计划"
                            : "未覆盖"
                      }
                    </small>

                  </article>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderMetrics(
    page
  ) {
    return `
      <section class="store-kpis">

        ${
          page.dashboardMetrics
            .map(
              metric => `
                <article>

                  <span>
                    ${
                      escapeHtml(
                        metric.label
                      )
                    }
                  </span>

                  <strong>
                    ${
                      escapeHtml(
                        metricValue(
                          metric
                        )
                      )
                    }
                  </strong>

                  <small>
                    ${
                      escapeHtml(
                        metric.sub ??
                        "实时数据"
                      )
                    }
                  </small>

                </article>
              `
            )
            .join("")
        }

      </section>
    `;
  }


  renderTrend(
    page
  ) {
    const max =
      Math.max(
        1,
        ...page.trend
          .map(
            item =>
              item.revenue
          )
      );

    return `
      <section class="store-panel store-trend-panel">

        <header class="store-panel__title">
          <div>
            <strong>
              近7日销售趋势
            </strong>

            <span>
              根据真实完成订单统计
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="analytics"
          >
            经营数据 ›
          </button>
        </header>


        <div class="store-trend-chart">

          ${
            page.trend
              .map(
                item => {
                  const height =
                    Math.max(
                      5,
                      Math.round(
                        item.revenue /
                        max *
                        100
                      )
                    );

                  return `
                    <article>

                      <strong>
                        ${
                          item.revenue >
                          0
                            ? money(
                                item.revenue
                              )
                            : "¥0"
                        }
                      </strong>

                      <div class="store-trend-bar">

                        <i
                          style="
                            height:${height}%;
                          "
                        ></i>

                      </div>

                      <span>
                        第${item.day}天
                      </span>

                    </article>
                  `;
                }
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderOnboarding(
    page
  ) {
    const onboarding =
      page.onboarding;

    if (
      !onboarding ||
      onboarding.completed
    ) {
      return "";
    }

    const next =
      onboarding.nextStep;

    return `
      <section class="store-panel store-onboarding">

        <header class="store-panel__title">
          <div>
            <strong>
              开店引导
            </strong>

            <span>
              ${onboarding.completedCount}/${onboarding.totalSteps}
              ·
              ${onboarding.progress}%
            </span>
          </div>
        </header>

        <div class="store-onboarding__progress">
          <i
            style="width:${Math.max(
              0,
              Math.min(
                100,
                onboarding.progress
              )
            )}%"
          ></i>
        </div>

        <div class="store-onboarding__steps">
          ${onboarding.steps
            .map(
              step => `
                <button
                  type="button"
                  class="
                    store-onboarding__step
                    ${step.completed
                      ? "is-complete"
                      : step.id ===
                        next?.id
                        ? "is-current"
                        : ""
                    }
                  "
                  ${step.completed
                    ? "disabled"
                    : `data-action="navigate" data-page-id="${escapeHtml(
                        step.pageId
                      )}"`
                  }
                >
                  <b>
                    ${step.order}
                  </b>

                  <span>
                    ${escapeHtml(
                      step.title
                    )}
                  </span>
                </button>
              `
            )
            .join("")}
        </div>

        ${next
          ? `
            <button
              type="button"
              class="store-onboarding__next"
              data-action="navigate"
              data-page-id="${escapeHtml(
                next.pageId
              )}"
            >
              <span>
                下一步
              </span>

              <strong>
                ${escapeHtml(
                  next.title
                )}
              </strong>

              <small>
                ${escapeHtml(
                  next.description
                )}
              </small>
            </button>
          `
          : ""
        }

      </section>
    `;
  }


  renderLiveAndReminders(
    page
  ) {
    return `
      <section class="store-middle-grid">

        <section class="store-panel">

          <header class="store-panel__title">
            <div>
              <strong>
                门店营业现场
              </strong>

              <span>
                实时展示当前门店营业状态
              </span>
            </div>
          </header>


          ${renderImageSlot({
            id:
              "restaurant-live",

            label:
              "营业场景图",

            className:
              "restaurant-image-slot--live",

            source:
              "assets/images/scenes/restaurants/restaurant-live.webp",

            fallback:
              "assets/images/scenes/restaurants/command-center-hero.webp"
          })}


          <div class="store-live-stats">

            <span>
              员工
              <b>
                ${
                  page.employees
                    .active
                }
                /
                ${
                  page.employees
                    .total
                }
              </b>
            </span>

            <span>
              库存食材
              <b>
                ${
                  page.inventory
                    .ingredientKinds
                }种
              </b>
            </span>

            <span>
              平均出品
              <b>
                ${
                  page.today
                    .averageQuality ||
                  "-"
                }
              </b>
            </span>

          </div>

        </section>


        <section class="store-panel">

          <header class="store-panel__title">
            <div>
              <strong>
                经营建议
              </strong>

              <span>
                根据门店真实状态动态生成
              </span>
            </div>
          </header>


          <div class="store-reminder-list">

            ${
              page.reminders
                .length
                ? page.reminders
                    .map(
                      item => `
                        <button
                          type="button"
                          class="
                            store-reminder
                            store-reminder--${
                              item.type
                            }
                          "
                          ${
                            item.action
                              ? `data-action="navigate" data-page-id="${escapeHtml(
                                  item.action
                                )}"`
                              : ""
                          }
                        >

                          <span>
                            ${escapeHtml(
                              item.title
                            )}
                          </span>

                          <strong>
                            ${escapeHtml(
                              item.message
                            )}
                          </strong>

                        </button>
                      `
                    )
                    .join("")
                : `
                  <div class="store-reminder-empty">
                    当前没有需要处理的经营问题
                  </div>
                `
            }

          </div>

        </section>

      </section>
    `;
  }


  renderTopDishes(
    page
  ) {
    const dishes =
      [
        0,
        1,
        2
      ].map(
        index =>
          page.topDishes[
            index
          ] ??
          null
      );

    return `
      <section class="store-panel store-signature-panel">

        <header class="store-panel__title">

          <div>
            <strong>
              本店招牌菜
            </strong>

            <span>
              按近7日真实销量动态变化
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="dishes"
          >
            菜品中心 ›
          </button>

        </header>


        <div class="store-signature-grid">

          ${
            dishes.map(
              (
                dish,
                index
              ) => `
                <article
                  class="
                    store-signature-card
                    ${
                      dish
                        ? ""
                        : "is-empty"
                    }
                  "
                >

                  ${renderImageSlot({
                    id:
                      dish?.imageSlot ??
                      `signature-empty-${index + 1}`,

                    label:
                      dish?.name ??
                      `招牌菜${index + 1}`,

                    className:
                      "restaurant-image-slot--dish",

                    source:
                      dish?.image ??
                      null,

                    customDishId:
                      dish?.custom
                        ? dish.dishId
                        : null
                  })}

                  <div class="store-signature-card__body">

                    <span class="store-signature-rank">
                      TOP
                      ${index + 1}
                    </span>

                    <strong>
                      ${
                        escapeHtml(
                          dish?.name ??
                          "等待产生销量"
                        )
                      }
                    </strong>

                    <div>

                      <span>
                        销量
                        <b>
                          ${
                            dish?.sold ??
                            0
                          }
                        </b>
                      </span>

                      <span>
                        营收
                        <b>
                          ${
                            money(
                              dish?.revenue ??
                              0
                            )
                          }
                        </b>
                      </span>

                      <span>
                        品质
                        <b>
                          ${
                            dish?.quality ??
                            "-"
                          }
                        </b>
                      </span>

                    </div>

                  </div>

                </article>
              `
            ).join("")
          }

        </div>

      </section>
    `;
  }


  renderBusinessStatus(
    page
  ) {
    return `
      <section class="store-business-panel">

        <div>

          <span>
            当前经营状态
          </span>

          <strong>
            ${
              statusText(
                page.restaurant
                  .status
              )
            }
          </strong>

          <small>
            ${
              page.scene
                .propertyId
                ? `${
                    page.scene
                      .seats
                  }个餐位 · ${
                    page.employees
                      .active
                  }名员工在岗`
                : "尚未完成选址"
            }
          </small>

        </div>


        <div class="store-business-actions">

          <button
            type="button"
            data-action="navigate"
            data-page-id="analytics"
          >
            经营报表
          </button>

          <button
            type="button"
            class="
              store-business-main
              ${
                page.restaurant
                  .status ===
                "open"
                  ? "is-open"
                  : ""
              }
            "
            data-action="business"
            ${
              page.actions
                .canOpen ||
              page.actions
                .canClose
                ? ""
                : "disabled"
            }
          >
            ${
              page.restaurant
                .status ===
              "closed"
                ? "开始营业"
                : "结束营业"
            }
          </button>

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
            "restaurant"
        })
    );
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="restaurant-home-game">

        ${this.renderTopbar(
          page
        )}

        ${this.renderNotice(
          page
        )}

        ${this.renderHero(
          page
        )}

        ${this.renderPeriods(
          page
        )}

        ${this.renderMetrics(
          page
        )}

        ${this.renderTrend(
          page
        )}

        ${this.renderOnboarding(
          page
        )}

        ${this.renderLiveAndReminders(
          page
        )}

        ${this.renderTopDishes(
          page
        )}

        ${this.renderBusinessStatus(
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
      target.dataset.action;


    if (
      action ===
        "navigate" ||
      action ===
        "notice"
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

      return;
    }


    if (
      action ===
      "rename"
    ) {
      if (
        typeof this
          .onRename ===
          "function"
      ) {
        this.onRename(
          this.page
            .restaurant
            .name,

          nextName => {
            if (
              nextName
            ) {
              this.refresh(
                this.pageSystem
                  .rename(
                    this.restaurantId,
                    nextName
                  )
              );
            }
          }
        );
      }

      return;
    }


    if (
      action ===
      "pause"
    ) {
      this.refresh(
        this.page.topBar
          .clock.paused
          ? this.pageSystem
              .resumeTime(
                this.restaurantId
              )
          : this.pageSystem
              .pauseTime(
                this.restaurantId
              )
      );

      return;
    }


    if (
      action ===
      "speed"
    ) {
      this.refresh(
        this.pageSystem
          .setSpeed(
            this.restaurantId,
            Number(
              target.dataset
                .speed
            )
          )
      );

      return;
    }


    if (
      action ===
      "business"
    ) {
      this.refresh(
        this.pageSystem
          .toggleBusiness(
            this.restaurantId
          )
      );
    }
  }
}


export const restaurantHomeView = {
  mount(options) {
    return new RestaurantHomeView(
      options
    ).mount();
  }
};


export {
  RestaurantHomeView
};
