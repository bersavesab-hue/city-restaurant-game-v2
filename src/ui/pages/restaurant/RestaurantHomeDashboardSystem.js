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
  menuSystem
} from "../../../systems/MenuSystem.js";

import {
  restaurantDishSystem
} from "../../../systems/RestaurantDishSystem.js";

import {
  getDishVisualSource,
  getDishVisualSlot
} from "../../assets/DishVisualResolver.js";

import {
  restaurantHomePageSystem
} from "./RestaurantHomePageSystem.js";

import {
  onboardingSystem
} from "../../../systems/OnboardingSystem.js";

import {
  operatingAdvisorSystem
} from "../../../systems/OperatingAdvisorSystem.js";


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


  getFeaturedDishes(
    restaurantId
  ) {
    const day =
      gameState.getSection(
        "time"
      ).day;

    const recentStartDay =
      day - 6;

    const menu =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly:
              true
          }
        );

    const menuMap =
      new Map(
        menu.map(
          item => [
            item.dishId,
            item
          ]
        )
      );

    const progressMap =
      new Map(
        restaurantDishSystem
          .listByRestaurant(
            restaurantId
          )
          .map(
            item => [
              item.dishId,
              item
            ]
          )
      );

    const performance =
      new Map();

    for (
      const item
      of menu
    ) {
      performance.set(
        item.dishId,
        {
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
        }
      );
    }

    for (
      const order
      of this.getOrders(
        restaurantId
      )
    ) {
      if (
        !Number.isFinite(
          order.day
        ) ||
        order.day <
          recentStartDay
      ) {
        continue;
      }

      for (
        const item
        of order.items ??
        []
      ) {
        if (
          !menuMap.has(
            item.dishId
          )
        ) {
          continue;
        }

        const current =
          performance.get(
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

        const quantity =
          Number(
            item.quantity ??
            0
          );

        current.sold +=
          quantity;

        current.revenue +=
          Number(
            item.revenue ??
            0
          );

        if (
          Number.isFinite(
            item.qualityScore
          )
        ) {
          current.qualityTotal +=
            item.qualityScore *
            Math.max(
              1,
              quantity
            );

          current.qualityCount +=
            Math.max(
              1,
              quantity
            );
        }

        performance.set(
          item.dishId,
          current
        );
      }
    }

    return [
      ...performance.values()
    ]
      .map(
        item => {
          const dish =
            safeDish(
              item.dishId
            );

          const menuItem =
            menuMap.get(
              item.dishId
            );

          const progress =
            progressMap.get(
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

            custom:
              Boolean(
                dish?.custom
              ),

            quality:
              item.qualityCount >
              0
                ? Math.round(
                    item.qualityTotal /
                    item.qualityCount
                  )
                : (
                    progress
                      ?.recipeQualityScore ??
                    null
                  ),

            lifetimeSold:
              progress
                ?.lifetimeSold ??
              menuItem
                ?.soldCount ??
              0,

            lifetimeRevenue:
              progress
                ?.lifetimeRevenue ??
              menuItem
                ?.totalRevenue ??
              0,

            dishRankId:
              progress
                ?.dishRankId ??
              null,

            dishRankName:
              progress
                ?.dishRankName ??
              "家常",

            dishRankOrder:
              progress
                ?.dishRankOrder ??
              0,

            image:
              dish
                ? getDishVisualSource(
                    dish
                  )
                : null,

            imageSlot:
              dish
                ? getDishVisualSlot(
                    dish
                  )
                : (
                    "dish-" +
                    item.dishId
                  ),

            rankingSource:
              item.sold >
              0
                ? "recent_7d"
                : "menu_fallback"
          };
        }
      )
      .sort(
        (
          a,
          b
        ) => {
          if (
            b.sold !==
            a.sold
          ) {
            return (
              b.sold -
              a.sold
            );
          }

          if (
            b.revenue !==
            a.revenue
          ) {
            return (
              b.revenue -
              a.revenue
            );
          }

          if (
            b.dishRankOrder !==
            a.dishRankOrder
          ) {
            return (
              b.dishRankOrder -
              a.dishRankOrder
            );
          }

          return (
            b.lifetimeSold -
            a.lifetimeSold
          );
        }
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
      this.getFeaturedDishes(
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

    const onboarding =
      onboardingSystem
        .getState(
          restaurantId
        );

    const advisor =
      operatingAdvisorSystem
        .getAdvice(
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

      onboarding,

      advisor,

      reminders:
        advisor.slice(
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

        ...topDishes.map(
          dish => ({
            id:
              dish.imageSlot,

            dishId:
              dish.dishId,

            source:
              dish.image,

            type:
              dish.custom
                ? "custom-dish"
                : "dish",

            static:
              false
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
