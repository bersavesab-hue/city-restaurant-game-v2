import test from "node:test";
import assert from "node:assert/strict";

import {
  PropertyDetailView
} from "../src/ui/pages/city/PropertyDetailView.js";


test(
  "正式房源详情包含媒体户型结构经营条件风险与租赁",
  () => {
    const root = {
      addEventListener() {},
      removeEventListener() {},
      contains() {
        return true;
      },
      innerHTML: ""
    };

    const view =
      new PropertyDetailView({
        root,
        restaurantId:
          "r1",

        propertyId:
          "p1",

        pageSystem: {}
      });

    view.floorId =
      "floor_1";

    const page = {
      topBar: {
        restaurantName:
          "东门小馆",

        balance:
          100000,

        storeLevel:
          2,

        reputation:
          60,

        weather: {
          label:
            "晴"
        },

        clock: {
          dateText:
            "4月10日",

          clockText:
            "10:30",

          paused:
            false,

          speed:
            1
        }
      },

      noticeTicker: {
        current:
          null,

        unreadCount:
          0
      },

      property: {
        id:
          "p1",

        name:
          "东门临街旺铺",

        districtName:
          "东门商圈",

        area:
          180,

        usableArea:
          160,

        floorCount:
          1,

        frontageMeters:
          8,

        ceilingHeight:
          3.6,

        parkingSpaces:
          3,

        qualityScore:
          88
      },

      media: {
        tabs: [
          {
            id:
              "exterior",

            label:
              "门头实拍",

            slot:
              "property-exterior-p1"
          },

          {
            id:
              "street",

            label:
              "街景",

            slot:
              "property-street-p1"
          },

          {
            id:
              "surroundings",

            label:
              "周边环境",

            slot:
              "property-surroundings-p1"
          },

          {
            id:
              "floorplan",

            label:
              "户型平面",

            slot:
              "property-floorplan-p1"
          }
        ]
      },

      floorTabs: [
        {
          id:
            "floor_1",

          label:
            "1F",

          usableArea:
            160
        }
      ],

      layout: {
        floors: [
          {
            id:
              "floor_1",

            label:
              "1F",

            width:
              12,

            height:
              8,

            polygon: [
              {
                x: 0,
                y: 0
              },

              {
                x: 12,
                y: 0
              },

              {
                x: 12,
                y: 8
              },

              {
                x: 0,
                y: 8
              }
            ],

            entrances: [],
            windows: [],
            columns: [],
            utilityPoints: []
          }
        ]
      },

      structures: {
        entrances:
          2,

        windows:
          4,

        columns:
          3,

        fixedStructures:
          1,

        utilityPoints:
          6,

        stairs:
          0,

        elevators:
          0
      },

      facilities: [
        {
          label:
            "餐饮许可",

          value:
            "允许",

          state:
            "good"
        },

        {
          label:
            "排烟许可",

          value:
            "允许",

          state:
            "good"
        },

        {
          label:
            "燃气点位",

          value:
            "1个",

          state:
            "good"
        },

        {
          label:
            "卫生间",

          value:
            "1处",

          state:
            "good"
        }
      ],

      assessment: {
        score:
          82,

        level:
          "优秀",

        traffic:
          85,

        spending:
          76,

        competition:
          63,

        rentPerSqm:
          112.5
      },

      risks: [
        {
          level:
            "warning",

          title:
            "商圈竞争较高",

          description:
            "当前竞争指数63/100。"
        }
      ],

      landlord: {
        name:
          "陈建国"
      },

      leaseTerms: {
        negotiable:
          true,

        minMonths:
          6,

        maxMonths:
          36,

        rentFreeMaxDays:
          7
      },

      quote: {
        months:
          12,

        monthlyRent:
          18000,

        askMonthlyRent:
          18000,

        deposit:
          36000,

        propertyFeeMonthly:
          1200,

        transferFee:
          0,

        rentFreeDays:
          0,

        upfront:
          55200,

        affordable:
          true
      },

      activeOffer:
        null,

      leaseState: {
        hasActiveLease:
          false,

        canSign:
          true
      }
    };

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "房源考察中心",
      "东门临街旺铺",
      "门头实拍",
      "街景",
      "周边环境",
      "户型平面",
      "建筑面积",
      "可用面积",
      "房屋结构",
      "出入口",
      "窗户",
      "柱体",
      "餐饮经营条件",
      "餐饮许可",
      "排烟许可",
      "燃气点位",
      "卫生间",
      "经营适配评估",
      "风险提示",
      "租期范围",
      "自主议价",
      "签约首付",
      "确认签约并进入装修"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `房源详情缺少：${text}`
      );
    }

    assert.ok(
      html.includes(
        'data-image-slot="property-exterior-p1"'
      )
    );

    assert.equal(
      html.includes(
        "图片槽位"
      ),
      false
    );

    assert.equal(
      html.includes(
        "户型装饰覆盖层槽位"
      ),
      false
    );

    assert.ok(
      html.includes(
        'data-page-target="properties"'
      )
    );
  }
);
