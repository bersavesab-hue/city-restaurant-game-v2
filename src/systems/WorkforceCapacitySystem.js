import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  employeeSystem,
  EMPLOYEE_STATUS
} from "./EmployeeSystem.js";

import {
  employeeWorkSystem
} from "./EmployeeWorkSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class WorkforceCapacitySystem {
  getCurrentDay() {
    return (
      gameState
        .getSection("time")
        ?.day ?? 1
    );
  }

  getCurrentHour() {
    return (
      gameState
        .getSection("time")
        ?.hour ?? 0
    );
  }

  getWeekday(day) {
    return (
      (
        Math.max(1, day) -
        1
      ) %
      7
    );
  }

  setShift({
    restaurantId,
    employeeId,
    weekday,
    startHour,
    endHour,
    enabled = true
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Employee does not belong to restaurant"
      );
    }

    if (
      !Number.isInteger(weekday) ||
      weekday < 0 ||
      weekday > 6
    ) {
      throw new RangeError(
        "weekday must be between 0 and 6"
      );
    }

    if (
      !Number.isInteger(startHour) ||
      !Number.isInteger(endHour) ||
      startHour < 0 ||
      startHour > 23 ||
      endHour < 1 ||
      endHour > 24 ||
      startHour >= endHour
    ) {
      throw new RangeError(
        "Invalid shift hours"
      );
    }

    const existing =
      entitySystem
        .filter(
          "workforce_shift",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.employeeId ===
              employeeId &&
            item.weekday ===
              weekday
        )[0];

    const data = {
      restaurantId,
      employeeId,
      weekday,
      startHour,
      endHour,
      enabled:
        Boolean(enabled)
    };

    if (existing) {
      return entitySystem.update(
        "workforce_shift",
        existing.id,
        data
      );
    }

    return entitySystem.create(
      "workforce_shift",
      data
    );
  }

  listShifts(
    restaurantId,
    employeeId = null
  ) {
    return entitySystem.filter(
      "workforce_shift",
      shift =>
        shift.restaurantId ===
          restaurantId &&
        (
          employeeId === null ||
          shift.employeeId ===
            employeeId
        )
    );
  }

  markAttendance({
    restaurantId,
    employeeId,
    day = this.getCurrentDay(),
    attendanceStatus = "present"
  }) {
    restaurantSystem.get(
      restaurantId
    );

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Employee does not belong to restaurant"
      );
    }

    if (
      ![
        "present",
        "late",
        "absent",
        "leave"
      ].includes(
        attendanceStatus
      )
    ) {
      throw new Error(
        "Invalid attendanceStatus"
      );
    }

    const existing =
      entitySystem
        .filter(
          "workforce_attendance",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.employeeId ===
              employeeId &&
            item.day === day
        )[0];

    const data = {
      restaurantId,
      employeeId,
      day,
      attendanceStatus
    };

    if (existing) {
      return entitySystem.update(
        "workforce_attendance",
        existing.id,
        data
      );
    }

    return entitySystem.create(
      "workforce_attendance",
      data
    );
  }

  getAttendance(
    restaurantId,
    employeeId,
    day
  ) {
    return (
      entitySystem
        .filter(
          "workforce_attendance",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.employeeId ===
              employeeId &&
            item.day === day
        )[0] ??
      null
    );
  }

  isScheduled(
    restaurantId,
    employeeId,
    day,
    hour
  ) {
    const all =
      this.listShifts(
        restaurantId,
        employeeId
      );

    // 没有手动排班时保持旧系统兼容：
    // 默认员工处于正常班次。
    if (all.length === 0) {
      return true;
    }

    const weekday =
      this.getWeekday(day);

    return all.some(
      shift =>
        shift.enabled !== false &&
        shift.weekday ===
          weekday &&
        hour >=
          shift.startHour &&
        hour <
          shift.endHour
    );
  }

  getEmployeeAvailability(
    employee,
    day,
    hour
  ) {
    if (
      employee.status !==
        EMPLOYEE_STATUS.ACTIVE ||
      employee.fatigue >= 95
    ) {
      return {
        available: false,
        modifier: 0,
        reason:
          employee.fatigue >= 95
            ? "exhausted"
            : "inactive"
      };
    }

    if (
      !this.isScheduled(
        employee.restaurantId,
        employee.id,
        day,
        hour
      )
    ) {
      return {
        available: false,
        modifier: 0,
        reason:
          "off_shift"
      };
    }

    const attendance =
      this.getAttendance(
        employee.restaurantId,
        employee.id,
        day
      );

    if (
      attendance
        ?.attendanceStatus ===
        "absent" ||
      attendance
        ?.attendanceStatus ===
        "leave"
    ) {
      return {
        available: false,
        modifier: 0,
        reason:
          attendance
            .attendanceStatus
      };
    }

    if (
      attendance
        ?.attendanceStatus ===
        "late"
    ) {
      return {
        available: true,
        modifier: 0.8,
        reason: "late"
      };
    }

    return {
      available: true,
      modifier: 1,
      reason: "available"
    };
  }

  getSkill(
    employee,
    skillName
  ) {
    return employeeWorkSystem
      .getEffectiveSkill(
        employee,
        skillName
      );
  }

  getCapacity(
    restaurantId,
    {
      day =
        this.getCurrentDay(),

      hour =
        this.getCurrentHour(),

      durationMinutes = 60
    } = {}
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const allEmployees =
      employeeSystem
        .listByRestaurant(
          restaurantId,
          {
            includeFired: true
          }
        );

    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    // Pure capacity tests and legacy isolated contexts can still
    // operate without an employee model. Once a restaurant has
    // actually created employees, missing operational roles must
    // not receive phantom capacity.
    if (
      allEmployees.length === 0
    ) {
      return {
        restaurantId,

        hasStaffData: false,

        day,
        hour,

        availableEmployees: 0,

        kitchenGuests: null,
        serviceGuests: null,
        checkoutGuests: null,

        roles: {},

        absentEmployees: [],
        exhaustedEmployees: []
      };
    }

    const factor =
      durationMinutes /
      60;

    let kitchenPerHour = 0;
    let servicePerHour = 0;
    let checkoutPerHour = 0;

    const roles = {};

    const absentEmployees = [];
    const exhaustedEmployees = [];

    let availableEmployees = 0;
    let bestManagerSkill = 0;

    for (
      const employee
      of employees
    ) {
      const availability =
        this.getEmployeeAvailability(
          employee,
          day,
          hour
        );

      if (
        !roles[
          employee.roleId
        ]
      ) {
        roles[
          employee.roleId
        ] = {
          total: 0,
          available: 0,
          effectiveSkillTotal: 0
        };
      }

      roles[
        employee.roleId
      ].total += 1;

      if (
        availability.reason ===
          "absent" ||
        availability.reason ===
          "leave"
      ) {
        absentEmployees.push({
          employeeId:
            employee.id,

          name:
            employee.name,

          roleId:
            employee.roleId,

          reason:
            availability.reason
        });
      }

      if (
        availability.reason ===
        "exhausted"
      ) {
        exhaustedEmployees.push({
          employeeId:
            employee.id,

          name:
            employee.name,

          roleId:
            employee.roleId,

          fatigue:
            employee.fatigue
        });
      }

      if (
        !availability.available
      ) {
        continue;
      }

      availableEmployees += 1;

      const modifier =
        availability.modifier;

      if (
        employee.roleId ===
        "chef"
      ) {
        const skill =
          this.getSkill(
            employee,
            "cooking"
          );

        roles.chef.available +=
          1;

        roles.chef
          .effectiveSkillTotal +=
          skill;

        kitchenPerHour +=
          (
            8 +
            Math.floor(
              skill /
              10
            )
          ) *
          modifier;
      }

      if (
        employee.roleId ===
        "kitchen_assistant"
      ) {
        const skill =
          this.getSkill(
            employee,
            "prep"
          );

        roles
          .kitchen_assistant
          .available += 1;

        roles
          .kitchen_assistant
          .effectiveSkillTotal +=
          skill;

        kitchenPerHour +=
          (
            3 +
            Math.floor(
              skill /
              20
            )
          ) *
          modifier;
      }

      if (
        employee.roleId ===
        "server"
      ) {
        const skill =
          this.getSkill(
            employee,
            "service"
          );

        roles.server.available +=
          1;

        roles.server
          .effectiveSkillTotal +=
          skill;

        servicePerHour +=
          (
            5 +
            Math.floor(
              skill /
              12
            )
          ) *
          modifier;
      }

      if (
        employee.roleId ===
        "cashier"
      ) {
        const skill =
          this.getSkill(
            employee,
            "checkout"
          );

        roles.cashier.available +=
          1;

        roles.cashier
          .effectiveSkillTotal +=
          skill;

        checkoutPerHour +=
          (
            8 +
            Math.floor(
              skill /
              10
            )
          ) *
          modifier;
      }

      if (
        employee.roleId ===
        "manager"
      ) {
        const skill =
          this.getSkill(
            employee,
            "management"
          );

        roles.manager.available +=
          1;

        roles.manager
          .effectiveSkillTotal +=
          skill;

        bestManagerSkill =
          Math.max(
            bestManagerSkill,
            skill
          );
      }
    }

    const managerMultiplier =
      clamp(
        1 +
        bestManagerSkill /
        500,
        1,
        1.2
      );

    kitchenPerHour *=
      managerMultiplier;

    servicePerHour *=
      managerMultiplier;

    checkoutPerHour *=
      managerMultiplier;

    // 有员工体系但没有专职收银时，
    // 默认老板临时收银，仅保留极低产能。
    if (
      checkoutPerHour <= 0
    ) {
      checkoutPerHour =
        bestManagerSkill > 0
          ? (
              6 +
              Math.floor(
                bestManagerSkill /
                15
              )
            )
          : 1;
    }

    return {
      restaurantId,

      hasStaffData: true,

      day,
      hour,

      availableEmployees,

      managerMultiplier:
        Number(
          managerMultiplier
            .toFixed(2)
        ),

      kitchenGuests:
        Math.max(
          0,
          Math.floor(
            kitchenPerHour *
            factor
          )
        ),

      serviceGuests:
        Math.max(
          0,
          Math.floor(
            servicePerHour *
            factor
          )
        ),

      checkoutGuests:
        Math.max(
          1,
          Math.floor(
            checkoutPerHour *
            factor
          )
        ),

      roles,

      absentEmployees,
      exhaustedEmployees
    };
  }

  getDashboard(
    restaurantId
  ) {
    const capacity =
      this.getCapacity(
        restaurantId
      );

    return {
      restaurantId,

      capacity,

      employees:
        employeeSystem
          .listByRestaurant(
            restaurantId
          )
          .map(
            employee => {
              const availability =
                this.getEmployeeAvailability(
                  employee,
                  this.getCurrentDay(),
                  this.getCurrentHour()
                );

              return {
                employeeId:
                  employee.id,

                name:
                  employee.name,

                roleId:
                  employee.roleId,

                fatigue:
                  employee.fatigue,

                mood:
                  employee.mood,

                status:
                  employee.status,

                available:
                  availability.available,

                availabilityReason:
                  availability.reason
              };
            }
          ),

      shifts:
        this.listShifts(
          restaurantId
        ),

      attendance:
        entitySystem.filter(
          "workforce_attendance",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.day ===
              this.getCurrentDay()
        )
    };
  }
}

export const workforceCapacitySystem =
  new WorkforceCapacitySystem();

export {
  WorkforceCapacitySystem
};
