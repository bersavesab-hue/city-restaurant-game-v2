import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { schedulerSystem } from "../core/SchedulerSystem.js";
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

  purchase({
    restaurantId,
    supplierId,
    ingredientId,
    quantity
  }) {
    const quote =
      supplierSystem.getQuote(
        supplierId,
        ingredientId,
        quantity
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

    const time =
      gameState.getSection("time");

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

          deliveryMinutes:
            quote.deliveryMinutes,

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
          order.id
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

    const updated =
      entitySystem.update(
        "procurement_order",
        order.id,
        {
          status:
            ORDER_STATUS.CANCELLED
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

  get(orderId) {
    return requireOrder(orderId);
  }

  listByRestaurant(
    restaurantId,
    status = null
  ) {
    return entitySystem
      .list(
        "procurement_order"
      )
      .filter(
        (order) =>
          order.restaurantId ===
          restaurantId
      )
      .filter(
        (order) =>
          status === null ||
          order.status === status
      );
  }
}

export const procurementSystem =
  new ProcurementSystem();

export {
  ProcurementSystem,
  ORDER_STATUS as PROCUREMENT_ORDER_STATUS
};
