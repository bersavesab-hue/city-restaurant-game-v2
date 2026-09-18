import {
  AWARD_DEFINITIONS
} from "../data/awardDefinitions.js";

import {
  competitionMetricsSystem
} from "./CompetitionMetricsSystem.js";


const PERIOD_ALIAS =
  Object.freeze({
    monthly: "month",
    quarterly: "quarter",
    annual: "year"
  });


class AwardEvaluationSystem {
  getDefinitions(
    period = null
  ) {
    return AWARD_DEFINITIONS
      .filter(
        item =>
          !period ||
          item.period === period
      )
      .map(
        item =>
          structuredClone(
            item
          )
      );
  }


  getCandidates(
    definition,
    restaurantId,
    endDay
  ) {
    const period =
      PERIOD_ALIAS[
        definition.period
      ];


    if (
      definition.subject ===
      "restaurant"
    ) {
      switch (
        definition.scope
      ) {
        case "district":
          return competitionMetricsSystem
            .getDistrictRestaurantCandidates(
              restaurantId,
              period,
              endDay
            );

        case "city":
          return competitionMetricsSystem
            .getCityRestaurantCandidates(
              restaurantId,
              period,
              endDay
            );

        case "player":
          return competitionMetricsSystem
            .getPlayerRestaurantCandidates(
              period,
              endDay
            );

        default:
          return [];
      }
    }


    if (
      definition.subject ===
      "dish"
    ) {
      return competitionMetricsSystem
        .getDishCandidates(
          restaurantId,
          period,
          endDay
        );
    }


    if (
      definition.subject ===
      "employee"
    ) {
      return competitionMetricsSystem
        .getEmployeeCandidates(
          restaurantId
        );
    }


    return [];
  }


  isEligible(
    candidate,
    definition
  ) {
    const rule =
      definition.eligibility ??
      {};


    if (
      rule.minOperatingDays &&
      (
        candidate
          .operatingDays ??
        0
      ) <
      rule.minOperatingDays
    ) {
      return false;
    }


    if (
      rule.minOrders &&
      (
        candidate.orders ??
        0
      ) <
      rule.minOrders
    ) {
      return false;
    }


    if (
      rule.minQuantity &&
      (
        candidate.quantity ??
        0
      ) <
      rule.minQuantity
    ) {
      return false;
    }


    if (
      rule.minWorkMinutes &&
      (
        candidate
          .totalWorkMinutes ??
        0
      ) <
      rule.minWorkMinutes
    ) {
      return false;
    }


    if (
      Array.isArray(
        rule.roleIds
      ) &&
      rule.roleIds.length >
        0 &&
      !rule.roleIds.includes(
        candidate.roleId
      )
    ) {
      return false;
    }


    if (
      rule.customOnly &&
      !candidate.custom
    ) {
      return false;
    }


    if (
      Number.isFinite(
        rule.maxAgeDays
      ) &&
      (
        candidate.ageDays ??
        Number.MAX_SAFE_INTEGER
      ) >
      rule.maxAgeDays
    ) {
      return false;
    }


    return true;
  }


  getMetricScore(
    candidate,
    definition
  ) {
    const value =
      candidate[
        definition.metric
      ];


    return Number.isFinite(
      value
    )
      ? value
      : null;
  }


  simplifyCandidate(
    candidate,
    definition,
    rank,
    stage
  ) {
    return {
      rank,
      stage,

      id:
        candidate.id,

      subjectType:
        candidate.subjectType ??
        definition.subject,

      name:
        candidate.name,

      isPlayer:
        Boolean(
          candidate.isPlayer
        ),

      restaurantId:
        candidate.restaurantId ??
        (
          candidate
            .subjectType ===
            "restaurant" &&
          candidate.isPlayer
            ? candidate.id
            : null
        ),

      districtId:
        candidate.districtId ??
        null,

      districtName:
        candidate.districtName ??
        null,

      roleId:
        candidate.roleId ??
        null,

      roleName:
        candidate.roleName ??
        null,

      score:
        candidate[
          definition.metric
        ],

      metric:
        definition.metric
    };
  }


  evaluateAward(
    definition,
    restaurantId,
    endDay
  ) {
    const eligible =
      this.getCandidates(
        definition,
        restaurantId,
        endDay
      )
        .filter(
          candidate =>
            this.isEligible(
              candidate,
              definition
            )
        )
        .filter(
          candidate =>
            this.getMetricScore(
              candidate,
              definition
            ) !==
            null
        )
        .sort(
          (
            a,
            b
          ) => {
            const difference =
              b[
                definition.metric
              ] -
              a[
                definition.metric
              ];


            if (
              difference !==
              0
            ) {
              return difference;
            }


            return String(
              a.id
            ).localeCompare(
              String(
                b.id
              )
            );
          }
        );


    const nominationCount =
      Math.min(
        eligible.length,
        Math.max(
          definition
            .finalistCount *
            2,
          5
        )
      );


    const nominations =
      eligible
        .slice(
          0,
          nominationCount
        )
        .map(
          (
            candidate,
            index
          ) => {
            const rank =
              index + 1;

            let stage =
              "nominated";


            if (
              rank <=
              definition
                .finalistCount
            ) {
              stage =
                "finalist";
            }


            if (
              rank === 1
            ) {
              stage =
                "winner";
            }


            return this
              .simplifyCandidate(
                candidate,
                definition,
                rank,
                stage
              );
          }
        );


    const finalists =
      nominations.filter(
        item =>
          item.stage ===
            "winner" ||
          item.stage ===
            "finalist"
      );


    return {
      definition:
        structuredClone(
          definition
        ),

      endDay,

      eligibleCount:
        eligible.length,

      nominations,

      finalists,

      winner:
        nominations[0] ??
        null
    };
  }


  evaluatePeriod(
    period,
    restaurantId,
    endDay
  ) {
    return this
      .getDefinitions(
        period
      )
      .map(
        definition =>
          this.evaluateAward(
            definition,
            restaurantId,
            endDay
          )
      );
  }
}


export const awardEvaluationSystem =
  new AwardEvaluationSystem();


export {
  AwardEvaluationSystem,
  PERIOD_ALIAS
};
