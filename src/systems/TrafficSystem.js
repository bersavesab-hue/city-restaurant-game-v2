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
import { seatingSystem } from "./SeatingSystem.js";
import { customerExperienceSystem } from "./CustomerExperienceSystem.js";
import { businessCausalitySystem } from "./BusinessCausalitySystem.js";
import { serviceCapacitySystem } from "./ServiceCapacitySystem.js";
import { marketActionSystem } from "./MarketActionSystem.js";
import { salesChannelSystem } from "./SalesChannelSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";

import { eventBus } from "../core/EventBus.js";
import { restaurantEquipmentSystem } from "./RestaurantEquipmentSystem.js";

class TrafficSystem {
  getMaxPortions(restaurantId, recipeId) {
    const recipe =
      recipeSystem.get(recipeId);

    let maximum = Infinity;

    const ingredientEfficiency =
      Number.isFinite(
        recipe.ingredientEfficiency
      )
        ? Math.max(
            0.85,
            Math.min(
              1,
              recipe.ingredientEfficiency
            )
          )
        : 1;

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
          (
            ingredient.quantity *
            ingredientEfficiency
          )
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

    const serviceCapacity =
      Math.floor(
        employeeWorkSystem
          .getServiceCapacity(
            restaurantId
          ) *
        marketActionSystem
          .getModifiers(
            restaurantId
          )
          .serviceCapacityMultiplier *
        openHours
      );

    const dailyDemand =
      trafficDemandSystem
        .getDailyDemand(
          restaurantId,
          schedule.openHour,
          schedule.closeHour
        );

    const seatingCapacity =
      dailyDemand.hours.reduce(
        (sum, demand) =>
          sum +
          seatingSystem
            .getHourlyCapacity(
              restaurantId,
              demand
            )
            .capacity,
        0
      );

    const capacity =
      Math.min(
        serviceCapacity,
        seatingCapacity
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
      Math.max(
        1,
        Math.floor(
          employeeWorkSystem
            .getServiceCapacity(
              restaurantId
            ) *
          marketActionSystem
            .getModifiers(
              restaurantId
            )
            .serviceCapacityMultiplier
        )
      );

    const seating =
      seatingSystem.getHourFlow(
        restaurantId,
        incomingVisitors,
        demand
      );

    const configuredCapacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurantId,
          {
            durationMinutes: 60
          }
        );

    const frontAcceptedVisitors =
      Math.min(
        seating.acceptedVisitors,
        serviceCapacity,
        configuredCapacity
          .serviceGuests
      );

    const serviceRejectedVisitors =
      Math.max(
        0,
        seating.acceptedVisitors -
        frontAcceptedVisitors
      );

    const kitchenAcceptedVisitors =
      Math.min(
        frontAcceptedVisitors,
        configuredCapacity
          .kitchenGuests
      );

    const kitchenRejectedVisitors =
      Math.max(
        0,
        frontAcceptedVisitors -
        kitchenAcceptedVisitors
      );

    const visitors =
      Math.min(
        kitchenAcceptedVisitors,
        configuredCapacity
          .checkoutGuests
      );

    const checkoutRejectedVisitors =
      Math.max(
        0,
        kitchenAcceptedVisitors -
        visitors
      );

    const rejectedVisitors =
      seating.queueAbandoned +
      serviceRejectedVisitors +
      kitchenRejectedVisitors +
      checkoutRejectedVisitors;

    let completedOrders = 0;
    let failedOrders = 0;
    let revenue = 0;

    let qualityTotal = 0;
    let qualityCount = 0;

    const marketingModifiers =
      marketActionSystem
        .getModifiers(
          restaurantId
        );

    const channelStats =
      new Map();

    const segmentStats =
      new Map();

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

      const segmentStat =
        segmentStats.get(
          segmentId
        ) ?? {
          segmentId,
          arrivals: 0,
          served: 0,
          failed: 0,
          revenue: 0,
          qualityTotal: 0,
          qualityCount: 0
        };

      segmentStat.arrivals += 1;

      segmentStats.set(
        segmentId,
        segmentStat
      );

      const menuItem =
        customerChoiceSystem
          .chooseMenuItem(
            restaurantId,
            segmentId
          );

      if (!menuItem) {
        failedOrders += 1;

        segmentStat.failed += 1;

        continue;
      }

      const quantity =
        randomSystem.int(
          1,
          2
        );

      try {
        const segment =
          customerSegmentSystem.get(
            segmentId
          );

        const channelWeights =
          salesChannelSystem
            .getDemandWeights(
              restaurantId,
              {
                segment,
                channelMultipliers:
                  marketingModifiers
                    .channelMultipliers ??
                  {}
              }
            );

        if (
          channelWeights.length ===
          0
        ) {
          const error =
            new Error(
              "No sales channel has available capacity"
            );

          error.code =
            "NO_CHANNEL_CAPACITY";

          throw error;
        }

        const channelId =
          randomSystem.weightedPick(
            channelWeights.map(
              item => ({
                value:
                  item.channelId,
                weight:
                  item.rawWeight
              })
            )
          );

        const order =
          orderSystem.place({
            restaurantId,

            customerId: null,

            customerSegmentId:
              segmentId,

            channelId,

            items: [
              {
                menuItemId:
                  menuItem.id,
                quantity
              }
            ]
          });

        const channelStat =
          channelStats.get(
            channelId
          ) ?? {
            channelId,
            orders: 0,
            revenue: 0
          };

        channelStat.orders += 1;
        channelStat.revenue +=
          order.totalRevenue;

        channelStats.set(
          channelId,
          channelStat
        );

        completedOrders += 1;

        qualityTotal +=
          order.averageQuality;

        qualityCount += 1;

        revenue +=
          order.totalRevenue;

        segmentStat.served += 1;

        segmentStat.revenue +=
          order.totalRevenue;

        segmentStat.qualityTotal +=
          order.averageQuality;

        segmentStat.qualityCount += 1;
      } catch (error) {
        failedOrders += 1;

        segmentStat.failed += 1;

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

    const throughputPerMinute =
      visitors > 0
        ? visitors / 60
        : 0;

    const estimatedWaitMinutes =
      seating.queuedVisitors > 0 &&
      throughputPerMinute > 0
        ? Math.ceil(
            seating.queuedVisitors /
            throughputPerMinute
          )
        : 0;

    const totalDemandWeight =
      demand.segments.reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            item.expectedVisitors ??
            0
          ),
        0
      );

    const segmentOutcomes =
      demand.segments.map(
        item => {
          const stat =
            segmentStats.get(
              item.segmentId
            ) ?? {
              segmentId:
                item.segmentId,
              arrivals: 0,
              served: 0,
              failed: 0,
              revenue: 0,
              qualityTotal: 0,
              qualityCount: 0
            };

          const rejectedShare =
            totalDemandWeight > 0
              ? rejectedVisitors *
                (
                  Math.max(
                    0,
                    item.expectedVisitors ??
                    0
                  ) /
                  totalDemandWeight
                )
              : 0;

          return {
            segmentId:
              item.segmentId,

            expectedVisitors:
              item.expectedVisitors,

            arrivals:
              stat.arrivals,

            served:
              stat.served,

            failed:
              stat.failed,

            rejected:
              Number(
                rejectedShare
                  .toFixed(2)
              ),

            revenue:
              stat.revenue,

            averageQuality:
              stat.qualityCount > 0
                ? Math.round(
                    stat.qualityTotal /
                    stat.qualityCount
                  )
                : 0,

            priceFactor:
              item.priceFactor,

            competitionFactor:
              item.competitionFactor,

            marketShare:
              item.marketShare
          };
        }
      );

    const result = {
      incomingVisitors,

      visitors,
      rejectedVisitors,

      estimatedWaitMinutes,

      queuePatienceMinutes:
        seating.queuePatienceMinutes,

      segmentOutcomes,

      queuedVisitors:
        seating.queuedVisitors,

      queueAbandoned:
        seating.queueAbandoned,

      serviceRejectedVisitors,

      kitchenRejectedVisitors,

      checkoutRejectedVisitors,

      kitchenCapacity:
        configuredCapacity
          .kitchenGuests,

      checkoutCapacity:
        configuredCapacity
          .checkoutGuests,

      workforce:
        configuredCapacity
          .workforce,

      serviceCapacity,

      configuredSeatingCapacity:
        configuredCapacity
          .seatingGuests,

      seats:
        seating.seats,

      turnoverRate:
        seating.turnoverRate,

      completedOrders,
      failedOrders,
      revenue,

      channelOutcomes:
        [
          ...channelStats
            .values()
        ],

      averageQuality:
        qualityCount > 0
          ? Math.round(
              qualityTotal /
              qualityCount
            )
          : 0
    };

    result.experience =
      customerExperienceSystem
        .recordHour({
          restaurantId,
          demand,
          result
        });

    const averageSpend =
      completedOrders > 0
        ? Math.round(
            revenue /
            completedOrders
          )
        : 0;

    result.equipmentWear =
      restaurantEquipmentSystem
        .recordOperatingHour({
          restaurantId,

          servedGuests:
            visitors,

          completedOrders
        });

    result.capacityRecord =
      serviceCapacitySystem
        .recordActualHour({
          restaurantId,

          arrivals:
            incomingVisitors,

          servedGuests:
            visitors,

          waitingGuests:
            seating.queuedVisitors,

          abandonedGuests:
            rejectedVisitors,

          averageSpend,

          seatingCapacity:
            configuredCapacity
              .seatingGuests,

          serviceCapacity,

          kitchenCapacity:
            configuredCapacity
              .kitchenGuests,

          checkoutCapacity:
            configuredCapacity
              .checkoutGuests
        });

    result.causalityRecord =
      businessCausalitySystem
        .recordHour({
          restaurantId,
          demand,
          result
        });

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
