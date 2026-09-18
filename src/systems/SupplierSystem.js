import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";

import {
  SUPPLIER_CAPABILITY_TIER,
  SUPPLIER_TYPE,
  SUPPLIER_PROCUREMENT_GROUPS,
  getSupplierCapabilityTier,
  validateSupplierTemplate
} from "../data/supplierRules.js";

const SUPPLIER_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended"
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scaledInteger(
  value,
  factor
) {
  return Math.max(
    1,
    Math.round(
      value *
      factor
    )
  );
}

function requireSupplier(id) {
  const supplier =
    entitySystem.get("supplier", id);

  if (!supplier) {
    throw new Error(
      `Supplier "${id}" does not exist`
    );
  }

  return supplier;
}

class SupplierSystem {
  create({
    id = null,
    templateId = null,
    name,
    capabilityTier = "T1",
    supplierType =
      SUPPLIER_TYPE.COMPREHENSIVE,
    supplyGroups = [
      ...SUPPLIER_PROCUREMENT_GROUPS
    ],
    unlockLevel = 1,
    maxCreditDays = 0,
    relationship = 50,
    reliability = 80
  }) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "Supplier name must be a non-empty string"
      );
    }

    if (
      !Number.isInteger(relationship) ||
      relationship < 0 ||
      relationship > 100
    ) {
      throw new RangeError(
        "Relationship must be between 0 and 100"
      );
    }

    if (
      !Number.isInteger(reliability) ||
      reliability < 0 ||
      reliability > 100
    ) {
      throw new RangeError(
        "Reliability must be between 0 and 100"
      );
    }

    if (
      !SUPPLIER_CAPABILITY_TIER[
        capabilityTier
      ]
    ) {
      throw new Error(
        "Invalid supplier capabilityTier"
      );
    }

    if (
      !Object.values(
        SUPPLIER_TYPE
      ).includes(
        supplierType
      )
    ) {
      throw new Error(
        "Invalid supplierType"
      );
    }

    if (
      !Array.isArray(
        supplyGroups
      ) ||
      supplyGroups.length === 0 ||
      supplyGroups.some(
        group =>
          !SUPPLIER_PROCUREMENT_GROUPS.includes(
            group
          )
      )
    ) {
      throw new Error(
        "Invalid supplier supplyGroups"
      );
    }

    if (
      !Number.isInteger(
        unlockLevel
      ) ||
      unlockLevel < 1 ||
      unlockLevel > 10
    ) {
      throw new RangeError(
        "unlockLevel must be between 1 and 10"
      );
    }

    if (
      !Number.isInteger(
        maxCreditDays
      ) ||
      maxCreditDays < 0 ||
      maxCreditDays > 60
    ) {
      throw new RangeError(
        "maxCreditDays must be between 0 and 60"
      );
    }

    const supplier =
      entitySystem.create(
        "supplier",
        {
          templateId,
          name: name.trim(),
          status:
            SUPPLIER_STATUS.ACTIVE,
          capabilityTier,
          supplierType,
          supplyGroups: [
            ...supplyGroups
          ],
          unlockLevel,
          maxCreditDays,
          relationship,
          reliability,
          offers: {}
        },
        id
          ? {
              id
            }
          : undefined
      );

    eventBus.emit(
      "supplier:created",
      {
        supplier:
          structuredClone(supplier)
      }
    );

    return supplier;
  }

  get(id) {
    return requireSupplier(id);
  }

  upsertTemplate(
    template
  ) {
    validateSupplierTemplate(
      template
    );

    const existing =
      entitySystem.get(
        "supplier",
        template.id
      );

    const staticFields = {
      templateId:
        template.id,
      name:
        template.name,
      capabilityTier:
        template.capabilityTier,
      supplierType:
        template.supplierType,
      supplyGroups: [
        ...template.supplyGroups
      ],
      unlockLevel:
        template.unlockLevel,
      maxCreditDays:
        template.maxCreditDays,
      priceIndex:
        template.priceIndex,
      priceVolatility:
        template.priceVolatility,
      qualityMin:
        template.qualityMin,
      qualityMax:
        template.qualityMax,
      deliveryMinutes:
        template.deliveryMinutes,
      minimumOrderFactor:
        template.minimumOrderFactor,
      capacityFactor:
        template.capacityFactor,
      reliability:
        template.reliability
    };

    if (existing) {
      return entitySystem.update(
        "supplier",
        existing.id,
        staticFields
      );
    }

    const created =
      this.create({
        id:
          template.id,
        templateId:
          template.id,
        name:
          template.name,
        capabilityTier:
          template.capabilityTier,
        supplierType:
          template.supplierType,
        supplyGroups:
          template.supplyGroups,
        unlockLevel:
          template.unlockLevel,
        maxCreditDays:
          template.maxCreditDays,
        relationship:
          template
            .initialRelationship,
        reliability:
          template.reliability
      });

    return entitySystem.update(
      "supplier",
      created.id,
      staticFields
    );
  }

  list({
    activeOnly = false
  } = {}) {
    return entitySystem
      .list("supplier")
      .filter(
        (supplier) =>
          !activeOnly ||
          supplier.status ===
            SUPPLIER_STATUS.ACTIVE
      );
  }

  addOffer(
    supplierId,
    ingredientId,
    {
      priceMultiplier = 1,
      priceVolatility = 0.1,
      qualityMin = 1,
      qualityMax = 2,
      deliveryMinutes = 180,
      capacityPerDay = 100,
      minimumOrder = 1
    } = {}
  ) {
    const supplier =
      requireSupplier(supplierId);

    const ingredient =
      ingredientCatalogSystem.get(
        ingredientId
      );

    if (!ingredient) {
      throw new Error(
        `Ingredient "${ingredientId}" does not exist`
      );
    }

    if (
      typeof priceMultiplier !== "number" ||
      priceMultiplier <= 0
    ) {
      throw new RangeError(
        "priceMultiplier must be greater than 0"
      );
    }

    if (
      typeof priceVolatility !== "number" ||
      priceVolatility < 0 ||
      priceVolatility > 0.5
    ) {
      throw new RangeError(
        "priceVolatility must be between 0 and 0.5"
      );
    }

    if (
      !Number.isInteger(qualityMin) ||
      !Number.isInteger(qualityMax) ||
      qualityMin < 1 ||
      qualityMax > 5 ||
      qualityMin > qualityMax
    ) {
      throw new RangeError(
        "Quality range must be between 1 and 5"
      );
    }

    if (
      !Number.isInteger(deliveryMinutes) ||
      deliveryMinutes <= 0
    ) {
      throw new RangeError(
        "deliveryMinutes must be positive"
      );
    }

    if (
      !Number.isFinite(capacityPerDay) ||
      capacityPerDay <= 0
    ) {
      throw new RangeError(
        "capacityPerDay must be positive"
      );
    }

    if (
      !Number.isFinite(minimumOrder) ||
      minimumOrder <= 0
    ) {
      throw new RangeError(
        "minimumOrder must be positive"
      );
    }

    const offers = {
      ...supplier.offers
    };

    offers[ingredientId] = {
      ingredientId,
      priceMultiplier,
      priceVolatility,
      qualityMin,
      qualityMax,
      deliveryMinutes,
      capacityPerDay,
      minimumOrder
    };

    const updated =
      entitySystem.update(
        "supplier",
        supplierId,
        { offers }
      );

    eventBus.emit(
      "supplier:offerAdded",
      {
        supplierId,
        ingredientId
      }
    );

    return updated;
  }

  removeOffer(
    supplierId,
    ingredientId
  ) {
    const supplier =
      requireSupplier(supplierId);

    if (
      !supplier.offers[
        ingredientId
      ]
    ) {
      return false;
    }

    const offers = {
      ...supplier.offers
    };

    delete offers[ingredientId];

    entitySystem.update(
      "supplier",
      supplierId,
      { offers }
    );

    eventBus.emit(
      "supplier:offerRemoved",
      {
        supplierId,
        ingredientId
      }
    );

    return true;
  }

  buildTemplateOffer(
    supplier,
    ingredient
  ) {
    if (
      !supplier.templateId ||
      !supplier.supplyGroups
        ?.includes(
          ingredient
            .procurementGroup
        )
    ) {
      return undefined;
    }

    const tier =
      getSupplierCapabilityTier(
        supplier.capabilityTier
      );

    if (!tier) {
      return undefined;
    }

    const pieceBased =
      ingredient.unit ===
      "piece";

    const minimumOrder =
      scaledInteger(
        pieceBased
          ? tier.pieceMinimumOrder
          : tier.gramMinimumOrder,
        supplier
          .minimumOrderFactor ??
        1
      );

    const capacityPerDay =
      Math.max(
        minimumOrder,
        scaledInteger(
          pieceBased
            ? tier.pieceCapacityPerDay
            : tier.gramCapacityPerDay,
          supplier
            .capacityFactor ??
          1
        )
      );

    return {
      ingredientId:
        ingredient.id,

      supplyGroup:
        ingredient
          .procurementGroup,

      generated:
        true,

      priceMultiplier:
        supplier.priceIndex ??
        1,

      priceVolatility:
        supplier.priceVolatility ??
        0.1,

      qualityMin:
        supplier.qualityMin ??
        1,

      qualityMax:
        supplier.qualityMax ??
        2,

      deliveryMinutes:
        supplier.deliveryMinutes ??
        180,

      capacityPerDay,

      minimumOrder
    };
  }

  getOffer(
    supplierId,
    ingredientId
  ) {
    const supplier =
      requireSupplier(
        supplierId
      );

    const manualOffer =
      supplier.offers?.[
        ingredientId
      ];

    if (manualOffer) {
      return structuredClone(
        manualOffer
      );
    }

    const ingredient =
      ingredientCatalogSystem.get(
        ingredientId
      );

    if (!ingredient) {
      return undefined;
    }

    const generated =
      this.buildTemplateOffer(
        supplier,
        ingredient
      );

    return generated
      ? structuredClone(
          generated
        )
      : undefined;
  }

  listOffers(
    supplierId
  ) {
    const supplier =
      requireSupplier(
        supplierId
      );

    const offers =
      new Map(
        Object.values(
          supplier.offers ??
          {}
        ).map(
          offer => [
            offer.ingredientId,
            structuredClone(
              offer
            )
          ]
        )
      );

    if (supplier.templateId) {
      for (
        const ingredient
        of ingredientCatalogSystem
          .getAll()
      ) {
        if (
          offers.has(
            ingredient.id
          )
        ) {
          continue;
        }

        const generated =
          this.buildTemplateOffer(
            supplier,
            ingredient
          );

        if (generated) {
          offers.set(
            ingredient.id,
            generated
          );
        }
      }
    }

    return [
      ...offers.values()
    ];
  }

  getQuote(
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
      requireSupplier(supplierId);

    if (
      supplier.status !==
      SUPPLIER_STATUS.ACTIVE
    ) {
      throw new Error(
        `Supplier "${supplierId}" is not active`
      );
    }

    const ingredient =
      ingredientCatalogSystem.get(
        ingredientId
      );

    if (!ingredient) {
      throw new Error(
        `Ingredient "${ingredientId}" does not exist`
      );
    }

    const offer =
      this.getOffer(
        supplierId,
        ingredientId
      );

    if (!offer) {
      throw new Error(
        `Supplier "${supplierId}" does not supply "${ingredientId}"`
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

    if (
      quantity >
      offer.capacityPerDay
    ) {
      throw new Error(
        `Daily supply capacity is ${offer.capacityPerDay}`
      );
    }

    const relationshipDiscount =
      1 -
      (
        supplier.relationship /
        100
      ) *
        0.08;

    const volatility =
      offer.priceVolatility;

    const priceFactor =
      1 +
      (
        randomSystem.float() *
          2 -
        1
      ) *
        volatility;

    const rawUnitPrice =
      ingredient
        .basePurchasePrice *
      offer.priceMultiplier *
      relationshipDiscount *
      priceFactor;


    const unitPrice =
      Math.max(
        0.0001,
        Number(
          rawUnitPrice
            .toFixed(4)
        )
      );

    const quality =
      randomSystem.int(
        offer.qualityMin,
        offer.qualityMax
      );

    const totalPrice =
      Math.max(
        1,
        Math.round(
          unitPrice *
          quantity
        )
      );

    const quote = {
      supplierId,
      ingredientId,
      quantity,
      unit:
        ingredient.unit,
      unitPrice,
      totalPrice,
      quality,
      deliveryMinutes:
        offer.deliveryMinutes,
      reliability:
        supplier.reliability
    };

    eventBus.emit(
      "supplier:quoteCreated",
      {
        quote:
          structuredClone(quote)
      }
    );

    return quote;
  }

  changeRelationship(
    supplierId,
    amount
  ) {
    if (!Number.isFinite(amount)) {
      throw new TypeError(
        "Relationship change must be a number"
      );
    }

    const supplier =
      requireSupplier(supplierId);

    const relationship =
      clamp(
        supplier.relationship +
          amount,
        0,
        100
      );

    return entitySystem.update(
      "supplier",
      supplierId,
      { relationship }
    );
  }

  suspend(supplierId) {
    return entitySystem.update(
      "supplier",
      supplierId,
      {
        status:
          SUPPLIER_STATUS.SUSPENDED
      }
    );
  }

  activate(supplierId) {
    return entitySystem.update(
      "supplier",
      supplierId,
      {
        status:
          SUPPLIER_STATUS.ACTIVE
      }
    );
  }
}

export const supplierSystem =
  new SupplierSystem();

export {
  SupplierSystem,
  SUPPLIER_STATUS
};
