import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  districtEventSystem,
  trafficDemandSystem
} = app.systems;

test(
  "商圈事件会真实改变不同客群需求并自动结束",
  () => {
    districtSystem.load(
      [
        {
          id:
            "event_test_area",

          name:
            "事件测试商圈",

          trafficIndex: 60,
          rentMultiplier: 1,
          spendingPower: 60,
          competition: 0,

          customerMix: {
            resident: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const property =
      propertySystem.create({
        districtId:
          "event_test_area",

        name:
          "事件测试铺位",

        area: 60,
        seats: 20,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name:
          "事件测试餐厅",

        locationId:
          property.id
      });

    const before =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          18
        )
        .expectedVisitors;

    const event =
      districtEventSystem
        .startEvent(
          "event_test_area",
          "neighborhood_festival",
          {
            startDay: 1,
            durationDays: 2
          }
        );

    assert.ok(event);

    const modifiers =
      districtEventSystem
        .getModifiers(
          "event_test_area",
          "resident"
        );

    assert.ok(
      modifiers.demandMultiplier >
      1
    );

    const after =
      trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          18
        )
        .expectedVisitors;

    assert.ok(
      after > before
    );

    districtEventSystem
      .processDay(
        event.endDay + 1,
        {
          generate: false
        }
      );

    assert.equal(
      districtEventSystem
        .getActiveEvents(
          "event_test_area",
          event.endDay + 1
        )
        .length,
      0
    );
  }
);
