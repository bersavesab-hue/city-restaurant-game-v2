import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

import { supplierSystem } from "./SupplierSystem.js";
import { procurementSystem } from "./ProcurementSystem.js";
import { autoProcurementSystem } from "./AutoProcurementSystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";

const SUPPLIER_TIERS = Object.freeze([
  {
    id: "standard",
    name: "普通供应商",
    level: 1,
    minRelationship: 0,
    minReliability: 0,
    creditDays: 0
  },
  {
    id: "preferred",
    name: "优选供应商",
    level: 2,
    minRelationship: 55,
    minReliability: 75,
    creditDays: 7
  },
  {
    id: "key",
    name: "核心供应商",
    level: 3,
    minRelationship: 70,
    minReliability: 85,
    creditDays: 15
  },
  {
    id: "strategic",
    name: "战略供应商",
    level: 4,
    minRelationship: 85,
    minReliability: 90,
    creditDays: 30
  }
]);

function currentDay() {
  return gameState.getSection("time")?.day ?? 1;
}

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function hashString(value) {
  let hash = 2166136261;

  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(
      hash,
      16777619
    );
  }

  return hash >>> 0;
}

function random01(seed, salt = 0) {
  let value =
    (
      seed +
      Math.imul(
        salt + 1,
        0x9e3779b1
      )
    ) >>> 0;

  value ^= value >>> 16;
  value = Math.imul(
    value,
    0x7feb352d
  );

  value ^= value >>> 15;
  value = Math.imul(
    value,
    0x846ca68b
  );

  value ^= value >>> 16;

  return (
    (value >>> 0) /
    4294967296
  );
}

class SupplierTradingSystem {
  getTier(supplierOrId) {
    const supplier =
      typeof supplierOrId === "string"
        ? supplierSystem.get(
            supplierOrId
          )
        : supplierOrId;

    let tier =
      SUPPLIER_TIERS[0];

    for (
      const candidate
      of SUPPLIER_TIERS
    ) {
      if (
        supplier.relationship >=
          candidate
            .minRelationship &&
        supplier.reliability >=
          candidate
            .minReliability
      ) {
        tier = candidate;
      }
    }

    return {
      ...tier
    };
  }

  getProfile(supplierId) {
    const supplier =
      supplierSystem.get(
        supplierId
      );

    const tier =
      this.getTier(
        supplier
      );

    const offers =
      Object.values(
        supplier.offers ?? {}
      );

    const averageQuality =
      offers.length > 0
        ? Number(
            (
              offers.reduce(
                (sum, offer) =>
                  sum +
                  (
                    offer.qualityMin +
                    offer.qualityMax
                  ) /
                    2,
                0
              ) /
              offers.length
            ).toFixed(2)
          )
        : 0;

    const serviceScore =
      Math.round(
        supplier.reliability *
          0.55 +
        supplier.relationship *
          0.35 +
        Math.min(
          10,
          offers.length * 2
        )
      );

    return {
      id:
        supplier.id,

      name:
        supplier.name,

      status:
        supplier.status,

      relationship:
        supplier.relationship,

      reliability:
        supplier.reliability,

      tier,

      creditDays:
        tier.creditDays,

      offerCount:
        offers.length,

      averageQuality,

      serviceScore:
        clamp(
          serviceScore,
          0,
          100
        ),

      offers:
        offers.map(
          offer => ({
            ...structuredClone(
              offer
            ),

            ingredient:
              ingredientCatalogSystem
                .get(
                  offer
                    .ingredientId
                ) ?? null
          })
        )
    };
  }

  listProfiles({
    activeOnly = true
  } = {}) {
    return supplierSystem
      .list({
        activeOnly
      })
      .map(
        supplier =>
          this.getProfile(
            supplier.id
          )
      )
      .sort(
        (a, b) =>
          b.tier.level -
            a.tier.level ||
          b.serviceScore -
            a.serviceScore
      );
  }

  getBulkDiscount(
    offer,
    quantity
  ) {
    const ratio =
      quantity /
      Math.max(
        1,
        offer.capacityPerDay
      );

    if (ratio >= 0.75) {
      return 0.06;
    }

    if (ratio >= 0.5) {
      return 0.04;
    }

    if (ratio >= 0.25) {
      return 0.02;
    }

    return 0;
  }

  getDailyQuote(
    supplierId,
    ingredientId,
    quantity
  ) {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new RangeError(
        "Quantity must be positive"
      );
    }

    const supplier =
      supplierSystem.get(
        supplierId
      );

    const ingredient =
      ingredientCatalogSystem
        .get(
          ingredientId
        );

    if (!ingredient) {
      throw new Error(
        "Ingredient does not exist"
      );
    }

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
      quantity <
      offer.minimumOrder
    ) {
      throw new Error(
        `Minimum order is ${offer.minimumOrder}`
      );
    }

    const remainingCapacity =
      procurementSystem
        .getRemainingDailyCapacity(
          supplierId,
          ingredientId
        );

    if (
      quantity >
      remainingCapacity
    ) {
      throw new Error(
        `Remaining daily supply capacity is ${remainingCapacity}`
      );
    }

    const day =
      currentDay();

    const seed =
      hashString(
        `${supplierId}:${ingredientId}:${day}`
      );

    const marketSwing =
      (
        random01(
          seed,
          1
        ) *
          2 -
        1
      ) *
      offer.priceVolatility;

    const relationshipDiscount =
      (
        supplier.relationship /
        100
      ) *
      0.08;

    const bulkDiscount =
      this.getBulkDiscount(
        offer,
        quantity
      );

    const unitPrice =
      Math.max(
        1,
        Math.round(
          ingredient
            .basePurchasePrice *
          offer
            .priceMultiplier *
          (
            1 +
            marketSwing
          ) *
          (
            1 -
            relationshipDiscount
          ) *
          (
            1 -
            bulkDiscount
          )
        )
      );

    const qualityRange =
      offer.qualityMax -
      offer.qualityMin +
      1;

    const quality =
      offer.qualityMin +
      Math.floor(
        random01(
          seed,
          2
        ) *
        qualityRange
      );

    const tier =
      this.getTier(
        supplier
      );

    return {
      supplierId,
      ingredientId,
      quantity,

      unit:
        ingredient.unit,

      unitPrice,

      totalPrice:
        Math.round(
          unitPrice *
          quantity
        ),

      quality,

      deliveryMinutes:
        offer.deliveryMinutes,

      reliability:
        supplier.reliability,

      relationship:
        supplier.relationship,

      priceVolatility:
        offer.priceVolatility,

      marketSwing:
        Number(
          marketSwing
            .toFixed(4)
        ),

      bulkDiscount:
        Number(
          bulkDiscount
            .toFixed(4)
        ),

      remainingCapacity,

      minimumOrder:
        offer.minimumOrder,

      day,

      tier:
        tier.id,

      creditDays:
        tier.creditDays
    };
  }

  purchase({
    restaurantId,
    supplierId,
    ingredientId,
    quantity,
    useCredit = false
  }) {
    const quote =
      this.getDailyQuote(
        supplierId,
        ingredientId,
        quantity
      );

    if (
      useCredit &&
      quote.creditDays <= 0
    ) {
      throw new Error(
        "Supplier does not provide credit terms"
      );
    }

    const order =
      procurementSystem.purchase({
        restaurantId,
        supplierId,
        ingredientId,
        quantity,

        quoteOverride:
          quote,

        paymentTerms:
          useCredit
            ? {
                creditDays:
                  quote.creditDays
              }
            : null
      });

    supplierSystem
      .changeRelationship(
        supplierId,
        useCredit
          ? 0.35
          : 0.2
      );

    return order;
  }

  getInventoryRisk(
    restaurantId,
    ingredientId
  ) {
    const ingredient =
      ingredientCatalogSystem
        .get(
          ingredientId
        );

    if (!ingredient) {
      throw new Error(
        "Ingredient does not exist"
      );
    }

    const usable =
      inventorySystem
        .getAvailableQuantity(
          restaurantId,
          ingredientId
        );

    const pending =
      procurementSystem
        .getPendingQuantity(
          restaurantId,
          ingredientId
        );

    const policy =
      autoProcurementSystem
        .findPolicy(
          restaurantId,
          ingredientId
        );

    const minimum =
      policy
        ?.minimumQuantity ??
      0;

    const target =
      policy
        ?.targetQuantity ??
      Math.max(
        1,
        minimum * 2
      );

    const effective =
      usable +
      pending;

    let level =
      "healthy";

    if (effective <= 0) {
      level = "critical";
    } else if (
      policy &&
      effective <= minimum
    ) {
      level = "high";
    } else if (
      policy &&
      effective <
        target * 0.6
    ) {
      level = "medium";
    }

    const batches =
      inventorySystem
        .getBatches(
          restaurantId,
          ingredientId,
          {
            activeOnly: true,
            includeSpoiled: true
          }
        );

    const spoiled =
      batches.reduce(
        (sum, batch) =>
          sum +
          (
            batch.spoiled
              ? batch.quantity
              : 0
          ),
        0
      );

    const expiring =
      batches
        .filter(
          batch =>
            !batch.spoiled &&
            batch.freshness <= 30
        )
        .reduce(
          (sum, batch) =>
            sum +
            batch.quantity,
          0
        );

    return {
      ingredientId,

      ingredientName:
        ingredient.name,

      unit:
        ingredient.unit,

      usable,
      pending,
      effective,

      minimum,
      target,

      level,

      spoiled,
      expiring,

      policy:
        policy
          ? structuredClone(
              policy
            )
          : null
    };
  }

  getInventoryDashboard(
    restaurantId
  ) {
    const involved =
      new Set();

    for (
      const supplier
      of supplierSystem.list()
    ) {
      for (
        const ingredientId
        of Object.keys(
          supplier.offers ?? {}
        )
      ) {
        involved.add(
          ingredientId
        );
      }
    }

    for (
      const item
      of inventorySystem
        .getSummary(
          restaurantId
        )
    ) {
      involved.add(
        item.ingredientId
      );
    }

    for (
      const policy
      of entitySystem
        .list(
          "restock_policy"
        )
    ) {
      if (
        policy.restaurantId ===
        restaurantId
      ) {
        involved.add(
          policy.ingredientId
        );
      }
    }

    return [
      ...involved
    ]
      .map(
        ingredientId =>
          this.getInventoryRisk(
            restaurantId,
            ingredientId
          )
      )
      .sort(
        (a, b) => {
          const rank = {
            critical: 4,
            high: 3,
            medium: 2,
            healthy: 1
          };

          return (
            rank[b.level] -
            rank[a.level]
          );
        }
      );
  }

  getPayables(
    restaurantId
  ) {
    return procurementSystem
      .listPayables(
        restaurantId
      );
  }

  getPolicies(
    restaurantId
  ) {
    return entitySystem
      .list(
        "restock_policy"
      )
      .filter(
        item =>
          item.restaurantId ===
          restaurantId
      );
  }

  setAutoPolicy(data) {
    return autoProcurementSystem
      .setPolicy(
        data
      );
  }
}

export const supplierTradingSystem =
  new SupplierTradingSystem();

export {
  SupplierTradingSystem,
  SUPPLIER_TIERS
};
