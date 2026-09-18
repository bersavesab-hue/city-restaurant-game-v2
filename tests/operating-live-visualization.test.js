import test from "node:test";
import assert from "node:assert/strict";

import { OperatingCommandCenterView } from "../src/ui/pages/command-center/OperatingCommandCenterView.js";

test("经营总控展示最新小时客流订单库存疲劳和瓶颈", () => {
  const page = {
    day: 2,
    restaurant: {
      name: "可视化测试店",
      reviewScore: 4.2
    },
    sales: {
      revenue: 1200,
      profit: 500,
      orderCount: 10,
      channels: []
    },
    finance: { balance: 50000 },
    latestHour: {
      hour: 12,
      arrivals: 20,
      served: 15,
      waiting: 3,
      abandoned: 5,
      serviceRate: 75,
      estimatedWaitMinutes: 12,
      lostRevenue: 140,
      orders: 8,
      portions: 11,
      revenue: 560,
      averageQuality: 82,
      bottleneck: { id: "kitchen", name: "厨房" }
    },
    previousDay: null,
    capacity: {
      arrivals: 20,
      served: 15,
      abandonmentRate: 25,
      lostRevenue: 140
    },
    inventory: {
      lowStockCount: 2,
      outOfStockCount: 1
    },
    workforce: {
      availableEmployees: 3,
      exhaustedEmployees: []
    },
    workforcePulse: {
      averageFatigue: 58,
      highFatigue: 1
    },
    menu: {
      counts: {
        star: 1,
        cash_cow: 0,
        puzzle: 0,
        dog: 0
      }
    },
    priorities: []
  };

  const html = new OperatingCommandCenterView().renderMarkup(page);

  assert.match(html, /最新营业小时/);
  assert.match(html, /12:00 经营现场/);
  assert.match(html, /当前瓶颈：厨房/);
  assert.match(html, /本小时订单/);
  assert.match(html, /库存风险/);
  assert.match(html, /员工平均疲劳/);
  assert.match(html, /预计损失/);
});
