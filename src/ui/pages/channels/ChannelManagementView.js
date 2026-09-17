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

class ChannelManagementView {
  renderMarkup(page) {
    return `
      <section class="channel-management">
        <header>
          <span>营业渠道</span>
          <h1>销售渠道</h1>
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
        </section>

        <section>
          <h2>渠道列表</h2>

          ${page.channels.map(
            channel => `
              <article>
                <div>
                  <strong>
                    ${channel.name}
                  </strong>

                  <span>
                    ${
                      channel.active
                        ? "营业中"
                        : channel.unlocked
                          ? "已解锁"
                          : "未解锁"
                    }
                  </span>
                </div>

                <p>
                  ${channel.description}
                </p>

                <p>
                  抽佣
                  ${channel.commissionRate}%
                  ·
                  单均包装
                  ${money(
                    channel
                      .packagingCostPerOrder
                  )}
                </p>

                <p>
                  累计
                  ${channel.lifetimeOrders}
                  单
                  ·
                  净收入
                  ${money(
                    channel
                      .lifetimeNetRevenue
                  )}
                </p>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>渠道结构</h2>

          ${
            page.demandWeights.length
              ? page.demandWeights.map(
                  item => `
                    <article>
                      <strong>
                        ${item.channelId}
                      </strong>

                      <span>
                        客流权重
                        ${
                          Math.round(
                            item.weight *
                            100
                          )
                        }%
                      </span>

                      <span>
                        容量系数
                        ×${item.capacityMultiplier}
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无营业渠道</p>"
          }
        </section>
      </section>
    `;
  }
}

export const channelManagementView =
  new ChannelManagementView();

export {
  ChannelManagementView
};
