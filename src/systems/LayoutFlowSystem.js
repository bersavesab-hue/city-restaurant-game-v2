import { renovationSystem } from "./RenovationSystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class LayoutFlowSystem {
  getPlacementGeometry(layout, placement) {
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
      floorId:
        renovationSystem.getPlacementFloorId(
          layout,
          placement
        ),
      width: size.width,
      height: size.height,
      centerX:
        placement.x +
        size.width / 2,
      centerY:
        placement.y +
        size.height / 2,
      area:
        size.width *
        size.height
    };
  }

  getGeometries(layout) {
    return (layout.placements ?? [])
      .map(
        placement =>
          this.getPlacementGeometry(
            layout,
            placement
          )
      );
  }

  getDistance(a, b) {
    if (a.floorId !== b.floorId) {
      return Infinity;
    }

    return (
      Math.abs(
        a.centerX - b.centerX
      ) +
      Math.abs(
        a.centerY - b.centerY
      )
    );
  }

  getAverageNearestDistance(
    sources,
    targets
  ) {
    if (
      sources.length === 0 ||
      targets.length === 0
    ) {
      return null;
    }

    let total = 0;
    let matched = 0;

    for (const source of sources) {
      let nearest = Infinity;

      for (const target of targets) {
        nearest = Math.min(
          nearest,
          this.getDistance(
            source,
            target
          )
        );
      }

      if (Number.isFinite(nearest)) {
        total += nearest;
        matched += 1;
      }
    }

    return matched > 0
      ? total / matched
      : null;
  }

  getTotalCells(layout) {
    const floors =
      renovationSystem.getLayoutFloors(
        layout
      );

    return Math.max(
      1,
      floors.reduce(
        (sum, floor) =>
          sum +
          floor.width * floor.height,
        0
      )
    );
  }

  getDistanceNormalizer(layout) {
    const floors =
      renovationSystem.getLayoutFloors(
        layout
      );

    return Math.max(
      1,
      ...floors.map(
        floor =>
          floor.width +
          floor.height
      )
    );
  }

  calculate(layout) {
    const geometries =
      this.getGeometries(layout);

    const tables =
      geometries.filter(
        item =>
          item.definition.type ===
          "table"
      );

    const kitchens =
      geometries.filter(
        item =>
          item.definition.type ===
          "kitchen"
      );

    const prep =
      geometries.filter(
        item =>
          item.placement.furnitureId ===
          "prep_counter"
      );

    const cashiers =
      geometries.filter(
        item =>
          item.placement.furnitureId ===
          "cashier_counter"
      );

    const waiting =
      geometries.filter(
        item =>
          item.placement.furnitureId ===
          "waiting_bench"
      );

    const decor =
      geometries.filter(
        item =>
          item.definition.type ===
          "decor"
      );

    const totalCells =
      this.getTotalCells(layout);

    const occupiedCells =
      geometries.reduce(
        (sum, item) =>
          sum + item.area,
        0
      );

    const density =
      clamp(
        occupiedCells /
        totalCells,
        0,
        1
      );

    const normalizer =
      this.getDistanceNormalizer(
        layout
      );

    const kitchenTargets =
      prep.length > 0
        ? prep
        : cashiers.length > 0
          ? cashiers
          : tables;

    const kitchenDistance =
      this.getAverageNearestDistance(
        kitchens,
        kitchenTargets
      );

    const serviceDistance =
      this.getAverageNearestDistance(
        cashiers,
        tables
      );

    const normalizedKitchenDistance =
      kitchenDistance === null
        ? null
        : kitchenDistance /
          normalizer;

    const normalizedServiceDistance =
      serviceDistance === null
        ? null
        : serviceDistance /
          normalizer;

    const aisleEfficiency =
      density <= 0.35
        ? 1.03
        : clamp(
            1.03 -
            (density - 0.35) *
            0.9,
            0.72,
            1.03
          );

    let kitchenFlowEfficiency;

    if (kitchens.length === 0) {
      kitchenFlowEfficiency = 0;
    } else if (
      normalizedKitchenDistance ===
      null
    ) {
      kitchenFlowEfficiency = 0.78;
    } else {
      kitchenFlowEfficiency =
        clamp(
          1.08 -
          normalizedKitchenDistance *
          0.65,
          0.75,
          1.08
        );
    }

    let serviceFlowEfficiency;

    if (tables.length === 0) {
      serviceFlowEfficiency = 0;
    } else if (cashiers.length === 0) {
      serviceFlowEfficiency = 0.88;
    } else {
      serviceFlowEfficiency =
        clamp(
          1.06 -
          normalizedServiceDistance *
          0.55,
          0.8,
          1.06
        );
    }

    const kitchenMultiplier =
      kitchens.length > 0
        ? clamp(
            kitchenFlowEfficiency *
            aisleEfficiency,
            0.6,
            1.08
          )
        : 0;

    const serviceMultiplier =
      tables.length > 0
        ? clamp(
            serviceFlowEfficiency *
            aisleEfficiency,
            0.65,
            1.08
          )
        : 0;

    const crowdingPenalty =
      Math.max(
        0,
        density - 0.5
      ) *
      0.5;

    const comfortMultiplier =
      clamp(
        1.02 +
        Math.min(
          0.06,
          decor.length * 0.01
        ) -
        crowdingPenalty,
        0.85,
        1.08
      );

    const waitingSupport =
      waiting.length > 0
        ? clamp(
            1 +
            Math.min(
              0.15,
              waiting.length * 0.06
            ),
            1,
            1.15
          )
        : 0.88;

    const queuePatienceMultiplier =
      clamp(
        waitingSupport *
        comfortMultiplier,
        0.75,
        1.2
      );

    const comfortScore =
      Math.round(
        clamp(
          80 +
          (comfortMultiplier - 1) *
            250,
          45,
          100
        )
      );

    const issues = [];

    if (tables.length === 0) {
      issues.push("no_dining_tables");
    }

    if (kitchens.length === 0) {
      issues.push("no_kitchen_station");
    }

    if (cashiers.length === 0) {
      issues.push("no_cashier_counter");
    }

    if (waiting.length === 0) {
      issues.push("no_waiting_area");
    }

    if (decor.length === 0) {
      issues.push("plain_environment");
    }

    if (density > 0.58) {
      issues.push("layout_too_crowded");
    }

    if (comfortMultiplier < 0.95) {
      issues.push("low_comfort");
    }

    if (
      normalizedKitchenDistance !==
        null &&
      normalizedKitchenDistance >
        0.35
    ) {
      issues.push("kitchen_route_too_long");
    }

    if (
      normalizedServiceDistance !==
        null &&
      normalizedServiceDistance >
        0.35
    ) {
      issues.push("service_route_too_long");
    }

    const flowScore =
      Math.round(
        clamp(
          (
            kitchenMultiplier * 0.4 +
            serviceMultiplier * 0.4 +
            aisleEfficiency * 0.2
          ) /
          1.03 *
          100,
          0,
          100
        )
      );

    return {
      width: layout.width,
      height: layout.height,
      floorCount:
        renovationSystem
          .getLayoutFloors(layout)
          .length,
      occupiedCells,
      totalCells,
      density:
        Number(
          density.toFixed(3)
        ),

      tableCount:
        tables.length,
      kitchenCount:
        kitchens.length,
      prepCount:
        prep.length,
      cashierCount:
        cashiers.length,
      waitingCount:
        waiting.length,
      decorCount:
        decor.length,

      kitchenDistance:
        kitchenDistance === null
          ? null
          : Number(
              kitchenDistance.toFixed(2)
            ),

      serviceDistance:
        serviceDistance === null
          ? null
          : Number(
              serviceDistance.toFixed(2)
            ),

      normalizedKitchenDistance:
        normalizedKitchenDistance === null
          ? null
          : Number(
              normalizedKitchenDistance
                .toFixed(3)
            ),

      normalizedServiceDistance:
        normalizedServiceDistance === null
          ? null
          : Number(
              normalizedServiceDistance
                .toFixed(3)
            ),

      aisleEfficiency:
        Number(
          aisleEfficiency.toFixed(3)
        ),

      kitchenFlowEfficiency:
        Number(
          kitchenFlowEfficiency
            .toFixed(3)
        ),

      serviceFlowEfficiency:
        Number(
          serviceFlowEfficiency
            .toFixed(3)
        ),

      kitchenMultiplier:
        Number(
          kitchenMultiplier.toFixed(3)
        ),

      serviceMultiplier:
        Number(
          serviceMultiplier.toFixed(3)
        ),

      comfortMultiplier:
        Number(
          comfortMultiplier.toFixed(3)
        ),

      queuePatienceMultiplier:
        Number(
          queuePatienceMultiplier
            .toFixed(3)
        ),

      comfortScore,
      flowScore,
      issues
    };
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
        comfortScore: 80,
        flowScore: 100,
        issues: []
      };
    }

    return {
      restaurantId,
      layoutId: layout.id,
      initialized: true,
      active: Boolean(layout.active),
      ...this.calculate(layout)
    };
  }

  getOperationalEffects(
    restaurantId
  ) {
    const layout =
      renovationSystem.getLayout(
        restaurantId
      );

    if (!layout || !layout.active) {
      return {
        active: false,
        kitchenMultiplier: 1,
        serviceMultiplier: 1,
        comfortMultiplier: 1,
        queuePatienceMultiplier: 1,
        comfortScore: 80,
        kitchenCapacityPerHour:
          Infinity,
        flowScore: 100,
        issues: []
      };
    }

    const analysis =
      this.calculate(layout);

    const baseKitchenCapacity =
      renovationSystem
        .getKitchenCapacityPerHour(
          restaurantId
        );

    return {
      active: true,

      kitchenMultiplier:
        analysis.kitchenMultiplier,

      serviceMultiplier:
        analysis.serviceMultiplier,

      comfortMultiplier:
        analysis.comfortMultiplier,

      queuePatienceMultiplier:
        analysis.queuePatienceMultiplier,

      comfortScore:
        analysis.comfortScore,

      kitchenCapacityPerHour:
        Math.max(
          1,
          Math.floor(
            baseKitchenCapacity *
            analysis.kitchenMultiplier
          )
        ),

      flowScore:
        analysis.flowScore,

      issues:
        [...analysis.issues]
    };
  }
}

export const layoutFlowSystem =
  new LayoutFlowSystem();

export { LayoutFlowSystem };
