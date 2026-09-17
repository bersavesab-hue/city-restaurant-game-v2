import { renovationEditorSystem } from "../../systems/RenovationEditorSystem.js";

const DEFAULT_CATEGORY = "dining";

class RenovationMobilePageSystem {
  constructor() {
    this.uiState = new Map();
  }

  open(restaurantId) {
    const editor = renovationEditorSystem.open(restaurantId);

    this.uiState.set(restaurantId, {
      activeCategory: DEFAULT_CATEGORY,
      selectedFurnitureId: null,
      selectedPlacementId: null,
      issuesExpanded: false,
      templatesExpanded: false,
      drawerExpanded: true
    });

    return this.getPage(restaurantId, editor);
  }

  requireUiState(restaurantId) {
    const state = this.uiState.get(restaurantId);

    if (!state) {
      throw new Error("Renovation mobile page is not open");
    }

    return state;
  }

  getPage(restaurantId, editorState = null) {
    const ui = this.requireUiState(restaurantId);
    const editor = editorState ?? renovationEditorSystem.getPageState(restaurantId);

    const category =
      editor.catalog.find(item => item.id === ui.activeCategory) ??
      editor.catalog[0] ??
      null;

    const selectedPlacement = ui.selectedPlacementId
      ? editor.layout.placements.find(item => item.id === ui.selectedPlacementId) ?? null
      : null;

    const selectedFurniture = ui.selectedFurnitureId && category
      ? category.items.find(item => item.id === ui.selectedFurnitureId) ?? null
      : null;

    return {
      restaurantId,
      header: {
        balance: editor.budget.balance,
        currentCost: editor.budget.purchaseCost,
        remaining: editor.budget.remaining,
        affordable: editor.budget.affordable,
        score: editor.analysis.score,
        grade: editor.analysis.grade
      },
      workspace: {
        width: editor.layout.width,
        height: editor.layout.height,
        placements: editor.layout.placements,
        selectedPlacementId: ui.selectedPlacementId
      },
      drawer: {
        expanded: ui.drawerExpanded,
        activeCategory: category?.id ?? null,
        categories: editor.catalog.map(item => ({
          id: item.id,
          name: item.name,
          count: item.items.length
        })),
        items: category?.items ?? [],
        selectedFurnitureId: ui.selectedFurnitureId
      },
      selection: {
        placement: selectedPlacement,
        furniture: selectedFurniture,
        canRotate: Boolean(selectedPlacement),
        canDelete: Boolean(selectedPlacement)
      },
      analysis: {
        score: editor.analysis.score,
        grade: editor.analysis.grade,
        scores: editor.analysis.scores,
        issues: editor.analysis.issues,
        issuesExpanded: ui.issuesExpanded
      },
      templates: {
        expanded: ui.templatesExpanded,
        items: editor.templates
      },
      actions: {
        canSave: editor.actions.canSave && editor.budget.affordable,
        canActivate: editor.actions.canActivate && editor.budget.affordable
      }
    };
  }

  selectCategory(restaurantId, categoryId) {
    const ui = this.requireUiState(restaurantId);
    const editor = renovationEditorSystem.getPageState(restaurantId);

    if (!editor.catalog.some(item => item.id === categoryId)) {
      throw new Error(`Unknown renovation category "${categoryId}"`);
    }

    ui.activeCategory = categoryId;
    ui.selectedFurnitureId = null;
    return this.getPage(restaurantId, editor);
  }

  selectFurniture(restaurantId, furnitureId) {
    const ui = this.requireUiState(restaurantId);
    const editor = renovationEditorSystem.getPageState(restaurantId);
    const exists = editor.catalog.some(group =>
      group.items.some(item => item.id === furnitureId && item.unlocked)
    );

    if (!exists) {
      throw new Error(`Furniture "${furnitureId}" is not available`);
    }

    ui.selectedFurnitureId = furnitureId;
    ui.selectedPlacementId = null;
    return this.getPage(restaurantId, editor);
  }

  selectPlacement(restaurantId, placementId) {
    const ui = this.requireUiState(restaurantId);
    const editor = renovationEditorSystem.getPageState(restaurantId);

    if (!editor.layout.placements.some(item => item.id === placementId)) {
      throw new Error(`Placement "${placementId}" does not exist`);
    }

    ui.selectedPlacementId = placementId;
    ui.selectedFurnitureId = null;
    return this.getPage(restaurantId, editor);
  }

  placeSelected(restaurantId, x, y, rotation = 0) {
    const ui = this.requireUiState(restaurantId);

    if (!ui.selectedFurnitureId) {
      throw new Error("No furniture selected");
    }

    const editor = renovationEditorSystem.addItem(
      restaurantId,
      ui.selectedFurnitureId,
      { x, y, rotation }
    );

    const created = editor.layout.placements.at(-1);
    ui.selectedPlacementId = created?.id ?? null;
    ui.selectedFurnitureId = null;
    return this.getPage(restaurantId, editor);
  }

  moveSelected(restaurantId, x, y) {
    const ui = this.requireUiState(restaurantId);

    if (!ui.selectedPlacementId) {
      throw new Error("No placement selected");
    }

    const editor = renovationEditorSystem.moveItem(
      restaurantId,
      ui.selectedPlacementId,
      x,
      y
    );

    return this.getPage(restaurantId, editor);
  }

  rotateSelected(restaurantId) {
    const ui = this.requireUiState(restaurantId);

    if (!ui.selectedPlacementId) {
      throw new Error("No placement selected");
    }

    const editor = renovationEditorSystem.rotateItem(
      restaurantId,
      ui.selectedPlacementId
    );

    return this.getPage(restaurantId, editor);
  }

  deleteSelected(restaurantId) {
    const ui = this.requireUiState(restaurantId);

    if (!ui.selectedPlacementId) {
      throw new Error("No placement selected");
    }

    const editor = renovationEditorSystem.removeItem(
      restaurantId,
      ui.selectedPlacementId
    );

    ui.selectedPlacementId = null;
    return this.getPage(restaurantId, editor);
  }

  previewTemplate(restaurantId, templateId) {
    this.requireUiState(restaurantId);
    return renovationEditorSystem.previewTemplate(restaurantId, templateId);
  }

  applyTemplate(restaurantId, templateId) {
    const ui = this.requireUiState(restaurantId);
    const editor = renovationEditorSystem.applyTemplate(restaurantId, templateId);
    ui.selectedPlacementId = null;
    ui.selectedFurnitureId = null;
    ui.templatesExpanded = false;
    return this.getPage(restaurantId, editor);
  }

  toggleIssues(restaurantId) {
    const ui = this.requireUiState(restaurantId);
    ui.issuesExpanded = !ui.issuesExpanded;
    return this.getPage(restaurantId);
  }

  toggleTemplates(restaurantId) {
    const ui = this.requireUiState(restaurantId);
    ui.templatesExpanded = !ui.templatesExpanded;
    return this.getPage(restaurantId);
  }

  toggleDrawer(restaurantId) {
    const ui = this.requireUiState(restaurantId);
    ui.drawerExpanded = !ui.drawerExpanded;
    return this.getPage(restaurantId);
  }

  save(restaurantId, { activate = false } = {}) {
    this.requireUiState(restaurantId);
    const result = renovationEditorSystem.save(restaurantId, { activate });
    this.uiState.delete(restaurantId);
    return result;
  }

  discard(restaurantId) {
    renovationEditorSystem.discard(restaurantId);
    const existed = this.uiState.delete(restaurantId);
    return { restaurantId, discarded: existed };
  }
}

export const renovationMobilePageSystem = new RenovationMobilePageSystem();
export { RenovationMobilePageSystem };
