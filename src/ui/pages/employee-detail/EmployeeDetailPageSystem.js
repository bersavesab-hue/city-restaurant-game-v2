import {
  employeeSystem
} from "../../../systems/EmployeeSystem.js";

import {
  employeeStaffingSystem
} from "../../../systems/EmployeeStaffingSystem.js";

import {
  employeeManagementPageSystem
} from "../employees/EmployeeManagementPageSystem.js";


class EmployeeDetailPageSystem {
  getPage(
    restaurantId,
    {
      employeeId = null
    } = {}
  ) {
    const base =
      employeeManagementPageSystem
        .getPage(
          restaurantId
        );

    const resolvedId =
      employeeId ??
      base.employees?.[0]?.id ??
      null;

    if (!resolvedId) {
      return {
        pageId:
          "employee_detail",

        restaurantId,

        topBar:
          base.topBar,

        noticeTicker:
          base.noticeTicker,

        bottomNavigation:
          base.bottomNavigation,

        employee:
          null,

        turnover:
          null,

        metrics:
          []
      };
    }

    const raw =
      employeeSystem.get(
        resolvedId
      );

    if (
      raw.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Employee belongs to another restaurant"
      );
    }

    const employee =
      base.employees
        .find(
          item =>
            item.id ===
            resolvedId
        ) ??
      employeeManagementPageSystem
        .getEmployeeView(
          raw
        );

    const turnover =
      employeeStaffingSystem
        .getTurnoverRisk(
          resolvedId
        );

    return {
      pageId:
        "employee_detail",

      restaurantId,

      topBar:
        base.topBar,

      noticeTicker:
        base.noticeTicker,

      bottomNavigation:
        base.bottomNavigation,

      employee,

      turnover,

      metrics: [
        {
          label:
            "岗位",

          value:
            employee.roleName,

          tone:
            "primary"
        },

        {
          label:
            "当前职级",

          value:
            employee.rank
              ?.name ??
            "-",

          tone:
            "primary"
        },

        {
          label:
            "满意度",

          value:
            `${employee.satisfactionScore}/100`,

          tone:
            employee.satisfactionScore >=
            70
              ? "success"
              : employee.satisfactionScore >=
                50
                ? "warning"
                : "danger"
        },

        {
          label:
            "离职风险",

          value:
            `${turnover.score}/100`,

          tone:
            turnover.score >=
            60
              ? "danger"
              : turnover.score >=
                35
                ? "warning"
                : "success"
        }
      ]
    };
  }
}


export const employeeDetailPageSystem =
  new EmployeeDetailPageSystem();


export {
  EmployeeDetailPageSystem
};
