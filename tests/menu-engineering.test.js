import test from "node:test";
import assert from "node:assert/strict";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  menuEngineeringSystem
} from "../src/systems/MenuEngineeringSystem.js";

import {
  menuEngineeringPageSystem
} from "../src/ui/pages/menu-engineering/MenuEngineeringPageSystem.js";

import {
  MenuEngineeringView
} from "../src/ui/pages/menu-engineering/MenuEngineeringView.js";

test(
  "菜单工程按照销量和单份贡献划分明星菜现金牛问题菜和瘦狗菜",
  () => {
    const restaurant =
      restaurantSystem.create({
        name:
          "菜单工程测试店"
      });

    const samples = [
      {
        id: "star",
        quantity: 40,
        revenue: 40000,
        ingredientCost: 8000
      },
      {
        id: "cash",
        quantity: 40,
        revenue: 40000,
        ingredientCost: 36000
      },
      {
        id: "puzzle",
        quantity: 5,
        revenue: 5000,
        ingredientCost: 500
      },
      {
        id: "dog",
        quantity: 5,
        revenue: 5000,
        ingredientCost: 4750
      }
    ];

    for (
      const sample
      of samples
    ) {
      const menu =
        entitySystem.create(
          "menu_item",
          {
            restaurantId:
              restaurant.id,

            dishId:
              `dish_${sample.id}`,

            recipeId:
              `recipe_${sample.id}`,

            name:
              `测试${sample.id}`,

            price:
              Math.round(
                sample.revenue /
                sample.quantity
              ),

            active: true,

            soldCount: 0,
            totalRevenue: 0
          }
        );

      entitySystem.create(
        "customer_order",
        {
          restaurantId:
            restaurant.id,

          customerId:
            null,

          status:
            "completed",

          channelId:
            "dine_in",

          paidAmount:
            sample.revenue,

          totalRevenue:
            sample.revenue,

          channelNetRevenue:
            sample.revenue,

          channelFees: 0,

          ingredientCost:
            sample.ingredientCost,

          grossProfit:
            sample.revenue -
            sample.ingredientCost,

          items: [
            {
              menuItemId:
                menu.id,

              dishId:
                `dish_${sample.id}`,

              quantity:
                sample.quantity,

              unitPrice:
                Math.round(
                  sample.revenue /
                  sample.quantity
                ),

              revenue:
                sample.revenue,

              qualityScore:
                80
            }
          ]
        }
      );
    }

    const result =
      menuEngineeringSystem
        .analyze(
          restaurant.id
        );

    const byDish =
      Object.fromEntries(
        result.dishes.map(
          item => [
            item.dishId,
            item
          ]
        )
      );

    assert.equal(
      byDish.dish_star
        .classificationId,
      "star"
    );

    assert.equal(
      byDish.dish_cash
        .classificationId,
      "cash_cow"
    );

    assert.equal(
      byDish.dish_puzzle
        .classificationId,
      "puzzle"
    );

    assert.equal(
      byDish.dish_dog
        .classificationId,
      "dog"
    );

    assert.deepEqual(
      result.counts,
      {
        star: 1,
        cash_cow: 1,
        puzzle: 1,
        dog: 1
      }
    );

    const page =
      menuEngineeringPageSystem
        .getPage(
          restaurant.id
        );

    const view =
      new MenuEngineeringView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /菜单工程/
    );

    assert.match(
      html,
      /明星菜/
    );

    assert.match(
      html,
      /现金牛/
    );

    assert.match(
      html,
      /问题菜/
    );

    assert.match(
      html,
      /瘦狗菜/
    );
  }
);
