import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  RENOVATION_FURNITURE_DATASET_META,
  RENOVATION_FURNITURE_V1
} from "../src/data/renovationFurniture.v1.js";

import {
  FURNITURE_SPEC_TIERS,
  validateFurnitureDefinition
} from "../src/data/renovationFurnitureRules.js";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  renovationSystem,
  renovationPlanningSystem,
  layoutFlowSystem
} = app.systems;


test(
  "正式装修家具包固定100件20族并均分T1-T5",
  () => {
    assert.equal(
      RENOVATION_FURNITURE_DATASET_META
        .total,
      100
    );

    assert.equal(
      RENOVATION_FURNITURE_V1
        .length,
      100
    );

    assert.equal(
      new Set(
        RENOVATION_FURNITURE_V1
          .map(
            item => item.id
          )
      ).size,
      100
    );

    assert.equal(
      new Set(
        RENOVATION_FURNITURE_V1
          .map(
            item =>
              item.familyId
          )
      ).size,
      20
    );

    for (
      const tier
      of FURNITURE_SPEC_TIERS
    ) {
      assert.equal(
        RENOVATION_FURNITURE_V1
          .filter(
            item =>
              item.specTier ===
              tier.id
          ).length,
        20,
        tier.id
      );
    }

    for (
      const item
      of RENOVATION_FURNITURE_V1
    ) {
      assert.equal(
        validateFurnitureDefinition(
          item
        ),
        true,
        item.id
      );
    }

    for (
      const legacyId
      of [
        "table_2",
        "table_4",
        "booth_4",
        "kitchen_station",
        "prep_counter",
        "cashier_counter",
        "waiting_bench",
        "decor_plant",
        "decor_feature"
      ]
    ) {
      assert.ok(
        RENOVATION_FURNITURE_V1
          .some(
            item =>
              item.id ===
              legacyId
          ),
        legacyId
      );
    }
  }
);


test(
  "家具档次按门店等级解锁而不是成长等级",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "家具解锁测试店"
      });

    assert.equal(
      renovationSystem
        .getCatalog(
          restaurant.id
        )
        .filter(
          item =>
            item.unlocked
        )
        .length,
      20
    );

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 2
      }
    );

    assert.equal(
      renovationSystem
        .getCatalog(
          restaurant.id
        )
        .filter(
          item =>
            item.unlocked
        )
        .length,
      40
    );

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 4
      }
    );

    assert.equal(
      renovationSystem
        .getCatalog(
          restaurant.id
        )
        .filter(
          item =>
            item.unlocked
        )
        .length,
      60
    );

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 8
      }
    );

    assert.equal(
      renovationSystem
        .getCatalog(
          restaurant.id
        )
        .filter(
          item =>
            item.unlocked
        )
        .length,
      100
    );
  }
);


test(
  "高档家具提升运营效果但不会凭空增加同族座位数",
  () => {
    const baseLayout = {
      width: 16,
      height: 12,
      active: true,
      placements: [
        {
          id: "p1",
          furnitureId:
            "table_2",
          x: 0,
          y: 0,
          rotation: 0
        },
        {
          id: "p2",
          furnitureId:
            "kitchen_station",
          x: 6,
          y: 0,
          rotation: 0
        },
        {
          id: "p3",
          furnitureId:
            "cashier_counter",
          x: 0,
          y: 4,
          rotation: 0
        },
        {
          id: "p4",
          furnitureId:
            "waiting_bench",
          x: 3,
          y: 4,
          rotation: 0
        },
        {
          id: "p5",
          furnitureId:
            "decor_plant",
          x: 6,
          y: 4,
          rotation: 0
        }
      ]
    };

    const flagshipLayout = {
      ...baseLayout,
      placements:
        baseLayout
          .placements
          .map(
            item => ({
              ...item,
              furnitureId: {
                table_2:
                  "table_2_flagship",
                kitchen_station:
                  "kitchen_station_flagship",
                cashier_counter:
                  "cashier_counter_flagship",
                waiting_bench:
                  "waiting_bench_flagship",
                decor_plant:
                  "decor_plant_flagship"
              }[
                item.furnitureId
              ]
            })
          )
    };

    const base =
      renovationSystem
        .getOperationalModifiersFromLayout(
          baseLayout
        );

    const flagship =
      renovationSystem
        .getOperationalModifiersFromLayout(
          flagshipLayout
        );

    assert.equal(
      base.seats,
      2
    );

    assert.equal(
      flagship.seats,
      2
    );

    assert.equal(
      base.kitchenStations,
      1
    );

    assert.equal(
      flagship.kitchenStations,
      1
    );

    assert.ok(
      flagship.kitchenEfficiency >
      base.kitchenEfficiency
    );

    assert.ok(
      flagship.serviceEfficiency >
      base.serviceEfficiency
    );

    assert.ok(
      flagship.queueEfficiency >
      base.queueEfficiency
    );

    assert.ok(
      flagship.queueCapacityBonus >
      base.queueCapacityBonus
    );

    assert.ok(
      flagship.appealMultiplier >
      base.appealMultiplier
    );

    assert.ok(
      flagship.comfortBonus >
      base.comfortBonus
    );
  }
);


test(
  "规划和动线系统识别新规格家具角色而不是写死旧ID",
  () => {
    const layout = {
      width: 16,
      height: 12,
      active: true,
      placements: [
        {
          id: "a",
          furnitureId:
            "table_4_standard",
          x: 0,
          y: 0,
          rotation: 0
        },
        {
          id: "b",
          furnitureId:
            "kitchen_station_standard",
          x: 7,
          y: 0,
          rotation: 0
        },
        {
          id: "c",
          furnitureId:
            "prep_counter_standard",
          x: 7,
          y: 3,
          rotation: 0
        },
        {
          id: "d",
          furnitureId:
            "cashier_counter_standard",
          x: 0,
          y: 4,
          rotation: 0
        },
        {
          id: "e",
          furnitureId:
            "waiting_bench_standard",
          x: 3,
          y: 4,
          rotation: 0
        },
        {
          id: "f",
          furnitureId:
            "decor_plant_standard",
          x: 6,
          y: 4,
          rotation: 0
        }
      ]
    };

    assert.equal(
      renovationPlanningSystem
        .getCompletenessScore(
          layout
        ),
      100
    );

    const flow =
      layoutFlowSystem
        .calculate(
          layout
        );

    assert.equal(
      flow.prepCount,
      1
    );

    assert.equal(
      flow.cashierCount,
      1
    );

    assert.equal(
      flow.waitingCount,
      1
    );

    assert.equal(
      flow.decorCount,
      1
    );

    assert.equal(
      flow.issues.includes(
        "no_cashier_counter"
      ),
      false
    );

    assert.equal(
      flow.issues.includes(
        "no_waiting_area"
      ),
      false
    );
  }
);
