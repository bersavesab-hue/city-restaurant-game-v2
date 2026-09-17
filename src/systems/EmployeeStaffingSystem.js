import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { gameState } from "../core/GameState.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { employeeSystem, EMPLOYEE_STATUS } from "./EmployeeSystem.js";
import { employeeCareerSystem } from "./EmployeeCareerSystem.js";
import { financeSystem, FINANCE_CATEGORY } from "./FinanceSystem.js";

const CANDIDATE_LIFE_DAYS = 14;
const PAYROLL_INTERVAL_DAYS = 30;

const SURNAMES = Object.freeze([
  "张", "李", "王", "赵", "陈", "刘",
  "杨", "黄", "周", "吴", "徐", "孙",
  "胡", "朱", "高", "林", "何", "郭"
]);

const GIVEN_NAMES = Object.freeze([
  "明远", "志强", "海峰", "建华", "文博", "子轩",
  "雅琴", "晓梅", "雨桐", "欣怡", "嘉豪", "思远",
  "晨曦", "俊杰", "安然", "佳宁", "瑞阳", "雪晴"
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentDay() {
  return gameState.getSection("time")?.day ?? 1;
}

function hashString(value) {
  let hash = 2166136261;

  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function random01(seed, salt = 0) {
  let value =
    (seed + Math.imul(salt + 1, 0x9e3779b1)) >>> 0;

  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;

  return (value >>> 0) / 4294967296;
}

function randomInt(seed, salt, min, max) {
  return Math.floor(
    random01(seed, salt) * (max - min + 1)
  ) + min;
}

function requireEmployee(employeeId) {
  return employeeSystem.get(employeeId);
}

function validateMinute(value, name) {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 1440
  ) {
    throw new RangeError(
      `${name} must be an integer between 0 and 1440`
    );
  }
}

function dayOfWeek(day) {
  return ((day - 1) % 7) + 1;
}

class EmployeeStaffingSystem {
  listCandidates(
    restaurantId,
    {
      availableOnly = true
    } = {}
  ) {
    restaurantSystem.get(restaurantId);

    return entitySystem
      .list("employee_candidate")
      .filter(
        item =>
          item.restaurantId === restaurantId
      )
      .filter(
        item =>
          !availableOnly ||
          item.status === "available"
      )
      .sort(
        (a, b) =>
          b.potential - a.potential
      );
  }

  expireCandidates(day = currentDay()) {
    let expired = 0;

    for (
      const candidate
      of entitySystem.list(
        "employee_candidate"
      )
    ) {
      if (
        candidate.status === "available" &&
        candidate.expiresDay < day
      ) {
        entitySystem.update(
          "employee_candidate",
          candidate.id,
          {
            status: "expired",
            expiredDay: day
          }
        );

        expired += 1;
      }
    }

    return expired;
  }

  refreshTalentPool(
    restaurantId,
    {
      count = 10,
      lifeDays = CANDIDATE_LIFE_DAYS,
      replace = true
    } = {}
  ) {
    restaurantSystem.get(restaurantId);

    if (
      !Number.isInteger(count) ||
      count <= 0
    ) {
      throw new RangeError(
        "Candidate count must be positive"
      );
    }

    if (
      !Number.isInteger(lifeDays) ||
      lifeDays <= 0
    ) {
      throw new RangeError(
        "Candidate lifeDays must be positive"
      );
    }

    const day = currentDay();

    if (replace) {
      for (
        const candidate
        of this.listCandidates(
          restaurantId
        )
      ) {
        entitySystem.update(
          "employee_candidate",
          candidate.id,
          {
            status: "expired",
            expiredDay: day,
            expiredReason: "pool_refresh"
          }
        );
      }
    }

    const roles =
      employeeSystem.getRoles();

    const batchNumber =
      entitySystem
        .list("employee_candidate")
        .filter(
          item =>
            item.restaurantId ===
            restaurantId
        ).length + 1;

    const created = [];

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const seed = hashString(
        `${restaurantId}:${day}:${batchNumber}:${index}`
      );

      const role =
        roles[
          (
            index +
            hashString(restaurantId)
          ) %
          roles.length
        ];

      const surname =
        SURNAMES[
          randomInt(
            seed,
            1,
            0,
            SURNAMES.length - 1
          )
        ];

      const givenName =
        GIVEN_NAMES[
          randomInt(
            seed,
            2,
            0,
            GIVEN_NAMES.length - 1
          )
        ];

      const salaryRate =
        0.9 +
        random01(seed, 3) *
          0.32;

      const expectedSalary =
        Math.max(
          1000,
          Math.round(
            role.baseSalary *
            salaryRate /
            100
          ) * 100
        );

      const skillProfile =
        role.skillProfile ??
        [role.primarySkill];

      const skills = {};

      for (
        let skillIndex = 0;
        skillIndex <
          skillProfile.length;
        skillIndex += 1
      ) {
        const skill =
          skillProfile[skillIndex];

        const base =
          randomInt(
            seed,
            10 + skillIndex,
            18,
            48
          );

        skills[skill] =
          clamp(
            base +
            (
              skill ===
              role.primarySkill
                ? randomInt(
                    seed,
                    20 + skillIndex,
                    4,
                    16
                  )
                : 0
            ),
            1,
            70
          );
      }

      const potential =
        randomInt(
          seed,
          30,
          40,
          92
        );

      const stability =
        randomInt(
          seed,
          31,
          35,
          95
        );

      const loyaltyStart =
        randomInt(
          seed,
          32,
          42,
          68
        );

      const moodStart =
        randomInt(
          seed,
          33,
          58,
          82
        );

      const candidate =
        entitySystem.create(
          "employee_candidate",
          {
            restaurantId,

            name:
              `${surname}${givenName}`,

            roleId: role.id,
            roleName: role.name,

            expectedSalary,
            skills,

            potential,
            stability,

            loyaltyStart,
            moodStart,

            status: "available",

            createdDay: day,

            expiresDay:
              day + lifeDays,

            source:
              "talent_market"
          }
        );

      created.push(candidate);
    }

    eventBus.emit(
      "employeeStaffing:talentPoolRefreshed",
      {
        restaurantId,
        day,
        count: created.length
      }
    );

    return created;
  }

  hireCandidate({
    restaurantId,
    candidateId,
    salary = null
  }) {
    restaurantSystem.get(restaurantId);

    const candidate =
      entitySystem.get(
        "employee_candidate",
        candidateId
      );

    if (!candidate) {
      throw new Error(
        "Candidate does not exist"
      );
    }

    if (
      candidate.restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Candidate belongs to another restaurant"
      );
    }

    if (
      candidate.status !==
      "available"
    ) {
      throw new Error(
        "Candidate is no longer available"
      );
    }

    if (
      candidate.expiresDay <
      currentDay()
    ) {
      throw new Error(
        "Candidate has expired"
      );
    }

    const finalSalary =
      salary ??
      candidate.expectedSalary;

    const employee =
      employeeSystem.hire({
        restaurantId,
        name: candidate.name,
        roleId: candidate.roleId,
        salary: finalSalary
      });

    const updatedEmployee =
      entitySystem.update(
        "employee",
        employee.id,
        {
          skills: {
            ...employee.skills,
            ...candidate.skills
          },

          mood:
            candidate.moodStart,

          loyalty:
            candidate.loyaltyStart,

          potential:
            candidate.potential,

          stability:
            candidate.stability,

          recruitmentSource:
            "talent_market",

          candidateId:
            candidate.id,

          salaryArrears: 0,

          turnoverRisk: 0,

          turnoverRiskLevel:
            "low",

          criticalTurnoverDays: 0,

          attendanceStats: {
            scheduledDays: 0,
            attendedDays: 0,
            absentDays: 0,
            lateDays: 0,
            earlyLeaveDays: 0,
            overtimeMinutes: 0
          }
        }
      );

    entitySystem.update(
      "employee_candidate",
      candidate.id,
      {
        status: "hired",
        hiredDay: currentDay(),
        employeeId:
          updatedEmployee.id
      }
    );

    eventBus.emit(
      "employeeStaffing:candidateHired",
      {
        restaurantId,
        candidateId,
        employeeId:
          updatedEmployee.id
      }
    );

    return updatedEmployee;
  }

  setShift({
    employeeId,
    weekday,
    startMinute,
    endMinute
  }) {
    const employee =
      requireEmployee(employeeId);

    if (
      !Number.isInteger(weekday) ||
      weekday < 1 ||
      weekday > 7
    ) {
      throw new RangeError(
        "weekday must be 1-7"
      );
    }

    validateMinute(
      startMinute,
      "startMinute"
    );

    validateMinute(
      endMinute,
      "endMinute"
    );

    if (
      endMinute <=
      startMinute
    ) {
      throw new Error(
        "Shift end must be later than start"
      );
    }

    const plannedMinutes =
      endMinute -
      startMinute;

    if (
      plannedMinutes >
      16 * 60
    ) {
      throw new Error(
        "Shift cannot exceed 16 hours"
      );
    }

    const existing =
      entitySystem
        .list("employee_shift")
        .find(
          item =>
            item.employeeId ===
              employeeId &&
            item.weekday ===
              weekday
        );

    const data = {
      restaurantId:
        employee.restaurantId,

      employeeId,

      weekday,

      startMinute,
      endMinute,

      plannedMinutes,

      active: true
    };

    if (existing) {
      return entitySystem.update(
        "employee_shift",
        existing.id,
        data
      );
    }

    return entitySystem.create(
      "employee_shift",
      data
    );
  }

  removeShift(
    employeeId,
    weekday
  ) {
    const shift =
      entitySystem
        .list("employee_shift")
        .find(
          item =>
            item.employeeId ===
              employeeId &&
            item.weekday ===
              weekday &&
            item.active
        );

    if (!shift) {
      return false;
    }

    entitySystem.update(
      "employee_shift",
      shift.id,
      {
        active: false
      }
    );

    return true;
  }

  getSchedule(restaurantId) {
    restaurantSystem.get(restaurantId);

    return entitySystem
      .list("employee_shift")
      .filter(
        item =>
          item.restaurantId ===
            restaurantId &&
          item.active
      )
      .sort(
        (a, b) =>
          a.weekday -
            b.weekday ||
          a.startMinute -
            b.startMinute
      );
  }

  getShiftForDay(
    employeeId,
    day
  ) {
    const weekday =
      dayOfWeek(day);

    return entitySystem
      .list("employee_shift")
      .find(
        item =>
          item.employeeId ===
            employeeId &&
          item.weekday ===
            weekday &&
          item.active
      ) ?? null;
  }

  recordAttendance({
    employeeId,
    day = currentDay(),
    clockInMinute = null,
    clockOutMinute = null,
    absent = false
  }) {
    const employee =
      requireEmployee(employeeId);

    const existing =
      entitySystem
        .list("employee_attendance")
        .find(
          item =>
            item.employeeId ===
              employeeId &&
            item.day === day
        );

    if (existing) {
      throw new Error(
        "Attendance already recorded for this day"
      );
    }

    const shift =
      this.getShiftForDay(
        employeeId,
        day
      );

    if (!shift) {
      throw new Error(
        "Employee has no scheduled shift for this day"
      );
    }

    let actualMinutes = 0;
    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let overtimeMinutes = 0;
    let status = "present";

    if (absent) {
      status = "absent";
    } else {
      validateMinute(
        clockInMinute,
        "clockInMinute"
      );

      validateMinute(
        clockOutMinute,
        "clockOutMinute"
      );

      if (
        clockOutMinute <=
        clockInMinute
      ) {
        throw new Error(
          "Clock-out must be later than clock-in"
        );
      }

      actualMinutes =
        clockOutMinute -
        clockInMinute;

      lateMinutes =
        Math.max(
          0,
          clockInMinute -
          shift.startMinute
        );

      earlyLeaveMinutes =
        Math.max(
          0,
          shift.endMinute -
          clockOutMinute
        );

      overtimeMinutes =
        Math.max(
          0,
          clockOutMinute -
          shift.endMinute
        );

      if (lateMinutes > 5) {
        status = "late";
      }

      if (
        earlyLeaveMinutes > 5
      ) {
        status =
          status === "late"
            ? "late_early_leave"
            : "early_leave";
      }
    }

    const attendance =
      entitySystem.create(
        "employee_attendance",
        {
          restaurantId:
            employee.restaurantId,

          employeeId,

          day,

          weekday:
            dayOfWeek(day),

          shiftId:
            shift.id,

          plannedMinutes:
            shift.plannedMinutes,

          clockInMinute:
            absent
              ? null
              : clockInMinute,

          clockOutMinute:
            absent
              ? null
              : clockOutMinute,

          actualMinutes,

          lateMinutes,

          earlyLeaveMinutes,

          overtimeMinutes,

          absent:
            Boolean(absent),

          status
        }
      );

    const currentStats = {
      scheduledDays: 0,
      attendedDays: 0,
      absentDays: 0,
      lateDays: 0,
      earlyLeaveDays: 0,
      overtimeMinutes: 0,
      ...(employee.attendanceStats ??
        {})
    };

    const stats = {
      scheduledDays:
        currentStats
          .scheduledDays + 1,

      attendedDays:
        currentStats
          .attendedDays +
        (absent ? 0 : 1),

      absentDays:
        currentStats
          .absentDays +
        (absent ? 1 : 0),

      lateDays:
        currentStats
          .lateDays +
        (lateMinutes > 5
          ? 1
          : 0),

      earlyLeaveDays:
        currentStats
          .earlyLeaveDays +
        (earlyLeaveMinutes > 5
          ? 1
          : 0),

      overtimeMinutes:
        currentStats
          .overtimeMinutes +
        overtimeMinutes
    };

    entitySystem.update(
      "employee",
      employeeId,
      {
        attendanceStats: stats,

        mood: clamp(
          (employee.mood ?? 70) -
          (
            absent
              ? 3
              : lateMinutes > 30
                ? 1
                : 0
          ),
          0,
          100
        )
      }
    );

    return attendance;
  }

  getAttendance(
    restaurantId,
    {
      fromDay = null,
      toDay = null
    } = {}
  ) {
    restaurantSystem.get(restaurantId);

    return entitySystem
      .list("employee_attendance")
      .filter(
        item =>
          item.restaurantId ===
          restaurantId
      )
      .filter(
        item =>
          fromDay === null ||
          item.day >= fromDay
      )
      .filter(
        item =>
          toDay === null ||
          item.day <= toDay
      );
  }

  getTurnoverRisk(
    employeeId
  ) {
    const employee =
      requireEmployee(employeeId);

    const salary =
      employeeCareerSystem
        .getSalarySatisfaction(
          employee
        );

    const stats =
      employee.attendanceStats ?? {};

    const absenceRate =
      (stats.scheduledDays ?? 0) > 0
        ? (
            stats.absentDays ?? 0
          ) /
          stats.scheduledDays
        : 0;

    const arrearsMonths =
      (
        employee.salaryArrears ??
        0
      ) /
      Math.max(
        1,
        employee.salary
      );

    const score =
      clamp(
        Math.round(
          5 +

          (
            100 -
            salary.score
          ) *
            0.28 +

          (employee.fatigue ?? 0) *
            0.18 +

          (
            100 -
            (employee.mood ?? 70)
          ) *
            0.16 +

          (
            100 -
            (employee.loyalty ?? 50)
          ) *
            0.25 +

          Math.min(
            30,
            arrearsMonths * 18
          ) +

          Math.min(
            15,
            absenceRate * 40
          )
        ),
        0,
        100
      );

    const level =
      score >= 80
        ? "critical"
        : score >= 60
          ? "high"
          : score >= 35
            ? "medium"
            : "low";

    return {
      employeeId,
      score,
      level,

      factors: {
        salarySatisfaction:
          salary.score,

        fatigue:
          employee.fatigue ?? 0,

        mood:
          employee.mood ?? 70,

        loyalty:
          employee.loyalty ?? 50,

        salaryArrears:
          employee.salaryArrears ??
          0,

        absenceRate:
          Number(
            absenceRate.toFixed(3)
          )
      }
    };
  }

  updateTurnoverRisks(
    day = currentDay()
  ) {
    let critical = 0;

    for (
      const employee
      of entitySystem.list(
        "employee"
      )
    ) {
      if (
        employee.status ===
        EMPLOYEE_STATUS.FIRED
      ) {
        continue;
      }

      const risk =
        this.getTurnoverRisk(
          employee.id
        );

      const previousCritical =
        employee
          .criticalTurnoverDays ??
        0;

      const criticalDays =
        risk.score >= 80
          ? previousCritical + 1
          : Math.max(
              0,
              previousCritical - 1
            );

      entitySystem.update(
        "employee",
        employee.id,
        {
          turnoverRisk:
            risk.score,

          turnoverRiskLevel:
            risk.level,

          criticalTurnoverDays:
            criticalDays,

          turnoverRiskUpdatedDay:
            day
        }
      );

      if (
        risk.level ===
        "critical"
      ) {
        critical += 1;

        if (
          criticalDays === 7
        ) {
          eventBus.emit(
            "employee:turnoverRiskCritical",
            {
              employeeId:
                employee.id,

              restaurantId:
                employee.restaurantId,

              day,

              score:
                risk.score
            }
          );
        }
      }
    }

    return {
      day,
      critical
    };
  }

  settlePayroll(
    restaurantId,
    {
      day = currentDay()
    } = {}
  ) {
    restaurantSystem.get(restaurantId);

    const duplicate =
      entitySystem
        .list("payroll_run")
        .find(
          item =>
            item.restaurantId ===
              restaurantId &&
            item.day === day
        );

    if (duplicate) {
      return duplicate;
    }

    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    const fromDay =
      Math.max(
        1,
        day -
        PAYROLL_INTERVAL_DAYS +
        1
      );

    const attendance =
      this.getAttendance(
        restaurantId,
        {
          fromDay,
          toDay: day
        }
      );

    const entries =
      employees.map(
        employee => {
          const overtimeMinutes =
            attendance
              .filter(
                item =>
                  item.employeeId ===
                  employee.id
              )
              .reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  (
                    item.overtimeMinutes ??
                    0
                  ),
                0
              );

          const hourlyRate =
            employee.salary /
            174;

          const overtimePay =
            Math.round(
              hourlyRate /
              60 *
              overtimeMinutes *
              1.5
            );

          const previousArrears =
            employee.salaryArrears ??
            0;

          return {
            employeeId:
              employee.id,

            employeeName:
              employee.name,

            salary:
              employee.salary,

            overtimeMinutes,

            overtimePay,

            previousArrears,

            due:
              employee.salary +
              overtimePay +
              previousArrears
          };
        }
      );

    const total =
      entries.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.due,
        0
      );

    let paid = true;

    if (total > 0) {
      let balance = null;

      try {
        balance =
          financeSystem
            .getBalance(
              restaurantId
            );
      } catch {
        balance = null;
      }

      paid =
        balance !== null &&
        balance >= total;
    }

    if (
      total > 0 &&
      paid
    ) {
      financeSystem.expense(
        restaurantId,
        total,
        FINANCE_CATEGORY.SALARY,
        `第${day}日员工工资结算`
      );
    }

    for (
      const entry
      of entries
    ) {
      const employee =
        requireEmployee(
          entry.employeeId
        );

      if (paid) {
        entitySystem.update(
          "employee",
          employee.id,
          {
            salaryArrears: 0,

            lastSalaryPaidDay:
              day,

            mood:
              clamp(
                (employee.mood ??
                  70) + 2,
                0,
                100
              ),

            loyalty:
              clamp(
                (employee.loyalty ??
                  50) + 1,
                0,
                100
              )
          }
        );
      } else {
        entitySystem.update(
          "employee",
          employee.id,
          {
            salaryArrears:
              entry.due,

            mood:
              clamp(
                (employee.mood ??
                  70) - 8,
                0,
                100
              ),

            loyalty:
              clamp(
                (employee.loyalty ??
                  50) - 6,
                0,
                100
              )
          }
        );
      }
    }

    const run =
      entitySystem.create(
        "payroll_run",
        {
          restaurantId,

          day,

          period: {
            fromDay,
            toDay: day
          },

          status:
            paid
              ? "paid"
              : "arrears",

          total,

          paidAmount:
            paid
              ? total
              : 0,

          entries
        }
      );

    eventBus.emit(
      "employeeStaffing:payrollSettled",
      {
        restaurantId,
        day,
        status:
          run.status,
        total
      }
    );

    return run;
  }

  getPayrollHistory(
    restaurantId
  ) {
    restaurantSystem.get(restaurantId);

    return entitySystem
      .list("payroll_run")
      .filter(
        item =>
          item.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          b.day -
          a.day
      );
  }

  processDay(
    day = currentDay()
  ) {
    const expiredCandidates =
      this.expireCandidates(day);

    const turnover =
      this.updateTurnoverRisks(
        day
      );

    let payrollRuns = 0;

    if (
      day > 1 &&
      day %
        PAYROLL_INTERVAL_DAYS ===
        0
    ) {
      for (
        const restaurant
        of entitySystem.list(
          "restaurant"
        )
      ) {
        try {
          this.settlePayroll(
            restaurant.id,
            { day }
          );

          payrollRuns += 1;
        } catch {
          // 门店尚未建立财务账户时跳过自动工资结算。
        }
      }
    }

    return {
      day,
      expiredCandidates,
      criticalTurnover:
        turnover.critical,
      payrollRuns
    };
  }
}

export const employeeStaffingSystem =
  new EmployeeStaffingSystem();

export {
  EmployeeStaffingSystem,
  CANDIDATE_LIFE_DAYS,
  PAYROLL_INTERVAL_DAYS
};
