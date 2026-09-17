import { renovationMobilePageSystem } from "./RenovationMobilePageSystem.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString("zh-CN");
}

function placementStyle(placement, layoutWidth, layoutHeight) {
  return [
    `left:${placement.x / layoutWidth * 100}%`,
    `top:${placement.y / layoutHeight * 100}%`,
    `width:${placement.width / layoutWidth * 100}%`,
    `height:${placement.height / layoutHeight * 100}%`
  ].join(";");
}

function gridPointFromClient(
  rect,
  layoutWidth,
  layoutHeight,
  clientX,
  clientY
) {
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    return null;
  }

  const cellWidth = rect.width / layoutWidth;
  const cellHeight = rect.height / layoutHeight;

  return {
    x: Math.min(
      layoutWidth - 1,
      Math.max(0, Math.floor((clientX - rect.left) / cellWidth))
    ),
    y: Math.min(
      layoutHeight - 1,
      Math.max(0, Math.floor((clientY - rect.top) / cellHeight))
    )
  };
}

class RenovationMobileView {
  constructor({
    root,
    restaurantId,
    pageSystem = renovationMobilePageSystem,
    onSaved = null,
    onClose = null
  }) {
    if (!root) {
      throw new Error("Renovation mobile view requires a root element");
    }

    this.root = root;
    this.restaurantId = restaurantId;
    this.pageSystem = pageSystem;
    this.onSaved = onSaved;
    this.onClose = onClose;

    this.page = null;
    this.drag = null;
    this.preview = null;
    this.templatePreview = null;
    this.message = null;

    this.boundClick = event => this.handleClick(event);
    this.boundPointerDown = event => this.handlePointerDown(event);
    this.boundPointerMove = event => this.handlePointerMove(event);
    this.boundPointerUp = event => this.handlePointerUp(event);
  }

  mount() {
    this.page = this.pageSystem.open(this.restaurantId);
    this.root.addEventListener("click", this.boundClick);
    this.root.addEventListener("pointerdown", this.boundPointerDown);

    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", this.boundPointerMove);
      window.addEventListener("pointerup", this.boundPointerUp);
      window.addEventListener("pointercancel", this.boundPointerUp);
    }

    this.render();
    return this;
  }

  destroy({ discard = false } = {}) {
    this.root.removeEventListener("click", this.boundClick);
    this.root.removeEventListener("pointerdown", this.boundPointerDown);

    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", this.boundPointerMove);
      window.removeEventListener("pointerup", this.boundPointerUp);
      window.removeEventListener("pointercancel", this.boundPointerUp);
    }

    if (discard && this.page) {
      try {
        this.pageSystem.discard(this.restaurantId);
      } catch {
        // Session may already be saved or discarded.
      }
    }

    this.drag = null;
    this.preview = null;
  }

  refresh(page = null) {
    this.page = page ?? this.pageSystem.getPage(this.restaurantId);
    this.render();
    return this.page;
  }

  renderPlacement(item, extraClass = "") {
    const selected =
      item.id === this.page.workspace.selectedPlacementId;

    return `
      <button
        type="button"
        class="renovation-item renovation-item-${escapeHtml(item.type)} ${
          selected ? "is-selected" : ""
        } ${extraClass}"
        style="${placementStyle(
          item,
          this.page.workspace.width,
          this.page.workspace.height
        )}"
        data-placement-id="${escapeHtml(item.id)}"
        aria-label="${escapeHtml(item.name)}"
      >
        <span>${escapeHtml(item.name)}</span>
      </button>
    `;
  }

  renderTemplatePreview() {
    if (!this.templatePreview) {
      return "";
    }

    return this.templatePreview.placements
      .map(item =>
        this.renderPlacement(
          this.pageSystem.getPlacementView(item),
          "is-template-preview"
        )
      )
      .join("");
  }

  render() {
    const page = this.page;

    if (!page) {
      return;
    }

    const selectionTools = page.selection.canRotate
      ? `
        <div class="renovation-floating-tools">
          <button type="button" class="renovation-tool-button" data-action="rotate">
            旋转
          </button>
          ${
            page.selection.canDelete
              ? `<button type="button" class="renovation-tool-button danger" data-action="delete">删除</button>`
              : ""
          }
          <button type="button" class="renovation-tool-button" data-action="clear-selection">
            取消选择
          </button>
        </div>
      `
      : "";

    const issuesPanel = page.analysis.issuesExpanded
      ? `
        <section class="renovation-collapsible-panel" data-panel="issues">
          <div class="renovation-panel-title">布局诊断</div>
          <div class="renovation-score-grid">
            ${Object.entries(page.analysis.scores)
              .map(([key, value]) =>
                `<span>${escapeHtml(key)} <b>${escapeHtml(value)}</b></span>`
              )
              .join("")}
          </div>
          <div class="renovation-issue-list">
            ${
              page.analysis.issues.length > 0
                ? page.analysis.issues
                    .map(issue => `<div>${escapeHtml(issue.label ?? issue.id ?? issue)}</div>`)
                    .join("")
                : "<div>当前没有明显布局问题</div>"
            }
          </div>
        </section>
      `
      : "";

    const templatesPanel = page.templates.expanded
      ? `
        <section class="renovation-collapsible-panel renovation-template-panel" data-panel="templates">
          <div class="renovation-panel-title">快速布局</div>
          ${page.templates.items
            .map(template => `
              <div class="renovation-template-row">
                <span>${escapeHtml(template.name)}</span>
                <div>
                  <button type="button" data-action="preview-template" data-template-id="${escapeHtml(template.id)}">预览</button>
                  <button type="button" data-action="apply-template" data-template-id="${escapeHtml(template.id)}">套用</button>
                </div>
              </div>
            `)
            .join("")}
          ${
            this.templatePreview
              ? `<div class="renovation-template-summary">预览：${escapeHtml(this.templatePreview.template.name)} · ¥${formatMoney(this.templatePreview.budget.purchaseCost)} · ${this.templatePreview.placements.length}件</div>`
              : ""
          }
        </section>
      `
      : "";

    this.root.innerHTML = `
      <main class="renovation-page">
        <header class="renovation-topbar">
          <div class="renovation-stat"><span class="renovation-stat-label">资金</span><span class="renovation-stat-value">¥${formatMoney(page.header.balance)}</span></div>
          <div class="renovation-stat"><span class="renovation-stat-label">本次花费</span><span class="renovation-stat-value">¥${formatMoney(page.header.currentCost)}</span></div>
          <div class="renovation-stat"><span class="renovation-stat-label">剩余</span><span class="renovation-stat-value">¥${formatMoney(page.header.remaining)}</span></div>
          <button type="button" class="renovation-stat renovation-score-button" data-action="toggle-issues">
            <span class="renovation-stat-label">布局评分</span>
            <span class="renovation-stat-value">${escapeHtml(page.header.grade)} · ${escapeHtml(page.header.score)}</span>
          </button>
        </header>

        <section class="renovation-workspace">
          <div class="renovation-canvas-wrap">
            <div
              class="renovation-canvas"
              data-renovation-canvas
              style="--layout-width:${page.workspace.width};--layout-height:${page.workspace.height};"
            >
              ${page.workspace.placements.map(item => this.renderPlacement(item)).join("")}
              ${this.renderTemplatePreview()}
            </div>
          </div>
          ${selectionTools}
          <div class="renovation-workspace-actions">
            <button type="button" data-action="toggle-templates">模板</button>
            <button type="button" data-action="toggle-issues">诊断</button>
          </div>
          ${this.message ? `<div class="renovation-toast">${escapeHtml(this.message)}</div>` : ""}
        </section>

        <section class="renovation-bottom-sheet ${page.drawer.expanded ? "is-expanded" : "is-collapsed"}">
          <button type="button" class="renovation-sheet-toggle" data-action="toggle-drawer" aria-label="展开或收起家具栏">
            <span class="renovation-sheet-handle"></span>
          </button>

          <div class="renovation-drawer-content">
            <nav class="renovation-category-tabs">
              ${page.drawer.categories
                .map(category => `
                  <button
                    type="button"
                    class="renovation-category-tab ${category.id === page.drawer.activeCategory ? "is-active" : ""}"
                    data-action="category"
                    data-category-id="${escapeHtml(category.id)}"
                  >${escapeHtml(category.name)}</button>
                `)
                .join("")}
            </nav>

            <div class="renovation-furniture-strip">
              ${page.drawer.items
                .map(item => `
                  <button
                    type="button"
                    class="renovation-furniture-card ${item.unlocked ? "" : "is-locked"} ${item.affordable ? "" : "is-unaffordable"} ${item.id === page.drawer.selectedFurnitureId ? "is-selected" : ""}"
                    data-action="furniture"
                    data-furniture-id="${escapeHtml(item.id)}"
                    ${item.unlocked ? "" : "disabled"}
                  >
                    <b>${escapeHtml(item.name)}</b>
                    <span>${item.width}×${item.height}</span>
                    <span>¥${formatMoney(item.cost)}</span>
                  </button>
                `)
                .join("")}
            </div>
          </div>

          <div class="renovation-sheet-actions">
            <button type="button" class="renovation-secondary-button" data-action="save" ${page.actions.canSave ? "" : "disabled"}>保存</button>
            <button type="button" class="renovation-primary-button" data-action="activate" ${page.actions.canActivate ? "" : "disabled"}>保存并启用</button>
          </div>
        </section>

        ${issuesPanel}
        ${templatesPanel}
      </main>
    `;
  }

  handleClick(event) {
    const target = event.target.closest?.("[data-action]");

    if (!target || !this.root.contains(target)) {
      return;
    }

    const action = target.dataset.action;

    try {
      if (action === "category") {
        this.templatePreview = null;
        this.refresh(
          this.pageSystem.selectCategory(
            this.restaurantId,
            target.dataset.categoryId
          )
        );
      } else if (action === "furniture") {
        this.templatePreview = null;
        this.refresh(
          this.pageSystem.selectFurniture(
            this.restaurantId,
            target.dataset.furnitureId
          )
        );
      } else if (action === "rotate") {
        this.refresh(this.pageSystem.rotateSelected(this.restaurantId));
      } else if (action === "delete") {
        this.refresh(this.pageSystem.deleteSelected(this.restaurantId));
      } else if (action === "clear-selection") {
        this.refresh(this.pageSystem.clearSelection(this.restaurantId));
      } else if (action === "toggle-issues") {
        this.refresh(this.pageSystem.toggleIssues(this.restaurantId));
      } else if (action === "toggle-templates") {
        this.refresh(this.pageSystem.toggleTemplates(this.restaurantId));
      } else if (action === "toggle-drawer") {
        this.refresh(this.pageSystem.toggleDrawer(this.restaurantId));
      } else if (action === "preview-template") {
        this.templatePreview = this.pageSystem.previewTemplate(
          this.restaurantId,
          target.dataset.templateId
        );
        this.message = `模板预览 ¥${formatMoney(this.templatePreview.budget.purchaseCost)}`;
        this.render();
      } else if (action === "apply-template") {
        this.templatePreview = null;
        this.refresh(
          this.pageSystem.applyTemplate(
            this.restaurantId,
            target.dataset.templateId
          )
        );
      } else if (action === "save") {
        this.commit(false);
      } else if (action === "activate") {
        this.commit(true);
      }
    } catch (error) {
      this.message = error instanceof Error ? error.message : String(error);
      this.render();
    }
  }

  handlePointerDown(event) {
    const furnitureCard = event.target.closest?.("[data-furniture-id]");
    const placement = event.target.closest?.("[data-placement-id]");
    const canvas = event.target.closest?.("[data-renovation-canvas]");

    if (furnitureCard && !furnitureCard.disabled) {
      try {
        this.page = this.pageSystem.selectFurniture(
          this.restaurantId,
          furnitureCard.dataset.furnitureId
        );
        this.drag = {
          pointerId: event.pointerId,
          mode: "place"
        };
        this.templatePreview = null;
        this.render();
      } catch (error) {
        this.message = error instanceof Error ? error.message : String(error);
        this.render();
      }
      return;
    }

    if (placement && !placement.classList.contains("is-template-preview")) {
      try {
        this.page = this.pageSystem.selectPlacement(
          this.restaurantId,
          placement.dataset.placementId
        );
        this.drag = {
          pointerId: event.pointerId,
          mode: "move"
        };
        this.templatePreview = null;
        this.render();
      } catch (error) {
        this.message = error instanceof Error ? error.message : String(error);
        this.render();
      }
      return;
    }

    if (canvas && this.page.drawer.selectedFurnitureId) {
      this.drag = {
        pointerId: event.pointerId,
        mode: "place"
      };
      this.handlePointerMove(event);
    }
  }

  handlePointerMove(event) {
    if (!this.drag || this.drag.pointerId !== event.pointerId) {
      return;
    }

    const canvas = this.root.querySelector("[data-renovation-canvas]");

    if (!canvas) {
      return;
    }

    const point = gridPointFromClient(
      canvas.getBoundingClientRect(),
      this.page.workspace.width,
      this.page.workspace.height,
      event.clientX,
      event.clientY
    );

    if (!point) {
      this.preview = null;
      this.renderDropPreview();
      return;
    }

    try {
      this.preview = this.pageSystem.previewPlacement(
        this.restaurantId,
        point.x,
        point.y
      );
      this.renderDropPreview();
    } catch (error) {
      this.preview = null;
      this.message = error instanceof Error ? error.message : String(error);
    }
  }

  handlePointerUp(event) {
    if (!this.drag || this.drag.pointerId !== event.pointerId) {
      return;
    }

    const drag = this.drag;
    const preview = this.preview;
    this.drag = null;
    this.preview = null;

    if (!preview || !preview.valid) {
      this.message = preview?.reason ?? null;
      this.render();
      return;
    }

    try {
      if (drag.mode === "place") {
        this.page = this.pageSystem.placeSelected(
          this.restaurantId,
          preview.placement.x,
          preview.placement.y,
          preview.placement.rotation
        );
      } else {
        this.page = this.pageSystem.moveSelected(
          this.restaurantId,
          preview.placement.x,
          preview.placement.y
        );
      }

      this.message = null;
      this.render();
    } catch (error) {
      this.message = error instanceof Error ? error.message : String(error);
      this.render();
    }
  }

  renderDropPreview() {
    const canvas = this.root.querySelector("[data-renovation-canvas]");

    if (!canvas) {
      return;
    }

    canvas.querySelector(".renovation-drop-preview")?.remove();

    if (!this.preview) {
      return;
    }

    const node = document.createElement("div");
    node.className = `renovation-drop-preview ${
      this.preview.valid ? "is-valid" : "is-invalid"
    }`;
    node.style.cssText = placementStyle(
      this.preview.placement,
      this.page.workspace.width,
      this.page.workspace.height
    );
    node.textContent = this.preview.placement.name;
    canvas.appendChild(node);
  }

  commit(activate) {
    const result = this.pageSystem.save(
      this.restaurantId,
      { activate }
    );

    this.destroy();
    this.root.innerHTML = `
      <div class="renovation-finished">
        ${activate ? "装修已保存并启用" : "装修草稿已保存"}
      </div>
    `;

    this.onSaved?.(result);
    this.onClose?.({ saved: true, activate });
  }
}

function mountRenovationMobilePage(options) {
  return new RenovationMobileView(options).mount();
}

export {
  RenovationMobileView,
  mountRenovationMobilePage,
  gridPointFromClient,
  placementStyle
};
