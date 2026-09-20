import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  leaseSystem
} from "./LeaseSystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  renovationConstructionSystem
} from "./RenovationConstructionSystem.js";


import {
  employeeSystem
} from "./EmployeeSystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  operatingScheduleSystem
} from "./OperatingScheduleSystem.js";

import {
  openingPermitSystem
} from "./OpeningPermitSystem.js";

import {
  openingInventorySystem
} from "./OpeningInventorySystem.js";


function validateHours(
  openHour,
  closeHour
) {
  if (
    !Number.isInteger(
      openHour
    ) ||
    !Number.isInteger(
      closeHour
    ) ||
    openHour < 0 ||
    openHour > 23 ||
    closeHour < 1 ||
    closeHour > 24 ||
    openHour >= closeHour
  ) {
    throw new RangeError(
      "Invalid operating hours"
    );
  }
}


class OpeningFlowSystem {
  getStatus(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );


    const lease =
      leaseSystem
        .getByRestaurant(
          restaurantId
        ) ??
      null;


    const renovation =
      renovationSystem
        .getSummary(
          restaurantId
        );


    const construction =
      renovationConstructionSystem
        .getCurrent(
          restaurantId
        ) ??
      null;


    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );


    const availableChefs =
      employees.filter(
        employee =>
          employee.roleId ===
            "chef" &&
          employee.status ===
            "active" &&
          (
            employee.fatigue ??
            0
          ) < 95
      );


    const activeServers =
      employees.filter(
        employee =>
          employee.roleId ===
            "server" &&
          employee.status ===
            "active" &&
          (
            employee.fatigue ??
            0
          ) < 95
      );


    const activeMenu =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly:
              true
          }
        );


    const schedule =
      operatingScheduleSystem
        .get(
          restaurantId
        ) ??
      null;


    const permits =
      openingPermitSystem
        .getStatus(
          restaurantId
        );


    const starterStock =
      openingInventorySystem
        .getStatus(
          restaurantId
        );


    const hasLease =
      Boolean(
        lease &&
        restaurant.locationId
      );


    const hasRenovation =
      Boolean(
        renovation.initialized &&
        renovation.active &&
        (
          renovation.modifiers
            ?.seats ??
          0
        ) >= 2 &&
        (
          renovation.modifiers
            ?.kitchenStations ??
          0
        ) >= 1
      );


    const hasChef =
      availableChefs.length >
      0;


    const hasServer =
      activeServers.length >
      0;


    const hasMenu =
      activeMenu.length >
      0;


    const hasPermits =
      permits.complete;


    const hasStarterStock =
      starterStock.complete;


    const hasSchedule =
      Boolean(
        schedule &&
        schedule.enabled
      );


    const preparationReady =
      hasLease &&
      hasRenovation &&
      hasPermits &&
      hasChef &&
      hasServer &&
      hasMenu &&
      hasStarterStock &&
      hasSchedule;


    const hasOpened =
      restaurant.status ===
        "open" ||
      restaurant.status ===
        "paused" ||
      restaurant.openedAt !==
        null ||
      (
        restaurant
          .totalOperatingMinutes ??
        0
      ) > 0 ||
      (
        restaurant
          .totalOperatingDays ??
        0
      ) > 0;


    const rawSteps = [
      {
        id:
          "lease",

        label:
          "选址签约",

        description:
          hasLease
            ? "经营房源已经确定"
            : "选择商圈与具体房源并完成签约",

        complete:
          hasLease,

        target:
          "city",

        icon:
          "1"
      },

      {
        id:
          "renovation",

        label:
          "装修布局",

        description:
          hasRenovation
            ? `${renovation.modifiers?.seats ?? 0}个餐位 · ${renovation.modifiers?.kitchenStations ?? 0}个厨房工位`
            : "完成装修布局、施工并正式验收启用",

        complete:
          hasRenovation,

        target:
          "renovation",

        icon:
          "2"
      },

      {
        id:
          "permits",

        label:
          "证照许可",

        description:
          hasPermits
            ? `${permits.issuedCount}/${permits.requiredCount}项必要许可已完成`
            : permits.pendingCount > 0
              ? `${permits.pendingCount}项许可正在审核，推进日期后自动出结果`
              : permits.allRequirementsReady
                ? "经营条件符合要求，可以提交必要许可申请"
                : "部分许可条件仍未满足",

        complete:
          hasPermits,

        target:
          "opening-setup",

        action:
          "permits",

        icon:
          "3"
      },

      {
        id:
          "staff",

        label:
          "招聘员工",

        description:
          hasChef &&
          hasServer
            ? `可工作厨师${availableChefs.length}人 · 服务员${activeServers.length}人`
            : !hasChef &&
              !hasServer
              ? "至少需要1名可工作的厨师和1名服务员"
              : !hasChef
                ? "还需要至少1名当前可工作的厨师"
                : "还需要至少1名当前可工作的服务员",

        complete:
          hasChef &&
          hasServer,

        target:
          "employees",

        icon:
          "4"
      },

      {
        id:
          "menu",

        label:
          "设置菜单",

        description:
          hasMenu
            ? `当前${activeMenu.length}道营业菜品`
            : "至少设置1道启用状态的菜品",

        complete:
          hasMenu,

        target:
          "dishes",

        icon:
          "5"
      },

      {
        id:
          "stock",

        label:
          "首批采购",

        description:
          hasStarterStock
            ? `${starterStock.ingredientCount}种必要食材已经备齐`
            : starterStock.pendingCount > 0
              ? `${starterStock.pendingCount}种食材正在配送`
              : hasMenu
                ? `还需准备${starterStock.items.filter(item => !item.ready).length}种食材`
                : "先设置菜单后生成采购需求",

        complete:
          hasStarterStock,

        target:
          "supply",

        action:
          "stock",

        icon:
          "6"
      },

      {
        id:
          "schedule",

        label:
          "营业时间",

        description:
          hasSchedule
            ? `${String(schedule.openHour).padStart(2, "0")}:00–${String(schedule.closeHour).padStart(2, "0")}:00`
            : "尚未设置正式营业时间",

        complete:
          hasSchedule,

        target:
          "opening-setup",

        action:
          "schedule",

        icon:
          "7"
      },

      {
        id:
          "inspection",

        label:
          "开业检查",

        description:
          preparationReady
            ? "房源、装修、许可、员工、菜单、库存和营业时间全部通过"
            : "完成全部前置准备后自动通过开业检查",

        complete:
          preparationReady,

        target:
          "opening-setup",

        icon:
          "8"
      },

      {
        id:
          "opening",

        label:
          "正式开业",

        description:
          hasOpened
            ? "门店已经正式开业并开始经营"
            : preparationReady
              ? "全部准备完成，可以正式开业"
              : "仍有开业条件未完成",

        complete:
          hasOpened,

        target:
          "restaurant",

        action:
          "open",

        icon:
          "9"
      }
    ];


    let foundCurrent =
      false;


    const steps =
      rawSteps.map(
        step => {
          let state =
            "pending";


          if (
            step.complete
          ) {
            state =
              "complete";
          } else if (
            !foundCurrent
          ) {
            state =
              "current";

            foundCurrent =
              true;
          }


          return {
            ...step,
            state
          };
        }
      );


    const preparationSteps =
      steps.slice(
        0,
        8
      );


    const completedPreparation =
      preparationSteps
        .filter(
          step =>
            step.complete
        )
        .length;


    return {
      restaurant,

      lease,

      renovation,

      construction,

      employees,

      availableChefs,

      activeServers,

      activeMenu,

      schedule,

      permits,

      starterStock,

      steps,

      preparation: {
        complete:
          completedPreparation,

        total:
          preparationSteps.length,

        percent:
          Math.round(
            completedPreparation /
            preparationSteps.length *
            100
          )
      },

      canOpen:
        preparationReady,

      hasOpened,

      nextAction:
        steps.find(
          step =>
            !step.complete
        ) ??
        steps[
          steps.length - 1
        ]
    };
  }


  configureSchedule(
    restaurantId,
    {
      openHour = 9,
      closeHour = 22
    } = {}
  ) {
    restaurantSystem.get(
      restaurantId
    );


    validateHours(
      openHour,
      closeHour
    );


    const existing =
      operatingScheduleSystem
        .get(
          restaurantId
        );


    if (!existing) {
      return operatingScheduleSystem
        .create({
          restaurantId,
          openHour,
          closeHour
        });
    }


    return entitySystem.update(
      "operating_schedule",
      existing.id,
      {
        openHour,
        closeHour,
        enabled:
          true
      }
    );
  }


  completePermits(
    restaurantId
  ) {
    return openingPermitSystem
      .issueAll(
        restaurantId
      );
  }


  purchaseStarterStock(
    restaurantId
  ) {
    return openingInventorySystem
      .purchaseMissing(
        restaurantId
      );
  }


  openRestaurant(
    restaurantId
  ) {
    const status =
      this.getStatus(
        restaurantId
      );


    if (
      !status.canOpen
    ) {
      const missing =
        status.steps
          .slice(
            0,
            8
          )
          .filter(
            step =>
              !step.complete
          )
          .map(
            step =>
              step.label
          )
          .join("、");


      throw new Error(
        `开业准备尚未完成：${missing}`
      );
    }


    const restaurant =
      status.restaurant;


    if (
      restaurant.status ===
      "open"
    ) {
      return restaurant;
    }


    if (
      restaurant.status ===
      "paused"
    ) {
      return restaurantSystem
        .resume(
          restaurantId
        );
    }


    return restaurantSystem.open(
      restaurantId
    );
  }


  getRecommendedPage(
    restaurantId
  ) {
    const status =
      this.getStatus(
        restaurantId
      );


    if (
      status.hasOpened
    ) {
      return (
        "restaurant"
      );
    }


    const hasLease =
      Boolean(
        status.lease &&
        status.restaurant
          .locationId
      );


    if (!hasLease) {
      return "city";
    }


    if (
      status.construction
    ) {
      return (
        "renovation_construction"
      );
    }


    const renovationReady =
      Boolean(
        status.renovation
          ?.initialized &&
        status.renovation
          ?.active
      );


    if (!renovationReady) {
      return "renovation";
    }


    return "opening-setup";
  }
}


export const openingFlowSystem =
  new OpeningFlowSystem();


export {
  OpeningFlowSystem
};
