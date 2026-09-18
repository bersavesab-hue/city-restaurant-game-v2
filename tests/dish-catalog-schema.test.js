import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

import {
  DISH_SCHEMA_VERSION,
  DISH_CATEGORY_LIST,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  validateDish
} from "../src/systems/DishCatalogSystem.js";

const {
  ingredientCatalogSystem,
  dishCatalogSystem,
  recipeSystem,
  restaurantSystem,
  storeProgressSystem,
  menuSystem
} = app.systems;

function makeDish(
  overrides = {}
) {
  const id =
    overrides.id ??
    "schema_test_dish";

  return {
    schemaVersion:
      DISH_SCHEMA_VERSION,

    id,

    name:
      "Schema测试菜",

    category:
      "rice",

    basePrice:
      28,

    unlockLevel:
      2,

    baseDifficulty:
      35,

    defaultRecipeId:
      getDefaultRecipeId(
        id
      ),

    tags: [
      "test"
    ],

    ...overrides
  };
}

test(
  "正式基础菜Schema固定核心字段和ID规则",
  () => {
    assert.equal(
      DISH_CATEGORY_LIST.length,
      16
    );

    assert.equal(
      validateDish(
        makeDish()
      ),
      true
    );

    assert.throws(
      () =>
        validateDish(
          makeDish({
            id:
              "Invalid Dish"
          })
        ),
      /snake_case/
    );

    assert.throws(
      () =>
        validateDish(
          makeDish({
            unlockLevel:
              11
          })
        ),
      /unlockLevel/
    );

    assert.throws(
      () =>
        validateDish(
          makeDish({
            baseDifficulty:
              101
          })
        ),
      /baseDifficulty/
    );

    assert.throws(
      () =>
        validateDish(
          makeDish({
            defaultRecipeId:
              "wrong_recipe"
          })
        ),
      /defaultRecipeId/
    );
  }
);

test(
  "正式基础菜主数据禁止混入运行时成长字段",
  () => {
    for (
      const field
      of [
        "qualityScore",
        "qualityGrade",
        "qualityLevel",
        "rarity",
        "prestigeTitle",
        "masteryLevel",
        "dishRankId",
        "lifetimeSold"
      ]
    ) {
      assert.throws(
        () =>
          validateDish(
            makeDish({
              [field]:
                1
            })
          ),
        /runtime field/
      );
    }
  }
);

test(
  "基础菜解锁等级和默认配方会实际约束菜单上架",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id:
            "dish_schema_rice",

          name:
            "Schema米",

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

    const dish =
      makeDish({
        id:
          "locked_schema_dish",

        name:
          "二级解锁测试饭"
      });

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

          dishId:
            dish.id,

          ingredients: [
            {
              ingredientId:
                "dish_schema_rice",

              quantity:
                1
            }
          ],

          difficulty:
            dish.baseDifficulty,

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

    const restaurant =
      restaurantSystem.create({
        name:
          "菜品解锁测试店"
      });

    assert.equal(
      restaurant.level,
      1
    );

    assert.throws(
      () =>
        menuSystem.addItem({
          restaurantId:
            restaurant.id,

          dishId:
            dish.id
        }),
      /requires store level 2/
    );

    storeProgressSystem
      .addExperience(
        restaurant.id,
        500
      );

    const menuItem =
      menuSystem.addItem({
        restaurantId:
          restaurant.id,

        dishId:
          dish.id
      });

    assert.equal(
      menuItem.recipeId,
      dish.defaultRecipeId
    );

    assert.equal(
      menuItem.price,
      dish.basePrice
    );
  }
);
