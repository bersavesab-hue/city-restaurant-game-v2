import {
  LAUNCH_STAGES,
  LAUNCH_EVENT_IDS,
  LAUNCH_CONTENT_TOTALS
} from "../data/launchContent.v1.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  employeeSystem
} from "./EmployeeSystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  marketActionSystem
} from "./MarketActionSystem.js";

import {
  storeProgressSystem
} from "./StoreProgressSystem.js";


function unique(
  values
) {
  return [
    ...new Set(
      values
    )
  ];
}


class LaunchProgressionSystem {
  getStages() {
    return structuredClone(
      LAUNCH_STAGES
    );
  }


  getStageForLevel(
    level
  ) {
    const safeLevel =
      Math.max(
        1,
        Math.min(
          storeProgressSystem
            .getMaxLevel(),
          Number(level) ||
          1
        )
      );

    const stage =
      LAUNCH_STAGES.find(
        item =>
          safeLevel >=
            item.minLevel &&
          safeLevel <=
            item.maxLevel
      ) ??
      LAUNCH_STAGES[
        LAUNCH_STAGES.length -
        1
      ];

    return structuredClone(
      stage
    );
  }


  getCumulativeContent(
    level
  ) {
    const stage =
      this.getStageForLevel(
        level
      );

    const eligibleStages =
      LAUNCH_STAGES.filter(
        item =>
          item.minLevel <=
          stage.minLevel
      );

    const collect =
      field =>
        unique(
          eligibleStages.flatMap(
            item =>
              item
                .content[field]
          )
        );

    return {
      stageId:
        stage.id,
      dishIds:
        collect(
          "dishIds"
        ),
      ingredientCategories:
        collect(
          "ingredientCategories"
        ),
      supplierIds:
        collect(
          "supplierIds"
        ),
      employeeRoleIds:
        collect(
          "employeeRoleIds"
        ),
      marketingActionIds:
        collect(
          "marketingActionIds"
        ),
      renovationTemplateIds:
        collect(
          "renovationTemplateIds"
        ),
      randomEventIds: [
        ...LAUNCH_EVENT_IDS
      ]
    };
  }


  getStageExperienceProgress(
    restaurant
  ) {
    const stage =
      this.getStageForLevel(
        restaurant.level
      );

    const start =
      storeProgressSystem
        .getLevelConfig(
          stage.minLevel
        )
        .requiredExperience;

    const nextStage =
      LAUNCH_STAGES.find(
        item =>
          item.minLevel >
          stage.minLevel
      );

    const end =
      nextStage
        ? storeProgressSystem
            .getLevelConfig(
              nextStage.minLevel
            )
            .requiredExperience
        : storeProgressSystem
            .getLevelConfig(
              stage.maxLevel
            )
            .requiredExperience;

    const experience =
      restaurant.experience ??
      0;

    const progress =
      stage.maxLevel ===
        restaurant.level &&
      !nextStage
        ? 1
        : Math.max(
            0,
            Math.min(
              1,
              (
                experience -
                start
              ) /
              Math.max(
                1,
                end -
                start
              )
            )
          );

    return {
      startExperience:
        start,
      targetExperience:
        end,
      currentExperience:
        experience,
      remainingExperience:
        Math.max(
          0,
          end -
          experience
        ),
      progress,
      nextStageId:
        nextStage?.id ??
        null,
      nextStageName:
        nextStage?.name ??
        null
    };
  }


  getObjectiveValue(
    restaurantId,
    objective
  ) {
    switch (
      objective.id
    ) {
      case "menu_count":
        return menuSystem
          .listByRestaurant(
            restaurantId,
            {
              activeOnly:
                true
            }
          )
          .length;

      case "employees":
        return employeeSystem
          .listByRestaurant(
            restaurantId
          )
          .length;

      case "renovation_active":
        return renovationSystem
          .getOperationalModifiers(
            restaurantId
          )
          .active
            ? 1
            : 0;

      case "marketing_runs":
        return marketActionSystem
          .getHistory(
            restaurantId
          )
          .length;

      case "rating":
        return Number(
          restaurantSystem
            .get(
              restaurantId
            )
            .reviewScore ??
          0
        );

      default:
        return 0;
    }
  }


  getStageModel(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const stage =
      this.getStageForLevel(
        restaurant.level
      );

    const content =
      this.getCumulativeContent(
        restaurant.level
      );

    const experience =
      this.getStageExperienceProgress(
        restaurant
      );

    const objectives =
      stage.objectives.map(
        item => {
          const current =
            this.getObjectiveValue(
              restaurantId,
              item
            );

          return {
            ...item,
            current,
            complete:
              current >=
              item.target,
            progress:
              Math.max(
                0,
                Math.min(
                  1,
                  current /
                  Math.max(
                    0.001,
                    item.target
                  )
                )
              )
          };
        }
      );

    return {
      ...stage,
      stageNumber:
        LAUNCH_STAGES
          .findIndex(
            item =>
              item.id ===
              stage.id
          ) +
        1,
      totalStages:
        LAUNCH_STAGES.length,
      experience,
      objectives,
      objectiveCompleted:
        objectives.filter(
          item =>
            item.complete
        ).length,
      objectiveTotal:
        objectives.length,
      content,
      contentCounts: {
        dishes:
          content
            .dishIds
            .length,
        ingredientCategories:
          content
            .ingredientCategories
            .length,
        suppliers:
          content
            .supplierIds
            .length,
        employeeRoles:
          content
            .employeeRoleIds
            .length,
        marketingActions:
          content
            .marketingActionIds
            .length,
        renovationTemplates:
          content
            .renovationTemplateIds
            .length,
        randomEvents:
          content
            .randomEventIds
            .length
      },
      launchTotals:
        structuredClone(
          LAUNCH_CONTENT_TOTALS
        )
    };
  }


  isDishAllowed(
    level,
    dishId
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .dishIds
      .includes(
        dishId
      );
  }


  isIngredientCategoryAllowed(
    level,
    category
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .ingredientCategories
      .includes(
        category
      );
  }


  isSupplierAllowed(
    level,
    supplierId
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .supplierIds
      .includes(
        supplierId
      );
  }


  isEmployeeRoleAllowed(
    level,
    roleId
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .employeeRoleIds
      .includes(
        roleId
      );
  }


  isMarketingActionAllowed(
    level,
    actionId
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .marketingActionIds
      .includes(
        actionId
      );
  }


  isRenovationTemplateAllowed(
    level,
    templateId
  ) {
    return this
      .getCumulativeContent(
        level
      )
      .renovationTemplateIds
      .includes(
        templateId
      );
  }


  getLaunchEventIds() {
    return [
      ...LAUNCH_EVENT_IDS
    ];
  }
}


export const launchProgressionSystem =
  new LaunchProgressionSystem();


export {
  LaunchProgressionSystem
};
