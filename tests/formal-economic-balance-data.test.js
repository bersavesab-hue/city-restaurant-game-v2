import test from "node:test";
import assert from "node:assert/strict";

import {
  ECONOMIC_BALANCE_META,
  CHANNEL_ECONOMY_POLICY,
  calculateDishResearchCost,
  getDishResearchMarkup,
  calculateDishImprovementCost,
  calculateUtilityUsage,
  validateEconomicBalanceRules
} from "../src/data/economicBalanceRules.js";

import {
  economicBalanceSystem
} from "../src/systems/EconomicBalanceSystem.js";

import {
  SALES_CHANNELS_V1
} from "../src/data/salesChannels.v1.js";

test(
  "正式经济平衡体系固定人民币1比1且规则可校验",
  () => {
    assert.equal(
      ECONOMIC_BALANCE_META.currency,
      "CNY"
    );

    assert.equal(
      ECONOMIC_BALANCE_META
        .nominalCurrencyScale,
      1
    );

    assert.equal(
      validateEconomicBalanceRules(),
      true
    );

    assert.equal(
      economicBalanceSystem
        .validateConfiguration(),
      true
    );
  }
);

test(
  "研发费用与建议售价统一走经济平衡公式",
  () => {
    assert.equal(
      calculateDishResearchCost({
        ingredientCount: 3,
        difficulty: 50
      }),
      2050
    );

    assert.equal(
      Number(
        getDishResearchMarkup(
          80
        ).toFixed(2)
      ),
      2.82
    );

    assert.equal(
      calculateDishImprovementCost({
        focus: "quality",
        attempts: 2,
        rankOrder: 3
      }),
      3200
    );
  }
);

test(
  "水电燃气用量参数由单一规则源计算",
  () => {
    const usage =
      calculateUtilityUsage({
        openHours: 10,
        kitchenStations: 2,
        seats: 20,
        orders: 100
      });

    assert.equal(
      Number(
        usage.electricityKwh
          .toFixed(2)
      ),
      79
    );

    assert.equal(
      Number(
        usage.waterTon
          .toFixed(2)
      ),
      1.69
    );

    assert.equal(
      Number(
        usage.gasCubicMeter
          .toFixed(2)
      ),
      7.9
    );
  }
);

test(
  "渠道包装费使用名义人民币而不是分元错位",
  () => {
    const byId =
      Object.fromEntries(
        SALES_CHANNELS_V1.map(
          item => [
            item.id,
            item
          ]
        )
      );

    assert.equal(
      byId.pickup
        .packagingCostPerOrder,
      CHANNEL_ECONOMY_POLICY
        .defaultPackagingCost
        .pickup
    );

    assert.equal(
      byId.delivery
        .packagingCostPerOrder,
      4
    );

    assert.ok(
      byId.delivery
        .packagingCostPerOrder <
      50
    );
  }
);
