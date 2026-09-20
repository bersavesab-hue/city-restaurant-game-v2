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
  employeeDynamicsSystem
} from "../../../systems/EmployeeDynamicsSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  propertySystem
} from "../../../systems/PropertySystem.js";

import {
  districtSystem
} from "../../../systems/DistrictSystem.js";

import {
  chainSystem
} from "../../../systems/ChainSystem.js";

import {
  openingFlowSystem
} from "../../../systems/OpeningFlowSystem.js";

import {
  managementScopeSystem
} from "../../components/ManagementScopeSystem.js";


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


function severityScore(
  severity
) {
  return {
    critical:
      4,

    high:
      3,

    medium:
      2,

    low:
      1
  }[
    severity
  ] ??
  0;
}


function stableArtIndex(
  id
) {
  let value =
    0;

  for (
    const char
    of String(
      id ??
      ""
    )
  ) {
    value =
      (
        value *
        31 +
        char
          .charCodeAt(
            0
          )
      ) %
      3;
  }

  return value;
}


function getLocationLabel(
  restaurant
) {
  if (
    !restaurant
      .locationId
  ) {
    return (
      restaurant
        .plannedRegionId
        ? "规划区域 · 待选址"
        : "尚未完成选址"
    );
  }

  const property =
    safe(
      () =>
        propertySystem
          .get(
            restaurant.locationId
          ),
      null
    );

  if (!property) {
    return "当前经营地址";
  }

  const district =
    safe(
      () =>
        districtSystem
          .get(
            property.districtId
          ),
      null
    );

  if (
    district?.name &&
    property.name
  ) {
    return (
      district.name +
      " · " +
      property.name
    );
  }

  return (
    district?.name ??
    property.name ??
    "当前经营地址"
  );
}


function getManager(
  restaurantId
) {
  const employees =
    safe(
      () =>
        employeeSystem
          .listByRestaurant(
            restaurantId
          ),
      []
    );

  const manager =
    employees.find(
      item =>
        [
          "manager",
          "store_manager"
        ].includes(
          item.roleId
        )
    ) ??
    employees
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          (
            b.level ??
            1
          ) -
          (
            a.level ??
            1
          )
      )[0] ??
    null;

  if (!manager) {
    return null;
  }

  return {
    id:
      manager.id,

    name:
      manager.name,

    roleName:
      safe(
        () =>
          employeeSystem
            .getRole(
              manager.roleId
            )
            .name,
        "负责人"
      ),

    level:
      manager.level ??
      1,

    avatarPath:
      safe(
        () =>
          employeeDynamicsSystem
            .getAvatarPath(
              manager
            ),
        null
      )
  };
}


function getPreparation(
  restaurant
) {
  if (
    Number.isFinite(
      restaurant
        .firstOpenedAt
    )
  ) {
    return {
      percent:
        100,

      nextAction:
        null
    };
  }

  const status =
    safe(
      () =>
        openingFlowSystem
          .getStatus(
            restaurant.id
          ),
      null
    );

  return {
    percent:
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            status
              ?.preparation
              ?.percent ??
            0
          )
        )
      ),

    nextAction:
      status
        ?.nextAction ??
      null
  };
}


function normalizeStoreState(
  restaurant,
  dashboard,
  preparation
) {
  const priorities =
    dashboard
      ?.priorities ??
    [];

  const abnormal =
    restaurant.status ===
      "paused" ||
    priorities.some(
      item =>
        severityScore(
          item.severity
        ) >=
        3
    );

  if (
    !Number.isFinite(
      restaurant
        .firstOpenedAt
    )
  ) {
    return {
      state:
        "preparing",

      label:
        "筹备中"
    };
  }

  if (abnormal) {
    return {
      state:
        "abnormal",

      label:
        "异常"
    };
  }

  if (
    restaurant.status ===
    "open"
  ) {
    return {
      state:
        "open",

      label:
        "营业中"
    };
  }

  return {
    state:
      "closed",

    label:
      "已歇业"
  };
}


function buildStorePortfolio(
  restaurantId
) {
  const current =
    restaurantSystem
      .get(
        restaurantId
      );

  const chainDashboard =
    safe(
      () =>
        chainSystem
          .getDashboard(
            restaurantId
          ),
      null
    );

  const stores =
    chainDashboard
      ?.stores ??
    [
      current
    ];

  const cards =
    stores.map(
      store => {
        const dashboard =
          safe(
            () =>
              operatingCommandCenterSystem
                .getDashboard(
                  store.id
                ),
            null
          );

        const preparation =
          getPreparation(
            store
          );

        const normalized =
          normalizeStoreState(
            store,
            dashboard,
            preparation
          );

        const priorities =
          dashboard
            ?.priorities ??
          [];

        return {
          id:
            store.id,

          name:
            store.name,

          active:
            store.id ===
            restaurantId,

          state:
            normalized.state,

          statusLabel:
            normalized.label,

          level:
            store.level ??
            1,

          reviewScore:
            Number(
              store.reviewScore ??
              dashboard
                ?.restaurant
                ?.reviewScore ??
              0
            ),

          revenue:
            dashboard
              ?.sales
              ?.revenue ??
            0,

          profit:
            dashboard
              ?.sales
              ?.profit ??
            0,

          guests:
            dashboard
              ?.capacity
              ?.served ??
            dashboard
              ?.sales
              ?.orderCount ??
            0,

          satisfaction:
            dashboard
              ?.restaurant
              ?.customerSatisfaction ??
            store
              .customerSatisfaction ??
            0,

          balance:
            safe(
              () =>
                financeSystem
                  .getBalance(
                    store.id
                  ),
              0
            ),

          issueCount:
            priorities
              .length,

          locationLabel:
            getLocationLabel(
              store
            ),

          manager:
            getManager(
              store.id
            ),

          preparationProgress:
            preparation
              .percent,

          preparationNextAction:
            preparation
              .nextAction,

          artIndex:
            stableArtIndex(
              store.id
            )
        };
      }
    );

  const totals =
    cards.reduce(
      (
        result,
        store
      ) => {
        result.revenue +=
          store.revenue;

        result.profit +=
          store.profit;

        result.guests +=
          store.guests;

        result.balance +=
          store.balance;

        result.issueCount +=
          store.issueCount;

        result.satisfaction +=
          store.satisfaction;

        result.reviewScore +=
          store.reviewScore;

        return result;
      },
      {
        revenue:
          0,

        profit:
          0,

        guests:
          0,

        balance:
          0,

        issueCount:
          0,

        satisfaction:
          0,

        reviewScore:
          0
      }
    );

  if (
    cards.length >
    0
  ) {
    totals.satisfaction =
      Math.round(
        totals.satisfaction /
        cards.length
      );

    totals.reviewScore =
      Number(
        (
          totals.reviewScore /
          cards.length
        ).toFixed(
          1
        )
      );
  }

  const filterCounts = {
    all:
      cards.length,

    open:
      cards.filter(
        item =>
          item.state ===
          "open"
      ).length,

    preparing:
      cards.filter(
        item =>
          item.state ===
          "preparing"
      ).length,

    abnormal:
      cards.filter(
        item =>
          item.state ===
          "abnormal"
      ).length
  };

  const todos =
    [];

  for (
    const store
    of stores
  ) {
    const dashboard =
      safe(
        () =>
          operatingCommandCenterSystem
            .getDashboard(
              store.id
            ),
        null
      );

    for (
      const item
      of (
        dashboard
          ?.priorities ??
        []
      )
    ) {
      todos.push({
        id:
          store.id +
          ":" +
          item.id,

        storeId:
          store.id,

        storeName:
          store.name,

        title:
          item.title,

        description:
          item.description,

        severity:
          item.severity,

        target:
          item.target,

        score:
          severityScore(
            item.severity
          )
      });
    }

    const card =
      cards.find(
        item =>
          item.id ===
          store.id
      );

    if (
      card
        ?.state ===
        "preparing" &&
      card
        .preparationNextAction
    ) {
      todos.push({
        id:
          store.id +
          ":opening",

        storeId:
          store.id,

        storeName:
          store.name,

        title:
          card
            .preparationNextAction
            .label ??
          "继续开店准备",

        description:
          card
            .preparationNextAction
            .description ??
          "继续完成开店准备",

        severity:
          "medium",

        target:
          card
            .preparationNextAction
            .target ??
          "opening-setup",

        score:
          2
      });
    }
  }

  todos.sort(
    (
      a,
      b
    ) =>
      b.score -
      a.score
  );

  const capacity =
    Math.max(
      cards.length,
      chainDashboard
        ?.maxStores ??
      cards.length
    );

  return {
    scope:
      managementScopeSystem
        .getCurrent(),

    canSwitch:
      cards.length >
      0,

    storeCount:
      cards.length,

    capacity,

    canCreateBranch:
      chainDashboard
        ?.canCreateBranch ===
        true,

    brandName:
      chainDashboard
        ?.brandName ??
      current.name,

    cards,

    totals,

    filterCounts,

    todos
  };
}


class OperatingCommandCenterPageSystem {
  getPage(
    restaurantId
  ) {
    const storePortfolio =
      buildStorePortfolio(
        restaurantId
      );

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
      dashboard
        .priorities
        .map(
          item => ({
            id:
              item.id,

            type:
              item.severity ===
                "critical"
                ? "danger"
                : item.severity ===
                    "high"
                  ? "warning"
                  : "info",

            title:
              item.title,

            message:
              item.description,

            priority:
              severityScore(
                item.severity
              ) *
              20,

            action:
              item.target
          })
        );

    if (
      notices.length ===
      0
    ) {
      notices.push({
        id:
          "store_hub_normal",

        type:
          "success",

        title:
          "门店经营",

        message:
          "当前门店经营状态正常",

        priority:
          10,

        action:
          null
      });
    }

    const baseTopBar =
      buildGlobalTopBarModel({
        restaurantName:
          dashboard
            .restaurant
            .name,

        brandName:
          storePortfolio
            .brandName,

        balance:
          storePortfolio
            .totals
            .balance,

        storeLevel:
          Math.max(
            1,
            ...storePortfolio
              .cards
              .map(
                item =>
                  item.level
              )
          ),

        reputation:
          dashboard
            .restaurant
            .reputation,

        time,

        runtime,

        currentStoreId:
          restaurantId,

        stores:
          storePortfolio
            .cards
            .map(
              item => ({
                id:
                  item.id,

                name:
                  item.name
              })
            )
      });

    return {
      pageId:
        "restaurant",

      title:
        "门店管理",

      ...dashboard,

      topBar: {
        ...baseTopBar,

        brandName:
          storePortfolio
            .brandName,

        rating:
          storePortfolio
            .totals
            .reviewScore,

        scope: {
          ...baseTopBar
            .scope,

          type:
            "group",

          canSwitch:
            storePortfolio
              .cards
              .length >
            0,

          stores:
            storePortfolio
              .cards
              .map(
                item => ({
                  id:
                    item.id,

                  name:
                    item.name
                })
              )
        }
      },

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      navigation:
        gameChromeSystem
          .getNavigation({
            restaurantId,

            activePageId:
              "restaurant"
          })
          .map(
            item => ({
              ...item,

              active:
                item.id ===
                "restaurant"
            })
          ),

      awardFeedback,

      storePortfolio
    };
  }
}


export const operatingCommandCenterPageSystem =
  new OperatingCommandCenterPageSystem();


export {
  OperatingCommandCenterPageSystem
};
