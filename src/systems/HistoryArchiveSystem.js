import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";

class HistoryArchiveSystem {
  constructor({
    retentionDays = 30
  } = {}) {
    this.retentionDays =
      retentionDays;
  }

  findSettlement(
    restaurantId,
    day
  ) {
    return entitySystem
      .list("daily_settlement")
      .find(
        (item) =>
          item.restaurantId ===
            restaurantId &&
          item.day === day
      );
  }

  summarizeOrders(orders) {
    const dishMap = new Map();

    let portions = 0;
    let qualityWeight = 0;
    let revenue = 0;
    let ingredientCost = 0;
    let grossProfit = 0;

    for (const order of orders) {
      revenue +=
        order.totalRevenue ?? 0;

      ingredientCost +=
        order.ingredientCost ?? 0;

      grossProfit +=
        order.grossProfit ?? 0;

      for (
        const item
        of order.items ?? []
      ) {
        const quantity =
          item.quantity ?? 0;

        portions += quantity;

        qualityWeight +=
          (item.qualityScore ??
            order.averageQuality ??
            0) *
          quantity;

        const current =
          dishMap.get(
            item.dishId
          ) ?? {
            dishId:
              item.dishId,
            quantity: 0,
            revenue: 0
          };

        current.quantity +=
          quantity;

        current.revenue +=
          item.revenue ?? 0;

        dishMap.set(
          item.dishId,
          current
        );
      }
    }

    return {
      orderCount:
        orders.length,

      portions,

      revenue,

      ingredientCost,

      grossProfit,

      averageQuality:
        portions > 0
          ? Math.round(
              qualityWeight /
              portions
            )
          : 0,

      dishSales:
        [...dishMap.values()]
    };
  }

  summarizeCooking(records) {
    let portions = 0;
    let freshness = 0;
    let ingredientQuality = 0;
    let chefSkill = 0;

    for (const item of records) {
      const weight =
        item.portions ?? 1;

      portions += weight;

      freshness +=
        (item.averageFreshness ?? 0) *
        weight;

      ingredientQuality +=
        (item.averageIngredientQuality ?? 0) *
        weight;

      chefSkill +=
        (item.chefSkill ?? 0) *
        weight;
    }

    return {
      recordCount:
        records.length,

      portions,

      averageFreshness:
        portions > 0
          ? Math.round(
              freshness / portions
            )
          : 0,

      averageIngredientQuality:
        portions > 0
          ? Number(
              (
                ingredientQuality /
                portions
              ).toFixed(2)
            )
          : 0,

      averageChefSkill:
        portions > 0
          ? Math.round(
              chefSkill /
              portions
            )
          : 0
    };
  }

  summarizeFinance(records) {
    const map = new Map();

    for (const item of records) {
      const key =
        `${item.type}:${item.category}`;

      const current =
        map.get(key) ?? {
          type: item.type,
          category:
            item.category,
          count: 0,
          amount: 0
        };

      current.count += 1;
      current.amount +=
        item.amount ?? 0;

      map.set(key, current);
    }

    return [
      ...map.values()
    ];
  }

  archiveDay(
    restaurantId,
    day,
    currentDay
  ) {
    const settlement =
      this.findSettlement(
        restaurantId,
        day
      );

    if (
      !settlement ||
      settlement.archived
    ) {
      return null;
    }

    const orders =
      entitySystem
        .list("customer_order")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const cooking =
      entitySystem
        .list("cooking_record")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const finance =
      entitySystem
        .list(
          "finance_transaction"
        )
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const updated =
      entitySystem.update(
        "daily_settlement",
        settlement.id,
        {
          archived: true,
          archiveVersion: 1,
          archivedOnDay:
            currentDay,

          detailSummary: {
            orders:
              this.summarizeOrders(
                orders
              ),

            cooking:
              this.summarizeCooking(
                cooking
              ),

            finance:
              this.summarizeFinance(
                finance
              )
          }
        }
      );

    const removedOrders =
      entitySystem.removeMany(
        "customer_order",
        orders.map(x => x.id)
      );

    const removedCooking =
      entitySystem.removeMany(
        "cooking_record",
        cooking.map(x => x.id)
      );

    const removedFinance =
      entitySystem.removeMany(
        "finance_transaction",
        finance.map(x => x.id)
      );

    eventBus.emit(
      "history:dayArchived",
      {
        restaurantId,
        day,
        removedOrders,
        removedCooking,
        removedFinance
      }
    );

    return updated;
  }

  processRestaurant(
    restaurantId,
    currentDay
  ) {
    const archiveThrough =
      currentDay -
      this.retentionDays -
      1;

    if (archiveThrough < 1) {
      return [];
    }

    const settlements =
      entitySystem
        .list("daily_settlement")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            !item.archived &&
            item.day <=
              archiveThrough
        )
        .sort(
          (a, b) =>
            a.day - b.day
        );

    return settlements
      .map(
        (item) =>
          this.archiveDay(
            restaurantId,
            item.day,
            currentDay
          )
      )
      .filter(Boolean);
  }

  processAll(currentDay) {
    const restaurants =
      entitySystem.list(
        "restaurant"
      );

    const results = [];

    for (
      const restaurant
      of restaurants
    ) {
      results.push(
        ...this.processRestaurant(
          restaurant.id,
          currentDay
        )
      );
    }

    return results;
  }
}

export const historyArchiveSystem =
  new HistoryArchiveSystem();

export {
  HistoryArchiveSystem
};

  archiveDay(
    restaurantId,
    day,
    currentDay
  ) {
    const settlement =
      this.findSettlement(
        restaurantId,
        day
      );

    if (
      !settlement ||
      settlement.archived
    ) {
      return null;
    }

    const orders =
      entitySystem
        .list("customer_order")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const cooking =
      entitySystem
        .list("cooking_record")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const finance =
      entitySystem
        .list(
          "finance_transaction"
        )
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    const updated =
      entitySystem.update(
        "daily_settlement",
        settlement.id,
        {
          archived: true,
          archiveVersion: 1,
          archivedOnDay:
            currentDay,

          detailSummary: {
            orders:
              this.summarizeOrders(
                orders
              ),

            cooking:
              this.summarizeCooking(
                cooking
              ),

            finance:
              this.summarizeFinance(
                finance
              )
          }
        }
      );

    const removedOrders =
      entitySystem.removeMany(
        "customer_order",
        orders.map(x => x.id)
      );

    const removedCooking =
      entitySystem.removeMany(
        "cooking_record",
        cooking.map(x => x.id)
      );

    const removedFinance =
      entitySystem.removeMany(
        "finance_transaction",
        finance.map(x => x.id)
      );

    eventBus.emit(
      "history:dayArchived",
      {
        restaurantId,
        day,
        removedOrders,
        removedCooking,
        removedFinance
      }
    );

    return updated;
  }

  processRestaurant(
    restaurantId,
    currentDay
  ) {
    const archiveThrough =
      currentDay -
      this.retentionDays -
      1;

    if (archiveThrough < 1) {
      return [];
    }

    const settlements =
      entitySystem
        .list("daily_settlement")
        .filter(
          (item) =>
            item.restaurantId ===
              restaurantId &&
            !item.archived &&
            item.day <=
              archiveThrough
        )
        .sort(
          (a, b) =>
            a.day - b.day
        );

    return settlements
      .map(
        (item) =>
          this.archiveDay(
            restaurantId,
            item.day,
            currentDay
          )
      )
      .filter(Boolean);
  }

  processAll(currentDay) {
    const restaurants =
      entitySystem.list(
        "restaurant"
      );

    const results = [];

    for (
      const restaurant
      of restaurants
    ) {
      results.push(
        ...this.processRestaurant(
          restaurant.id,
          currentDay
        )
      );
    }

    return results;
  }
}

export const historyArchiveSystem =
  new HistoryArchiveSystem();

export {
  HistoryArchiveSystem
};
