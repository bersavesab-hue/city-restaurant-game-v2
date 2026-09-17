import { entitySystem } from "../core/EntitySystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { supplierSystem } from "./SupplierSystem.js";
import { procurementSystem } from "./ProcurementSystem.js";

class AutoProcurementSystem {
  findPolicy(
    restaurantId,
    ingredientId
  ) {
    return entitySystem
      .list("restock_policy")
      .find(
        (item) =>
          item.restaurantId === restaurantId &&
          item.ingredientId === ingredientId
      );
  }

  setPolicy({
    restaurantId,
    ingredientId,
    supplierId,
    minimumQuantity,
    targetQuantity,
    enabled = true
  }) {
    const offer =
      supplierSystem.getOffer(
        supplierId,
        ingredientId
      );

    if (!offer) {
      throw new Error(
        "Supplier does not provide ingredient"
      );
    }

    if (
      minimumQuantity < 0 ||
      targetQuantity <= minimumQuantity
    ) {
      throw new Error(
        "Invalid restock quantities"
      );
    }

    const existing =
      this.findPolicy(
        restaurantId,
        ingredientId
      );

    const data = {
      restaurantId,
      ingredientId,
      supplierId,
      minimumQuantity,
      targetQuantity,
      enabled: Boolean(enabled)
    };

    if (existing) {
      return entitySystem.update(
        "restock_policy",
        existing.id,
        data
      );
    }

    return entitySystem.create(
      "restock_policy",
      data
    );
  }

  listPolicies(restaurantId) {
    return entitySystem
      .list("restock_policy")
      .filter(
        (item) =>
          item.restaurantId === restaurantId &&
          item.enabled
      );
  }

  processRestaurant(restaurantId) {
    const orders = [];

    for (
      const policy
      of this.listPolicies(restaurantId)
    ) {
      const available =
        inventorySystem.getAvailableQuantity(
          restaurantId,
          policy.ingredientId
        );

      const pending =
        procurementSystem.getPendingQuantity(
          restaurantId,
          policy.ingredientId
        );

      const effectiveStock =
        available + pending;

      if (
        effectiveStock >
        policy.minimumQuantity
      ) {
        continue;
      }

      const offer =
        supplierSystem.getOffer(
          policy.supplierId,
          policy.ingredientId
        );

      if (!offer) {
        continue;
      }

      const remainingCapacity =
        procurementSystem
          .getRemainingDailyCapacity(
            policy.supplierId,
            policy.ingredientId
          );

      let quantity =
        policy.targetQuantity -
        effectiveStock;

      quantity = Math.max(
        quantity,
        offer.minimumOrder
      );

      quantity = Math.min(
        quantity,
        remainingCapacity
      );

      if (
        quantity <
        offer.minimumOrder
      ) {
        continue;
      }

      try {
        const order =
          procurementSystem.purchase({
            restaurantId,
            supplierId:
              policy.supplierId,
            ingredientId:
              policy.ingredientId,
            quantity
          });

        orders.push(order);
      } catch {
        // 余额不足、供应容量不足等，
        // 本小时跳过，下小时重新检查。
      }
    }

    return orders;
  }
}

export const autoProcurementSystem =
  new AutoProcurementSystem();

export { AutoProcurementSystem };
