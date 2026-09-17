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

function resultName(result) {
  return {
    improved: "有效",
    declined: "变差",
    neutral: "持平",
    insufficient_data:
      "数据不足"
  }[result] ?? result;
}

class MenuOptimizationView {
  renderMarkup(page) {
    return `
      <section class="menu-optimization">
        <header>
          <span>菜单决策</span>
          <h1>菜单调整</h1>
        </header>

        <section>
          <article>
            <span>营业菜品</span>
            <strong>
              ${page.dashboard.activeItems}
            </strong>
          </article>

          <article>
            <span>菜单置顶</span>
            <strong>
              ${page.dashboard.pinnedItems}
            </strong>
          </article>

          <article>
            <span>进行中促销</span>
            <strong>
              ${page.dashboard.activePromotions}
            </strong>
          </article>

          <article>
            <span>调整记录</span>
            <strong>
              ${page.dashboard.actionCount}
            </strong>
          </article>
        </section>

        <section>
          <h2>当前菜单诊断</h2>

          ${page.engineering.dishes.map(
            dish => `
              <article>
                <strong>
                  ${dish.name}
                </strong>

                <b>
                  ${dish.classificationName}
                </b>

                <span>
                  销量
                  ${dish.quantity}
                </span>

                <span>
                  单份贡献
                  ${money(
                    dish
                      .contributionPerPortion
                  )}
                </span>

                <p>
                  ${dish.advice}
                </p>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>调整效果</h2>

          ${
            page.dashboard
              .recentActions.length
              ? page.dashboard
                  .recentActions
                  .map(
                    evaluation => `
                      <article>
                        <strong>
                          ${evaluation.action.actionKind}
                        </strong>

                        <b>
                          ${resultName(
                            evaluation.result
                          )}
                        </b>

                        <span>
                          销量变化
                          ${
                            evaluation.delta
                              .quantity >= 0
                              ? "+"
                              : ""
                          }
                          ${evaluation.delta.quantity}
                        </span>

                        <span>
                          利润变化
                          ${
                            evaluation.delta
                              .contributionProfit >= 0
                              ? "+"
                              : ""
                          }
                          ${money(
                            evaluation.delta
                              .contributionProfit
                          )}
                        </span>

                        <span>
                          毛利率变化
                          ${
                            evaluation.delta
                              .marginRate >= 0
                              ? "+"
                              : ""
                          }
                          ${evaluation.delta.marginRate}%
                        </span>
                      </article>
                    `
                  )
                  .join("")
              : "<p>暂无菜单调整记录</p>"
          }
        </section>
      </section>
    `;
  }
}

export const menuOptimizationView =
  new MenuOptimizationView();

export {
  MenuOptimizationView
};
