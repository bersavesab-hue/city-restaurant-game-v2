import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

const MENU_CLASSES = Object.freeze({
  STAR: {
    id: "star",
    name: "明星菜",
    advice:
      "销量和单份贡献都高，保持品质与曝光，可小幅测试提价"
  },

  CASH_COW: {
    id: "cash_cow",
    name: "现金牛",
    advice:
      "销量高但单份贡献偏低，优先优化食材成本或售价"
  },

  PUZZLE: {
    id: "puzzle",
    name: "问题菜",
    advice:
      "单份贡献高但销量不足，检查定价、菜单位置和客群匹配"
  },

  DOG: {
    id: "dog",
    name: "瘦狗菜",
    advice:
      "销量和贡献都低，考虑改配方、促销、重新定位或下架"
  }
});

function round1(value) {
  return Number(
    Number(value ?? 0)
      .toFixed(1)
  );
}

class MenuEngineeringSystem {
  getMenuItems(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return entitySystem.filter(
      "menu_item",
      item =>
        item.restaurantId ===
        restaurantId
    );
  }

  getOrders(
    restaurantId
  ) {
    return entitySystem.filter(
      "customer_order",
      order =>
        order.restaurantId ===
          restaurantId &&
        order.status ===
          "completed"
    );
  }

  createMetric(menuItem) {
    return {
      menuItemId:
        menuItem.id,

      dishId:
        menuItem.dishId,

      name:
        menuItem.name ??
        menuItem.dishName ??
        menuItem.dishId,

      active:
        menuItem.active !== false,

      listedPrice:
        menuItem.price ?? 0,

      orderCount: 0,
      quantity: 0,

      realizedRevenue: 0,
      ingredientCost: 0,
      channelFees: 0,

      contributionProfit: 0,

      qualityTotal: 0,
      qualityPortions: 0,

      memberOrderCount: 0
    };
  }

  analyze(
    restaurantId
  ) {
    const menuItems =
      this.getMenuItems(
        restaurantId
      );

    const orders =
      this.getOrders(
        restaurantId
      );

    const metrics =
      new Map();

    for (
      const menuItem
      of menuItems
    ) {
      metrics.set(
        menuItem.id,
        this.createMetric(
          menuItem
        )
      );
    }

    for (
      const order
      of orders
    ) {
      const lines =
        Array.isArray(
          order.items
        )
          ? order.items
          : [];

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

      const realizedOrderRevenue =
        order.channelNetRevenue ??
        order.paidAmount ??
        order.totalRevenue ??
        sourceRevenue;

      for (
        const line
        of lines
      ) {
        let metric =
          metrics.get(
            line.menuItemId
          );

        if (!metric) {
          const matchedMenu =
            menuItems.find(
              item =>
                item.dishId ===
                line.dishId
            );

          if (matchedMenu) {
            metric =
              metrics.get(
                matchedMenu.id
              );
          }
        }

        if (!metric) {
          continue;
        }

        const quantity =
          Math.max(
            0,
            Number(
              line.quantity ?? 0
            )
          );

        const lineRevenue =
          line.revenue ??
          (
            (
              line.unitPrice ??
              0
            ) *
            quantity
          );

        const share =
          sourceRevenue > 0
            ? lineRevenue /
              sourceRevenue
            : (
                lines.length > 0
                  ? 1 /
                    lines.length
                  : 0
              );

        const realizedRevenue =
          Math.round(
            realizedOrderRevenue *
            share
          );

        const ingredientCost =
          Math.round(
            (
              order
                .ingredientCost ??
              0
            ) *
            share
          );

        const channelFees =
          Math.round(
            (
              order
                .channelFees ??
              0
            ) *
            share
          );

        metric.orderCount += 1;
        metric.quantity +=
          quantity;

        metric.realizedRevenue +=
          realizedRevenue;

        metric.ingredientCost +=
          ingredientCost;

        metric.channelFees +=
          channelFees;

        metric.contributionProfit +=
          realizedRevenue -
          ingredientCost;

        const quality =
          line.qualityScore ??
          order.averageQuality ??
          0;

        metric.qualityTotal +=
          quality *
          quantity;

        metric.qualityPortions +=
          quantity;

        if (order.customerId) {
          metric.memberOrderCount +=
            1;
        }
      }
    }

    const rows =
      [...metrics.values()]
        .map(
          item => ({
            ...item,

            averageSellingPrice:
              item.quantity > 0
                ? Math.round(
                    item
                      .realizedRevenue /
                    item.quantity
                  )
                : 0,

            contributionPerPortion:
              item.quantity > 0
                ? Math.round(
                    item
                      .contributionProfit /
                    item.quantity
                  )
                : 0,

            marginRate:
              item.realizedRevenue > 0
                ? round1(
                    item
                      .contributionProfit /
                    item
                      .realizedRevenue *
                    100
                  )
                : 0,

            averageQuality:
              item.qualityPortions > 0
                ? Math.round(
                    item
                      .qualityTotal /
                    item
                      .qualityPortions
                  )
                : 0
          })
        );

    const totalQuantity =
      rows.reduce(
        (sum, item) =>
          sum +
          item.quantity,
        0
      );

    const popularityThreshold =
      rows.length > 0
        ? rows.reduce(
            (sum, item) =>
              sum +
              item.quantity,
            0
          ) /
          rows.length
        : 0;

    const contributionThreshold =
      rows.length > 0
        ? rows.reduce(
            (sum, item) =>
              sum +
              item
                .contributionPerPortion,
            0
          ) /
          rows.length
        : 0;

    const dishes =
      rows.map(
        item => {
          const highPopularity =
            item.quantity > 0 &&
            item.quantity >=
            popularityThreshold;

          const highContribution =
            item
              .contributionPerPortion >=
            contributionThreshold;

          let classification;

          if (
            highPopularity &&
            highContribution
          ) {
            classification =
              MENU_CLASSES.STAR;
          } else if (
            highPopularity
          ) {
            classification =
              MENU_CLASSES
                .CASH_COW;
          } else if (
            highContribution
          ) {
            classification =
              MENU_CLASSES.PUZZLE;
          } else {
            classification =
              MENU_CLASSES.DOG;
          }

          return {
            ...item,

            salesShare:
              totalQuantity > 0
                ? round1(
                    item.quantity /
                    totalQuantity *
                    100
                  )
                : 0,

            popularityIndex:
              popularityThreshold > 0
                ? round1(
                    item.quantity /
                    popularityThreshold *
                    100
                  )
                : 0,

            classificationId:
              classification.id,

            classificationName:
              classification.name,

            advice:
              classification.advice
          };
        }
      )
      .sort(
        (a, b) =>
          b.contributionProfit -
          a.contributionProfit
      );

    const counts = {
      star: 0,
      cash_cow: 0,
      puzzle: 0,
      dog: 0
    };

    for (
      const dish
      of dishes
    ) {
      counts[
        dish.classificationId
      ] += 1;
    }

    return {
      restaurantId,

      counts,

      thresholds: {
        popularity:
          round1(
            popularityThreshold
          ),

        contributionPerPortion:
          round1(
            contributionThreshold
          )
      },

      totalQuantity,

      totalRevenue:
        dishes.reduce(
          (sum, item) =>
            sum +
            item.realizedRevenue,
          0
        ),

      totalContributionProfit:
        dishes.reduce(
          (sum, item) =>
            sum +
            item
              .contributionProfit,
          0
        ),

      dishes
    };
  }
}

export const menuEngineeringSystem =
  new MenuEngineeringSystem();

export {
  MenuEngineeringSystem,
  MENU_CLASSES
};
