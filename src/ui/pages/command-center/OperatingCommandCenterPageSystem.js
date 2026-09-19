import {
  gameState
} from "../../../core/GameState.js";

import {
  operatingCommandCenterSystem
} from "../../../systems/OperatingCommandCenterSystem.js";

import {
  awardFeedbackSystem
} from "../../../systems/AwardFeedbackSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  employeeSystem
} from "../../../systems/EmployeeSystem.js";

import {
  inventorySystem
} from "../../../systems/InventorySystem.js";

import {
  ingredientCatalogSystem
} from "../../../systems/IngredientCatalogSystem.js";

import {
  marketInsightSystem
} from "../../../systems/MarketInsightSystem.js";

import {
  employeeDynamicsSystem
} from "../../../systems/EmployeeDynamicsSystem.js";



function noticeType(
  severity
) {
  return {
    critical: "danger",
    high: "warning",
    medium: "warning",
    low: "info"
  }[severity] ?? "info";
}


function safe(
  fn,
  fallback
) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}


function employeeRoleName(
  roleId
) {
  return safe(
    () =>
      employeeSystem
        .getRole(
          roleId
        )
        .name,
    roleId ??
      "员工"
  );
}


function buildStaffPreview(
  restaurantId,
  dashboard
) {
  const employees =
    safe(
      () =>
        employeeSystem
          .listByRestaurant(
            restaurantId
          ),
      []
    )
      .filter(
        item =>
          item.status !==
          "fired"
      )
      .sort(
        (a, b) => {
          const activeDiff =
            Number(
              b.status ===
              "active"
            ) -
            Number(
              a.status ===
              "active"
            );

          if (
            activeDiff !==
            0
          ) {
            return activeDiff;
          }

          return (
            (b.level ?? 1) -
            (a.level ?? 1)
          );
        }
      );

  return {
    available:
      dashboard.workforce
        .availableEmployees ??
      0,

    total:
      employees.length,

    averageFatigue:
      dashboard
        .workforcePulse
        .averageFatigue ??
      0,

    highFatigue:
      dashboard
        .workforcePulse
        .highFatigue ??
      0,

    preview:
      employees
        .slice(
          0,
          3
        )
        .map(
          employee => ({
            id:
              employee.id,

            name:
              employee.name,

            roleId:
              employee.roleId,

            roleName:
              employeeRoleName(
                employee.roleId
              ),

            level:
              employee.level ??
              1,

            fatigue:
              employee.fatigue ??
              0,

            mood:
              employee.mood ??
              0,

            status:
              employee.status,

            avatarId:
              safe(
                () =>
                  employeeDynamicsSystem
                    .getAvatarId(
                      employee
                    ),
                employee.roleId +
                  "_01"
              ),

            avatarPath:
              safe(
                () =>
                  employeeDynamicsSystem
                    .getAvatarPath(
                      employee
                    ),
                "assets/images/ui/employees/avatars/" +
                  employee.roleId +
                  "_01.webp"
              )
          })
        )
  };
}


function buildInventoryPreview(
  restaurantId
) {
  const rows =
    safe(
      () =>
        inventorySystem
          .getSummary(
            restaurantId
          ),
      []
    )
      .sort(
        (a, b) =>
          (
            a.usableQuantity ??
            0
          ) -
          (
            b.usableQuantity ??
            0
          )
      )
      .slice(
        0,
        3
      );

  return rows.map(
    item => {
      const ingredient =
        safe(
          () =>
            ingredientCatalogSystem
              .get(
                item.ingredientId
              ),
          null
        );

      const usable =
        Number(
          item.usableQuantity ??
          0
        );

      const state =
        usable <= 0
          ? "out"
          : usable <= 5
            ? "low"
            : "ok";

      return {
        ingredientId:
          item.ingredientId,

        name:
          ingredient
            ?.name ??
          item.ingredientId,

        unit:
          ingredient
            ?.unit ??
          "",

        usableQuantity:
          usable,

        spoiledQuantity:
          Number(
            item.spoiledQuantity ??
            0
          ),

        state,

        stateLabel:
          {
            out:
              "缺货",
            low:
              "库存偏低",
            ok:
              "库存正常"
          }[state],

        levelPercent:
          Math.max(
            0,
            Math.min(
              100,
              Math.round(
                usable /
                5 *
                100
              )
            )
          )
      };
    }
  );
}


function buildTopDishPreview(
  dashboard
) {
  return (
    dashboard.menu
      .dishes ??
    []
  )
    .slice()
    .sort(
      (a, b) =>
        (
          b.quantity ??
          0
        ) -
        (
          a.quantity ??
          0
        )
    )
    .slice(
      0,
      3
    )
    .map(
      item => ({
        id:
          item.menuItemId ??
          item.dishId,

        dishId:
          item.dishId,

        name:
          item.name,

        sold:
          item.quantity ??
          0,

        salesShare:
          item.salesShare ??
          0,

        quality:
          item.averageQuality ??
          0,

        classification:
          item.classificationName ??
          "在售菜品"
      })
    );
}


function buildMarketPreview(
  restaurantId,
  dashboard
) {
  const market =
    safe(
      () =>
        marketInsightSystem
          .getSummary(
            restaurantId
          ),
      {
        marketShare:
          null,

        change:
          0,

        competitorCount:
          0,

        competitionFactor:
          100,

        alert:
          "stable"
      }
    );

  return {
    marketShare:
      market.marketShare,

    marketShareChange:
      market.change ??
      0,

    competitorCount:
      market.competitorCount ??
      0,

    competitionFactor:
      market.competitionFactor ??
      100,

    competitionAlert:
      market.alert ??
      "stable",

    repeatRate:
      dashboard
        .restaurant
        .repeatRate ??
      0,

    reviewScore:
      dashboard
        .restaurant
        .reviewScore ??
      0,

    reputation:
      dashboard
        .restaurant
        .reputation ??
      0
  };
}


class OperatingCommandCenterPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      operatingCommandCenterSystem
        .getDashboard(
          restaurantId
        );

    const awardFeedback =
      awardFeedbackSystem
        .getDashboard(
          restaurantId
        );

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const notices =
      dashboard.priorities
        .map(
          item => ({
            id:
              item.id,

            type:
              noticeType(
                item.severity
              ),

            title:
              item.title,

            message:
              item.description,

            priority:
              {
                critical: 100,
                high: 80,
                medium: 60,
                low: 40
              }[
                item.severity
              ] ?? 20,

            action:
              item.target
          })
        );

    if (
      awardFeedback
        .notifications
        .length >
      0
    ) {
      const awardNotice =
        awardFeedback
          .notifications[0];

      notices.push({
        id:
          "award_feedback",

        type:
          "info",

        title:
          awardNotice.title,

        message:
          awardNotice.message,

        priority:
          55,

        action:
          awardNotice.action
      });
    }

    if (
      notices.length ===
      0
    ) {
      notices.push({
        id:
          "command_center_normal",

        type:
          "success",

        title:
          "经营通报",

        message:
          "当前门店经营正常，可继续关注客流、库存和员工状态",

        priority:
          10,

        action:
          null
      });
    }

    return {
      pageId:
        "operating-command-center",

      title:
        "经营总控",

      ...dashboard,

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            dashboard
              .restaurant
              .name,

          balance:
            dashboard
              .finance
              .balance,

          storeLevel:
            dashboard
              .restaurant
              .level,

          reputation:
            dashboard
              .restaurant
              .reputation,

          time,
          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      navigation:
        gameChromeSystem
          .getNavigation({
            restaurantId,

            activePageId:
              "operating-command-center"
          })
          .map(
            item => ({
              ...item,

              active:
                item.id ===
                "restaurant"
            })
          ),

      staffPreview:
        buildStaffPreview(
          restaurantId,
          dashboard
        ),

      inventoryPreview:
        buildInventoryPreview(
          restaurantId
        ),

      topDishPreview:
        buildTopDishPreview(
          dashboard
        ),

      marketPreview:
        buildMarketPreview(
          restaurantId,
          dashboard
        ),

      awardFeedback
    };
  }
}


export const operatingCommandCenterPageSystem =
  new OperatingCommandCenterPageSystem();

export {
  OperatingCommandCenterPageSystem
};
