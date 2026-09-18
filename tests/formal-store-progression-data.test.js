import test from "node:test";
import assert from "node:assert/strict";

import {
  STORE_LEVELS,
  STORE_PROGRESSION_DATASET_META
} from "../src/data/storeProgression.js";

import {
  STORE_EXPERIENCE_POLICY,
  calculateStoreExperience,
  validateStoreLevelConfig
} from "../src/data/storeProgressionRules.js";

test(
  "正式门店成长体系固定Lv1到Lv10且阈值严格递增",
  () => {
    assert.equal(
      STORE_PROGRESSION_DATASET_META
        .totalLevels,
      10
    );

    assert.equal(
      STORE_PROGRESSION_DATASET_META
        .maxLevel,
      10
    );

    assert.deepEqual(
      STORE_LEVELS.map(
        item =>
          item.requiredExperience
      ),
      [
        0,
        500,
        1500,
        3500,
        7000,
        12000,
        20000,
        32000,
        50000,
        75000
      ]
    );

    let previous = null;

    for (
      const item
      of STORE_LEVELS
    ) {
      assert.equal(
        validateStoreLevelConfig(
          item,
          previous
        ),
        true
      );

      previous =
        item;
    }
  }
);

test(
  "经营上限只增不减并保持既有Lv10容量",
  () => {
    let previous = null;

    for (
      const level
      of STORE_LEVELS
    ) {
      if (previous) {
        for (
          const key
          of [
            "employees",
            "menuItems",
            "tables",
            "kitchenStations"
          ]
        ) {
          assert.ok(
            level.limits[key] >=
            previous.limits[key],
            `Lv.${level.level} ${key}`
          );
        }
      }

      previous =
        level;
    }

    const max =
      STORE_LEVELS[
        STORE_LEVELS.length - 1
      ];

    assert.deepEqual(
      max.limits,
      {
        employees: 48,
        menuItems: 50,
        tables: 48,
        kitchenStations: 14
      }
    );
  }
);

test(
  "门店经验公式保持订单10经验加每1000营业额1经验",
  () => {
    assert.equal(
      STORE_EXPERIENCE_POLICY
        .orderExperience,
      10
    );

    assert.equal(
      STORE_EXPERIENCE_POLICY
        .revenueUnit,
      1000
    );

    const result =
      calculateStoreExperience({
        orders: 37,
        revenue: 12890
      });

    assert.deepEqual(
      result,
      {
        total: 382,
        orders: 37,
        revenue: 12890,
        orderExperience: 370,
        revenueExperience: 12
      }
    );
  }
);
