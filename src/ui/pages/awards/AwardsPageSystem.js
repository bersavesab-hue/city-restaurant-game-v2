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

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


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


    const honorSummary =
      honorArchiveSystem
        .getSummary(
          restaurantId
        );

    const notices =
      [];

    const latestParticipation =
      participation[0] ??
      null;

    if (
      latestParticipation
    ) {
      notices.push({
        id:
          "award_participation",

        type:
          latestParticipation.stage ===
            "winner"
            ? "success"
            : "info",

        title:
          latestParticipation.stage ===
            "winner"
            ? "获奖通知"
            : "评审进展",

        message:
          latestParticipation.stage ===
            "winner"
            ? `${latestParticipation.awardName}已获奖，荣誉已归档`
            : `${latestParticipation.awardName}当前阶段：${latestParticipation.stage}`,

        priority:
          latestParticipation.stage ===
            "winner"
            ? 110
            : 60
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices
        }
      );

    return {
      pageId:
        "awards-center",

      restaurantId,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

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

      honorSummary,

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
