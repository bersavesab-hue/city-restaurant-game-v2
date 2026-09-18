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


function eventCategoryName(
  value
) {
  return {
    weather: "天气",
    infrastructure: "交通施工",
    community: "社区",
    commercial: "商业活动",
    education: "校园",
    office_cycle: "办公周期",
    competition: "竞争",
    supply: "供应链",
    labor: "用工",
    equipment: "设备环境",
    compliance: "合规",
    reputation: "口碑",
    cost: "经营成本",
    delivery: "外卖配送",
    opportunity: "经营机会"
  }[value] ??
  "商圈";
}


function marketingCategoryName(
  value
) {
  return {
    local_acquisition: "本地拉新",
    discount_conversion: "优惠转化",
    brand_building: "品牌建设",
    content_social: "内容传播",
    delivery_growth: "外卖与自取",
    community_scene: "社区场景",
    member_retention: "会员复购",
    group_business: "团餐与宴请",
    seasonal_event: "节庆主题"
  }[value] ??
  "其他营销";
}


function marketingChannelName(
  value
) {
  return {
    dine_in: "堂食",
    pickup: "到店自取",
    delivery: "外卖",
    reservation: "预约"
  }[value] ??
  value;
}


function marketingStatusText(
  item
) {
  if (item.active) {
    return "执行中";
  }

  if (item.canStart) {
    return "可执行";
  }

  const reasons =
    item.lockedReasons ??
    [];

  if (
    reasons.includes(
      "restaurant_level"
    )
  ) {
    return (
      "需门店 Lv." +
      item.minRestaurantLevel
    );
  }

  if (
    reasons.includes(
      "required_channel"
    )
  ) {
    return (
      "需开启：" +
      (
        item.missingChannels ??
        []
      )
        .map(
          marketingChannelName
        )
        .join("、")
    );
  }

  if (
    reasons.includes(
      "cooldown"
    )
  ) {
    return (
      "冷却至第" +
      item.availableDay +
      "天"
    );
  }

  if (
    reasons.includes(
      "exclusive_group"
    )
  ) {
    return "同类营销正在执行";
  }

  if (
    reasons.includes(
      "active_limit"
    )
  ) {
    return "同时最多执行2项";
  }

  if (
    reasons.includes(
      "insufficient_funds"
    )
  ) {
    return "资金不足";
  }

  if (
    reasons.includes(
      "already_active"
    )
  ) {
    return "执行中";
  }

  return "当前不可执行";
}


function groupMarketingActions(
  actions
) {
  const groups =
    new Map();

  for (
    const item
    of actions
  ) {
    if (
      !groups.has(
        item.category
      )
    ) {
      groups.set(
        item.category,
        []
      );
    }

    groups.get(
      item.category
    ).push(
      item
    );
  }

  return [
    ...groups.entries()
  ];
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

            ${groupMarketingActions(
              page.actions.available
            )
              .map(
                ([
                  category,
                  items
                ]) => `
                  <section
                    class="market-strategy__action-group"
                    data-marketing-category="${category}"
                  >
                    <h3>
                      ${marketingCategoryName(
                        category
                      )}
                    </h3>

                    <div>
                      ${items
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
                                ·
                                Lv.${item.minRestaurantLevel}
                              </span>

                              <p>
                                ${item.description}
                              </p>

                              <small>
                                ${marketingStatusText(
                                  item
                                )}
                                ·
                                冷却
                                ${item.cooldownDays}天
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
                        ${eventCategoryName(
                          item.category
                        )}
                        ·
                        强度
                        ${item.severity ??
                          1
                        }
                        ·
                        第
                        ${item.startDay}
                        —
                        ${item.endDay}
                        天
                      </span>

                      <small>
                        ${item.description ??
                          "商圈经营环境发生变化"
                        }
                      </small>
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
