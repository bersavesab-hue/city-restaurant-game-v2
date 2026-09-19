import {
  moreHubPageSystem
} from "./MoreHubPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


class MoreHubView {
  constructor({
    pageSystem =
      moreHubPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.onNavigate =
      null;
  }


  mount(
    root,
    {
      restaurantId,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen more-hub">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "顾客 · 品牌 · 荣誉 · 扩张"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "更多",

          subtitle:
            "会员、合规、成长、连锁与系统管理"
        })}


        <section class="more-hub__summary">

          <article>
            <span>未读奖项</span>
            <strong>${page.badges.awards}</strong>
          </article>

          <article>
            <span>永久荣誉</span>
            <strong>${page.badges.honors}</strong>
          </article>

          <article>
            <span>荣誉值</span>
            <strong>${page.badges.prestige}</strong>
          </article>

        </section>


        ${page.groups
          .map(
            group => `
              <section
                class="more-hub__group"
                data-more-group="${escapeHtml(
                  group.id
                )}"
              >

                <h2>
                  ${escapeHtml(
                    group.title
                  )}
                </h2>

                <div class="more-hub__grid">

                  ${group.entries
                    .map(
                      entry => `
                        <button
                          type="button"
                          data-page-target="${escapeHtml(
                            entry.target
                          )}"
                          data-entry-state="${escapeHtml(
                            entry.state
                          )}"
                          ${entry.state ===
                            "locked"
                              ? "disabled"
                              : ""
                          }
                        >

                          <strong>
                            ${escapeHtml(
                              entry.title
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              entry.description
                            )}
                          </span>

                          ${entry.id ===
                            "awards-center" &&
                          page.badges.awards >
                            0
                            ? `
                                <b>
                                  ${page.badges.awards}
                                </b>
                              `
                            : ""
                          }

                          <small>
                            ${entry.state ===
                              "locked"
                                ? `Lv.${entry.unlockLevel} 解锁`
                                : "进入 →"
                            }
                          </small>

                        </button>
                      `
                    )
                    .join("")}

                </div>

              </section>
            `
          )
          .join("")}


        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

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
          this.restaurantId
        );

    this.root.innerHTML =
      this.renderMarkup(
        page
      );

    this.bind();

    return page;
  }


  bind() {

  }


  destroy() {
    this.root =
      null;
  }
}


export const moreHubView =
  new MoreHubView();


export {
  MoreHubView
};
