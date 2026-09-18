import {
  entitySystem
} from "../core/EntitySystem.js";


class HonorArchiveSystem {
  listByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "honor_record",
        item =>
          item.restaurantId ===
            restaurantId
      )
      .sort(
        (a, b) =>
          (
            b.awardedDay ??
            0
          ) -
          (
            a.awardedDay ??
            0
          )
      );
  }


  getJourney(
    restaurantId
  ) {
    const results =
      entitySystem.list(
        "award_result"
      );


    let nominations = 0;
    let finalistAppearances = 0;
    let wins = 0;


    for (
      const result
      of results
    ) {
      const nominees =
        result.nominees ??
        [];

      const finalists =
        result.finalists ??
        [];


      nominations +=
        nominees.filter(
          item =>
            item.restaurantId ===
              restaurantId
        ).length;


      finalistAppearances +=
        finalists.filter(
          item =>
            item.restaurantId ===
              restaurantId
        ).length;


      if (
        result.winner
          ?.restaurantId ===
        restaurantId
      ) {
        wins += 1;
      }
    }


    return {
      nominations,
      finalistAppearances,
      wins
    };
  }


  getHall(
    restaurantId
  ) {
    const records =
      this.listByRestaurant(
        restaurantId
      );


    const byPeriod = {
      monthly: 0,
      quarterly: 0,
      annual: 0
    };


    const byDivision =
      {};


    const bySubject = {
      restaurant: 0,
      dish: 0,
      employee: 0
    };


    const repeatMap =
      new Map();


    let prestigePoints = 0;


    for (
      const record
      of records
    ) {
      if (
        record.period in
        byPeriod
      ) {
        byPeriod[
          record.period
        ] += 1;
      }


      byDivision[
        record.division
      ] =
        (
          byDivision[
            record.division
          ] ??
          0
        ) +
        1;


      if (
        record.subjectType in
        bySubject
      ) {
        bySubject[
          record.subjectType
        ] += 1;
      }


      prestigePoints +=
        record.prestige ??
        0;


      const repeatKey =
        [
          record.awardId,
          record.subjectId ??
            record.restaurantId
        ].join(
          "::"
        );


      repeatMap.set(
        repeatKey,
        (
          repeatMap.get(
            repeatKey
          ) ??
          0
        ) +
        1
      );
    }


    const repeatWins =
      [
        ...repeatMap.entries()
      ]
        .filter(
          (
            [
              ,
              count
            ]
          ) =>
            count >= 2
        )
        .map(
          (
            [
              key,
              count
            ]
          ) => ({
            key,
            count
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );


    return {
      restaurantId,

      totalWins:
        records.length,

      uniqueAwards:
        new Set(
          records.map(
            item =>
              item.awardId
          )
        ).size,

      prestigePoints,

      byPeriod,

      byDivision,

      bySubject,

      repeatWins,

      journey:
        this.getJourney(
          restaurantId
        ),

      highestPrestige:
        records.reduce(
          (
            max,
            item
          ) =>
            Math.max(
              max,
              item.prestige ??
                0
            ),
          0
        ),

      records
    };
  }


  getRecent(
    restaurantId,
    limit = 12
  ) {
    return this
      .listByRestaurant(
        restaurantId
      )
      .slice(
        0,
        limit
      );
  }
}


export const honorArchiveSystem =
  new HonorArchiveSystem();


export {
  HonorArchiveSystem
};
