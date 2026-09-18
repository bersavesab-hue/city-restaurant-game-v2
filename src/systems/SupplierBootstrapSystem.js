import {
  SUPPLIERS_V1
} from "../data/suppliers.v1.js";

import {
  getSupplierCapabilityTier,
  validateSupplierTemplate
} from "../data/supplierRules.js";

import {
  ingredientBootstrapSystem
} from "./IngredientBootstrapSystem.js";

import {
  ingredientCatalogSystem
} from "./IngredientCatalogSystem.js";

import {
  supplierSystem
} from "./SupplierSystem.js";


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


class SupplierBootstrapSystem {
  buildOffer(
    template,
    ingredient
  ) {
    const tier =
      getSupplierCapabilityTier(
        template.capabilityTier
      );

    if (!tier) {
      throw new Error(
        `Unknown capability tier "${template.capabilityTier}"`
      );
    }

    const pieceBased =
      ingredient.unit ===
      "piece";

    const minimumOrder =
      scaledInteger(
        pieceBased
          ? tier.pieceMinimumOrder
          : tier.gramMinimumOrder,
        template.minimumOrderFactor
      );

    const capacityPerDay =
      Math.max(
        minimumOrder,
        scaledInteger(
          pieceBased
            ? tier.pieceCapacityPerDay
            : tier.gramCapacityPerDay,
          template.capacityFactor
        )
      );

    return {
      ingredientId:
        ingredient.id,

      supplyGroup:
        ingredient
          .procurementGroup,

      priceMultiplier:
        template.priceIndex,

      priceVolatility:
        template.priceVolatility,

      qualityMin:
        template.qualityMin,

      qualityMax:
        template.qualityMax,

      deliveryMinutes:
        template.deliveryMinutes,

      capacityPerDay,

      minimumOrder
    };
  }

  buildOffers(
    template
  ) {
    validateSupplierTemplate(
      template
    );

    const offers = {};

    for (
      const ingredient
      of ingredientCatalogSystem
        .getAll()
    ) {
      if (
        !template.supplyGroups.includes(
          ingredient
            .procurementGroup
        )
      ) {
        continue;
      }

      offers[
        ingredient.id
      ] =
        this.buildOffer(
          template,
          ingredient
        );
    }

    return offers;
  }

  ensureLoaded() {
    ingredientBootstrapSystem
      .ensureLoaded({
        overwrite: false
      });

    for (
      const template
      of SUPPLIERS_V1
    ) {
      supplierSystem
        .upsertTemplate(
          template,
          {
            offers:
              this.buildOffers(
                template
              )
          }
        );
    }

    return {
      suppliers:
        SUPPLIERS_V1.length,

      offers:
        SUPPLIERS_V1.reduce(
          (
            sum,
            template
          ) =>
            sum +
            Object.keys(
              supplierSystem.get(
                template.id
              ).offers
            ).length,
          0
        )
    };
  }
}


export const supplierBootstrapSystem =
  new SupplierBootstrapSystem();


export {
  SupplierBootstrapSystem
};
