import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationSystem,
  renovationEditorSystem
} = app.systems;

test(
  "装修编辑器支持草稿拖拽预算模板预览和一次保存启用",
  () => {
    districtSystem.load(
      [
        {
          id: "renovation_editor_area",
          name: "装修编辑器测试商圈",
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
          "renovation_editor_area",
        name: "装修编辑器测试铺位",
        area: 80,
        seats: 10,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "装修编辑器测试店",
        locationId: property.id
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const opened =
      renovationEditorSystem.open(
        restaurant.id
      );

    assert.equal(
      opened.layout.placements.length,
      0
    );

    const templatePreview =
      renovationEditorSystem
        .previewTemplate(
          restaurant.id,
          "balanced"
        );

    assert.ok(
      templatePreview.placements.length >
      0
    );

    assert.ok(
      templatePreview.budget.purchaseCost >
      0
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before
    );

    renovationEditorSystem.addItem(
      restaurant.id,
      "table_4",
      {
        x: 0,
        y: 0
      }
    );

    renovationEditorSystem.addItem(
      restaurant.id,
      "kitchen_station",
      {
        x: 4,
        y: 0
      }
    );

    renovationEditorSystem.addItem(
      restaurant.id,
      "cashier_counter",
      {
        x: 0,
        y: 3
      }
    );

    renovationEditorSystem.addItem(
      restaurant.id,
      "waiting_bench",
      {
        x: 2,
        y: 3
      }
    );

    renovationEditorSystem.addItem(
      restaurant.id,
      "decor_plant",
      {
        x: 4,
        y: 3
      }
    );

    let page =
      renovationEditorSystem
        .getPageState(
          restaurant.id
        );

    assert.equal(
      page.budget.purchaseCost,
      9600
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before
    );

    const draftTable =
      page.layout.placements.find(
        item =>
          item.furnitureId ===
          "table_4"
      );

    renovationEditorSystem.rotateItem(
      restaurant.id,
      draftTable.id
    );

    renovationEditorSystem.moveItem(
      restaurant.id,
      draftTable.id,
      0,
      0
    );

    page =
      renovationEditorSystem
        .getPageState(
          restaurant.id
        );

    assert.ok(
      Number.isInteger(
        page.analysis.score
      )
    );

    assert.equal(
      page.analysis.scores
        .completeness,
      100
    );

    assert.equal(
      page.actions.canActivate,
      true
    );

    const saved =
      renovationEditorSystem.save(
        restaurant.id,
        {
          activate: true
        }
      );

    assert.equal(
      saved.layout.active,
      true
    );

    assert.equal(
      saved.layout.placements.length,
      5
    );

    assert.equal(
      before -
      financeSystem.getBalance(
        restaurant.id
      ),
      9600
    );

    assert.equal(
      renovationEditorSystem
        .hasSession(
          restaurant.id
        ),
      false
    );

    assert.equal(
      renovationSystem.getLayout(
        restaurant.id
      ).active,
      true
    );
  }
);
