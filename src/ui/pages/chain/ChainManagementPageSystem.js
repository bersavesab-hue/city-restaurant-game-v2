import {
  chainSystem
} from "../../../systems/ChainSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  inventorySystem
} from "../../../systems/InventorySystem.js";

import {
  ingredientCatalogSystem
} from "../../../systems/IngredientCatalogSystem.js";

import {
  propertySystem
} from "../../../systems/PropertySystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


class ChainManagementPageSystem {
  getStoreModel(
    store
  ) {
    const account =
      financeSystem.findAccount(
        store.id
      );

    const location =
      store.locationId
        ? propertySystem.get(
            store.locationId
          )
        : null;

    return {
      id:
        store.id,

      name:
        store.name,

      branchNumber:
        store.branchNumber ??
        1,

      brandRole:
        store.brandRole ??
        "flagship",

      level:
        store.level ??
        1,

      status:
        store.status,

      balance:
        account
          ? account.balance
          : 0,

      locationName:
        location?.name ??
        "尚未选址",

      regionId:
        store.locationId
          ? chainSystem
              .getRegionIdForProperty(
                store.locationId
              )
          : (
              store
                .plannedRegionId ??
              null
            )
    };
  }


  getStoreInventory(
    stores
  ) {
    const rows = [];

    for (
      const store
      of stores
    ) {
      for (
        const item
        of inventorySystem
          .getSummary(
            store.id
          )
      ) {
        if (
          item.usableQuantity <=
          0
        ) {
          continue;
        }

        rows.push({
          restaurantId:
            store.id,

          restaurantName:
            store.name,

          ingredientId:
            item.ingredientId,

          ingredientName:
            ingredientCatalogSystem
              .get(
                item.ingredientId
              )?.name ??
            item.ingredientId,

          quantity:
            item.usableQuantity
        });
      }
    }

    return rows;
  }


  getPage(
    restaurantId
  ) {
    const dashboard =
      chainSystem
        .getDashboard(
          restaurantId
        );

    const stores =
      dashboard.stores.map(
        store =>
          this.getStoreModel(
            store
          )
      );

    const anchor =
      stores.find(
        store =>
          store.id ===
          dashboard.anchorRestaurantId
      ) ??
      stores[0];

    const notices =
      [];

    if (
      dashboard.canCreateBranch
    ) {
      notices.push({
        id:
          "chain_branch_available",

        type:
          "success",

        title:
          "扩张机会",

        message:
          `当前可继续扩张，门店数量${dashboard.storeCount}/${dashboard.maxStores}`,

        priority:
          70
      });
    }

    if (
      dashboard.features.centralKitchen &&
      !dashboard.centralKitchen
    ) {
      notices.push({
        id:
          "chain_kitchen_available",

        type:
          "info",

        title:
          "中央厨房",

        message:
          "已满足中央厨房解锁条件，可以启用集中备货与调拨",

        priority:
          50
      });
    }

    const chrome =
      buildFormalPageChrome(
        dashboard.anchorRestaurantId,
        {
          notices,
          restaurant:
            chainSystem.getAnchorRestaurant(
              restaurantId
            )
        }
      );

    return {
      pageId:
        "chain",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "扩张与连锁",

      restaurantId,

      anchorRestaurantId:
        dashboard
          .anchorRestaurantId,

      anchorLevel:
        dashboard
          .anchorLevel,

      anchor,

      chain:
        dashboard.chain,

      brandName:
        dashboard.brandName,

      storeCount:
        dashboard.storeCount,

      maxStores:
        dashboard.maxStores,

      canCreateBranch:
        dashboard.canCreateBranch,

      features:
        dashboard.features,

      stores,

      regions:
        dashboard.regions,

      centralKitchen:
        dashboard
          .centralKitchen,

      kitchenStock:
        dashboard
          .kitchenStock,

      storeInventory:
        this.getStoreInventory(
          dashboard.stores
        )
    };
  }


  createBranch(
    restaurantId,
    payload
  ) {
    return chainSystem
      .createBranch(
        restaurantId,
        payload
      );
  }


  renameBrand(
    restaurantId,
    name
  ) {
    return chainSystem
      .renameBrand(
        restaurantId,
        name
      );
  }


  openCentralKitchen(
    restaurantId
  ) {
    return chainSystem
      .openCentralKitchen(
        restaurantId
      );
  }


  unlockRegion(
    restaurantId,
    regionId
  ) {
    return chainSystem
      .unlockRegion(
        restaurantId,
        regionId
      );
  }


  receiveKitchenStock(
    restaurantId,
    payload
  ) {
    return chainSystem
      .receiveFromStore(
        restaurantId,
        payload
      );
  }


  dispatchKitchenStock(
    restaurantId,
    payload
  ) {
    return chainSystem
      .dispatchToStore(
        restaurantId,
        payload
      );
  }
}


export const chainManagementPageSystem =
  new ChainManagementPageSystem();


export {
  ChainManagementPageSystem
};
