import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertyMarketSystem
} = app.systems;

const {
  cityPropertyPageSystem
} = app.ui;

test("动态房源池按正式模板生成连续房源并按周期换新", () => {
  districtSystem.load(
    [
      {
        id: "dynamic_property_market_area",
        name: "云桥生活商圈",
        trafficIndex: 76,
        rentMultiplier: 1.12,
        spendingPower: 71,
        competition: 52,
        customerMix: {
          resident: 45,
          office: 35,
          tourist: 20
        }
      }
    ],
    { overwrite: true }
  );

  const initial = propertyMarketSystem.ensureDistrictStock(
    "dynamic_property_market_area",
    {
      target: 24,
      day: 10
    }
  );

  assert.equal(initial.created, 24);
  assert.equal(initial.availableGenerated, 24);

  const listings = propertyMarketSystem.listGenerated(
    "dynamic_property_market_area",
    { availableOnly: true }
  );

  assert.equal(listings.length, 24);
  assert.ok(listings.every(item => item.area >= 18 && item.area <= 8000));
  assert.ok(listings.every(item => item.usableArea > 0 && item.usableArea <= item.area));
  assert.ok(listings.every(item => item.monthlyRent > 0));
  assert.ok(listings.every(item => item.floors.length >= 1));
  assert.ok(listings.every(item => item.source === "market"));
  assert.ok(listings.every(item => item.expiresDay > item.listedDay));
  assert.ok(listings.every(item => item.marketMeta.qualityScore >= 35));

  const profileTypes = new Set(
    listings.map(item => item.propertyType)
  );
  const uniqueAreas = new Set(
    listings.map(item => item.area)
  );

  assert.ok(profileTypes.size >= 5);
  assert.ok(uniqueAreas.size >= 12);

  const marketplace = cityPropertyPageSystem.getMarketplace({
    districtId: "dynamic_property_market_area",
    foodServiceOnly: true,
    exhaustRequired: true,
    marketTarget: 24
  });

  assert.equal(marketplace.market.dynamicListings, true);
  assert.equal(marketplace.market.targetPerDistrict, 24);
  assert.ok(marketplace.properties.length > 0);
  assert.ok(
    marketplace.properties.every(
      item => item.foodServiceAllowed && item.exhaustAllowed
    )
  );
  assert.ok(
    marketplace.properties.some(
      item => item.source === "market" && item.qualityScore !== null
    )
  );

  const previousIds = new Set(
    propertyMarketSystem
      .listGenerated("dynamic_property_market_area", {
        availableOnly: true
      })
      .map(item => item.id)
  );

  const refresh = propertyMarketSystem.processDay(60);

  assert.equal(refresh.refreshed, 1);

  const refreshed = propertyMarketSystem.listGenerated(
    "dynamic_property_market_area",
    { availableOnly: true }
  );

  assert.equal(refreshed.length, 24);
  assert.ok(
    refreshed.some(item => !previousIds.has(item.id))
  );

  const summary = propertyMarketSystem.getSummary(
    "dynamic_property_market_area"
  );

  assert.equal(summary.active, true);
  assert.equal(summary.target, 24);
  assert.equal(summary.availableGenerated, 24);
  assert.ok(summary.areaRange.min >= 18);
  assert.ok(summary.areaRange.max <= 8000);
});
