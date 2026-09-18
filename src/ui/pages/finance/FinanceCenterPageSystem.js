import {
  entitySystem
} from "../../../core/EntitySystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  economicBalanceSystem
} from "../../../systems/EconomicBalanceSystem.js";

const PERIOD_DAYS = {
  day: 1,
  week: 7,
  month: 30
};

const CATEGORY_NAMES = {
  initial_capital: "初始资金",
  sales: "营业收入",
  ingredient: "食材采购",
  salary: "员工工资",
  rent: "租金",
  deposit: "押金",
  utilities: "水电能耗",
  equipment: "设备",
  decoration: "装修",
  marketing: "营销",
  channel: "渠道费用",
  research: "研发费用",
  tax: "税费",
  refund: "退款",
  other: "其他"
};

function cashEffect(item) {
  if (
    (item.transactionType ?? item.type) === "capital" ||
    (item.transactionType ?? item.type) === "income" ||
    (item.transactionType ?? item.type) === "release" ||
    (item.transactionType ?? item.type) === "reversal"
  ) {
    return item.amount ?? 0;
  }

  if (
    (item.transactionType ?? item.type) === "expense" ||
    (item.transactionType ?? item.type) === "hold"
  ) {
    return -(item.amount ?? 0);
  }

  return 0;
}

function profitEffect(item) {
  if ((item.transactionType ?? item.type) === "income") {
    return item.amount ?? 0;
  }

  if (
    (item.transactionType ?? item.type) === "expense" ||
    (item.transactionType ?? item.type) === "apply_hold"
  ) {
    return -(item.amount ?? 0);
  }

  if ((item.transactionType ?? item.type) === "reversal") {
    return item.amount ?? 0;
  }

  return 0;
}

class FinanceCenterPageSystem {
  getRange(period = "month") {
    const days =
      PERIOD_DAYS[period];

    if (!days) {
      throw new Error(
        `Unsupported period: ${period}`
      );
    }

    const currentDay =
      gameState.getSection("time").day;

    return {
      startDay:
        Math.max(
          1,
          currentDay - days + 1
        ),
      endDay:
        currentDay
    };
  }

  getTransactions(
    restaurantId,
    period = "month"
  ) {
    const range =
      this.getRange(period);

    return financeSystem
      .getTransactions(
        restaurantId
      )
      .filter(
        item =>
          item.day >= range.startDay &&
          item.day <= range.endDay
      )
      .sort(
        (a, b) =>
          (b.createdAt ?? 0) -
          (a.createdAt ?? 0)
      );
  }

  getSummary(transactions) {
    let income = 0;
    let expense = 0;
    let cashIn = 0;
    let cashOut = 0;

    for (const item of transactions) {
      const cash =
        cashEffect(item);

      const profit =
        profitEffect(item);

      if (cash > 0) {
        cashIn += cash;
      }

      if (cash < 0) {
        cashOut +=
          Math.abs(cash);
      }

      if (profit > 0) {
        income += profit;
      }

      if (profit < 0) {
        expense +=
          Math.abs(profit);
      }
    }

    const profit =
      income - expense;

    return {
      income,
      expense,
      profit,
      profitMargin:
        income > 0
          ? Number(
              (
                profit /
                income *
                100
              ).toFixed(1)
            )
          : 0,

      cashIn,
      cashOut,

      netCashFlow:
        cashIn - cashOut,

      transactionCount:
        transactions.length
    };
  }

  getPayables(restaurantId) {
    const items =
      entitySystem.filter(
        "supplier_payable",
        item =>
          item.restaurantId ===
            restaurantId &&
          (
            item.status === "open" ||
            item.status === "overdue"
          )
      );

    return {
      count:
        items.length,

      amount:
        items.reduce(
          (sum, item) =>
            sum +
            (item.amount ?? 0),
          0
        ),

      overdueCount:
        items.filter(
          item =>
            item.status ===
            "overdue"
        ).length
    };
  }

  getCategories(transactions) {
    const map =
      new Map();

    for (const item of transactions) {
      const category =
        item.category ??
        "other";

      const current =
        map.get(category) ?? {
          category,
          name:
            CATEGORY_NAMES[
              category
            ] ?? category,
          income: 0,
          expense: 0,
          count: 0
        };

      const profit =
        profitEffect(item);

      current.count += 1;

      if (profit > 0) {
        current.income +=
          profit;
      }

      if (profit < 0) {
        current.expense +=
          Math.abs(profit);
      }

      map.set(
        category,
        current
      );
    }

    return [
      ...map.values()
    ];
  }

  getPage(
    restaurantId,
    {
      period = "month"
    } = {}
  ) {
    const account =
      financeSystem.getAccount(
        restaurantId
      );

    const transactions =
      this.getTransactions(
        restaurantId,
        period
      );

    const summary =
      this.getSummary(
        transactions
      );

    const categories =
      this.getCategories(
        transactions
      );

    const range =
      this.getRange(
        period
      );

    const health =
      economicBalanceSystem
        .analyze({
          balance:
            account.balance,
          summary,
          categories,
          periodDays:
            Math.max(
              1,
              range.endDay -
              range.startDay +
              1
            )
        });

    return {
      pageId:
        "finance",

      title:
        "财务中心",

      restaurantId,

      period,

      periods: [
        {
          id: "day",
          name: "日"
        },
        {
          id: "week",
          name: "周"
        },
        {
          id: "month",
          name: "月"
        }
      ],

      range,

      account: {
        balance:
          account.balance,

        reservedDeposits:
          account.reservedDeposits ??
          0,

        totalAssets:
          account.balance +
          (
            account.reservedDeposits ??
            0
          )
      },

      summary,

      health,

      payables:
        this.getPayables(
          restaurantId
        ),

      categories,

      transactions:
        transactions.map(
          item => ({
            ...item,

            categoryName:
              CATEGORY_NAMES[
                item.category
              ] ??
              item.category,

            cashEffect:
              cashEffect(item)
          })
        )
    };
  }
}

export const financeCenterPageSystem =
  new FinanceCenterPageSystem();

export {
  FinanceCenterPageSystem
};
