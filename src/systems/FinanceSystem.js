import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

const TRANSACTION_TYPE = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense"
});

const CATEGORY = Object.freeze({
  INITIAL_CAPITAL: "initial_capital",
  SALES: "sales",
  INGREDIENT: "ingredient",
  SALARY: "salary",
  RENT: "rent",
  UTILITIES: "utilities",
  EQUIPMENT: "equipment",
  DECORATION: "decoration",
  MARKETING: "marketing",
  TAX: "tax",
  REFUND: "refund",
  OTHER: "other"
});

function requirePositiveAmount(amount) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new RangeError(
      "Money amount must be a positive integer"
    );
  }
}

function requireRestaurant(restaurantId) {
  const restaurant =
    entitySystem.get(
      "restaurant",
      restaurantId
    );

  if (!restaurant) {
    throw new Error(
      `Restaurant "${restaurantId}" does not exist`
    );
  }

  return restaurant;
}

class FinanceSystem {
  findAccount(restaurantId) {
    return entitySystem
      .list("finance_account")
      .find(
        (account) =>
          account.restaurantId ===
          restaurantId
      );
  }

  requireAccount(restaurantId) {
    const account =
      this.findAccount(restaurantId);

    if (!account) {
      throw new Error(
        `Finance account for restaurant "${restaurantId}" does not exist`
      );
    }

    return account;
  }

  createAccount(
    restaurantId,
    initialBalance = 0
  ) {
    requireRestaurant(restaurantId);

    if (
      !Number.isInteger(initialBalance) ||
      initialBalance < 0
    ) {
      throw new RangeError(
        "Initial balance must be a non-negative integer"
      );
    }

    if (this.findAccount(restaurantId)) {
      throw new Error(
        `Restaurant "${restaurantId}" already has a finance account`
      );
    }

    const account =
      entitySystem.create(
        "finance_account",
        {
          restaurantId,
          balance: initialBalance,
          lifetimeIncome:
            initialBalance,
          lifetimeExpense: 0
        }
      );

    if (initialBalance > 0) {
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.INCOME,
        category:
          CATEGORY.INITIAL_CAPITAL,
        amount: initialBalance,
        balanceAfter:
          initialBalance,
        description:
          "初始资金"
      });
    }

    eventBus.emit(
      "finance:accountCreated",
      {
        restaurantId,
        account:
          structuredClone(account)
      }
    );

    return account;
  }

  getAccount(restaurantId) {
    return this.requireAccount(
      restaurantId
    );
  }

  getBalance(restaurantId) {
    return this.requireAccount(
      restaurantId
    ).balance;
  }

  income(
    restaurantId,
    amount,
    category = CATEGORY.OTHER,
    description = ""
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    const balanceAfter =
      account.balance + amount;

    const updated =
      entitySystem.update(
        "finance_account",
        account.id,
        {
          balance:
            balanceAfter,

          lifetimeIncome:
            account.lifetimeIncome +
            amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.INCOME,
        category,
        amount,
        balanceAfter,
        description
      });

    eventBus.emit(
      "finance:income",
      {
        restaurantId,
        amount,
        category,
        balance:
          updated.balance,
        transactionId:
          transaction.id
      }
    );

    return {
      account: updated,
      transaction
    };
  }

  expense(
    restaurantId,
    amount,
    category = CATEGORY.OTHER,
    description = ""
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    if (account.balance < amount) {
      throw new Error(
        `Insufficient funds: balance ${account.balance}, required ${amount}`
      );
    }

    const balanceAfter =
      account.balance - amount;

    const updated =
      entitySystem.update(
        "finance_account",
        account.id,
        {
          balance:
            balanceAfter,

          lifetimeExpense:
            account.lifetimeExpense +
            amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.EXPENSE,
        category,
        amount,
        balanceAfter,
        description
      });

    eventBus.emit(
      "finance:expense",
      {
        restaurantId,
        amount,
        category,
        balance:
          updated.balance,
        transactionId:
          transaction.id
      }
    );

    return {
      account: updated,
      transaction
    };
  }

  createTransaction({
    restaurantId,
    accountId,
    type,
    category,
    amount,
    balanceAfter,
    description
  }) {
    const time =
      gameState.getSection("time");

    return entitySystem.create(
      "finance_transaction",
      {
        restaurantId,
        accountId,
        type,
        category,
        amount,
        balanceAfter,
        description:
          String(description ?? ""),
        createdAt:
          time.totalMinutes,
        day:
          time.day,
        hour:
          time.hour,
        minute:
          time.minute
      }
    );
  }

  getTransactions(
    restaurantId,
    {
      type = null,
      category = null
    } = {}
  ) {
    requireRestaurant(restaurantId);

    return entitySystem
      .list(
        "finance_transaction"
      )
      .filter(
        (transaction) =>
          transaction.restaurantId ===
          restaurantId
      )
      .filter(
        (transaction) =>
          type === null ||
          transaction.type === type
      )
      .filter(
        (transaction) =>
          category === null ||
          transaction.category ===
            category
      )
      .sort(
        (a, b) =>
          a.createdAt -
          b.createdAt
      );
  }

  getSummary(restaurantId) {
    const account =
      this.requireAccount(
        restaurantId
      );

    return {
      restaurantId,
      balance:
        account.balance,

      lifetimeIncome:
        account.lifetimeIncome,

      lifetimeExpense:
        account.lifetimeExpense,

      lifetimeProfit:
        account.lifetimeIncome -
        account.lifetimeExpense,

      transactionCount:
        this.getTransactions(
          restaurantId
        ).length
    };
  }
}

export const financeSystem =
  new FinanceSystem();

export {
  FinanceSystem,
  TRANSACTION_TYPE as FINANCE_TRANSACTION_TYPE,
  CATEGORY as FINANCE_CATEGORY
};
