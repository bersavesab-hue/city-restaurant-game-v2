import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  restaurantEquipmentSystem
} from "../src/systems/RestaurantEquipmentSystem.js";

import {
  equipmentMaintenanceSystem
} from "../src/systems/EquipmentMaintenanceSystem.js";

import {
  equipmentMaintenancePageSystem
} from "../src/ui/pages/equipment-maintenance/EquipmentMaintenancePageSystem.js";

import {
  EquipmentMaintenanceView
} from "../src/ui/pages/equipment-maintenance/EquipmentMaintenanceView.js";


test(
  "设备支持故障保养维修停机升级和换新生命周期",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "设备维护测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      200000
    );

    const installed =
      restaurantEquipmentSystem
        .install({
          restaurantId:
            restaurant.id,

          equipmentId:
            "gas_range"
        });

    const unit =
      installed.units[0];

    entitySystem.update(
      "restaurant_equipment",
      unit.id,
      {
        durability: 40
      }
    );

    const maintenance =
      equipmentMaintenanceSystem
        .preventiveMaintenance(
          unit.id
        );

    assert.ok(
      maintenance.cost >
      0
    );

    assert.equal(
      maintenance.unit.status,
      "maintenance"
    );

    const day =
      gameState
        .getSection(
          "time"
        ).day;

    equipmentMaintenanceSystem
      .processDay(
        day + 1
      );

    const restored =
      restaurantEquipmentSystem
        .get(
          unit.id
        );

    assert.equal(
      restored.status,
      "active"
    );

    const beforeCapacity =
      restored
        .baseCapacityPerHour;

    const upgrade =
      equipmentMaintenanceSystem
        .upgrade(
          unit.id
        );

    assert.equal(
      upgrade.unit.upgradeLevel,
      1
    );

    assert.ok(
      upgrade.unit
        .baseCapacityPerHour >
      beforeCapacity
    );

    equipmentMaintenanceSystem
      .processDay(
        day + 2
      );

    const upgraded =
      restaurantEquipmentSystem
        .get(
          unit.id
        );

    assert.equal(
      upgraded.status,
      "active"
    );

    equipmentMaintenanceSystem
      .failUnit(
        unit.id,
        {
          reason:
            "test_failure"
        }
      );

    const broken =
      restaurantEquipmentSystem
        .get(
          unit.id
        );

    assert.equal(
      broken.status,
      "broken"
    );

    const repair =
      equipmentMaintenanceSystem
        .repairBroken(
          unit.id
        );

    assert.ok(
      repair.cost >
      0
    );

    assert.equal(
      repair.unit.status,
      "maintenance"
    );

    equipmentMaintenanceSystem
      .processDay(
        day +
        2 +
        repair.downtimeDays
      );

    assert.equal(
      restaurantEquipmentSystem
        .get(
          unit.id
        ).status,
      "active"
    );

    const replacement =
      equipmentMaintenanceSystem
        .replace(
          unit.id
        );

    assert.equal(
      replacement
        .oldUnit
        .status,
      "retired"
    );

    assert.equal(
      replacement
        .newUnit
        .status,
      "active"
    );

    const page =
      equipmentMaintenancePageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new EquipmentMaintenanceView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /设备维护/
    );

    assert.match(
      html,
      /故障风险/
    );

    assert.match(
      html,
      /维护记录/
    );

    assert.ok(
      page.events.length >=
      4
    );
  }
);
