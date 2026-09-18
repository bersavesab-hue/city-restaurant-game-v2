import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  businessCalendarSystem
} from "./BusinessCalendarSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  storeProgressSystem
} from "./StoreProgressSystem.js";

import {
  awardEvaluationSystem
} from "./AwardEvaluationSystem.js";

import {
  AWARD_DEFINITIONS
} from "../data/awardDefinitions.js";


function safeKey(
  value
) {
  return String(
    value
  )
    .replaceAll(
      ":",
      "_"
    )
    .replaceAll(
      "/",
      "_"
    )
    .replaceAll(
      " ",
      "_"
    );
}


class AwardSystem {
  getPeriodKey(
    period,
    endDay
  ) {
    const calendar =
      businessCalendarSystem
        .getCalendar(
          endDay
        );


    if (
      period ===
      "monthly"
    ) {
      return (
        `Y${calendar.year}` +
        `-M${String(
          calendar.month
        ).padStart(
          2,
          "0"
        )}`
      );
    }


    if (
      period ===
      "quarterly"
    ) {
      const quarter =
        Math.ceil(
          calendar.month /
          3
        );


      return (
        `Y${calendar.year}` +
        `-Q${quarter}`
      );
    }


    return `Y${calendar.year}`;
  }


  getDuePeriods(
    currentDay
  ) {
    const endDay =
      currentDay - 1;


    if (
      endDay < 1
    ) {
      return [];
    }


    const due = [];


    if (
      endDay % 30 ===
      0
    ) {
      due.push(
        "monthly"
      );
    }


    if (
      endDay % 90 ===
      0
    ) {
      due.push(
        "quarterly"
      );
    }


    if (
      endDay % 360 ===
      0
    ) {
      due.push(
        "annual"
      );
    }


    return due;
  }


  getResultId(
    awardId,
    periodKey,
    scopeKey
  ) {
    return [
      safeKey(
        awardId
      ),
      safeKey(
        periodKey
      ),
      safeKey(
        scopeKey
      )
    ].join(
      "__"
    );
  }


  resolveEvaluation(
    evaluation,
    periodKey
  ) {
    const {
      definition,
      context,
      endDay,
      nominees,
      finalists,
      winner
    } =
      evaluation;


    const resultId =
      this.getResultId(
        definition.id,
        periodKey,
        context.scopeKey
      );


    if (
      entitySystem.exists(
        "award_result",
        resultId
      )
    ) {
      return entitySystem.get(
        "award_result",
        resultId
      );
    }


    const result =
      entitySystem.create(
        "award_result",
        {
          awardId:
            definition.id,

          awardName:
            definition.name,

          period:
            definition.period,

          periodKey,

          division:
            definition.division,

          subjectType:
            definition.subject,

          scope:
            definition.scope,

          scopeKey:
            context.scopeKey,

          endDay,

          metric:
            definition.metric,

          prestige:
            definition.prestige,

          nominees:
            structuredClone(
              nominees
            ),

          finalists:
            structuredClone(
              finalists
            ),

          winner:
            winner
              ? structuredClone(
                  winner
                )
              : null,

          resolvedDay:
            endDay + 1
        },
        {
          id:
            resultId
        }
      );


    if (
      winner
        ?.isPlayer &&
      winner.restaurantId
    ) {
      const honorId =
        [
          resultId,
          safeKey(
            winner.id
          )
        ].join(
          "__honor__"
        );


      if (
        !entitySystem.exists(
          "honor_record",
          honorId
        )
      ) {
        entitySystem.create(
          "honor_record",
          {
            awardResultId:
              result.id,

            awardId:
              definition.id,

            awardName:
              definition.name,

            period:
              definition.period,

            periodKey,

            division:
              definition.division,

            subjectType:
              definition.subject,

            subjectId:
              winner.id,

            subjectName:
              winner.name,

            restaurantId:
              winner.restaurantId,

            score:
              winner.awardScore,

            metric:
              definition.metric,

            prestige:
              definition.prestige,

            reward:
              structuredClone(
                definition.reward
              ),

            awardedDay:
              endDay + 1
          },
          {
            id:
              honorId
          }
        );


        if (
          definition.reward
            .reputation >
          0
        ) {
          restaurantSystem
            .changeReputation(
              winner
                .restaurantId,
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
              winner
                .restaurantId,
              definition.reward
                .experience
            );
        }


        eventBus.emit(
          "award:won",
          {
            awardId:
              definition.id,

            awardName:
              definition.name,

            periodKey,

            winner:
              structuredClone(
                winner
              ),

            reward:
              structuredClone(
                definition.reward
              )
          }
        );
      }
    }


    eventBus.emit(
      "award:resolved",
      {
        result:
          structuredClone(
            result
          )
      }
    );


    return result;
  }


  processPeriod(
    period,
    endDay
  ) {
    const periodKey =
      this.getPeriodKey(
        period,
        endDay
      );


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
      const evaluations =
        awardEvaluationSystem
          .evaluateAward(
            definition.id,
            endDay
          );


      for (
        const evaluation
        of evaluations
      ) {
        if (
          evaluation
            .eligibleCount ===
          0
        ) {
          continue;
        }


        results.push(
          this.resolveEvaluation(
            evaluation,
            periodKey
          )
        );
      }
    }


    return {
      period,
      periodKey,
      endDay,
      results
    };
  }


  processDay(
    currentDay
  ) {
    const due =
      this.getDuePeriods(
        currentDay
      );


    return due.map(
      period =>
        this.processPeriod(
          period,
          currentDay - 1
        )
    );
  }


  listResults({
    period = null,
    restaurantId = null
  } = {}) {
    return entitySystem
      .list(
        "award_result"
      )
      .filter(
        result => {
          if (
            period &&
            result.period !==
              period
          ) {
            return false;
          }


          if (
            restaurantId
          ) {
            const involved =
              (
                result.nominees ??
                []
              ).some(
                item =>
                  item
                    .restaurantId ===
                  restaurantId
              );


            if (!involved) {
              return false;
            }
          }


          return true;
        }
      )
      .sort(
        (a, b) =>
          (
            b.endDay ??
            0
          ) -
          (
            a.endDay ??
            0
          )
      );
  }


  getRecentResults(
    restaurantId,
    limit = 20
  ) {
    return this
      .listResults({
        restaurantId
      })
      .slice(
        0,
        limit
      );
  }
}


export const awardSystem =
  new AwardSystem();


export {
  AwardSystem
};
