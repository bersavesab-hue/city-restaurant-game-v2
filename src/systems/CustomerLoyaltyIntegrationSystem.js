import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

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

    if (order.customerId) {
      const member =
        customerLoyaltySystem
          .findMember(
            order.restaurantId,
            order.customerId
          );

      let resolvedMember =
        member;

      const segmentId =
        order.customerSegmentId ??
        order.segmentId ??
        null;

      if (
        !resolvedMember &&
        segmentId &&
        customerLoyaltySystem
          .shouldAutoEnroll({
            segmentId,
            satisfaction,
            spend:
              revenue
          })
      ) {
        resolvedMember =
          customerLoyaltySystem
            .enrollMember({
              restaurantId:
                order.restaurantId,

              customerId:
                order.customerId,

              segmentId,

              source:
                "behavioral_auto"
            });
      }

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

    const visitors =
      order.aggregate
        ? Math.max(
            1,
            Math.round(
              order.orderCount ??
              1
            )
          )
        : 1;

    customerLoyaltySystem
      .recordAnonymousTraffic({
        restaurantId:
          order.restaurantId,

        segmentId:
          order.customerSegmentId ??
          order.segmentId ??
          "general",

        visitors,

        served:
          visitors,

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
