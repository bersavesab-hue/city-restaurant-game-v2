import {
  openingSetupPageSystem
} from "./OpeningSetupPageSystem.js";

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


class OpeningSetupView {
  constructor({
    pageSystem =
      openingSetupPageSystem,

    onNavigate = null
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.root =
      null;

    this.restaurantId =
      null;

    this.page =
      null;

    this.message =
      "";
  }


  mount(
    root,
    {
      restaurantId
    }
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.render();

    return this;
  }


  renderSteps(
    status
  ) {
    return `
      <section class="opening-flow-panel">

        <header>
          <strong>
            开业准备流程
          </strong>

          <span>
            8项准备 + 正式营业
          </span>
        </header>


        <div class="opening-step-line opening-step-line--nine">

          ${
            status.steps
              .map(
                (
                  step,
                  index
                ) => `
                  <article
                    class="
                      opening-flow-step
                      opening-flow-step--${step.state}
                    "
                  >

                    <div class="opening-flow-step__number">
                      ${
                        step.complete
                          ? "✓"
                          : index + 1
                      }
                    </div>

                    <div class="opening-flow-step__copy">

                      <small>
                        STEP ${index + 1}
                      </small>

                      <strong>
                        ${escapeHtml(
                          step.label
                        )}
                      </strong>

                      <span>
                        ${escapeHtml(
                          step.description
                        )}
                      </span>

                    </div>

                    <b
                      class="
                        opening-step-status
                        ${
                          step.complete
                            ? "is-complete"
                            : step.state ===
                              "current"
                              ? "is-current"
                              : ""
                        }
                      "
                    >
                      ${
                        step.complete
                          ? "已完成"
                          : step.state ===
                            "current"
                            ? "当前任务"
                            : "待完成"
                      }
                    </b>

                  </article>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderPermitPanel(
    page
  ) {
    return `
      <section class="opening-detail-panel">

        <header>
          <div>
            <strong>
              证照与开业许可
            </strong>

            <span>
              根据房源、装修与菜单自动判断必要项目
            </span>
          </div>

          <b>
            ${page.permits.issuedCount}
            /
            ${page.permits.requiredCount}
          </b>
        </header>


        <div class="opening-permit-list">

          ${
            page.permits.permits
              .map(
                permit => `
                  <article
                    class="
                      ${
                        !permit.required
                          ? "is-optional"
                          : permit.issued
                            ? "is-complete"
                            : permit.ready
                              ? "is-ready"
                              : "is-blocked"
                      }
                    "
                  >

                    <span>
                      ${
                        permit.issued
                          ? "✓"
                          : permit.required
                            ? "•"
                            : "—"
                      }
                    </span>

                    <div>
                      <strong>
                        ${escapeHtml(
                          permit.name
                        )}
                      </strong>

                      <small>
                        ${escapeHtml(
                          permit.reason
                        )}
                      </small>
                    </div>

                  </article>
                `
              )
              .join("")
          }

        </div>


        <button
          type="button"
          class="opening-sub-action"
          data-opening-action="permits"
          ${
            page.permits.complete ||
            !page.permits
              .allRequirementsReady
              ? "disabled"
              : ""
          }
        >
          ${
            page.permits.complete
              ? "许可检查已完成"
              : "完成开业许可检查"
          }
        </button>

      </section>
    `;
  }


  renderStockPanel(
    page
  ) {
    return `
      <section class="opening-detail-panel">

        <header>
          <div>
            <strong>
              首批食材准备
            </strong>

            <span>
              按当前营业菜单准备约${page.stock.targetServings}份基础库存
            </span>
          </div>

          <b>
            ${page.stock.stockedCount}
            /
            ${page.stock.ingredientCount}
          </b>
        </header>


        <div class="opening-stock-list">

          ${
            page.stock.items.length
              ? page.stock.items
                  .map(
                    item => `
                      <article
                        class="${
                          item.ready
                            ? "is-complete"
                            : item.pending >
                              0
                              ? "is-pending"
                              : "is-missing"
                        }"
                      >

                        <div>
                          <strong>
                            ${escapeHtml(
                              item.name
                            )}
                          </strong>

                          <small>
                            需要
                            ${item.requiredQuantity}
                            ${escapeHtml(
                              item.unit
                            )}
                          </small>
                        </div>

                        <span>
                          库存
                          ${item.available}
                        </span>

                        <span>
                          在途
                          ${item.pending}
                        </span>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="opening-stock-empty">
                  设置营业菜单后自动生成首批采购需求
                </div>
              `
          }

        </div>


        <button
          type="button"
          class="opening-sub-action"
          data-opening-action="stock"
          ${
            page.stock.complete ||
            page.stock.recipeCount ===
              0
              ? "disabled"
              : ""
          }
        >
          ${
            page.stock.complete
              ? "首批食材已备齐"
              : page.stock.pendingCount >
                0
                ? "补充仍缺少的食材"
                : "采购首批食材"
          }
        </button>

      </section>
    `;
  }


  renderMarkup(
    page
  ) {
    const status =
      page.status;

    const next =
      status.nextAction;


    return `
      <main class="rg-screen opening-setup-page">

        ${renderGameTopBar(
          page.topBar,
          {
            locationLabel:
              page.location
                .district ??
              "首店筹备",

            subtitle:
              "从第一家小店开始"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "开店准备",

          backTarget:
            "restaurant",

          helpLabel:
            "开店指南"
        })}


        ${
          this.message
            ? `
              <section class="opening-message">
                ${escapeHtml(
                  this.message
                )}
              </section>
            `
            : ""
        }


        <section class="opening-hero-panel">

          <div class="opening-hero-copy">

            <span>
              开业准备完成度
            </span>

            <strong>
              ${status.preparation.percent}%
            </strong>

            <small>
              ${status.preparation.complete}
              /
              ${status.preparation.total}
              项准备已经完成
            </small>

          </div>


          <div class="opening-progress-ring">

            <div
              style="
                --opening-progress:${status.preparation.percent}%;
              "
            >
              <strong>
                ${status.preparation.percent}
              </strong>

              <span>%</span>
            </div>

          </div>

        </section>


        <section class="opening-metrics">

          ${
            page.metrics
              .map(
                metric => `
                  <article class="opening-metric">

                    <span>
                      ${escapeHtml(
                        metric.label
                      )}
                    </span>

                    <strong>
                      ${escapeHtml(
                        metric.value
                      )}
                    </strong>

                  </article>
                `
              )
              .join("")
          }

        </section>


        ${this.renderSteps(
          status
        )}


        <section class="opening-readiness-grid">

          ${this.renderPermitPanel(
            page
          )}

          ${this.renderStockPanel(
            page
          )}

        </section>


        <section class="opening-current-task">

          <header>

            <span>
              当前最重要任务
            </span>

            <strong>
              ${escapeHtml(
                next.label
              )}
            </strong>

          </header>


          <div class="opening-current-task__body">

            <div class="opening-current-task__icon">
              ${escapeHtml(
                next.icon
              )}
            </div>

            <div>
              <strong>
                ${escapeHtml(
                  next.description
                )}
              </strong>

              <span>
                必须完成当前条件后，下一阶段才会解锁。
              </span>
            </div>

          </div>


          ${
            next.id ===
            "permits"
              ? `
                <button
                  type="button"
                  class="opening-main-action"
                  data-opening-action="permits"
                  ${
                    page.permits
                      .allRequirementsReady
                      ? ""
                      : "disabled"
                  }
                >
                  完成许可检查
                </button>
              `
              : next.id ===
                "stock"
                ? `
                  <button
                    type="button"
                    class="opening-main-action"
                    data-opening-action="stock"
                    ${
                      page.stock.recipeCount >
                      0
                        ? ""
                        : "disabled"
                    }
                  >
                    采购首批食材
                  </button>
                `
                : next.id ===
                  "schedule"
                  ? `
                    <button
                      type="button"
                      class="opening-main-action"
                      data-opening-action="schedule"
                    >
                      设置09:00–22:00营业
                    </button>
                  `
                  : next.id ===
                    "inspection"
                    ? `
                      <button
                        type="button"
                        class="opening-main-action"
                        disabled
                      >
                        正在等待全部条件通过
                      </button>
                    `
                    : next.id ===
                      "opening"
                      ? `
                        <button
                          type="button"
                          class="opening-main-action opening-main-action--gold"
                          data-opening-action="open"
                          ${
                            status.canOpen
                              ? ""
                              : "disabled"
                          }
                        >
                          ★ 正式营业
                        </button>
                      `
                      : `
                        <button
                          type="button"
                          class="opening-main-action"
                          data-page-target="${escapeHtml(
                            next.target
                          )}"
                        >
                          去完成 ·
                          ${escapeHtml(
                            next.label
                          )}
                        </button>
                      `
          }

        </section>


        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                this.restaurantId,

              activePageId:
                "opening-setup"
            })
        )}

      </main>
    `;
  }


  render() {
    this.page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );


    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );


    this.bind();

    return this.page;
  }


  bind() {
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
                  .pageTarget,

                this.restaurantId
              );
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        '[data-opening-action="permits"]'
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem
                  .completePermits(
                    this.restaurantId
                  );

                this.message =
                  "开业许可检查已经完成";

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        '[data-opening-action="stock"]'
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                const result =
                  this.pageSystem
                    .purchaseStarterStock(
                      this.restaurantId
                    );


                const count =
                  result.result
                    .orders
                    .length;


                this.message =
                  count > 0
                    ? `已创建${count}张首批采购单，食材送达后自动通过库存检查`
                    : "当前缺少的食材已经在配送中";

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    this.root
      .querySelector(
        '[data-opening-action="schedule"]'
      )
      ?.addEventListener(
        "click",
        () => {
          this.pageSystem
            .configureSchedule(
              this.restaurantId,
              {
                openHour:
                  9,

                closeHour:
                  22
              }
            );


          this.message =
            "营业时间已经设置";

          this.render();
        }
      );


    this.root
      .querySelector(
        '[data-opening-action="open"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const result =
              this.pageSystem
                .openRestaurant(
                  this.restaurantId
                );


            this.onNavigate?.(
              result.nextPage,

              this.restaurantId,

              result
            );
          } catch (
            error
          ) {
            this.message =
              error.message;

            this.render();
          }
        }
      );
  }
}


export const openingSetupView =
  new OpeningSetupView();


export {
  OpeningSetupView
};
