import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { layoutFlowSystem } from "./LayoutFlowSystem.js";
import { renovationPlanningSystem } from "./RenovationPlanningSystem.js";
import { renovationRealityCostSystem } from "./RenovationRealityCostSystem.js";

const CATEGORY_LABELS = Object.freeze({
  dining: "桌椅",
  kitchen: "厨房",
  service: "服务",
  waiting: "等候",
  decor: "装饰"
});

const ISSUE_LABELS = Object.freeze({
  no_dining_tables: "缺少就餐桌椅",
  no_kitchen_station: "缺少厨房灶台",
  no_cashier_counter: "缺少收银台",
  no_waiting_area: "缺少等候区",
  plain_environment: "环境装饰不足",
  layout_too_crowded: "布局过于拥挤",
  low_comfort: "环境舒适度偏低",
  kitchen_route_too_long: "厨房出餐动线过长",
  service_route_too_long: "前厅服务动线过长",
  missing_dining_zone: "缺少就餐区",
  missing_kitchen_zone: "缺少厨房区",
  missing_service_zone: "缺少服务区",
  missing_waiting_zone: "缺少等候区",
  insufficient_open_space: "开放通道空间不足",
  dining_zone_overpacked: "就餐区占用过高",
  kitchen_zone_too_small: "厨房区面积不足",
  tables_too_close: "餐桌间距过小"
});

function clone(value) {
  return structuredClone(value);
}

class RenovationEditorSystem {
  constructor() {
    this.sessions = new Map();
  }

  getCategory(definition) {
    if (definition.type === "table") {
      return "dining";
    }

    if (
      definition.type === "kitchen" ||
      definition.type === "kitchen_support"
    ) {
      return "kitchen";
    }

    if (definition.id === "waiting_bench") {
      return "waiting";
    }

    if (definition.type === "service") {
      return "service";
    }

    return "decor";
  }

  getSessionFloor(session, floorId = null) {
    const id = floorId ?? session.activeFloorId;
    const floor = session.floors.find(item => item.id === id);

    if (!floor) {
      throw new Error(`Renovation floor "${id}" does not exist`);
    }

    return floor;
  }

  open(restaurantId) {
    restaurantSystem.get(restaurantId);

    const layout =
      renovationSystem.requireLayout(
        restaurantId
      );
    const floors = clone(
      renovationSystem.getLayoutFloors(layout)
    );
    const activeFloorId =
      layout.activeFloorId ?? floors[0].id;
    const activeFloor = floors.find(
      item => item.id === activeFloorId
    ) ?? floors[0];

    const session = {
      restaurantId,
      layoutId: layout.id,
      propertyId: layout.propertyId ?? null,
      baselineRevision:
        layout.revision ?? 1,
      originalActive:
        Boolean(layout.active),
      floors,
      activeFloorId: activeFloor.id,
      width: activeFloor.width,
      height: activeFloor.height,
      placements:
        clone(layout.placements ?? []),
      nextDraftNumber: 1,
      openedAt:
        gameState.getSection("time")
          .totalMinutes
    };

    this.sessions.set(
      restaurantId,
      session
    );

    return this.getPageState(
      restaurantId
    );
  }

  hasSession(restaurantId) {
    return this.sessions.has(
      restaurantId
    );
  }

  requireSession(restaurantId) {
    const session =
      this.sessions.get(
        restaurantId
      );

    if (!session) {
      throw new Error(
        "Renovation editor session is not open"
      );
    }

    return session;
  }

  setActiveFloor(restaurantId, floorId) {
    const session = this.requireSession(restaurantId);
    const floor = this.getSessionFloor(session, floorId);

    session.activeFloorId = floor.id;
    session.width = floor.width;
    session.height = floor.height;

    return this.getPageState(restaurantId);
  }

  getDraftLayout(restaurantId) {
    const session =
      this.requireSession(
        restaurantId
      );

    return {
      id: session.layoutId,
      restaurantId,
      propertyId: session.propertyId,
      floors: clone(session.floors),
      floorCount: session.floors.length,
      activeFloorId: session.activeFloorId,
      width: session.width,
      height: session.height,
      active: false,
      placements:
        clone(session.placements)
    };
  }

  getCatalog(restaurantId) {
    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    const groups = {
      dining: [],
      kitchen: [],
      service: [],
      waiting: [],
      decor: []
    };

    for (
      const item
      of renovationSystem.getCatalog(
        restaurantId
      )
    ) {
      const category =
        this.getCategory(item);

      groups[category].push({
        ...item,
        category,
        categoryLabel:
          CATEGORY_LABELS[category],
        affordable:
          balance >= item.cost
      });
    }

    return Object.entries(groups).map(
      ([id, items]) => ({
        id,
        name: CATEGORY_LABELS[id],
        items
      })
    );
  }

  validateDraft(
    restaurantId,
    placements
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    const limits =
      storeProgressSystem.getLimits(
        restaurantId
      );

    const temporary = {
      propertyId: session.propertyId,
      floors: clone(session.floors),
      floorCount: session.floors.length,
      activeFloorId: session.activeFloorId,
      width: session.width,
      height: session.height,
      placements: []
    };

    let tableCount = 0;
    let kitchenStations = 0;
    const furnitureCounts =
      new Map();

    for (const placement of placements) {
      const definition =
        renovationSystem
          .getFurnitureDefinition(
            placement.furnitureId
          );

      if (
        definition.requiresFeature &&
        !storeProgressSystem.isUnlocked(
          restaurantId,
          definition.requiresFeature
        )
      ) {
        throw new Error(
          `Furniture "${definition.id}" is not unlocked`
        );
      }

      if (definition.type === "table") {
        tableCount += 1;
      }

      kitchenStations +=
        definition.kitchenStations ?? 0;

      const count =
        (furnitureCounts.get(
          definition.id
        ) ?? 0) + 1;

      furnitureCounts.set(
        definition.id,
        count
      );

      if (tableCount > limits.tables) {
        throw new Error(
          `Table limit reached: ${limits.tables}`
        );
      }

      if (
        kitchenStations >
        limits.kitchenStations
      ) {
        throw new Error(
          `Kitchen station limit reached: ${limits.kitchenStations}`
        );
      }

      if (
        definition.maxCount &&
        count > definition.maxCount
      ) {
        throw new Error(
          `Furniture limit reached for "${definition.id}": ${definition.maxCount}`
        );
      }

      renovationSystem.validatePlacement(
        temporary,
        placement
      );

      temporary.placements.push(
        placement
      );
    }

    return true;
  }

  addItem(
    restaurantId,
    furnitureId,
    {
      x,
      y,
      rotation = 0,
      floorId = null
    }
  ) {
    const session =
      this.requireSession(
        restaurantId
      );
    const targetFloor = this.getSessionFloor(
      session,
      floorId ?? session.activeFloorId
    );

    const placement = {
      id:
        `draft_${session.nextDraftNumber}`,
      furnitureId,
      floorId: targetFloor.id,
      x,
      y,
      rotation,
      draftNew: true
    };

    const next = [
      ...session.placements,
      placement
    ];

    this.validateDraft(
      restaurantId,
      next
    );

    session.nextDraftNumber += 1;
    session.placements = next;

    return this.getPageState(
      restaurantId
    );
  }

  moveItem(
    restaurantId,
    placementId,
    x,
    y
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    let found = false;

    const next =
      session.placements.map(
        item => {
          if (item.id !== placementId) {
            return item;
          }

          found = true;

          return {
            ...item,
            x,
            y
          };
        }
      );

    if (!found) {
      throw new Error(
        `Placement "${placementId}" does not exist`
      );
    }

    this.validateDraft(
      restaurantId,
      next
    );

    session.placements = next;

    return this.getPageState(
      restaurantId
    );
  }

  moveItemToFloor(
    restaurantId,
    placementId,
    floorId,
    x,
    y
  ) {
    const session = this.requireSession(restaurantId);
    const floor = this.getSessionFloor(session, floorId);
    let found = false;

    const next = session.placements.map(item => {
      if (item.id !== placementId) {
        return item;
      }

      found = true;
      return {
        ...item,
        floorId: floor.id,
        x,
        y
      };
    });

    if (!found) {
      throw new Error(`Placement "${placementId}" does not exist`);
    }

    this.validateDraft(restaurantId, next);
    session.placements = next;
    return this.getPageState(restaurantId);
  }

  rotateItem(
    restaurantId,
    placementId
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    let found = false;

    const next =
      session.placements.map(
        item => {
          if (item.id !== placementId) {
            return item;
          }

          found = true;

          return {
            ...item,
            rotation:
              (item.rotation ?? 0) === 0
                ? 90
                : 0
          };
        }
      );

    if (!found) {
      throw new Error(
        `Placement "${placementId}" does not exist`
      );
    }

    this.validateDraft(
      restaurantId,
      next
    );

    session.placements = next;

    return this.getPageState(
      restaurantId
    );
  }

  removeItem(
    restaurantId,
    placementId
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    const before =
      session.placements.length;

    session.placements =
      session.placements.filter(
        item =>
          item.id !== placementId
      );

    if (
      session.placements.length ===
      before
    ) {
      throw new Error(
        `Placement "${placementId}" does not exist`
      );
    }

    return this.getPageState(
      restaurantId
    );
  }

  reset(restaurantId) {
    const session =
      this.requireSession(
        restaurantId
      );

    const layout =
      renovationSystem.getLayout(
        restaurantId
      );

    if (!layout) {
      throw new Error(
        "Renovation layout does not exist"
      );
    }

    const floors = clone(
      renovationSystem.getLayoutFloors(layout)
    );
    const activeFloorId =
      layout.activeFloorId ?? floors[0].id;
    const activeFloor = floors.find(
      item => item.id === activeFloorId
    ) ?? floors[0];

    session.propertyId = layout.propertyId ?? null;
    session.floors = floors;
    session.activeFloorId = activeFloor.id;
    session.width = activeFloor.width;
    session.height = activeFloor.height;
    session.baselineRevision =
      layout.revision ?? 1;
    session.originalActive =
      Boolean(layout.active);
    session.placements =
      clone(layout.placements ?? []);
    session.nextDraftNumber = 1;

    return this.getPageState(
      restaurantId
    );
  }

  buildTemplatePlacements(
    restaurantId,
    templateId
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    const template =
      renovationPlanningSystem
        .getTemplate(templateId);

    const catalog =
      new Map(
        renovationSystem
          .getCatalog(restaurantId)
          .map(item => [
            item.id,
            item
          ])
      );

    const offFloor = session.placements.filter(
      item =>
        (item.floorId ?? session.floors[0].id) !==
        session.activeFloorId
    );
    const planned = [];
    let draftNumber = 1;

    const workingLayout = {
      propertyId: session.propertyId,
      floors: clone(session.floors),
      activeFloorId: session.activeFloorId,
      width: session.width,
      height: session.height,
      placements: []
    };

    for (
      const furnitureId
      of template.items
    ) {
      const definition =
        catalog.get(furnitureId);

      if (
        !definition ||
        !definition.unlocked
      ) {
        continue;
      }

      const candidates =
        renovationPlanningSystem
          .getCandidateCoordinates(
            workingLayout,
            furnitureId
          );

      let chosen = null;

      for (const candidate of candidates) {
        const placement = {
          id: `draft_${draftNumber}`,
          ...candidate,
          floorId: session.activeFloorId,
          draftNew: true
        };

        try {
          this.validateDraft(
            restaurantId,
            [...offFloor, ...planned, placement]
          );
          chosen = placement;
          break;
        } catch {
          chosen = null;
        }
      }

      if (!chosen) {
        continue;
      }

      planned.push(chosen);
      workingLayout.placements = planned;
      draftNumber += 1;
    }

    const combined = [...offFloor, ...planned];
    this.validateDraft(
      restaurantId,
      combined
    );

    return combined;
  }

  previewTemplate(
    restaurantId,
    templateId
  ) {
    const placements =
      this.buildTemplatePlacements(
        restaurantId,
        templateId
      );

    return {
      template:
        renovationPlanningSystem
          .getTemplate(templateId),
      placements:
        clone(placements),
      budget:
        this.getBudgetForPlacements(
          restaurantId,
          placements
        ),
      analysis:
        this.getAnalysisForPlacements(
          restaurantId,
          placements
        )
    };
  }

  applyTemplate(
    restaurantId,
    templateId
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    session.placements =
      this.buildTemplatePlacements(
        restaurantId,
        templateId
      );

    session.nextDraftNumber =
      session.placements.length + 1;

    return this.getPageState(
      restaurantId
    );
  }

  getBudgetForPlacements(
    restaurantId,
    placements
  ) {
    let equipment = 0;
    let decoration = 0;

    for (const placement of placements) {
      if (!placement.draftNew) {
        continue;
      }

      const definition =
        renovationSystem
          .getFurnitureDefinition(
            placement.furnitureId
          );

      if (definition.type === "decor") {
        decoration += definition.cost;
      } else {
        equipment += definition.cost;
      }
    }

    const purchaseCost =
      equipment +
      decoration;

    const liveLayout =
      renovationSystem
        .getLayout(
          restaurantId
        );

    const construction =
      renovationRealityCostSystem
        .calculateForLayout(
          liveLayout
        );

    const baseConstructionCost =
      construction
        .baseConstructionCost;

    const totalProjectCost =
      purchaseCost +
      baseConstructionCost;

    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    return {
      balance,

      equipment,

      decoration,

      purchaseCost,

      furnishingCost:
        purchaseCost,

      baseConstructionCost,

      constructionRatePerSquareMeter:
        construction
          .ratePerSquareMeter,

      constructionTier:
        construction.tier,

      constructionArea:
        construction.area,

      constructionSource:
        construction.source,

      priceModel:
        "reality_1_to_1_v2",

      currency:
        "CNY",

      totalProjectCost,

      remaining:
        balance -
        totalProjectCost,

      affordable:
        balance >=
        totalProjectCost
    };
  }

  getBudget(restaurantId) {
    return this.getBudgetForPlacements(
      restaurantId,
      this.requireSession(
        restaurantId
      ).placements
    );
  }

  getAnalysisForPlacements(
    restaurantId,
    placements
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    const layout = {
      id: session.layoutId,
      restaurantId,
      propertyId: session.propertyId,
      floors: clone(session.floors),
      floorCount: session.floors.length,
      activeFloorId: session.activeFloorId,
      width: session.width,
      height: session.height,
      active: false,
      placements:
        clone(placements)
    };

    const flow =
      layoutFlowSystem.calculate(
        layout
      );

    const zoning =
      renovationPlanningSystem
        .getZoneAnalysis(layout);

    const spacing =
      renovationPlanningSystem
        .getTableSpacing(layout);

    const completeness =
      renovationPlanningSystem
        .getCompletenessScore(
          layout
        );

    const score = Math.round(
      flow.flowScore * 0.32 +
      flow.comfortScore * 0.23 +
      zoning.zoningScore * 0.2 +
      spacing.spacingScore * 0.1 +
      completeness * 0.15
    );

    const issues = [
      ...(flow.issues ?? []),
      ...(zoning.issues ?? []),
      ...(spacing.issues ?? [])
    ];

    return {
      score,
      grade:
        renovationPlanningSystem
          .getGrade(score),
      scores: {
        flow: flow.flowScore,
        comfort:
          flow.comfortScore,
        zoning:
          zoning.zoningScore,
        spacing:
          spacing.spacingScore,
        completeness
      },
      zoning,
      spacing,
      issues:
        [...new Set(issues)].map(
          id => ({
            id,
            label:
              ISSUE_LABELS[id] ?? id
          })
        )
    };
  }

  getAnalysis(restaurantId) {
    return this.getAnalysisForPlacements(
      restaurantId,
      this.requireSession(
        restaurantId
      ).placements
    );
  }

  getPageState(restaurantId) {
    const session =
      this.requireSession(
        restaurantId
      );
    const activeFloor =
      this.getSessionFloor(session);
    const activePlacements =
      session.placements.filter(
        item =>
          (item.floorId ?? session.floors[0].id) ===
          session.activeFloorId
      );
    const analysis = this.getAnalysis(restaurantId);

    return {
      restaurantId,
      layout: {
        id: session.layoutId,
        propertyId: session.propertyId,
        width: session.width,
        height: session.height,
        floorCount: session.floors.length,
        activeFloorId: session.activeFloorId,
        activeFloor: clone(activeFloor),
        floors: clone(session.floors),
        placements:
          clone(activePlacements),
        totalPlacements:
          session.placements.length,
        baselineRevision:
          session.baselineRevision,
        originallyActive:
          session.originalActive
      },
      catalog:
        this.getCatalog(
          restaurantId
        ),
      budget:
        this.getBudget(
          restaurantId
        ),
      analysis,
      templates:
        renovationPlanningSystem
          .getTemplates(),
      actions: {
        canSave: true,
        canSwitchFloor:
          session.floors.length > 1,
        canActivate:
          analysis.scores
            .completeness === 100
      }
    };
  }

  save(
    restaurantId,
    {
      activate = false
    } = {}
  ) {
    const session =
      this.requireSession(
        restaurantId
      );

    const liveLayout =
      renovationSystem.getLayout(
        restaurantId
      );

    if (!liveLayout) {
      throw new Error(
        "Renovation layout does not exist"
      );
    }

    if (
      (liveLayout.revision ?? 1) !==
      session.baselineRevision
    ) {
      throw new Error(
        "Renovation layout changed outside editor; reopen editor"
      );
    }

    this.validateDraft(
      restaurantId,
      session.placements
    );

    const budget =
      this.getBudget(
        restaurantId
      );

    if (!budget.affordable) {
      throw new Error(
        "Insufficient funds for renovation draft"
      );
    }

    const previewLayout = {
      ...liveLayout,
      floors: clone(session.floors),
      activeFloorId: session.activeFloorId,
      width: session.width,
      height: session.height,
      placements:
        session.placements
    };

    const modifiers =
      renovationSystem
        .getOperationalModifiersFromLayout(
          previewLayout
        );

    if (activate) {
      if (modifiers.seats < 2) {
        throw new Error(
          "Active renovation requires at least 2 seats"
        );
      }

      if (
        modifiers.kitchenStations < 1
      ) {
        throw new Error(
          "Active renovation requires at least 1 kitchen station"
        );
      }
    }

    if (budget.equipment > 0) {
      financeSystem.expense(
        restaurantId,
        budget.equipment,
        FINANCE_CATEGORY.EQUIPMENT,
        "装修编辑器：设备购置"
      );
    }

    if (budget.decoration > 0) {
      financeSystem.expense(
        restaurantId,
        budget.decoration,
        FINANCE_CATEGORY.DECORATION,
        "装修编辑器：装饰购置"
      );
    }

    let nextNumber =
      liveLayout.nextPlacementNumber ??
      1;

    const defaultFloorId = session.floors[0].id;
    const placements =
      session.placements.map(
        item => {
          const clean = {
            furnitureId:
              item.furnitureId,
            floorId:
              item.floorId ?? defaultFloorId,
            x: item.x,
            y: item.y,
            rotation:
              item.rotation ?? 0
          };

          if (item.draftNew) {
            clean.id =
              `placement_${nextNumber}`;
            nextNumber += 1;
          } else {
            clean.id = item.id;
          }

          return clean;
        }
      );

    const time =
      gameState.getSection("time");

    const activeFloor = this.getSessionFloor(session);
    const updated =
      entitySystem.update(
        "renovation_layout",
        liveLayout.id,
        {
          floors: clone(session.floors),
          floorCount: session.floors.length,
          activeFloorId: session.activeFloorId,
          width: activeFloor.width,
          height: activeFloor.height,
          placements,
          nextPlacementNumber:
            nextNumber,
          totalSpent:
            (liveLayout.totalSpent ?? 0) +
            budget.purchaseCost,
          active:
            Boolean(activate),
          activatedDay:
            activate
              ? time.day
              : liveLayout
                  .activatedDay ?? null,
          revision:
            (liveLayout.revision ?? 0) + 1,
          updatedDay:
            time.day
        }
      );

    eventBus.emit(
      "renovation:editorSaved",
      {
        restaurantId,
        layoutId: updated.id,
        activate:
          Boolean(activate),
        purchaseCost:
          budget.purchaseCost,
        floorCount:
          session.floors.length
      }
    );

    this.sessions.delete(
      restaurantId
    );

    return {
      layout: updated,
      budget,
      analysis:
        renovationPlanningSystem
          .getAnalysis(
            restaurantId
          )
    };
  }

  discard(restaurantId) {
    const existed =
      this.sessions.delete(
        restaurantId
      );

    return {
      restaurantId,
      discarded: existed
    };
  }
}

export const renovationEditorSystem =
  new RenovationEditorSystem();

export {
  RenovationEditorSystem,
  CATEGORY_LABELS as RENOVATION_EDITOR_CATEGORIES,
  ISSUE_LABELS as RENOVATION_EDITOR_ISSUES
};
