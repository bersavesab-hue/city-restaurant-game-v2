import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";
import { districtSystem } from "../src/systems/DistrictSystem.js";
import { propertySystem } from "../src/systems/PropertySystem.js";
import { leaseSystem } from "../src/systems/LeaseSystem.js";

test(
  "租赁周期：押金不计支出、自动月租、到期退款",
  () => {
    gameState.reset();

    districtSystem.load(
      [
        {
          id: "lease_cycle_district",
          name: "租赁测试区",
          trafficIndex: 50,
          rentMultiplier: 1,
          spendingPower: 50,
          competition: 50
        }
      ],
      { overwrite: true }
    );

    const property =
      propertySystem.create({
        districtId:
          "lease_cycle_district",
        name: "测试铺位",
        area: 50,
        baseMonthlyRent: 3000,
        seats: 10,
        depositMonths: 2
      });

    const restaurant =
      restaurantSystem.create({
        name: "租赁周期店"
      });

    financeSystem.createAccount(
      restaurant.id,
      50000
    );

    const lease =
      leaseSystem.sign({
        restaurantId:
          restaurant.id,
        propertyId:
          property.id,
        months: 2
      });

    let summary =
      financeSystem.getSummary(
        restaurant.id
      );

    assert.equal(
      summary.reservedDeposits,
      6000
    );

    assert.equal(
      summary.lifetimeExpense,
      3000
    );

    leaseSystem.processDay(
      lease.nextRentDay
    );

    summary =
      financeSystem.getSummary(
        restaurant.id
      );

    assert.equal(
      summary.lifetimeExpense,
      6000
    );

    leaseSystem.processDay(
      lease.endDay
    );

    const ended =
      leaseSystem.get(
        lease.id
      );

    assert.equal(
      ended.status,
      "terminated"
    );

    assert.equal(
      financeSystem.getSummary(
        restaurant.id
      ).reservedDeposits,
      0
    );

    assert.equal(
      propertySystem.get(
        property.id
      ).status,
      "available"
    );
  }
);
