import {
  gameState
} from "../../core/GameState.js";

import {
  restaurantSystem
} from "../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../systems/FinanceSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "./GlobalChromeModel.js";


function safeBalance(
  restaurantId
) {
  try {
    if (
      typeof financeSystem
        .findAccount ===
        "function" &&
      !financeSystem
        .findAccount(
          restaurantId
        )
    ) {
      return 0;
    }

    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


export function buildFormalPageChrome(
  restaurantId,
  {
    notices = [],
    restaurant:
      restaurantOverride =
      null,
    balance:
      balanceOverride =
      null
  } = {}
) {
  let restaurant =
    restaurantOverride;

  if (
    !restaurant
  ) {
    try {
      restaurant =
        restaurantSystem.get(
          restaurantId
        );
    } catch {
      restaurant = {
        id:
          restaurantId,

        name:
          "餐厅",

        level:
          1,

        reputation:
          0
      };
    }
  }

  const balance =
    Number.isFinite(
      balanceOverride
    )
      ? balanceOverride
      : safeBalance(
          restaurantId
        );

  return {
    restaurant,

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
      )
  };
}
