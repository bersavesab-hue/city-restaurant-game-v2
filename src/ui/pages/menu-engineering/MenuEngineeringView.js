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

class MenuEngineeringView {
  renderMarkup(page) {
    return `
      <main class="rg-screen menu-engineering-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "销量 · 贡献利润 · 菜品诊断"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "菜单工程",

          subtitle:
            "销量 · 贡献利润 · 菜品诊断",

          backTarget:
            "operations"
        })}

        <section class="menu-engineering">

        <section class="menu-engineering-kpis">
          <article>
            <span>明星菜</span>
            <strong>
              ${page.counts.star}
            </strong>
          </article>

          <article>
            <span>现金牛</span>
            <strong>
              ${page.counts.cash_cow}
            </strong>
          </article>

          <article>
            <span>问题菜</span>
            <strong>
              ${page.counts.puzzle}
            </strong>
          </article>

          <article>
            <span>瘦狗菜</span>
            <strong>
              ${page.counts.dog}
            </strong>
          </article>
        </section>

        <section>
          <h2>菜单基准</h2>

          <p>
            平均销量：
            ${page.thresholds.popularity}
          </p>

          <p>
            平均单份贡献：
            ${money(
              page.thresholds
                .contributionPerPortion
            )}
          </p>

          <p>
            总贡献利润：
            ${money(
              page
                .totalContributionProfit
            )}
          </p>
        </section>

        <section>
          <h2>菜品诊断</h2>

          ${
            page.dishes.length
              ? page.dishes.map(
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
                        销量占比
                        ${dish.salesShare}%
                      </span>

                      <span>
                        单份贡献
                        ${money(
                          dish
                            .contributionPerPortion
                        )}
                      </span>

                      <span>
                        毛利率
                        ${dish.marginRate}%
                      </span>

                      <span>
                        品质
                        ${dish.averageQuality}
                      </span>

                      <p>
                        ${dish.advice}
                      </p>
                    </article>
                  `
                ).join("")
              : "<p>暂无足够的菜单经营数据</p>"
          }
        </section>
      </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "operations"
            })
        )}

      </main>
    `;
  }
}

export const menuEngineeringView =
  new MenuEngineeringView();

export {
  MenuEngineeringView
};
