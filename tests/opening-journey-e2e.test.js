import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  onboardingSystem
} from "../src/systems/OnboardingSystem.js";

import {
  gameState
} from "../src/core/GameState.js";

import {
  timeSystem
} from "../src/core/TimeSystem.js";

import {
  districtSystem
} from "../src/systems/DistrictSystem.js";

import {
  propertySystem
} from "../src/systems/PropertySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  renovationSystem
} from "../src/systems/RenovationSystem.js";

import {
  renovationConstructionSystem
} from "../src/systems/RenovationConstructionSystem.js";

import {
  employeeSystem
} from "../src/systems/EmployeeSystem.js";

import {
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  supplierSystem
} from "../src/systems/SupplierSystem.js";

import {
  dishManagementSystem
} from "../src/systems/DishManagementSystem.js";

import {
  openingFlowSystem
} from "../src/systems/OpeningFlowSystem.js";

import {
  cityPropertyPageSystem
} from "../src/ui/pages/city/CityPropertyPageSystem.js";

import {
  openingSetupPageSystem
} from "../src/ui/pages/opening/OpeningSetupPageSystem.js";

import {
  operatingCommandCenterPageSystem
} from "../src/ui/pages/command-center/OperatingCommandCenterPageSystem.js";


test(
  "从空店到正式开业可以完整跑通",
  () => {
    gameState.reset();


    // ========================================================
    // 1. 商圈 + 房源 + 门店
    // ========================================================

    districtSystem.load(
      [
        {
          id:
            "opening_e2e_district",

          name:
            "开店E2E商圈",

          trafficIndex:
            70,

          rentMultiplier:
            1,

          spendingPower:
            65,

          competition:
            40,

          customerMix: {
            resident:
              100
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
          "opening_e2e_district",

        name:
          "开店E2E铺位",

        area:
          100,

        usableArea:
          100,

        baseMonthlyRent:
          6000,

        seats:
          20,

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
          "第二阶段测试小馆"
      });


    financeSystem.createAccount(
      restaurant.id,
      2000000
    );


    let status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.nextAction.id,
      "lease"
    );


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "city"
    );


    // ========================================================
    // 2. 签约
    // ========================================================

    const lease =
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
      lease.nextPage,
      "renovation"
    );


    assert.equal(
      restaurantSystem
        .get(
          restaurant.id
        )
        .locationId,
      property.id
    );


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "renovation"
    );


    // ========================================================
    // 3. 装修布局
    // ========================================================

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


    let renovation =
      renovationSystem.getSummary(
        restaurant.id
      );


    assert.equal(
      renovation.modifiers.seats,
      4
    );


    assert.equal(
      renovation
        .modifiers
        .kitchenStations,
      1
    );


    assert.equal(
      renovation.active,
      false
    );


    // ========================================================
    // 4. 装修施工
    // ========================================================

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


    assert.equal(
      construction.status,
      "building"
    );


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "renovation_construction"
    );


    /*
     * 必须真实推进游戏日期。
     * 不能只 processDay(endDay)，否则 inspect()
     * 读取到的 currentDay 仍然是旧日期。
     */

    const currentDay =
      gameState
        .getSection(
          "time"
        )
        .day;


    const constructionDays =
      construction.endDay -
      currentDay;


    assert.ok(
      constructionDays >
      0
    );


    timeSystem.advance(
      constructionDays *
      1440
    );


    const readyConstruction =
      renovationConstructionSystem
        .getStatus(
          restaurant.id
        );


    assert.equal(
      readyConstruction
        .construction
        .status,
      "ready_for_inspection"
    );


    const inspection =
      renovationConstructionSystem
        .inspect(
          restaurant.id
        );


    assert.equal(
      inspection
        .construction
        .status,
      "completed"
    );


    renovation =
      renovationSystem.getSummary(
        restaurant.id
      );


    assert.equal(
      renovation.active,
      true
    );


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "opening-setup"
    );


    // ========================================================
    // 5. 员工
    // ========================================================

    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "开店测试厨师",

      roleId:
        "chef"
    });


    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "开店测试服务员",

      roleId:
        "server"
    });


    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "开店测试收银员",

      roleId:
        "cashier"
    });


    status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.availableChefs.length,
      1
    );


    // ========================================================
    // 6. 食材
    // ========================================================

    ingredientCatalogSystem.load(
      [
        {
          id:
            "opening_e2e_rice",

          name:
            "测试大米",

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
            "opening_e2e_veg",

          name:
            "测试青菜",

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


    // ========================================================
    // 7. 供应商
    // ========================================================

    const supplier =
      supplierSystem.create({
        name:
          "开店E2E供应商",

        relationship:
          60,

        reliability:
          100
      });


    for (
      const ingredientId
      of [
        "opening_e2e_rice",
        "opening_e2e_veg"
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
            3,

          qualityMax:
            3,

          deliveryMinutes:
            30,

          capacityPerDay:
            10000,

          minimumOrder:
            1
        }
      );
    }


    // ========================================================
    // 8. 自研菜品 + 上菜单
    // ========================================================

    const research =
      dishManagementSystem
        .manualResearch({
          restaurantId:
            restaurant.id,

          name:
            "测试蒸饭",

          category:
            "rice",

          method:
            "steam",

          ingredients: [
            {
              ingredientId:
                "opening_e2e_rice",

              quantity:
                100
            },

            {
              ingredientId:
                "opening_e2e_veg",

              quantity:
                50
            }
          ]
        });


    const menuItem =
      dishManagementSystem
        .addToMenu({
          restaurantId:
            restaurant.id,

          dishId:
            research.dish.id,

          price:
            28
        });


    assert.equal(
      menuItem.active,
      true
    );


    status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.activeMenu.length,
      1
    );


    // ========================================================
    // 9. 证照
    // ========================================================

    const permits =
      openingFlowSystem
        .completePermits(
          restaurant.id
        );


    assert.equal(
      permits.status.complete,
      false
    );


    assert.ok(
      permits.status.pendingCount >
      0
    );


    /*
     * 正式证照需要审核时间。
     * 当前最长办理时间为2天。
     */
    timeSystem.advance(
      2 * 1440
    );


    status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.permits.complete,
      true
    );


    // ========================================================
    // 10. 营业时间
    // ========================================================

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


    // ========================================================
    // 11. 首批采购
    // ========================================================

    const purchase =
      openingFlowSystem
        .purchaseStarterStock(
          restaurant.id
        );


    assert.ok(
      purchase.orders.length >
      0
    );


    status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.starterStock.complete,
      false
    );


    assert.ok(
      status
        .starterStock
        .pendingCount >
      0
    );


    // 供应商30分钟到货，推进60分钟
    timeSystem.advance(
      60
    );


    status =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      status.starterStock.complete,
      true
    );


    // ========================================================
    // 12. 开业检查
    // ========================================================

    assert.equal(
      status.preparation.complete,
      8
    );


    assert.equal(
      status.preparation.total,
      8
    );


    assert.equal(
      status.canOpen,
      true
    );


    assert.equal(
      status.nextAction.id,
      "opening"
    );


    // ========================================================
    // 13. 正式开业
    // ========================================================

    const opened =
      openingSetupPageSystem
        .openRestaurant(
          restaurant.id
        );


    assert.equal(
      opened.restaurant.status,
      "open"
    );


    assert.equal(
      opened.nextPage,
      "operating-command-center"
    );


    // ========================================================
    // 14. 九步全部完成
    // ========================================================

    const completed =
      openingFlowSystem.getStatus(
        restaurant.id
      );


    assert.equal(
      completed.steps.length,
      9
    );


    assert.equal(
      completed.steps.every(
        step =>
          step.complete
      ),
      true
    );


    assert.equal(
      openingFlowSystem
        .getRecommendedPage(
          restaurant.id
        ),
      "operating-command-center"
    );


    // ========================================================
    // 15. 经营总控真正可读取
    // ========================================================

    const commandCenter =
      operatingCommandCenterPageSystem
        .getPage(
          restaurant.id
        );


    assert.equal(
      commandCenter.pageId,
      "operating-command-center"
    );


    // ========================================================
    // 16. 新手引导在正式开业后等待真实首单
    // ========================================================

    let onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );


    assert.equal(
      onboarding
        .steps
        .find(
          step =>
            step.id ===
            "opening"
        )
        .completed,
      true
    );


    assert.equal(
      onboarding
        .steps
        .find(
          step =>
            step.id ===
            "first_order"
        )
        .completed,
      false
    );


    // ========================================================
    // 17. 继续同一局营业至日结
    // ========================================================

    app.core
      .simulationSystem
      .advanceFast(
        15 * 60
      );


    const afterDay =
      restaurantSystem.get(
        restaurant.id
      );


    assert.ok(
      afterDay
        .totalServedGuests >
      0,
      "正式开业后的第一天没有产生真实顾客"
    );


    onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );


    assert.equal(
      onboarding.completed,
      true,
      "真实首单完成后新手引导没有收口"
    );


    assert.equal(
      onboarding.nextStep,
      null
    );


    const report =
      app.systems
        .operatingReportSystem
        .generate(
          restaurant.id,
          "day"
        );


    assert.ok(
      report.finance.orders >
      0,
      "开业首日没有形成真实订单报表"
    );


    assert.ok(
      report.finance.revenue >
      0,
      "开业首日没有形成真实营业收入"
    );
  }
);
