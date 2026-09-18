import {
  honorHallPageSystem
} from "./HonorHallPageSystem.js";


const PERIOD_NAME =
  Object.freeze({
    monthly: "月度",
    quarterly: "季度",
    annual: "年度"
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


class HonorHallView {
  constructor({
    pageSystem =
      honorHallPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.period =
      null;

    this.division =
      null;

    this.subjectType =
      null;

    this.onNavigate =
      null;
  }


  mount(
    root,
    {
      restaurantId,
      period = null,
      division = null,
      subjectType = null,
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

    this.subjectType =
      subjectType;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="honor-hall">

        <header class="honor-hall__header">

          <div>
            <span>
              永久荣誉档案
            </span>

            <h1>
              荣誉馆
            </h1>

            <p>
              奖杯永久保留，记录门店、菜品和员工获得的正式荣誉。
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
              data-page-target="awards-center"
            >
              奖项中心
            </button>
          </nav>

        </header>


        <section class="honor-hall__summary">

          <article>
            <span>
              荣誉总数
            </span>

            <strong>
              ${page.summary.totalHonors}
            </strong>
          </article>

          <article>
            <span>
              荣誉值
            </span>

            <strong>
              ${page.summary.prestigePoints}
            </strong>
          </article>

          <article>
            <span>
              年度大奖
            </span>

            <strong>
              ${page.summary.annualWins}
            </strong>
          </article>

          <article>
            <span>
              不同奖项
            </span>

            <strong>
              ${page.summary.uniqueAwardCount}
            </strong>
          </article>

        </section>


        <section class="honor-hall__periods">

          <button
            type="button"
            data-honor-period=""
            class="${
              !page.period
                ? "is-active"
                : ""
            }"
          >
            全部
          </button>

          ${Object.entries(
              PERIOD_NAME
            )
            .map(
              ([
                id,
                name
              ]) => `
                <button
                  type="button"
                  data-honor-period="${id}"
                  class="${
                    page.period === id
                      ? "is-active"
                      : ""
                  }"
                >
                  ${name}
                </button>
              `
            )
            .join("")}

        </section>


        <section class="honor-hall__trophies">

          <h2>
            奖杯陈列
          </h2>

          ${page.honors.length
            ? page.honors
                .map(
                  item => `
                    <article>

                      <div>
                        <span>
                          ${escapeHtml(
                            PERIOD_NAME[
                              item.period
                            ] ??
                            item.period
                          )}
                          ·
                          第
                          ${item.periodIndex}
                          期
                        </span>

                        <strong>
                          ${escapeHtml(
                            item.awardName
                          )}
                        </strong>
                      </div>

                      <div>
                        <b>
                          ${escapeHtml(
                            item.subjectName
                          )}
                        </b>

                        <span>
                          荣誉值
                          +${item.prestige}
                        </span>
                      </div>

                      <small>
                        声望
                        +${item.reputationReward}
                        ·
                        经验
                        +${item.experienceReward}
                      </small>

                    </article>
                  `
                )
                .join("")
            : `
              <p>
                还没有正式奖杯。达到参评资格并在周期评审中获胜后，奖杯会永久陈列在这里。
              </p>
            `
          }

        </section>


        <section class="honor-hall__history">

          <h2>
            提名履历
          </h2>

          ${page.participation.length
            ? page.participation
                .slice(
                  0,
                  30
                )
                .map(
                  item => `
                    <article>
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

                      <span>
                        ${item.stage ===
                            "winner"
                          ? "获奖"
                          : item.stage ===
                              "finalist"
                            ? "入围"
                            : "提名"
                        }
                      </span>
                    </article>
                  `
                )
                .join("")
            : `
              <p>
                暂无提名履历。
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
              this.division,

            subjectType:
              this.subjectType
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
        "[data-honor-period]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.period =
                button.dataset
                  .honorPeriod ||
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


export const honorHallView =
  new HonorHallView();


export {
  HonorHallView
};
