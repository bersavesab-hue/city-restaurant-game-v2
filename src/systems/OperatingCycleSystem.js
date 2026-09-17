import { simulationSystem } from "../core/SimulationSystem.js";
import { entitySystem } from "../core/EntitySystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";
import { trafficSystem } from "./TrafficSystem.js";
import { dailySettlementSystem } from "./DailySettlementSystem.js";
import { employeeWorkSystem } from "./EmployeeWorkSystem.js";

class OperatingCycleSystem {
  constructor() {
    this.registered = false;
  }

  register() {
    if (this.registered) {
      return false;
    }

    simulationSystem.register(
      "restaurant_operations",
      {
        onHour: ({ current }) => {
          const restaurants =
            entitySystem.list(
              "restaurant"
            );

          for (
            const restaurant
            of restaurants
          ) {
            operatingScheduleSystem
              .processHour(
                restaurant.id,
                current.hour
              );

            if (
              restaurantSystem.isOpen(
                restaurant.id
              )
            ) {
              trafficSystem
                .simulateHour(
                  restaurant.id
                );
            } else {
              employeeWorkSystem
                .recoverHour(
                  restaurant.id
                );
            }
          }
        },

        onDay: () => {
          const restaurants =
            entitySystem.list(
              "restaurant"
            );

          for (
            const restaurant
            of restaurants
          ) {
            dailySettlementSystem
              .settle(
                restaurant.id
              );
          }
        }
      },
      {
        priority: 100
      }
    );

    this.registered = true;

    return true;
  }
}

export const operatingCycleSystem =
  new OperatingCycleSystem();

export { OperatingCycleSystem };
