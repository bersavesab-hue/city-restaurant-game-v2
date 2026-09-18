import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  RENOVATION_TEMPLATE_DATASET_META,
  RENOVATION_TEMPLATES_V1
} from "../src/data/renovationTemplates.v1.js";

import {
  validateRenovationTemplate
} from "../src/data/renovationTemplateRules.js";

import {
  renovationSystem
} from "../src/systems/RenovationSystem.js";

import {
  renovationPlanningSystem
} from "../src/systems/RenovationPlanningSystem.js";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationEditorSystem
} = app.systems;


function createRestaurant({
  name,
  area,
  balance,
  level = 1,
  positioningId = null
}) {
  const districtId =
    `template_area_${name}`;

  districtSystem.load(
    [
      {
        id: districtId,
        name:
          `${name}测试商圈`,
        trafficIndex: 60,
        rentMultiplier: 1,
        spendingPower: 60,
        competition: 20,
        customerMix: {
          resident: 100
        }
      }
    ],
    {
      overwrite: true
    }
  );

  const property =
    propertySystem.create({
      districtId,
      name:
        `${name}测试铺`,
      area,
      usableArea: area,
      seats: 12,
      baseMonthlyRent: 5000
    });

  const restaurant =
    restaurantSystem.create({
      name,
      locationId:
        property.id
    });

  entitySystem.update(
    "restaurant",
    restaurant.id,
    {
      level,
      positioningId
    }
  );

  financeSystem.createAccount(
    restaurant.id,
    balance
  );

  return {
    property,
    restaurant:
      restaurantSystem.get(
        restaurant.id
      )
  };
}


test(
  "正式装修模板包固定24套并保留旧3个ID",
  () => {
    assert.equal(
      RENOVATION_TEMPLATE_DATASET_META
        .total,
      24
    );

    assert.equal(
      RENOVATION_TEMPLATES_V1.length,
      24
    );

    assert.equal(
      new Set(
        RENOVATION_TEMPLATES_V1
          .map(
            item => item.id
          )
      ).size,
      24
    );

    assert.equal(
      new Set(
        RENOVATION_TEMPLATES_V1
          .map(
            item => item.name
          )
      ).size,
      24
    );

    for (
      const legacyId
      of [
        "balanced",
        "quick_service",
        "family_dining"
      ]
    ) {
      assert.ok(
        RENOVATION_TEMPLATES_V1
          .some(
            item =>
              item.id ===
              legacyId
          ),
        legacyId
      );
    }

    for (
      const template
      of RENOVATION_TEMPLATES_V1
    ) {
      assert.equal(
        validateRenovationTemplate(
          template
        ),
        true,
        template.id
      );
    }
  }
);


test(
  "24套模板引用的家具全部存在且最低门店等级足以解锁",
  () => {
    for (
      const template
      of RENOVATION_TEMPLATES_V1
    ) {
      for (
        const furnitureId
        of template.items
      ) {
        const definition =
          renovationSystem
            .getFurnitureDefinition(
              furnitureId
            );

        assert.ok(
          definition,
          `${template.id} -> ${furnitureId}`
        );

        assert.ok(
          definition.unlockLevel <=
            template.minLevel,
          `${template.id} minLevel ${template.minLevel} cannot unlock ${furnitureId} at Lv${definition.unlockLevel}`
        );
      }
    }
  }
);


test(
  "模板推荐只返回当前门店真正可执行的方案",
  () => {
    gameState.reset();

    const {
      restaurant
    } =
      createRestaurant({
        name:
          "模板推荐测试店",
        area: 50,
        balance: 500000,
        level: 1,
        positioningId:
          "quick_service"
      });

    renovationSystem
      .requireLayout(
        restaurant.id
      );

    const result =
      renovationPlanningSystem
        .getTemplateRecommendations(
          restaurant.id
        );

    assert.ok(
      result.items.length >
      0
    );

    assert.ok(
      result.recommendedTemplateId
    );

    assert.equal(
      result.items.every(
        item =>
          item.executable
      ),
      true
    );

    assert.equal(
      result.items.every(
        item =>
          item.minLevel <= 1 &&
          item.minArea <= 50 &&
          item.estimatedTotalCost <=
            item.availableBalance
      ),
      true
    );

    assert.equal(
      result.items.some(
        item =>
          item.id ===
          result.recommendedTemplateId
      ),
      true
    );
  }
);


test(
  "资金不足的模板不会进入可执行推荐",
  () => {
    gameState.reset();

    const {
      restaurant
    } =
      createRestaurant({
        name:
          "低预算模板测试店",
        area: 90,
        balance: 100,
        level: 4,
        positioningId:
          "specialty_dining"
      });

    renovationSystem
      .requireLayout(
        restaurant.id
      );

    const available =
      renovationPlanningSystem
        .getTemplateRecommendations(
          restaurant.id
        );

    assert.equal(
      available.items.length,
      0
    );

    assert.equal(
      available
        .recommendedTemplateId,
      null
    );

    const all =
      renovationPlanningSystem
        .getTemplateRecommendations(
          restaurant.id,
          {
            includeUnavailable:
              true
          }
        );

    assert.ok(
      all.items.some(
        item =>
          item.reasons.includes(
            "budget"
          )
      )
    );
  }
);


test(
  "Lv4特色餐厅能收到对应定位模板并保持旧balanced预览兼容",
  () => {
    gameState.reset();

    const {
      restaurant
    } =
      createRestaurant({
        name:
          "特色模板测试店",
        area: 120,
        balance: 1000000,
        level: 4,
        positioningId:
          "specialty_dining"
      });

    renovationEditorSystem.open(
      restaurant.id
    );

    const page =
      renovationEditorSystem
        .getPageState(
          restaurant.id
        );

    assert.ok(
      page.templates.some(
        item =>
          item.id ===
          "specialty_dining"
      )
    );

    assert.ok(
      page.recommendedTemplateId
    );

    const preview =
      renovationEditorSystem
        .previewTemplate(
          restaurant.id,
          "balanced"
        );

    assert.ok(
      preview.placements.length >
      0
    );

    assert.equal(
      preview.template.id,
      "balanced"
    );
  }
);
