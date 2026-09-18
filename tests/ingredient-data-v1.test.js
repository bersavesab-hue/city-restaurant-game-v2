import test from "node:test";
import assert from "node:assert/strict";

import {
  INGREDIENTS_V1,
  INGREDIENT_DATASET_META
} from "../src/data/ingredients.v1.js";

import {
  INGREDIENT_CATEGORY,
  INGREDIENT_QUALITY_LABELS,
  DEFAULT_INGREDIENT_BATCH_QUALITY
} from "../src/data/ingredientRules.js";

import {
  validateIngredient,
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  ingredientBootstrapSystem
} from "../src/systems/IngredientBootstrapSystem.js";

import {
  supplierSystem
} from "../src/systems/SupplierSystem.js";

import {
  supplierTradingSystem
} from "../src/systems/SupplierTradingSystem.js";

import {
  gameState
} from "../src/core/GameState.js";


test(
  "正式食材包包含220种且ID唯一",
  () => {
    assert.equal(
      INGREDIENT_DATASET_META.total,
      220
    );


    assert.equal(
      INGREDIENTS_V1.length,
      220
    );


    const ids =
      INGREDIENTS_V1.map(
        item =>
          item.id
      );


    assert.equal(
      new Set(ids).size,
      220
    );


    for (
      const ingredient
      of INGREDIENTS_V1
    ) {
      assert.equal(
        validateIngredient(
          ingredient
        ),
        true,
        ingredient.id
      );
    }
  }
);


test(
  "正式食材包覆盖全部14个基础类别",
  () => {
    const present =
      new Set(
        INGREDIENTS_V1.map(
          item =>
            item.category
        )
      );


    const expected =
      new Set(
        Object.values(
          INGREDIENT_CATEGORY
        )
      );


    assert.deepEqual(
      [
        ...present
      ].sort(),
      [
        ...expected
      ].sort()
    );
  }
);


test(
  "食材本体不固定高低等级，采购批次使用1至5品质",
  () => {
    assert.deepEqual(
      Object.keys(
        INGREDIENT_QUALITY_LABELS
      ),
      [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    );


    assert.equal(
      INGREDIENT_DATASET_META
        .schemaVersion,
      2
    );


    assert.equal(
      DEFAULT_INGREDIENT_BATCH_QUALITY,
      3
    );


    assert.equal(
      INGREDIENTS_V1.every(
        item =>
          !Object.prototype
            .hasOwnProperty.call(
              item,
              "baseQuality"
            )
      ),
      true
    );


    assert.equal(
      INGREDIENTS_V1.every(
        item =>
          Array.isArray(
            item.allergenTags
          ) &&
          typeof item
            .procurementGroup ===
            "string"
      ),
      true
    );


    assert.throws(
      () =>
        validateIngredient({
          ...INGREDIENTS_V1[0],
          baseQuality: 3
        }),
      /quality belongs to inventory batches/
    );
  }
);


test(
  "正式Bootstrap加载完整220种食材",
  () => {
    ingredientBootstrapSystem
      .ensureLoaded({
        overwrite:
          true
      });


    assert.equal(
      ingredientCatalogSystem
        .count(),
      220
    );


    assert.equal(
      ingredientCatalogSystem
        .get(
          "pork"
        )
        .name,
      "猪肉"
    );


    assert.equal(
      ingredientCatalogSystem
        .get(
          "abalone"
        )
        .name,
      "鲍鱼"
    );
  }
);


test(
  "克和毫升单位允许现实小数单价而不是强制1元起",
  () => {
    gameState.reset();


    ingredientCatalogSystem.load(
      [
        {
          id:
            "precision_price_test",

          name:
            "精度测试食材",

          category:
            "meat",

          unit:
            "g",

          storageType:
            "chilled",

          basePurchasePrice:
            0.02,

          shelfLifeDays:
            4,

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
          "价格精度供应商",

        relationship:
          0,

        reliability:
          100
      });


    supplierSystem.addOffer(
      supplier.id,
      "precision_price_test",
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
          60,

        capacityPerDay:
          10000,

        minimumOrder:
          1
      }
    );


    const quote =
      supplierSystem.getQuote(
        supplier.id,
        "precision_price_test",
        1000
      );


    assert.equal(
      quote.unitPrice,
      0.02
    );


    assert.equal(
      quote.totalPrice,
      20
    );


    const dailyQuote =
      supplierTradingSystem
        .getDailyQuote(
          supplier.id,
          "precision_price_test",
          1000
        );


    assert.equal(
      dailyQuote.unitPrice,
      0.02
    );


    assert.equal(
      dailyQuote.totalPrice,
      20
    );
  }
);
