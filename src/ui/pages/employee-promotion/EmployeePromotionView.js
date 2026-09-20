import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderMetricCards,
  renderPanelTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      value ??
      0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function requirementProgress(
  item
) {
  if (
    item.required <=
    0
  ) {
    return 100;
  }

  return Math.min(
    100,
    Math.round(
      item.current /
      item.required *
      100
    )
  );
}


function renderCandidate(
  employee
) {
  return `
    <article
      class="
        promotion-person
        ${
          employee.eligible
            ? "is-ready"
            : ""
        }
      "
    >

      <div
        class="promotion-person__avatar"
        style="
          --employee-avatar:
            url('${employee.avatar}');
        "
      ></div>


      <div class="promotion-person__main">

        <div class="promotion-person__name">
          <strong>
            ${employee.name}
          </strong>

          <span>
            ☺ ${employee.mood}%
          </span>
        </div>

        <div class="promotion-person__rank">
          当前：
          ${employee.roleName}
          ·
          ${employee.currentRank.name}
        </div>

        <div class="promotion-person__target">
          目标：
          <strong>
            ${
              employee.nextRank
                ?.name ??
              "最高职级"
            }
          </strong>
        </div>


        <div class="promotion-person__experience">

          <span>
            经验
          </span>

          <div>
            <i
              style="
                width:${
                  Math.min(
                    100,
                    employee.readiness
                  )
                }%
              "
            ></i>
          </div>

          <small>
            ${employee.experience}
          </small>

        </div>


        <div class="promotion-person__skills">

          ${
            employee.requirements
              .slice(
                0,
                3
              )
              .map(
                item => `
                  <span
                    class="${
                      item.met
                        ? "is-met"
                        : ""
                    }"
                  >
                    ${item.displayLabel}
                    ${
                      item.met
                        ? "✓"
                        : `${item.current}/${item.required}`
                    }
                  </span>
                `
              )
              .join("")
          }

        </div>

      </div>


      <aside class="promotion-person__readiness">

        <small>
          晋升准备度
        </small>

        <strong>
          ${employee.readiness}
        </strong>

        <button
          type="button"
          data-employee-id="${employee.id}"
          ${
            employee.eligible
              ? 'data-promotion-action="promote"'
              : 'data-page-target="employee_training"'
          }
        >
          ${
            employee.eligible
              ? "确认晋升"
              : "安排培训"
          }
        </button>

      </aside>

    </article>
  `;
}


class EmployeePromotionView {
  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen promotion-center-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "传承家常味 · 温暖一座城"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "晋升中心",

          backTarget:
            "employees",

          helpLabel:
            "晋升攻略"
        })}

        ${renderMetricCards(
          page.metrics
        )}


        <section class="promotion-layout">

          <div class="promotion-left">

            <section class="promotion-panel">

              ${renderPanelTitle({
                title:
                  `晋升候选员工（${page.candidates.length}）`
              })}


              <div class="promotion-tabs">

                <button
                  type="button"
                  class="is-active"
                >
                  全部
                  (${page.candidates.length})
                </button>

                <button
                  type="button"
                >
                  可晋升
                  (${page.eligible.length})
                </button>

                <button
                  type="button"
                >
                  需培训
                  (${page.needsTraining.length})
                </button>

              </div>


              <div class="promotion-person-list">

                ${
                  page.candidates.length
                    ? page.candidates
                        .map(
                          renderCandidate
                        )
                        .join("")
                    : `
                      <div class="promotion-empty">
                        当前没有待晋升员工
                      </div>
                    `
                }

              </div>

            </section>


            <section class="promotion-bottom-actions">

              <button
                type="button"
                class="promotion-select-all"
                data-promotion-action="select-all"
              >
                □ 全选
              </button>

              <button
                type="button"
                class="promotion-evaluate"
                data-promotion-action="evaluate-all"
              >
                ▣ 批量评估
              </button>

              <button
                type="button"
                class="promotion-confirm"
                data-promotion-action="promote-ready"
                ${
                  page.eligible.length ===
                  0
                    ? "disabled"
                    : ""
                }
              >
                ♛ 确认晋升
              </button>

            </section>

          </div>


          <aside class="promotion-right">

            <section class="promotion-panel">

              ${renderPanelTitle({
                title:
                  "晋升条件",

                actionLabel:
                  "查看详情"
              })}


              <div class="promotion-rule-list">

                <article>
                  <span>♟</span>
                  <strong>
                    技能等级
                  </strong>
                  <small>
                    达到岗位要求
                  </small>
                </article>

                <article>
                  <span>◷</span>
                  <strong>
                    工作经验
                  </strong>
                  <small>
                    满足最低门槛
                  </small>
                </article>

                <article>
                  <span>▣</span>
                  <strong>
                    培训完成
                  </strong>
                  <small>
                    补足技能缺口
                  </small>
                </article>

                <article>
                  <span>★</span>
                  <strong>
                    忠诚度
                  </strong>
                  <small>
                    达到职级要求
                  </small>
                </article>

              </div>

            </section>


            <section class="promotion-panel">

              ${renderPanelTitle({
                title:
                  "培训补足",

                actionLabel:
                  "去培训中心",

                actionTarget:
                  "employee_training"
              })}


              <div class="promotion-training-shortage">

                ${
                  page.needsTraining
                    .slice(
                      0,
                      3
                    )
                    .map(
                      employee => `
                        <article>

                          <div
                            class="promotion-training-avatar"
                            style="
                              --employee-avatar:
                                url('${employee.avatar}');
                            "
                          ></div>

                          <div>
                            <strong>
                              ${employee.name}
                            </strong>

                            <small>
                              距离晋升还需提升
                            </small>

                            ${
                              employee
                                .missingTraining
                                .slice(
                                  0,
                                  2
                                )
                                .map(
                                  item => `
                                    <span>
                                      ${item.label}
                                      ${
                                        item.current
                                      }
                                      /
                                      ${
                                        item.required
                                      }
                                    </span>
                                  `
                                )
                                .join("")
                            }

                          </div>

                        </article>
                      `
                    )
                    .join("")
                }

                ${
                  page.needsTraining.length ===
                  0
                    ? `
                      <p class="promotion-none">
                        当前候选人暂无培训缺口
                      </p>
                    `
                    : ""
                }

              </div>

            </section>


            <section class="promotion-panel">

              ${renderPanelTitle({
                title:
                  "岗位空缺与编制需求",

                actionLabel:
                  "查看编制",

                actionTarget:
                  "employees"
              })}


              <div class="promotion-vacancy-list">

                ${
                  page.vacancies
                    .map(
                      item => `
                        <article>

                          <span>
                            ${item.roleName}
                          </span>

                          <strong>
                            ${item.current}
                            /
                            ${item.target}
                          </strong>

                          <b
                            class="${
                              item.vacancy >
                              0
                                ? "is-missing"
                                : ""
                            }"
                          >
                            ${
                              item.vacancy >
                              0
                                ? `缺${item.vacancy}`
                                : "已满"
                            }
                          </b>

                          <button
                            type="button"
                            data-page-target="employees"
                          >
                            ${
                              item.vacancy >
                              0
                                ? "招聘"
                                : "查看"
                            }
                          </button>

                        </article>
                      `
                    )
                    .join("")
                }

              </div>

            </section>


            <section class="promotion-panel">

              ${renderPanelTitle({
                title:
                  "晋升通报",

                actionLabel:
                  "查看更多"
              })}


              <div class="promotion-record-list">

                ${
                  page.records.length
                    ? page.records
                        .map(
                          record => `
                            <article>

                              <span class="promotion-record-icon">
                                ♛
                              </span>

                              <div>
                                <strong>
                                  ${record.employeeName}
                                </strong>

                                <small>
                                  ${
                                    record.newRankName
                                      ? `晋升为 ${record.newRankName}`
                                      : `累计晋升 ${record.promotionCount ?? 1} 次`
                                  }
                                </small>
                              </div>

                              <time>
                                ${
                                  record.day
                                    ? `第${record.day}天`
                                    : ""
                                }
                              </time>

                            </article>
                          `
                        )
                        .join("")
                    : `
                      <p class="promotion-none">
                        本店暂时没有晋升记录
                      </p>
                    `
                }

              </div>

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


export const employeePromotionView =
  new EmployeePromotionView();

export {
  EmployeePromotionView
};
