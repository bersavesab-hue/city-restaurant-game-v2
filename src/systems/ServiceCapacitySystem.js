import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";
import { workforceCapacitySystem } from "./WorkforceCapacitySystem.js";
import { restaurantEquipmentSystem } from "./RestaurantEquipmentSystem.js";
import { renovationSystem } from "./RenovationSystem.js";

const DEFAULT_CONFIG = Object.freeze({
  seats: 16,
  tables: 6,

  averageMealMinutes: 45,

  kitchenStations: 2,
  kitchenPortionsPerHour: 28,

  serviceGuestsPerHour: 24,

  queueToleranceMinutes: 15,

  maxQueueGuests: 40
});

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function currentTime() {
  return gameState.getSection(
    "time"
  );
}

class ServiceCapacitySystem {
  getConfig(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    return {
      seats:
        restaurant
          .capacityConfig
          ?.seats ??
        restaurant.seats ??
        DEFAULT_CONFIG.seats,

      tables:
        restaurant
          .capacityConfig
          ?.tables ??
        restaurant.tables ??
        DEFAULT_CONFIG.tables,

      averageMealMinutes:
        restaurant
          .capacityConfig
          ?.averageMealMinutes ??
        DEFAULT_CONFIG
          .averageMealMinutes,

      kitchenStations:
        restaurant
          .capacityConfig
          ?.kitchenStations ??
        DEFAULT_CONFIG
          .kitchenStations,

      kitchenPortionsPerHour:
        restaurant
          .capacityConfig
          ?.kitchenPortionsPerHour ??
        DEFAULT_CONFIG
          .kitchenPortionsPerHour,

      serviceGuestsPerHour:
        restaurant
          .capacityConfig
          ?.serviceGuestsPerHour ??
        DEFAULT_CONFIG
          .serviceGuestsPerHour,

      queueToleranceMinutes:
        restaurant
          .capacityConfig
          ?.queueToleranceMinutes ??
        DEFAULT_CONFIG
          .queueToleranceMinutes,

      maxQueueGuests:
        restaurant
          .capacityConfig
          ?.maxQueueGuests ??
        DEFAULT_CONFIG
          .maxQueueGuests
    };
  }

  configure(
    restaurantId,
    config
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const current =
      this.getConfig(
        restaurantId
      );

    const next = {
      ...current,
      ...config
    };

    const integerFields = [
      "seats",
      "tables",
      "averageMealMinutes",
      "kitchenStations",
      "kitchenPortionsPerHour",
      "serviceGuestsPerHour",
      "queueToleranceMinutes",
      "maxQueueGuests"
    ];

    for (
      const key
      of integerFields
    ) {
      if (
        !Number.isInteger(
          next[key]
        ) ||
        next[key] <= 0
      ) {
        throw new RangeError(
          `${key} must be a positive integer`
        );
      }
    }

    if (
      next.tables >
      next.seats
    ) {
      throw new Error(
        "tables cannot exceed seats"
      );
    }

    return entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        capacityConfig:
          next
      }
    );
  }

  getHourlyCapacity(
    restaurantId,
    {
      durationMinutes = 60
    } = {}
  ) {
    if (
      !Number.isInteger(
        durationMinutes
      ) ||
      durationMinutes <= 0
    ) {
      throw new RangeError(
        "durationMinutes must be positive"
      );
    }

    const config =
      this.getConfig(
        restaurantId
      );

    const factor =
      durationMinutes /
      60;

    const tableTurns =
      durationMinutes /
      config
        .averageMealMinutes;

    const seatingGuests =
      Math.max(
        1,
        Math.floor(
          config.seats *
          tableTurns
        )
      );

    const baseKitchenGuests =
      Math.max(
        1,
        Math.floor(
          config
            .kitchenPortionsPerHour *
          factor
        )
      );

    const baseServiceGuests =
      Math.max(
        1,
        Math.floor(
          config
            .serviceGuestsPerHour *
          factor
        )
      );

    const renovation =
      renovationSystem
        .getOperationalModifiers(
          restaurantId
        );

    const renovationKitchenGuests =
      Math.max(
        1,
        Math.floor(
          baseKitchenGuests *
          (
            renovation.active
              ? renovation
                  .kitchenEfficiency
              : 1
          )
        )
      );

    const renovationServiceGuests =
      Math.max(
        1,
        Math.floor(
          baseServiceGuests *
          (
            renovation.active
              ? renovation
                  .serviceEfficiency
              : 1
          )
        )
      );

    // -----------------------------------------
    // 员工产能
    // -----------------------------------------

    const workforce =
      workforceCapacitySystem
        .getCapacity(
          restaurantId,
          {
            durationMinutes
          }
        );

    const workforceKitchenGuests =
      workforce.hasStaffData
        ? workforce.kitchenGuests
        : renovationKitchenGuests;

    const workforceServiceGuests =
      workforce.hasStaffData
        ? workforce.serviceGuests
        : renovationServiceGuests;

    const workforceCheckoutGuests =
      workforce.hasStaffData
        ? workforce.checkoutGuests
        : Math.max(
            seatingGuests,
            baseKitchenGuests,
            baseServiceGuests
          );

    // -----------------------------------------
    // 员工不能突破门店基础硬上限
    // -----------------------------------------

    const employeeLimitedKitchen =
      Math.min(
        renovationKitchenGuests,
        workforceKitchenGuests
      );

    const employeeLimitedService =
      Math.min(
        renovationServiceGuests,
        workforceServiceGuests
      );

    let employeeLimitedCheckout =
      workforceCheckoutGuests;

    // -----------------------------------------
    // 设备产能
    // 没有安装专用设备时保持旧系统兼容
    // -----------------------------------------

    const equipmentCapacity =
      restaurantEquipmentSystem
        .getCapacityLimits(
          restaurantId
        );

    const finalKitchenGuests =
      equipmentCapacity
        .kitchenGuests === null
        ? employeeLimitedKitchen
        : Math.min(
            employeeLimitedKitchen,
            equipmentCapacity
              .kitchenGuests
          );

    const finalServiceGuests =
      equipmentCapacity
        .serviceGuests === null
        ? employeeLimitedService
        : Math.min(
            employeeLimitedService,
            equipmentCapacity
              .serviceGuests
          );

    if (
      equipmentCapacity
        .checkoutGuests !== null
    ) {
      employeeLimitedCheckout =
        Math.min(
          employeeLimitedCheckout,
          equipmentCapacity
            .checkoutGuests
        );
    }

    const finalCheckoutGuests =
      Math.max(
        1,
        Math.floor(
          employeeLimitedCheckout
        )
      );

    return {
      durationMinutes,

      seatingGuests,

      kitchenGuests:
        Math.max(
          1,
          finalKitchenGuests
        ),

      serviceGuests:
        Math.max(
          1,
          finalServiceGuests
        ),

      checkoutGuests:
        finalCheckoutGuests,

      baseKitchenGuests,

      baseServiceGuests,

      renovationKitchenGuests,

      renovationServiceGuests,

      renovation,

      workforce,

      equipmentCapacity,

      tableTurns:
        Number(
          tableTurns.toFixed(2)
        )
    };
  }

  determineBottleneck({
    dineInGuests,
    offPremiseGuests,
    seatingCapacity,
    serviceCapacity,
    kitchenCapacity,
    checkoutCapacity = null
  }) {
    const pressures = [
      {
        id: "kitchen",
        name: "厨房",
        ratio:
          kitchenCapacity > 0
            ? (
                dineInGuests +
                offPremiseGuests
              ) /
              kitchenCapacity
            : Infinity
      },

      {
        id: "seating",
        name: "桌位",
        ratio:
          seatingCapacity > 0
            ? dineInGuests /
              seatingCapacity
            : Infinity
      },

      {
        id: "service",
        name: "前厅服务",
        ratio:
          serviceCapacity > 0
            ? dineInGuests /
              serviceCapacity
            : Infinity
      }
    ];

    if (
      Number.isFinite(
        checkoutCapacity
      ) &&
      checkoutCapacity > 0
    ) {
      pressures.push({
        id: "checkout",
        name: "收银",
        ratio:
          (
            dineInGuests +
            offPremiseGuests
          ) /
          checkoutCapacity
      });
    }

    pressures.sort(
      (a, b) =>
        b.ratio -
        a.ratio
    );

    return {
      ...pressures[0],

      ratio:
        Number(
          pressures[0]
            .ratio
            .toFixed(2)
        )
    };
  }

  simulateWindow({
    restaurantId,

    arrivals,

    dineInShare = 1,

    durationMinutes = 60,

    averageSpend = 0,

    record = true
  }) {
    restaurantSystem.get(
      restaurantId
    );

    if (
      !Number.isInteger(
        arrivals
      ) ||
      arrivals < 0
    ) {
      throw new RangeError(
        "arrivals must be a non-negative integer"
      );
    }

    if (
      !Number.isFinite(
        dineInShare
      ) ||
      dineInShare < 0 ||
      dineInShare > 1
    ) {
      throw new RangeError(
        "dineInShare must be between 0 and 1"
      );
    }

    if (
      !Number.isInteger(
        averageSpend
      ) ||
      averageSpend < 0
    ) {
      throw new RangeError(
        "averageSpend must be a non-negative integer"
      );
    }

    const config =
      this.getConfig(
        restaurantId
      );

    const capacity =
      this.getHourlyCapacity(
        restaurantId,
        {
          durationMinutes
        }
      );

    const dineInGuests =
      Math.round(
        arrivals *
        dineInShare
      );

    const offPremiseGuests =
      arrivals -
      dineInGuests;

    const dineInFrontCapacity =
      Math.min(
        capacity.seatingGuests,
        capacity.serviceGuests
      );

    const frontServed =
      Math.min(
        dineInGuests,
        dineInFrontCapacity
      );

    const kitchenRemaining =
      Math.max(
        0,
        capacity.kitchenGuests -
        frontServed
      );

    const offPremiseServed =
      Math.min(
        offPremiseGuests,
        kitchenRemaining
      );

    let served =
      frontServed +
      offPremiseServed;

    served =
      Math.min(
        served,
        capacity.kitchenGuests
      );

    const overflow =
      Math.max(
        0,
        arrivals -
        served
      );

    const theoreticalQueue =
      Math.min(
        overflow,
        config.maxQueueGuests
      );

    const queueOverflow =
      Math.max(
        0,
        overflow -
        config.maxQueueGuests
      );

    const throughputPerMinute =
      Math.max(
        0.1,
        served /
        durationMinutes
      );

    const estimatedWaitMinutes =
      theoreticalQueue > 0
        ? Math.ceil(
            theoreticalQueue /
            throughputPerMinute
          )
        : 0;

    let abandonmentRate = 0;

    if (
      estimatedWaitMinutes >
      config.queueToleranceMinutes
    ) {
      abandonmentRate =
        clamp(
          (
            estimatedWaitMinutes -
            config
              .queueToleranceMinutes
          ) /
          Math.max(
            estimatedWaitMinutes,
            1
          ) *
          0.75,
          0,
          0.75
        );
    }

    const abandonedFromQueue =
      Math.round(
        theoreticalQueue *
        abandonmentRate
      );

    const abandonedGuests =
      queueOverflow +
      abandonedFromQueue;

    const waitingGuests =
      Math.max(
        0,
        theoreticalQueue -
        abandonedFromQueue
      );

    const lostRevenue =
      abandonedGuests *
      averageSpend;

    const bottleneck =
      this.determineBottleneck({
        dineInGuests,
        offPremiseGuests,

        seatingCapacity:
          capacity.seatingGuests,

        serviceCapacity:
          capacity.serviceGuests,

        kitchenCapacity:
          capacity.kitchenGuests
      });

    const result = {
      restaurantId,

      arrivals,

      dineInGuests,
      offPremiseGuests,

      servedGuests:
        served,

      waitingGuests,

      abandonedGuests,

      serviceRate:
        arrivals > 0
          ? Number(
              (
                served /
                arrivals *
                100
              ).toFixed(1)
            )
          : 100,

      abandonmentRate:
        arrivals > 0
          ? Number(
              (
                abandonedGuests /
                arrivals *
                100
              ).toFixed(1)
            )
          : 0,

      estimatedWaitMinutes,

      lostRevenue,

      bottleneck,

      capacity
    };

    if (record) {
      const time =
        currentTime();

      const row =
        entitySystem.create(
          "service_capacity_record",
          {
            ...result,

            day:
              time.day,

            totalMinutes:
              time.totalMinutes
          }
        );

      return {
        ...result,
        recordId:
          row.id
      };
    }

    return result;
  }

  recordActualHour({
    restaurantId,

    arrivals,
    servedGuests,

    waitingGuests = 0,
    abandonedGuests = 0,

    averageSpend = 0,

    seatingCapacity = null,
    serviceCapacity = null,
    kitchenCapacity = null,
    checkoutCapacity = null
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const values = {
      arrivals,
      servedGuests,
      waitingGuests,
      abandonedGuests,
      averageSpend
    };

    for (
      const [name, value]
      of Object.entries(values)
    ) {
      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        throw new RangeError(
          `${name} must be non-negative`
        );
      }
    }

    const config =
      this.getConfig(
        restaurantId
      );

    const configured =
      this.getHourlyCapacity(
        restaurantId
      );

    const finalSeatingCapacity =
      seatingCapacity ??
      configured.seatingGuests;

    const finalServiceCapacity =
      serviceCapacity ??
      configured.serviceGuests;

    const finalKitchenCapacity =
      kitchenCapacity ??
      configured.kitchenGuests;

    const bottleneck =
      this.determineBottleneck({
        dineInGuests:
          arrivals,

        offPremiseGuests:
          0,

        seatingCapacity:
          Math.max(
            1,
            finalSeatingCapacity
          ),

        serviceCapacity:
          Math.max(
            1,
            finalServiceCapacity
          ),

        kitchenCapacity:
          Math.max(
            1,
            finalKitchenCapacity
          ),

        checkoutCapacity:
          Number.isFinite(
            checkoutCapacity
          )
            ? Math.max(
                1,
                checkoutCapacity
              )
            : null
      });

    const estimatedWaitMinutes =
      waitingGuests > 0 &&
      servedGuests > 0
        ? Math.ceil(
            waitingGuests /
            (
              servedGuests /
              60
            )
          )
        : 0;

    const lostRevenue =
      Math.round(
        abandonedGuests *
        averageSpend
      );

    const time =
      currentTime();

    const row =
      entitySystem.create(
        "service_capacity_record",
        {
          restaurantId,

          arrivals,

          dineInGuests:
            arrivals,

          offPremiseGuests:
            0,

          servedGuests,

          waitingGuests,

          abandonedGuests,

          serviceRate:
            arrivals > 0
              ? Number(
                  (
                    servedGuests /
                    arrivals *
                    100
                  ).toFixed(1)
                )
              : 100,

          abandonmentRate:
            arrivals > 0
              ? Number(
                  (
                    abandonedGuests /
                    arrivals *
                    100
                  ).toFixed(1)
                )
              : 0,

          estimatedWaitMinutes,

          lostRevenue,

          bottleneck,

          capacity: {
            seatingGuests:
              finalSeatingCapacity,

            serviceGuests:
              finalServiceCapacity,

            kitchenGuests:
              finalKitchenCapacity
          },

          source:
            "actual_traffic",

          day:
            time.day,

          totalMinutes:
            time.totalMinutes
        }
      );

    return row;
  }

  getRecentRecords(
    restaurantId,
    days = 7
  ) {
    const day =
      currentTime().day;

    const startDay =
      Math.max(
        1,
        day -
        days +
        1
      );

    return entitySystem.filter(
      "service_capacity_record",
      row =>
        row.restaurantId ===
          restaurantId &&
        row.day >=
          startDay &&
        row.day <=
          day
    );
  }

  getDashboard(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const config =
      this.getConfig(
        restaurantId
      );

    const capacity =
      this.getHourlyCapacity(
        restaurantId
      );

    const records =
      this.getRecentRecords(
        restaurantId,
        7
      );

    const totals =
      records.reduce(
        (result, row) => {
          result.arrivals +=
            row.arrivals;

          result.served +=
            row.servedGuests;

          result.waiting +=
            row.waitingGuests;

          result.abandoned +=
            row.abandonedGuests;

          result.lostRevenue +=
            row.lostRevenue;

          result.waitMinutes +=
            row
              .estimatedWaitMinutes;

          result.windows +=
            1;

          return result;
        },
        {
          arrivals: 0,
          served: 0,
          waiting: 0,
          abandoned: 0,
          lostRevenue: 0,
          waitMinutes: 0,
          windows: 0
        }
      );

    const bottlenecks = {
      kitchen: 0,
      seating: 0,
      service: 0
    };

    for (
      const row
      of records
    ) {
      const id =
        row.bottleneck?.id;

      if (
        id &&
        id in bottlenecks
      ) {
        bottlenecks[id] += 1;
      }
    }

    const dominantBottleneck =
      Object.entries(
        bottlenecks
      )
        .sort(
          (a, b) =>
            b[1] -
            a[1]
        )[0];

    return {
      restaurantId,

      config,
      capacity,

      last7Days: {
        ...totals,

        serviceRate:
          totals.arrivals > 0
            ? Number(
                (
                  totals.served /
                  totals.arrivals *
                  100
                ).toFixed(1)
              )
            : 100,

        abandonmentRate:
          totals.arrivals > 0
            ? Number(
                (
                  totals.abandoned /
                  totals.arrivals *
                  100
                ).toFixed(1)
              )
            : 0,

        averageWaitMinutes:
          totals.windows > 0
            ? Math.round(
                totals.waitMinutes /
                totals.windows
              )
            : 0
      },

      bottlenecks,

      dominantBottleneck:
        dominantBottleneck?.[1] > 0
          ? dominantBottleneck[0]
          : null,

      records
    };
  }
}

export const serviceCapacitySystem =
  new ServiceCapacitySystem();

export {
  ServiceCapacitySystem,
  DEFAULT_CONFIG as SERVICE_CAPACITY_DEFAULTS
};
