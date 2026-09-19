import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  renderUiIcon
} from "../../components/UiIconView.js";

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
    );
}


function employeeStatusName(
  status
) {
  return {
    active:
      "工作中",
    resting:
      "休息中",
    off_duty:
      "未排班"
  }[status] ??
    "待命";
}


function marketAlertName(
  alert
) {
  return {
    critical_share:
      "份额偏低",
    losing_share:
      "份额下滑",
    dominant:
      "优势明显",
    gaining_share:
      "份额上升",
    stable:
      "整体稳定"
  }[alert] ??
    "数据更新中";
}


function renderTopDishes(
  page
) {
  const dishes =
    page.topDishPreview ??
    [];

  const body =
    dishes.length
      ? dishes
          .map(
            (dish, index) =>
              '<article class="command-center__dish-card">' +
                '<div class="command-center__dish-image" data-image-slot="command-dish-' +
                  escapeHtml(
                    dish.dishId ??
                    dish.id
                  ) +
                  '" data-image-src="' +
                  escapeHtml(
                    dish.image ??
                    ""
                  ) +
                  '"' +
                  (
                    dish.custom
                      ? ' data-custom-dish-id="' +
                        escapeHtml(
                          dish.dishId
                        ) +
                        '"'
                      : ""
                  ) +
                  ' data-image-fit="cover">' +
                  '<span>TOP' +
                    (index + 1) +
                  '</span>' +
                '</div>' +
                '<div>' +
                  '<strong>' +
                    escapeHtml(
                      dish.name
                    ) +
                  '</strong>' +
                  '<small>' +
                    escapeHtml(
                      dish.classification
                    ) +
                  '</small>' +
                  '<p>销量 <b>' +
                    Number(
                      dish.sold ??
                      0
                    ) +
                  '</b> · 品质 <b>' +
                    (
                      dish.quality ||
                      "-"
                    ) +
                  '</b></p>' +
                '</div>' +
              '</article>'
          )
          .join("")
      : '<div class="command-center__empty">营业产生订单后，这里会自动展示热销菜品。</div>';

  return (
    '<section class="command-center__visual-panel command-center__top-dishes">' +
      '<header class="command-center__section-title">' +
        '<div><span>顾客实际选择</span><h2>热销菜品</h2></div>' +
        '<button type="button" data-page-target="dishes">更多菜品 ›</button>' +
      '</header>' +
      '<div class="command-center__dish-grid">' +
        body +
      '</div>' +
    '</section>'
  );
}


function renderStaffPreview(
  page
) {
  const summary =
    page.staffPreview ??
    {
      available: 0,
      total: 0,
      averageFatigue: 0,
      highFatigue: 0,
      preview: []
    };

  const people =
    summary.preview ??
    [];

  const body =
    people.length
      ? people
          .map(
            employee =>
              '<article>' +
                '<div class="command-center__staff-avatar" data-image-slot="command-employee-' +
                  escapeHtml(
                    employee.avatarId ??
                    employee.id
                  ) +
                  '" data-image-src="' +
                  escapeHtml(
                    employee.avatarPath ??
                    ""
                  ) +
                  '" data-image-fallback="' +
                  escapeHtml(
                    employee.avatarFallbackPath ??
                    ""
                  ) +
                  '" data-image-fit="cover">' +
                  escapeHtml(
                    employee.name
                      ?.slice(
                        0,
                        1
                      ) ??
                    "员"
                  ) +
                '</div>' +
                '<strong>' +
                  escapeHtml(
                    employee.name
                  ) +
                '</strong>' +
                '<span>' +
                  escapeHtml(
                    employee.roleName
                  ) +
                  ' · Lv.' +
                  Number(
                    employee.level ??
                    1
                  ) +
                '</span>' +
                '<small>' +
                  employeeStatusName(
                    employee.status
                  ) +
                  ' · 疲劳 ' +
                  Number(
                    employee.fatigue ??
                    0
                  ) +
                  '%' +
                '</small>' +
              '</article>'
          )
          .join("")
      : '<div class="command-center__empty">当前门店还没有可展示员工。</div>';

  return (
    '<section class="command-center__visual-panel command-center__staff">' +
      '<header class="command-center__section-title">' +
        '<div><span>实时员工状态</span><h2>员工状态</h2></div>' +
        '<button type="button" data-page-target="employee_roster">查看全部 ›</button>' +
      '</header>' +
      '<div class="command-center__staff-summary">' +
        '<article><span>可用员工</span><strong>' +
          Number(
            summary.available ??
            0
          ) +
          ' / ' +
          Number(
            summary.total ??
            0
          ) +
        '</strong></article>' +
        '<article><span>平均疲劳</span><strong>' +
          Number(
            summary.averageFatigue ??
            0
          ) +
        '%</strong></article>' +
        '<article><span>高疲劳</span><strong>' +
          Number(
            summary.highFatigue ??
            0
          ) +
        '人</strong></article>' +
      '</div>' +
      '<div class="command-center__staff-grid">' +
        body +
      '</div>' +
    '</section>'
  );
}


function renderInventoryPreview(
  page
) {
  const items =
    page.inventoryPreview ??
    [];

  const body =
    items.length
      ? items
          .map(
            item =>
              '<article data-stock-state="' +
                escapeHtml(
                  item.state
                ) +
              '">' +
                '<div class="command-center__ingredient-image" data-image-slot="command-ingredient-' +
                  escapeHtml(
                    item.ingredientId
                  ) +
                  '" data-ingredient-id="' +
                  escapeHtml(
                    item.ingredientId
                  ) +
                  '">食材</div>' +
                '<strong>' +
                  escapeHtml(
                    item.name
                  ) +
                '</strong>' +
                '<span>' +
                  escapeHtml(
                    item.stateLabel
                  ) +
                '</span>' +
                '<div class="command-center__stock-track"><i style="width:' +
                  Number(
                    item.levelPercent ??
                    0
                  ) +
                '%"></i></div>' +
                '<small>可用 ' +
                  Number(
                    item.usableQuantity ??
                    0
                  ).toLocaleString(
                    "zh-CN"
                  ) +
                  ' ' +
                  escapeHtml(
                    item.unit
                  ) +
                '</small>' +
                '<button type="button" data-page-target="supply">去采购</button>' +
              '</article>'
          )
          .join("")
      : '<div class="command-center__empty">当前还没有库存批次，采购后这里会显示库存风险。</div>';

  return (
    '<section class="command-center__visual-panel command-center__inventory-preview">' +
      '<header class="command-center__section-title">' +
        '<div><span>及时补货 · 减少断货</span><h2>库存与采购预警</h2></div>' +
        '<button type="button" data-page-target="supply">查看库存 ›</button>' +
      '</header>' +
      '<div class="command-center__inventory-grid">' +
        body +
      '</div>' +
    '</section>'
  );
}


function renderMarketPreview(
  page
) {
  const market =
    page.marketPreview ??
    {};

  const share =
    Number.isFinite(
      market.marketShare
    )
      ? market.marketShare + "%"
      : "--";

  const change =
    Number(
      market.marketShareChange ??
      0
    );

  return (
    '<section class="command-center__visual-panel command-center__market-preview">' +
      '<header class="command-center__section-title">' +
        '<div><span>商圈竞争与顾客反馈</span><h2>市场与口碑</h2></div>' +
        '<button type="button" data-page-target="market-strategy">商圈分析 ›</button>' +
      '</header>' +
      '<div class="command-center__market-grid">' +
        '<article><span>市场份额</span><strong>' +
          share +
        '</strong><small>' +
          (
            change >= 0
              ? "+"
              : ""
          ) +
          change +
        '%</small></article>' +
        '<article><span>周边竞店</span><strong>' +
          Number(
            market.competitorCount ??
            0
          ) +
        '家</strong><small>' +
          marketAlertName(
            market.competitionAlert
          ) +
        '</small></article>' +
        '<article><span>顾客复购率</span><strong>' +
          Number(
            market.repeatRate ??
            0
          ) +
        '%</strong><small>长期顾客表现</small></article>' +
        '<article><span>口碑评分</span><strong>' +
          Number(
            market.reviewScore ??
            0
          ).toFixed(
            1
          ) +
        '</strong><small>声望 ' +
          Number(
            market.reputation ??
            0
          ) +
        '</small></article>' +
      '</div>' +
    '</section>'
  );
}


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

function renderStorePortfolio(portfolio) {
  if (!portfolio) return "";
  const groupMode = portfolio.scope?.type === "group" && portfolio.canSwitch;
  return `
    <section class="command-center__portfolio ${groupMode ? "is-group" : "is-store"}">
      <header>
        <div><span>${groupMode ? "集团经营范围" : "当前管理门店"}</span><h2>${groupMode ? `${portfolio.storeCount} 家门店` : "门店实时状态"}</h2></div>
        <strong>${portfolio.totals.issueCount > 0 ? `${portfolio.totals.issueCount} 项待处理` : "全部正常"}</strong>
      </header>
      ${groupMode ? `<div class="command-center__portfolio-totals">
        <article><span>集团营业额</span><strong>${money(portfolio.totals.revenue)}</strong></article>
        <article><span>集团利润</span><strong>${money(portfolio.totals.profit)}</strong></article>
        <article><span>总订单</span><strong>${portfolio.totals.orders}</strong></article>
        <article><span>集团现金</span><strong>${money(portfolio.totals.balance)}</strong></article>
      </div>` : ""}
      <div class="command-center__store-strip" aria-label="门店列表">
        ${portfolio.cards.map(store => `<button type="button" class="command-center__store-card ${store.active ? "is-active" : ""}" data-page-target="operating-command-center" data-restaurant-id="${escapeHtml(store.id)}">
          <span class="command-center__store-status" data-status="${escapeHtml(store.status)}">${escapeHtml(store.statusLabel)}</span>
          <strong>${escapeHtml(store.name)}</strong><small>Lv.${store.level} · 评分 ${Number(store.reviewScore).toFixed(1)}</small>
          <b>${money(store.revenue)}</b><i>${store.orders} 单 · ${store.issueCount} 项提醒</i>
        </button>`).join("")}
      </div>
    </section>`;
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


    const topBarHtml =
      page.topBar
        ? renderGameTopBar(
            page.topBar,
            {
              subtitle:
                "门店经营总览",

              showSpeedControls:
                true
            }
          )
        : "";


    const noticeHtml =
      page.noticeTicker
        ? renderNoticeTicker(
            page.noticeTicker
          )
        : "";


    const isGroupScope = page.storePortfolio?.scope?.type === "group" && page.storePortfolio?.canSwitch;
    const pageTitleHtml =
      renderPageTitle({
        title:
          isGroupScope ? "集团门店总览" : "门店总览",

        subtitle:
          isGroupScope ? "查看全部门店表现 · 快速定位异常门店" : "掌握当前门店现场 · 实时数据驱动决策",

        helpLabel:
          "经营攻略",

        helpTarget:
          "analytics"
      });


    const bottomNavHtml =
      renderBottomNavigation(
        page.navigation ??
        []
      );


    return `
      <main class="rg-screen command-center-screen">

        ${topBarHtml}
        ${noticeHtml}
        ${pageTitleHtml}

        <section class="command-center">

        ${renderStorePortfolio(page.storePortfolio)}

        <header class="command-center__header">
          <div
            class="command-center__hero-image"
            role="img"
            data-image-slot="command-center-hero"
            data-image-src="assets/images/scenes/restaurants/command-center-hero.webp"
            data-image-fit="cover"
            aria-label="门店经营场景"
          ></div>

          <div class="command-center__identity">
            <span>第${page.day}天 · 今日经营</span>

            <h1>
              ${escapeHtml(page.restaurant.name)}
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

        <section class="command-center__insight-grid">
          ${renderTopDishes(page)}
          ${renderStaffPreview(page)}
          ${renderInventoryPreview(page)}
          ${renderMarketPreview(page)}
        </section>


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
            今日待办 · 今天最该处理
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


        <section class="command-center__quick">

          <header class="command-center__section-title">
            <div>
              <span>快捷入口</span>
              <h2>高效管理门店</h2>
            </div>
          </header>

          <div class="command-center__quick-grid">

            <button type="button" data-page-target="dishes">
              ${renderUiIcon("dishes","command-center__quick-icon")}
              <strong>菜品中心</strong>
              <span>研发 · 定价</span>
            </button>

            <button type="button" data-page-target="supply">
              ${renderUiIcon("supply","command-center__quick-icon")}
              <strong>供应链</strong>
              <span>采购 · 库存</span>
            </button>

            <button type="button" data-page-target="analytics">
              ${renderUiIcon("analytics","command-center__quick-icon")}
              <strong>经营数据</strong>
              <span>报表 · 分析</span>
            </button>

            <button type="button" data-page-target="employee_roster">
              ${renderUiIcon("employees","command-center__quick-icon")}
              <strong>员工管理</strong>
              <span>排班 · 培养</span>
            </button>

            <button type="button" data-page-target="renovation">
              ${renderUiIcon("renovation","command-center__quick-icon")}
              <strong>装修布局</strong>
              <span>布局 · 升级</span>
            </button>

            <button type="button" data-page-target="ranking-center">
              ${renderUiIcon("ranking","command-center__quick-icon")}
              <strong>排行榜</strong>
              <span>排名 · 荣誉</span>
            </button>

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

        </section>

        ${bottomNavHtml}

      </main>
    `;
  }
}


export const operatingCommandCenterView =
  new OperatingCommandCenterView();

export {
  OperatingCommandCenterView
};
