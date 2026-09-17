import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationSystem,
  layoutFlowSystem,
  employeeSystem,
  employeeWorkSystem
} = app.systems;

function buildRestaurant(
  name,
  propertyName
) {
  const property =
    propertySystem.create({
      districtId:
        "layout_flow_area",
      name: propertyName,
      area: 96,
      seats: 12,
      baseMonthlyRent: 5000
    });

  const restaurant =
    restaurantSystem.create({
      name,
      locationId: property.id
    });

  financeSystem.createAccount(
    restaurant.id,
    50000
  );

  for (
    let index = 1;
    index <= 4;
    index += 1
  ) {
    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name:
        `${name}服务员${index}`,
      roleId: "server"
    });
  }

  renovationSystem.initialize(
    restaurant.id
  );

  return restaurant;
}

test(
  "装修位置会真实改变厨房和服务动线产能",
  () => {
    districtSystem.load(
      [
        {
          id: "layout_flow_area",
          name: "动线测试商圈",
          trafficIndex: 60,
          rentMultiplier: 1,
          spendingPower: 60,
          competition: 20,
          customerMix: {
            resident: 100
          }
        }
      ],
      { overwrite: true }
    );

    const good =
      buildRestaurant(
        "紧凑动线店",
        "紧凑动线铺位"
      );

    renovationSystem.placeItem({
      restaurantId: good.id,
      furnitureId: "table_4",
      x: 0,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: good.id,
      furnitureId:
        "cashier_counter",
      x: 2,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: good.id,
      furnitureId:
        "kitchen_station",
      x: 4,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: good.id,
      furnitureId:
        "waiting_bench",
      x: 2,
      y: 2
    });

    renovationSystem.activateLayout(
      good.id
    );

    const bad =
      buildRestaurant(
        "绕行动线店",
        "绕行动线铺位"
      );

    renovationSystem.placeItem({
      restaurantId: bad.id,
      furnitureId: "table_4",
      x: 0,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: bad.id,
      furnitureId:
        "cashier_counter",
      x: 7,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: bad.id,
      furnitureId:
        "kitchen_station",
      x: 7,
      y: 4
    });

    renovationSystem.placeItem({
      restaurantId: bad.id,
      furnitureId:
        "waiting_bench",
      x: 0,
      y: 3
    });

    renovationSystem.activateLayout(
      bad.id
    );

    const goodFlow =
      layoutFlowSystem
        .getOperationalEffects(
          good.id
        );

    const badFlow =
      layoutFlowSystem
        .getOperationalEffects(
          bad.id
        );

    assert.ok(
      goodFlow.serviceMultiplier >
      badFlow.serviceMultiplier
    );

    assert.ok(
      goodFlow.kitchenMultiplier >
      badFlow.kitchenMultiplier
    );

    assert.ok(
      goodFlow.kitchenCapacityPerHour >
      badFlow.kitchenCapacityPerHour
    );

    assert.ok(
      badFlow.issues.includes(
        "service_route_too_long"
      )
    );

    const goodCapacity =
      employeeWorkSystem
        .getServiceCapacity(
          good.id
        );

    const badCapacity =
      employeeWorkSystem
        .getServiceCapacity(
          bad.id
        );

    assert.ok(
      goodCapacity >
      badCapacity
    );
  }
);
