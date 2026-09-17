import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  dishGrowthSystem
} from "./DishGrowthSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

const ACTION_KIND = Object.freeze({
  PRICE: "price",
  PIN: "pin",
  PROMOTION: "promotion",
  IMPROVE: "improve",
  ACTIVE: "active"
});

function currentDay() {
  return gameState
    .getSection("time")
    .day;
}

function requirePositiveInteger(
  value,
  name
) {
  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new RangeError(
      `${name} must be a positive integer`
    );
  }
}

class MenuOptimizationSystem {
  requireMenuItem(
    restaurantId,
    menuItemId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const item =
      menuSystem.get(
        menuItemId
      );

    if (
      item.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Menu item does not belong to restaurant"
      );
    }

    return item;
  }

  getOrdersInRange(
    restaurantId,
    startDay,
    endDay
  ) {
    return entitySystem.filter(
      "customer_order",
      order =>
        order.restaurantId ===
          restaurantId &&
        order.status ===
          "completed" &&
        Number.isInteger(
          order.day
        ) &&
        order.day >=
          startDay &&
        order.day <=
          endDay
    );
  }

  getDishSnapshot(
    restaurantId,
    menuItemId,
    startDay,
    endDay
  ) {
    const orders =
      this.getOrdersInRange(
        restaurantId,
        startDay,
        endDay
      );

    let ordersCount = 0;
    let quantity = 0;
    let revenue = 0;
    let ingredientCost = 0;
    let contributionProfit = 0;
    let qualityTotal = 0;
    let qualityPortions = 0;

    for (
      const order
      of orders
    ) {
      const lines =
        order.items ?? [];

      const sourceRevenue =
        lines.reduce(
          (sum, line) =>
            sum +
            (
              line.revenue ??
              (
                (
                  line.unitPrice ??
                  0
                ) *
                (
                  line.quantity ??
                  0
                )
              )
            ),
          0
        );

      for (
        const line
        of lines
      ) {
        if (
          line.menuItemId !==
          menuItemId
        ) {
          continue;
        }

        const lineQuantity =
          Number(
            line.quantity ??
            0
          );

        const lineRevenue =
          line.revenue ??
          (
            (
              line.unitPrice ??
              0
            ) *
            lineQuantity
          );

        const share =
          sourceRevenue > 0
            ? lineRevenue /
              sourceRevenue
            : 0;

        const realizedRevenue =
          Math.round(
            (
              order.channelNetRevenue ??
              order.paidAmount ??
              order.totalRevenue ??
              sourceRevenue
            ) *
            share
          );

        const lineIngredientCost =
          Math.round(
            (
              order
                .ingredientCost ??
              0
            ) *
            share
          );

        ordersCount += 1;
        quantity +=
          lineQuantity;

        revenue +=
          realizedRevenue;

        ingredientCost +=
          lineIngredientCost;

        contributionProfit +=
          realizedRevenue -
          lineIngredientCost;

        qualityTotal +=
          (
            line.qualityScore ??
            order.averageQuality ??
            0
          ) *
          lineQuantity;

        qualityPortions +=
          lineQuantity;
      }
    }

    return {
      startDay,
      endDay,

      orders:
        ordersCount,

      quantity,
      revenue,
      ingredientCost,
      contributionProfit,

      averageSellingPrice:
        quantity > 0
          ? Math.round(
              revenue /
              quantity
            )
          : 0,

      contributionPerPortion:
        quantity > 0
          ? Math.round(
              contributionProfit /
              quantity
            )
          : 0,

      marginRate:
        revenue > 0
          ? Number(
              (
                contributionProfit /
                revenue *
                100
              ).toFixed(1)
            )
          : 0,

      averageQuality:
        qualityPortions > 0
          ? Math.round(
              qualityTotal /
              qualityPortions
            )
          : 0
    };
  }

  getBaseline(
    restaurantId,
    menuItemId,
    day = currentDay()
  ) {
    return this.getDishSnapshot(
      restaurantId,
      menuItemId,
      Math.max(
        1,
        day - 7
      ),
      Math.max(
        1,
        day - 1
      )
    );
  }

  createAction({
    restaurantId,
    menuItemId,
    actionKind,
    details = {}
  }) {
    const day =
      currentDay();

    return entitySystem.create(
      "menu_optimization_action",
      {
        restaurantId,
        menuItemId,

        actionKind,

        actionDay:
          day,

        details,

        baseline:
          this.getBaseline(
            restaurantId,
            menuItemId,
            day
          ),

        status:
          "active"
      }
    );
  }

  changePrice({
    restaurantId,
    menuItemId,
    newPrice
  }) {
    requirePositiveInteger(
      newPrice,
      "newPrice"
    );

    const item =
      this.requireMenuItem(
        restaurantId,
        menuItemId
      );

    const oldPrice =
      item.price;

    const updated =
      menuSystem.setPrice(
        menuItemId,
        newPrice
      );

    const action =
      this.createAction({
        restaurantId,
        menuItemId,

        actionKind:
          ACTION_KIND.PRICE,

        details: {
          oldPrice,
          newPrice
        }
      });

    return {
      item: updated,
      action
    };
  }

  setPinned({
    restaurantId,
    menuItemId,
    pinned = true,
    priority = 100
  }) {
    const item =
      this.requireMenuItem(
        restaurantId,
        menuItemId
      );

    if (
      !Number.isInteger(
        priority
      )
    ) {
      throw new TypeError(
        "priority must be an integer"
      );
    }

    const updated =
      entitySystem.update(
        "menu_item",
        item.id,
        {
          menuPinned:
            Boolean(pinned),

          menuPriority:
            pinned
              ? priority
              : 0
        }
      );

    const action =
      this.createAction({
        restaurantId,
        menuItemId,

        actionKind:
          ACTION_KIND.PIN,

        details: {
          pinned:
            Boolean(pinned),

          priority:
            pinned
              ? priority
              : 0
        }
      });

    return {
      item: updated,
      action
    };
  }

  startPromotion({
    restaurantId,
    menuItemId,
    discountPercent,
    durationDays = 3
  }) {
    const item =
      this.requireMenuItem(
        restaurantId,
        menuItemId
      );

    if (
      !Number.isInteger(
        discountPercent
      ) ||
      discountPercent < 1 ||
      discountPercent > 50
    ) {
      throw new RangeError(
        "discountPercent must be between 1 and 50"
      );
    }

    requirePositiveInteger(
      durationDays,
      "durationDays"
    );

    const existing =
      this.getActivePromotion(
        restaurantId,
        menuItemId
      );

    if (existing) {
      throw new Error(
        "Menu item already has an active promotion"
      );
    }

    const originalPrice =
      item.price;

    const promotionalPrice =
      Math.max(
        1,
        Math.round(
          originalPrice *
          (
            100 -
            discountPercent
          ) /
          100
        )
      );

    menuSystem.setPrice(
      menuItemId,
      promotionalPrice
    );

    const day =
      currentDay();

    const promotion =
      entitySystem.create(
        "menu_promotion",
        {
          restaurantId,
          menuItemId,

          originalPrice,
          promotionalPrice,

          discountPercent,

          startDay:
            day,

          endDay:
            day +
            durationDays -
            1,

          status:
            "active"
        }
      );

    const action =
      this.createAction({
        restaurantId,
        menuItemId,

        actionKind:
          ACTION_KIND.PROMOTION,

        details: {
          promotionId:
            promotion.id,

          originalPrice,
          promotionalPrice,
          discountPercent,
          durationDays
        }
      });

    return {
      promotion,
      action,

      item:
        menuSystem.get(
          menuItemId
        )
    };
  }

  getActivePromotion(
    restaurantId,
    menuItemId
  ) {
    return (
      entitySystem
        .filter(
          "menu_promotion",
          promotion =>
            promotion.restaurantId ===
              restaurantId &&
            promotion.menuItemId ===
              menuItemId &&
            promotion.status ===
              "active"
        )[0] ??
      null
    );
  }

  endPromotion({
    restaurantId,
    menuItemId
  }) {
    this.requireMenuItem(
      restaurantId,
      menuItemId
    );

    const promotion =
      this.getActivePromotion(
        restaurantId,
        menuItemId
      );

    if (!promotion) {
      throw new Error(
        "No active promotion"
      );
    }

    menuSystem.setPrice(
      menuItemId,
      promotion.originalPrice
    );

    const updated =
      entitySystem.update(
        "menu_promotion",
        promotion.id,
        {
          status:
            "ended",

          endedDay:
            currentDay()
        }
      );

    return {
      promotion:
        updated,

      item:
        menuSystem.get(
          menuItemId
        )
    };
  }

  expirePromotions(
    restaurantId
  ) {
    const day =
      currentDay();

    const promotions =
      entitySystem.filter(
        "menu_promotion",
        promotion =>
          promotion.restaurantId ===
            restaurantId &&
          promotion.status ===
            "active" &&
          promotion.endDay <
            day
      );

    const ended = [];

    for (
      const promotion
      of promotions
    ) {
      menuSystem.setPrice(
        promotion.menuItemId,
        promotion.originalPrice
      );

      ended.push(
        entitySystem.update(
          "menu_promotion",
          promotion.id,
          {
            status:
              "ended",

            endedDay:
              day
          }
        )
      );
    }

    return ended;
  }

  setActive({
    restaurantId,
    menuItemId,
    active
  }) {
    this.requireMenuItem(
      restaurantId,
      menuItemId
    );

    const updated =
      menuSystem.setActive(
        menuItemId,
        active
      );

    const action =
      this.createAction({
        restaurantId,
        menuItemId,

        actionKind:
          ACTION_KIND.ACTIVE,

        details: {
          active:
            Boolean(active)
        }
      });

    return {
      item: updated,
      action
    };
  }

  improveDish({
    restaurantId,
    menuItemId,
    focus
  }) {
    const item =
      this.requireMenuItem(
        restaurantId,
        menuItemId
      );

    const result =
      dishGrowthSystem
        .improveRecipe({
          restaurantId,

          dishId:
            item.dishId,

          focus
        });

    const action =
      this.createAction({
        restaurantId,
        menuItemId,

        actionKind:
          ACTION_KIND.IMPROVE,

        details: {
          focus,
          success:
            result.success,

          cost:
            result.cost
        }
      });

    return {
      ...result,
      action
    };
  }

  getActions(
    restaurantId,
    menuItemId = null
  ) {
    return entitySystem
      .filter(
        "menu_optimization_action",
        action =>
          action.restaurantId ===
            restaurantId &&
          (
            menuItemId === null ||
            action.menuItemId ===
              menuItemId
          )
      )
      .sort(
        (a, b) =>
          b.actionDay -
          a.actionDay
      );
  }

  evaluateAction(
    actionId
  ) {
    const action =
      entitySystem.get(
        "menu_optimization_action",
        actionId
      );

    if (!action) {
      throw new Error(
        "Optimization action does not exist"
      );
    }

    const postStart =
      action.actionDay;

    const postEnd =
      Math.min(
        currentDay(),
        action.actionDay + 6
      );

    const after =
      this.getDishSnapshot(
        action.restaurantId,
        action.menuItemId,
        postStart,
        postEnd
      );

    const before =
      action.baseline;

    const delta = {
      quantity:
        after.quantity -
        before.quantity,

      revenue:
        after.revenue -
        before.revenue,

      contributionProfit:
        after
          .contributionProfit -
        before
          .contributionProfit,

      averageSellingPrice:
        after
          .averageSellingPrice -
        before
          .averageSellingPrice,

      contributionPerPortion:
        after
          .contributionPerPortion -
        before
          .contributionPerPortion,

      marginRate:
        Number(
          (
            after.marginRate -
            before.marginRate
          ).toFixed(1)
        ),

      averageQuality:
        after
          .averageQuality -
        before
          .averageQuality
    };

    let result =
      "insufficient_data";

    if (
      after.quantity > 0 ||
      before.quantity > 0
    ) {
      if (
        delta.contributionProfit >
        0
      ) {
        result =
          "improved";
      } else if (
        delta.contributionProfit <
        0
      ) {
        result =
          "declined";
      } else {
        result =
          "neutral";
      }
    }

    return {
      action,

      before,
      after,
      delta,

      elapsedDays:
        Math.max(
          0,
          postEnd -
          postStart +
          1
        ),

      complete:
        currentDay() >=
        action.actionDay + 6,

      result
    };
  }

  getDashboard(
    restaurantId
  ) {
    const items =
      menuSystem.listByRestaurant(
        restaurantId
      );

    const actions =
      this.getActions(
        restaurantId
      );

    return {
      restaurantId,

      activeItems:
        items.filter(
          item =>
            item.active
        ).length,

      pinnedItems:
        items.filter(
          item =>
            item.menuPinned
        ).length,

      activePromotions:
        entitySystem.filter(
          "menu_promotion",
          promotion =>
            promotion.restaurantId ===
              restaurantId &&
            promotion.status ===
              "active"
        ).length,

      actionCount:
        actions.length,

      recentActions:
        actions
          .slice(0, 10)
          .map(
            action =>
              this.evaluateAction(
                action.id
              )
          )
    };
  }
}

export const menuOptimizationSystem =
  new MenuOptimizationSystem();

export {
  MenuOptimizationSystem,
  ACTION_KIND as MENU_OPTIMIZATION_ACTION_KIND
};
