import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

const CHANNELS = Object.freeze([
  {
    id: "dine_in",
    name: "堂食",
    description: "门店现场用餐",
    defaultActive: true,
    commissionRate: 0,
    packagingCostPerOrder: 0,
    capacityMultiplier: 1,
    demandMultiplier: 1,
    requirement: {
      restaurantLevel: 1,
      reputation: 0,
      satisfaction: 0
    }
  },
  {
    id: "pickup",
    name: "到店自取",
    description: "顾客提前下单后到店取餐",
    defaultActive: false,
    commissionRate: 0,
    packagingCostPerOrder: 120,
    capacityMultiplier: 1.15,
    demandMultiplier: 0.22,
    requirement: {
      restaurantLevel: 1,
      reputation: 3,
      satisfaction: 45
    }
  },
  {
    id: "delivery",
    name: "外卖",
    description: "第三方配送渠道",
    defaultActive: false,
    commissionRate: 18,
    packagingCostPerOrder: 180,
    capacityMultiplier: 1.35,
    demandMultiplier: 0.38,
    requirement: {
      restaurantLevel: 2,
      reputation: 8,
      satisfaction: 50
    }
  },
  {
    id: "reservation",
    name: "预约",
    description: "提前锁定座位和到店时间",
    defaultActive: false,
    commissionRate: 0,
    packagingCostPerOrder: 0,
    capacityMultiplier: 0.92,
    demandMultiplier: 0.12,
    requirement: {
      restaurantLevel: 2,
      reputation: 12,
      satisfaction: 60
    }
  }
]);

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

class SalesChannelSystem {
  getDefinition(channelId) {
    const channel =
      CHANNELS.find(
        item =>
          item.id === channelId
      );

    if (!channel) {
      throw new Error(
        `Unknown sales channel "${channelId}"`
      );
    }

    return channel;
  }

  getDefinitions() {
    return structuredClone(
      CHANNELS
    );
  }

  getState(
    restaurantId,
    channelId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return (
      entitySystem
        .filter(
          "sales_channel_state",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.channelId ===
              channelId
        )[0] ?? null
    );
  }

  getRequirementStatus(
    restaurantId,
    channelId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const channel =
      this.getDefinition(
        channelId
      );

    const requirement =
      channel.requirement;

    const level =
      restaurant.level ?? 1;

    const reputation =
      restaurant.reputation ?? 0;

    const satisfaction =
      restaurant.customerSatisfaction ??
      50;

    const checks = {
      restaurantLevel:
        level >=
        requirement.restaurantLevel,

      reputation:
        reputation >=
        requirement.reputation,

      satisfaction:
        satisfaction >=
        requirement.satisfaction
    };

    return {
      eligible:
        Object.values(
          checks
        ).every(Boolean),

      checks,

      current: {
        restaurantLevel: level,
        reputation,
        satisfaction
      },

      required:
        structuredClone(
          requirement
        )
    };
  }

  ensureRestaurantChannels(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const created = [];

    for (
      const channel
      of CHANNELS
    ) {
      const existing =
        this.getState(
          restaurantId,
          channel.id
        );

      if (existing) {
        continue;
      }

      created.push(
        entitySystem.create(
          "sales_channel_state",
          {
            restaurantId,

            channelId:
              channel.id,

            unlocked:
              channel.id ===
              "dine_in",

            active:
              channel.id ===
              "dine_in",

            customCommissionRate:
              null,

            customPackagingCost:
              null,

            orderLimitPerHour:
              null,

            lifetimeOrders: 0,
            lifetimeGrossRevenue: 0,
            lifetimeNetRevenue: 0,
            lifetimeFees: 0
          }
        )
      );
    }

    return created;
  }

  unlock(
    restaurantId,
    channelId
  ) {
    this.ensureRestaurantChannels(
      restaurantId
    );

    const channel =
      this.getDefinition(
        channelId
      );

    const state =
      this.getState(
        restaurantId,
        channelId
      );

    if (state.unlocked) {
      return state;
    }

    const requirement =
      this.getRequirementStatus(
        restaurantId,
        channelId
      );

    if (!requirement.eligible) {
      throw new Error(
        `Sales channel "${channelId}" requirements not met`
      );
    }

    return entitySystem.update(
      "sales_channel_state",
      state.id,
      {
        unlocked: true,
        active:
          channel.defaultActive
      }
    );
  }

  setActive(
    restaurantId,
    channelId,
    active
  ) {
    this.ensureRestaurantChannels(
      restaurantId
    );

    if (
      typeof active !==
      "boolean"
    ) {
      throw new TypeError(
        "active must be boolean"
      );
    }

    const state =
      this.getState(
        restaurantId,
        channelId
      );

    if (
      active &&
      !state.unlocked
    ) {
      throw new Error(
        "Channel must be unlocked first"
      );
    }

    if (
      channelId === "dine_in" &&
      !active
    ) {
      throw new Error(
        "Dine-in channel cannot be disabled"
      );
    }

    return entitySystem.update(
      "sales_channel_state",
      state.id,
      {
        active
      }
    );
  }

  configure(
    restaurantId,
    channelId,
    {
      commissionRate = undefined,
      packagingCost = undefined,
      orderLimitPerHour = undefined
    } = {}
  ) {
    this.ensureRestaurantChannels(
      restaurantId
    );

    const state =
      this.getState(
        restaurantId,
        channelId
      );

    if (!state.unlocked) {
      throw new Error(
        "Channel must be unlocked first"
      );
    }

    const patch = {};

    if (
      commissionRate !==
      undefined
    ) {
      if (
        !Number.isFinite(
          commissionRate
        ) ||
        commissionRate < 0 ||
        commissionRate > 50
      ) {
        throw new RangeError(
          "commissionRate must be between 0 and 50"
        );
      }

      patch.customCommissionRate =
        commissionRate;
    }

    if (
      packagingCost !==
      undefined
    ) {
      if (
        !Number.isInteger(
          packagingCost
        ) ||
        packagingCost < 0
      ) {
        throw new RangeError(
          "packagingCost must be a non-negative integer"
        );
      }

      patch.customPackagingCost =
        packagingCost;
    }

    if (
      orderLimitPerHour !==
      undefined
    ) {
      if (
        orderLimitPerHour !==
          null &&
        (
          !Number.isInteger(
            orderLimitPerHour
          ) ||
          orderLimitPerHour < 1
        )
      ) {
        throw new RangeError(
          "orderLimitPerHour must be null or positive integer"
        );
      }

      patch.orderLimitPerHour =
        orderLimitPerHour;
    }

    return entitySystem.update(
      "sales_channel_state",
      state.id,
      patch
    );
  }

  getEffectiveChannel(
    restaurantId,
    channelId
  ) {
    this.ensureRestaurantChannels(
      restaurantId
    );

    const definition =
      this.getDefinition(
        channelId
      );

    const state =
      this.getState(
        restaurantId,
        channelId
      );

    const commissionRate =
      state
        .customCommissionRate ??
      definition.commissionRate;

    const packagingCostPerOrder =
      state
        .customPackagingCost ??
      definition
        .packagingCostPerOrder;

    return {
      ...structuredClone(
        definition
      ),

      stateId:
        state.id,

      unlocked:
        state.unlocked,

      active:
        state.active,

      commissionRate,

      packagingCostPerOrder,

      orderLimitPerHour:
        state.orderLimitPerHour,

      lifetimeOrders:
        state.lifetimeOrders,

      lifetimeGrossRevenue:
        state
          .lifetimeGrossRevenue,

      lifetimeNetRevenue:
        state
          .lifetimeNetRevenue,

      lifetimeFees:
        state.lifetimeFees
    };
  }

  list(
    restaurantId
  ) {
    this.ensureRestaurantChannels(
      restaurantId
    );

    return CHANNELS.map(
      channel => ({
        ...this.getEffectiveChannel(
          restaurantId,
          channel.id
        ),

        requirementStatus:
          this.getRequirementStatus(
            restaurantId,
            channel.id
          )
      })
    );
  }

  getActiveChannels(
    restaurantId
  ) {
    return this
      .list(
        restaurantId
      )
      .filter(
        channel =>
          channel.unlocked &&
          channel.active
      );
  }

  calculateSettlement({
    restaurantId,
    channelId,
    grossRevenue,
    orderCount = 1
  }) {
    if (
      !Number.isInteger(
        grossRevenue
      ) ||
      grossRevenue < 0
    ) {
      throw new RangeError(
        "grossRevenue must be a non-negative integer"
      );
    }

    if (
      !Number.isInteger(
        orderCount
      ) ||
      orderCount < 1
    ) {
      throw new RangeError(
        "orderCount must be a positive integer"
      );
    }

    const channel =
      this.getEffectiveChannel(
        restaurantId,
        channelId
      );

    if (
      !channel.unlocked ||
      !channel.active
    ) {
      throw new Error(
        "Sales channel is not active"
      );
    }

    const commission =
      Math.round(
        grossRevenue *
        channel.commissionRate /
        100
      );

    const packaging =
      channel
        .packagingCostPerOrder *
      orderCount;

    const fees =
      commission +
      packaging;

    const netRevenue =
      Math.max(
        0,
        grossRevenue -
        fees
      );

    return {
      restaurantId,
      channelId,

      grossRevenue,
      orderCount,

      commissionRate:
        channel.commissionRate,

      commission,

      packagingCost:
        packaging,

      fees,

      netRevenue,

      effectiveMarginRate:
        grossRevenue > 0
          ? Number(
              (
                netRevenue /
                grossRevenue *
                100
              ).toFixed(1)
            )
          : 0
    };
  }

  recordSettlement(
    settlement
  ) {
    const state =
      this.getState(
        settlement.restaurantId,
        settlement.channelId
      );

    if (!state) {
      throw new Error(
        "Sales channel state does not exist"
      );
    }

    return entitySystem.update(
      "sales_channel_state",
      state.id,
      {
        lifetimeOrders:
          state.lifetimeOrders +
          settlement.orderCount,

        lifetimeGrossRevenue:
          state
            .lifetimeGrossRevenue +
          settlement.grossRevenue,

        lifetimeNetRevenue:
          state
            .lifetimeNetRevenue +
          settlement.netRevenue,

        lifetimeFees:
          state.lifetimeFees +
          settlement.fees
      }
    );
  }

  getDemandWeights(
    restaurantId
  ) {
    const active =
      this.getActiveChannels(
        restaurantId
      );

    const total =
      active.reduce(
        (sum, channel) =>
          sum +
          channel.demandMultiplier,
        0
      );

    if (total <= 0) {
      return [];
    }

    return active.map(
      channel => ({
        channelId:
          channel.id,

        weight:
          Number(
            (
              channel
                .demandMultiplier /
              total
            ).toFixed(4)
          ),

        demandMultiplier:
          channel
            .demandMultiplier,

        capacityMultiplier:
          channel
            .capacityMultiplier
      })
    );
  }

  getChannelPerformance(
    restaurantId,
    channelId
  ) {
    const orders =
      entitySystem.filter(
        "customer_order",
        order =>
          order.restaurantId ===
            restaurantId &&
          (
            order.channelId ??
            "dine_in"
          ) === channelId
      );

    let orderCount = 0;
    let grossRevenue = 0;
    let netRevenue = 0;
    let channelFees = 0;
    let profit = 0;

    for (
      const order
      of orders
    ) {
      const count =
        order.aggregate
          ? Math.max(
              1,
              order.orderCount ??
              1
            )
          : 1;

      orderCount += count;

      grossRevenue +=
        order.paidAmount ??
        order.totalRevenue ??
        0;

      netRevenue +=
        order.channelNetRevenue ??
        order.paidAmount ??
        order.totalRevenue ??
        0;

      channelFees +=
        order.channelFees ??
        0;

      profit +=
        order.grossProfit ??
        0;
    }

    return {
      channelId,

      orderCount,

      grossRevenue,

      netRevenue,

      channelFees,

      profit,

      averageOrderValue:
        orderCount > 0
          ? Math.round(
              grossRevenue /
              orderCount
            )
          : 0,

      averageProfitPerOrder:
        orderCount > 0
          ? Math.round(
              profit /
              orderCount
            )
          : 0,

      profitMargin:
        grossRevenue > 0
          ? Number(
              (
                profit /
                grossRevenue *
                100
              ).toFixed(1)
            )
          : 0
    };
  }

  getDashboard(
    restaurantId
  ) {
    const channels =
      this.list(
        restaurantId
      )
      .map(
        channel => ({
          ...channel,

          performance:
            this.getChannelPerformance(
              restaurantId,
              channel.id
            )
        })
      );

    const active =
      channels.filter(
        item =>
          item.unlocked &&
          item.active
      );

    return {
      restaurantId,

      unlockedCount:
        channels.filter(
          item =>
            item.unlocked
        ).length,

      activeCount:
        active.length,

      totalOrders:
        channels.reduce(
          (sum, item) =>
            sum +
            item.lifetimeOrders,
          0
        ),

      grossRevenue:
        channels.reduce(
          (sum, item) =>
            sum +
            item
              .lifetimeGrossRevenue,
          0
        ),

      netRevenue:
        channels.reduce(
          (sum, item) =>
            sum +
            item
              .lifetimeNetRevenue,
          0
        ),

      totalFees:
        channels.reduce(
          (sum, item) =>
            sum +
            item.lifetimeFees,
          0
        ),

      demandWeights:
        this.getDemandWeights(
          restaurantId
        ),

      channels
    };
  }
}

export const salesChannelSystem =
  new SalesChannelSystem();

export {
  SalesChannelSystem,
  CHANNELS as SALES_CHANNELS
};
