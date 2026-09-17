import { renovationEditorSystem } from "../../systems/RenovationEditorSystem.js";
import { renovationSystem } from "../../systems/RenovationSystem.js";

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
      pendingRotation: 0,
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

  getPlacementView(placement) {
    const definition = renovationSystem.getFurnitureDefinition(
      placement.furnitureId
    );
    const rotation = placement.rotation ?? 0;
    const size = renovationSystem.getSize(definition, rotation);

    return {
      ...structuredClone(placement),
      name: definition.name,
      type: definition.type,
      width: size.width,
      height: size.height,
      seats: definition.seats ?? 0,
      cost: definition.cost
    };
  }

  findCatalogItem(editor, furnitureId) {
    for (const group of editor.catalog) {
      const item = group.items.find(
        candidate => candidate.id === furnitureId
      );

      if (item) {
        return item;
      }
    }

    return null;
  }

  getPage(restaurantId, editorState = null) {
    const ui = this.requireUiState(restaurantId);
    const editor =
      editorState ?? renovationEditorSystem.getPageState(restaurantId);

    const category =
      editor.catalog.find(item => item.id === ui.activeCategory) ??
      editor.catalog[0] ??
      null;

    const selectedPlacement = ui.selectedPlacementId
      ? editor.layout.placements.find(
          item => item.id === ui.selectedPlacementId
        ) ?? null
      : null;

    const selectedFurniture = ui.selectedFurnitureId
      ? this.findCatalogItem(editor, ui.selectedFurnitureId)
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
        placements: editor.layout.placements.map(
          item => this.getPlacementView(item)
        ),
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
        selectedFurnitureId: ui.selectedFurnitureId,
        pendingRotation: ui.pendingRotation
      },
      selection: {
        placement: selectedPlacement
          ? this.getPlacementView(selectedPlacement)
          : null,
        furniture: selectedFurniture,
        pendingRotation: ui.pendingRotation,
        canRotate: Boolean(selectedPlacement || selectedFurniture),
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
        canActivate:
          editor.actions.canActivate && editor.budget.affordable
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
    ui.pendingRotation = 0;
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
    ui.pendingRotation = 0;
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
    ui.pendingRotation = 0;
    return this.getPage(restaurantId, editor);
  }

  clearSelection(restaurantId) {
    const ui = this.requireUiState(restaurantId);
    ui.selectedPlacementId = null;
    ui.selectedFurnitureId = null;
    ui.pendingRotation = 0;
    return this.getPage(restaurantId);
  }

  previewPlacement(restaurantId, x, y, rotation = null) {
    const ui = this.requireUiState(restaurantId);
    const editor = renovationEditorSystem.getPageState(restaurantId);

    let candidate = null;
    let placements = editor.layout.placements;
    let mode = null;

    if (ui.selectedFurnitureId) {
      mode = "place";
      candidate = {
        id: "preview_new",
        furnitureId: ui.selectedFurnitureId,
        x,
        y,
        rotation: rotation ?? ui.pendingRotation,
        draftNew: true
      };
      placements = [...placements, candidate];
    } else if (ui.selectedPlacementId) {
      mode = "move";
      const current = placements.find(
        item => item.id === ui.selectedPlacementId
      );

      if (!current) {
        throw new Error(
          `Placement "${ui.selectedPlacementId}" does not exist`
        );
      }

      candidate = {
        ...current,
        x,
        y,
        rotation: rotation ?? current.rotation ?? 0
      };
      placements = placements.map(item =>
        item.id === current.id ? candidate : item
      );
    } else {
      throw new Error("No furniture or placement selected");
    }

    try {
      renovationEditorSystem.validateDraft(
        restaurantId,
        placements
      );

      return {
        valid: true,
        mode,
        placement: this.getPlacementView(candidate),
        reason: null
      };
    } catch (error) {
      return {
        valid: false,
        mode,
        placement: this.getPlacementView(candidate),
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }

  placeSelected(restaurantId, x, y, rotation = null) {
    const ui = this.requireUiState(restaurantId);

    if (!ui.selectedFurnitureId) {
      throw new Error("No furniture selected");
    }

    const editor = renovationEditorSystem.addItem(
      restaurantId,
      ui.selectedFurnitureId,
      {
        x,
        y,
        rotation: rotation ?? ui.pendingRotation
      }
    );

    const created = editor.layout.placements.at(-1);
    ui.selectedPlacementId = created?.id ?? null;
    ui.selectedFurnitureId = null;
    ui.pendingRotation = 0;
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

    if (ui.selectedPlacementId) {
      const editor = renovationEditorSystem.rotateItem(
        restaurantId,
        ui.selectedPlacementId
      );

      return this.getPage(restaurantId, editor);
    }

    if (ui.selectedFurnitureId) {
      ui.pendingRotation = ui.pendingRotation === 0 ? 90 : 0;
      return this.getPage(restaurantId);
    }

    throw new Error("No furniture or placement selected");
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
    const editor = renovationEditorSystem.applyTemplate(
      restaurantId,
      templateId
    );
    ui.selectedPlacementId = null;
    ui.selectedFurnitureId = null;
    ui.pendingRotation = 0;
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
    const result = renovationEditorSystem.save(
      restaurantId,
      { activate }
    );
    this.uiState.delete(restaurantId);
    return result;
  }

  discard(restaurantId) {
    renovationEditorSystem.discard(restaurantId);
    const existed = this.uiState.delete(restaurantId);
    return { restaurantId, discarded: existed };
  }
}

export const renovationMobilePageSystem =
  new RenovationMobilePageSystem();
export { RenovationMobilePageSystem };
