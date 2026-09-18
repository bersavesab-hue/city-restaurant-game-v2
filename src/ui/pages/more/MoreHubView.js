import {
  moreHubPageSystem
} from "./MoreHubPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  buildGlobalTopBarModel
} from "../../components/GlobalChromeModel.js";

import {
  renderGameTopBar,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameState
} from "../../../core/GameState.js";


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
    const topBar =
      buildGlobalTopBarModel({
        restaurantName:
          page.restaurant.name,

        balance:
          page.restaurant.balance,

        storeLevel:
          page.restaurant.level,

        reputation:
          page.restaurant.reputation,

        time:
          gameState.getSection(
            "time"
          ),

        runtime:
          gameState.getSection(
            "runtime"
          ),

        currentStoreId:
          page.restaurant.id
      });


    return `
      <main class="rg-screen more-hub">

        ${renderGameTopBar(
          topBar,
          {
            subtitle:
              "品牌 · 荣誉 · 扩张 · 系统"
          }
        )}


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
                              "ready"
                                ? "进入 →"
                                : entry.state ===
                                  "locked"
                                  ? `Lv.${entry.unlockLevel} 解锁`
                                  : "待正式页面 →"
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


export const moreHubView =
  new MoreHubView();


export {
  MoreHubView
};
