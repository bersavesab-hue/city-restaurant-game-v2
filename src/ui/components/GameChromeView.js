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


function iconText(
  icon
) {
  const map = {
    city:
      "城",

    store:
      "店",

    restaurant:
      "店",

    operations:
      "营",

    employees:
      "员",

    more:
      "···"
  };


  return (
    map[icon] ??
    "□"
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
      false
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
    <header class="rg-topbar">

      <section class="rg-topbar__identity">

        <div
          class="rg-topbar__avatar"
          data-image-slot="restaurant-avatar"
        >
          店
        </div>

        <div class="rg-topbar__identity-copy">

          <strong>
            ${escapeHtml(
              model
                ?.restaurantName ??
              "未命名餐厅"
            )}
          </strong>

          <span>
            ${escapeHtml(
              subtitle ??
              locationLabel ??
              model?.brandName ??
              "餐饮经营"
            )}
          </span>

        </div>

      </section>


      <section class="rg-topbar__clock">

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
                  ${escapeHtml(
                    iconText(
                      item.icon ??
                      target
                    )
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
  bottomNavigation = []
} = {}) {
  return `
    <main class="rg-screen">

      ${
        topBar
          ? renderGameTopBar(
              topBar
            )
          : ""
      }

      ${
        noticeTicker
          ? renderNoticeTicker(
              noticeTicker
            )
          : ""
      }

      ${
        pageTitle
          ? renderPageTitle(
              pageTitle
            )
          : ""
      }

      ${body}

      ${renderBottomNavigation(
        bottomNavigation
      )}

    </main>
  `;
}
