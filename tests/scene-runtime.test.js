import test from "node:test";
import assert from "node:assert/strict";

import {
  GridPathfinder
} from "../src/scene/GridPathfinder.js";

import {
  RestaurantSceneSystem
} from "../src/scene/RestaurantSceneSystem.js";

test(
  "GridPathfinder can route around blocked furniture",
  () => {
    const pathfinder =
      new GridPathfinder({
        width: 6,
        height: 6,
        blocked: [
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 }
        ]
      });

    const path =
      pathfinder.findPath(
        { x: 1, y: 2 },
        { x: 4, y: 2 }
      );

    assert.ok(path.length > 0);

    assert.equal(
      path.some(
        point =>
          point.x === 2 &&
          [1, 2, 3].includes(point.y)
      ),
      false
    );

    assert.deepEqual(
      path[0],
      { x: 1, y: 2 }
    );

    assert.deepEqual(
      path[path.length - 1],
      { x: 4, y: 2 }
    );
  }
);

test(
  "RestaurantSceneSystem runs visible service flow before final settlement",
  () => {
    let settledOrders = 0;

    const employees = [
      {
        id: "employee_chef",
        name: "厨师",
        roleId: "chef"
      },
      {
        id: "employee_server",
        name: "服务员",
        roleId: "server"
      },
      {
        id: "employee_cashier",
        name: "收银员",
        roleId: "cashier"
      }
    ];

    const app = {
      core: {
        eventBus: {
          emit() {}
        }
      },
      systems: {
        employeeSystem: {
          listByRestaurant() {
            return employees;
          }
        },

        menuSystem: {
          get() {
            return {
              id: "menu_1",
              restaurantId: "restaurant_1",
              recipeId: "recipe_1"
            };
          }
        },

        recipeSystem: {
          get() {
            return {
              id: "recipe_1",
              cookingMinutes: 2
            };
          }
        },

        orderSystem: {
          place() {
            settledOrders += 1;

            return {
              id:
                `order_${settledOrders}`,
              paidAmount: 28
            };
          }
        }
      }
    };

    const scene =
      new RestaurantSceneSystem({
        app,
        random: () => 0.5
      });

    scene.start({
      restaurantId: "restaurant_1",
      menuItemId: "menu_1",
      spawnEverySeconds: 100,
      maxCustomers: 1
    });

    scene.spawnCustomer();

    const seen = new Set();

    for (
      let i = 0;
      i < 1400;
      i += 1
    ) {
      const snapshot =
        scene.tick(0.05);

      for (
        const actor
        of snapshot.actors
      ) {
        if (actor.kind === "customer") {
          seen.add(actor.state);
        }
      }

      if (
        snapshot.stats.paid >= 1 &&
        snapshot.stats.left >= 1
      ) {
        break;
      }
    }

    const snapshot =
      scene.getSnapshot();

    assert.equal(
      settledOrders,
      1
    );

    assert.equal(
      snapshot.stats.paid,
      1
    );

    assert.equal(
      snapshot.stats.left,
      1
    );

    assert.equal(
      snapshot.stats.revenue,
      28
    );

    assert.ok(
      snapshot.stats.ordersTaken >= 1
    );

    assert.ok(
      snapshot.stats.dishesCooked >= 1
    );

    assert.ok(
      snapshot.stats.served >= 1
    );

    for (
      const expected
      of [
        "entering",
        "walking_to_table",
        "waiting_order",
        "waiting_food",
        "eating",
        "walking_to_cashier",
        "paying",
        "leaving"
      ]
    ) {
      assert.ok(
        seen.has(expected),
        `scene never reached state ${expected}`
      );
    }

    assert.equal(
      snapshot.tables.every(
        table =>
          [
            "available",
            "occupied",
            "dirty"
          ].includes(
            table.status
          )
      ),
      true
    );
  }
);
