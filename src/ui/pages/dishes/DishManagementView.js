import {
  dishManagementPageSystem
} from "./DishManagementPageSystem.js";

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

function percent(value) {
  return (
    Math.round(
      (value ?? 0) *
      100
    ) +
    "%"
  );
}

class DishManagementView {
  constructor({
    pageSystem =
      dishManagementPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.section =
      "menu";

    this.selectedDishId =
      null;

    this.tierId =
      null;

    this.menuOnly =
      false;
  }

  mount(
    root,
    {
      restaurantId
    } = {}
  ) {
    if (!root) {
      throw new Error(
        "DishManagementView root is required"
      );
    }

    if (!restaurantId) {
      throw new Error(
        "restaurantId is required"
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
          this.restaurantId,
          {
            tierId:
              this.tierId,

            menuOnly:
              this.menuOnly
          }
        );

    this.root.className =
      "dish-management-page";

    this.root.innerHTML = `
      <header class="dish-header">
        <div>
          <div class="dish-eyebrow">
            门店产品
          </div>

          <h1>菜品中心</h1>

          <p>
            ${page.summary.total}道自研菜
            ·
            ${page.summary.activeMenuCount}道在售
          </p>
        </div>

        <div class="dish-balance">
          <span>可用资金</span>

          <strong>
            ${
              page.balance === null
                ? "-"
                : money(
                    page.balance
                  )
            }
          </strong>
        </div>
      </header>

      <nav class="dish-tabs">
        <button
          type="button"
          data-section="menu"
          class="${
            this.section ===
            "menu"
              ? "active"
              : ""
          }"
        >
          菜品总览
        </button>

        <button
          type="button"
          data-section="research"
          class="${
            this.section ===
            "research"
              ? "active"
              : ""
          }"
        >
          自主研发
        </button>
      </nav>

      <main>
        ${
          this.section ===
          "research"
            ? this.renderResearch()
            : this.renderMenu(
                page
              )
        }
      </main>
    `;

    this.bindEvents();

    return page;
  }

  renderMenu(page) {
    const top =
      page.summary.topDish;

    return `
      <section class="dish-summary-grid">
        <div>
          <span>自研菜品</span>

          <strong>
            ${page.summary.total}
          </strong>
        </div>

        <div>
          <span>菜单在售</span>

          <strong>
            ${page.summary.activeMenuCount}
          </strong>
        </div>

        <div>
          <span>招牌以上</span>

          <strong>
            ${page.summary.signatureCount}
          </strong>
        </div>

        <div>
          <span>累计销量</span>

          <strong>
            ${page.summary.totalSold}
          </strong>
        </div>
      </section>

      ${
        top
          ? `
            <section class="dish-featured">
              <div>
                <span>
                  当前头牌
                </span>

                <h2>
                  ${escapeHtml(top.name)}
                </h2>

                <p>
                  ${escapeHtml(top.tier.name)}
                  ·
                  ${escapeHtml(top.mastery.name)}
                  ·
                  口碑
                  ${top.market.reputationScore}
                </p>
              </div>

              <strong>
                ${top.market.sold}份
              </strong>
            </section>
          `
          : ""
      }

      <section class="dish-filter-row">
        <button
          type="button"
          data-tier=""
          class="${
            this.tierId ===
            null
              ? "active"
              : ""
          }"
        >
          全部
        </button>

        ${[
          ["home", "家常"],
          ["selected", "优选"],
          ["signature", "招牌"],
          ["famous", "名菜"],
          ["house_special", "镇店"]
        ].map(
          ([id, name]) => `
            <button
              type="button"
              data-tier="${id}"
              class="${
                this.tierId ===
                id
                  ? "active"
                  : ""
              }"
            >
              ${name}
            </button>
          `
        ).join("")}

        <label>
          <input
            type="checkbox"
            data-menu-only
            ${
              this.menuOnly
                ? "checked"
                : ""
            }
          >
          只看菜单菜品
        </label>
      </section>

      <section class="dish-workspace">
        <div class="dish-list">
          ${
            page.dishes.length
              ? page.dishes.map(
                  dish =>
                    this.renderDishCard(
                      dish
                    )
                ).join("")
              : `
                <div class="dish-empty">
                  还没有符合条件的菜品
                </div>
              `
          }
        </div>

        <aside class="dish-detail-panel">
          ${
            this.selectedDishId
              ? this.renderDetail(
                  this.pageSystem
                    .getDishDetail(
                      this.restaurantId,
                      this
                        .selectedDishId
                    )
                )
              : `
                <div class="dish-detail-empty">
                  <strong>
                    选择一道菜
                  </strong>

                  <span>
                    查看成本、销量、熟练度和成长路线
                  </span>
                </div>
              `
          }
        </aside>
      </section>
    `;
  }

  renderDishCard(dish) {
    return `
      <button
        type="button"
        class="dish-card ${
          this.selectedDishId ===
          dish.dishId
            ? "selected"
            : ""
        }"
        data-dish="${dish.dishId}"
      >
        <div class="dish-card-head">
          <div>
            <strong>
              ${escapeHtml(dish.name)}
            </strong>

            <span>
              ${escapeHtml(dish.tier.name)}
              ·
              ${escapeHtml(dish.mastery.name)}
            </span>
          </div>

          <em>
            ${escapeHtml(
              dish
                .outputQuality
                ?.name ??
              "-"
            )}
          </em>
        </div>

        <div class="dish-card-metrics">
          <span>
            品质
            <strong>
              ${dish.researchQuality.score}
            </strong>
          </span>

          <span>
            口碑
            <strong>
              ${dish.market.reputationScore}
            </strong>
          </span>

          <span>
            人气
            <strong>
              ${dish.market.popularityScore}
            </strong>
          </span>

          <span>
            销量
            <strong>
              ${dish.market.sold}
            </strong>
          </span>
        </div>

        <div class="dish-card-foot">
          <span>
            ${
              dish.menu.listed
                ? (
                    dish.menu.active
                      ? "菜单在售"
                      : "已下架"
                  )
                : "未上菜单"
            }
          </span>

          <strong>
            ${
              dish.menu.listed
                ? money(
                    dish.menu.price
                  )
                : money(
                    dish.basePrice
                  )
            }
          </strong>
        </div>
      </button>
    `;
  }

  renderDetail(detail) {
    const {
      dish,
      lifecycle,
      recipe,
      menu
    } = detail;

    return `
      <div class="dish-detail">
        <div class="dish-detail-head">
          <div>
            <span>
              ${escapeHtml(
                lifecycle.tier.name
              )}
              ·
              ${escapeHtml(
                lifecycle.mastery.name
              )}
            </span>

            <h2>
              ${escapeHtml(dish.name)}
            </h2>
          </div>

          <strong class="dish-grade">
            ${escapeHtml(
              dish.qualityGrade ??
              "-"
            )}
          </strong>
        </div>

        <section class="dish-detail-section">
          <h3>成长状态</h3>

          <div class="dish-state-grid">
            <div>
              <span>研发品质</span>
              <strong>
                ${dish.qualityScore}
              </strong>
            </div>

            <div>
              <span>出品品质</span>
              <strong>
                ${
                  lifecycle
                    .outputQuality
                    ?.name ??
                  "-"
                }
              </strong>
            </div>

            <div>
              <span>熟练度</span>
              <strong>
                ${escapeHtml(
                  lifecycle.mastery.name
                )}
              </strong>
            </div>

            <div>
              <span>菜品等级</span>
              <strong>
                ${escapeHtml(
                  lifecycle.tier.name
                )}
              </strong>
            </div>
          </div>
        </section>

        <section class="dish-detail-section">
          <h3>市场表现</h3>

          <div class="dish-stat-tags">
            <span>
              销量
              ${lifecycle.market.sold}
            </span>

            <span>
              口碑
              ${lifecycle.market.reputationScore}
            </span>

            <span>
              人气
              ${lifecycle.market.popularityScore}
            </span>

            <span>
              营收
              ${money(
                lifecycle.market.revenue
              )}
            </span>

            <span>
              毛利
              ${money(
                lifecycle.market.grossProfit
              )}
            </span>

            <span>
              毛利率
              ${percent(
                lifecycle.market.grossMargin
              )}
            </span>
          </div>
        </section>

        ${
          lifecycle.nextTier
            ? `
              <section class="dish-detail-section">
                <h3>
                  下一等级：
                  ${escapeHtml(
                    lifecycle
                      .nextTier
                      .name
                  )}
                </h3>

                <div class="dish-growth-requirements">
                  ${lifecycle.requirements.map(
                    item => `
                      <div class="${
                        item.met
                          ? "met"
                          : ""
                      }">
                        <span>
                          ${escapeHtml(item.name)}
                        </span>

                        <strong>
                          ${item.current}
                          /
                          ${item.required}
                        </strong>
                      </div>
                    `
                  ).join("")}
                </div>
              </section>
            `
            : `
              <section class="dish-detail-section">
                <div class="dish-max-tier">
                  已达到镇店级菜品
                </div>
              </section>
            `
        }

        <section class="dish-detail-section">
          <h3>配方</h3>

          ${
            recipe
              ? `
                <div class="dish-recipe-meta">
                  <span>
                    难度
                    ${recipe.difficulty}
                  </span>

                  <span>
                    烹饪
                    ${recipe.cookingMinutes}分钟
                  </span>

                  <span>
                    食材效率
                    ${Math.round(
                      recipe
                        .ingredientEfficiency *
                      100
                    )}%
                  </span>
                </div>

                <div class="dish-ingredients">
                  ${recipe.ingredients.map(
                    item => `
                      <span>
                        ${escapeHtml(item.name)}
                        ×
                        ${item.quantity}
                        ${escapeHtml(
                          item.unit ??
                          ""
                        )}
                      </span>
                    `
                  ).join("")}
                </div>
              `
              : "暂无配方"
          }
        </section>

        <section class="dish-detail-section">
          <h3>配方改良</h3>

          <div class="dish-improvement-list">
            ${detail.improvements.map(
              item => `
                <button
                  type="button"
                  data-improve="${item.id}"
                  ${
                    item.unlocked
                      ? ""
                      : "disabled"
                  }
                >
                  <strong>
                    ${escapeHtml(item.name)}
                  </strong>

                  <span>
                    熟练度
                    ${item.requiredLevel}
                    解锁
                  </span>
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="dish-detail-section">
          <h3>菜单管理</h3>

          <div class="dish-menu-control">
            <input
              type="number"
              min="1"
              step="1"
              value="${
                menu.price ??
                dish.basePrice
              }"
              data-menu-price
            >

            ${
              menu.listed
                ? `
                  <button
                    type="button"
                    data-action="price"
                  >
                    调整售价
                  </button>

                  <button
                    type="button"
                    data-action="toggle"
                  >
                    ${
                      menu.active
                        ? "下架"
                        : "重新上架"
                    }
                  </button>
                `
                : `
                  <button
                    type="button"
                    data-action="list"
                  >
                    加入菜单
                  </button>
                `
            }
          </div>
        </section>
      </div>
    `;
  }

  renderResearch() {
    const lab =
      this.pageSystem
        .getResearchLab(
          this.restaurantId
        );

    return `
      <section class="dish-research-hero">
        <div>
          <span>研发厨房</span>

          <h2>
            自主创造新菜
          </h2>

          <p>
            食材、做法和灵感共同决定研发结果
          </p>
        </div>

        <button
          type="button"
          data-action="random-research"
        >
          随机研发一款
        </button>
      </section>

      <section class="dish-research-form">
        <label>
          <span>菜品名称</span>

          <input
            type="text"
            maxlength="24"
            placeholder="例如：炙香秘制鸡饭"
            data-research-name
          >
        </label>

        <label>
          <span>菜品分类</span>

          <select
            data-research-category
          >
            ${lab.categories.map(
              item => `
                <option
                  value="${item.id}"
                >
                  ${escapeHtml(item.name)}
                </option>
              `
            ).join("")}
          </select>
        </label>

        <label>
          <span>烹饪方式</span>

          <select
            data-research-method
          >
            ${lab.methods.map(
              item => `
                <option
                  value="${item.id}"
                >
                  ${escapeHtml(item.name)}
                </option>
              `
            ).join("")}
          </select>
        </label>
      </section>

      <section class="dish-research-ingredients">
        <div class="dish-section-title">
          <div>
            <h3>选择食材</h3>
            <span>
              选择2–6种
            </span>
          </div>
        </div>

        <div class="dish-ingredient-grid">
          ${lab.ingredients.map(
            item => `
              <label class="dish-ingredient-option">
                <input
                  type="checkbox"
                  value="${item.id}"
                  data-ingredient-check
                >

                <div>
                  <strong>
                    ${escapeHtml(item.name)}
                  </strong>

                  <span>
                    品质
                    ${item.baseQuality}
                    ·
                    ${money(
                      item.basePurchasePrice
                    )}
                  </span>
                </div>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value="1"
                  data-ingredient-quantity="${item.id}"
                >
              </label>
            `
          ).join("")}
        </div>

        <button
          type="button"
          class="dish-research-submit"
          data-action="manual-research"
        >
          开始研发
        </button>
      </section>
    `;
  }

  bindEvents() {
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
                button
                  .dataset
                  .section;

              this.selectedDishId =
                null;

              this.render();
            }
          );
        }
      );

    if (
      this.section ===
      "research"
    ) {
      this.bindResearch();

      return;
    }

    this.bindMenu();
  }

  bindMenu() {
    this.root
      .querySelectorAll(
        "[data-tier]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.tierId =
                button
                  .dataset
                  .tier ||
                null;

              this.render();
            }
          );
        }
      );

    this.root
      .querySelector(
        "[data-menu-only]"
      )
      ?.addEventListener(
        "change",
        event => {
          this.menuOnly =
            event
              .target
              .checked;

          this.render();
        }
      );

    this.root
      .querySelectorAll(
        "[data-dish]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.selectedDishId =
                button
                  .dataset
                  .dish;

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-improve]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem
                  .improveRecipe({
                    restaurantId:
                      this.restaurantId,

                    dishId:
                      this
                        .selectedDishId,

                    focus:
                      button
                        .dataset
                        .improve
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
      );

    this.root
      .querySelector(
        '[data-action="list"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const price =
            Number(
              this.root
                .querySelector(
                  "[data-menu-price]"
                )
                ?.value
            );

          try {
            this.pageSystem
              .addToMenu({
                restaurantId:
                  this.restaurantId,

                dishId:
                  this
                    .selectedDishId,

                price
              });

            this.render();
          } catch (error) {
            alert(
              error.message
            );
          }
        }
      );

    this.root
      .querySelector(
        '[data-action="price"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const price =
            Number(
              this.root
                .querySelector(
                  "[data-menu-price]"
                )
                ?.value
            );

          try {
            this.pageSystem
              .setMenuPrice(
                this.restaurantId,
                this.selectedDishId,
                price
              );

            this.render();
          } catch (error) {
            alert(
              error.message
            );
          }
        }
      );

    this.root
      .querySelector(
        '[data-action="toggle"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const detail =
              this.pageSystem
                .getDishDetail(
                  this.restaurantId,
                  this
                    .selectedDishId
                );

            this.pageSystem
              .setMenuActive(
                this.restaurantId,
                this.selectedDishId,
                !detail
                  .menu
                  .active
              );

            this.render();
          } catch (error) {
            alert(
              error.message
            );
          }
        }
      );
  }

  bindResearch() {
    this.root
      .querySelector(
        '[data-action="random-research"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const result =
              this.pageSystem
                .randomResearch({
                  restaurantId:
                    this.restaurantId
                });

            this.section =
              "menu";

            this.selectedDishId =
              result.dish.id;

            this.render();
          } catch (error) {
            alert(
              error.message
            );
          }
        }
      );

    this.root
      .querySelector(
        '[data-action="manual-research"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const name =
            this.root
              .querySelector(
                "[data-research-name]"
              )
              ?.value
              ?.trim();

          const category =
            this.root
              .querySelector(
                "[data-research-category]"
              )
              ?.value;

          const method =
            this.root
              .querySelector(
                "[data-research-method]"
              )
              ?.value;

          const selected =
            [
              ...this.root
                .querySelectorAll(
                  "[data-ingredient-check]:checked"
                )
            ];

          const ingredients =
            selected.map(
              checkbox => {
                const id =
                  checkbox
                    .value;

                const quantity =
                  Number(
                    this.root
                      .querySelector(
                        `[data-ingredient-quantity="${id}"]`
                      )
                      ?.value
                  );

                return {
                  ingredientId:
                    id,

                  quantity
                };
              }
            );

          try {
            const result =
              this.pageSystem
                .manualResearch({
                  restaurantId:
                    this.restaurantId,

                  name,
                  category,
                  method,
                  ingredients
                });

            this.section =
              "menu";

            this.selectedDishId =
              result.dish.id;

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

export const dishManagementView =
  new DishManagementView();

export {
  DishManagementView
};
