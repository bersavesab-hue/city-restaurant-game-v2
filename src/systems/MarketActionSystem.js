import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  salesChannelSystem
} from "./SalesChannelSystem.js";

import {
  MARKETING_ACTIONS_V1
} from "../data/marketingActions.v1.js";

const ACTIONS = Object.freeze(
  Object.fromEntries(
    MARKETING_ACTIONS_V1.map(
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

class MarketActionSystem {
  getDefinitions() {
    return MARKETING_ACTIONS_V1;
  }

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

  getHistory(
    restaurantId
  ) {
    return (
      restaurantSystem.get(
        restaurantId
      ).marketActionHistory ??
      []
    );
  }

  getLastRun(
    restaurantId,
    type
  ) {
    return this
      .getHistory(
        restaurantId
      )
      .filter(
        item =>
          item.type ===
          type
      )
      .sort(
        (a, b) =>
          b.startDay -
          a.startDay
      )[0] ??
      null;
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
      marketAppealMultiplier: 1,
      repeatIntentMultiplier: 1,
      reviewPropensityMultiplier: 1,
      segmentMultipliers: {},
      channelMultipliers: {}
    };

    for (
      const action
      of actions
    ) {
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

      result
        .repeatIntentMultiplier *=
        modifiers
          .repeatIntentMultiplier ??
        1;

      result
        .reviewPropensityMultiplier *=
        modifiers
          .reviewPropensityMultiplier ??
        1;

      for (
        const [
          segmentId,
          multiplier
        ]
        of Object.entries(
          modifiers.segmentMultipliers ??
          {}
        )
      ) {
        result.segmentMultipliers[
          segmentId
        ] =
          (
            result.segmentMultipliers[
              segmentId
            ] ??
            1
          ) *
          multiplier;
      }

      for (
        const [
          channelId,
          multiplier
        ]
        of Object.entries(
          modifiers.channelMultipliers ??
          {}
        )
      ) {
        result.channelMultipliers[
          channelId
        ] =
          (
            result.channelMultipliers[
              channelId
            ] ??
            1
          ) *
          multiplier;
      }
    }

    result.demandMultiplier =
      clamp(
        result.demandMultiplier,
        0.5,
        2
      );

    result.priceMultiplier =
      clamp(
        result.priceMultiplier,
        0.5,
        1.5
      );

    result.marketAppealMultiplier =
      clamp(
        result.marketAppealMultiplier,
        0.5,
        2
      );

    result.repeatIntentMultiplier =
      clamp(
        result.repeatIntentMultiplier,
        0.5,
        2
      );

    result.reviewPropensityMultiplier =
      clamp(
        result.reviewPropensityMultiplier,
        0.5,
        2
      );

    return result;
  }

  getChannelMultiplier(
    restaurantId,
    channelId
  ) {
    return (
      this.getModifiers(
        restaurantId
      )
      .channelMultipliers[
        channelId
      ] ??
      1
    );
  }

  getSegmentMultiplier(
    restaurantId,
    segmentId
  ) {
    return (
      this.getModifiers(
        restaurantId
      )
      .segmentMultipliers[
        segmentId
      ] ??
      1
    );
  }

  getAvailability(
    restaurantId,
    type,
    day = null
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const definition =
      this.getDefinition(
        type
      );

    const currentDay =
      day ??
      gameState.getSection(
        "time"
      ).day;

    const active =
      this.getActiveActions(
        restaurantId,
        currentDay
      );

    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    const reasons = [];

    if (
      (
        restaurant.level ??
        1
      ) <
      definition
        .minRestaurantLevel
    ) {
      reasons.push(
        "restaurant_level"
      );
    }

    if (
      balance <
      definition.cost
    ) {
      reasons.push(
        "insufficient_funds"
      );
    }

    if (
      active.length >=
      2
    ) {
      reasons.push(
        "active_limit"
      );
    }

    if (
      active.some(
        item =>
          item.type ===
          type
      )
    ) {
      reasons.push(
        "already_active"
      );
    }

    if (
      active.some(
        item =>
          (
            ACTIONS[item.type]
              ?.exclusiveGroup ??
            null
          ) ===
          definition
            .exclusiveGroup
      )
    ) {
      reasons.push(
        "exclusive_group"
      );
    }

    const activeChannels =
      new Set(
        salesChannelSystem
          .getActiveChannels(
            restaurantId
          )
          .map(
            item =>
              item.id
          )
      );

    const missingChannels =
      definition
        .requiredChannels
        .filter(
          channelId =>
            !activeChannels.has(
              channelId
            )
        );

    if (
      missingChannels.length >
      0
    ) {
      reasons.push(
        "required_channel"
      );
    }

    const last =
      this.getLastRun(
        restaurantId,
        type
      );

    const availableDay =
      last
        ? (
            last.endDay +
            definition
              .cooldownDays +
            1
          )
        : currentDay;

    if (
      last &&
      currentDay <
      availableDay
    ) {
      reasons.push(
        "cooldown"
      );
    }

    return {
      canStart:
        reasons.length ===
        0,

      reasons,

      missingChannels,

      availableDay,

      currentDay,

      balance,

      restaurantLevel:
        restaurant.level ??
        1
    };
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

    const availability =
      this.getAvailability(
        restaurantId,
        type,
        time.day
      );

    if (
      !availability.canStart
    ) {
      throw new Error(
        `Market action unavailable: ${availability.reasons.join(",")}`
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

      category:
        definition.category,

      cost:
        definition.cost,

      startDay:
        time.day,

      endDay:
        time.day +
        definition.durationDays -
        1
    };

    const current =
      this.getActiveActions(
        restaurantId,
        time.day
      );

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

    if (
      history.length >
      80
    ) {
      history.splice(
        0,
        history.length -
        80
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
        action,
        definition:
          structuredClone(
            definition
          )
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

    const expiredIds =
      new Set(
        expired.map(
          item =>
            item.id
        )
      );

    const history =
      (
        restaurant
          .marketActionHistory ??
        []
      ).map(
        item =>
          expiredIds.has(
            item.id
          )
            ? {
                ...item,
                status: "ended",
                endedDay:
                  currentDay
              }
            : item
      );

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

    for (
      const action
      of expired
    ) {
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

  processDay(
    currentDay
  ) {
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
    const active =
      this.getActiveActions(
        restaurantId
      );

    return {
      active,

      modifiers:
        this.getModifiers(
          restaurantId
        ),

      available:
        MARKETING_ACTIONS_V1
          .map(
            item => ({
              ...item,
              availability:
                this.getAvailability(
                  restaurantId,
                  item.id
                )
            })
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
