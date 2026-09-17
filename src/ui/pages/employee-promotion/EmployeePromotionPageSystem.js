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
  employeeSystem
} from "../../../systems/EmployeeSystem.js";

import {
  employeeCareerSystem
} from "../../../systems/EmployeeCareerSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


const ROLE_TARGETS =
  Object.freeze({
    chef: 2,
    server: 3,
    cashier: 1,
    kitchen_assistant: 1,
    manager: 1
  });


const REQUIREMENT_LABELS =
  Object.freeze({
    experience:
      "技能/经验",

    workMinutes:
      "工作年限",

    primarySkill:
      "技能等级",

    loyalty:
      "工作忠诚度"
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


function safeList(
  type
) {
  try {
    return entitySystem.list(
      type
    );
  } catch {
    return [];
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


class EmployeePromotionPageSystem {
  getReadiness(
    promotion
  ) {
    if (
      promotion.maxRank
    ) {
      return 100;
    }

    if (
      !promotion.requirements
        .length
    ) {
      return 0;
    }

    const total =
      promotion.requirements
        .reduce(
          (
            sum,
            item
          ) => {
            if (
              item.required <= 0
            ) {
              return sum + 1;
            }

            return (
              sum +
              clamp(
                item.current /
                item.required,
                0,
                1
              )
            );
          },
          0
        );

    return Math.round(
      total /
      promotion.requirements
        .length *
      100
    );
  }


  getMissingTraining(
    employee,
    promotion
  ) {
    if (
      promotion.maxRank
    ) {
      return [];
    }

    const missing =
      promotion.requirements
        .filter(
          item =>
            !item.met
        );

    return missing.map(
      item => ({
        id:
          item.id,

        label:
          REQUIREMENT_LABELS[
            item.id
          ] ??
          item.label,

        current:
          item.current,

        required:
          item.required,

        gap:
          Math.max(
            0,
            item.required -
            item.current
          ),

        canTrain:
          [
            "experience",
            "primarySkill"
          ].includes(
            item.id
          )
      })
    );
  }


  getCandidate(
    employee,
    index
  ) {
    const role =
      employeeSystem.getRole(
        employee.roleId
      );

    const profile =
      employeeCareerSystem
        .getProfile(
          employee.id
        );

    const promotion =
      profile.promotion;

    return {
      id:
        employee.id,

      name:
        employee.name,

      roleId:
        employee.roleId,

      roleName:
        role.name,

      level:
        employee.level,

      mood:
        employee.mood ??
        70,

      loyalty:
        employee.loyalty ??
        50,

      experience:
        employee.experience ??
        0,

      salary:
        employee.salary,

      currentRank:
        profile.rank,

      nextRank:
        profile.nextRank,

      promotion,

      readiness:
        this.getReadiness(
          promotion
        ),

      eligible:
        Boolean(
          promotion.eligible
        ),

      maxRank:
        Boolean(
          promotion.maxRank
        ),

      requirements:
        promotion.requirements
          .map(
            item => ({
              ...item,

              displayLabel:
                REQUIREMENT_LABELS[
                  item.id
                ] ??
                item.label
            })
          ),

      missingTraining:
        this.getMissingTraining(
          employee,
          promotion
        ),

      recommendedSalary:
        promotion
          .recommendedSalaryAfterPromotion ??
        employee.salary,

      avatar:
        `assets/images/ui/employees/${employee.roleId}-${(index % 3) + 1}.webp`
    };
  }


  getVacancies(
    employees
  ) {
    const roleCounts = {};

    for (
      const employee
      of employees
    ) {
      roleCounts[
        employee.roleId
      ] =
        (
          roleCounts[
            employee.roleId
          ] ??
          0
        ) +
        1;
    }

    return Object
      .entries(
        ROLE_TARGETS
      )
      .map(
        (
          [
            roleId,
            target
          ]
        ) => {
          const role =
            employeeSystem
              .getRole(
                roleId
              );

          const current =
            roleCounts[
              roleId
            ] ??
            0;

          return {
            roleId,

            roleName:
              role.name,

            current,

            target,

            vacancy:
              Math.max(
                0,
                target -
                current
              )
          };
        }
      );
  }


  getPromotionRecords(
    restaurantId
  ) {
    const records =
      safeList(
        "employee_promotion_record"
      )
        .filter(
          item =>
            item.restaurantId ===
            restaurantId
        )
        .sort(
          (
            a,
            b
          ) =>
            (
              b.day ??
              0
            ) -
            (
              a.day ??
              0
            )
        );

    if (
      records.length >
      0
    ) {
      return records
        .slice(
          0,
          6
        );
    }

    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    return employees
      .filter(
        item =>
          (
            item.promotionCount ??
            0
          ) >
          0
      )
      .map(
        employee => ({
          id:
            `legacy_${employee.id}`,

          restaurantId,

          employeeId:
            employee.id,

          employeeName:
            employee.name,

          roleName:
            employeeSystem
              .getRole(
                employee.roleId
              ).name,

          newRankName:
            employeeCareerSystem
              .getRank(
                employee
              ).name,

          promotionCount:
            employee
              .promotionCount,

          day:
            null
        })
      )
      .slice(
        0,
        6
      );
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    const candidates =
      employees
        .map(
          (
            employee,
            index
          ) =>
            this.getCandidate(
              employee,
              index
            )
        )
        .filter(
          item =>
            !item.maxRank
        )
        .sort(
          (
            a,
            b
          ) => {
            if (
              a.eligible !==
              b.eligible
            ) {
              return (
                a.eligible
                  ? -1
                  : 1
              );
            }

            return (
              b.readiness -
              a.readiness
            );
          }
        );

    const eligible =
      candidates.filter(
        item =>
          item.eligible
      );

    const needsTraining =
      candidates.filter(
        item =>
          !item.eligible &&
          item.missingTraining
            .some(
              requirement =>
                requirement.canTrain
            )
      );

    const vacancies =
      this.getVacancies(
        employees
      );

    const vacancyCount =
      vacancies.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.vacancy,
        0
      );

    const records =
      this.getPromotionRecords(
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
      eligible.length >
      0
    ) {
      notices.push({
        id:
          "promotion_ready",

        type:
          "success",

        title:
          "晋升通报",

        message:
          `${eligible.length}名员工已经达到晋升要求`,

        priority:
          100
      });
    }

    if (
      needsTraining.length >
      0
    ) {
      notices.push({
        id:
          "promotion_training",

        type:
          "info",

        title:
          "培养提醒",

        message:
          `${needsTraining.length}名候选员工可通过培训提高晋升准备度`,

        priority:
          80,

        action:
          "employee_training"
      });
    }

    return {
      pageId:
        "employee_promotion",

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
            "待评估员工",

          value:
            `${candidates.length}人`,

          icon:
            "employees",

          tone:
            "blue",

          caption:
            "进入晋升候选池"
        },

        {
          label:
            "可直接晋升",

          value:
            `${eligible.length}人`,

          icon:
            "crown",

          tone:
            "green",

          caption:
            "已满足全部条件"
        },

        {
          label:
            "平均准备度",

          value:
            candidates.length
              ? `${Math.round(
                  candidates.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      item.readiness,
                    0
                  ) /
                  candidates.length
                )}%`
              : "0%",

          icon:
            "operations",

          tone:
            "orange",

          caption:
            "候选员工综合进度"
        },

        {
          label:
            "岗位空缺",

          value:
            `${vacancyCount}个`,

          icon:
            "employees",

          tone:
            "purple",

          caption:
            vacancyCount > 0
              ? "仍需补充人员"
              : "当前编制充足"
        }
      ],

      candidates,

      eligible,

      needsTraining,

      vacancies,

      records,

      summary: {
        candidateCount:
          candidates.length,

        eligibleCount:
          eligible.length,

        trainingCount:
          needsTraining.length,

        blockedCount:
          candidates.filter(
            item =>
              !item.eligible &&
              item.missingTraining
                .some(
                  requirement =>
                    !requirement.canTrain
                )
          ).length
      },

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


  promote(
    restaurantId,
    employeeId
  ) {
    const before =
      employeeCareerSystem
        .getProfile(
          employeeId
        );

    if (
      before.employee
        .restaurantId !==
      restaurantId
    ) {
      throw new Error(
        "Employee does not belong to restaurant"
      );
    }

    const updated =
      employeeCareerSystem
        .promote(
          employeeId
        );

    const after =
      employeeCareerSystem
        .getProfile(
          employeeId
        );

    const time =
      gameState.getSection(
        "time"
      );

    entitySystem.create(
      "employee_promotion_record",
      {
        restaurantId,

        employeeId,

        employeeName:
          updated.name,

        roleId:
          updated.roleId,

        roleName:
          after.role.name,

        oldRankId:
          before.rank.id,

        oldRankName:
          before.rank.name,

        newRankId:
          after.rank.id,

        newRankName:
          after.rank.name,

        salary:
          updated.salary,

        day:
          time.day
      }
    );

    return {
      employee:
        updated,

      record:
        this.getPromotionRecords(
          restaurantId
        )[0],

      page:
        this.getPage(
          restaurantId
        )
    };
  }


  evaluateAll(
    restaurantId
  ) {
    const page =
      this.getPage(
        restaurantId
      );

    return {
      candidateCount:
        page.candidates.length,

      eligibleCount:
        page.eligible.length,

      trainingCount:
        page.needsTraining.length,

      candidates:
        page.candidates
    };
  }
}


export const employeePromotionPageSystem =
  new EmployeePromotionPageSystem();

export {
  EmployeePromotionPageSystem
};
