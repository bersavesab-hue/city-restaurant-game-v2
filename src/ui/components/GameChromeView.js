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


  const speeds =
    model?.actions
      ?.speeds ??
    clock.speedOptions ??
    [
      1,
      2,
      4
    ];


  return `
    <header
      class="rg-topbar"
      aria-label="门店 天气 资金 等级"
    >
<section class="rg-topbar__identity">
<button
          type="button"
          class="rg-topbar__avatar"
          data-page-target="settings"
          aria-label="打开玩家与设置"
        >
          ${renderUiIcon(
            "employees",
            "rg-topbar__avatar-icon"
          )}
        </button>

        <div class="rg-topbar__identity-copy">

          <strong>
            ${escapeHtml(
              model?.scope?.type === "group"
                ? model?.brandName ?? "集团总览"
                : model?.restaurantName ??
              "未命名餐厅"
            )}
          </strong>

          ${
            model?.actions?.canRename &&
            model?.scope?.type !== "group"
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


          <span>
            ${model?.scope?.canSwitch
              ? `
                <label class="rg-scope-select">
                  <span class="rg-visually-hidden">当前管理范围</span>
                  <select data-action="switch-management-scope">
                    <option value="group" ${model.scope.type === "group" ? "selected" : ""}>集团视角</option>
                    ${model.scope.stores.map(store => `
                      <option value="store:${escapeHtml(store.id)}" ${model.scope.type === "store" && model.scope.storeId === store.id ? "selected" : ""}>
                        ${escapeHtml(store.name)}
                      </option>
                    `).join("")}
                  </select>
                </label>
              `
              : escapeHtml(
                  subtitle ??
                  locationLabel ??
                  model?.brandName ??
                  "单店经营"
                )}
          </span>

        </div>

      </section>


      <section class="rg-topbar__clock">
<i class="rg-topbar__weather-label">天气</i>

        <span>
          ${
            model?.weather
              ?.label
              ? escapeHtml(
                  model.weather
                    .label
                )
              : "经营时间"
          }
        </span>

        <strong>
          ${escapeHtml(
            clock.clockText ??
            "--:--"
          )}
        </strong>

        <small>
          ${escapeHtml(
            clock.dateText ??
            ""
          )}
        </small>

      </section>


      <section class="rg-topbar__money">

        <span>
          当前资金
        </span>

        <strong>
          ${money(
            model?.balance
          )}
        </strong>

      </section>


      <section class="rg-topbar__level">

        <span>
          门店等级
        </span>

        <strong>
          Lv.${level}
        </strong>

        <small>
          声望
          ${
            model?.reputation ??
            0
          }
        </small>

      </section>


      ${
        showSpeedControls
          ? `
            <section class="rg-topbar__speed">

              <button
                type="button"
                data-action="pause"
              >
                ${
                  clock.paused
                    ? "▶"
                    : "Ⅱ"
                }
              </button>

              ${
                speeds
                  .map(
                    speed => `
                      <button
                        type="button"
                        data-action="speed"
                        data-speed="${speed}"
                        class="${
                          !clock.paused &&
                          clock.speed ===
                            speed
                            ? "is-active"
                            : ""
                        }"
                      >
                        ${speed}×
                      </button>
                    `
                  )
                  .join("")
              }

            </section>
          `
          : ""
      }

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
    <nav class="rg-bottom-nav">

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
                class="${
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
