import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { districtEventSystem } from "./DistrictEventSystem.js";
import {
  COMPETITOR_STRATEGIES,
  getCompetitorActiveLimit
} from "../data/competitorRules.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

const STRATEGIES =
  COMPETITOR_STRATEGIES;

class CompetitorDynamicsSystem {
  getHealthScore(store) {
    const district =
      districtSystem.get(
        store.districtId
      );

    const priceScore =
      clamp(
        100 -
        Math.abs(
          (store.priceIndex ?? 1) -
          1
        ) *
        120,
        0,
        100
      );

    const base =
      (store.qualityScore ?? 50) *
        0.3 +
      (store.reputation ?? 50) *
        0.3 +
      (store.serviceScore ?? 50) *
        0.25 +
      priceScore *
        0.15;

    const resilience =
      clamp(
        store.resilience ?? 50,
        0,
        100
      );

    const eventPressure =
      district
        ? (
            districtEventSystem
              .getModifiers(
                district.id
              )
              .competitorPressureMultiplier ??
            1
          )
        : 1;

    const pressure =
      (district?.competition ?? 0) *
      0.1 *
      (
        1 -
        resilience *
        0.003
      ) *
      eventPressure;

    return Math.round(
      clamp(
        base - pressure,
        0,
        100
      )
    );
  }

  getClosureThreshold(store) {
    return Math.round(
      clamp(
        20 +
        (
          store.resilience ??
          50
        ) *
        0.2,
        20,
        40
      )
    );
  }

  pickStrategy(store) {
    const weights =
      store.strategyWeights ??
      {};

    return randomSystem.weightedPick(
      STRATEGIES.map(
        strategy => ({
          value: strategy,
          weight:
            Math.max(
              0,
              Number(
                weights[strategy] ??
                1
              )
            )
        })
      )
    );
  }

  getStrategyChanges(
    store,
    strategy
  ) {
    const discountAggression =
      clamp(
        store.discountAggression ??
        50,
        0,
        100
      );

    const marketing =
      clamp(
        store.marketingTendency ??
        50,
        0,
        100
      );

    const innovation =
      clamp(
        store.innovationTendency ??
        50,
        0,
        100
      );

    switch (strategy) {
      case "discount":
        return {
          priceIndex:
            clamp(
              store.priceIndex -
              (
                0.02 +
                discountAggression /
                2500
              ),
              0.6,
              1.8
            ),

          reputation:
            clamp(
              store.reputation + 1,
              0,
              100
            )
        };

      case "premium":
        return {
          priceIndex:
            clamp(
              store.priceIndex +
              (
                0.03 +
                innovation /
                5000
              ),
              0.6,
              1.8
            ),

          qualityScore:
            clamp(
              store.qualityScore + 2,
              0,
              100
            ),

          reputation:
            clamp(
              store.reputation + 1,
              0,
              100
            )
        };

      case "quality":
        return {
          qualityScore:
            clamp(
              store.qualityScore +
              2 +
              Math.round(
                innovation /
                50
              ),
              0,
              100
            ),

          priceIndex:
            clamp(
              store.priceIndex +
              0.01,
              0.6,
              1.8
            )
        };

      case "service":
        return {
          serviceScore:
            clamp(
              store.serviceScore + 3,
              0,
              100
            )
        };

      case "promotion":
        return {
          priceIndex:
            clamp(
              store.priceIndex -
              0.015,
              0.6,
              1.8
            ),

          reputation:
            clamp(
              store.reputation +
              2 +
              Math.round(
                marketing /
                30
              ),
              0,
              100
            )
        };

      default:
        return {};
    }
  }

  applyStrategy(
    competitorId,
    strategy
  ) {
    if (
      !STRATEGIES.includes(
        strategy
      )
    ) {
      throw new Error(
        "Invalid competitor strategy"
      );
    }

    const store =
      entitySystem.get(
        "competitor_store",
        competitorId
      );

    if (!store) {
      throw new Error(
        "Competitor does not exist"
      );
    }

    const changes =
      this.getStrategyChanges(
        store,
        strategy
      );

    return entitySystem.update(
      "competitor_store",
      competitorId,
      {
        ...changes,
        strategy
      }
    );
  }

  getDistrictActiveCount(
    districtId
  ) {
    return entitySystem
      .filter(
        "competitor_store",
        item =>
          item.districtId ===
            districtId &&
          item.active
      )
      .length;
  }

  getDistrictActiveLimit(
    districtId
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    return getCompetitorActiveLimit(
      district?.competition
    );
  }

  shouldExpand(
    store,
    currentDay,
    health
  ) {
    const tendency =
      clamp(
        store.expansionTendency ??
        0,
        0,
        100
      );

    const lastExpansionDay =
      store.lastExpansionDay ??
      store.openedDay ??
      currentDay;

    const activeCount =
      this.getDistrictActiveCount(
        store.districtId
      );

    const activeLimit =
      this.getDistrictActiveLimit(
        store.districtId
      );

    if (
      !store.active ||
      activeLimit <= 0 ||
      activeCount >=
        activeLimit ||
      health < 82 ||
      tendency < 70 ||
      (store.ageDays ?? 0) < 120 ||
      (store.expansionGeneration ?? 0) >= 2 ||
      currentDay -
        lastExpansionDay <
        120 ||
      currentDay % 30 !== 0
    ) {
      return false;
    }

    const chance =
      clamp(
        (
          tendency -
          60
        ) /
        400,
        0.025,
        0.1
      );

    return randomSystem.chance(
      chance
    );
  }

  createExpansion(
    store,
    currentDay
  ) {
    const activeLimit =
      this.getDistrictActiveLimit(
        store.districtId
      );

    if (
      activeLimit <= 0 ||
      this.getDistrictActiveCount(
        store.districtId
      ) >=
        activeLimit
    ) {
      return null;
    }

    const brandName =
      store.brandName ??
      store.name;

    const related =
      entitySystem.filter(
        "competitor_store",
        item =>
          (
            item.brandName ??
            item.name
          ) ===
          brandName
      );

    const nextBranch =
      related.reduce(
        (max, item) =>
          Math.max(
            max,
            item.branchNumber ??
            1
          ),
        1
      ) +
      1;

    const branch =
      entitySystem.create(
        "competitor_store",
        {
          ...store,

          name:
            `${brandName}·${nextBranch}店`,

          brandName,

          branchNumber:
            nextBranch,

          expansionGeneration:
            (
              store.expansionGeneration ??
              0
            ) +
            1,

          expansionTendency:
            Math.max(
              20,
              (
                store.expansionTendency ??
                0
              ) -
              15
            ),

          qualityScore:
            clamp(
              store.qualityScore - 2,
              0,
              100
            ),

          serviceScore:
            clamp(
              store.serviceScore - 2,
              0,
              100
            ),

          reputation:
            clamp(
              store.reputation - 3,
              0,
              100
            ),

          active: true,

          openedDay:
            currentDay,

          closedDay: null,

          ageDays: 0,

          weakDays: 0,

          healthScore: null,

          lastStrategyDay:
            currentDay,

          lastExpansionDay: null,

          lastProcessedDay: null,

          parentCompetitorId:
            store.id
        }
      );

    entitySystem.update(
      "competitor_store",
      store.id,
      {
        lastExpansionDay:
          currentDay
      }
    );

    eventBus.emit(
      "competitor:expanded",
      {
        parentId:
          store.id,

        branchId:
          branch.id,

        districtId:
          store.districtId,

        day:
          currentDay
      }
    );

    return branch;
  }

  processStore(
    store,
    currentDay
  ) {
    if (
      !store.active ||
      store.lastProcessedDay ===
        currentDay
    ) {
      return store;
    }

    let next = {
      ...store,

      ageDays:
        (store.ageDays ?? 0) + 1,

      qualityScore:
        clamp(
          (store.qualityScore ?? 50) +
          randomSystem.int(-1, 1),
          0,
          100
        ),

      reputation:
        clamp(
          (store.reputation ?? 50) +
          randomSystem.int(-1, 1),
          0,
          100
        ),

      serviceScore:
        clamp(
          (store.serviceScore ?? 50) +
          randomSystem.int(-1, 1),
          0,
          100
        )
    };

    const lastStrategyDay =
      store.lastStrategyDay ??
      store.openedDay ??
      currentDay;

    if (
      currentDay -
      lastStrategyDay >=
      7
    ) {
      const strategy =
        this.pickStrategy(
          next
        );

      next = {
        ...next,
        ...this.getStrategyChanges(
          next,
          strategy
        ),

        strategy,

        lastStrategyDay:
          currentDay
      };

      eventBus.emit(
        "competitor:strategyChanged",
        {
          id: store.id,
          strategy,
          day: currentDay
        }
      );
    }

    const health =
      this.getHealthScore(
        next
      );

    const weakDays =
      health < 40
        ? (store.weakDays ?? 0) + 1
        : Math.max(
            0,
            (store.weakDays ?? 0) - 2
          );

    const closureThreshold =
      this.getClosureThreshold(
        next
      );

    const shouldClose =
      weakDays >=
      closureThreshold;

    const updated =
      entitySystem.update(
        "competitor_store",
        store.id,
        {
          priceIndex:
            next.priceIndex,

          qualityScore:
            next.qualityScore,

          reputation:
            next.reputation,

          serviceScore:
            next.serviceScore,

          strategy:
            next.strategy,

          lastStrategyDay:
            next.lastStrategyDay ??
            lastStrategyDay,

          ageDays:
            next.ageDays,

          weakDays,

          closureThreshold,

          healthScore:
            health,

          active:
            !shouldClose,

          closedDay:
            shouldClose
              ? currentDay
              : null,

          lastProcessedDay:
            currentDay
        }
      );

    if (shouldClose) {
      eventBus.emit(
        "competitor:closed",
        {
          id:
            store.id,

          districtId:
            store.districtId,

          day:
            currentDay
        }
      );
    } else if (
      this.shouldExpand(
        updated,
        currentDay,
        health
      )
    ) {
      this.createExpansion(
        updated,
        currentDay
      );
    }

    return updated;
  }

  pruneClosed(
    currentDay,
    retentionDays = 90
  ) {
    const expired =
      entitySystem.filter(
        "competitor_store",
        item =>
          !item.active &&
          item.closedDay !== null &&
          item.closedDay !==
            undefined &&
          currentDay -
            item.closedDay >=
            retentionDays
      );

    return entitySystem.removeMany(
      "competitor_store",
      expired.map(
        item => item.id
      )
    );
  }

  processDay(currentDay) {
    const stores =
      entitySystem.list(
        "competitor_store"
      );

    let processed = 0;
    let closed = 0;

    const beforeCount =
      stores.length;

    for (const store of stores) {
      if (!store.active) {
        continue;
      }

      const updated =
        this.processStore(
          store,
          currentDay
        );

      processed += 1;

      if (!updated.active) {
        closed += 1;
      }
    }

    const afterProcessingCount =
      entitySystem.count(
        "competitor_store"
      );

    const expanded =
      Math.max(
        0,
        afterProcessingCount -
        beforeCount
      );

    const pruned =
      this.pruneClosed(
        currentDay
      );

    return {
      processed,
      closed,
      expanded,
      pruned,
      total:
        entitySystem.count(
          "competitor_store"
        )
    };
  }
}

export const competitorDynamicsSystem =
  new CompetitorDynamicsSystem();

export {
  CompetitorDynamicsSystem,
  STRATEGIES
};
