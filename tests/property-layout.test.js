import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem
} = app.systems;

const {
  cityPropertyPageSystem
} = app.ui;

test("房源支持30到10000平米、多楼层和真实结构数据", () => {
  districtSystem.load(
    [
      {
        id: "property_layout_test_area",
        name: "房型测试商圈",
        trafficIndex: 72,
        rentMultiplier: 1,
        spendingPower: 68,
        competition: 45,
        customerMix: {
          resident: 60,
          office: 40
        }
      }
    ],
    { overwrite: true }
  );

  const tiny = propertySystem.create({
    districtId: "property_layout_test_area",
    name: "30平街边小铺",
    area: 30,
    usableArea: 27,
    baseMonthlyRent: 3200,
    frontageMeters: 3.6,
    ceilingHeight: 3.2,
    floors: [
      {
        id: "tiny_1f",
        label: "1F",
        area: 30,
        usableArea: 27,
        width: 6,
        height: 6,
        shape: "irregular",
        polygon: [
          { x: 0, y: 0 },
          { x: 6, y: 0 },
          { x: 6, y: 4 },
          { x: 4, y: 4 },
          { x: 4, y: 6 },
          { x: 0, y: 6 }
        ],
        entrances: [{ id: "front", x: 2, y: 0 }],
        columns: [{ id: "column_1", x: 3, y: 3, width: 1, height: 1 }],
        utilityPoints: [
          { id: "water_1", type: "water", x: 5, y: 5 },
          { id: "exhaust_1", type: "exhaust", x: 5, y: 4 }
        ]
      }
    ],
    tags: ["临街", "小店"]
  });

  const huge = propertySystem.create({
    districtId: "property_layout_test_area",
    name: "大型餐饮综合体",
    area: 10000,
    usableArea: 8600,
    baseMonthlyRent: 280000,
    parkingSpaces: 120,
    floors: [
      {
        id: "huge_1f",
        label: "1F",
        area: 4000,
        usableArea: 3500,
        width: 60,
        height: 45,
        entrances: [
          { id: "main", x: 20, y: 0 },
          { id: "side", x: 0, y: 20 }
        ]
      },
      {
        id: "huge_2f",
        label: "2F",
        area: 3500,
        usableArea: 3000,
        width: 55,
        height: 42
      },
      {
        id: "huge_3f",
        label: "3F",
        area: 2500,
        usableArea: 2100,
        width: 48,
        height: 38
      }
    ],
    tags: ["大型餐饮", "宴会", "停车场"]
  });

  assert.equal(tiny.usableArea, 27);
  assert.equal(tiny.floorCount, 1);
  assert.equal(tiny.floors[0].shape, "irregular");
  assert.equal(tiny.floors[0].columns.length, 1);
  assert.equal(tiny.floors[0].utilityPoints.length, 2);

  assert.equal(huge.area, 10000);
  assert.equal(huge.usableArea, 8600);
  assert.equal(huge.floorCount, 3);
  assert.equal(huge.floors[1].label, "2F");
  assert.equal(huge.parkingSpaces, 120);

  const layout = propertySystem.getLayout(huge.id);
  assert.equal(layout.floorCount, 3);
  assert.equal(layout.floors[2].usableArea, 2100);

  const detail = cityPropertyPageSystem.getPropertyDetail(tiny.id);
  assert.equal(detail.property.area, 30);
  assert.equal(detail.property.usableArea, 27);
  assert.equal(detail.property.floors[0].columnCount, 1);
  assert.equal(detail.layout.floors[0].polygon.length, 6);
  assert.equal(detail.suitability.frontageMeters, 3.6);
});
