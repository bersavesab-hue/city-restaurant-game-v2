import {
  SUPPLIER_CAPABILITY_TIER,
  SUPPLIER_TYPE
} from "./supplierRules.js";

export const SUPPLIER_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 60,
    tiers: {
      T1: 12,
      T2: 12,
      T3: 12,
      T4: 12,
      T5: 12
    },
    generationModel:
      "template_groups_to_ingredient_offers",
    sourceIngredientCatalog:
      "ingredients.v1",
    sourceIngredientCount: 220
  });

const ARCHETYPES =
  Object.freeze([
    {
      key: "comprehensive",
      supplierType:
        SUPPLIER_TYPE.COMPREHENSIVE,
      supplyGroups: [
        "fresh_meat",
        "poultry",
        "aquatic",
        "produce",
        "fruit",
        "grain",
        "bean_products",
        "egg_dairy",
        "seasoning",
        "oil",
        "dry_goods",
        "beverage",
        "processed"
      ],
      priceAdjust: 0.01,
      reliabilityAdjust: 0,
      deliveryAdjust: 20,
      qualityAdjust: 0,
      minimumOrderFactor: 1.1,
      capacityFactor: 1.25
    },
    {
      key: "meat_poultry",
      supplierType:
        SUPPLIER_TYPE.MEAT_POULTRY,
      supplyGroups: [
        "fresh_meat",
        "poultry"
      ],
      priceAdjust: -0.02,
      reliabilityAdjust: 1,
      deliveryAdjust: 0,
      qualityAdjust: 0,
      minimumOrderFactor: 1,
      capacityFactor: 1.15
    },
    {
      key: "aquatic",
      supplierType:
        SUPPLIER_TYPE.AQUATIC,
      supplyGroups: [
        "aquatic"
      ],
      priceAdjust: 0.03,
      reliabilityAdjust: -1,
      deliveryAdjust: -10,
      qualityAdjust: 0,
      minimumOrderFactor: 0.9,
      capacityFactor: 0.95
    },
    {
      key: "produce_fruit",
      supplierType:
        SUPPLIER_TYPE.PRODUCE_FRUIT,
      supplyGroups: [
        "produce",
        "fruit"
      ],
      priceAdjust: -0.03,
      reliabilityAdjust: 0,
      deliveryAdjust: -20,
      qualityAdjust: 0,
      minimumOrderFactor: 0.9,
      capacityFactor: 1.2
    },
    {
      key: "grain_bean",
      supplierType:
        SUPPLIER_TYPE.GRAIN_BEAN,
      supplyGroups: [
        "grain",
        "bean_products"
      ],
      priceAdjust: -0.04,
      reliabilityAdjust: 2,
      deliveryAdjust: 30,
      qualityAdjust: 0,
      minimumOrderFactor: 1.3,
      capacityFactor: 1.4
    },
    {
      key: "egg_dairy",
      supplierType:
        SUPPLIER_TYPE.EGG_DAIRY,
      supplyGroups: [
        "egg_dairy",
        "bean_products"
      ],
      priceAdjust: 0,
      reliabilityAdjust: 1,
      deliveryAdjust: -10,
      qualityAdjust: 0,
      minimumOrderFactor: 0.9,
      capacityFactor: 1
    },
    {
      key: "seasoning_oil",
      supplierType:
        SUPPLIER_TYPE.SEASONING_OIL,
      supplyGroups: [
        "seasoning",
        "oil"
      ],
      priceAdjust: -0.02,
      reliabilityAdjust: 2,
      deliveryAdjust: 40,
      qualityAdjust: 0,
      minimumOrderFactor: 1.2,
      capacityFactor: 1.3
    },
    {
      key: "dry_goods",
      supplierType:
        SUPPLIER_TYPE.DRY_GOODS,
      supplyGroups: [
        "dry_goods",
        "seasoning"
      ],
      priceAdjust: -0.01,
      reliabilityAdjust: 2,
      deliveryAdjust: 40,
      qualityAdjust: 0,
      minimumOrderFactor: 1.2,
      capacityFactor: 1.25
    },
    {
      key: "beverage",
      supplierType:
        SUPPLIER_TYPE.BEVERAGE,
      supplyGroups: [
        "beverage",
        "fruit"
      ],
      priceAdjust: -0.02,
      reliabilityAdjust: 2,
      deliveryAdjust: 20,
      qualityAdjust: 0,
      minimumOrderFactor: 1.2,
      capacityFactor: 1.4
    },
    {
      key: "cold_chain",
      supplierType:
        SUPPLIER_TYPE.COLD_CHAIN,
      supplyGroups: [
        "fresh_meat",
        "poultry",
        "aquatic",
        "egg_dairy"
      ],
      priceAdjust: 0.05,
      reliabilityAdjust: 4,
      deliveryAdjust: -30,
      qualityAdjust: 1,
      minimumOrderFactor: 1,
      capacityFactor: 1.1
    },
    {
      key: "processed",
      supplierType:
        SUPPLIER_TYPE.PROCESSED,
      supplyGroups: [
        "processed",
        "grain",
        "bean_products"
      ],
      priceAdjust: -0.01,
      reliabilityAdjust: 1,
      deliveryAdjust: 10,
      qualityAdjust: 0,
      minimumOrderFactor: 1.1,
      capacityFactor: 1.2
    },
    {
      key: "premium",
      supplierType:
        SUPPLIER_TYPE.PREMIUM,
      supplyGroups: [
        "fresh_meat",
        "poultry",
        "aquatic",
        "produce",
        "fruit",
        "dry_goods"
      ],
      priceAdjust: 0.12,
      reliabilityAdjust: 3,
      deliveryAdjust: -20,
      qualityAdjust: 1,
      minimumOrderFactor: 0.8,
      capacityFactor: 0.8
    }
  ]);

const NAMES =
  Object.freeze({
    T1: [
      "惠邻综合配送",
      "城南鲜肉行",
      "河湾水产",
      "青禾蔬果",
      "丰谷粮油",
      "晨牧蛋奶",
      "百味调料",
      "山仓干货",
      "清泉饮品",
      "恒鲜冷链",
      "民生加工食材",
      "市集精选"
    ],
    T2: [
      "新城集采",
      "瑞丰肉食",
      "海源水产",
      "田园鲜配",
      "金穗粮油",
      "牧场蛋奶",
      "味和调味",
      "丰藏干货",
      "清润饮品",
      "安达冷链",
      "食汇加工",
      "优鲜精选"
    ],
    T3: [
      "华盛餐饮供应",
      "鼎鲜肉业",
      "蓝港水产",
      "绿野生鲜",
      "嘉谷粮油",
      "优牧蛋奶",
      "味鼎调味",
      "山海干货",
      "沁源饮品",
      "恒温冷配",
      "厨选加工",
      "匠选食材"
    ],
    T4: [
      "卓越餐饮集配",
      "臻鲜肉食",
      "海珍水产",
      "青岚精品蔬果",
      "瑞谷优粮",
      "臻牧蛋奶",
      "鼎味调味",
      "珍藏干货",
      "沁品饮料",
      "极速冷链",
      "厨艺半成品",
      "臻选食材"
    ],
    T5: [
      "旗舰中央集采",
      "国鲜肉食供应",
      "深蓝海产供应",
      "四季臻果蔬",
      "金仓粮油供应",
      "牧源高端蛋奶",
      "国味调味供应",
      "山珍干货供应",
      "饮品联合供应",
      "全国冷链中心",
      "中央加工供应",
      "旗舰精品食材"
    ]
  });

const PRICE_BASE =
  Object.freeze({
    T1: 0.94,
    T2: 0.97,
    T3: 1,
    T4: 1.04,
    T5: 1.08
  });

const RELATIONSHIP_BASE =
  Object.freeze({
    T1: 45,
    T2: 40,
    T3: 35,
    T4: 30,
    T5: 25
  });

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

function buildTemplates() {
  const result = [];

  for (
    const tier
    of Object.values(
      SUPPLIER_CAPABILITY_TIER
    )
  ) {
    ARCHETYPES.forEach(
      (
        archetype,
        index
      ) => {
        const qualityMin =
          clamp(
            tier.defaultQualityMin +
              (
                archetype.qualityAdjust >
                  0 &&
                tier.level >= 3
                  ? 1
                  : 0
              ),
            1,
            5
          );

        const qualityMax =
          clamp(
            tier.defaultQualityMax +
              archetype.qualityAdjust,
            qualityMin,
            5
          );

        result.push({
          schemaVersion: 1,
          id:
            `supplier_${tier.id.toLowerCase()}_${archetype.key}`,
          name:
            NAMES[tier.id][index],
          capabilityTier:
            tier.id,
          supplierType:
            archetype.supplierType,
          supplyGroups: [
            ...archetype
              .supplyGroups
          ],
          priceIndex:
            Number(
              (
                PRICE_BASE[tier.id] +
                archetype.priceAdjust
              ).toFixed(2)
            ),
          priceVolatility:
            tier
              .defaultPriceVolatility,
          qualityMin,
          qualityMax,
          reliability:
            clamp(
              tier.defaultReliability +
                archetype
                  .reliabilityAdjust,
              60,
              100
            ),
          deliveryMinutes:
            clamp(
              tier.defaultDeliveryMinutes +
                archetype
                  .deliveryAdjust,
              30,
              720
            ),
          minimumOrderFactor:
            archetype
              .minimumOrderFactor,
          capacityFactor:
            archetype
              .capacityFactor,
          maxCreditDays:
            tier
              .defaultMaxCreditDays,
          initialRelationship:
            RELATIONSHIP_BASE[
              tier.id
            ],
          unlockLevel:
            tier.unlockLevel
        });
      }
    );
  }

  return result;
}

export const SUPPLIERS_V1 =
  Object.freeze(
    buildTemplates()
  );
