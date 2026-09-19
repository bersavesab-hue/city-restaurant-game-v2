import {
  RenovationFloorplanMobileView
} from "./RenovationFloorplanMobileView.js";

import {
  restaurantSystem
} from "../../systems/RestaurantSystem.js";

import {
  gameState
} from "../../core/GameState.js";

import {
  buildGlobalTopBarModel
} from "../components/GlobalChromeModel.js";

import {
  renderGameTopBar,
  renderPageTitle
} from "../components/GameChromeView.js";


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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


class RenovationGameView
  extends RenovationFloorplanMobileView {

  handleClick(
    event
  ) {
    const pageTarget =
      event.target.closest?.(
        "[data-page-target]"
      );

    if (
      pageTarget &&
      this.root.contains(
        pageTarget
      )
    ) {
      event.preventDefault();

      this.commit(
        false
      );

      return;
    }

    super.handleClick(
      event
    );
  }


  getChromeModel() {
    const restaurant =
      restaurantSystem.get(
        this.restaurantId
      );

    return buildGlobalTopBarModel({
      restaurantName:
        restaurant.name,

      balance:
        this.page.header.balance,

      storeLevel:
        restaurant.level,

      reputation:
        restaurant.reputation,

      time:
        gameState.getSection(
          "time"
        ),

      runtime:
        gameState.getSection(
          "runtime"
        ),

      currentStoreId:
        this.restaurantId
    });
  }


  renderFloorSelector() {
    const workspace =
      this.page.workspace;

    if (
      workspace.floors.length <=
      1
    ) {
      return "";
    }

    return `
      <nav class="reno-floor-tabs">
        ${
          workspace.floors
            .map(
              floor => `
                <button
                  type="button"
                  class="${
                    floor.id ===
                    workspace.activeFloorId
                      ? "is-active"
                      : ""
                  }"
                  data-action="floor"
                  data-floor-id="${escapeHtml(
                    floor.id
                  )}"
                >
                  <strong>
                    ${escapeHtml(
                      floor.label
                    )}
                  </strong>

                  <span>
                    ${
                      floor.usableArea ??
                      floor.area ??
                      "-"
                    }㎡
                  </span>
                </button>
              `
            )
            .join("")
        }
      </nav>
    `;
  }


  renderZoneSelector() {
    const workspace =
      this.page.workspace;

    if (
      workspace.mode !==
      "zone"
    ) {
      return "";
    }

    return `
      <nav class="reno-zone-tabs">

        ${
          workspace.zones
            .map(
              zone => `
                <button
                  type="button"
                  class="${
                    zone.id ===
                    workspace.activeZoneId
                      ? "is-active"
                      : ""
                  }"
                  data-action="zone"
                  data-zone-id="${escapeHtml(
                    zone.id
                  )}"
                >
                  ${escapeHtml(
                    zone.label
                  )}
                </button>
              `
            )
            .join("")
        }

      </nav>
    `;
  }


  renderTemplateRail() {
    const templates =
      this.page.templates
        .items ?? [];

    return `
      <aside class="reno-template-rail">

        <header>
          <strong>
            布局模板
          </strong>

          <span>
            快速方案
          </span>
        </header>

        <div class="reno-template-list">

          ${
            templates.length
              ? templates
                  .map(
                    template => `
                      <article>

                        <div class="reno-template-thumb">
                          ▦
                        </div>

                        <strong>
                          ${escapeHtml(
                            template.name
                          )}
                        </strong>

                        <div class="reno-template-actions">

                          <button
                            type="button"
                            data-action="preview-template"
                            data-template-id="${escapeHtml(
                              template.id
                            )}"
                          >
                            预览
                          </button>

                          <button
                            type="button"
                            class="is-primary"
                            data-action="apply-template"
                            data-template-id="${escapeHtml(
                              template.id
                            )}"
                          >
                            套用
                          </button>

                        </div>

                      </article>
                    `
                  )
                  .join("")
              : `
                <div class="reno-template-empty">
                  暂无模板
                </div>
              `
          }

        </div>

      </aside>
    `;
  }


  renderCanvas() {
    const page =
      this.page;

    const viewport =
      this.getViewport();

    const zoomPercent =
      Math.round(
        page.workspace.zoom *
        100
      );

    const zoomMax =
      Math.round(
        660 *
        page.workspace.zoom
      );

    return `
      <section class="reno-canvas-panel">

        <header class="reno-canvas-header">

          <div>

            <strong>
              平面布局
            </strong>

            <span>
              ${
                escapeHtml(
                  page.workspace
                    .activeFloor
                    ?.label ??
                  "1F"
                )
              }

              ·

              ${
                escapeHtml(
                  page.workspace
                    .activeFloor
                    ?.usableArea ??
                  page.workspace
                    .activeFloor
                    ?.area ??
                  "-"
                )
              }㎡
            </span>

          </div>


          <div class="reno-canvas-zoom">

            <button
              type="button"
              data-action="zoom-out"
              ${
                page.workspace
                  .canZoom &&
                page.workspace.zoom >
                  page.workspace
                    .zoomMin
                  ? ""
                  : "disabled"
              }
            >
              −
            </button>

            <button
              type="button"
              data-action="zoom-reset"
            >
              ${zoomPercent}%
            </button>

            <button
              type="button"
              data-action="zoom-in"
              ${
                page.workspace
                  .canZoom &&
                page.workspace.zoom <
                  page.workspace
                    .zoomMax
                  ? ""
                  : "disabled"
              }
            >
              +
            </button>

          </div>

        </header>


        ${this.renderFloorSelector()}

        ${this.renderZoneSelector()}


        <div class="reno-canvas-scroll">

          <div class="reno-canvas-wrap">

            <div
              class="renovation-canvas reno-canvas"
              data-renovation-canvas
              style="
                --layout-width:${viewport.width};
                --layout-height:${viewport.height};
                --zoom-width:${zoomPercent}%;
                --zoom-max:${zoomMax}px;
              "
            >

              ${this.renderStructureMarkers()}

              ${
                page.workspace
                  .placements
                  .map(
                    item =>
                      this.renderPlacement(
                        item
                      )
                  )
                  .join("")
              }

              ${this.renderTemplatePreview()}

            </div>

          </div>

        </div>


        ${this.renderMinimap()}


        ${
          this.message
            ? `
              <div class="reno-toast">
                ${escapeHtml(
                  this.message
                )}
              </div>
            `
            : ""
        }

      </section>
    `;
  }


  renderControlRail() {
    const page =
      this.page;

    return `
      <aside class="reno-control-rail">

        <section class="reno-tool-panel">

          <header>
            操作工具
          </header>

          <div class="reno-tool-grid">

            <button
              type="button"
              data-action="rotate"
              ${
                page.selection
                  .canRotate
                  ? ""
                  : "disabled"
              }
            >
              <span>↻</span>
              旋转
            </button>

            <button
              type="button"
              data-action="delete"
              class="is-danger"
              ${
                page.selection
                  .canDelete
                  ? ""
                  : "disabled"
              }
            >
              <span>×</span>
              删除
            </button>

            <button
              type="button"
              data-action="clear-selection"
            >
              <span>□</span>
              取消选择
            </button>

            ${
              page.workspace
                .minimap
                .enabled
                ? `
                  <button
                    type="button"
                    data-action="toggle-minimap"
                  >
                    <span>▦</span>
                    小地图
                  </button>
                `
                : ""
            }

            <button
              type="button"
              data-action="toggle-issues"
            >
              <span>!</span>
              布局诊断
            </button>

          </div>

        </section>


        <section class="reno-effect-panel">

          <header>
            经营效果
          </header>

          <div class="reno-effect-score">

            <strong>
              ${escapeHtml(
                page.analysis.grade
              )}
            </strong>

            <span>
              综合评分
              ${escapeHtml(
                page.analysis.score
              )}
            </span>

          </div>


          <div class="reno-effect-list">

            ${
              Object
                .entries(
                  page.analysis.scores
                )
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    [
                      key,
                      value
                    ]
                  ) => `
                    <article>
                      <span>
                        ${escapeHtml(
                          key
                        )}
                      </span>

                      <div>
                        <i
                          style="
                            width:${
                              Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number(
                                    value
                                  ) ||
                                  0
                                )
                              )
                            }%
                          "
                        ></i>
                      </div>

                      <strong>
                        ${escapeHtml(
                          value
                        )}
                      </strong>
                    </article>
                  `
                )
                .join("")
            }

          </div>

        </section>


        ${
          page.analysis
            .issuesExpanded
            ? `
              <section class="reno-issues-panel">

                <header>
                  布局问题
                </header>

                ${
                  page.analysis
                    .issues
                    .length
                    ? page.analysis
                        .issues
                        .map(
                          issue => `
                            <div>
                              •
                              ${escapeHtml(
                                issue.label ??
                                issue.id ??
                                issue
                              )}
                            </div>
                          `
                        )
                        .join("")
                    : `
                      <div class="is-good">
                        当前没有明显布局问题
                      </div>
                    `
                }

              </section>
            `
            : ""
        }

      </aside>
    `;
  }


  renderFurnitureDrawer() {
    const drawer =
      this.page.drawer;

    return `
      <section
        class="
          reno-furniture-drawer
          ${
            drawer.expanded
              ? "is-expanded"
              : "is-collapsed"
          }
        "
      >

        <header class="reno-furniture-title">

          <div>
            <strong>
              家具与设施
            </strong>

            <span>
              长按拖入平面图
            </span>
          </div>

          <button
            type="button"
            data-action="toggle-drawer"
          >
            ${
              drawer.expanded
                ? "收起"
                : "展开"
            }
          </button>

        </header>


        ${
          drawer.expanded
            ? `
              <nav class="reno-category-tabs">

                ${
                  drawer.categories
                    .map(
                      category => `
                        <button
                          type="button"
                          class="${
                            category.id ===
                            drawer.activeCategory
                              ? "is-active"
                              : ""
                          }"
                          data-action="category"
                          data-category-id="${escapeHtml(
                            category.id
                          )}"
                        >
                          ${escapeHtml(
                            category.name
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


              <div class="reno-furniture-strip">

                ${
                  drawer.items
                    .map(
                      item => `
                        <button
                          type="button"
                          class="
                            reno-furniture-card
                            ${
                              item.id ===
                              drawer
                                .selectedFurnitureId
                                ? "is-selected"
                                : ""
                            }
                            ${
                              item.unlocked
                                ? ""
                                : "is-locked"
                            }
                            ${
                              item.affordable
                                ? ""
                                : "is-unaffordable"
                            }
                          "
                          data-action="furniture"
                          data-furniture-id="${escapeHtml(
                            item.id
                          )}"
                          ${
                            item.unlocked
                              ? ""
                              : "disabled"
                          }
                        >

                          <div class="reno-furniture-icon">
                            ${
                              item.type ===
                              "table"
                                ? "▣"
                                : item.type ===
                                  "kitchen"
                                  ? "▤"
                                  : item.type ===
                                    "service"
                                    ? "▥"
                                    : "◆"
                            }
                          </div>

                          <strong>
                            ${escapeHtml(
                              item.name
                            )}
                          </strong>

                          <span>
                            ${item.width}×${item.height}
                          </span>

                          <b>
                            ${money(
                              item.cost
                            )}
                          </b>

                        </button>
                      `
                    )
                    .join("")
                }

              </div>
            `
            : ""
        }

      </section>
    `;
  }


  renderSettlementBar() {
    const page =
      this.page;

    return `
      <footer class="reno-settlement">

        <section class="reno-settlement__stats">

          <article>
            <span>
              可用资金
            </span>

            <strong>
              ${money(
                page.header.balance
              )}
            </strong>
          </article>

          <article>
            <span>
              本次装修
            </span>

            <strong class="is-cost">
              ${money(
                page.header.currentCost
              )}
            </strong>
          </article>

          <article>
            <span>
              装修后剩余
            </span>

            <strong>
              ${money(
                page.header.remaining
              )}
            </strong>
          </article>

          <article>
            <span>
              已放置
            </span>

            <strong>
              ${
                page.workspace
                  .totalPlacements
              }件
            </strong>
          </article>

          <article>
            <span>
              布局评分
            </span>

            <strong class="is-score">
              ${
                escapeHtml(
                  page.header.grade
                )
              }
              ·
              ${
                escapeHtml(
                  page.header.score
                )
              }
            </strong>
          </article>

        </section>


        <section class="reno-settlement__actions">

          <button
            type="button"
            class="reno-save-button"
            data-action="save"
            ${
              page.actions
                .canSave
                ? ""
                : "disabled"
            }
          >
            保存草稿
          </button>

          <button
            type="button"
            class="reno-confirm-button"
            data-action="activate"
            ${
              page.actions
                .canActivate
                ? ""
                : "disabled"
            }
          >
            ✓ 确认施工
          </button>

        </section>

      </footer>
    `;
  }


  buildMarkup() {
    const page =
      this.page;

    const topBar =
      this.getChromeModel();

    return `
      <main class="rg-screen renovation-game-page">

        ${renderGameTopBar(
          topBar,
          {
            subtitle:
              "门店装修 · 实时布局"
          }
        )}

        ${renderPageTitle({
          title:
            "装修布局",

          backTarget:
            "restaurant",

          helpLabel:
            "装修说明"
        })}


        <section class="reno-status-strip">

          <article>
            <span>
              当前楼层
            </span>

            <strong>
              ${
                escapeHtml(
                  page.workspace
                    .activeFloor
                    ?.label ??
                  "1F"
                )
              }
            </strong>
          </article>

          <article>
            <span>
              可用面积
            </span>

            <strong>
              ${
                escapeHtml(
                  page.workspace
                    .activeFloor
                    ?.usableArea ??
                  page.workspace
                    .activeFloor
                    ?.area ??
                  "-"
                )
              }㎡
            </strong>
          </article>

          <article>
            <span>
              编辑模式
            </span>

            <strong>
              ${escapeHtml(
                page.workspace
                  .modeLabel
              )}
            </strong>
          </article>

          <article>
            <span>
              当前评分
            </span>

            <strong class="is-gold">
              ${escapeHtml(
                page.header.grade
              )}
              ·
              ${escapeHtml(
                page.header.score
              )}
            </strong>
          </article>

        </section>


        <section class="reno-editor-grid">

          ${this.renderTemplateRail()}

          ${this.renderCanvas()}

          ${this.renderControlRail()}

        </section>


        ${this.renderFurnitureDrawer()}

        ${this.renderSettlementBar()}

      </main>
    `;
  }


  render() {
    if (!this.page) {
      return;
    }

    this.root.innerHTML =
      this.buildMarkup();
  }
}


function mountRenovationGamePage(
  options
) {
  return new RenovationGameView(
    options
  ).mount();
}


export {
  RenovationGameView,
  mountRenovationGamePage
};
