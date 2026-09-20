import {
  renderUiIcon
} from "./UiIconView.js";

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



export function renderGameTopBar(
  model,
  {
    subtitle =
      null,

    locationLabel =
      null,

    showSpeedControls =
      true
  } = {}
) {
  const clock =
    model?.clock ??
    {};

  const level =
    model?.storeLevel ??
    model?.level ??
    1;

  const groupScope =
    model?.scope?.type ===
    "group";

  const stores =
    model?.scope?.stores ??
    [];

  const scopeStoreCount =
    stores.length;

  const canSwitchScope =
    model?.scope?.canSwitch ===
    true;

  const rating =
    Number.isFinite(
      Number(
        model?.rating
      )
    )
      ? Number(
          model.rating
        ).toFixed(
          1
        )
      : null;

  const speeds =
    model?.actions
      ?.speeds ??
    clock.speedOptions ??
    [
      1,
      2,
      4
    ];

  const identityTitle =
    groupScope
      ? "集团视角"
      : model?.restaurantName ??
        "未命名餐厅";

  const identityMeta =
    groupScope
      ? (
          "管理旗下 " +
          scopeStoreCount +
          " 家门店"
        )
      : (
          subtitle ??
          locationLabel ??
          model?.brandName ??
          "单店经营"
        );

  return `
    <header
      class="rg-topbar"
      aria-label="经营状态栏"
    >
      <section class="rg-topbar__identity">
        <button
          type="button"
          class="rg-topbar__avatar"
          data-page-target="settings"
          aria-label="打开设置"
        >
          ${renderUiIcon(
            "employees",
            "rg-topbar__avatar-icon"
          )}
        </button>

        <div class="rg-topbar__identity-copy">
          ${
            canSwitchScope
              ? `
                <label class="rg-scope-select">
                  <span class="rg-visually-hidden">当前管理范围</span>
                  <select data-action="switch-management-scope">
                    <option
                      value="group"
                      ${groupScope ? "selected" : ""}
                    >
                      集团视角
                    </option>
                    ${stores.map(store => `
                      <option
                        value="store:${escapeHtml(store.id)}"
                        ${!groupScope && model.scope.storeId === store.id ? "selected" : ""}
                      >
                        ${escapeHtml(store.name)}
                      </option>
                    `).join("")}
                  </select>
                </label>
              `
              : `
                <strong>
                  ${escapeHtml(
                    identityTitle
                  )}
                </strong>
              `
          }

          <small class="rg-topbar__identity-meta">
            ${escapeHtml(
              identityMeta
            )}
          </small>

          ${
            !groupScope &&
            model?.actions?.canRename
              ? `
                <button
                  type="button"
                  class="rg-store-rename"
                  data-action="rename-store"
                >
                  改名
                </button>
              `
              : ""
          }
        </div>
      </section>

      <section class="rg-topbar__clock">
        <span
          class="rg-topbar__weather-symbol"
          aria-hidden="true"
        >
          ${escapeHtml(
            model?.weather?.icon ??
            "☀"
          )}
        </span>

        <div class="rg-topbar__datetime">
          <small>
            ${escapeHtml(
              clock.dateText ??
              ""
            )}
          </small>

          <strong>
            ${escapeHtml(
              clock.clockText ??
              "--:--"
            )}
          </strong>
        </div>

        ${
          showSpeedControls
            ? `
              <div class="rg-topbar__speed">
                <button
                  type="button"
                  data-action="pause"
                  aria-label="暂停或继续"
                >
                  ${
                    clock.paused
                      ? "▶"
                      : "Ⅱ"
                  }
                </button>

                ${speeds.map(speed => `
                  <button
                    type="button"
                    data-action="speed"
                    data-speed="${speed}"
                    class="${
                      !clock.paused &&
                      clock.speed === speed
                        ? "is-active"
                        : ""
                    }"
                  >
                    ${speed}x
                  </button>
                `).join("")}
              </div>
            `
            : ""
        }
      </section>

      <section class="rg-topbar__status">
        <div class="rg-topbar__money">
          <span
            class="rg-topbar__money-icon"
            aria-hidden="true"
          >
            ${renderUiIcon(
              "cash",
              "rg-topbar__money-svg"
            )}
          </span>

          <strong>
            ${money(
              model?.balance
            )}
          </strong>

          <button
            type="button"
            class="rg-topbar__money-add"
            data-page-target="finance"
            aria-label="打开财务"
          >
            +
          </button>
        </div>

        <div class="rg-topbar__level">
          <span
            class="rg-topbar__level-icon"
            aria-hidden="true"
          >
            ${renderUiIcon(
              "ranking",
              "rg-topbar__level-svg"
            )}
          </span>

          <strong>
            ${"Lv." + level}
          </strong>

          <small>
            ${
              rating !== null
                ? "★ " + rating
                : "声望 " +
                  (
                    model?.reputation ??
                    0
                  )
            }
          </small>
        </div>
      </section>
    </header>
  `;
}


export function renderNoticeTicker(
  model
) {
  const current =
    model?.current ??
    model?.items?.[0] ??
    null;


  return `
    <button
      type="button"
      class="
        rg-notice
        rg-notice--${
          current?.type ??
          "info"
        }
      "
      ${
        current?.action
          ? `data-page-target="${escapeHtml(
              current.action
            )}"`
          : ""
      }
    >

      <b class="rg-notice__badge">
        公告
      </b>

      <strong>
        ${escapeHtml(
          current?.title ??
          "经营通报"
        )}
      </strong>

      <span>
        ${escapeHtml(
          current?.message ??
          "当前没有新的经营提醒"
        )}
      </span>

      ${
        (
          model?.unreadCount ??
          0
        ) >
        0
          ? `
            <i>
              ${Math.min(
                99,
                model.unreadCount
              )}
            </i>
          `
          : ""
      }

    </button>
  `;
}


export function renderPageTitle({
  title,
  subtitle =
    null,

  backTarget =
    null,

  helpLabel =
    null,

  helpTarget =
    null,

  rightHtml =
    ""
} = {}) {
  return `
    <section class="rg-page-title">

      <div class="rg-page-title__left">

        ${
          backTarget
            ? `
              <button
                type="button"
                class="rg-back-button"
                data-page-target="${escapeHtml(
                  backTarget
                )}"
              >
                ‹ 返回
              </button>
            `
            : ""
        }


        <div>

          <strong>
            ${escapeHtml(
              title ??
              ""
            )}
          </strong>

          ${
            subtitle
              ? `
                <span>
                  ${escapeHtml(
                    subtitle
                  )}
                </span>
              `
              : ""
          }

        </div>

      </div>


      <div class="rg-page-title__right">

        ${rightHtml}

        ${
          helpLabel
            ? `
              <button
                type="button"
                class="rg-help-button"
                ${
                  helpTarget
                    ? `data-page-target="${escapeHtml(
                        helpTarget
                      )}"`
                    : ""
                }
              >
                ${escapeHtml(
                  helpLabel
                )}
              </button>
            `
            : ""
        }

      </div>

    </section>
  `;
}


export function renderMetricCards(
  metrics = []
) {
  return `
    <section class="rg-metrics">

      ${
        metrics.map(
          metric => `
            <article
              class="
                rg-metric
                rg-metric--${
                  metric.tone ??
                  "primary"
                }
              "
            >

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

              ${
                metric.sub
                  ? `
                    <small>
                      ${escapeHtml(
                        metric.sub
                      )}
                    </small>
                  `
                  : ""
              }

            </article>
          `
        ).join("")
      }

    </section>
  `;
}


export function renderPanelTitle({
  title,
  subtitle = null,
  actionLabel = null,
  actionTarget = null
} = {}) {
  return `
    <header class="rg-panel-title">

      <div>
        <strong>
          ${escapeHtml(
            title ??
            ""
          )}
        </strong>

        ${
          subtitle
            ? `
              <span>
                ${escapeHtml(
                  subtitle
                )}
              </span>
            `
            : ""
        }
      </div>


      ${
        actionLabel
          ? `
            <button
              type="button"
              ${
                actionTarget
                  ? `data-page-target="${escapeHtml(
                      actionTarget
                    )}"`
                  : ""
              }
            >
              ${escapeHtml(
                actionLabel
              )}
            </button>
          `
          : ""
      }

    </header>
  `;
}


export function renderBottomNavigation(
  items = []
) {
  return `
    <nav class="rg-bottom-nav" style="--rg-nav-count:${Math.max(1, items.length)}">

      ${
        items.map(
          item => {
            const target =
              item.target ??
              item.id;

            const label =
              item.label ??
              item.title ??
              target;

            const badge =
              Math.max(
                0,
                Number(
                  item.badge
                ) ||
                0
              );


            return `
              <button
                type="button"
                class="rg-bottom-nav__item ${
                  item.active
                    ? "is-active"
                    : ""
                }"
                data-page-target="${escapeHtml(
                  target
                )}"
              >

                <span class="rg-bottom-nav__icon">
                  ${renderUiIcon(
                    item.icon ??
                    target,
                    "rg-bottom-nav__svg"
                  )}

                  ${
                    badge >
                    0
                      ? `
                        <b class="rg-nav-badge">
                          ${
                            badge >
                            99
                              ? "99+"
                              : badge
                          }
                        </b>
                      `
                      : ""
                  }

                </span>

                <strong>
                  ${escapeHtml(
                    label
                  )}
                </strong>

              </button>
            `;
          }
        ).join("")
      }

    </nav>
  `;
}


export function renderGameScreen({
  topBar,
  noticeTicker,
  pageTitle,
  body = "",
  content = null,
  bottomNavigation = []
} = {}) {
  return `
    <main class="rg-screen">

      ${
        topBar
          ? renderGameTopBar(
              topBar?.model ??
              topBar,
              topBar?.options ??
              {}
            )
          : ""
      }

      ${
        noticeTicker
          ? renderNoticeTicker(
              noticeTicker?.model ??
              noticeTicker
            )
          : ""
      }

      ${
        pageTitle
          ? renderPageTitle(
              pageTitle?.model ??
              pageTitle
            )
          : ""
      }

      ${
        content ??
        body
      }

      ${renderBottomNavigation(
        Array.isArray(
          bottomNavigation
        )
          ? bottomNavigation
          : bottomNavigation
              ?.items ??
            []
      )}

    </main>
  `;
}
