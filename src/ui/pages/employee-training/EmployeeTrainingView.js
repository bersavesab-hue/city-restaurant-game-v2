import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderMetricCards,
  renderPanelTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  employeeTrainingPageSystem
} from "./EmployeeTrainingPageSystem.js";


function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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


class EmployeeTrainingView {
  constructor() {
    this.root =
      null;

    this.restaurantId =
      null;

    this.employeeId =
      null;

    this.onNavigate =
      null;

    this.feedback =
      "";
  }


  render() {
    const page =
      employeeTrainingPageSystem
        .getPage(
          this.restaurantId,
          {
            employeeId:
              this.employeeId
          }
        );

    this.employeeId =
      page.employee?.id ??
      null;

    this.root.innerHTML = `
      <main class="rg-screen employee-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "员工成长 · 培训与技能提升"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "培训中心",

          subtitle:
            "培训直接消耗门店资金并提升员工技能与经验",

          backTarget:
            "employee_roster"
        })}

        ${renderMetricCards(
          page.metrics
        )}

        ${this.feedback
          ? `
            <section class="employee-panel">
              <strong>
                ${escapeHtml(
                  this.feedback
                )}
              </strong>
            </section>
          `
          : ""}

        <section class="employee-management-grid">

          <aside class="employee-management-side">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "选择员工"
              })}

              <div class="employee-training-list">

                ${page.employees.length
                  ? page.employees
                      .map(
                        employee => `
                          <button
                            type="button"
                            class="${
                              employee.id ===
                              this.employeeId
                                ? "is-active"
                                : ""
                            }"
                            data-training-employee="${escapeHtml(
                              employee.id
                            )}"
                          >
                            ${escapeHtml(
                              employee.name
                            )}
                            ·
                            ${escapeHtml(
                              employee.roleName
                            )}
                          </button>
                        `
                      )
                      .join("")
                  : `
                    <div class="employee-empty">
                      当前没有员工
                    </div>
                  `}

              </div>

            </section>

          </aside>


          <div class="employee-management-main">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  page.employee
                    ? `${page.employee.name} · 可用培训`
                    : "可用培训"
              })}

              <div class="employee-training-list">

                ${page.programs.length
                  ? page.programs
                      .map(
                        program => `
                          <article>

                            <strong>
                              ${escapeHtml(
                                program.name
                              )}
                            </strong>

                            <span>
                              费用
                              ${money(
                                program.cost
                              )}
                              ·
                              经验
                              +${program.experience}
                            </span>

                            <small>
                              主技能
                              +${program.primarySkillGain}
                              ·
                              副技能
                              +${program.secondarySkillGain}
                              ·
                              疲劳
                              +${program.fatigueGain}
                            </small>

                            <button
                              type="button"
                              data-training-program="${escapeHtml(
                                program.id
                              )}"
                              ${
                                !program.unlocked ||
                                (
                                  page.employee
                                    ?.fatigue ??
                                  0
                                ) >=
                                  90
                                  ? "disabled"
                                  : ""
                              }
                            >
                              ${program.unlocked
                                ? "开始培训"
                                : `需${escapeHtml(
                                    program.unlockRank
                                      ?.name ??
                                    "更高职级"
                                  )}`}
                            </button>

                          </article>
                        `
                      )
                      .join("")
                  : `
                    <div class="employee-empty">
                      当前员工没有可用培训
                    </div>
                  `}

              </div>

            </section>

          </div>

        </section>

        ${renderBottomNavigation(
          page.bottomNavigation
        )}

      </main>
    `;

    this.bind();

    return page;
  }


  bind() {
    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        element => {
          element.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                element.dataset
                  .pageTarget,
                this.restaurantId,
                {
                  employeeId:
                    this.employeeId
                }
              );
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-training-employee]"
      )
      .forEach(
        element => {
          element.addEventListener(
            "click",
            () => {
              this.employeeId =
                element.dataset
                  .trainingEmployee;

              this.feedback =
                "";

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-training-program]"
      )
      .forEach(
        element => {
          element.addEventListener(
            "click",
            () => {
              if (
                !this.employeeId
              ) {
                return;
              }

              try {
                const result =
                  employeeTrainingPageSystem
                    .train(
                      this.restaurantId,
                      this.employeeId,
                      element.dataset
                        .trainingProgram
                    );

                this.feedback =
                  `${result.employee.name} 已完成 ${result.program.name}`;
              } catch (
                error
              ) {
                this.feedback =
                  error?.message ??
                  "培训失败";
              }

              this.render();
            }
          );
        }
      );
  }


  mount(
    root,
    {
      restaurantId,
      employeeId = null,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.employeeId =
      employeeId;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  destroy() {
    this.root =
      null;

    this.restaurantId =
      null;

    this.employeeId =
      null;

    this.onNavigate =
      null;
  }
}


export const employeeTrainingView =
  new EmployeeTrainingView();


export {
  EmployeeTrainingView
};
