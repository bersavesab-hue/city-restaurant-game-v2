import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  economicBaselineSystem
} from "../src/systems/EconomicBaselineSystem.js";

import {
  cityEconomySystem
} from "../src/systems/CityEconomySystem.js";

test("reality pricing uses 1-to-1 nominal CNY with source metadata", () => {
  const snapshot =
    economicBaselineSystem
      .getSnapshot();

  assert.equal(
    snapshot.sourcePolicy
      .mode,
    "reality_1_to_1"
  );

  assert.equal(
    snapshot.sourcePolicy
      .pricingScale,
    1
  );

  assert.equal(
    snapshot.sourcePolicy
      .strictNominalRmb,
    true
  );

  const pork =
    economicBaselineSystem
      .getIngredientReference(
        "pork"
      );

  assert.equal(
    pork.referencePrice,
    17.48
  );

  assert.equal(
    pork.sourceUnit,
    "kg"
  );

  assert.equal(
    pork.unit,
    "g"
  );

  assert.equal(
    pork.normalizedUnitPrice,
    0.01748
  );

  assert.ok(
    pork.sourceUrl
  );
});


test("kg egg price converts to real per-piece cost instead of game scaling", () => {
  const egg =
    economicBaselineSystem
      .getIngredientReference(
        "egg"
      );

  assert.equal(
    egg.sourceUnit,
    "kg"
  );

  assert.equal(
    egg.unit,
    "piece"
  );

  assert.equal(
    egg.gramsPerPiece,
    55
  );

  assert.equal(
    Number(
      egg
        .normalizedUnitPrice
        .toFixed(4)
    ),
    0.5984
  );
});


test("strict reality mode does not create synthetic daily food price waves", () => {
  gameState.reset();

  const dayOne =
    cityEconomySystem
      .getState();

  gameState.patchSection(
    "time",
    {
      day:
        181
    }
  );

  const later =
    cityEconomySystem
      .getState();

  assert.equal(
    dayOne.foodPriceIndex,
    later.foodPriceIndex
  );

  assert.equal(
    dayOne.energyIndex,
    later.energyIndex
  );
});
