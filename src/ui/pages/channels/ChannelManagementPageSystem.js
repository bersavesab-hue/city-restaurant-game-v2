import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  salesChannelSystem
} from "../../../systems/SalesChannelSystem.js";

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
}

export const channelManagementPageSystem =
  new ChannelManagementPageSystem();

export {
  ChannelManagementPageSystem
};
