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
  settle(restaurantId) {
    const time =
      gameState.getSection("time");

    const previousDay =
      Math.max(1, time.day - 1);

    const orders =
      entitySystem
        .list("customer_order")
        .filter(
          (order) =>
            order.restaurantId ===
              restaurantId &&
            order.day ===
              previousDay
        );

    const revenue =
      orders.reduce(
        (sum, order) =>
          sum + order.totalRevenue,
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

    const payroll =
      Math.round(
        monthlyPayroll / 30
      );

    if (payroll > 0) {
      const balance =
        financeSystem.getBalance(
          restaurantId
        );

      if (balance >= payroll) {
        financeSystem.expense(
          restaurantId,
          payroll,
          FINANCE_CATEGORY.SALARY,
          `第${previousDay}日员工工资`
        );
      }
    }

    const experience =
      Math.max(
        1,
        orders.length * 10 +
        Math.floor(
          revenue / 1000
        )
      );

    storeProgressSystem.addExperience(
      restaurantId,
      experience
    );

    const employees =
      employeeSystem.listByRestaurant(
        restaurantId
      );

    for (const employee of employees) {
      employeeSystem.addExperience(
        employee.id,
        Math.max(
          1,
          orders.length * 2
        )
      );

      employeeSystem.changeFatigue(
        employee.id,
        Math.min(
          20,
          orders.length
        )
      );
    }

    const settlement =
      entitySystem.create(
        "daily_settlement",
        {
          restaurantId,
          day:
            previousDay,
          orders:
            orders.length,
          revenue,
          ingredientCost,
          payroll,
          operatingProfit:
            revenue -
            ingredientCost -
            payroll,
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
}

export const dailySettlementSystem =
  new DailySettlementSystem();

export { DailySettlementSystem };
