import { simulationSystem } from "../core/SimulationSystem.js";
import { entitySystem } from "../core/EntitySystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";
import { trafficSystem } from "./TrafficSystem.js";
import { dailySettlementSystem } from "./DailySettlementSystem.js";
import { employeeWorkSystem } from "./EmployeeWorkSystem.js";
import { employeeDynamicsSystem } from "./EmployeeDynamicsSystem.js";
import { leaseSystem } from "./LeaseSystem.js";
import { propertyMarketSystem } from "./PropertyMarketSystem.js";
import { propertyLeaseMarketSystem } from "./PropertyLeaseMarketSystem.js";
import { historyArchiveSystem } from "./HistoryArchiveSystem.js";
import { periodArchiveSystem } from "./PeriodArchiveSystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { procurementSystem } from "./ProcurementSystem.js";
import { autoProcurementSystem } from "./AutoProcurementSystem.js";
import { competitorDynamicsSystem } from "./CompetitorDynamicsSystem.js";
import { marketActionSystem } from "./MarketActionSystem.js";
import { districtEventSystem } from "./DistrictEventSystem.js";
import { marketInsightSystem } from "./MarketInsightSystem.js";
import { renovationConstructionSystem } from "./RenovationConstructionSystem.js";
import { equipmentMaintenanceSystem } from "./EquipmentMaintenanceSystem.js";
import { awardSystem } from "./AwardSystem.js";
import { customerLoyaltySystem } from "./CustomerLoyaltySystem.js";
import { wordOfMouthSystem } from "./WordOfMouthSystem.js";
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
        onLongDay: () => {
          const restaurants =
            entitySystem.list(
              "restaurant"
            );

          for (
            const restaurant
            of restaurants
          ) {
            trafficSystem
              .simulateDayAggregate(
                restaurant.id
              );

            autoProcurementSystem
              .processRestaurant(
                restaurant.id
              );
          }
        },

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

            autoProcurementSystem
              .processRestaurant(
                restaurant.id
              );
          }
        },

        onDay: ({ current }) => {
          const restaurants =
            entitySystem.list(
              "restaurant"
            );

          for (
            const restaurant
            of restaurants
          ) {
            dailySettlementSystem
              .settleThrough(
                restaurant.id,
                current.day - 1
              );
          }

          for (
            const restaurant
            of restaurants
          ) {
            employeeDynamicsSystem
              .refreshRestaurant(
                restaurant.id
              );
          }

          for (
            const restaurant
            of restaurants
          ) {
            inventorySystem
              .discardSpoiled(
                restaurant.id
              );

            inventorySystem
              .pruneInactive(
                restaurant.id
              );

            procurementSystem
              .settlePayables(
                restaurant.id,
                current.day
              );

            procurementSystem
              .pruneHistory(
                restaurant.id
              );
          }

          customerLoyaltySystem
            .processDay(
              current.day
            );

          wordOfMouthSystem
            .pruneHistory(
              current.day
            );
marketActionSystem
            .processDay(
              current.day
            );

          districtEventSystem
            .processDay(
              current.day
            );

          competitorDynamicsSystem
            .processDay(
              current.day
            );

          marketInsightSystem
            .processDay(
              current.day
            );

          equipmentMaintenanceSystem
            .processDay(
              current.day
            );

          renovationConstructionSystem
            .processDay(
              current.day
            );

          leaseSystem.processDay(
            current.day
          );

          propertyLeaseMarketSystem.processDay(
            current.day
          );

          propertyMarketSystem.processDay(
            current.day
          );

          historyArchiveSystem
            .processAll(
              current.day
            );

          awardSystem
            .processDay(
              current.day
            );

          for (
            const restaurant
            of restaurants
          ) {
            periodArchiveSystem
              .archiveRestaurant(
                restaurant.id,
                current.day
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
