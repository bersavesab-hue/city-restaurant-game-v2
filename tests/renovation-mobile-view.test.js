import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";
import {
  gridPointFromClient,
  placementStyle
} from "../src/ui/renovation/RenovationEditorBaseView.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationMobilePageSystem
} = app.systems;

test(
  "手机装修触摸坐标会吸附到网格并预判非法位置",
  () => {
    const point = gridPointFromClient(
      {
        left: 10,
        top: 20,
        right: 210,
        bottom: 120,
        width: 200,
        height: 100
      },
      10,
      5,
      71,
      69
    );

    assert.deepEqual(point, {
      x: 3,
      y: 2
    });

    assert.equal(
      gridPointFromClient(
        {
          left: 10,
          top: 20,
          right: 210,
          bottom: 120,
          width: 200,
          height: 100
        },
        10,
        5,
        9,
        69
      ),
      null
    );

    assert.equal(
      placementStyle(
        {
          x: 1,
          y: 1,
          width: 2,
          height: 1
        },
        10,
        5
      ),
      "left:10%;top:20%;width:20%;height:20%"
    );

    districtSystem.load(
      [
        {
          id: "renovation_touch_area",
          name: "装修触摸测试区",
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

    const property = propertySystem.create({
      districtId: "renovation_touch_area",
      name: "装修触摸测试铺位",
      area: 80,
      seats: 10,
      baseMonthlyRent: 5000
    });

    const restaurant = restaurantSystem.create({
      name: "装修触摸测试店",
      locationId: property.id
    });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    renovationMobilePageSystem.open(
      restaurant.id
    );

    renovationMobilePageSystem.selectFurniture(
      restaurant.id,
      "table_4"
    );

    const valid =
      renovationMobilePageSystem.previewPlacement(
        restaurant.id,
        0,
        0
      );

    assert.equal(valid.valid, true);
    assert.equal(valid.placement.width, 2);
    assert.equal(valid.placement.height, 2);

    const invalid =
      renovationMobilePageSystem.previewPlacement(
        restaurant.id,
        999,
        999
      );

    assert.equal(invalid.valid, false);
    assert.match(
      invalid.reason,
      /outside the rented floorplan/
    );

    renovationMobilePageSystem.discard(
      restaurant.id
    );
  }
);
