import test from "node:test";
import assert from "node:assert/strict";

import {
  CityMapView
} from "../src/ui/pages/city/CityMapView.js";


test(
  "城市一级页使用确认版地图结构且业务数量全部动态",
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

        brandName:
          "集团视角",

        balance:
          100000,

        storeLevel:
          2,

        reputation:
          60,

        rating:
          4.5,

        scope: {
          type:
            "group",

          canSwitch:
            false,

          stores:
            []
        },

        actions: {
          speeds: [
            1,
            2,
            4
          ]
        },

        clock: {
          dateText:
            "第1年 4月10日 周三",

          clockText:
            "10:30",

          speed:
            1,

          speedOptions: [
            1,
            2,
            4
          ]
        }
      },

      citySummary: {
        districtCount:
          2,

        propertyCount:
          8,

        averageTraffic:
          72,

        averageSpending:
          68,

        averageCompetition:
          57
      },

      filterCounts: {
        all:
          2,

        opened:
          1,

        available:
          2,

        potential:
          1,

        locked:
          0
      },

      map: {
        selectedDistrictId:
          "d1",

        totalDistrictCount:
          2,

        totalAreaCount:
          4,

        areas: [
          {
            id: "core",
            name: "核心城区",
            districtCount: 1
          },
          {
            id: "innovation",
            name: "新城科教区",
            districtCount: 1
          },
          {
            id: "culture",
            name: "生活文旅区",
            districtCount: 0
          },
          {
            id: "waterfront",
            name: "滨水休闲区",
            districtCount: 0
          }
        ],

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

            deliveryDemand:
              78,

            propertyCount:
              4,

            averageRent:
              18000,

            hasOpenStore:
              true,

            highPotential:
              true,

            locked:
              false,

            position: {
              x:
                35,

              y:
                40
            },

            areaId:
              "core",

            areaDistrictCount:
              1
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

            deliveryDemand:
              60,

            propertyCount:
              4,

            averageRent:
              13000,

            hasOpenStore:
              false,

            highPotential:
              false,

            locked:
              false,

            position: {
              x:
                70,

              y:
                35
            },

            areaId:
              "innovation",

            areaDistrictCount:
              1
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

        deliveryDemand:
          78,

        propertyCount:
          4,

        averageRent:
          18000,

        averageRentPerSquareMetre:
          220,

        hasOpenStore:
          true,

        highPotential:
          true,

        locked:
          false
      },

      opportunities: [
        {
          id:
            "p1",

          name:
            "东门临街旺铺",

          districtId:
            "d1",

          districtName:
            "东门商圈",

          area:
            180,

          monthlyRent:
            18000,

          qualityScore:
            88,

          affordable:
            true,

          tag:
            "高潜力"
        }
      ]
    };

    const html =
      view.renderMarkup(
        page
      );

    for (
      const text
      of [
        "城市地图",
        "4 大区域",
        "全部 (2)",
        "已开店 (1)",
        "可选址 (2)",
        "高潜力 (1)",
        "待解锁 (0)",
        "城市发展地图",
        "东门商圈",
        "大学城商圈",
        "客流量",
        "消费力",
        "平均租金",
        "竞争度",
        "外卖需求",
        "可租房源",
        "今日机会 (1)",
        "查看房源",
        "城市",
        "门店",
        "经营",
        "员工",
        "更多"
      ]
    ) {
      assert.equal(
        html.includes(
          text
        ),
        true,
        "城市确认版主页缺少：" +
        text
      );
    }



    assert.equal(
      (
        html.match(
          /class="city-map-region city-map-region--/g
        ) ??
        []
      ).length,
      4,
      "城市地图必须保持四个宏观区域层"
    );


    for (
      const detailText
      of [
        "×",
        "¥220/㎡/月",
        "城市核心商圈，客流稳定，消费能力强，适合品牌扩张。"
      ]
    ) {
      assert.equal(
        html.includes(
          detailText
        ),
        true,
        "商圈详情确认版缺少：" +
        detailText
      );
    }


    assert.equal(
      view.handleClick
        .toString()
        .includes(
          "this.refresh()"
        ),
      false,
      "城市商圈点击不得再次触发整页refresh"
    );

    assert.equal(
      (
        html.match(
          /class="rg-bottom-nav"/g
        ) ??
        []
      ).length,
      1,
      "城市一级页只能渲染一个正式底部导航"
    );

    assert.ok(
      html.includes(
        'class="city-map-artwork city-image-slot--map"'
      )
    );

    assert.equal(
      html.includes(
        "城市小贴士"
      ),
      false
    );

    assert.equal(
      html.includes(
        "商圈地图"
      ),
      false
    );

    assert.ok(
      html.includes(
        'data-district-id="d1"'
      )
    );
  }
);
