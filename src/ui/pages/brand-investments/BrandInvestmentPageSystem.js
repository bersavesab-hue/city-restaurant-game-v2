import {
  lateGameInvestmentSystem
} from "../../../systems/LateGameInvestmentSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";


class BrandInvestmentPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const dashboard =
      lateGameInvestmentSystem
        .getDashboard(
          restaurantId
        );

    return {
      pageId:
        "brand-investments",

      title:
        "长期品牌基建",

      restaurantId,

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        level:
          restaurant.level ??
          1
      },

      ...dashboard
    };
  }


  purchase(
    restaurantId,
    investmentId
  ) {
    return lateGameInvestmentSystem
      .purchase(
        restaurantId,
        investmentId
      );
  }
}


export const brandInvestmentPageSystem =
  new BrandInvestmentPageSystem();


export {
  BrandInvestmentPageSystem
};
