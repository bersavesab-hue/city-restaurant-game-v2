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


function normalizeIngredientQuantityRule(ingredient) {
  const raw = ingredient?.quantityRule ?? {};

  const min =
    Number.isFinite(raw.min)
      ? raw.min
      : 1;

  const max =
    Number.isFinite(raw.max)
      ? Math.max(raw.max, min)
      : min;

  const step =
    Number.isFinite(raw.step) && raw.step > 0
      ? raw.step
      : 1;

  return { min, max, step };
}

class DishResearchLab {
  constructor({
    pageSystem,
    restaurantId
  }) {
    this.pageSystem =
      pageSystem;

    this.restaurantId =
      restaurantId;

    this.category =
      "stir_fry";

    this.method =
      "stir_fry";

    this.quantities =
      new Map();

    this.selected =
      new Set();

    this.preview =
      null;
  }


  syncPage(
    page
  ) {
    this.page =
      page;

    for (
      const ingredient
      of page.ingredients
    ) {
      if (
        !this.quantities.has(
          ingredient.id
        )
      ) {
        this.quantities.set(
          ingredient.id,
          ingredient
            .quantityRule
            ?.defaultValue ??
          1
        );
      }
    }
  }


  getSelectedIngredients() {
    return [
      ...this.selected
    ]
      .map(
        ingredientId => ({
          ingredientId,

          quantity:
            Number(
              this.quantities.get(
                ingredientId
              )
            )
        })
      );
  }


  calculatePreview() {
    const ingredients =
      this.getSelectedIngredients();


    if (
      ingredients.length < 2 ||
      ingredients.length > 6
    ) {
      this.preview =
        null;

      return null;
    }


    try {
      this.preview =
        this.pageSystem
          .previewResearch({
            restaurantId:
              this.restaurantId,

            method:
              this.method,

            ingredients
          });
    } catch {
      this.preview =
        null;
    }


    return this.preview;
  }


  renderPreview() {
    const preview =
      this.preview;


    if (!preview) {
      return `
        <section class="dish-research-preview is-empty">

          <header>
            <strong>
              研发预估
            </strong>

            <span>
              先选择2–6种食材
            </span>
          </header>

          <div class="dish-preview-empty">

            <b>
              ?
            </b>

            <strong>
              等待配方
            </strong>

            <span>
              调整食材和用量后会实时显示成本、难度和品质范围。
            </span>

          </div>

        </section>
      `;
    }


    return `
      <section class="dish-research-preview">

        <header>

          <div>
            <strong>
              研发预估
            </strong>

            <span>
              随机灵感尚未抽取，因此品质只显示可能区间
            </span>
          </div>

          <b
            class="${
              preview.affordable ===
              false
                ? "is-danger"
                : "is-good"
            }"
          >
            ${
              preview.affordable ===
              false
                ? "资金不足"
                : "可以研发"
            }
          </b>

        </header>


        <div class="dish-preview-quality">

          <div class="dish-preview-quality__score">

            <span>
              品质区间
            </span>

            <strong>
              ${preview.qualityRange.min}
              –
              ${preview.qualityRange.max}
            </strong>

          </div>


        </div>


        <div class="dish-preview-grid">

          <article>
            <span>
              食材成本
            </span>

            <strong>
              ${money(
                preview.estimatedCost
              )}
            </strong>
          </article>

          <article>
            <span>
              研发费用
            </span>

            <strong>
              ${money(
                preview.researchCost
              )}
            </strong>
          </article>

          <article>
            <span>
              出餐时间
            </span>

            <strong>
              ${preview.cookingMinutes}分钟
            </strong>
          </article>

          <article>
            <span>
              制作难度
            </span>

            <strong>
              ${preview.difficulty}/100
            </strong>
          </article>

          <article>
            <span>
              配料结构
            </span>

            <strong>
              ${preview.ingredientScore}/100
            </strong>
          </article>

          <article>
            <span>
              搭配多样性
            </span>

            <strong>
              ${preview.diversityScore}/100
            </strong>
          </article>

        </div>


        <section class="dish-preview-price">

          <span>
            建议售价区间
          </span>

          <strong>
            ${money(
              preview.suggestedPriceRange.min
            )}
            –
            ${money(
              preview.suggestedPriceRange.max
            )}
          </strong>

          <small>
            最终建议售价会根据实际研发品质确定
          </small>

        </section>

      </section>
    `;
  }


  render() {
    this.calculatePreview();


    return `
      <section class="dish-research-v2">

        <section class="dish-panel dish-research-workbench">

          <header class="dish-panel-title">

            <div>
              <strong>
                自主研发实验台
              </strong>

              <span>
                自由组合食材并精确调整每份用量
              </span>
            </div>
<b>
              已研发
              ${this.page.research.customCount}
              /
              ${this.page.research.limit}
            </b>

          </header>


          <section class="dish-research-name">

            <label>
              菜品名称
            </label>

            <input
              type="text"
              maxlength="20"
              placeholder="输入原创菜名"
              data-research-name
            />

          </section>


          <section class="dish-research-section">

            <header>
              <strong>
                ① 菜品类型
              </strong>
            </header>


            <div class="dish-research-options">

              ${
                this.page.research
                  .categories
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
                        data-research-category="${category.id}"
                      >
                        ${escapeHtml(
                          category.label
                        )}
                      </button>
                    `
                  )
                  .join("")
              }

            </div>

          </section>


          <section class="dish-research-section">

            <header>
              <strong>
                ② 烹饪方式
              </strong>
            </header>


            <div class="dish-method-grid">

              ${
                this.page.research
                  .methods
                  .map(
                    method => `
                      <button
                        type="button"
                        class="${
                          this.method ===
                          method.id
                            ? "is-active"
                            : ""
                        }"
                        data-research-method="${method.id}"
                      >

                        <b>
                          ${method.icon}
                        </b>

                        <strong>
                          ${escapeHtml(
                            method.name
                          )}
                        </strong>

                        <small>
                          ${escapeHtml(
                            method.description
                          )}
                        </small>

                      </button>
                    `
                  )
                  .join("")
              }

            </div>

          </section>


          <section class="dish-research-section">

            <header>

              <div>
                <strong>
                  ③ 食材与用量
                </strong>

                <span>
                  已选
                  ${this.selected.size}
                  /6种
                </span>
              </div>

              <small>
                研发结果会保存你设置的真实用量
              </small>

            </header>


            <div class="dish-ingredient-v2-grid">

              ${
                this.page.ingredients
                  .map(
                    ingredient => {
                      const selected =
                        this.selected.has(
                          ingredient.id
                        );

                      const quantity =
                        this.quantities.get(
                          ingredient.id
                        ) ??
                        normalizeIngredientQuantityRule(ingredient).defaultValue;

                      return `
                        <article
                          class="
                            dish-ingredient-v2
                            ${
                              selected
                                ? "is-selected"
                                : ""
                            }
                          "
                          data-ingredient-card="${ingredient.id}"
                        >

                          <button
                            type="button"
                            class="dish-ingredient-select"
                            data-research-ingredient-toggle="${ingredient.id}"
                          >

                            <span
                              class="dish-ingredient-checkbox"
                            >
                              ${
                                selected
                                  ? "✓"
                                  : "+"
                              }
                            </span>

                            <div>

                              <strong>
                                ${escapeHtml(
                                  ingredient.name
                                )}
                              </strong>

                              <small>
                                ${money(
                                  ingredient.purchasePrice
                                )}
                                /
                                ${escapeHtml(
                                  ingredient.unit
                                )}
                              </small>

                            </div>

                          </button>


                          <div class="dish-quantity-control">

                            <button
                              type="button"
                              data-quantity-minus="${ingredient.id}"
                              ${
                                selected
                                  ? ""
                                  : "disabled"
                              }
                            >
                              −
                            </button>

                            <label>

                              <input
                                type="number"
                                min="${normalizeIngredientQuantityRule(ingredient).min}"
                                max="${normalizeIngredientQuantityRule(ingredient).max}"
                                step="${normalizeIngredientQuantityRule(ingredient).step}"
                                value="${quantity}"
                                data-ingredient-quantity="${ingredient.id}"
                                ${
                                  selected
                                    ? ""
                                    : "disabled"
                                }
                              />

                              <span>
                                ${escapeHtml(
                                  ingredient.unit
                                )}
                              </span>

                            </label>

                            <button
                              type="button"
                              data-quantity-plus="${ingredient.id}"
                              ${
                                selected
                                  ? ""
                                  : "disabled"
                              }
                            >
                              ＋
                            </button>

                          </div>

                        </article>
                      `;
                    }
                  )
                  .join("")
              }

            </div>

          </section>


          <section class="dish-research-actions">

            <button
              type="button"
              class="dish-random-research"
              data-research-action="random"
            >
              ⟳ 完全随机研发
            </button>

            <button
              type="button"
              class="dish-custom-research"
              data-research-action="custom"
              ${
                this.selected.size >=
                  2 &&
                this.selected.size <=
                  6 &&
                this.preview
                  ?.affordable !==
                  false
                  ? ""
                  : "disabled"
              }
            >
              ★ 按当前配方研发
            </button>

          </section>

        </section>


        <aside class="dish-research-v2-side">

          ${this.renderPreview()}


          <section class="dish-panel">

            <header class="dish-panel-title">
              <strong>
                菜品成长规则
              </strong>
            </header>

            <div class="dish-grade-list">

              <article>
                <b>品阶</b>
                <span>家常 → 优选 → 招牌 → 名菜 → 镇店</span>
                <strong>长期经营成长</strong>
              </article>

              <article>
                <b>熟练度</b>
                <span>1–5级</span>
                <strong>销量与练习累积</strong>
              </article>

              <article>
                <b>单次出品</b>
                <span>C / B / A / S</span>
                <strong>由批次食材、厨师和菜谱共同决定</strong>
              </article>

            </div>

          </section>

        </aside>

      </section>
    `;
  }


  toggleIngredient(
    ingredientId
  ) {
    if (
      this.selected.has(
        ingredientId
      )
    ) {
      this.selected.delete(
        ingredientId
      );

      return;
    }


    if (
      this.selected.size >=
      6
    ) {
      throw new Error(
        "最多只能选择6种食材"
      );
    }


    this.selected.add(
      ingredientId
    );
  }


  setQuantity(
    ingredientId,
    value
  ) {
    const ingredient =
      this.page.ingredients
        .find(
          item =>
            item.id ===
            ingredientId
        );


    if (!ingredient) {
      return;
    }


    const rule = normalizeIngredientQuantityRule(ingredient);


    const quantity =
      Math.max(
        rule.min,
        Math.min(
          rule.max,
          Number(value) ||
          rule.defaultValue
        )
      );


    this.quantities.set(
      ingredientId,
      quantity
    );
  }


  adjustQuantity(
    ingredientId,
    direction
  ) {
    const ingredient =
      this.page.ingredients
        .find(
          item =>
            item.id ===
            ingredientId
        );


    if (!ingredient) {
      return;
    }


    const rule = normalizeIngredientQuantityRule(ingredient);


    const current =
      Number(
        this.quantities.get(
          ingredientId
        )
      ) ||
      rule.defaultValue;


    const next =
      current +
      rule.step *
      direction;


    const decimals =
      String(
        rule.step
      ).includes(".")
        ? String(
            rule.step
          )
            .split(".")[1]
            .length
        : 0;


    this.setQuantity(
      ingredientId,
      Number(
        next.toFixed(
          decimals
        )
      )
    );
  }
}


export {
  DishResearchLab
};
