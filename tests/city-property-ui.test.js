import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem,
  leaseSystem
} = app.systems;

const {
  cityPropertyPageSystem
} = app.ui;

test("城市房源页面支持筛选详情签约并进入装修流程", () => {
  districtSystem.load(
    [
      {
        id: "city_property_ui_area",
        name: "烟火老街商圈",
        trafficIndex: 78,
        rentMultiplier: 1,
        spendingPower: 66,
        competition: 44,
        customerMix: {
          resident: 70,
          office: 30
        }
      }
    ],
    { overwrite: true }
  );

  const property = propertySystem.create({
    districtId: "city_property_ui_area",
    name: "烟火老街A17临街铺",
    area: 86,
    seats: 20,
    baseMonthlyRent: 6800,
    depositMonths: 2
  });

  const restaurant = restaurantSystem.create({
    name: "新店筹备中"
  });

  financeSystem.createAccount(restaurant.id, 60000);

  const marketplace = cityPropertyPageSystem.getMarketplace({
    restaurantId: restaurant.id,
    districtId: "city_property_ui_area"
  });

  assert.equal(marketplace.properties.length, 1);
  assert.equal(marketplace.properties[0].area, 86);
  assert.equal(marketplace.properties[0].quote.upfront, 20400);
  assert.equal(marketplace.properties[0].quote.affordable, true);

  const detail = cityPropertyPageSystem.getPropertyDetail(
    property.id,
    restaurant.id
  );

  assert.equal(detail.leaseState.canSign, true);
  assert.equal(detail.nextAfterLease, "renovation");

  const result = cityPropertyPageSystem.signLease({
    restaurantId: restaurant.id,
    propertyId: property.id,
    months: 12
  });

  assert.equal(result.nextPage, "renovation");
  assert.equal(result.restaurant.locationId, property.id);
  assert.equal(result.property.status, "leased");
  assert.equal(
    leaseSystem.getByRestaurant(restaurant.id).propertyId,
    property.id
  );
});
