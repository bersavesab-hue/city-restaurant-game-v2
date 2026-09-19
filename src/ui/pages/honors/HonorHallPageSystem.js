import {
  AWARD_DIVISIONS
} from "../../../data/awardDefinitions.js";

import {
  honorArchiveSystem
} from "../../../systems/HonorArchiveSystem.js";

import {
  awardSystem
} from "../../../systems/AwardSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


class HonorHallPageSystem {
  getPage(
    restaurantId,
    {
      period = null,
      division = null,
      subjectType = null
    } = {}
  ) {
    const honors =
      honorArchiveSystem
        .list(
          restaurantId,
          {
            period,
            division,
            subjectType
          }
        );


    const participation =
      awardSystem
        .getParticipation(
          restaurantId,
          {
            period,
            limit: 200
          }
        );


    const summary =
      honorArchiveSystem
        .getSummary(
          restaurantId
        );

    const notices =
      [];

    if (
      summary.totalHonors >
      0
    ) {
      notices.push({
        id:
          "honor_summary",

        type:
          "success",

        title:
          "荣誉档案",

        message:
          `已获得${summary.totalHonors}项正式荣誉，累计荣誉值${summary.prestigePoints}`,

        priority:
          60
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
        "honor-hall",

      title:
        "荣誉馆",

      restaurantId,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      period,
      division,
      subjectType,

      summary,

      honors,

      participation,

      divisions:
        Object.entries(
          AWARD_DIVISIONS
        ).map(
          ([
            id,
            name
          ]) => ({
            id,
            name
          })
        )
    };
  }
}


export const honorHallPageSystem =
  new HonorHallPageSystem();


export {
  HonorHallPageSystem
};
