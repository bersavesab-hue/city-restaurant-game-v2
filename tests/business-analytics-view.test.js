import test from "node:test";
import assert from "node:assert/strict";

import {
  BusinessAnalyticsView
} from "../src/ui/pages/analytics/BusinessAnalyticsView.js";

test(
  "经营数据中心正式UI包含趋势成本菜品员工供应链和预警入口",
  () => {
    const view =
      new BusinessAnalyticsView();

    view.section =
      "overview";

    const page = {
      period: "week",

      periods: [
        {
          id: "day",
          name: "日"
        },
        {
          id: "week",
          name: "周"
        },
        {
          id: "month",
          name: "月"
        }
      ],

      range: {
        startDay: 1,
        endDay: 7
      },

      finance: {
        revenue: 10000,
        profit: 2500,
        orders: 120,
        averageSpend: 83,
        profitMargin: 25,
        ingredientCost: 3000,
        payroll: 1800,
        revenueChange: 12,
        profitChange: 8,
        orderChange: 6
      },

      trend: [
        {
          day: 1,
          revenue: 1000,
          profit: 200
        },
        {
          day: 2,
          revenue: 1500,
          profit: 350
        }
      ],

      alerts: [
        {
          id: "employee_fatigue",
          level: "warning",
          title: "员工疲劳",
          message: "1名员工处于高疲劳状态"
        }
      ],

      decisions: [
        {
          source: "employee",
          text: "检查高峰期排班"
        }
      ],

      dishes: {
        topSelling: {
          name: "测试菜",
          quantity: 50,
          revenue: 3000
        },

        topRevenue: {
          name: "测试菜",
          quantity: 50,
          revenue: 3000
        },

        topProfit: {
          name: "测试菜",
          quantity: 50,
          revenue: 3000
        },

        bySales: [],

        byRevenue: [
          {
            name: "测试菜",
            quantity: 50,
            revenue: 3000,
            profit: 1800,
            marginRate: 60,
            warnings: []
          }
        ],

        byProfit: [],

        warnings: []
      },

      employees: {
        total: 4,
        averageMood: 72,
        averageFatigue: 35,
        averageLoyalty: 68,
        highFatigue: 1,
        lowLoyalty: 0,
        turnoverWarning: 0,
        salaryArrears: 0
      },

      supply: {
        ingredientKinds: 5,
        usableQuantity: 100,
        spoiledQuantity: 0,
        pendingOrders: 2,
        pendingOrderValue: 600,
        openPayables: 1,
        openPayablesAmount: 500,
        overduePayables: 0,
        overdueAmount: 0
      }
    };

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /经营数据/
    );

    assert.match(
      html,
      /营业收入/
    );

    assert.match(
      html,
      /经营利润/
    );

    assert.match(
      html,
      /经营趋势/
    );

    assert.match(
      html,
      /成本结构/
    );

    assert.match(
      html,
      /异常中心/
    );

    assert.match(
      html,
      /经营建议/
    );

    assert.match(
      html,
      /测试菜/
    );

    view.section =
      "team";

    const teamHtml =
      view.renderMarkup(
        page
      );

    assert.match(
      teamHtml,
      /平均疲劳/
    );

    view.section =
      "supply";

    const supplyHtml =
      view.renderMarkup(
        page
      );

    assert.match(
      supplyHtml,
      /应付账款/
    );
  }
);
