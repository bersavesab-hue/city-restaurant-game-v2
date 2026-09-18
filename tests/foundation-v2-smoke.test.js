import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";
import { dataRegistry } from "../src/core/DataRegistry.js";
import { simulationSystem } from "../src/core/SimulationSystem.js";
import { timeSystem } from "../src/core/TimeSystem.js";

import { gameFoundationSystem } from "../src/systems/GameFoundationSystem.js";
import { districtSystem } from "../src/systems/DistrictSystem.js";
import { customerSegmentSystem } from "../src/systems/CustomerSegmentSystem.js";
import { propertySystem } from "../src/systems/PropertySystem.js";
import { venueTypeSystem } from "../src/systems/VenueTypeSystem.js";
import { economicBaselineSystem } from "../src/systems/EconomicBaselineSystem.js";

test("V2 foundation loads expanded city, customer groups and venue types", () => {
  gameState.reset();
  dataRegistry.clear();

  gameFoundationSystem.initialize({
    seedProperties: true,
    overwriteReferenceData: true
  });

  assert.equal(districtSystem.getAll().length, 10);
  assert.ok(customerSegmentSystem.getAll().length >= 10);
  assert.ok(venueTypeSystem.getAll().length >= 15);

  const properties = propertySystem.list();
  assert.ok(properties.length >= 20);

  const villa = properties.find(
    item => item.venueTypeId === "villa_private_kitchen"
  );
  const resort = properties.find(
    item => item.venueTypeId === "mountain_resort"
  );

  assert.ok(villa);
  assert.ok(resort);
  assert.ok(villa.monthlyRent > 0);
  assert.ok(resort.monthlyRent > 0);
});

test("time simulation advances at 1x and 4x", () => {
  gameState.reset();

  timeSystem.resume();
  timeSystem.setSpeed(1);

  simulationSystem.tick(1);
  assert.equal(gameState.getSection("time").totalMinutes, 1);

  timeSystem.setSpeed(4);
  simulationSystem.tick(1);
  assert.equal(gameState.getSection("time").totalMinutes, 5);
});

test("price-sensitive customers react more strongly to menu price increases", () => {
  const sensitive = economicBaselineSystem.calculatePriceElasticity({
    priceRatio: 1.4,
    priceSensitivity: 90,
    spendingPower: 35
  });

  const tolerant = economicBaselineSystem.calculatePriceElasticity({
    priceRatio: 1.4,
    priceSensitivity: 20,
    spendingPower: 90
  });

  assert.ok(sensitive.demandFactor < tolerant.demandFactor);
});
