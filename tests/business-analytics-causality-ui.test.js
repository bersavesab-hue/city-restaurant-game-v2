import test from "node:test";
import assert from "node:assert/strict";

import {
  BusinessAnalyticsView
} from "../src/ui/pages/analytics/BusinessAnalyticsView.js";

test("causal analytics shows segment price and retention impact", () => {
  const view =
    new BusinessAnalyticsView();

  const html =
    view.renderCausality({
      causality: {
        summary: {
          topCause: {
            label:
              "价格接受度"
          },

          averageSatisfaction:
            68,

          averageWaitMinutes:
            7,

          serviceRate:
            84,

          revenueChange:
            11,

          profitChange:
            3,

          orderChange:
            -9
        },

        latest: {
          primaryCause: {
            label:
              "价格接受度"
          }
        },

        segments: [
          {
            segmentId:
              "student",

            segmentName:
              "学生",

            priceTrafficImpact:
              -18,

            retentionImpact:
              -6,

            serviceRate:
              82,

            averageSpend:
              24,

            primaryDriverLabel:
              "价格接受度"
          },

          {
            segmentId:
              "high_income",

            segmentName:
              "高收入客群",

            priceTrafficImpact:
              -1,

            retentionImpact:
              2,

            serviceRate:
              96,

            averageSpend:
              188,

            primaryDriverLabel:
              "综合体验"
          }
        ],

        causes: [
          {
            label:
              "价格接受度",

            count:
              5
          }
        ]
      }
    });

  for (
    const text
    of [
      "经营因果",
      "学生",
      "-18%",
      "高收入客群",
      "价格接受度",
      "订单",
      "-9%",
      "利润",
      "+3%"
    ]
  ) {
    assert.equal(
      html.includes(text),
      true,
      `缺少因果展示：${text}`
    );
  }
});


test("pricing decision review renders before-after business results", () => {
  const view =
    new BusinessAnalyticsView();

  const html =
    view.renderPricingDecisions([
      {
        dishName:
          "招牌炒饭",

        day: 5,

        previousPrice:
          20,

        nextPrice:
          24,

        priceChangePercent:
          20,

        confidence:
          "strong",

        hasComparison:
          true,

        before: {
          orders: 100,
          revenue: 2000,
          grossProfit: 800,
          averageSpend: 20,
          averageWaitMinutes: 5,
          satisfaction: 78,
          reviewScore: 4.4,
          repeatRate: 42
        },

        after: {
          orders: 88,
          revenue: 2112,
          grossProfit: 900,
          averageSpend: 24,
          averageWaitMinutes: 8,
          satisfaction: 72,
          reviewScore: 4.2,
          repeatRate: 38
        },

        delta: {
          orders: -12,
          revenue: 5.6,
          grossProfit: 12.5,
          averageSpend: 20,
          waitMinutes: 3,
          satisfaction: -6,
          reviewScore: -0.2,
          repeatRate: -4
        },

        segments: [
          {
            segmentName:
              "学生",

            actualTrafficChange:
              -18,

            directPriceImpact:
              -16,

            beforeAverageSpend:
              19,

            afterAverageSpend:
              23
          }
        ]
      }
    ]);

  for (
    const text
    of [
      "调价复盘",
      "招牌炒饭",
      "¥20",
      "¥24",
      "订单",
      "-12%",
      "订单毛利",
      "+12.5%",
      "平均等待",
      "+3分钟",
      "评价",
      "-0.2",
      "复购率",
      "-4个百分点",
      "学生",
      "-18%"
    ]
  ) {
    assert.equal(
      html.includes(text),
      true,
      `缺少调价复盘展示：${text}`
    );
  }
});
