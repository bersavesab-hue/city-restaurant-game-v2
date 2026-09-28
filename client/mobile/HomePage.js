const PRIMARY_NAV =
  Object.freeze([
    {
      id: "store",
      label: "门店",
      icon: "⌂"
    },
    {
      id: "business",
      label: "经营",
      icon: "▥"
    },
    {
      id: "research",
      label: "研发",
      icon: "♨"
    },
    {
      id: "staff",
      label: "员工",
      icon: "◉"
    },
    {
      id: "more",
      label: "更多",
      icon: "•••"
    }
  ]);

const ROLE_NAMES =
  Object.freeze({
    chef: "厨师",
    server: "服务员",
    cashier: "收银员",
    cleaner: "清洁"
  });

function escapeHtml(
  value
) {
  return String(
    value ?? ""
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

function money(value) {
  return Math.round(
    Number(value) || 0
  ).toLocaleString(
    "zh-CN"
  );
}

function quantity(value) {
  const number =
    Number(value) || 0;

  return Number.isInteger(
    number
  )
    ? String(number)
    : number.toFixed(2);
}

function percent(value) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number(value) || 0
      )
    )
  );
}

function restaurantStatus(
  status
) {
  switch (status) {
    case "open":
      return "营业中";
    case "paused":
      return "暂停营业";
    default:
      return "未营业";
  }
}

function districtMainCustomer(
  district
) {
  const mix =
    district?.customerMix;

  if (
    !mix ||
    typeof mix !==
      "object"
  ) {
    return "待观察";
  }

  const winner =
    Object.entries(
      mix
    )
      .sort(
        (
          a,
          b
        ) =>
          Number(
            b[1]
          ) -
          Number(
            a[1]
          )
      )[0]?.[0];

  const names = {
    office_worker:
      "上班族",
    resident:
      "居民",
    student:
      "学生",
    tourist:
      "游客",
    family:
      "家庭客"
  };

  return (
    names[winner] ??
    winner ??
    "待观察"
  );
}

function renderTopChrome(
  vm
) {
  const progress =
    percent(
      (
        vm.progress
          ?.progress ??
        0
      ) *
      100
    );

  return `
    <header
      class="home-top-chrome"
      data-ui-component="home-top-chrome"
      data-layout-key="home-top-chrome"
      aria-label="主页顶部状态栏"
    >
      <div class="home-status-strip">
        <div
          class="home-status-cell home-status-date"
          data-ui-component="home-status-date"
        >
          <span>经营日</span>
          <strong>
            第${vm.time.day}天
          </strong>
          <small>
            ${restaurantStatus(
              vm.restaurant
                .status
            )}
          </small>
        </div>

        <div
          class="home-status-cell home-status-time"
          data-ui-component="home-status-time"
        >
          <span>时间</span>
          <strong>
            ${escapeHtml(
              vm.time.clock
            )}
          </strong>
          <small>
            ${vm.runtime.paused
              ? "已暂停"
              : `${vm.runtime.speed}×`}
          </small>
        </div>

        <div
          class="home-status-cell home-status-money"
          data-ui-component="home-status-money"
        >
          <span>资金</span>
          <strong>
            ¥${money(
              vm.finance
                .balance
            )}
          </strong>
          <small>
            可用资金
          </small>
        </div>

        <div
          class="home-status-cell home-status-rating"
          data-ui-component="home-status-rating"
        >
          <span>星级</span>
          <strong>
            ★ ${Number(
              vm.restaurant
                .reviewScore ??
              0
            ).toFixed(
              1
            )}
          </strong>
          <small>
            ${vm.restaurant
              .totalReviews ??
              0}
            条评价
          </small>
        </div>

        <div
          class="home-status-cell home-status-level"
          data-ui-component="home-status-level"
        >
          <span>门店成长</span>
          <strong>
            Lv.${vm.progress.level}
          </strong>
          <small>
            ${escapeHtml(
              vm.progress.title
            )}
          </small>
          <i>
            <b
              style="width:${progress}%"
            ></b>
          </i>
        </div>

        <button
          class="home-settings-button"
          type="button"
          data-nav="more"
          aria-label="更多设置"
        >
          ⚙
        </button>
      </div>
    </header>
  `;
}

function renderBottomNav(
  activePage
) {
  return `
    <nav
      class="home-bottom-chrome"
      data-ui-component="home-bottom-chrome"
      aria-label="主页一级导航"
    >
      <div class="home-bottom-nav">
        ${PRIMARY_NAV
          .map(
            item => `
              <button
                type="button"
                class="home-nav-item ${activePage ===
                  item.id
                    ? "is-active"
                    : ""}"
                data-nav="${item.id}"
                aria-current="${activePage ===
                  item.id
                    ? "page"
                    : "false"}"
              >
                <span>
                  ${item.icon}
                </span>
                <strong>
                  ${item.label}
                </strong>
              </button>
            `
          )
          .join(
            ""
          )}
      </div>
    </nav>
  `;
}

function renderStorePage(
  vm
) {
  const growth =
    percent(
      (
        vm.progress
          ?.progress ??
        0
      ) *
      100
    );

  const district =
    vm.district;

  return `
    <section
      class="primary-page primary-page-store"
      data-primary-page="store"
    >
      <section class="store-hero-card">
        <div>
          <small>
            当前门店
          </small>
          <h1>
            ${escapeHtml(
              vm.restaurant.name
            )}
          </h1>
          <p>
            ${escapeHtml(
              vm.property?.name ??
              "当前经营铺位"
            )}
            ·
            ${restaurantStatus(
              vm.restaurant
                .status
            )}
          </p>
        </div>

        <div class="store-hero-revenue">
          <span>
            今日营业额
          </span>
          <strong>
            ¥${money(
              vm.today.revenue
            )}
          </strong>
          <small>
            ${vm.today.orders}
            笔订单
          </small>
        </div>
      </section>

      <section
        class="home-kpi-grid"
        aria-label="今日经营概览"
      >
        <article>
          <span>满意度</span>
          <strong>
            ${percent(
              vm.restaurant
                .customerSatisfaction
            )}%
          </strong>
          <small>顾客反馈</small>
        </article>

        <article>
          <span>员工</span>
          <strong>
            ${vm.employees.length}
            人
          </strong>
          <small>当前在册</small>
        </article>

        <article>
          <span>菜品</span>
          <strong>
            ${vm.menu.length}
            道
          </strong>
          <small>营业菜单</small>
        </article>

        <article>
          <span>配送</span>
          <strong>
            ${vm.pendingDeliveries}
            笔
          </strong>
          <small>采购在途</small>
        </article>
      </section>

      <section class="home-overview-grid">
        <article class="formal-card district-card">
          <div class="formal-card-head">
            <div>
              <small>商圈信息</small>
              <strong>
                ${escapeHtml(
                  district?.name ??
                  "当前商圈"
                )}
              </strong>
            </div>
            <span>
              热度
              ${Math.round(
                Number(
                  district
                    ?.trafficIndex ??
                  0
                )
              )}
            </span>
          </div>

          <div class="district-metrics">
            <div>
              <span>主力客群</span>
              <strong>
                ${escapeHtml(
                  districtMainCustomer(
                    district
                  )
                )}
              </strong>
            </div>
            <div>
              <span>消费力</span>
              <strong>
                ${Math.round(
                  Number(
                    district
                      ?.spendingPower ??
                    0
                  )
                )}
              </strong>
            </div>
            <div>
              <span>竞争</span>
              <strong>
                ${Math.round(
                  Number(
                    district
                      ?.competition ??
                    0
                  )
                )}
              </strong>
            </div>
          </div>
        </article>

        <article class="formal-card growth-card">
          <div class="formal-card-head">
            <div>
              <small>门店成长</small>
              <strong>
                ${escapeHtml(
                  vm.progress.title
                )}
              </strong>
            </div>
            <span>
              ${growth}%
            </span>
          </div>

          <div class="formal-progress">
            <i
              style="width:${growth}%"
            ></i>
          </div>

          <p>
            ${vm.progress.maxLevel
              ? "已达到当前最高等级"
              : `距离 ${escapeHtml(
                  vm.progress
                    .nextTitle
                )} 还需 ${vm.progress
                  .remainingExperience} 经验`}
          </p>
        </article>
      </section>

      <section
        class="home-quick-grid"
        aria-label="门店快捷入口"
      >
        <button
          type="button"
          data-nav="staff"
        >
          <span>◉</span>
          <strong>员工</strong>
          <small>排班与培养</small>
        </button>

        <button
          type="button"
          data-nav="research"
        >
          <span>♨</span>
          <strong>菜品</strong>
          <small>菜单与研发</small>
        </button>

        <button
          type="button"
          data-nav="business"
        >
          <span>◎</span>
          <strong>活动</strong>
          <small>经营与营销</small>
        </button>

        <button
          type="button"
          data-nav="business"
        >
          <span>▦</span>
          <strong>仓储</strong>
          <small>库存与采购</small>
        </button>
      </section>

      <output
        class="home-status-feedback"
        data-game-feedback
      >
        ${escapeHtml(
          vm.lastMessage
        )}
      </output>
    </section>
  `;
}

function renderBusinessPage(
  vm
) {
  const procurement =
    vm.procurement;

  return `
    <section
      class="primary-page"
      data-primary-page="business"
    >
      <header class="primary-page-title">
        <div>
          <small>经营中心</small>
          <h1>采购与库存</h1>
        </div>
        <strong>
          ¥${money(
            vm.finance.balance
          )}
        </strong>
      </header>

      <section class="formal-card business-procurement-card">
        <div class="formal-card-head">
          <div>
            <small>推荐采购</small>
            <strong>
              ${procurement
                ? escapeHtml(
                    procurement
                      .ingredientName
                  )
                : "暂无采购建议"}
            </strong>
          </div>
          <span>
            ${vm.pendingDeliveries}
            笔在途
          </span>
        </div>

        <p>
          ${procurement
            ? `当前库存 ${quantity(
                procurement
                  .currentQuantity
              )}，建议采购 ${quantity(
                procurement
                  .quantity
              )}`
            : "当前菜单所需原料暂不需要补货"}
        </p>

        <button
          class="formal-primary-button"
          type="button"
          data-game-action="purchase"
          ${procurement
            ? ""
            : "disabled"}
        >
          采购推荐原料
        </button>
      </section>

      <section class="formal-card formal-list-card">
        <div class="formal-card-head">
          <div>
            <small>实时库存</small>
            <strong>
              ${vm.inventory.length}
              类原料
            </strong>
          </div>
        </div>

        <div class="formal-scroll-list">
          ${vm.inventory.length
            ? vm.inventory
              .map(
                item => `
                  <div class="formal-list-row">
                    <div>
                      <strong>
                        ${escapeHtml(
                          item.name
                        )}
                      </strong>
                      <small>
                        ${item.batches}
                        个批次
                      </small>
                    </div>
                    <span>
                      ${quantity(
                        item.usableQuantity
                      )}
                    </span>
                  </div>
                `
              )
              .join(
                ""
              )
            : `
              <div class="formal-empty">
                当前没有库存
              </div>
            `}
        </div>
      </section>
    </section>
  `;
}

function renderResearchPage(
  vm
) {
  const bestDish =
    vm.research
      ?.bestDish;

  return `
    <section
      class="primary-page"
      data-primary-page="research"
    >
      <header class="primary-page-title">
        <div>
          <small>菜品中心</small>
          <h1>菜单与研发</h1>
        </div>
        <strong>
          ${vm.menu.length}
          道在售
        </strong>
      </header>

      <section class="formal-card research-summary-card">
        <div>
          <small>已研究菜品</small>
          <strong>
            ${vm.research
              ?.total ??
              0}
          </strong>
        </div>
        <div>
          <small>当前招牌</small>
          <strong>
            ${escapeHtml(
              bestDish?.name ??
              "尚未形成"
            )}
          </strong>
        </div>
      </section>

      <section class="formal-card formal-list-card">
        <div class="formal-card-head">
          <div>
            <small>营业菜单</small>
            <strong>
              实时售价与销量
            </strong>
          </div>
        </div>

        <div class="formal-scroll-list">
          ${vm.menu.length
            ? vm.menu
              .map(
                item => `
                  <div class="formal-list-row">
                    <div>
                      <strong>
                        ${escapeHtml(
                          item.dishName
                        )}
                      </strong>
                      <small>
                        已售
                        ${item.soldCount ??
                          0}
                        份
                      </small>
                    </div>
                    <span>
                      ¥${money(
                        item.price
                      )}
                    </span>
                  </div>
                `
              )
              .join(
                ""
              )
            : `
              <div class="formal-empty">
                当前没有营业菜品
              </div>
            `}
        </div>
      </section>

      <p class="primary-page-note">
        菜品研发操作在 T09 接入；本页目前只展示真实菜品与研发状态。
      </p>
    </section>
  `;
}

function renderStaffPage(
  vm
) {
  return `
    <section
      class="primary-page"
      data-primary-page="staff"
    >
      <header class="primary-page-title">
        <div>
          <small>员工中心</small>
          <h1>门店团队</h1>
        </div>
        <strong>
          ${vm.employees.length}
          人
        </strong>
      </header>

      <section class="formal-card formal-list-card staff-list-card">
        <div class="formal-scroll-list">
          ${vm.employees
            .map(
              employee => `
                <div class="staff-row">
                  <div class="staff-avatar">
                    ${escapeHtml(
                      employee.name
                        ?.slice(
                          0,
                          1
                        ) ??
                      "员"
                    )}
                  </div>

                  <div class="staff-copy">
                    <strong>
                      ${escapeHtml(
                        employee.name
                      )}
                    </strong>
                    <small>
                      ${escapeHtml(
                        ROLE_NAMES[
                          employee.roleId
                        ] ??
                        employee.roleId
                      )}
                      · Lv.${employee.level}
                    </small>
                  </div>

                  <div class="staff-state">
                    <strong>
                      ${employee.status ===
                        "active"
                          ? "在岗"
                          : escapeHtml(
                              employee
                                .status
                            )}
                    </strong>
                    <small>
                      心情
                      ${Math.round(
                        employee.mood ??
                        0
                      )}
                    </small>
                  </div>
                </div>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <p class="primary-page-note">
        招聘、培训、薪资和排班在 T09 继续接入；现有员工数据均来自真实员工系统。
      </p>
    </section>
  `;
}

function renderMorePage(
  vm
) {
  return `
    <section
      class="primary-page"
      data-primary-page="more"
    >
      <header class="primary-page-title">
        <div>
          <small>更多</small>
          <h1>时间与存档</h1>
        </div>
        <strong>
          第${vm.time.day}天
        </strong>
      </header>

      <section class="formal-card time-control-card">
        <div class="formal-card-head">
          <div>
            <small>游戏时间</small>
            <strong>
              ${escapeHtml(
                vm.time.clock
              )}
              ·
              ${vm.runtime.paused
                ? "已暂停"
                : `${vm.runtime.speed}×`}
            </strong>
          </div>

          <button
            type="button"
            data-game-action="toggle-time"
          >
            ${vm.runtime.paused
              ? "继续"
              : "暂停"}
          </button>
        </div>

        <div class="formal-speed-grid">
          ${[
            1,
            2,
            4
          ]
            .map(
              speed => `
                <button
                  type="button"
                  class="${vm.runtime.speed ===
                    speed
                      ? "is-active"
                      : ""}"
                  data-game-action="speed"
                  data-game-value="${speed}"
                >
                  ${speed}×
                </button>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card more-action-list">
        <button
          type="button"
          data-game-action="toggle-restaurant"
        >
          <span>门店营业状态</span>
          <strong>
            ${restaurantStatus(
              vm.restaurant.status
            )}
          </strong>
        </button>

        <button
          type="button"
          data-game-action="save"
        >
          <span>存档</span>
          <strong>
            立即保存
          </strong>
        </button>
      </section>

      <output
        class="home-status-feedback"
        data-game-feedback
      >
        ${escapeHtml(
          vm.lastMessage
        )}
      </output>
    </section>
  `;
}

function renderPrimaryContent(
  activePage,
  vm
) {
  switch (
    activePage
  ) {
    case "business":
      return renderBusinessPage(
        vm
      );

    case "research":
      return renderResearchPage(
        vm
      );

    case "staff":
      return renderStaffPage(
        vm
      );

    case "more":
      return renderMorePage(
        vm
      );

    default:
      return renderStorePage(
        vm
      );
  }
}

function renderHomePage(
  vm,
  activePage =
    "store"
) {
  const page =
    PRIMARY_NAV.some(
      item =>
        item.id ===
        activePage
    )
      ? activePage
      : "store";

  return `
    <section
      class="home-editor-canvas"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="background-master-v1"
      data-home-shell-version="formal-primary-v1"
      data-coordinate-space="logical"
      data-active-primary-page="${page}"
      aria-label="餐饮经营正式主页框架"
    >
      <div
        class="home-background-layer"
        data-ui-component="home-background-layer"
        data-layout-key="home-background-layer"
        data-background-slot="home"
        aria-hidden="true"
      ></div>

      ${renderTopChrome(
        vm
      )}

      <main
        class="home-primary-content"
        data-ui-component="home-primary-content"
      >
        ${renderPrimaryContent(
          page,
          vm
        )}
      </main>

      ${renderBottomNav(
        page
      )}
    </section>
  `;
}

export {
  PRIMARY_NAV,
  renderHomePage
};
