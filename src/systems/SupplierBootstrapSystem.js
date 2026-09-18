import {
  SUPPLIERS_V1
} from "../data/suppliers.v1.js";

import {
  validateSupplierTemplate
} from "../data/supplierRules.js";

import {
  ingredientBootstrapSystem
} from "./IngredientBootstrapSystem.js";

import {
  supplierSystem
} from "./SupplierSystem.js";


class SupplierBootstrapSystem {
  ensureLoaded() {
    ingredientBootstrapSystem
      .ensureLoaded({
        overwrite: false
      });

    for (
      const template
      of SUPPLIERS_V1
    ) {
      validateSupplierTemplate(
        template
      );

      supplierSystem
        .upsertTemplate(
          template
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
            supplierSystem
              .listOffers(
                template.id
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
