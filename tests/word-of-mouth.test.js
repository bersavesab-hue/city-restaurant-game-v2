import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  eventBus
} from "../src/core/EventBus.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  wordOfMouthSystem
} from "../src/systems/WordOfMouthSystem.js";

import {
  reputationPageSystem
} from "../src/ui/pages/reputation/ReputationPageSystem.js";

import {
  ReputationView
} from "../src/ui/pages/reputation/ReputationView.js";

test(
  "好评和热门菜品形成口碑并影响后续客流系数",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "口碑测试店"
      });

    wordOfMouthSystem
      .recordExperience(
        restaurant.id,
        {
          satisfaction: 90,
          reviewScore: 4.8
        }
      );

    wordOfMouthSystem
      .recordExperience(
        restaurant.id,
        {
          satisfaction: 88,
          reviewScore: 4.7
        }
      );

    eventBus.emit(
      "order:completed",
      {
        order: {
          id:
            "buzz_order_001",

          restaurantId:
            restaurant.id,

          averageQuality:
            88,

          items: [
            {
              dishId:
                "dish_signature",

              quantity:
                3,

              qualityScore:
                92
            },
            {
              dishId:
                "dish_normal",

              quantity:
                1,

              qualityScore:
                65
            }
          ]
        }
      }
    );

    const dashboard =
      wordOfMouthSystem
        .getDashboard(
          restaurant.id
        );

    assert.ok(
      dashboard
        .wordOfMouthScore >
      0
    );

    assert.ok(
      dashboard
        .wordOfMouthFactor >
      1
    );

    assert.equal(
      dashboard.reviewEvents,
      2
    );

    assert.equal(
      dashboard.positives,
      2
    );

    assert.equal(
      dashboard.dishBuzz[0]
        .dishId,
      "dish_signature"
    );

    assert.equal(
      dashboard.dishBuzz[0]
        .mentions,
      3
    );

    const page =
      reputationPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new ReputationView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /评价与口碑/
    );

    assert.match(
      html,
      /客流影响/
    );

    assert.match(
      html,
      /热门菜品讨论/
    );
  }
);
