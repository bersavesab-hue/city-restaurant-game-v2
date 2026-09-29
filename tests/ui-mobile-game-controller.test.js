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
      app.core
        .gameState
        .getSection(
          "simulation"
        )
        .processedHours >=
      1
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

test(
  "formal procurement draft locks one quote then creates and cancels a real order",
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

    const initial =
      controller
        .getViewModel();

    assert.ok(
      initial.business
        .selectedIngredient
    );

    assert.ok(
      initial.business
        .selectedSupplier
    );

    const balanceBefore =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    const quoteResult =
      controller
        .performAction(
          "procurement-quote"
        );

    assert.equal(
      quoteResult.ok,
      true
    );

    const quote =
      quoteResult
        .viewModel
        .business
        .quote;

    assert.ok(
      quote
    );

    assert.ok(
      quote.totalPrice >
      0
    );

    const rerenderedQuote =
      controller
        .getViewModel()
        .business
        .quote;

    assert.equal(
      rerenderedQuote
        .totalPrice,
      quote.totalPrice
    );

    assert.equal(
      rerenderedQuote
        .quality,
      quote.quality
    );

    const purchaseResult =
      controller
        .performAction(
          "procurement-purchase"
        );

    assert.equal(
      purchaseResult.ok,
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

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      balanceBefore -
        pending[0]
          .totalPrice
    );

    const cancelResult =
      controller
        .performAction(
          "procurement-cancel",
          pending[0].id
        );

    assert.equal(
      cancelResult.ok,
      true
    );

    assert.equal(
      app.systems
        .procurementSystem
        .get(
          pending[0].id
        )
        .status,
      "cancelled"
    );

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      balanceBefore
    );
  }
);


test(
  "formal procurement order reaches inventory through the real scheduler",
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

    let view =
      controller
        .getViewModel();

    const ingredientId =
      view.business
        .selectedIngredient
        .id;

    const before =
      app.systems
        .inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          ingredientId
        );

    controller
      .performAction(
        "procurement-quote"
      );

    const purchase =
      controller
        .performAction(
          "procurement-purchase"
        );

    assert.equal(
      purchase.ok,
      true
    );

    view =
      purchase.viewModel;

    const pending =
      view.business
        .pendingOrders[0];

    assert.ok(
      pending
    );

    app.core
      .timeSystem
      .advance(
        pending
          .deliveryMinutes
      );

    const delivered =
      app.systems
        .procurementSystem
        .get(
          pending.id
        );

    assert.equal(
      delivered.status,
      "delivered"
    );

    assert.ok(
      delivered
        .inventoryBatchId
    );

    assert.equal(
      app.systems
        .inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          ingredientId
        ),
      before +
        delivered.quantity
    );
  }
);

test(
  "formal procurement order and paid balance survive save and reload",
  () => {
    resetFoundation();

    const slot =
      "t09-procurement";

    app.core
      .saveSystem
      .remove(
        slot
      );

    const controller =
      createMobileGameController(
        app
      );

    const {
      restaurant
    } =
      controller
        .ensureStarterState();

    controller
      .performAction(
        "procurement-quote"
      );

    const purchase =
      controller
        .performAction(
          "procurement-purchase"
        );

    assert.equal(
      purchase.ok,
      true
    );

    const pending =
      purchase
        .viewModel
        .business
        .pendingOrders[0];

    assert.ok(
      pending
    );

    const savedBalance =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    app.core
      .saveSystem
      .save(
        slot
      );

    app.core
      .gameState
      .reset();

    assert.equal(
      app.systems
        .restaurantSystem
        .list()
        .length,
      0
    );

    const loaded =
      app.core
        .saveSystem
        .load(
          slot
        );

    assert.equal(
      loaded.source,
      "primary"
    );

    assert.equal(
      app.systems
        .procurementSystem
        .get(
          pending.id
        )
        .status,
      "pending"
    );

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      savedBalance
    );

    app.core
      .saveSystem
      .remove(
        slot
      );
  }
);
