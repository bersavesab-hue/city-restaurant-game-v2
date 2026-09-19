import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


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

class MemberMarketingView {
  renderMarkup(page) {
    return `
      <main class="rg-screen member-marketing-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "会员经营 · 生命周期 · ROI"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "会员营销",

          subtitle:
            `积分有效期${page.pointPolicy.expiryDays}天 · 1积分抵${money(
              page.pointPolicy.pointValue
            )}`,

          backTarget:
            "more-home",

          rightHtml:
            `
              <button
                type="button"
                class="member-marketing__customer-link"
                data-page-target="customers"
              >
                顾客管理
              </button>
            `
        })}

        <section class="member-marketing">

        <section class="marketing-kpis">
          <article>
            <span>识别熟客</span>
            <strong>
              ${page.identity
                .recognizedCustomers}
            </strong>
          </article>

          <article>
            <span>熟客识别访问</span>
            <strong>
              ${page.identity
                .recognizedVisits}
            </strong>
          </article>

          <article>
            <span>会员数</span>
            <strong>
              ${page.loyalty.members}
            </strong>
          </article>

          <article>
            <span>会员复购率</span>
            <strong>
              ${percent(
                page.loyalty
                  .memberRepeatRate
              )}
            </strong>
          </article>

          <article>
            <span>当前积分</span>
            <strong>
              ${page.loyalty.currentPoints}
            </strong>
          </article>

          <article>
            <span>已兑换积分</span>
            <strong>
              ${page.loyalty.pointsRedeemed}
            </strong>
          </article>

          <article>
            <span>已过期积分</span>
            <strong>
              ${page.loyalty.pointsExpired}
            </strong>
          </article>

          <article>
            <span>可用优惠券</span>
            <strong>
              ${page.marketing.activeCoupons}
            </strong>
          </article>

          <article>
            <span>营销预算</span>
            <strong>
              ${money(
                page.marketing
                  .campaignSpend
              )}
            </strong>
          </article>

          <article>
            <span>活动券成本</span>
            <strong>
              ${money(
                page.marketing
                  .campaignDiscountCost
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>会员权益与等级</h2>

          ${page.levels.map(
            level => `
              <article>
                <strong>
                  ${level.name}
                </strong>

                <span>
                  当前
                  ${page.loyalty
                    .levelCounts[
                      level.id
                    ] ?? 0}
                  人
                </span>

                <span>
                  门槛
                  ${level.minVisits}次
                  ·
                  ${money(
                    level.minSpend
                  )}
                  ·
                  累计
                  ${level.minLifetimePoints}积分
                </span>

                <span>
                  等级折扣
                  ${level.discount}%
                  ·
                  积分倍率
                  ×${level.pointMultiplier}
                </span>

                <small>
                  ${
                    level.inactivityDowngradeDays ===
                      null
                      ? "基础等级不降级"
                      : `${level.inactivityDowngradeDays}天未消费进入降级检查`
                  }
                </small>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>客群入会倾向</h2>

          ${
            page.loyalty.segments.length
              ? page.loyalty.segments
                  .slice()
                  .sort(
                    (a, b) =>
                      b.enrollmentPropensity -
                      a.enrollmentPropensity
                  )
                  .map(
                    segment => `
                      <article>
                        <strong>
                          ${segment.segmentId}
                        </strong>

                        <span>
                          入会倾向
                          ${segment.enrollmentPropensity}
                        </span>

                        <span>
                          到店
                          ${segment.visitors}
                          ·
                          客单
                          ${money(
                            segment.averageSpend
                          )}
                        </span>
                      </article>
                    `
                  )
                  .join("")
              : "<p>暂无客群行为数据</p>"
          }
        </section>

        <section>
          <h2>优惠与积分成本</h2>

          <p>
            累计优惠
            ${money(
              page.marketing
                .totalDiscount
            )}
            ·
            已使用券
            ${page.marketing.usedCoupons}
            ·
            已过期券
            ${page.marketing.expiredCoupons}
          </p>

          <p>
            等级折扣、单张优惠券和积分允许组合，
            但单笔总优惠最高
            ${percent(
              page.pointPolicy
                .maxCombinedDiscountRate *
              100
            )}。
          </p>
        </section>

        <section>
          <h2>会员营销活动ROI</h2>

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
                        ·
                        转化
                        ${campaign.conversionCount}人
                        ·
                        转化率
                        ${percent(
                          campaign.conversionRate
                        )}
                      </span>

                      <span>
                        预算
                        ${money(
                          campaign.budget
                        )}
                        ·
                        券成本
                        ${money(
                          campaign.discountCost
                        )}
                      </span>

                      <span>
                        归因收入
                        ${money(
                          campaign.attributedRevenue
                        )}
                        ·
                        归因贡献利润
                        ${money(
                          campaign
                            .attributedContributionProfit
                        )}
                      </span>

                      <span>
                        营业额ROI
                        ${percent(
                          campaign.revenueRoi
                        )}
                        ·
                        贡献利润ROI
                        ${percent(
                          campaign.contributionRoi
                        )}
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无营销活动</p>"
          }
        </section>
        </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "more"
            })
        )}

      </main>
    `;
  }
}

export const memberMarketingView =
  new MemberMarketingView();

export {
  MemberMarketingView
};
