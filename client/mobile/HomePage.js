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
      data-asset-slot="home.topChrome"
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
      data-asset-slot="home.bottomNav"
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
          data-asset-slot="home.quick.staff"
        >
          <span>◉</span>
          <strong>员工</strong>
          <small>排班与培养</small>
        </button>

        <button
          type="button"
          data-nav="research"
          data-asset-slot="home.quick.dish"
        >
          <span>♨</span>
          <strong>菜品</strong>
          <small>菜单与研发</small>
        </button>

        <button
          type="button"
          data-nav="business"
          data-asset-slot="home.quick.activity"
        >
          <span>◎</span>
          <strong>活动</strong>
          <small>经营与营销</small>
        </button>

        <button
          type="button"
          data-nav="business"
          data-asset-slot="home.quick.storage"
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

function unitLabel(
  unit
) {
  return (
    {
      g: "克",
      kg: "千克",
      ml: "毫升",
      l: "升",
      piece: "个",
      portion: "份"
    }[unit] ??
    unit ??
    ""
  );
}

function qualityLabel(
  quality
) {
  return (
    {
      1: "普通",
      2: "合格",
      3: "优良",
      4: "精品",
      5: "顶级"
    }[quality] ??
    `${quality ?? "-"}级`
  );
}

function freshnessLabel(
  state
) {
  return (
    {
      fresh: "新鲜",
      normal: "正常",
      aging: "临期",
      spoiled: "腐坏"
    }[state] ??
    state ??
    "-"
  );
}

function orderStatusLabel(
  status
) {
  return (
    {
      pending: "配送中",
      delivered: "已到货",
      cancelled: "已取消"
    }[status] ??
    status
  );
}

function minuteLabel(
  minutes
) {
  const value =
    Math.max(
      0,
      Math.round(
        Number(minutes) ||
        0
      )
    );

  if (
    value <
    60
  ) {
    return `${value}分钟`;
  }

  const hours =
    Math.floor(
      value /
      60
    );

  const rest =
    value %
    60;

  return rest
    ? `${hours}小时${rest}分`
    : `${hours}小时`;
}

function renderBusinessTabs(
  business
) {
  return `
    <div
      class="business-tab-bar"
      role="tablist"
      aria-label="经营模块"
    >
      ${[
        [
          "procurement",
          "采购"
        ],
        [
          "inventory",
          "库存"
        ],
        [
          "orders",
          "采购单"
        ]
      ]
        .map(
          (
            [
              id,
              label
            ]
          ) => `
            <button
              type="button"
              class="${business.tab ===
                id
                  ? "is-active"
                  : ""}"
              data-game-action="business-tab"
              data-game-value="${id}"
            >
              ${label}
            </button>
          `
        )
        .join(
          ""
        )}
    </div>
  `;
}

function renderProcurementPanel(
  vm
) {
  const business =
    vm.business;

  const selectedIngredient =
    business
      .selectedIngredient;

  const selectedSupplier =
    business
      .selectedSupplier;

  const quote =
    business.quote;

  const quantityValue =
    Number(
      business.quantity
    ) ||
    0;

  const cashEnough =
    business
      .paymentMode ===
      "credit" ||
    !quote ||
    vm.finance.balance >=
      quote.totalPrice;

  return `
    <section
      class="business-module-panel procurement-panel"
      data-business-panel="procurement"
    >
      <section class="formal-card procurement-picker-card">
        <div class="formal-card-head">
          <div>
            <small>选择原料</small>
            <strong>
              ${escapeHtml(
                selectedIngredient
                  ?.name ??
                "暂无可采购原料"
              )}
            </strong>
          </div>

          <span>
            ${business.catalog.length}
            类可采购
          </span>
        </div>

        <div class="business-chip-strip">
          ${business.inventoryCatalog
            .map(
              ingredient => `
                <button
                  type="button"
                  class="${ingredient.id ===
                    selectedIngredient
                      ?.id
                    ? "is-active"
                    : ""}"
                  data-game-action="procurement-ingredient"
                  data-game-value="${escapeHtml(
                    ingredient.id
                  )}"
                >
                  <strong>
                    ${escapeHtml(
                      ingredient.name
                    )}
                  </strong>
                  <small>
                    库存
                    ${quantity(
                      ingredient
                        .currentQuantity
                    )}
                    ${ingredient.pendingQuantity >
                    0
                      ? ` · 在途 ${quantity(
                          ingredient
                            .pendingQuantity
                        )}`
                      : ""}
                  </small>
                </button>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card supplier-picker-card">
        <div class="formal-card-head">
          <div>
            <small>供应商</small>
            <strong>
              ${escapeHtml(
                selectedSupplier
                  ?.name ??
                "暂无可用供应商"
              )}
            </strong>
          </div>

          <span>
            ${business
              .supplierOptions
              .length}
            家
          </span>
        </div>

        <div class="supplier-option-list">
          ${business
            .supplierOptions
            .map(
              supplier => `
                <button
                  type="button"
                  class="${supplier.id ===
                    selectedSupplier
                      ?.id
                    ? "is-active"
                    : ""}"
                  data-game-action="procurement-supplier"
                  data-game-value="${escapeHtml(
                    supplier.id
                  )}"
                >
                  <div>
                    <strong>
                      ${escapeHtml(
                        supplier.name
                      )}
                    </strong>
                    <small>
                      关系
                      ${supplier.relationship}
                      ·
                      可靠
                      ${supplier.reliability}%
                    </small>
                  </div>

                  <span>
                    起订
                    ${quantity(
                      supplier
                        .minimumOrder
                    )}
                  </span>
                </button>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card procurement-order-card">
        <div class="procurement-quantity-row">
          <div>
            <small>采购数量</small>
            <strong>
              ${quantity(
                quantityValue
              )}
              ${unitLabel(
                selectedIngredient
                  ?.unit
              )}
            </strong>
          </div>

          <div class="quantity-stepper">
            <button
              type="button"
              data-game-action="procurement-quantity"
              data-game-value="minimum"
            >
              最低
            </button>
            <button
              type="button"
              data-game-action="procurement-quantity"
              data-game-value="decrease"
              aria-label="减少采购量"
            >
              −
            </button>
            <span>
              ${quantity(
                quantityValue
              )}
            </span>
            <button
              type="button"
              data-game-action="procurement-quantity"
              data-game-value="increase"
              aria-label="增加采购量"
            >
              ＋
            </button>
            <button
              type="button"
              data-game-action="procurement-quantity"
              data-game-value="maximum"
            >
              今日上限
            </button>
          </div>
        </div>

        ${selectedSupplier
          ? `
            <div class="procurement-limits">
              <span>
                今日剩余额度
                <strong>
                  ${quantity(
                    selectedSupplier
                      .remainingCapacity
                  )}
                </strong>
              </span>
              <span>
                常规配送
                <strong>
                  ${minuteLabel(
                    selectedSupplier
                      .deliveryMinutes
                  )}
                </strong>
              </span>
              <span>
                品质
                <strong>
                  ${qualityLabel(
                    selectedSupplier
                      .qualityMin
                  )}
                  ~
                  ${qualityLabel(
                    selectedSupplier
                      .qualityMax
                  )}
                </strong>
              </span>
            </div>
          `
          : ""}

        <div class="payment-choice">
          <button
            type="button"
            class="${business.paymentMode ===
              "cash"
                ? "is-active"
                : ""}"
            data-game-action="procurement-payment"
            data-game-value="cash"
          >
            现付
          </button>

          <button
            type="button"
            class="${business.paymentMode ===
              "credit"
                ? "is-active"
                : ""}"
            data-game-action="procurement-payment"
            data-game-value="credit"
            ${business
              .canUseCredit
              ? ""
              : "disabled"}
          >
            ${business
              .canUseCredit
              ? `${business.creditDays}天账期`
              : "无账期"}
          </button>
        </div>

        ${quote
          ? `
            <div class="quote-result">
              <div>
                <span>锁定报价</span>
                <strong>
                  ¥${money(
                    quote.totalPrice
                  )}
                </strong>
              </div>
              <div>
                <span>单价</span>
                <strong>
                  ¥${Number(
                    quote.unitPrice
                  ).toFixed(
                    2
                  )}
                  /${unitLabel(
                    quote.unit
                  )}
                </strong>
              </div>
              <div>
                <span>到货品质</span>
                <strong>
                  ${qualityLabel(
                    quote.quality
                  )}
                </strong>
              </div>
              <div>
                <span>预计配送</span>
                <strong>
                  ${minuteLabel(
                    quote
                      .deliveryMinutes
                  )}
                </strong>
              </div>
            </div>

            <div class="quote-action-row">
              <button
                type="button"
                data-game-action="procurement-quote"
              >
                重新报价
              </button>
              <button
                type="button"
                class="is-primary"
                data-game-action="procurement-purchase"
                ${cashEnough
                  ? ""
                  : "disabled"}
              >
                ${cashEnough
                  ? "确认下单"
                  : "资金不足"}
              </button>
            </div>
          `
          : `
            <button
              type="button"
              class="formal-primary-button"
              data-game-action="procurement-quote"
              ${selectedSupplier &&
              quantityValue >
                0
                ? ""
                : "disabled"}
            >
              获取本次报价
            </button>
          `}
      </section>
    </section>
  `;
}

function renderInventoryPanel(
  vm
) {
  const business =
    vm.business;

  const selected =
    business
      .inventoryIngredient;

  const current =
    business.inventoryCatalog.find(
      ingredient =>
        ingredient.id ===
        selected?.id
    );

  return `
    <section
      class="business-module-panel inventory-panel"
      data-business-panel="inventory"
    >
      <section class="formal-card inventory-summary-card">
        <div class="formal-card-head">
          <div>
            <small>库存总览</small>
            <strong>
              ${business.inventoryCatalog.length}
              类原料
            </strong>
          </div>

          <button
            type="button"
            class="danger-soft-button"
            data-game-action="inventory-discard-spoiled"
            ${business
              .spoiledBatches
              .length
              ? ""
              : "disabled"}
          >
            清理腐坏
            ${business
              .spoiledBatches
              .length}
            批
          </button>
        </div>

        <div class="business-chip-strip inventory-chip-strip">
          ${business.catalog
            .map(
              ingredient => `
                <button
                  type="button"
                  class="${ingredient.id ===
                    selected?.id
                    ? "is-active"
                    : ""}"
                  data-game-action="inventory-select"
                  data-game-value="${escapeHtml(
                    ingredient.id
                  )}"
                >
                  <strong>
                    ${escapeHtml(
                      ingredient.name
                    )}
                  </strong>
                  <small>
                    ${quantity(
                      ingredient
                        .currentQuantity
                    )}
                    ${unitLabel(
                      ingredient.unit
                    )}
                  </small>
                </button>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card inventory-detail-card">
        <div class="formal-card-head">
          <div>
            <small>批次详情</small>
            <strong>
              ${escapeHtml(
                selected?.name ??
                "暂无库存"
              )}
            </strong>
          </div>

          <span>
            可用
            ${quantity(
              current
                ?.currentQuantity ??
              0
            )}
            ${unitLabel(
              selected?.unit
            )}
          </span>
        </div>

        <div class="inventory-batch-list formal-scroll-list">
          ${business.batches.length
            ? business.batches
              .map(
                batch => {
                  const daysLeft =
                    Math.max(
                      0,
                      (
                        batch.expiresAt -
                        vm.time
                          .totalMinutes
                      ) /
                        1440
                    );

                  return `
                    <article
                      class="inventory-batch-row ${batch.spoiled
                        ? "is-spoiled"
                        : ""}"
                    >
                      <div>
                        <strong>
                          ${quantity(
                            batch.quantity
                          )}
                          ${unitLabel(
                            batch.unit
                          )}
                        </strong>
                        <small>
                          ${qualityLabel(
                            batch.quality
                          )}
                          ·
                          ${freshnessLabel(
                            batch
                              .freshnessState
                          )}
                          ·
                          新鲜度
                          ${Math.round(
                            batch.freshness
                          )}%
                        </small>
                      </div>

                      <div class="batch-expiry">
                        <strong>
                          ${batch.spoiled
                            ? "已腐坏"
                            : `约 ${daysLeft.toFixed(
                                1
                              )} 天`}
                        </strong>
                        <small>
                          成本
                          ¥${Number(
                            batch.unitCost ??
                            0
                          ).toFixed(
                            2
                          )}
                          /${unitLabel(
                            batch.unit
                          )}
                        </small>
                      </div>

                      ${batch.spoiled
                        ? `
                          <button
                            type="button"
                            data-game-action="inventory-discard-batch"
                            data-game-value="${escapeHtml(
                              batch.id
                            )}"
                          >
                            清理
                          </button>
                        `
                        : ""}
                    </article>
                  `;
                }
              )
              .join(
                ""
              )
            : `
              <div class="formal-empty">
                该原料当前没有有效库存批次
              </div>
            `}
        </div>
      </section>
    </section>
  `;
}

function renderOrdersPanel(
  vm
) {
  const orders =
    vm.business.orders;

  return `
    <section
      class="business-module-panel orders-panel"
      data-business-panel="orders"
    >
      <section class="formal-card orders-summary-card">
        <div>
          <small>配送中</small>
          <strong>
            ${vm.business
              .pendingOrders
              .length}
          </strong>
        </div>
        <div>
          <small>全部采购单</small>
          <strong>
            ${orders.length}
          </strong>
        </div>
        <div>
          <small>在途原料</small>
          <strong>
            ${quantity(
              vm.business
                .pendingOrders
                .reduce(
                  (
                    total,
                    order
                  ) =>
                    total +
                    order.quantity,
                  0
                )
            )}
          </strong>
        </div>
      </section>

      <section class="formal-card formal-list-card procurement-orders-card">
        <div class="formal-scroll-list">
          ${orders.length
            ? orders
              .map(
                order => `
                  <article class="procurement-order-row">
                    <div class="procurement-order-main">
                      <strong>
                        ${escapeHtml(
                          order
                            .ingredientName
                        )}
                        ×
                        ${quantity(
                          order.quantity
                        )}
                      </strong>
                      <small>
                        ${escapeHtml(
                          order
                            .supplierName
                        )}
                        ·
                        ¥${money(
                          order
                            .totalPrice
                        )}
                        ·
                        ${order.paymentMode ===
                          "credit"
                          ? `${order.creditDays}天账期`
                          : "现付"}
                      </small>
                    </div>

                    <div
                      class="procurement-order-status is-${escapeHtml(
                        order.status
                      )}"
                    >
                      <strong>
                        ${orderStatusLabel(
                          order.status
                        )}
                      </strong>
                      <small>
                        ${order.status ===
                          "pending"
                          ? `约 ${minuteLabel(
                              order
                                .remainingMinutes
                            )}`
                          : order.status ===
                              "delivered"
                            ? "已入库存批次"
                            : "款项已处理"}
                      </small>
                    </div>

                    ${order.status ===
                      "pending"
                      ? `
                        <button
                          type="button"
                          data-game-action="procurement-cancel"
                          data-game-value="${escapeHtml(
                            order.id
                          )}"
                        >
                          取消
                        </button>
                      `
                      : ""}
                  </article>
                `
              )
              .join(
                ""
              )
            : `
              <div class="formal-empty">
                尚无采购单
              </div>
            `}
        </div>
      </section>
    </section>
  `;
}

function renderBusinessPage(
  vm
) {
  const business =
    vm.business;

  return `
    <section
      class="primary-page primary-page-business"
      data-primary-page="business"
    >
      <header class="primary-page-title business-page-title">
        <div>
          <small>经营中心</small>
          <h1>采购与库存</h1>
        </div>

        <div class="business-title-stats">
          <span>
            资金
            <strong>
              ¥${money(
                vm.finance
                  .balance
              )}
            </strong>
          </span>
          <span>
            在途
            <strong>
              ${vm.pendingDeliveries}
              笔
            </strong>
          </span>
        </div>
      </header>

      ${renderBusinessTabs(
        business
      )}

      <div class="business-panel-host">
        ${business.tab ===
          "inventory"
          ? renderInventoryPanel(
              vm
            )
          : business.tab ===
              "orders"
            ? renderOrdersPanel(
                vm
              )
            : renderProcurementPanel(
                vm
              )}
      </div>

      <output
        class="home-status-feedback business-feedback"
        data-game-feedback
      >
        ${escapeHtml(
          vm.lastMessage
        )}
      </output>
    </section>
  `;
}

function dishCategoryLabel(
  category
) {
  return (
    {
      rice: "米饭主食",
      noodle: "粉面",
      dumpling_bun: "面点",
      stir_fry: "热炒",
      cold_dish: "凉菜",
      soup: "汤羹",
      hotpot: "锅物",
      barbecue: "烧烤",
      breakfast: "早餐",
      snack: "小吃",
      fast_food: "快捷餐食",
      set_meal: "套餐",
      dessert: "甜品",
      beverage: "饮品",
      bakery: "烘焙",
      specialty: "特色菜"
    }[category] ??
    category ??
    "未分类"
  );
}

function renderDishTabs(
  dishes
) {
  return `
    <div
      class="dish-tab-bar"
      role="tablist"
      aria-label="菜品模块"
    >
      ${[
        [
          "menu",
          "营业菜单"
        ],
        [
          "library",
          "菜品库"
        ],
        [
          "research",
          "研发"
        ]
      ]
        .map(
          (
            [
              id,
              label
            ]
          ) => `
            <button
              type="button"
              class="${dishes.tab ===
                id
                  ? "is-active"
                  : ""}"
              data-game-action="dish-tab"
              data-game-value="${id}"
            >
              ${label}
            </button>
          `
        )
        .join(
          ""
        )}
    </div>
  `;
}

function renderDishSelector(
  items,
  selectedDish
) {
  if (
    items.length ===
      0
  ) {
    return `
      <div class="formal-empty">
        当前没有符合条件的菜品
      </div>
    `;
  }

  return `
    <div class="dish-selector-list">
      ${items
        .map(
          dish => `
            <button
              type="button"
              class="${dish.id ===
                selectedDish?.id
                  ? "is-active"
                  : ""}"
              data-game-action="dish-select"
              data-game-value="${escapeHtml(
                dish.id
              )}"
            >
              <div>
                <strong>
                  ${escapeHtml(
                    dish.name
                  )}
                </strong>
                <small>
                  ${dishCategoryLabel(
                    dish.category
                  )}
                  ${dish.custom
                    ? " · 自研"
                    : ""}
                </small>
              </div>

              <span>
                ${dish.onMenu
                  ? dish.active
                    ? "在售"
                    : "已下架"
                  : `¥${money(
                      dish.basePrice
                    )}`}
              </span>
            </button>
          `
        )
        .join(
          ""
        )}
    </div>
  `;
}

function renderDishDetail(
  vm,
  dish
) {
  if (!dish) {
    return `
      <section class="formal-card dish-detail-card">
        <div class="formal-empty">
          请选择一个菜品
        </div>
      </section>
    `;
  }

  const recipe =
    dish.recipe;

  const progress =
    dish.progress;

  return `
    <section class="formal-card dish-detail-card">
      <div class="dish-detail-head">
        <div>
          <small>
            ${dish.custom
              ? "自研菜品"
              : "标准菜品"}
          </small>
          <h2>
            ${escapeHtml(
              dish.name
            )}
          </h2>
          <p>
            ${dishCategoryLabel(
              dish.category
            )}
            ·
            ${recipe
              ? `${escapeHtml(
                  recipe.method
                )} / ${recipe.cookingMinutes}分钟`
              : "无可用配方"}
          </p>
        </div>

        <div class="dish-detail-badge">
          <strong>
            ${escapeHtml(
              progress
                ?.dishRankName ??
              "未培养"
            )}
          </strong>
          <small>
            熟练 Lv.${progress
              ?.masteryLevel ??
              1}
          </small>
        </div>
      </div>

      <div class="dish-detail-stats">
        <div>
          <span>建议基价</span>
          <strong>
            ¥${money(
              dish.basePrice
            )}
          </strong>
        </div>
        <div>
          <span>累计销量</span>
          <strong>
            ${dish.soldCount}
          </strong>
        </div>
        <div>
          <span>累计营收</span>
          <strong>
            ¥${money(
              dish.totalRevenue
            )}
          </strong>
        </div>
        <div>
          <span>配方质量</span>
          <strong>
            ${Math.round(
              progress
                ?.recipeQualityScore ??
              dish.researchScore ??
              60
            )}
          </strong>
        </div>
      </div>

      ${dish.menuItem
        ? `
          <div class="dish-price-control">
            <div>
              <small>当前售价</small>
              <strong>
                ¥${money(
                  dish.currentPrice
                )}
              </strong>
            </div>

            <div class="dish-price-buttons">
              ${[
                [
                  "minus5",
                  "-5"
                ],
                [
                  "minus1",
                  "-1"
                ],
                [
                  "plus1",
                  "+1"
                ],
                [
                  "plus5",
                  "+5"
                ]
              ]
                .map(
                  (
                    [
                      id,
                      label
                    ]
                  ) => `
                    <button
                      type="button"
                      data-game-action="dish-price"
                      data-game-value="${id}"
                    >
                      ${label}
                    </button>
                  `
                )
                .join(
                  ""
                )}
            </div>

            <button
              type="button"
              class="${dish.active
                ? "danger-soft-button"
                : "formal-primary-button"}"
              data-game-action="dish-toggle-active"
            >
              ${dish.active
                ? "下架"
                : "重新上架"}
            </button>
          </div>
        `
        : `
          <button
            type="button"
            class="formal-primary-button"
            data-game-action="dish-add-menu"
            ${vm.dishes
              .menuItems
              .length >=
            vm.dishes.menuLimit
              ? "disabled"
              : ""}
          >
            ${vm.dishes
              .menuItems
              .length >=
            vm.dishes.menuLimit
              ? `菜单栏位已满 ${vm.dishes.menuLimit}/${vm.dishes.menuLimit}`
              : "加入营业菜单"}
          </button>
        `}

      <div class="dish-recipe-section">
        <div class="formal-card-head">
          <div>
            <small>配方需求</small>
            <strong>
              ${recipe
                ? `${recipe.ingredients.length} 种原料`
                : "无配方"}
            </strong>
          </div>
          <span>
            ${recipe
              ? `难度 ${recipe.difficulty}`
              : ""}
          </span>
        </div>

        <div class="dish-recipe-list">
          ${dish.ingredients
            .length
            ? dish.ingredients
              .map(
                ingredient => `
                  <div
                    class="dish-recipe-row ${ingredient.stock <
                    ingredient.quantity
                      ? "is-short"
                      : ""}"
                  >
                    <div>
                      <strong>
                        ${escapeHtml(
                          ingredient.name
                        )}
                      </strong>
                      <small>
                        单份需要
                        ${quantity(
                          ingredient.quantity
                        )}
                        ${unitLabel(
                          ingredient.unit
                        )}
                      </small>
                    </div>

                    <span>
                      库存
                      ${quantity(
                        ingredient.stock
                      )}
                      ${unitLabel(
                        ingredient.unit
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
                当前没有配方数据
              </div>
            `}
        </div>
      </div>
    </section>
  `;
}

function renderMenuDishPanel(
  vm
) {
  const menuDishes =
    vm.dishes.dishes
      .filter(
        dish =>
          dish.onMenu
      );

  return `
    <section
      class="dish-module-panel dish-menu-panel"
      data-dish-panel="menu"
    >
      <section class="formal-card dish-list-card">
        <div class="formal-card-head">
          <div>
            <small>营业菜单</small>
            <strong>
              ${vm.dishes.activeMenuCount}
              道在售
            </strong>
          </div>
          <span>
            栏位
            ${vm.dishes.menuItems.length}
            /
            ${vm.dishes.menuLimit}
          </span>
        </div>

        ${renderDishSelector(
          menuDishes,
          vm.dishes.selectedDish
        )}
      </section>

      ${renderDishDetail(
        vm,
        vm.dishes.selectedDish
      )}
    </section>
  `;
}

function renderDishLibraryPanel(
  vm
) {
  const last =
    vm.dishes.research
      .lastResult;

  return `
    <section
      class="dish-module-panel dish-library-panel"
      data-dish-panel="library"
    >
      ${last
        ? `
          <section class="formal-card research-result-banner">
            <div>
              <small>最近研发完成</small>
              <strong>
                ${escapeHtml(
                  last.name
                )}
              </strong>
            </div>
            <span>
              评分
              ${last.researchScore}
              ·
              成本 ¥${money(
                last.researchCost
              )}
            </span>
          </section>
        `
        : ""}

      <section class="formal-card dish-list-card">
        <div class="formal-card-head">
          <div>
            <small>当前可用菜品</small>
            <strong>
              ${vm.dishes.dishes.length}
              道
            </strong>
          </div>
          <span>
            Lv.${vm.restaurant.level}
            解锁范围
          </span>
        </div>

        ${renderDishSelector(
          vm.dishes.dishes,
          vm.dishes.selectedDish
        )}
      </section>

      ${renderDishDetail(
        vm,
        vm.dishes.selectedDish
      )}
    </section>
  `;
}

function renderDishResearchPanel(
  vm
) {
  const research =
    vm.dishes.research;

  return `
    <section
      class="dish-module-panel dish-research-panel"
      data-dish-panel="research"
    >
      <section class="formal-card research-method-card">
        <div class="formal-card-head">
          <div>
            <small>烹饪方式</small>
            <strong>
              ${escapeHtml(
                research
                  .selectedMethod
                  ?.name ??
                "未选择"
              )}
            </strong>
          </div>
          <span>
            ${research.methods.length}
            种方法
          </span>
        </div>

        <div class="research-method-strip">
          ${research.methods
            .map(
              method => `
                <button
                  type="button"
                  class="${method.id ===
                    research
                      .methodId
                    ? "is-active"
                    : ""}"
                  data-game-action="dish-research-method"
                  data-game-value="${escapeHtml(
                    method.id
                  )}"
                >
                  <strong>
                    ${escapeHtml(
                      method.icon
                    )}
                    ${escapeHtml(
                      method.name
                    )}
                  </strong>
                  <small>
                    ${method.baseMinutes}
                    分钟
                  </small>
                </button>
              `
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card research-ingredient-card">
        <div class="formal-card-head">
          <div>
            <small>研发原料</small>
            <strong>
              已选
              ${research
                .ingredientIds
                .length}
              / 2–6
            </strong>
          </div>
          <span>
            点击选择
          </span>
        </div>

        <div class="research-ingredient-grid formal-scroll-list">
          ${research.ingredients
            .map(
              ingredient => {
                const chosen =
                  research
                    .ingredientIds
                    .includes(
                      ingredient.id
                    );

                return `
                  <button
                    type="button"
                    class="${chosen
                      ? "is-active"
                      : ""}"
                    data-game-action="dish-research-ingredient"
                    data-game-value="${escapeHtml(
                      ingredient.id
                    )}"
                  >
                    <strong>
                      ${escapeHtml(
                        ingredient.name
                      )}
                    </strong>
                    <small>
                      ${escapeHtml(
                        ingredient.category
                      )}
                      ·
                      ${unitLabel(
                        ingredient.unit
                      )}
                    </small>
                  </button>
                `;
              }
            )
            .join(
              ""
            )}
        </div>
      </section>

      <section class="formal-card research-confirm-card">
        <div class="research-generated-name">
          <small>预计命名</small>
          <strong>
            ${escapeHtml(
              research
                .generatedName
            )}
          </strong>
          <p>
            研发会真实扣除研发费用；评分、建议售价和灵感存在实际随机波动。
          </p>
        </div>

        <button
          type="button"
          class="formal-primary-button"
          data-game-action="dish-research"
          ${research
            .ingredientIds
            .length >=
            2 &&
          research
            .ingredientIds
            .length <=
            6 &&
          research
            .selectedMethod
            ? ""
            : "disabled"}
        >
          开始真实研发
        </button>
      </section>
    </section>
  `;
}

function renderResearchPage(
  vm
) {
  return `
    <section
      class="primary-page primary-page-dishes"
      data-primary-page="research"
    >
      <header class="primary-page-title dish-page-title">
        <div>
          <small>菜品中心</small>
          <h1>菜单与研发</h1>
        </div>

        <div class="dish-title-stats">
          <span>
            在售
            <strong>
              ${vm.dishes
                .activeMenuCount}
            </strong>
          </span>
          <span>
            自研
            <strong>
              ${vm.research
                ?.total ??
                0}
            </strong>
          </span>
        </div>
      </header>

      ${renderDishTabs(
        vm.dishes
      )}

      <div class="dish-panel-host">
        ${vm.dishes.tab ===
          "research"
          ? renderDishResearchPanel(
              vm
            )
          : vm.dishes.tab ===
              "library"
            ? renderDishLibraryPanel(
                vm
              )
            : renderMenuDishPanel(
                vm
              )}
      </div>

      <output
        class="home-status-feedback dish-feedback"
        data-game-feedback
      >
        ${escapeHtml(
          vm.lastMessage
        )}
      </output>
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
        data-asset-slot="home.background"
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
