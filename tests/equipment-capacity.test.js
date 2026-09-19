import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  restaurantEquipmentSystem
} from "../src/systems/RestaurantEquipmentSystem.js";

import {
  serviceCapacitySystem
} from "../src/systems/ServiceCapacitySystem.js";

import {
  storeProgressSystem
} from "../src/systems/StoreProgressSystem.js";

import {
  equipmentManagementPageSystem
} from "../src/ui/pages/equipment/EquipmentManagementPageSystem.js";

import {
  EquipmentManagementView
} from "../src/ui/pages/equipment/EquipmentManagementView.js";


test(
  "设备购置耐久维修和故障能力直接限制厨房前厅与收银产能",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "设备产能测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const storeLimits =
      storeProgressSystem.getLimits(
        restaurant.id
      );

    serviceCapacitySystem
      .configure(
        restaurant.id,
        {
          seats: 100,
          tables: storeLimits.tables,

          averageMealMinutes:
            60,

          kitchenStations:
            storeLimits.kitchenStations,

          kitchenPortionsPerHour:
            100,

          serviceGuestsPerHour:
            100,

          queueToleranceMinutes:
            10,

          maxQueueGuests:
            50
        }
      );

    const stove =
      restaurantEquipmentSystem
        .install({
          restaurantId:
            restaurant.id,

          equipmentId:
            "gas_range"
        })
        .units[0];

    restaurantEquipmentSystem
      .install({
        restaurantId:
          restaurant.id,

        equipmentId:
          "prep_station"
      });

    restaurantEquipmentSystem
      .install({
        restaurantId:
          restaurant.id,

        equipmentId:
          "dishwasher"
      });

    restaurantEquipmentSystem
      .install({
        restaurantId:
          restaurant.id,

        equipmentId:
          "pos_terminal"
      });

    const capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.equal(
      capacity.kitchenGuests,
      20
    );

    assert.equal(
      capacity.serviceGuests,
      24
    );

    assert.equal(
      capacity.checkoutGuests,
      30
    );

    const balanceAfterPurchase =
      financeSystem.getBalance(
        restaurant.id
      );

    assert.ok(
      balanceAfterPurchase <
      100000
    );

    restaurantEquipmentSystem
      .recordOperatingHour({
        restaurantId:
          restaurant.id,

        servedGuests: 100,

        completedOrders: 100
      });

    const worn =
      restaurantEquipmentSystem
        .get(
          stove.id
        );

    assert.ok(
      worn.durability <
      100
    );

    const repair =
      restaurantEquipmentSystem
        .repair(
          stove.id
        );

    assert.ok(
      repair.cost >
      0
    );

    assert.equal(
      repair.unit.durability,
      100
    );

    assert.ok(
      financeSystem.getBalance(
        restaurant.id
      ) <
      balanceAfterPurchase
    );

    const page =
      equipmentManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.dashboard.installed,
      4
    );

    const view =
      new EquipmentManagementView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /设备与工位/
    );

    assert.match(
      html,
      /商用燃气灶/
    );

    assert.match(
      html,
      /商用洗碗机/
    );

    assert.match(
      html,
      /收银POS机/
    );

    assert.match(
      html,
      /耐久/
    );
  }
);
