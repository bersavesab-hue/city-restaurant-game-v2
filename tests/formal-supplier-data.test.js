import test from "node:test";
import assert from "node:assert/strict";

import {
  INGREDIENTS_V1
} from "../src/data/ingredients.v1.js";

import {
  SUPPLIER_DATASET_META,
  SUPPLIERS_V1
} from "../src/data/suppliers.v1.js";

import {
  SUPPLIER_CAPABILITY_TIERS,
  validateSupplierTemplate
} from "../src/data/supplierRules.js";

import { app } from "../src/main.js";

const {
  ingredientCatalogSystem,
  supplierSystem,
  supplierBootstrapSystem,
  supplierTradingSystem
} = app.systems;


test(
  "正式供应商包固定60个模板并均分T1-T5",
  () => {
    assert.equal(
      SUPPLIER_DATASET_META.total,
      60
    );

    assert.equal(
      SUPPLIERS_V1.length,
      60
    );

    assert.equal(
      new Set(
        SUPPLIERS_V1.map(
          item => item.id
        )
      ).size,
      60
    );

    assert.equal(
      new Set(
        SUPPLIERS_V1.map(
          item => item.name
        )
      ).size,
      60
    );

    for (
      const template
      of SUPPLIERS_V1
    ) {
      assert.equal(
        validateSupplierTemplate(
          template
        ),
        true,
        template.id
      );
    }

    for (
      const tier
      of SUPPLIER_CAPABILITY_TIERS
    ) {
      assert.equal(
        SUPPLIERS_V1.filter(
          item =>
            item.capabilityTier ===
            tier.id
        ).length,
        12,
        tier.id
      );
    }
  }
);


test(
  "60供应商按模板生成报价并完整覆盖220食材",
  () => {
    ingredientCatalogSystem.load(
      INGREDIENTS_V1,
      {
        overwrite:
          true
      }
    );

    const result =
      supplierBootstrapSystem
        .ensureLoaded();

    assert.equal(
      result.suppliers,
      60
    );

    assert.ok(
      result.offers >
      220
    );

    const supplierIds =
      new Set(
        SUPPLIERS_V1.map(
          item => item.id
        )
      );

    for (
      const template
      of SUPPLIERS_V1
    ) {
      const supplier =
        supplierSystem.get(
          template.id
        );

      assert.equal(
        supplier.templateId,
        template.id
      );

      assert.equal(
        supplier.capabilityTier,
        template.capabilityTier
      );

      const expected =
        INGREDIENTS_V1.filter(
          ingredient =>
            template.supplyGroups
              .includes(
                ingredient
                  .procurementGroup
              )
        ).length;

      assert.equal(
        Object.keys(
          supplier.offers
        ).length,
        expected,
        template.id
      );

      for (
        const offer
        of Object.values(
          supplier.offers
        )
      ) {
        assert.ok(
          INGREDIENTS_V1.some(
            ingredient =>
              ingredient.id ===
              offer.ingredientId
          ),
          offer.ingredientId
        );

        assert.ok(
          offer.qualityMin >= 1 &&
          offer.qualityMax <= 5 &&
          offer.qualityMin <=
            offer.qualityMax
        );

        assert.ok(
          offer.minimumOrder >
          0
        );

        assert.ok(
          offer.capacityPerDay >=
          offer.minimumOrder
        );
      }
    }

    for (
      const ingredient
      of INGREDIENTS_V1
    ) {
      const allSources =
        supplierSystem
          .list({
            activeOnly:
              true
          })
          .filter(
            supplier =>
              supplierIds.has(
                supplier.id
              ) &&
              supplier.offers[
                ingredient.id
              ]
          );

      const startingSources =
        allSources.filter(
          supplier =>
            supplier
              .capabilityTier ===
            "T1"
        );

      assert.ok(
        allSources.length >= 10,
        ingredient.id
      );

      assert.ok(
        startingSources.length >= 2,
        ingredient.id
      );
    }
  }
);


test(
  "能力档次与合作关系相互独立且账期受双重限制",
  () => {
    ingredientCatalogSystem.load(
      INGREDIENTS_V1,
      {
        overwrite:
          true
      }
    );

    supplierBootstrapSystem
      .ensureLoaded();

    const supplierId =
      "supplier_t4_comprehensive";

    supplierSystem
      .changeRelationship(
        supplierId,
        60
      );

    const before =
      supplierSystem.get(
        supplierId
      ).relationship;

    supplierBootstrapSystem
      .ensureLoaded();

    assert.equal(
      supplierSystem.get(
        supplierId
      ).relationship,
      before
    );

    const profile =
      supplierTradingSystem
        .getProfile(
          supplierId
        );

    assert.equal(
      profile.capabilityTier.id,
      "T4"
    );

    assert.equal(
      profile.partnership.id,
      "strategic"
    );

    assert.equal(
      profile.maxCreditDays,
      30
    );

    assert.equal(
      profile.creditDays,
      30
    );

    assert.equal(
      supplierTradingSystem
        .listProfiles({
          storeLevel: 1
        })
        .filter(
          item =>
            item.templateId !==
            null
        )
        .length >= 12,
      true
    );

    const formalAtLevel1 =
      supplierTradingSystem
        .listProfiles({
          storeLevel: 1
        })
        .filter(
          item =>
            item.id.startsWith(
              "supplier_t"
            )
        );

    assert.equal(
      formalAtLevel1.length,
      12
    );

    assert.equal(
      formalAtLevel1.every(
        item =>
          item.capabilityTier.id ===
          "T1"
      ),
      true
    );

    assert.equal(
      supplierTradingSystem
        .listProfiles({
          storeLevel: 4
        })
        .filter(
          item =>
            item.id.startsWith(
              "supplier_t"
            )
        )
        .length,
      36
    );
  }
);
