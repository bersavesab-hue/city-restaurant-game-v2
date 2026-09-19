import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  storeProgressSystem
} from "./StoreProgressSystem.js";

import {
  inventorySystem
} from "./InventorySystem.js";

import {
  ingredientCatalogSystem
} from "./IngredientCatalogSystem.js";

import {
  propertySystem
} from "./PropertySystem.js";

import {
  districtSystem
} from "./DistrictSystem.js";

import {
  CHAIN_SCHEMA_VERSION,
  CHAIN_EXPANSION_POLICY,
  CHAIN_REGIONS,
  getChainRegion,
  getChainRegionByPosition,
  getMaxChainStoresForLevel
} from "../data/chainRules.js";

import {
  lateGameInvestmentSystem
} from "./LateGameInvestmentSystem.js";


function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function requirePositiveQuantity(
  quantity
) {
  if (
    typeof quantity !==
      "number" ||
    !Number.isFinite(
      quantity
    ) ||
    quantity <= 0
  ) {
    throw new RangeError(
      "Quantity must be a positive number"
    );
  }
}


class ChainSystem {
  getCurrentMinute() {
    return gameState
      .getSection("time")
      .totalMinutes;
  }


  getCurrentDay() {
    return gameState
      .getSection("time")
      .day;
  }


  getChain(chainId) {
    const chain =
      entitySystem.get(
        "restaurant_chain",
        chainId
      );

    if (!chain) {
      throw new Error(
        `Restaurant chain "${chainId}" does not exist`
      );
    }

    return chain;
  }


  findChainByRestaurant(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (!restaurant.chainId) {
      return null;
    }

    return (
      entitySystem.get(
        "restaurant_chain",
        restaurant.chainId
      ) ??
      null
    );
  }


  getAnchorRestaurantId(
    restaurantId
  ) {
    const chain =
      this.findChainByRestaurant(
        restaurantId
      );

    return (
      chain?.anchorRestaurantId ??
      restaurantId
    );
  }


  getAnchorRestaurant(
    restaurantId
  ) {
    return restaurantSystem.get(
      this.getAnchorRestaurantId(
        restaurantId
      )
    );
  }


  isFeatureUnlocked(
    restaurantId,
    feature
  ) {
    return storeProgressSystem
      .isUnlocked(
        this.getAnchorRestaurantId(
          restaurantId
        ),
        feature
      );
  }


  getMaxStores(
    restaurantId
  ) {
    const anchor =
      this.getAnchorRestaurant(
        restaurantId
      );

    return getMaxChainStoresForLevel(
      anchor.level
    );
  }


  getRegionIdForDistrict(
    districtId
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    if (!district) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    return getChainRegionByPosition(
      district.mapPosition
    );
  }


  getRegionIdForProperty(
    propertyId
  ) {
    const property =
      propertySystem.get(
        propertyId
      );

    return this
      .getRegionIdForDistrict(
        property.districtId
      );
  }


  getHomeRegionId(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      restaurant.locationId
    ) {
      return this
        .getRegionIdForProperty(
          restaurant.locationId
        );
    }

    return (
      restaurant.plannedRegionId ??
      null
    );
  }


  listStores(
    chainId
  ) {
    this.getChain(
      chainId
    );

    return entitySystem
      .filter(
        "restaurant",
        item =>
          item.chainId ===
            chainId
      )
      .sort(
        (a, b) =>
          (
            a.branchNumber ??
            999
          ) -
          (
            b.branchNumber ??
            999
          )
      );
  }


  ensureChain(
    restaurantId,
    {
      brandName = null
    } = {}
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const existing =
      this.findChainByRestaurant(
        restaurantId
      );

    if (existing) {
      return existing;
    }

    if (
      !storeProgressSystem
        .isUnlocked(
          restaurantId,
          "second_store"
        )
    ) {
      throw new Error(
        "Second store expansion requires Lv.6"
      );
    }

    const homeRegionId =
      this.getHomeRegionId(
        restaurantId
      );

    if (!homeRegionId) {
      throw new Error(
        "Flagship store must have a formal location before expansion"
      );
    }

    const cleanBrandName =
      (
        brandName ??
        restaurant.name
      )
        .trim();

    if (!cleanBrandName) {
      throw new Error(
        "Brand name is required"
      );
    }

    const chain =
      entitySystem.create(
        "restaurant_chain",
        {
          schemaVersion:
            CHAIN_SCHEMA_VERSION,

          brandName:
            cleanBrandName,

          anchorRestaurantId:
            restaurantId,

          homeRegionId,

          unlockedRegionIds: [
            homeRegionId
          ],

          nextBranchNumber: 2,

          createdDay:
            this.getCurrentDay(),

          status:
            "active"
        }
      );

    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        chainId:
          chain.id,

        branchNumber: 1,

        brandRole:
          "flagship",

        plannedRegionId:
          homeRegionId
      }
    );

    eventBus.emit(
      "chain:created",
      {
        chainId:
          chain.id,

        anchorRestaurantId:
          restaurantId,

        homeRegionId
      }
    );

    return chain;
  }


  renameBrand(
    restaurantId,
    name
  ) {
    const chain =
      this.ensureChain(
        restaurantId
      );

    if (
      !this.isFeatureUnlocked(
        restaurantId,
        "chain_management"
      )
    ) {
      throw new Error(
        "Chain management requires Lv.8"
      );
    }

    if (
      typeof name !==
        "string" ||
      !name.trim()
    ) {
      throw new TypeError(
        "Brand name must be a non-empty string"
      );
    }

    const updated =
      entitySystem.update(
        "restaurant_chain",
        chain.id,
        {
          brandName:
            name.trim()
        }
      );

    eventBus.emit(
      "chain:brandRenamed",
      {
        chainId:
          chain.id,

        brandName:
          updated.brandName
      }
    );

    return updated;
  }


  createBranch(
    restaurantId,
    {
      name,
      initialCapital = 40000,
      targetRegionId = null
    } = {}
  ) {
    const chain =
      this.ensureChain(
        restaurantId
      );

    const anchor =
      restaurantSystem.get(
        chain.anchorRestaurantId
      );

    const stores =
      this.listStores(
        chain.id
      );

    const maxStores =
      getMaxChainStoresForLevel(
        anchor.level
      );

    if (
      stores.length >=
      maxStores
    ) {
      throw new Error(
        `Store limit reached: ${maxStores}`
      );
    }

    if (
      typeof name !==
        "string" ||
      !name.trim()
    ) {
      throw new TypeError(
        "Branch name must be a non-empty string"
      );
    }

    if (
      !Number.isInteger(
        initialCapital
      ) ||
      initialCapital <
        CHAIN_EXPANSION_POLICY
          .branchMinimumInitialCapital
    ) {
      throw new RangeError(
        `Branch initial capital must be at least ${CHAIN_EXPANSION_POLICY.branchMinimumInitialCapital}`
      );
    }

    const available =
      financeSystem.getBalance(
        anchor.id
      );

    const required =
      initialCapital +
      CHAIN_EXPANSION_POLICY
        .flagshipMinimumReserve;

    if (
      available <
      required
    ) {
      throw new Error(
        `Flagship must retain at least ${CHAIN_EXPANSION_POLICY.flagshipMinimumReserve} after funding the branch`
      );
    }

    const regionId =
      targetRegionId ??
      chain.homeRegionId;

    if (
      !getChainRegion(
        regionId
      )
    ) {
      throw new Error(
        `Unknown chain region "${regionId}"`
      );
    }

    if (
      !chain.unlockedRegionIds
        .includes(
          regionId
        )
    ) {
      throw new Error(
        `Region "${regionId}" is not unlocked`
      );
    }

    const branchNumber =
      chain.nextBranchNumber ??
      stores.length + 1;

    const branch =
      restaurantSystem.create({
        name:
          name.trim()
      });

    financeSystem.createAccount(
      branch.id,
      initialCapital
    );

    try {
      financeSystem.expense(
        anchor.id,
        initialCapital,
        FINANCE_CATEGORY.OTHER,
        `连锁扩张：拨付${name.trim()}启动资金`
      );
    } catch (error) {
      const account =
        financeSystem.findAccount(
          branch.id
        );

      if (account) {
        entitySystem.remove(
          "finance_account",
          account.id
        );
      }

      entitySystem.remove(
        "restaurant",
        branch.id
      );

      throw error;
    }

    const updatedBranch =
      entitySystem.update(
        "restaurant",
        branch.id,
        {
          chainId:
            chain.id,

          branchNumber,

          brandRole:
            "branch",

          parentRestaurantId:
            anchor.id,

          plannedRegionId:
            regionId
        }
      );

    entitySystem.update(
      "restaurant_chain",
      chain.id,
      {
        nextBranchNumber:
          branchNumber + 1
      }
    );

    eventBus.emit(
      "chain:branchCreated",
      {
        chainId:
          chain.id,

        restaurantId:
          updatedBranch.id,

        branchNumber,

        targetRegionId:
          regionId,

        initialCapital
      }
    );

    return updatedBranch;
  }


  setPlannedRegion(
    restaurantId,
    regionId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const chain =
      this.findChainByRestaurant(
        restaurantId
      );

    if (!chain) {
      throw new Error(
        "Restaurant does not belong to a chain"
      );
    }

    if (
      restaurant.locationId
    ) {
      throw new Error(
        "Restaurant already has a formal location"
      );
    }

    if (
      !chain.unlockedRegionIds
        .includes(
          regionId
        )
    ) {
      throw new Error(
        `Region "${regionId}" is not unlocked`
      );
    }

    return entitySystem.update(
      "restaurant",
      restaurantId,
      {
        plannedRegionId:
          regionId
      }
    );
  }


  validatePropertyRegion(
    restaurantId,
    propertyId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const chain =
      this.findChainByRestaurant(
        restaurantId
      );

    if (!chain) {
      return true;
    }

    const regionId =
      this.getRegionIdForProperty(
        propertyId
      );

    if (
      !chain.unlockedRegionIds
        .includes(
          regionId
        )
    ) {
      throw new Error(
        `Region "${regionId}" is not unlocked for this chain`
      );
    }

    if (
      restaurant.plannedRegionId &&
      restaurant.plannedRegionId !==
        regionId
    ) {
      throw new Error(
        `Branch is planned for region "${restaurant.plannedRegionId}", not "${regionId}"`
      );
    }

    return true;
  }


  unlockRegion(
    restaurantId,
    regionId
  ) {
    const chain =
      this.ensureChain(
        restaurantId
      );

    const anchor =
      restaurantSystem.get(
        chain.anchorRestaurantId
      );

    if (
      !storeProgressSystem
        .isUnlocked(
          anchor.id,
          "regional_expansion"
        )
    ) {
      throw new Error(
        "Regional expansion requires Lv.10"
      );
    }

    const region =
      getChainRegion(
        regionId
      );

    if (!region) {
      throw new Error(
        `Unknown chain region "${regionId}"`
      );
    }

    if (
      chain.unlockedRegionIds
        .includes(
          regionId
        )
    ) {
      return chain;
    }

    const regionCostMultiplier =
      lateGameInvestmentSystem
        .getModifiers(
          anchor.id
        )
        .regionUnlockCostMultiplier ??
      1;

    const cost =
      Math.max(
        1,
        Math.round(
          CHAIN_EXPANSION_POLICY
            .regionUnlockCost *
          regionCostMultiplier
        )
      );

    financeSystem.expense(
      anchor.id,
      cost,
      FINANCE_CATEGORY.OTHER,
      `区域扩张：进入${region.name}`
    );

    const updated =
      entitySystem.update(
        "restaurant_chain",
        chain.id,
        {
          unlockedRegionIds: [
            ...chain
              .unlockedRegionIds,
            regionId
          ]
        }
      );

    eventBus.emit(
      "chain:regionUnlocked",
      {
        chainId:
          chain.id,

        regionId,

        cost
      }
    );

    return updated;
  }


  getCentralKitchen(
    chainId
  ) {
    return (
      entitySystem
        .filter(
          "central_kitchen",
          item =>
            item.chainId ===
              chainId &&
            item.status ===
              "active"
        )[0] ??
      null
    );
  }


  openCentralKitchen(
    restaurantId,
    {
      name = "品牌中央厨房"
    } = {}
  ) {
    const chain =
      this.ensureChain(
        restaurantId
      );

    const anchor =
      restaurantSystem.get(
        chain.anchorRestaurantId
      );

    if (
      !storeProgressSystem
        .isUnlocked(
          anchor.id,
          "central_kitchen"
        )
    ) {
      throw new Error(
        "Central kitchen requires Lv.9"
      );
    }

    const existing =
      this.getCentralKitchen(
        chain.id
      );

    if (existing) {
      return existing;
    }

    const kitchen =
      entitySystem.create(
        "central_kitchen",
        {
          chainId:
            chain.id,

          name:
            String(name)
              .trim() ||
            "品牌中央厨房",

          status:
            "active",

          openedDay:
            this.getCurrentDay()
        }
      );

    eventBus.emit(
      "chain:centralKitchenOpened",
      {
        chainId:
          chain.id,

        centralKitchenId:
          kitchen.id
      }
    );

    return kitchen;
  }


  decorateKitchenBatch(
    batch
  ) {
    const now =
      this.getCurrentMinute();

    const lifetime =
      Math.max(
        1,
        batch.expiresAt -
        batch.receivedAt
      );

    const remaining =
      Math.max(
        0,
        batch.expiresAt -
        now
      );

    return {
      ...structuredClone(
        batch
      ),

      freshness:
        Math.round(
          remaining /
          lifetime *
          100
        ),

      spoiled:
        remaining <= 0
    };
  }


  getKitchenBatches(
    chainId,
    ingredientId = null,
    {
      activeOnly = true
    } = {}
  ) {
    const kitchen =
      this.getCentralKitchen(
        chainId
      );

    if (!kitchen) {
      return [];
    }

    return entitySystem
      .filter(
        "central_kitchen_batch",
        item =>
          item.centralKitchenId ===
            kitchen.id &&
          (
            ingredientId ===
              null ||
            item.ingredientId ===
              ingredientId
          ) &&
          (
            !activeOnly ||
            (
              item.status ===
                "active" &&
              item.quantity > 0
            )
          )
      )
      .map(
        item =>
          this
            .decorateKitchenBatch(
              item
            )
      )
      .filter(
        item =>
          !activeOnly ||
          !item.spoiled
      )
      .sort(
        (a, b) =>
          a.expiresAt -
          b.expiresAt
      );
  }


  receiveFromStore(
    restaurantId,
    {
      sourceRestaurantId,
      ingredientId,
      quantity
    }
  ) {
    requirePositiveQuantity(
      quantity
    );

    const chain =
      this.ensureChain(
        restaurantId
      );

    const kitchen =
      this.getCentralKitchen(
        chain.id
      );

    if (!kitchen) {
      throw new Error(
        "Central kitchen is not open"
      );
    }

    const source =
      restaurantSystem.get(
        sourceRestaurantId
      );

    if (
      source.chainId !==
        chain.id
    ) {
      throw new Error(
        "Source store does not belong to this chain"
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

    const result =
      inventorySystem.consume(
        sourceRestaurantId,
        ingredientId,
        quantity
      );

    const weighted =
      result.consumed.reduce(
        (
          sum,
          item
        ) => {
          sum.quantity +=
            item.quantity;

          sum.quality +=
            item.quality *
            item.quantity;

          sum.freshness +=
            item.freshness *
            item.quantity;

          return sum;
        },
        {
          quantity: 0,
          quality: 0,
          freshness: 0
        }
      );

    const averageQuality =
      clamp(
        Math.round(
          weighted.quality /
          weighted.quantity
        ),
        1,
        5
      );

    const averageFreshness =
      clamp(
        weighted.freshness /
        weighted.quantity,
        1,
        100
      );

    const shelfLifeMultiplier =
      lateGameInvestmentSystem
        .getModifiers(
          chain.anchorRestaurantId
        )
        .centralKitchenShelfLifeMultiplier ??
      1;

    const remainingDays =
      Math.max(
        1,
        Math.floor(
          ingredient
            .shelfLifeDays *
          averageFreshness /
          100 *
          shelfLifeMultiplier
        )
      );

    const now =
      this.getCurrentMinute();

    const batch =
      entitySystem.create(
        "central_kitchen_batch",
        {
          centralKitchenId:
            kitchen.id,

          chainId:
            chain.id,

          ingredientId,

          quantity,

          originalQuantity:
            quantity,

          quality:
            averageQuality,

          receivedAt:
            now,

          expiresAt:
            now +
            remainingDays *
            1440,

          sourceRestaurantId,

          status:
            "active"
        }
      );

    entitySystem.create(
      "central_kitchen_transfer",
      {
        chainId:
          chain.id,

        centralKitchenId:
          kitchen.id,

        direction:
          "inbound",

        restaurantId:
          sourceRestaurantId,

        ingredientId,

        quantity,

        quality:
          averageQuality,

        day:
          this.getCurrentDay()
      }
    );

    eventBus.emit(
      "chain:kitchenStockReceived",
      {
        chainId:
          chain.id,

        centralKitchenId:
          kitchen.id,

        sourceRestaurantId,

        ingredientId,

        quantity
      }
    );

    return this
      .decorateKitchenBatch(
        batch
      );
  }


  dispatchToStore(
    restaurantId,
    {
      targetRestaurantId,
      ingredientId,
      quantity
    }
  ) {
    requirePositiveQuantity(
      quantity
    );

    const chain =
      this.ensureChain(
        restaurantId
      );

    const kitchen =
      this.getCentralKitchen(
        chain.id
      );

    if (!kitchen) {
      throw new Error(
        "Central kitchen is not open"
      );
    }

    const target =
      restaurantSystem.get(
        targetRestaurantId
      );

    if (
      target.chainId !==
        chain.id
    ) {
      throw new Error(
        "Target store does not belong to this chain"
      );
    }

    const batches =
      this.getKitchenBatches(
        chain.id,
        ingredientId
      );

    const available =
      batches.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.quantity,
        0
      );

    if (
      available <
      quantity
    ) {
      throw new Error(
        `Central kitchen inventory insufficient for "${ingredientId}": available ${available}, required ${quantity}`
      );
    }

    let remaining =
      quantity;

    let weightedQuality = 0;
    let usedQuantity = 0;
    let earliestExpiry =
      Infinity;

    for (
      const batch
      of batches
    ) {
      if (
        remaining <= 0
      ) {
        break;
      }

      const used =
        Math.min(
          batch.quantity,
          remaining
        );

      const nextQuantity =
        batch.quantity -
        used;

      entitySystem.update(
        "central_kitchen_batch",
        batch.id,
        {
          quantity:
            nextQuantity,

          status:
            nextQuantity <= 0
              ? "depleted"
              : "active",

          depletedAt:
            nextQuantity <= 0
              ? this
                  .getCurrentMinute()
              : null
        }
      );

      weightedQuality +=
        batch.quality *
        used;

      usedQuantity +=
        used;

      earliestExpiry =
        Math.min(
          earliestExpiry,
          batch.expiresAt
        );

      remaining -=
        used;
    }

    const quality =
      clamp(
        Math.round(
          weightedQuality /
          usedQuantity
        ),
        1,
        5
      );

    const remainingDays =
      Math.max(
        1,
        Math.floor(
          (
            earliestExpiry -
            this.getCurrentMinute()
          ) /
          1440
        )
      );

    const targetBatch =
      inventorySystem.addBatch({
        restaurantId:
          targetRestaurantId,

        ingredientId,

        quantity,

        quality,

        shelfLifeDays:
          remainingDays,

        sourceType:
          "central_kitchen",

        sourceId:
          kitchen.id
      });

    entitySystem.create(
      "central_kitchen_transfer",
      {
        chainId:
          chain.id,

        centralKitchenId:
          kitchen.id,

        direction:
          "outbound",

        restaurantId:
          targetRestaurantId,

        ingredientId,

        quantity,

        quality,

        day:
          this.getCurrentDay()
      }
    );

    eventBus.emit(
      "chain:kitchenStockDispatched",
      {
        chainId:
          chain.id,

        centralKitchenId:
          kitchen.id,

        targetRestaurantId,

        ingredientId,

        quantity
      }
    );

    return targetBatch;
  }


  processDay() {
    const now =
      this.getCurrentMinute();

    const expired =
      entitySystem.filter(
        "central_kitchen_batch",
        item =>
          item.status ===
            "active" &&
          item.expiresAt <=
            now
      );

    for (
      const batch
      of expired
    ) {
      entitySystem.update(
        "central_kitchen_batch",
        batch.id,
        {
          quantity: 0,
          status:
            "discarded",

          discardedAt:
            now,

          discardReason:
            "expired"
        }
      );
    }

    const cutoff =
      now -
      30 *
      1440;

    const removable =
      entitySystem.filter(
        "central_kitchen_batch",
        item =>
          item.status !==
            "active" &&
          (
            item.discardedAt ??
            item.depletedAt ??
            item.expiresAt
          ) <=
            cutoff
      );

    const removed =
      entitySystem.removeMany(
        "central_kitchen_batch",
        removable.map(
          item =>
            item.id
        )
      );

    return {
      expired:
        expired.length,

      removed
    };
  }


  getKitchenStockSummary(
    chainId
  ) {
    const batches =
      this.getKitchenBatches(
        chainId
      );

    const map =
      new Map();

    for (
      const batch
      of batches
    ) {
      const current =
        map.get(
          batch.ingredientId
        ) ?? {
          ingredientId:
            batch.ingredientId,

          quantity: 0,
          batchCount: 0,
          qualityWeighted: 0
        };

      current.quantity +=
        batch.quantity;

      current.batchCount +=
        1;

      current.qualityWeighted +=
        batch.quality *
        batch.quantity;

      map.set(
        batch.ingredientId,
        current
      );
    }

    return [
      ...map.values()
    ].map(
      item => ({
        ingredientId:
          item.ingredientId,

        ingredientName:
          ingredientCatalogSystem
            .get(
              item.ingredientId
            )?.name ??
          item.ingredientId,

        quantity:
          item.quantity,

        batchCount:
          item.batchCount,

        averageQuality:
          item.quantity > 0
            ? Number(
                (
                  item
                    .qualityWeighted /
                  item.quantity
                ).toFixed(1)
              )
            : 0
      })
    );
  }


  getDashboard(
    restaurantId
  ) {
    const anchor =
      this.getAnchorRestaurant(
        restaurantId
      );

    const chain =
      this.findChainByRestaurant(
        restaurantId
      );

    const stores =
      chain
        ? this.listStores(
            chain.id
          )
        : [
            anchor
          ];

    const maxStores =
      getMaxChainStoresForLevel(
        anchor.level
      );

    const centralKitchen =
      chain
        ? this.getCentralKitchen(
            chain.id
          )
        : null;

    const homeRegionId =
      chain
        ?.homeRegionId ??
      this.getHomeRegionId(
        anchor.id
      );

    const unlockedRegionIds =
      chain
        ?.unlockedRegionIds ??
      (
        homeRegionId
          ? [
              homeRegionId
            ]
          : []
      );

    return {
      restaurantId,
      anchorRestaurantId:
        anchor.id,

      anchorLevel:
        anchor.level,

      chain,

      brandName:
        chain
          ?.brandName ??
        anchor.name,

      stores,

      storeCount:
        stores.length,

      maxStores,

      canCreateBranch:
        storeProgressSystem
          .isUnlocked(
            anchor.id,
            "second_store"
          ) &&
        stores.length <
          maxStores,

      features: {
        secondStore:
          storeProgressSystem
            .isUnlocked(
              anchor.id,
              "second_store"
            ),

        chainManagement:
          storeProgressSystem
            .isUnlocked(
              anchor.id,
              "chain_management"
            ),

        centralKitchen:
          storeProgressSystem
            .isUnlocked(
              anchor.id,
              "central_kitchen"
            ),

        regionalExpansion:
          storeProgressSystem
            .isUnlocked(
              anchor.id,
              "regional_expansion"
            )
      },

      centralKitchen,

      kitchenStock:
        chain &&
        centralKitchen
          ? this
              .getKitchenStockSummary(
                chain.id
              )
          : [],

      regions:
        CHAIN_REGIONS.map(
          region => ({
            ...region,

            home:
              region.id ===
              homeRegionId,

            unlocked:
              unlockedRegionIds
                .includes(
                  region.id
                ),

            unlockCost:
              Math.max(
                1,
                Math.round(
                  CHAIN_EXPANSION_POLICY
                    .regionUnlockCost *
                  (
                    lateGameInvestmentSystem
                      .getModifiers(
                        anchor.id
                      )
                      .regionUnlockCostMultiplier ??
                    1
                  )
                )
              )
          })
        )
    };
  }
}


export const chainSystem =
  new ChainSystem();


export {
  ChainSystem
};
