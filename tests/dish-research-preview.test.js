import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateResolvedPreview
} from "../src/systems/DishResearchPreviewSystem.js";


test(
  "研发预估给出稳定的成本难度时间和研发评分区间",
  () => {
    const result =
      calculateResolvedPreview({
        method:
          "stir_fry",

        ingredients: [
          {
            quantity:
              150,

            ingredient: {

              basePurchasePrice:
                2,

              category:
                "meat"
            }
          },

          {
            quantity:
              100,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "vegetable"
            }
          }
        ]
      });


    assert.equal(
      result.ingredientCount,
      2
    );


    assert.equal(
      result.categoryCount,
      2
    );


    assert.ok(
      result.researchScoreRange.max >
      result.researchScoreRange.min
    );


    assert.ok(
      result.researchCost >=
      500
    );


    assert.equal(
      result.cookingMinutes,
      16
    );


    assert.ok(
      result.suggestedPriceRange.max >=
      result.suggestedPriceRange.min
    );
  }
);


test(
  "增加配料种类会影响难度与出餐时间",
  () => {
    const two =
      calculateResolvedPreview({
        method:
          "boil",

        ingredients: [
          {
            quantity:
              100,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "grain"
            }
          },

          {
            quantity:
              100,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "meat"
            }
          }
        ]
      });


    const four =
      calculateResolvedPreview({
        method:
          "boil",

        ingredients: [
          {
            quantity:
              100,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "grain"
            }
          },

          {
            quantity:
              100,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "meat"
            }
          },

          {
            quantity:
              50,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "vegetable"
            }
          },

          {
            quantity:
              20,

            ingredient: {

              basePurchasePrice:
                1,

              category:
                "seasoning"
            }
          }
        ]
      });


    assert.ok(
      four.difficulty >
      two.difficulty
    );


    assert.ok(
      four.cookingMinutes >
      two.cookingMinutes
    );
  }
);
