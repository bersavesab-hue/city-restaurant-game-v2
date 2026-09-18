import { financeSystem } from "../../../systems/FinanceSystem.js";
import { supplierTradingSystem } from "../../../systems/SupplierTradingSystem.js";
import { procurementSystem } from "../../../systems/ProcurementSystem.js";
import { ingredientCatalogSystem } from "../../../systems/IngredientCatalogSystem.js";
import { supplierSystem } from "../../../systems/SupplierSystem.js";
import { restaurantSystem } from "../../../systems/RestaurantSystem.js";
import { getIngredientVisual } from "../../../data/ingredientVisuals.js";

function safeIngredientVisual(
  ingredientId
) {
  try {
    return getIngredientVisual(
      ingredientId
    );
  } catch {
    return {
      index: null,
      code: ingredientId,
      image: null
    };
  }
}

function safeBalance(
  restaurantId
) {
  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return null;
  }
}

class SupplyManagementPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const suppliers =
      supplierTradingSystem
        .listProfiles({
          storeLevel:
            restaurant.level
        })
        .map(
          supplier => ({
            ...supplier,
            offers:
              supplier.offers.map(
                offer => {
                  const visual =
                    safeIngredientVisual(
                      offer.ingredientId
                    );

                  return {
                    ...offer,
                    visualIndex:
                      visual.index,
                    visualCode:
                      visual.code,
                    image:
                      visual.image
                  };
                }
              )
          })
        );

    const inventory =
      supplierTradingSystem
        .getInventoryDashboard(
          restaurantId
        )
        .map(
          item => {
            const visual =
              safeIngredientVisual(
                item.ingredientId
              );

            return {
              ...item,
              visualIndex:
                visual.index,
              visualCode:
                visual.code,
              image:
                visual.image
            };
          }
        );

    const orders =
      procurementSystem
        .listByRestaurant(
          restaurantId
        )
        .slice()
        .sort(
          (a, b) =>
            b.orderedAt -
            a.orderedAt
        );

    const payables =
      supplierTradingSystem
        .getPayables(
          restaurantId
        );

    const policies =
      supplierTradingSystem
        .getPolicies(
          restaurantId
        );

    return {
      pageId:
        "supply",

      title:
        "供应链",

      balance:
        safeBalance(
          restaurantId
        ),

      summary: {
        supplierCount:
          suppliers.length,

        shortageCount:
          inventory.filter(
            item =>
              [
                "critical",
                "high"
              ].includes(
                item.level
              )
          ).length,

        pendingOrders:
          orders.filter(
            item =>
              item.status ===
              "pending"
          ).length,

        payableAmount:
          payables
            .filter(
              item =>
                [
                  "open",
                  "overdue"
                ].includes(
                  item.status
                )
            )
            .reduce(
              (sum, item) =>
                sum +
                item.amount,
              0
            ),

        overdueAmount:
          payables
            .filter(
              item =>
                item.status ===
                "overdue"
            )
            .reduce(
              (sum, item) =>
                sum +
                item.amount,
              0
            )
      },

      suppliers,
      inventory,
      orders,
      payables,
      policies
    };
  }

  getSupplierDetail(
    supplierId
  ) {
    const profile =
      supplierTradingSystem
        .getProfile(
          supplierId
        );

    return {
      ...profile,

      offers:
        profile.offers.map(
          offer => ({
            ...offer,

            sampleQuote:
              supplierTradingSystem
                .getDailyQuote(
                  supplierId,
                  offer.ingredientId,
                  offer.minimumOrder
                )
          })
        )
    };
  }

  getQuote({
    supplierId,
    ingredientId,
    quantity
  }) {
    return (
      supplierTradingSystem
        .getDailyQuote(
          supplierId,
          ingredientId,
          quantity
        )
    );
  }

  purchase({
    restaurantId,
    supplierId,
    ingredientId,
    quantity,
    useCredit = false
  }) {
    return (
      supplierTradingSystem
        .purchase({
          restaurantId,
          supplierId,
          ingredientId,
          quantity,
          useCredit
        })
    );
  }

  cancelOrder(
    orderId
  ) {
    return procurementSystem
      .cancel(
        orderId
      );
  }

  setAutoPolicy({
    restaurantId,
    ingredientId,
    supplierId,
    minimumQuantity,
    targetQuantity,
    enabled = true
  }) {
    return (
      supplierTradingSystem
        .setAutoPolicy({
          restaurantId,
          ingredientId,
          supplierId,
          minimumQuantity,
          targetQuantity,
          enabled
        })
    );
  }

  getAutoPolicyOptions(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const suppliers =
      supplierTradingSystem
        .listProfiles({
          storeLevel:
            restaurant.level
        });

    return {
      suppliers:
        suppliers.map(
          supplier => ({
            id:
              supplier.id,

            name:
              supplier.name,

            offers:
              supplier.offers.map(
                offer => ({
                  ingredientId:
                    offer
                      .ingredientId,

                  ingredientName:
                    offer
                      .ingredient
                      ?.name ??
                    offer
                      .ingredientId
                })
              )
          })
        ),

      ingredients:
        ingredientCatalogSystem
          .getAll()
          .map(
            item => ({
              id:
                item.id,
              name:
                item.name,
              unit:
                item.unit,
              visualIndex:
                getIngredientVisual(
                  item.id
                ).index,
              image:
                getIngredientVisual(
                  item.id
                ).image
            })
          )
    };
  }

  getRelationship(
    supplierId
  ) {
    return supplierSystem
      .get(
        supplierId
      ).relationship;
  }
}

export const supplyManagementPageSystem =
  new SupplyManagementPageSystem();

export {
  SupplyManagementPageSystem
};
