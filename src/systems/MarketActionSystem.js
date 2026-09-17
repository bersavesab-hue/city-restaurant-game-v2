import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";

const ACTIONS = Object.freeze({
  local_ads: {
    id: "local_ads",
    name: "本地广告",
    cost: 2000,
    durationDays: 5,

    modifiers: {
      demandMultiplier: 1.12,
      marketAppealMultiplier: 1.08
    }
  },

  flash_coupon: {
    id: "flash_coupon",
    name: "限时优惠",
    cost: 1000,
    durationDays: 3,

    modifiers: {
      priceMultiplier: 0.9,
      demandMultiplier: 1.08,
      marketAppealMultiplier: 1.1
    }
  },

  quality_campaign: {
    id: "quality_campaign",
    name: "品质强化",
    cost: 3500,
    durationDays: 7,

    modifiers: {
      qualityBonus: 8,
      marketAppealMultiplier: 1.07
    }
  },

  service_campaign: {
    id: "service_campaign",
    name: "服务强化",
    cost: 2500,
    durationDays: 7,

    modifiers: {
      serviceCapacityMultiplier: 1.2,
      marketAppealMultiplier: 1.05
    }
  }
});

class MarketActionSystem {
  getDefinition(type) {
    const action =
      ACTIONS[type];

    if (!action) {
      throw new Error(
        `Unknown market action "${type}"`
      );
    }

    return action;
  }

  getActiveActions(
    restaurantId,
    day = null
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const currentDay =
      day ??
      gameState.getSection(
        "time"
      ).day;

    return (
      restaurant.activeMarketActions ??
      []
    ).filter(
      item =>
        currentDay >=
          item.startDay &&
        currentDay <=
          item.endDay
    );
  }

  getModifiers(
    restaurantId
  ) {
    const actions =
      this.getActiveActions(
        restaurantId
      );

    const result = {
      demandMultiplier: 1,
      priceMultiplier: 1,
      qualityBonus: 0,
      serviceCapacityMultiplier: 1,
      marketAppealMultiplier: 1
    };

    for (const action of actions) {
      const definition =
        ACTIONS[action.type];

      if (!definition) {
        continue;
      }

      const modifiers =
        definition.modifiers;

      result.demandMultiplier *=
        modifiers.demandMultiplier ??
        1;

      result.priceMultiplier *=
        modifiers.priceMultiplier ??
        1;

      result.qualityBonus +=
        modifiers.qualityBonus ??
        0;

      result
        .serviceCapacityMultiplier *=
        modifiers
          .serviceCapacityMultiplier ??
        1;

      result
        .marketAppealMultiplier *=
        modifiers
          .marketAppealMultiplier ??
        1;
    }

    return result;
  }

  startAction(
    restaurantId,
    type
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const definition =
      this.getDefinition(
        type
      );

    const time =
      gameState.getSection(
        "time"
      );

    const current =
      this.getActiveActions(
        restaurantId,
        time.day
      );

    if (
      current.some(
        item =>
          item.type === type
      )
    ) {
      throw new Error(
        "Same market action is already active"
      );
    }

    if (current.length >= 2) {
      throw new Error(
        "Maximum two market actions can run together"
      );
    }

    if (
      financeSystem.getBalance(
        restaurantId
      ) <
      definition.cost
    ) {
      throw new Error(
        "Insufficient funds for market action"
      );
    }

    financeSystem.expense(
      restaurantId,
      definition.cost,
      FINANCE_CATEGORY.MARKETING,
      `${definition.name}投入`
    );

    const action = {
      id:
        `${type}:${time.day}`,

      type,

      name:
        definition.name,

      cost:
        definition.cost,

      startDay:
        time.day,

      endDay:
        time.day +
        definition.durationDays -
        1
    };

    const active = [
      ...current,
      action
    ];

    const history = [
      ...(
        restaurant
          .marketActionHistory ??
        []
      ),

      {
        ...action,
        status: "started"
      }
    ];

    if (history.length > 20) {
      history.splice(
        0,
        history.length - 20
      );
    }

    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        activeMarketActions:
          active,

        marketActionHistory:
          history
      }
    );

    eventBus.emit(
      "market:actionStarted",
      {
        restaurantId,
        action
      }
    );

    return action;
  }

  processRestaurant(
    restaurantId,
    currentDay
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const stored =
      restaurant
        .activeMarketActions ??
      [];

    const active =
      stored.filter(
        item =>
          currentDay <=
          item.endDay
      );

    if (
      active.length ===
      stored.length
    ) {
      return 0;
    }

    const expired =
      stored.filter(
        item =>
          currentDay >
          item.endDay
      );

    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        activeMarketActions:
          active
      }
    );

    for (const action of expired) {
      eventBus.emit(
        "market:actionEnded",
        {
          restaurantId,
          action,
          day:
            currentDay
        }
      );
    }

    return expired.length;
  }

  processDay(currentDay) {
    let expired = 0;

    for (
      const restaurant
      of restaurantSystem.list()
    ) {
      expired +=
        this.processRestaurant(
          restaurant.id,
          currentDay
        );
    }

    return {
      expired
    };
  }

  getStatus(
    restaurantId
  ) {
    return {
      active:
        this.getActiveActions(
          restaurantId
        ),

      modifiers:
        this.getModifiers(
          restaurantId
        ),

      available:
        Object.values(
          ACTIONS
        )
    };
  }
}

export const marketActionSystem =
  new MarketActionSystem();

export {
  MarketActionSystem,
  ACTIONS as MARKET_ACTIONS
};
