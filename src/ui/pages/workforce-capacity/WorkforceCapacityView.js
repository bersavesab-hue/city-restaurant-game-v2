import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function roleName(id) {
  return {
    chef: "厨师",
    server: "服务员",
    cashier: "收银员",
    kitchen_assistant:
      "后厨帮工",
    manager: "店长",
    cleaner: "保洁员",
    delivery: "配送员"
  }[id] ?? id;
}

class WorkforceCapacityView {
  renderMarkup(page) {
    const workforce =
      page.workforce.capacity;

    return `
      <main class="rg-screen workforce-capacity-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "高峰期人力配置"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "员工产能",

          subtitle:
            "高峰期人力配置",

          backTarget:
            "employees"
        })}

        <section class="workforce-capacity">

        <section>
          <article>
            <span>在岗员工</span>
            <strong>
              ${workforce.availableEmployees}
            </strong>
          </article>

          <article>
            <span>厨房产能</span>
            <strong>
              ${page.storeCapacity.kitchenGuests}人/小时
            </strong>
          </article>

          <article>
            <span>前厅产能</span>
            <strong>
              ${page.storeCapacity.serviceGuests}人/小时
            </strong>
          </article>

          <article>
            <span>收银产能</span>
            <strong>
              ${page.storeCapacity.checkoutGuests}人/小时
            </strong>
          </article>
        </section>

        <section>
          <h2>岗位在岗</h2>

          ${
            Object.entries(
              workforce.roles
            )
              .map(
                ([id, role]) => `
                  <article>
                    <strong>
                      ${roleName(id)}
                    </strong>

                    <span>
                      ${role.available}
                      /
                      ${role.total}
                      在岗
                    </span>
                  </article>
                `
              )
              .join("")
          }
        </section>

        <section>
          <h2>员工明细</h2>

          ${
            page.workforce.employees
              .map(
                employee => `
                  <article>
                    <strong>
                      ${employee.name}
                    </strong>

                    <span>
                      ${roleName(
                        employee.roleId
                      )}
                    </span>

                    <span>
                      ${
                        employee.available
                          ? "在岗"
                          : "未在岗"
                      }
                    </span>

                    <span>
                      疲劳
                      ${employee.fatigue}
                    </span>

                    <span>
                      心情
                      ${employee.mood}
                    </span>
                  </article>
                `
              )
              .join("")
          }
        </section>

        <section>
          <h2>异常员工</h2>

          <p>
            缺勤/请假：
            ${workforce.absentEmployees.length}
          </p>

          <p>
            疲劳停工：
            ${workforce.exhaustedEmployees.length}
          </p>

          <p>
            店长效率：
            ×${workforce.managerMultiplier ?? 1}
          </p>
        </section>

        <section>
          <h2>排班</h2>

          <p>
            已设置
            ${page.workforce.shifts.length}
            条班次
          </p>

          <p>
            今日出勤记录
            ${page.workforce.attendance.length}
            条
          </p>
        </section>
      </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "employees"
            })
        )}

      </main>
    `;
  }
}

export const workforceCapacityView =
  new WorkforceCapacityView();

export {
  WorkforceCapacityView
};
