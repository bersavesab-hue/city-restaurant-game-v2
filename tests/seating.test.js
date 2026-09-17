import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  seatingSystem
} = app.systems;

test(
  "座位和排队耐心限制小时接待能力",
  () => {
    districtSystem.load(
      [
        {
          id: "seat_test_area",
          name: "座位测试区",
          trafficIndex: 60,
          rentMultiplier: 1,
          spendingPower: 60,
          competition: 20,
          customerMix: {
            office_worker: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const smallProperty =
      propertySystem.create({
        districtId:
          "seat_test_area",
        name: "4座小店",
        area: 20,
        baseMonthlyRent: 1000,
        seats: 4
      });

    const largeProperty =
      propertySystem.create({
        districtId:
          "seat_test_area",
        name: "20座大店",
        area: 80,
        baseMonthlyRent: 4000,
        seats: 20
      });

    const small =
      restaurantSystem.create({
        name: "小店",
        locationId:
          smallProperty.id
      });

    const large =
      restaurantSystem.create({
        name: "大店",
        locationId:
          largeProperty.id
      });

    const demand = {
      segments: [
        {
          segmentId:
            "office_worker",
          expectedVisitors: 20
        }
      ]
    };

    const smallFlow =
      seatingSystem.getHourFlow(
        small.id,
        20,
        demand
      );

    const largeFlow =
      seatingSystem.getHourFlow(
        large.id,
        20,
        demand
      );

    assert.ok(
      largeFlow.acceptedVisitors >
      smallFlow.acceptedVisitors
    );

    assert.ok(
      smallFlow.queueAbandoned > 0
    );

    assert.ok(
      smallFlow.turnoverRate >= 1
    );
  }
);
