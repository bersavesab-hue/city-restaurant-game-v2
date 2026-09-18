import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "../src/systems/FinanceSystem.js";

import {
  economicBalanceSystem
} from "../src/systems/EconomicBalanceSystem.js";

import {
  financeCenterPageSystem
} from "../src/ui/pages/finance/FinanceCenterPageSystem.js";

import {
  FinanceCenterView
} from "../src/ui/pages/finance/FinanceCenterView.js";

test(
  "经济健康分析识别现金跑道与成本占比风险",
  () => {
    const result =
      economicBalanceSystem
        .analyze({
          balance: 5000,
          periodDays: 30,
          summary: {
            income: 10000,
            expense: 8000,
            profit: 2000
          },
          categories: [
            {
              category: "ingredient",
              expense: 3000
            },
            {
              category: "salary",
              expense: 2500
            },
            {
              category: "rent",
              expense: 1500
            },
            {
              category: "channel",
              expense: 500
            },
            {
              category: "utilities",
              expense: 500
            }
          ]
        });

    assert.equal(
      result.status,
      "warning"
    );

    assert.equal(
      result.costRatios
        .ingredient,
      0.3
    );

    assert.equal(
      result.costRatios
        .salary,
      0.25
    );

    assert.equal(
      result.cashRunwayDays,
      18.8
    );
  }
);

test(
  "财务中心按渠道与研发分类并展示经营健康",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "经济平衡测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    financeSystem.income(
      restaurant.id,
      10000,
      FINANCE_CATEGORY.SALES,
      "测试营业收入"
    );

    financeSystem.expense(
      restaurant.id,
      3000,
      FINANCE_CATEGORY.INGREDIENT,
      "测试食材"
    );

    financeSystem.expense(
      restaurant.id,
      2000,
      FINANCE_CATEGORY.SALARY,
      "测试工资"
    );

    financeSystem.expense(
      restaurant.id,
      500,
      FINANCE_CATEGORY.CHANNEL,
      "测试渠道"
    );

    financeSystem.expense(
      restaurant.id,
      500,
      FINANCE_CATEGORY.RESEARCH,
      "测试研发"
    );

    const page =
      financeCenterPageSystem
        .getPage(
          restaurant.id,
          {
            period: "month"
          }
        );

    const byCategory =
      Object.fromEntries(
        page.categories.map(
          item => [
            item.category,
            item
          ]
        )
      );

    assert.equal(
      byCategory.channel
        .expense,
      500
    );

    assert.equal(
      byCategory.research
        .expense,
      500
    );

    assert.equal(
      page.health
        .costRatios
        .ingredient,
      0.3
    );

    assert.equal(
      page.health
        .costRatios
        .channel,
      0.05
    );

    const html =
      new FinanceCenterView()
        .renderMarkup(
          page
        );

    assert.match(
      html,
      /经营健康/
    );

    assert.match(
      html,
      /现金跑道/
    );

    assert.match(
      html,
      /渠道费用率/
    );
  }
);
