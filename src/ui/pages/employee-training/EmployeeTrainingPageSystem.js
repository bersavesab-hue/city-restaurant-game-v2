import {
  employeeSystem
} from "../../../systems/EmployeeSystem.js";

import {
  employeeCareerSystem
} from "../../../systems/EmployeeCareerSystem.js";

import {
  employeeManagementPageSystem
} from "../employees/EmployeeManagementPageSystem.js";


class EmployeeTrainingPageSystem {
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

    const selected =
      (
        employeeId
          ? base.employees
              .find(
                item =>
                  item.id ===
                  employeeId
              )
          : null
      ) ??
      base.employees?.[0] ??
      null;

    if (!selected) {
      return {
        pageId:
          "employee_training",

        restaurantId,

        topBar:
          base.topBar,

        noticeTicker:
          base.noticeTicker,

        bottomNavigation:
          base.bottomNavigation,

        employees:
          [],

        employee:
          null,

        programs:
          [],

        metrics:
          []
      };
    }

    const profile =
      employeeCareerSystem
        .getProfile(
          selected.id
        );

    return {
      pageId:
        "employee_training",

      restaurantId,

      topBar:
        base.topBar,

      noticeTicker:
        base.noticeTicker,

      bottomNavigation:
        base.bottomNavigation,

      employees:
        base.employees,

      employee:
        selected,

      programs:
        profile.trainingPrograms,

      metrics: [
        {
          label:
            "当前员工",

          value:
            selected.name,

          tone:
            "primary"
        },

        {
          label:
            "当前职级",

          value:
            profile.rank.name,

          tone:
            "primary"
        },

        {
          label:
            "培训次数",

          value:
            `${selected.trainingCount}次`,

          tone:
            "primary"
        },

        {
          label:
            "当前疲劳",

          value:
            `${selected.fatigue}/100`,

          tone:
            selected.fatigue >=
            80
              ? "danger"
              : selected.fatigue >=
                60
                ? "warning"
                : "success"
        }
      ]
    };
  }


  train(
    restaurantId,
    employeeId,
    programId
  ) {
    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Employee belongs to another restaurant"
      );
    }

    return employeeCareerSystem
      .train(
        employeeId,
        programId
      );
  }
}


export const employeeTrainingPageSystem =
  new EmployeeTrainingPageSystem();


export {
  EmployeeTrainingPageSystem
};
