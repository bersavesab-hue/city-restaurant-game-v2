import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationSystem,
  seatingSystem
} = app.systems;

test(
  "装修布局支持摆放移动碰撞检测并真实改变座位数",
  () => {
    districtSystem.load(
      [
        {
          id: "renovation_test_area",
          name: "装修测试商圈",
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

    const property =
      propertySystem.create({
        districtId: "renovation_test_area",
        name: "装修测试铺位",
        area: 80,
        seats: 10,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "装修测试店",
        locationId: property.id
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    assert.equal(
      seatingSystem.getSeatCount(
        restaurant.id
      ),
      10
    );

    const layout =
      renovationSystem.initialize(
        restaurant.id
      );

    assert.equal(
      layout.active,
      false
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    renovationSystem.placeItem({
      restaurantId: restaurant.id,
      furnitureId: "table_4",
      x: 0,
      y: 0
    });

    assert.throws(
      () =>
        renovationSystem.placeItem({
          restaurantId: restaurant.id,
          furnitureId: "table_2",
          x: 1,
          y: 1
        }),
      /overlaps/
    );

    renovationSystem.placeItem({
      restaurantId: restaurant.id,
      furnitureId: "kitchen_station",
      x: 3,
      y: 0
    });

    renovationSystem.placeItem({
      restaurantId: restaurant.id,
      furnitureId: "cashier_counter",
      x: 0,
      y: 3
    });

    const summaryBeforeActivation =
      renovationSystem.getSummary(
        restaurant.id
      );

    assert.equal(
      summaryBeforeActivation.modifiers.seats,
      4
    );

    assert.equal(
      summaryBeforeActivation.modifiers.kitchenStations,
      1
    );

    assert.ok(
      summaryBeforeActivation.modifiers.serviceEfficiency > 1
    );

    renovationSystem.activateLayout(
      restaurant.id
    );

    assert.equal(
      seatingSystem.getSeatCount(
        restaurant.id
      ),
      4
    );

    const after =
      financeSystem.getBalance(
        restaurant.id
      );

    const expectedSpent =
      [
        "table_4",
        "kitchen_station",
        "cashier_counter"
      ]
        .reduce(
          (
            sum,
            furnitureId
          ) => {
            const item =
              renovationSystem
                .getCatalog(
                  restaurant.id
                )
                .find(
                  candidate =>
                    candidate.id ===
                    furnitureId
                );

            return (
              sum +
              Number(
                item?.cost ??
                0
              )
            );
          },
          0
        );

    assert.equal(
      before -
      after,
      expectedSpent
    );

    const activeSummary =
      renovationSystem.getSummary(
        restaurant.id
      );

    assert.equal(
      activeSummary.active,
      true
    );

    assert.equal(
      renovationSystem
        .getKitchenCapacityPerHour(
          restaurant.id
        ),
      8
    );
  }
);
