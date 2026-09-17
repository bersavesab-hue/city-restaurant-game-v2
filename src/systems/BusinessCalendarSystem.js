import { gameState } from "../core/GameState.js";

const WEEKDAYS = Object.freeze([
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日"
]);

const SEASONS = Object.freeze([
  "spring",
  "summer",
  "autumn",
  "winter"
]);

const SEASON_NAMES = Object.freeze({
  spring: "春季",
  summer: "夏季",
  autumn: "秋季",
  winter: "冬季"
});

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

class BusinessCalendarSystem {
  getCalendar(
    day = null
  ) {
    const currentDay =
      day ??
      gameState.getSection(
        "time"
      ).day;

    if (
      !Number.isInteger(
        currentDay
      ) ||
      currentDay < 1
    ) {
      throw new RangeError(
        "Day must be a positive integer"
      );
    }

    const dayOfYear =
      (
        (currentDay - 1) %
        360
      ) + 1;

    const year =
      Math.floor(
        (currentDay - 1) /
        360
      ) + 1;

    const month =
      Math.floor(
        (dayOfYear - 1) /
        30
      ) + 1;

    const dayOfMonth =
      (
        (dayOfYear - 1) %
        30
      ) + 1;

    const weekdayIndex =
      (currentDay - 1) %
      7;

    const isWeekend =
      weekdayIndex >= 5;

    const seasonIndex =
      Math.floor(
        (month - 1) /
        3
      );

    const season =
      SEASONS[
        seasonIndex
      ];

    return {
      day:
        currentDay,

      year,

      month,

      dayOfMonth,

      dayOfYear,

      weekdayIndex,

      weekday:
        WEEKDAYS[
          weekdayIndex
        ],

      isWeekend,

      season,

      seasonName:
        SEASON_NAMES[
          season
        ]
    };
  }

  getDayTypeMultiplier(
    segmentId,
    calendar
  ) {
    if (
      calendar.isWeekend
    ) {
      switch (
        segmentId
      ) {
        case "office_worker":
          return 0.48;

        case "resident":
          return 1.18;

        case "student":
          return 1;

        case "tourist":
          return 1.22;

        default:
          return 1;
      }
    }

    switch (
      segmentId
    ) {
      case "office_worker":
        return 1.12;

      case "resident":
        return 0.95;

      case "student":
        return 1.08;

      case "tourist":
        return 0.95;

      default:
        return 1;
    }
  }

  getSeasonMultiplier(
    segmentId,
    season
  ) {
    switch (
      season
    ) {
      case "spring":
        return (
          segmentId ===
          "tourist"
            ? 1.05
            : 1
        );

      case "summer":
        if (
          segmentId ===
          "tourist"
        ) {
          return 1.12;
        }

        if (
          segmentId ===
          "resident"
        ) {
          return 1.05;
        }

        return 1;

      case "autumn":
        if (
          segmentId ===
            "office_worker" ||
          segmentId ===
            "student"
        ) {
          return 1.04;
        }

        return 1;

      case "winter":
        if (
          segmentId ===
          "resident"
        ) {
          return 1.08;
        }

        if (
          segmentId ===
          "tourist"
        ) {
          return 0.95;
        }

        return 1;

      default:
        return 1;
    }
  }

  getTimePatternMultiplier(
    segmentId,
    hour,
    calendar
  ) {
    let multiplier = 1;

    const lunch =
      hour >= 11 &&
      hour <= 13;

    const dinner =
      hour >= 18 &&
      hour <= 20;

    if (
      !calendar.isWeekend &&
      segmentId ===
        "office_worker" &&
      lunch
    ) {
      multiplier *=
        1.12;
    }

    if (
      calendar.isWeekend &&
      segmentId ===
        "resident" &&
      dinner
    ) {
      multiplier *=
        1.1;
    }

    if (
      calendar.isWeekend &&
      segmentId ===
        "tourist" &&
      (
        lunch ||
        dinner
      )
    ) {
      multiplier *=
        1.08;
    }

    if (
      !calendar.isWeekend &&
      segmentId ===
        "student" &&
      dinner
    ) {
      multiplier *=
        1.06;
    }

    return multiplier;
  }

  getDemandMultiplier(
    segmentId,
    hour,
    day = null
  ) {
    const calendar =
      this.getCalendar(
        day
      );

    const dayType =
      this.getDayTypeMultiplier(
        segmentId,
        calendar
      );

    const season =
      this.getSeasonMultiplier(
        segmentId,
        calendar.season
      );

    const timePattern =
      this.getTimePatternMultiplier(
        segmentId,
        hour,
        calendar
      );

    return Number(
      clamp(
        dayType *
        season *
        timePattern,
        0.3,
        1.8
      ).toFixed(3)
    );
  }

  getDayForecast(
    day = null
  ) {
    const calendar =
      this.getCalendar(
        day
      );

    const segments = [
      "office_worker",
      "resident",
      "student",
      "tourist"
    ];

    return {
      ...calendar,

      lunch: Object.fromEntries(
        segments.map(
          segmentId => [
            segmentId,
            this.getDemandMultiplier(
              segmentId,
              12,
              calendar.day
            )
          ]
        )
      ),

      dinner:
        Object.fromEntries(
          segments.map(
            segmentId => [
              segmentId,
              this.getDemandMultiplier(
                segmentId,
                19,
                calendar.day
              )
            ]
          )
        )
    };
  }

  getForecast(
    days = 7,
    startDay = null
  ) {
    if (
      !Number.isInteger(
        days
      ) ||
      days < 1 ||
      days > 30
    ) {
      throw new RangeError(
        "Forecast days must be 1-30"
      );
    }

    const firstDay =
      startDay ??
      gameState.getSection(
        "time"
      ).day;

    return Array.from(
      {
        length: days
      },
      (
        _,
        index
      ) =>
        this.getDayForecast(
          firstDay +
          index
        )
    );
  }
}

export const businessCalendarSystem =
  new BusinessCalendarSystem();

export {
  BusinessCalendarSystem
};
