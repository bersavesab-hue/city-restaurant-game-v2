import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  AWARD_DIVISIONS,
  AWARD_PERIODS
} from "../data/awardDefinitions.js";


class HonorArchiveSystem {
  list(
    restaurantId,
    {
      period = null,
      division = null,
      subjectType = null,
      limit = 200
    } = {}
  ) {
    return entitySystem
      .filter(
        "honor_record",
        item =>
          item.restaurantId ===
            restaurantId &&
          (
            !period ||
            item.period ===
              period
          ) &&
          (
            !division ||
            item.division ===
              division
          ) &&
          (
            !subjectType ||
            item.subjectType ===
              subjectType
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


  getSummary(
    restaurantId
  ) {
    const honors =
      this.list(
        restaurantId,
        {
          limit: 1000
        }
      );


    const byPeriod =
      Object.fromEntries(
        Object.keys(
          AWARD_PERIODS
        ).map(
          id => [
            id,
            0
          ]
        )
      );


    const byDivision =
      Object.fromEntries(
        Object.keys(
          AWARD_DIVISIONS
        ).map(
          id => [
            id,
            0
          ]
        )
      );


    let prestigePoints = 0;
    let annualWins = 0;


    for (
      const honor
      of honors
    ) {
      byPeriod[
        honor.period
      ] =
        (
          byPeriod[
            honor.period
          ] ??
          0
        ) + 1;

      byDivision[
        honor.division
      ] =
        (
          byDivision[
            honor.division
          ] ??
          0
        ) + 1;

      prestigePoints +=
        honor.prestige ??
        0;

      if (
        honor.period ===
        "annual"
      ) {
        annualWins += 1;
      }
    }


    return {
      totalHonors:
        honors.length,

      prestigePoints,

      annualWins,

      uniqueAwardCount:
        new Set(
          honors.map(
            item =>
              item.awardId
          )
        ).size,

      byPeriod,

      byDivision,

      latest:
        honors.slice(
          0,
          6
        )
    };
  }


  getSubjectHonors(
    restaurantId,
    subjectType,
    subjectId
  ) {
    return this
      .list(
        restaurantId,
        {
          subjectType,
          limit: 1000
        }
      )
      .filter(
        item =>
          item.subjectId ===
            subjectId
      );
  }
}


export const honorArchiveSystem =
  new HonorArchiveSystem();


export {
  HonorArchiveSystem
};
