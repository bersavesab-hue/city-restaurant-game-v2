import {
  gameState
} from "../core/GameState.js";

import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  AWARD_DEFINITIONS,
  AWARD_DEFINITION_MAP,
  AWARD_PERIODS
} from "../data/awardDefinitions.js";

import {
  awardEvaluationSystem
} from "./AwardEvaluationSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  storeProgressSystem
} from "./StoreProgressSystem.js";

import {
  trafficDemandSystem
} from "./TrafficDemandSystem.js";


function runIdFor(
  period,
  periodIndex,
  awardId,
  scopeKey
) {
  return [
    "award",
    period,
    periodIndex,
    awardId,
    scopeKey
  ].join(":");
}


class AwardSystem {
  getPeriodInfo(
    period,
    endDay = null
  ) {
    const config =
      AWARD_PERIODS[
        period
      ];


    if (!config) {
      throw new Error(
        `Unknown award period "${period}"`
      );
    }


    const finalDay =
      endDay ??
      Math.max(
        1,
        gameState
          .getSection(
            "time"
          )
          .day -
        1
      );


    const periodIndex =
      Math.floor(
        (
          finalDay -
          1
        ) /
        config.days
      ) + 1;


    return {
      period,
      periodName:
        config.name,

      periodIndex,

      startDay:
        (
          periodIndex -
          1
        ) *
        config.days +
        1,

      endDay:
        periodIndex *
        config.days,

      days:
        config.days
    };
  }


  getCurrentProgress(
    period,
    currentDay = null
  ) {
    const config =
      AWARD_PERIODS[
        period
      ];


    if (!config) {
      throw new Error(
        `Unknown award period "${period}"`
      );
    }


    const day =
      currentDay ??
      gameState
        .getSection(
          "time"
        )
        .day;


    const dayInPeriod =
      (
        (
          day -
          1
        ) %
        config.days
      ) + 1;


    return {
      period,
      periodName:
        config.name,

      currentDay:
        day,

      dayInPeriod,

      totalDays:
        config.days,

      remainingDays:
        config.days -
        dayInPeriod,

      progress:
        Number(
          (
            dayInPeriod /
            config.days *
            100
          ).toFixed(
            1
          )
        )
    };
  }


  getScopeContexts(
    definition
  ) {
    const restaurants =
      restaurantSystem.list();


    if (
      restaurants.length ===
      0
    ) {
      return [];
    }


    if (
      definition.scope ===
        "restaurant"
    ) {
      return restaurants.map(
        restaurant => ({
          restaurantId:
            restaurant.id,

          scopeKey:
            `restaurant:${restaurant.id}`
        })
      );
    }


    if (
      definition.scope ===
        "district"
    ) {
      const map =
        new Map();


      for (
        const restaurant
        of restaurants
      ) {
        try {
          const district =
            trafficDemandSystem
              .getDistrictForRestaurant(
                restaurant.id
              );


          if (
            district &&
            !map.has(
              district.id
            )
          ) {
            map.set(
              district.id,
              {
                restaurantId:
                  restaurant.id,

                scopeKey:
                  `district:${district.id}`
              }
            );
          }
        } catch {
          // 尚未选址的门店不参加商圈奖项。
        }
      }


      return [
        ...map.values()
      ];
    }


    return [
      {
        restaurantId:
          restaurants[0].id,

        scopeKey:
          definition.scope ===
            "city"
            ? "city"
            : "player"
      }
    ];
  }


  getRun(
    runId
  ) {
    return entitySystem.get(
      "award_run",
      runId
    );
  }


  listRuns({
    period = null,
    division = null,
    limit = 100
  } = {}) {
    return entitySystem
      .filter(
        "award_run",
        item =>
          (
            !period ||
            item.period ===
              period
          ) &&
          (
            !division ||
            item.division ===
              division
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          b.endDay -
          a.endDay
      )
      .slice(
        0,
        limit
      );
  }


  rewardWinner(
    definition,
    run,
    winner
  ) {
    if (
      !winner ||
      !winner.isPlayer ||
      !winner.restaurantId
    ) {
      return null;
    }


    const restaurantId =
      winner.restaurantId;


    if (
      definition.reward
        .reputation >
      0
    ) {
      restaurantSystem
        .changeReputation(
          restaurantId,
          definition.reward
            .reputation
        );
    }


    if (
      definition.reward
        .experience >
      0
    ) {
      storeProgressSystem
        .addExperience(
          restaurantId,
          definition.reward
            .experience
        );
    }


    if (
      winner.subjectType ===
        "employee" &&
      entitySystem.exists(
        "employee",
        winner.id
      )
    ) {
      const employee =
        entitySystem.get(
          "employee",
          winner.id
        );

      entitySystem.update(
        "employee",
        winner.id,
        {
          awardCount:
            (
              employee
                .awardCount ??
              0
            ) +
            1,

          awardIds: [
            ...(
              employee
                .awardIds ??
              []
            ),
            definition.id
          ]
        }
      );
    }


    if (
      winner.subjectType ===
        "dish" &&
      entitySystem.exists(
        "custom_dish",
        winner.id
      )
    ) {
      const dish =
        entitySystem.get(
          "custom_dish",
          winner.id
        );

      entitySystem.update(
        "custom_dish",
        winner.id,
        {
          awardCount:
            (
              dish.awardCount ??
              0
            ) +
            1,

          awardIds: [
            ...(
              dish.awardIds ??
              []
            ),
            definition.id
          ],

          prestigeTitle:
            definition.name
        }
      );
    }


    const restaurant =
      restaurantSystem.get(
        restaurantId
      );


    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        awardCount:
          (
            restaurant
              .awardCount ??
            0
          ) +
          1
      }
    );


    const honor =
      entitySystem.create(
        "honor_record",
        {
          awardRunId:
            run.id,

          awardId:
            definition.id,

          awardName:
            definition.name,

          division:
            definition.division,

          period:
            definition.period,

          periodIndex:
            run.periodIndex,

          startDay:
            run.startDay,

          endDay:
            run.endDay,

          subjectType:
            winner.subjectType,

          subjectId:
            winner.id,

          subjectName:
            winner.name,

          restaurantId,

          rank:
            1,

          prestige:
            definition.prestige,

          reputationReward:
            definition.reward
              .reputation,

          experienceReward:
            definition.reward
              .experience,

          createdDay:
            gameState
              .getSection(
                "time"
              )
              .day
        }
      );


    eventBus.emit(
      "award:won",
      {
        award:
          structuredClone(
            definition
          ),

        honor:
          structuredClone(
            honor
          ),

        winner:
          structuredClone(
            winner
          )
      }
    );


    return honor;
  }


  settleAward(
    definition,
    restaurantId,
    endDay,
    scopeKey
  ) {
    const periodInfo =
      this.getPeriodInfo(
        definition.period,
        endDay
      );


    const runId =
      runIdFor(
        definition.period,
        periodInfo
          .periodIndex,
        definition.id,
        scopeKey
      );


    if (
      entitySystem.exists(
        "award_run",
        runId
      )
    ) {
      return entitySystem.get(
        "award_run",
        runId
      );
    }


    const evaluation =
      awardEvaluationSystem
        .evaluateAward(
          definition,
          restaurantId,
          endDay
        );


    const run =
      entitySystem.create(
        "award_run",
        {
          awardId:
            definition.id,

          awardName:
            definition.name,

          division:
            definition.division,

          period:
            definition.period,

          subject:
            definition.subject,

          scope:
            definition.scope,

          scopeKey,

          periodIndex:
            periodInfo
              .periodIndex,

          startDay:
            periodInfo.startDay,

          endDay:
            periodInfo.endDay,

          status:
            evaluation.winner
              ? "completed"
              : "no_eligible",

          eligibleCount:
            evaluation
              .eligibleCount,

          nominations:
            structuredClone(
              evaluation
                .nominations
            ),

          finalists:
            structuredClone(
              evaluation
                .finalists
            ),

          winner:
            evaluation.winner
              ? structuredClone(
                  evaluation.winner
                )
              : null,

          settledDay:
            gameState
              .getSection(
                "time"
              )
              .day
        },
        {
          id:
            runId
        }
      );


    this.rewardWinner(
      definition,
      run,
      evaluation.winner
    );


    return run;
  }


  settlePeriod(
    period,
    endDay
  ) {
    const definitions =
      AWARD_DEFINITIONS
        .filter(
          item =>
            item.period ===
            period
        );


    const results = [];


    for (
      const definition
      of definitions
    ) {
      const contexts =
        this.getScopeContexts(
          definition
        );


      for (
        const context
        of contexts
      ) {
        results.push(
          this.settleAward(
            definition,
            context
              .restaurantId,
            endDay,
            context.scopeKey
          )
        );
      }
    }


    eventBus.emit(
      "award:periodSettled",
      {
        period,
        endDay,

        runCount:
          results.length
      }
    );


    return results;
  }


  processDay(
    currentDay
  ) {
    const completedDay =
      currentDay -
      1;


    if (
      completedDay <
      1
    ) {
      return [];
    }


    const results = [];


    for (
      const [
        period,
        config
      ]
      of Object.entries(
        AWARD_PERIODS
      )
    ) {
      if (
        completedDay %
        config.days ===
        0
      ) {
        results.push(
          ...this.settlePeriod(
            period,
            completedDay
          )
        );
      }
    }


    return results;
  }


  getParticipation(
    restaurantId,
    {
      period = null,
      limit = 100
    } = {}
  ) {
    const entries = [];


    for (
      const run
      of this.listRuns({
        period,
        limit: 1000
      })
    ) {
      for (
        const nomination
        of run.nominations ??
        []
      ) {
        if (
          nomination
            .restaurantId ===
          restaurantId
        ) {
          entries.push({
            runId:
              run.id,

            awardId:
              run.awardId,

            awardName:
              run.awardName,

            division:
              run.division,

            period:
              run.period,

            periodIndex:
              run.periodIndex,

            endDay:
              run.endDay,

            subjectType:
              nomination
                .subjectType,

            subjectId:
              nomination.id,

            subjectName:
              nomination.name,

            stage:
              nomination.stage,

            rank:
              nomination.rank,

            score:
              nomination.score
          });
        }
      }
    }


    return entries
      .sort(
        (
          a,
          b
        ) =>
          b.endDay -
          a.endDay
      )
      .slice(
        0,
        limit
      );
  }


  getAwardDefinition(
    awardId
  ) {
    const definition =
      AWARD_DEFINITION_MAP[
        awardId
      ];


    return definition
      ? structuredClone(
          definition
        )
      : null;
  }
}


export const awardSystem =
  new AwardSystem();


export {
  AwardSystem,
  runIdFor
};
