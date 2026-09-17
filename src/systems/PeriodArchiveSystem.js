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

    return {
      dailyRemoved,
      monthlyRemoved
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
