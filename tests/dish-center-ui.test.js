import test from "node:test";
import assert from "node:assert/strict";

import {
  DishResearchLab
} from "../src/ui/pages/dishes/DishResearchLab.js";


test(
  "菜品研发工作台暴露稳定交互入口",
  () => {
    const lab =
      new DishResearchLab({
        restaurantId:
          "test_restaurant",

        pageSystem: {
          previewResearch() {
            return null;
          }
        }
      });


    lab.syncPage({
      research: {
        categories: [
          {
            id:
              "stir_fry",

            label:
              "炒菜"
          }
        ],

        methods: [
          {
            id:
              "stir_fry",

            name:
              "炒",

            icon:
              "炒",

            description:
              "基础炒制"
          }
        ],

        customCount:
          0,

        limit:
          10
      },

      ingredients: [
        {
          id:
            "ingredient_test",

          name:
            "测试食材",

          purchasePrice:
            10,

          unit:
            "份",

          quantityRule: {
            min:
              1,

            max:
              5,

            step:
              1,

            defaultValue:
              1
          }
        }
      ]
    });


    const html =
      lab.render();


    assert.match(
      html,
      /data-research-category=/
    );

    assert.match(
      html,
      /data-research-method=/
    );

    assert.match(
      html,
      /data-research-ingredient-toggle=/
    );

    assert.match(
      html,
      /data-research-action="random"/
    );

    assert.match(
      html,
      /data-research-action="custom"/
    );
  }
);
