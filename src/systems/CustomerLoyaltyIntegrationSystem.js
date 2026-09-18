import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  customerSystem
} from "./CustomerSystem.js";

import {
  customerIdentitySystem
} from "./CustomerIdentitySystem.js";

import {
  customerLoyaltySystem
} from "./CustomerLoyaltySystem.js";


class CustomerLoyaltyIntegrationSystem {
  constructor() {
    this.started = false;
    this.unsubscribe = null;

    this.start();
  }


  start() {
    if (this.started) {
      return false;
    }

    this.unsubscribe =
      eventBus.on(
        "order:completed",
        payload => {
          const order =
            payload?.order;

          if (!order) {
            return;
          }

          this.processOrder(
            order
          );
        }
      );

    this.started = true;

    return true;
  }


  isProcessed(orderId) {
    return entitySystem
      .filter(
        "loyalty_order_record",
        item =>
          item.orderId ===
          orderId
      )
      .length > 0;
  }


  markProcessed(
    order,
    mode
  ) {
    return entitySystem.create(
      "loyalty_order_record",
      {
        orderId:
          order.id,

        restaurantId:
          order.restaurantId,

        customerId:
          order.customerId ??
          null,

        mode
      }
    );
  }


  getDishIds(order) {
    const result = [];

    for (
      const item
      of order.items ?? []
    ) {
      const quantity =
        Math.max(
          1,
          Math.floor(
            item.quantity ?? 1
          )
        );

      for (
        let index = 0;
        index < quantity;
        index += 1
      ) {
        if (item.dishId) {
          result.push(
            item.dishId
          );
        }
      }
    }

    return result;
  }


  canAutoEnroll(
    restaurantId
  ) {
    return customerIdentitySystem
      .isMembershipEnabled(
        restaurantId
      );
  }


  resolveMember({
    restaurantId,
    customerId,
    segmentId,
    satisfaction,
    spend
  }) {
    let member =
      customerLoyaltySystem
        .findMember(
          restaurantId,
          customerId
        );

    if (
      !member &&
      segmentId &&
      this.canAutoEnroll(
        restaurantId
      ) &&
      customerLoyaltySystem
        .shouldAutoEnroll({
          segmentId,
          satisfaction,
          spend
        })
    ) {
      member =
        customerLoyaltySystem
          .enrollMember({
            restaurantId,
            customerId,
            segmentId,
            source:
              "behavioral_auto"
          });
    }

    return member;
  }


  processAggregateOrder({
    order,
    satisfaction,
    revenue
  }) {
    const visitors =
      Math.max(
        1,
        Math.round(
          order.orderCount ??
          1
        )
      );

    const segmentId =
      order.customerSegmentId ??
      order.segmentId ??
      "general";

    const recognized =
      customerIdentitySystem
        .resolveAggregateVisits({
          restaurantId:
            order.restaurantId,
          segmentId,
          visitors
        });

    const spendPerVisit =
      Math.max(
        0,
        Math.round(
          revenue /
          visitors
        )
      );

    const dishIds =
      [
        ...new Set(
          this.getDishIds(
            order
          )
        )
      ];

    let memberVisits = 0;
    let memberRevenue = 0;

    for (
      let index = 0;
      index < recognized.length;
      index += 1
    ) {
      const customer =
        recognized[index]
          .customer;

      const syntheticOrderId =
        `${order.id}:recognized:${index}`;

      customerSystem.recordVisit({
        customerId:
          customer.id,
        restaurantId:
          order.restaurantId,
        orderId:
          syntheticOrderId,
        spend:
          spendPerVisit,
        satisfaction
      });

      const member =
        this.resolveMember({
          restaurantId:
            order.restaurantId,
          customerId:
            customer.id,
          segmentId,
          satisfaction,
          spend:
            spendPerVisit
        });

      if (!member) {
        continue;
      }

      customerLoyaltySystem
        .recordMemberVisit({
          restaurantId:
            order.restaurantId,
          customerId:
            customer.id,
          spend:
            spendPerVisit,
          satisfaction,
          orderId:
            syntheticOrderId,
          dishIds,
          segmentId
        });

      memberVisits += 1;
      memberRevenue +=
        spendPerVisit;
    }

    const anonymousVisitors =
      Math.max(
        0,
        visitors -
        memberVisits
      );

    if (
      anonymousVisitors > 0
    ) {
      customerLoyaltySystem
        .recordAnonymousTraffic({
          restaurantId:
            order.restaurantId,
          segmentId,
          visitors:
            anonymousVisitors,
          served:
            anonymousVisitors,
          revenue:
            Math.max(
              0,
              revenue -
              memberRevenue
            ),
          satisfaction
        });
    }

    this.markProcessed(
      order,
      memberVisits > 0
        ? "aggregate_mixed"
        : "cohort"
    );

    return {
      processed: true,

      mode:
        memberVisits > 0
          ? "aggregate_mixed"
          : "cohort",

      visitors,
      recognizedVisits:
        recognized.length,
      memberVisits,
      anonymousVisitors
    };
  }


  processOrder(order) {
    if (
      !order?.id ||
      !order.restaurantId
    ) {
      return {
        processed: false,
        reason: "invalid_order"
      };
    }

    if (
      this.isProcessed(
        order.id
      )
    ) {
      return {
        processed: false,
        reason: "duplicate"
      };
    }

    const satisfaction =
      Number.isFinite(
        order.averageQuality
      )
        ? order.averageQuality
        : 70;

    const revenue =
      Math.max(
        0,
        Math.round(
          order.totalRevenue ??
          0
        )
      );

    if (order.aggregate) {
      return this
        .processAggregateOrder({
          order,
          satisfaction,
          revenue
        });
    }

    if (order.customerId) {
      const segmentId =
        order.customerSegmentId ??
        order.segmentId ??
        null;

      const resolvedMember =
        this.resolveMember({
          restaurantId:
            order.restaurantId,
          customerId:
            order.customerId,
          segmentId,
          satisfaction,
          spend:
            revenue
        });

      if (resolvedMember) {
        customerLoyaltySystem
          .recordMemberVisit({
            restaurantId:
              order.restaurantId,
            customerId:
              order.customerId,
            spend:
              revenue,
            satisfaction,
            orderId:
              order.id,
            dishIds:
              this.getDishIds(
                order
              ),
            segmentId
          });

        this.markProcessed(
          order,
          "member"
        );

        return {
          processed: true,
          mode: "member"
        };
      }
    }

    customerLoyaltySystem
      .recordAnonymousTraffic({
        restaurantId:
          order.restaurantId,

        segmentId:
          order.customerSegmentId ??
          order.segmentId ??
          "general",

        visitors: 1,
        served: 1,
        revenue,
        satisfaction
      });

    this.markProcessed(
      order,
      "cohort"
    );

    return {
      processed: true,
      mode: "cohort"
    };
  }
}


export const customerLoyaltyIntegrationSystem =
  new CustomerLoyaltyIntegrationSystem();


export {
  CustomerLoyaltyIntegrationSystem
};
