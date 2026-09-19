import test from "node:test";
import assert from "node:assert/strict";

import {
  CityPropertyView
} from "../src/ui/pages/city/CityPropertyView.js";


test(
  "正式房源UI包含商圈筛选实景经营数据和租赁入口",
  () => {
    const view =
      new CityPropertyView();

    view.filters = {};

    const model = {
      filters: {
        districtId: null
      },

      districts: [
        {
          id: "d1",
          name: "东门商圈",
          trafficIndex: 82,
          spendingPower: 75,
          competition: 61,
          propertyCount: 4
        }
      ],

      properties: [
        {
          id: "p1",
          name: "临街旺铺",
          districtName: "东门商圈",
          area: 180,
          usableArea: 160,
          floorCount: 1,
          monthlyRent: 18000,
          frontageMeters: 8,
          parkingSpaces: 3,
          foodServiceAllowed: true,
          exhaustAllowed: true,
          qualityScore: 88,
          source: "market",

          leaseTerms: {
            negotiable: true
          },

          district: {
            trafficIndex: 82,
            spendingPower: 75,
            competition: 61
          },

          competition: {
            daysUntilPossibleClaim: 2
          },

          listing: {
            remainingDays: 5
          },

          quote: {
            upfront: 72000
          }
        }
      ]
    };

    const districts =
      view.renderDistrictTabs(
        model
      );

    const filters =
      view.renderFilterBar(
        model
      );

    const card =
      view.renderPropertyCard(
        model.properties[0],
        0
      );

    const html =
      districts +
      filters +
      card;

    const expected = [
      "热门商圈",
      "东门商圈",
      "面积",
      "可做餐饮",
      "动态房源",
      "临街旺铺",
      "建筑面积",
      "客流",
      "消费力",
      "竞争",
      "可排烟",
      "可议价",
      "签约首付",
      "查看详情"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `房源页面缺少：${text}`
      );
    }
  }
);
