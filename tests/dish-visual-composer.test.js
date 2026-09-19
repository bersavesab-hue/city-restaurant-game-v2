import test from "node:test";
import assert from "node:assert/strict";

import {
  DISH_VISUAL_CANVAS_SIZE,
  createDishVisualPlan
} from "../src/ui/assets/DishVisualComposer.js";


const dish = {
  id:
    "custom_dish_000138",

  recipeId:
    "custom_recipe_000138",

  category:
    "stir_fry",

  custom:
    true
};


const recipe = {
  id:
    "custom_recipe_000138",

  dishId:
    "custom_dish_000138",

  method:
    "stir_fry",

  ingredients: [
    {
      ingredientId:
        "beef",

      quantity:
        220
    },

    {
      ingredientId:
        "green_pepper",

      quantity:
        100
    },

    {
      ingredientId:
        "onion",

      quantity:
        70
    },

    {
      ingredientId:
        "soy_sauce",

      quantity:
        20
    }
  ]
};


const ingredientRecords = [
  {
    id:
      "beef",

    name:
      "牛肉",

    category:
      "meat"
  },

  {
    id:
      "green_pepper",

    name:
      "青椒",

    category:
      "vegetable"
  },

  {
    id:
      "onion",

    name:
      "洋葱",

    category:
      "vegetable"
  },

  {
    id:
      "soy_sauce",

    name:
      "酱油",

    category:
      "seasoning"
  }
];


test(
  "自研菜视觉固定为1024画布并使用菜谱ID作为seed",
  () => {
    const plan =
      createDishVisualPlan({
        dish,
        recipe,
        ingredientRecords
      });

    assert.equal(
      plan.canvas.width,
      DISH_VISUAL_CANVAS_SIZE
    );

    assert.equal(
      plan.canvas.height,
      1024
    );

    assert.equal(
      plan.seedKey,
      "custom_recipe_000138"
    );
  }
);


test(
  "同一菜谱重复生成得到完全一致的视觉计划",
  () => {
    const first =
      createDishVisualPlan({
        dish,
        recipe,
        ingredientRecords
      });

    const second =
      createDishVisualPlan({
        dish,
        recipe,
        ingredientRecords
      });

    assert.deepEqual(
      second,
      first
    );
  }
);


test(
  "调味料不作为独立食材块显示但仍参与酱汁逻辑",
  () => {
    const plan =
      createDishVisualPlan({
        dish,
        recipe,
        ingredientRecords
      });

    assert.equal(
      plan.ingredients.some(
        item =>
          item.ingredientId ===
          "soy_sauce"
      ),
      false
    );

    assert.equal(
      plan.ingredientIds.includes(
        "soy_sauce"
      ),
      true
    );
  }
);


test(
  "不同菜谱ID会得到不同稳定seed",
  () => {
    const first =
      createDishVisualPlan({
        dish,
        recipe,
        ingredientRecords
      });

    const second =
      createDishVisualPlan({
        dish: {
          ...dish,

          id:
            "custom_dish_000139",

          recipeId:
            "custom_recipe_000139"
        },

        recipe: {
          ...recipe,

          id:
            "custom_recipe_000139",

          dishId:
            "custom_dish_000139"
        },

        ingredientRecords
      });

    assert.notEqual(
      first.seed,
      second.seed
    );

    assert.notEqual(
      first.cacheKey,
      second.cacheKey
    );
  }
);
