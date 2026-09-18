import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  storeProgressSystem
} from "../../../systems/StoreProgressSystem.js";

import {
  STORE_EXPERIENCE_POLICY
} from "../../../data/storeProgressionRules.js";


const FEATURE_NAMES =
  Object.freeze({
    employee_management:
      "员工管理",

    menu_management:
      "菜单管理",

    basic_inventory:
      "基础库存",

    supplier_management:
      "供应商管理",

    marketing:
      "市场营销",

    advanced_renovation:
      "高级装修",

    dish_research:
      "菜品研发",

    second_store:
      "第二门店",

    membership:
      "会员系统",

    chain_management:
      "连锁管理",

    central_kitchen:
      "中央厨房",

    regional_expansion:
      "区域扩张"
  });


function featureName(
  id
) {
  return (
    FEATURE_NAMES[id] ??
    id
  );
}


class StoreProgressPageSystem {
  constructor({
    restaurant =
      restaurantSystem,

    progress =
      storeProgressSystem
  } = {}) {
    this.restaurant =
      restaurant;

    this.progress =
      progress;
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      this.restaurant.get(
        restaurantId
      );

    const progress =
      this.progress
        .getProgress(
          restaurantId
        );

    const unlocked =
      new Set(
        this.progress
          .getUnlockedFeatures(
            restaurantId
          )
      );

    const levels =
      this.progress
        .getAllLevelConfigs()
        .map(
          config => {
            const reward =
              typeof this.progress
                .getLevelReward ===
                "function"
                ? this.progress
                    .getLevelReward(
                      config.level
                    )
                : {
                    level:
                      config.level,
                    title:
                      config.title ??
                      `Lv.${config.level}`,
                    unlocks: [
                      ...config.unlocks
                    ],
                    limits:
                      structuredClone(
                        config.limits
                      ),
                    limitIncrease:
                      null
                  };

            return {
              ...config,

              reward,

              state:
                config.level <
                  restaurant.level
                  ? "completed"
                  : config.level ===
                      restaurant.level
                    ? "current"
                    : "future",

              unlockItems:
                config.unlocks
                  .map(
                    id => ({
                      id,
                      name:
                        featureName(
                          id
                        ),

                      unlocked:
                        unlocked.has(
                          id
                        )
                    })
                  )
            };
          }
        );


    const current =
      levels.find(
        item =>
          item.level ===
          restaurant.level
      );


    const next =
      levels.find(
        item =>
          item.level ===
          restaurant.level +
          1
      ) ??
      null;


    return {
      pageId:
        "store-progress",

      title:
        "成长与解锁",

      restaurantId,

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        level:
          restaurant.level,

        experience:
          restaurant.experience
      },

      progress,

      currentLimits:
        this.progress
          .getLimits(
            restaurantId
          ),

      unlockedFeatures:
        [
          ...unlocked
        ].map(
          id => ({
            id,
            name:
              featureName(
                id
              )
          })
        ),

      current,
      next,
      levels,

      nextReward:
        next?.reward ??
        null,

      experiencePolicy:
        structuredClone(
          STORE_EXPERIENCE_POLICY
        ),

      milestones:
        typeof this.progress
          .getMilestones ===
          "function"
          ? this.progress
              .getMilestones(
                restaurantId
              )
          : []
    };
  }
}


export const storeProgressPageSystem =
  new StoreProgressPageSystem();


export {
  StoreProgressPageSystem,
  FEATURE_NAMES,
  featureName
};
