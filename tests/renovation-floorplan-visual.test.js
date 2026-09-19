import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFloorplanVisualModel
} from "../src/ui/renovation/RenovationFloorplanVisualModel.js";
import {
  renderFloorplanLayer
} from "../src/ui/renovation/RenovationFloorplanBaseView.js";

test("装修画布显示真实户型轮廓窗柱固定结构和水电燃气排烟点", () => {
  const floor = {
    id: "visual_1f",
    label: "1F",
    width: 12,
    height: 10,
    area: 120,
    usableArea: 108,
    polygon: [
      { x: 0, y: 0 },
      { x: 12, y: 0 },
      { x: 12, y: 7 },
      { x: 9, y: 7 },
      { x: 9, y: 10 },
      { x: 0, y: 10 }
    ],
    entrances: [
      { id: "front", x: 3, y: 0 }
    ],
    windows: [
      { id: "window_1", x: 5, y: 0, width: 2, height: 0.2 }
    ],
    columns: [
      { id: "column_1", x: 4, y: 4, width: 1, height: 1 }
    ],
    fixedStructures: [
      {
        id: "wall_1",
        type: "load_bearing_wall",
        x: 8,
        y: 2,
        width: 0.5,
        height: 4
      }
    ],
    utilityPoints: [
      { id: "water_1", type: "water", x: 10, y: 5 },
      { id: "gas_1", type: "gas", x: 10, y: 6 },
      { id: "exhaust_1", type: "exhaust", x: 10, y: 4 },
      { id: "power_1", type: "power", x: 2, y: 8 }
    ]
  };

  const model = buildFloorplanVisualModel(floor, {
    x: 0,
    y: 0,
    width: 12,
    height: 10
  });

  assert.equal(model.polygon.length, 6);
  assert.equal(model.windows.length, 1);
  assert.equal(model.columns.length, 1);
  assert.equal(model.fixedStructures.length, 1);
  assert.equal(model.entrances.length, 1);
  assert.equal(model.utilityPoints.length, 4);
  assert.equal(model.utilityPoints[0].meta.label, "水");
  assert.equal(model.fixedStructures[0].meta.label, "承重墙");

  const html = renderFloorplanLayer(
    { activeFloor: floor },
    { x: 0, y: 0, width: 12, height: 10 }
  );

  assert.match(html, /renovation-floorplan-layer/);
  assert.match(html, /<polygon/);
  assert.match(html, /renovation-floor-window/);
  assert.match(html, /renovation-floor-column/);
  assert.match(html, /承重墙/);
  assert.match(html, />门</);
  assert.match(html, />水</);
  assert.match(html, />气</);
  assert.match(html, />烟</);
  assert.match(html, />电</);

  const zoneModel = buildFloorplanVisualModel(floor, {
    x: 0,
    y: 0,
    width: 6,
    height: 5
  });

  assert.equal(zoneModel.columns.length, 1);
  assert.equal(zoneModel.fixedStructures.length, 0);
  assert.equal(zoneModel.utilityPoints.length, 0);
});
