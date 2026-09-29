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

test(
  "dish workflow changes price toggles sale state and researches a real custom dish",
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

    const starter =
      view.dishes
        .selectedDish;

    assert.ok(
      starter
        ?.menuItem
    );

    const oldPrice =
      starter
        .menuItem
        .price;

    let result =
      controller
        .performAction(
          "dish-price",
          "plus5"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.systems
        .menuSystem
        .get(
          starter
            .menuItem
            .id
        )
        .price,
      oldPrice + 5
    );

    result =
      controller
        .performAction(
          "dish-toggle-active"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.systems
        .menuSystem
        .get(
          starter
            .menuItem
            .id
        )
        .active,
      false
    );

    controller
      .performAction(
        "dish-toggle-active"
      );

    const balanceBefore =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    result =
      controller
        .performAction(
          "dish-research"
        );

    assert.equal(
      result.ok,
      true
    );

    const custom =
      result
        .viewModel
        .dishes
        .selectedDish;

    assert.equal(
      custom.custom,
      true
    );

    assert.ok(
      custom.recipe
    );

    assert.ok(
      custom.progress
    );

    assert.ok(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ) <
      balanceBefore
    );

    result =
      controller
        .performAction(
          "dish-add-menu"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.ok(
      app.systems
        .menuSystem
        .listByRestaurant(
          restaurant.id
        )
        .some(
          item =>
            item.dishId ===
            custom.id
        )
    );
  }
);


test(
  "dish price active state custom research and menu placement survive save reload",
  () => {
    resetFoundation();

    const slot =
      "t09-dishes";

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

    let view =
      controller
        .getViewModel();

    const starter =
      view.dishes
        .selectedDish;

    controller
      .performAction(
        "dish-price",
        "plus1"
      );

    controller
      .performAction(
        "dish-toggle-active"
      );

    const research =
      controller
        .performAction(
          "dish-research"
        );

    assert.equal(
      research.ok,
      true
    );

    const customId =
      research
        .viewModel
        .dishes
        .selectedDish
        .id;

    const add =
      controller
        .performAction(
          "dish-add-menu"
        );

    assert.equal(
      add.ok,
      true
    );

    app.core
      .saveSystem
      .save(
        slot
      );

    app.core
      .gameState
      .reset();

    app.core
      .saveSystem
      .load(
        slot
      );

    const starterAfter =
      app.systems
        .menuSystem
        .get(
          starter
            .menuItem
            .id
        );

    assert.equal(
      starterAfter.price,
      starter
        .menuItem
        .price +
        1
    );

    assert.equal(
      starterAfter.active,
      false
    );

    const customDish =
      app.systems
        .dishCatalogSystem
        .get(
          customId
        );

    assert.equal(
      customDish.custom,
      true
    );

    assert.ok(
      app.systems
        .menuSystem
        .listByRestaurant(
          restaurant.id
        )
        .some(
          item =>
            item.dishId ===
            customId
        )
    );

    app.core
      .saveSystem
      .remove(
        slot
      );
  }
);

test(
  "employee workflow hires trains adjusts salary and creates a real five-day schedule",
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

    assert.equal(
      view.staff
        .employees
        .length,
      3
    );

    assert.ok(
      view.staff
        .candidates
        .length >
      0
    );

    const candidate =
      view.staff
        .selectedCandidate;

    const hire =
      controller
        .performAction(
          "staff-hire-candidate"
        );

    assert.equal(
      hire.ok,
      true
    );

    assert.equal(
      app.systems
        .employeeSystem
        .listByRestaurant(
          restaurant.id
        )
        .length,
      4
    );

    assert.equal(
      app.core
        .entitySystem
        .get(
          "employee_candidate",
          candidate.id
        )
        .status,
      "hired"
    );

    view =
      hire.viewModel;

    const employee =
      view.staff
        .selectedEmployee;

    const training =
      employee
        .trainingPrograms
        .find(
          program =>
            program.unlocked
        );

    assert.ok(
      training
    );

    const balanceBefore =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    const trainingCountBefore =
      employee
        .trainingCount ??
      0;

    const trained =
      controller
        .performAction(
          "staff-train",
          training.id
        );

    assert.equal(
      trained.ok,
      true
    );

    const employeeAfterTraining =
      app.systems
        .employeeSystem
        .get(
          employee.id
        );

    assert.equal(
      employeeAfterTraining
        .trainingCount,
      trainingCountBefore +
        1
    );

    assert.ok(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ) <
      balanceBefore
    );

    const salaryBefore =
      employeeAfterTraining
        .salary;

    const salary =
      controller
        .performAction(
          "staff-salary",
          "plus100"
        );

    assert.equal(
      salary.ok,
      true
    );

    assert.equal(
      app.systems
        .employeeSystem
        .get(
          employee.id
        )
        .salary,
      salaryBefore + 100
    );

    const scheduled =
      controller
        .performAction(
          "staff-schedule-all"
        );

    assert.equal(
      scheduled.ok,
      true
    );

    const shifts =
      app.systems
        .employeeStaffingSystem
        .getSchedule(
          restaurant.id
        )
        .filter(
          shift =>
            shift.employeeId ===
            employee.id
        );

    assert.equal(
      shifts.length,
      5
    );

    assert.deepEqual(
      shifts.map(
        shift =>
          shift.weekday
      ),
      [
        1,
        2,
        3,
        4,
        5
      ]
    );

    assert.ok(
      shifts.every(
        shift =>
          shift.plannedMinutes ===
          480
      )
    );
  }
);


test(
  "employee salary schedule and hired candidate survive save reload",
  () => {
    resetFoundation();

    const slot =
      "t09-staff";

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

    let view =
      controller
        .getViewModel();

    const starter =
      view.staff
        .selectedEmployee;

    const starterSalary =
      starter.salary;

    controller
      .performAction(
        "staff-salary",
        "plus500"
      );

    controller
      .performAction(
        "staff-schedule-all"
      );

    const candidateId =
      view.staff
        .selectedCandidate
        .id;

    const hired =
      controller
        .performAction(
          "staff-hire-candidate"
        );

    assert.equal(
      hired.ok,
      true
    );

    const hiredEmployeeId =
      hired
        .viewModel
        .staff
        .selectedEmployee
        .id;

    app.core
      .saveSystem
      .save(
        slot
      );

    app.core
      .gameState
      .reset();

    app.core
      .saveSystem
      .load(
        slot
      );

    assert.equal(
      app.systems
        .employeeSystem
        .get(
          starter.id
        )
        .salary,
      starterSalary + 500
    );

    const restoredShifts =
      app.systems
        .employeeStaffingSystem
        .getSchedule(
          restaurant.id
        )
        .filter(
          shift =>
            shift.employeeId ===
            starter.id
        );

    assert.equal(
      restoredShifts.length,
      5
    );

    assert.equal(
      app.core
        .entitySystem
        .get(
          "employee_candidate",
          candidateId
        )
        .status,
      "hired"
    );

    assert.equal(
      app.systems
        .employeeSystem
        .get(
          hiredEmployeeId
        )
        .status,
      "active"
    );

    app.core
      .saveSystem
      .remove(
        slot
      );
  }
);

test(
  "marketing workflow deducts cost and changes real demand through active modifiers",
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

    const selected =
      view.business
        .marketing
        .selectedAction;

    assert.ok(
      selected
    );

    const beforeBalance =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    const beforeDemand =
      app.systems
        .trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          12
        )
        .expectedVisitors;

    const result =
      controller
        .performAction(
          "marketing-start"
        );

    assert.equal(
      result.ok,
      true
    );

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      beforeBalance -
        selected.cost
    );

    const active =
      app.systems
        .marketActionSystem
        .getActiveActions(
          restaurant.id
        );

    assert.equal(
      active.length,
      1
    );

    assert.equal(
      active[0].type,
      selected.id
    );

    const modifiers =
      app.systems
        .marketActionSystem
        .getModifiers(
          restaurant.id
        );

    assert.ok(
      modifiers
        .demandMultiplier >
      1
    );

    const afterDemand =
      app.systems
        .trafficDemandSystem
        .getHourlyDemand(
          restaurant.id,
          12
        )
        .expectedVisitors;

    assert.ok(
      afterDemand >
      beforeDemand
    );

    view =
      result.viewModel;

    assert.equal(
      view.business
        .marketing
        .active
        .length,
      1
    );

    assert.ok(
      view.business
        .marketing
        .history
        .some(
          item =>
            item.type ===
              selected.id &&
            item.status ===
              "started"
        )
    );
  }
);


test(
  "marketing expiry and cooldown use the real market action rules",
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

    const action =
      app.systems
        .marketActionSystem
        .startAction(
          restaurant.id,
          "local_ads"
        );

    const dayAfterEnd =
      action.endDay + 1;

    app.systems
      .marketActionSystem
      .processDay(
        dayAfterEnd
      );

    assert.equal(
      app.systems
        .marketActionSystem
        .getActiveActions(
          restaurant.id,
          dayAfterEnd
        )
        .length,
      0
    );

    const cooling =
      app.systems
        .marketActionSystem
        .getAvailability(
          restaurant.id,
          "local_ads",
          dayAfterEnd
        );

    assert.equal(
      cooling.canStart,
      false
    );

    assert.ok(
      cooling.reasons
        .includes(
          "cooldown"
        )
    );

    const ready =
      app.systems
        .marketActionSystem
        .getAvailability(
          restaurant.id,
          "local_ads",
          cooling.availableDay
        );

    assert.equal(
      ready.canStart,
      true
    );

    const history =
      app.systems
        .marketActionSystem
        .getHistory(
          restaurant.id
        );

    assert.equal(
      history[0].status,
      "ended"
    );
  }
);


test(
  "active marketing action history and paid balance survive save reload",
  () => {
    resetFoundation();

    const slot =
      "t09-marketing";

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

    const before =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    const start =
      controller
        .performAction(
          "marketing-start"
        );

    assert.equal(
      start.ok,
      true
    );

    const action =
      start
        .viewModel
        .business
        .marketing
        .active[0];

    const paidBalance =
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        );

    assert.ok(
      paidBalance <
      before
    );

    app.core
      .saveSystem
      .save(
        slot
      );

    app.core
      .gameState
      .reset();

    app.core
      .saveSystem
      .load(
        slot
      );

    const restoredActive =
      app.systems
        .marketActionSystem
        .getActiveActions(
          restaurant.id
        );

    assert.equal(
      restoredActive.length,
      1
    );

    assert.equal(
      restoredActive[0].id,
      action.id
    );

    assert.equal(
      app.systems
        .financeSystem
        .getBalance(
          restaurant.id
        ),
      paidBalance
    );

    assert.ok(
      app.systems
        .marketActionSystem
        .getHistory(
          restaurant.id
        )
        .some(
          item =>
            item.id ===
            action.id
        )
    );

    app.core
      .saveSystem
      .remove(
        slot
      );
  }
);

test(
  "marketing discount changes actual order revenue and review campaign reaches customer experience",
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

    controller
      .getViewModel();

    controller
      .performAction(
        "marketing-select",
        "flash_coupon"
      );

    const discountStart =
      controller
        .performAction(
          "marketing-start"
        );

    assert.equal(
      discountStart.ok,
      true
    );

    controller
      .performAction(
        "toggle-restaurant"
      );

    const menuItem =
      app.systems
        .menuSystem
        .listByRestaurant(
          restaurant.id,
          {
            activeOnly:
              true
          }
        )[0];

    const order =
      app.systems
        .orderSystem
        .place({
          restaurantId:
            restaurant.id,
          items: [
            {
              menuItemId:
                menuItem.id,
              quantity:
                1
            }
          ]
        });

    assert.equal(
      order.items[0]
        .unitPrice,
      Math.max(
        1,
        Math.round(
          menuItem.price *
          .9
        )
      )
    );

    assert.equal(
      order.totalRevenue,
      order.items[0]
        .unitPrice
    );

    resetFoundation();

    const reviewController =
      createMobileGameController(
        app
      );

    const {
      restaurant:
        reviewRestaurant
    } =
      reviewController
        .ensureStarterState();

    app.systems
      .storeProgressSystem
      .addExperience(
        reviewRestaurant.id,
        500
      );

    reviewController
      .getViewModel();

    reviewController
      .performAction(
        "marketing-select",
        "nearby_search_boost"
      );

    const reviewStart =
      reviewController
        .performAction(
          "marketing-start"
        );

    assert.equal(
      reviewStart.ok,
      true
    );

    const beforeReviews =
      app.systems
        .restaurantSystem
        .get(
          reviewRestaurant.id
        )
        .totalReviews;

    const experience =
      app.systems
        .customerExperienceSystem
        .recordHour({
          restaurantId:
            reviewRestaurant.id,
          demand: {
            segments: []
          },
          result: {
            visitors:
              1,
            completedOrders:
              1,
            rejectedVisitors:
              0,
            failedOrders:
              0,
            queuedVisitors:
              0,
            averageQuality:
              80,
            estimatedWaitMinutes:
              0,
            queuePatienceMinutes:
              12
          }
        });

    assert.equal(
      experience
        .marketingEffects
        .reviewPropensityMultiplier,
      1.05
    );

    assert.ok(
      app.systems
        .restaurantSystem
        .get(
          reviewRestaurant.id
        )
        .totalReviews >
      beforeReviews
    );
  }
);
