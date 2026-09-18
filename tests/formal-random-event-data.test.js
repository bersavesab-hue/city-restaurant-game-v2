import test from "node:test";
import assert from "node:assert/strict";

import {
  RANDOM_EVENTS_V1,
  RANDOM_EVENT_DATASET_META
} from "../src/data/randomEvents.v1.js";

import {
  RANDOM_EVENT_CATEGORIES,
  validateRandomEvent
} from "../src/data/randomEventRules.js";

import {
  CITY_DISTRICTS_V2
} from "../src/data/cityDistricts.v2.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import { app } from "../src/main.js";

const {
  districtEventSystem
} = app.systems;

const LEGACY_IDS = [
  "convention",
  "road_construction",
  "severe_weather",
  "school_opening",
  "office_holiday",
  "neighborhood_festival",
  "competitor_promotion"
];

test(
  "正式随机事件包固定150条并覆盖15大类",
  () => {
    assert.equal(
      RANDOM_EVENT_DATASET_META.total,
      150
    );

    assert.equal(
      RANDOM_EVENTS_V1.length,
      150
    );

    assert.equal(
      RANDOM_EVENT_DATASET_META.categories,
      15
    );

    assert.equal(
      new Set(
        RANDOM_EVENTS_V1.map(
          item => item.id
        )
      ).size,
      150
    );

    const categories =
      new Set(
        RANDOM_EVENTS_V1.map(
          item => item.category
        )
      );

    assert.equal(
      categories.size,
      15
    );

    for (
      const category
      of RANDOM_EVENT_CATEGORIES
    ) {
      assert.equal(
        RANDOM_EVENTS_V1.filter(
          item =>
            item.category ===
            category
        ).length,
        10,
        category
      );
    }

    for (
      const item
      of RANDOM_EVENTS_V1
    ) {
      assert.equal(
        validateRandomEvent(
          item
        ),
        true,
        item.id
      );
    }
  }
);

test(
  "旧7个事件ID全部保留且正式事件只引用有效商圈和客群",
  () => {
    const eventIds =
      new Set(
        RANDOM_EVENTS_V1.map(
          item => item.id
        )
      );

    for (
      const id
      of LEGACY_IDS
    ) {
      assert.ok(
        eventIds.has(id),
        id
      );
    }

    const districtIds =
      new Set(
        CITY_DISTRICTS_V2.map(
          item => item.id
        )
      );

    const segmentIds =
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      );

    for (
      const item
      of RANDOM_EVENTS_V1
    ) {
      for (
        const districtId
        of Object.keys(
          item.districtWeights
        )
      ) {
        assert.ok(
          districtIds.has(
            districtId
          ),
          `${item.id} -> district ${districtId}`
        );
      }

      for (
        const segmentId
        of Object.keys(
          item.modifiers
            .segmentMultipliers ??
          {}
        )
      ) {
        assert.ok(
          segmentIds.has(
            segmentId
          ),
          `${item.id} -> segment ${segmentId}`
        );
      }
    }
  }
);

test(
  "季节与商圈权重会真实改变事件抽取权重",
  () => {
    const spring =
      districtEventSystem
        .getDefinitionWeight(
          districtEventSystem
            .getDefinition(
              "spring_bloom"
            ),
          "tourist_scenic",
          30
        );

    const summer =
      districtEventSystem
        .getDefinitionWeight(
          districtEventSystem
            .getDefinition(
              "spring_bloom"
            ),
          "tourist_scenic",
          120
        );

    assert.ok(
      spring >
      summer
    );

    const campus =
      districtEventSystem
        .getDefinitionWeight(
          districtEventSystem
            .getDefinition(
              "campus_festival"
            ),
          "university",
          30
        );

    const cbd =
      districtEventSystem
        .getDefinitionWeight(
          districtEventSystem
            .getDefinition(
              "campus_festival"
            ),
          "cbd",
          30
        );

    assert.ok(
      campus >
      cbd
    );
  }
);

test(
  "新事件效果覆盖客流供应人工设备成本竞争员工与声望通道",
  () => {
    const required = [
      [
        "convention",
        "demandMultiplier",
        value => value > 1
      ],
      [
        "meat_price_spike",
        "supplyPriceMultiplier",
        value => value > 1
      ],
      [
        "labor_shortage",
        "payrollCostMultiplier",
        value => value > 1
      ],
      [
        "labor_shortage",
        "employeeSatisfactionMultiplier",
        value => value < 1
      ],
      [
        "power_instability",
        "equipmentFailureMultiplier",
        value => value > 1
      ],
      [
        "energy_price_rise",
        "operatingCostMultiplier",
        value => value > 1
      ],
      [
        "competitor_promotion",
        "competitorPressureMultiplier",
        value => value > 1
      ],
      [
        "local_media_feature",
        "reputationChangeMultiplier",
        value => value > 1
      ]
    ];

    for (
      const [
        id,
        field,
        predicate
      ]
      of required
    ) {
      const definition =
        districtEventSystem
          .getDefinition(
            id
          );

      assert.ok(
        predicate(
          definition
            .modifiers[
              field
            ]
        ),
        `${id} -> ${field}`
      );
    }
  }
);
