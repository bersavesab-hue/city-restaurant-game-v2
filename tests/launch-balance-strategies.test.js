import test from "node:test";
import assert from "node:assert/strict";

import {
  setupLaunchBalanceScenario,
  advanceStrategyDays,
  getStrategyCheckpoint,
  BALANCE_INITIAL_CAPITAL
} from "./helpers/launch-balance-scenario.js";

const STRATEGIES =
  Object.freeze([
    {
      id:
        "value",
      label:
        "性价比",
      price:
        19,
      marketingActionId:
        null
    },
    {
      id:
        "balanced",
      label:
        "稳健",
      price:
        22,
      marketingActionId:
        null
    },
    {
      id:
        "premium",
      label:
        "提价控客流",
      price:
        26,
      marketingActionId:
        null
    },
    {
      id:
        "promotion",
      label:
        "营销拉客",
      price:
        22,
      marketingActionId:
        "local_ads"
    }
  ]);

test(
  "T11 四种真实经营策略运行30天均可持续且不爆钱",
  () => {
    const results = [];

    for (
      const strategy
      of STRATEGIES
    ) {
      const scenario =
        setupLaunchBalanceScenario({
          seed:
            `t11-${strategy.id}`,
          price:
            strategy.price
        });

      advanceStrategyDays(
        scenario.restaurant.id,
        30,
        {
          marketingActionId:
            strategy
              .marketingActionId
        }
      );

      const checkpoint =
        getStrategyCheckpoint(
          scenario.restaurant.id,
          30
        );

      results.push({
        ...strategy,
        ...checkpoint
      });

      assert.ok(
        checkpoint.balance >
        0,
        `${strategy.label} 30天后破产`
      );

      assert.ok(
        checkpoint.balance <
        BALANCE_INITIAL_CAPITAL *
          1.5,
        `${strategy.label} 30天资金膨胀过快：${checkpoint.balance}`
      );

      assert.ok(
        checkpoint.profit >
        0,
        `${strategy.label} 最近30天仍亏损：${checkpoint.profit}`
      );

      assert.ok(
        checkpoint.margin >
          0.05 &&
        checkpoint.margin <
          0.45,
        `${strategy.label} 利润率异常：${(
          checkpoint.margin *
          100
        ).toFixed(1)}%`
      );

      assert.ok(
        checkpoint.level >=
          3 &&
        checkpoint.level <=
          5,
        `${strategy.label} 30天等级节奏异常：Lv.${checkpoint.level}`
      );
    }

    console.log(
      "[t11-strategy-matrix]",
      JSON.stringify(
        results.map(
          item => ({
            id:
              item.id,
            price:
              item.price,
            balance:
              item.balance,
            profit:
              item.profit,
            margin:
              Number(
                (
                  item.margin *
                  100
                ).toFixed(
                  1
                )
              ),
            orders:
              item.orders,
            averageSpend:
              Number(
                item.averageSpend
                  .toFixed(
                    1
                  )
              ),
            salaryRatio:
              Number(
                (
                  item.salaryRatio *
                  100
                ).toFixed(
                  1
                )
              ),
            ingredientRatio:
              Number(
                (
                  item.ingredientRatio *
                  100
                ).toFixed(
                  1
                )
              ),
            marketing:
              item.marketing,
            marketingRuns:
              item.marketingRuns,
            level:
              item.level,
            reviewScore:
              item.reviewScore,
            repeatRate:
              item.repeatRate
          })
        )
      )
    );

    const byId =
      Object.fromEntries(
        results.map(
          item => [
            item.id,
            item
          ]
        )
      );

    assert.ok(
      byId.value.orders >
      byId.balanced.orders,
      "低价策略应以更多订单换取更低毛利"
    );

    assert.ok(
      byId.value.orders >
      byId.premium.orders,
      "低价策略应明显高于提价策略客流"
    );

    assert.ok(
      byId.premium
        .averageSpend >
      byId.value
        .averageSpend,
      "提价策略应形成更高客单价"
    );

    assert.ok(
      byId.promotion
        .marketingRuns >
      0,
      "营销策略必须实际产生营销投入"
    );

    assert.ok(
      byId.promotion.orders >
      byId.balanced.orders,
      "营销策略应以营销成本换取更多订单"
    );

    assert.ok(
      byId.balanced.profit >
      byId.value.profit,
      "稳健定价应比低价策略保留更多利润"
    );
  }
);
