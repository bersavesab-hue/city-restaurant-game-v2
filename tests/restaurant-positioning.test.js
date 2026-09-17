import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  restaurantPositioningSystem,
  trafficDemandSystem
} = app.systems;

test(
  "餐厅定位会根据商圈客群改变真实需求",
  () => {
    districtSystem.load(
      [
        {
          id:
            "office_position_area",

          name:
            "写字楼测试区",

          trafficIndex: 70,
          rentMultiplier: 1,
          spendingPower: 65,
          competition: 0,

          customerMix: {
            office_worker: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const quickProperty =
      propertySystem.create({
        districtId:
          "office_position_area",

        name:
          "快餐测试铺",

        area: 50,
        seats: 20,
        baseMonthlyRent: 5000
      });

    const familyProperty =
      propertySystem.create({
        districtId:
          "office_position_area",

        name:
          "正餐测试铺",

        area: 80,
        seats: 20,
        baseMonthlyRent: 5000
      });

    const quick =
      restaurantSystem.create({
        name:
          "快餐定位店",

        locationId:
          quickProperty.id
      });

    const family =
      restaurantSystem.create({
        name:
          "家庭定位店",

        locationId:
          familyProperty.id
      });

    restaurantPositioningSystem
      .setPositioning(
        quick.id,
        "quick_service"
      );

    restaurantPositioningSystem
      .setPositioning(
        family.id,
        "family_dining"
      );

    const quickFactor =
      restaurantPositioningSystem
        .getSegmentDemandMultiplier(
          restaurantPositioningSystem
            .getContext(
              quick.id
            ),
          "office_worker"
        );

    const familyFactor =
      restaurantPositioningSystem
        .getSegmentDemandMultiplier(
          restaurantPositioningSystem
            .getContext(
              family.id
            ),
          "office_worker"
        );

    assert.ok(
      quickFactor >
      familyFactor
    );

    const quickDemand =
      trafficDemandSystem
        .getHourlyDemand(
          quick.id,
          12
        )
        .expectedVisitors;

    const familyDemand =
      trafficDemandSystem
        .getHourlyDemand(
          family.id,
          12
        )
        .expectedVisitors;

    assert.ok(
      quickDemand >
      familyDemand
    );

    const quickAnalysis =
      restaurantPositioningSystem
        .getAnalysis(
          quick.id
        );

    const familyAnalysis =
      restaurantPositioningSystem
        .getAnalysis(
          family.id
        );

    assert.ok(
      quickAnalysis.districtFit >
      familyAnalysis.districtFit
    );
  }
);
