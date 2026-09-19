import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  gameState
} from "../src/core/GameState.js";

import {
  dataRegistry
} from "../src/core/DataRegistry.js";

import {
  gameFoundationSystem
} from "../src/systems/GameFoundationSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  propertySystem
} from "../src/systems/PropertySystem.js";

import {
  propertyLeaseMarketSystem
} from "../src/systems/PropertyLeaseMarketSystem.js";

import {
  renovationRealityCostSystem
} from "../src/systems/RenovationRealityCostSystem.js";

import {
  renovationPlanningSystem
} from "../src/systems/RenovationPlanningSystem.js";

import {
  renovationSystem
} from "../src/systems/RenovationSystem.js";

import {
  renovationEditorSystem
} from "../src/systems/RenovationEditorSystem.js";

import {
  renovationConstructionSystem
} from "../src/systems/RenovationConstructionSystem.js";

import {
  timeSystem
} from "../src/core/TimeSystem.js";

import {
  employeeSystem
} from "../src/systems/EmployeeSystem.js";

import {
  dishCatalogSystem
} from "../src/systems/DishCatalogSystem.js";

import {
  recipeSystem
} from "../src/systems/RecipeSystem.js";

import {
  menuSystem
} from "../src/systems/MenuSystem.js";

import {
  openingFlowSystem
} from "../src/systems/OpeningFlowSystem.js";

import {
  cityPropertyPageSystem
} from "../src/ui/pages/city/CityPropertyPageSystem.js";

import {
  openingSetupPageSystem
} from "../src/ui/pages/opening/OpeningSetupPageSystem.js";


const STARTUP_CAPITAL =
  120000;


function projectedStarterCost(
  restaurantId,
  property
) {
  const quote =
    propertyLeaseMarketSystem
      .getQuote({
        propertyId:
          property.id,
        restaurantId,
        months: 12
      });

  const renovation =
    renovationRealityCostSystem
      .calculateForProperty(
        property.id
      );

  const templates =
    renovationPlanningSystem
      .getTemplates()
      .filter(
        template =>
          template.minLevel <= 1 &&
          template.minArea <=
            (
              property.usableArea ??
              property.area
            )
      )
      .map(
        template => ({
          template,
          furnitureCost:
            renovationPlanningSystem
              .getTemplateFurnitureCost(
                template
              )
        })
      )
      .sort(
        (a, b) =>
          a.furnitureCost -
          b.furnitureCost
      );

  const cheapestTemplate =
    templates[0] ??
    null;

  return {
    property,
    quote,
    renovation,
    cheapestTemplate,
    projected:
      cheapestTemplate
        ? quote.upfront +
          renovation
            .baseConstructionCost +
          cheapestTemplate
            .furnitureCost
        : Number.POSITIVE_INFINITY
  };
}


test(
  "真实首局12万元能够用默认数据完成最低成本开业",
  () => {
    gameState.reset();
    dataRegistry.clear();

    gameFoundationSystem
      .initialize({
        seedProperties: true,
        overwriteReferenceData:
          true
      });

    const restaurant =
      restaurantSystem.create({
        name:
          "真实首局资金验收店"
      });

    financeSystem.createAccount(
      restaurant.id,
      STARTUP_CAPITAL
    );

    const candidates =
      propertySystem
        .list({
          availableOnly: true
        })
        .filter(
          property =>
            property
              .foodServiceAllowed !==
            false
        )
        .map(
          property =>
            projectedStarterCost(
              restaurant.id,
              property
            )
        )
        .filter(
          item =>
            item.cheapestTemplate
        )
        .sort(
          (a, b) =>
            a.projected -
            b.projected
        );

    assert.ok(
      candidates.length >
      0,
      "默认城市没有任何可用于首局的餐饮房源"
    );

    const selected =
      candidates[0];

    assert.ok(
      selected.projected <=
        STARTUP_CAPITAL,
      "12万元连最低成本默认开店方案都无法覆盖"
    );

    const leaseResult =
      cityPropertyPageSystem
        .signLease({
          restaurantId:
            restaurant.id,
          propertyId:
            selected.property.id,
          months: 12
        });

    assert.equal(
      leaseResult.nextPage,
      "renovation"
    );

    renovationSystem.initialize(
      restaurant.id
    );

    renovationEditorSystem.open(
      restaurant.id
    );

    const recommendations =
      renovationPlanningSystem
        .getTemplateRecommendations(
          restaurant.id
        );

    assert.ok(
      recommendations
        .recommendedTemplateId,
      "签约后12万元余额无法执行任何Lv1正式装修模板"
    );

    renovationEditorSystem
      .applyTemplate(
        restaurant.id,
        recommendations
          .recommendedTemplateId
      );

    const started =
      renovationConstructionSystem
        .startFromEditor(
          restaurant.id
        );

    assert.ok(
      started.construction
        .projectCost >
      0,
      "真实首局装修没有计入正式施工成本"
    );

    assert.ok(
      started.construction
        .baseConstructionCost >
      0,
      "真实首局基础装修成本被错误绕过"
    );

    const balanceAfterConstruction =
      financeSystem.getBalance(
        restaurant.id
      );

    assert.ok(
      balanceAfterConstruction >
        0,
      "签约和装修后资金直接归零，首局无法继续"
    );

    const constructionDays =
      started.construction
        .endDay -
      gameState
        .getSection(
          "time"
        )
        .day;

    timeSystem.advance(
      constructionDays *
      1440
    );

    renovationConstructionSystem
      .inspect(
        restaurant.id
      );

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name:
        "首局验收厨师",
      roleId:
        "chef"
    });

    const dish =
      dishCatalogSystem
        .getAll()
        .filter(
          item =>
            (
              item.unlockLevel ??
              1
            ) <=
            1
        )
        .find(
          item =>
            recipeSystem.get(
              item.defaultRecipeId
            )
        );

    assert.ok(
      dish,
      "默认菜品库没有可供Lv1首局直接经营的正式菜品"
    );

    menuSystem.addItem({
      restaurantId:
        restaurant.id,
      dishId:
        dish.id,
      recipeId:
        dish.defaultRecipeId,
      price:
        dish.basePrice
    });

    openingFlowSystem
      .completePermits(
        restaurant.id
      );

    timeSystem.advance(
      2 *
      1440
    );

    openingFlowSystem
      .configureSchedule(
        restaurant.id,
        {
          openHour: 9,
          closeHour: 22
        }
      );

    const purchase =
      openingFlowSystem
        .purchaseStarterStock(
          restaurant.id
        );

    assert.ok(
      purchase.orders.length >
      0,
      "默认正式菜品无法生成首批采购订单"
    );

    const latestArrival =
      Math.max(
        ...purchase.orders.map(
          order =>
            order.expectedAt
        )
      );

    const now =
      gameState
        .getSection(
          "time"
        )
        .totalMinutes;

    timeSystem.advance(
      Math.max(
        1,
        latestArrival -
        now +
        1
      )
    );

    const ready =
      openingFlowSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      ready.canOpen,
      true,
      "12万元真实首局完成最低方案后仍无法开业"
    );

    const opened =
      openingSetupPageSystem
        .openRestaurant(
          restaurant.id
        );

    assert.equal(
      opened.restaurant.status,
      "open"
    );

    assert.ok(
      financeSystem.getBalance(
        restaurant.id
      ) >
        0,
      "正式开业时没有任何剩余周转资金"
    );

    app.core
      .simulationSystem
      .advanceFast(
        12 *
        60
      );

    assert.ok(
      restaurantSystem
        .get(
          restaurant.id
        )
        .totalServedGuests >
      0,
      "真实首局正式开业后没有产生顾客"
    );
  }
);
