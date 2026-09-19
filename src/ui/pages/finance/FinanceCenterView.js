import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


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
  const number =
    Number(
      value ??
      0
    );

  return (
    (
      number <
      0
        ? "-"
        : ""
    ) +
    "¥" +
    Math.abs(
      Math.round(
        number
      )
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function healthName(
  status
) {
  return {
    healthy:
      "健康",

    watch:
      "观察",

    warning:
      "预警",

    danger:
      "危险"
  }[
    status
  ] ??
    status;
}


function healthTone(
  status
) {
  if (
    status ===
    "healthy"
  ) {
    return "success";
  }

  if (
    status ===
    "watch"
  ) {
    return "info";
  }

  if (
    status ===
    "warning"
  ) {
    return "warning";
  }

  return "danger";
}


class FinanceCenterView {
  renderMarkup(
    page
  ) {
    const navigation =
      gameChromeSystem
        .getNavigation({
          restaurantId:
            page.restaurantId,

          activePageId:
            "finance"
        });

    return `
      <main class="rg-screen finance-center-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "资金 · 利润 · 成本"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "财务中心",

          subtitle:
            `第${page.range.startDay}天—第${page.range.endDay}天`,

          backTarget:
            "operations"
        })}

        <section class="finance-periods">

          <span>
            统计周期
          </span>

          <div>
            ${page.periods
              .map(
                item => `
                  <button
                    type="button"
                    data-page-target="finance"
                    data-page-period="${escapeHtml(
                      item.id
                    )}"
                    class="${
                      page.period ===
                      item.id
                        ? "is-active"
                        : ""
                    }"
                  >
                    ${escapeHtml(
                      item.name
                    )}
                  </button>
                `
              )
              .join("")}
          </div>

        </section>


        <section class="finance-kpis">

          <article>
            <span>可用现金</span>
            <strong>
              ${money(
                page.account.balance
              )}
            </strong>
            <small>
              当前可调度资金
            </small>
          </article>

          <article>
            <span>押金占用</span>
            <strong>
              ${money(
                page.account
                  .reservedDeposits
              )}
            </strong>
            <small>
              暂不可动用
            </small>
          </article>

          <article>
            <span>应付账款</span>
            <strong>
              ${money(
                page.payables.amount
              )}
            </strong>
            <small>
              ${page.payables.count}笔
            </small>
          </article>

          <article
            class="finance-health-card finance-health-card--${healthTone(
              page.health.status
            )}"
          >
            <span>财务健康</span>
            <strong>
              ${escapeHtml(
                healthName(
                  page.health.status
                )
              )}
            </strong>
            <small>
              现金跑道
              ${
                page.health
                  .cashRunwayDays ===
                  null
                  ? "暂无"
                  : `${page.health.cashRunwayDays}天`
              }
            </small>
          </article>

        </section>


        <section class="finance-grid">

          <article class="finance-panel">

            <header>
              <strong>
                经营结果
              </strong>

              <span>
                本周期
              </span>
            </header>

            <div class="finance-result-grid">

              <div>
                <span>营业收入</span>
                <strong>
                  ${money(
                    page.summary.income
                  )}
                </strong>
              </div>

              <div>
                <span>经营支出</span>
                <strong>
                  ${money(
                    page.summary.expense
                  )}
                </strong>
              </div>

              <div>
                <span>经营利润</span>
                <strong>
                  ${money(
                    page.summary.profit
                  )}
                </strong>
              </div>

              <div>
                <span>利润率</span>
                <strong>
                  ${page.summary
                    .profitMargin}%
                </strong>
              </div>

            </div>

          </article>


          <article class="finance-panel">

            <header>
              <strong>
                现金流
              </strong>

              <span>
                ${page.summary.transactionCount}笔流水
              </span>
            </header>

            <div class="finance-result-grid">

              <div>
                <span>流入</span>
                <strong>
                  ${money(
                    page.summary.cashIn
                  )}
                </strong>
              </div>

              <div>
                <span>流出</span>
                <strong>
                  ${money(
                    page.summary.cashOut
                  )}
                </strong>
              </div>

              <div>
                <span>净现金变化</span>
                <strong>
                  ${money(
                    page.summary
                      .netCashFlow
                  )}
                </strong>
              </div>

              <div>
                <span>总资产</span>
                <strong>
                  ${money(
                    page.account
                      .totalAssets
                  )}
                </strong>
              </div>

            </div>

          </article>

        </section>


        <section class="finance-panel finance-health-panel">

          <header>
            <strong>
              经营健康
            </strong>

            <span>
              日均支出
              ${money(
                page.health
                  .averageDailyExpense
              )}
            </span>
          </header>

          <div class="finance-ratio-grid">

            ${[
              [
                "食材成本率",
                page.health
                  .costRatios
                  .ingredient
              ],
              [
                "人工成本率",
                page.health
                  .costRatios
                  .salary
              ],
              [
                "租金成本率",
                page.health
                  .costRatios
                  .rent
              ],
              [
                "渠道费用率",
                page.health
                  .costRatios
                  .channel
              ],
              [
                "营销费用率",
                page.health
                  .costRatios
                  .marketing
              ]
            ]
              .map(
                (
                  [
                    label,
                    ratio
                  ]
                ) => {
                  const percent =
                    Math.max(
                      0,
                      Number(
                        ratio ??
                        0
                      ) *
                      100
                    );

                  return `
                    <article>
                      <span>
                        ${label}
                      </span>

                      <strong>
                        ${percent.toFixed(
                          1
                        )}%
                      </strong>

                      <div>
                        <i
                          style="width:${Math.min(
                            100,
                            percent
                          )}%"
                        ></i>
                      </div>
                    </article>
                  `;
                }
              )
              .join("")}

          </div>

        </section>


        <section class="finance-grid">

          <article class="finance-panel">

            <header>
              <strong>
                收支结构
              </strong>

              <span>
                按类别汇总
              </span>
            </header>

            <div class="finance-list">

              ${
                page.categories.length
                  ? page.categories
                      .map(
                        item => `
                          <article>
                            <div>
                              <strong>
                                ${escapeHtml(
                                  item.name
                                )}
                              </strong>

                              <small>
                                ${item.count}笔
                              </small>
                            </div>

                            <div>
                              <span>
                                收入
                                ${money(
                                  item.income
                                )}
                              </span>

                              <span>
                                支出
                                ${money(
                                  item.expense
                                )}
                              </span>
                            </div>
                          </article>
                        `
                      )
                      .join("")
                  : `
                    <div class="finance-empty">
                      当前周期暂无分类流水
                    </div>
                  `
              }

            </div>

          </article>


          <article class="finance-panel">

            <header>
              <strong>
                资金流水
              </strong>

              <span>
                最新优先
              </span>
            </header>

            <div class="finance-list finance-transaction-list">

              ${
                page.transactions.length
                  ? page.transactions
                      .slice(
                        0,
                        20
                      )
                      .map(
                        item => `
                          <article>
                            <div>
                              <strong>
                                ${escapeHtml(
                                  item.description ||
                                  item.categoryName
                                )}
                              </strong>

                              <small>
                                第${item.day}天
                              </small>
                            </div>

                            <b
                              class="${
                                item.cashEffect >=
                                0
                                  ? "is-income"
                                  : "is-expense"
                              }"
                            >
                              ${money(
                                item.cashEffect
                              )}
                            </b>
                          </article>
                        `
                      )
                      .join("")
                  : `
                    <div class="finance-empty">
                      当前周期暂无资金流水
                    </div>
                  `
              }

            </div>

          </article>

        </section>


        ${renderBottomNavigation(
          navigation
        )}

      </main>
    `;
  }
}


export const financeCenterView =
  new FinanceCenterView();


export {
  FinanceCenterView
};
