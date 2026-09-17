import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { reviewInsightSystem } from "./ReviewInsightSystem.js";

class OperatingReportSystem {
  getRange(period = "day") {
    const currentDay =
      gameState.getSection("time").day;

    const endDay =
      Math.max(1, currentDay - 1);

    const length =
      period === "month"
        ? 30
        : period === "week"
          ? 7
          : 1;

    return {
      startDay:
        Math.max(
          1,
          endDay - length + 1
        ),
      endDay
    };
  }

  getSettlements(
    restaurantId,
    startDay,
    endDay
  ) {
    return entitySystem.filter(
      "daily_settlement",
      item =>
        item.restaurantId ===
          restaurantId &&
        item.day >= startDay &&
        item.day <= endDay
    );
  }

  summarizeFinance(records) {
    return records.reduce(
      (sum, item) => {
        sum.days += 1;
        sum.orders +=
          item.orders ?? 0;

        sum.revenue +=
          item.revenue ?? 0;

        sum.ingredientCost +=
          item.ingredientCost ?? 0;

        sum.payroll +=
          item.payrollDue ?? 0;

        sum.profit +=
          item.operatingProfit ?? 0;

        return sum;
      },
      {
        days: 0,
        orders: 0,
        revenue: 0,
        ingredientCost: 0,
        payroll: 0,
        profit: 0
      }
    );
  }

  getMenuContribution(
    restaurantId,
    startDay,
    endDay
  ) {
    const orders =
      entitySystem.filter(
        "customer_order",
        order =>
          order.restaurantId ===
            restaurantId &&
          order.day >= startDay &&
          order.day <= endDay
      );

    const map = new Map();

    for (const order of orders) {
      const orderRevenue =
        Math.max(
          1,
          order.totalRevenue ?? 0
        );

      for (
        const item
        of order.items ?? []
      ) {
        const current =
          map.get(
            item.menuItemId
          ) ?? {
            menuItemId:
              item.menuItemId,
            dishId:
              item.dishId,
            quantity: 0,
            revenue: 0,
            estimatedCost: 0,
            qualityTotal: 0,
            qualityCount: 0
          };

        current.quantity +=
          item.quantity ?? 0;

        current.revenue +=
          item.revenue ?? 0;

        current.estimatedCost +=
          (order.ingredientCost ?? 0) *
          (
            (item.revenue ?? 0) /
            orderRevenue
          );

        if (
          Number.isFinite(
            item.qualityScore
          )
        ) {
          current.qualityTotal +=
            item.qualityScore;

          current.qualityCount += 1;
        }

        map.set(
          item.menuItemId,
          current
        );
      }
    }

    return [...map.values()]
      .map(item => {
        const menuItem =
          menuSystem.get(
            item.menuItemId
          );

        const dish =
          dishCatalogSystem.get(
            item.dishId
          );

        const estimatedCost =
          Math.round(
            item.estimatedCost
          );

        const contributionProfit =
          item.revenue -
          estimatedCost;

        return {
          menuItemId:
            item.menuItemId,

          dishId:
            item.dishId,

          name:
            dish?.name ??
            item.dishId,

          price:
            menuItem.price,

          quantity:
            item.quantity,

          revenue:
            item.revenue,

          estimatedCost,

          contributionProfit,

          marginRate:
            item.revenue > 0
              ? Number(
                  (
                    contributionProfit /
                    item.revenue *
                    100
                  ).toFixed(1)
                )
              : 0,

          averageQuality:
            item.qualityCount > 0
              ? Math.round(
                  item.qualityTotal /
                  item.qualityCount
                )
              : 0
        };
      })
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      );
  }

  getAdvice(diagnosis, dishes) {
    const advice = [];

    const topIssue =
      diagnosis.topIssue?.id;

    if (
      topIssue === "queue_long"
    ) {
      advice.push(
        "高峰期排队明显，优先增加座位或提高翻台效率"
      );
    }

    if (
      topIssue ===
      "service_failed"
    ) {
      advice.push(
        "接待能力不足，检查服务员工数量与效率"
      );
    }

    if (
      topIssue === "quality_low"
    ) {
      advice.push(
        "菜品质量偏低，检查厨师技能、食材品质和新鲜度"
      );
    }

    if (
      topIssue === "price_high"
    ) {
      advice.push(
        "目标客群对价格敏感，检查菜单定价"
      );
    }

    const lowMargin =
      dishes.find(
        dish =>
          dish.quantity >= 3 &&
          dish.marginRate < 20
      );

    if (lowMargin) {
      advice.push(
        `${lowMargin.name}销量存在但毛利偏低，建议检查售价或配方成本`
      );
    }

    const weakDish =
      dishes.find(
        dish =>
          dish.quantity >= 3 &&
          dish.averageQuality > 0 &&
          dish.averageQuality < 55
      );

    if (weakDish) {
      advice.push(
        `${weakDish.name}出品质量偏低，可能正在拖累评价`
      );
    }

    return advice.slice(0, 5);
  }

  generate(
    restaurantId,
    period = "day"
  ) {
    const {
      startDay,
      endDay
    } = this.getRange(period);

    const settlements =
      this.getSettlements(
        restaurantId,
        startDay,
        endDay
      );

    const finance =
      this.summarizeFinance(
        settlements
      );

    const dishes =
      this.getMenuContribution(
        restaurantId,
        startDay,
        endDay
      );

    const diagnosis =
      reviewInsightSystem
        .getDiagnosis(
          restaurantId
        );

    return {
      restaurantId,
      period,
      startDay,
      endDay,

      finance: {
        ...finance,

        averageSpend:
          finance.orders > 0
            ? Math.round(
                finance.revenue /
                finance.orders
              )
            : 0,

        ingredientCostRate:
          finance.revenue > 0
            ? Number(
                (
                  finance.ingredientCost /
                  finance.revenue *
                  100
                ).toFixed(1)
              )
            : 0,

        profitMargin:
          finance.revenue > 0
            ? Number(
                (
                  finance.profit /
                  finance.revenue *
                  100
                ).toFixed(1)
              )
            : 0
      },

      dishes,

      topSellingDish:
        dishes[0] ?? null,

      diagnosis,

      advice:
        this.getAdvice(
          diagnosis,
          dishes
        )
    };
  }
}

export const operatingReportSystem =
  new OperatingReportSystem();

export {
  OperatingReportSystem
};
