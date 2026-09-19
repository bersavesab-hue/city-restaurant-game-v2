import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  salesChannelSystem
} from "../../../systems/SalesChannelSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

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

class ChannelManagementPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const dashboard =
      salesChannelSystem
        .getDashboard(
          restaurantId
        );

    let balance =
      0;

    try {
      balance =
        financeSystem.getBalance(
          restaurantId
        );
    } catch {
      balance =
        0;
    }

    const notices =
      [];

    const saturated =
      dashboard.channels
        .filter(
          channel =>
            channel.unlocked &&
            channel.active &&
            channel.capacityStatus
              .remaining <=
              0
        );

    if (
      saturated.length >
      0
    ) {
      notices.push({
        id:
          "channel_capacity",

        type:
          "warning",

        title:
          "渠道容量",

        message:
          `${saturated.length}个营业渠道本小时已达到接单上限`,

        priority:
          90
      });
    }

    return {
      pageId:
        "channels",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance,

          storeLevel:
            restaurant.level ??
            1,

          reputation:
            restaurant.reputation ??
            0,

          time:
            gameState.getSection(
              "time"
            ),

          runtime:
            gameState.getSection(
              "runtime"
            ),

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      title:
        "销售渠道",

      restaurantId,

      restaurant: {
        level:
          restaurant.level ?? 1,

        reputation:
          restaurant.reputation ?? 0,

        satisfaction:
          restaurant
            .customerSatisfaction ??
          50
      },

      ...dashboard
    };
  }

  unlockChannel(
    restaurantId,
    channelId
  ) {
    return salesChannelSystem
      .unlock(
        restaurantId,
        channelId
      );
  }

  setChannelActive(
    restaurantId,
    channelId,
    active
  ) {
    return salesChannelSystem
      .setActive(
        restaurantId,
        channelId,
        active
      );
  }

  adjustPriority(
    restaurantId,
    channelId,
    delta
  ) {
    const channel =
      salesChannelSystem
        .getEffectiveChannel(
          restaurantId,
          channelId
        );

    const next =
      Number(
        clamp(
          channel
            .priorityMultiplier +
          delta,
          0.5,
          1.5
        ).toFixed(2)
      );

    salesChannelSystem
      .configure(
        restaurantId,
        channelId,
        {
          priorityMultiplier:
            next
        }
      );

    return next;
  }

  adjustHourlyLimit(
    restaurantId,
    channelId,
    delta
  ) {
    const channel =
      salesChannelSystem
        .getEffectiveChannel(
          restaurantId,
          channelId
        );

    const next =
      Math.round(
        clamp(
          channel
            .orderLimitPerHour +
          delta,
          1,
          500
        )
      );

    salesChannelSystem
      .configure(
        restaurantId,
        channelId,
        {
          orderLimitPerHour:
            next
        }
      );

    return next;
  }
}

export const channelManagementPageSystem =
  new ChannelManagementPageSystem();

export {
  ChannelManagementPageSystem
};
