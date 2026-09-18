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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

class CustomerManagementView {
  constructor() {
    this.section =
      "overview";
  }

  renderMarkup(page) {
    return `
      <section class="customer-management">
        <header>
          <span>顾客资产</span>
          <h1>顾客与会员</h1>

          <button
            type="button"
            data-page-target="member-marketing"
          >
            会员营销 →
          </button>
        </header>

        <section class="customer-kpis">
          <article>
            <span>会员数</span>
            <strong>
              ${page.dashboard.members}
            </strong>
          </article>

          <article>
            <span>复购会员</span>
            <strong>
              ${page.dashboard.repeatMembers}
            </strong>
          </article>

          <article>
            <span>会员复购率</span>
            <strong>
              ${page.dashboard.memberRepeatRate}%
            </strong>
          </article>

          <article>
            <span>会员消费</span>
            <strong>
              ${money(
                page.dashboard
                  .memberRevenue
              )}
            </strong>
          </article>
        </section>

        <nav>
          <span>总览</span>
          <span>会员</span>
          <span>客群</span>
          <span>流失预警</span>
        </nav>

        <section>
          <h2>门店顾客表现</h2>

          <p>
            满意度
            ${page.overview.satisfaction}
          </p>

          <p>
            综合复购率
            ${page.overview.repeatRate}%
          </p>

          <p>
            评价
            ${page.overview.reviewScore}
          </p>

          <p>
            口碑
            ${page.overview.reputation}
          </p>
        </section>

        <section>
          <h2>会员等级</h2>

          ${page.levels.map(
            level => `
              <article>
                <strong>
                  ${escapeHtml(
                    level.name
                  )}
                </strong>

                <span>
                  ${
                    page.dashboard
                      .levelCounts[
                        level.id
                      ] ?? 0
                  }人
                </span>

                <small>
                  消费满
                  ${money(
                    level.minSpend
                  )}
                  ·
                  ${level.minVisits}次
                </small>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>会员名单</h2>

          ${
            page.members.length
              ? page.members.map(
                  member => `
                    <article>
                      <strong>
                        ${escapeHtml(
                          member.customerName
                        )}
                      </strong>

                      <span>
                        ${member.level?.name ?? "会员"}
                      </span>

                      <span>
                        ${member.visits}次到店
                      </span>

                      <span>
                        累计
                        ${money(
                          member.totalSpend
                        )}
                      </span>

                      <span>
                        ${member.points}积分
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无会员</p>"
          }
        </section>

        <section>
          <h2>客群画像</h2>

          ${
            page.segments.length
              ? page.segments.map(
                  segment => `
                    <article>
                      <strong>
                        ${escapeHtml(
                          segment.segmentId
                        )}
                      </strong>

                      <span>
                        ${segment.visitors}人到店
                      </span>

                      <span>
                        ${segment.served}人成交
                      </span>

                      <span>
                        客单
                        ${money(
                          segment.averageSpend
                        )}
                      </span>

                      <span>
                        满意度
                        ${segment.satisfaction}
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无客群数据</p>"
          }
        </section>

        <section>
          <h2>流失预警</h2>

          ${
            page.atRiskMembers.length
              ? page.atRiskMembers.map(
                  member => `
                    <article>
                      <strong>
                        ${escapeHtml(
                          member.customerName
                        )}
                      </strong>

                      <span>
                        ${member.visits}次历史到店
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无高风险会员</p>"
          }
        </section>
      </section>
    `;
  }
}

export const customerManagementView =
  new CustomerManagementView();

export {
  CustomerManagementView
};
