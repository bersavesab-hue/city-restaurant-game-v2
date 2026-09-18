import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { financeSystem, FINANCE_CATEGORY } from "./FinanceSystem.js";
import { employeeSystem } from "./EmployeeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";
import {
  EMPLOYEE_CAREER_RANKS,
  EMPLOYEE_TRAINING_PROGRAMS
} from "../data/employeeCareer.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function requireRank(rankId) {
  const rank = EMPLOYEE_CAREER_RANKS.find(item => item.id === rankId);

  if (!rank) {
    throw new Error(`Unknown employee career rank "${rankId}"`);
  }

  return rank;
}

function requireTraining(programId) {
  const program = EMPLOYEE_TRAINING_PROGRAMS[programId];

  if (!program) {
    throw new Error(`Unknown training program "${programId}"`);
  }

  return program;
}

class EmployeeCareerSystem {
  getRank(employeeOrId) {
    const employee = typeof employeeOrId === "string"
      ? employeeSystem.get(employeeOrId)
      : employeeOrId;

    return structuredClone(
      requireRank(employee.careerRankId ?? "apprentice")
    );
  }

  getNextRank(employeeOrId) {
    const current = this.getRank(employeeOrId);
    const next = EMPLOYEE_CAREER_RANKS.find(
      item => item.order === current.order + 1
    );

    return next ? structuredClone(next) : null;
  }

  getRecommendedSalary(employeeOrId, rankId = null) {
    const employee = typeof employeeOrId === "string"
      ? employeeSystem.get(employeeOrId)
      : employeeOrId;
    const role = employeeSystem.getRole(employee.roleId);
    const rank = rankId
      ? requireRank(rankId)
      : this.getRank(employee);

    const marketSalary =
      economicBaselineSystem
        .getLaborReference(
          employee.roleId
        )
        ?.monthlySalary ??
      role.baseSalary;

    return Math.round(
      marketSalary *
      rank.salaryMultiplier
    );
  }

  getSalarySatisfaction(employeeOrId) {
    const employee = typeof employeeOrId === "string"
      ? employeeSystem.get(employeeOrId)
      : employeeOrId;
    const recommended = this.getRecommendedSalary(employee);
    const ratio = employee.salary / Math.max(1, recommended);
    const score = clamp(
      Math.round(55 + (ratio - 1) * 150),
      0,
      100
    );

    return {
      score,
      recommended,
      actual: employee.salary,
      ratio: Number(ratio.toFixed(3)),
      state:
        score >= 80
          ? "satisfied"
          : score >= 55
            ? "stable"
            : score >= 35
              ? "unhappy"
              : "critical"
    };
  }

  getPromotionStatus(employeeId) {
    const employee = employeeSystem.get(employeeId);
    const current = this.getRank(employee);
    const next = this.getNextRank(employee);
    const role = employeeSystem.getRole(employee.roleId);
    const primarySkill = employee.skills?.[role.primarySkill] ?? 0;

    if (!next) {
      return {
        employeeId,
        current,
        next: null,
        eligible: false,
        maxRank: true,
        requirements: []
      };
    }

    const requirements = [
      {
        id: "experience",
        label: "经验",
        current: employee.experience ?? 0,
        required: next.minExperience,
        met: (employee.experience ?? 0) >= next.minExperience
      },
      {
        id: "workMinutes",
        label: "工作时长",
        current: employee.totalWorkMinutes ?? 0,
        required: next.minWorkMinutes,
        met: (employee.totalWorkMinutes ?? 0) >= next.minWorkMinutes
      },
      {
        id: "primarySkill",
        label: "岗位主技能",
        current: primarySkill,
        required: next.minPrimarySkill,
        met: primarySkill >= next.minPrimarySkill
      },
      {
        id: "loyalty",
        label: "忠诚度",
        current: employee.loyalty ?? 50,
        required: next.minLoyalty,
        met: (employee.loyalty ?? 50) >= next.minLoyalty
      }
    ];

    return {
      employeeId,
      current,
      next,
      eligible: requirements.every(item => item.met),
      maxRank: false,
      requirements,
      recommendedSalaryAfterPromotion:
        this.getRecommendedSalary(employee, next.id)
    };
  }

  promote(employeeId) {
    const employee = employeeSystem.get(employeeId);
    const status = this.getPromotionStatus(employeeId);

    if (!status.next) {
      throw new Error("Employee is already at the highest career rank");
    }

    if (!status.eligible) {
      const missing = status.requirements
        .filter(item => !item.met)
        .map(item => item.label)
        .join("、");
      throw new Error(`Promotion requirements not met: ${missing}`);
    }

    const salary = Math.max(
      employee.salary,
      status.recommendedSalaryAfterPromotion
    );
    const updated = entitySystem.update("employee", employeeId, {
      careerRankId: status.next.id,
      careerRankOrder: status.next.order,
      promotionCount: (employee.promotionCount ?? 0) + 1,
      salary,
      mood: clamp((employee.mood ?? 70) + 8, 0, 100),
      loyalty: clamp((employee.loyalty ?? 50) + 5, 0, 100)
    });

    eventBus.emit("employee:promoted", {
      employeeId,
      restaurantId: employee.restaurantId,
      oldRank: status.current.id,
      newRank: status.next.id,
      salary
    });

    return updated;
  }

  getTrainingPrograms(employeeId) {
    const employee = employeeSystem.get(employeeId);
    const currentRank = this.getRank(employee);

    return Object.values(EMPLOYEE_TRAINING_PROGRAMS).map(program => {
      const minRank = requireRank(program.minRank);
      return {
        ...structuredClone(program),
        unlocked: currentRank.order >= minRank.order
      };
    });
  }

  train(employeeId, programId) {
    const employee = employeeSystem.get(employeeId);
    const program = requireTraining(programId);
    const currentRank = this.getRank(employee);
    const minRank = requireRank(program.minRank);

    if (currentRank.order < minRank.order) {
      throw new Error(`Training requires rank ${minRank.name}`);
    }

    if (employee.fatigue >= 90) {
      throw new Error("Employee is too fatigued for training");
    }

    financeSystem.expense(
      employee.restaurantId,
      program.cost,
      FINANCE_CATEGORY.OTHER,
      `员工培训 ${employee.name} · ${program.name}`
    );

    const role = employeeSystem.getRole(employee.roleId);
    const skills = { ...(employee.skills ?? {}) };
    const skillProfile = role.skillProfile ?? [role.primarySkill];

    for (const skill of skillProfile) {
      const gain = skill === role.primarySkill
        ? program.primarySkillGain
        : program.secondarySkillGain;
      skills[skill] = clamp((skills[skill] ?? 0) + gain, 0, 100);
    }

    const updated = entitySystem.update("employee", employeeId, {
      experience: (employee.experience ?? 0) + program.experience,
      level: Math.floor(((employee.experience ?? 0) + program.experience) / 1000) + 1,
      skills,
      fatigue: clamp((employee.fatigue ?? 0) + program.fatigueGain, 0, 100),
      mood: clamp((employee.mood ?? 70) + program.moodGain, 0, 100),
      loyalty: clamp((employee.loyalty ?? 50) + program.loyaltyGain, 0, 100),
      trainingCount: (employee.trainingCount ?? 0) + 1
    });

    eventBus.emit("employee:trained", {
      employeeId,
      restaurantId: employee.restaurantId,
      programId,
      cost: program.cost
    });

    return {
      employee: updated,
      program: structuredClone(program),
      promotion: this.getPromotionStatus(employeeId)
    };
  }

  getProfile(employeeId) {
    const employee = employeeSystem.get(employeeId);
    const role = employeeSystem.getRole(employee.roleId);

    return {
      employee: structuredClone(employee),
      role,
      rank: this.getRank(employee),
      nextRank: this.getNextRank(employee),
      promotion: this.getPromotionStatus(employeeId),
      salarySatisfaction: this.getSalarySatisfaction(employee),
      trainingPrograms: this.getTrainingPrograms(employeeId),
      state: {
        fatigue: employee.fatigue ?? 0,
        mood: employee.mood ?? 70,
        loyalty: employee.loyalty ?? 50,
        salary: employee.salary,
        primarySkill: employee.skills?.[role.primarySkill] ?? 0
      }
    };
  }
}

export const employeeCareerSystem = new EmployeeCareerSystem();
export { EmployeeCareerSystem };
