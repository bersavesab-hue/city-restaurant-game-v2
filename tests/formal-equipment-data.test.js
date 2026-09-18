import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  EQUIPMENT_DATASET_META,
  EQUIPMENT_V1
} from "../src/data/equipment.v1.js";

import {
  EQUIPMENT_CAPABILITIES,
  EQUIPMENT_TIERS,
  validateEquipmentDefinition
} from "../src/data/equipmentRules.js";

import {
  COOKING_METHODS_V1
} from "../src/data/cookingMethods.v1.js";

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
  restaurantEquipmentSystem
} from "../src/systems/RestaurantEquipmentSystem.js";


test(
  "正式设备包固定65台并均分13设备族与T1-T5",
  () => {
    assert.equal(
      EQUIPMENT_DATASET_META.total,
      65
    );

    assert.equal(
      EQUIPMENT_V1.length,
      65
    );

    assert.equal(
      new Set(
        EQUIPMENT_V1.map(
          item => item.id
        )
      ).size,
      65
    );

    assert.equal(
      new Set(
        EQUIPMENT_V1.map(
          item => item.familyId
        )
      ).size,
      13
    );

    for (
      const tier
      of EQUIPMENT_TIERS
    ) {
      assert.equal(
        EQUIPMENT_V1.filter(
          item =>
            item.capabilityTier ===
            tier.id
        ).length,
        13,
        tier.id
      );
    }

    for (
      const item
      of EQUIPMENT_V1
    ) {
      assert.equal(
        validateEquipmentDefinition(
          item
        ),
        true,
        item.id
      );
    }

    for (
      const legacyId
      of [
        "gas_range",
        "induction_range",
        "steam_oven",
        "fryer",
        "prep_station",
        "dishwasher",
        "pos_terminal",
        "refrigerator"
      ]
    ) {
      assert.ok(
        EQUIPMENT_V1.some(
          item =>
            item.id ===
            legacyId
        ),
        legacyId
      );
    }
  }
);


test(
  "65台设备完整覆盖22种烹饪方式所需18项能力",
  () => {
    const provided =
      new Set(
        EQUIPMENT_V1.flatMap(
          item =>
            item.capabilities
        )
      );

    assert.equal(
      provided.size,
      EQUIPMENT_CAPABILITIES.length
    );

    for (
      const capability
      of EQUIPMENT_CAPABILITIES
    ) {
      assert.ok(
        provided.has(
          capability
        ),
        capability
      );
    }

    for (
      const method
      of COOKING_METHODS_V1
    ) {
      for (
        const capability
        of method.equipmentCapabilities
      ) {
        assert.ok(
          provided.has(
            capability
          ),
          `${method.id} -> ${capability}`
        );
      }
    }
  }
);


test(
  "正式设备启用后烹饪能力严格按菜谱要求校验",
  () => {
    gameState.reset();

    gameFoundationSystem.initialize({
      seedProperties:
        false,

      overwriteReferenceData:
        true
    });

    const restaurant =
      restaurantSystem.create({
        name:
          "设备能力测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      1000000
    );

    const fallback =
      restaurantEquipmentSystem
        .getRecipeCapabilityStatus(
          restaurant.id,
          "recipe_egg_fried_rice_standard"
        );

    assert.equal(
      fallback.compatible,
      true
    );

    assert.equal(
      fallback.legacyFallback,
      true
    );

    restaurantEquipmentSystem
      .install({
        restaurantId:
          restaurant.id,

        equipmentId:
          "gas_range"
      });

    const stirFry =
      restaurantEquipmentSystem
        .getRecipeCapabilityStatus(
          restaurant.id,
          "recipe_egg_fried_rice_standard"
        );

    assert.equal(
      stirFry.compatible,
      true
    );

    assert.equal(
      stirFry.legacyFallback,
      false
    );

    const steam =
      restaurantEquipmentSystem
        .getRecipeCapabilityStatus(
          restaurant.id,
          "recipe_steamed_egg_standard"
        );

    assert.equal(
      steam.compatible,
      false
    );

    assert.deepEqual(
      steam.missingCapabilities,
      [
        "steamer"
      ]
    );

    assert.throws(
      () =>
        restaurantEquipmentSystem
          .requireRecipeCapabilities(
            restaurant.id,
            "recipe_steamed_egg_standard"
          ),
      /Missing equipment capabilities/
    );

    restaurantEquipmentSystem
      .install({
        restaurantId:
          restaurant.id,

        equipmentId:
          "steam_oven"
      });

    assert.equal(
      restaurantEquipmentSystem
        .getRecipeCapabilityStatus(
          restaurant.id,
          "recipe_steamed_egg_standard"
        )
        .compatible,
      true
    );
  }
);


test(
  "高档设备受门店等级限制并保持自己的最大耐久",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "高档设备测试店"
      });

    financeSystem.createAccount(
      restaurant.id,
      1000000
    );

    assert.throws(
      () =>
        restaurantEquipmentSystem
          .install({
            restaurantId:
              restaurant.id,

            equipmentId:
              "smart_wok_range"
          }),
      /unlocks at store level 6/
    );

    entitySystem.update(
      "restaurant",
      restaurant.id,
      {
        level: 6
      }
    );

    const installed =
      restaurantEquipmentSystem
        .install({
          restaurantId:
            restaurant.id,

          equipmentId:
            "smart_wok_range"
        });

    const unit =
      installed.units[0];

    assert.equal(
      unit.capabilityTier,
      "T4"
    );

    assert.equal(
      unit.maxDurability,
      130
    );

    entitySystem.update(
      "restaurant_equipment",
      unit.id,
      {
        durability: 100
      }
    );

    const repaired =
      restaurantEquipmentSystem
        .repair(
          unit.id
        );

    assert.equal(
      repaired.unit.durability,
      130
    );

    assert.equal(
      repaired.unit.maxDurability,
      130
    );
  }
);
