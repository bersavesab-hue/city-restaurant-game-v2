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


class EquipmentManagementView {
  renderMarkup(page) {
    const dashboard =
      page.dashboard;

    return `
      <section class="equipment-page">
        <header>
          <span>门店硬件能力</span>
          <h1>设备与工位</h1>
        </header>

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
                    </span>

                    <span>
                      ${money(
                        item.purchaseCost
                      )}
                    </span>

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
    `;
  }
}


export const equipmentManagementView =
  new EquipmentManagementView();

export {
  EquipmentManagementView
};
