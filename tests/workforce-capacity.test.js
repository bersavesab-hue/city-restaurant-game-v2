import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  workforceCapacitySystem
} from "../src/systems/WorkforceCapacitySystem.js";

import {
  serviceCapacitySystem
} from "../src/systems/ServiceCapacitySystem.js";

import {
  workforceCapacityPageSystem
} from "../src/ui/pages/workforce-capacity/WorkforceCapacityPageSystem.js";

import {
  WorkforceCapacityView
} from "../src/ui/pages/workforce-capacity/WorkforceCapacityView.js";

function createEmployee(
  restaurantId,
  {
    name,
    roleId,
    skills,
    fatigue = 0,
    mood = 70
  }
) {
  return entitySystem.create(
    "employee",
    {
      restaurantId,
      name,
      roleId,

      status: "active",

      salary: 3000,

      fatigue,
      mood,
      loyalty: 60,

      level: 1,
      experience: 0,

      skills,

      totalWorkMinutes: 0
    }
  );
}

test(
  "员工岗位排班出勤疲劳直接限制厨房前厅和收银产能",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "员工产能测试店"
      });

    serviceCapacitySystem
      .configure(
        restaurant.id,
        {
          seats: 100,
          tables: 20,

          averageMealMinutes:
            60,

          kitchenStations:
            4,

          kitchenPortionsPerHour:
            80,

          serviceGuestsPerHour:
            80,

          queueToleranceMinutes:
            10,

          maxQueueGuests:
            50
        }
      );

    const chef =
      createEmployee(
        restaurant.id,
        {
          name: "测试厨师",
          roleId: "chef",
          skills: {
            cooking: 80
          }
        }
      );

    createEmployee(
      restaurant.id,
      {
        name: "测试帮工",
        roleId:
          "kitchen_assistant",
        skills: {
          prep: 70
        }
      }
    );

    createEmployee(
      restaurant.id,
      {
        name: "测试服务员",
        roleId: "server",
        skills: {
          service: 80
        }
      }
    );

    const cashier =
      createEmployee(
        restaurant.id,
        {
          name: "测试收银员",
          roleId: "cashier",
          skills: {
            checkout: 80
          }
        }
      );

    let capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.ok(
      capacity.kitchenGuests <
      80
    );

    assert.ok(
      capacity.serviceGuests <
      80
    );

    assert.ok(
      capacity.checkoutGuests >
      1
    );

    const checkoutBefore =
      capacity.checkoutGuests;

    workforceCapacitySystem
      .markAttendance({
        restaurantId:
          restaurant.id,

        employeeId:
          cashier.id,

        attendanceStatus:
          "absent"
      });

    capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.equal(
      capacity.checkoutGuests,
      1
    );

    assert.ok(
      capacity.checkoutGuests <
      checkoutBefore
    );

    workforceCapacitySystem
      .markAttendance({
        restaurantId:
          restaurant.id,

        employeeId:
          cashier.id,

        attendanceStatus:
          "present"
      });

    entitySystem.update(
      "employee",
      chef.id,
      {
        fatigue: 96
      }
    );

    const tiredCapacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.ok(
      tiredCapacity
        .workforce
        .exhaustedEmployees
        .some(
          item =>
            item.employeeId ===
            chef.id
        )
    );

    const weekday =
      workforceCapacitySystem
        .getWeekday(
          workforceCapacitySystem
            .getCurrentDay()
        );

    workforceCapacitySystem
      .setShift({
        restaurantId:
          restaurant.id,

        employeeId:
          cashier.id,

        weekday,

        startHour: 8,
        endHour: 23
      });

    const page =
      workforceCapacityPageSystem
        .getPage(
          restaurant.id
        );

    assert.ok(
      page.workforce
        .shifts.length >=
      1
    );

    const view =
      new WorkforceCapacityView();

    const html =
      view.renderMarkup(
        page
      );

    assert.match(
      html,
      /员工产能/
    );

    assert.match(
      html,
      /厨房产能/
    );

    assert.match(
      html,
      /前厅产能/
    );

    assert.match(
      html,
      /收银产能/
    );

    assert.match(
      html,
      /测试/
    );
  }
);


test(
  "真实员工体系中缺失厨师或服务员时对应产能必须归零",
  () => {
    gameState.reset();

    const restaurant =
      restaurantSystem.create({
        name:
          "岗位缺失产能测试店"
      });

    serviceCapacitySystem
      .configure(
        restaurant.id,
        {
          seats: 30,
          tables: 10,
          averageMealMinutes: 60,
          kitchenStations: 2,
          kitchenPortionsPerHour: 30,
          serviceGuestsPerHour: 30,
          queueToleranceMinutes: 10,
          maxQueueGuests: 20
        }
      );

    const chef =
      createEmployee(
        restaurant.id,
        {
          name: "仅有厨师",
          roleId: "chef",
          skills: {
            cooking: 70
          }
        }
      );

    let capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.ok(
      capacity.kitchenGuests >
      0
    );

    assert.equal(
      capacity.serviceGuests,
      0,
      "没有服务员时不应凭空产生堂食服务能力"
    );

    assert.equal(
      capacity.checkoutGuests,
      1,
      "没有收银员时保留老板临时收银1单/小时"
    );

    const server =
      createEmployee(
        restaurant.id,
        {
          name: "后聘服务员",
          roleId: "server",
          skills: {
            service: 70
          }
        }
      );

    capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.ok(
      capacity.serviceGuests >
      0
    );

    entitySystem.update(
      "employee",
      chef.id,
      {
        fatigue: 96
      }
    );

    capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.equal(
      capacity.kitchenGuests,
      0,
      "厨师不可工作时不应凭空产生厨房能力"
    );

    assert.ok(
      capacity.serviceGuests >
      0
    );

    entitySystem.update(
      "employee",
      server.id,
      {
        fatigue: 96
      }
    );

    capacity =
      serviceCapacitySystem
        .getHourlyCapacity(
          restaurant.id
        );

    assert.equal(
      capacity.serviceGuests,
      0
    );

    assert.equal(
      capacity.checkoutGuests,
      1
    );
  }
);
