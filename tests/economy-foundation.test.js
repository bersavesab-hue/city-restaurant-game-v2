import test from "node:test";
import assert from "node:assert/strict";

import { CITY_DISTRICTS } from "../src/data/cityDistricts.js";
import { VENUE_TYPES } from "../src/data/venueTypes.js";
import { CUSTOMER_SEGMENTS_V2 } from "../src/data/customerSegments.v2.js";
import { EconomicBaselineSystem } from "../src/systems/EconomicBaselineSystem.js";


test("城市包含10个差异化经营区域", () => {
  assert.equal(CITY_DISTRICTS.length, 10);
  assert.equal(new Set(CITY_DISTRICTS.map((item) => item.id)).size, 10);
  assert.ok(CITY_DISTRICTS.some((item) => item.id === "suburban_resort"));
  assert.ok(CITY_DISTRICTS.every((item) => Number.isFinite(item.mapPosition?.x) && Number.isFinite(item.mapPosition?.y)));
});


test("顾客群体包含价格、品质、速度和时段差异", () => {
  assert.ok(CUSTOMER_SEGMENTS_V2.length >= 10);
  for (const segment of CUSTOMER_SEGMENTS_V2) {
    assert.ok(Number.isFinite(segment.priceSensitivity));
    assert.ok(Number.isFinite(segment.qualitySensitivity));
    assert.ok(Number.isFinite(segment.speedSensitivity));
    assert.ok(Object.keys(segment.hourWeights).length > 0);
  }
});


test("场所类型包含山庄和别墅私厨", () => {
  const ids = new Set(VENUE_TYPES.map((item) => item.id));
  assert.equal(ids.has("mountain_resort"), true);
  assert.equal(ids.has("villa_private_kitchen"), true);
});


test("涨价对高价格敏感客群影响更大", () => {
  const system = new EconomicBaselineSystem();
  const sensitive = system.calculatePriceElasticity({ priceRatio: 1.25, priceSensitivity: 90, spendingPower: 40 });
  const tolerant = system.calculatePriceElasticity({ priceRatio: 1.25, priceSensitivity: 20, spendingPower: 90 });
  assert.ok(sensitive.demandFactor < tolerant.demandFactor);
});
