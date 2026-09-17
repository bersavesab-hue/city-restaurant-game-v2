import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  districtSystem,
  propertySystem,
  trafficDemandSystem
} = app.systems;

test(
  "高流量低竞争商圈产生更高客流需求",
  () => {
    districtSystem.load(
      [
        {
          id: "busy_district",
          name: "繁华商圈",
          trafficIndex: 90,
          rentMultiplier: 1.5,
          spendingPower: 75,
          competition: 20,
          customerMix: {
            office_worker: 70,
            resident: 30
          }
        },
        {
          id: "quiet_district",
          name: "冷清商圈",
          trafficIndex: 30,
          rentMultiplier: 0.7,
          spendingPower: 45,
          competition: 75,
          customerMix: {
            office_worker: 70,
            resident: 30
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const busyProperty =
      propertySystem.create({
        districtId:
          "busy_district",
        name: "繁华铺位",
        area: 80,
        baseMonthlyRent: 10000
      });

    const quietProperty =
      propertySystem.create({
        districtId:
          "quiet_district",
        name: "冷清铺位",
        area: 80,
        baseMonthlyRent: 10000
      });

    const busy =
      restaurantSystem.create({
        name: "繁华店",
        locationId:
          busyProperty.id
      });

    const quiet =
      restaurantSystem.create({
        name: "冷清店",
        locationId:
          quietProperty.id
      });

    const busyNoon =
      trafficDemandSystem
        .getHourlyDemand(
          busy.id,
          12
        );

    const quietNoon =
      trafficDemandSystem
        .getHourlyDemand(
          quiet.id,
          12
        );

    const busyNight =
      trafficDemandSystem
        .getHourlyDemand(
          busy.id,
          3
        );

    assert.ok(
      busyNoon.expectedVisitors >
      quietNoon.expectedVisitors
    );

    assert.ok(
      busyNoon.expectedVisitors >
      busyNight.expectedVisitors
    );
  }
);
