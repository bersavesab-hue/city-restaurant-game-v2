import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  renovationSystem,
  renovationPlanningSystem
} = app.systems;

test(
  "装修规划会计算功能分区桌间距评分并支持自动布局模板",
  () => {
    districtSystem.load(
      [
        {
          id: "renovation_planning_area",
          name: "装修规划测试商圈",
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
          "renovation_planning_area",
        name:
          "装修规划测试铺位",
        area: 96,
        seats: 12,
        baseMonthlyRent: 5000
      });

    const restaurant =
      restaurantSystem.create({
        name: "装修规划测试店",
        locationId: property.id
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    renovationSystem.initialize(
      restaurant.id
    );

    const preview =
      renovationPlanningSystem
        .buildTemplatePreview(
          restaurant.id,
          "balanced"
        );

    assert.equal(
      preview.canApply,
      true
    );

    assert.ok(
      preview.placements.length >= 6
    );

    assert.ok(
      preview.totalCost > 0
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const applied =
      renovationPlanningSystem
        .applyTemplate(
          restaurant.id,
          "balanced"
        );

    assert.equal(
      applied.layout.active,
      true
    );

    assert.equal(
      before -
        financeSystem.getBalance(
          restaurant.id
        ),
      preview.totalCost
    );

    const analysis =
      renovationPlanningSystem
        .getAnalysis(
          restaurant.id
        );

    assert.ok(
      analysis.score >= 0 &&
      analysis.score <= 100
    );

    assert.ok(
      [
        "S",
        "A",
        "B",
        "C",
        "D"
      ].includes(
        analysis.grade
      )
    );

    assert.ok(
      analysis.zoning.cells.dining > 0
    );

    assert.ok(
      analysis.zoning.cells.kitchen > 0
    );

    assert.ok(
      analysis.zoning.cells.service > 0
    );

    assert.ok(
      analysis.zoning.cells.waiting > 0
    );

    assert.ok(
      analysis.spacing.tableCount >= 2
    );

    assert.ok(
      analysis.scores.completeness >= 85
    );

    assert.throws(
      () =>
        renovationPlanningSystem
          .applyTemplate(
            restaurant.id,
            "quick_service"
          ),
      /empty layout/
    );
  }
);
