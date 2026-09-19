import {
  rankingCenterPageSystem
} from "./RankingCenterPageSystem.js";

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
    );
}


function formatValue(
  value,
  format
) {
  const number =
    Number(
      value ??
      0
    );


  switch (
    format
  ) {
    case "money":
      return (
        "¥" +
        Math.round(
          number
        ).toLocaleString(
          "zh-CN"
        )
      );

    case "percent":
      return (
        Number(
          number.toFixed(
            1
          )
        ) +
        "%"
      );

    case "score":
      return Number(
        number.toFixed(
          1
        )
      );

    default:
      return Math.round(
        number
      );
  }
}


function medal(
  rank
) {
  switch (
    rank
  ) {
    case 1:
      return "🥇";

    case 2:
      return "🥈";

    case 3:
      return "🥉";

    default:
      return `#${rank}`;
  }
}


class RankingCenterView {
  constructor({
    pageSystem =
      rankingCenterPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.period =
      "month";

    this.category =
      "restaurant";

    this.boardId =
      null;

    this.onNavigate =
      null;
  }


  mount(
    root,
    {
      restaurantId,
      period = "month",
      category = "restaurant",
      boardId = null,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.period =
      period;

    this.category =
      category;

    this.boardId =
      boardId;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderMarkup(
    page
  ) {
    const board =
      page.selectedBoard;


    return `
      <main class="rg-screen ranking-center-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "市场竞争 · 菜品 · 人才"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "排行榜中心",

          subtitle:
            `共${page.boardCount}类榜单 · 玩家与竞争店共同参榜`,

          backTarget:
            "market-strategy",

          rightHtml:
            `
              <div class="competition-suite-links">
                <button
                  type="button"
                  data-page-target="awards-center"
                >
                  奖项中心
                </button>

                <button
                  type="button"
                  data-page-target="honor-hall"
                >
                  荣誉馆
                </button>
              </div>
            `
        })}


        <section class="ranking-center__periods">

          ${page.periods
            .map(
              item => `
                <button
                  type="button"
                  data-ranking-period="${item.id}"
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


        <section class="ranking-center__categories">

          ${page.categories
            .map(
              item => `
                <button
                  type="button"
                  data-ranking-category="${item.id}"
                  class="${
                    item.id ===
                    page.category
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


        <section class="ranking-center__board-tabs">

          ${page.definitions
            .map(
              item => `
                <button
                  type="button"
                  data-ranking-board="${item.id}"
                  class="${
                    item.id ===
                    page.boardId
                      ? "is-active"
                      : ""
                  }"
                >
                  ${escapeHtml(
                    item.title
                  )}
                </button>
              `
            )
            .join("")}

        </section>


        ${board
          ? `
            <section class="ranking-center__board">

              <header>
                <div>
                  <span>
                    ${escapeHtml(
                      page.periods
                        .find(
                          item =>
                            item.id ===
                            page.period
                        )
                        ?.name ??
                      page.period
                    )}
                  </span>

                  <h2>
                    ${escapeHtml(
                      board.title
                    )}
                  </h2>
                </div>

                <strong>
                  ${board.totalCandidates}
                  位参榜对象
                </strong>
              </header>


              <div class="ranking-center__rows">

                ${board.rows.length
                  ? board.rows
                      .map(
                        row => `
                          <article
                            class="${
                              row.isPlayer
                                ? "is-player"
                                : ""
                            }"
                          >

                            <b>
                              ${medal(
                                row.rank
                              )}
                            </b>

                            <div>
                              <strong>
                                ${escapeHtml(
                                  row.name
                                )}
                              </strong>

                              <span>
                                ${row.isPlayer
                                  ? "玩家"
                                  : row.subjectType ===
                                      "restaurant"
                                    ? "竞争店"
                                    : "本店"
                                }

                                ${row.roleName
                                  ? " · " +
                                    escapeHtml(
                                      row.roleName
                                    )
                                  : ""
                                }

                                ${row.districtName
                                  ? " · " +
                                    escapeHtml(
                                      row.districtName
                                    )
                                  : ""
                                }
                              </span>
                            </div>

                            <strong>
                              ${formatValue(
                                row.score,
                                board.format
                              )}
                            </strong>

                          </article>
                        `
                      )
                      .join("")
                  : `
                    <p>
                      当前周期还没有达到参榜条件的数据。
                    </p>
                  `
                }

              </div>

            </section>
          `
          : `
            <section>
              <p>
                当前分类暂无榜单。
              </p>
            </section>
          `
        }


        <section class="ranking-center__overview">

          <h2>
            本分类全部榜单
          </h2>

          <div>
            ${page.boards
              .map(
                item => {
                  const player =
                    item.rows.find(
                      row =>
                        row.isPlayer
                    );

                  return `
                    <article>
                      <strong>
                        ${escapeHtml(
                          item.title
                        )}
                      </strong>

                      <span>
                        ${player
                          ? `当前第${player.rank}名`
                          : "暂未上榜"
                        }
                      </span>

                      <small>
                        ${item.totalCandidates}
                        位参榜
                      </small>
                    </article>
                  `;
                }
              )
              .join("")}
          </div>

        </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "operations"
            })
        )}

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

            category:
              this.category,

            boardId:
              this.boardId
          }
        );


    this.boardId =
      page.boardId;

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
        "[data-ranking-period]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.period =
                button.dataset
                  .rankingPeriod;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-ranking-category]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.category =
                button.dataset
                  .rankingCategory;

              this.boardId =
                null;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-ranking-board]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.boardId =
                button.dataset
                  .rankingBoard;

              this.render();
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


export const rankingCenterView =
  new RankingCenterView();


export {
  RankingCenterView
};
