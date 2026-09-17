import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  customerSegmentSystem
} = app.systems;

test(
  "基础客群加载且拥有时段需求",
  () => {
    const segments =
      customerSegmentSystem
        .getAll();

    assert.ok(
      segments.length >= 4
    );

    assert.ok(
      customerSegmentSystem
        .getHourWeight(
          "office_worker",
          12
        ) >
      customerSegmentSystem
        .getHourWeight(
          "office_worker",
          15
        )
    );

    assert.ok(
      customerSegmentSystem
        .get("student")
        .priceSensitivity >
      customerSegmentSystem
        .get("tourist")
        .priceSensitivity
    );
  }
);
