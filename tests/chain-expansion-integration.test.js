import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  dataRegistry
} from "../src/core/DataRegistry.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  gameFoundationSystem
} from "../src/systems/GameFoundationSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  propertySystem
} from "../src/systems/PropertySystem.js";

import {
  inventorySystem
} from "../src/systems/InventorySystem.js";

import {
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  chainSystem
} from "../src/systems/ChainSystem.js";

import {
  CHAIN_REGIONS,
  CHAIN_EXPANSION_POLICY
} from "../src/data/chainRules.js";

import {
  chainManagementPageSystem
} from "../src/ui/pages/chain/ChainManagementPageSystem.js";

import {
  ChainManagementView
} from "../src/ui/pages/chain/ChainManagementView.js";

import {
  channelManagementPageSystem
} from "../src/ui/pages/channels/ChannelManagementPageSystem.js";

import {
  FORMAL_PAGE_DEFINITIONS
} from "../src/ui/runtime/FormalPageRuntime.js";


function setupFlagship(
  level
) {
  gameState.reset();
  dataRegistry.clear();

  gameFoundationSystem
    .initialize({
      seedProperties: true,
      overwriteReferenceData:
        true
    });

  const restaurant =
    restaurantSystem.create({
      name:
        "连锁测试总店"
    });

  financeSystem.createAccount(
    restaurant.id,
    500000
  );

  restaurantSystem.setLevel(
    restaurant.id,
    level
  );

  const property =
    propertySystem.list()[0];

  assert.ok(property);

  entitySystem.update(
    "restaurant",
    restaurant.id,
    {
      locationId:
        property.id
    }
  );

  return {
    restaurant:
      restaurantSystem.get(
        restaurant.id
      ),

    property
  };
}


test(
  "Lv6建立第二门店并从总店真实拨付启动资金且受门店上限约束",
  () => {
    const {
      restaurant
    } =
      setupFlagship(5);

    assert.throws(
      () =>
        chainSystem
          .createBranch(
            restaurant.id,
            {
              name:
                "未解锁二店",

              initialCapital:
                40000
            }
          ),
      /Lv\.6/
    );

    restaurantSystem.setLevel(
      restaurant.id,
      6
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const branch =
      chainSystem.createBranch(
        restaurant.id,
        {
          name:
            "连锁测试二店",

          initialCapital:
            40000
        }
      );

    const flagship =
      restaurantSystem.get(
        restaurant.id
      );

    assert.ok(
      flagship.chainId
    );

    assert.equal(
      branch.chainId,
      flagship.chainId
    );

    assert.equal(
      branch.branchNumber,
      2
    );

    assert.equal(
      branch.brandRole,
      "branch"
    );

    assert.equal(
      financeSystem.getBalance(
        branch.id
      ),
      40000
    );

    assert.equal(
      financeSystem.getAccount(
        branch.id
      ).lifetimeIncome,
      0
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before - 40000
    );

    assert.equal(
      chainSystem
        .listStores(
          flagship.chainId
        ).length,
      2
    );

    assert.throws(
      () =>
        chainSystem
          .createBranch(
            restaurant.id,
            {
              name:
                "超出Lv6门店上限",

              initialCapital:
                40000
            }
          ),
      /Store limit reached: 2/
    );
  }
);


test(
  "Lv8品牌管理与Lv9中央厨房形成真实库存调拨闭环",
  () => {
    const {
      restaurant
    } =
      setupFlagship(8);

    const branch =
      chainSystem.createBranch(
        restaurant.id,
        {
          name:
            "连锁调拨二店",

          initialCapital:
            50000
        }
      );

    const renamed =
      chainSystem.renameBrand(
        restaurant.id,
        "青禾餐饮"
      );

    assert.equal(
      renamed.brandName,
      "青禾餐饮"
    );

    assert.throws(
      () =>
        chainSystem
          .openCentralKitchen(
            restaurant.id
          ),
      /Lv\.9/
    );

    restaurantSystem.setLevel(
      restaurant.id,
      9
    );

    const kitchen =
      chainSystem
        .openCentralKitchen(
          restaurant.id
        );

    assert.ok(kitchen);

    const ingredient =
      ingredientCatalogSystem
        .getAll()[0];

    assert.ok(ingredient);

    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,

      ingredientId:
        ingredient.id,

      quantity: 20,
      quality: 4
    });

    chainSystem.receiveFromStore(
      restaurant.id,
      {
        sourceRestaurantId:
          restaurant.id,

        ingredientId:
          ingredient.id,

        quantity: 10
      }
    );

    assert.equal(
      inventorySystem
        .getAvailableQuantity(
          restaurant.id,
          ingredient.id
        ),
      10
    );

    assert.equal(
      chainSystem
        .getKitchenStockSummary(
          kitchen.chainId
        )[0].quantity,
      10
    );

    chainSystem.dispatchToStore(
      restaurant.id,
      {
        targetRestaurantId:
          branch.id,

        ingredientId:
          ingredient.id,

        quantity: 6
      }
    );

    assert.equal(
      inventorySystem
        .getAvailableQuantity(
          branch.id,
          ingredient.id
        ),
      6
    );

    assert.equal(
      chainSystem
        .getKitchenStockSummary(
          kitchen.chainId
        )[0].quantity,
      4
    );

    assert.equal(
      entitySystem.count(
        "central_kitchen_transfer"
      ),
      2
    );
  }
);


test(
  "Lv10跨区域扩张必须先支付区域进入成本并按计划区域选址",
  () => {
    const {
      restaurant
    } =
      setupFlagship(10);

    const chain =
      chainSystem.ensureChain(
        restaurant.id
      );

    const targetRegion =
      CHAIN_REGIONS.find(
        item =>
          item.id !==
          chain.homeRegionId
      );

    assert.ok(
      targetRegion
    );

    assert.throws(
      () =>
        chainSystem
          .createBranch(
            restaurant.id,
            {
              name:
                "未解锁跨区店",

              initialCapital:
                40000,

              targetRegionId:
                targetRegion.id
            }
          ),
      /not unlocked/
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    chainSystem.unlockRegion(
      restaurant.id,
      targetRegion.id
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before -
      CHAIN_EXPANSION_POLICY
        .regionUnlockCost
    );

    const branch =
      chainSystem.createBranch(
        restaurant.id,
        {
          name:
            "跨区分店",

          initialCapital:
            40000,

          targetRegionId:
            targetRegion.id
        }
      );

    assert.equal(
      branch.plannedRegionId,
      targetRegion.id
    );

    const targetProperty =
      propertySystem
        .list()
        .find(
          item =>
            chainSystem
              .getRegionIdForProperty(
                item.id
              ) ===
            targetRegion.id
        );

    assert.ok(
      targetProperty
    );

    assert.equal(
      chainSystem
        .validatePropertyRegion(
          branch.id,
          targetProperty.id
        ),
      true
    );

    const wrongProperty =
      propertySystem
        .list()
        .find(
          item =>
            chainSystem
              .getRegionIdForProperty(
                item.id
              ) !==
            targetRegion.id
        );

    assert.ok(
      wrongProperty
    );

    assert.throws(
      () =>
        chainSystem
          .validatePropertyRegion(
            branch.id,
            wrongProperty.id
          ),
      /planned for region/
    );
  }
);


test(
  "正式连锁页面展示门店网络中央厨房和区域扩张操作",
  () => {
    const {
      restaurant
    } =
      setupFlagship(10);

    chainSystem.createBranch(
      restaurant.id,
      {
        name:
          "页面测试二店",

        initialCapital:
          40000
      }
    );

    chainSystem.openCentralKitchen(
      restaurant.id
    );

    const page =
      chainManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.storeCount,
      2
    );

    assert.equal(
      page.features
        .regionalExpansion,
      true
    );

    const html =
      new ChainManagementView()
        .renderMarkup(
          page
        );

    assert.match(
      html,
      /门店网络/
    );

    assert.match(
      html,
      /中央厨房/
    );

    assert.match(
      html,
      /区域扩张/
    );

    assert.match(
      html,
      /筹建新门店/
    );
  }
);


test(
  "销售渠道与连锁管理保持独立正式运行时映射",
  () => {
    assert.equal(
      FORMAL_PAGE_DEFINITIONS
        .channels
        .pageSystem,
      channelManagementPageSystem
    );

    assert.equal(
      FORMAL_PAGE_DEFINITIONS
        .chain
        .pageSystem,
      chainManagementPageSystem
    );

    assert.notEqual(
      FORMAL_PAGE_DEFINITIONS
        .channels
        .pageSystem,
      FORMAL_PAGE_DEFINITIONS
        .chain
        .pageSystem
    );
  }
);
