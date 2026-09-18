import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem
} = app.systems;

const {
  dishManagementSystem
} = app.systems;

test(
  "菜品管理系统支持研发菜单成长调价和上下架",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "dish_ui_rice",
          name: "UI米",
          category: "grain",
          unit: "portion",
          storageType: "dry",
          basePurchasePrice: 5,
          shelfLifeDays: 30,
          edibleRate: 1,
          baseWasteRate: 0
        },
        {
          id: "dish_ui_meat",
          name: "UI肉",
          category: "meat",
          unit: "portion",
          storageType: "chilled",
          basePurchasePrice: 12,
          shelfLifeDays: 5,
          edibleRate: .9,
          baseWasteRate: .1
        },
        {
          id: "dish_ui_veg",
          name: "UI菜",
          category: "vegetable",
          unit: "portion",
          storageType: "chilled",
          basePurchasePrice: 4,
          shelfLifeDays: 5,
          edibleRate: .95,
          baseWasteRate: .05
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      restaurantSystem.create({
        name: "菜品UI测试餐厅"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const random =
      dishManagementSystem
        .randomResearch({
          restaurantId:
            restaurant.id,
          name:
            "随机UI测试菜"
        });

    assert.ok(
      random.dish.id
    );

    let page =
      dishManagementSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.summary.total,
      1
    );

    assert.equal(
      page.summary.menuCount,
      0
    );

    let detail =
      dishManagementSystem
        .getDishDetail(
          restaurant.id,
          random.dish.id
        );

    assert.equal(
      detail.menu.listed,
      false
    );

    assert.equal(
      detail.lifecycle
        .tier.name,
      "家常"
    );

    const menuItem =
      dishManagementSystem
        .addToMenu({
          restaurantId:
            restaurant.id,
          dishId:
            random.dish.id,
          price: 68
        });

    assert.equal(
      menuItem.price,
      68
    );

    dishManagementSystem
      .setMenuPrice(
        restaurant.id,
        random.dish.id,
        88
      );

    detail =
      dishManagementSystem
        .getDishDetail(
          restaurant.id,
          random.dish.id
        );

    assert.equal(
      detail.menu.price,
      88
    );

    assert.equal(
      detail.menu.active,
      true
    );

    dishManagementSystem
      .setMenuActive(
        restaurant.id,
        random.dish.id,
        false
      );

    detail =
      dishManagementSystem
        .getDishDetail(
          restaurant.id,
          random.dish.id
        );

    assert.equal(
      detail.menu.active,
      false
    );

    const manual =
      dishManagementSystem
        .manualResearch({
          restaurantId:
            restaurant.id,
          name:
            "手工UI测试菜",
          category:
            "rice",
          method:
            "stir_fry",
          ingredients: [
            {
              ingredientId:
                "dish_ui_rice",
              quantity: 1
            },
            {
              ingredientId:
                "dish_ui_meat",
              quantity: 1
            }
          ]
        });

    assert.ok(
      manual.dish.id
    );

    page =
      dishManagementSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.summary.total,
      2
    );

    assert.equal(
      page.summary.menuCount,
      1
    );

    const lab =
      dishManagementSystem
        .getResearchLab(
          restaurant.id
        );

    assert.ok(
      lab.ingredients.length >= 3
    );

    assert.ok(
      lab.methods.length >= 7
    );

    assert.ok(
      lab.categories.length >= 6
    );
  }
);
