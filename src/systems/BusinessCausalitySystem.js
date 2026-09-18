import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { restaurantSystem } from "./RestaurantSystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const CAUSE_LABELS = Object.freeze({
  quality: "菜品品质",
  price: "价格接受度",
  queue: "排队等待",
  capacity: "接待产能",
  environment: "环境舒适度",
  competition: "竞争分流",
  positive_experience: "综合体验",
  balanced: "经营平衡"
});

class BusinessCausalitySystem {
  getWeightedPriceFactor(demand) {
    const segments = demand?.segments ?? [];
    let weight = 0;
    let total = 0;

    for (const item of segments) {
      const visitors = Math.max(0, Number(item.expectedVisitors) || 0);
      if (visitors <= 0) continue;

      weight += visitors;
      total += (Number(item.priceFactor) || 1) * visitors;
    }

    return weight > 0 ? total / weight : 1;
  }

  getPrimaryCause({ demand, result, experience }) {
    const arrivals = Math.max(
      1,
      Number(result.incomingVisitors) ||
        Number(result.visitors) ||
        1
    );

    const abandonedRate =
      Math.max(
        0,
        Number(result.rejectedVisitors) || 0
      ) / arrivals;

    const waitMinutes =
      Math.max(
        0,
        Number(result.estimatedWaitMinutes) || 0
      );

    const patience =
      Math.max(
        1,
        Number(result.queuePatienceMinutes) || 12
      );

    const weightedPrice =
      this.getWeightedPriceFactor(demand);

    const candidates = [
      {
        id: "quality",
        severity: clamp(
          (65 - (experience?.qualityScore ?? 65)) / 35,
          0,
          1
        )
      },
      {
        id: "price",
        severity: clamp(
          (0.9 - weightedPrice) / 0.45,
          0,
          1
        )
      },
      {
        id: "queue",
        severity: clamp(
          Math.max(
            waitMinutes / patience - 1,
            abandonedRate * 2
          ),
          0,
          1
        )
      },
      {
        id: "capacity",
        severity: clamp(
          (70 - (experience?.serviceScore ?? 70)) / 45,
          0,
          1
        )
      },
      {
        id: "environment",
        severity: clamp(
          (65 - (experience?.comfortScore ?? 65)) / 35,
          0,
          1
        )
      },
      {
        id: "competition",
        severity: clamp(
          (0.85 - (demand?.competitionFactor ?? 1)) / 0.55,
          0,
          1
        )
      }
    ].sort((a, b) => b.severity - a.severity);

    if ((experience?.satisfaction ?? 0) >= 80) {
      return {
        id: "positive_experience",
        label: CAUSE_LABELS.positive_experience,
        severity: 0,
        positive: true
      };
    }

    const strongest = candidates[0];

    if (!strongest || strongest.severity < 0.18) {
      return {
        id: "balanced",
        label: CAUSE_LABELS.balanced,
        severity: 0,
        positive: false
      };
    }

    return {
      ...strongest,
      label: CAUSE_LABELS[strongest.id],
      positive: false
    };
  }

  recordSegmentFeedback({
    restaurantId,
    day,
    experience,
    segmentOutcomes
  }) {
    const overallQuality =
      experience?.qualityScore ??
      60;

    const rows = [];

    for (
      const outcome
      of segmentOutcomes ?? []
    ) {
      const served =
        Math.max(
          0,
          Number(
            outcome.served
          ) || 0
        );

      const rejected =
        Math.max(
          0,
          Number(
            outcome.rejected
          ) || 0
        );

      const arrivals =
        Math.max(
          served + rejected,
          Number(
            outcome.arrivals
          ) || 0
        );

      if (
        arrivals <= 0 &&
        served <= 0
      ) {
        continue;
      }

      const qualityAdjustment =
        (
          (
            outcome.averageQuality ||
            overallQuality
          ) -
          overallQuality
        ) *
        0.25;

      const priceAdjustment =
        (
          (
            outcome.priceFactor ??
            1
          ) -
          1
        ) *
        22;

      const rejectionPenalty =
        arrivals > 0
          ? rejected /
            arrivals *
            28
          : 0;

      const satisfaction =
        Math.round(
          clamp(
            (
              experience?.satisfaction ??
              65
            ) +
            qualityAdjustment +
            priceAdjustment -
            rejectionPenalty,
            0,
            100
          )
        );

      const existing =
        entitySystem
          .filter(
            "segment_experience_daily",
            item =>
              item.restaurantId ===
                restaurantId &&
              item.day === day &&
              item.segmentId ===
                outcome.segmentId
          )[0];

      if (!existing) {
        rows.push(
          entitySystem.create(
            "segment_experience_daily",
            {
              restaurantId,
              day,
              segmentId:
                outcome.segmentId,

              arrivals,
              served,
              rejected,

              revenue:
                outcome.revenue ??
                0,

              satisfactionTotal:
                satisfaction *
                Math.max(
                  1,
                  served
                ),

              satisfactionCount:
                Math.max(
                  1,
                  served
                )
            }
          )
        );

        continue;
      }

      rows.push(
        entitySystem.update(
          "segment_experience_daily",
          existing.id,
          {
            arrivals:
              existing.arrivals +
              arrivals,

            served:
              existing.served +
              served,

            rejected:
              existing.rejected +
              rejected,

            revenue:
              existing.revenue +
              (
                outcome.revenue ??
                0
              ),

            satisfactionTotal:
              existing
                .satisfactionTotal +
              satisfaction *
                Math.max(
                  1,
                  served
                ),

            satisfactionCount:
              existing
                .satisfactionCount +
              Math.max(
                1,
                served
              )
          }
        )
      );
    }

    return rows;
  }

  getSegmentRecent(
    restaurantId,
    segmentId,
    days = 7
  ) {
    const today =
      gameState
        .getSection(
          "time"
        )
        .day;

    const startDay =
      Math.max(
        1,
        today - days + 1
      );

    return entitySystem
      .filter(
        "segment_experience_daily",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.segmentId ===
            segmentId &&
          item.day >=
            startDay &&
          item.day <=
            today
      );
  }

  getSegmentDemandMultiplier(
    restaurantId,
    segmentId,
    days = 7
  ) {
    const rows =
      this.getSegmentRecent(
        restaurantId,
        segmentId,
        days
      );

    if (
      rows.length === 0
    ) {
      return 1;
    }

    const totals =
      rows.reduce(
        (sum, item) => {
          sum.arrivals +=
            item.arrivals ?? 0;

          sum.served +=
            item.served ?? 0;

          sum.satisfactionTotal +=
            item.satisfactionTotal ??
            0;

          sum.satisfactionCount +=
            item.satisfactionCount ??
            0;

          return sum;
        },
        {
          arrivals: 0,
          served: 0,
          satisfactionTotal: 0,
          satisfactionCount: 0
        }
      );

    const satisfaction =
      totals.satisfactionCount > 0
        ? totals.satisfactionTotal /
          totals.satisfactionCount
        : 65;

    const serviceRate =
      totals.arrivals > 0
        ? totals.served /
          totals.arrivals
        : 1;

    return Number(
      clamp(
        1 +
        (
          satisfaction -
          65
        ) /
          260 +
        (
          serviceRate -
          0.82
        ) *
          0.18,
        0.78,
        1.18
      ).toFixed(3)
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

    const time =
      gameState.getSection(
        "time"
      );

    const experience =
      result.experience ?? {};

    const primaryCause =
      this.getPrimaryCause({
        demand,
        result,
        experience
      });

    const arrivals =
      Math.max(
        0,
        Math.round(
          result.incomingVisitors ??
          result.visitors ??
          0
        )
      );

    const served =
      Math.max(
        0,
        Math.round(
          result.completedOrders ??
          0
        )
      );

    const rejected =
      Math.max(
        0,
        Math.round(
          result.rejectedVisitors ??
          0
        )
      );

    const revenue =
      Math.max(
        0,
        Math.round(
          result.revenue ??
          0
        )
      );

    this.recordSegmentFeedback({
      restaurantId,
      day:
        time.day,
      experience,
      segmentOutcomes:
        result.segmentOutcomes ??
        []
    });

    const row =
      entitySystem.create(
        "business_causality_hour",
        {
          restaurantId,
          day: time.day,
          hour: time.hour,
          totalMinutes:
            time.totalMinutes,

          inputs: {
            districtId:
              demand?.districtId ??
              null,

            venueTypeId:
              demand?.venueTypeId ??
              null,

            priceIndex:
              Number(
                (
                  demand?.priceIndex ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            weightedPriceFactor:
              Number(
                this
                  .getWeightedPriceFactor(
                    demand
                  )
                  .toFixed(3)
              ),

            marketShare:
              Number(
                (
                  demand?.marketShare ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            competitionFactor:
              Number(
                (
                  demand?.competitionFactor ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            cityEconomyFactor:
              Number(
                (
                  demand?.cityEconomyFactor ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            wordOfMouthFactor:
              Number(
                (
                  demand?.wordOfMouthFactor ??
                  restaurant.wordOfMouthFactor ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            reputationFactor:
              Number(
                (
                  demand?.reputationFactor ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            reviewFactor:
              Number(
                (
                  demand?.reviewFactor ??
                  1
                ).toFixed?.(3) ??
                1
              ),

            repeatFactor:
              Number(
                (
                  demand?.repeatFactor ??
                  1
                ).toFixed?.(3) ??
                1
              )
          },

          experience: {
            satisfaction:
              Math.round(
                experience.satisfaction ??
                0
              ),

            qualityScore:
              Math.round(
                experience.qualityScore ??
                0
              ),

            priceScore:
              Math.round(
                experience.priceScore ??
                0
              ),

            serviceScore:
              Math.round(
                experience.serviceScore ??
                0
              ),

            comfortScore:
              Math.round(
                experience.comfortScore ??
                0
              ),

            waitScore:
              Math.round(
                experience.waitScore ??
                0
              ),

            estimatedWaitMinutes:
              Math.max(
                0,
                Math.round(
                  result.estimatedWaitMinutes ??
                  0
                )
              ),

            queuePatienceMinutes:
              Math.max(
                0,
                Math.round(
                  result.queuePatienceMinutes ??
                  0
                )
              )
          },

          outcomes: {
            expectedVisitors:
              Number(
                (
                  demand?.expectedVisitors ??
                  0
                ).toFixed?.(2) ??
                0
              ),

            arrivals,
            visitors:
              result.visitors ?? 0,
            served,
            rejected,
            failed:
              result.failedOrders ?? 0,
            revenue,
            averageSpend:
              served > 0
                ? Math.round(
                    revenue / served
                  )
                : 0,

            segmentOutcomes:
              structuredClone(
                result.segmentOutcomes ??
                []
              )
          },

          feedback: {
            reviewScore:
              restaurant.reviewScore ??
              3,

            repeatRate:
              restaurant.repeatRate ??
              0,

            reputation:
              restaurant.reputation ??
              0,

            wordOfMouthScore:
              restaurant.wordOfMouthScore ??
              0,

            wordOfMouthFactor:
              restaurant.wordOfMouthFactor ??
              1
          },

          primaryCause
        }
      );

    return row;
  }

  getRecent(
    restaurantId,
    days = 7
  ) {
    const today =
      gameState
        .getSection(
          "time"
        )
        .day;

    const startDay =
      Math.max(
        1,
        today - days + 1
      );

    return entitySystem
      .filter(
        "business_causality_hour",
        row =>
          row.restaurantId ===
            restaurantId &&
          row.day >=
            startDay &&
          row.day <=
            today
      )
      .sort(
        (a, b) =>
          a.totalMinutes -
          b.totalMinutes
      );
  }

  getDashboard(
    restaurantId,
    days = 7
  ) {
    const rows =
      this.getRecent(
        restaurantId,
        days
      );

    const causeCounts = {};

    let arrivals = 0;
    let served = 0;
    let rejected = 0;
    let revenue = 0;
    let satisfactionTotal = 0;
    let waitTotal = 0;

    for (const row of rows) {
      arrivals +=
        row.outcomes?.arrivals ?? 0;

      served +=
        row.outcomes?.served ?? 0;

      rejected +=
        row.outcomes?.rejected ?? 0;

      revenue +=
        row.outcomes?.revenue ?? 0;

      satisfactionTotal +=
        row.experience
          ?.satisfaction ?? 0;

      waitTotal +=
        row.experience
          ?.estimatedWaitMinutes ?? 0;

      const cause =
        row.primaryCause?.id ??
        "balanced";

      causeCounts[cause] =
        (causeCounts[cause] ?? 0) +
        1;
    }

    const causes =
      Object.entries(
        causeCounts
      )
        .map(
          ([id, count]) => ({
            id,
            label:
              CAUSE_LABELS[id] ??
              id,
            count
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    const hourlySegmentMap =
      new Map();

    for (
      const row
      of rows
    ) {
      for (
        const outcome
        of row.outcomes
          ?.segmentOutcomes ??
        []
      ) {
        const current =
          hourlySegmentMap.get(
            outcome.segmentId
          ) ?? {
            segmentId:
              outcome.segmentId,

            expectedVisitors:
              0,

            arrivals:
              0,

            served:
              0,

            rejected:
              0,

            revenue:
              0,

            priceFactorTotal:
              0,

            priceFactorWeight:
              0,

            qualityTotal:
              0,

            qualityCount:
              0
          };

        const weight =
          Math.max(
            0.01,
            Number(
              outcome
                .expectedVisitors
            ) ||
            Number(
              outcome.arrivals
            ) ||
            1
          );

        current.expectedVisitors +=
          Number(
            outcome.expectedVisitors
          ) || 0;

        current.arrivals +=
          Number(
            outcome.arrivals
          ) || 0;

        current.served +=
          Number(
            outcome.served
          ) || 0;

        current.rejected +=
          Number(
            outcome.rejected
          ) || 0;

        current.revenue +=
          Number(
            outcome.revenue
          ) || 0;

        current.priceFactorTotal +=
          (
            Number(
              outcome.priceFactor
            ) ||
            1
          ) *
          weight;

        current.priceFactorWeight +=
          weight;

        if (
          Number(
            outcome.averageQuality
          ) >
          0
        ) {
          current.qualityTotal +=
            Number(
              outcome.averageQuality
            );

          current.qualityCount +=
            1;
        }

        hourlySegmentMap.set(
          outcome.segmentId,
          current
        );
      }
    }

    const segmentImpact =
      [
        ...hourlySegmentMap
          .values()
      ]
        .map(
          item => {
            const averagePriceFactor =
              item.priceFactorWeight >
              0
                ? item
                    .priceFactorTotal /
                  item
                    .priceFactorWeight
                : 1;

            const serviceRate =
              item.arrivals >
              0
                ? item.served /
                  item.arrivals
                : 1;

            const rejectionRate =
              item.arrivals >
              0
                ? item.rejected /
                  item.arrivals
                : 0;

            const retentionMultiplier =
              this
                .getSegmentDemandMultiplier(
                  restaurantId,
                  item.segmentId,
                  days
                );

            let primaryDriver =
              "balanced";

            if (
              averagePriceFactor <
              0.94
            ) {
              primaryDriver =
                "price";
            } else if (
              rejectionRate >
              0.14
            ) {
              primaryDriver =
                "queue";
            } else if (
              serviceRate <
              0.78
            ) {
              primaryDriver =
                "capacity";
            } else if (
              retentionMultiplier >
              1.04
            ) {
              primaryDriver =
                "positive_experience";
            }

            return {
              ...item,

              averagePriceFactor:
                Number(
                  averagePriceFactor
                    .toFixed(3)
                ),

              priceTrafficImpact:
                Number(
                  (
                    (
                      averagePriceFactor -
                      1
                    ) *
                    100
                  ).toFixed(1)
                ),

              retentionMultiplier,

              retentionImpact:
                Number(
                  (
                    (
                      retentionMultiplier -
                      1
                    ) *
                    100
                  ).toFixed(1)
                ),

              serviceRate:
                Number(
                  (
                    serviceRate *
                    100
                  ).toFixed(1)
                ),

              rejectionRate:
                Number(
                  (
                    rejectionRate *
                    100
                  ).toFixed(1)
                ),

              averageQuality:
                item.qualityCount >
                0
                  ? Math.round(
                      item.qualityTotal /
                      item.qualityCount
                    )
                  : 0,

              averageSpend:
                item.served >
                0
                  ? Math.round(
                      item.revenue /
                      item.served
                    )
                  : 0,

              primaryDriver,

              primaryDriverLabel:
                CAUSE_LABELS[
                  primaryDriver
                ] ??
                primaryDriver
            };
          }
        )
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );

    const segmentRows =
      entitySystem.filter(
        "segment_experience_daily",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.day >=
            Math.max(
              1,
              gameState
                .getSection(
                  "time"
                )
                .day -
              days +
              1
            )
      );

    const segmentMap =
      new Map();

    for (
      const item
      of segmentRows
    ) {
      const current =
        segmentMap.get(
          item.segmentId
        ) ?? {
          segmentId:
            item.segmentId,
          arrivals: 0,
          served: 0,
          revenue: 0,
          satisfactionTotal: 0,
          satisfactionCount: 0
        };

      current.arrivals +=
        item.arrivals ?? 0;

      current.served +=
        item.served ?? 0;

      current.revenue +=
        item.revenue ?? 0;

      current.satisfactionTotal +=
        item.satisfactionTotal ??
        0;

      current.satisfactionCount +=
        item.satisfactionCount ??
        0;

      segmentMap.set(
        item.segmentId,
        current
      );
    }

    const segmentSummary =
      [
        ...segmentMap.values()
      ]
        .map(
          item => ({
            ...item,

            satisfaction:
              item.satisfactionCount >
              0
                ? Math.round(
                    item
                      .satisfactionTotal /
                    item
                      .satisfactionCount
                  )
                : 0,

            serviceRate:
              item.arrivals > 0
                ? Number(
                    (
                      item.served /
                      item.arrivals *
                      100
                    ).toFixed(1)
                  )
                : 0,

            demandMultiplier:
              this
                .getSegmentDemandMultiplier(
                  restaurantId,
                  item.segmentId,
                  days
                )
          })
        )
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );

    return {
      restaurantId,
      days,
      hours:
        rows.length,

      segmentSummary,

      segmentImpact,

      arrivals,
      served,
      rejected,
      revenue,

      serviceRate:
        arrivals > 0
          ? Number(
              (
                served /
                arrivals *
                100
              ).toFixed(1)
            )
          : 0,

      averageSatisfaction:
        rows.length > 0
          ? Math.round(
              satisfactionTotal /
              rows.length
            )
          : 0,

      averageWaitMinutes:
        rows.length > 0
          ? Number(
              (
                waitTotal /
                rows.length
              ).toFixed(1)
            )
          : 0,

      topCause:
        causes[0] ??
        null,

      causes,

      latest:
        rows.at(-1) ??
        null
    };
  }
}

export const businessCausalitySystem =
  new BusinessCausalitySystem();

export {
  BusinessCausalitySystem,
  CAUSE_LABELS
};
