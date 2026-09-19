import {
  employeeManagementPageSystem
} from "./EmployeeManagementPageSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      Number(value) ||
      0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function renderAvatar(
  employee
) {
  return `
    <div
      class="
        employee-avatar-slot
        employee-avatar-slot--${escapeHtml(
          employee.roleId
        )}
      "
      role="img"
      aria-label="${escapeHtml(
        employee.name
      )}头像"
      data-image-slot="employee-avatar-${escapeHtml(
        employee.avatarId
      )}"
      data-avatar-id="${escapeHtml(
        employee.avatarId
      )}"
      data-image-fit="cover"
      data-image-position="center top"
    >
      <span aria-hidden="true">
        ${escapeHtml(
          employee.name
            .slice(
              0,
              1
            )
        )}
      </span>
    </div>
  `;
}


class EmployeeManagementView {
  constructor({
    root = null,
    restaurantId = null,
    pageSystem =
      employeeManagementPageSystem,

    onNavigate = null
  } = {}) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.page =
      null;

    this.tab =
      "all";
  }


  mount(
    root = this.root,
    {
      restaurantId =
        this.restaurantId
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.render();

    return this;
  }


  getEmployees() {
    const employees =
      this.page.employees;


    if (
      this.tab ===
      "all"
    ) {
      return employees;
    }


    return employees.filter(
      employee =>
        employee.roleId ===
        this.tab
    );
  }


  renderMetrics() {
    return `
      <section class="employee-metrics">

        ${
          this.page.metrics
            .map(
              metric => `
                <article
                  class="employee-metric employee-metric--${metric.tone}"
                >

                  <span>
                    ${escapeHtml(
                      metric.label
                    )}
                  </span>

                  <strong>
                    ${escapeHtml(
                      metric.value
                    )}
                  </strong>

                  ${
                    metric.suffix
                      ? `
                        <small>
                          ${escapeHtml(
                            metric.suffix
                          )}
                        </small>
                      `
                      : ""
                  }

                </article>
              `
            )
            .join("")
        }

      </section>
    `;
  }


  renderEmployeeTable() {
    const employees =
      this.getEmployees();


    return `
      <section class="employee-panel employee-list-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              员工列表
            </strong>

            <span>
              满意度、疲劳、技能与晋升状态均实时变化
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_recruitment"
          >
            ＋ 招聘员工
          </button>

        </header>


        <nav class="employee-role-tabs">

          ${
            [
              [
                "all",
                "全部"
              ],

              [
                "chef",
                "厨师"
              ],

              [
                "server",
                "服务员"
              ],

              [
                "cashier",
                "收银"
              ],

              [
                "kitchen_assistant",
                "后厨"
              ]
            ]
              .map(
                (
                  [
                    id,
                    label
                  ]
                ) => `
                  <button
                    type="button"
                    class="${
                      this.tab ===
                      id
                        ? "is-active"
                        : ""
                    }"
                    data-employee-tab="${id}"
                  >
                    ${label}
                  </button>
                `
              )
              .join("")
          }

        </nav>


        <div class="employee-table-head">

          <span>
            员工
          </span>

          <span>
            等级
          </span>

          <span>
            岗位技能
          </span>

          <span>
            状态
          </span>

          <span>
            月薪
          </span>

          <span>
            满意度
          </span>

          <span>
            操作
          </span>

        </div>


        <div class="employee-list">

          ${
            employees.length
              ? employees
                  .map(
                    employee => `
                      <article class="employee-row">

                        <div class="employee-row__person">

                          ${renderAvatar(
                            employee
                          )}

                          <div>
                            <strong>
                              ${escapeHtml(
                                employee.name
                              )}
                            </strong>

                            <span>
                              ${escapeHtml(
                                employee.roleName
                              )}
                              ·
                              ${escapeHtml(
                                employee.rank
                                  .name
                              )}
                            </span>
                          </div>

                        </div>


                        <div class="employee-level">

                          <strong>
                            Lv.${employee.level}
                          </strong>

                          <div>
                            <i
                              style="
                                width:${employee.levelProgress}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <div class="employee-skill">

                          <strong>
                            ${escapeHtml(
                              employee.primarySkill
                                .label
                            )}
                          </strong>

                          <span>
                            ${employee.primarySkill.value}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.primarySkill.value}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <div
                          class="
                            employee-status
                            employee-status--${employee.status.tone}
                          "
                        >
                          <strong>
                            ${escapeHtml(
                              employee.status
                                .label
                            )}
                          </strong>

                          <small>
                            疲劳
                            ${employee.fatigue}
                          </small>
                        </div>


                        <div class="employee-salary">

                          <strong>
                            ${money(
                              employee.salary
                            )}
                          </strong>

                          <small>
                            ${
                              employee
                                .salarySatisfaction
                                .score
                            }分工资感受
                          </small>

                        </div>


                        <div class="employee-satisfaction">

                          <strong>
                            ${employee.satisfactionScore}
                          </strong>

                          <span>
                            ${escapeHtml(
                              employee.satisfaction
                                .label
                            )}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.satisfactionScore}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <button
                          type="button"
                          class="employee-detail-button"
                          data-employee-id="${employee.id}"
                          data-page-target="employee_detail"
                        >
                          详情
                        </button>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="employee-empty">
                  当前分类没有员工
                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderStaffing() {
    const staffing =
      this.page.staffing;


    return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              动态推荐编制
            </strong>

            <span>
              不是固定人数，按餐位、营业时间、订单量和员工效率计算
            </span>
          </div>

          <button
            type="button"
            data-page-target="workforce-capacity"
          >
            员工产能
          </button>

          <b
            class="${
              staffing.balanced
                ? "is-good"
                : "is-warning"
            }"
          >
            ${
              staffing.balanced
                ? "编制平衡"
                : `缺${staffing.totalShortage}人`
            }
          </b>

        </header>


        <div class="staffing-basis">

          <article>
            <span>
              餐位
            </span>

            <strong>
              ${staffing.basis.seats}
            </strong>
          </article>

          <article>
            <span>
              营业时长
            </span>

            <strong>
              ${staffing.basis.operatingHours}h
            </strong>
          </article>

          <article>
            <span>
              日均订单
            </span>

            <strong>
              ${staffing.basis.averageDailyOrders}
            </strong>
          </article>

          <article>
            <span>
              预计峰值
            </span>

            <strong>
              ${staffing.basis.estimatedPeakOrdersPerHour}/h
            </strong>
          </article>

          <article>
            <span>
              厨师效率
            </span>

            <strong>
              ${staffing.basis.averageChefSkill}
            </strong>
          </article>

          <article>
            <span>
              服务效率
            </span>

            <strong>
              ${staffing.basis.averageServerSkill}
            </strong>
          </article>

        </div>


        <div class="staffing-table">

          <div class="staffing-table-head">
            <span>岗位</span>
            <span>当前</span>
            <span>建议</span>
            <span>缺口</span>
            <span>依据</span>
          </div>

          ${
            staffing.roles
              .map(
                role => `
                  <article
                    class="
                      staffing-row
                      staffing-row--${role.state}
                    "
                  >

                    <strong>
                      ${escapeHtml(
                        role.name
                      )}
                    </strong>

                    <span>
                      ${role.current}
                    </span>

                    <span>
                      ${role.recommended}
                    </span>

                    <b>
                      ${
                        role.shortage >
                        0
                          ? `缺${role.shortage}`
                          : role.surplus >
                            0
                            ? `多${role.surplus}`
                            : "正常"
                      }
                    </b>

                    <small>
                      ${escapeHtml(
                        role.reason
                      )}
                    </small>

                  </article>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderTraining() {
    return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              培训成长
            </strong>

            <span>
              这里统计真实培训次数，不再拿技能值冒充培训进度
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_training"
          >
            培训中心
          </button>

        </header>


        <div class="employee-training-list">

          ${
            this.page
              .trainingEmployees
              .length
              ? this.page
                  .trainingEmployees
                  .map(
                    employee => `
                      <article>

                        <div>
                          <strong>
                            ${escapeHtml(
                              employee.name
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              employee.roleName
                            )}
                          </span>
                        </div>

                        <div class="employee-training-progress">

                          <span>
                            ${escapeHtml(
                              employee.training
                                .label
                            )}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.training.percent}%;
                              "
                            ></i>
                          </div>

                        </div>

                        <strong>
                          ${employee.trainingCount}次
                        </strong>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="employee-empty">
                  暂无培训记录
                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderPromotion() {
    return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              晋升候选人
            </strong>

            <span>
              根据经验、工时、主技能、忠诚度综合判断
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_promotion"
          >
            晋升中心
          </button>

        </header>


        <div class="employee-promotion-list">

          ${
            this.page
              .promotionCandidates
              .length
              ? this.page
                  .promotionCandidates
                  .map(
                    employee => `
                      <article>

                        ${renderAvatar(
                          employee
                        )}

                        <div>
                          <strong>
                            ${escapeHtml(
                              employee.name
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              employee.rank.name
                            )}
                            →
                            ${escapeHtml(
                              employee.nextRank
                                ?.name ??
                              "最高职级"
                            )}
                          </span>
                        </div>

                        <div class="promotion-readiness">

                          <span>
                            晋升准备度
                          </span>

                          <strong>
                            ${employee.promotionReadiness}%
                          </strong>

                          <div>
                            <i
                              style="
                                width:${employee.promotionReadiness}%;
                              "
                            ></i>
                          </div>

                        </div>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="employee-empty">
                  当前没有可晋升候选人
                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderMarkup(
    page
  ) {
    this.page =
      page;


    return `
      <main class="rg-screen employee-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "人员 · 排班 · 培训 · 晋升"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "员工与晋升",

          backTarget:
            "restaurant",

          helpLabel:
            "员工说明"
        })}

        ${this.renderMetrics()}


        <section class="employee-management-grid">

          <div class="employee-management-main">

            ${this.renderEmployeeTable()}

            ${this.renderStaffing()}

          </div>


          <aside class="employee-management-side">

            ${this.renderPromotion()}

            ${this.renderTraining()}

          </aside>

        </section>


        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                this.restaurantId,

              activePageId:
                "employees"
            })
        )}

      </main>
    `;
  }


  render() {
    this.page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );

    this.bind();

    return this.page;
  }


  bind() {
    this.root
      .querySelectorAll(
        "[data-employee-tab]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.tab =
                button.dataset
                  .employeeTab;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset
                  .pageTarget,

                this.restaurantId,

                {
                  employeeId:
                    button.dataset
                      .employeeId ??
                    null
                }
              );
            }
          );
        }
      );
  }
}


export const employeeManagementView =
  new EmployeeManagementView();


export {
  EmployeeManagementView
};
