import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

const REQUIRED_SOURCE_KINDS = new Set([
  "official_statistics",
  "wholesale_market",
  "industry_report",
  "platform_index",
  "utility_tariff",
  "commercial_listing_sample",
  "manual_reference"
]);

class RealityDataSnapshotSystem {
  validate(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      throw new TypeError("Reality data snapshot must be an object");
    }

    if (!snapshot.snapshotId || !snapshot.currency || !snapshot.macro) {
      throw new Error("Reality data snapshot is missing required metadata");
    }

    if (snapshot.sources !== undefined) {
      if (!Array.isArray(snapshot.sources)) {
        throw new Error("Reality data sources must be an array");
      }

      for (const source of snapshot.sources) {
        if (!source?.id || !source?.kind || !REQUIRED_SOURCE_KINDS.has(source.kind)) {
          throw new Error("Reality data snapshot contains an invalid source");
        }
      }
    }

    return true;
  }

  importSnapshot(snapshot) {
    this.validate(snapshot);

    const current = economicBaselineSystem.getSnapshot();
    const next = {
      ...current,
      ...structuredClone(snapshot),
      sourcePolicy: {
        ...current.sourcePolicy,
        ...(snapshot.sourcePolicy ?? {})
      },
      macro: {
        ...current.macro,
        ...(snapshot.macro ?? {})
      },
      ingredientReference: {
        ...current.ingredientReference,
        ...(snapshot.ingredientReference ?? {})
      },
      laborReference: {
        ...current.laborReference,
        ...(snapshot.laborReference ?? {})
      },
      commercialRentReference: {
        ...current.commercialRentReference,
        ...(snapshot.commercialRentReference ?? {})
      },
      utilitiesReference: {
        ...current.utilitiesReference,
        ...(snapshot.utilitiesReference ?? {})
      },
      logisticsReference: {
        ...current.logisticsReference,
        ...(snapshot.logisticsReference ?? {})
      },
      renovationReference: {
        ...current.renovationReference,
        ...(snapshot.renovationReference ?? {})
      },
      furnitureReference: {
        ...current.furnitureReference,
        ...(snapshot.furnitureReference ?? {})
      },
      equipmentReference: {
        ...current.equipmentReference,
        ...(snapshot.equipmentReference ?? {})
      },
      demandElasticity: {
        ...current.demandElasticity,
        ...(snapshot.demandElasticity ?? {})
      }
    };

    return economicBaselineSystem.loadSnapshot(next);
  }

  getSourceSummary() {
    const snapshot = economicBaselineSystem.getSnapshot();
    return {
      snapshotId: snapshot.snapshotId,
      currency: snapshot.currency,
      regionModel: snapshot.regionModel,
      sourcePolicy: snapshot.sourcePolicy,
      sources: structuredClone(snapshot.sources ?? [])
    };
  }
}

export const realityDataSnapshotSystem = new RealityDataSnapshotSystem();
export { RealityDataSnapshotSystem, REQUIRED_SOURCE_KINDS };
