import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";

import { districtSystem } from "./DistrictSystem.js";
import { businessCalendarSystem } from "./BusinessCalendarSystem.js";

import {
  RANDOM_EVENTS_V1
} from "../data/randomEvents.v1.js";

import {
  RANDOM_EVENT_MULTIPLIER_FIELDS
} from "../data/randomEventRules.js";

const EVENT_MAP = Object.freeze(
  Object.fromEntries(
    RANDOM_EVENTS_V1.map(
      item => [
        item.id,
        item
      ]
    )
  )
);

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

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

  getAllDefinitions() {
    return RANDOM_EVENTS_V1;
  }

  getDefinition(type) {
    const event =
      EVENT_MAP[type];

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

  getDistrictSensitivity(
    district,
    eventType
  ) {
    return clamp(
      Number(
        district
          ?.eventSensitivity?.[
            eventType
          ] ??
        1
      ),
      0.5,
      1.7
    );
  }

  scaleMultiplier(
    multiplier,
    sensitivity
  ) {
    return (
      1 +
      (
        (
          multiplier ??
          1
        ) -
        1
      ) *
      sensitivity
    );
  }

  getModifiers(
    districtId,
    segmentId = null
  ) {
    const result = Object.fromEntries(
      RANDOM_EVENT_MULTIPLIER_FIELDS.map(
        field => [
          field,
          1
        ]
      )
    );

    const district =
      districtSystem.get(
        districtId
      );

    for (
      const event
      of this.getActiveEvents(
        districtId
      )
    ) {
      const definition =
        EVENT_MAP[event.type];

      if (!definition) {
        continue;
      }

      const modifiers =
        definition.modifiers;

      const sensitivity =
        this.getDistrictSensitivity(
          district,
          event.type
        );

      for (
        const field
        of RANDOM_EVENT_MULTIPLIER_FIELDS
      ) {
        result[field] *=
          this.scaleMultiplier(
            modifiers[field],
            sensitivity
          );
      }

      if (segmentId) {
        result.demandMultiplier *=
          this.scaleMultiplier(
            modifiers
              .segmentMultipliers?.[
                segmentId
              ],
            sensitivity
          );
      }
    }

    for (
      const field
      of RANDOM_EVENT_MULTIPLIER_FIELDS
    ) {
      result[field] =
        Number(
          clamp(
            result[field],
            0.35,
            2.5
          ).toFixed(4)
        );
    }

    return result;
  }

  getDefinitionWeight(
    definition,
    districtId,
    day
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    if (!district) {
      return 0;
    }

    const calendar =
      businessCalendarSystem
        .getCalendar(
          day
        );

    const districtWeight =
      definition
        .districtWeights?.[
          districtId
        ] ??
      0.45;

    const seasonWeight =
      definition
        .seasonWeights?.[
          calendar.season
        ] ??
      1;

    const sensitivity =
      this.getDistrictSensitivity(
        district,
        definition.id
      );

    const recent =
      this.ensureState()
        .recent
        .some(
          item =>
            item.districtId ===
              districtId &&
            item.type ===
              definition.id &&
            day -
              (
                item.endedDay ??
                item.endDay
              ) <=
              30
        );

    const repeatFactor =
      recent
        ? 0.12
        : 1;

    return Math.max(
      0,
      definition.weight *
        districtWeight *
        seasonWeight *
        sensitivity *
        repeatFactor
    );
  }

  pickRandomEvent(
    districtId = null,
    day = null
  ) {
    const currentDay =
      day ??
      gameState.getSection(
        "time"
      ).day;

    const district =
      districtId
        ? districtSystem.get(
            districtId
          )
        : null;

    if (
      districtId &&
      !district
    ) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    const weighted =
      RANDOM_EVENTS_V1
        .map(
          item => ({
            value:
              item.id,
            weight:
              districtId
                ? this.getDefinitionWeight(
                    item,
                    districtId,
                    currentDay
                  )
                : item.weight
          })
        )
        .filter(
          item =>
            item.weight >
            0
        );

    return randomSystem
      .weightedPick(
        weighted
      );
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
        definition
          .durationRange.min,
        definition
          .durationRange.max
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

      category:
        definition.category,

      polarity:
        definition.polarity,

      severity:
        definition.severity,

      description:
        definition.description,

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

  expireEvents(
    currentDay
  ) {
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

    for (
      const event
      of expired
    ) {
      state.recent.push({
        ...event,
        endedDay:
          currentDay
      });

      eventBus.emit(
        "district:eventEnded",
        {
          event:
            structuredClone(
              event
            ),
          day:
            currentDay
        }
      );
    }

    if (
      state.recent.length >
      120
    ) {
      state.recent.splice(
        0,
        state.recent.length -
        120
      );
    }

    gameState.setSection(
      "districtEvents",
      state,
      "districtEvents:expire"
    );

    return expired.length;
  }

  getDailyTriggerChance(
    district
  ) {
    const competition =
      district
        .competition ??
      50;

    const traffic =
      district
        .trafficIndex ??
      50;

    return clamp(
      0.045 +
      competition /
        2500 +
      traffic /
        5000,
      0.055,
      0.105
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
        of districtSystem
          .getAll()
      ) {
        if (
          this.getActiveEvents(
            district.id,
            currentDay
          ).length >
          0
        ) {
          continue;
        }

        if (
          !randomSystem.chance(
            this.getDailyTriggerChance(
              district
            )
          )
        ) {
          continue;
        }

        const event =
          this.startEvent(
            district.id,
            this.pickRandomEvent(
              district.id,
              currentDay
            ),
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
          .slice(-20)
    };
  }
}

export const districtEventSystem =
  new DistrictEventSystem();

export {
  DistrictEventSystem,
  EVENT_MAP as DISTRICT_EVENTS
};
