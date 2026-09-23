import test from "node:test";
import assert from "node:assert/strict";

import {
  buildHomeDashboardModel
} from "../src/ui/HomeDashboardModel.js";

test(
  "home dashboard stays single-store and derives live headline data",
  () => {
    const app = {
      core: {
        gameState: {
          getSection() {
            return {
              day: 4,
              hour: 12,
              minute: 30
            };
          }
        },

        entitySystem: {
          get(type, id) {
            if (
              type === "property" &&
              id === "p1"
            ) {
              return {
                id: "p1",
                districtId: "d1"
              };
            }

            return null;
          },

          list(type) {
            if (type === "order") {
              return [
                {
                  restaurantId: "r1",
                  day: 4
                },
                {
                  restaurantId: "r1",
                  day: 4
                }
              ];
            }

            return [];
          }
        }
      },

      systems: {
        restaurantSystem: {
          list() {
            return [
              {
                id: "r1",
                name: "测试小馆",
                locationId: "p1",
                status: "open",
                level: 2,
                customerSatisfaction: 82,
                reputation: 35,
                reviewScore: 4.3,
                totalReviews: 28,
                totalServedGuests: 168
              }
            ];
          }
        },

        financeSystem: {
          getBalance() {
            return 68000;
          },

          getTransactions() {
            return [
              {
                day: 4,
                transactionType: "income",
                amount: 3600
              },
              {
                day: 4,
                transactionType: "expense",
                amount: 900
              }
            ];
          }
        },

        employeeSystem: {
          listByRestaurant() {
            return [
              {
                name: "张师傅",
                roleId: "chef"
              },
              {
                name: "小周",
                roleId: "server"
              },
              {
                name: "小林",
                roleId: "cashier"
              }
            ];
          }
        },

        storeProgressSystem: {
          getProgress() {
            return {
              level: 2,
              title: "稳定经营",
              progress: 0.5,
              maxLevel: false,
              nextLevel: 3,
              nextTitle: "商圈新秀",
              remainingExperience: 500
            };
          }
        },

        menuSystem: {
          listByRestaurant() {
            return [
              {
                id: "m1"
              },
              {
                id: "m2"
              }
            ];
          }
        },

        renovationSystem: {
          getSummary() {
            return {
              itemCount: 8
            };
          }
        },

        districtSystem: {
          get(id) {
            assert.equal(id, "d1");

            return {
              id: "d1",
              name: "大学城",
              trafficIndex: 82,
              spendingPower: 68,
              competition: 57,
              deliveryDemand: 76,
              rentMultiplier: 1.1,
              customerMix: {
                student: 48,
                young_professional: 12
              }
            };
          },

          getOpportunityScore() {
            return 71;
          }
        }
      }
    };

    const model =
      buildHomeDashboardModel(
        app
      );

    assert.equal(
      model.restaurant.name,
      "测试小馆"
    );

    assert.equal(
      model.money.todayRevenue,
      3600
    );

    assert.equal(
      model.money.todayProfit,
      2700
    );

    assert.equal(
      model.operations.todayOrders,
      2
    );

    assert.match(
      model.opportunity.title,
      /商圈动态：大学城/
    );

    assert.equal(
      model.opportunity.tags[3],
      "学生/年轻人"
    );

    assert.equal(
      model.money.revenueTrend,
      100
    );

    assert.deepEqual(
      model.district,
      {
        id: "d1",
        name: "大学城",
        trafficIndex: 82,
        spendingPower: 68,
        competition: 57,
        deliveryDemand: 76,
        rentMultiplier: 1.1,
        mainCustomer: "学生/年轻人",
        opportunityScore: 71
      }
    );
  }
);
