import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  employeeSystem
} from "./EmployeeSystem.js";

import {
  employeeWorkSystem
} from "./EmployeeWorkSystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  operatingScheduleSystem
} from "./OperatingScheduleSystem.js";


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


function countRoles(
  employees
) {
  const result = {};

  for (
    const employee
    of employees
  ) {
    result[
      employee.roleId
    ] =
      (
        result[
          employee.roleId
        ] ??
        0
      ) +
      1;
  }

  return result;
}


class StaffingRecommendationSystem {
  getRecentDemand(
    restaurantId,
    days = 7
  ) {
    const currentDay =
      gameState
        .getSection(
          "time"
        )
        ?.day ??
      1;


    const startDay =
      Math.max(
        1,
        currentDay -
          days +
          1
      );


    const orders =
      entitySystem
        .list(
          "customer_order"
        )
        .filter(
          order =>
            order.restaurantId ===
              restaurantId &&
            order.status ===
              "completed" &&
            (
              order.day ??
              currentDay
            ) >=
              startDay
        );


    const observedDays =
      Math.max(
        1,
        Math.min(
          days,
          currentDay -
            startDay +
            1
        )
      );


    const deliveryOrders =
      orders.filter(
        order => {
          const source =
            String(
              order.channelId ??
              order.channel ??
              order.source ??
              ""
            )
              .toLowerCase();

          return (
            source.includes(
              "delivery"
            ) ||
            source.includes(
              "外卖"
            )
          );
        }
      ).length;


    return {
      totalOrders:
        orders.length,

      observedDays,

      averageDailyOrders:
        Number(
          (
            orders.length /
            observedDays
          ).toFixed(
            1
          )
        ),

      deliveryOrders,

      deliveryRatio:
        orders.length >
        0
          ? deliveryOrders /
            orders.length
          : 0
    };
  }


  getAverageEffectiveSkill(
    restaurantId,
    roleId,
    skill
  ) {
    const employees =
      employeeWorkSystem
        .listAvailableByRole(
          restaurantId,
          roleId
        );


    if (
      employees.length ===
      0
    ) {
      return 50;
    }


    return Math.round(
      employees.reduce(
        (
          sum,
          employee
        ) =>
          sum +
          employeeWorkSystem
            .getEffectiveSkill(
              employee,
              skill
            ),
        0
      ) /
      employees.length
    );
  }


  calculatePlan(
    context,
    currentCounts = {}
  ) {
    const seats =
      Math.max(
        0,
        context.seats ??
        0
      );


    if (
      seats ===
      0
    ) {
      return [];
    }


    const hours =
      Math.max(
        1,
        context.operatingHours ??
        10
      );


    const observedDemand =
      Math.max(
        0,
        context.averageDailyOrders ??
        0
      );


    const baselineDemand =
      Math.ceil(
        seats *
        Math.max(
          0.75,
          hours /
          12
        )
      );


    const expectedDailyOrders =
      Math.max(
        observedDemand,
        baselineDemand
      );


    const peakOrdersPerHour =
      Math.max(
        1,
        Math.ceil(
          expectedDailyOrders /
          hours *
          1.9
        )
      );


    const chefEfficiency =
      clamp(
        (
          context
            .averageChefSkill ??
          50
        ) /
        50 *
        (
          context
            .kitchenEfficiency ??
          1
        ),
        0.7,
        1.35
      );


    const serverEfficiency =
      clamp(
        (
          context
            .averageServerSkill ??
          50
        ) /
        50 *
        (
          context
            .serviceEfficiency ??
          1
        ),
        0.7,
        1.35
      );


    const rawChef =
      Math.max(
        1,
        Math.ceil(
          seats /
          28
        ),
        Math.ceil(
          peakOrdersPerHour /
          7
        )
      );


    const chef =
      Math.max(
        1,
        Math.ceil(
          rawChef /
          chefEfficiency
        )
      );


    const rawServer =
      Math.max(
        1,
        Math.ceil(
          seats /
          16
        ),
        Math.ceil(
          peakOrdersPerHour /
          4
        )
      );


    const server =
      Math.max(
        1,
        Math.ceil(
          rawServer /
          serverEfficiency
        )
      );


    const cashier =
      seats >=
        70 ||
      peakOrdersPerHour >=
        16
        ? 2
        : 1;


    const kitchenAssistant =
      chef >=
        2 ||
      seats >=
        30
        ? Math.max(
            1,
            Math.ceil(
              chef /
              2
            )
          )
        : 0;


    const cleaner =
      Math.max(
        1,
        Math.ceil(
          seats /
          50
        )
      );


    const manager =
      seats >=
        60 ||
      expectedDailyOrders >=
        90
        ? 1
        : 0;


    const delivery =
      (
        context
          .deliveryRatio ??
        0
      ) >=
      0.15
        ? Math.max(
            1,
            Math.ceil(
              (
                context
                  .deliveryAverageDaily ??
                0
              ) /
              35
            )
          )
        : 0;


    const definitions = [
      {
        roleId:
          "chef",

        name:
          "厨师",

        recommended:
          chef,

        reason:
          `${seats}餐位 · 峰值约${peakOrdersPerHour}单/小时`
      },

      {
        roleId:
          "server",

        name:
          "服务员",

        recommended:
          server,

        reason:
          `餐位与服务效率动态计算`
      },

      {
        roleId:
          "cashier",

        name:
          "收银员",

        recommended:
          cashier,

        reason:
          peakOrdersPerHour >=
          16
            ? "高峰订单量较高"
            : "首店基础收银配置"
      },

      {
        roleId:
          "kitchen_assistant",

        name:
          "后厨帮工",

        recommended:
          kitchenAssistant,

        reason:
          chef >=
          2
            ? "辅助厨师备餐"
            : "当前规模暂非必要"
      },

      {
        roleId:
          "cleaner",

        name:
          "保洁员",

        recommended:
          cleaner,

        reason:
          `${seats}餐位卫生维护`
      },

      {
        roleId:
          "delivery",

        name:
          "配送员",

        recommended:
          delivery,

        reason:
          delivery >
          0
            ? "外卖订单占比达到配置阈值"
            : "当前外卖需求不足"
      },

      {
        roleId:
          "manager",

        name:
          "店长",

        recommended:
          manager,

        reason:
          manager >
          0
            ? "门店规模达到管理岗位需求"
            : "当前规模可由老板直接管理"
      }
    ];


    return definitions.map(
      item => {
        const current =
          currentCounts[
            item.roleId
          ] ??
          0;

        return {
          ...item,

          current,

          shortage:
            Math.max(
              0,
              item.recommended -
              current
            ),

          surplus:
            Math.max(
              0,
              current -
              item.recommended
            ),

          state:
            current <
              item.recommended
              ? "shortage"
              : current >
                item.recommended
                ? "surplus"
                : "balanced"
        };
      }
    );
  }


  getRecommendation(
    restaurantId
  ) {
    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );


    const currentCounts =
      countRoles(
        employees
      );


    const renovation =
      renovationSystem
        .getSummary(
          restaurantId
        );


    const schedule =
      operatingScheduleSystem
        .get(
          restaurantId
        );


    const operatingHours =
      schedule
        ?.enabled
        ? schedule.closeHour -
          schedule.openHour
        : 10;


    const demand =
      this.getRecentDemand(
        restaurantId
      );


    const seats =
      renovation
        .modifiers
        ?.seats ??
      0;


    const context = {
      seats,

      kitchenStations:
        renovation
          .modifiers
          ?.kitchenStations ??
        0,

      kitchenEfficiency:
        renovation
          .modifiers
          ?.kitchenEfficiency ??
        1,

      serviceEfficiency:
        renovation
          .modifiers
          ?.serviceEfficiency ??
        1,

      operatingHours,

      scheduleConfigured:
        Boolean(
          schedule?.enabled
        ),

      averageDailyOrders:
        demand
          .averageDailyOrders,

      averageChefSkill:
        this.getAverageEffectiveSkill(
          restaurantId,
          "chef",
          "cooking"
        ),

      averageServerSkill:
        this.getAverageEffectiveSkill(
          restaurantId,
          "server",
          "service"
        ),

      deliveryRatio:
        demand.deliveryRatio,

      deliveryAverageDaily:
        demand.deliveryOrders /
        demand.observedDays
    };


    const roles =
      this.calculatePlan(
        context,
        currentCounts
      );


    const recommendedTotal =
      roles.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.recommended,
        0
      );


    const currentTotal =
      employees.length;


    const totalShortage =
      roles.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.shortage,
        0
      );


    return {
      restaurantId,

      basis: {
        seats,

        operatingHours,

        scheduleConfigured:
          context
            .scheduleConfigured,

        averageDailyOrders:
          demand
            .averageDailyOrders,

        estimatedPeakOrdersPerHour:
          seats >
          0
            ? Math.max(
                1,
                Math.ceil(
                  Math.max(
                    demand
                      .averageDailyOrders,
                    Math.ceil(
                      seats *
                      Math.max(
                        0.75,
                        operatingHours /
                        12
                      )
                    )
                  ) /
                  operatingHours *
                  1.9
                )
              )
            : 0,

        averageChefSkill:
          context
            .averageChefSkill,

        averageServerSkill:
          context
            .averageServerSkill
      },

      roles,

      currentTotal,

      recommendedTotal,

      totalShortage,

      balanced:
        totalShortage ===
        0
    };
  }
}


export const staffingRecommendationSystem =
  new StaffingRecommendationSystem();


export {
  StaffingRecommendationSystem
};
