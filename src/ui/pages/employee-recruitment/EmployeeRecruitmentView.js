import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderMetricCards,
  renderPanelTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  employeeRecruitmentPageSystem
} from "./EmployeeRecruitmentPageSystem.js";


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


function renderCandidate(
  candidate
) {
  const skills =
    Object.entries(
      candidate.skills ??
      {}
    )
      .sort(
        (
          a,
          b
        ) =>
          b[1] - a[1]
      )
      .slice(
        0,
        3
      );

  return `
    <article class="employee-row">

      <div class="employee-row__person">
        <strong>
          ${escapeHtml(
            candidate.name
          )}
        </strong>

        <span>
          ${escapeHtml(
            candidate.roleName
          )}
          ·
          ${candidate.age}岁
        </span>

        <small>
          ${escapeHtml(
            candidate.profileName ??
            "综合型"
          )}
          ·
          潜力
          ${escapeHtml(
            candidate.potentialName
          )}
        </small>
      </div>

      <div class="employee-skill">
        ${skills
          .map(
            (
              [
                skill,
                value
              ]
            ) => `
              <span>
                ${escapeHtml(
                  skill
                )}
                ${value}
              </span>
            `
          )
          .join("")}
      </div>

      <div class="employee-salary">
        <span>
          期望月薪
        </span>

        <strong>
          ${money(
            candidate
              .expectedSalary
          )}
        </strong>

        <small>
          稳定
          ${candidate.stability}
          ·
          学习
          ${candidate.learning}
        </small>
      </div>

      <button
        type="button"
        class="employee-detail-button"
        data-recruit-action="hire"
        data-candidate-id="${escapeHtml(
          candidate.id
        )}"
      >
        招聘
      </button>

    </article>
  `;
}


class EmployeeRecruitmentView {
  constructor() {
    this.root =
      null;

    this.restaurantId =
      null;

    this.onNavigate =
      null;

    this.feedback =
      "";
  }


  render() {
    const page =
      employeeRecruitmentPageSystem
        .getPage(
          this.restaurantId
        );

    this.root.innerHTML = `
      <main class="rg-screen employee-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "人才市场 · 招聘与编制"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "招聘员工",

          subtitle:
            "按岗位缺口、工资基准和候选人能力招聘",

          backTarget:
            "employee_roster"
        })}

        ${renderMetricCards([
          {
            label:
              "当前员工",

            value:
              `${page.currentCount}/${page.staffCap}`,

            tone:
              "primary"
          },

          {
            label:
              "可招聘",

            value:
              `${page.availableSlots}人`,

            tone:
              page.availableSlots >
              0
                ? "success"
                : "warning"
          },

          {
            label:
              "岗位缺口",

            value:
              `${page.staffing?.totalShortage ?? 0}人`,

            tone:
              (
                page.staffing
                  ?.totalShortage ??
                0
              ) >
              0
                ? "warning"
                : "success"
          },

          {
            label:
              "当前月工资",

            value:
              money(
                page.payroll
              ),

            tone:
              "primary"
          }
        ])}

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

          <div class="employee-management-main">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  `人才市场（${page.candidates.length}）`,

                subtitle:
                  "候选人会随经营日期更新"
              })}

              <button
                type="button"
                data-recruit-action="refresh"
              >
                刷新人才池
              </button>

              <div class="employee-list">
                ${page.candidates.length
                  ? page.candidates
                      .map(
                        renderCandidate
                      )
                      .join("")
                  : `
                    <div class="employee-empty">
                      当前没有可招聘候选人
                    </div>
                  `}
              </div>

            </section>

          </div>


          <aside class="employee-management-side">

            <section class="employee-panel">

              ${renderPanelTitle({
                title:
                  "岗位建议"
              })}

              <div class="staffing-table">

                ${page.recommendations
                  .map(
                    item => `
                      <article class="staffing-row staffing-row--${escapeHtml(
                        item.state ??
                        "balanced"
                      )}">
                        <strong>
                          ${escapeHtml(
                            item.name
                          )}
                        </strong>

                        <span>
                          当前
                          ${item.current}
                          /
                          建议
                          ${item.recommended}
                        </span>

                        <small>
                          ${escapeHtml(
                            item.message
                          )}
                        </small>
                      </article>
                    `
                  )
                  .join("")}

              </div>

            </section>

          </aside>

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
        "[data-recruit-action]"
      )
      .forEach(
        element => {
          element.addEventListener(
            "click",
            () => {
              try {
                if (
                  element.dataset
                    .recruitAction ===
                  "refresh"
                ) {
                  employeeRecruitmentPageSystem
                    .refreshTalentPool(
                      this.restaurantId
                    );

                  this.feedback =
                    "人才池已刷新";
                }

                if (
                  element.dataset
                    .recruitAction ===
                  "hire"
                ) {
                  const employee =
                    employeeRecruitmentPageSystem
                      .hireCandidate(
                        this.restaurantId,
                        element.dataset
                          .candidateId
                      );

                  this.feedback =
                    `已招聘 ${employee.name}`;
                }
              } catch (
                error
              ) {
                this.feedback =
                  error?.message ??
                  "招聘操作失败";
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
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  destroy() {
    this.root =
      null;

    this.restaurantId =
      null;

    this.onNavigate =
      null;
  }
}


export const employeeRecruitmentView =
  new EmployeeRecruitmentView();


export {
  EmployeeRecruitmentView
};
