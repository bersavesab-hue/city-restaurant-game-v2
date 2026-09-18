import {
  marketStrategyPageSystem
} from "./MarketStrategyPageSystem.js";


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


function percent(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "--";
  }


  return (
    Number(value)
      .toFixed(1) +
    "%"
  );
}


function alertName(
  value
) {
  return {
    critical_share:
      "市场份额偏低",

    losing_share:
      "市场份额下降",

    dominant:
      "商圈优势明显",

    gaining_share:
      "市场份额上升",

    stable:
      "竞争态势稳定"
  }[value] ??
  value;
}


class MarketStrategyView {
  constructor({
    pageSystem =
      marketStrategyPageSystem
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
      <main class="market-strategy">

        <header class="market-strategy__header">

          <div>
            <span>
              市场 · 定位 · 竞争
            </span>

            <h1>
              市场与竞争
            </h1>

            <p>
              ${page.district
                ? page.district.name
                : "尚未形成有效商圈"
              }
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


        <section class="market-strategy__overview">

          <article>
            <span>市场份额</span>
            <strong>
              ${percent(
                page.insight
                  .marketShare
              )}
            </strong>
          </article>

          <article>
            <span>份额变化</span>
            <strong>
              ${page.insight.change >= 0
                ? "+"
                : ""
              }${page.insight.change}%
            </strong>
          </article>

          <article>
            <span>竞争店</span>
            <strong>
              ${page.competition
                .competitorCount}
            </strong>
          </article>

          <article>
            <span>市场状态</span>
            <strong>
              ${alertName(
                page.insight
                  .alert
              )}
            </strong>
          </article>

        </section>


        <section class="market-strategy__positioning">

          <header>
            <div>
              <span>当前定位</span>
              <h2>
                ${page.positioning
                  .positioningName}
              </h2>
            </div>

            <strong>
              匹配度
              ${page.positioning
                .fitScore}
            </strong>
          </header>


          <div class="market-strategy__positioning-grid">

            ${page.positioningOptions
              .map(
                item => `
                  <button
                    type="button"
                    data-positioning-id="${item.id}"
                    class="${
                      item.id ===
                      page.positioning
                        .positioningId
                        ? "is-active"
                        : ""
                    }"
                  >

                    <strong>
                      ${item.name}
                    </strong>

                    <span>
                      综合匹配
                      ${item.fitScore}
                    </span>

                    <small>
                      商圈
                      ${item.districtFit}
                      ·
                      菜单
                      ${item.categoryFit}
                      ·
                      价格
                      ${item.priceFit}
                    </small>

                  </button>
                `
              )
              .join("")}

          </div>

        </section>


        <section class="market-strategy__actions">

          <h2>
            市场动作
          </h2>

          <p>
            同时最多执行2项市场动作。
          </p>


          <div>

            ${page.actions.available
              .map(
                item => `
                  <article>

                    <strong>
                      ${item.name}
                    </strong>

                    <span>
                      ${money(
                        item.cost
                      )}
                      ·
                      ${item.durationDays}天
                    </span>

                    <small>
                      ${item.active
                        ? "执行中"
                        : item.canStart
                          ? "可执行"
                          : "当前不可执行"
                      }
                    </small>

                    <button
                      type="button"
                      data-market-action="${item.id}"
                      ${item.canStart
                        ? ""
                        : "disabled"
                      }
                    >
                      ${item.active
                        ? "执行中"
                        : "开始行动"
                      }
                    </button>

                  </article>
                `
              )
              .join("")}

          </div>

        </section>


        <section class="market-strategy__competition">

          <h2>
            主要竞争店
          </h2>

          ${page.competition
            .competitors
            .length
            ? page.competition
                .competitors
                .slice(
                  0,
                  8
                )
                .map(
                  item => `
                    <article>

                      <strong>
                        ${item.name}
                      </strong>

                      <span>
                        ${item.templateName ??
                          "独立经营店"
                        }
                        ·
                        实力 T${item.strengthTier ??
                          3
                        }
                      </span>

                      <span>
                        口碑
                        ${item.reputation}
                      </span>

                      <span>
                        品质
                        ${item.qualityScore}
                      </span>

                      <span>
                        服务
                        ${item.serviceScore}
                      </span>

                      <small>
                        ${item.strategy
                          ? "策略：" +
                            item.strategy
                          : "策略观察中"
                        }
                      </small>

                    </article>
                  `
                )
                .join("")
            : "<p>当前商圈暂无已识别竞争店。</p>"
          }

        </section>


        <section class="market-strategy__events">

          <h2>
            商圈事件
          </h2>

          ${page.events.active
            .length
            ? page.events.active
                .map(
                  item => `
                    <article>
                      <strong>
                        ${item.name}
                      </strong>

                      <span>
                        第
                        ${item.startDay}
                        —
                        ${item.endDay}
                        天
                      </span>
                    </article>
                  `
                )
                .join("")
            : "<p>当前没有正在发生的商圈事件。</p>"
          }

        </section>

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
        "[data-positioning-id]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .setPositioning(
                  this.restaurantId,
                  button.dataset
                    .positioningId
                );

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-market-action]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              if (
                button.disabled
              ) {
                return;
              }


              this.pageSystem
                .startMarketAction(
                  this.restaurantId,
                  button.dataset
                    .marketAction
                );

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


export const marketStrategyView =
  new MarketStrategyView();


export {
  MarketStrategyView
};
