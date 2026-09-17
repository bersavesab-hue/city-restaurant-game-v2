import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationMobilePageSystem
} = app.systems;

test(
  "手机装修页支持分类选择拖放旋转模板和保存启用",
  () => {
    districtSystem.load(
      [
        {
          id: "mobile_renovation_area",
          name: "手机装修测试区",
          trafficIndex: 60,
          rentMultiplier: 1,
          spendingPower: 60,
          competition: 20,
          customerMix: {
            resident: 100
          }
        }
      ],
      { overwrite: true }
    );

    const property =
      propertySystem.create({
        districtId:
          "mobile_renovation_area",
        name: "手机装修测试铺",
        area: 80,
        seats: 10,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "手机装修测试店",
        locationId: property.id
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    const opened =
      renovationMobilePageSystem.open(
        restaurant.id
      );

    assert.equal(
      opened.drawer.activeCategory,
      "dining"
    );

    assert.ok(
      opened.drawer.categories.length >= 5
    );

    renovationMobilePageSystem.selectFurniture(
      restaurant.id,
      "table_4"
    );

    let page =
      renovationMobilePageSystem.placeSelected(
        restaurant.id,
        0,
        0
      );

    assert.equal(
      page.workspace.placements.length,
      1
    );

    assert.ok(
      page.selection.placement
    );

    page =
      renovationMobilePageSystem.rotateSelected(
        restaurant.id
      );

    assert.equal(
      page.selection.placement.rotation,
      90
    );

    renovationMobilePageSystem.selectCategory(
      restaurant.id,
      "kitchen"
    );

    page =
      renovationMobilePageSystem.getPage(
        restaurant.id
      );

    assert.equal(
      page.drawer.activeCategory,
      "kitchen"
    );

    const preview =
      renovationMobilePageSystem.previewTemplate(
        restaurant.id,
        "balanced"
      );

    assert.ok(
      preview.placements.length > 0
    );

    renovationMobilePageSystem.applyTemplate(
      restaurant.id,
      "balanced"
    );

    page =
      renovationMobilePageSystem.getPage(
        restaurant.id
      );

    assert.equal(
      page.actions.canActivate,
      true
    );

    const saved =
      renovationMobilePageSystem.save(
        restaurant.id,
        { activate: true }
      );

    assert.equal(
      saved.layout.active,
      true
    );
  }
);
