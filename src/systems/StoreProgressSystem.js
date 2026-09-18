import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  gameState
} from "../core/GameState.js";

import {
  STORE_LEVELS
} from "../data/storeProgression.js";

import {
  STORE_LIMIT_KEYS,
  validateStoreLevelConfig
} from "../data/storeProgressionRules.js";

function requireRestaurant(id) {
  const restaurant =
    entitySystem.get(
      "restaurant",
      id
    );

  if (!restaurant) {
    throw new Error(
      `Restaurant "${id}" does not exist`
    );
  }

  return restaurant;
}

class StoreProgressSystem {
  validateDataset() {
    let previous = null;

    for (
      const config
      of STORE_LEVELS
    ) {
      validateStoreLevelConfig(
        config,
        previous
      );

      previous =
        config;
    }

    return true;
  }

  getLevelConfig(level) {
    const config =
      STORE_LEVELS.find(
        item =>
          item.level ===
          level
      );

    if (!config) {
      throw new Error(
        `Store level ${level} is not configured`
      );
    }

    return structuredClone(
      config
    );
  }

  getMaxLevel() {
    return STORE_LEVELS[
      STORE_LEVELS.length - 1
    ].level;
  }

  getUnlockLevel(
    feature
  ) {
    const config =
      STORE_LEVELS.find(
        item =>
          item.unlocks
            .includes(
              feature
            )
      );

    return (
      config?.level ??
      null
    );
  }

  getLevelReward(
    level
  ) {
    const current =
      this.getLevelConfig(
        level
      );

    const previous =
      level > 1
        ? this.getLevelConfig(
            level - 1
          )
        : null;

    const limitIncrease = {};

    for (
      const key
      of STORE_LIMIT_KEYS
    ) {
      limitIncrease[key] =
        current.limits[key] -
        (
          previous
            ?.limits[key] ??
          0
        );
    }

    return {
      level:
        current.level,

      title:
        current.title,

      unlocks: [
        ...current.unlocks
      ],

      limits:
        structuredClone(
          current.limits
        ),

      limitIncrease
    };
  }

  getProgress(
    restaurantId
  ) {
    const restaurant =
      requireRestaurant(
        restaurantId
      );

    const current =
      this.getLevelConfig(
        restaurant.level
      );

    const next =
      STORE_LEVELS.find(
        item =>
          item.level ===
          restaurant.level + 1
      );

    if (!next) {
      return {
        level:
          restaurant.level,

        title:
          current.title,

        experience:
          restaurant.experience,

        nextLevel: null,
        nextTitle: null,

        requiredExperience:
          null,

        remainingExperience: 0,
        progress: 1,
        maxLevel: true
      };
    }

    const range =
      next.requiredExperience -
      current.requiredExperience;

    const gained =
      restaurant.experience -
      current.requiredExperience;

    return {
      level:
        restaurant.level,

      title:
        current.title,

      experience:
        restaurant.experience,

      nextLevel:
        next.level,

      nextTitle:
        next.title,

      requiredExperience:
        next.requiredExperience,

      remainingExperience:
        Math.max(
          0,
          next.requiredExperience -
          restaurant.experience
        ),

      progress:
        Math.max(
          0,
          Math.min(
            1,
            gained / range
          )
        ),

      maxLevel: false
    };
  }

  findMilestone(
    restaurantId,
    level
  ) {
    return (
      entitySystem
        .filter(
          "store_level_milestone",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.level ===
              level
        )[0] ??
      null
    );
  }

  recordMilestone(
    restaurantId,
    level
  ) {
    const existing =
      this.findMilestone(
        restaurantId,
        level
      );

    if (existing) {
      return existing;
    }

    const reward =
      this.getLevelReward(
        level
      );

    return entitySystem.create(
      "store_level_milestone",
      {
        restaurantId,
        level,

        title:
          reward.title,

        unlocks: [
          ...reward.unlocks
        ],

        limits:
          structuredClone(
            reward.limits
          ),

        limitIncrease:
          structuredClone(
            reward.limitIncrease
          ),

        reachedDay:
          gameState
            .getSection(
              "time"
            ).day
      }
    );
  }

  getMilestones(
    restaurantId
  ) {
    requireRestaurant(
      restaurantId
    );

    return entitySystem
      .filter(
        "store_level_milestone",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          b.level -
          a.level
      );
  }

  addExperience(
    restaurantId,
    amount
  ) {
    if (
      !Number.isInteger(
        amount
      ) ||
      amount <= 0
    ) {
      throw new RangeError(
        "Experience amount must be a positive integer"
      );
    }

    let restaurant =
      requireRestaurant(
        restaurantId
      );

    const newExperience =
      restaurant.experience +
      amount;

    let newLevel =
      restaurant.level;

    for (
      const config
      of STORE_LEVELS
    ) {
      if (
        newExperience >=
        config.requiredExperience
      ) {
        newLevel =
          Math.max(
            newLevel,
            config.level
          );
      }
    }

    const oldLevel =
      restaurant.level;

    restaurant =
      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          experience:
            newExperience,

          level:
            newLevel
        }
      );

    eventBus.emit(
      "store:experienceGained",
      {
        restaurantId,
        amount,
        experience:
          newExperience
      }
    );

    if (
      newLevel >
      oldLevel
    ) {
      for (
        let level =
          oldLevel + 1;
        level <= newLevel;
        level += 1
      ) {
        const reward =
          this.getLevelReward(
            level
          );

        const milestone =
          this.recordMilestone(
            restaurantId,
            level
          );

        eventBus.emit(
          "store:levelUp",
          {
            restaurantId,

            oldLevel:
              level - 1,

            newLevel:
              level,

            title:
              reward.title,

            unlocks: [
              ...reward.unlocks
            ],

            reward:
              structuredClone(
                reward
              ),

            milestone:
              structuredClone(
                milestone
              )
          }
        );
      }
    }

    return restaurant;
  }

  getLimits(
    restaurantId
  ) {
    const restaurant =
      requireRestaurant(
        restaurantId
      );

    return this
      .getLevelConfig(
        restaurant.level
      )
      .limits;
  }

  getUnlockedFeatures(
    restaurantId
  ) {
    const restaurant =
      requireRestaurant(
        restaurantId
      );

    const unlocked =
      new Set();

    for (
      const config
      of STORE_LEVELS
    ) {
      if (
        config.level >
        restaurant.level
      ) {
        break;
      }

      for (
        const feature
        of config.unlocks
      ) {
        unlocked.add(
          feature
        );
      }
    }

    return [
      ...unlocked
    ];
  }

  isUnlocked(
    restaurantId,
    feature
  ) {
    return this
      .getUnlockedFeatures(
        restaurantId
      )
      .includes(
        feature
      );
  }

  getAllLevelConfigs() {
    this.validateDataset();

    return structuredClone(
      STORE_LEVELS
    );
  }
}

export const storeProgressSystem =
  new StoreProgressSystem();

export {
  StoreProgressSystem
};
