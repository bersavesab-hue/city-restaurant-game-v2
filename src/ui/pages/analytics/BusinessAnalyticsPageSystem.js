import { entitySystem } from "../../../core/EntitySystem.js";

import { restaurantSystem } from "../../../systems/RestaurantSystem.js";
import { operatingAnalyticsSystem } from "../../../systems/OperatingAnalyticsSystem.js";
import { operatingReportSystem } from "../../../systems/OperatingReportSystem.js";
import { inventorySystem } from "../../../systems/InventorySystem.js";
import { procurementSystem } from "../../../systems/ProcurementSystem.js";
import { customerSegmentSystem } from "../../../systems/CustomerSegmentSystem.js";

const PERIODS = Object.freeze([
  {
    id: "day",
    name: "日",
    trendDays: 7
  },
  {
    id: "week",
    name: "周",
    trendDays: 30
  },
  {
    id: "month",
    name: "月",
    trendDays: 90
  }
]);

function average(
  values,
  fallback = 0
) {
  if (values.length === 0) {
    return fallback;
  }

  return Number(
    (
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      values.length
    ).toFixed(1)
  );
}

class BusinessAnalyticsPageSystem {
  requirePeriod(period) {
    const found =
      PERIODS.find(
        item =>
          item.id === period
      );

    if (!found) {
      throw new Error(
        `Unsupported analytics period "${period}"`
      );
    }

    return found;
  }

  getEmployeeSummary(
    restaurantId
  ) {
    const employees =
      entitySystem
        .filter(
          "employee",
          employee =>
            employee.restaurantId ===
            restaurantId &&
            employee.status !==
            "fired"
        );

    const highFatigue =
      employees.filter(
        employee =>
          (employee.fatigue ?? 0) >=
          75
      ).length;

    const lowLoyalty =
      employees.filter(
        employee =>
          (employee.loyalty ?? 50) <
          40
      ).length;

    const turnoverWarning =
      employees.filter(
        employee =>
          [
            "high",
            "critical"
          ].includes(
            employee
              .turnoverRiskLevel
          )
      ).length;

    return {
      total:
        employees.length,

      averageFatigue:
        average(
          employees.map(
            employee =>
              employee.fatigue ?? 0
          )
        ),

      averageMood:
        average(
          employees.map(
            employee =>
              employee.mood ?? 70
          )
        ),

      averageLoyalty:
        average(
          employees.map(
            employee =>
              employee.loyalty ?? 50
          )
        ),

      highFatigue,
      lowLoyalty,
      turnoverWarning,

      salaryArrears:
        employees.reduce(
          (sum, employee) =>
            sum +
            (
              employee
                .salaryArrears ??
              0
            ),
          0
        )
    };
  }

  getSupplySummary(
    restaurantId
  ) {
    const inventory =
      inventorySystem
        .getSummary(
          restaurantId
        );

    const orders =
      procurementSystem
        .listByRestaurant(
          restaurantId
        );

    const payables =
      entitySystem
        .filter(
          "supplier_payable",
          payable =>
            payable.restaurantId ===
            restaurantId
        );

    return {
      ingredientKinds:
        inventory.length,

      usableQuantity:
        inventory.reduce(
          (sum, item) =>
            sum +
            (
              item.usableQuantity ??
              0
            ),
          0
        ),

      spoiledQuantity:
        inventory.reduce(
          (sum, item) =>
            sum +
            (
              item.spoiledQuantity ??
              0
            ),
          0
        ),

      pendingOrders:
        orders.filter(
          order =>
            order.status ===
            "pending"
        ).length,

      pendingOrderValue:
        orders
          .filter(
            order =>
              order.status ===
              "pending"
          )
          .reduce(
            (sum, order) =>
              sum +
              (
                order.totalPrice ??
                0
              ),
            0
          ),

      openPayables:
        payables.filter(
          payable =>
            [
              "open",
              "overdue"
            ].includes(
              payable.status
            )
        ).length,

      openPayablesAmount:
        payables
          .filter(
            payable =>
              [
                "open",
                "overdue"
              ].includes(
                payable.status
              )
          )
          .reduce(
            (sum, payable) =>
              sum +
              (
                payable.amount ??
                0
              ),
            0
          ),

      overduePayables:
        payables.filter(
          payable =>
            payable.status ===
            "overdue"
        ).length,

      overdueAmount:
        payables
          .filter(
            payable =>
              payable.status ===
              "overdue"
          )
          .reduce(
            (sum, payable) =>
              sum +
              (
                payable.amount ??
                0
              ),
            0
          )
    };
  }

  getCausalityView(
    causality,
    finance
  ) {
    const segments =
      (
        causality
          ?.segmentImpact ??
        []
      ).map(
        item => {
          const segment =
            customerSegmentSystem
              .get(
                item.segmentId
              );

          return {
            ...item,

            segmentName:
              segment?.name ??
              item.segmentId
          };
        }
      );

    return {
      summary: {
        topCause:
          causality?.topCause ??
          null,

        averageSatisfaction:
          causality
            ?.averageSatisfaction ??
          0,

        averageWaitMinutes:
          causality
            ?.averageWaitMinutes ??
          0,

        serviceRate:
          causality
            ?.serviceRate ??
          0,

        revenueChange:
          finance
            .revenueChange,

        profitChange:
          finance
            .profitChange,

        orderChange:
          finance
            .orderChange
      },

      segments,

      latest:
        causality?.latest ??
        null,

      causes:
        causality?.causes ??
        []
    };
  }


  buildAlerts({
    finance,
    dishes,
    employees,
    supply
  }) {
    const alerts = [];

    if (
      finance.revenue > 0 &&
      finance.profit < 0
    ) {
      alerts.push({
        id: "operating_loss",
        level: "critical",
        title: "经营亏损",
        message:
          `本期营收 ${finance.revenue}，经营利润 ${finance.profit}`
      });
    }

    if (
      finance.ingredientCostRate >
      40
    ) {
      alerts.push({
        id: "ingredient_cost_high",
        level: "warning",
        title: "食材成本偏高",
        message:
          `食材成本率已达到 ${finance.ingredientCostRate}%`
      });
    }

    const dishWarnings =
      dishes.filter(
        dish =>
          dish.warnings.length >
          0
      );

    if (
      dishWarnings.length >
      0
    ) {
      alerts.push({
        id: "dish_health",
        level: "warning",
        title: "菜品需要调整",
        message:
          `${dishWarnings.length} 道菜存在滞销、低毛利或品质问题`
      });
    }

    if (
      employees.highFatigue >
      0
    ) {
      alerts.push({
        id: "employee_fatigue",
        level: "warning",
        title: "员工疲劳",
        message:
          `${employees.highFatigue} 名员工处于高疲劳状态`
      });
    }

    if (
      employees.turnoverWarning >
      0
    ) {
      alerts.push({
        id: "employee_turnover",
        level: "critical",
        title: "离职风险",
        message:
          `${employees.turnoverWarning} 名员工存在较高离职风险`
      });
    }

    if (
      supply.spoiledQuantity >
      0
    ) {
      alerts.push({
        id: "inventory_spoilage",
        level: "warning",
        title: "库存损耗",
        message:
          `当前记录到 ${supply.spoiledQuantity} 单位损耗库存`
      });
    }

    if (
      supply.overduePayables >
      0
    ) {
      alerts.push({
        id: "supplier_overdue",
        level: "critical",
        title: "供应商账款逾期",
        message:
          `${supply.overduePayables} 笔账款逾期，共 ${supply.overdueAmount}`
      });
    }

    if (
      finance.revenue === 0
    ) {
      alerts.push({
        id: "no_revenue",
        level: "info",
        title: "本期暂无营业收入",
        message:
          "当前统计周期尚未产生有效营业数据"
      });
    }

    return alerts;
  }

  buildDecisions(
    report,
    rankings,
    employees,
    supply
  ) {
    const decisions = [];

    for (
      const advice
      of report.advice ?? []
    ) {
      decisions.push({
        source: "operations",
        text: advice
      });
    }

    const weakDish =
      rankings.warnings?.[0];

    if (weakDish) {
      decisions.push({
        source: "dish",
        text:
          `${weakDish.name}存在经营异常，建议检查售价、成本和出品`
      });
    }

    if (
      employees.highFatigue >
      0
    ) {
      decisions.push({
        source: "employee",
        text:
          "员工疲劳偏高，建议检查排班、高峰时段人手和休息安排"
      });
    }

    if (
      employees.turnoverWarning >
      0
    ) {
      decisions.push({
        source: "employee",
        text:
          "存在高离职风险员工，优先检查工资满意度、忠诚度和疲劳"
      });
    }

    if (
      supply.pendingOrders >
      0
    ) {
      decisions.push({
        source: "supply",
        text:
          `当前有 ${supply.pendingOrders} 笔采购在途，调整菜单前应确认库存到货`
      });
    }

    if (
      supply.overduePayables >
      0
    ) {
      decisions.push({
        source: "finance",
        text:
          "供应商账款已经逾期，应优先处理以避免关系下降"
      });
    }

    return decisions
      .filter(
        (
          item,
          index,
          array
        ) =>
          array.findIndex(
            other =>
              other.text ===
              item.text
          ) === index
      )
      .slice(0, 6);
  }

  getPage(
    restaurantId,
    {
      period = "week"
    } = {}
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const periodRule =
      this.requirePeriod(
        period
      );

    const comparison =
      operatingAnalyticsSystem
        .compare(
          restaurantId,
          period
        );

    const report =
      operatingReportSystem
        .generate(
          restaurantId,
          period
        );

    const trend =
      operatingAnalyticsSystem
        .getTrend(
          restaurantId,
          periodRule.trendDays
        );

    const rankings =
      operatingAnalyticsSystem
        .getRankings(
          restaurantId,
          periodRule.trendDays
        );

    const employees =
      this.getEmployeeSummary(
        restaurantId
      );

    const supply =
      this.getSupplySummary(
        restaurantId
      );

    const finance = {
      ...report.finance,

      revenueChange:
        comparison
          .changes
          .revenue,

      profitChange:
        comparison
          .changes
          .profit,

      orderChange:
        comparison
          .changes
          .orders
    };

    const alerts =
      this.buildAlerts({
        finance,
        dishes:
          rankings.byRevenue,
        employees,
        supply
      });

    const decisions =
      this.buildDecisions(
        report,
        rankings,
        employees,
        supply
      );

    return {
      pageId:
        "analytics",

      title:
        "经营数据",

      restaurantId,

      period,

      periods:
        PERIODS.map(
          item => ({
            id: item.id,
            name: item.name
          })
        ),

      range: {
        startDay:
          report.startDay,

        endDay:
          report.endDay
      },

      finance,

      comparison,

      trend,

      dishes: {
        bySales:
          rankings.bySales,

        byRevenue:
          rankings.byRevenue,

        byProfit:
          rankings.byProfit,

        warnings:
          rankings.warnings,

        topSelling:
          rankings.bySales[0] ??
          null,

        topRevenue:
          rankings.byRevenue[0] ??
          null,

        topProfit:
          rankings.byProfit[0] ??
          null
      },

      employees,
      supply,
      diagnosis:
        report.diagnosis,

      causality:
        this.getCausalityView(
          report.causality,
          finance
        ),

      alerts,
      decisions
    };
  }
}

export const businessAnalyticsPageSystem =
  new BusinessAnalyticsPageSystem();

export {
  BusinessAnalyticsPageSystem,
  PERIODS as BUSINESS_ANALYTICS_PERIODS
};
