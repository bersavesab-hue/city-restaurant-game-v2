import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluatePermitRequirements
} from "../src/systems/OpeningPermitSystem.js";

import {
  buildStarterRequirementMap
} from "../src/systems/OpeningInventorySystem.js";


test(
  "开业许可会根据房源装修和排烟需求判断",
  () => {
    const result =
      evaluatePermitRequirements({
        hasLocation:
          true,

        foodServiceAllowed:
          true,

        renovationActive:
          true,

        seats:
          20,

        kitchenStations:
          2,

        requiresExhaust:
          true,

        exhaustAllowed:
          true
      });


    assert.equal(
      result.every(
        item =>
          !item.required ||
          item.ready
      ),
      true
    );


    const exhaust =
      result.find(
        item =>
          item.permitKind ===
          "exhaust"
      );


    assert.equal(
      exhaust.required,
      true
    );


    assert.equal(
      exhaust.ready,
      true
    );
  }
);


test(
  "首批库存需求会合并多道菜重复食材",
  () => {
    const result =
      buildStarterRequirementMap(
        [
          {
            ingredients: [
              {
                ingredientId:
                  "rice",

                quantity:
                  1
              },

              {
                ingredientId:
                  "pork",

                quantity:
                  2
              }
            ]
          },

          {
            ingredients: [
              {
                ingredientId:
                  "rice",

                quantity:
                  0.5
              },

              {
                ingredientId:
                  "egg",

                quantity:
                  1
              }
            ]
          }
        ],
        10
      );


    const rice =
      result.find(
        item =>
          item.ingredientId ===
          "rice"
      );


    const pork =
      result.find(
        item =>
          item.ingredientId ===
          "pork"
      );


    assert.equal(
      rice.requiredQuantity,
      15
    );


    assert.equal(
      pork.requiredQuantity,
      20
    );


    assert.equal(
      result.length,
      3
    );
  }
);
