import { renovationSystem } from "./RenovationSystem.js";
import { layoutFlowSystem } from "./LayoutFlowSystem.js";
import { financeSystem } from "./FinanceSystem.js";
import { storeProgressSystem } from "./StoreProgressSystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const TEMPLATES = Object.freeze({
  balanced: {
    id: "balanced",
    name: "均衡小店",
    items: [
      "kitchen_station",
      "cashier_counter",
      "table_4",
      "table_4",
      "table_2",
      "waiting_bench",
      "decor_plant",
      "decor_plant"
    ]
  },

  quick_service: {
    id: "quick_service",
    name: "快餐高周转",
    items: [
      "kitchen_station",
      "cashier_counter",
      "table_2",
      "table_2",
      "table_2",
      "table_2",
      "waiting_bench",
      "decor_plant"
    ]
  },

  family_dining: {
    id: "family_dining",
    name: "家庭正餐",
    items: [
      "kitchen_station",
      "cashier_counter",
      "table_4",
      "table_4",
      "table_4",
      "waiting_bench",
      "decor_plant",
      "decor_plant"
    ]
  }
});

class RenovationPlanningSystem {
  getTemplate(id) {
    const template = TEMPLATES[id];

    if (!template) {
      throw new Error(
        `Unknown renovation template "${id}"`
      );
    }

    return structuredClone(template);
  }

  getTemplates() {
    return Object.values(TEMPLATES).map(
      item => structuredClone(item)
    );
  }

  getGeometry(placement) {
    const definition =
      renovationSystem.getFurnitureDefinition(
        placement.furnitureId
      );

    const size =
      renovationSystem.getSize(
        definition,
        placement.rotation ?? 0
      );

    return {
      placement,
      definition,
      x: placement.x,
      y: placement.y,
      width: size.width,
      height: size.height,
      area:
        size.width *
        size.height
    };
  }

  getZoneId(geometry) {
    if (
      geometry.definition.type ===
      "table"
    ) {
      return "dining";
    }

    if (
      geometry.definition.type ===
        "kitchen" ||
      geometry.definition.type ===
        "kitchen_support"
    ) {
      return "kitchen";
    }

    if (
      renovationSystem
        .hasFurnitureRole(
          geometry.definition,
          "waiting"
        )
    ) {
      return "waiting";
    }

    if (
      geometry.definition.type ===
      "service"
    ) {
      return "service";
    }

    if (
      geometry.definition.type ===
      "decor"
    ) {
      return "decor";
    }

    return "other";
  }

  scoreBand(value, minimum, maximum) {
    if (
      value >= minimum &&
      value <= maximum
    ) {
      return 100;
    }

    if (value < minimum) {
      if (minimum <= 0) {
        return 100;
      }

      return Math.round(
        clamp(
          value / minimum * 100,
          35,
          100
        )
      );
    }

    return Math.round(
      clamp(
        100 -
        (value - maximum) * 300,
        35,
        100
      )
    );
  }

  getZoneAnalysis(layout) {
    const geometries =
      (layout.placements ?? []).map(
        item => this.getGeometry(item)
      );

    const cells = {
      dining: 0,
      kitchen: 0,
      service: 0,
      waiting: 0,
      decor: 0,
      other: 0
    };

    for (const geometry of geometries) {
      cells[
        this.getZoneId(geometry)
      ] += geometry.area;
    }

    const totalCells =
      Math.max(
        1,
        layout.width *
        layout.height
      );

    const occupiedCells =
      Object.values(cells).reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const openCells =
      Math.max(
        0,
        totalCells -
        occupiedCells
      );

    const ratios =
      Object.fromEntries(
        Object.entries(cells).map(
          ([key, value]) => [
            key,
            round(
              value / totalCells
            )
          ]
        )
      );

    ratios.open =
      round(
        openCells /
        totalCells
      );

    const scores = {
      dining:
        this.scoreBand(
          ratios.dining,
          0.12,
          0.48
        ),

      kitchen:
        this.scoreBand(
          ratios.kitchen,
          0.06,
          0.28
        ),

      service:
        this.scoreBand(
          ratios.service,
          0.02,
          0.16
        ),

      waiting:
        this.scoreBand(
          ratios.waiting,
          0,
          0.12
        ),

      open:
        this.scoreBand(
          ratios.open,
          0.3,
          0.78
        )
    };

    const zoningScore =
      Math.round(
        scores.dining * 0.32 +
        scores.kitchen * 0.28 +
        scores.service * 0.15 +
        scores.waiting * 0.1 +
        scores.open * 0.15
      );

    const issues = [];

    if (cells.dining === 0) {
      issues.push(
        "missing_dining_zone"
      );
    }

    if (cells.kitchen === 0) {
      issues.push(
        "missing_kitchen_zone"
      );
    }

    if (cells.service === 0) {
      issues.push(
        "missing_service_zone"
      );
    }

    if (cells.waiting === 0) {
      issues.push(
        "missing_waiting_zone"
      );
    }

    if (ratios.open < 0.3) {
      issues.push(
        "insufficient_open_space"
      );
    }

    if (ratios.dining > 0.48) {
      issues.push(
        "dining_zone_overpacked"
      );
    }

    if (ratios.kitchen < 0.06) {
      issues.push(
        "kitchen_zone_too_small"
      );
    }

    return {
      totalCells,
      occupiedCells,
      openCells,
      cells,
      ratios,
      scores,
      zoningScore,
      issues
    };
  }

  getRectangleGap(a, b) {
    const dx = Math.max(
      0,
      a.x -
        (b.x + b.width),
      b.x -
        (a.x + a.width)
    );

    const dy = Math.max(
      0,
      a.y -
        (b.y + b.height),
      b.y -
        (a.y + a.height)
    );

    return Math.sqrt(
      dx * dx +
      dy * dy
    );
  }

  getTableSpacing(layout) {
    const tables =
      (layout.placements ?? [])
        .map(
          item =>
            this.getGeometry(item)
        )
        .filter(
          item =>
            item.definition.type ===
            "table"
        );

    if (tables.length <= 1) {
      return {
        tableCount: tables.length,
        averageNearestGap: null,
        minimumGap: null,
        spacingScore: 100,
        issues: []
      };
    }

    const nearest = [];
    let minimumGap = Infinity;

    for (
      let index = 0;
      index < tables.length;
      index += 1
    ) {
      let best = Infinity;

      for (
        let other = 0;
        other < tables.length;
        other += 1
      ) {
        if (index === other) {
          continue;
        }

        const gap =
          this.getRectangleGap(
            tables[index],
            tables[other]
          );

        best = Math.min(
          best,
          gap
        );

        minimumGap = Math.min(
          minimumGap,
          gap
        );
      }

      nearest.push(best);
    }

    const averageNearestGap =
      nearest.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      nearest.length;

    let spacingScore = 100;

    if (averageNearestGap < 0.5) {
      spacingScore = 60;
    } else if (
      averageNearestGap < 1
    ) {
      spacingScore = 78;
    } else if (
      averageNearestGap < 1.5
    ) {
      spacingScore = 90;
    }

    const issues = [];

    if (minimumGap < 0.5) {
      issues.push(
        "tables_too_close"
      );
    }

    return {
      tableCount: tables.length,
      averageNearestGap:
        round(
          averageNearestGap,
          2
        ),
      minimumGap:
        round(
          minimumGap,
          2
        ),
      spacingScore,
      issues
    };
  }

  getCompletenessScore(layout) {
    const geometries =
      (layout.placements ?? []).map(
        item => this.getGeometry(item)
      );

    const hasTable =
      geometries.some(
        item =>
          item.definition.type ===
          "table"
      );

    const hasKitchen =
      geometries.some(
        item =>
          item.definition.type ===
          "kitchen"
      );

    const hasCashier =
      geometries.some(
        item =>
          renovationSystem
            .hasFurnitureRole(
              item.definition,
              "cashier"
            )
      );

    const hasWaiting =
      geometries.some(
        item =>
          renovationSystem
            .hasFurnitureRole(
              item.definition,
              "waiting"
            )
      );

    let score = 100;

    if (!hasTable) {
      score -= 30;
    }

    if (!hasKitchen) {
      score -= 30;
    }

    if (!hasCashier) {
      score -= 25;
    }

    if (!hasWaiting) {
      score -= 15;
    }

    return clamp(
      score,
      0,
      100
    );
  }

  getGrade(score) {
    if (score >= 90) {
      return "S";
    }

    if (score >= 80) {
      return "A";
    }

    if (score >= 70) {
      return "B";
    }

    if (score >= 60) {
      return "C";
    }

    return "D";
  }

  getAnalysis(restaurantId) {
    const layout =
      renovationSystem.getLayout(
        restaurantId
      );

    if (!layout) {
      return {
        restaurantId,
        initialized: false,
        active: false,
        score: 0,
        grade: "D",
        issues: [
          "layout_not_initialized"
        ]
      };
    }

    const flow =
      layoutFlowSystem.getAnalysis(
        restaurantId
      );

    const zoning =
      this.getZoneAnalysis(layout);

    const spacing =
      this.getTableSpacing(layout);

    const completenessScore =
      this.getCompletenessScore(
        layout
      );

    const flowScore =
      flow.flowScore ?? 0;

    const comfortScore =
      flow.comfortScore ??
      Math.round(
        clamp(
          (flow.comfortMultiplier ?? 1) *
            80,
          0,
          100
        )
      );

    const score =
      Math.round(
        clamp(
          flowScore * 0.32 +
          comfortScore * 0.23 +
          zoning.zoningScore * 0.2 +
          spacing.spacingScore * 0.1 +
          completenessScore * 0.15,
          0,
          100
        )
      );

    const issues = [
      ...(flow.issues ?? []),
      ...zoning.issues,
      ...spacing.issues
    ];

    return {
      restaurantId,
      layoutId: layout.id,
      initialized: true,
      active: Boolean(layout.active),
      score,
      grade:
        this.getGrade(score),

      scores: {
        flow: flowScore,
        comfort: comfortScore,
        zoning:
          zoning.zoningScore,
        spacing:
          spacing.spacingScore,
        completeness:
          completenessScore
      },

      zoning,
      spacing,
      issues: [...new Set(issues)]
    };
  }

  overlaps(candidate, placements) {
    const candidateDefinition =
      renovationSystem
        .getFurnitureDefinition(
          candidate.furnitureId
        );

    const candidateSize =
      renovationSystem.getSize(
        candidateDefinition,
        candidate.rotation ?? 0
      );

    const rectangle = {
      x: candidate.x,
      y: candidate.y,
      width: candidateSize.width,
      height: candidateSize.height
    };

    return placements.some(
      placement => {
        const definition =
          renovationSystem
            .getFurnitureDefinition(
              placement.furnitureId
            );

        const size =
          renovationSystem.getSize(
            definition,
            placement.rotation ?? 0
          );

        return renovationSystem
          .rectanglesOverlap(
            rectangle,
            {
              x: placement.x,
              y: placement.y,
              width: size.width,
              height: size.height
            }
          );
      }
    );
  }

  getCandidateCoordinates(
    layout,
    furnitureId
  ) {
    const definition =
      renovationSystem
        .getFurnitureDefinition(
          furnitureId
        );

    const size =
      renovationSystem.getSize(
        definition,
        0
      );

    const coordinates = [];

    const push = (x, y) => {
      if (
        x < 0 ||
        y < 0 ||
        x + size.width >
          layout.width ||
        y + size.height >
          layout.height
      ) {
        return;
      }

      const key = `${x}:${y}`;

      if (
        coordinates.some(
          item => item.key === key
        )
      ) {
        return;
      }

      coordinates.push({
        key,
        x,
        y
      });
    };

    const right =
      layout.width -
      size.width;

    const bottom =
      layout.height -
      size.height;

    if (
      definition.type === "kitchen" ||
      definition.type ===
        "kitchen_support"
    ) {
      push(right, 0);
      push(right, 2);
    } else if (
      renovationSystem
        .hasFurnitureRole(
          definition,
          "waiting"
        )
    ) {
      push(right, bottom);
      push(0, bottom);
    } else if (
      renovationSystem
        .hasFurnitureRole(
          definition,
          "cashier"
        )
    ) {
      push(right, 2);
      push(
        Math.max(
          0,
          right - 1
        ),
        0
      );
    }

    for (
      let y = 0;
      y <= bottom;
      y += 1
    ) {
      for (
        let x = 0;
        x <= right;
        x += 1
      ) {
        push(x, y);
      }
    }

    return coordinates.map(
      ({ x, y }) => ({
        furnitureId,
        x,
        y,
        rotation: 0
      })
    );
  }

  buildTemplatePreview(
    restaurantId,
    templateId
  ) {
    const template =
      this.getTemplate(
        templateId
      );

    const layout =
      renovationSystem
        .requireLayout(
          restaurantId
        );

    const catalog =
      new Map(
        renovationSystem
          .getCatalog(
            restaurantId
          )
          .map(
            item => [
              item.id,
              item
            ]
          )
      );

    const limits =
      storeProgressSystem.getLimits(
        restaurantId
      );

    const planned = [];
    let tableCount = 0;
    let kitchenStations = 0;
    let totalCost = 0;

    for (
      const furnitureId
      of template.items
    ) {
      const definition =
        catalog.get(
          furnitureId
        );

      if (
        !definition ||
        !definition.unlocked
      ) {
        continue;
      }

      if (
        definition.type ===
          "table" &&
        tableCount >=
          limits.tables
      ) {
        continue;
      }

      if (
        definition.kitchenStations &&
        kitchenStations +
          definition.kitchenStations >
          limits.kitchenStations
      ) {
        continue;
      }

      const candidate =
        this.getCandidateCoordinates(
          layout,
          furnitureId
        )
        .find(
          item =>
            !this.overlaps(
              item,
              [
                ...(layout.placements ?? []),
                ...planned
              ]
            )
        );

      if (!candidate) {
        continue;
      }

      planned.push(candidate);

      totalCost +=
        definition.cost;

      if (
        definition.type ===
        "table"
      ) {
        tableCount += 1;
      }

      kitchenStations +=
        definition.kitchenStations ??
        0;
    }

    const hasTable =
      planned.some(
        item =>
          renovationSystem
            .getFurnitureDefinition(
              item.furnitureId
            ).type === "table"
      );

    const hasKitchen =
      planned.some(
        item =>
          renovationSystem
            .getFurnitureDefinition(
              item.furnitureId
            ).type === "kitchen"
      );

    const hasCashier =
      planned.some(
        item =>
          renovationSystem
            .hasFurnitureRole(
              renovationSystem
                .getFurnitureDefinition(
                  item.furnitureId
                ),
              "cashier"
            )
      );

    return {
      restaurantId,
      templateId:
        template.id,
      templateName:
        template.name,
      canApply:
        (layout.placements ?? [])
          .length === 0 &&
        hasTable &&
        hasKitchen &&
        hasCashier,
      totalCost,
      placements: planned,
      skippedCount:
        template.items.length -
        planned.length,
      availableBalance:
        financeSystem.getBalance(
          restaurantId
        )
    };
  }

  applyTemplate(
    restaurantId,
    templateId,
    {
      activate = true
    } = {}
  ) {
    const layout =
      renovationSystem
        .requireLayout(
          restaurantId
        );

    if (
      (layout.placements ?? [])
        .length > 0
    ) {
      throw new Error(
        "Layout template can only be applied to an empty layout"
      );
    }

    const preview =
      this.buildTemplatePreview(
        restaurantId,
        templateId
      );

    if (!preview.canApply) {
      throw new Error(
        "Template cannot produce a complete layout for this property"
      );
    }

    if (
      preview.availableBalance <
      preview.totalCost
    ) {
      throw new Error(
        "Insufficient funds for renovation template"
      );
    }

    for (
      const placement
      of preview.placements
    ) {
      renovationSystem.placeItem({
        restaurantId,
        ...placement
      });
    }

    if (activate) {
      renovationSystem.activateLayout(
        restaurantId
      );
    }

    return {
      templateId,
      totalCost:
        preview.totalCost,
      layout:
        renovationSystem.getLayout(
          restaurantId
        ),
      analysis:
        this.getAnalysis(
          restaurantId
        )
    };
  }
}

export const renovationPlanningSystem =
  new RenovationPlanningSystem();

export {
  RenovationPlanningSystem,
  TEMPLATES as RENOVATION_TEMPLATES
};
