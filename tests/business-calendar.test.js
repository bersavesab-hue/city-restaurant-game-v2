import test from "node:test";
import assert from "node:assert/strict";

import { app } from "../src/main.js";

const {
  businessCalendarSystem
} = app.systems;

test(
  "经营日历提供稳定的工作日周末和季节规律",
  () => {
    const monday =
      businessCalendarSystem
        .getCalendar(1);

    const saturday =
      businessCalendarSystem
        .getCalendar(6);

    assert.equal(
      monday.weekday,
      "星期一"
    );

    assert.equal(
      monday.isWeekend,
      false
    );

    assert.equal(
      saturday.weekday,
      "星期六"
    );

    assert.equal(
      saturday.isWeekend,
      true
    );

    const officeMonday =
      businessCalendarSystem
        .getDemandMultiplier(
          "office_worker",
          12,
          1
        );

    const officeSaturday =
      businessCalendarSystem
        .getDemandMultiplier(
          "office_worker",
          12,
          6
        );

    assert.ok(
      officeMonday >
      officeSaturday
    );

    const residentMonday =
      businessCalendarSystem
        .getDemandMultiplier(
          "resident",
          19,
          1
        );

    const residentSaturday =
      businessCalendarSystem
        .getDemandMultiplier(
          "resident",
          19,
          6
        );

    assert.ok(
      residentSaturday >
      residentMonday
    );

    const yearTwo =
      businessCalendarSystem
        .getCalendar(361);

    assert.equal(
      yearTwo.year,
      2
    );

    assert.equal(
      yearTwo.month,
      1
    );

    assert.equal(
      yearTwo.dayOfMonth,
      1
    );

    const forecast =
      businessCalendarSystem
        .getForecast(
          7,
          1
        );

    assert.equal(
      forecast.length,
      7
    );
  }
);
