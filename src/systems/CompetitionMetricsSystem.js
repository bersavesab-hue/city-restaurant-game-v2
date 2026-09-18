import {
  gameState
} from "../core/GameState.js";

import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  employeeSystem
} from "./EmployeeSystem.js";

import {
  operatingReportSystem
} from "./OperatingReportSystem.js";

import {
  marketRankingSystem
} from "./MarketRankingSystem.js";

import {
  marketCompetitionSystem
} from "./MarketCompetitionSystem.js";

import {
  trafficDemandSystem
} from "./TrafficDemandSystem.js";

import {
  restaurantDishSystem
} from "./RestaurantDishSystem.js";


function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function round1(
  value
) {
  return Math.round(
    value * 10
  ) / 10;
}


class CompetitionMetricsSystem {
  getCurrentDay() {
    return gameState
      .getSection(
        "time"
      )
      .day;
  }


  getRange(
    period,
    endDay =
      this.getCurrentDay()
  ) {
    const length = {
      day: 1,
      week: 7,
      month: 30,
      monthly: 30,
      quarter: 90,
      quarterly: 90,
      year: 360,
      annual: 360,
      all: Number.MAX_SAFE_INTEGER
    }[period];


    if (!length) {
      throw new Error(
        `Unknown ranking period "${period}"`
      );
    }


    return {
      period,

      startDay:
        period === "all"
          ? 1
          : Math.max(
              1,
              endDay -
              length +
              1
            ),

      endDay
    };
  }


  getSettlements(
    restaurantId,
    range
  ) {
    return entitySystem
      .filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >=
            range.startDay &&
          item.day <=
            range.endDay
      );
  }


  getRestaurantPeriodMetrics(
    restaurantId,
    period = "month",
    endDay =
      this.getCurrentDay()
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const range =
      this.getRange(
        period,
        endDay
      );

    const settlements =
      this.getSettlements(
        restaurantId,
        range
      );

    const finance =
      settlements.reduce(
        (
          summary,
          item
        ) => {
          summary.days += 1;
          summary.orders +=
            item.orders ?? 0;
          summary.revenue +=
            item.revenue ?? 0;
          summary.ingredientCost +=
            item.ingredientCost ?? 0;
          summary.payroll +=
            item.payrollDue ??
            item.payroll ??
            0;
          summary.profit +=
            item.operatingProfit ??
            0;
          summary.experienceGained +=
            item.experienceGained ??
            0;

          return summary;
        },
        {
          days: 0,
          orders: 0,
          revenue: 0,
          ingredientCost: 0,
          payroll: 0,
          profit: 0,
          experienceGained: 0
        }
      );


    const profitMargin =
      finance.revenue > 0
        ? round1(
            finance.profit /
            finance.revenue *
            100
          )
        : 0;


    const ingredientCostRate =
      finance.revenue > 0
        ? round1(
            finance.ingredientCost /
            finance.revenue *
            100
          )
        : 100;


    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );


    const activeEmployees =
      employees.filter(
        item =>
          item.status !==
          "fired"
      );


    const average =
      (
        key,
        fallback = 0
      ) => {
        if (
          activeEmployees.length ===
          0
        ) {
          return fallback;
        }


        return (
          activeEmployees.reduce(
            (
              sum,
              employee
            ) =>
              sum +
              (
                employee[key] ??
                fallback
              ),
            0
          ) /
          activeEmployees.length
        );
      };


    const averageLoyalty =
      average(
        "loyalty",
        50
      );

    const averageMood =
      average(
        "mood",
        70
      );

    const averageFatigue =
      average(
        "fatigue",
        0
      );


    const teamScore =
      round1(
        clamp(
          averageLoyalty *
            0.4 +
          averageMood *
            0.35 +
          (
            100 -
            averageFatigue
          ) *
            0.25,
          0,
          100
        )
      );


    const customerScore =
      round1(
        clamp(
          (
            restaurant
              .customerSatisfaction ??
            50
          ) *
            0.45 +
          (
            (
              restaurant
                .reviewScore ??
              3
            ) *
            20
          ) *
            0.35 +
          (
            restaurant
              .repeatRate ??
            0
          ) *
            0.2,
          0,
          100
        )
      );


    return {
      id:
        restaurant.id,

      type:
        "player",

      subjectType:
        "restaurant",

      isPlayer:
        true,

      restaurantId:
        restaurant.id,

      name:
        restaurant.name,

      range,

      operatingDays:
        restaurant
          .totalOperatingDays ??
        0,

      ageDays:
        Math.max(
          1,
          Math.floor(
            (
              (
                gameState
                  .getSection(
                    "time"
                  )
                  .totalMinutes
              ) -
              (
                restaurant
                  .createdAt ??
                0
              )
            ) /
            1440
          ) +
          1
        ),

      orders:
        finance.orders,

      revenue:
        finance.revenue,

      profit:
        finance.profit,

      profitMargin,

      ingredientCostRate,

      costEfficiency:
        clamp(
          100 -
          ingredientCostRate,
          0,
          100
        ),

      experienceGained:
        finance.experienceGained,

      reputation:
        restaurant.reputation ??
        0,

      reviewScore:
        restaurant.reviewScore ??
        3,

      reputationScore:
        round1(
          clamp(
            (
              restaurant.reputation ??
              0
            ) *
              0.55 +
            (
              (
                restaurant.reviewScore ??
                3
              ) *
              20
            ) *
              0.45,
            0,
            100
          )
        ),

      customerSatisfaction:
        restaurant
          .customerSatisfaction ??
        50,

      repeatRate:
        restaurant.repeatRate ??
        0,

      customerScore,

      serviceScore:
        clamp(
          restaurant
            .customerSatisfaction ??
          50,
          0,
          100
        ),

      qualityScore:
        clamp(
          (
            restaurant
              .reviewScore ??
            3
          ) *
          20,
          0,
          100
        ),

      teamScore,

      employeeCount:
        activeEmployees.length,

      averageLoyalty:
        round1(
          averageLoyalty
        ),

      averageMood:
        round1(
          averageMood
        ),

      averageFatigue:
        round1(
          averageFatigue
        )
    };
  }


  getDistrictRestaurantCandidates(
    restaurantId,
    period = "month",
    endDay =
      this.getCurrentDay()
  ) {
    const base =
      this.getRestaurantPeriodMetrics(
        restaurantId,
        period,
        endDay
      );

    const market =
      marketRankingSystem
        .getDistrictRanking(
          restaurantId
        );


    return market.ranking
      .map(
        item => {
          if (
            item.isPlayer
          ) {
            const competitiveScore =
              round1(
                clamp(
                  (
                    item.marketShare ??
                    0
                  ) *
                    0.3 +
                  base
                    .reputationScore *
                    0.25 +
                  base
                    .serviceScore *
                    0.2 +
                  base
                    .qualityScore *
                    0.25,
                  0,
                  100
                )
              );


            return {
              ...base,

              marketShare:
                item.marketShare ??
                0,

              districtId:
                market.districtId,

              districtName:
                market.districtName,

              competitiveScore,

              brandScore:
                round1(
                  base
                    .reputationScore *
                    0.4 +
                  base
                    .serviceScore *
                    0.3 +
                  base
                    .qualityScore *
                    0.3
                ),

              legendScore:
                round1(
                  competitiveScore *
                    0.7 +
                  clamp(
                    base.operatingDays /
                    3.6,
                    0,
                    100
                  ) *
                    0.3
                )
            };
          }


          const serviceScore =
            clamp(
              item.serviceScore ??
              60,
              0,
              100
            );

          const qualityScore =
            clamp(
              item.qualityScore ??
              60,
              0,
              100
            );

          const reputation =
            clamp(
              item.reputation ??
              50,
              0,
              100
            );

          const marketShare =
            item.marketShare ??
            0;

          const competitiveScore =
            round1(
              marketShare *
                0.3 +
              reputation *
                0.25 +
              serviceScore *
                0.2 +
              qualityScore *
                0.25
            );


          return {
            id:
              item.id,

            type:
              "competitor",

            subjectType:
              "restaurant",

            isPlayer:
              false,

            restaurantId:
              null,

            name:
              item.name,

            districtId:
              market.districtId,

            districtName:
              market.districtName,

            marketShare,

            reputation,

            reputationScore:
              reputation,

            serviceScore,

            qualityScore,

            customerScore:
              round1(
                reputation *
                  0.45 +
                serviceScore *
                  0.3 +
                qualityScore *
                  0.25
              ),

            brandScore:
              round1(
                reputation *
                  0.4 +
                serviceScore *
                  0.3 +
                qualityScore *
                  0.3
              ),

            competitiveScore,

            legendScore:
              round1(
                competitiveScore *
                  0.8 +
                clamp(
                  (
                    item.ageDays ??
                    0
                  ) /
                  3.6,
                  0,
                  100
                ) *
                  0.2
              ),

            operatingDays:
              item.ageDays ??
              0,

            ageDays:
              item.ageDays ??
              0,

            orders: 0,
            revenue: 0,
            profit: 0,
            profitMargin: 0,
            repeatRate: 0,
            experienceGained: 0,
            costEfficiency: 0,
            teamScore: 0
          };
        }
      );
  }


  getCityRestaurantCandidates(
    restaurantId,
    period = "month",
    endDay =
      this.getCurrentDay()
  ) {
    const players =
      restaurantSystem
        .list()
        .map(
          item => {
            const base =
              this
                .getRestaurantPeriodMetrics(
                  item.id,
                  period,
                  endDay
                );


            return {
              ...base,

              brandScore:
                round1(
                  base
                    .reputationScore *
                    0.4 +
                  base
                    .serviceScore *
                    0.3 +
                  base
                    .qualityScore *
                    0.3
                ),

              competitiveScore:
                round1(
                  base.customerScore *
                    0.35 +
                  base
                    .reputationScore *
                    0.3 +
                  base
                    .serviceScore *
                    0.15 +
                  base
                    .qualityScore *
                    0.2
                ),

              legendScore:
                round1(
                  base
                    .reputationScore *
                    0.35 +
                  base
                    .serviceScore *
                    0.2 +
                  base
                    .qualityScore *
                    0.2 +
                  clamp(
                    base.operatingDays /
                    3.6,
                    0,
                    100
                  ) *
                    0.25
                )
            };
          }
        );


    // 确保玩家所在商圈生成竞争店。
    try {
      const district =
        trafficDemandSystem
          .getDistrictForRestaurant(
            restaurantId
          );

      if (district) {
        marketCompetitionSystem
          .ensureDistrict(
            district.id
          );
      }
    } catch {
      // 尚未选址时不生成竞争店。
    }


    const competitors =
      entitySystem
        .filter(
          "competitor_store",
          item =>
            item.active !==
            false
        )
        .map(
          item => {
            const reputation =
              clamp(
                item.reputation ??
                50,
                0,
                100
              );

            const serviceScore =
              clamp(
                item.serviceScore ??
                60,
                0,
                100
              );

            const qualityScore =
              clamp(
                item.qualityScore ??
                60,
                0,
                100
              );

            const brandScore =
              round1(
                reputation *
                  0.4 +
                serviceScore *
                  0.3 +
                qualityScore *
                  0.3
              );


            return {
              id:
                item.id,

              type:
                "competitor",

              subjectType:
                "restaurant",

              isPlayer:
                false,

              restaurantId:
                null,

              name:
                item.name,

              districtId:
                item.districtId,

              reputation,

              reputationScore:
                reputation,

              serviceScore,

              qualityScore,

              customerScore:
                round1(
                  reputation *
                    0.45 +
                  serviceScore *
                    0.3 +
                  qualityScore *
                    0.25
                ),

              brandScore,

              competitiveScore:
                brandScore,

              legendScore:
                round1(
                  brandScore *
                    0.75 +
                  clamp(
                    (
                      item.ageDays ??
                      0
                    ) /
                    3.6,
                    0,
                    100
                  ) *
                    0.25
                ),

              operatingDays:
                item.ageDays ??
                0,

              ageDays:
                item.ageDays ??
                0,

              orders: 0,
              revenue: 0,
              profit: 0,
              profitMargin: 0,
              repeatRate: 0,
              experienceGained: 0,
              costEfficiency: 0,
              teamScore: 0
            };
          }
        );


    return [
      ...players,
      ...competitors
    ];
  }


  getPlayerRestaurantCandidates(
    period = "month",
    endDay =
      this.getCurrentDay()
  ) {
    return restaurantSystem
      .list()
      .map(
        item =>
          this
            .getRestaurantPeriodMetrics(
              item.id,
              period,
              endDay
            )
      );
  }


  getDishCandidates(
    restaurantId,
    period = "month",
    endDay =
      this.getCurrentDay()
  ) {
    const range =
      this.getRange(
        period,
        endDay
      );

    const contributions =
      operatingReportSystem
        .getMenuContribution(
          restaurantId,
          range.startDay,
          range.endDay
        );


    return contributions.map(
      item => {
        const custom =
          entitySystem.get(
            "custom_dish",
            item.dishId
          );

        const progress =
          restaurantDishSystem.get(
            restaurantId,
            item.dishId
          );

        const ageDays =
          custom?.createdDay
            ? Math.max(
                1,
                endDay -
                custom.createdDay +
                1
              )
            : Number.MAX_SAFE_INTEGER;

        const marginScore =
          round1(
            item.marginRate *
              0.55 +
            Math.min(
              100,
              item.quantity
            ) *
              0.45
          );

        const signatureScore =
          round1(
            Math.min(
              100,
              item.quantity
            ) *
              0.25 +
            Math.min(
              100,
              item.revenue /
              50
            ) *
              0.2 +
            Math.min(
              100,
              item.contributionProfit /
              30
            ) *
              0.25 +
            item.averageQuality *
              0.3
          );

        const innovationScore =
          custom
            ? round1(
                (
                  progress
                    ?.qualityScore ??
                  custom.qualityScore ??
                  item.averageQuality
                ) *
                  0.45 +
                Math.min(
                  100,
                  item.quantity
                ) *
                  0.2 +
                Math.min(
                  100,
                  (
                    progress
                      ?.masteryLevel ??
                    1
                  ) *
                  12
                ) *
                  0.15 +
                Math.min(
                  100,
                  (
                    progress
                      ?.successfulImprovements ??
                    0
                  ) *
                  20
                ) *
                  0.1 +
                Math.max(
                  0,
                  100 -
                  ageDays
                ) *
                  0.1
              )
            : 0;


        return {
          ...item,

          id:
            item.dishId,

          subjectType:
            "dish",

          isPlayer:
            true,

          restaurantId,

          custom:
            Boolean(custom),

          ageDays,

          qualityScore:
            progress
              ?.qualityScore ??
            item.averageQuality,

          masteryLevel:
            progress
              ?.masteryLevel ??
            1,

          improvementCount:
            progress
              ?.successfulImprovements ??
            0,

          marginScore,
          signatureScore,
          innovationScore
        };
      }
    );
  }


  getEmployeeCandidates(
    restaurantId
  ) {
    return employeeSystem
      .listByRestaurant(
        restaurantId
      )
      .filter(
        employee =>
          employee.status !==
          "fired"
      )
      .map(
        employee => {
          const role =
            employeeSystem.getRole(
              employee.roleId
            );

          const primarySkill =
            employee.skills
              ?.[
                role.primarySkill
              ] ??
            0;

          const totalSkills =
            Object.values(
              employee.skills ??
              {}
            );

          const averageSkill =
            totalSkills.length
              ? (
                  totalSkills
                    .reduce(
                      (
                        sum,
                        value
                      ) =>
                        sum +
                        value,
                      0
                    ) /
                  totalSkills.length
                )
              : primarySkill;

          const workScore =
            clamp(
              (
                employee
                  .totalWorkMinutes ??
                0
              ) /
              60,
              0,
              100
            );

          const stateScore =
            clamp(
              (
                employee.mood ??
                70
              ) *
                0.45 +
              (
                employee.loyalty ??
                50
              ) *
                0.4 +
              (
                100 -
                (
                  employee.fatigue ??
                  0
                )
              ) *
                0.15,
              0,
              100
            );

          const craftScore =
            round1(
              primarySkill *
                0.55 +
              averageSkill *
                0.15 +
              workScore *
                0.15 +
              stateScore *
                0.15
            );

          const serviceScore =
            round1(
              primarySkill *
                0.45 +
              averageSkill *
                0.15 +
              workScore *
                0.15 +
              stateScore *
                0.25
            );

          const leadershipScore =
            round1(
              averageSkill *
                0.3 +
              (
                employee.loyalty ??
                50
              ) *
                0.25 +
              (
                employee.mood ??
                70
              ) *
                0.15 +
              workScore *
                0.15 +
              Math.min(
                100,
                (
                  employee
                    .promotionCount ??
                  0
                ) *
                25
              ) *
                0.15
            );

          const growthScore =
            round1(
              Math.min(
                100,
                (
                  employee
                    .experience ??
                  0
                ) /
                50
              ) *
                0.35 +
              Math.min(
                100,
                (
                  employee
                    .trainingCount ??
                  0
                ) *
                20
              ) *
                0.3 +
              Math.min(
                100,
                (
                  employee
                    .promotionCount ??
                  0
                ) *
                35
              ) *
                0.2 +
              primarySkill *
                0.15
            );

          const loyaltyScore =
            round1(
              (
                employee.loyalty ??
                50
              ) *
                0.55 +
              workScore *
                0.25 +
              stateScore *
                0.2
            );


          return {
            id:
              employee.id,

            subjectType:
              "employee",

            isPlayer:
              true,

            restaurantId,

            name:
              employee.name,

            roleId:
              employee.roleId,

            roleName:
              role.name,

            primarySkill,

            averageSkill:
              round1(
                averageSkill
              ),

            totalWorkMinutes:
              employee
                .totalWorkMinutes ??
              0,

            experience:
              employee.experience ??
              0,

            trainingCount:
              employee.trainingCount ??
              0,

            promotionCount:
              employee
                .promotionCount ??
              0,

            mood:
              employee.mood ??
              70,

            loyalty:
              employee.loyalty ??
              50,

            fatigue:
              employee.fatigue ??
              0,

            craftScore,
            serviceScore,
            leadershipScore,
            growthScore,
            loyaltyScore
          };
        }
      );
  }
}


export const competitionMetricsSystem =
  new CompetitionMetricsSystem();


export {
  CompetitionMetricsSystem
};
