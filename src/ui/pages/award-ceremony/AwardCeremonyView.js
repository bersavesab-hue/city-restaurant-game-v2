import {
  awardCeremonyPageSystem
} from "./AwardCeremonyPageSystem.js";

import {
  awardFeedbackSystem
} from "../../../systems/AwardFeedbackSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

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


class AwardCeremonyView {
  constructor({
    pageSystem =
      awardCeremonyPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.resultId =
      null;

    this.onNavigate =
      null;
  }


  mount(
    root,
    {
      restaurantId,
      resultId = null,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.resultId =
      resultId;

    this.onNavigate =
      onNavigate;


    const page =
      this.render();


    if (
      page.resultId
    ) {
      awardFeedbackSystem
        .markResultRead(
          restaurantId,
          page.resultId
        );
    }


    return page;
  }


  renderMarkup(
    page
  ) {
    const chrome =
      buildFormalPageChrome(
        page.restaurantId ??
        this.restaurantId
      );

    if (
      !page.hasAward
    ) {
      return `
        <main class="rg-screen award-ceremony-page">

          ${renderGameTopBar(
            chrome.topBar,
            {
              subtitle:
                "正式颁奖"
            }
          )}

          ${renderNoticeTicker(
            chrome.noticeTicker
          )}

          ${renderPageTitle({
            title:
              "颁奖典礼",

            subtitle:
              "暂无待展示的获奖结果",

            backTarget:
              "awards-center"
          })}

          <section class="award-ceremony__empty">

            <div
              class="award-ceremony__stage-visual"
              role="img"
              aria-label="颁奖舞台"
              data-image-slot="award-stage"
              data-image-fit="cover"
            ></div>

            <h1>
              暂无待展示的获奖结果
            </h1>

            <p>
              月度、季度或年度评审产生正式获奖结果后，会在这里举行颁奖展示。
            </p>

            <button
              type="button"
              data-page-target="awards-center"
            >
              查看奖项中心
            </button>

          </section>

          ${renderBottomNavigation(
            gameChromeSystem
              .getNavigation({
                restaurantId:
                  page.restaurantId ??
                  this.restaurantId,

                activePageId:
                  "more"
              })
          )}

        </main>
      `;
    }


    return `
      <main class="rg-screen award-ceremony-page">

        ${renderGameTopBar(
          chrome.topBar,
          {
            subtitle:
              "正式颁奖"
          }
        )}

        ${renderNoticeTicker(
          chrome.noticeTicker
        )}

        ${renderPageTitle({
          title:
            page.award.name,

          subtitle:
            `${page.award.periodName} · ${page.award.division} · 荣誉值${page.award.prestige}`,

          backTarget:
            "awards-center"
        })}


        <section class="award-ceremony__stage">

          <div
            class="award-ceremony__trophy"
            role="img"
            aria-label="获奖奖杯"
            data-image-slot="award-trophy"
            data-image-fit="contain"
          ></div>

          <span>
            获奖者
          </span>

          <h2>
            ${escapeHtml(
              page.winner.name
            )}
          </h2>

          <strong>
            第
            ${page.winner.rank}
            名
          </strong>

          <p>
            评审得分
            ${Number(
              page.winner.awardScore ??
              0
            ).toFixed(1)}
          </p>

        </section>


        <section class="award-ceremony__reward">

          <article>
            <span>
              声望奖励
            </span>

            <strong>
              +${page.reward.reputation}
            </strong>
          </article>

          <article>
            <span>
              经营经验
            </span>

            <strong>
              +${page.reward.experience}
            </strong>
          </article>

          <article>
            <span>
              永久荣誉值
            </span>

            <strong>
              +${page.award.prestige}
            </strong>
          </article>

        </section>


        <section class="award-ceremony__finalists">

          <h2>
            最终入围
          </h2>

          ${page.finalists
            .map(
              item => `
                <article
                  class="${
                    item.id ===
                    page.winner.id
                      ? "is-winner"
                      : ""
                  }"
                >
                  <b>
                    #${item.rank}
                  </b>

                  <strong>
                    ${escapeHtml(
                      item.name
                    )}
                  </strong>

                  <span>
                    ${Number(
                      item.awardScore ??
                      0
                    ).toFixed(1)}
                  </span>
                </article>
              `
            )
            .join("")}

        </section>


        <nav class="award-ceremony__actions">

          <button
            type="button"
            data-page-target="honor-hall"
          >
            收藏到荣誉馆
          </button>

          <button
            type="button"
            data-page-target="ranking-center"
          >
            查看排行榜
          </button>

          <button
            type="button"
            data-page-target="awards-center"
          >
            查看全部奖项
          </button>

        </nav>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId ??
                this.restaurantId,

              activePageId:
                "more"
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
            resultId:
              this.resultId
          }
        );


    this.resultId =
      page.resultId;


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


export const awardCeremonyView =
  new AwardCeremonyView();


export {
  AwardCeremonyView
};
