function money(value) {
  const number =
    Number(value ?? 0);

  return (
    (number < 0 ? "-" : "") +
    "¥" +
    Math.abs(
      Math.round(number)
    ).toLocaleString("zh-CN")
  );
}

class FinanceCenterView {
  renderMarkup(page) {
    return `
      <section class="finance-center">
        <header>
          <span>门店资金管理</span>
          <h1>财务中心</h1>
        </header>

        <section>
          <article>
            <span>可用现金</span>
            <strong>
              ${money(
                page.account.balance
              )}
            </strong>
          </article>

          <article>
            <span>押金占用</span>
            <strong>
              ${money(
                page.account
                  .reservedDeposits
              )}
            </strong>
          </article>

          <article>
            <span>应付账款</span>
            <strong>
              ${money(
                page.payables.amount
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>经营结果</h2>

          <p>
            营业收入
            ${money(
              page.summary.income
            )}
          </p>

          <p>
            经营支出
            ${money(
              page.summary.expense
            )}
          </p>

          <p>
            经营利润
            ${money(
              page.summary.profit
            )}
          </p>

          <p>
            利润率
            ${page.summary
              .profitMargin}%
          </p>
        </section>

        <section>
          <h2>现金流</h2>

          <p>
            流入
            ${money(
              page.summary.cashIn
            )}
          </p>

          <p>
            流出
            ${money(
              page.summary.cashOut
            )}
          </p>

          <p>
            净现金变化
            ${money(
              page.summary
                .netCashFlow
            )}
          </p>
        </section>

        <section>
          <h2>收支结构</h2>

          ${page.categories.map(
            item => `
              <article>
                <strong>
                  ${item.name}
                </strong>

                <span>
                  收入
                  ${money(
                    item.income
                  )}
                </span>

                <span>
                  支出
                  ${money(
                    item.expense
                  )}
                </span>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>资金流水</h2>

          ${page.transactions.map(
            item => `
              <article>
                <strong>
                  ${
                    item.description ||
                    item.categoryName
                  }
                </strong>

                <span>
                  ${money(
                    item.cashEffect
                  )}
                </span>
              </article>
            `
          ).join("")}
        </section>
      </section>
    `;
  }
}

export const financeCenterView =
  new FinanceCenterView();

export {
  FinanceCenterView
};
