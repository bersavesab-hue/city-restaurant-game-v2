import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  formatCompactMoney,
  buildHudModel,
  buildCityModel
} from "../src/ui-v2/runtime/LiveUiModel.js";

import {
  districtMatchesFilter,
  resolveDistrictSelectionForFilter
} from "../src/ui-v2/runtime/LiveUiBinding.js";

import {
  createSimulationClock
} from "../src/runtime/SimulationClock.js";

test(
  "资金自动缩写避免HUD被大数字撑爆",
  () => {
    assert.equal(
      formatCompactMoney(
        52800
      ),
      "¥52,800"
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


test(
  "城市筛选会把详情选择切换到首个可见商圈",
  () => {
    const districts = [
      {
        id: "opened",
        opened: true,
        unlocked: true,
        availablePropertyCount: 0,
        opportunityScore: 72
      },
      {
        id: "available",
        opened: false,
        unlocked: true,
        availablePropertyCount: 3,
        opportunityScore: 60
      },
      {
        id: "locked",
        opened: false,
        unlocked: false,
        availablePropertyCount: 0,
        opportunityScore: 80
      }
    ];

    assert.equal(
      districtMatchesFilter(
        districts[1],
        "available"
      ),
      true
    );

    assert.equal(
      resolveDistrictSelectionForFilter(
        districts,
        "opened",
        "available"
      ),
      "available"
    );

    assert.equal(
      resolveDistrictSelectionForFilter(
        districts,
        "available",
        "locked"
      ),
      "locked"
    );

    assert.equal(
      resolveDistrictSelectionForFilter(
        districts,
        "available",
        "all"
      ),
      "available"
    );
  }
);


test(
  "实时模拟时钟按1x/2x/4x连续推进游戏分钟",
  () => {
    let nowMs = 0;
    let callback = null;
    let runtime = {
      paused: false,
      speed: 4
    };
    let advanced = 0;

    const app = {
      core: {
        gameState: {
          getSection(
            section
          ) {
            return section ===
              "runtime"
              ? {
                  ...runtime
                }
              : null;
          }
        },
        simulationSystem: {
          advance(minutes) {
            advanced +=
              minutes;
          }
        }
      }
    };

    const clock =
      createSimulationClock(
        app,
        {
          now: () =>
            nowMs,

          setIntervalFn(
            handler
          ) {
            callback =
              handler;

            return 1;
          },

          clearIntervalFn() {
            callback =
              null;
          }
        }
      );

    assert.equal(
      clock.start(),
      true
    );

    nowMs = 250;
    callback();

    assert.equal(
      advanced,
      2
    );

    nowMs = 500;
    callback();

    assert.equal(
      advanced,
      4
    );

    runtime = {
      paused: true,
      speed: 4
    };

    nowMs = 750;
    callback();

    assert.equal(
      advanced,
      4
    );

    runtime = {
      paused: false,
      speed: 1
    };

    nowMs = 1000;
    callback();

    assert.equal(
      advanced,
      4
    );

    nowMs = 1750;
    callback();

    assert.equal(
      advanced,
      6
    );

    assert.equal(
      clock.stop(),
      true
    );
  }
);


test("城市页使用固态地图与双字指标标签", () => {
  const modelSource = fs.readFileSync(
    "src/ui-v2/runtime/LiveUiModel.js",
    "utf8"
  );
  const frameSource = fs.readFileSync(
    "src/ui-v2/pages/city/CityFrame.js",
    "utf8"
  );
  const bindingSource = fs.readFileSync(
    "src/ui-v2/runtime/LiveUiBinding.js",
    "utf8"
  );

  for (const label of ["客流","消费","租金","竞争","外卖","房源"]) {
    assert.match(
      modelSource,
      new RegExp('"' + label + '"')
    );
    assert.match(
      frameSource,
      new RegExp('"' + label + '"')
    );
  }

  assert.doesNotMatch(
    frameSource,
    /data-city-map-action=/
  );
  assert.doesNotMatch(
    frameSource,
    /close-detail/
  );
  assert.doesNotMatch(
    bindingSource,
    /mapScale|mapPanX|mapPanY|ResizeObserver/
  );
});
