import {
  gameState
} from "../core/GameState.js";

import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  businessCalendarSystem
} from "./BusinessCalendarSystem.js";

import {
  rankingCenterSystem
} from "./RankingCenterSystem.js";


function notificationId(
  resultId,
  subjectId
) {
  return (
    String(resultId) +
    "__feedback__" +
    String(subjectId)
  );
}


class AwardFeedbackSystem {
  constructor({
    rankingSystem =
      rankingCenterSystem
  } = {}) {
    this.rankingSystem =
      rankingSystem;
  }


  recordResult(
    result
  ) {
    const created = [];


    for (
      const nominee
      of result.nominees ??
      []
    ) {
      if (
        !nominee.isPlayer ||
        !nominee.restaurantId
      ) {
        continue;
      }


      const id =
        notificationId(
          result.id,
          nominee.id
        );


      if (
        entitySystem.exists(
          "award_notification",
          id
        )
      ) {
        continue;
      }


      const stage =
        nominee.stage ===
          "nominee"
          ? "nominated"
          : nominee.stage;


      const action =
        stage ===
          "winner"
          ? "award-ceremony"
          : "awards-center";


      const title =
        stage ===
          "winner"
          ? "获得新荣誉"
          : stage ===
              "finalist"
            ? "进入最终入围名单"
            : "获得奖项提名";


      const message =
        stage ===
          "winner"
          ? (
              nominee.name +
              " 获得「" +
              result.awardName +
              "」"
            )
          : (
              nominee.name +
              (
                stage ===
                  "finalist"
                  ? " 入围「"
                  : " 获得「"
              ) +
              result.awardName +
              (
                stage ===
                  "finalist"
                  ? "」最终名单"
                  : "」提名"
              )
            );


      const item =
        entitySystem.create(
          "award_notification",
          {
            restaurantId:
              nominee.restaurantId,

            awardResultId:
              result.id,

            awardId:
              result.awardId,

            awardName:
              result.awardName,

            period:
              result.period,

            periodKey:
              result.periodKey,

            division:
              result.division,

            subjectType:
              result.subjectType,

            subjectId:
              nominee.id,

            subjectName:
              nominee.name,

            rank:
              nominee.rank,

            score:
              nominee.awardScore,

            stage,

            title,
            message,
            action,

            unread:
              true,

            createdDay:
              result.resolvedDay ??
              (
                result.endDay ??
                gameState
                  .getSection(
                    "time"
                  )
                  .day
              )
          },
          {
            id
          }
        );


      created.push(
        item
      );


      eventBus.emit(
        "award:feedback",
        {
          notification:
            structuredClone(
              item
            )
        }
      );
    }


    return created;
  }


  getNotifications(
    restaurantId,
    {
      unreadOnly = false,
      limit = 20
    } = {}
  ) {
    return entitySystem
      .filter(
        "award_notification",
        item =>
          item.restaurantId ===
            restaurantId &&
          (
            !unreadOnly ||
            item.unread
          )
      )
      .sort(
        (a, b) =>
          (
            b.createdDay ??
            0
          ) -
          (
            a.createdDay ??
            0
          )
      )
      .slice(
        0,
        limit
      );
  }


  getUnreadCount(
    restaurantId
  ) {
    return this
      .getNotifications(
        restaurantId,
        {
          unreadOnly:
            true,

          limit:
            9999
        }
      )
      .length;
  }


  markRead(
    notificationIdValue
  ) {
    const item =
      entitySystem.get(
        "award_notification",
        notificationIdValue
      );


    if (!item) {
      return null;
    }


    if (
      item.unread ===
      false
    ) {
      return item;
    }


    return entitySystem.update(
      "award_notification",
      notificationIdValue,
      {
        unread:
          false
      }
    );
  }


  markAllRead(
    restaurantId
  ) {
    const unread =
      this.getNotifications(
        restaurantId,
        {
          unreadOnly:
            true,

          limit:
            9999
        }
      );


    for (
      const item
      of unread
    ) {
      this.markRead(
        item.id
      );
    }


    return unread.length;
  }


  markResultRead(
    restaurantId,
    resultId
  ) {
    const items =
      entitySystem.filter(
        "award_notification",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.awardResultId ===
            resultId &&
          item.unread
      );


    for (
      const item
      of items
    ) {
      this.markRead(
        item.id
      );
    }


    return items.length;
  }


  getCycleWarnings() {
    const calendar =
      businessCalendarSystem
        .getCalendar();


    const monthlyRemaining =
      30 -
      calendar.dayOfMonth;

    const quarterDay =
      (
        (
          calendar.month -
          1
        ) %
        3
      ) *
      30 +
      calendar.dayOfMonth;

    const quarterlyRemaining =
      90 -
      quarterDay;

    const annualRemaining =
      360 -
      calendar.dayOfYear;


    return [
      {
        period:
          "monthly",

        name:
          "月度评奖",

        remainingDays:
          monthlyRemaining,

        urgent:
          monthlyRemaining <=
          5
      },

      {
        period:
          "quarterly",

        name:
          "季度评奖",

        remainingDays:
          quarterlyRemaining,

        urgent:
          quarterlyRemaining <=
          10
      },

      {
        period:
          "annual",

        name:
          "年度评奖",

        remainingDays:
          annualRemaining,

        urgent:
          annualRemaining <=
          30
      }
    ]
      .sort(
        (a, b) =>
          a.remainingDays -
          b.remainingDays
      );
  }


  getRankingChase(
    restaurantId,
    {
      period = "month",
      limit = 5
    } = {}
  ) {
    const boards =
      this.rankingSystem
        .getBoards(
          restaurantId,
          {
            period,
            category:
              "restaurant"
          }
        );


    const chase = [];


    for (
      const board
      of boards
    ) {
      const player =
        board.rows.find(
          row =>
            row.id ===
              restaurantId
        );


      if (!player) {
        continue;
      }


      const targetRank =
        player.rank > 3
          ? 3
          : player.rank > 1
            ? player.rank - 1
            : 1;


      const target =
        targetRank ===
          player.rank
          ? player
          : board.rows[
              targetRank -
              1
            ];


      chase.push({
        boardId:
          board.id,

        boardTitle:
          board.title,

        format:
          board.format,

        rank:
          player.rank,

        score:
          player.score,

        totalCandidates:
          board.totalCandidates,

        targetRank,

        targetScore:
          target?.score ??
          player.score,

        gap:
          Math.max(
            0,
            (
              target?.score ??
              player.score
            ) -
            player.score
          ),

        topThree:
          player.rank <=
          3,

        firstPlace:
          player.rank ===
          1
      });
    }


    return chase
      .sort(
        (a, b) => {
          if (
            a.topThree !==
            b.topThree
          ) {
            return a.topThree
              ? 1
              : -1;
          }


          return (
            a.rank -
            b.rank
          );
        }
      )
      .slice(
        0,
        limit
      );
  }


  getDashboard(
    restaurantId
  ) {
    return {
      unreadCount:
        this.getUnreadCount(
          restaurantId
        ),

      notifications:
        this.getNotifications(
          restaurantId,
          {
            unreadOnly:
              true,

            limit:
              3
          }
        ),

      cycleWarnings:
        this.getCycleWarnings(),

      rankingChase:
        this.getRankingChase(
          restaurantId,
          {
            period:
              "month",

            limit:
              3
          }
        )
    };
  }
}


export const awardFeedbackSystem =
  new AwardFeedbackSystem();


export {
  AwardFeedbackSystem
};
