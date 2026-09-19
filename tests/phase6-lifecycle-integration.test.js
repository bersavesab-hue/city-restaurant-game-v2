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
  saveSystem
} from "../src/core/SaveSystem.js";

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
  propertyLeaseMarketSystem
} from "../src/systems/PropertyLeaseMarketSystem.js";

import {
  customerIdentitySystem
} from "../src/systems/CustomerIdentitySystem.js";

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
  lateGameInvestmentSystem
} from "../src/systems/LateGameInvestmentSystem.js";

import {
  CHAIN_EXPANSION_POLICY,
  CHAIN_REGIONS
} from "../src/data/chainRules.js";

import {
  leaseManagementPageSystem
} from "../src/ui/pages/lease/LeaseManagementPageSystem.js";

import {
  settingsPageSystem
} from "../src/ui/pages/settings/SettingsPageSystem.js";

import {
  customerManagementPageSystem
} from "../src/ui/pages/customers/CustomerManagementPageSystem.js";

import {
  brandInvestmentPageSystem
} from "../src/ui/pages/brand-investments/BrandInvestmentPageSystem.js";


function setup({
  level = 1,
  balance = 500000
} = {}) {
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
        "第六步测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    balance
  );

  restaurantSystem.setLevel(
    restaurant.id,
    level
  );

  const property =
    propertySystem
      .list({
        availableOnly: true
      })[0];

  assert.ok(property);

  return {
    restaurant:
      restaurantSystem.get(
        restaurant.id
      ),
    property
  };
}


test(
  "租约正式页覆盖签约、续租、到期信息与主动结束租约",
  () => {
    const {
      restaurant,
      property
    } =
      setup({
        balance: 600000
      });

    const lease =
      propertyLeaseMarketSystem
        .signLease({
          restaurantId:
            restaurant.id,
          propertyId:
            property.id,
          months: 12
        });

    const page =
      leaseManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.hasLease,
      true
    );

    assert.equal(
      page.property.id,
      property.id
    );

    assert.ok(
      page.daysRemaining >
      0
    );

    assert.ok(
      page.renewalQuote
    );

    const renewed =
      leaseManagementPageSystem
        .renew(
          restaurant.id,
          12
        );

    assert.equal(
      renewed.endDay,
      lease.endDay +
      12 * 30
    );

    const terminated =
      leaseManagementPageSystem
        .terminate(
          restaurant.id
        );

    assert.equal(
      terminated.status,
      "terminated"
    );

    assert.equal(
      restaurantSystem
        .get(
          restaurant.id
        )
        .locationId,
      null
    );

    assert.equal(
      propertySystem
        .get(
          property.id
        )
        .status,
      "available"
    );
  }
);


test(
  "设置正式页真实控制倍速暂停并完成保存读取",
  () => {
    saveSystem.remove(
      "auto"
    );

    const {
      restaurant
    } =
      setup();

    settingsPageSystem
      .setSpeed(
        4
      );

    settingsPageSystem
      .togglePause();

    let page =
      settingsPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.runtime.paused,
      false
    );

    assert.equal(
      page.runtime.speed,
      4
    );

    settingsPageSystem
      .saveNow();

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        name:
          "被修改的店名"
      }
    );

    assert.equal(
      restaurantSystem
        .get(
          restaurant.id
        )
        .name,
      "被修改的店名"
    );

    settingsPageSystem
      .loadNow();

    assert.equal(
      restaurantSystem
        .get(
          restaurant.id
        )
        .name,
      "第六步测试店"
    );

    page =
      settingsPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      page.save.exists,
      true
    );

    saveSystem.remove(
      "auto"
    );
  }
);


test(
  "熟客档案积累关系阶段、消费满意度、偏好与流失风险",
  () => {
    const {
      restaurant
    } =
      setup({
        level: 7
      });

    let profile =
      customerIdentitySystem
        .createProfile({
          restaurantId:
            restaurant.id,
          segmentId:
            "local_regular"
        });

    assert.ok(profile);

    for (
      let index = 0;
      index < 6;
      index += 1
    ) {
      profile =
        customerIdentitySystem
          .touchProfile(
            profile
          );

      customerIdentitySystem
        .recordVisitOutcome({
          restaurantId:
            restaurant.id,
          customerId:
            profile.customerId,
          spend: 100,
          satisfaction: 86,
          orderId:
            "identity_test_" +
            index,
          dishIds: [
            "dish_identity_test"
          ]
        });

      profile =
        entitySystem.get(
          "recognized_customer_profile",
          profile.id
        );
    }

    const detailed =
      customerIdentitySystem
        .getDetailedProfiles(
          restaurant.id
        )[0];

    assert.equal(
      detailed.relationshipStage,
      "familiar"
    );

    assert.equal(
      detailed.totalSpend,
      600
    );

    assert.equal(
      detailed.averageSatisfaction,
      86
    );

    assert.equal(
      detailed.favoriteDishId,
      "dish_identity_test"
    );

    const customerPage =
      customerManagementPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      customerPage
        .recognizedCustomers
        .length,
      1
    );

    gameState.patchSection(
      "time",
      {
        day: 40
      },
      "test:customer-risk"
    );

    assert.equal(
      customerIdentitySystem
        .getDetailedProfiles(
          restaurant.id
        )[0]
        .atRisk,
      true
    );
  }
);


test(
  "后期品牌基建形成真实资金消耗并影响熟客、冷链和区域扩张",
  () => {
    const {
      restaurant,
      property
    } =
      setup({
        level: 10,
        balance: 2000000
      });

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        locationId:
          property.id
      }
    );

    const initialBalance =
      financeSystem.getBalance(
        restaurant.id
      );

    for (
      const investmentId
      of [
        "crm_center",
        "member_service_center",
        "cold_chain_upgrade",
        "regional_brand_hq"
      ]
    ) {
      lateGameInvestmentSystem
        .purchase(
          restaurant.id,
          investmentId
        );
    }

    const dashboard =
      brandInvestmentPageSystem
        .getPage(
          restaurant.id
        );

    assert.equal(
      dashboard
        .projects
        .filter(
          item =>
            item.owned
        )
        .length,
      4
    );

    assert.equal(
      dashboard.totalInvested,
      980000
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      initialBalance -
      980000
    );

    assert.equal(
      customerIdentitySystem
        .getMaxRecognizedPerSegment(
          restaurant.id
        ),
      7
    );

    assert.ok(
      customerIdentitySystem
        .getRecognitionRate(
          restaurant.id
        ) >
      0.1
    );

    const chain =
      chainSystem.ensureChain(
        restaurant.id
      );

    chainSystem.openCentralKitchen(
      restaurant.id
    );

    const ingredient =
      ingredientCatalogSystem
        .getAll()
        .find(
          item =>
            item.shelfLifeDays >=
            5
        );

    assert.ok(ingredient);

    inventorySystem.addBatch({
      restaurantId:
        restaurant.id,
      ingredientId:
        ingredient.id,
      quantity: 20,
      quality: 4
    });

    const kitchenBatch =
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

    assert.ok(
      (
        kitchenBatch.expiresAt -
        kitchenBatch.receivedAt
      ) >
      ingredient.shelfLifeDays *
      1440
    );

    const targetRegion =
      CHAIN_REGIONS.find(
        item =>
          item.id !==
          chain.homeRegionId
      );

    assert.ok(targetRegion);

    const beforeRegion =
      financeSystem.getBalance(
        restaurant.id
      );

    chainSystem.unlockRegion(
      restaurant.id,
      targetRegion.id
    );

    const expectedRegionCost =
      Math.round(
        CHAIN_EXPANSION_POLICY
          .regionUnlockCost *
        0.85
      );

    assert.equal(
      beforeRegion -
      financeSystem.getBalance(
        restaurant.id
      ),
      expectedRegionCost
    );
  }
);
