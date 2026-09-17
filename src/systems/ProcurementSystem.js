import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { schedulerSystem } from "../core/SchedulerSystem.js";
import { randomSystem } from "../core/RandomSystem.js";
import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";
import { supplierSystem } from "./SupplierSystem.js";
import { inventorySystem } from "./InventorySystem.js";

const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
});

function requireOrder(orderId) {
  const order =
    entitySystem.get(
      "procurement_order",
      orderId
    );

  if (!order) {
    throw new Error(
      `Procurement order "${orderId}" does not exist`
    );
  }

  return order;
}

class ProcurementSystem {
  constructor() {
    eventBus.on(
      "scheduler:triggered",
      ({ task }) => {
        if (
          task.action ===
          "procurement:deliver"
        ) {
          this.receive(
            task.payload.orderId
          );
        }
      }
    );
  }

  getOrderedQuantityForDay(supplierId, ingredientId, day) {
    return entitySystem
      .filter(
        "procurement_order",
        (order) =>
          order.supplierId === supplierId &&
          order.ingredientId === ingredientId &&
          order.status !== ORDER_STATUS.CANCELLED &&
          order.orderDay === day
      )
      .reduce(
        (sum, order) =>
          sum + order.quantity,
        0
      );
  }

  getRemainingDailyCapacity(supplierId, ingredientId, day = null) {
    const offer = supplierSystem.getOffer(supplierId, ingredientId);
    if (!offer) return 0;

    const currentDay =
      day ?? gameState.getSection("time").day;

    return Math.max(
      0,
      offer.capacityPerDay -
      this.getOrderedQuantityForDay(
        supplierId,
        ingredientId,
        currentDay
      )
    );
  }

  calculateDeliveryMinutes(baseMinutes, reliability) {
    if (reliability >= 100) {
      return {
        delayed: false,
        delayMinutes: 0,
        deliveryMinutes: baseMinutes
      };
    }

    const onTime =
      randomSystem.int(1, 100) <= reliability;

    if (onTime) {
      return {
        delayed: false,
        delayMinutes: 0,
        deliveryMinutes: baseMinutes
      };
    }

    const delayMinutes =
      randomSystem.int(60, 360);

    return {
      delayed: true,
      delayMinutes,
      deliveryMinutes:
        baseMinutes + delayMinutes
    };
  }

  purchase({
    restaurantId,
    supplierId,
    ingredientId,
    quantity
  }) {
    const time =
      gameState.getSection("time");

    const remainingCapacity =
      this.getRemainingDailyCapacity(
        supplierId,
        ingredientId,
        time.day
      );

    if (quantity > remainingCapacity) {
      throw new Error(
        `Remaining daily supply capacity is ${remainingCapacity}`
      );
    }

    const quote =
      supplierSystem.getQuote(
        supplierId,
        ingredientId,
        quantity
      );

    const delivery =
      this.calculateDeliveryMinutes(
        quote.deliveryMinutes,
        quote.reliability
      );

    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    if (
      balance <
      quote.totalPrice
    ) {
      throw new Error(
        `Insufficient funds: balance ${balance}, required ${quote.totalPrice}`
      );
    }

    const payment =
      financeSystem.expense(
        restaurantId,
        quote.totalPrice,
        FINANCE_CATEGORY.INGREDIENT,
        `采购 ${ingredientId} × ${quantity}`
      );

    const order =
      entitySystem.create(
        "procurement_order",
        {
          restaurantId,
          supplierId,
          ingredientId,

          quantity:
            quote.quantity,

          unit:
            quote.unit,

          unitPrice:
            quote.unitPrice,

          totalPrice:
            quote.totalPrice,

          quality:
            quote.quality,

          reliability:
            quote.reliability,

          baseDeliveryMinutes:
            delivery.deliveryMinutes,

          deliveryMinutes:
            delivery.deliveryMinutes,

          delayed:
            delivery.delayed,

          delayMinutes:
            delivery.delayMinutes,

          orderDay:
            time.day,

          status:
            ORDER_STATUS.PENDING,

          orderedAt:
            time.totalMinutes,

          expectedAt:
            time.totalMinutes +
            quote.deliveryMinutes,

          deliveredAt: null,

          transactionId:
            payment.transaction.id,

          inventoryBatchId:
            null,

          schedulerTaskId:
            null
        }
      );

    const task =
      schedulerSystem.scheduleAfter(
        quote.deliveryMinutes,
        "procurement:deliver",
        {
          orderId:
            order.id
        }
      );

    const updated =
      entitySystem.update(
        "procurement_order",
        order.id,
        {
          schedulerTaskId:
            task.id
        }
      );

    eventBus.emit(
      "procurement:ordered",
      {
        order:
          structuredClone(
            updated
          )
      }
    );

    return updated;
  }

  receive(orderId) {
    const order =
      requireOrder(orderId);

    if (
      order.status ===
      ORDER_STATUS.DELIVERED
    ) {
      return order;
    }

    if (
      order.status !==
      ORDER_STATUS.PENDING
    ) {
      throw new Error(
        `Order "${orderId}" cannot be delivered from status "${order.status}"`
      );
    }

    const batch =
      inventorySystem.addBatch({
        restaurantId:
          order.restaurantId,

        ingredientId:
          order.ingredientId,

        quantity:
          order.quantity,

        quality:
          order.quality,

        sourceType:
          "procurement",

        sourceId:
          order.id,

        unitCost:
          order.unitPrice
      });

    const time =
      gameState.getSection("time");

    const updated =
      entitySystem.update(
        "procurement_order",
        order.id,
        {
          status:
            ORDER_STATUS.DELIVERED,

          deliveredAt:
            time.totalMinutes,

          inventoryBatchId:
            batch.id
        }
      );

    eventBus.emit(
      "procurement:delivered",
      {
        order:
          structuredClone(
            updated
          ),

        batch:
          structuredClone(
            batch
          )
      }
    );

    return updated;
  }

  cancel(orderId) {
    const order =
      requireOrder(orderId);

    if (
      order.status !==
      ORDER_STATUS.PENDING
    ) {
      throw new Error(
        `Only pending orders can be cancelled`
      );
    }

    if (
      order.schedulerTaskId
    ) {
      schedulerSystem.cancel(
        order.schedulerTaskId
      );
    }

    const refund =
      financeSystem.refundExpense(
        order.restaurantId,
        order.totalPrice,
        FINANCE_CATEGORY.REFUND,
        `取消采购退款 ${order.ingredientId}`
      );

    const time =
      gameState.getSection("time");

    const updated =
      entitySystem.update(
        "procurement_order",
        order.id,
        {
          status:
            ORDER_STATUS.CANCELLED,

          cancelledAt:
            time.totalMinutes,

          refundTransactionId:
            refund.transaction.id
        }
      );

    eventBus.emit(
      "procurement:cancelled",
      {
        orderId
      }
    );

    return updated;
  }

  getPendingQuantity(
    restaurantId,
    ingredientId
  ) {
    return this
      .listByRestaurant(
        restaurantId,
        ORDER_STATUS.PENDING
      )
      .filter(
        (order) =>
          order.ingredientId ===
          ingredientId
      )
      .reduce(
        (total, order) =>
          total + order.quantity,
        0
      );
  }

  pruneHistory(
    restaurantId,
    retentionDays = 30
  ) {
    const cutoff =
      gameState
        .getSection("time")
        .totalMinutes -
      retentionDays * 1440;

    const removable =
      entitySystem.filter(
        "procurement_order",
        (order) => {
          if (
            order.restaurantId !==
            restaurantId ||
            order.status ===
            ORDER_STATUS.PENDING
          ) {
            return false;
          }

          const finishedAt =
            order.deliveredAt ??
            order.cancelledAt ??
            order.orderedAt;

          if (finishedAt > cutoff) {
            return false;
          }

          if (
            order.inventoryBatchId &&
            entitySystem.get(
              "inventory_batch",
              order.inventoryBatchId
            )
          ) {
            return false;
          }

          return true;
        }
      );

    return entitySystem.removeMany(
      "procurement_order",
      removable.map(
        order => order.id
      )
    );
  }

  get(orderId) {
    return requireOrder(orderId);
  }

  listByRestaurant(
    restaurantId,
    status = null
  ) {
    return entitySystem.filter(
      "procurement_order",
      (order) =>
        order.restaurantId ===
          restaurantId &&
        (
          status === null ||
          order.status === status
        )
    );
  }
}

export const procurementSystem =
  new ProcurementSystem();

export {
  ProcurementSystem,
  ORDER_STATUS as PROCUREMENT_ORDER_STATUS
};
