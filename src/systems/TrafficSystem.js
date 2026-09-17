import { randomSystem } from "../core/RandomSystem.js";
import { gameState } from "../core/GameState.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { orderSystem } from "./OrderSystem.js";
import { recipeSystem } from "./RecipeSystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";
import { employeeWorkSystem } from "./EmployeeWorkSystem.js";
import { trafficDemandSystem } from "./TrafficDemandSystem.js";
import { customerChoiceSystem } from "./CustomerChoiceSystem.js";

import { eventBus } from "../core/EventBus.js";

class TrafficSystem {
  getMaxPortions(restaurantId, recipeId) {
    const recipe =
      recipeSystem.get(recipeId);

    let maximum = Infinity;

    for (const ingredient of recipe.ingredients) {
      const available =
        inventorySystem.getAvailableQuantity(
          restaurantId,
          ingredient.ingredientId
        );

      maximum = Math.min(
        maximum,
        Math.floor(
          available /
          ingredient.quantity
        )
      );
    }

    return Number.isFinite(maximum)
      ? Math.max(0, maximum)
      : 0;
  }

  simulateDayAggregate(restaurantId) {
    const schedule =
      operatingScheduleSystem.get(
        restaurantId
      );

    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        { activeOnly: true }
      );

    const chef =
      employeeWorkSystem.getBestChef(
        restaurantId
      );

    if (
      !schedule ||
      !schedule.enabled ||
      menu.length === 0 ||
      !chef
    ) {
      return {
        visitors: 0,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0
      };
    }

    const openHours =
      schedule.closeHour -
      schedule.openHour;

    const capacity =
      employeeWorkSystem
        .getServiceCapacity(
          restaurantId
        ) *
      openHours;

    const dailyDemand =
      trafficDemandSystem
        .getDailyDemand(
          restaurantId,
          schedule.openHour,
          schedule.closeHour
        );

    const expected =
      dailyDemand
        .expectedVisitors;

    const visitors =
      Math.min(
        randomSystem.int(
          Math.max(
            0,
            Math.floor(
              expected * 0.85
            )
          ),
          Math.max(
            0,
            Math.ceil(
              expected * 1.15
            )
          )
        ),
        capacity
      );

    let completedOrders = 0;
    let failedOrders = 0;
    let revenue = 0;

    const base =
      Math.floor(
        visitors / menu.length
      );

    let remainder =
      visitors % menu.length;

    for (const menuItem of menu) {
      const orders =
        base +
        (remainder > 0 ? 1 : 0);

      if (remainder > 0) {
        remainder -= 1;
      }

      if (orders <= 0) {
        continue;
      }

      const targetPortions =
        randomSystem.int(
          orders,
          orders * 2
        );

      const portions =
        Math.min(
          targetPortions,
          this.getMaxPortions(
            restaurantId,
            menuItem.recipeId
          )
        );

      const successful =
        Math.min(
          orders,
          portions
        );

      if (successful <= 0) {
        failedOrders += orders;
        continue;
      }

      try {
        const order =
          orderSystem.placeBulk({
            restaurantId,
            menuItemId:
              menuItem.id,
            portions,
            orderCount:
              successful
          });

        completedOrders +=
          successful;

        failedOrders +=
          orders - successful;

        revenue +=
          order.totalRevenue;
      } catch {
        failedOrders += orders;
      }
    }

    return {
      visitors,
      completedOrders,
      failedOrders,
      revenue
    };
  }

  simulateHour(
    restaurantId,
    {
      minVisitors = null,
      maxVisitors = null
    } = {}
  ) {
    if (
      !restaurantSystem.isOpen(
        restaurantId
      )
    ) {
      return {
        visitors: 0,
        rejectedVisitors: 0,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0
      };
    }

    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        {
          activeOnly: true
        }
      );

    if (menu.length === 0) {
      return {
        visitors: 0,
        rejectedVisitors: 0,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0
      };
    }

    const time =
      gameState.getSection(
        "time"
      );

    const demand =
      trafficDemandSystem
        .getHourlyDemand(
          restaurantId,
          time.hour
        );

    const calculatedMin =
      Math.max(
        0,
        Math.floor(
          demand.expectedVisitors *
          0.75
        )
      );

    const calculatedMax =
      Math.max(
        calculatedMin,
        Math.ceil(
          demand.expectedVisitors *
          1.25
        )
      );

    const incomingVisitors =
      randomSystem.int(
        minVisitors ??
          calculatedMin,
        maxVisitors ??
          calculatedMax
      );

    const chef =
      employeeWorkSystem
        .getBestChef(
          restaurantId
        );

    if (!chef) {
      const result = {
        visitors: 0,
        rejectedVisitors:
          incomingVisitors,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0,
        reason:
          "no_available_chef"
      };

      eventBus.emit(
        "traffic:hourCompleted",
        {
          restaurantId,
          ...result
        }
      );

      return result;
    }

    const serviceCapacity =
      employeeWorkSystem
        .getServiceCapacity(
          restaurantId
        );

    const visitors =
      Math.min(
        incomingVisitors,
        serviceCapacity
      );

    const rejectedVisitors =
      Math.max(
        0,
        incomingVisitors -
        visitors
      );

    let completedOrders = 0;
    let failedOrders = 0;
    let revenue = 0;

    for (
      let i = 0;
      i < visitors;
      i += 1
    ) {
      const segmentId =
        randomSystem.weightedPick(
          demand.segments
            .filter(
              item =>
                item.expectedVisitors > 0
            )
            .map(
              item => ({
                value:
                  item.segmentId,
                weight:
                  item.expectedVisitors
              })
            )
        );

      const menuItem =
        customerChoiceSystem
          .chooseMenuItem(
            restaurantId,
            segmentId
          );

      if (!menuItem) {
        failedOrders += 1;
        continue;
      }

      const quantity =
        randomSystem.int(
          1,
          2
        );

      try {
        const order =
          orderSystem.place({
            restaurantId,

            customerId: null,

            items: [
              {
                menuItemId:
                  menuItem.id,
                quantity
              }
            ]
          });

        completedOrders += 1;

        revenue +=
          order.totalRevenue;
      } catch (error) {
        failedOrders += 1;

        eventBus.emit(
          "traffic:orderFailed",
          {
            restaurantId,
            customerId: null,

            error: {
              name:
                error?.name ??
                "Error",

              code:
                error?.code ??
                null,

              message:
                error?.message ??
                "Unknown order error"
            }
          }
        );
      }
    }

    const result = {
      visitors,
      rejectedVisitors,
      completedOrders,
      failedOrders,
      revenue
    };

    eventBus.emit(
      "traffic:hourCompleted",
      {
        restaurantId,
        ...result
      }
    );

    return result;
  }
}

export const trafficSystem =
  new TrafficSystem();

export { TrafficSystem };
