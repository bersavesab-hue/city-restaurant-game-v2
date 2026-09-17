import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { employeeSystem } from "./EmployeeSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";
import { eventBus } from "../core/EventBus.js";

class DailySettlementSystem {
  find(
    restaurantId,
    day
  ) {
    return entitySystem
      .list(
        "daily_settlement"
      )
      .find(
        (item) =>
          item.restaurantId ===
            restaurantId &&
          item.day === day
      );
  }

  settle(
    restaurantId,
    day = null
  ) {
    const time =
      gameState.getSection(
        "time"
      );

    const targetDay =
      day ??
      Math.max(
        1,
        time.day - 1
      );

    const existing =
      this.find(
        restaurantId,
        targetDay
      );

    if (existing) {
      return existing;
    }

    const orders =
      entitySystem
        .list(
          "customer_order"
        )
        .filter(
          (order) =>
            order.restaurantId ===
              restaurantId &&
            order.day ===
              targetDay
        );

    const revenue =
      orders.reduce(
        (sum, order) =>
          sum +
          order.totalRevenue,
        0
      );

    const ingredientCost =
      orders.reduce(
        (sum, order) =>
          sum +
          order.ingredientCost,
        0
      );

    const monthlyPayroll =
      employeeSystem.getPayroll(
        restaurantId
      );

    const payrollDue =
      Math.round(
        monthlyPayroll / 30
      );

    let payrollPaid = 0;
    let unpaidPayroll = 0;

    if (payrollDue > 0) {
      const balance =
        financeSystem.getBalance(
          restaurantId
        );

      if (
        balance >= payrollDue
      ) {
        financeSystem.expense(
          restaurantId,
          payrollDue,
          FINANCE_CATEGORY.SALARY,
          `第${targetDay}日员工工资`
        );

        payrollPaid =
          payrollDue;
      } else {
        unpaidPayroll =
          payrollDue;

        entitySystem.create(
          "payroll_arrear",
          {
            restaurantId,
            day:
              targetDay,
            amount:
              payrollDue,
            status:
              "unpaid",
            createdAt:
              time.totalMinutes
          }
        );

        eventBus.emit(
          "payroll:arrearCreated",
          {
            restaurantId,
            day:
              targetDay,
            amount:
              payrollDue
          }
        );
      }
    }

    let experience = 0;

    if (orders.length > 0) {
      experience =
        orders.length * 10 +
        Math.floor(
          revenue / 1000
        );

      if (experience > 0) {
        storeProgressSystem
          .addExperience(
            restaurantId,
            experience
          );
      }

      const employees =
        employeeSystem
          .listByRestaurant(
            restaurantId
          );

      for (
        const employee
        of employees
      ) {
        employeeSystem
          .addExperience(
            employee.id,
            Math.max(
              1,
              orders.length * 2
            )
          );
      }

      const restaurant =
        entitySystem.get(
          "restaurant",
          restaurantId
        );

      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          totalOperatingDays:
            restaurant
              .totalOperatingDays +
            1
        }
      );
    }

    const settlement =
      entitySystem.create(
        "daily_settlement",
        {
          restaurantId,

          day:
            targetDay,

          orders:
            orders.length,

          revenue,

          ingredientCost,

          payroll:
            payrollDue,

          payrollDue,

          payrollPaid,

          unpaidPayroll,

          operatingProfit:
            revenue -
            ingredientCost -
            payrollDue,

          cashOperatingProfit:
            revenue -
            ingredientCost -
            payrollPaid,

          experienceGained:
            experience
        }
      );

    eventBus.emit(
      "settlement:completed",
      {
        settlement:
          structuredClone(
            settlement
          )
      }
    );

    return settlement;
  }

  settleThrough(
    restaurantId,
    throughDay
  ) {
    if (
      !Number.isInteger(
        throughDay
      ) ||
      throughDay < 1
    ) {
      return [];
    }

    const restaurant =
      entitySystem.get(
        "restaurant",
        restaurantId
      );

    if (!restaurant) {
      return [];
    }

    const createdDay =
      Math.floor(
        restaurant.createdAt /
        1440
      ) + 1;

    const settlements =
      entitySystem
        .list(
          "daily_settlement"
        )
        .filter(
          (item) =>
            item.restaurantId ===
            restaurantId
        );

    const lastDay =
      settlements.length > 0
        ? Math.max(
            ...settlements.map(
              (item) =>
                item.day
            )
          )
        : createdDay - 1;

    const results = [];

    for (
      let day =
        Math.max(
          createdDay,
          lastDay + 1
        );
      day <= throughDay;
      day += 1
    ) {
      results.push(
        this.settle(
          restaurantId,
          day
        )
      );
    }

    return results;
  }
}

export const dailySettlementSystem =
  new DailySettlementSystem();

export {
  DailySettlementSystem
};
