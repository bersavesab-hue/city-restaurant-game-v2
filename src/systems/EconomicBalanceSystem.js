import {
  ECONOMIC_BASELINE
} from "../data/economicBaseline.js";

import {
  FINANCIAL_HEALTH_POLICY,
  CHANNEL_ECONOMY_POLICY,
  validateEconomicBalanceRules
} from "../data/economicBalanceRules.js";

import {
  SALES_CHANNELS_V1
} from "../data/salesChannels.v1.js";

import {
  MEMBER_LEVELS_V1
} from "../data/memberLevels.v1.js";

import {
  MARKETING_ACTIONS_V1
} from "../data/marketingActions.v1.js";

import {
  EQUIPMENT_V1
} from "../data/equipment.v1.js";

import {
  DISHES_V1
} from "../data/dishes.v1.js";

function ratio(
  value,
  income
) {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(income) ||
    income <= 0
  ) {
    return 0;
  }

  return Number(
    (
      value /
      income
    ).toFixed(4)
  );
}

class EconomicBalanceSystem {
  validateConfiguration() {
    validateEconomicBalanceRules();

    if (
      ECONOMIC_BASELINE.currency !==
        "CNY" ||
      ECONOMIC_BASELINE
        .nominalCurrencyScale !==
        1 ||
      ECONOMIC_BASELINE
        .sourcePolicy
        ?.strictNominalRmb !==
        true
    ) {
      throw new Error(
        "Economic baseline must use nominal CNY 1:1"
      );
    }

    for (
      const channel
      of SALES_CHANNELS_V1
    ) {
      if (
        channel
          .commissionRate >
        CHANNEL_ECONOMY_POLICY
          .maxCommissionRate
      ) {
        throw new Error(
          `Sales channel "${channel.id}" commission exceeds balance policy`
        );
      }

      const expected =
        CHANNEL_ECONOMY_POLICY
          .defaultPackagingCost[
            channel.id
          ];

      if (
        Number.isFinite(expected) &&
        channel
          .packagingCostPerOrder !==
        expected
      ) {
        throw new Error(
          `Sales channel "${channel.id}" packaging cost is off the nominal CNY policy`
        );
      }
    }

    for (
      const level
      of MEMBER_LEVELS_V1
    ) {
      if (
        level.discount < 0 ||
        level.discount > 20
      ) {
        throw new Error(
          `Member level "${level.id}" has invalid discount`
        );
      }
    }

    for (
      const action
      of MARKETING_ACTIONS_V1
    ) {
      if (
        !Number.isInteger(
          action.cost
        ) ||
        action.cost < 0
      ) {
        throw new Error(
          `Marketing action "${action.id}" has invalid cost`
        );
      }
    }

    for (
      const equipment
      of EQUIPMENT_V1
    ) {
      if (
        !Number.isFinite(
          equipment.purchaseCost
        ) ||
        equipment.purchaseCost < 0
      ) {
        throw new Error(
          `Equipment "${equipment.id}" has invalid purchaseCost`
        );
      }
    }

    for (
      const dish
      of DISHES_V1
    ) {
      if (
        !Number.isFinite(
          dish.basePrice
        ) ||
        dish.basePrice <= 0
      ) {
        throw new Error(
          `Dish "${dish.id}" has invalid nominal CNY price`
        );
      }
    }

    return true;
  }

  getCategoryExpenseMap(
    categories
  ) {
    return Object.fromEntries(
      (
        categories ??
        []
      ).map(
        item => [
          item.category,
          item.expense ?? 0
        ]
      )
    );
  }

  analyze({
    balance,
    summary,
    categories,
    periodDays
  }) {
    const income =
      Math.max(
        0,
        Number(
          summary?.income
        ) || 0
      );

    const expense =
      Math.max(
        0,
        Number(
          summary?.expense
        ) || 0
      );

    const profit =
      Number(
        summary?.profit
      ) ||
      income -
      expense;

    const safeDays =
      Math.max(
        1,
        Number(
          periodDays
        ) || 1
      );

    const categoryExpense =
      this.getCategoryExpenseMap(
        categories
      );

    const costRatios = {
      ingredient:
        ratio(
          categoryExpense
            .ingredient ?? 0,
          income
        ),
      salary:
        ratio(
          categoryExpense
            .salary ?? 0,
          income
        ),
      rent:
        ratio(
          categoryExpense
            .rent ?? 0,
          income
        ),
      utilities:
        ratio(
          categoryExpense
            .utilities ?? 0,
          income
        ),
      marketing:
        ratio(
          categoryExpense
            .marketing ?? 0,
          income
        ),
      channel:
        ratio(
          categoryExpense
            .channel ?? 0,
          income
        ),
      research:
        ratio(
          categoryExpense
            .research ?? 0,
          income
        )
    };

    const averageDailyExpense =
      expense /
      safeDays;

    const cashRunwayDays =
      averageDailyExpense > 0
        ? Number(
            (
              Math.max(
                0,
                Number(balance) || 0
              ) /
              averageDailyExpense
            ).toFixed(1)
          )
        : null;

    const operatingMargin =
      income > 0
        ? profit /
          income
        : (
            expense > 0
              ? -1
              : 0
          );

    const alerts = [];

    for (
      const [
        category,
        threshold
      ]
      of Object.entries(
        FINANCIAL_HEALTH_POLICY
          .costRatioWarning
      )
    ) {
      const current =
        costRatios[
          category
        ] ?? 0;

      if (
        income > 0 &&
        current > threshold
      ) {
        alerts.push({
          type:
            "cost_ratio",
          severity:
            "warning",
          category,
          current,
          threshold
        });
      }
    }

    if (
      operatingMargin <
      FINANCIAL_HEALTH_POLICY
        .targetOperatingMargin
        .warningBelow
    ) {
      alerts.push({
        type:
          "operating_loss",
        severity:
          "critical",
        current:
          operatingMargin,
        threshold:
          FINANCIAL_HEALTH_POLICY
            .targetOperatingMargin
            .warningBelow
      });
    } else if (
      operatingMargin <
      FINANCIAL_HEALTH_POLICY
        .targetOperatingMargin
        .watchBelow
    ) {
      alerts.push({
        type:
          "thin_margin",
        severity:
          "warning",
        current:
          operatingMargin,
        threshold:
          FINANCIAL_HEALTH_POLICY
            .targetOperatingMargin
            .watchBelow
      });
    }

    if (
      cashRunwayDays !== null &&
      cashRunwayDays <
        FINANCIAL_HEALTH_POLICY
          .cashRunwayDays
          .criticalBelow
    ) {
      alerts.push({
        type:
          "cash_runway",
        severity:
          "critical",
        current:
          cashRunwayDays,
        threshold:
          FINANCIAL_HEALTH_POLICY
            .cashRunwayDays
            .criticalBelow
      });
    } else if (
      cashRunwayDays !== null &&
      cashRunwayDays <
        FINANCIAL_HEALTH_POLICY
          .cashRunwayDays
          .warningBelow
    ) {
      alerts.push({
        type:
          "cash_runway",
        severity:
          "warning",
        current:
          cashRunwayDays,
        threshold:
          FINANCIAL_HEALTH_POLICY
            .cashRunwayDays
            .warningBelow
      });
    }

    let status =
      "healthy";

    if (
      alerts.some(
        item =>
          item.severity ===
          "critical"
      )
    ) {
      status =
        "critical";
    } else if (
      alerts.some(
        item =>
          item.severity ===
          "warning"
      )
    ) {
      status =
        "warning";
    } else if (
      operatingMargin <
      FINANCIAL_HEALTH_POLICY
        .targetOperatingMargin
        .healthyFrom
    ) {
      status =
        "watch";
    }

    return {
      status,
      operatingMargin:
        Number(
          (
            operatingMargin *
            100
          ).toFixed(1)
        ),
      averageDailyExpense:
        Number(
          averageDailyExpense
            .toFixed(2)
        ),
      cashRunwayDays,
      costRatios,
      alerts
    };
  }
}

export const economicBalanceSystem =
  new EconomicBalanceSystem();

export {
  EconomicBalanceSystem
};
