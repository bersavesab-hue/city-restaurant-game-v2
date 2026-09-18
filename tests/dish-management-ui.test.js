import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem
} = app.systems;

const {
  dishManagementPageSystem
} = app.ui;

test(
  "菜品正式页面支持研发菜单成长调价和上下架",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "dish_ui_rice",
          name: "UI米",
          category: "grain",
          unit: "portion",
          baseQuality: 3,
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
          baseQuality: 4,
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
          baseQuality: 3,
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
      dishManagementPageSystem
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
      dishManagementPageSystem
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
      dishManagementPageSystem
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
      dishManagementPageSystem
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

    dishManagementPageSystem
      .setMenuPrice(
        restaurant.id,
        random.dish.id,
        88
      );

    detail =
      dishManagementPageSystem
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

    dishManagementPageSystem
      .setMenuActive(
        restaurant.id,
        random.dish.id,
        false
      );

    detail =
      dishManagementPageSystem
        .getDishDetail(
          restaurant.id,
          random.dish.id
        );

    assert.equal(
      detail.menu.active,
      false
    );

    const manual =
      dishManagementPageSystem
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
      dishManagementPageSystem
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
      dishManagementPageSystem
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
