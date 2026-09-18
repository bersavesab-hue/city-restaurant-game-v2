import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  randomSystem
} from "../core/RandomSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  restaurantEquipmentSystem
} from "./RestaurantEquipmentSystem.js";


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


class EquipmentMaintenanceSystem {
  getCurrentDay() {
    return gameState
      .getSection(
        "time"
      ).day;
  }


  getUnit(
    equipmentUnitId
  ) {
    return restaurantEquipmentSystem
      .get(
        equipmentUnitId
      );
  }


  getFailureRisk(
    unit
  ) {
    if (
      unit.status !==
        "active" ||
      unit.durability <= 0
    ) {
      return 0;
    }

    const maxDurability =
      Math.max(
        1,
        unit.maxDurability ??
        restaurantEquipmentSystem
          .getDefinition(
            unit.equipmentId
          )
          .baseDurability ??
        100
      );

    const durabilityRatio =
      clamp(
        unit.durability /
        maxDurability,
        0,
        1
      );

    let risk = 0.002;

    if (durabilityRatio <= 0.2) {
      risk += 0.16;
    } else if (
      durabilityRatio <= 0.35
    ) {
      risk += 0.08;
    } else if (
      durabilityRatio <= 0.5
    ) {
      risk += 0.035;
    } else if (
      durabilityRatio <= 0.7
    ) {
      risk += 0.012;
    }

    const usageHours =
      unit.usageHours ?? 0;

    risk +=
      Math.min(
        0.04,
        usageHours /
        25000
      );

    const maintenanceCount =
      unit.maintenanceCount ??
      0;

    risk -=
      Math.min(
        0.015,
        maintenanceCount *
        0.002
      );

    return clamp(
      risk,
      0,
      0.25
    );
  }


  failUnit(
    equipmentUnitId,
    {
      reason =
        "unexpected_failure",

      downtimeDays = 1
    } = {}
  ) {
    const unit =
      this.getUnit(
        equipmentUnitId
      );

    if (
      unit.status ===
        "retired"
    ) {
      return unit;
    }

    const day =
      this.getCurrentDay();

    const updated =
      entitySystem.update(
        "restaurant_equipment",
        unit.id,
        {
          status:
            "broken",

          failureReason:
            reason,

          failedDay:
            day,

          repairAvailableDay:
            day +
            Math.max(
              1,
              downtimeDays
            ),

          failureCount:
            (
              unit.failureCount ??
              0
            ) + 1
        }
      );

    entitySystem.create(
      "equipment_event",
      {
        restaurantId:
          unit.restaurantId,

        equipmentUnitId:
          unit.id,

        eventKind:
          "failure",

        day,

        reason,

        durability:
          unit.durability
      }
    );

    return updated;
  }


  preventiveMaintenance(
    equipmentUnitId
  ) {
    const unit =
      this.getUnit(
        equipmentUnitId
      );

    if (
      unit.status !==
        "active"
    ) {
      throw new Error(
        "Only active equipment can receive preventive maintenance"
      );
    }

    const definition =
      restaurantEquipmentSystem
        .getDefinition(
          unit.equipmentId
        );

    const maxDurability =
      unit.maxDurability ??
      definition.baseDurability ??
      100;

    const durabilityGain =
      Math.min(
        25,
        Math.max(
          0,
          maxDurability -
          unit.durability
        )
      );

    const cost =
      Math.max(
        300,
        Math.round(
          definition
            .purchaseCost *
          0.04 +
          durabilityGain *
          definition
            .repairCostPerPoint *
          0.3
        )
      );

    financeSystem.expense(
      unit.restaurantId,
      cost,
      FINANCE_CATEGORY.EQUIPMENT,
      `预防保养：${unit.name}`
    );

    const day =
      this.getCurrentDay();

    const updated =
      entitySystem.update(
        "restaurant_equipment",
        unit.id,
        {
          durability:
            clamp(
              unit.durability +
              durabilityGain,
              0,
              maxDurability
            ),

          status:
            "maintenance",

          maintenanceEndDay:
            day + 1,

          maintenanceCount:
            (
              unit
                .maintenanceCount ??
              0
            ) + 1,

          lastMaintenanceDay:
            day
        }
      );

    entitySystem.create(
      "equipment_event",
      {
        restaurantId:
          unit.restaurantId,

        equipmentUnitId:
          unit.id,

        eventKind:
          "preventive_maintenance",

        day,

        cost,

        durabilityBefore:
          unit.durability,

        durabilityAfter:
          updated.durability
      }
    );

    return {
      cost,
      downtimeDays: 1,
      unit:
        updated
    };
  }


  repairBroken(
    equipmentUnitId
  ) {
    const unit =
      this.getUnit(
        equipmentUnitId
      );

    if (
      unit.status !==
        "broken"
    ) {
      throw new Error(
        "Equipment is not broken"
      );
    }

    const definition =
      restaurantEquipmentSystem
        .getDefinition(
          unit.equipmentId
        );

    const maxDurability =
      unit.maxDurability ??
      definition.baseDurability ??
      100;

    const missing =
      Math.max(
        1,
        maxDurability -
        unit.durability
      );

    const failurePremium =
      1 +
      Math.min(
        0.5,
        (
          unit.failureCount ??
          1
        ) *
        0.05
      );

    const cost =
      Math.max(
        500,
        Math.round(
          missing *
          definition
            .repairCostPerPoint *
          failurePremium
        )
      );

    financeSystem.expense(
      unit.restaurantId,
      cost,
      FINANCE_CATEGORY.EQUIPMENT,
      `故障维修：${unit.name}`
    );

    const day =
      this.getCurrentDay();

    const downtimeDays =
      unit.durability /
        Math.max(
          1,
          maxDurability
        ) <=
        0.2
          ? 2
          : 1;

    const updated =
      entitySystem.update(
        "restaurant_equipment",
        unit.id,
        {
          durability:
            Math.max(
              Math.round(
                maxDurability *
                0.75
              ),
              unit.durability
            ),

          maxDurability,

          status:
            "maintenance",

          maintenanceEndDay:
            day +
            downtimeDays,

          lastRepairDay:
            day,

          repairCount:
            (
              unit.repairCount ??
              0
            ) + 1
        }
      );

    entitySystem.create(
      "equipment_event",
      {
        restaurantId:
          unit.restaurantId,

        equipmentUnitId:
          unit.id,

        eventKind:
          "repair",

        day,

        cost,

        downtimeDays
      }
    );

    return {
      cost,
      downtimeDays,
      unit:
        updated
    };
  }


  upgrade(
    equipmentUnitId
  ) {
    const unit =
      this.getUnit(
        equipmentUnitId
      );

    if (
      unit.status ===
        "retired" ||
      unit.status ===
        "broken"
    ) {
      throw new Error(
        "Equipment cannot be upgraded in current status"
      );
    }

    const level =
      unit.upgradeLevel ??
      0;

    if (level >= 5) {
      throw new Error(
        "Equipment upgrade level maxed"
      );
    }

    const definition =
      restaurantEquipmentSystem
        .getDefinition(
          unit.equipmentId
        );

    const nextLevel =
      level + 1;

    const cost =
      Math.round(
        definition
          .purchaseCost *
        (
          0.35 +
          nextLevel *
          0.12
        )
      );

    financeSystem.expense(
      unit.restaurantId,
      cost,
      FINANCE_CATEGORY.EQUIPMENT,
      `设备升级：${unit.name} Lv.${nextLevel}`
    );

    const day =
      this.getCurrentDay();

    const capacityIncrease =
      unit.baseCapacityPerHour >
      0
        ? Math.max(
            1,
            Math.round(
              unit
                .baseCapacityPerHour *
              0.15
            )
          )
        : 0;

    const updated =
      entitySystem.update(
        "restaurant_equipment",
        unit.id,
        {
          upgradeLevel:
            nextLevel,

          baseCapacityPerHour:
            unit
              .baseCapacityPerHour +
            capacityIncrease,

          durability:
            Math.min(
              unit.maxDurability ??
              definition.baseDurability ??
              100,
              unit.durability +
              10
            ),

          status:
            "maintenance",

          maintenanceEndDay:
            day + 1,

          lastUpgradeDay:
            day
        }
      );

    entitySystem.create(
      "equipment_event",
      {
        restaurantId:
          unit.restaurantId,

        equipmentUnitId:
          unit.id,

        eventKind:
          "upgrade",

        day,

        level:
          nextLevel,

        cost,

        capacityIncrease
      }
    );

    return {
      cost,
      downtimeDays: 1,
      capacityIncrease,
      unit:
        updated
    };
  }


  replace(
    equipmentUnitId
  ) {
    const oldUnit =
      this.getUnit(
        equipmentUnitId
      );

    if (
      oldUnit.status ===
        "retired"
    ) {
      throw new Error(
        "Equipment is already retired"
      );
    }

    const restaurantId =
      oldUnit.restaurantId;

    const equipmentId =
      oldUnit.equipmentId;

    restaurantEquipmentSystem
      .retire(
        oldUnit.id
      );

    const result =
      restaurantEquipmentSystem
        .install({
          restaurantId,
          equipmentId,
          quantity: 1
        });

    const newUnit =
      result.units[0];

    entitySystem.create(
      "equipment_event",
      {
        restaurantId,

        equipmentUnitId:
          oldUnit.id,

        replacementUnitId:
          newUnit.id,

        eventKind:
          "replacement",

        day:
          this.getCurrentDay(),

        cost:
          result.totalCost
      }
    );

    return {
      cost:
        result.totalCost,

      oldUnit:
        restaurantEquipmentSystem
          .get(
            oldUnit.id
          ),

      newUnit
    };
  }


  restoreCompletedMaintenance(
    day
  ) {
    const units =
      entitySystem.filter(
        "restaurant_equipment",
        item =>
          item.status ===
            "maintenance" &&
          Number.isInteger(
            item.maintenanceEndDay
          ) &&
          item.maintenanceEndDay <=
            day
      );

    const restored = [];

    for (
      const unit
      of units
    ) {
      restored.push(
        entitySystem.update(
          "restaurant_equipment",
          unit.id,
          {
            status:
              "active",

            maintenanceEndDay:
              null
          }
        )
      );
    }

    return restored;
  }


  processFailures(
    day
  ) {
    const units =
      entitySystem.filter(
        "restaurant_equipment",
        item =>
          item.status ===
            "active" &&
          item.durability > 0
      );

    const failures = [];

    for (
      const unit
      of units
    ) {
      const risk =
        this.getFailureRisk(
          unit
        );

      if (
        randomSystem.chance(
          risk
        )
      ) {
        const result =
          this.failUnit(
            unit.id,
            {
              reason:
                "wear_failure",

              downtimeDays:
                unit.durability <= 20
                  ? 2
                  : 1
            }
          );

        failures.push(
          result
        );
      }
    }

    return failures;
  }


  processDay(
    day =
      this.getCurrentDay()
  ) {
    const restored =
      this.restoreCompletedMaintenance(
        day
      );

    const failures =
      this.processFailures(
        day
      );

    return {
      day,
      restored,
      failures
    };
  }


  getEvents(
    restaurantId,
    limit = 20
  ) {
    return entitySystem
      .filter(
        "equipment_event",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          b.day -
          a.day
      )
      .slice(
        0,
        limit
      );
  }


  getDashboard(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const equipment =
      restaurantEquipmentSystem
        .getDashboard(
          restaurantId
        );

    const rows =
      equipment.equipment.map(
        unit => ({
          ...unit,

          failureRisk:
            Number(
              (
                this.getFailureRisk(
                  unit
                ) *
                100
              ).toFixed(1)
            ),

          upgradeLevel:
            unit.upgradeLevel ??
            0,

          inDowntime:
            unit.status ===
              "maintenance",

          repairable:
            unit.status ===
              "broken"
        })
      );

    return {
      restaurantId,

      installed:
        equipment.installed,

      working:
        equipment.working,

      broken:
        equipment.broken,

      maintenance:
        rows.filter(
          item =>
            item.status ===
              "maintenance"
        ).length,

      highRisk:
        rows.filter(
          item =>
            item.failureRisk >=
            8
        ).length,

      equipment:
        rows,

      events:
        this.getEvents(
          restaurantId
        )
    };
  }
}


export const equipmentMaintenanceSystem =
  new EquipmentMaintenanceSystem();

export {
  EquipmentMaintenanceSystem
};
