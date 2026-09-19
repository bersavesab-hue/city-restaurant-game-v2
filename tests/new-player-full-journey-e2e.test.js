import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  dishManagementSystem
} from "../src/systems/DishManagementSystem.js";

import {
  renovationConstructionSystem
} from "../src/systems/RenovationConstructionSystem.js";

import {
  cityPropertyPageSystem
} from "../src/ui/pages/city/CityPropertyPageSystem.js";

import {
  openingSetupPageSystem
} from "../src/ui/pages/opening/OpeningSetupPageSystem.js";


const {
  gameState,
  timeSystem,
  simulationSystem
} = app.core;


const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationSystem,
  employeeSystem,
  ingredientCatalogSystem,
  supplierSystem,
  openingFlowSystem,
  onboardingSystem,
  orderSystem,
  operatingReportSystem
} = app.systems;


test(
  "真实新玩家可以从空店连续跑到首单、评价、日结和100%引导",
  () => {
    gameState.reset();


    districtSystem.load(
      [
        {
          id:
            "playtest_journey_district",

          name:
            "试玩验收商圈",

          trafficIndex:
            90,

          rentMultiplier:
            1,

          spendingPower:
            80,

          competition:
            20,

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
          "playtest_journey_district",

        name:
          "试玩验收铺位",

        area:
          120,

        usableArea:
          120,

        baseMonthlyRent:
          6000,

        seats:
          24,

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
          "试玩验收小馆"
      });


    financeSystem.createAccount(
      restaurant.id,
      300000
    );


    // --------------------------------------------------------
    // 1. 首次进入必须从选址开始，不能被测试夹具跳过
    // --------------------------------------------------------

    let onboarding =
      onboardingSystem.getState(
        restaurant.id
      );


    assert.equal(
      onboarding.completedCount,
      0
    );


    assert.equal(
      onboarding.nextStep.id,
      "location"
    );


    assert.equal(
      employeeSystem
        .listByRestaurant(
          restaurant.id
        )
        .length,
      0
    );


    // --------------------------------------------------------
    // 2. 选址签约
    // --------------------------------------------------------

    cityPropertyPageSystem
      .signLease({
        restaurantId:
          restaurant.id,

        propertyId:
          property.id,

        months:
          12
      });


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "renovation"
    );


    // --------------------------------------------------------
    // 3. 装修并完成施工验收
    // --------------------------------------------------------

    renovationSystem.initialize(
      restaurant.id
    );


    renovationSystem.placeItem({
      restaurantId:
        restaurant.id,

      furnitureId:
        "table_4",

      x:
        0,

      y:
        0
    });


    renovationSystem.placeItem({
      restaurantId:
        restaurant.id,

      furnitureId:
        "kitchen_station",

      x:
        3,

      y:
        0
    });


    const construction =
      renovationConstructionSystem
        .startSavedLayout(
          restaurant.id,
          {
            projectCost:
              0,

            expectedBaseConstructionCost:
              0
          }
        );


    const currentDay =
      gameState
        .getSection(
          "time"
        )
        .day;


    timeSystem.advance(
      (
        construction.endDay -
        currentDay
      ) *
      1440
    );


    renovationConstructionSystem
      .inspect(
        restaurant.id
      );


    assert.equal(
      renovationSystem
        .getSummary(
          restaurant.id
        )
        .active,
      true
    );


    // --------------------------------------------------------
    // 4. 正式招聘：厨师 + 服务员 + 收银
    // --------------------------------------------------------

    for (
      const employee
      of [
        {
          name:
            "试玩厨师",
          roleId:
            "chef"
        },
        {
          name:
            "试玩服务员",
          roleId:
            "server"
        },
        {
          name:
            "试玩收银员",
          roleId:
            "cashier"
        }
      ]
    ) {
      employeeSystem.hire({
        restaurantId:
          restaurant.id,

        ...employee
      });
    }


    assert.equal(
      employeeSystem
        .listByRestaurant(
          restaurant.id
        )
        .length,
      3
    );


    // --------------------------------------------------------
    // 5. 食材、供应商与第一道自研菜
    // --------------------------------------------------------

    ingredientCatalogSystem.load(
      [
        {
          id:
            "playtest_rice",

          name:
            "试玩大米",

          category:
            "grain",

          unit:
            "g",

          storageType:
            "dry",

          basePurchasePrice:
            1,

          shelfLifeDays:
            180,

          edibleRate:
            1,

          baseWasteRate:
            0
        },

        {
          id:
            "playtest_veg",

          name:
            "试玩青菜",

          category:
            "vegetable",

          unit:
            "g",

          storageType:
            "chilled",

          basePurchasePrice:
            1,

          shelfLifeDays:
            7,

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


    const supplier =
      supplierSystem.create({
        name:
          "试玩供应商",

        relationship:
          70,

        reliability:
          100
      });


    for (
      const ingredientId
      of [
        "playtest_rice",
        "playtest_veg"
      ]
    ) {
      supplierSystem.addOffer(
        supplier.id,
        ingredientId,
        {
          priceMultiplier:
            1,

          priceVolatility:
            0,

          qualityMin:
            4,

          qualityMax:
            4,

          deliveryMinutes:
            30,

          capacityPerDay:
            10000,

          minimumOrder:
            1
        }
      );
    }


    const research =
      dishManagementSystem
        .manualResearch({
          restaurantId:
            restaurant.id,

          name:
            "试玩青菜饭",

          category:
            "rice",

          method:
            "steam",

          ingredients: [
            {
              ingredientId:
                "playtest_rice",

              quantity:
                100
            },

            {
              ingredientId:
                "playtest_veg",

              quantity:
                50
            }
          ]
        });


    dishManagementSystem
      .addToMenu({
        restaurantId:
          restaurant.id,

        dishId:
          research.dish.id,

        price:
          32
      });


    // --------------------------------------------------------
    // 6. 证照、营业时间、首批采购
    // --------------------------------------------------------

    openingFlowSystem
      .completePermits(
        restaurant.id
      );


    timeSystem.advance(
      2 * 1440
    );


    openingFlowSystem
      .configureSchedule(
        restaurant.id,
        {
          openHour:
            9,

          closeHour:
            22
        }
      );


    openingFlowSystem
      .purchaseStarterStock(
        restaurant.id
      );


    timeSystem.advance(
      60
    );


    const ready =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      ready.canOpen,
      true
    );


    assert.equal(
      ready.preparation.complete,
      ready.preparation.total
    );


    // --------------------------------------------------------
    // 7. 正式开业；这时引导必须只差首单
    // --------------------------------------------------------

    openingSetupPageSystem
      .openRestaurant(
        restaurant.id
      );


    onboarding =
      onboardingSystem.getState(
        restaurant.id
      );


    assert.equal(
      onboarding.completed,
      false
    );


    assert.equal(
      onboarding.nextStep.id,
      "first_order"
    );


    assert.equal(
      onboarding.completedCount,
      6
    );


    // --------------------------------------------------------
    // 8. 同一家店继续真实模拟到午夜日结
    //    必须跨过22:00自动打烊，验证引导不会倒退
    // --------------------------------------------------------

    const balanceBefore =
      financeSystem.getBalance(
        restaurant.id
      );


    const currentTime =
      timeSystem.getTime();


    const minutesIntoDay =
      currentTime.hour *
      60 +
      currentTime.minute;


    const minutesToMidnight =
      1440 -
      minutesIntoDay;


    simulationSystem.advanceFast(
      minutesToMidnight
    );


    const orders =
      orderSystem
        .listByRestaurant(
          restaurant.id
        );


    assert.ok(
      orders.length >
      0,
      "开业后的24小时没有产生订单"
    );


    assert.equal(
      orders.some(
        order =>
          order.status ===
          "completed"
      ),
      true,
      "开业后没有完成任何真实订单"
    );


    const updated =
      restaurantSystem.get(
        restaurant.id
      );


    assert.ok(
      updated.totalServedGuests >
      0,
      "开业后没有服务任何顾客"
    );


    assert.ok(
      updated.totalReviews >
      0,
      "开业后没有产生任何评价"
    );


    const finance =
      financeSystem.getSummary(
        restaurant.id
      );


    assert.ok(
      finance.lifetimeIncome >
      0,
      "开业后没有营业收入"
    );


    assert.notEqual(
      financeSystem.getBalance(
        restaurant.id
      ),
      balanceBefore,
      "首日经营没有影响门店现金"
    );


    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).status,
      "closed",
      "午夜日结前门店应该已按营业时间正常打烊"
    );


    const report =
      operatingReportSystem
        .generate(
          restaurant.id,
          "day"
        );


    assert.ok(
      report.finance.orders >
      0,
      "日结报告没有订单"
    );


    assert.ok(
      report.finance.revenue >
      0,
      "日结报告没有营业收入"
    );


    // --------------------------------------------------------
    // 9. 第一单完成后，新手引导必须真正结束
    // --------------------------------------------------------

    onboarding =
      onboardingSystem.getState(
        restaurant.id
      );


    assert.equal(
      onboarding.completed,
      true
    );


    assert.equal(
      onboarding.completedCount,
      7
    );


    assert.equal(
      onboarding.totalSteps,
      7
    );


    assert.equal(
      onboarding.progress,
      100
    );


    assert.equal(
      onboarding.nextStep,
      null
    );
  }
);
