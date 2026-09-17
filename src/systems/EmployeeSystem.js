import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";
import { EMPLOYEE_ROLES } from "../data/employeeRoles.js";

const EMPLOYEE_STATUS = Object.freeze({
  ACTIVE: "active",
  RESTING: "resting",
  OFF_DUTY: "off_duty",
  FIRED: "fired"
});

function requireRestaurant(restaurantId) {
  const restaurant = entitySystem.get("restaurant", restaurantId);

  if (!restaurant) {
    throw new Error(`Restaurant "${restaurantId}" does not exist`);
  }

  return restaurant;
}

function requireEmployee(employeeId) {
  const employee = entitySystem.get("employee", employeeId);

  if (!employee) {
    throw new Error(`Employee "${employeeId}" does not exist`);
  }

  return employee;
}

function requireRole(roleId) {
  const role = EMPLOYEE_ROLES[roleId];

  if (!role) {
    throw new Error(`Unknown employee role "${roleId}"`);
  }

  return role;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildInitialSkills(role) {
  const skills = {};
  const profile = role.skillProfile ?? [role.primarySkill];

  for (const skill of profile) {
    skills[skill] = skill === role.primarySkill
      ? randomSystem.int(20, 40)
      : randomSystem.int(10, 28);
  }

  return skills;
}

class EmployeeSystem {
  listByRestaurant(restaurantId, { includeFired = false } = {}) {
    requireRestaurant(restaurantId);

    return entitySystem
      .list("employee")
      .filter(employee => employee.restaurantId === restaurantId)
      .filter(
        employee =>
          includeFired || employee.status !== EMPLOYEE_STATUS.FIRED
      );
  }

  countByRestaurant(restaurantId) {
    return this.listByRestaurant(restaurantId).length;
  }

  hire({ restaurantId, name, roleId, salary = null }) {
    requireRestaurant(restaurantId);

    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError("Employee name must be a non-empty string");
    }

    const role = requireRole(roleId);
    const limits = storeProgressSystem.getLimits(restaurantId);
    const currentCount = this.countByRestaurant(restaurantId);

    if (currentCount >= limits.employees) {
      throw new Error(`Employee limit reached: ${limits.employees}`);
    }

    const finalSalary = salary ?? role.baseSalary;

    if (!Number.isInteger(finalSalary) || finalSalary <= 0) {
      throw new RangeError("Salary must be a positive integer");
    }

    const employee = entitySystem.create("employee", {
      restaurantId,
      name: name.trim(),
      roleId: role.id,
      status: EMPLOYEE_STATUS.ACTIVE,
      level: 1,
      experience: 0,
      careerRankId: "apprentice",
      careerRankOrder: 0,
      promotionCount: 0,
      trainingCount: 0,
      salary: finalSalary,
      fatigue: 0,
      mood: 70,
      loyalty: 50,
      skills: buildInitialSkills(role),
      totalWorkMinutes: 0,
      hiredAt: Date.now(),
      firedAt: null
    });

    eventBus.emit("employee:hired", {
      restaurantId,
      employee: structuredClone(employee)
    });

    return employee;
  }

  get(employeeId) {
    return requireEmployee(employeeId);
  }

  fire(employeeId) {
    const employee = requireEmployee(employeeId);

    if (employee.status === EMPLOYEE_STATUS.FIRED) {
      return employee;
    }

    const updated = entitySystem.update("employee", employeeId, {
      status: EMPLOYEE_STATUS.FIRED,
      firedAt: Date.now()
    });

    eventBus.emit("employee:fired", {
      restaurantId: employee.restaurantId,
      employeeId
    });

    return updated;
  }

  setSalary(employeeId, salary) {
    if (!Number.isInteger(salary) || salary <= 0) {
      throw new RangeError("Salary must be a positive integer");
    }

    return entitySystem.update("employee", employeeId, { salary });
  }

  addExperience(employeeId, amount) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new RangeError("Experience must be a positive integer");
    }

    const employee = requireEmployee(employeeId);
    const experience = employee.experience + amount;
    const level = Math.floor(experience / 1000) + 1;

    const updated = entitySystem.update("employee", employeeId, {
      experience,
      level
    });

    if (level > employee.level) {
      eventBus.emit("employee:levelUp", {
        employeeId,
        oldLevel: employee.level,
        newLevel: level
      });
    }

    return updated;
  }

  changeFatigue(employeeId, amount) {
    const employee = requireEmployee(employeeId);

    return entitySystem.update("employee", employeeId, {
      fatigue: clamp(employee.fatigue + amount, 0, 100)
    });
  }

  changeMood(employeeId, amount) {
    const employee = requireEmployee(employeeId);

    return entitySystem.update("employee", employeeId, {
      mood: clamp(employee.mood + amount, 0, 100)
    });
  }

  changeLoyalty(employeeId, amount) {
    const employee = requireEmployee(employeeId);

    return entitySystem.update("employee", employeeId, {
      loyalty: clamp((employee.loyalty ?? 50) + amount, 0, 100)
    });
  }

  changeSkill(employeeId, skill, amount) {
    if (typeof skill !== "string" || skill.trim() === "") {
      throw new TypeError("Skill must be a non-empty string");
    }

    const employee = requireEmployee(employeeId);
    const skills = { ...employee.skills };

    skills[skill] = clamp((skills[skill] ?? 0) + amount, 0, 100);

    return entitySystem.update("employee", employeeId, { skills });
  }

  getPayroll(restaurantId) {
    return this.listByRestaurant(restaurantId).reduce(
      (total, employee) => total + employee.salary,
      0
    );
  }

  getRole(roleId) {
    return structuredClone(requireRole(roleId));
  }

  getRoles() {
    return Object.values(EMPLOYEE_ROLES).map(role => structuredClone(role));
  }
}

export const employeeSystem = new EmployeeSystem();

export {
  EmployeeSystem,
  EMPLOYEE_STATUS
};
