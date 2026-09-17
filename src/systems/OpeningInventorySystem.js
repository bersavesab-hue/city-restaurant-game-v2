import {
  ingredientCatalogSystem
} from "./IngredientCatalogSystem.js";

import {
  inventorySystem
} from "./InventorySystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  procurementSystem
} from "./ProcurementSystem.js";

import {
  recipeSystem
} from "./RecipeSystem.js";

import {
  supplierSystem
} from "./SupplierSystem.js";


const DEFAULT_STARTER_SERVINGS =
  12;


function roundQuantity(
  value
) {
  return Number(
    Number(
      value
    ).toFixed(
      3
    )
  );
}


function buildStarterRequirementMap(
  recipes,
  targetServings =
    DEFAULT_STARTER_SERVINGS
) {
  const map =
    new Map();


  for (
    const recipe
    of recipes
  ) {
    for (
      const item
      of recipe.ingredients ??
      []
    ) {
      const quantity =
        item.quantity *
        targetServings;


      const current =
        map.get(
          item.ingredientId
        ) ??
        0;


      map.set(
        item.ingredientId,
        current +
        quantity
      );
    }
  }


  return [
    ...map.entries()
  ].map(
    (
      [
        ingredientId,
        requiredQuantity
      ]
    ) => ({
      ingredientId,

      requiredQuantity:
        roundQuantity(
          requiredQuantity
        )
    })
  );
}


class OpeningInventorySystem {
  getActiveRecipes(
    restaurantId
  ) {
    return menuSystem
      .listByRestaurant(
        restaurantId,
        {
          activeOnly:
            true
        }
      )
      .map(
        item =>
          recipeSystem.get(
            item.recipeId
          )
      )
      .filter(Boolean);
  }


  findSupplierOptions(
    ingredientId
  ) {
    const ingredient =
      ingredientCatalogSystem.get(
        ingredientId
      );


    return supplierSystem
      .list({
        activeOnly:
          true
      })
      .map(
        supplier => {
          let offer =
            null;


          try {
            offer =
              supplierSystem
                .getOffer(
                  supplier.id,
                  ingredientId
                );
          } catch {
            offer =
              null;
          }


          if (!offer) {
            return null;
          }


          const expectedUnitPrice =
            ingredient
              .basePurchasePrice *
            offer.priceMultiplier *
            (
              1 -
              supplier.relationship /
              100 *
              0.08
            );


          return {
            supplierId:
              supplier.id,

            supplierName:
              supplier.name,

            reliability:
              supplier.reliability,

            minimumOrder:
              offer.minimumOrder,

            capacityPerDay:
              offer.capacityPerDay,

            deliveryMinutes:
              offer.deliveryMinutes,

            expectedUnitPrice
          };
        }
      )
      .filter(Boolean)
      .sort(
        (
          a,
          b
        ) =>
          a.expectedUnitPrice -
            b.expectedUnitPrice ||
          b.reliability -
            a.reliability
      );
  }


  getStatus(
    restaurantId,
    targetServings =
      DEFAULT_STARTER_SERVINGS
  ) {
    const recipes =
      this.getActiveRecipes(
        restaurantId
      );


    const requirements =
      buildStarterRequirementMap(
        recipes,
        targetServings
      );


    const items =
      requirements.map(
        requirement => {
          const ingredient =
            ingredientCatalogSystem.get(
              requirement
                .ingredientId
            );


          const available =
            inventorySystem
              .getAvailableQuantity(
                restaurantId,
                requirement
                  .ingredientId
              );


          const pending =
            procurementSystem
              .getPendingQuantity(
                restaurantId,
                requirement
                  .ingredientId
              );


          const missing =
            Math.max(
              0,
              requirement
                .requiredQuantity -
              available
            );


          const effectiveMissing =
            Math.max(
              0,
              requirement
                .requiredQuantity -
              available -
              pending
            );


          const suppliers =
            this.findSupplierOptions(
              requirement
                .ingredientId
            );


          return {
            ...requirement,

            name:
              ingredient.name,

            unit:
              ingredient.unit,

            available:
              roundQuantity(
                available
              ),

            pending:
              roundQuantity(
                pending
              ),

            missing:
              roundQuantity(
                missing
              ),

            effectiveMissing:
              roundQuantity(
                effectiveMissing
              ),

            ready:
              available >=
              requirement
                .requiredQuantity,

            hasSupplier:
              suppliers.length >
              0,

            recommendedSupplier:
              suppliers[0] ??
              null,

            suppliers
          };
        }
      );


    return {
      restaurantId,

      targetServings,

      recipeCount:
        recipes.length,

      ingredientCount:
        items.length,

      items,

      stockedCount:
        items.filter(
          item =>
            item.ready
        ).length,

      pendingCount:
        items.filter(
          item =>
            !item.ready &&
            item.pending >
            0
        ).length,

      missingSupplierCount:
        items.filter(
          item =>
            !item.ready &&
            !item.hasSupplier
        ).length,

      complete:
        items.length >
          0 &&
        items.every(
          item =>
            item.ready
        )
    };
  }


  purchaseMissing(
    restaurantId,
    targetServings =
      DEFAULT_STARTER_SERVINGS
  ) {
    const status =
      this.getStatus(
        restaurantId,
        targetServings
      );


    if (
      status.recipeCount ===
      0
    ) {
      throw new Error(
        "当前没有营业菜品，无法生成首批采购计划"
      );
    }


    const noSupplier =
      status.items
        .filter(
          item =>
            item.effectiveMissing >
              0 &&
            !item.hasSupplier
        );


    if (
      noSupplier.length >
      0
    ) {
      throw new Error(
        "以下食材没有可用供应商：" +
        noSupplier
          .map(
            item =>
              item.name
          )
          .join("、")
      );
    }


    const orders = [];


    for (
      const item
      of status.items
    ) {
      let missing =
        item.effectiveMissing;


      if (
        missing <=
        0
      ) {
        continue;
      }


      for (
        const supplier
        of item.suppliers
      ) {
        if (
          missing <=
          0
        ) {
          break;
        }


        const capacity =
          procurementSystem
            .getRemainingDailyCapacity(
              supplier.supplierId,
              item.ingredientId
            );


        if (
          capacity <
          supplier.minimumOrder
        ) {
          continue;
        }


        let quantity =
          Math.max(
            missing,
            supplier.minimumOrder
          );


        quantity =
          Math.min(
            quantity,
            capacity
          );


        if (
          quantity <
          supplier.minimumOrder
        ) {
          continue;
        }


        const order =
          procurementSystem.purchase({
            restaurantId,

            supplierId:
              supplier.supplierId,

            ingredientId:
              item.ingredientId,

            quantity:
              roundQuantity(
                quantity
              )
          });


        orders.push(
          order
        );


        missing =
          Math.max(
            0,
            missing -
            quantity
          );
      }
    }


    return {
      orders,

      status:
        this.getStatus(
          restaurantId,
          targetServings
        )
    };
  }
}


export const openingInventorySystem =
  new OpeningInventorySystem();


export {
  OpeningInventorySystem,
  DEFAULT_STARTER_SERVINGS,
  buildStarterRequirementMap
};
