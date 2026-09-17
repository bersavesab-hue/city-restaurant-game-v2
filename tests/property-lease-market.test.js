import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  propertyLeaseMarketSystem,
  restaurantSystem,
  financeSystem,
  leaseSystem
} = app.systems;

const { entitySystem } = app.core;
const { cityPropertyPageSystem } = app.ui;

test("房源租赁支持房东议价免租物业费续租和NPC抢租", () => {
  districtSystem.load(
    [
      {
        id: "lease_market_test_area",
        name: "云栖商务商圈",
        trafficIndex: 82,
        rentMultiplier: 1,
        spendingPower: 79,
        competition: 68,
        customerMix: {
          office: 60,
          resident: 25,
          tourist: 15
        }
      }
    ],
    { overwrite: true }
  );

  const propertyBase = propertySystem.create({
    districtId: "lease_market_test_area",
    name: "云栖大道旗舰餐饮铺",
    area: 2000,
    usableArea: 1760,
    baseMonthlyRent: 52000,
    depositMonths: 2,
    frontageMeters: 18,
    parkingSpaces: 28,
    foodServiceAllowed: true,
    exhaustAllowed: true
  });

  const property = entitySystem.update(
    "property",
    propertyBase.id,
    {
      source: "market",
      listedDay: 1,
      marketMeta: {
        seed: 654321,
        qualityScore: 88,
        listingLife: 40
      }
    }
  );

  const enriched = propertyLeaseMarketSystem.ensureTerms(property.id);

  assert.ok(enriched.landlord?.name);
  assert.equal(enriched.leaseTerms.negotiable, true);
  assert.ok(enriched.leaseTerms.propertyFeeMonthly >= 0);
  assert.ok(enriched.leaseTerms.maxDiscountRate >= 0.03);
  assert.ok(enriched.leaseTerms.rentFreeMaxDays >= 7);

  const restaurant = restaurantSystem.create({
    name: "租赁谈判测试店"
  });

  financeSystem.createAccount(restaurant.id, 500000);

  const requestedRent = Math.round(enriched.monthlyRent * 0.98);
  const requestedRentFreeDays = Math.min(
    7,
    enriched.leaseTerms.rentFreeMaxDays
  );

  const negotiation = cityPropertyPageSystem.negotiateLease({
    restaurantId: restaurant.id,
    propertyId: property.id,
    months: 24,
    requestedRent,
    requestedRentFreeDays
  });

  assert.equal(negotiation.offer.status, "accepted");
  assert.equal(negotiation.offer.monthlyRent, requestedRent);
  assert.equal(
    negotiation.offer.rentFreeDays,
    requestedRentFreeDays
  );

  const detail = cityPropertyPageSystem.getPropertyDetail(
    property.id,
    restaurant.id,
    24,
    negotiation.offer.id
  );

  assert.equal(detail.landlord.name, enriched.landlord.name);
  assert.equal(detail.quote.monthlyRent, requestedRent);
  assert.equal(detail.quote.rentFreeDays, requestedRentFreeDays);
  assert.equal(detail.quote.initialRent, 0);
  assert.equal(detail.leaseState.canSign, true);

  const before = financeSystem.getBalance(restaurant.id);
  const signed = cityPropertyPageSystem.signLease({
    restaurantId: restaurant.id,
    propertyId: property.id,
    months: 24,
    offerId: negotiation.offer.id
  });

  assert.equal(signed.lease.monthlyRent, requestedRent);
  assert.equal(signed.lease.rentFreeDays, requestedRentFreeDays);
  assert.equal(
    signed.lease.propertyFeeMonthly,
    detail.quote.propertyFeeMonthly
  );
  assert.equal(
    financeSystem.getBalance(restaurant.id),
    before - detail.quote.upfront
  );
  assert.equal(
    signed.lease.nextRentDay,
    signed.lease.startDay + requestedRentFreeDays
  );

  const renewalQuote = cityPropertyPageSystem.getRenewalQuote(
    restaurant.id,
    12
  );

  assert.ok(renewalQuote.monthlyRent > signed.lease.monthlyRent);

  const renewed = cityPropertyPageSystem.renewLease(
    restaurant.id,
    12
  );

  assert.equal(renewed.renewalCount, 1);
  assert.equal(
    renewed.endDay,
    signed.lease.endDay + 360
  );
  assert.equal(
    leaseSystem.get(signed.lease.id).monthlyRent,
    renewalQuote.monthlyRent
  );

  const npcTargetBase = propertySystem.create({
    districtId: "lease_market_test_area",
    name: "NPC争抢热门铺位",
    area: 420,
    usableArea: 380,
    baseMonthlyRent: 18000,
    frontageMeters: 12,
    foodServiceAllowed: true,
    exhaustAllowed: true
  });

  const npcTarget = entitySystem.update(
    "property",
    npcTargetBase.id,
    {
      source: "market",
      listedDay: 1,
      marketMeta: {
        seed: 123456,
        qualityScore: 95,
        listingLife: 40
      }
    }
  );

  const npcTerms = propertyLeaseMarketSystem.ensureTerms(
    npcTarget.id
  ).leaseTerms;

  assert.ok(Number.isInteger(npcTerms.competitorClaimDay));

  const result = propertyLeaseMarketSystem.processDay(
    npcTerms.competitorClaimDay
  );

  assert.ok(result.claimed >= 1);
  assert.equal(
    propertySystem.get(npcTarget.id).status,
    "locked"
  );
});
