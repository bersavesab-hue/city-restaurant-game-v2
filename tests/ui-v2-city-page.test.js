import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCityPageModel
} from "../src/ui-v2/pages/city/CityPageModel.js";

import {
  renderCityPage
} from "../src/ui-v2/pages/city/CityPage.js";

const districts = [
  {
    id: "cbd",
    name: "CBD商务区",
    mapPosition: {
      x: 48,
      y: 38
    },
    trafficIndex: 90,
    spendingPower: 86,
    competition: 84,
    deliveryDemand: 88,
    rentMultiplier: 1.55
  },
  {
    id: "university",
    name: "大学城",
    mapPosition: {
      x: 70,
      y: 20
    },
    trafficIndex: 82,
    spendingPower: 43,
    competition: 59,
    deliveryDemand: 92,
    rentMultiplier: .82
  }
];

const properties = [
  {
    id: "property_1",
    districtId: "cbd",
    status: "leased",
    monthlyRent: 22000,
    area: 100
  },
  {
    id: "property_2",
    districtId: "cbd",
    status: "available",
    monthlyRent: 18000,
    area: 100
  },
  {
    id: "property_3",
    districtId: "university",
    status: "available",
    monthlyRent: 9000,
    area: 90
  }
];

test(
  "城市页按真实数据生成五筛选与动态统计",
  () => {
    const model =
      buildCityPageModel({
        districts,
        properties,
        restaurants: [
          {
            id: "restaurant_1",
            locationId: "property_1"
          }
        ]
      });

    assert.equal(
      model.totalDistricts,
      2
    );

    assert.equal(
      model.openedDistricts,
      1
    );

    assert.deepEqual(
      model.filters.map(
        item =>
          item.id
      ),
      [
        "all",
        "opened",
        "available",
        "high-potential",
        "locked"
      ]
    );
  }
);

test(
  "城市正式页面保持一张地图主舞台一张详情Sheet和三个机会位",
  () => {
    const model =
      buildCityPageModel({
        districts,
        properties,
        restaurants: [
          {
            id: "restaurant_1",
            locationId: "property_1"
          }
        ]
      });

    const html =
      renderCityPage(
        model
      );

    assert.equal(
      (
        html.match(
          /data-ui="city-map"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        html.match(
          /data-ui="city-district-detail"/g
        ) ??
        []
      ).length,
      1
    );

    assert.match(
      html,
      /城市地图/
    );

    assert.match(
      html,
      /今日机会/
    );

    assert.match(
      html,
      /查看房源/
    );

    assert.doesNotMatch(
      html,
      /集团视角|1x|2x|4x/
    );
  }
);
