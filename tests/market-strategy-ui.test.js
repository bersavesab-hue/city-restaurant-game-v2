import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  MarketStrategyPageSystem
} from "../src/ui/pages/market-strategy/MarketStrategyPageSystem.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";


function fixture() {
  let selected = null;
  let started = null;

  const system =
    new MarketStrategyPageSystem({
      restaurant: {
        get() {
          return {
            id: "restaurant_a",
            name: "市场测试店",
            reputation: 60
          };
        }
      },

      finance: {
        getBalance() {
          return 50000;
        }
      },

      positioning: {
        getAvailable() {
          return [
            {
              id: "quick_service",
              name: "快餐便餐",
              targetSegments: {
                office_worker: 1.3
              },
              priceRange: [
                0.75,
                1.05
              ]
            },
            {
              id: "family_dining",
              name: "家庭正餐",
              targetSegments: {
                resident: 1.3
              },
              priceRange: [
                0.9,
                1.25
              ]
            }
          ];
        },

        getCategoryFit(
          restaurantId,
          definition
        ) {
          return definition.id ===
            "quick_service"
            ? 1.1
            : 0.9;
        },

        getPriceFit() {
          return 1;
        },

        getDistrictFit(
          restaurantId,
          definition
        ) {
          return definition.id ===
            "quick_service"
            ? 1.2
            : 0.95;
        },

        getAnalysis() {
          return {
            positioningId: selected,
            positioningName:
              selected ??
              "未设定",
            fitScore:
              selected
                ? 108
                : 100
          };
        },

        setPositioning(
          restaurantId,
          id
        ) {
          selected = id;
          return {
            positioningId: id
          };
        },

        clearPositioning() {
          selected = null;
          return {
            positioningId: null
          };
        }
      },

      actions: {
        getStatus() {
          return {
            active: [],
            modifiers: {
              demandMultiplier: 1
            },
            available: [
              {
                id: "local_ads",
                name: "本地广告",
                cost: 2000,
                durationDays: 5,
                modifiers: {
                  demandMultiplier: 1.12
                }
              }
            ]
          };
        },

        startAction(
          restaurantId,
          id
        ) {
          started = id;
          return {
            type: id
          };
        }
      },

      insight: {
        getSummary() {
          return {
            marketShare: 32.5,
            change: 3.1,
            competitorCount: 2,
            competitionFactor: 90,
            alert: "gaining_share",
            history: []
          };
        }
      },

      competition: {
        getDistrictSnapshot() {
          return {
            competitorCount: 2,
            competitors: [
              {
                id: "npc_1",
                name: "竞争店A",
                priceIndex: 1,
                qualityScore: 70,
                serviceScore: 68,
                reputation: 66,
                strategy: "balanced",
                healthScore: 75,
                ageDays: 80,
                active: true
              }
            ]
          };
        }
      },

      districtEvents: {
        getDistrictStatus() {
          return {
            active: [
              {
                type: "convention",
                startDay: 10,
                endDay: 12
              }
            ],
            recent: []
          };
        },

        getDefinition() {
          return {
            name: "附近展会"
          };
        }
      },

      traffic: {
        getDistrictForRestaurant() {
          return {
            id: "district_a",
            name: "中央商圈",
            competition: 70,
            traffic: 80,
            spendingPower: 75
          };
        }
      }
    });

  return {
    system,
    selected() {
      return selected;
    },
    started() {
      return started;
    }
  };
}


test("市场页汇总定位竞争事件和营销动作", () => {
  const item = fixture();
  const page =
    item.system.getPage(
      "restaurant_a"
    );

  assert.equal(
    page.pageId,
    "market-strategy"
  );

  assert.equal(
    page.district.name,
    "中央商圈"
  );

  assert.equal(
    page.insight.marketShare,
    32.5
  );

  assert.equal(
    page.competition.competitorCount,
    2
  );

  assert.equal(
    page.events.active[0].name,
    "附近展会"
  );

  assert.equal(
    page.positioningOptions.length,
    2
  );

  assert.equal(
    page.actions.available[0].canStart,
    true
  );
});


test("市场页可以修改定位和启动市场动作", () => {
  const item = fixture();

  item.system.setPositioning(
    "restaurant_a",
    "quick_service"
  );

  assert.equal(
    item.selected(),
    "quick_service"
  );

  item.system.startMarketAction(
    "restaurant_a",
    "local_ads"
  );

  assert.equal(
    item.started(),
    "local_ads"
  );
});


test("市场页已接正式运行时和经营入口", () => {
  assert.equal(
    formalPageRuntime.has(
      "market-strategy"
    ),
    true
  );

  const source =
    fs.readFileSync(
      new URL(
        "../src/ui/pages/operations-hub/OperationsHubPageSystem.js",
        import.meta.url
      ),
      "utf8"
    );

  assert.match(
    source,
    /market-strategy/
  );
});
