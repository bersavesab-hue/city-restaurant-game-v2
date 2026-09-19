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
  seatingSystem,
  trafficDemandSystem,
  customerExperienceSystem
} = app.systems;

function createRestaurant(
  name,
  propertyName
) {
  const property =
    propertySystem.create({
      districtId:
        "renovation_environment_area",
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

  renovationSystem.initialize(
    restaurant.id
  );

  return restaurant;
}

function placeCore(
  restaurantId
) {
  renovationSystem.placeItem({
    restaurantId,
    furnitureId: "table_4",
    x: 0,
    y: 0
  });

  renovationSystem.placeItem({
    restaurantId,
    furnitureId:
      "cashier_counter",
    x: 2,
    y: 0
  });

  renovationSystem.placeItem({
    restaurantId,
    furnitureId:
      "kitchen_station",
    x: 4,
    y: 0
  });
}

test(
  "装修环境会真实影响吸引力等候耐心和顾客体验",
  () => {
    districtSystem.load(
      [
        {
          id:
            "renovation_environment_area",
          name:
            "装修环境测试商圈",
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

    const comfortable =
      createRestaurant(
        "舒适装修店",
        "舒适装修铺位"
      );

    placeCore(
      comfortable.id
    );

    renovationSystem.placeItem({
      restaurantId:
        comfortable.id,
      furnitureId:
        "waiting_bench",
      x: 2,
      y: 2
    });

    renovationSystem.placeItem({
      restaurantId:
        comfortable.id,
      furnitureId:
        "decor_plant",
      x: 0,
      y: 3
    });

    renovationSystem.placeItem({
      restaurantId:
        comfortable.id,
      furnitureId:
        "decor_plant",
      x: 1,
      y: 3
    });

    renovationSystem.placeItem({
      restaurantId:
        comfortable.id,
      furnitureId:
        "decor_plant",
      x: 0,
      y: 4
    });

    renovationSystem.placeItem({
      restaurantId:
        comfortable.id,
      furnitureId:
        "decor_plant",
      x: 1,
      y: 4
    });

    renovationSystem.activateLayout(
      comfortable.id
    );

    const plain =
      createRestaurant(
        "基础装修店",
        "基础装修铺位"
      );

    placeCore(
      plain.id
    );

    renovationSystem.activateLayout(
      plain.id
    );

    const comfortableFlow =
      layoutFlowSystem
        .getOperationalEffects(
          comfortable.id
        );

    const plainFlow =
      layoutFlowSystem
        .getOperationalEffects(
          plain.id
        );

    assert.ok(
      comfortableFlow.comfortScore >
      plainFlow.comfortScore
    );

    assert.ok(
      comfortableFlow
        .queuePatienceMultiplier >
      plainFlow
        .queuePatienceMultiplier
    );

    assert.ok(
      plainFlow.issues.includes(
        "no_waiting_area"
      )
    );

    assert.ok(
      plainFlow.issues.includes(
        "plain_environment"
      )
    );

    const comfortableDemand =
      trafficDemandSystem
        .getHourlyDemand(
          comfortable.id,
          18
        );

    const plainDemand =
      trafficDemandSystem
        .getHourlyDemand(
          plain.id,
          18
        );

    assert.ok(
      comfortableDemand
        .renovationAppealFactor >
      plainDemand
        .renovationAppealFactor
    );

    assert.ok(
      comfortableDemand
        .expectedVisitors >
      plainDemand
        .expectedVisitors
    );

    const comfortableSeating =
      seatingSystem
        .getHourlyCapacity(
          comfortable.id,
          comfortableDemand
        );

    const plainSeating =
      seatingSystem
        .getHourlyCapacity(
          plain.id,
          plainDemand
        );

    assert.ok(
      comfortableSeating
        .queuePatienceMinutes >
      plainSeating
        .queuePatienceMinutes
    );

    const sharedResult = {
      visitors: 4,
      completedOrders: 4,
      rejectedVisitors: 0,
      failedOrders: 0,
      queuedVisitors: 1,
      averageQuality: 80
    };

    const comfortableExperience =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            comfortable.id,
          demand:
            comfortableDemand,
          result:
            sharedResult
        });

    const plainExperience =
      customerExperienceSystem
        .recordHour({
          restaurantId:
            plain.id,
          demand:
            plainDemand,
          result:
            sharedResult
        });

    assert.ok(
      comfortableExperience
        .comfortScore >
      plainExperience
        .comfortScore
    );

    assert.ok(
      comfortableExperience
        .satisfaction >=
      plainExperience
        .satisfaction
    );
  }
);
