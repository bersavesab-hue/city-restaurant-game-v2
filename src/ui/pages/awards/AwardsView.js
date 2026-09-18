import {
  awardsPageSystem
} from "./AwardsPageSystem.js";


const STAGE_NAME =
  Object.freeze({
    nominated: "提名",
    finalist: "入围",
    winner: "获奖"
  });


const SUBJECT_NAME =
  Object.freeze({
    restaurant: "餐厅",
    dish: "菜品",
    employee: "员工"
  });


const SCOPE_NAME =
  Object.freeze({
    district: "商圈",
    city: "全城",
    player: "旗下门店",
    restaurant: "本店"
  });


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
    );
}


function eligibilityText(
  item
) {
  const rule =
    item.eligibility;

  const parts = [];


  if (
    rule.minOperatingDays
  ) {
    parts.push(
      `经营≥${rule.minOperatingDays}天`
    );
  }


  if (
    rule.minOrders
  ) {
    parts.push(
      `订单≥${rule.minOrders}`
    );
  }


  if (
    rule.minQuantity
  ) {
    parts.push(
      `销量≥${rule.minQuantity}份`
    );
  }


  if (
    rule.minWorkMinutes
  ) {
    parts.push(
      `工时≥${Math.round(
        rule.minWorkMinutes /
        60
      )}小时`
    );
  }


  if (
    rule.customOnly
  ) {
    parts.push(
      "仅自主研发菜"
    );
  }


  if (
    Number.isFinite(
      rule.maxAgeDays
    )
  ) {
    parts.push(
      `年龄≤${rule.maxAgeDays}天`
    );
  }


  return parts.length
    ? parts.join(
        " · "
      )
    : "达到基础参评条件";
}


class AwardsView {
  constructor({
    pageSystem =
      awardsPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.period =
      "annual";

    this.division =
      null;

    this.onNavigate =
      null;
  }


  mount(
    root,
    {
      restaurantId,
      period = "annual",
      division = null,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.period =
      period;

    this.division =
      division;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="awards-center">

        <header class="awards-center__header">

          <div>
            <span>
              提名 · 入围 · 获奖 · 蝉联
            </span>

            <h1>
              奖项中心
            </h1>

            <p>
              共
              ${page.totalAwardCount}
              个正式奖项，按月度、季度、年度和不同评审类别独立结算。
            </p>
          </div>

          <nav>
            <button
              type="button"
              data-page-target="ranking-center"
            >
              排行榜
            </button>

            <button
              type="button"
              data-page-target="honor-hall"
            >
              荣誉馆
            </button>
          </nav>

        </header>


        <section class="awards-center__progress">

          <strong>
            ${escapeHtml(
              page.progress
                .periodName
            )}
            评审周期
          </strong>

          <span>
            第
            ${page.progress.dayInPeriod}
            /
            ${page.progress.totalDays}
            天
          </span>

          <span>
            距离结算
            ${page.progress.remainingDays}
            天
          </span>

          <progress
            max="100"
            value="${page.progress.progress}"
          ></progress>

        </section>


        <section class="awards-center__periods">

          ${page.periodOptions
            .map(
              item => `
                <button
                  type="button"
                  data-award-period="${item.id}"
                  class="${
                    item.id ===
                    page.period
                      ? "is-active"
                      : ""
                  }"
                >
                  ${escapeHtml(
                    item.name
                  )}
                </button>
              `
            )
            .join("")}

        </section>


        <section class="awards-center__divisions">

          <button
            type="button"
            data-award-division=""
            class="${
              !page.division
                ? "is-active"
                : ""
            }"
          >
            全部
          </button>

          ${page.divisions
            .map(
              item => `
                <button
                  type="button"
                  data-award-division="${item.id}"
                  class="${
                    item.id ===
                    page.division
                      ? "is-active"
                      : ""
                  }"
                >
                  ${escapeHtml(
                    item.name
                  )}
                  ·
                  ${item.count}
                </button>
              `
            )
            .join("")}

        </section>


        <section class="awards-center__catalog">

          <h2>
            本期奖项目录
          </h2>

          <div>

            ${page.definitions
              .map(
                item => `
                  <article>

                    <header>
                      <span>
                        ${escapeHtml(
                          SUBJECT_NAME[
                            item.subject
                          ] ??
                          item.subject
                        )}
                        ·
                        ${escapeHtml(
                          SCOPE_NAME[
                            item.scope
                          ] ??
                          item.scope
                        )}
                      </span>

                      <strong>
                        ${escapeHtml(
                          item.name
                        )}
                      </strong>
                    </header>

                    <p>
                      ${escapeHtml(
                        item.description
                      )}
                    </p>

                    <small>
                      ${escapeHtml(
                        eligibilityText(
                          item
                        )
                      )}
                    </small>

                    <footer>
                      <span>
                        入围
                        ${item.finalistCount}
                        名
                      </span>

                      <span>
                        声望
                        +${item.reward.reputation}
                      </span>

                      <span>
                        经验
                        +${item.reward.experience}
                      </span>

                      <span>
                        荣誉值
                        ${item.prestige}
                      </span>
                    </footer>

                  </article>
                `
              )
              .join("")}

          </div>

        </section>


        <section class="awards-center__participation">

          <h2>
            我的提名与获奖
          </h2>

          ${page.participation.length
            ? page.participation
                .map(
                  item => `
                    <article
                      class="stage-${item.stage}"
                    >
                      <strong>
                        ${escapeHtml(
                          item.awardName
                        )}
                      </strong>

                      <span>
                        ${escapeHtml(
                          item.subjectName
                        )}
                      </span>

                      <b>
                        ${escapeHtml(
                          STAGE_NAME[
                            item.stage
                          ] ??
                          item.stage
                        )}
                      </b>

                      <small>
                        第
                        ${item.rank}
                        名
                      </small>
                    </article>
                  `
                )
                .join("")
            : `
              <p>
                当前还没有已结算周期的提名记录。
              </p>
            `
          }

        </section>


        <section class="awards-center__results">

          <h2>
            最近颁奖结果
          </h2>

          ${page.recentRuns.length
            ? page.recentRuns
                .map(
                  run => `
                    <article>
                      <div>
                        <strong>
                          ${escapeHtml(
                            run.awardName
                          )}
                        </strong>

                        <span>
                          第
                          ${run.periodIndex}
                          期
                        </span>
                      </div>

                      ${run.winner
                        ? `
                          <div>
                            <b>
                              ${escapeHtml(
                                run.winner.name
                              )}
                            </b>

                            <span>
                              ${run.winner.isPlayer
                                ? "玩家阵营"
                                : "NPC竞争店"
                              }
                            </span>
                          </div>
                        `
                        : `
                          <span>
                            本期无人达到资格线
                          </span>
                        `
                      }
                    </article>
                  `
                )
                .join("")
            : `
              <p>
                首个评审周期尚未结束。
              </p>
            `
          }

        </section>

      </main>
    `;
  }


  render() {
    const page =
      this.pageSystem
        .getPage(
          this.restaurantId,
          {
            period:
              this.period,

            division:
              this.division
          }
        );


    this.root.innerHTML =
      this.renderMarkup(
        page
      );

    this.bind();

    return page;
  }


  bind() {
    this.root
      .querySelectorAll(
        "[data-award-period]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.period =
                button.dataset
                  .awardPeriod;

              this.division =
                null;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-award-division]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.division =
                button.dataset
                  .awardDivision ||
                null;

              this.render();
            }
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
                  .pageTarget,

                this.restaurantId
              );
            }
          );
        }
      );
  }


  destroy() {
    this.root =
      null;
  }
}


export const awardsView =
  new AwardsView();


export {
  AwardsView
};
