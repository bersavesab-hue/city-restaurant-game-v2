import { randomSystem } from "../core/RandomSystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { customerSystem } from "./CustomerSystem.js";
import { orderSystem } from "./OrderSystem.js";
import { eventBus } from "../core/EventBus.js";

class TrafficSystem {
  simulateHour(
    restaurantId,
    {
      minVisitors = 1,
      maxVisitors = 4,
      chefSkill = 50
    } = {}
  ) {
    if (
      !restaurantSystem.isOpen(
        restaurantId
      )
    ) {
      return {
        visitors: 0,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0
      };
    }

    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        { activeOnly: true }
      );

    if (menu.length === 0) {
      return {
        visitors: 0,
        completedOrders: 0,
        failedOrders: 0,
        revenue: 0
      };
    }

    const visitors =
      randomSystem.int(
        minVisitors,
        maxVisitors
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
        menu[
          randomSystem.int(
            0,
            menu.length - 1
          )
        ];

      const quantity =
        randomSystem.int(1, 2);

      const budget =
        Math.max(
          menuItem.price * quantity,
          randomSystem.int(
            menuItem.price,
            menuItem.price * 4
          )
        );

      const customer =
        customerSystem.create({
          name:
            `顾客${Date.now()}_${i}`,
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
            ],

            chefSkill
          });

        completedOrders += 1;
        revenue +=
          order.totalRevenue;
      } catch {
        failedOrders += 1;
      }
    }

    const result = {
      visitors,
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
