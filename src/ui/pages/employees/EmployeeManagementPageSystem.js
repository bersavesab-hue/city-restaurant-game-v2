import {
  entitySystem
} from "../../../core/EntitySystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  employeeSystem
} from "../../../systems/EmployeeSystem.js";

import {
  employeeCareerSystem
} from "../../../systems/EmployeeCareerSystem.js";

import {
  employeeDynamicsSystem
} from "../../../systems/EmployeeDynamicsSystem.js";

import {
  staffingRecommendationSystem
} from "../../../systems/StaffingRecommendationSystem.js";

import {
  storeProgressSystem
} from "../../../systems/StoreProgressSystem.js";

import {
  EMPLOYEE_CAREER_RANKS
} from "../../../data/employeeCareer.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


const SKILL_LABELS =
  Object.freeze({
    cooking:
      "烹饪",

    speed:
      "速度",

    quality:
      "品质",

    innovation:
      "创新",

    wasteControl:
      "损耗控制",

    stability:
      "稳定",

    service:
      "服务",

    servingSpeed:
      "上菜速度",

    guestCare:
      "顾客照顾",

    tableTurn:
      "翻台",

    peakPressure:
      "高峰应对",

    checkout:
      "收银",

    accuracy:
      "准确率",

    upselling:
      "推荐销售",

    compliance:
      "规范",

    prep:
      "备餐",

    kitchenSpeed:
      "后厨速度",

    cleanliness:
      "整洁",

    cleaning:
      "保洁",

    hygiene:
      "卫生",

    efficiency:
      "效率",

    inspection:
      "巡检",

    delivery:
      "配送",

    route:
      "路线",

    punctuality:
      "准时",

    care:
      "货品保护",

    management:
      "管理",

    scheduling:
      "排班",

    costControl:
      "成本控制",

    morale:
      "团队士气",

    promotionExecution:
      "晋升执行"
  });


function safeBalance(
  restaurantId
) {
  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


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


function average(
  values
) {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  return Math.round(
    values.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) /
    values.length
  );
}


class EmployeeManagementPageSystem {
  getStatus(
    employee
  ) {
    if (
      employee.fatigue >=
      90
    ) {
      return {
        label:
          "高疲劳",

        tone:
          "danger"
      };
    }

    if (
      employee.status ===
      "resting"
    ) {
      return {
        label:
          "休息",

        tone:
          "warning"
      };
    }

    if (
      employee.status ===
      "off_duty"
    ) {
      return {
        label:
          "下班",

        tone:
          "neutral"
      };
    }

    return {
      label:
        "在岗",

      tone:
        "success"
    };
  }


  getShift(
    employee
  ) {
    const shifts =
      entitySystem
        .list(
          "workforce_shift"
        )
        .filter(
          item =>
            item.employeeId ===
            employee.id
        );


    const latest =
      shifts.at(
        -1
      );


    if (latest) {
      return {
        label:
          latest.label ??
          latest.shiftName ??
          "已排班",

        startHour:
          latest.startHour ??
          null,

        endHour:
          latest.endHour ??
          null
      };
    }


    return {
      label:
        employee.status ===
        "off_duty"
          ? "当前休息"
          : "常规班",

      startHour:
        null,

      endHour:
        null
    };
  }


  getPromotionReadiness(
    promotion
  ) {
    if (
      promotion.maxRank
    ) {
      return 100;
    }

    if (
      !promotion
        .requirements
        ?.length
    ) {
      return 0;
    }


    const values =
      promotion
        .requirements
        .map(
          item => {
            if (
              item.required <=
              0
            ) {
              return 100;
            }

            return clamp(
              Math.round(
                item.current /
                item.required *
                100
              ),
              0,
              100
            );
          }
        );


    return average(
      values
    );
  }


  getEmployeeView(
    employee
  ) {
    const dynamic =
      employeeDynamicsSystem
        .getProfile(
          employee.id
        );


    const current =
      dynamic.employee;


    const career =
      employeeCareerSystem
        .getProfile(
          current.id
        );


    const role =
      career.role;


    const skills =
      Object.entries(
        current.skills ??
        {}
      )
        .map(
          (
            [
              id,
              value
            ]
          ) => ({
            id,

            label:
              SKILL_LABELS[id] ??
              id,

            value
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.value -
            a.value
        );


    const levelProgress =
      (
        current.experience ??
        0
      ) %
      1000 /
      10;


    const satisfaction =
      dynamic.satisfaction;


    return {
      id:
        current.id,

      name:
        current.name,

      roleId:
        current.roleId,

      roleName:
        role.name,

      avatarId:
        dynamic.avatarId,

      avatar:
        dynamic.avatarPath,

      level:
        current.level,

      levelProgress:
        Math.round(
          levelProgress
        ),

      experience:
        current.experience ??
        0,

      rank:
        career.rank,

      nextRank:
        career.nextRank,

      promotion:
        career.promotion,

      promotionReadiness:
        this.getPromotionReadiness(
          career.promotion
        ),

      salary:
        current.salary,

      salarySatisfaction:
        career
          .salarySatisfaction,

      satisfaction,

      satisfactionScore:
        satisfaction.score,

      mood:
        current.mood ??
        70,

      loyalty:
        current.loyalty ??
        50,

      fatigue:
        current.fatigue ??
        0,

      status:
        this.getStatus(
          current
        ),

      shift:
        this.getShift(
          current
        ),

      skills,

      topSkills:
        skills.slice(
          0,
          2
        ),

      primarySkill: {
        id:
          role.primarySkill,

        label:
          SKILL_LABELS[
            role.primarySkill
          ] ??
          role.primarySkill,

        value:
          current.skills
            ?.[
              role.primarySkill
            ] ??
          0
      },

      training:
        dynamic.training,

      trainingCount:
        current.trainingCount ??
        0,

      totalWorkMinutes:
        current.totalWorkMinutes ??
        0
    };
  }


  getScheduleSummary(
    employees
  ) {
    return {
      active:
        employees.filter(
          item =>
            item.status.label ===
            "在岗"
        ).length,

      resting:
        employees.filter(
          item =>
            item.status.label ===
            "休息"
        ).length,

      offDuty:
        employees.filter(
          item =>
            item.status.label ===
            "下班"
        ).length,

      fatigued:
        employees.filter(
          item =>
            item.fatigue >=
            80
        ).length
    };
  }







  getRecruitmentPage(
    restaurantId
  ) {
    const page =
      this.getPage(
        restaurantId
      );

    const staffingRoles =
      page.staffing
        ?.roles ??
      [];

    const roles =
      employeeSystem
        .getRoles()
        .map(
          role => {
            const plan =
              staffingRoles
                .find(
                  item =>
                    item.roleId ===
                    role.id
                ) ??
              null;

            return {
              ...role,

              current:
                plan?.current ??
                0,

              recommended:
                plan?.recommended ??
                0,

              shortage:
                plan?.shortage ??
                0,

              surplus:
                plan?.surplus ??
                0,

              staffingState:
                plan?.state ??
                "balanced",

              staffingReason:
                plan?.reason ??
                "",

              baseSalary:
                Number(
                  role.baseSalary
                ) ||
                0,

              salaryReference:
                role.salaryReference ??
                null
            };
          }
        );

    const recommendations =
      staffingRoles.map(
        item => ({
          ...item,

          message:
            item.shortage > 0
              ? `${item.name}建议补充${item.shortage}人`
              : item.surplus > 0
                ? `${item.name}当前富余${item.surplus}人`
                : `${item.name}当前配置合理`
        })
      );

    const salaryReferences =
      roles.map(
        role => ({
          roleId:
            role.id,

          name:
            role.name,

          baseSalary:
            role.baseSalary,

          salaryReference:
            role.salaryReference
        })
      );

    const vacancies =
      page.vacancies ??
      [];

    const warnings =
      vacancies.map(
        item => ({
          roleId:
            item.roleId,

          label:
            item.name,

          shortage:
            item.shortage,

          message:
            `${item.name}建议补充${item.shortage}人`
        })
      );

    return {
      pageId:
        "employee_recruitment",

      restaurantId,

      topBar:
        page.topBar,

      noticeTicker:
        page.noticeTicker,

      employees:
        page.employees ??
        [],

      currentEmployees:
        page.employees ??
        [],

      currentCount:
        page.employees
          ?.length ??
        0,

      staffCap:
        page.staffCap ??
        0,

      availableSlots:
        Math.max(
          0,
          (
            page.staffCap ??
            0
          ) -
          (
            page.employees
              ?.length ??
            0
          )
        ),

      payroll:
        employeeSystem
          .getPayroll(
            restaurantId
          ),

      staffing:
        page.staffing,

      staffingRoles,

      vacancies,

      roles,

      roleOptions:
        roles,

      positions:
        roles,

      items:
        roles,

      rows:
        roles,

      candidates:
        roles,

      recommendations,

      hiringRecommendations:
        recommendations,

      staffingRecommendations:
        recommendations,

      salaryReferences,

      salaryBenchmarks:
        salaryReferences,

      warnings,

      bottomNavigation:
        page.bottomNavigation ??
        []
    };
  }








  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );


    employeeDynamicsSystem
      .refreshRestaurant(
        restaurantId
      );


    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        )
        .map(
          employee =>
            this.getEmployeeView(
              employee
            )
        );


    const staffing =
      staffingRecommendationSystem
        .getRecommendation(
          restaurantId
        );


    const satisfactionAverage =
      average(
        employees.map(
          employee =>
            employee
              .satisfactionScore
        )
      );


    const payroll =
      employeeSystem
        .getPayroll(
          restaurantId
        );


    const scheduleSummary =
      this.getScheduleSummary(
        employees
      );


    const vacancies =
      staffing.roles
        .filter(
          item =>
            item.shortage >
            0
        );


    const promotionCandidates =
      employees
        .filter(
          employee =>
            !employee
              .promotion
              .maxRank
        )
        .sort(
          (
            a,
            b
          ) =>
            b
              .promotionReadiness -
            a
              .promotionReadiness
        )
        .slice(
          0,
          5
        );


    const trainingEmployees =
      [
        ...employees
      ]
        .sort(
          (
            a,
            b
          ) =>
            b.training.percent -
            a.training.percent
        )
        .slice(
          0,
          5
        );


    const limits =
      storeProgressSystem
        .getLimits(
          restaurantId
        );


    const time =
      gameState.getSection(
        "time"
      );


    const runtime =
      gameState.getSection(
        "runtime"
      );


    const notices = [];


    if (
      staffing
        .totalShortage >
      0
    ) {
      notices.push({
        id:
          "staff_shortage",

        type:
          "warning",

        title:
          "人员缺口",

        message:
          `按当前门店经营规模建议补充${staffing.totalShortage}名员工`,

        priority:
          100,

        action:
          "employees"
      });
    }


    const unhappy =
      employees.filter(
        employee =>
          employee
            .satisfactionScore <
          50
      );


    if (
      unhappy.length >
      0
    ) {
      notices.push({
        id:
          "employee_satisfaction",

        type:
          "warning",

        title:
          "员工满意度",

        message:
          `${unhappy.length}名员工满意度低于50，需要处理工资、疲劳或士气问题`,

        priority:
          80,

        action:
          "employees"
      });
    }


    return {
      pageId:
        "employees",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance:
            safeBalance(
              restaurantId
            ),

          storeLevel:
            restaurant.level,

          reputation:
            restaurant.reputation,

          time,

          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      metrics: [
        {
          label:
            "员工总数",

          value:
            `${employees.length}/${limits.employees}`,

          tone:
            "primary"
        },

        {
          label:
            "当前在岗",

          value:
            `${scheduleSummary.active}人`,

          tone:
            "success"
        },

        {
          label:
            "平均满意度",

          value:
            `${satisfactionAverage}`,

          suffix:
            "/100",

          tone:
            satisfactionAverage >=
            70
              ? "success"
              : satisfactionAverage >=
                50
                ? "warning"
                : "danger"
        },

        {
          label:
            "月工资",

          value:
            `¥${payroll.toLocaleString("zh-CN")}`,

          tone:
            "primary"
        },

        {
          label:
            "建议缺员",

          value:
            `${staffing.totalShortage}人`,

          tone:
            staffing.totalShortage ===
            0
              ? "success"
              : "warning"
        }
      ],

      employees,

      scheduleSummary,

      staffing,

      vacancies,

      trainingEmployees,

      promotionCandidates,

      careerRanks:
        [
          ...EMPLOYEE_CAREER_RANKS
        ],

      staffCap:
        limits.employees,

      bottomNavigation: [
        {
          label:
            "城市",

          target:
            "city",

          icon:
            "city"
        },

        {
          label:
            "门店",

          target:
            "restaurant",

          icon:
            "store"
        },

        {
          label:
            "经营",

          target:
            "operations",

          icon:
            "operations"
        },

        {
          label:
            "员工",

          target:
            "employees",

          icon:
            "employees",

          active:
            true
        },

        {
          label:
            "更多",

          target:
            "more",

          icon:
            "more"
        }
      ]
    };
  }
}


export const employeeManagementPageSystem =
  new EmployeeManagementPageSystem();


export {
  EmployeeManagementPageSystem
};
