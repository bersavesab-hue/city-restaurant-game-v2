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
  awardFeedbackSystem
} from "./AwardFeedbackSystem.js";

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
      const existing =
        entitySystem.get(
          "award_result",
          resultId
        );


      awardFeedbackSystem
        .recordResult(
          existing
        );


      return existing;
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


    awardFeedbackSystem
      .recordResult(
        result
      );


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

  getPeriodIndex(
    period,
    endDay
  ) {
    const calendar =
      businessCalendarSystem
        .getCalendar(
          endDay
        );


    if (period === "monthly") {
      return (
        (
          calendar.year -
          1
        ) *
        12 +
        calendar.month
      );
    }


    if (period === "quarterly") {
      return (
        (
          calendar.year -
          1
        ) *
        4 +
        Math.ceil(
          calendar.month /
          3
        )
      );
    }


    return calendar.year;
  }


  getCurrentProgress(
    period
  ) {
    const calendar =
      businessCalendarSystem
        .getCalendar();


    let dayInPeriod =
      calendar.dayOfMonth;

    let totalDays = 30;
    let periodName = "月度";


    if (period === "quarterly") {
      totalDays = 90;
      periodName = "季度";

      dayInPeriod =
        (
          (
            calendar.month -
            1
          ) %
          3
        ) *
        30 +
        calendar.dayOfMonth;
    } else if (period === "annual") {
      totalDays = 360;
      periodName = "年度";
      dayInPeriod =
        calendar.dayOfYear;
    }


    return {
      period,
      periodName,
      dayInPeriod,
      totalDays,

      remainingDays:
        Math.max(
          0,
          totalDays -
          dayInPeriod
        ),

      progress:
        Math.round(
          dayInPeriod /
          totalDays *
          100
        )
    };
  }


  listRuns({
    period = null,
    division = null,
    limit = 30
  } = {}) {
    return entitySystem
      .list(
        "award_result"
      )
      .filter(
        result =>
          (
            !period ||
            result.period ===
              period
          ) &&
          (
            !division ||
            result.division ===
              division
          )
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
      )
      .slice(
        0,
        limit
      )
      .map(
        result => ({
          ...result,

          periodIndex:
            this.getPeriodIndex(
              result.period,
              result.endDay
            )
        })
      );
  }


  getParticipation(
    restaurantId,
    {
      period = null,
      limit = 100
    } = {}
  ) {
    const participation = [];


    for (
      const result
      of entitySystem.list(
        "award_result"
      )
    ) {
      if (
        period &&
        result.period !==
          period
      ) {
        continue;
      }


      for (
        const nominee
        of result.nominees ??
        []
      ) {
        if (
          nominee.restaurantId !==
          restaurantId
        ) {
          continue;
        }


        participation.push({
          awardResultId:
            result.id,

          awardId:
            result.awardId,

          awardName:
            result.awardName,

          period:
            result.period,

          periodKey:
            result.periodKey,

          periodIndex:
            this.getPeriodIndex(
              result.period,
              result.endDay
            ),

          division:
            result.division,

          subjectType:
            result.subjectType,

          subjectId:
            nominee.id,

          subjectName:
            nominee.name,

          rank:
            nominee.rank,

          score:
            nominee.awardScore,

          stage:
            nominee.stage ===
              "nominee"
              ? "nominated"
              : nominee.stage,

          endDay:
            result.endDay
        });
      }
    }


    return participation
      .sort(
        (a, b) =>
          b.endDay -
          a.endDay ||
          a.rank -
          b.rank
      )
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
