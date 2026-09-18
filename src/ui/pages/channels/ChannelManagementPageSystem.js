import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  salesChannelSystem
} from "../../../systems/SalesChannelSystem.js";

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

    return {
      pageId:
        "channels",

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
