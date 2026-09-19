import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem
} from "./FinanceSystem.js";

import {
  employeeSystem
} from "./EmployeeSystem.js";

import {
  inventorySystem
} from "./InventorySystem.js";

import {
  leaseSystem
} from "./LeaseSystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  customerIdentitySystem
} from "./CustomerIdentitySystem.js";

import {
  onboardingSystem
} from "./OnboardingSystem.js";


function safeBalance(
  restaurantId
) {
  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


class OperatingAdvisorSystem {
  getAdvice(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const onboarding =
      onboardingSystem
        .getState(
          restaurantId
        );

    const lease =
      leaseSystem
        .getByRestaurant(
          restaurantId
        );

    const renovation =
      renovationSystem
        .getSummary(
          restaurantId
        );

    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    const inventory =
      inventorySystem
        .getSummary(
          restaurantId
        );

    const menu =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly: true
          }
        );

    const identities =
      customerIdentitySystem
        .getDetailedProfiles(
          restaurantId
        );

    const time =
      gameState.getSection(
        "time"
      );

    const balance =
      safeBalance(
        restaurantId
      );

    const advice = [];

    if (
      onboarding.nextStep
    ) {
      advice.push({
        id:
          "onboarding_" +
          onboarding
            .nextStep
            .id,

        type:
          "guide",

        priority:
          120,

        title:
          "下一步：" +
          onboarding
            .nextStep
            .title,

        message:
          onboarding
            .nextStep
            .description,

        action:
          onboarding
            .nextStep
            .pageId
      });
    }

    if (
      lease &&
      lease.endDay -
      time.day <=
        30
    ) {
      advice.push({
        id:
          "lease_expiring",

        type:
          "warning",

        priority:
          105,

        title:
          "租约即将到期",

        message:
          "当前租约剩余 " +
          Math.max(
            0,
            lease.endDay -
            time.day
          ) +
          " 天，建议提前确认续租计划。",

        action:
          "lease"
      });
    }

    const arrears =
      (
        lease?.unpaidRent ??
        0
      ) +
      (
        lease
          ?.unpaidPropertyFee ??
        0
      );

    if (
      arrears >
      0
    ) {
      advice.push({
        id:
          "lease_arrears",

        type:
          "danger",

        priority:
          115,

        title:
          "存在租赁欠款",

        message:
          "当前租金与物业费欠款合计 ¥" +
          Math.round(
            arrears
          ).toLocaleString(
            "zh-CN"
          ) +
          "。",

        action:
          "lease"
      });
    }

    const spoiled =
      inventory.filter(
        item =>
          item.spoiledQuantity >
          0
      ).length;

    const lowStock =
      inventory.filter(
        item =>
          item.usableQuantity >
            0 &&
          item.usableQuantity <
            5
      ).length;

    if (
      spoiled >
      0
    ) {
      advice.push({
        id:
          "spoiled_inventory",

        type:
          "danger",

        priority:
          100,

        title:
          "库存存在变质食材",

        message:
          spoiled +
          " 种食材存在变质库存，需要尽快处理。",

        action:
          "supply"
      });
    }

    if (
      lowStock >
      0
    ) {
      advice.push({
        id:
          "low_stock",

        type:
          "warning",

        priority:
          70,

        title:
          "部分食材库存偏低",

        message:
          lowStock +
          " 种在用食材库存不足5个单位。",

        action:
          "supply"
      });
    }

    const tired =
      employees.filter(
        item =>
          item.status ===
            "active" &&
          (
            item.fatigue ??
            0
          ) >=
            75
      ).length;

    if (
      tired >
      0
    ) {
      advice.push({
        id:
          "staff_fatigue",

        type:
          "warning",

        priority:
          75,

        title:
          "员工疲劳偏高",

        message:
          tired +
          " 名员工疲劳度已达到75以上。",

        action:
          "employee_roster"
      });
    }

    if (
      renovation.initialized &&
      renovation.active &&
      restaurant.customerSatisfaction <
        60
    ) {
      advice.push({
        id:
          "low_satisfaction",

        type:
          "warning",

        priority:
          80,

        title:
          "顾客满意度偏低",

        message:
          "当前满意度 " +
          Math.round(
            restaurant
              .customerSatisfaction
          ) +
          "，建议检查员工、出品和装修布局。",

        action:
          "analytics"
      });
    }

    if (
      menu.length >=
        8 &&
      restaurant.reviewScore <
        3.5
    ) {
      advice.push({
        id:
          "menu_quality_focus",

        type:
          "info",

        priority:
          55,

        title:
          "菜单不宜只追求数量",

        message:
          "当前已上架 " +
          menu.length +
          " 道菜，但评分偏低，建议优先优化核心菜品。",

        action:
          "dishes"
      });
    }

    const atRisk =
      identities.filter(
        item =>
          item.atRisk
      ).length;

    if (
      atRisk >
      0
    ) {
      advice.push({
        id:
          "recognized_customer_risk",

        type:
          "warning",

        priority:
          65,

        title:
          "熟客流失预警",

        message:
          atRisk +
          " 名可识别熟客超过建议回访周期未到店。",

        action:
          "customers"
      });
    }

    if (
      balance <
        20000 &&
      restaurant.status !==
        "closed"
    ) {
      advice.push({
        id:
          "cash_low",

        type:
          "danger",

        priority:
          95,

        title:
          "现金储备偏低",

        message:
          "当前可用资金不足2万元，建议减少非必要扩张并检查成本。",

        action:
          "finance"
      });
    }

    if (
      advice.length ===
        0
    ) {
      advice.push({
        id:
          "stable_operation",

        type:
          "success",

        priority:
          10,

        title:
          "经营状态稳定",

        message:
          "当前没有高优先级问题，可以继续观察经营数据与顾客反馈。",

        action:
          "analytics"
      });
    }

    return advice
      .sort(
        (
          a,
          b
        ) =>
          b.priority -
          a.priority
      )
      .slice(
        0,
        6
      );
  }
}


export const operatingAdvisorSystem =
  new OperatingAdvisorSystem();


export {
  OperatingAdvisorSystem
};
