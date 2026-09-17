import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";

import { districtSystem } from "./DistrictSystem.js";

const EVENTS = Object.freeze({
  convention: {
    id: "convention",
    name: "附近展会",
    weight: 12,
    minDays: 2,
    maxDays: 4,

    modifiers: {
      demandMultiplier: 1.18,
      spendingMultiplier: 1.08,

      segmentMultipliers: {
        office_worker: 1.15,
        tourist: 1.4
      }
    }
  },

  road_construction: {
    id: "road_construction",
    name: "道路施工",
    weight: 10,
    minDays: 4,
    maxDays: 8,

    modifiers: {
      demandMultiplier: 0.78,

      segmentMultipliers: {
        tourist: 0.8
      }
    }
  },

  severe_weather: {
    id: "severe_weather",
    name: "恶劣天气",
    weight: 8,
    minDays: 1,
    maxDays: 2,

    modifiers: {
      demandMultiplier: 0.78,

      segmentMultipliers: {
        tourist: 0.65,
        office_worker: 0.9,
        student: 0.9
      }
    }
  },

  school_opening: {
    id: "school_opening",
    name: "学校开学",
    weight: 8,
    minDays: 2,
    maxDays: 4,

    modifiers: {
      demandMultiplier: 1.06,

      segmentMultipliers: {
        student: 1.45,
        resident: 1.05
      }
    }
  },

  office_holiday: {
    id: "office_holiday",
    name: "写字楼集中休假",
    weight: 7,
    minDays: 2,
    maxDays: 5,

    modifiers: {
      demandMultiplier: 0.95,

      segmentMultipliers: {
        office_worker: 0.45,
        resident: 1.08,
        tourist: 1.1
      }
    }
  },

  neighborhood_festival: {
    id: "neighborhood_festival",
    name: "商圈节庆活动",
    weight: 9,
    minDays: 2,
    maxDays: 3,

    modifiers: {
      demandMultiplier: 1.22,
      spendingMultiplier: 1.1,

      segmentMultipliers: {
        resident: 1.2,
        tourist: 1.35
      }
    }
  },

  competitor_promotion: {
    id: "competitor_promotion",
    name: "竞争店联合促销",
    weight: 7,
    minDays: 2,
    maxDays: 4,

    modifiers: {
      demandMultiplier: 0.96,
      playerAppealMultiplier: 0.9
    }
  }
});

class DistrictEventSystem {
  ensureState() {
    let state =
      gameState.getSection(
        "districtEvents"
      );

    if (!state) {
      state = {
        active: [],
        recent: [],
        lastProcessedDay: null
      };

      gameState.setSection(
        "districtEvents",
        state,
        "districtEvents:initialize"
      );
    }

    return state;
  }

  getDefinition(type) {
    const event =
      EVENTS[type];

    if (!event) {
      throw new Error(
        `Unknown district event "${type}"`
      );
    }

    return event;
  }

  getActiveEvents(
    districtId,
    day = null
  ) {
    const currentDay =
      day ??
      gameState.getSection(
        "time"
      ).day;

    return this.ensureState()
      .active
      .filter(
        event =>
          event.districtId ===
            districtId &&
          currentDay >=
            event.startDay &&
          currentDay <=
            event.endDay
      );
  }

  getModifiers(
    districtId,
    segmentId = null
  ) {
    const result = {
      demandMultiplier: 1,
      spendingMultiplier: 1,
      playerAppealMultiplier: 1
    };

    for (
      const event
      of this.getActiveEvents(
        districtId
      )
    ) {
      const definition =
        EVENTS[event.type];

      if (!definition) {
        continue;
      }

      const modifiers =
        definition.modifiers;

      result.demandMultiplier *=
        modifiers
          .demandMultiplier ??
        1;

      result.spendingMultiplier *=
        modifiers
          .spendingMultiplier ??
        1;

      result
        .playerAppealMultiplier *=
        modifiers
          .playerAppealMultiplier ??
        1;

      if (segmentId) {
        result.demandMultiplier *=
          modifiers
            .segmentMultipliers?.[
              segmentId
            ] ??
          1;
      }
    }

    return result;
  }

  startEvent(
    districtId,
    type,
    {
      startDay = null,
      durationDays = null
    } = {}
  ) {
    if (
      !districtSystem.exists(
        districtId
      )
    ) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    const definition =
      this.getDefinition(type);

    const currentDay =
      startDay ??
      gameState.getSection(
        "time"
      ).day;

    const duration =
      durationDays ??
      randomSystem.int(
        definition.minDays,
        definition.maxDays
      );

    const state =
      this.ensureState();

    if (
      state.active.some(
        item =>
          item.districtId ===
          districtId &&
          currentDay <=
          item.endDay
      )
    ) {
      return null;
    }

    const event = {
      id:
        `${districtId}:${type}:${currentDay}`,

      districtId,
      type,

      name:
        definition.name,

      startDay:
        currentDay,

      endDay:
        currentDay +
        duration -
        1
    };

    state.active.push(event);

    gameState.setSection(
      "districtEvents",
      state,
      "districtEvents:start"
    );

    eventBus.emit(
      "district:eventStarted",
      {
        event:
          structuredClone(event)
      }
    );

    return event;
  }

  expireEvents(currentDay) {
    const state =
      this.ensureState();

    const expired =
      state.active.filter(
        item =>
          currentDay >
          item.endDay
      );

    if (
      expired.length === 0
    ) {
      return 0;
    }

    state.active =
      state.active.filter(
        item =>
          currentDay <=
          item.endDay
      );

    for (const event of expired) {
      state.recent.push({
        ...event,
        endedDay:
          currentDay
      });

      eventBus.emit(
        "district:eventEnded",
        {
          event:
            structuredClone(event),
          day:
            currentDay
        }
      );
    }

    if (
      state.recent.length > 20
    ) {
      state.recent.splice(
        0,
        state.recent.length - 20
      );
    }

    gameState.setSection(
      "districtEvents",
      state,
      "districtEvents:expire"
    );

    return expired.length;
  }

  pickRandomEvent() {
    return randomSystem.weightedPick(
      Object.values(EVENTS)
        .map(
          item => ({
            value: item.id,
            weight: item.weight
          })
        )
    );
  }

  processDay(
    currentDay,
    {
      generate = true
    } = {}
  ) {
    const state =
      this.ensureState();

    if (
      state.lastProcessedDay ===
      currentDay
    ) {
      return {
        started: 0,
        expired: 0
      };
    }

    const expired =
      this.expireEvents(
        currentDay
      );

    let started = 0;

    if (generate) {
      for (
        const district
        of districtSystem.getAll()
      ) {
        if (
          this.getActiveEvents(
            district.id,
            currentDay
          ).length > 0
        ) {
          continue;
        }

        /*
         * 8%日触发率：
         * 有变化，但不会天天刷事件。
         */
        if (
          !randomSystem.chance(
            0.08
          )
        ) {
          continue;
        }

        const event =
          this.startEvent(
            district.id,
            this.pickRandomEvent(),
            {
              startDay:
                currentDay
            }
          );

        if (event) {
          started += 1;
        }
      }
    }

    const latest =
      this.ensureState();

    latest.lastProcessedDay =
      currentDay;

    gameState.setSection(
      "districtEvents",
      latest,
      "districtEvents:processDay"
    );

    return {
      started,
      expired
    };
  }

  getDistrictStatus(
    districtId
  ) {
    const state =
      this.ensureState();

    return {
      districtId,

      active:
        this.getActiveEvents(
          districtId
        ),

      recent:
        state.recent
          .filter(
            item =>
              item.districtId ===
              districtId
          )
          .slice(-10)
    };
  }
}

export const districtEventSystem =
  new DistrictEventSystem();

export {
  DistrictEventSystem,
  EVENTS as DISTRICT_EVENTS
};
