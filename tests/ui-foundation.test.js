import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";
import {
  PageRegistry,
  buildGameClockModel,
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../src/ui/index.js";

test("UI基础框架支持时间倍速动态命名通报和可扩展页面注册", () => {
  const clock = buildGameClockModel(
    { day: 371, hour: 11, minute: 42 },
    { paused: false, speed: 4 }
  );

  assert.equal(clock.dateText, "第2年 1月11日 周七".replace("周七", "周四"));
  assert.equal(clock.clockText, "11:42");
  assert.equal(clock.statusText, "4×");

  const topbar = buildGlobalTopBarModel({
    restaurantName: "张老板秘制爆辣牛肉饭旗舰总店",
    balance: 52800,
    storeLevel: 3,
    time: { day: 10, hour: 11, minute: 42 },
    runtime: { paused: true, speed: 2 }
  });

  assert.equal(topbar.restaurantName, "张老板秘制爆辣牛肉饭旗舰总店");
  assert.equal(topbar.clock.statusText, "已暂停");
  assert.equal(topbar.actions.canRename, true);

  const notices = buildNoticeTickerModel([
    { id: "a", message: "牛肉库存偏低", priority: 10 },
    { id: "b", message: "午餐高峰即将开始", priority: 20 }
  ]);

  assert.equal(notices.current.id, "b");
  assert.equal(notices.unreadCount, 2);

  const registry = new PageRegistry();
  registry.register({ id: "root", title: "根页面", nav: "main", order: 1 });
  registry.register({ id: "child", title: "扩展页面", parent: "root", order: 2 });

  assert.equal(registry.mainNavigation().length, 1);
  assert.equal(registry.children("root")[0].id, "child");

  assert.deepEqual(
    app.ui.pageRegistry.mainNavigation().map(page => page.id),
    ["city", "restaurant", "operations", "employees", "more"]
  );
  assert.equal(app.ui.pageRegistry.get("employee_promotion").parent, "employees");
});
