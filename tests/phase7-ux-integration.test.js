import test from "node:test";
import assert from "node:assert/strict";

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
  onboardingSystem
} from "../src/systems/OnboardingSystem.js";

import {
  operatingAdvisorSystem
} from "../src/systems/OperatingAdvisorSystem.js";

import {
  employeeSystem
} from "../src/systems/EmployeeSystem.js";

import {
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  inventorySystem
} from "../src/systems/InventorySystem.js";


import {
  RenovationEditorBaseView
} from "../src/ui/renovation/RenovationEditorBaseView.js";

import {
  getSlotAssetCandidates
} from "../src/ui/assets/VisualAssetBinder.js";

import {
  VISUAL_ASSET_SPECS,
  getVisualAssetSpec
} from "../src/ui/assets/VisualAssetSpecs.js";


function setupRestaurant() {
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
        "第七步体验测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    300000
  );

  const property =
    propertySystem
      .list({
        availableOnly: true
      })[0];

  assert.ok(property);

  return {
    restaurant,
    property
  };
}


test(
  "新手引导按真实经营状态自动推进而不是手工勾选",
  () => {
    const {
      restaurant,
      property
    } =
      setupRestaurant();

    let onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );

    assert.equal(
      onboarding.nextStep.id,
      "location"
    );

    assert.equal(
      onboarding.progress,
      0
    );

    propertyLeaseMarketSystem
      .signLease({
        restaurantId:
          restaurant.id,
        propertyId:
          property.id,
        months: 12
      });

    onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );

    assert.equal(
      onboarding
        .steps
        .find(
          item =>
            item.id ===
            "location"
        )
        .completed,
      true
    );

    assert.equal(
      onboarding.nextStep.id,
      "renovation"
    );

    assert.ok(
      onboarding.progress >
      0
    );
  }
);


test(
  "经营建议会把当前最高优先级问题直接指向可处理页面",
  () => {
    const {
      restaurant,
      property
    } =
      setupRestaurant();

    let advice =
      operatingAdvisorSystem
        .getAdvice(
          restaurant.id
        );

    assert.equal(
      advice[0].action,
      "city"
    );

    propertyLeaseMarketSystem
      .signLease({
        restaurantId:
          restaurant.id,
        propertyId:
          property.id,
        months: 12
      });

    advice =
      operatingAdvisorSystem
        .getAdvice(
          restaurant.id
        );

    assert.equal(
      advice[0].action,
      "renovation"
    );

    assert.match(
      advice[0].title,
      /下一步/
    );
  }
);


test(
  "装修家具使用程序化视觉家族和规格层级而不是纯文字方块",
  () => {
    const view =
      new RenovationEditorBaseView({
        root: {
          addEventListener() {},
          removeEventListener() {},
          contains() {
            return true;
          }
        },
        restaurantId:
          "restaurant_phase7",
        pageSystem: {}
      });

    view.page = {
      workspace: {
        selectedPlacementId:
          "placement_1",
        activeFloorId:
          "floor_1",
        viewBounds: {
          x: 0,
          y: 0,
          width: 10,
          height: 8
        }
      }
    };

    const html =
      view.renderPlacement({
        id:
          "placement_1",
        name:
          "四人餐桌",
        type:
          "table",
        familyId:
          "table_4",
        specTier:
          "premium",
        floorId:
          "floor_1",
        x: 1,
        y: 1,
        width: 2,
        height: 2
      });

    assert.match(
      html,
      /data-furniture-family="table_4"/
    );

    assert.match(
      html,
      /data-furniture-tier="premium"/
    );

    assert.match(
      html,
      /renovation-furniture-visual/
    );
  }
);


test(
  "正式美术资源分辨率合同固定且装修施工有安全回退",
  () => {
    assert.deepEqual(
      VISUAL_ASSET_SPECS
        .restaurantHero,
      {
        width: 1536,
        height: 768,
        aspectRatio: "2:1",
        format: "webp"
      }
    );

    assert.equal(
      getVisualAssetSpec(
        "dish-dish_001"
      ).width,
      1024
    );

    assert.equal(
      getVisualAssetSpec(
        "employee-avatar-chef_01"
      ).width,
      512
    );

    assert.equal(
      getVisualAssetSpec(
        "renovation-construction-site"
      ).height,
      864
    );

    const constructionCandidates =
      getSlotAssetCandidates(
        "renovation-construction-site"
      );

    assert.equal(
      constructionCandidates
        .includes(
          "assets/images/scenes/restaurants/restaurant-live.webp"
        ),
      true
    );

    const furnitureCandidates =
      getSlotAssetCandidates(
        "renovation-furniture-table_4"
      );

    assert.equal(
      furnitureCandidates
        .includes(
          "assets/images/ui/renovation/furniture/table_4.webp"
        ),
      true
    );
  }
);


test(
  "新手员工与库存步骤严格服从正式开业条件",
  () => {
    const {
      restaurant
    } =
      setupRestaurant();

    employeeSystem.hire({
      restaurantId:
        restaurant.id,
      name:
        "只有服务员",
      roleId:
        "server"
    });

    let onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );

    const staffStep =
      onboarding.steps.find(
        item =>
          item.id ===
          "staff"
      );

    assert.equal(
      staffStep.completed,
      false,
      "只有服务员时不能误判员工开业条件已完成"
    );

    const ingredient =
      ingredientCatalogSystem
        .getAll()[0];

    assert.ok(
      ingredient
    );

    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,
      ingredientId:
        ingredient.id,
      quantity:
        10,
      quality:
        3
    });

    onboarding =
      onboardingSystem
        .getState(
          restaurant.id
        );

    const inventoryStep =
      onboarding.steps.find(
        item =>
          item.id ===
          "inventory"
      );

    assert.equal(
      inventoryStep.completed,
      false,
      "无菜单或非首批需求库存不能误判首批采购已完成"
    );
  }
);
