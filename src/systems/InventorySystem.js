import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";
import {
  getFreshnessState,
  DEFAULT_INGREDIENT_BATCH_QUALITY
} from "../data/ingredientRules.js";

const BATCH_STATUS = Object.freeze({
  ACTIVE: "active",
  DEPLETED: "depleted",
  DISCARDED: "discarded"
});

function requireRestaurant(restaurantId) {
  const restaurant =
    entitySystem.get("restaurant", restaurantId);

  if (!restaurant) {
    throw new Error(
      `Restaurant "${restaurantId}" does not exist`
    );
  }

  return restaurant;
}

function requireIngredient(ingredientId) {
  const ingredient =
    ingredientCatalogSystem.get(ingredientId);

  if (!ingredient) {
    throw new Error(
      `Ingredient "${ingredientId}" does not exist`
    );
  }

  return ingredient;
}

function requirePositiveQuantity(quantity) {
  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    throw new RangeError(
      "Quantity must be a positive number"
    );
  }
}

class InventorySystem {
  getCurrentMinute() {
    return gameState.getSection("time").totalMinutes;
  }

  calculateFreshness(batch) {
    const now =
      this.getCurrentMinute();

    if (now >= batch.expiresAt) {
      return 0;
    }

    const lifetime =
      batch.expiresAt -
      batch.receivedAt;

    if (lifetime <= 0) {
      return 0;
    }

    const remaining =
      batch.expiresAt - now;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (remaining / lifetime) * 100
        )
      )
    );
  }

  decorateBatch(batch) {
    const freshness =
      this.calculateFreshness(batch);

    return {
      ...structuredClone(batch),
      freshness,
      freshnessState:
        getFreshnessState(freshness),
      spoiled:
        freshness === 0
    };
  }

  addBatch({
    restaurantId,
    ingredientId,
    quantity,
    quality = null,
    shelfLifeDays = null,
    sourceType = "manual",
    sourceId = null,
    unitCost = null,
    storageType = null
  }) {
    requireRestaurant(restaurantId);

    const ingredient =
      requireIngredient(ingredientId);

    requirePositiveQuantity(quantity);

    const finalQuality =
      quality ??
      DEFAULT_INGREDIENT_BATCH_QUALITY;

    if (
      !Number.isInteger(finalQuality) ||
      finalQuality < 1 ||
      finalQuality > 5
    ) {
      throw new RangeError(
        "Ingredient quality must be between 1 and 5"
      );
    }

    const finalShelfLife =
      shelfLifeDays ??
      ingredient.shelfLifeDays;

    if (
      !Number.isInteger(finalShelfLife) ||
      finalShelfLife <= 0
    ) {
      throw new RangeError(
        "Shelf life must be a positive integer"
      );
    }

    const finalUnitCost =
      unitCost ??
      ingredient.basePurchasePrice;

    if (
      typeof finalUnitCost !== "number" ||
      !Number.isFinite(finalUnitCost) ||
      finalUnitCost < 0
    ) {
      throw new RangeError(
        "Unit cost must be non-negative"
      );
    }

    const receivedAt =
      this.getCurrentMinute();

    const expiresAt =
      receivedAt +
      finalShelfLife * 1440;

    const batch =
      entitySystem.create(
        "inventory_batch",
        {
          restaurantId,
          ingredientId,

          quantity,
          originalQuantity:
            quantity,

          unit:
            ingredient.unit,

          quality:
            finalQuality,

          storageType:
            storageType ??
            ingredient.storageType,

          receivedAt,
          expiresAt,

          sourceType,
          sourceId,

          unitCost:
            finalUnitCost,

          status:
            BATCH_STATUS.ACTIVE
        }
      );

    eventBus.emit(
      "inventory:batchAdded",
      {
        restaurantId,
        ingredientId,
        batch:
          this.decorateBatch(batch)
      }
    );

    return this.decorateBatch(batch);
  }

  getBatch(batchId) {
    const batch =
      entitySystem.get(
        "inventory_batch",
        batchId
      );

    if (!batch) {
      throw new Error(
        `Inventory batch "${batchId}" does not exist`
      );
    }

    return this.decorateBatch(batch);
  }

  getBatches(
    restaurantId,
    ingredientId = null,
    {
      activeOnly = true,
      includeSpoiled = true
    } = {}
  ) {
    requireRestaurant(restaurantId);

    if (ingredientId !== null) {
      requireIngredient(ingredientId);
    }

    const batches =
      entitySystem.filter(
        "inventory_batch",
        (batch) =>
          batch.restaurantId ===
            restaurantId &&
          (
            ingredientId === null ||
            batch.ingredientId ===
              ingredientId
          ) &&
          (
            !activeOnly ||
            (
              batch.status ===
                BATCH_STATUS.ACTIVE &&
              batch.quantity > 0
            )
          )
      );

    let result =
      batches.map(
        (batch) =>
          this.decorateBatch(batch)
      );

    if (!includeSpoiled) {
      result =
        result.filter(
          (batch) =>
            !batch.spoiled
        );
    }

    return result.sort(
      (a, b) =>
        a.expiresAt -
          b.expiresAt ||
        a.receivedAt -
          b.receivedAt
    );
  }

  getAvailableQuantity(
    restaurantId,
    ingredientId
  ) {
    return this
      .getBatches(
        restaurantId,
        ingredientId,
        {
          activeOnly: true,
          includeSpoiled: false
        }
      )
      .reduce(
        (total, batch) =>
          total +
          batch.quantity,
        0
      );
  }

  consume(
    restaurantId,
    ingredientId,
    quantity
  ) {
    requirePositiveQuantity(quantity);

    const batches =
      this.getBatches(
        restaurantId,
        ingredientId,
        {
          activeOnly: true,
          includeSpoiled: false
        }
      );

    const available =
      batches.reduce(
        (total, batch) =>
          total +
          batch.quantity,
        0
      );

    if (available < quantity) {
      throw new Error(
        `Insufficient inventory for "${ingredientId}": available ${available}, required ${quantity}`
      );
    }

    let remaining =
      quantity;

    const consumed = [];

    for (const batch of batches) {
      if (remaining <= 0) {
        break;
      }

      const used =
        Math.min(
          batch.quantity,
          remaining
        );

      const newQuantity =
        batch.quantity -
        used;

      entitySystem.update(
        "inventory_batch",
        batch.id,
        {
          quantity:
            newQuantity,

          status:
            newQuantity <= 0
              ? BATCH_STATUS.DEPLETED
              : BATCH_STATUS.ACTIVE,

          depletedAt:
            newQuantity <= 0
              ? this.getCurrentMinute()
              : null
        }
      );

      consumed.push({
        batchId:
          batch.id,
        quantity:
          used,
        quality:
          batch.quality,
        freshness:
          batch.freshness
      });

      remaining -= used;
    }

    eventBus.emit(
      "inventory:consumed",
      {
        restaurantId,
        ingredientId,
        quantity,
        consumed:
          structuredClone(consumed)
      }
    );

    return {
      ingredientId,
      requestedQuantity:
        quantity,
      consumed,
      remainingQuantity:
        this.getAvailableQuantity(
          restaurantId,
          ingredientId
        )
    };
  }

  discardBatch(
    batchId,
    reason = "manual"
  ) {
    const batch =
      this.getBatch(batchId);

    if (
      batch.status !==
      BATCH_STATUS.ACTIVE
    ) {
      return batch;
    }

    const discardedQuantity =
      batch.quantity;

    const updated =
      entitySystem.update(
        "inventory_batch",
        batchId,
        {
          quantity: 0,
          status:
            BATCH_STATUS.DISCARDED,
          discardedAt:
            this.getCurrentMinute(),
          discardReason:
            reason
        }
      );

    eventBus.emit(
      "inventory:discarded",
      {
        restaurantId:
          batch.restaurantId,
        ingredientId:
          batch.ingredientId,
        batchId,
        quantity:
          discardedQuantity,
        reason
      }
    );

    return this.decorateBatch(
      updated
    );
  }

  discardSpoiled(
    restaurantId
  ) {
    const spoiled =
      this.getBatches(
        restaurantId,
        null,
        {
          activeOnly: true,
          includeSpoiled: true
        }
      ).filter(
        (batch) =>
          batch.spoiled
      );

    let totalBatches = 0;
    let totalQuantity = 0;

    for (const batch of spoiled) {
      totalBatches += 1;
      totalQuantity +=
        batch.quantity;

      this.discardBatch(
        batch.id,
        "spoiled"
      );
    }

    return {
      totalBatches,
      totalQuantity
    };
  }

  pruneInactive(
    restaurantId,
    retentionDays = 30
  ) {
    requireRestaurant(
      restaurantId
    );

    const cutoff =
      this.getCurrentMinute() -
      retentionDays * 1440;

    const removable =
      entitySystem.filter(
        "inventory_batch",
        (batch) => {
          if (
            batch.restaurantId !==
            restaurantId ||
            batch.status ===
            BATCH_STATUS.ACTIVE
          ) {
            return false;
          }

          const inactiveAt =
            batch.discardedAt ??
            batch.depletedAt ??
            batch.expiresAt ??
            batch.receivedAt;

          return inactiveAt <= cutoff;
        }
      );

    return entitySystem.removeMany(
      "inventory_batch",
      removable.map(
        batch => batch.id
      )
    );
  }

  getSummary(
    restaurantId
  ) {
    const batches =
      this.getBatches(
        restaurantId,
        null,
        {
          activeOnly: true,
          includeSpoiled: true
        }
      );

    const summary = {};

    for (const batch of batches) {
      if (!summary[batch.ingredientId]) {
        summary[batch.ingredientId] = {
          ingredientId:
            batch.ingredientId,
          totalQuantity: 0,
          usableQuantity: 0,
          spoiledQuantity: 0,
          batches: 0
        };
      }

      const item =
        summary[batch.ingredientId];

      item.totalQuantity +=
        batch.quantity;

      item.batches += 1;

      if (batch.spoiled) {
        item.spoiledQuantity +=
          batch.quantity;
      } else {
        item.usableQuantity +=
          batch.quantity;
      }
    }

    return Object.values(summary);
  }
}

export const inventorySystem =
  new InventorySystem();

export {
  InventorySystem,
  BATCH_STATUS as INVENTORY_BATCH_STATUS
};
