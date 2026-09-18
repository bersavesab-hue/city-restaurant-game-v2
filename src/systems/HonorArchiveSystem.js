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

  getPeriodIndex(
    record
  ) {
    const key =
      String(
        record.periodKey ??
        ""
      );


    if (record.period === "monthly") {
      const match =
        key.match(
          /Y(\d+)-M(\d+)/
        );

      return match
        ? (
            (
              Number(match[1]) -
              1
            ) *
            12 +
            Number(match[2])
          )
        : 0;
    }


    if (record.period === "quarterly") {
      const match =
        key.match(
          /Y(\d+)-Q(\d+)/
        );

      return match
        ? (
            (
              Number(match[1]) -
              1
            ) *
            4 +
            Number(match[2])
          )
        : 0;
    }


    const match =
      key.match(
        /Y(\d+)/
      );


    return match
      ? Number(match[1])
      : 0;
  }


  list(
    restaurantId,
    {
      period = null,
      division = null,
      subjectType = null
    } = {}
  ) {
    return this
      .listByRestaurant(
        restaurantId
      )
      .filter(
        item =>
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
      .map(
        item => ({
          ...item,

          periodIndex:
            this.getPeriodIndex(
              item
            ),

          reputationReward:
            item.reward
              ?.reputation ??
            0,

          experienceReward:
            item.reward
              ?.experience ??
            0
        })
      );
  }


  getSummary(
    restaurantId
  ) {
    const hall =
      this.getHall(
        restaurantId
      );


    return {
      restaurantId,

      totalHonors:
        hall.totalWins,

      uniqueAwardCount:
        hall.uniqueAwards,

      prestigePoints:
        hall.prestigePoints,

      annualWins:
        hall.byPeriod
          .annual ??
        0,

      monthlyWins:
        hall.byPeriod
          .monthly ??
        0,

      quarterlyWins:
        hall.byPeriod
          .quarterly ??
        0,

      highestPrestige:
        hall.highestPrestige,

      nominations:
        hall.journey
          .nominations,

      finalistAppearances:
        hall.journey
          .finalistAppearances,

      wins:
        hall.journey
          .wins
    };
  }

}


export const honorArchiveSystem =
  new HonorArchiveSystem();


export {
  HonorArchiveSystem
};
