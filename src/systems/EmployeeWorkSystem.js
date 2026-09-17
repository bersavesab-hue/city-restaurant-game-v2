import { entitySystem } from "../core/EntitySystem.js";

import {
  employeeSystem,
  EMPLOYEE_STATUS
} from "./EmployeeSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { layoutFlowSystem } from "./LayoutFlowSystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class EmployeeWorkSystem {
  listAvailableByRole(restaurantId, roleId) {
    return employeeSystem
      .listByRestaurant(restaurantId)
      .filter(
        employee =>
          employee.roleId === roleId &&
          employee.status === EMPLOYEE_STATUS.ACTIVE &&
          employee.fatigue < 95
      );
  }

  getEffectiveSkill(employee, skillName) {
    const base = employee.skills?.[skillName] ?? 0;
    const moodBonus = (employee.mood - 50) * 0.15;
    const fatiguePenalty = employee.fatigue * 0.35;

    return clamp(
      Math.round(base + moodBonus - fatiguePenalty),
      1,
      100
    );
  }

  getBestChef(restaurantId) {
    const chefs = this.listAvailableByRole(restaurantId, "chef");

    if (chefs.length === 0) {
      return null;
    }

    return chefs
      .map(employee => ({
        employee,
        effectiveSkill: this.getEffectiveSkill(employee, "cooking")
      }))
      .sort((a, b) => b.effectiveSkill - a.effectiveSkill)[0];
  }

  requireChef(restaurantId, employeeId = null) {
    if (employeeId !== null) {
      const employee = employeeSystem.get(employeeId);

      if (
        employee.restaurantId !== restaurantId ||
        employee.roleId !== "chef" ||
        employee.status !== EMPLOYEE_STATUS.ACTIVE ||
        employee.fatigue >= 95
      ) {
        throw new Error("Selected chef is not available");
      }

      return {
        employee,
        effectiveSkill: this.getEffectiveSkill(employee, "cooking")
      };
    }

    const chef = this.getBestChef(restaurantId);

    if (!chef) {
      const error = new Error("No available chef");
      error.code = "NO_CHEF_AVAILABLE";
      throw error;
    }

    return chef;
  }

  getServiceCapacity(restaurantId) {
    const servers = this.listAvailableByRole(restaurantId, "server");

    let baseCapacity;

    if (servers.length === 0) {
      baseCapacity = 1;
    } else {
      baseCapacity = servers.reduce((capacity, employee) => {
        const skill = this.getEffectiveSkill(employee, "service");
        return capacity + 2 + Math.floor(skill / 25);
      }, 0);
    }

    const renovation = renovationSystem.getOperationalModifiers(restaurantId);
    const renovationMultiplier = renovation.active
      ? renovation.serviceEfficiency
      : 1;
    const flow = layoutFlowSystem.getOperationalEffects(restaurantId);
    const serviceCapacity = Math.max(
      1,
      Math.floor(
        baseCapacity * renovationMultiplier * flow.serviceMultiplier
      )
    );

    if (!Number.isFinite(flow.kitchenCapacityPerHour)) {
      return serviceCapacity;
    }

    return Math.max(
      1,
      Math.min(serviceCapacity, flow.kitchenCapacityPerHour)
    );
  }

  getCapacityBreakdown(restaurantId) {
    const renovation = renovationSystem.getOperationalModifiers(restaurantId);
    const flow = layoutFlowSystem.getOperationalEffects(restaurantId);

    return {
      restaurantId,
      effectiveCapacity: this.getServiceCapacity(restaurantId),
      renovation,
      flow
    };
  }

  recordWork(employeeId, minutes) {
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new RangeError("Work minutes must be positive");
    }

    const employee = employeeSystem.get(employeeId);
    const oldWorkMinutes = employee.totalWorkMinutes ?? 0;
    const totalWorkMinutes = oldWorkMinutes + minutes;
    const fatigueGain = Math.max(1, Math.ceil(minutes / 15));
    const fatigue = clamp(employee.fatigue + fatigueGain, 0, 100);
    const mood = fatigue >= 80
      ? clamp(employee.mood - 1, 0, 100)
      : employee.mood;
    const oldExperienceBlocks = Math.floor(oldWorkMinutes / 120);
    const newExperienceBlocks = Math.floor(totalWorkMinutes / 120);
    const experienceGain = Math.max(
      0,
      (newExperienceBlocks - oldExperienceBlocks) * 40
    );
    const oldSkillBlocks = Math.floor(oldWorkMinutes / 240);
    const newSkillBlocks = Math.floor(totalWorkMinutes / 240);
    const skillGain = Math.max(0, newSkillBlocks - oldSkillBlocks);
    const role = employeeSystem.getRole(employee.roleId);
    const skills = { ...(employee.skills ?? {}) };

    if (skillGain > 0) {
      skills[role.primarySkill] = clamp(
        (skills[role.primarySkill] ?? 0) + skillGain,
        0,
        100
      );
    }

    const experience = (employee.experience ?? 0) + experienceGain;

    return entitySystem.update("employee", employeeId, {
      fatigue,
      mood,
      totalWorkMinutes,
      experience,
      level: Math.floor(experience / 1000) + 1,
      skills
    });
  }

  recoverHour(restaurantId) {
    const employees = employeeSystem.listByRestaurant(restaurantId);

    for (const employee of employees) {
      if (employee.status === EMPLOYEE_STATUS.FIRED) {
        continue;
      }

      entitySystem.update("employee", employee.id, {
        fatigue: clamp(employee.fatigue - 6, 0, 100),
        mood: clamp(employee.mood + 1, 0, 100)
      });
    }
  }
}

export const employeeWorkSystem = new EmployeeWorkSystem();

export { EmployeeWorkSystem };
