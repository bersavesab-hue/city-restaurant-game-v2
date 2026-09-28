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

function renderInventory(
  inventory
) {
  if (
    inventory.length ===
      0
  ) {
    return `
      <div class="playtest-empty">
        暂无库存
      </div>
    `;
  }

  return inventory
    .slice(
      0,
      6
    )
    .map(
      item => `
        <div
          class="playtest-stock-row"
          data-stock-id="${escapeHtml(
            item.ingredientId
          )}"
        >
          <span>
            ${escapeHtml(
              item.name
            )}
          </span>

          <strong>
            ${quantity(
              item.usableQuantity
            )}
          </strong>
        </div>
      `
    )
    .join(
      ""
    );
}

function renderMenu(
  menu
) {
  if (
    menu.length ===
      0
  ) {
    return "暂无营业菜品";
  }

  return menu
    .slice(
      0,
      3
    )
    .map(
      item =>
        `${escapeHtml(
          item.dishName
        )} ¥${money(
          item.price
        )}`
    )
    .join(
      " · "
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

function renderHomePage(
  viewModel
) {
  const vm =
    viewModel;

  const settlement =
    vm.latestSettlement;

  const procurement =
    vm.procurement;

  const progressPercent =
    Math.round(
      (
        vm.progress
          .progress ??
        0
      ) *
      100
    );

  return `
    <section
      class="home-editor-canvas"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="background-master-v1"
      data-playable-bridge-version="playable-bridge-v1"
      data-coordinate-space="logical"
      aria-label="餐饮经营可玩测试主页"
    >
      <div
        class="home-background-layer"
        data-ui-component="home-background-layer"
        data-layout-key="home-background-layer"
        data-background-slot="home"
        aria-hidden="true"
      ></div>

      <main
        class="playtest-dashboard"
        data-ui-component="playtest-dashboard"
      >
        <header class="playtest-top-card">
          <div>
            <small>当前门店</small>
            <h1>
              ${escapeHtml(
                vm.restaurant
                  .name
              )}
            </h1>
            <p>
              ${restaurantStatus(
                vm.restaurant
                  .status
              )}
              ·
              第${vm.time.day}天
              ${vm.time.clock}
            </p>
          </div>

          <div class="playtest-money">
            <small>可用资金</small>
            <strong>
              ¥${money(
                vm.finance
                  .balance
              )}
            </strong>
          </div>
        </header>

        <section
          class="playtest-kpi-grid"
          aria-label="经营数据"
        >
          <article>
            <span>今日营业额</span>
            <strong>
              ¥${money(
                vm.today
                  .revenue
              )}
            </strong>
          </article>

          <article>
            <span>今日订单</span>
            <strong>
              ${vm.today.orders}
            </strong>
          </article>

          <article>
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
          </article>

          <article>
            <span>门店等级</span>
            <strong>
              Lv.${vm.progress.level}
            </strong>
          </article>
        </section>

        <section class="playtest-card playtest-controls">
          <div class="playtest-section-head">
            <div>
              <small>真实时间系统</small>
              <strong>
                ${vm.runtime.paused
                  ? "已暂停"
                  : `${vm.runtime.speed}× 运行中`}
              </strong>
            </div>

            <button
              type="button"
              data-game-action="toggle-time"
            >
              ${vm.runtime.paused
                ? "继续时间"
                : "暂停时间"}
            </button>
          </div>

          <div class="playtest-speed-row">
            ${[
              1,
              2,
              4
            ].map(
              speed => `
                <button
                  type="button"
                  class="${vm.runtime.speed === speed
                    ? "is-active"
                    : ""}"
                  data-game-action="speed"
                  data-game-value="${speed}"
                >
                  ${speed}×
                </button>
              `
            ).join(
              ""
            )}

            <button
              type="button"
              data-game-action="toggle-restaurant"
            >
              ${vm.restaurant.status ===
                "open"
                  ? "暂停营业"
                  : "开始营业"}
            </button>
          </div>
        </section>

        <section class="playtest-card">
          <div class="playtest-section-head">
            <div>
              <small>采购与库存</small>
              <strong>
                ${vm.pendingDeliveries}
                笔配送中
              </strong>
            </div>

            <button
              type="button"
              data-game-action="purchase"
              ${procurement
                ? ""
                : "disabled"}
            >
              采购推荐原料
            </button>
          </div>

          <p class="playtest-hint">
            ${procurement
              ? `推荐：${escapeHtml(
                  procurement
                    .ingredientName
                )} × ${quantity(
                  procurement
                    .quantity
                )}，当前库存 ${quantity(
                  procurement
                    .currentQuantity
                )}`
              : "当前没有可采购的推荐原料"}
          </p>

          <div class="playtest-stock-list">
            ${renderInventory(
              vm.inventory
            )}
          </div>
        </section>

        <section class="playtest-card">
          <div class="playtest-section-head">
            <div>
              <small>营业菜单</small>
              <strong>
                ${vm.menu.length}
                道
              </strong>
            </div>

            <span>
              员工
              ${vm.employees.length}
              人
            </span>
          </div>

          <p class="playtest-hint">
            ${renderMenu(
              vm.menu
            )}
          </p>

          <div class="playtest-progress">
            <div>
              <span>
                ${escapeHtml(
                  vm.progress
                    .title
                )}
              </span>

              <span>
                ${progressPercent}%
              </span>
            </div>

            <div class="playtest-progress-track">
              <i
                style="width:${Math.max(
                  0,
                  Math.min(
                    100,
                    progressPercent
                  )
                )}%"
              ></i>
            </div>
          </div>
        </section>

        <section class="playtest-card playtest-settlement">
          <div class="playtest-section-head">
            <div>
              <small>最近日结</small>
              <strong>
                ${settlement
                  ? `第${settlement.day}天`
                  : "尚未日结"}
              </strong>
            </div>

            <span>
              ${settlement
                ? `利润 ¥${money(
                    settlement
                      .operatingProfit
                  )}`
                : "继续经营后生成"}
            </span>
          </div>

          <div class="playtest-action-row">
            <button
              type="button"
              data-game-action="advance-hour"
            >
              测试快进 1 小时
            </button>

            <button
              type="button"
              data-game-action="save"
            >
              立即保存
            </button>
          </div>
        </section>

        <output
          class="playtest-feedback"
          data-game-feedback
        >
          ${escapeHtml(
            vm.lastMessage
          )}
        </output>
      </main>
    </section>
  `;
}

export {
  renderHomePage
};
