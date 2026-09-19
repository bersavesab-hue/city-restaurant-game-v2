import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      value ?? 0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function statusName(
  status
) {
  return {
    active: "运行中",
    inactive: "已停用",
    broken: "故障",
    maintenance: "维护停机",
    retired: "已淘汰"
  }[status] ?? status;
}


class EquipmentMaintenanceView {
  renderMarkup(
    page
  ) {
    return `
      <main class="rg-screen equipment-maintenance-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "设备生命周期 · 故障风险"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "设备维护",

          subtitle:
            "设备生命周期 · 故障风险",

          backTarget:
            "restaurant"
        })}

        <section class="equipment-maintenance">

        <section>
          <article>
            <span>运行中</span>
            <strong>
              ${page.working}
            </strong>
          </article>

          <article>
            <span>维护停机</span>
            <strong>
              ${page.maintenance}
            </strong>
          </article>

          <article>
            <span>故障</span>
            <strong>
              ${page.broken}
            </strong>
          </article>

          <article>
            <span>高风险设备</span>
            <strong>
              ${page.highRisk}
            </strong>
          </article>
        </section>

        <section>
          <h2>设备状态</h2>

          ${
            page.equipment.length
              ? page.equipment
                  .map(
                    item => `
                      <article>
                        <strong>
                          ${item.name}
                        </strong>

                        <span>
                          ${statusName(
                            item.status
                          )}
                        </span>

                        <span>
                          耐久
                          ${item.durability}%
                        </span>

                        <span>
                          故障风险
                          ${item.failureRisk}%
                        </span>

                        <span>
                          升级
                          Lv.${item.upgradeLevel}
                        </span>

                        <span>
                          产能
                          ${item.effectiveCapacity}/小时
                        </span>
                      </article>
                    `
                  )
                  .join("")
              : "<p>暂无设备</p>"
          }
        </section>

        <section>
          <h2>维护记录</h2>

          ${
            page.events.length
              ? page.events
                  .map(
                    item => `
                      <article>
                        <strong>
                          ${item.eventKind}
                        </strong>

                        <span>
                          第${item.day}天
                        </span>

                        ${
                          item.cost
                            ? `
                              <span>
                                ${money(
                                  item.cost
                                )}
                              </span>
                            `
                            : ""
                        }
                      </article>
                    `
                  )
                  .join("")
              : "<p>暂无维护记录</p>"
          }
        </section>
      </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "restaurant"
            })
        )}

      </main>
    `;
  }
}


export const equipmentMaintenanceView =
  new EquipmentMaintenanceView();

export {
  EquipmentMaintenanceView
};
