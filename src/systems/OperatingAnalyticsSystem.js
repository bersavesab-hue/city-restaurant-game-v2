import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";

class OperatingAnalyticsSystem {
  getPeriodLength(period) {
    if (period === "month") {
      return 30;
    }

    if (period === "week") {
      return 7;
    }

    return 1;
  }

  getRanges(period = "week") {
    const length =
      this.getPeriodLength(period);

    const currentDay =
      gameState.getSection("time").day;

    const currentEnd =
      Math.max(
        1,
        currentDay - 1
      );

    const currentStart =
      Math.max(
        1,
        currentEnd -
        length +
        1
      );

    const previousEnd =
      currentStart - 1;

    const previousStart =
      Math.max(
        1,
        previousEnd -
        length +
        1
      );

    return {
      length,

      current: {
        startDay:
          currentStart,
        endDay:
          currentEnd
      },

      previous: {
        startDay:
          previousStart,
        endDay:
          previousEnd
      }
    };
  }

  summarizeRange(
    restaurantId,
    startDay,
    endDay
  ) {
    if (endDay < startDay) {
      return {
        orders: 0,
        revenue: 0,
        ingredientCost: 0,
        payroll: 0,
        profit: 0
      };
    }

    const records =
      entitySystem.filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >= startDay &&
          item.day <= endDay
      );

    return records.reduce(
      (sum, item) => {
        sum.orders +=
          item.orders ?? 0;

        sum.revenue +=
          item.revenue ?? 0;

        sum.ingredientCost +=
          item.ingredientCost ??
          0;

        sum.payroll +=
          item.payrollDue ?? 0;

        sum.profit +=
          item.operatingProfit ??
          0;

        return sum;
      },
      {
        orders: 0,
        revenue: 0,
        ingredientCost: 0,
        payroll: 0,
        profit: 0
      }
    );
  }

  change(current, previous) {
    if (previous === 0) {
      if (current === 0) {
        return 0;
      }

      return null;
    }

    return Number(
      (
        (
          current -
          previous
        ) /
        Math.abs(previous) *
        100
      ).toFixed(1)
    );
  }

  compare(
    restaurantId,
    period = "week"
  ) {
    const ranges =
      this.getRanges(period);

    const current =
      this.summarizeRange(
        restaurantId,
        ranges.current.startDay,
        ranges.current.endDay
      );

    const previous =
      this.summarizeRange(
        restaurantId,
        ranges.previous.startDay,
        ranges.previous.endDay
      );

    return {
      restaurantId,
      period,
      ranges,

      current,
      previous,

      changes: {
        orders:
          this.change(
            current.orders,
            previous.orders
          ),

        revenue:
          this.change(
            current.revenue,
            previous.revenue
          ),

        ingredientCost:
          this.change(
            current.ingredientCost,
            previous.ingredientCost
          ),

        payroll:
          this.change(
            current.payroll,
            previous.payroll
          ),

        profit:
          this.change(
            current.profit,
            previous.profit
          )
      }
    };
  }

  getTrend(
    restaurantId,
    days = 30
  ) {
    const currentDay =
      gameState.getSection("time").day;

    const endDay =
      Math.max(
        1,
        currentDay - 1
      );

    const startDay =
      Math.max(
        1,
        endDay -
        days +
        1
      );

    const records =
      entitySystem.filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >= startDay &&
          item.day <= endDay
      );

    const byDay =
      new Map(
        records.map(
          item => [
            item.day,
            item
          ]
        )
      );

    const result = [];

    for (
      let day = startDay;
      day <= endDay;
      day += 1
    ) {
      const item =
        byDay.get(day);

      result.push({
        day,

        orders:
          item?.orders ?? 0,

        revenue:
          item?.revenue ?? 0,

        profit:
          item
            ?.operatingProfit ??
          0
      });
    }

    return result;
  }

  getDishHealth(
    restaurantId,
    days = 7
  ) {
    const currentDay =
      gameState.getSection("time").day;

    const endDay =
      Math.max(
        1,
        currentDay - 1
      );

    const startDay =
      Math.max(
        1,
        endDay -
        days +
        1
      );

    const orders =
      entitySystem.filter(
        "customer_order",
        order =>
          order.restaurantId ===
            restaurantId &&
          order.day >= startDay &&
          order.day <= endDay
      );

    const stats =
      new Map();

    for (const order of orders) {
      const totalRevenue =
        Math.max(
          1,
          order.totalRevenue ??
          0
        );

      for (
        const item
        of order.items ?? []
      ) {
        const current =
          stats.get(
            item.menuItemId
          ) ?? {
            quantity: 0,
            revenue: 0,
            cost: 0,
            qualityTotal: 0,
            qualityCount: 0
          };

        current.quantity +=
          item.quantity ?? 0;

        current.revenue +=
          item.revenue ?? 0;

        current.cost +=
          (
            order.ingredientCost ??
            0
          ) *
          (
            (item.revenue ?? 0) /
            totalRevenue
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

        stats.set(
          item.menuItemId,
          current
        );
      }
    }

    const menu =
      menuSystem.listByRestaurant(
        restaurantId
      );

    return menu
      .map(item => {
        const record =
          stats.get(item.id) ?? {
            quantity: 0,
            revenue: 0,
            cost: 0,
            qualityTotal: 0,
            qualityCount: 0
          };

        const dish =
          dishCatalogSystem.get(
            item.dishId
          );

        const cost =
          Math.round(
            record.cost
          );

        const profit =
          record.revenue -
          cost;

        const marginRate =
          record.revenue > 0
            ? Number(
                (
                  profit /
                  record.revenue *
                  100
                ).toFixed(1)
              )
            : 0;

        const warnings = [];

        if (
          item.active &&
          record.quantity === 0
        ) {
          warnings.push(
            "no_sales"
          );
        }

        if (
          record.quantity > 0 &&
          record.quantity <= 2
        ) {
          warnings.push(
            "slow_moving"
          );
        }

        if (
          record.revenue > 0 &&
          marginRate < 20
        ) {
          warnings.push(
            "low_margin"
          );
        }

        if (profit < 0) {
          warnings.push(
            "loss_making"
          );
        }

        const averageQuality =
          record.qualityCount > 0
            ? Math.round(
                record.qualityTotal /
                record.qualityCount
              )
            : 0;

        if (
          averageQuality > 0 &&
          averageQuality < 55
        ) {
          warnings.push(
            "quality_problem"
          );
        }

        return {
          menuItemId:
            item.id,

          dishId:
            item.dishId,

          name:
            dish?.name ??
            item.dishId,

          active:
            item.active,

          quantity:
            record.quantity,

          revenue:
            record.revenue,

          estimatedCost:
            cost,

          profit,

          marginRate,

          averageQuality,

          warnings
        };
      })
      .sort(
        (a, b) =>
          b.revenue -
          a.revenue
      );
  }

  getRankings(
    restaurantId,
    days = 7
  ) {
    const dishes =
      this.getDishHealth(
        restaurantId,
        days
      );

    return {
      bySales:
        [...dishes]
          .sort(
            (a, b) =>
              b.quantity -
              a.quantity
          ),

      byRevenue:
        [...dishes]
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          ),

      byProfit:
        [...dishes]
          .sort(
            (a, b) =>
              b.profit -
              a.profit
          ),

      warnings:
        dishes.filter(
          item =>
            item.warnings.length >
            0
        )
    };
  }
}

export const operatingAnalyticsSystem =
  new OperatingAnalyticsSystem();

export {
  OperatingAnalyticsSystem
};
