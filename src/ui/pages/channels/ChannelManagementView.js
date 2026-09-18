import {
  channelManagementPageSystem
} from "./ChannelManagementPageSystem.js";

function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value ?? 0)
    ).toLocaleString(
      "zh-CN"
    )
  );
}

function percent(value) {
  return (
    Number(
      value ?? 0
    ).toFixed(1) +
    "%"
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
  ].join(" · ");
}

class ChannelManagementView {
  constructor({
    pageSystem =
      channelManagementPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root = null;
    this.restaurantId = null;
  }

  renderMarkup(page) {
    return `
      <main class="channel-management">
        <header>
          <span>营业渠道 · 成本 · 容量</span>
          <h1>销售渠道</h1>
          <p>
            管理堂食、自取、外卖与预约的接单优先级和小时容量。
          </p>
        </header>

        <section class="channel-kpis">
          <article>
            <span>已解锁</span>
            <strong>
              ${page.unlockedCount}
            </strong>
          </article>

          <article>
            <span>营业中</span>
            <strong>
              ${page.activeCount}
            </strong>
          </article>

          <article>
            <span>累计订单</span>
            <strong>
              ${page.totalOrders}
            </strong>
          </article>

          <article>
            <span>渠道净收入</span>
            <strong>
              ${money(
                page.netRevenue
              )}
            </strong>
          </article>

          <article>
            <span>贡献利润</span>
            <strong>
              ${money(
                page.contributionProfit
              )}
            </strong>
          </article>

          <article>
            <span>渠道费用</span>
            <strong>
              ${money(
                page.totalFees
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>渠道经营</h2>

          ${page.channels.map(
            channel => `
              <article
                data-channel-card="${channel.id}"
              >
                <header>
                  <div>
                    <strong>
                      ${channel.name}
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
                    ${requirementText(
                      channel
                    )}
                  </small>
                </header>

                <p>
                  ${channel.description}
                </p>

                <div>
                  <span>
                    抽佣
                    ${channel.commissionRate}%
                  </span>

                  <span>
                    单均包装
                    ${money(
                      channel
                        .packagingCostPerOrder
                    )}
                  </span>

                  <span>
                    优先级
                    ×${channel.priorityMultiplier}
                  </span>
                </div>

                <div>
                  <span>
                    本小时
                    ${channel.capacityStatus.used}
                    /
                    ${channel.capacityStatus.limit}
                    单
                  </span>

                  <span>
                    占用
                    ${percent(
                      channel.capacityStatus
                        .utilizationRate
                    )}
                  </span>

                  <span>
                    剩余
                    ${channel.capacityStatus.remaining}
                    单
                  </span>
                </div>

                <div>
                  <span>
                    累计
                    ${channel.lifetimeOrders}
                    单
                  </span>

                  <span>
                    净收入
                    ${money(
                      channel
                        .lifetimeNetRevenue
                    )}
                  </span>

                  <span>
                    贡献利润
                    ${money(
                      channel.performance
                        .contributionProfit
                    )}
                  </span>

                  <span>
                    利润率
                    ${percent(
                      channel.performance
                        .profitMargin
                    )}
                  </span>
                </div>

                <div>
                  ${
                    !channel.unlocked
                      ? `
                        <button
                          type="button"
                          data-channel-unlock="${channel.id}"
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
                            data-channel-toggle="${channel.id}"
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
                          data-channel-priority="${channel.id}"
                          data-channel-priority-delta="-0.1"
                        >
                          降低优先级
                        </button>

                        <button
                          type="button"
                          data-channel-priority="${channel.id}"
                          data-channel-priority-delta="0.1"
                        >
                          提高优先级
                        </button>

                        <button
                          type="button"
                          data-channel-limit="${channel.id}"
                          data-channel-limit-delta="-5"
                        >
                          -5单/小时
                        </button>

                        <button
                          type="button"
                          data-channel-limit="${channel.id}"
                          data-channel-limit-delta="5"
                        >
                          +5单/小时
                        </button>
                      `
                      : ""
                  }
                </div>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>当前渠道结构</h2>

          ${
            page.demandWeights.length
              ? page.demandWeights.map(
                  item => `
                    <article>
                      <strong>
                        ${item.name}
                      </strong>

                      <span>
                        综合客流权重
                        ${
                          Math.round(
                            item.weight *
                            100
                          )
                        }%
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
                ).join("")
              : "<p>暂无可接单营业渠道</p>"
          }
        </section>
      </main>
    `;
  }

  mount(
    root,
    {
      restaurantId
    } = {}
  ) {
    this.root = root;
    this.restaurantId =
      restaurantId;

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
    this.root = null;
    this.restaurantId = null;
  }
}

export const channelManagementView =
  new ChannelManagementView();

export {
  ChannelManagementView
};
