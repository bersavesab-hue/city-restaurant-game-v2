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
