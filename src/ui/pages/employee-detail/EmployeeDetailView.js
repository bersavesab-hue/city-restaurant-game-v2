import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderMetricCards,
  renderPanelTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";


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


class EmployeeDetailView {
  renderMarkup(
    page
  ) {
    const employee =
      page.employee;

    if (!employee) {
      return `
        <main class="rg-screen employee-management-page">

          ${renderGameTopBar(
            page.topBar
          )}

          ${renderPageTitle({
            title:
              "员工详情",

            backTarget:
              "employee_roster"
          })}

          <section class="employee-panel">
            <div class="employee-empty">
              当前门店暂无员工
            </div>
          </section>

          ${renderBottomNavigation(
            page.bottomNavigation
          )}

        </main>
      `;
    }

    return `
      <main class="rg-screen employee-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "员工档案 · 成长与风险"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            escapeHtml(
              employee.name
            ),

          subtitle:
            `${escapeHtml(
              employee.roleName
            )} · ${escapeHtml(
              employee.rank?.name ??
              ""
            )}`,

          backTarget:
            "employee_roster"
        })}

        ${renderMetricCards(
          page.metrics
        )}

        <section class="employee-management-grid">

          <div class="employee-management-main">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "个人状态"
              })}

              <div class="employee-metrics">

                <article class="employee-metric">
                  <span>月薪</span>
                  <strong>
                    ${money(
                      employee.salary
                    )}
                  </strong>
                </article>

                <article class="employee-metric">
                  <span>心情</span>
                  <strong>
                    ${employee.mood}
                  </strong>
                </article>

                <article class="employee-metric">
                  <span>忠诚度</span>
                  <strong>
                    ${employee.loyalty}
                  </strong>
                </article>

                <article class="employee-metric">
                  <span>疲劳</span>
                  <strong>
                    ${employee.fatigue}
                  </strong>
                </article>

              </div>

              <p>
                状态：
                ${escapeHtml(
                  employee.status
                    ?.label ??
                  "-"
                )}
                ·
                班次：
                ${escapeHtml(
                  employee.shift
                    ?.label ??
                  "-"
                )}
              </p>

              <p>
                年龄：
                ${employee.age ??
                  "-"}
                ·
                行业经验：
                ${employee
                  .industryExperienceMonths ??
                  0}
                个月
                ·
                已培训：
                ${employee.trainingCount}
                次
              </p>

            </section>


            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "技能"
              })}

              <div class="employee-training-list">

                ${employee.skills
                  .map(
                    skill => `
                      <article>
                        <strong>
                          ${escapeHtml(
                            skill.label
                          )}
                        </strong>

                        <span>
                          ${skill.value}/100
                        </span>
                      </article>
                    `
                  )
                  .join("")}

              </div>

            </section>

          </div>


          <aside class="employee-management-side">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "成长路径"
              })}

              <p>
                当前职级：
                <strong>
                  ${escapeHtml(
                    employee.rank
                      ?.name ??
                    "-"
                  )}
                </strong>
              </p>

              <p>
                下一职级：
                <strong>
                  ${escapeHtml(
                    employee.nextRank
                      ?.name ??
                    "已达最高职级"
                  )}
                </strong>
              </p>

              <p>
                晋升准备度：
                ${employee
                  .promotionReadiness}%
              </p>

              <button
                type="button"
                data-page-target="employee_training"
                data-employee-id="${escapeHtml(
                  employee.id
                )}"
              >
                安排培训
              </button>

              <button
                type="button"
                data-page-target="employee_promotion"
                data-employee-id="${escapeHtml(
                  employee.id
                )}"
              >
                查看晋升
              </button>

            </section>


            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "稳定性"
              })}

              <p>
                离职风险：
                <strong>
                  ${page.turnover.score}/100
                </strong>
              </p>

              <p>
                稳定：
                ${employee.stability}
                ·
                学习：
                ${employee.learning}
              </p>

              <p>
                抗压：
                ${employee.stressTolerance}
                ·
                协作：
                ${employee.teamwork}
              </p>

              <p>
                主动性：
                ${employee.initiative}
              </p>

            </section>

          </aside>

        </section>

        ${renderBottomNavigation(
          page.bottomNavigation
        )}

      </main>
    `;
  }
}


export const employeeDetailView =
  new EmployeeDetailView();


export {
  EmployeeDetailView
};
