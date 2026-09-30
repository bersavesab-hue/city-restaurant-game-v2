import test from "node:test";
import assert from "node:assert/strict";
import {app} from "../src/main.js";
import {createMobileGameController} from "../client/mobile/MobileGameController.js";
import {renderHomePage} from "../client/mobile/HomePage.js";
import {createBrowserRuntimeSession} from "../src/runtime/BrowserRuntimeSession.js";
import {createSimulationClock} from "../src/runtime/SimulationClock.js";

function startController() {
  app.core.gameState.reset();
  app.systems.gameFoundationSystem.initialize({
    seedProperties: true, overwriteReferenceData: true
  });
  const controller = createMobileGameController(app);
  controller.ensureStarterState();
  return controller;
}

test("business overview excludes initial capital and follows paid procurement and refunds", () => {
  const controller = startController();
  const initial = controller.getViewModel();
  assert.equal(initial.business.tab, "overview");
  assert.equal(initial.today.income, 0);
  assert.equal(initial.today.expense, 0);
  assert.equal(initial.today.cashNet, 0);
  assert.match(renderHomePage(initial, "business"), /尚未结算/);
  controller.performAction("procurement-quote");
  const purchase = controller.performAction("procurement-purchase");
  assert.equal(purchase.ok, true);
  const pending = purchase.viewModel.business.pendingOrders[0];
  assert.equal(purchase.viewModel.today.expense, pending.totalPrice);
  assert.equal(purchase.viewModel.today.cashNet, -pending.totalPrice);
  const cancellation = controller.performAction("procurement-cancel", pending.id);
  assert.equal(cancellation.ok, true);
  assert.equal(cancellation.viewModel.today.refunds, pending.totalPrice);
  assert.equal(cancellation.viewModel.today.cashNet, 0);
  assert.equal(cancellation.viewModel.today.expenseBreakdown[0].amount, pending.totalPrice);
});

test("real simulation timer advances across management routes and respects pause and resume", () => {
  const controller = startController();
  const slot = "t12-business-clock";
  app.core.saveSystem.remove(slot);
  let now = 0;
  let pulse;
  const session = createBrowserRuntimeSession(app, {
    saveSlot: slot,
    documentRef: {addEventListener() {}, removeEventListener() {}},
    windowRef: {addEventListener() {}, removeEventListener() {}},
    setIntervalFn: () => 2, clearIntervalFn() {},
    clockFactory: runtimeApp => createSimulationClock(runtimeApp, {
      now: () => now,
      setIntervalFn: callback => {pulse = callback; return 1;},
      clearIntervalFn() {}
    })
  });
  session.start();
  try {
    const before = controller.getViewModel().time.totalMinutes;
    for (const page of ["store", "business", "research", "staff", "more"]) {
      now += 1000;
      pulse();
      const vm = controller.getViewModel();
      assert.equal(vm.runtime.paused, false);
      const html = renderHomePage(vm, page);
      assert.ok(html.includes(vm.time.clock));
      assert.ok(html.includes('aria-label="暂停自动推进时间"'));
    }
    assert.equal(controller.getViewModel().time.totalMinutes, before + 10);
    controller.performAction("toggle-time");
    now += 1000;
    pulse();
    assert.equal(controller.getViewModel().time.totalMinutes, before + 10);
    assert.match(renderHomePage(controller.getViewModel(), "business"), /继续时间/);
    controller.performAction("toggle-time");
    now += 1000;
    pulse();
    assert.equal(controller.getViewModel().time.totalMinutes, before + 12);
  } finally {
    session.stop({save: false});
    app.core.saveSystem.remove(slot);
  }
});

test("overview displays real daily settlement and counts aggregated completed orders", () => {
  const controller = startController();
  const vm = controller.getViewModel();
  app.core.entitySystem.create("customer_order", {
    restaurantId: vm.restaurant.id,
    day: vm.time.day,
    status: "completed",
    orderCount: 3,
    totalRevenue: 900,
    ingredientCost: 120
  });
  const current = controller.getViewModel();
  assert.equal(current.today.orders, 3);
  assert.equal(current.today.revenue, 900);
  app.systems.dailySettlementSystem.settle(current.restaurant.id, current.time.day);
  const settled = controller.getViewModel();
  assert.equal(settled.latestSettlement.orders, 3);
  assert.equal(settled.latestSettlement.revenue, 900);
  const html = renderHomePage(settled, "business");
  assert.match(html, /第1天结算/);
  assert.match(html, /食材消耗成本/);
  assert.match(html, /尚未扣除租金、水电、营销等费用/);
  assert.ok(html.includes(`¥${settled.latestSettlement.operatingProfit.toLocaleString("zh-CN")}`));
});
