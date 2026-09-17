import test from "node:test";
import assert from "node:assert/strict";

import { gameState } from "../src/core/GameState.js";

import { restaurantSystem } from "../src/systems/RestaurantSystem.js";
import { financeSystem } from "../src/systems/FinanceSystem.js";

import { districtSystem } from "../src/systems/DistrictSystem.js";
import { propertySystem } from "../src/systems/PropertySystem.js";
import { leaseSystem } from "../src/systems/LeaseSystem.js";

test(
  "选址链路：商圈 -> 铺位 -> 签租约 -> 扣租金 -> 绑定门店",
  () => {
    gameState.reset();

    districtSystem.load(
      [
        {
          id: "district_test",
          name: "测试商圈",
          trafficIndex: 70,
          rentMultiplier: 1.2,
          spendingPower: 65,
          competition: 50
        }
      ],
      { overwrite: true }
    );

    const property =
      propertySystem.create({
        districtId:
          "district_test",
        name:
          "测试铺位",
        area: 80,
        baseMonthlyRent:
          10000,
        seats: 24,
        depositMonths: 2
      });

    assert.equal(
      property.monthlyRent,
      12000
    );

    const restaurant =
      restaurantSystem.create({
        name: "选址测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      100000
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const lease =
      leaseSystem.sign({
        restaurantId:
          restaurant.id,
        propertyId:
          property.id,
        months: 12
      });

    assert.equal(
      lease.deposit,
      24000
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before - 36000
    );

    assert.equal(
      propertySystem.get(
        property.id
      ).status,
      "leased"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).locationId,
      property.id
    );
  }
);
