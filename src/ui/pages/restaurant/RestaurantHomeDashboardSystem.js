import {
  entitySystem
} from "../../../core/EntitySystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  dishCatalogSystem
} from "../../../systems/DishCatalogSystem.js";

import {
  leaseSystem
} from "../../../systems/LeaseSystem.js";

import {
  operatingScheduleSystem
} from "../../../systems/OperatingScheduleSystem.js";

import {
  restaurantHomePageSystem
} from "./RestaurantHomePageSystem.js";


function safeDish(
  dishId
) {
  try {
    return dishCatalogSystem.get(
      dishId
    );
  } catch {
    return null;
  }
}


class RestaurantHomeDashboardSystem {
  getOrders(
    restaurantId
  ) {
    return entitySystem
      .list(
        "customer_order"
      )
      .filter(
        item =>
          item.restaurantId ===
          restaurantId &&
          item.status ===
          "completed"
      );
  }


  getTrend(
    restaurantId
  ) {
    const day =
      gameState.getSection(
        "time"
      ).day;

    const orders =
      this.getOrders(
        restaurantId
      );

    return Array.from(
      {
        length: 7
      },
      (
        _,
        index
      ) => {
        const targetDay =
          day - 6 + index;

        const dayOrders =
          orders.filter(
            item =>
              item.day ===
              targetDay
          );

        return {
          day:
            targetDay,

          revenue:
            dayOrders.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.totalRevenue ??
                  0
                ),
              0
            ),

          grossProfit:
            dayOrders.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.grossProfit ??
                  (
                    (
                      item.totalRevenue ??
                      0
                    ) -
                    (
                      item.ingredientCost ??
                      0
                    )
                  )
                ),
              0
            ),

          orders:
            dayOrders.length
        };
      }
    );
  }


  getTopDishes(
    restaurantId
  ) {
    const orders =
      this.getOrders(
        restaurantId
      );

    const map =
      new Map();

    for (
      const order
      of orders
    ) {
      for (
        const item
        of order.items ??
        []
      ) {
        const current =
          map.get(
            item.dishId
          ) ?? {
            dishId:
              item.dishId,

            sold:
              0,

            revenue:
              0,

            qualityTotal:
              0,

            qualityCount:
              0
          };

        current.sold +=
          item.quantity ??
          0;

        current.revenue +=
          item.revenue ??
          0;

        if (
          Number.isFinite(
            item.qualityScore
          )
        ) {
          current.qualityTotal +=
            item.qualityScore *
            (
              item.quantity ??
              1
            );

          current.qualityCount +=
            item.quantity ??
            1;
        }

        map.set(
          item.dishId,
          current
        );
      }
    }

    return [
      ...map.values()
    ]
      .map(
        item => {
          const dish =
            safeDish(
              item.dishId
            );

          return {
            ...item,

            name:
              dish?.name ??
              "未命名菜品",

            category:
              dish?.category ??
              null,

            quality:
              item.qualityCount >
              0
                ? Math.round(
                    item.qualityTotal /
                    item.qualityCount
                  )
                : null,

            imageSlot:
              `dish-${item.dishId}`
          };
        }
      )
      .sort(
        (
          a,
          b
        ) =>
          b.sold -
          a.sold
      )
      .slice(
        0,
        3
      );
  }


  getOperatingPeriods(
    restaurantId
  ) {
    const time =
      gameState.getSection(
        "time"
      );

    const schedule =
      operatingScheduleSystem
        .get(
          restaurantId
        );

    const hour =
      time.hour;

    const periods = [
      {
        id:
          "breakfast",

        label:
          "早餐",

        start:
          6,

        end:
          10
      },

      {
        id:
          "lunch",

        label:
          "午市",

        start:
          10,

        end:
          15
      },

      {
        id:
          "dinner",

        label:
          "晚餐",

        start:
          17,

        end:
          22
      },

      {
        id:
          "late",

        label:
          "夜宵",

        start:
          22,

        end:
          24
      }
    ];

    return {
      schedule,

      scheduledHours:
        schedule?.enabled
          ? (
              schedule.closeHour -
              schedule.openHour
            )
          : 0,

      periods:
        periods.map(
          period => ({
            ...period,

            current:
              hour >=
                period.start &&
              hour <
                period.end,

            enabled:
              Boolean(
                schedule?.enabled &&
                period.end >
                  schedule.openHour &&
                period.start <
                  schedule.closeHour
              )
          })
        )
    };
  }


  getLease(
    restaurantId
  ) {
    const time =
      gameState.getSection(
        "time"
      );

    const lease =
      leaseSystem
        .getByRestaurant(
          restaurantId
        ) ??
      null;

    if (!lease) {
      return null;
    }

    return {
      ...lease,

      remainingDays:
        Math.max(
          0,
          (
            lease.endDay ??
            time.day
          ) -
          time.day
        )
    };
  }


  getPage(
    restaurantId
  ) {
    const base =
      restaurantHomePageSystem
        .getPage(
          restaurantId
        );

    const trend =
      this.getTrend(
        restaurantId
      );

    const topDishes =
      this.getTopDishes(
        restaurantId
      );

    const lease =
      this.getLease(
        restaurantId
      );

    const operating =
      this.getOperatingPeriods(
        restaurantId
      );

    const grossProfit =
      (
        base.today.revenue ??
        0
      ) -
      (
        base.today
          .ingredientCost ??
        0
      );

    const profitMargin =
      base.today.revenue >
      0
        ? Math.round(
            grossProfit /
            base.today.revenue *
            100
          )
        : 0;

    const orderPerSeat =
      base.scene.seats >
      0
        ? Number(
            (
              base.today.orders /
              base.scene.seats
            ).toFixed(
              1
            )
          )
        : 0;

    return {
      ...base,

      hero: {
        imageSlot:
          "restaurant-hero",

        liveImageSlot:
          "restaurant-live",

        title:
          base.scene
            .propertyName,

        area:
          base.scene.area,

        seats:
          base.scene.seats
      },

      lease: lease
        ? {
            monthlyRent:
              lease.monthlyRent,

            remainingDays:
              lease.remainingDays,

            nextRentDay:
              lease.nextRentDay,

            months:
              lease.months
          }
        : null,

      operating,

      dashboardMetrics: [
        {
          id:
            "revenue",

          label:
            "今日营业额",

          value:
            base.today.revenue,

          format:
            "money"
        },

        {
          id:
            "profit",

          label:
            "今日毛利",

          value:
            grossProfit,

          format:
            "money",

          sub:
            `毛利率 ${profitMargin}%`
        },

        {
          id:
            "orders",

          label:
            "今日订单",

          value:
            base.today.orders,

          format:
            "number"
        },

        {
          id:
            "seat_efficiency",

          label:
            "单量/餐位",

          value:
            orderPerSeat,

          format:
            "decimal",

          sub:
            `${base.scene.seats}个餐位`
        },

        {
          id:
            "rating",

          label:
            "顾客评分",

          value:
            base.restaurant
              .reviewScore,

          format:
            "rating"
        }
      ],

      trend,

      topDishes,

      reminders:
        base.noticeTicker
          .items
          .slice(
            0,
            3
          ),

      imageSlots: [
        {
          id:
            "restaurant-hero",

          type:
            "store",

          static:
            true
        },

        {
          id:
            "restaurant-live",

          type:
            "store-live",

          static:
            true
        },

        ...Array.from(
          {
            length: 3
          },
          (
            _,
            index
          ) => ({
            id:
              `signature-dish-${index + 1}`,

            type:
              "dish",

            static:
              true
          })
        )
      ]
    };
  }


  rename(
    restaurantId,
    name
  ) {
    restaurantHomePageSystem
      .rename(
        restaurantId,
        name
      );

    return this.getPage(
      restaurantId
    );
  }


  pauseTime(
    restaurantId
  ) {
    restaurantHomePageSystem
      .pauseTime(
        restaurantId
      );

    return this.getPage(
      restaurantId
    );
  }


  resumeTime(
    restaurantId
  ) {
    restaurantHomePageSystem
      .resumeTime(
        restaurantId
      );

    return this.getPage(
      restaurantId
    );
  }


  setSpeed(
    restaurantId,
    speed
  ) {
    restaurantHomePageSystem
      .setSpeed(
        restaurantId,
        speed
      );

    return this.getPage(
      restaurantId
    );
  }


  toggleBusiness(
    restaurantId
  ) {
    restaurantHomePageSystem
      .toggleBusiness(
        restaurantId
      );

    return this.getPage(
      restaurantId
    );
  }
}


export const restaurantHomeDashboardSystem =
  new RestaurantHomeDashboardSystem();

export {
  RestaurantHomeDashboardSystem
};
