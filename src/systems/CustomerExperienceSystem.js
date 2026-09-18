import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { reviewInsightSystem } from "./ReviewInsightSystem.js";
import { layoutFlowSystem } from "./LayoutFlowSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class CustomerExperienceSystem {
  getWeightedSegmentPreference(
    demand,
    field,
    fallback = 50
  ) {
    const segments =
      demand?.segments ??
      [];

    let total = 0;
    let weighted = 0;

    for (
      const item
      of segments
    ) {
      const amount =
        Math.max(
          0,
          item.expectedVisitors ??
          0
        );

      if (
        amount <= 0
      ) {
        continue;
      }

      const segment =
        customerSegmentSystem.get(
          item.segmentId
        );

      if (!segment) {
        continue;
      }

      total +=
        amount;

      weighted +=
        (
          segment[field] ??
          fallback
        ) *
        amount;
    }

    return total > 0
      ? weighted /
        total
      : fallback;
  }


  getPriceScore(demand) {
    const segments =
      demand?.segments ?? [];

    let weight = 0;
    let score = 0;

    for (const item of segments) {
      const amount =
        item.expectedVisitors ?? 0;

      if (amount <= 0) {
        continue;
      }

      weight += amount;

      score +=
        clamp(
          (item.priceFactor ?? 1) /
            1.1 *
            100,
          0,
          100
        ) *
        amount;
    }

    return weight > 0
      ? score / weight
      : 70;
  }

  getWaitScore(
    demand,
    result
  ) {
    const waitMinutes =
      Math.max(
        0,
        Number(
          result
            ?.estimatedWaitMinutes ??
          0
        )
      );

    const patience =
      Math.max(
        1,
        Number(
          result
            ?.queuePatienceMinutes ??
          12
        )
      );

    const incoming =
      Math.max(
        1,
        Number(
          result
            ?.incomingVisitors ??
          result
            ?.visitors ??
          1
        )
      );

    const rejectedRate =
      Math.max(
        0,
        Number(
          result
            ?.rejectedVisitors ??
          0
        )
      ) /
      incoming;

    const waitPressure =
      waitMinutes /
      patience;

    return Math.round(
      clamp(
        100 -
        Math.max(
          0,
          waitPressure -
          0.35
        ) *
          55 -
        rejectedRate *
          45,
        0,
        100
      )
    );
  }

  recordHour({
    restaurantId,
    demand,
    result
  }) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const served =
      result.completedOrders ?? 0;

    const rejected =
      result.rejectedVisitors ?? 0;

    const failed =
      result.failedOrders ?? 0;

    const queued =
      result.queuedVisitors ?? 0;

    const observedVisitors =
      (result.visitors ?? 0) +
      rejected +
      failed;

    const priceScore =
      this.getPriceScore(
        demand
      );

    const layout =
      layoutFlowSystem
        .getOperationalEffects(
          restaurantId
        );

    const comfortScore =
      layout.active
        ? layout.comfortScore
        : 80;

    if (observedVisitors <= 0) {
      return {
        restaurantId,
        satisfaction:
          restaurant.customerSatisfaction ??
          50,
        qualityScore: 60,
        priceScore:
          Math.round(priceScore),
        serviceScore: 100,
        comfortScore,
        layoutFlowScore:
          layout.flowScore,
        repeatRate:
          restaurant.repeatRate ?? 0,
        reviewScore:
          restaurant.reviewScore ?? 3,
        reputation:
          restaurant.reputation ?? 0
      };
    }

    const totalVisitors =
      Math.max(
        1,
        (result.visitors ?? 0) +
        rejected
      );

    const qualityScore =
      served > 0
        ? clamp(
            result.averageQuality ?? 60,
            0,
            100
          )
        : 60;

    const queueRate =
      queued / totalVisitors;

    const failureRate =
      (
        rejected +
        failed
      ) /
      totalVisitors;

    const serviceScore =
      clamp(
        100 -
        queueRate * 30 -
        failureRate * 55,
        0,
        100
      );

    const waitScore =
      this.getWaitScore(
        demand,
        result
      );

    const satisfaction =
      Math.round(
        qualityScore * 0.42 +
        priceScore * 0.18 +
        serviceScore * 0.16 +
        comfortScore * 0.12 +
        waitScore * 0.12
      );

    const repeatPreference =
      this.getWeightedSegmentPreference(
        demand,
        "repeatPreference",
        50
      );

    const repeatPreferenceFactor =
      clamp(
        0.75 +
        repeatPreference /
        200,
        0.75,
        1.25
      );

    const reviewPropensity =
      this.getWeightedSegmentPreference(
        demand,
        "reviewPropensity",
        50
      );

    const repeatRate =
      Math.round(
        clamp(
          (satisfaction - 30) *
            1.35 *
            repeatPreferenceFactor,
          0,
          90
        )
      );

    const oldServed =
      restaurant.totalServedGuests ??
      0;

    const totalServed =
      oldServed + served;

    const oldSatisfaction =
      restaurant.customerSatisfaction ??
      50;

    const customerSatisfaction =
      totalServed > 0
        ? Math.round(
            (
              oldSatisfaction *
                oldServed +
              satisfaction *
                served
            ) /
            totalServed
          )
        : oldSatisfaction;

    const reviewRate =
      clamp(
        0.04 +
        reviewPropensity /
        100 *
        0.14,
        0.04,
        0.18
      );

    const reviewCount =
      served > 0
        ? Math.max(
            1,
            Math.round(
              served *
              reviewRate
            )
          )
        : 0;

    const oldReviews =
      restaurant.totalReviews ?? 0;

    const totalReviews =
      oldReviews + reviewCount;

    const currentStars =
      clamp(
        1 +
        satisfaction / 25,
        1,
        5
      );

    const reviewScore =
      totalReviews > 0
        ? (
            (
              (restaurant.reviewScore ??
                3) *
                oldReviews +
              currentStars *
                reviewCount
            ) /
            totalReviews
          )
        : 3;

    const reputationDelta =
      clamp(
        (
          satisfaction - 60
        ) /
          120 -
        failureRate * 0.25,
        -0.5,
        0.35
      );

    const updated =
      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          customerSatisfaction,

          repeatRate:
            oldServed === 0
              ? repeatRate
              : Math.round(
                  (
                    (restaurant.repeatRate ??
                      0) *
                      4 +
                    repeatRate
                  ) /
                    5
                ),

          reviewScore:
            Number(
              reviewScore.toFixed(2)
            ),

          totalReviews,

          totalServedGuests:
            totalServed,

          totalRejectedGuests:
            (
              restaurant
                .totalRejectedGuests ??
              0
            ) +
            rejected,

          reputation:
            clamp(
              (restaurant.reputation ??
                0) +
                reputationDelta,
              0,
              100
            )
        }
      );

    const experience = {
      restaurantId,
      satisfaction,
      qualityScore,
      priceScore:
        Math.round(priceScore),
      serviceScore:
        Math.round(serviceScore),

      waitScore,

      estimatedWaitMinutes:
        Math.max(
          0,
          Math.round(
            result
              .estimatedWaitMinutes ??
            0
          )
        ),

      queuePatienceMinutes:
        Math.max(
          0,
          Math.round(
            result
              .queuePatienceMinutes ??
            0
          )
        ),

      comfortScore,
      layoutFlowScore:
        layout.flowScore,
      repeatRate,

      repeatPreference:
        Math.round(
          repeatPreference
        ),

      reviewPropensity:
        Math.round(
          reviewPropensity
        ),

      reviewRate:
        Number(
          reviewRate.toFixed(
            3
          )
        ),

      reviewScore:
        updated.reviewScore,
      reputation:
        updated.reputation
    };

    reviewInsightSystem.record({
      restaurantId,
      experience,
      result
    });

    eventBus.emit(
      "customer:experienceUpdated",
      experience
    );

    return experience;
  }
}

export const customerExperienceSystem =
  new CustomerExperienceSystem();

export {
  CustomerExperienceSystem
};
