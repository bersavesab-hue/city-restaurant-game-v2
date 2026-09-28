import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  createMobileGameController
} from "../client/mobile/MobileGameController.js";


function resetFoundation() {
  app.core
    .gameState
    .reset();

  app.systems
    .gameFoundationSystem
    .initialize({
      seedProperties:
        true,
      overwriteReferenceData:
        true
    });
}


test(
  "mobile controller creates exactly one real starter restaurant and reuses it",
  () => {
    resetFoundation();

    const controller =
      createMobileGameController(
        app
      );

    const first =
      controller
        .ensureStarterState();

    const second =
      controller
        .ensureStarterState();

    assert.equal(
      first.created,
      true
    );

    assert.equal(
      second.created,
      false
    );

    assert.equal(
      app.systems
        .restaurantSystem
        .count(),
      1
    );

    const restaurant =
      first.restaurant;

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      120000
    );

    assert.equal(
      app.systems
        .employeeSystem
        .listByRestaurant(
          restaurant.id
        )
        .length,
      3
    );

    assert.equal(
      app.systems
        .menuSystem
        .listByRestaurant(
          restaurant.id,
          {
            activeOnly:
              true
          }
        )
        .length,
      1
    );

    assert.ok(
      app.systems
        .inventorySystem
        .getSummary(
          restaurant.id
        )
        .length >
      0
    );

    assert.ok(
      app.systems
        .operatingScheduleSystem
        .get(
          restaurant.id
        )
    );
  }
);


test(
  "mobile actions use real time and restaurant systems",
  () => {
    resetFoundation();

    const controller =
      createMobileGameController(
        app
      );

    const {
      restaurant
    } =
      controller
        .ensureStarterState();

    app.core
      .timeSystem
      .resume();

    let result =
      controller
        .performAction(
          "speed",
          4
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.core
        .gameState
        .getSection(
          "runtime"
        )
        .speed,
      4
    );

    result =
      controller
        .performAction(
          "toggle-time"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.core
        .gameState
        .getSection(
          "runtime"
        )
        .paused,
      true
    );

    controller
      .performAction(
        "toggle-time"
      );

    result =
      controller
        .performAction(
          "toggle-restaurant"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.systems
        .restaurantSystem
        .get(
          restaurant.id
        )
        .status,
      "open"
    );

    controller
      .performAction(
        "advance-hour"
      );

    assert.equal(
      app.core
        .gameState
        .getSection(
          "time"
        )
        .hour,
      9
    );

    assert.ok(
      app.systems
        .orderSystem
        .listByRestaurant(
          restaurant.id
        )
        .length >
      0
    );
  }
);


test(
  "recommended procurement creates a real paid pending order",
  () => {
    resetFoundation();

    const controller =
      createMobileGameController(
        app
      );

    const {
      restaurant
    } =
      controller
        .ensureStarterState();

    const target =
      controller
        .getProcurementTarget(
          restaurant.id
        );

    assert.ok(
      target
    );

    const before =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    const result =
      controller
        .performAction(
          "purchase"
        );

    assert.equal(
      result.ok,
      true
    );

    const pending =
      app.systems
        .procurementSystem
        .listByRestaurant(
          restaurant.id,
          "pending"
        );

    assert.equal(
      pending.length,
      1
    );

    assert.ok(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ) <
      before
    );
  }
);
