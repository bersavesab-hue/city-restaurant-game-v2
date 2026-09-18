import {
  AWARD_DIVISIONS
} from "../../../data/awardDefinitions.js";

import {
  honorArchiveSystem
} from "../../../systems/HonorArchiveSystem.js";

import {
  awardSystem
} from "../../../systems/AwardSystem.js";


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


    return {
      pageId:
        "honor-hall",

      title:
        "荣誉馆",

      period,
      division,
      subjectType,

      summary:
        honorArchiveSystem
          .getSummary(
            restaurantId
          ),

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
