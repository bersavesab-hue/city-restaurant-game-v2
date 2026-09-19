import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  reviewInsightSystem
} from "./ReviewInsightSystem.js";

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function currentDay() {
  return gameState
    .getSection("time")
    .day;
}

class WordOfMouthSystem {
  constructor() {
    this.started = false;
    this.start();
  }

  start() {
    if (this.started) {
      return false;
    }

    eventBus.on(
      "customer:experienceUpdated",
      experience => {
        if (
          experience?.restaurantId
        ) {
          this.recordExperience(
            experience.restaurantId,
            experience
          );
        }
      }
    );

    eventBus.on(
      "order:completed",
      payload => {
        if (payload?.order) {
          this.recordOrder(
            payload.order
          );
        }
      }
    );

    this.started = true;

    return true;
  }

  getDailyRecord(
    restaurantId,
    day = currentDay()
  ) {
    return (
      entitySystem
        .filter(
          "word_of_mouth_daily",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        )[0] ?? null
    );
  }

  recordExperience(
    restaurantId,
    experience
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const satisfaction =
      clamp(
        Number(
          experience
            ?.satisfaction ??
          50
        ),
        0,
        100
      );

    const reviewScore =
      clamp(
        Number(
          experience
            ?.reviewScore ??
          3
        ),
        1,
        5
      );

    const positiveSignal =
      satisfaction >= 75
        ? 1
        : 0;

    const negativeSignal =
      satisfaction < 55
        ? 1
        : 0;

    const score =
      clamp(
        (
          satisfaction - 50
        ) * 1.2 +
        (
          reviewScore - 3
        ) * 15,
        -100,
        100
      );

    const day =
      currentDay();

    const existing =
      this.getDailyRecord(
        restaurantId,
        day
      );

    if (!existing) {
      entitySystem.create(
        "word_of_mouth_daily",
        {
          restaurantId,
          day,

          reviewEvents: 1,

          positiveSignals:
            positiveSignal,

          negativeSignals:
            negativeSignal,

          scoreTotal:
            score,

          satisfactionTotal:
            satisfaction
        }
      );
    } else {
      entitySystem.update(
        "word_of_mouth_daily",
        existing.id,
        {
          reviewEvents:
            existing
              .reviewEvents +
            1,

          positiveSignals:
            existing
              .positiveSignals +
            positiveSignal,

          negativeSignals:
            existing
              .negativeSignals +
            negativeSignal,

          scoreTotal:
            existing
              .scoreTotal +
            score,

          satisfactionTotal:
            existing
              .satisfactionTotal +
            satisfaction
        }
      );
    }

    return this.refreshRestaurant(
      restaurantId
    );
  }

  recordOrder(order) {
    if (
      !order?.restaurantId ||
      !Array.isArray(
        order.items
      )
    ) {
      return null;
    }

    const day =
      currentDay();

    for (
      const line
      of order.items
    ) {
      if (!line.dishId) {
        continue;
      }

      const existing =
        entitySystem
          .filter(
            "dish_buzz_daily",
            item =>
              item.restaurantId ===
                order.restaurantId &&
              item.day === day &&
              item.dishId ===
                line.dishId
          )[0];

      const quantity =
        Math.max(
          1,
          Math.round(
            line.quantity ?? 1
          )
        );

      const quality =
        Number(
          line.outputQualityScore ??
          order.averageQuality ??
          60
        );

      const positive =
        quality >= 80
          ? quantity
          : 0;

      const negative =
        quality < 55
          ? quantity
          : 0;

      if (!existing) {
        entitySystem.create(
          "dish_buzz_daily",
          {
            restaurantId:
              order.restaurantId,

            day,

            dishId:
              line.dishId,

            mentions:
              quantity,

            positiveMentions:
              positive,

            negativeMentions:
              negative,

            qualityTotal:
              quality *
              quantity
          }
        );
      } else {
        entitySystem.update(
          "dish_buzz_daily",
          existing.id,
          {
            mentions:
              existing.mentions +
              quantity,

            positiveMentions:
              existing
                .positiveMentions +
              positive,

            negativeMentions:
              existing
                .negativeMentions +
              negative,

            qualityTotal:
              existing
                .qualityTotal +
              quality *
              quantity
          }
        );
      }
    }

    return true;
  }

  pruneHistory(
    currentDayValue =
      currentDay(),
    retentionDays = 30
  ) {
    if (
      !Number.isInteger(
        currentDayValue
      ) ||
      currentDayValue < 1
    ) {
      throw new RangeError(
        "currentDay must be a positive integer"
      );
    }

    if (
      !Number.isInteger(
        retentionDays
      ) ||
      retentionDays < 7
    ) {
      throw new RangeError(
        "retentionDays must be an integer >= 7"
      );
    }

    const archiveThrough =
      currentDayValue -
      retentionDays -
      1;

    if (
      archiveThrough < 1
    ) {
      return {
        removedWordOfMouth:
          0,
        removedDishBuzz:
          0
      };
    }

    const wordOfMouth =
      entitySystem.filter(
        "word_of_mouth_daily",
        item =>
          Number.isInteger(
            item.day
          ) &&
          item.day <=
            archiveThrough
      );

    const dishBuzz =
      entitySystem.filter(
        "dish_buzz_daily",
        item =>
          Number.isInteger(
            item.day
          ) &&
          item.day <=
            archiveThrough
      );

    return {
      removedWordOfMouth:
        entitySystem.removeMany(
          "word_of_mouth_daily",
          wordOfMouth.map(
            item =>
              item.id
          )
        ),

      removedDishBuzz:
        entitySystem.removeMany(
          "dish_buzz_daily",
          dishBuzz.map(
            item =>
              item.id
          )
        )
    };
  }


  getRecentRecords(
    restaurantId,
    days = 7
  ) {
    const today =
      currentDay();

    const start =
      Math.max(
        1,
        today -
        days +
        1
      );

    return entitySystem
      .filter(
        "word_of_mouth_daily",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >= start &&
          item.day <= today
      )
      .sort(
        (a, b) =>
          a.day - b.day
      );
  }

  calculateScore(
    restaurantId
  ) {
    const records =
      this.getRecentRecords(
        restaurantId,
        7
      );

    if (
      records.length === 0
    ) {
      return 0;
    }

    const today =
      currentDay();

    let weightedScore = 0;
    let totalWeight = 0;

    for (
      const record
      of records
    ) {
      const age =
        today -
        record.day;

      const weight =
        Math.max(
          1,
          7 - age
        );

      const average =
        record.reviewEvents > 0
          ? record.scoreTotal /
            record.reviewEvents
          : 0;

      weightedScore +=
        average *
        weight;

      totalWeight +=
        weight;
    }

    return clamp(
      weightedScore /
      Math.max(
        1,
        totalWeight
      ),
      -100,
      100
    );
  }

  getDemandMultiplier(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      Number.isFinite(
        restaurant
          .wordOfMouthFactor
      )
    ) {
      return clamp(
        restaurant
          .wordOfMouthFactor,
        0.85,
        1.2
      );
    }

    const score =
      this.calculateScore(
        restaurantId
      );

    return clamp(
      1 +
      score /
      500,
      0.85,
      1.2
    );
  }

  refreshRestaurant(
    restaurantId
  ) {
    const score =
      this.calculateScore(
        restaurantId
      );

    const factor =
      clamp(
        1 +
        score /
        500,
        0.85,
        1.2
      );

    return entitySystem.update(
      "restaurant",
      restaurantId,
      {
        wordOfMouthScore:
          Number(
            score.toFixed(1)
          ),

        wordOfMouthFactor:
          Number(
            factor.toFixed(3)
          )
      }
    );
  }

  getDishBuzz(
    restaurantId,
    days = 7
  ) {
    const today =
      currentDay();

    const start =
      Math.max(
        1,
        today -
        days +
        1
      );

    const rows =
      entitySystem.filter(
        "dish_buzz_daily",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >= start &&
          item.day <= today
      );

    const map =
      new Map();

    for (
      const row
      of rows
    ) {
      const current =
        map.get(
          row.dishId
        ) ?? {
          dishId:
            row.dishId,

          mentions: 0,

          positiveMentions: 0,

          negativeMentions: 0,

          qualityTotal: 0
        };

      current.mentions +=
        row.mentions;

      current
        .positiveMentions +=
        row.positiveMentions;

      current
        .negativeMentions +=
        row.negativeMentions;

      current.qualityTotal +=
        row.qualityTotal;

      map.set(
        row.dishId,
        current
      );
    }

    return [
      ...map.values()
    ]
      .map(
        item => ({
          ...item,

          averageQuality:
            item.mentions > 0
              ? Math.round(
                  item
                    .qualityTotal /
                  item.mentions
                )
              : 0,

          buzzScore:
            item
              .positiveMentions *
              2 -
            item
              .negativeMentions *
              3 +
            item.mentions
        })
      )
      .sort(
        (a, b) =>
          b.buzzScore -
          a.buzzScore
      );
  }

  getDashboard(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const diagnosis =
      reviewInsightSystem
        .getDiagnosis(
          restaurantId
        );

    const recent =
      this.getRecentRecords(
        restaurantId,
        7
      );

    const reviewEvents =
      recent.reduce(
        (sum, item) =>
          sum +
          item.reviewEvents,
        0
      );

    const positives =
      recent.reduce(
        (sum, item) =>
          sum +
          item
            .positiveSignals,
        0
      );

    const negatives =
      recent.reduce(
        (sum, item) =>
          sum +
          item
            .negativeSignals,
        0
      );

    return {
      restaurantId,

      reviewScore:
        restaurant
          .reviewScore ??
        3,

      reputation:
        restaurant
          .reputation ??
        0,

      repeatRate:
        restaurant
          .repeatRate ??
        0,

      wordOfMouthScore:
        restaurant
          .wordOfMouthScore ??
        0,

      wordOfMouthFactor:
        this.getDemandMultiplier(
          restaurantId
        ),

      reviewEvents,
      positives,
      negatives,

      positiveRate:
        reviewEvents > 0
          ? Number(
              (
                positives /
                reviewEvents *
                100
              ).toFixed(1)
            )
          : 0,

      negativeRate:
        reviewEvents > 0
          ? Number(
              (
                negatives /
                reviewEvents *
                100
              ).toFixed(1)
            )
          : 0,

      topIssue:
        diagnosis.topIssue,

      topPositive:
        diagnosis.topPositive,

      latestReviews:
        diagnosis.latestReviews,

      dishBuzz:
        this.getDishBuzz(
          restaurantId,
          7
        )
    };
  }
}

export const wordOfMouthSystem =
  new WordOfMouthSystem();

export {
  WordOfMouthSystem
};
