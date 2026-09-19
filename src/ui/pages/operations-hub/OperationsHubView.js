import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  renderUiIcon
} from "../../components/UiIconView.js";


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


class OperationsHubView {
  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen operations-hub-screen">

        ${
          page.topBar
            ? renderGameTopBar(
                page.topBar,
                {
                  subtitle:
                    "经营管理中心"
                }
              )
            : ""
        }

        ${renderNoticeTicker(\n          page.noticeTicker\n        )}\n\n        ${renderPageTitle({
          title:
            "经营",

          subtitle:
            "菜单、供应链、渠道、数据、财务与竞争"
        })}

        <section class="operations-hub">

          <div class="operations-hub__grid">

            ${
              page.entries
                .map(
                  entry => `
                    <article
                      class="
                        operations-hub__card
                        operations-hub__card--${escapeHtml(
                          entry.id
                        )}
                      "
                      data-entry-state="${escapeHtml(
                        entry.state
                      )}"
                    >

                      <button
                        type="button"
                        class="operations-hub__primary"
                        data-page-target="${escapeHtml(
                          entry.target
                        )}"
                        ${
                          entry.state ===
                            "locked"
                            ? "disabled"
                            : ""
                        }
                      >
                        <span class="operations-hub__icon">
                          ${renderUiIcon(
                            entry.icon,
                            "operations-hub__icon-svg"
                          )}
                        </span>

                        <span class="operations-hub__copy">
                          <strong>
                            ${escapeHtml(
                              entry.title
                            )}
                          </strong>

                          <small>
                            ${escapeHtml(
                              entry.description
                            )}
                          </small>
                        </span>

                        <b>
                          ${
                            entry.state ===
                              "locked"
                              ? `Lv.${entry.unlockLevel} 解锁`
                              : "进入"
                          }
                        </b>
                      </button>

                      ${
                        entry.secondary.length
                          ? `
                            <div
                              class="operations-hub__secondary"
                            >
                              ${
                                entry.secondary
                                  .map(
                                    item => `
                                      <button
                                        type="button"
                                        data-page-target="${escapeHtml(
                                          item.target
                                        )}"
                                      >
                                        ${escapeHtml(
                                          item.title
                                        )}
                                      </button>
                                    `
                                  )
                                  .join("")
                              }
                            </div>
                          `
                          : ""
                      }

                    </article>
                  `
                )
                .join("")
            }

          </div>

        </section>

        ${renderBottomNavigation(
          page.navigation ??
          []
        )}

      </main>
    `;
  }
}


export const operationsHubView =
  new OperationsHubView();


export {
  OperationsHubView
};
