function money(value) {
  return (
    "¥" +
    Math.round(
      value ?? 0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function severityName(
  severity
) {
  return {
    critical: "立即处理",
    high: "优先处理",
    medium: "需要关注",
    low: "可优化"
  }[severity] ?? severity;
}


function channelName(
  id
) {
  return {
    dine_in: "堂食",
    pickup: "自取",
    delivery: "外卖",
    reservation: "预约"
  }[id] ?? id;
}


class OperatingCommandCenterView {
  renderMarkup(page) {
    return `
      <main class="command-center">

        <header class="command-center__header">
          <div>
            <span>第${page.day}天 · 今日经营</span>

            <h1>
              ${page.restaurant.name}
            </h1>
          </div>

          <div>
            评价
            ${page.restaurant.reviewScore.toFixed(1)}
          </div>
        </header>


        <section class="command-center__kpis">

          <article>
            <span>今日营业额</span>
            <strong>
              ${money(
                page.sales.revenue
              )}
            </strong>
          </article>

          <article>
            <span>今日利润</span>
            <strong>
              ${money(
                page.sales.profit
              )}
            </strong>
          </article>

          <article>
            <span>今日订单</span>
            <strong>
              ${page.sales.orderCount}
            </strong>
          </article>

          <article>
            <span>现金余额</span>
            <strong>
              ${money(
                page.finance.balance
              )}
            </strong>
          </article>

        </section>


        ${
          page.previousDay
            ? `
              <section class="command-center__daily-report">

                <header>
                  <div>
                    <span>
                      第${page.previousDay.day}天
                    </span>

                    <h2>
                      昨日经营日报
                    </h2>
                  </div>

                  <button
                    type="button"
                    data-page-target="analytics"
                    data-page-period="day"
                  >
                    查看完整日报 →
                  </button>
                </header>


                <div class="command-center__grid">

                  <article>
                    <span>营业额</span>
                    <strong>
                      ${money(
                        page.previousDay.revenue
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>订单</span>
                    <strong>
                      ${page.previousDay.orders}
                    </strong>
                  </article>

                  <article>
                    <span>经营利润</span>
                    <strong>
                      ${money(
                        page.previousDay.operatingProfit
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>经营经验</span>
                    <strong>
                      +${page.previousDay.experienceGained}
                    </strong>
                  </article>

                </div>

              </section>
            `
            : ""
        }

        <section class="command-center__priority">

          <h2>
            今天最该处理
          </h2>

          ${
            page.priorities.length
              ? page.priorities
                  .map(
                    item => `
                      <article
                        data-target="${item.target}"
                        data-severity="${item.severity}"
                      >
                        <div>
                          <b>
                            ${severityName(
                              item.severity
                            )}
                          </b>

                          <strong>
                            ${item.title}
                          </strong>
                        </div>

                        <p>
                          ${item.description}
                        </p>

                        <button
                          type="button"
                          data-page-target="${item.target}"
                          class="command-center__action"
                        >
                          去处理 →
                        </button>
                      </article>
                    `
                  )
                  .join("")
              : `
                <article>
                  <strong>
                    今日经营正常
                  </strong>

                  <p>
                    暂无需要优先处理的问题
                  </p>
                </article>
              `
          }

        </section>


        <section>

          <h2>
            客流与承载
          </h2>

          <div class="command-center__grid">

            <article>
              <span>到店</span>
              <strong>
                ${page.capacity.arrivals}
              </strong>
            </article>

            <article>
              <span>接待</span>
              <strong>
                ${page.capacity.served}
              </strong>
            </article>

            <article>
              <span>弃单率</span>
              <strong>
                ${page.capacity.abandonmentRate}%
              </strong>
            </article>

            <article>
              <span>流失营业额</span>
              <strong>
                ${money(
                  page.capacity.lostRevenue
                )}
              </strong>
            </article>

          </div>

        </section>


        <section>

          <h2>
            菜单表现
          </h2>

          <div class="command-center__grid">

            <article>
              <span>明星菜</span>
              <strong>
                ${page.menu.counts.star}
              </strong>
            </article>

            <article>
              <span>现金牛</span>
              <strong>
                ${page.menu.counts.cash_cow}
              </strong>
            </article>

            <article>
              <span>问题菜</span>
              <strong>
                ${page.menu.counts.puzzle}
              </strong>
            </article>

            <article>
              <span>低效菜</span>
              <strong>
                ${page.menu.counts.dog}
              </strong>
            </article>

          </div>

        </section>


        <section>

          <h2>
            门店状态
          </h2>

          <div class="command-center__grid">

            <article>
              <span>低库存</span>
              <strong>
                ${page.inventory.lowStockCount}
              </strong>
            </article>

            <article>
              <span>缺货</span>
              <strong>
                ${page.inventory.outOfStockCount}
              </strong>
            </article>

            <article>
              <span>在岗员工</span>
              <strong>
                ${page.workforce.availableEmployees}
              </strong>
            </article>

            <article>
              <span>疲劳停工</span>
              <strong>
                ${
                  page.workforce
                    .exhaustedEmployees
                    ?.length ?? 0
                }
              </strong>
            </article>

          </div>

        </section>


        <section>

          <h2>
            渠道收入
          </h2>

          ${
            page.sales.channels.length
              ? page.sales.channels
                  .map(
                    channel => `
                      <article>
                        <strong>
                          ${channelName(
                            channel.channelId
                          )}
                        </strong>

                        <span>
                          ${channel.orders}单
                        </span>

                        <b>
                          ${money(
                            channel.revenue
                          )}
                        </b>
                      </article>
                    `
                  )
                  .join("")
              : "<p>今天暂无渠道成交</p>"
          }

        </section>

      </main>
    `;
  }
}


export const operatingCommandCenterView =
  new OperatingCommandCenterView();

export {
  OperatingCommandCenterView
};
