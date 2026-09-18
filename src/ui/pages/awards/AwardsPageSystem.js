import {
  AWARD_DEFINITIONS,
  AWARD_DIVISIONS,
  AWARD_PERIODS
} from "../../../data/awardDefinitions.js";

import {
  awardSystem
} from "../../../systems/AwardSystem.js";

import {
  honorArchiveSystem
} from "../../../systems/HonorArchiveSystem.js";


const PERIOD_OPTIONS =
  Object.freeze([
    {
      id: "monthly",
      name: "月度奖"
    },

    {
      id: "quarterly",
      name: "季度奖"
    },

    {
      id: "annual",
      name: "年度奖"
    }
  ]);


class AwardsPageSystem {
  getPage(
    restaurantId,
    {
      period = "annual",
      division = null
    } = {}
  ) {
    const safePeriod =
      AWARD_PERIODS[
        period
      ]
        ? period
        : "annual";


    const definitions =
      AWARD_DEFINITIONS
        .filter(
          item =>
            item.period ===
              safePeriod &&
            (
              !division ||
              item.division ===
                division
            )
        );


    const divisions =
      Object.entries(
        AWARD_DIVISIONS
      )
        .map(
          ([
            id,
            name
          ]) => ({
            id,
            name,

            count:
              AWARD_DEFINITIONS
                .filter(
                  item =>
                    item.period ===
                      safePeriod &&
                    item.division ===
                      id
                )
                .length
          })
        )
        .filter(
          item =>
            item.count >
            0
        );


    const participation =
      awardSystem
        .getParticipation(
          restaurantId,
          {
            period:
              safePeriod,

            limit: 30
          }
        );


    const recentRuns =
      awardSystem
        .listRuns({
          period:
            safePeriod,

          division,

          limit: 30
        });


    return {
      pageId:
        "awards-center",

      title:
        "奖项中心",

      period:
        safePeriod,

      division,

      periodOptions:
        PERIOD_OPTIONS,

      divisions,

      definitions,

      progress:
        awardSystem
          .getCurrentProgress(
            safePeriod
          ),

      participation,

      recentRuns,

      honorSummary:
        honorArchiveSystem
          .getSummary(
            restaurantId
          ),

      totalAwardCount:
        AWARD_DEFINITIONS
          .length
    };
  }
}


export const awardsPageSystem =
  new AwardsPageSystem();


export {
  AwardsPageSystem,
  PERIOD_OPTIONS
};
