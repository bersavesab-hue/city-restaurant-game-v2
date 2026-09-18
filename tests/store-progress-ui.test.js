import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  StoreProgressPageSystem
} from "../src/ui/pages/progress/StoreProgressPageSystem.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";


test(
  "成长页展示当前等级经营上限和下一阶段解锁",
  () => {
    const system =
      new StoreProgressPageSystem({
        restaurant: {
          get() {
            return {
              id:
                "restaurant_a",

              name:
                "成长测试店",

              level:
                3,

              experience:
                2200
            };
          }
        },

        progress: {
          getProgress() {
            return {
              level:
                3,

              experience:
                2200,

              nextLevel:
                4,

              requiredExperience:
                3500,

              remainingExperience:
                1300,

              progress:
                0.35,

              maxLevel:
                false
            };
          },

          getUnlockedFeatures() {
            return [
              "employee_management",
              "menu_management",
              "basic_inventory",
              "supplier_management",
              "marketing"
            ];
          },

          getAllLevelConfigs() {
            return [
              {
                level:
                  3,

                requiredExperience:
                  1500,

                limits: {
                  employees:
                    8,

                  menuItems:
                    16,

                  tables:
                    10,

                  kitchenStations:
                    4
                },

                unlocks: [
                  "marketing"
                ]
              },

              {
                level:
                  4,

                requiredExperience:
                  3500,

                limits: {
                  employees:
                    10,

                  menuItems:
                    20,

                  tables:
                    14,

                  kitchenStations:
                    5
                },

                unlocks: [
                  "advanced_renovation"
                ]
              }
            ];
          },

          getLimits() {
            return {
              employees:
                8,

              menuItems:
                16,

              tables:
                10,

              kitchenStations:
                4
            };
          }
        }
      });


    const page =
      system.getPage(
        "restaurant_a"
      );


    assert.equal(
      page.pageId,
      "store-progress"
    );


    assert.equal(
      page.restaurant.level,
      3
    );


    assert.equal(
      page.progress.remainingExperience,
      1300
    );


    assert.equal(
      page.currentLimits.employees,
      8
    );


    assert.equal(
      page.next.unlockItems[0].name,
      "高级装修"
    );
  }
);


test(
  "成长页已经接入更多主页和正式运行时",
  () => {
    assert.equal(
      formalPageRuntime.has(
        "store-progress"
      ),
      true
    );


    const source =
      fs.readFileSync(
        new URL(
          "../src/ui/pages/more/MoreHubPageSystem.js",
          import.meta.url
        ),
        "utf8"
      );


    assert.match(
      source,
      /store-progress/
    );
  }
);
