import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../src/data/recipeRules.js";


const {
  gameState,
  simulationSystem,
  eventBus
} = app.core;


const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  employeeSystem,
  ingredientCatalogSystem,
  inventorySystem,
  dishCatalogSystem,
  recipeSystem,
  menuSystem,
  operatingScheduleSystem,
  operatingReportSystem
} = app.systems;


test(
  "首日营业会自动完成客流点单生产结账库存评价和日结",
  () => {
    gameState.reset();


    districtSystem.load(
      [
        {
          id:
            "operating_day_e2e_district",

          name:
            "首日营业测试商圈",

          trafficIndex:
            100,

          rentMultiplier:
            1,

          spendingPower:
            100,

          competition:
            0,

          customerMix: {
            office_worker:
              50,

            resident:
              50
          }
        }
      ],
      {
        overwrite:
          true
      }
    );


    const property =
      propertySystem.create({
        districtId:
          "operating_day_e2e_district",

        name:
          "首日营业测试铺位",

        area:
          120,

        usableArea:
          120,

        baseMonthlyRent:
          5000,

        seats:
          30,

        depositMonths:
          1,

        foodServiceAllowed:
          true,

        exhaustAllowed:
          true
      });


    const restaurant =
      restaurantSystem.create({
        name:
          "首日营业测试店",

        locationId:
          property.id
      });


    financeSystem.createAccount(
      restaurant.id,
      500000
    );


    const chef =
      employeeSystem.hire({
        restaurantId:
          restaurant.id,

        name:
          "首日厨师",

        roleId:
          "chef"
      });


    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "首日服务员",

      roleId:
        "server"
    });


    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "首日收银员",

      roleId:
        "cashier"
    });


    ingredientCatalogSystem.load(
      [
        {
          id:
            "operating_day_rice",

          name:
            "首日测试米",

          category:
            "grain",

          unit:
            "kg",

          storageType:
            "dry",

          basePurchasePrice:
            5,

          shelfLifeDays:
            180,

          edibleRate:
            1,

          baseWasteRate:
            0
        }
      ],
      {
        overwrite:
          true
      }
    );


    dishCatalogSystem.load(
      [
        {
          schemaVersion:
            DISH_SCHEMA_VERSION,

          id:
            "operating_day_dish",

          name:
            "首日测试饭",

          category:
            "rice",

          basePrice:
            28,

          unlockLevel:
            1,

          baseDifficulty:
            10,

          defaultRecipeId:
            getDefaultRecipeId(
              "operating_day_dish"
            )
        }
      ],
      {
        overwrite:
          true
      }
    );


    recipeSystem.load(
      [
        {
          schemaVersion:
            RECIPE_SCHEMA_VERSION,

          id:
            getDefaultRecipeId(
              "operating_day_dish"
            ),

          dishId:
            "operating_day_dish",

          variantId:
            "standard",

          name:
            "标准做法",

          method:
            "steam",

          difficulty:
            10,

          cookingMinutes:
            5,

          ingredients: [
            {
              ingredientId:
                "operating_day_rice",

              quantity:
                0.1
            }
          ]
        }
      ],
      {
        overwrite:
          true
      }
    );


    const menuItem =
      menuSystem.addItem({
        restaurantId:
          restaurant.id,

        dishId:
          "operating_day_dish",

        recipeId:
          getDefaultRecipeId(
            "operating_day_dish"
          ),

        price:
          28
      });


    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,

      ingredientId:
        "operating_day_rice",

      quantity:
        1000,

      quality:
        4
    });


    operatingScheduleSystem.create({
      restaurantId:
        restaurant.id,

      openHour:
        9,

      closeHour:
        14
    });


    const openingBalance =
      financeSystem.getBalance(
        restaurant.id
      );


    const openingInventory =
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "operating_day_rice"
        );


    let completedHours = 0;
    let completedOrders = 0;
    let settlements = 0;


    const stopTraffic =
      eventBus.on(
        "traffic:hourCompleted",
        payload => {
          if (
            payload.restaurantId ===
            restaurant.id
          ) {
            completedHours += 1;
          }
        }
      );


    const stopOrders =
      eventBus.on(
        "order:completed",
        payload => {
          if (
            payload
              ?.order
              ?.restaurantId ===
              restaurant.id
          ) {
            completedOrders += 1;
          }
        }
      );


    const stopSettlement =
      eventBus.on(
        "settlement:completed",
        payload => {
          if (
            payload
              ?.settlement
              ?.restaurantId ===
              restaurant.id
          ) {
            settlements += 1;
          }
        }
      );


    try {
      // Day 1 08:00 -> Day 2 00:00.
      // 09:00 自动开门，14:00 自动关门，
      // 00:00 自动完成第1天日结。
      simulationSystem.advanceFast(
        16 * 60
      );
    } finally {
      stopTraffic();
      stopOrders();
      stopSettlement();
    }


    assert.ok(
      completedHours >= 4,
      "营业时段没有正常执行小时模拟"
    );


    assert.ok(
      completedOrders > 0,
      "首日没有产生任何成交订单"
    );


    assert.equal(
      settlements,
      1
    );


    const orders =
      app.systems.orderSystem
        .listByRestaurant(
          restaurant.id
        );


    assert.ok(
      orders.length >
      0
    );


    assert.equal(
      orders.every(
        order =>
          order.status ===
          "completed"
      ),
      true
    );


    assert.ok(
      menuSystem
        .get(
          menuItem.id
        )
        .soldCount >
      0
    );


    const remainingInventory =
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          "operating_day_rice"
        );


    assert.ok(
      remainingInventory <
      openingInventory
    );


    const finance =
      financeSystem.getSummary(
        restaurant.id
      );


    assert.ok(
      finance.lifetimeIncome >
      0
    );


    assert.ok(
      financeSystem.getBalance(
        restaurant.id
      ) !==
      openingBalance
    );


    const updatedRestaurant =
      restaurantSystem.get(
        restaurant.id
      );


    assert.ok(
      updatedRestaurant
        .totalServedGuests >
      0
    );


    assert.ok(
      updatedRestaurant
        .totalReviews >
      0
    );


    assert.ok(
      employeeSystem
        .get(
          chef.id
        )
        .totalWorkMinutes >
      0
    );


    assert.equal(
      restaurantSystem.isOpen(
        restaurant.id
      ),
      false
    );


    const report =
      operatingReportSystem
        .generate(
          restaurant.id,
          "day"
        );


    assert.equal(
      report.finance.days,
      1
    );


    assert.ok(
      report.finance.orders >
      0
    );


    assert.ok(
      report.finance.revenue >
      0
    );


    assert.ok(
      report.dishes.length >
      0
    );


    assert.equal(
      report.topSellingDish
        .dishId,
      "operating_day_dish"
    );
  }
);
