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

    return {
      restaurantId,
      days,
      hours:
        rows.length,

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
