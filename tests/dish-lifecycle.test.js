import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  restaurantSystem,
  financeSystem,
  dishLifecycleSystem
} = app.systems;

const {
  entitySystem
} = app.core;

test(
  "菜品支持随机研发等级品质熟练度销量成本利润口碑和招牌成长",
  () => {
    ingredientCatalogSystem.load(
      [
        {
          id: "life_rice",
          name: "生命周期米",
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
          id: "life_meat",
          name: "生命周期肉",
          category: "meat",
          unit: "portion",
          baseQuality: 4,
          storageType: "chilled",
          basePurchasePrice: 14,
          shelfLifeDays: 5,
          edibleRate: .9,
          baseWasteRate: .1
        },
        {
          id: "life_veg",
          name: "生命周期菜",
          category: "vegetable",
          unit: "portion",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 4,
          shelfLifeDays: 5,
          edibleRate: .95,
          baseWasteRate: .05
        },
        {
          id: "life_spice",
          name: "生命周期香料",
          category: "seasoning",
          unit: "portion",
          baseQuality: 4,
          storageType: "dry",
          basePurchasePrice: 3,
          shelfLifeDays: 60,
          edibleRate: 1,
          baseWasteRate: 0
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      restaurantSystem.create({
        name: "菜品成长测试餐厅"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const developed =
      dishLifecycleSystem
        .developRandom({
          restaurantId:
            restaurant.id,
          name:
            "随机研发测试菜"
        });

    assert.ok(
      developed.dish.id
    );

    assert.equal(
      developed.lifecycle
        .tier.name,
      "家常"
    );

    assert.equal(
      developed.lifecycle
        .mastery.name,
      "生疏"
    );

    const prepared =
      entitySystem.update(
        "custom_dish",
        developed.dish.id,
        {
          qualityScore: 72,
          qualityGrade: "A",
          masteryLevel: 3,
          masteryXp: 220
        }
      );

    assert.equal(
      prepared.masteryLevel,
      3
    );

    const served =
      dishLifecycleSystem
        .recordService({
          dishId:
            developed.dish.id,
          quantity: 400,
          revenue: 16000,
          ingredientCost: 5200,
          outputQualityScore: 86
        });

    assert.equal(
      served
        .marketPerformance
        .sold,
      400
    );

    assert.equal(
      served
        .marketPerformance
        .revenue,
      16000
    );

    assert.equal(
      served
        .marketPerformance
        .grossProfit,
      10800
    );

    assert.ok(
      served
        .marketPerformance
        .grossMargin > .6
    );

    assert.equal(
      served
        .outputQuality
        .name,
      "精致"
    );

    assert.equal(
      served.masteryName,
      "精通"
    );

    const status =
      dishLifecycleSystem
        .getStatus(
          developed.dish.id
        );

    assert.equal(
      status.tier.name,
      "招牌"
    );

    assert.ok(
      status.market
        .reputationScore >= 55
    );

    assert.ok(
      status.market
        .popularityScore > 0
    );

    assert.equal(
      status.economics
        .grossProfit,
      10800
    );

    const summary =
      dishLifecycleSystem
        .getPortfolioSummary(
          restaurant.id
        );

    assert.equal(
      summary.total,
      1
    );

    assert.equal(
      summary.signatureCount,
      1
    );

    assert.equal(
      summary.totalSold,
      400
    );

    assert.equal(
      summary.topDish.name,
      "随机研发测试菜"
    );
  }
);
