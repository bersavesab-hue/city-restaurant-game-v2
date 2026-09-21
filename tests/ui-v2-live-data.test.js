import test from "node:test";
import assert from "node:assert/strict";

import {
  formatCompactMoney,
  buildHudModel,
  buildCityModel
} from "../src/ui-v2/runtime/LiveUiModel.js";

test(
  "资金自动缩写避免HUD被大数字撑爆",
  () => {
    assert.equal(
      formatCompactMoney(
        52800
      ),
      "¥5.3万"
    );

    assert.equal(
      formatCompactMoney(
        528000
      ),
      "¥52.8万"
    );

    assert.equal(
      formatCompactMoney(
        152800000
      ),
      "¥1.53亿"
    );
  }
);

function createFakeApp() {
  const districts = [
    {
      id: "cbd",
      name: "CBD商务区",
      mapPosition: {
        x: 40,
        y: 30
      },
      trafficIndex: 90,
      rentMultiplier: 1.55,
      spendingPower: 86,
      competition: 84,
      deliveryDemand: 88
    },
    {
      id: "university",
      name: "大学城",
      mapPosition: {
        x: 60,
        y: 20
      },
      trafficIndex: 82,
      rentMultiplier: .82,
      spendingPower: 43,
      competition: 59,
      deliveryDemand: 92
    }
  ];

  const properties = [
    {
      id: "property_1",
      districtId: "cbd",
      name: "金融街铺位",
      area: 100,
      monthlyRent: 22000,
      status: "leased"
    },
    {
      id: "property_2",
      districtId: "university",
      name: "学府路铺位",
      area: 80,
      monthlyRent: 6400,
      status: "available"
    }
  ];

  const restaurants = [
    {
      id: "restaurant_1",
      name: "测试旗舰店",
      locationId: "property_1",
      status: "open",
      level: 8,
      reviewScore: 4.6,
      totalReviews: 100
    }
  ];

  const sections = {
    time: {
      day: 100,
      hour: 11,
      minute: 30
    },
    runtime: {
      paused: false,
      speed: 2
    },
    districtEvents: {
      active: [],
      recent: []
    }
  };

  return {
    core: {
      gameState: {
        getSection(
          name
        ) {
          return sections[
            name
          ];
        }
      },

      entitySystem: {
        list(
          type
        ) {
          return type ===
            "restaurant_chain"
            ? []
            : [];
        }
      }
    },

    systems: {
      restaurantSystem: {
        list() {
          return restaurants;
        }
      },

      financeSystem: {
        findAccount() {
          return {
            balance:
              1234567
          };
        }
      },

      businessCalendarSystem: {
        getCalendar() {
          return {
            year: 1,
            month: 4,
            dayOfMonth: 10,
            weekday:
              "星期三"
          };
        }
      },

      propertySystem: {
        list() {
          return properties;
        },

        get(
          id
        ) {
          return properties.find(
            item =>
              item.id ===
              id
          );
        }
      },

      districtSystem: {
        getAll() {
          return districts;
        },

        getOpportunityScore(
          district
        ) {
          return district.id ===
            "cbd"
            ? 70
            : 64;
        }
      },

      districtEventSystem: {
        getDefinition() {
          return null;
        }
      },

      chainSystem: {
        getRegionIdForDistrict(
          id
        ) {
          return id ===
            "cbd"
            ? "northwest"
            : "northeast";
        }
      }
    }
  };
}

test(
  "HUD读取真实门店时间资金等级与评分",
  () => {
    const app =
      createFakeApp();

    const model =
      buildHudModel(
        app
      );

    assert.equal(
      model.scopeTitle,
      "测试旗舰店"
    );

    assert.equal(
      model.date,
      "第1年 4月10日 周三"
    );

    assert.equal(
      model.time,
      "11:30"
    );

    assert.equal(
      model.moneyCompact,
      "¥123.5万"
    );

    assert.equal(
      model.level,
      "8"
    );

    assert.equal(
      model.rating,
      "4.6"
    );
  }
);

test(
  "城市筛选与今日机会由游戏状态实时计算",
  () => {
    const app =
      createFakeApp();

    const model =
      buildCityModel(
        app,
        "cbd"
      );

    assert.equal(
      model.counts.all,
      2
    );

    assert.equal(
      model.counts.opened,
      1
    );

    assert.equal(
      model.counts.available,
      1
    );

    assert.equal(
      model.counts.highPotential,
      1
    );

    assert.equal(
      model.counts.locked,
      0
    );

    assert.equal(
      model.selected.name,
      "CBD商务区"
    );

    assert.equal(
      model.opportunities[0].title,
      "学府路铺位"
    );

    assert.equal(
      model.opportunities.length,
      1
    );
  }
);
