import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";


import {
  EQUIPMENT_V1,
  EQUIPMENT_DEFINITION_MAP
} from "../data/equipment.v1.js";

import {
  EQUIPMENT_CAPABILITIES,
  validateEquipmentDefinition
} from "../data/equipmentRules.js";

import {
  recipeSystem
} from "./RecipeSystem.js";


const EQUIPMENT_DEFINITIONS =
  EQUIPMENT_DEFINITION_MAP;


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


class RestaurantEquipmentSystem {
  getDefinition(
    equipmentId
  ) {
    const definition =
      EQUIPMENT_DEFINITIONS[
        equipmentId
      ];

    if (!definition) {
      throw new Error(
        `Unknown equipment "${equipmentId}"`
      );
    }

    return {
      ...definition
    };
  }


  getDefinitions() {
    return EQUIPMENT_V1.map(
      item => ({
        ...item,
        capabilities: [
          ...item.capabilities
        ]
      })
    );
  }


  list(
    restaurantId,
    {
      includeRetired = false
    } = {}
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return entitySystem
      .filter(
        "restaurant_equipment",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .filter(
        item =>
          includeRetired ||
          item.status !==
            "retired"
      );
  }


  get(
    equipmentUnitId
  ) {
    const unit =
      entitySystem.get(
        "restaurant_equipment",
        equipmentUnitId
      );

    if (!unit) {
      throw new Error(
        "Restaurant equipment does not exist"
      );
    }

    return unit;
  }


  install({
    restaurantId,
    equipmentId,
    quantity = 1
  }) {
    const definition =
      this.getDefinition(
        equipmentId
      );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      (
        restaurant.level ??
        1
      ) <
      definition.unlockLevel
    ) {
      throw new Error(
        `Equipment "${equipmentId}" unlocks at store level ${definition.unlockLevel}`
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0 ||
      quantity > 20
    ) {
      throw new RangeError(
        "quantity must be between 1 and 20"
      );
    }

    const totalCost =
      definition.purchaseCost *
      quantity;

    financeSystem.expense(
      restaurantId,
      totalCost,
      FINANCE_CATEGORY.EQUIPMENT,
      `购置设备：${definition.name} × ${quantity}`
    );

    const time =
      gameState.getSection(
        "time"
      );

    const units = [];

    for (
      let index = 0;
      index < quantity;
      index += 1
    ) {
      units.push(
        entitySystem.create(
          "restaurant_equipment",
          {
            restaurantId,

            equipmentId:
              definition.id,

            name:
              definition.name,

            equipmentKind:
              definition
                .equipmentKind,

            baseCapacityPerHour:
              definition
                .capacityPerHour,

            purchaseCost:
              definition
                .purchaseCost,

            capabilityTier:
              definition
                .capabilityTier,

            familyId:
              definition
                .familyId,

            capabilities: [
              ...definition
                .capabilities
            ],

            energyType:
              definition
                .energyType,

            energyUsePerHour:
              definition
                .energyUsePerHour,

            footprintUnits:
              definition
                .footprintUnits,

            durability:
              definition
                .baseDurability,

            wearProgress:
              0,

            usageHours:
              0,

            lifetimeGuests:
              0,

            maintenanceCount:
              0,

            status:
              "active",

            installedDay:
              time.day
          }
        )
      );
    }

    return {
      totalCost,
      units
    };
  }


  getInstalledCapabilities(
    restaurantId
  ) {
    const capabilities =
      new Set();

    for (
      const unit
      of this.list(
        restaurantId
      )
    ) {
      if (
        unit.status !==
          "active" ||
        unit.durability <= 0
      ) {
        continue;
      }

      for (
        const capability
        of unit.capabilities ??
        this.getDefinition(
          unit.equipmentId
        ).capabilities ??
        []
      ) {
        capabilities.add(
          capability
        );
      }
    }

    return [
      ...capabilities
    ];
  }


  getCapabilityCoverage(
    restaurantId
  ) {
    const installed =
      new Set(
        this.getInstalledCapabilities(
          restaurantId
        )
      );

    return {
      installed: [
        ...installed
      ],

      total:
        EQUIPMENT_CAPABILITIES.length,

      covered:
        installed.size,

      missing:
        EQUIPMENT_CAPABILITIES.filter(
          capability =>
            !installed.has(
              capability
            )
        )
    };
  }


  getRecipeCapabilityStatus(
    restaurantId,
    recipeId,
    {
      legacyFallback = true
    } = {}
  ) {
    const requirements =
      recipeSystem
        .getOperationalRequirements(
          recipeId
        );

    const activeKitchen =
      this.list(
        restaurantId
      ).filter(
        unit =>
          unit.equipmentKind ===
            "kitchen" &&
          unit.status ===
            "active" &&
          unit.durability > 0
      );

    if (
      legacyFallback &&
      activeKitchen.length === 0
    ) {
      return {
        recipeId,
        compatible: true,
        legacyFallback: true,
        requiredCapabilities: [
          ...requirements
            .equipmentCapabilities
        ],
        installedCapabilities: [],
        missingCapabilities: []
      };
    }

    const installed =
      new Set(
        this.getInstalledCapabilities(
          restaurantId
        )
      );

    const missing =
      requirements
        .equipmentCapabilities
        .filter(
          capability =>
            !installed.has(
              capability
            )
        );

    return {
      recipeId,
      compatible:
        missing.length === 0,
      legacyFallback: false,
      requiredCapabilities: [
        ...requirements
          .equipmentCapabilities
      ],
      installedCapabilities: [
        ...installed
      ],
      missingCapabilities:
        missing
    };
  }


  requireRecipeCapabilities(
    restaurantId,
    recipeId,
    options = {}
  ) {
    const status =
      this.getRecipeCapabilityStatus(
        restaurantId,
        recipeId,
        options
      );

    if (!status.compatible) {
      throw new Error(
        `Missing equipment capabilities for recipe "${recipeId}": ${status.missingCapabilities.join(", ")}`
      );
    }

    return status;
  }


  getConditionFactor(
    durability
  ) {
    const value =
      clamp(
        durability ?? 0,
        0,
        100
      );

    if (value <= 0) {
      return 0;
    }

    if (value < 25) {
      return 0.5;
    }

    if (value < 50) {
      return 0.75;
    }

    if (value < 75) {
      return 0.9;
    }

    return 1;
  }


  getConditionName(
    durability
  ) {
    if (durability <= 0) {
      return "故障";
    }

    if (durability < 25) {
      return "严重老化";
    }

    if (durability < 50) {
      return "老化";
    }

    if (durability < 75) {
      return "正常磨损";
    }

    return "良好";
  }


  getEffectiveCapacity(
    unit
  ) {
    if (
      unit.status !==
        "active" ||
      unit.durability <= 0
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        (
          unit
            .baseCapacityPerHour ??
          0
        ) *
        this.getConditionFactor(
          unit.durability
        )
      )
    );
  }


  getCapacityLimits(
    restaurantId
  ) {
    const units =
      this.list(
        restaurantId
      );

    const kinds = {
      kitchen: {
        installed: 0,
        working: 0,
        capacity: 0
      },

      service: {
        installed: 0,
        working: 0,
        capacity: 0
      },

      checkout: {
        installed: 0,
        working: 0,
        capacity: 0
      },

      support: {
        installed: 0,
        working: 0,
        capacity: 0
      }
    };

    for (
      const unit
      of units
    ) {
      const kind =
        unit.equipmentKind;

      if (!(kind in kinds)) {
        continue;
      }

      kinds[kind]
        .installed += 1;

      const capacity =
        this.getEffectiveCapacity(
          unit
        );

      if (
        unit.status ===
          "active" &&
        unit.durability > 0
      ) {
        kinds[kind]
          .working += 1;
      }

      kinds[kind]
        .capacity +=
        capacity;
    }

    return {
      restaurantId,

      kitchenGuests:
        kinds.kitchen
          .installed > 0
          ? kinds.kitchen
              .capacity
          : null,

      serviceGuests:
        kinds.service
          .installed > 0
          ? kinds.service
              .capacity
          : null,

      checkoutGuests:
        kinds.checkout
          .installed > 0
          ? kinds.checkout
              .capacity
          : null,

      kinds
    };
  }


  recordOperatingHour({
    restaurantId,
    servedGuests = 0,
    completedOrders = 0
  }) {
    const usage =
      Math.max(
        0,
        servedGuests,
        completedOrders
      );

    if (usage <= 0) {
      return [];
    }

    const units =
      this.list(
        restaurantId
      );

    const changes = [];

    for (
      const unit
      of units
    ) {
      if (
        unit.status !==
          "active" ||
        unit.durability <= 0
      ) {
        continue;
      }

      const definition =
        this.getDefinition(
          unit.equipmentId
        );

      const progress =
        (
          unit.wearProgress ??
          0
        ) +
        usage *
        definition
          .wearPer100Guests /
        100;

      const wearLoss =
        Math.floor(
          progress
        );

      const remainder =
        progress -
        wearLoss;

      const durability =
        clamp(
          unit.durability -
          wearLoss,
          0,
          100
        );

      const status =
        durability <= 0
          ? "broken"
          : "active";

      const updated =
        entitySystem.update(
          "restaurant_equipment",
          unit.id,
          {
            durability,

            wearProgress:
              remainder,

            usageHours:
              (
                unit
                  .usageHours ??
                0
              ) + 1,

            lifetimeGuests:
              (
                unit
                  .lifetimeGuests ??
                0
              ) +
              usage,

            status
          }
        );

      changes.push(
        updated
      );
    }

    return changes;
  }


  repair(
    equipmentUnitId
  ) {
    const unit =
      this.get(
        equipmentUnitId
      );

    if (
      unit.status ===
      "retired"
    ) {
      throw new Error(
        "Retired equipment cannot be repaired"
      );
    }

    const missing =
      Math.max(
        0,
        100 -
        unit.durability
      );

    if (missing <= 0) {
      return {
        cost: 0,
        unit
      };
    }

    const definition =
      this.getDefinition(
        unit.equipmentId
      );

    const cost =
      missing *
      definition
        .repairCostPerPoint;

    financeSystem.expense(
      unit.restaurantId,
      cost,
      FINANCE_CATEGORY.EQUIPMENT,
      `设备维修：${unit.name}`
    );

    const updated =
      entitySystem.update(
        "restaurant_equipment",
        unit.id,
        {
          durability:
            100,

          wearProgress:
            0,

          status:
            "active",

          maintenanceCount:
            (
              unit
                .maintenanceCount ??
              0
            ) + 1,

          lastMaintenanceDay:
            gameState
              .getSection(
                "time"
              ).day
        }
      );

    return {
      cost,
      unit:
        updated
    };
  }


  setOperational(
    equipmentUnitId,
    operational
  ) {
    const unit =
      this.get(
        equipmentUnitId
      );

    if (
      operational &&
      unit.durability <= 0
    ) {
      throw new Error(
        "Broken equipment must be repaired first"
      );
    }

    return entitySystem.update(
      "restaurant_equipment",
      unit.id,
      {
        status:
          operational
            ? "active"
            : "inactive"
      }
    );
  }


  retire(
    equipmentUnitId
  ) {
    const unit =
      this.get(
        equipmentUnitId
      );

    return entitySystem.update(
      "restaurant_equipment",
      unit.id,
      {
        status:
          "retired",

        retiredDay:
          gameState
            .getSection(
              "time"
            ).day
      }
    );
  }


  getDashboard(
    restaurantId
  ) {
    const equipment =
      this.list(
        restaurantId
      );

    const limits =
      this.getCapacityLimits(
        restaurantId
      );

    const rows =
      equipment.map(
        unit => ({
          ...unit,

          conditionName:
            this.getConditionName(
              unit.durability
            ),

          conditionFactor:
            this.getConditionFactor(
              unit.durability
            ),

          effectiveCapacity:
            this.getEffectiveCapacity(
              unit
            )
        })
      );

    return {
      restaurantId,

      installed:
        rows.length,

      working:
        rows.filter(
          item =>
            item.status ===
              "active" &&
            item.durability > 0
        ).length,

      broken:
        rows.filter(
          item =>
            item.durability <= 0 ||
            item.status ===
              "broken"
        ).length,

      maintenanceDue:
        rows.filter(
          item =>
            item.durability > 0 &&
            item.durability <= 30
        ).length,

      capacity:
        limits,

      equipment:
        rows
    };
  }
}


export const restaurantEquipmentSystem =
  new RestaurantEquipmentSystem();

export {
  RestaurantEquipmentSystem,
  EQUIPMENT_DEFINITIONS
};
