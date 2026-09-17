import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { STORE_LEVELS } from "../data/storeProgression.js";

function requireRestaurant(id) {
  const restaurant =
    entitySystem.get("restaurant", id);

  if (!restaurant) {
    throw new Error(
      `Restaurant "${id}" does not exist`
    );
  }

  return restaurant;
}

class StoreProgressSystem {
  getLevelConfig(level) {
    const config =
      STORE_LEVELS.find(
        (item) => item.level === level
      );

    if (!config) {
      throw new Error(
        `Store level ${level} is not configured`
      );
    }

    return structuredClone(config);
  }

  getMaxLevel() {
    return STORE_LEVELS[
      STORE_LEVELS.length - 1
    ].level;
  }

  getProgress(restaurantId) {
    const restaurant =
      requireRestaurant(restaurantId);

    const current =
      this.getLevelConfig(
        restaurant.level
      );

    const next =
      STORE_LEVELS.find(
        (item) =>
          item.level ===
          restaurant.level + 1
      );

    if (!next) {
      return {
        level:
          restaurant.level,
        experience:
          restaurant.experience,
        nextLevel: null,
        requiredExperience: null,
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

      experience:
        restaurant.experience,

      nextLevel:
        next.level,

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

  addExperience(
    restaurantId,
    amount
  ) {
    if (
      !Number.isInteger(amount) ||
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
      const config of STORE_LEVELS
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

    if (newLevel > oldLevel) {
      for (
        let level =
          oldLevel + 1;
        level <= newLevel;
        level += 1
      ) {
        eventBus.emit(
          "store:levelUp",
          {
            restaurantId,
            oldLevel:
              level - 1,
            newLevel:
              level,
            unlocks:
              this.getLevelConfig(
                level
              ).unlocks
          }
        );
      }
    }

    return restaurant;
  }

  getLimits(restaurantId) {
    const restaurant =
      requireRestaurant(
        restaurantId
      );

    return this.getLevelConfig(
      restaurant.level
    ).limits;
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
      const config of STORE_LEVELS
    ) {
      if (
        config.level >
        restaurant.level
      ) {
        break;
      }

      for (
        const feature of
        config.unlocks
      ) {
        unlocked.add(feature);
      }
    }

    return [...unlocked];
  }

  isUnlocked(
    restaurantId,
    feature
  ) {
    return this
      .getUnlockedFeatures(
        restaurantId
      )
      .includes(feature);
  }

  getAllLevelConfigs() {
    return structuredClone(
      STORE_LEVELS
    );
  }
}

export const storeProgressSystem =
  new StoreProgressSystem();

export { StoreProgressSystem };
