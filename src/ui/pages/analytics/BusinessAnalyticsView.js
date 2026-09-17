import {
  businessAnalyticsPageSystem
} from "./BusinessAnalyticsPageSystem.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  const number =
    Number(value ?? 0);

  const sign =
    number < 0
      ? "-"
      : "";

  return (
    sign +
    "¥" +
    Math.abs(
      Math.round(number)
    ).toLocaleString("zh-CN")
  );
}

function changeText(value) {
  if (value === null) {
    return "新周期";
  }

  if (value === 0) {
    return "持平";
  }

  return (
    (value > 0 ? "+" : "") +
    value +
    "%"
  );
}

function changeClass(value) {
  if (
    value === null ||
    value === 0
  ) {
    return "neutral";
  }

  return value > 0
    ? "up"
    : "down";
}

function alertName(level) {
  return {
    info: "提示",
    warning: "关注",
    critical: "重要"
  }[level] ?? level;
}

function warningName(id) {
  return {
    no_sales: "无销量",
    slow_moving: "滞销",
    low_margin: "低毛利",
    loss_making: "亏损",
    quality_problem: "品质异常"
  }[id] ?? id;
}

function supplyRiskLabel(value) {
  if (value > 0) {
    return "需要处理";
  }

  return "正常";
}

class BusinessAnalyticsView {
  constructor({
    pageSystem =
      businessAnalyticsPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.period =
      "week";

    this.section =
      "overview";
  }

  mount(
    root,
    {
      restaurantId,
      period = "week"
    } = {}
  ) {
    if (!root) {
      throw new Error(
        "BusinessAnalyticsView root is required"
      );
    }

    if (!restaurantId) {
      throw new Error(
        "restaurantId is required"
      );
    }

    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.period =
      period;

    this.render();

    return this;
  }

  getPage() {
    return this.pageSystem
      .getPage(
        this.restaurantId,
        {
          period:
            this.period
        }
      );
  }

  render() {
    const page =
      this.getPage();

    this.root.className =
      "business-analytics-page";

    this.root.innerHTML =
      this.renderMarkup(
        page
      );

    this.bind();

    return page;
  }

  renderMarkup(page) {
    return `
      <header class="analytics-header">
        <div>
          <span class="analytics-eyebrow">
            门店经营中枢
          </span>

          <h1>
            经营数据
          </h1>

          <p>
            第${page.range.startDay}天
            —
            第${page.range.endDay}天
          </p>
        </div>

        <div class="analytics-periods">
          ${page.periods.map(
            item => `
              <button
                type="button"
                data-period="${item.id}"
                class="${
                  page.period ===
                  item.id
                    ? "active"
                    : ""
                }"
              >
                ${escapeHtml(item.name)}
              </button>
            `
          ).join("")}
        </div>
      </header>

      <section class="analytics-kpis">
        ${this.renderKpi(
          "营业收入",
          money(
            page.finance.revenue
          ),
          page.finance
            .revenueChange
        )}

        ${this.renderKpi(
          "经营利润",
          money(
            page.finance.profit
          ),
          page.finance
            .profitChange
        )}

        ${this.renderKpi(
          "订单",
          page.finance.orders,
          page.finance
            .orderChange
        )}

        <article>
          <span>客单价</span>

          <strong>
            ${money(
              page.finance.averageSpend
            )}
          </strong>

          <small class="neutral">
            毛利率
            ${page.finance.profitMargin}%
          </small>
        </article>
      </section>

      <nav class="analytics-tabs">
        ${[
          ["overview", "总览"],
          ["dishes", "菜品"],
          ["team", "员工"],
          ["supply", "供应链"]
        ].map(
          ([id, name]) => `
            <button
              type="button"
              data-section="${id}"
              class="${
                this.section === id
                  ? "active"
                  : ""
              }"
            >
              ${name}
            </button>
          `
        ).join("")}
      </nav>

      <main class="analytics-body">
        ${this.renderSection(page)}
      </main>
    `;
  }

  renderKpi(
    title,
    value,
    change
  ) {
    return `
      <article>
        <span>
          ${escapeHtml(title)}
        </span>

        <strong>
          ${value}
        </strong>

        <small
          class="${changeClass(change)}"
        >
          ${changeText(change)}
        </small>
      </article>
    `;
  }

  renderSection(page) {
    if (
      this.section ===
      "dishes"
    ) {
      return this.renderDishes(
        page
      );
    }

    if (
      this.section ===
      "team"
    ) {
      return this.renderTeam(
        page
      );
    }

    if (
      this.section ===
      "supply"
    ) {
      return this.renderSupply(
        page
      );
    }

    return this.renderOverview(
      page
    );
  }

  renderOverview(page) {
    return `
      <section class="analytics-overview-grid">
        <div class="analytics-panel analytics-trend-panel">
          <header>
            <div>
              <span>经营趋势</span>
              <h2>收入与利润</h2>
            </div>

            <small>
              最近
              ${page.trend.length}
              天
            </small>
          </header>

          ${this.renderTrend(
            page.trend
          )}
        </div>

        <div class="analytics-panel">
          <header>
            <div>
              <span>成本结构</span>
              <h2>本期经营</h2>
            </div>
          </header>

          <div class="analytics-cost-list">
            ${this.renderCostRow(
              "食材成本",
              page.finance
                .ingredientCost,
              page.finance
                .revenue
            )}

            ${this.renderCostRow(
              "工资",
              page.finance.payroll,
              page.finance
                .revenue
            )}

            ${this.renderCostRow(
              "经营利润",
              page.finance.profit,
              page.finance
                .revenue
            )}
          </div>
        </div>

        <div class="analytics-panel">
          <header>
            <div>
              <span>异常中心</span>
              <h2>
                ${
                  page.alerts.length
                }
                项提醒
              </h2>
            </div>
          </header>

          <div class="analytics-alert-list">
            ${
              page.alerts.length
                ? page.alerts.map(
                    alert => `
                      <article
                        class="analytics-alert ${alert.level}"
                      >
                        <em>
                          ${alertName(
                            alert.level
                          )}
                        </em>

                        <div>
                          <strong>
                            ${escapeHtml(
                              alert.title
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              alert.message
                            )}
                          </span>
                        </div>
                      </article>
                    `
                  ).join("")
                : `
                  <div class="analytics-empty">
                    当前没有明显经营异常
                  </div>
                `
            }
          </div>
        </div>

        <div class="analytics-panel">
          <header>
            <div>
              <span>经营建议</span>
              <h2>下一步关注</h2>
            </div>
          </header>

          <div class="analytics-decision-list">
            ${
              page.decisions.length
                ? page.decisions.map(
                    (item, index) => `
                      <article>
                        <strong>
                          ${index + 1}
                        </strong>

                        <span>
                          ${escapeHtml(
                            item.text
                          )}
                        </span>
                      </article>
                    `
                  ).join("")
                : `
                  <div class="analytics-empty">
                    当前经营数据不足以生成建议
                  </div>
                `
            }
          </div>
        </div>
      </section>

      <section class="analytics-panel analytics-top-dishes">
        <header>
          <div>
            <span>菜品贡献</span>
            <h2>本期主要菜品</h2>
          </div>
        </header>

        ${this.renderDishRows(
          page.dishes.byRevenue
            .slice(0, 5)
        )}
      </section>
    `;
  }

  renderTrend(records) {
    if (
      records.length === 0
    ) {
      return `
        <div class="analytics-empty">
          暂无趋势数据
        </div>
      `;
    }

    const maxValue =
      Math.max(
        1,
        ...records.flatMap(
          item => [
            Math.abs(
              item.revenue ?? 0
            ),
            Math.abs(
              item.profit ?? 0
            )
          ]
        )
      );

    const limited =
      records.length > 14
        ? records.slice(-14)
        : records;

    return `
      <div class="analytics-chart">
        ${limited.map(
          item => {
            const revenueHeight =
              Math.max(
                2,
                Math.round(
                  Math.abs(
                    item.revenue
                  ) /
                  maxValue *
                  100
                )
              );

            const profitHeight =
              Math.max(
                2,
                Math.round(
                  Math.abs(
                    item.profit
                  ) /
                  maxValue *
                  100
                )
              );

            return `
              <div class="analytics-chart-column">
                <div class="analytics-bars">
                  <i
                    class="revenue"
                    style="height:${revenueHeight}%"
                    title="收入 ${item.revenue}"
                  ></i>

                  <i
                    class="profit ${
                      item.profit < 0
                        ? "negative"
                        : ""
                    }"
                    style="height:${profitHeight}%"
                    title="利润 ${item.profit}"
                  ></i>
                </div>

                <span>
                  ${item.day}
                </span>
              </div>
            `;
          }
        ).join("")}
      </div>

      <div class="analytics-chart-legend">
        <span>
          <i class="revenue"></i>
          收入
        </span>

        <span>
          <i class="profit"></i>
          利润
        </span>
      </div>
    `;
  }

  renderCostRow(
    name,
    value,
    revenue
  ) {
    const rate =
      revenue > 0
        ? Math.round(
            Math.abs(value) /
            revenue *
            100
          )
        : 0;

    return `
      <div>
        <header>
          <span>
            ${escapeHtml(name)}
          </span>

          <strong>
            ${money(value)}
          </strong>
        </header>

        <i>
          <b
            style="width:${
              Math.min(
                100,
                rate
              )
            }%"
          ></b>
        </i>

        <small>
          ${rate}%
        </small>
      </div>
    `;
  }

  renderDishes(page) {
    return `
      <section class="analytics-dish-summary">
        ${this.renderDishHighlight(
          "销量第一",
          page.dishes.topSelling
        )}

        ${this.renderDishHighlight(
          "营收第一",
          page.dishes.topRevenue
        )}

        ${this.renderDishHighlight(
          "利润第一",
          page.dishes.topProfit
        )}
      </section>

      <section class="analytics-panel">
        <header>
          <div>
            <span>菜单贡献</span>
            <h2>菜品经营表现</h2>
          </div>
        </header>

        ${this.renderDishRows(
          page.dishes.byRevenue
        )}
      </section>

      ${
        page.dishes.warnings.length
          ? `
            <section class="analytics-panel">
              <header>
                <div>
                  <span>菜品诊断</span>
                  <h2>需要调整</h2>
                </div>
              </header>

              <div class="analytics-warning-dishes">
                ${page.dishes.warnings.map(
                  dish => `
                    <article>
                      <strong>
                        ${escapeHtml(
                          dish.name
                        )}
                      </strong>

                      <div>
                        ${dish.warnings.map(
                          warning => `
                            <span>
                              ${warningName(
                                warning
                              )}
                            </span>
                          `
                        ).join("")}
                      </div>
                    </article>
                  `
                ).join("")}
              </div>
            </section>
          `
          : ""
      }
    `;
  }

  renderDishHighlight(
    label,
    dish
  ) {
    return `
      <article>
        <span>
          ${escapeHtml(label)}
        </span>

        <strong>
          ${
            dish
              ? escapeHtml(
                  dish.name
                )
              : "-"
          }
        </strong>

        <small>
          ${
            dish
              ? `${dish.quantity}份 · ${money(dish.revenue)}`
              : "暂无数据"
          }
        </small>
      </article>
    `;
  }

  renderDishRows(dishes) {
    if (
      dishes.length === 0
    ) {
      return `
        <div class="analytics-empty">
          暂无菜品销售数据
        </div>
      `;
    }

    return `
      <div class="analytics-dish-table">
        <div class="analytics-table-head">
          <span>菜品</span>
          <span>销量</span>
          <span>营收</span>
          <span>利润</span>
          <span>毛利率</span>
        </div>

        ${dishes.map(
          dish => `
            <article>
              <strong>
                ${escapeHtml(
                  dish.name
                )}
              </strong>

              <span>
                ${dish.quantity}
              </span>

              <span>
                ${money(
                  dish.revenue
                )}
              </span>

              <span>
                ${money(
                  dish.profit
                )}
              </span>

              <span>
                ${dish.marginRate}%
              </span>
            </article>
          `
        ).join("")}
      </div>
    `;
  }

  renderTeam(page) {
    const team =
      page.employees;

    return `
      <section class="analytics-team-grid">
        <article>
          <span>在职员工</span>
          <strong>
            ${team.total}
          </strong>
        </article>

        <article>
          <span>平均心情</span>
          <strong>
            ${team.averageMood}
          </strong>
        </article>

        <article>
          <span>平均疲劳</span>
          <strong>
            ${team.averageFatigue}
          </strong>
        </article>

        <article>
          <span>平均忠诚</span>
          <strong>
            ${team.averageLoyalty}
          </strong>
        </article>
      </section>

      <section class="analytics-panel">
        <header>
          <div>
            <span>团队风险</span>
            <h2>员工状态</h2>
          </div>
        </header>

        <div class="analytics-risk-grid">
          ${this.renderRiskCard(
            "高疲劳",
            team.highFatigue,
            "需要调整排班或增加休息"
          )}

          ${this.renderRiskCard(
            "低忠诚",
            team.lowLoyalty,
            "需要关注工资、管理和员工关系"
          )}

          ${this.renderRiskCard(
            "离职预警",
            team.turnoverWarning,
            "存在较高人员流失可能"
          )}

          ${this.renderRiskCard(
            "欠薪",
            money(
              team.salaryArrears
            ),
            "工资未按时结算会持续影响团队稳定"
          )}
        </div>
      </section>
    `;
  }

  renderRiskCard(
    title,
    value,
    message
  ) {
    return `
      <article>
        <div>
          <span>
            ${escapeHtml(title)}
          </span>

          <strong>
            ${value}
          </strong>
        </div>

        <p>
          ${escapeHtml(message)}
        </p>
      </article>
    `;
  }

  renderSupply(page) {
    const supply =
      page.supply;

    return `
      <section class="analytics-team-grid">
        <article>
          <span>库存品类</span>
          <strong>
            ${supply.ingredientKinds}
          </strong>
        </article>

        <article>
          <span>可用库存</span>
          <strong>
            ${supply.usableQuantity}
          </strong>
        </article>

        <article>
          <span>在途采购</span>
          <strong>
            ${supply.pendingOrders}
          </strong>
        </article>

        <article>
          <span>应付账款</span>
          <strong>
            ${money(
              supply.openPayablesAmount
            )}
          </strong>
        </article>
      </section>

      <section class="analytics-panel">
        <header>
          <div>
            <span>供应链状态</span>
            <h2>库存与采购风险</h2>
          </div>
        </header>

        <div class="analytics-risk-grid">
          ${this.renderRiskCard(
            "库存损耗",
            supply.spoiledQuantity,
            supplyRiskLabel(
              supply.spoiledQuantity
            )
          )}

          ${this.renderRiskCard(
            "在途采购金额",
            money(
              supply.pendingOrderValue
            ),
            `${supply.pendingOrders}笔订单等待到货`
          )}

          ${this.renderRiskCard(
            "未结账款",
            money(
              supply.openPayablesAmount
            ),
            `${supply.openPayables}笔供应商账款`
          )}

          ${this.renderRiskCard(
            "逾期账款",
            money(
              supply.overdueAmount
            ),
            `${supply.overduePayables}笔逾期`
          )}
        </div>
      </section>
    `;
  }

  bind() {
    this.root
      .querySelectorAll(
        "[data-period]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.period =
                button.dataset.period;

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-section]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.section =
                button.dataset.section;

              this.render();
            }
          );
        }
      );
  }
}

export const businessAnalyticsView =
  new BusinessAnalyticsView();

export {
  BusinessAnalyticsView
};
