import {
  channelManagementPageSystem
} from "./ChannelManagementPageSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      Number(
        value ??
        0
      )
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function percent(
  value
) {
  return (
    Number(
      value ??
      0
    ).toFixed(
      1
    ) +
    "%"
  );
}


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


function requirementText(
  channel
) {
  const status =
    channel.requirementStatus;

  if (
    channel.unlocked
  ) {
    return "已解锁";
  }

  if (
    status?.eligible
  ) {
    return "满足解锁条件";
  }

  const required =
    status?.required ??
    {};

  return [
    `Lv.${required.restaurantLevel ?? 1}`,
    `口碑${required.reputation ?? 0}`,
    `满意度${required.satisfaction ?? 0}`
  ].join(
    " · "
  );
}


class ChannelManagementView {
  constructor({
    pageSystem =
      channelManagementPageSystem,

    onNavigate =
      null
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.root =
      null;

    this.restaurantId =
      null;
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen channel-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "堂食 · 自取 · 外卖 · 预约"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "销售渠道",

          subtitle:
            "管理接单优先级、容量与渠道成本",

          backTarget:
            "operations"
        })}


        <section class="channel-kpis">

          ${[
            [
              "已解锁",
              page.unlockedCount,
              "个渠道"
            ],
            [
              "营业中",
              page.activeCount,
              "个渠道"
            ],
            [
              "累计订单",
              page.totalOrders,
              "单"
            ],
            [
              "渠道净收入",
              money(
                page.netRevenue
              ),
              "累计"
            ],
            [
              "贡献利润",
              money(
                page.contributionProfit
              ),
              "累计"
            ],
            [
              "渠道费用",
              money(
                page.totalFees
              ),
              "佣金+包装"
            ]
          ]
            .map(
              (
                [
                  label,
                  value,
                  sub
                ]
              ) => `
                <article>
                  <span>
                    ${label}
                  </span>

                  <strong>
                    ${value}
                  </strong>

                  <small>
                    ${sub}
                  </small>
                </article>
              `
            )
            .join("")}

        </section>


        <section class="channel-card-list">

          ${page.channels
            .map(
              channel => `
                <article
                  class="
                    channel-card
                    ${channel.active
                      ? "is-active"
                      : ""
                    }
                  "
                  data-channel-card="${escapeHtml(
                    channel.id
                  )}"
                >

                  <header>

                    <div>
                      <strong>
                        ${escapeHtml(
                          channel.name
                        )}
                      </strong>

                      <span>
                        ${
                          channel.active
                            ? "营业中"
                            : channel.unlocked
                              ? "已停用"
                              : "未解锁"
                        }
                      </span>
                    </div>

                    <small>
                      ${escapeHtml(
                        requirementText(
                          channel
                        )
                      )}
                    </small>

                  </header>


                  <p>
                    ${escapeHtml(
                      channel.description
                    )}
                  </p>


                  <div class="channel-stat-grid">

                    <span>
                      抽佣
                      <strong>
                        ${channel.commissionRate}%
                      </strong>
                    </span>

                    <span>
                      单均包装
                      <strong>
                        ${money(
                          channel
                            .packagingCostPerOrder
                        )}
                      </strong>
                    </span>

                    <span>
                      优先级
                      <strong>
                        ×${channel.priorityMultiplier}
                      </strong>
                    </span>

                    <span>
                      本小时容量
                      <strong>
                        ${channel.capacityStatus.used}
                        /
                        ${channel.capacityStatus.limit}
                      </strong>
                    </span>

                    <span>
                      容量占用
                      <strong>
                        ${percent(
                          channel.capacityStatus
                            .utilizationRate
                        )}
                      </strong>
                    </span>

                    <span>
                      剩余
                      <strong>
                        ${channel.capacityStatus.remaining}单
                      </strong>
                    </span>

                  </div>


                  <div class="channel-lifetime">

                    <span>
                      累计
                      <strong>
                        ${channel.lifetimeOrders}单
                      </strong>
                    </span>

                    <span>
                      净收入
                      <strong>
                        ${money(
                          channel
                            .lifetimeNetRevenue
                        )}
                      </strong>
                    </span>

                    <span>
                      贡献利润
                      <strong>
                        ${money(
                          channel.performance
                            .contributionProfit
                        )}
                      </strong>
                    </span>

                    <span>
                      利润率
                      <strong>
                        ${percent(
                          channel.performance
                            .profitMargin
                        )}
                      </strong>
                    </span>

                  </div>


                  <div class="channel-actions">

                    ${
                      !channel.unlocked
                        ? `
                          <button
                            type="button"
                            data-channel-unlock="${escapeHtml(
                              channel.id
                            )}"
                            ${
                              channel.requirementStatus
                                ?.eligible
                                ? ""
                                : "disabled"
                            }
                          >
                            解锁渠道
                          </button>
                        `
                        : channel.id !==
                          "dine_in"
                          ? `
                            <button
                              type="button"
                              data-channel-toggle="${escapeHtml(
                                channel.id
                              )}"
                              data-next-active="${String(
                                !channel.active
                              )}"
                            >
                              ${channel.active
                                ? "暂停渠道"
                                : "启用渠道"
                              }
                            </button>
                          `
                          : ""
                    }

                    ${
                      channel.unlocked
                        ? `
                          <button
                            type="button"
                            data-channel-priority="${escapeHtml(
                              channel.id
                            )}"
                            data-channel-priority-delta="-0.1"
                          >
                            优先级−
                          </button>

                          <button
                            type="button"
                            data-channel-priority="${escapeHtml(
                              channel.id
                            )}"
                            data-channel-priority-delta="0.1"
                          >
                            优先级＋
                          </button>

                          <button
                            type="button"
                            data-channel-limit="${escapeHtml(
                              channel.id
                            )}"
                            data-channel-limit-delta="-5"
                          >
                            容量−5
                          </button>

                          <button
                            type="button"
                            data-channel-limit="${escapeHtml(
                              channel.id
                            )}"
                            data-channel-limit-delta="5"
                          >
                            容量＋5
                          </button>
                        `
                        : ""
                    }

                  </div>

                </article>
              `
            )
            .join("")}

        </section>


        <section class="channel-structure-panel">

          <header>
            <strong>
              当前渠道结构
            </strong>

            <span>
              综合客流权重
            </span>
          </header>

          <div>

            ${
              page.demandWeights.length
                ? page.demandWeights
                    .map(
                      item => `
                        <article>
                          <strong>
                            ${escapeHtml(
                              item.name
                            )}
                          </strong>

                          <span>
                            客流
                            ${Math.round(
                              item.weight *
                              100
                            )}%
                          </span>

                          <span>
                            优先级
                            ×${item.priorityMultiplier}
                          </span>

                          <span>
                            容量
                            ${item.capacity.used}
                            /
                            ${item.capacity.limit}
                          </span>
                        </article>
                      `
                    )
                    .join("")
                : `
                  <div class="channel-empty">
                    暂无可接单营业渠道
                  </div>
                `
            }

          </div>

        </section>


        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "channels"
            })
        )}

      </main>
    `;
  }


  mount(
    root,
    {
      restaurantId,
      onNavigate =
        this.onNavigate
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
        "[data-channel-unlock]"
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
                .unlockChannel(
                  this.restaurantId,
                  button.dataset
                    .channelUnlock
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-channel-toggle]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .setChannelActive(
                  this.restaurantId,
                  button.dataset
                    .channelToggle,
                  button.dataset
                    .nextActive ===
                    "true"
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-channel-priority]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .adjustPriority(
                  this.restaurantId,
                  button.dataset
                    .channelPriority,
                  Number(
                    button.dataset
                      .channelPriorityDelta
                  )
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-channel-limit]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .adjustHourlyLimit(
                  this.restaurantId,
                  button.dataset
                    .channelLimit,
                  Number(
                    button.dataset
                      .channelLimitDelta
                  )
                );

              this.render();
            }
          );
        }
      );
  }


  destroy() {
    this.root =
      null;

    this.restaurantId =
      null;
  }
}


export const channelManagementView =
  new ChannelManagementView();


export {
  ChannelManagementView
};
