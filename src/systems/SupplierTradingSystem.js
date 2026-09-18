import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

import { supplierSystem } from "./SupplierSystem.js";
import { procurementSystem } from "./ProcurementSystem.js";
import { autoProcurementSystem } from "./AutoProcurementSystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";

import {
  SUPPLIER_PARTNERSHIP_STAGES,
  getSupplierCapabilityTier
} from "../data/supplierRules.js";

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
  getPartnershipStage(
    supplierOrId
  ) {
    const supplier =
      typeof supplierOrId === "string"
        ? supplierSystem.get(
            supplierOrId
          )
        : supplierOrId;

    let stage =
      SUPPLIER_PARTNERSHIP_STAGES[0];

    for (
      const candidate
      of SUPPLIER_PARTNERSHIP_STAGES
    ) {
      if (
        supplier.relationship >=
          candidate
            .minRelationship
      ) {
        stage = candidate;
      }
    }

    return {
      ...stage
    };
  }

  getProfile(supplierId) {
    const supplier =
      supplierSystem.get(
        supplierId
      );

    const capabilityTier =
      getSupplierCapabilityTier(
        supplier.capabilityTier ??
        "T1"
      );

    const partnership =
      this.getPartnershipStage(
        supplier
      );

    const creditDays =
      Math.min(
        supplier.maxCreditDays ??
          0,
        partnership.creditDays
      );

    const offers =
      supplierSystem
        .listOffers(
          supplierId
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

      templateId:
        supplier.templateId ??
        null,

      name:
        supplier.name,

      status:
        supplier.status,

      relationship:
        supplier.relationship,

      reliability:
        supplier.reliability,

      capabilityTier,

      supplierType:
        supplier.supplierType,

      supplyGroups: [
        ...(
          supplier.supplyGroups ??
          []
        )
      ],

      unlockLevel:
        supplier.unlockLevel ??
        1,

      priceIndex:
        supplier.priceIndex ??
        1,

      partnership,

      maxCreditDays:
        supplier.maxCreditDays ??
        0,

      creditDays,

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
    activeOnly = true,
    storeLevel = null
  } = {}) {
    return supplierSystem
      .list({
        activeOnly
      })
      .filter(
        supplier =>
          storeLevel === null ||
          (
            supplier.unlockLevel ??
            1
          ) <=
            storeLevel
      )
      .map(
        supplier =>
          this.getProfile(
            supplier.id
          )
      )
      .sort(
        (a, b) =>
          a.capabilityTier.level -
            b.capabilityTier.level ||
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

    const rawUnitPrice =
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
      );


    const unitPrice =
      Math.max(
        0.0001,
        Number(
          rawUnitPrice
            .toFixed(4)
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

    const partnership =
      this.getPartnershipStage(
        supplier
      );

    const creditDays =
      Math.min(
        supplier.maxCreditDays ??
          0,
        partnership.creditDays
      );

    return {
      supplierId,
      ingredientId,
      quantity,

      unit:
        ingredient.unit,

      unitPrice,

      totalPrice:
        Math.max(
          1,
          Math.round(
            unitPrice *
            quantity
          )
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

      capabilityTier:
        supplier.capabilityTier ??
        "T1",

      partnership:
        partnership.id,

      creditDays
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
        const offer
        of supplierSystem
          .listOffers(
            supplier.id
          )
      ) {
        involved.add(
          offer.ingredientId
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
  SupplierTradingSystem
};
