import { randomSystem } from "../core/RandomSystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { customerSystem } from "./CustomerSystem.js";
import { orderSystem } from "./OrderSystem.js";
import { employeeWorkSystem } from "./EmployeeWorkSystem.js";

import { eventBus } from "../core/EventBus.js";

class TrafficSystem {
  simulateHour(
    restaurantId,
    {
      minVisitors = 1,
      maxVisitors = 4
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

    const incomingVisitors =
      randomSystem.int(
        minVisitors,
        maxVisitors
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
      const menuItem =
        randomSystem.pick(
          menu
        );

      const quantity =
        randomSystem.int(
          1,
          2
        );

      const budget =
        Math.max(
          menuItem.price *
            quantity,

          randomSystem.int(
            menuItem.price,
            menuItem.price * 4
          )
        );

      const customer =
        customerSystem.create({
          name:
            `顾客_${restaurantId}_${Date.now()}_${i}`,

          budget,

          priceSensitivity:
            randomSystem.int(
              20,
              80
            ),

          patience:
            randomSystem.int(
              30,
              90
            )
        });

      try {
        const order =
          orderSystem.place({
            restaurantId,

            customerId:
              customer.id,

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
            customerId:
              customer.id,

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
