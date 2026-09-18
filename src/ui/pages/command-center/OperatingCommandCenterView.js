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
    const awardFeedback =
      page.awardFeedback ?? {
        unreadCount:
          0,

        notifications:
          [],

        cycleWarnings:
          [],

        rankingChase:
          []
      };


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

        ${
          page.latestHour
            ? `
              <section class="command-center__live-hour">

                <header>
                  <div>
                    <span>
                      最新营业小时
                    </span>

                    <h2>
                      ${String(
                        page.latestHour.hour
                      ).padStart(2, "0")}:00 经营现场
                    </h2>
                  </div>

                  <strong>
                    ${
                      page.latestHour.bottleneck
                        ? `当前瓶颈：${page.latestHour.bottleneck.name ?? page.latestHour.bottleneck.id}`
                        : "当前无明显瓶颈"
                    }
                  </strong>
                </header>


                <div class="command-center__grid">

                  <article>
                    <span>到店 / 接待</span>
                    <strong>
                      ${page.latestHour.arrivals}
                      /
                      ${page.latestHour.served}
                    </strong>
                    <small>
                      接待率 ${page.latestHour.serviceRate}%
                    </small>
                  </article>

                  <article>
                    <span>本小时订单</span>
                    <strong>
                      ${page.latestHour.orders}
                    </strong>
                    <small>
                      出餐 ${page.latestHour.portions} 份
                    </small>
                  </article>

                  <article>
                    <span>本小时营收</span>
                    <strong>
                      ${money(page.latestHour.revenue)}
                    </strong>
                    <small>
                      平均出品 ${page.latestHour.averageQuality}
                    </small>
                  </article>

                  <article>
                    <span>排队 / 流失</span>
                    <strong>
                      ${page.latestHour.waiting}
                      /
                      ${page.latestHour.abandoned}
                    </strong>
                    <small>
                      预计等待 ${page.latestHour.estimatedWaitMinutes} 分钟
                    </small>
                  </article>

                  <article>
                    <span>库存风险</span>
                    <strong>
                      ${page.inventory.lowStockCount + page.inventory.outOfStockCount}
                    </strong>
                    <small>
                      缺货 ${page.inventory.outOfStockCount} · 低库存 ${page.inventory.lowStockCount}
                    </small>
                  </article>

                  <article>
                    <span>员工平均疲劳</span>
                    <strong>
                      ${page.workforcePulse.averageFatigue}
                    </strong>
                    <small>
                      高疲劳 ${page.workforcePulse.highFatigue} 人
                    </small>
                  </article>

                </div>

                ${
                  page.latestHour.abandoned > 0
                    ? `
                      <p class="command-center__live-warning">
                        本小时流失
                        ${page.latestHour.abandoned}
                        位顾客，预计损失
                        ${money(page.latestHour.lostRevenue)}
                      </p>
                    `
                    : ""
                }

              </section>
            `
            : `
              <section class="command-center__live-hour">
                <h2>营业现场</h2>
                <p>
                  今天还没有完成营业小时，开门后这里会实时显示客流、订单和产能瓶颈。
                </p>
              </section>
            `
        }

        <section class="command-center__awards-feedback">

          <header>
            <div>
              <span>
                竞争与荣誉
              </span>

              <h2>
                榜单与奖项进度
              </h2>
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

              <button
                type="button"
                data-page-target="honor-hall"
              >
                荣誉馆
              </button>
            </nav>
          </header>


          ${
            awardFeedback
              .cycleWarnings
              .length
              ? `
                <article>
                  <strong>
                    ${awardFeedback.cycleWarnings[0].name}
                  </strong>

                  <span>
                    距离结算
                    ${awardFeedback.cycleWarnings[0].remainingDays}
                    天
                  </span>
                </article>
              `
              : ""
          }


          ${
            awardFeedback
              .rankingChase
              .length
              ? awardFeedback
                  .rankingChase
                  .map(
                    item => `
                      <article>
                        <strong>
                          ${item.boardTitle}
                        </strong>

                        <span>
                          当前第
                          ${item.rank}
                          名
                        </span>

                        <small>
                          ${
                            item.firstPlace
                              ? "当前榜首"
                              : item.topThree
                                ? `距离第${item.targetRank}名还差 ${Number(item.gap.toFixed(1))}`
                                : `距离前三还差 ${Number(item.gap.toFixed(1))}`
                          }
                        </small>
                      </article>
                    `
                  )
                  .join("")
              : `
                <p>
                  当前还没有形成可比较的榜单数据。
                </p>
              `
          }


          ${
            awardFeedback
              .notifications
              .length
              ? `
                <div class="command-center__award-notices">
                  ${awardFeedback.notifications
                    .map(
                      item => `
                        <button
                          type="button"
                          data-page-target="${item.action}"
                        >
                          <strong>
                            ${item.title}
                          </strong>

                          <span>
                            ${item.message}
                          </span>
                        </button>
                      `
                    )
                    .join("")}
                </div>
              `
              : ""
          }

        </section>

        <section class="command-center__management-shortcuts">

          <h2>
            门店设施
          </h2>

          <div class="command-center__grid">

            <button
              type="button"
              data-page-target="equipment-management"
            >
              <strong>
                设备管理
              </strong>

              <span>
                后厨、冷藏、收银等设备配置
              </span>
            </button>

            <button
              type="button"
              data-page-target="equipment-maintenance"
            >
              <strong>
                设备维护
              </strong>

              <span>
                查看耐久、故障风险与维修任务
              </span>
            </button>

          </div>

        </section>

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
