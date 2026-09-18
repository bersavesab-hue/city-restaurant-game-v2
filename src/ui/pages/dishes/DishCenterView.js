import {
  dishCenterPageSystem
} from "./DishCenterPageSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  DishResearchLab
} from "./DishResearchLab.js";

import {
  INGREDIENT_ATLAS_DATA_URI
} from "../../../data/ingredientAtlas.js";


function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
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


function defaultQuantity(
  ingredient
) {
  switch (
    ingredient.unit
  ) {
    case "g":
      return 150;

    case "kg":
      return 0.2;

    case "ml":
      return 100;

    case "l":
      return 0.2;

    case "piece":
      return 1;

    default:
      return 1;
  }
}


function renderDishImage(
  dish
) {
  return `
    <div
      class="
        dish-image
        dish-grade-${escapeHtml(
          dish.grade
        )}
      "
      style="
        --dish-image:
          url('${escapeHtml(
            dish.image
          )}');
      "
    >
      <span class="dish-grade-badge">
        ${escapeHtml(
          dish.grade
        )}
      </span>

      ${
        dish.custom
          ? `
            <b class="dish-custom-badge">
              自研
            </b>
          `
          : ""
      }
    </div>
  `;
}


class DishCenterView {
  constructor({
    pageSystem =
      dishCenterPageSystem,

    onNavigate = null
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.root = null;

    this.restaurantId =
      null;

    this.page = null;

    this.tab =
      "menu";

    this.category =
      "all";

    this.message =
      "";

    this.researchMethod =
      "stir_fry";

    this.researchCategory =
      "stir_fry";

    this.researchLab =
      new DishResearchLab({
        pageSystem:
          this.pageSystem,

        restaurantId:
          this.restaurantId
      });
  }


  mount(
    root,
    {
      restaurantId
    }
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.render();

    return this;
  }


  getFilteredCatalog() {
    if (
      this.category ===
      "all"
    ) {
      return this.page.catalog;
    }

    return this.page.catalog
      .filter(
        dish =>
          dish.category ===
          this.category
      );
  }


  renderMetrics() {
    return `
      <section class="dish-metrics">

        ${
          this.page.metrics
            .map(
              metric => `
                <article>

                  <span>
                    ${escapeHtml(
                      metric.label
                    )}
                  </span>

                  <strong>
                    ${escapeHtml(
                      metric.value
                    )}
                  </strong>

                  <small>
                    ${escapeHtml(
                      metric.caption
                    )}
                  </small>

                </article>
              `
            )
            .join("")
        }

      </section>
    `;
  }


  renderTabs() {
    const tabs = [
      [
        "menu",
        "当前菜单",
        this.page.menu.length
      ],

      [
        "catalog",
        "菜品库",
        this.page.catalog.length
      ],

      [
        "research",
        "自主研发",
        this.page.customDishes
          .length
      ]
    ];

    return `
      <nav class="dish-main-tabs">

        ${
          tabs.map(
            (
              [
                id,
                label,
                count
              ]
            ) => `
              <button
                type="button"
                class="${
                  this.tab ===
                  id
                    ? "is-active"
                    : ""
                }"
                data-dish-tab="${id}"
              >
                <strong>
                  ${label}
                </strong>

                <span>
                  ${count}
                </span>
              </button>
            `
          ).join("")
        }

      </nav>
    `;
  }


  renderMenu() {
    return `
      <section class="dish-panel">

        <header class="dish-panel-title">

          <div>
            <strong>
              营业菜单
            </strong>

            <span>
              启用菜品会进入顾客实际点单池
            </span>
          </div>

          <b>
            营业中
            ${this.page.activeMenuCount}
            道
          </b>

        </header>


        <div class="dish-menu-grid">

          ${
            this.page.menu.length
              ? this.page.menu
                  .map(
                    dish => `
                      <article
                        class="
                          dish-menu-card
                          ${
                            dish.active
                              ? "is-active"
                              : "is-disabled"
                          }
                        "
                      >

                        ${renderDishImage(
                          dish
                        )}


                        <div class="dish-menu-card__main">

                          <header>

                            <div>
                              <strong>
                                ${escapeHtml(
                                  dish.name
                                )}
                              </strong>

                              <span>
                                ${escapeHtml(
                                  dish.categoryLabel
                                )}
                                ·
                                ${escapeHtml(
                                  dish.prestigeTitle
                                )}
                              </span>
                            </div>

                            <button
                              type="button"
                              class="
                                dish-state-toggle
                                ${
                                  dish.active
                                    ? "is-on"
                                    : ""
                                }
                              "
                              data-menu-toggle="${dish.menuItemId}"
                            >
                              ${
                                dish.active
                                  ? "营业中"
                                  : "已停售"
                              }
                            </button>

                          </header>


                          <section class="dish-card-stats">

                            <article>
                              <span>
                                已售
                              </span>

                              <strong>
                                ${dish.soldCount}
                              </strong>
                            </article>

                            <article>
                              <span>
                                营收
                              </span>

                              <strong>
                                ${money(
                                  dish.totalRevenue
                                )}
                              </strong>
                            </article>

                            <article>
                              <span>
                                熟练
                              </span>

                              <strong>
                                Lv.${dish.masteryLevel}
                              </strong>
                            </article>

                            <article>
                              <span>
                                毛利
                              </span>

                              <strong>
                                ${
                                  dish.grossMargin ===
                                  null
                                    ? "--"
                                    : `${dish.grossMargin}%`
                                }
                              </strong>
                            </article>

                          </section>


                          <div class="dish-price-row">

                            <label>
                              售价
                            </label>

                            <span>
                              ¥
                            </span>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value="${dish.menuPrice}"
                              data-price-input="${dish.menuItemId}"
                            />

                            <button
                              type="button"
                              data-price-save="${dish.menuItemId}"
                            >
                              保存价格
                            </button>

                          </div>

                        </div>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="dish-empty-state">

                  <strong>
                    当前菜单还是空的
                  </strong>

                  <span>
                    前往菜品库选择菜品，或者自主研发第一道菜。
                  </span>

                  <button
                    type="button"
                    data-dish-tab-jump="catalog"
                  >
                    去选择菜品
                  </button>

                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderCatalog() {
    const dishes =
      this.getFilteredCatalog();

    return `
      <section class="dish-panel">

        <header class="dish-panel-title">

          <div>
            <strong>
              菜品库
            </strong>

            <span>
              选择适合首店定位的菜品加入菜单
            </span>
          </div>

          <button
            type="button"
            class="dish-research-shortcut"
            data-dish-tab-jump="research"
          >
            ＋ 自主研发
          </button>

        </header>


        <nav class="dish-category-tabs">

          ${
            this.page.categories
              .map(
                category => `
                  <button
                    type="button"
                    class="${
                      this.category ===
                      category.id
                        ? "is-active"
                        : ""
                    }"
                    data-dish-category="${category.id}"
                  >
                    ${escapeHtml(
                      category.label
                    )}

                    <small>
                      ${category.count}
                    </small>
                  </button>
                `
              )
              .join("")
          }

        </nav>


        <div class="dish-catalog-grid">

          ${
            dishes.length
              ? dishes.map(
                  dish => `
                    <article
                      class="
                        dish-catalog-card
                        ${
                          dish.onMenu
                            ? "is-on-menu"
                            : ""
                        }
                      "
                    >

                      ${renderDishImage(
                        dish
                      )}


                      <div class="dish-catalog-card__body">

                        <header>
                          <strong>
                            ${escapeHtml(
                              dish.name
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              dish.categoryLabel
                            )}
                          </span>
                        </header>


                        <div class="dish-quality-line">

                          <span>
                            品质
                          </span>

                          <strong>
                            ${escapeHtml(
                              dish.grade
                            )}
                          </strong>

                          ${
                            dish.qualityScore !==
                            null
                              ? `
                                <small>
                                  ${dish.qualityScore}分
                                </small>
                              `
                              : ""
                          }

                        </div>


                        <div class="dish-catalog-info">

                          <span>
                            ${
                              dish.cookingMinutes
                                ? `${dish.cookingMinutes}分钟`
                                : "标准出餐"
                            }
                          </span>

                          <span>
                            ${
                              dish.ingredientCount
                                ? `${dish.ingredientCount}种食材`
                                : "经典配方"
                            }
                          </span>

                          <span>
                            基础价
                            ${money(
                              dish.basePrice
                            )}
                          </span>

                        </div>


                        ${
                          dish.onMenu
                            ? `
                              <button
                                type="button"
                                class="is-added"
                                disabled
                              >
                                ✓ 已在菜单
                              </button>
                            `
                            : dish.hasRecipe
                              ? `
                                <button
                                  type="button"
                                  data-menu-add="${dish.id}"
                                >
                                  ＋ 加入菜单
                                </button>
                              `
                              : `
                                <button
                                  type="button"
                                  disabled
                                >
                                  暂无可用配方
                                </button>
                              `
                        }

                      </div>

                    </article>
                  `
                ).join("")
              : `
                <div class="dish-empty-state">
                  当前分类暂无菜品
                </div>
              `
          }

        </div>

      </section>
    `;
  }


  renderResearch() {
    if (
      !this.researchLab
    ) {
      this.researchLab =
        new DishResearchLab({
          pageSystem:
            this.pageSystem,

          restaurantId:
            this.restaurantId
        });
    }

    this.researchLab
      .syncPage(
        this.page
      );

    return this.researchLab
      .render();
  }


  renderMarkup(
    page
  ) {
    this.page =
      page;

    let content =
      "";

    if (
      this.tab ===
      "catalog"
    ) {
      content =
        this.renderCatalog();
    } else if (
      this.tab ===
      "research"
    ) {
      content =
        this.renderResearch();
    } else {
      content =
        this.renderMenu();
    }

    return `
      <main class="rg-screen dish-center-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "菜单经营 · 自主研发"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "菜品与研发",

          backTarget:
            "opening-setup",

          helpLabel:
            "研发说明"
        })}


        ${this.renderMetrics()}

        ${this.renderTabs()}


        ${
          this.message
            ? `
              <section class="dish-result-message">
                ${escapeHtml(
                  this.message
                )}
              </section>
            `
            : ""
        }


        <section class="dish-center-content">
          ${content}
        </section>


        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                this.restaurantId,

              activePageId:
                "dishes"
            })
        )}

      </main>
    `;
  }


  render() {
    this.root.style.setProperty(
      "--ingredient-atlas",
      `url("${INGREDIENT_ATLAS_DATA_URI}")`
    );

    this.page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );

    this.bind();

    return this.page;
  }


  bind() {
    this.root
      .querySelectorAll(
        "[data-dish-tab]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.tab =
                button.dataset
                  .dishTab;

              this.message =
                "";

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-dish-tab-jump]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.tab =
                button.dataset
                  .dishTabJump;

              this.message =
                "";

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-dish-category]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.category =
                button.dataset
                  .dishCategory;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-menu-add]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem
                  .addToMenu(
                    this.restaurantId,
                    button.dataset
                      .menuAdd
                  );

                this.message =
                  "菜品已经加入营业菜单";

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-menu-toggle]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem
                  .toggleMenuItem(
                    button.dataset
                      .menuToggle
                  );

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-price-save]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              const id =
                button.dataset
                  .priceSave;

              const input =
                this.root
                  .querySelector(
                    `[data-price-input="${id}"]`
                  );

              try {
                this.pageSystem
                  .setPrice(
                    id,
                    Number(
                      input?.value
                    )
                  );

                this.message =
                  "菜品售价已经更新";

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    if (
      this.tab ===
      "research"
    ) {
      this.bindResearchLab();
    }


    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset
                  .pageTarget
              );
            }
          );
        }
      );
  }


  bindResearchLab() {
    const lab =
      this.researchLab;


    this.root
      .querySelectorAll(
        "[data-research-category]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              lab.category =
                button.dataset
                  .researchCategory;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-research-method]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              lab.method =
                button.dataset
                  .researchMethod;

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-research-ingredient-toggle]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                lab.toggleIngredient(
                  button.dataset
                    .researchIngredientToggle
                );

                this.message =
                  "";

                this.render();
              } catch (
                error
              ) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-ingredient-quantity]"
      )
      .forEach(
        input => {
          input.addEventListener(
            "change",
            () => {
              lab.setQuantity(
                input.dataset
                  .ingredientQuantity,
                input.value
              );

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-quantity-minus]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              lab.adjustQuantity(
                button.dataset
                  .quantityMinus,
                -1
              );

              this.render();
            }
          );
        }
      );


    this.root
      .querySelectorAll(
        "[data-quantity-plus]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              lab.adjustQuantity(
                button.dataset
                  .quantityPlus,
                1
              );

              this.render();
            }
          );
        }
      );


    this.root
      .querySelector(
        '[data-research-action="random"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const result =
              this.pageSystem
                .researchRandom(
                  this.restaurantId
                );

            this.message =
              `研发成功：${result.dish.name} · ${result.dish.qualityGrade}级 · 品质${result.dish.qualityScore}`;

            this.render();
          } catch (
            error
          ) {
            this.message =
              error.message;

            this.render();
          }
        }
      );


    this.root
      .querySelector(
        '[data-research-action="custom"]'
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


          const ingredients =
            lab
              .getSelectedIngredients();


          if (
            ingredients.length <
              2 ||
            ingredients.length >
              6
          ) {
            this.message =
              "自主研发必须选择2–6种食材";

            this.render();

            return;
          }


          try {
            const result =
              this.pageSystem
                .researchCustom({
                  restaurantId:
                    this.restaurantId,

                  name,

                  category:
                    lab.category,

                  method:
                    lab.method,

                  ingredients
                });


            this.message =
              `研发成功：${result.dish.name} · ${result.dish.qualityGrade}级 · 品质${result.dish.qualityScore} · 建议售价${money(result.dish.basePrice)}`;


            lab.selected.clear();


            this.render();
          } catch (
            error
          ) {
            this.message =
              error.message;

            this.render();
          }
        }
      );
  }

}


export const dishCenterView =
  new DishCenterView();

export {
  DishCenterView
};
