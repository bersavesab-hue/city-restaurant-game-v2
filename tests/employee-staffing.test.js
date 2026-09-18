import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  restaurantSystem,
  financeSystem,
  employeeSystem,
  employeeStaffingSystem
} = app.systems;

test(
  "员工系统支持人才池招聘排班考勤工资和离职风险",
  () => {
    const restaurant =
      restaurantSystem.create({
        name: "员工调度测试餐厅"
      });

    financeSystem.createAccount(
      restaurant.id,
      120000
    );

    const candidates =
      employeeStaffingSystem
        .refreshTalentPool(
          restaurant.id,
          {
            count: 8
          }
        );

    assert.equal(
      candidates.length,
      8
    );

    assert.ok(
      candidates.every(
        item =>
          item.status ===
          "available"
      )
    );

    assert.ok(
      candidates.every(
        item =>
          item.expectedSalary >
          0
      )
    );

    const candidate =
      candidates[0];

    const employee =
      employeeStaffingSystem
        .hireCandidate({
          restaurantId:
            restaurant.id,

          candidateId:
            candidate.id
        });

    assert.equal(
      employee.name,
      candidate.name
    );

    assert.equal(
      employee.roleId,
      candidate.roleId
    );

    assert.equal(
      employee.recruitmentSource,
      "talent_market"
    );

    assert.ok(
      employee.potential >= 40
    );

    const hiredCandidate =
      app.core.entitySystem.get(
        "employee_candidate",
        candidate.id
      );

    assert.equal(
      hiredCandidate.status,
      "hired"
    );

    const shift =
      employeeStaffingSystem
        .setShift({
          employeeId:
            employee.id,

          weekday: 1,

          startMinute:
            9 * 60,

          endMinute:
            17 * 60
        });

    assert.equal(
      shift.plannedMinutes,
      8 * 60
    );

    const attendance =
      employeeStaffingSystem
        .recordAttendance({
          employeeId:
            employee.id,

          day: 1,

          clockInMinute:
            9 * 60 + 15,

          clockOutMinute:
            18 * 60
        });

    assert.equal(
      attendance.lateMinutes,
      15
    );

    assert.equal(
      attendance.overtimeMinutes,
      60
    );

    const afterAttendance =
      employeeSystem.get(
        employee.id
      );

    assert.equal(
      afterAttendance
        .attendanceStats
        .scheduledDays,
      1
    );

    assert.equal(
      afterAttendance
        .attendanceStats
        .lateDays,
      1
    );

    const beforeBalance =
      financeSystem.getBalance(
        restaurant.id
      );

    const payroll =
      employeeStaffingSystem
        .settlePayroll(
          restaurant.id,
          {
            day: 30
          }
        );

    assert.equal(
      payroll.status,
      "paid"
    );

    assert.ok(
      payroll.total >=
      employee.salary
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      beforeBalance -
      payroll.total
    );

    assert.equal(
      payroll.entries[0]
        .overtimeMinutes,
      60
    );

    const risk =
      employeeStaffingSystem
        .getTurnoverRisk(
          employee.id
        );

    assert.ok(
      risk.score >= 0 &&
      risk.score <= 100
    );

    assert.ok(
      [
        "low",
        "medium",
        "high",
        "critical"
      ].includes(
        risk.level
      )
    );

    const schedule =
      employeeStaffingSystem
        .getSchedule(
          restaurant.id
        );

    assert.equal(
      schedule.length,
      1
    );
  }
);
