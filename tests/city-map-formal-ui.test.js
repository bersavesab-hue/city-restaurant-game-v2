import test from "node:test";
import assert from "node:assert/strict";

import {
  CityMapView
} from "../src/ui/pages/city/CityMapView.js";


test(
  "城市正式主页包含地图槽位商圈针与房源入口",
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
      new CityMapView({
        root,
        restaurantId:
          "r_test",
        pageSystem: {}
      });

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

        clock: {
          dateText:
            "4月10日",

          clockText:
            "10:30"
        }
      },

      noticeTicker: {
        current: {
          type:
            "info",

          title:
            "城市市场",

          message:
            "当前共有8套可租房源"
        }
      },

      citySummary: {
        districtCount:
          3,

        propertyCount:
          8,

        averageTraffic:
          72,

        averageSpending:
          68,

        averageCompetition:
          57
      },

      map: {
        selectedDistrictId:
          "d1",

        districts: [
          {
            id:
              "d1",

            name:
              "东门商圈",

            trafficIndex:
              82,

            spendingPower:
              76,

            competition:
              61,

            propertyCount:
              4,

            averageRent:
              18000,

            customerMix: [
              {
                id:
                  "office",

                percent:
                  55
              },

              {
                id:
                  "family",

                percent:
                  45
              }
            ],

            recommendedPropertyId:
              "p1",

            recommendedPropertyName:
              "东门临街旺铺",

            position: {
              x:
                35,

              y:
                40
            }
          },

          {
            id:
              "d2",

            name:
              "大学城商圈",

            trafficIndex:
              75,

            spendingPower:
              58,

            competition:
              49,

            propertyCount:
              4,

            averageRent:
              13000,

            customerMix: [],

            position: {
              x:
                70,

              y:
                65
            }
          }
        ]
      },

      selectedDistrict: {
        id:
          "d1",

        name:
          "东门商圈",

        trafficIndex:
          82,

        spendingPower:
          76,

        competition:
          61,

        propertyCount:
          4,

        averageRent:
          18000,

        customerMix: [
          {
            id:
              "office",

            percent:
              55
          }
        ],

        recommendedPropertyId:
          "p1",

        recommendedPropertyName:
          "东门临街旺铺"
      },

      recommendedProperties: [
        {
          id:
            "p1",

          name:
            "东门临街旺铺",

          districtName:
            "东门商圈",

          area:
            180,

          monthlyRent:
            18000,

          qualityScore:
            88,

          trafficIndex:
            82,

          affordable:
            true,

          foodServiceAllowed:
            true,

          exhaustAllowed:
            true,

          imageSlot:
            "property-p1"
        }
      ],

      navigation: [
        {
          id:
            "city",

          title:
            "城市",

          active:
            true
        },

        {
          id:
            "restaurant",

          title:
            "门店",

          active:
            false
        },

        {
          id:
            "operations",

          title:
            "经营",

          active:
            false
        },

        {
          id:
            "employees",

          title:
            "员工",

          active:
            false
        },

        {
          id:
            "more",

          title:
            "更多",

          active:
            false
        }
      ]
    };

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "商圈与房源",
      "开放商圈",
      "可租房源",
      "城市地图底图",
      "东门商圈",
      "大学城商圈",
      "当前商圈",
      "客流",
      "消费力",
      "竞争",
      "客群结构",
      "快速筛选",
      "今日推荐房源",
      "东门临街旺铺",
      "查看房源详情",
      "城市",
      "门店",
      "经营",
      "员工",
      "更多"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `城市正式主页缺少：${text}`
      );
    }

    assert.ok(
      html.includes(
        'data-image-slot="city-main-map"'
      )
    );

    assert.ok(
      html.includes(
        'data-image-slot="property-p1"'
      )
    );

    assert.ok(
      html.includes(
        'data-district-id="d1"'
      )
    );
  }
);
