import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  trafficDemandSystem
} from "./TrafficDemandSystem.js";

import {
  competitionMetricsSystem
} from "./CompetitionMetricsSystem.js";

import {
  AWARD_DEFINITION_MAP
} from "../data/awardDefinitions.js";


function scoreOf(
  candidate,
  metric
) {
  const value =
    Number(
      candidate?.[
        metric
      ]
    );


  return Number.isFinite(
    value
  )
    ? value
    : Number.NEGATIVE_INFINITY;
}


class AwardEvaluationSystem {
  getDefinition(
    awardId
  ) {
    const definition =
      AWARD_DEFINITION_MAP[
        awardId
      ];


    if (!definition) {
      throw new Error(
        `Unknown award "${awardId}"`
      );
    }


    return structuredClone(
      definition
    );
  }


  getContexts(
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
          scopeKey:
            `restaurant:${restaurant.id}`,

          anchorRestaurantId:
            restaurant.id,

          restaurantIds: [
            restaurant.id
          ]
        })
      );
    }


    if (
      definition.scope ===
      "player"
    ) {
      return [
        {
          scopeKey:
            "player",

          anchorRestaurantId:
            restaurants[0].id,

          restaurantIds:
            restaurants.map(
              item =>
                item.id
            )
        }
      ];
    }


    if (
      definition.scope ===
      "city"
    ) {
      return [
        {
          scopeKey:
            "city",

          anchorRestaurantId:
            restaurants[0].id,

          restaurantIds:
            restaurants.map(
              item =>
                item.id
            )
        }
      ];
    }


    if (
      definition.scope ===
      "district"
    ) {
      const groups =
        new Map();


      for (
        const restaurant
        of restaurants
      ) {
        let district =
          null;


        try {
          district =
            trafficDemandSystem
              .getDistrictForRestaurant(
                restaurant.id
              );
        } catch {
          district =
            null;
        }


        if (!district) {
          continue;
        }


        const current =
          groups.get(
            district.id
          ) ?? {
            scopeKey:
              `district:${district.id}`,

            districtId:
              district.id,

            districtName:
              district.name,

            anchorRestaurantId:
              restaurant.id,

            restaurantIds:
              []
          };


        current
          .restaurantIds
          .push(
            restaurant.id
          );


        groups.set(
          district.id,
          current
        );
      }


      return [
        ...groups.values()
      ];
    }


    return [];
  }


  getCandidates(
    definition,
    context,
    endDay
  ) {
    const period =
      definition.period;


    if (
      definition.subject ===
      "dish"
    ) {
      return competitionMetricsSystem
        .getDishCandidates(
          context
            .anchorRestaurantId,
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
          context
            .anchorRestaurantId
        );
    }


    if (
      definition.scope ===
      "player"
    ) {
      return competitionMetricsSystem
        .getPlayerRestaurantCandidates(
          period,
          endDay
        );
    }


    if (
      definition.scope ===
      "city"
    ) {
      return competitionMetricsSystem
        .getCityRestaurantCandidates(
          context
            .anchorRestaurantId,
          period,
          endDay
        );
    }


    if (
      definition.scope ===
      "district"
    ) {
      const merged =
        new Map();


      for (
        const restaurantId
        of context
          .restaurantIds
      ) {
        const candidates =
          competitionMetricsSystem
            .getDistrictRestaurantCandidates(
              restaurantId,
              period,
              endDay
            );


        for (
          const candidate
          of candidates
        ) {
          if (
            candidate.isPlayer ||
            !merged.has(
              candidate.id
            )
          ) {
            merged.set(
              candidate.id,
              candidate
            );
          }
        }
      }


      return [
        ...merged.values()
      ];
    }


    return [];
  }


  isEligible(
    candidate,
    definition
  ) {
    const rules =
      definition.eligibility ??
      {};


    if (
      rules.minOperatingDays &&
      (
        candidate
          .operatingDays ??
        0
      ) <
      rules.minOperatingDays
    ) {
      return false;
    }


    if (
      rules.minOrders &&
      (
        candidate.orders ??
        0
      ) <
      rules.minOrders
    ) {
      return false;
    }


    if (
      rules.minQuantity &&
      (
        candidate.quantity ??
        0
      ) <
      rules.minQuantity
    ) {
      return false;
    }


    if (
      rules.minWorkMinutes &&
      (
        candidate
          .totalWorkMinutes ??
        0
      ) <
      rules.minWorkMinutes
    ) {
      return false;
    }


    if (
      rules.roleIds
        ?.length &&
      !rules.roleIds
        .includes(
          candidate.roleId
        )
    ) {
      return false;
    }


    if (
      rules.customOnly &&
      !candidate.custom
    ) {
      return false;
    }


    if (
      rules.maxAgeDays !==
        null &&
      rules.maxAgeDays !==
        undefined &&
      (
        candidate.ageDays ??
        Number.MAX_SAFE_INTEGER
      ) >
      rules.maxAgeDays
    ) {
      return false;
    }


    return Number.isFinite(
      scoreOf(
        candidate,
        definition.metric
      )
    );
  }


  evaluate(
    awardId,
    context,
    endDay
  ) {
    const definition =
      this.getDefinition(
        awardId
      );


    const eligible =
      this.getCandidates(
        definition,
        context,
        endDay
      )
        .filter(
          candidate =>
            this.isEligible(
              candidate,
              definition
            )
        )
        .sort(
          (a, b) => {
            const delta =
              scoreOf(
                b,
                definition.metric
              ) -
              scoreOf(
                a,
                definition.metric
              );


            if (delta !== 0) {
              return delta;
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


    const finalistCount =
      Math.max(
        1,
        definition.finalistCount ??
        3
      );


    const nomineeCount =
      Math.min(
        eligible.length,
        Math.max(
          finalistCount * 2,
          5
        )
      );


    const nominees =
      eligible
        .slice(
          0,
          nomineeCount
        )
        .map(
          (
            candidate,
            index
          ) => ({
            ...candidate,

            rank:
              index + 1,

            stage:
              index === 0
                ? "winner"
                : index <
                  finalistCount
                  ? "finalist"
                  : "nominated",

            awardScore:
              scoreOf(
                candidate,
                definition.metric
              )
          })
        );


    const finalists =
      nominees
        .filter(
          item =>
            item.stage ===
              "winner" ||
            item.stage ===
              "finalist"
        );


    return {
      definition,

      context:
        structuredClone(
          context
        ),

      endDay,

      metric:
        definition.metric,

      eligibleCount:
        eligible.length,

      nominees,

      finalists,

      winner:
        nominees[0] ??
        null
    };
  }


  evaluateAward(
    awardId,
    endDay
  ) {
    const definition =
      this.getDefinition(
        awardId
      );


    return this
      .getContexts(
        definition
      )
      .map(
        context =>
          this.evaluate(
            awardId,
            context,
            endDay
          )
      );
  }
}


export const awardEvaluationSystem =
  new AwardEvaluationSystem();


export {
  AwardEvaluationSystem
};
