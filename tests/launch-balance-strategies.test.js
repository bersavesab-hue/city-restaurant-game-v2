import test from "node:test";
import assert from "node:assert/strict";

import {
  setupLaunchBalanceScenario,
  advanceStrategyDays,
  getStrategyCheckpoint,
  BALANCE_INITIAL_CAPITAL
} from "./helpers/launch-balance-scenario.js";

const PRICING_STRATEGIES =
  Object.freeze([
    {
      id:
        "value",
      label:
        "性价比",
      price:
        19
    },
    {
      id:
        "balanced",
      label:
        "稳健",
      price:
        22
    },
    {
      id:
        "premium",
      label:
        "提价控客流",
      price:
        26
    }
  ]);

test(
  "T11 满产能门店三种定价策略30天均可持续且存在真实取舍",
  () => {
    const results = [];

    for (
      const strategy
      of PRICING_STRATEGIES
    ) {
      const scenario =
        setupLaunchBalanceScenario({
          seed:
            `t11-${strategy.id}`,
          price:
            strategy.price,
          trafficIndex:
            100
        });

      advanceStrategyDays(
        scenario.restaurant.id,
        30
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
      byId.value.orders >=
        byId.balanced.orders *
          0.95,
      "满产能时低价不应凭空突破服务上限"
    );

    assert.ok(
      byId.balanced.profit >
      byId.value.profit,
      "满产能时盲目降价应牺牲利润"
    );

    assert.ok(
      byId.premium
        .averageSpend >
      byId.balanced
        .averageSpend,
      "提价策略应形成更高客单价"
    );

    assert.ok(
      byId.premium.orders <
      byId.balanced.orders,
      "提价策略应以更少客流换更高客单价"
    );

    console.log(
      "[t11-pricing-matrix]",
      JSON.stringify(
        results.map(
          item => ({
            id:
              item.id,
            balance:
              item.balance,
            profit:
              item.profit,
            margin:
              Number(
                (
                  item.margin *
                  100
                ).toFixed(1)
              ),
            orders:
              item.orders,
            averageSpend:
              Number(
                item.averageSpend
                  .toFixed(1)
              ),
            level:
              item.level
          })
        )
      )
    );
  }
);

test(
  "T11 有余量门店营销必须用成本换来新增订单而不是无脑投放",
  () => {
    const baseline =
      setupLaunchBalanceScenario({
        seed:
          "t11-low-traffic-base",
        price:
          22,
        trafficIndex:
          58
      });

    advanceStrategyDays(
      baseline.restaurant.id,
      30
    );

    const base =
      getStrategyCheckpoint(
        baseline.restaurant.id,
        30
      );

    const promoted =
      setupLaunchBalanceScenario({
        seed:
          "t11-low-traffic-promo",
        price:
          22,
        trafficIndex:
          58
      });

    advanceStrategyDays(
      promoted.restaurant.id,
      30,
      {
        marketingActionId:
          "local_ads"
      }
    );

    const promo =
      getStrategyCheckpoint(
        promoted.restaurant.id,
        30
      );

    assert.ok(
      promo.marketingRuns >
      0,
      "营销场景必须实际启动活动"
    );

    assert.ok(
      promo.marketing >
      0,
      "营销场景必须形成真实支出"
    );

    assert.ok(
      promo.orders >
      base.orders,
      `有余量门店营销后订单没有增长：${base.orders} -> ${promo.orders}`
    );

    assert.ok(
      promo.balance >
      0,
      "营销策略不应导致30天内破产"
    );

    assert.ok(
      promo.balance <
      BALANCE_INITIAL_CAPITAL *
        1.5,
      "营销策略资金膨胀异常"
    );

    console.log(
      "[t11-marketing-headroom]",
      JSON.stringify({
        base: {
          orders:
            base.orders,
          profit:
            base.profit,
          balance:
            base.balance
        },
        promo: {
          orders:
            promo.orders,
          profit:
            promo.profit,
          balance:
            promo.balance,
          marketing:
            promo.marketing,
          marketingRuns:
            promo.marketingRuns
        }
      })
    );
  }
);
