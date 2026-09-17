import { entitySystem } from "../core/EntitySystem.js";

import {
  employeeSystem,
  EMPLOYEE_STATUS
} from "./EmployeeSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class EmployeeWorkSystem {
  listAvailableByRole(
    restaurantId,
    roleId
  ) {
    return employeeSystem
      .listByRestaurant(restaurantId)
      .filter(
        (employee) =>
          employee.roleId === roleId &&
          employee.status ===
            EMPLOYEE_STATUS.ACTIVE &&
          employee.fatigue < 95
      );
  }

  getEffectiveSkill(
    employee,
    skillName
  ) {
    const base =
      employee.skills?.[
        skillName
      ] ?? 0;

    const moodBonus =
      (employee.mood - 50) *
      0.15;

    const fatiguePenalty =
      employee.fatigue *
      0.35;

    return clamp(
      Math.round(
        base +
        moodBonus -
        fatiguePenalty
      ),
      1,
      100
    );
  }

  getBestChef(
    restaurantId
  ) {
    const chefs =
      this.listAvailableByRole(
        restaurantId,
        "chef"
      );

    if (chefs.length === 0) {
      return null;
    }

    return chefs
      .map((employee) => ({
        employee,
        effectiveSkill:
          this.getEffectiveSkill(
            employee,
            "cooking"
          )
      }))
      .sort(
        (a, b) =>
          b.effectiveSkill -
          a.effectiveSkill
      )[0];
  }

  requireChef(
    restaurantId,
    employeeId = null
  ) {
    if (employeeId !== null) {
      const employee =
        employeeSystem.get(
          employeeId
        );

      if (
        employee.restaurantId !==
          restaurantId ||
        employee.roleId !==
          "chef" ||
        employee.status !==
          EMPLOYEE_STATUS.ACTIVE ||
        employee.fatigue >= 95
      ) {
        throw new Error(
          "Selected chef is not available"
        );
      }

      return {
        employee,
        effectiveSkill:
          this.getEffectiveSkill(
            employee,
            "cooking"
          )
      };
    }

    const chef =
      this.getBestChef(
        restaurantId
      );

    if (!chef) {
      const error =
        new Error(
          "No available chef"
        );

      error.code =
        "NO_CHEF_AVAILABLE";

      throw error;
    }

    return chef;
  }

  getServiceCapacity(
    restaurantId
  ) {
    const servers =
      this.listAvailableByRole(
        restaurantId,
        "server"
      );

    // 没有服务员时，默认店主本人
    // 只能勉强接待 1 人/小时。
    if (servers.length === 0) {
      return 1;
    }

    return servers.reduce(
      (capacity, employee) => {
        const skill =
          this.getEffectiveSkill(
            employee,
            "service"
          );

        return (
          capacity +
          2 +
          Math.floor(
            skill / 25
          )
        );
      },
      0
    );
  }

  recordWork(
    employeeId,
    minutes
  ) {
    if (
      !Number.isInteger(minutes) ||
      minutes <= 0
    ) {
      throw new RangeError(
        "Work minutes must be positive"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    const fatigueGain =
      Math.max(
        1,
        Math.ceil(
          minutes / 15
        )
      );

    const fatigue =
      clamp(
        employee.fatigue +
        fatigueGain,
        0,
        100
      );

    const mood =
      fatigue >= 80
        ? clamp(
            employee.mood - 1,
            0,
            100
          )
        : employee.mood;

    return entitySystem.update(
      "employee",
      employeeId,
      {
        fatigue,
        mood,
        totalWorkMinutes:
          employee.totalWorkMinutes +
          minutes
      }
    );
  }

  recoverHour(
    restaurantId
  ) {
    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    for (
      const employee
      of employees
    ) {
      if (
        employee.status ===
        EMPLOYEE_STATUS.FIRED
      ) {
        continue;
      }

      entitySystem.update(
        "employee",
        employee.id,
        {
          fatigue:
            clamp(
              employee.fatigue - 6,
              0,
              100
            ),

          mood:
            clamp(
              employee.mood + 1,
              0,
              100
            )
        }
      );
    }
  }
}

export const employeeWorkSystem =
  new EmployeeWorkSystem();

export {
  EmployeeWorkSystem
};
