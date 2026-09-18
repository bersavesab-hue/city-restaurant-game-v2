import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem
} from "./FinanceSystem.js";

import {
  inventorySystem
} from "./InventorySystem.js";

import {
  menuEngineeringSystem
} from "./MenuEngineeringSystem.js";

import {
  serviceCapacitySystem
} from "./ServiceCapacitySystem.js";

import {
  workforceCapacitySystem
} from "./WorkforceCapacitySystem.js";


function safe(
  fn,
  fallback
) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}


function severityScore(
  severity
) {
  return {
    critical: 400,
    high: 300,
    medium: 200,
    low: 100
  }[severity] ?? 0;
}


class OperatingCommandCenterSystem {
  getDay() {
    return gameState
      .getSection("time")
      .day;
  }


  getTodayOrders(
    restaurantId
  ) {
    const day =
      this.getDay();

    return entitySystem.filter(
      "customer_order",
      order =>
        order.restaurantId ===
          restaurantId &&
        order.status ===
          "completed" &&
        order.day === day
    );
  }


  getTodaySales(
    restaurantId
  ) {
    const orders =
      this.getTodayOrders(
        restaurantId
      );

    let orderCount = 0;
    let revenue = 0;
    let profit = 0;
    let portions = 0;

    const channels = {};

    for (
      const order
      of orders
    ) {
      const count =
        order.aggregate
          ? (
              order.orderCount ??
              1
            )
          : 1;

      const realizedRevenue =
        order.channelNetRevenue ??
        order.paidAmount ??
        order.totalRevenue ??
        0;

      const realizedProfit =
        Number.isFinite(
          order.grossProfit
        )
          ? order.grossProfit
          : (
              realizedRevenue -
              (
                order
                  .ingredientCost ??
                0
              ) -
              (
                order.channelFees ??
                0
              )
            );

      orderCount +=
        count;

      revenue +=
        realizedRevenue;

      profit +=
        realizedProfit;

      portions +=
        (
          order.items ??
          []
        ).reduce(
          (sum, item) =>
            sum +
            (
              item.quantity ??
              0
            ),
          0
        );

      const channelId =
        order.channelId ??
        "dine_in";

      if (!channels[channelId]) {
        channels[channelId] = {
          channelId,
          orders: 0,
          revenue: 0
        };
      }

      channels[
        channelId
      ].orders +=
        count;

      channels[
        channelId
      ].revenue +=
        realizedRevenue;
    }

    return {
      orderCount,
      revenue,
      profit,
      portions,

      averageOrderValue:
        orderCount > 0
          ? Math.round(
              revenue /
              orderCount
            )
          : 0,

      channels:
        Object.values(
          channels
        ).sort(
          (a, b) =>
            b.revenue -
            a.revenue
        )
    };
  }


  getTodayCapacity(
    restaurantId
  ) {
    const day =
      this.getDay();

    const records =
      entitySystem.filter(
        "service_capacity_record",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day === day
      );

    const result = {
      arrivals: 0,
      served: 0,
      waiting: 0,
      abandoned: 0,
      lostRevenue: 0,
      windows: 0
    };

    for (
      const row
      of records
    ) {
      result.arrivals +=
        row.arrivals ?? 0;

      result.served +=
        row.servedGuests ?? 0;

      result.waiting +=
        row.waitingGuests ?? 0;

      result.abandoned +=
        row.abandonedGuests ?? 0;

      result.lostRevenue +=
        row.lostRevenue ?? 0;

      result.windows += 1;
    }

    return {
      ...result,

      serviceRate:
        result.arrivals > 0
          ? Number(
              (
                result.served /
                result.arrivals *
                100
              ).toFixed(1)
            )
          : 100,

      abandonmentRate:
        result.arrivals > 0
          ? Number(
              (
                result.abandoned /
                result.arrivals *
                100
              ).toFixed(1)
            )
          : 0
    };
  }


  getPreviousDaySummary(
    restaurantId
  ) {
    const currentDay =
      this.getDay();


    const settlements =
      entitySystem.filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day <
            currentDay
      );


    if (
      settlements.length ===
      0
    ) {
      return null;
    }


    const latest =
      [...settlements]
        .sort(
          (a, b) =>
            b.day -
            a.day
        )[0];


    return {
      day:
        latest.day,

      orders:
        latest.orders ?? 0,

      revenue:
        latest.revenue ?? 0,

      ingredientCost:
        latest.ingredientCost ?? 0,

      payroll:
        latest.payrollDue ??
        latest.payroll ??
        0,

      operatingProfit:
        latest.operatingProfit ?? 0,

      cashOperatingProfit:
        latest.cashOperatingProfit ??
        latest.operatingProfit ??
        0,

      experienceGained:
        latest.experienceGained ?? 0
    };
  }

  getInventoryRisk(
    restaurantId
  ) {
    const summary =
      safe(
        () =>
          inventorySystem
            .getSummary(
              restaurantId
            ),
        []
      );

    const lowStock =
      summary.filter(
        item =>
          item.usableQuantity >
            0 &&
          item.usableQuantity <=
            5
      );

    const outOfStock =
      summary.filter(
        item =>
          item.usableQuantity <=
            0
      );

    const spoiled =
      summary.filter(
        item =>
          item.spoiledQuantity >
            0
      );

    return {
      ingredientCount:
        summary.length,

      lowStockCount:
        lowStock.length,

      outOfStockCount:
        outOfStock.length,

      spoiledCount:
        spoiled.length,

      lowStock,
      outOfStock,
      spoiled
    };
  }


  buildPriorities({
    sales,
    finance,
    capacity,
    inventory,
    workforce,
    menu,
    restaurant
  }) {
    const priorities = [];

    const push = (
      id,
      severity,
      title,
      description,
      target
    ) => {
      priorities.push({
        id,
        severity,
        title,
        description,
        target
      });
    };


    if (
      finance.balance <
      10000
    ) {
      push(
        "cash_low",
        "high",
        "现金余额偏低",
        `当前可用现金仅 ${finance.balance}`,
        "finance"
      );
    }


    if (
      sales.orderCount > 0 &&
      sales.profit < 0
    ) {
      push(
        "negative_profit",
        "critical",
        "今天正在亏损",
        `今日利润 ${sales.profit}`,
        "analytics"
      );
    }


    if (
      capacity
        .abandonmentRate >=
      15
    ) {
      push(
        "queue_loss",
        "high",
        "排队流失严重",
        `弃单率 ${capacity.abandonmentRate}%，损失营业额 ${capacity.lostRevenue}`,
        "capacity"
      );
    } else if (
      capacity
        .abandonmentRate >=
      5
    ) {
      push(
        "queue_pressure",
        "medium",
        "高峰接待压力较大",
        `今日弃单率 ${capacity.abandonmentRate}%`,
        "capacity"
      );
    }


    if (
      inventory
        .outOfStockCount >
      0
    ) {
      push(
        "stockout",
        "critical",
        "存在缺货食材",
        `${inventory.outOfStockCount}种食材已经断货`,
        "supply"
      );
    } else if (
      inventory
        .lowStockCount >
      0
    ) {
      push(
        "low_stock",
        "high",
        "库存即将不足",
        `${inventory.lowStockCount}种食材库存偏低`,
        "supply"
      );
    }


    if (
      inventory
        .spoiledCount >
      0
    ) {
      push(
        "spoilage",
        "medium",
        "存在食材损耗",
        `${inventory.spoiledCount}种食材存在过期损耗`,
        "supply"
      );
    }


    const absent =
      workforce
        .absentEmployees
        ?.length ??
      0;

    const exhausted =
      workforce
        .exhaustedEmployees
        ?.length ??
      0;

    if (
      absent +
      exhausted >
      0
    ) {
      push(
        "staff_shortage",
        "high",
        "员工产能不足",
        `缺勤${absent}人，疲劳停工${exhausted}人`,
        "employees"
      );
    }


    if (
      menu.counts?.dog >
      0
    ) {
      push(
        "dog_dishes",
        "medium",
        "有低效菜品",
        `${menu.counts.dog}道菜销量和贡献都偏低`,
        "menu-optimization"
      );
    }


    if (
      menu.counts?.puzzle >
      0
    ) {
      push(
        "puzzle_dishes",
        "low",
        "高利润菜卖得不够",
        `${menu.counts.puzzle}道高贡献菜销量不足`,
        "menu-optimization"
      );
    }


    const reviewScore =
      restaurant.reviewScore ??
      3;

    if (
      reviewScore <
      3.5
    ) {
      push(
        "reviews",
        "high",
        "顾客口碑偏弱",
        `当前评价 ${reviewScore.toFixed(1)} / 5`,
        "reputation"
      );
    }


    if (
      sales.orderCount === 0
    ) {
      push(
        "no_sales",
        "medium",
        "今天还没有成交",
        "检查营业状态、客流、菜单和库存",
        "operations"
      );
    }


    priorities.sort(
      (a, b) =>
        severityScore(
          b.severity
        ) -
        severityScore(
          a.severity
        )
    );

    return priorities
      .slice(
        0,
        5
      );
  }


  getDashboard(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const sales =
      this.getTodaySales(
        restaurantId
      );

    const finance =
      safe(
        () =>
          financeSystem
            .getSummary(
              restaurantId
            ),
        {
          balance: 0,
          lifetimeIncome: 0,
          lifetimeExpense: 0,
          lifetimeProfit: 0
        }
      );

    const capacity =
      this.getTodayCapacity(
        restaurantId
      );

    const inventory =
      this.getInventoryRisk(
        restaurantId
      );


    const previousDay =
      this.getPreviousDaySummary(
        restaurantId
      );

    const workforce =
      safe(
        () =>
          workforceCapacitySystem
            .getCapacity(
              restaurantId
            ),
        {
          availableEmployees: 0,
          absentEmployees: [],
          exhaustedEmployees: [],
          kitchenGuests: null,
          serviceGuests: null,
          checkoutGuests: null
        }
      );

    const menu =
      safe(
        () =>
          menuEngineeringSystem
            .analyze(
              restaurantId
            ),
        {
          counts: {
            star: 0,
            cash_cow: 0,
            puzzle: 0,
            dog: 0
          },

          dishes: []
        }
      );

    const storeCapacity =
      safe(
        () =>
          serviceCapacitySystem
            .getHourlyCapacity(
              restaurantId
            ),
        null
      );

    const priorities =
      this.buildPriorities({
        sales,
        finance,
        capacity,
        inventory,
        workforce,
        menu,
        restaurant
      });

    return {
      restaurantId,

      day:
        this.getDay(),

      restaurant: {
        name:
          restaurant.name,

        level:
          restaurant.level ?? 1,

        reputation:
          restaurant.reputation ?? 0,

        reviewScore:
          restaurant.reviewScore ?? 3,

        repeatRate:
          restaurant.repeatRate ?? 0
      },

      sales,
      finance,
      previousDay,
      capacity,
      inventory,
      workforce,
      menu,
      storeCapacity,
      priorities
    };
  }
}


export const operatingCommandCenterSystem =
  new OperatingCommandCenterSystem();

export {
  OperatingCommandCenterSystem
};
