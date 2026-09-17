import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

const TRANSACTION_TYPE = Object.freeze({
  CAPITAL: "capital",
  INCOME: "income",
  EXPENSE: "expense",
  HOLD: "hold",
  RELEASE: "release",
  APPLY_HOLD: "apply_hold",
  REVERSAL: "reversal"
});

const CATEGORY = Object.freeze({
  INITIAL_CAPITAL: "initial_capital",
  SALES: "sales",
  INGREDIENT: "ingredient",
  SALARY: "salary",
  RENT: "rent",
  DEPOSIT: "deposit",
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

function requireRestaurant(id) {
  const restaurant =
    entitySystem.get("restaurant", id);

  if (!restaurant) {
    throw new Error(
      `Restaurant "${id}" does not exist`
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
          account.restaurantId === restaurantId
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
        "Initial balance must be non-negative"
      );
    }

    if (this.findAccount(restaurantId)) {
      throw new Error(
        "Finance account already exists"
      );
    }

    const account =
      entitySystem.create(
        "finance_account",
        {
          restaurantId,
          balance: initialBalance,

          capitalContributions:
            initialBalance,

          lifetimeIncome: 0,
          lifetimeExpense: 0,

          reservedDeposits: 0
        }
      );

    if (initialBalance > 0) {
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.CAPITAL,
        category:
          CATEGORY.INITIAL_CAPITAL,
        amount:
          initialBalance,
        balanceAfter:
          initialBalance,
        description:
          "初始资金"
      });
    }

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
            (account.lifetimeIncome ?? 0) +
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
            (account.lifetimeExpense ?? 0) +
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

    return {
      account: updated,
      transaction
    };
  }

  refundExpense(
    restaurantId,
    amount,
    category = CATEGORY.REFUND,
    description = "费用退款"
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    const lifetimeExpense =
      account.lifetimeExpense ?? 0;

    if (lifetimeExpense < amount) {
      throw new Error(
        "Refund exceeds recorded expense"
      );
    }

    const balanceAfter =
      account.balance + amount;

    const updated =
      entitySystem.update(
        "finance_account",
        account.id,
        {
          balance:
            balanceAfter,

          lifetimeExpense:
            lifetimeExpense -
            amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId:
          account.id,

        type:
          TRANSACTION_TYPE.REVERSAL,

        category,

        amount,

        balanceAfter,

        description
      });

    eventBus.emit(
      "finance:expenseRefunded",
      {
        restaurantId,
        amount,
        category,
        transactionId:
          transaction.id
      }
    );

    return {
      account: updated,
      transaction
    };
  }

  holdDeposit(
    restaurantId,
    amount,
    description = "租赁押金"
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    if (account.balance < amount) {
      throw new Error(
        "Insufficient funds for deposit"
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

          reservedDeposits:
            (account.reservedDeposits ?? 0) +
            amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.HOLD,
        category:
          CATEGORY.DEPOSIT,
        amount,
        balanceAfter,
        description
      });

    return {
      account: updated,
      transaction
    };
  }

  releaseDeposit(
    restaurantId,
    amount,
    description = "退还租赁押金"
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    const reserved =
      account.reservedDeposits ?? 0;

    if (reserved < amount) {
      throw new Error(
        "Reserved deposit is insufficient"
      );
    }

    const balanceAfter =
      account.balance + amount;

    const updated =
      entitySystem.update(
        "finance_account",
        account.id,
        {
          balance:
            balanceAfter,

          reservedDeposits:
            reserved - amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.RELEASE,
        category:
          CATEGORY.DEPOSIT,
        amount,
        balanceAfter,
        description
      });

    return {
      account: updated,
      transaction
    };
  }

  applyHeldDeposit(
    restaurantId,
    amount,
    category = CATEGORY.RENT,
    description = "押金抵扣费用"
  ) {
    requirePositiveAmount(amount);

    const account =
      this.requireAccount(
        restaurantId
      );

    const reserved =
      account.reservedDeposits ?? 0;

    if (reserved < amount) {
      throw new Error(
        "Reserved deposit is insufficient"
      );
    }

    const updated =
      entitySystem.update(
        "finance_account",
        account.id,
        {
          reservedDeposits:
            reserved - amount,

          lifetimeExpense:
            (account.lifetimeExpense ?? 0) +
            amount
        }
      );

    const transaction =
      this.createTransaction({
        restaurantId,
        accountId: account.id,
        type:
          TRANSACTION_TYPE.APPLY_HOLD,
        category,
        amount,
        balanceAfter:
          account.balance,
        description
      });

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
        (item) =>
          item.restaurantId ===
          restaurantId
      )
      .filter(
        (item) =>
          type === null ||
          item.type === type
      )
      .filter(
        (item) =>
          category === null ||
          item.category === category
      );
  }

  getSummary(restaurantId) {
    const account =
      this.requireAccount(
        restaurantId
      );

    const income =
      account.lifetimeIncome ?? 0;

    const expense =
      account.lifetimeExpense ?? 0;

    const reserved =
      account.reservedDeposits ?? 0;

    return {
      restaurantId,

      balance:
        account.balance,

      reservedDeposits:
        reserved,

      availableAssets:
        account.balance +
        reserved,

      capitalContributions:
        account.capitalContributions ?? 0,

      lifetimeIncome:
        income,

      lifetimeExpense:
        expense,

      lifetimeProfit:
        income - expense,

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
