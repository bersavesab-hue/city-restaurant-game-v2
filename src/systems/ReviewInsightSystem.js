import { restaurantSystem } from "./RestaurantSystem.js";
import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

const ISSUE_LABELS = Object.freeze({
  quality_low: "菜品质量差",
  price_high: "价格偏高",
  queue_long: "排队时间长",
  service_failed: "接待能力不足",
  good_quality: "菜品质量好",
  good_value: "性价比高",
  good_service: "服务顺畅",
  environment_poor: "环境舒适度差",
  good_environment: "环境体验好"
});

class ReviewInsightSystem {
  analyze({
    restaurantId,
    experience,
    result
  }) {
    const issues = [];
    const positives = [];

    if (
      experience.qualityScore < 55
    ) {
      issues.push("quality_low");
    } else if (
      experience.qualityScore >= 80
    ) {
      positives.push("good_quality");
    }

    if (
      experience.priceScore < 55
    ) {
      issues.push("price_high");
    } else if (
      experience.priceScore >= 80
    ) {
      positives.push("good_value");
    }

    if (
      (result.queueAbandoned ?? 0) > 0 ||
      (result.queuedVisitors ?? 0) >
        Math.max(2, (result.visitors ?? 0) * 0.3)
    ) {
      issues.push("queue_long");
    }

    if (
      (result.serviceRejectedVisitors ?? 0) > 0 ||
      (result.failedOrders ?? 0) > 0
    ) {
      issues.push("service_failed");
    }

    if (
      experience.comfortScore < 55
    ) {
      issues.push(
        "environment_poor"
      );
    } else if (
      experience.comfortScore >= 82
    ) {
      positives.push(
        "good_environment"
      );
    }

    if (
      experience.waitScore < 55 &&
      !issues.includes(
        "queue_long"
      )
    ) {
      issues.push(
        "queue_long"
      );
    }

    if (
      issues.length === 0 &&
      experience.serviceScore >= 80
    ) {
      positives.push("good_service");
    }

    return {
      issues,
      positives
    };
  }

  record({
    restaurantId,
    experience,
    result
  }) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const analysis =
      this.analyze({
        restaurantId,
        experience,
        result
      });

    const issueStats = {
      ...(restaurant.reviewIssueStats ?? {})
    };

    const positiveStats = {
      ...(restaurant.reviewPositiveStats ?? {})
    };

    for (const id of analysis.issues) {
      issueStats[id] =
        (issueStats[id] ?? 0) + 1;
    }

    for (const id of analysis.positives) {
      positiveStats[id] =
        (positiveStats[id] ?? 0) + 1;
    }

    const time =
      gameState.getSection("time");

    const latestReviews = [
      ...(restaurant.latestReviews ?? [])
    ];

    if (
      analysis.issues.length > 0 ||
      analysis.positives.length > 0
    ) {
      latestReviews.unshift({
        day: time.day,
        satisfaction:
          experience.satisfaction,
        issues:
          analysis.issues,
        positives:
          analysis.positives
      });
    }

    if (latestReviews.length > 20) {
      latestReviews.length = 20;
    }

    return entitySystem.update(
      "restaurant",
      restaurantId,
      {
        reviewIssueStats:
          issueStats,

        reviewPositiveStats:
          positiveStats,

        latestReviews
      }
    );
  }

  getDiagnosis(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const issues =
      Object.entries(
        restaurant.reviewIssueStats ??
        {}
      )
      .map(([id, count]) => ({
        id,
        label:
          ISSUE_LABELS[id] ?? id,
        count
      }))
      .sort(
        (a, b) =>
          b.count - a.count
      );

    const positives =
      Object.entries(
        restaurant.reviewPositiveStats ??
        {}
      )
      .map(([id, count]) => ({
        id,
        label:
          ISSUE_LABELS[id] ?? id,
        count
      }))
      .sort(
        (a, b) =>
          b.count - a.count
      );

    return {
      restaurantId,

      topIssue:
        issues[0] ?? null,

      topPositive:
        positives[0] ?? null,

      issues,
      positives,

      latestReviews:
        restaurant.latestReviews ??
        []
    };
  }
}

export const reviewInsightSystem =
  new ReviewInsightSystem();

export {
  ReviewInsightSystem,
  ISSUE_LABELS
};
