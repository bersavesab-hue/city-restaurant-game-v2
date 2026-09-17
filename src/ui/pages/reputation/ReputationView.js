class ReputationView {
  renderMarkup(page) {
    return `
      <section class="reputation-page">
        <header>
          <span>顾客反馈</span>
          <h1>评价与口碑</h1>
        </header>

        <section>
          <article>
            <span>门店评分</span>
            <strong>
              ${page.reviewScore}
            </strong>
          </article>

          <article>
            <span>口碑值</span>
            <strong>
              ${page.wordOfMouthScore}
            </strong>
          </article>

          <article>
            <span>客流影响</span>
            <strong>
              ×${page.wordOfMouthFactor}
            </strong>
          </article>

          <article>
            <span>复购率</span>
            <strong>
              ${page.repeatRate}%
            </strong>
          </article>
        </section>

        <section>
          <h2>最近评价</h2>

          <p>
            好评信号
            ${page.positives}
          </p>

          <p>
            负面信号
            ${page.negatives}
          </p>

          <p>
            好评率
            ${page.positiveRate}%
          </p>
        </section>

        <section>
          <h2>主要反馈</h2>

          <p>
            最常见优点：
            ${
              page.topPositive
                ?.label ??
              "暂无"
            }
          </p>

          <p>
            最常见问题：
            ${
              page.topIssue
                ?.label ??
              "暂无"
            }
          </p>
        </section>

        <section>
          <h2>热门菜品讨论</h2>

          ${
            page.dishBuzz.length
              ? page.dishBuzz.map(
                  dish => `
                    <article>
                      <strong>
                        ${dish.dishId}
                      </strong>

                      <span>
                        ${dish.mentions}次讨论
                      </span>

                      <span>
                        正面
                        ${dish.positiveMentions}
                      </span>

                      <span>
                        负面
                        ${dish.negativeMentions}
                      </span>

                      <span>
                        平均品质
                        ${dish.averageQuality}
                      </span>
                    </article>
                  `
                ).join("")
              : "<p>暂无菜品讨论</p>"
          }
        </section>
      </section>
    `;
  }
}

export const reputationView =
  new ReputationView();

export {
  ReputationView
};
