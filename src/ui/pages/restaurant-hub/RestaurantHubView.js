function moneyWan(
  value
) {
  const amount =
    Number(value) || 0;

  if (amount >= 10000) {
    return (
      (
        amount /
        10000
      ).toFixed(1) +
      "万"
    );
  }

  return amount
    .toLocaleString(
      "zh-CN"
    );
}


function iconFor(
  icon
) {
  const icons = {
    location: "⌖",
    renovation: "✦",
    license: "◆",
    employee: "●",
    open: "✓",
    chart: "▥",
    menu: "▤"
  };

  return (
    icons[icon] ??
    "•"
  );
}


class RestaurantHubView {
  renderMarkup(page) {
    const restaurant =
      page.restaurant;

    const metrics =
      page.metrics;

    return `
      <main class="store-page">

        <header class="store-page__topbar">
          <h1>门店</h1>

          <button
            type="button"
            class="store-page__top-action"
            aria-label="门店菜单"
          >
            ⠿
          </button>
        </header>


        <section
          class="store-hero"
          style="
            --store-hero-image:
              url('${page.heroImage}');
          "
        >

          <div
            class="store-hero__status
              ${
                restaurant.status ===
                  "open"
                  ? "is-open"
                  : ""
              }"
          >
            <span class="store-hero__status-icon">
              ✓
            </span>

            ${restaurant.statusLabel}
          </div>

        </section>


        <section class="store-summary">

          <div class="store-summary__identity">

            <div>
              <div class="store-summary__title-line">
                <h2>
                  ${restaurant.name}
                </h2>

                <button
                  type="button"
                  class="store-summary__edit"
                >
                  ✎
                </button>
              </div>

              <p class="store-summary__location">
                <span>⌖</span>
                ${restaurant.location}
              </p>
            </div>

            <button
              type="button"
              class="store-summary__settings"
              data-page-target="settings"
            >
              门店设置
            </button>

          </div>


          <div class="store-summary__metrics">

            <article>
              <strong>
                ${metrics.rooms}
              </strong>

              <span>
                包厢
              </span>
            </article>

            <article>
              <strong>
                ${metrics.seats || "—"}
              </strong>

              <span>
                总餐位
              </span>
            </article>

            <article>
              <strong>
                ${metrics.score.toFixed(1)}
              </strong>

              <span>
                评分
              </span>
            </article>

            <article>
              <strong>
                ${moneyWan(
                  metrics.monthlyRevenue
                )}
              </strong>

              <span>
                月营业额
              </span>
            </article>

          </div>

        </section>


        <section class="store-section">

          <div class="store-section__heading">
            <h3>
              包厢管理
            </h3>

            <button
              type="button"
              data-page-target="renovation"
            >
              查看全部
              <span>›</span>
            </button>
          </div>


          ${
            page.rooms.length
              ? `
                <div class="room-strip">

                  ${
                    page.rooms
                      .map(
                        room => `
                          <button
                            type="button"
                            class="room-card"
                            data-page-target="renovation"
                          >
                            <div
                              class="room-card__image"
                              style="
                                --room-image:
                                  url('${room.image}');
                              "
                            ></div>

                            <div class="room-card__meta">
                              <strong>
                                ${room.name}
                              </strong>

                              <span>
                                ${
                                  room.seats
                                    ? `${room.seats}人`
                                    : "待配置"
                                }
                              </span>
                            </div>
                          </button>
                        `
                      )
                      .join("")
                  }

                </div>
              `
              : `
                <button
                  type="button"
                  class="store-empty-room"
                  data-page-target="renovation"
                >
                  <strong>
                    尚未配置包厢
                  </strong>

                  <span>
                    前往装修布局添加桌位与包厢
                  </span>
                </button>
              `
          }

        </section>


        <section class="store-section">

          <h3>
            开店进度
          </h3>


          <div class="opening-progress">

            <div class="opening-progress__line"></div>

            ${
              page.progress
                .map(
                  (
                    step,
                    index
                  ) => `
                    <div
                      class="
                        opening-step
                        opening-step--${step.state}
                      "
                    >
                      <div class="opening-step__node">
                        ${
                          step.state ===
                            "complete"
                            ? "✓"
                            : index + 1
                        }
                      </div>

                      <span>
                        ${step.label}
                      </span>
                    </div>
                  `
                )
                .join("")
            }

          </div>

        </section>


        <section class="store-section">

          <h3>
            下一步建议
          </h3>


          <div class="store-suggestions">

            ${
              page.suggestions
                .map(
                  suggestion => `
                    <button
                      type="button"
                      class="store-suggestion"
                      data-page-target="${suggestion.target}"
                    >

                      <span class="store-suggestion__icon">
                        ${iconFor(
                          suggestion.icon
                        )}
                      </span>

                      <span class="store-suggestion__copy">
                        <strong>
                          ${suggestion.title}
                        </strong>

                        <small>
                          ${suggestion.description}
                        </small>
                      </span>

                      <span class="store-suggestion__arrow">
                        ›
                      </span>

                    </button>
                  `
                )
                .join("")
            }

          </div>

        </section>


        <section class="store-page__actions">

          <button
            type="button"
            class="store-action store-action--secondary"
            data-page-target="properties"
          >
            拓展新商圈
          </button>

          <button
            type="button"
            class="store-action store-action--primary"
            data-page-target="renovation"
          >
            进入装修
          </button>

        </section>


        <nav class="store-bottom-nav">

          ${
            page.bottomNavigation
              .map(
                item => `
                  <button
                    type="button"
                    class="
                      store-bottom-nav__item
                      ${
                        item.active
                          ? "is-active"
                          : ""
                      }
                    "
                    data-page-target="${item.target}"
                  >
                    <span class="store-bottom-nav__icon">
                      ${item.icon}
                    </span>

                    <span class="store-bottom-nav__label">
                      ${item.label}
                    </span>
                  </button>
                `
              )
              .join("")
          }

        </nav>

      </main>
    `;
  }
}


export const restaurantHubView =
  new RestaurantHubView();

export {
  RestaurantHubView
};
