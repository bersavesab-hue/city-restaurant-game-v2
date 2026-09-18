import {
  renovationConstructionPageSystem
} from "./RenovationConstructionPageSystem.js";

import {
  eventBus
} from "../../core/EventBus.js";


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


function renderSlot(
  id,
  label
) {
  return `
    <div
      class="construction-image-slot"
      data-image-slot="${escapeHtml(
        id
      )}"
    >
      <span>
        ▦
      </span>

      <strong>
        ${escapeHtml(
          label
        )}
      </strong>

      <small>
        图片槽位
      </small>
    </div>
  `;
}


class RenovationConstructionView {
  constructor({
    root = null,
    restaurantId = null,
    pageSystem =
      renovationConstructionPageSystem,

    onNavigate = null
  } = {}) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.page =
      null;

    this.message =
      "";


    this.unsubscribeConstructionReady =
      null;
  }


  mount(
    root = this.root,
    {
      restaurantId =
        this.restaurantId
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;


    this.unsubscribeConstructionReady
      ?.();

    this.unsubscribeConstructionReady =
      eventBus.on(
        "renovationConstruction:ready",
        ({
          restaurantId:
            changedRestaurantId
        }) => {
          if (
            changedRestaurantId !==
            this.restaurantId
          ) {
            return;
          }


          this.message =
            "装修工程已经完工，可以进行验收";

          this.refresh();
        }
      );


    this.refresh();

    return this;
  }


  destroy() {
    this.unsubscribeConstructionReady
      ?.();

    this.unsubscribeConstructionReady =
      null;
  }


  refresh() {
    this.page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.render();

    return this.page;
  }


  renderMarkup(
    page
  ) {
    const construction =
      page.construction;

    const progress =
      page.progress;


    return `
      <main class="construction-page">

        <header class="construction-hud">

          <div>
            <strong>
              ${escapeHtml(
                page.restaurant
                  .name
              )}
            </strong>

            <span>
              装修工程中心
            </span>
          </div>

          <section>
            <span>
              当前时间
            </span>

            <strong>
              第${page.topBar.day}天
            </strong>
          </section>

          <section>
            <span>
              当前资金
            </span>

            <strong>
              ${money(
                page.topBar
                  .balance
              )}
            </strong>
          </section>

          <section>
            <span>
              门店等级
            </span>

            <strong>
              Lv.${page.restaurant.level}
            </strong>
          </section>

        </header>


        <section class="construction-title">

          <button
            type="button"
            data-page-target="restaurant"
          >
            ‹ 门店
          </button>

          <div>
            <strong>
              装修施工
            </strong>

            <span>
              施工期间新布局不会提前产生经营能力
            </span>
          </div>

          ${
            construction
              ? `
                <b>
                  ${
                    construction.status ===
                    "building"
                      ? "施工中"
                      : construction.status ===
                        "ready_for_inspection"
                        ? "待验收"
                        : "已完工"
                  }
                </b>
              `
              : ""
          }

        </section>


        ${
          this.message
            ? `
              <div class="construction-message">
                ${escapeHtml(
                  this.message
                )}
              </div>
            `
            : ""
        }


        ${
          construction
            ? `
              <section class="construction-hero">

                ${renderSlot(
                  "renovation-construction-site",
                  "施工现场"
                )}

                <aside>

                  <span>
                    当前进度
                  </span>

                  <strong>
                    ${progress.progress}%
                  </strong>

                  <div class="construction-progress">
                    <i
                      style="
                        width:${progress.progress}%;
                      "
                    ></i>
                  </div>

                  <b>
                    ${escapeHtml(
                      progress.phaseLabel
                    )}
                  </b>

                  <small>
                    ${
                      progress.remainingDays >
                      0
                        ? `预计还需${progress.remainingDays}天`
                        : construction.status ===
                          "ready_for_inspection"
                          ? "工程已完成，等待验收"
                          : "施工已完成"
                    }
                  </small>

                </aside>

              </section>


              <section class="construction-timeline">

                ${
                  page.timeline
                    .map(
                      (
                        step,
                        index
                      ) => `
                        <article
                          class="
                            construction-step
                            construction-step--${step.state}
                          "
                        >

                          <span>
                            ${
                              step.state ===
                              "complete"
                                ? "✓"
                                : index + 1
                            }
                          </span>

                          <strong>
                            ${escapeHtml(
                              step.label
                            )}
                          </strong>

                          <small>
                            ${
                              step.state ===
                              "complete"
                                ? "完成"
                                : step.state ===
                                  "current"
                                  ? "进行中"
                                  : "待开始"
                            }
                          </small>

                        </article>
                      `
                    )
                    .join("")
                }

              </section>


              <section class="construction-main-grid">

                <section class="construction-panel">

                  <header>
                    <strong>
                      工程信息
                    </strong>
                  </header>

                  <div class="construction-project-grid">

                    <article>
                      <span>
                        装修面积
                      </span>

                      <strong>
                        ${page.project.area}㎡
                      </strong>
                    </article>

                    <article>
                      <span>
                        家具设施
                      </span>

                      <strong>
                        ${page.project.placements}件
                      </strong>
                    </article>

                    <article>
                      <span>
                        施工周期
                      </span>

                      <strong>
                        ${page.project.durationDays}天
                      </strong>
                    </article>

                    <article>
                      <span>
                        开始日期
                      </span>

                      <strong>
                        第${page.project.startDay}天
                      </strong>
                    </article>

                    <article>
                      <span>
                        预计完工
                      </span>

                      <strong>
                        第${page.project.endDay}天
                      </strong>
                    </article>

                    <article>
                      <span>
                        本次新增投入
                      </span>

                      <strong>
                        ${money(
                          page.project
                            .projectCost
                        )}
                      </strong>
                    </article>

                  </div>

                </section>


                <section class="construction-panel">

                  <header>
                    <strong>
                      完工后经营能力
                    </strong>
                  </header>

                  <div class="construction-capacity">

                    <article>
                      <span>
                        餐位
                      </span>

                      <strong>
                        ${page.project.seats}个
                      </strong>
                    </article>

                    <article>
                      <span>
                        厨房工位
                      </span>

                      <strong>
                        ${page.project.kitchenStations}个
                      </strong>
                    </article>

                    <article>
                      <span>
                        布局评分
                      </span>

                      <strong>
                        ${
                          page.project.grade ??
                          "-"
                        }
                        ·
                        ${
                          page.project.score ??
                          "-"
                        }
                      </strong>
                    </article>

                  </div>

                </section>

              </section>


              <section class="construction-preview">

                <header>
                  <strong>
                    施工方案预览
                  </strong>

                  <span>
                    后续可绑定施工效果图
                  </span>
                </header>

                ${renderSlot(
                  "renovation-construction-preview",
                  "装修方案预览"
                )}

              </section>


              <section class="construction-actions">

                ${
                  page.actions.canInspect
                    ? `
                      <button
                        type="button"
                        class="construction-inspect"
                        data-construction-action="inspect"
                      >
                        ✓ 完工验收并正式启用
                      </button>
                    `
                    : page.actions.completed
                      ? `
                        <button
                          type="button"
                          class="construction-next"
                          data-page-target="opening-setup"
                        >
                          装修已完成 · 继续开店准备
                        </button>
                      `
                      : `
                        <button
                          type="button"
                          class="construction-wait"
                          disabled
                        >
                          施工中 · 随游戏时间自动推进
                        </button>
                      `
                }

              </section>
            `
            : `
              <section class="construction-empty">

                <strong>
                  当前没有装修施工任务
                </strong>

                <span>
                  先完成装修布局和预算确认。
                </span>

                <button
                  type="button"
                  data-page-target="renovation"
                >
                  返回装修布局
                </button>

              </section>
            `
        }

      </main>
    `;
  }


  render() {
    if (!this.root) {
      return;
    }

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );

    this.bind();
  }


  bind() {
    this.root
      ?.querySelectorAll(
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
      ?.querySelector(
        '[data-construction-action="inspect"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const result =
              this.pageSystem
                .inspect(
                  this.restaurantId
                );

            this.message =
              "装修验收完成，新布局已经正式启用";

            this.refresh();

            return result;
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


export const renovationConstructionView =
  new RenovationConstructionView();


export {
  RenovationConstructionView
};
