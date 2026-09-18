import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

const {
  ingredientCatalogSystem,
  dishCatalogSystem,
  recipeSystem,
  restaurantSystem,
  restaurantDishSystem,
  dishLifecycleSystem,
  menuSystem
} = app.systems;

test(
  "同一道基础菜在不同门店拥有独立成长状态",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id:
            "progress_rice",

          name:
            "成长测试米",

          category:
            "grain",

          unit:
            "portion",

          storageType:
            "dry",

          basePurchasePrice:
            2,

          shelfLifeDays:
            30,

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

    const dishId =
      "restaurant_progress_rice";

    const dish = {
      schemaVersion:
        DISH_SCHEMA_VERSION,

      id:
        dishId,

      name:
        "门店成长测试饭",

      category:
        "rice",

      basePrice:
        28,

      unlockLevel:
        1,

      baseDifficulty:
        30,

      defaultRecipeId:
        getDefaultRecipeId(
          dishId
        ),

      tags: [
        "test"
      ]
    };

    dishCatalogSystem.load(
      [
        dish
      ],
      {
        overwrite:
          true
      }
    );

    recipeSystem.load(
      [
        {
          id:
            dish.defaultRecipeId,

          dishId,

          ingredients: [
            {
              ingredientId:
                "progress_rice",

              quantity:
                1
            }
          ],

          difficulty:
            30,

          cookingMinutes:
            10,

          method:
            "boil"
        }
      ],
      {
        overwrite:
          true
      }
    );

    const storeA =
      restaurantSystem.create({
        name:
          "成长A店"
      });

    const storeB =
      restaurantSystem.create({
        name:
          "成长B店"
      });

    const menuA =
      menuSystem.addItem({
        restaurantId:
          storeA.id,

        dishId
      });

    const menuB =
      menuSystem.addItem({
        restaurantId:
          storeB.id,

        dishId
      });

    restaurantDishSystem.update(
      storeA.id,
      dishId,
      {
        qualityScore:
          72
      }
    );

    menuSystem.recordSale(
      menuA.id,
      200,
      5600
    );

    menuSystem.recordSale(
      menuB.id,
      10,
      280
    );

    dishLifecycleSystem
      .recordService({
        restaurantId:
          storeA.id,

        dishId,

        quantity:
          200,

        revenue:
          5600,

        ingredientCost:
          1200,

        outputQualityScore:
          82
      });

    dishLifecycleSystem
      .recordService({
        restaurantId:
          storeB.id,

        dishId,

        quantity:
          10,

        revenue:
          280,

        ingredientCost:
          60,

        outputQualityScore:
          66
      });

    const progressA =
      restaurantDishSystem.get(
        storeA.id,
        dishId
      );

    const progressB =
      restaurantDishSystem.get(
        storeB.id,
        dishId
      );

    assert.ok(
      progressA
    );

    assert.ok(
      progressB
    );

    assert.notEqual(
      progressA.id,
      progressB.id
    );

    assert.equal(
      progressA.dishId,
      progressB.dishId
    );

    assert.equal(
      progressA.masteryLevel,
      4
    );

    assert.equal(
      progressB.masteryLevel,
      1
    );

    assert.equal(
      progressA.lifetimeSold,
      200
    );

    assert.equal(
      progressB.lifetimeSold,
      10
    );

    assert.equal(
      progressA.marketPerformance
        .sold,
      200
    );

    assert.equal(
      progressB.marketPerformance
        .sold,
      10
    );

    assert.equal(
      progressA.dishRankName,
      "招牌"
    );

    assert.equal(
      progressB.dishRankName,
      "家常"
    );

    const catalogDish =
      dishCatalogSystem.get(
        dishId
      );

    assert.equal(
      Object.prototype
        .hasOwnProperty.call(
          catalogDish,
          "masteryLevel"
        ),
      false
    );

    assert.equal(
      Object.prototype
        .hasOwnProperty.call(
          catalogDish,
          "dishRankName"
        ),
      false
    );
  }
);
