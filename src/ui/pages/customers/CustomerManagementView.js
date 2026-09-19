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


function relationshipStageName(
  stage
) {
  return {
    new:
      "初识",

    regular:
      "常客",

    familiar:
      "熟客",

    core:
      "核心熟客"
  }[
    stage
  ] ??
    "已识别";
}


class CustomerManagementView {
  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen customer-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "顾客 · 熟客 · 会员"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "顾客管理",

          subtitle:
            "顾客资产、复购与会员关系",

          backTarget:
            "operations",

          rightHtml:
            `
              <button
                type="button"
                class="customer-member-link"
                data-page-target="member-marketing"
              >
                会员营销
              </button>
            `
        })}


        <section class="customer-kpis">

          ${[
            [
              "会员数",
              page.dashboard.members,
              "当前会员"
            ],
            [
              "复购会员",
              page.dashboard.repeatMembers,
              "重复到店"
            ],
            [
              "会员复购率",
              `${page.dashboard.memberRepeatRate}%`,
              "会员表现"
            ],
            [
              "会员消费",
              money(
                page.dashboard
                  .memberRevenue
              ),
              "累计贡献"
            ],
            [
              "可识别熟客",
              page.identitySummary
                .recognizedCustomers,
              "顾客档案"
            ],
            [
              "熟客识别率",
              `${page.identitySummary.recognitionRate}%`,
              "识别效率"
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


        <section class="customer-overview-grid">

          <article>
            <span>满意度</span>
            <strong>
              ${page.overview.satisfaction}
            </strong>
          </article>

          <article>
            <span>综合复购率</span>
            <strong>
              ${page.overview.repeatRate}%
            </strong>
          </article>

          <article>
            <span>评价</span>
            <strong>
              ${page.overview.reviewScore}
            </strong>
          </article>

          <article>
            <span>口碑</span>
            <strong>
              ${page.overview.reputation}
            </strong>
          </article>

          <article>
            <span>累计服务</span>
            <strong>
              ${page.overview.totalServed}
            </strong>
          </article>

        </section>


        <section class="customer-grid">

          <article class="customer-panel">

            <header>
              <strong>
                可识别熟客
              </strong>

              <span>
                累计识别
                ${page.identitySummary.recognizedVisits}
                次
              </span>
            </header>

            <div class="customer-list">

              ${
                page.recognizedCustomers.length
                  ? page.recognizedCustomers
                      .slice(
                        0,
                        20
                      )
                      .map(
                        customer => `
                          <article>
                            <div>
                              <strong>
                                ${escapeHtml(
                                  customer.customerName
                                )}
                              </strong>

                              <small>
                                ${relationshipStageName(
                                  customer.relationshipStage
                                )}
                                ·
                                ${escapeHtml(
                                  customer.segmentName
                                )}
                              </small>
                            </div>

                            <div>
                              <span>
                                ${customer.recognizedVisits ?? 0}次识别
                              </span>

                              <span>
                                累计
                                ${money(
                                  customer.totalSpend ??
                                  0
                                )}
                              </span>

                              <span>
                                满意度
                                ${customer.averageSatisfaction ?? 0}
                              </span>

                              <b
                                class="${
                                  customer.atRisk
                                    ? "is-risk"
                                    : "is-normal"
                                }"
                              >
                                ${
                                  customer.atRisk
                                    ? "流失风险"
                                    : customer.member
                                      ? "会员熟客"
                                      : "普通熟客"
                                }
                              </b>
                            </div>
                          </article>
                        `
                      )
                      .join("")
                  : `
                    <div class="customer-empty">
                      重复到店顾客会逐步形成可识别熟客档案
                    </div>
                  `
              }

            </div>

          </article>


          <article class="customer-panel">

            <header>
              <strong>
                会员等级
              </strong>

              <span>
                等级结构
              </span>
            </header>

            <div class="customer-levels">

              ${page.levels
                .map(
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
                            ] ??
                          0
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
                )
                .join("")}

            </div>

          </article>

        </section>


        <section class="customer-grid">

          <article class="customer-panel">

            <header>
              <strong>
                会员名单
              </strong>

              <span>
                ${page.members.length}人
              </span>
            </header>

            <div class="customer-list">

              ${
                page.members.length
                  ? page.members
                      .slice(
                        0,
                        24
                      )
                      .map(
                        member => `
                          <article>
                            <div>
                              <strong>
                                ${escapeHtml(
                                  member.customerName
                                )}
                              </strong>

                              <small>
                                ${escapeHtml(
                                  member.level
                                    ?.name ??
                                  "会员"
                                )}
                              </small>
                            </div>

                            <div>
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
                            </div>
                          </article>
                        `
                      )
                      .join("")
                  : `
                    <div class="customer-empty">
                      暂无会员
                    </div>
                  `
              }

            </div>

          </article>


          <article class="customer-panel">

            <header>
              <strong>
                客群画像
              </strong>

              <span>
                到店结构
              </span>
            </header>

            <div class="customer-segment-list">

              ${
                page.segments.length
                  ? page.segments
                      .map(
                        segment => `
                          <article>
                            <strong>
                              ${escapeHtml(
                                segment.name ??
                                segment.segmentId
                              )}
                            </strong>

                            <span>
                              到店
                              ${segment.visitors}人
                            </span>

                            <span>
                              成交
                              ${segment.served}人
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
                      )
                      .join("")
                  : `
                    <div class="customer-empty">
                      暂无客群数据
                    </div>
                  `
              }

            </div>

          </article>

        </section>


        <section class="customer-panel customer-risk-panel">

          <header>
            <strong>
              流失预警
            </strong>

            <span>
              需要重点维护
            </span>
          </header>

          <div class="customer-risk-list">

            ${
              page.atRiskMembers.length
                ? page.atRiskMembers
                    .map(
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

                          <span>
                            累计
                            ${money(
                              member.totalSpend
                            )}
                          </span>
                        </article>
                      `
                    )
                    .join("")
                : `
                  <div class="customer-empty">
                    当前没有高风险会员
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
                "customers"
            })
        )}

      </main>
    `;
  }
}


export const customerManagementView =
  new CustomerManagementView();


export {
  CustomerManagementView
};
