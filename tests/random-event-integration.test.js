import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import { app } from "../src/main.js";

const {
  gameFoundationSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  employeeSystem,
  employeeDynamicsSystem,
  supplierSystem,
  procurementSystem,
  districtEventSystem,
  equipmentMaintenanceSystem,
  marketCompetitionSystem,
  competitorDynamicsSystem
} = app.systems;

function createRestaurant(
  districtId,
  name
) {
  const property =
    propertySystem.create({
      districtId,
      name:
        `${name}铺位`,
      area: 80,
      seats: 24,
      baseMonthlyRent:
        6000
    });

  const restaurant =
    restaurantSystem.create({
      name,
      locationId:
        property.id
    });

  financeSystem.createAccount(
    restaurant.id,
    200000
  );

  return {
    property,
    restaurant
  };
}

test(
  "随机事件会真实进入采购员工设备口碑和竞争系统",
  () => {
    gameState.reset();

    gameFoundationSystem
      .initialize({
        seedProperties: false,
        overwriteReferenceData:
          true
      });

    const supply =
      createRestaurant(
        "wholesale_market",
        "事件采购测试店"
      );

    districtEventSystem
      .startEvent(
        "wholesale_market",
        "cold_chain_delay",
        {
          startDay: 1,
          durationDays: 2
        }
      );

    const supplier =
      supplierSystem
        .list({
          activeOnly: true
        })
        .find(
          item =>
            supplierSystem
              .listOffers(
                item.id
              )
              .length >
            0
        );

    assert.ok(supplier);

    const offer =
      supplierSystem
        .listOffers(
          supplier.id
        )[0];

    const quantity =
      offer.minimumOrder;

    const baseQuote = {
      supplierId:
        supplier.id,
      ingredientId:
        offer.ingredientId,
      quantity,
      unit:
        app.systems
          .ingredientCatalogSystem
          .get(
            offer.ingredientId
          )
          .unit,
      unitPrice: 1,
      totalPrice: 100,
      quality: 3,
      deliveryMinutes: 100,
      reliability: 100
    };

    const order =
      procurementSystem
        .purchase({
          restaurantId:
            supply.restaurant.id,
          supplierId:
            supplier.id,
          ingredientId:
            offer.ingredientId,
          quantity,
          quoteOverride:
            baseQuote
        });

    assert.ok(
      order.totalPrice >
      100
    );

    assert.ok(
      order.baseDeliveryMinutes >
      100
    );

    const labor =
      createRestaurant(
        "industrial_park",
        "事件用工测试店"
      );

    const employee =
      employeeSystem.hire({
        restaurantId:
          labor.restaurant.id,
        name:
          "测试员工",
        roleId:
          "server",
        salary:
          6000
      });

    const beforeSatisfaction =
      employeeDynamicsSystem
        .calculateSatisfaction(
          employee
        )
        .score;

    districtEventSystem
      .startEvent(
        "industrial_park",
        "labor_shortage",
        {
          startDay: 1,
          durationDays: 2
        }
      );

    const afterSatisfaction =
      employeeDynamicsSystem
        .calculateSatisfaction(
          employeeSystem.get(
            employee.id
          )
        )
        .score;

    assert.ok(
      afterSatisfaction <
      beforeSatisfaction
    );

    const equipment =
      createRestaurant(
        "old_town",
        "事件设备测试店"
      );

    const fakeUnit = {
      restaurantId:
        equipment.restaurant.id,
      status: "active",
      durability: 50,
      maxDurability: 100,
      usageHours: 0,
      maintenanceCount: 0
    };

    const baselineRisk =
      equipmentMaintenanceSystem
        .getFailureRisk(
          fakeUnit
        );

    districtEventSystem
      .startEvent(
        "old_town",
        "power_instability",
        {
          startDay: 1,
          durationDays: 2
        }
      );

    const eventRisk =
      equipmentMaintenanceSystem
        .getFailureRisk(
          fakeUnit
        );

    assert.ok(
      eventRisk >
      baselineRisk
    );

    const reputation =
      createRestaurant(
        "cultural_creative",
        "事件口碑测试店"
      );

    districtEventSystem
      .startEvent(
        "cultural_creative",
        "local_media_feature",
        {
          startDay: 1,
          durationDays: 2
        }
      );

    const reputationAfter =
      restaurantSystem
        .changeReputation(
          reputation
            .restaurant
            .id,
          10
        );

    assert.ok(
      reputationAfter
        .reputation >
      10
    );

    const competitor =
      marketCompetitionSystem
        .create({
          districtId:
            "commercial_core",
          name:
            "竞争事件测试店",
          priceIndex: 1,
          qualityScore: 65,
          reputation: 65,
          serviceScore: 65,
          strengthTier: 3,
          resilience: 50
        });

    const healthBefore =
      competitorDynamicsSystem
        .getHealthScore(
          competitor
        );

    districtEventSystem
      .startEvent(
        "commercial_core",
        "competitor_promotion",
        {
          startDay: 1,
          durationDays: 2
        }
      );

    const healthAfter =
      competitorDynamicsSystem
        .getHealthScore(
          competitor
        );

    assert.ok(
      healthAfter <
      healthBefore
    );
  }
);
