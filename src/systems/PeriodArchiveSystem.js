import { entitySystem } from "../core/EntitySystem.js";

const MONTH_DAYS = 30;
const MONTHS_PER_YEAR = 12;
const YEAR_DAYS =
  MONTH_DAYS * MONTHS_PER_YEAR;

class PeriodArchiveSystem {
  getMonthIndex(day) {
    return Math.floor(
      (day - 1) / MONTH_DAYS
    ) + 1;
  }

  getYearIndexFromMonth(month) {
    return Math.floor(
      (month - 1) /
      MONTHS_PER_YEAR
    ) + 1;
  }

  aggregateDaily(records) {
    return records.reduce(
      (sum, item) => {
        sum.days += 1;
        sum.orders += item.orders ?? 0;
        sum.revenue += item.revenue ?? 0;
        sum.ingredientCost +=
          item.ingredientCost ?? 0;
        sum.payrollDue +=
          item.payrollDue ?? 0;
        sum.payrollPaid +=
          item.payrollPaid ?? 0;
        sum.operatingProfit +=
          item.operatingProfit ?? 0;
        sum.cashOperatingProfit +=
          item.cashOperatingProfit ?? 0;

        return sum;
      },
      {
        days: 0,
        orders: 0,
        revenue: 0,
        ingredientCost: 0,
        payrollDue: 0,
        payrollPaid: 0,
        operatingProfit: 0,
        cashOperatingProfit: 0
      }
    );
  }

  aggregateMonthly(records) {
    return records.reduce(
      (sum, item) => {
        sum.months += 1;
        sum.days += item.days ?? 0;
        sum.orders += item.orders ?? 0;
        sum.revenue += item.revenue ?? 0;
        sum.ingredientCost +=
          item.ingredientCost ?? 0;
        sum.payrollDue +=
          item.payrollDue ?? 0;
        sum.payrollPaid +=
          item.payrollPaid ?? 0;
        sum.operatingProfit +=
          item.operatingProfit ?? 0;
        sum.cashOperatingProfit +=
          item.cashOperatingProfit ?? 0;

        return sum;
      },
      {
        months: 0,
        days: 0,
        orders: 0,
        revenue: 0,
        ingredientCost: 0,
        payrollDue: 0,
        payrollPaid: 0,
        operatingProfit: 0,
        cashOperatingProfit: 0
      }
    );
  }

  aggregateOperatingCostDaily(
    records
  ) {
    return records.reduce(
      (sum, item) => {
        sum.days += 1;
        sum.orders +=
          item.orders ?? 0;
        sum.openHours +=
          item.openHours ?? 0;
        sum.total +=
          item.total ?? 0;
        sum.paid +=
          item.paid ?? 0;
        sum.unpaid +=
          item.unpaid ?? 0;

        sum.usage.electricityKwh +=
          item.usage
            ?.electricityKwh ??
          0;
        sum.usage.waterTon +=
          item.usage
            ?.waterTon ??
          0;
        sum.usage.gasCubicMeter +=
          item.usage
            ?.gasCubicMeter ??
          0;

        sum.breakdown.electricity +=
          item.breakdown
            ?.electricity ??
          0;
        sum.breakdown.water +=
          item.breakdown
            ?.water ??
          0;
        sum.breakdown.gas +=
          item.breakdown
            ?.gas ??
          0;
        sum.breakdown.waste +=
          item.breakdown
            ?.waste ??
          0;
        sum.breakdown.internet +=
          item.breakdown
            ?.internet ??
          0;

        return sum;
      },
      {
        days: 0,
        orders: 0,
        openHours: 0,
        total: 0,
        paid: 0,
        unpaid: 0,

        usage: {
          electricityKwh: 0,
          waterTon: 0,
          gasCubicMeter: 0
        },

        breakdown: {
          electricity: 0,
          water: 0,
          gas: 0,
          waste: 0,
          internet: 0
        }
      }
    );
  }

  aggregateOperatingCostMonthly(
    records
  ) {
    return records.reduce(
      (sum, item) => {
        sum.months += 1;
        sum.days +=
          item.days ?? 0;
        sum.orders +=
          item.orders ?? 0;
        sum.openHours +=
          item.openHours ?? 0;
        sum.total +=
          item.total ?? 0;
        sum.paid +=
          item.paid ?? 0;
        sum.unpaid +=
          item.unpaid ?? 0;

        sum.usage.electricityKwh +=
          item.usage
            ?.electricityKwh ??
          0;
        sum.usage.waterTon +=
          item.usage
            ?.waterTon ??
          0;
        sum.usage.gasCubicMeter +=
          item.usage
            ?.gasCubicMeter ??
          0;

        sum.breakdown.electricity +=
          item.breakdown
            ?.electricity ??
          0;
        sum.breakdown.water +=
          item.breakdown
            ?.water ??
          0;
        sum.breakdown.gas +=
          item.breakdown
            ?.gas ??
          0;
        sum.breakdown.waste +=
          item.breakdown
            ?.waste ??
          0;
        sum.breakdown.internet +=
          item.breakdown
            ?.internet ??
          0;

        return sum;
      },
      {
        months: 0,
        days: 0,
        orders: 0,
        openHours: 0,
        total: 0,
        paid: 0,
        unpaid: 0,

        usage: {
          electricityKwh: 0,
          waterTon: 0,
          gasCubicMeter: 0
        },

        breakdown: {
          electricity: 0,
          water: 0,
          gas: 0,
          waste: 0,
          internet: 0
        }
      }
    );
  }

  archiveOperatingCostMonths(
    restaurantId,
    currentDay,
    retentionDays = 365
  ) {
    const cutoff =
      currentDay - retentionDays;

    const lastCompleteMonth =
      Math.floor(
        cutoff / MONTH_DAYS
      );

    if (
      lastCompleteMonth < 1
    ) {
      return 0;
    }

    const daily =
      entitySystem.filter(
        "operating_cost_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          this.getMonthIndex(
            item.day
          ) <=
            lastCompleteMonth
      );

    const groups =
      new Map();

    for (
      const item
      of daily
    ) {
      const month =
        this.getMonthIndex(
          item.day
        );

      if (
        !groups.has(
          month
        )
      ) {
        groups.set(
          month,
          []
        );
      }

      groups
        .get(month)
        .push(item);
    }

    let removed = 0;

    for (
      const [month, records]
      of groups
    ) {
      const existing =
        entitySystem.filter(
          "monthly_operating_cost_settlement",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.month ===
              month
        )[0];

      if (!existing) {
        entitySystem.create(
          "monthly_operating_cost_settlement",
          {
            restaurantId,
            month,

            year:
              this.getYearIndexFromMonth(
                month
              ),

            startDay:
              (
                month - 1
              ) *
                MONTH_DAYS +
              1,

            endDay:
              month *
              MONTH_DAYS,

            ...this
              .aggregateOperatingCostDaily(
                records
              )
          }
        );
      }

      removed +=
        entitySystem.removeMany(
          "operating_cost_settlement",
          records.map(
            item =>
              item.id
          )
        );
    }

    return removed;
  }

  archiveOperatingCostYears(
    restaurantId,
    currentDay,
    retentionDays =
      YEAR_DAYS * 3
  ) {
    const cutoff =
      currentDay -
      retentionDays;

    const lastCompleteYear =
      Math.floor(
        cutoff /
        YEAR_DAYS
      );

    if (
      lastCompleteYear < 1
    ) {
      return 0;
    }

    const monthly =
      entitySystem.filter(
        "monthly_operating_cost_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.year <=
            lastCompleteYear
      );

    const groups =
      new Map();

    for (
      const item
      of monthly
    ) {
      if (
        !groups.has(
          item.year
        )
      ) {
        groups.set(
          item.year,
          []
        );
      }

      groups
        .get(
          item.year
        )
        .push(item);
    }

    let removed = 0;

    for (
      const [year, records]
      of groups
    ) {
      const existing =
        entitySystem.filter(
          "yearly_operating_cost_settlement",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.year ===
              year
        )[0];

      if (!existing) {
        entitySystem.create(
          "yearly_operating_cost_settlement",
          {
            restaurantId,
            year,

            startDay:
              (
                year - 1
              ) *
                YEAR_DAYS +
              1,

            endDay:
              year *
              YEAR_DAYS,

            ...this
              .aggregateOperatingCostMonthly(
                records
              )
          }
        );
      }

      removed +=
        entitySystem.removeMany(
          "monthly_operating_cost_settlement",
          records.map(
            item =>
              item.id
          )
        );
    }

    return removed;
  }

  archiveMonths(
    restaurantId,
    currentDay,
    retentionDays = 365
  ) {
    const cutoff =
      currentDay - retentionDays;

    const lastCompleteMonth =
      Math.floor(
        cutoff / MONTH_DAYS
      );

    if (lastCompleteMonth < 1) {
      return 0;
    }

    const daily =
      entitySystem.filter(
        "daily_settlement",
        (item) =>
          item.restaurantId ===
            restaurantId &&
          this.getMonthIndex(
            item.day
          ) <= lastCompleteMonth
      );

    const groups = new Map();

    for (const item of daily) {
      const month =
        this.getMonthIndex(
          item.day
        );

      if (!groups.has(month)) {
        groups.set(month, []);
      }

      groups.get(month).push(item);
    }

    let removed = 0;

    for (
      const [month, records]
      of groups
    ) {
      const existing =
        entitySystem.filter(
          "monthly_settlement",
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.month === month
        )[0];

      if (existing) {
        continue;
      }

      entitySystem.create(
        "monthly_settlement",
        {
          restaurantId,
          month,
          year:
            this.getYearIndexFromMonth(
              month
            ),

          startDay:
            (month - 1) *
              MONTH_DAYS +
            1,

          endDay:
            month * MONTH_DAYS,

          ...this.aggregateDaily(
            records
          )
        }
      );

      removed +=
        entitySystem.removeMany(
          "daily_settlement",
          records.map(x => x.id)
        );
    }

    return removed;
  }

  archiveYears(
    restaurantId,
    currentDay,
    retentionDays =
      YEAR_DAYS * 3
  ) {
    const cutoff =
      currentDay - retentionDays;

    const lastCompleteYear =
      Math.floor(
        cutoff / YEAR_DAYS
      );

    if (lastCompleteYear < 1) {
      return 0;
    }

    const monthly =
      entitySystem.filter(
        "monthly_settlement",
        (item) =>
          item.restaurantId ===
            restaurantId &&
          item.year <=
            lastCompleteYear
      );

    const groups = new Map();

    for (const item of monthly) {
      if (!groups.has(item.year)) {
        groups.set(
          item.year,
          []
        );
      }

      groups
        .get(item.year)
        .push(item);
    }

    let removed = 0;

    for (
      const [year, records]
      of groups
    ) {
      const existing =
        entitySystem.filter(
          "yearly_settlement",
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.year === year
        )[0];

      if (existing) {
        continue;
      }

      entitySystem.create(
        "yearly_settlement",
        {
          restaurantId,
          year,

          startDay:
            (year - 1) *
              YEAR_DAYS +
            1,

          endDay:
            year * YEAR_DAYS,

          ...this.aggregateMonthly(
            records
          )
        }
      );

      removed +=
        entitySystem.removeMany(
          "monthly_settlement",
          records.map(x => x.id)
        );
    }

    return removed;
  }

  archiveRestaurant(
    restaurantId,
    currentDay
  ) {
    const dailyRemoved =
      this.archiveMonths(
        restaurantId,
        currentDay
      );

    const monthlyRemoved =
      this.archiveYears(
        restaurantId,
        currentDay
      );

    const operatingCostDailyRemoved =
      this
        .archiveOperatingCostMonths(
          restaurantId,
          currentDay
        );

    const operatingCostMonthlyRemoved =
      this
        .archiveOperatingCostYears(
          restaurantId,
          currentDay
        );

    return {
      dailyRemoved,
      monthlyRemoved,
      operatingCostDailyRemoved,
      operatingCostMonthlyRemoved
    };
  }
}

export const periodArchiveSystem =
  new PeriodArchiveSystem();

export {
  PeriodArchiveSystem,
  MONTH_DAYS,
  YEAR_DAYS
};
