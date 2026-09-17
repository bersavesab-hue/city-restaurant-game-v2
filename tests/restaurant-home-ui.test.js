import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  financeSystem
} = app.systems;

const {
  restaurantHomePageSystem
} = app.ui;

test("门店经营主页接入真实店名时间房源资金通报和导航", () => {
  districtSystem.load(
    [
      {
        id: "restaurant_home_ui_area",
        name: "门店主页测试商圈",
        trafficIndex: 65,
        rentMultiplier: 1,
        spendingPower: 62,
        competition: 30,
        customerMix: {
          resident: 100
        }
      }
    ],
    { overwrite: true }
  );

  const property = propertySystem.create({
    districtId: "restaurant_home_ui_area",
    name: "东门街88号临街铺位",
    area: 88,
    seats: 18,
    baseMonthlyRent: 6800
  });

  const restaurant = restaurantSystem.create({
    name: "张老板秘制爆辣牛肉饭旗舰总店",
    locationId: property.id
  });

  financeSystem.createAccount(
    restaurant.id,
    52800
  );

  const page = restaurantHomePageSystem.getPage(
    restaurant.id
  );

  assert.equal(
    page.topBar.restaurantName,
    "张老板秘制爆辣牛肉饭旗舰总店"
  );

  assert.equal(
    page.topBar.balance,
    52800
  );

  assert.equal(
    page.scene.area,
    88
  );

  assert.equal(
    page.scene.seats,
    18
  );

  assert.equal(
    page.navigation.length,
    5
  );

  assert.equal(
    page.navigation.find(item => item.id === "restaurant").active,
    true
  );

  assert.ok(
    page.noticeTicker.current
  );

  assert.match(
    page.topBar.clock.clockText,
    /^\d{2}:\d{2}$/
  );

  assert.equal(
    page.quickActions.find(item => item.id === "renovation").enabled,
    true
  );

  const renamed = restaurantHomePageSystem.rename(
    restaurant.id,
    "我自己命名的超长特色餐饮品牌一号门店"
  );

  assert.equal(
    renamed.restaurant.name,
    "我自己命名的超长特色餐饮品牌一号门店"
  );
});
