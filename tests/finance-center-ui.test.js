import test from "node:test";
import assert from "node:assert/strict";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  financeCenterPageSystem
} from "../src/ui/pages/finance/FinanceCenterPageSystem.js";

import {
  FinanceCenterView
} from "../src/ui/pages/finance/FinanceCenterView.js";

test(
  "财务中心展示现金利润成本押金应付账款和资金流水",
  () => {
    const restaurant =
      restaurantSystem.create({
        name:
          "财务中心测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    financeSystem.income(
      restaurant.id,
      12000,
      "sales",
      "营业收入"
    );

    financeSystem.expense(
      restaurant.id,
      3000,
      "ingredient",
      "食材采购"
    );

    financeSystem.expense(
      restaurant.id,
      2000,
      "salary",
      "员工工资"
    );

    financeSystem.holdDeposit(
      restaurant.id,
      5000,
      "门店押金"
    );

    const page =
      financeCenterPageSystem
        .getPage(
          restaurant.id,
          {
            period:
              "month"
          }
        );

    assert.equal(
      page.account.balance,
      102000
    );

    assert.equal(
      page.account
        .reservedDeposits,
      5000
    );

    assert.equal(
      page.summary.income,
      12000
    );

    assert.equal(
      page.summary.expense,
      5000
    );

    assert.equal(
      page.summary.profit,
      7000
    );

    assert.equal(
      page.summary.netCashFlow,
      102000
    );

    const view =
      new FinanceCenterView();

    const html =
      view.renderMarkup(page);

    assert.match(
      html,
      /财务中心/
    );

    assert.match(
      html,
      /可用现金/
    );

    assert.match(
      html,
      /经营利润/
    );

    assert.match(
      html,
      /资金流水/
    );

    assert.match(
      html,
      /食材采购/
    );
  }
);
