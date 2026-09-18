import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { priceHistorySystem } from "./PriceHistorySystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";

function changePercent(
  current,
  previous
) {
  const a =
    Number(current) || 0;

  const b =
    Number(previous) || 0;

  if (b === 0) {
    return a === 0
      ? 0
      : null;
  }

  return Number(
    (
      (
        a - b
      ) /
      Math.abs(b) *
      100
    ).toFixed(1)
  );
}

function round(
  value,
  digits = 1
) {
  return Number(
    (
      Number(value) || 0
    ).toFixed(digits)
  );
}

class PricingDecisionImpactSystem {
  getDishName(
    history
  ) {
    try {
      const dish =
        dishCatalogSystem.get(
          history.dishId
        );

      if (dish?.name) {
        return dish.name;
      }
    } catch {}

    const custom =
      entitySystem.get(
        "custom_dish",
        history.dishId
      );

    return (
      custom?.name ??
      history.dishId
    );
  }


  getCausalityRows(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "business_causality_hour",
        row =>
          row.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          a.totalMinutes -
          b.totalMinutes
      );
  }


  getOrders(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "customer_order",
        order =>
          order.restaurantId ===
            restaurantId &&
          order.status ===
            "completed"
      )
      .sort(
        (a, b) =>
          (
            a.createdAt ??
            0
          ) -
          (
            b.createdAt ??
            0
          )
      );
  }


  getWindowRows({
    rows,
    decisionMinutes,
    direction,
    hours
  }) {
    if (
      direction ===
      "before"
    ) {
      return rows
        .filter(
          row =>
            row.totalMinutes <
            decisionMinutes
        )
        .slice(
          -hours
        );
    }

    return rows
      .filter(
        row =>
          row.totalMinutes >
          decisionMinutes
      )
      .slice(
        0,
        hours
      );
  }


  getOrdersForRows(
    rows,
    orders
  ) {
    if (
      rows.length ===
      0
    ) {
      return [];
    }

    const start =
      rows[0]
        .totalMinutes;

    const end =
      rows[
        rows.length - 1
      ].totalMinutes;

    return orders.filter(
      order => {
        const createdAt =
          order.createdAt ??
          0;

        return (
          createdAt >=
            start &&
          createdAt <=
            end
        );
      }
    );
  }


  summarizeWindow(
    rows,
    orders
  ) {
    if (
      rows.length ===
      0
    ) {
      return {
        hours: 0,
        arrivals: 0,
        served: 0,
        rejected: 0,
        orders: 0,
        revenue: 0,
        grossProfit: 0,
        averageSpend: 0,
        averageWaitMinutes: 0,
        satisfaction: 0,
        reviewScore: null,
        repeatRate: null,
        reputation: null
      };
    }

    const totals =
      rows.reduce(
        (sum, row) => {
          sum.arrivals +=
            row.outcomes
              ?.arrivals ??
            0;

          sum.served +=
            row.outcomes
              ?.served ??
            0;

          sum.rejected +=
            row.outcomes
              ?.rejected ??
            0;

          sum.revenue +=
            row.outcomes
              ?.revenue ??
            0;

          sum.wait +=
            row.experience
              ?.estimatedWaitMinutes ??
            0;

          sum.satisfaction +=
            row.experience
              ?.satisfaction ??
            0;

          return sum;
        },
        {
          arrivals: 0,
          served: 0,
          rejected: 0,
          revenue: 0,
          wait: 0,
          satisfaction: 0
        }
      );

    let orderCount = 0;
    let grossProfit = 0;

    for (
      const order
      of orders
    ) {
      orderCount +=
        order.aggregate
          ? Math.max(
              1,
              Math.round(
                order.orderCount ??
                1
              )
            )
          : 1;

      grossProfit +=
        Number(
          order.grossProfit
        ) ||
        0;
    }

    const last =
      rows[
        rows.length - 1
      ];

    return {
      hours:
        rows.length,

      arrivals:
        totals.arrivals,

      served:
        totals.served,

      rejected:
        totals.rejected,

      orders:
        orderCount,

      revenue:
        Math.round(
          totals.revenue
        ),

      grossProfit:
        Math.round(
          grossProfit
        ),

      averageSpend:
        totals.served >
        0
          ? Math.round(
              totals.revenue /
              totals.served
            )
          : 0,

      averageWaitMinutes:
        round(
          totals.wait /
          rows.length,
          1
        ),

      satisfaction:
        Math.round(
          totals.satisfaction /
          rows.length
        ),

      reviewScore:
        Number.isFinite(
          last.feedback
            ?.reviewScore
        )
          ? round(
              last.feedback
                .reviewScore,
              2
            )
          : null,

      repeatRate:
        Number.isFinite(
          last.feedback
            ?.repeatRate
        )
          ? round(
              last.feedback
                .repeatRate,
              1
            )
          : null,

      reputation:
        Number.isFinite(
          last.feedback
            ?.reputation
        )
          ? round(
              last.feedback
                .reputation,
              1
            )
          : null
    };
  }


  summarizeSegmentWindow(
    rows
  ) {
    const map =
      new Map();

    for (
      const row
      of rows
    ) {
      for (
        const item
        of row.outcomes
          ?.segmentOutcomes ??
        []
      ) {
        const current =
          map.get(
            item.segmentId
          ) ?? {
            segmentId:
              item.segmentId,

            hours:
              0,

            arrivals:
              0,

            served:
              0,

            revenue:
              0,

            priceFactorTotal:
              0,

            priceFactorWeight:
              0
          };

        const weight =
          Math.max(
            0.01,
            Number(
              item.expectedVisitors
            ) ||
            Number(
              item.arrivals
            ) ||
            1
          );

        current.hours +=
          1;

        current.arrivals +=
          Number(
            item.arrivals
          ) ||
          0;

        current.served +=
          Number(
            item.served
          ) ||
          0;

        current.revenue +=
          Number(
            item.revenue
          ) ||
          0;

        current.priceFactorTotal +=
          (
            Number(
              item.priceFactor
            ) ||
            1
          ) *
          weight;

        current.priceFactorWeight +=
          weight;

        map.set(
          item.segmentId,
          current
        );
      }
    }

    return map;
  }


  compareSegments(
    beforeRows,
    afterRows
  ) {
    const before =
      this.summarizeSegmentWindow(
        beforeRows
      );

    const after =
      this.summarizeSegmentWindow(
        afterRows
      );

    const ids =
      new Set([
        ...before.keys(),
        ...after.keys()
      ]);

    return [
      ...ids
    ]
      .map(
        segmentId => {
          const a =
            before.get(
              segmentId
            ) ?? {
              hours: 0,
              arrivals: 0,
              served: 0,
              revenue: 0,
              priceFactorTotal: 0,
              priceFactorWeight: 0
            };

          const b =
            after.get(
              segmentId
            ) ?? {
              hours: 0,
              arrivals: 0,
              served: 0,
              revenue: 0,
              priceFactorTotal: 0,
              priceFactorWeight: 0
            };

          const beforePerHour =
            a.hours >
            0
              ? a.arrivals /
                a.hours
              : 0;

          const afterPerHour =
            b.hours >
            0
              ? b.arrivals /
                b.hours
              : 0;

          const afterPriceFactor =
            b.priceFactorWeight >
            0
              ? b.priceFactorTotal /
                b.priceFactorWeight
              : 1;

          return {
            segmentId,

            beforeArrivalsPerHour:
              round(
                beforePerHour,
                2
              ),

            afterArrivalsPerHour:
              round(
                afterPerHour,
                2
              ),

            actualTrafficChange:
              changePercent(
                afterPerHour,
                beforePerHour
              ),

            directPriceImpact:
              round(
                (
                  afterPriceFactor -
                  1
                ) *
                100,
                1
              ),

            beforeAverageSpend:
              a.served >
              0
                ? Math.round(
                    a.revenue /
                    a.served
                  )
                : 0,

            afterAverageSpend:
              b.served >
              0
                ? Math.round(
                    b.revenue /
                    b.served
                  )
                : 0
          };
        }
      )
      .sort(
        (a, b) =>
          Math.abs(
            b.actualTrafficChange ??
            0
          ) -
          Math.abs(
            a.actualTrafficChange ??
            0
          )
      );
  }


  buildDelta(
    before,
    after
  ) {
    return {
      orders:
        changePercent(
          after.orders,
          before.orders
        ),

      revenue:
        changePercent(
          after.revenue,
          before.revenue
        ),

      grossProfit:
        changePercent(
          after.grossProfit,
          before.grossProfit
        ),

      averageSpend:
        changePercent(
          after.averageSpend,
          before.averageSpend
        ),

      waitMinutes:
        round(
          after
            .averageWaitMinutes -
          before
            .averageWaitMinutes,
          1
        ),

      satisfaction:
        after.satisfaction -
        before.satisfaction,

      reviewScore:
        (
          after.reviewScore ===
            null ||
          before.reviewScore ===
            null
        )
          ? null
          : round(
              after.reviewScore -
              before.reviewScore,
              2
            ),

      repeatRate:
        (
          after.repeatRate ===
            null ||
          before.repeatRate ===
            null
        )
          ? null
          : round(
              after.repeatRate -
              before.repeatRate,
              1
            )
    };
  }


  getRecentDecisions(
    restaurantId,
    {
      days = 14,
      windowHours = 6,
      limit = 5
    } = {}
  ) {
    const history =
      priceHistorySystem
        .listRecent(
          restaurantId,
          days
        )
        .slice()
        .reverse()
        .slice(
          0,
          limit
        );

    const rows =
      this.getCausalityRows(
        restaurantId
      );

    const orders =
      this.getOrders(
        restaurantId
      );

    return history.map(
      item => {
        const beforeRows =
          this.getWindowRows({
            rows,
            decisionMinutes:
              item.totalMinutes,

            direction:
              "before",

            hours:
              windowHours
          });

        const afterRows =
          this.getWindowRows({
            rows,
            decisionMinutes:
              item.totalMinutes,

            direction:
              "after",

            hours:
              windowHours
          });

        const beforeOrders =
          this.getOrdersForRows(
            beforeRows,
            orders
          );

        const afterOrders =
          this.getOrdersForRows(
            afterRows,
            orders
          );

        const before =
          this.summarizeWindow(
            beforeRows,
            beforeOrders
          );

        const after =
          this.summarizeWindow(
            afterRows,
            afterOrders
          );

        const hasComparison =
          before.hours >
            0 &&
          after.hours >
            0;

        return {
          id:
            item.id,

          restaurantId,

          menuItemId:
            item.menuItemId,

          dishId:
            item.dishId,

          dishName:
            this.getDishName(
              item
            ),

          day:
            item.day,

          totalMinutes:
            item.totalMinutes,

          previousPrice:
            item.previousPrice,

          nextPrice:
            item.nextPrice,

          priceChangePercent:
            round(
              item.changeRate *
              100,
              1
            ),

          direction:
            item.changeRate >
            0
              ? "increase"
              : item.changeRate <
                0
                ? "decrease"
                : "unchanged",

          windowHours,

          hasComparison,

          confidence:
            (
              before.hours >=
                4 &&
              after.hours >=
                4
            )
              ? "strong"
              : (
                  before.hours >=
                    2 &&
                  after.hours >=
                    2
                )
                ? "early"
                : "collecting",

          before,

          after,

          delta:
            hasComparison
              ? this.buildDelta(
                  before,
                  after
                )
              : null,

          segments:
            this.compareSegments(
              beforeRows,
              afterRows
            )
        };
      }
    );
  }


  getLatestDecision(
    restaurantId,
    options = {}
  ) {
    return (
      this.getRecentDecisions(
        restaurantId,
        {
          ...options,
          limit: 1
        }
      )[0] ??
      null
    );
  }


  getStatus(
    restaurantId
  ) {
    const time =
      gameState.getSection(
        "time"
      );

    const latest =
      this.getLatestDecision(
        restaurantId
      );

    return {
      restaurantId,
      day:
        time.day,
      latest
    };
  }
}

export const pricingDecisionImpactSystem =
  new PricingDecisionImpactSystem();

export {
  PricingDecisionImpactSystem,
  changePercent
};
