import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";
import {
  getWorkspaceMode,
  buildWorkspaceZones
} from "../src/ui/renovation/RenovationWorkspaceModel.js";
import {
  gridPointFromClient
} from "../src/ui/renovation/RenovationMobileView.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationMobilePageSystem
} = app.systems;

test("装修工作台按面积切换整店缩放分区并支持楼层和小地图", () => {
  assert.equal(
    getWorkspaceMode({ usableArea: 80 }),
    "direct"
  );
  assert.equal(
    getWorkspaceMode({ usableArea: 680 }),
    "zoom"
  );
  assert.equal(
    getWorkspaceMode({ usableArea: 3500 }),
    "zone"
  );

  const zones = buildWorkspaceZones({
    usableArea: 3500,
    width: 60,
    height: 45
  });

  assert.ok(zones.length > 1);

  districtSystem.load(
    [
      {
        id: "workspace_ui_area",
        name: "装修工作台测试商圈",
        trafficIndex: 70,
        rentMultiplier: 1,
        spendingPower: 70,
        competition: 35,
        customerMix: {
          resident: 50,
          office: 50
        }
      }
    ],
    { overwrite: true }
  );

  const property = propertySystem.create({
    districtId: "workspace_ui_area",
    name: "大型双层餐饮铺位",
    area: 6000,
    usableArea: 5200,
    baseMonthlyRent: 120000,
    floors: [
      {
        id: "workspace_1f",
        label: "1F",
        area: 3600,
        usableArea: 3200,
        width: 60,
        height: 44,
        entrances: [
          { id: "main", x: 20, y: 0 }
        ],
        columns: [
          { id: "c1", x: 14, y: 12, width: 1, height: 1 }
        ]
      },
      {
        id: "workspace_2f",
        label: "2F",
        area: 2400,
        usableArea: 2000,
        width: 48,
        height: 36
      }
    ]
  });

  const restaurant = restaurantSystem.create({
    name: "大型装修工作台测试店",
    locationId: property.id
  });

  financeSystem.createAccount(
    restaurant.id,
    500000
  );

  let page = renovationMobilePageSystem.open(
    restaurant.id
  );

  assert.equal(page.workspace.floorCount, 2);
  assert.equal(page.workspace.activeFloorId, "workspace_1f");
  assert.equal(page.workspace.mode, "zone");
  assert.ok(page.workspace.zones.length > 1);
  assert.equal(page.workspace.zoom, 1);
  assert.equal(page.workspace.minimap.enabled, true);
  assert.equal(page.workspace.minimap.expanded, false);

  page = renovationMobilePageSystem.zoomIn(
    restaurant.id
  );
  assert.equal(page.workspace.zoom, 1.25);

  page = renovationMobilePageSystem.toggleMinimap(
    restaurant.id
  );
  assert.equal(page.workspace.minimap.expanded, true);

  const targetZone = page.workspace.zones[1];
  page = renovationMobilePageSystem.selectZone(
    restaurant.id,
    targetZone.id
  );

  assert.equal(page.workspace.activeZoneId, targetZone.id);
  assert.deepEqual(page.workspace.viewBounds, {
    x: targetZone.x,
    y: targetZone.y,
    width: targetZone.width,
    height: targetZone.height
  });
  assert.equal(page.workspace.zoom, 1);

  const point = gridPointFromClient(
    {
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100
    },
    targetZone.width,
    targetZone.height,
    100,
    50,
    targetZone.x,
    targetZone.y
  );

  assert.ok(point.x >= targetZone.x);
  assert.ok(point.y >= targetZone.y);

  page = renovationMobilePageSystem.switchFloor(
    restaurant.id,
    "workspace_2f"
  );

  assert.equal(page.workspace.activeFloorId, "workspace_2f");
  assert.equal(page.workspace.activeFloor.label, "2F");
  assert.equal(page.workspace.mode, "zone");
  assert.equal(page.workspace.zoom, 1);

  renovationMobilePageSystem.discard(
    restaurant.id
  );
});
