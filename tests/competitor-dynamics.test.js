import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  marketCompetitionSystem,
  competitorDynamicsSystem
} = app.systems;

test(
  "竞争店会调整策略并有经营生命周期",
  () => {
    districtSystem.load(
      [
        {
          id:
            "dynamic_competition_area",

          name:
            "竞争动态测试区",

          trafficIndex: 70,

          rentMultiplier: 1,

          spendingPower: 60,

          competition: 100,

          customerMix: {
            office_worker: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const store =
      marketCompetitionSystem
        .create({
          districtId:
            "dynamic_competition_area",

          name:
            "弱势竞争店",

          priceIndex: 2.5,

          qualityScore: 5,

          reputation: 5,

          serviceScore: 5,

          segmentFocus:
            "office_worker"
        });

    const beforePrice =
      store.priceIndex;

    const discounted =
      competitorDynamicsSystem
        .applyStrategy(
          store.id,
          "discount"
        );

    assert.ok(
      discounted.priceIndex <
      beforePrice
    );

    for (
      let day = 1;
      day <= 35;
      day += 1
    ) {
      competitorDynamicsSystem
        .processDay(day);
    }

    const after =
      app.core.entitySystem.get(
        "competitor_store",
        store.id
      );

    assert.equal(
      after.active,
      false
    );

    assert.ok(
      after.closedDay !== null
    );

    const removed =
      competitorDynamicsSystem
        .pruneClosed(
          after.closedDay + 90
        );

    assert.ok(
      removed >= 1
    );
  }
);
