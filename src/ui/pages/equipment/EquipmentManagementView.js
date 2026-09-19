import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function money(value) {
  return (
    "¥" +
    Math.round(
      value ?? 0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function kindName(kind) {
  return {
    kitchen: "厨房设备",
    service: "前厅设备",
    checkout: "收银设备",
    support: "保障设备"
  }[kind] ?? kind;
}


function capabilityName(
  capability
) {
  return {
    range: "灶台",
    wok: "炒制",
    steamer: "蒸制",
    pot: "煮制",
    stew_pot: "炖煮",
    fryer: "油炸",
    flat_pan: "香煎",
    grill: "烧烤",
    roaster: "烤制",
    oven: "烘焙",
    claypot: "砂锅",
    hotpot_burner: "涮煮",
    pressure_cooker: "高压",
    cold_prep: "冷加工",
    pickling: "腌渍",
    fermentation: "发酵",
    smoker: "烟熏",
    sous_vide: "低温慢煮"
  }[capability] ?? capability;
}


function energyName(
  type
) {
  return {
    electric: "电",
    gas: "燃气",
    mixed: "混合能源",
    none: "无动力"
  }[type] ?? type;
}


class EquipmentManagementView {
  renderMarkup(page) {
    const dashboard =
      page.dashboard;

    return `
      <main class="rg-screen equipment-management-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "门店硬件能力 · 工位产能"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "设备与工位",

          subtitle:
            "门店硬件能力 · 工位产能",

          backTarget:
            "restaurant"
        })}

        <section class="equipment-page">

        <section>
          <article>
            <span>已安装</span>
            <strong>
              ${dashboard.installed}
            </strong>
          </article>

          <article>
            <span>正常运行</span>
            <strong>
              ${dashboard.working}
            </strong>
          </article>

          <article>
            <span>故障</span>
            <strong>
              ${dashboard.broken}
            </strong>
          </article>

          <article>
            <span>待保养</span>
            <strong>
              ${dashboard.maintenanceDue}
            </strong>
          </article>
        </section>

        <section>
          <h2>烹饪能力</h2>

          <p>
            已覆盖
            ${dashboard.capabilityCoverage.covered}
            /
            ${dashboard.capabilityCoverage.total}
            种正式能力
          </p>
        </section>

        <section>
          <h2>当前营业上限</h2>

          <p>
            厨房
            ${page.storeCapacity.kitchenGuests}
            人/小时
          </p>

          <p>
            前厅
            ${page.storeCapacity.serviceGuests}
            人/小时
          </p>

          <p>
            收银
            ${page.storeCapacity.checkoutGuests}
            人/小时
          </p>
        </section>

        <section>
          <h2>已安装设备</h2>

          ${
            dashboard.equipment.length
              ? dashboard.equipment
                  .map(
                    item => `
                      <article>
                        <strong>
                          ${item.name}
                        </strong>

                        <span>
                          ${kindName(
                            item.equipmentKind
                          )}
                        </span>

                        <span>
                          耐久
                          ${item.durability}%
                        </span>

                        <span>
                          ${item.conditionName}
                        </span>

                        <span>
                          有效产能
                          ${item.effectiveCapacity}/小时
                        </span>
                      </article>
                    `
                  )
                  .join("")
              : "<p>尚未安装专用设备</p>"
          }
        </section>

        <section>
          <h2>设备市场</h2>

          <p>
            门店Lv${page.storeLevel}
            ·
            已解锁${page.catalog.length}台
            ·
            待解锁${page.lockedCount}台
          </p>

          ${
            page.catalog
              .map(
                item => `
                  <article>
                    <strong>
                      ${item.name}
                    </strong>

                    <span>
                      ${kindName(
                        item.equipmentKind
                      )}
                      ·
                      ${item.capabilityTier}
                      ${item.tier?.name ?? ""}
                    </span>

                    <span>
                      ${money(
                        item.purchaseCost
                      )}
                    </span>

                    <span>
                      ${energyName(
                        item.energyType
                      )}
                      ${item.energyUsePerHour}/小时
                      ·
                      占地
                      ${item.footprintUnits}
                    </span>

                    ${item.capabilities.length
                      ? `
                        <span>
                          ${item.capabilities
                            .map(
                              capabilityName
                            )
                            .join(" · ")}
                        </span>
                      `
                      : ""
                    }

                    ${
                      item.capacityPerHour > 0
                        ? `
                          <span>
                            基础产能
                            ${item.capacityPerHour}/小时
                          </span>
                        `
                        : ""
                    }
                  </article>
                `
              )
              .join("")
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


export const equipmentManagementView =
  new EquipmentManagementView();

export {
  EquipmentManagementView
};
