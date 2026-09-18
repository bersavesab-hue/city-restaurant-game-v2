import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  SALES_CHANNELS_V1
} from "../data/salesChannels.v1.js";

const CHANNELS =
  SALES_CHANNELS_V1;

const CHANNEL_MAP =
  Object.freeze(
    Object.fromEntries(
      CHANNELS.map(
        item => [
          item.id,
          item
        ]
      )
    )
  );

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
      CHANNEL_MAP[
        channelId
      ];

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
        )[0] ??
      null
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

            customPriorityMultiplier:
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
      orderLimitPerHour = undefined,
      priorityMultiplier = undefined
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
          orderLimitPerHour < 1 ||
          orderLimitPerHour > 500
        )
      ) {
        throw new RangeError(
          "orderLimitPerHour must be null or 1-500"
        );
      }

      patch.orderLimitPerHour =
        orderLimitPerHour;
    }

    if (
      priorityMultiplier !==
      undefined
    ) {
      if (
        priorityMultiplier !==
          null &&
        (
          !Number.isFinite(
            priorityMultiplier
          ) ||
          priorityMultiplier < 0.5 ||
          priorityMultiplier > 1.5
        )
      ) {
        throw new RangeError(
          "priorityMultiplier must be null or 0.5-1.5"
        );
      }

      patch.customPriorityMultiplier =
        priorityMultiplier;
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

    const orderLimitPerHour =
      state.orderLimitPerHour ??
      definition
        .defaultOrderLimitPerHour;

    const priorityMultiplier =
      state
        .customPriorityMultiplier ??
      definition
        .defaultPriorityMultiplier;

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

      orderLimitPerHour,

      priorityMultiplier,

      lifetimeOrders:
        state.lifetimeOrders ??
        0,

      lifetimeGrossRevenue:
        state
          .lifetimeGrossRevenue ??
        0,

      lifetimeNetRevenue:
        state
          .lifetimeNetRevenue ??
        0,

      lifetimeFees:
        state.lifetimeFees ??
        0
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
          ),

        capacityStatus:
          this.getCapacityStatus(
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

  getHourlyUsage(
    restaurantId,
    channelId,
    time = null
  ) {
    const current =
      time ??
      gameState.getSection(
        "time"
      );

    const hourBucket =
      Math.floor(
        (
          current.totalMinutes ??
          0
        ) /
        60
      );

    const orders =
      entitySystem.filter(
        "customer_order",
        order =>
          order.restaurantId ===
            restaurantId &&
          (
            order.channelId ??
            "dine_in"
          ) === channelId &&
          order.status ===
            "completed" &&
          Math.floor(
            (
              order.createdAt ??
              -1
            ) /
            60
          ) ===
            hourBucket
      );

    return orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        (
          order.aggregate
            ? Math.max(
                1,
                order.orderCount ??
                1
              )
            : 1
        ),
      0
    );
  }

  getCapacityStatus(
    restaurantId,
    channelId,
    time = null
  ) {
    const channel =
      this.getEffectiveChannel(
        restaurantId,
        channelId
      );

    const used =
      this.getHourlyUsage(
        restaurantId,
        channelId,
        time
      );

    const limit =
      channel.orderLimitPerHour;

    const remaining =
      Math.max(
        0,
        limit -
        used
      );

    return {
      channelId,
      limit,
      used,
      remaining,
      full:
        remaining <= 0,
      utilizationRate:
        limit > 0
          ? Number(
              (
                used /
                limit *
                100
              ).toFixed(1)
            )
          : 0
    };
  }

  assertCapacity(
    restaurantId,
    channelId,
    orderCount = 1
  ) {
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
      const error =
        new Error(
          "Sales channel is not active"
        );

      error.code =
        "CHANNEL_NOT_ACTIVE";

      throw error;
    }

    const capacity =
      this.getCapacityStatus(
        restaurantId,
        channelId
      );

    if (
      capacity.remaining <
      orderCount
    ) {
      const error =
        new Error(
          `Sales channel "${channelId}" hourly capacity exceeded`
        );

      error.code =
        "CHANNEL_CAPACITY_REACHED";

      error.channelId =
        channelId;

      error.capacity =
        capacity;

      throw error;
    }

    return capacity;
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
          (
            state.lifetimeOrders ??
            0
          ) +
          settlement.orderCount,

        lifetimeGrossRevenue:
          (
            state
              .lifetimeGrossRevenue ??
            0
          ) +
          settlement.grossRevenue,

        lifetimeNetRevenue:
          (
            state
              .lifetimeNetRevenue ??
            0
          ) +
          settlement.netRevenue,

        lifetimeFees:
          (
            state.lifetimeFees ??
            0
          ) +
          settlement.fees
      }
    );
  }

  getDemandWeights(
    restaurantId,
    {
      segment = null,
      channelMultipliers = {}
    } = {}
  ) {
    const active =
      this.getActiveChannels(
        restaurantId
      );

    const weighted =
      active.map(
        channel => {
          const preference =
            segment
              ?.channelPreferences?.[
                channel.id
              ] ??
            1;

          const marketing =
            channelMultipliers[
              channel.id
            ] ??
            1;

          const capacity =
            this.getCapacityStatus(
              restaurantId,
              channel.id
            );

          const rawWeight =
            capacity.full
              ? 0
              : Math.max(
                  0,
                  channel
                    .demandMultiplier *
                  channel
                    .priorityMultiplier *
                  Math.max(
                    0,
                    Number(
                      preference
                    ) ||
                    0
                  ) *
                  Math.max(
                    0,
                    Number(
                      marketing
                    ) ||
                    0
                  )
                );

          return {
            channelId:
              channel.id,
            name:
              channel.name,
            rawWeight,
            demandMultiplier:
              channel
                .demandMultiplier,
            priorityMultiplier:
              channel
                .priorityMultiplier,
            preference:
              Number(
                preference
              ) ||
              0,
            marketingMultiplier:
              Number(
                marketing
              ) ||
              1,
            capacityMultiplier:
              channel
                .capacityMultiplier,
            onPremiseShare:
              channel
                .onPremiseShare,
            capacity
          };
        }
      )
      .filter(
        item =>
          item.rawWeight >
          0
      );

    const total =
      weighted.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.rawWeight,
        0
      );

    if (
      total <= 0
    ) {
      return [];
    }

    return weighted.map(
      item => ({
        ...item,
        weight:
          Number(
            (
              item.rawWeight /
              total
            ).toFixed(4)
          )
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
    let ingredientCost = 0;
    let contributionProfit = 0;
    let commission = 0;
    let packagingCost = 0;

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

      commission +=
        order.channelCommission ??
        0;

      packagingCost +=
        order.channelPackagingCost ??
        0;

      ingredientCost +=
        order.ingredientCost ??
        0;

      contributionProfit +=
        order.grossProfit ??
        0;
    }

    return {
      channelId,

      orderCount,

      grossRevenue,

      netRevenue,

      commission,

      packagingCost,

      channelFees,

      ingredientCost,

      contributionProfit,

      profit:
        contributionProfit,

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
              contributionProfit /
              orderCount
            )
          : 0,

      averageFeePerOrder:
        orderCount > 0
          ? Math.round(
              channelFees /
              orderCount
            )
          : 0,

      feeRate:
        grossRevenue > 0
          ? Number(
              (
                channelFees /
                grossRevenue *
                100
              ).toFixed(1)
            )
          : 0,

      profitMargin:
        grossRevenue > 0
          ? Number(
              (
                contributionProfit /
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

      contributionProfit:
        channels.reduce(
          (sum, item) =>
            sum +
            item
              .performance
              .contributionProfit,
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
