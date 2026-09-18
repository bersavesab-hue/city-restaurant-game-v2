import {
  supplyManagementPageSystem
} from "./SupplyManagementPageSystem.js";

import {
  INGREDIENT_ATLAS_DATA_URI
} from "../../../data/ingredientAtlas.js";

import {
  getIngredientSpriteStyle
} from "../../../data/ingredientVisuals.js";

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

function escapeHtml(value) {
  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function renderIngredientThumb(
  ingredientId,
  ingredientName,
  size = 46
) {
  try {
    return `
      <span
        class="ingredient-thumb ingredient-sprite"
        style="${getIngredientSpriteStyle(
          ingredientId,
          size
        )}"
        role="img"
        aria-label="${escapeHtml(
          ingredientName
        )}"
      ></span>
    `;
  } catch {
    return `
      <span
        class="ingredient-thumb ingredient-thumb--fallback"
        role="img"
        aria-label="${escapeHtml(
          ingredientName
        )}"
      >
        ${escapeHtml(
          String(
            ingredientName ??
            "?"
          ).slice(
            0,
            1
          )
        )}
      </span>
    `;
  }
}

function riskName(level) {
  return {
    healthy: "充足",
    medium: "偏低",
    high: "缺货风险",
    critical: "已缺货"
  }[level] ?? level;
}

class SupplyManagementView {
  constructor({
    pageSystem =
      supplyManagementPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.section =
      "inventory";
  }

  mount(
    root,
    {
      restaurantId
    } = {}
  ) {
    if (!root) {
      throw new Error(
        "SupplyManagementView root is required"
      );
    }

    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.render();

    return this;
  }

  render() {
    const page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.root.className =
      "supply-management-page";

    this.root.style.setProperty(
      "--ingredient-atlas",
      `url("${INGREDIENT_ATLAS_DATA_URI}")`
    );

    this.root.innerHTML = `
      <header class="supply-header">
        <div>
          <span>门店供应链</span>
          <h1>采购与库存</h1>
          <p>
            ${page.summary.supplierCount}家供应商
            ·
            ${page.summary.shortageCount}项库存预警
          </p>
        </div>

        <strong>
          ${
            page.balance === null
              ? "-"
              : money(
                  page.balance
                )
          }
        </strong>
      </header>

      <section class="supply-summary">
        <div>
          <span>待收货</span>
          <strong>
            ${page.summary.pendingOrders}
          </strong>
        </div>

        <div>
          <span>库存预警</span>
          <strong>
            ${page.summary.shortageCount}
          </strong>
        </div>

        <div>
          <span>应付账款</span>
          <strong>
            ${money(
              page.summary.payableAmount
            )}
          </strong>
        </div>

        <div>
          <span>逾期</span>
          <strong>
            ${money(
              page.summary.overdueAmount
            )}
          </strong>
        </div>
      </section>

      <nav class="supply-tabs">
        ${[
          ["inventory", "库存"],
          ["suppliers", "供应商"],
          ["orders", "采购单"],
          ["auto", "自动采购"],
          ["payables", "账期"]
        ].map(
          ([id, name]) => `
            <button
              type="button"
              data-section="${id}"
              class="${
                this.section ===
                id
                  ? "active"
                  : ""
              }"
            >
              ${name}
            </button>
          `
        ).join("")}
      </nav>

      <main>
        ${this.renderSection(page)}
      </main>
    `;

    this.bind();

    return page;
  }

  renderSection(page) {
    if (
      this.section ===
      "suppliers"
    ) {
      return this.renderSuppliers(
        page
      );
    }

    if (
      this.section ===
      "orders"
    ) {
      return this.renderOrders(
        page
      );
    }

    if (
      this.section ===
      "auto"
    ) {
      return this.renderAuto(
        page
      );
    }

    if (
      this.section ===
      "payables"
    ) {
      return this.renderPayables(
        page
      );
    }

    return this.renderInventory(
      page
    );
  }

  renderInventory(page) {
    return `
      <section class="supply-list">
        ${
          page.inventory.length
            ? page.inventory.map(
                item => `
                  <article class="inventory-row risk-${item.level}">
                    <div class="inventory-main">
                      ${renderIngredientThumb(
                        item.ingredientId,
                        item.ingredientName,
                        46
                      )}

                      <div>
                      <strong>
                        ${escapeHtml(
                          item.ingredientName
                        )}
                      </strong>

                      <span>
                        可用
                        ${item.usable}
                        ${escapeHtml(item.unit)}
                        ·
                        在途
                        ${item.pending}
                      </span>
                      </div>
                    </div>

                    <div>
                      ${
                        item.expiring > 0
                          ? `
                            <span>
                              临期
                              ${item.expiring}
                            </span>
                          `
                          : ""
                      }

                      <em>
                        ${riskName(item.level)}
                      </em>
                    </div>
                  </article>
                `
              ).join("")
            : `
              <div class="supply-empty">
                暂无库存数据
              </div>
            `
        }
      </section>
    `;
  }

  renderSuppliers(page) {
    return `
      <section class="supplier-grid">
        ${page.suppliers.map(
          supplier => `
            <article class="supplier-card">
              <header>
                <div>
                  <strong>
                    ${escapeHtml(
                      supplier.name
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      supplier.capabilityTier.id +
                      " · " +
                      supplier.capabilityTier.name
                    )}
                  </span>
                </div>

                <em>
                  ${supplier.serviceScore}分
                </em>
              </header>

              <div class="supplier-stats">
                <span>
                  关系
                  <strong>
                    ${Math.round(
                      supplier.relationship
                    )}
                  </strong>
                </span>

                <span>
                  合作
                  <strong>
                    ${escapeHtml(
                      supplier
                        .partnership
                        .name
                    )}
                  </strong>
                </span>

                <span>
                  准时
                  <strong>
                    ${supplier.reliability}
                  </strong>
                </span>

                <span>
                  账期
                  <strong>
                    ${
                      supplier.creditDays > 0
                        ? supplier.creditDays + "天"
                        : "现结"
                    }
                  </strong>
                </span>
              </div>

              <div class="supplier-offer-summary">
                可供
                <strong>
                  ${supplier.offerCount}
                </strong>
                种食材
                ·
                当前预览前6种
              </div>

              <div class="supplier-offers">
                ${supplier.offers
                  .slice(
                    0,
                    6
                  )
                  .map(
                  offer => `
                    <div class="supplier-offer">
                      <div class="supplier-offer__ingredient">
                        ${renderIngredientThumb(
                          offer.ingredientId,
                          offer.ingredient?.name ??
                          offer.ingredientId,
                          38
                        )}

                        <div>
                        <strong>
                          ${escapeHtml(
                            offer.ingredient?.name ??
                            offer.ingredientId
                          )}
                        </strong>

                        <span>
                          品质
                          ${offer.qualityMin}–${offer.qualityMax}
                          ·
                          最低
                          ${offer.minimumOrder}
                        </span>
                        </div>
                      </div>

                      <input
                        type="number"
                        min="${offer.minimumOrder}"
                        max="${offer.capacityPerDay}"
                        value="${offer.minimumOrder}"
                        data-buy-quantity="${supplier.id}:${offer.ingredientId}"
                      >

                      <button
                        type="button"
                        data-buy="${supplier.id}:${offer.ingredientId}"
                      >
                        采购
                      </button>

                      ${
                        supplier.creditDays > 0
                          ? `
                            <button
                              type="button"
                              data-credit-buy="${supplier.id}:${offer.ingredientId}"
                            >
                              账期
                            </button>
                          `
                          : ""
                      }
                    </div>
                  `
                ).join("")}
              </div>
            </article>
          `
        ).join("")}
      </section>
    `;
  }

  renderOrders(page) {
    return `
      <section class="supply-list">
        ${
          page.orders.length
            ? page.orders.map(
                order => `
                  <article class="order-row">
                    <div>
                      <strong>
                        ${escapeHtml(
                          order.ingredientId
                        )}
                        ×
                        ${order.quantity}
                      </strong>

                      <span>
                        ${order.paymentMode === "credit"
                          ? `账期${order.creditDays}天`
                          : "现金采购"}
                        ·
                        品质
                        ${order.quality}
                      </span>
                    </div>

                    <div>
                      <strong>
                        ${money(order.totalPrice)}
                      </strong>

                      <span>
                        ${escapeHtml(order.status)}
                      </span>
                    </div>
                  </article>
                `
              ).join("")
            : `
              <div class="supply-empty">
                暂无采购单
              </div>
            `
        }
      </section>
    `;
  }

  renderAuto(page) {
    const options =
      this.pageSystem
        .getAutoPolicyOptions(
          this.restaurantId
        );

    return `
      <section class="auto-form">
        <h2>自动补货规则</h2>

        <select data-auto-supplier>
          ${options.suppliers.map(
            supplier => `
              <option value="${supplier.id}">
                ${escapeHtml(supplier.name)}
              </option>
            `
          ).join("")}
        </select>

        <select data-auto-ingredient>
          ${options.ingredients.map(
            ingredient => `
              <option value="${ingredient.id}">
                ${escapeHtml(ingredient.name)}
              </option>
            `
          ).join("")}
        </select>

        <input
          type="number"
          min="0"
          value="10"
          data-auto-min
          placeholder="最低库存"
        >

        <input
          type="number"
          min="1"
          value="30"
          data-auto-target
          placeholder="目标库存"
        >

        <button
          type="button"
          data-action="save-auto"
        >
          保存规则
        </button>
      </section>

      <section class="supply-list">
        ${
          page.policies.length
            ? page.policies.map(
                policy => `
                  <article class="order-row">
                    <div>
                      <strong>
                        ${escapeHtml(
                          policy.ingredientId
                        )}
                      </strong>

                      <span>
                        ≤
                        ${policy.minimumQuantity}
                        自动补至
                        ${policy.targetQuantity}
                      </span>
                    </div>

                    <span>
                      ${policy.enabled
                        ? "启用"
                        : "关闭"}
                    </span>
                  </article>
                `
              ).join("")
            : `
              <div class="supply-empty">
                尚未设置自动采购
              </div>
            `
        }
      </section>
    `;
  }

  renderPayables(page) {
    return `
      <section class="supply-list">
        ${
          page.payables.length
            ? page.payables.map(
                payable => `
                  <article class="payable-row ${payable.status}">
                    <div>
                      <strong>
                        ${escapeHtml(
                          payable.ingredientId
                        )}
                      </strong>

                      <span>
                        到期：第
                        ${payable.dueDay}
                        天
                      </span>
                    </div>

                    <div>
                      <strong>
                        ${money(
                          payable.amount
                        )}
                      </strong>

                      <span>
                        ${escapeHtml(
                          payable.status
                        )}
                      </span>
                    </div>
                  </article>
                `
              ).join("")
            : `
              <div class="supply-empty">
                暂无供应商账款
              </div>
            `
        }
      </section>
    `;
  }

  bind() {
    this.root
      .querySelectorAll(
        "[data-section]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.section =
                button.dataset.section;

              this.render();
            }
          );
        }
      );

    const purchase =
      (button, useCredit) => {
        const [
          supplierId,
          ingredientId
        ] =
          button
            .dataset[
              useCredit
                ? "creditBuy"
                : "buy"
            ]
            .split(":");

        const input =
          this.root
            .querySelector(
              `[data-buy-quantity="${supplierId}:${ingredientId}"]`
            );

        const quantity =
          Number(
            input?.value
          );

        try {
          this.pageSystem
            .purchase({
              restaurantId:
                this.restaurantId,
              supplierId,
              ingredientId,
              quantity,
              useCredit
            });

          this.render();
        } catch (error) {
          alert(
            error.message
          );
        }
      };

    this.root
      .querySelectorAll(
        "[data-buy]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              purchase(
                button,
                false
              )
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-credit-buy]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              purchase(
                button,
                true
              )
          );
        }
      );

    this.root
      .querySelector(
        '[data-action="save-auto"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const supplierId =
            this.root
              .querySelector(
                "[data-auto-supplier]"
              )
              ?.value;

          const ingredientId =
            this.root
              .querySelector(
                "[data-auto-ingredient]"
              )
              ?.value;

          const minimumQuantity =
            Number(
              this.root
                .querySelector(
                  "[data-auto-min]"
                )
                ?.value
            );

          const targetQuantity =
            Number(
              this.root
                .querySelector(
                  "[data-auto-target]"
                )
                ?.value
            );

          try {
            this.pageSystem
              .setAutoPolicy({
                restaurantId:
                  this.restaurantId,
                supplierId,
                ingredientId,
                minimumQuantity,
                targetQuantity,
                enabled: true
              });

            this.render();
          } catch (error) {
            alert(
              error.message
            );
          }
        }
      );
  }
}

export const supplyManagementView =
  new SupplyManagementView();

export {
  SupplyManagementView
};
