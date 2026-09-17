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

class MemberMarketingView {
  renderMarkup(page) {
    return `
      <section class="member-marketing">
        <header>
          <span>会员经营</span>
          <h1>会员营销</h1>
        </header>

        <section class="marketing-kpis">
          <article>
            <span>会员数</span>
            <strong>
              ${page.loyalty.members}
            </strong>
          </article>

          <article>
            <span>可用优惠券</span>
            <strong>
              ${page.marketing.activeCoupons}
            </strong>
          </article>

          <article>
            <span>累计优惠</span>
            <strong>
              ${money(
                page.marketing
                  .totalDiscount
              )}
            </strong>
          </article>

          <article>
            <span>营销带来收入</span>
            <strong>
              ${money(
                page.marketing
                  .attributedRevenue
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>会员权益</h2>

          ${page.levels.map(
            level => `
              <article>
                <strong>
                  ${level.name}
                </strong>

                <span>
                  等级折扣
                  ${level.discount}%
                </span>

                <span>
                  积分倍率
                  ${level.pointMultiplier}
                </span>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>优惠券</h2>

          <p>
            已使用
            ${page.marketing.usedCoupons}
          </p>

          <p>
            已过期
            ${page.marketing.expiredCoupons}
          </p>

          <p>
            已兑换积分
            ${page.marketing.pointsRedeemed}
          </p>
        </section>

        <section>
          <h2>营销活动</h2>

          ${
            page.campaigns.length
              ? page.campaigns.map(
                  campaign => `
                    <article>
                      <strong>
                        ${campaign.name}
                      </strong>

                      <span>
                        触达
                        ${campaign.recipientCount}人
                      </span>

                      <span>
                        转化
                        ${campaign.conversionCount}人
                      </span>

                      <span>
                        转化率
                        ${campaign.conversionRate}%
                      </span>

                      <span>
                        ROI
                        ${campaign.roi}%
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无营销活动</p>"
          }
        </section>
      </section>
    `;
  }
}

export const memberMarketingView =
  new MemberMarketingView();

export {
  MemberMarketingView
};
