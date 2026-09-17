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
  employeeCareerSystem
} from "./EmployeeCareerSystem.js";


const AVATAR_COUNTS =
  Object.freeze({
    chef: 24,
    server: 30,
    cashier: 16,
    kitchen_assistant: 20,
    cleaner: 16,
    delivery: 18,
    manager: 16
  });


const TRAINING_MILESTONES =
  Object.freeze([
    1,
    3,
    6,
    10,
    15,
    21,
    28,
    36
  ]);


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


function hashString(
  value
) {
  let hash =
    2166136261;

  for (
    let index = 0;
    index <
    String(value).length;
    index += 1
  ) {
    hash ^=
      String(value)
        .charCodeAt(
          index
        );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return hash >>> 0;
}


class EmployeeDynamicsSystem {
  getAvatarId(
    employee
  ) {
    if (
      employee.avatarId
    ) {
      return employee.avatarId;
    }

    const count =
      AVATAR_COUNTS[
        employee.roleId
      ] ??
      16;

    const number =
      hashString(
        `${employee.id}:${employee.roleId}`
      ) %
        count +
      1;

    return (
      `${employee.roleId}_` +
      String(
        number
      ).padStart(
        2,
        "0"
      )
    );
  }


  getAvatarPath(
    employee
  ) {
    const avatarId =
      this.getAvatarId(
        employee
      );

    return (
      "assets/images/ui/employees/" +
      "avatars/" +
      avatarId +
      ".webp"
    );
  }


  calculateSatisfaction(
    employee
  ) {
    const salary =
      employeeCareerSystem
        .getSalarySatisfaction(
          employee
        );

    const mood =
      clamp(
        employee.mood ??
        70,
        0,
        100
      );

    const loyalty =
      clamp(
        employee.loyalty ??
        50,
        0,
        100
      );

    const fatigue =
      clamp(
        employee.fatigue ??
        0,
        0,
        100
      );

    const fatigueComfort =
      100 -
      fatigue;

    const rawScore =
      Math.round(
        salary.score *
          0.35 +
        mood *
          0.25 +
        loyalty *
          0.25 +
        fatigueComfort *
          0.15
      );

    let state =
      "stable";

    let label =
      "稳定";


    if (
      rawScore >=
      85
    ) {
      state =
        "excellent";

      label =
        "非常满意";
    } else if (
      rawScore >=
      70
    ) {
      state =
        "good";

      label =
        "满意";
    } else if (
      rawScore >=
      55
    ) {
      state =
        "stable";

      label =
        "一般";
    } else if (
      rawScore >=
      40
    ) {
      state =
        "warning";

      label =
        "不满";
    } else {
      state =
        "critical";

      label =
        "强烈不满";
    }


    return {
      score:
        clamp(
          rawScore,
          0,
          100
        ),

      state,

      label,

      components: {
        salary:
          salary.score,

        mood,

        loyalty,

        fatigueComfort
      },

      salaryState:
        salary.state,

      recommendedSalary:
        salary.recommended,

      actualSalary:
        salary.actual
    };
  }


  getTrainingProgress(
    employee
  ) {
    const count =
      Math.max(
        0,
        employee.trainingCount ??
        0
      );


    const next =
      TRAINING_MILESTONES
        .find(
          value =>
            value >
            count
        );


    if (!next) {
      return {
        count,

        previousTarget:
          TRAINING_MILESTONES[
            TRAINING_MILESTONES
              .length -
            1
          ],

        nextTarget:
          null,

        percent:
          100,

        complete:
          true,

        label:
          "培训资历充分"
      };
    }


    const previous =
      [
        ...TRAINING_MILESTONES
      ]
        .reverse()
        .find(
          value =>
            value <=
            count
        ) ??
      0;


    const span =
      Math.max(
        1,
        next -
        previous
      );


    const percent =
      Math.round(
        (
          count -
          previous
        ) /
        span *
        100
      );


    return {
      count,

      previousTarget:
        previous,

      nextTarget:
        next,

      percent:
        clamp(
          percent,
          0,
          100
        ),

      complete:
        false,

      label:
        `${count}/${next}次培训`
    };
  }


  ensureEmployeeProfile(
    employeeId
  ) {
    let employee =
      employeeSystem.get(
        employeeId
      );


    const avatarId =
      this.getAvatarId(
        employee
      );


    const satisfaction =
      this.calculateSatisfaction(
        employee
      );


    const day =
      gameState
        .getSection(
          "time"
        )
        ?.day ??
      1;


    const patch = {};


    if (
      !employee.avatarId
    ) {
      patch.avatarId =
        avatarId;
    }


    if (
      !Number.isFinite(
        employee.satisfaction
      )
    ) {
      patch.satisfaction =
        satisfaction.score;

      patch.satisfactionUpdatedDay =
        day;
    }


    if (
      Object.keys(
        patch
      ).length >
      0
    ) {
      employee =
        entitySystem.update(
          "employee",
          employee.id,
          patch
        );
    }


    return employee;
  }


  refreshEmployee(
    employeeId,
    {
      force = false
    } = {}
  ) {
    let employee =
      this.ensureEmployeeProfile(
        employeeId
      );


    const day =
      gameState
        .getSection(
          "time"
        )
        ?.day ??
      1;


    if (
      !force &&
      employee
        .satisfactionUpdatedDay ===
        day
    ) {
      return {
        employee,

        satisfaction:
          this.calculateSatisfaction(
            employee
          ),

        training:
          this.getTrainingProgress(
            employee
          )
      };
    }


    const calculated =
      this.calculateSatisfaction(
        employee
      );


    const previous =
      Number.isFinite(
        employee.satisfaction
      )
        ? employee.satisfaction
        : calculated.score;


    const smoothed =
      clamp(
        Math.round(
          previous *
            0.6 +
          calculated.score *
            0.4
        ),
        0,
        100
      );


    employee =
      entitySystem.update(
        "employee",
        employee.id,
        {
          avatarId:
            employee.avatarId ??
            this.getAvatarId(
              employee
            ),

          satisfaction:
            smoothed,

          satisfactionUpdatedDay:
            day
        }
      );


    return {
      employee,

      satisfaction: {
        ...calculated,

        score:
          smoothed
      },

      training:
        this.getTrainingProgress(
          employee
        )
    };
  }


  refreshRestaurant(
    restaurantId,
    options = {}
  ) {
    return employeeSystem
      .listByRestaurant(
        restaurantId
      )
      .map(
        employee =>
          this.refreshEmployee(
            employee.id,
            options
          )
      );
  }


  getProfile(
    employeeId
  ) {
    const refreshed =
      this.refreshEmployee(
        employeeId
      );


    return {
      employee:
        refreshed.employee,

      avatarId:
        refreshed.employee
          .avatarId,

      avatarPath:
        this.getAvatarPath(
          refreshed.employee
        ),

      satisfaction:
        refreshed.satisfaction,

      training:
        refreshed.training
    };
  }
}


export const employeeDynamicsSystem =
  new EmployeeDynamicsSystem();


export {
  EmployeeDynamicsSystem,
  AVATAR_COUNTS,
  TRAINING_MILESTONES
};
