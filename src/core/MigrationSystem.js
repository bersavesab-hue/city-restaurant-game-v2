import { eventBus } from "./EventBus.js";

import {
  CURRENT_STATE_SCHEMA_VERSION
} from "./SaveSchema.js";

const clone = (value) => structuredClone(value);

function validateVersion(version, name = "Version") {
  if (!Number.isInteger(version) || version < 1) {
    throw new RangeError(
      `${name} must be a positive integer`
    );
  }

  return version;
}

function requireObject(
  value,
  name,
  fallback = {}
) {
  if (
    value === undefined ||
    value === null
  ) {
    return clone(
      fallback
    );
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new TypeError(
      `${name} must be an object`
    );
  }

  return clone(value);
}

function normalizeCounter(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return Math.floor(
    number
  );
}

function inferEntityCounter(
  type,
  collection
) {
  const prefix =
    `${type}_`;

  let maximum = 0;

  for (
    const id
    of Object.keys(
      collection
    )
  ) {
    if (
      !id.startsWith(
        prefix
      )
    ) {
      continue;
    }

    const suffix =
      id.slice(
        prefix.length
      );

    if (
      !/^\d+$/.test(
        suffix
      )
    ) {
      continue;
    }

    maximum =
      Math.max(
        maximum,
        Number(suffix)
      );
  }

  return maximum;
}

function inferSchedulerNextId(
  tasks
) {
  let maximum = 0;

  for (
    const task
    of tasks
  ) {
    const id =
      task?.id;

    if (
      typeof id !== "string"
    ) {
      continue;
    }

    const match =
      /^task_(\d+)$/.exec(
        id
      );

    if (!match) {
      continue;
    }

    maximum =
      Math.max(
        maximum,
        Number(
          match[1]
        )
      );
  }

  return maximum + 1;
}

function normalizeNonNegativeInteger(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return fallback;
  }

  return Math.floor(
    number
  );
}

function migrateStateV1ToV2(
  sourceState
) {
  const state =
    clone(sourceState);

  state.meta =
    requireObject(
      state.meta,
      "State meta"
    );

  const time =
    requireObject(
      state.time,
      "State time"
    );

  state.time = {
    ...time,

    day:
      Math.max(
        1,
        normalizeNonNegativeInteger(
          time.day,
          1
        )
      ),

    hour:
      Math.min(
        23,
        normalizeNonNegativeInteger(
          time.hour,
          8
        )
      ),

    minute:
      Math.min(
        59,
        normalizeNonNegativeInteger(
          time.minute,
          0
        )
      ),

    totalMinutes:
      normalizeNonNegativeInteger(
        time.totalMinutes,
        0
      )
  };

  const runtime =
    requireObject(
      state.runtime,
      "State runtime"
    );

  state.runtime = {
    ...runtime,

    paused:
      typeof runtime.paused ===
        "boolean"
        ? runtime.paused
        : true,

    speed:
      [
        1,
        2,
        4
      ].includes(
        runtime.speed
      )
        ? runtime.speed
        : 1
  };

  const data =
    requireObject(
      state.data,
      "State data"
    );

  const entities =
    requireObject(
      data.entities,
      "State data.entities"
    );

  const counters =
    requireObject(
      data.entityCounters,
      "State data.entityCounters"
    );

  const nextCounters = {};

  for (
    const [
      type,
      value
    ]
    of Object.entries(
      counters
    )
  ) {
    nextCounters[type] =
      normalizeCounter(
        value
      );
  }

  for (
    const [
      type,
      collectionValue
    ]
    of Object.entries(
      entities
    )
  ) {
    const collection =
      requireObject(
        collectionValue,
        `Entity collection "${type}"`
      );

    entities[type] =
      collection;

    nextCounters[type] =
      Math.max(
        nextCounters[type] ??
          0,
        inferEntityCounter(
          type,
          collection
        )
      );
  }

  state.data = {
    ...data,
    entities,
    entityCounters:
      nextCounters
  };

  const scheduler =
    requireObject(
      state.scheduler,
      "State scheduler"
    );

  const tasks =
    scheduler.tasks ===
      undefined
      ? []
      : scheduler.tasks;

  if (
    !Array.isArray(tasks)
  ) {
    throw new TypeError(
      "State scheduler.tasks must be an array"
    );
  }

  state.scheduler = {
    ...scheduler,

    nextId:
      Math.max(
        1,
        normalizeNonNegativeInteger(
          scheduler.nextId,
          1
        ),
        inferSchedulerNextId(
          tasks
        )
      ),

    tasks:
      clone(tasks)
  };

  const simulation =
    requireObject(
      state.simulation,
      "State simulation"
    );

  state.simulation = {
    ...simulation,

    processedMinutes:
      normalizeNonNegativeInteger(
        simulation
          .processedMinutes,
        0
      ),

    processedHours:
      normalizeNonNegativeInteger(
        simulation
          .processedHours,
        0
      ),

    processedDays:
      normalizeNonNegativeInteger(
        simulation
          .processedDays,
        0
      ),

    ticks:
      normalizeNonNegativeInteger(
        simulation.ticks,
        0
      )
  };

  return state;
}

class MigrationSystem {
  constructor({ currentVersion = 1 } = {}) {
    this.currentVersion =
      validateVersion(
        currentVersion,
        "Current version"
      );

    this.migrations = new Map();
  }

  setCurrentVersion(version) {
    this.currentVersion =
      validateVersion(
        version,
        "Current version"
      );

    return this.currentVersion;
  }

  register(
    fromVersion,
    toVersion,
    migrate,
    options = {}
  ) {
    validateVersion(
      fromVersion,
      "From version"
    );

    validateVersion(
      toVersion,
      "To version"
    );

    if (toVersion !== fromVersion + 1) {
      throw new Error(
        "Migrations must advance exactly one version"
      );
    }

    if (typeof migrate !== "function") {
      throw new TypeError(
        "Migration handler must be a function"
      );
    }

    if (
      this.migrations.has(fromVersion) &&
      options.overwrite !== true
    ) {
      throw new Error(
        `Migration from version ${fromVersion} already exists`
      );
    }

    this.migrations.set(
      fromVersion,
      {
        fromVersion,
        toVersion,
        migrate,
        description:
          options.description ?? ""
      }
    );

    eventBus.emit(
      "migration:registered",
      {
        fromVersion,
        toVersion
      }
    );

    return true;
  }

  getStateVersion(state) {
    const version =
      state?.meta?.schemaVersion;

    return validateVersion(
      version,
      "State schema version"
    );
  }

  migrateState(
    sourceState,
    targetVersion = this.currentVersion
  ) {
    if (
      !sourceState ||
      typeof sourceState !== "object" ||
      Array.isArray(sourceState)
    ) {
      throw new TypeError(
        "State must be an object"
      );
    }

    validateVersion(
      targetVersion,
      "Target version"
    );

    let state = clone(sourceState);

    let version =
      this.getStateVersion(state);

    if (version > targetVersion) {
      throw new Error(
        `Cannot downgrade state from version ${version} to ${targetVersion}`
      );
    }

    if (version === targetVersion) {
      return state;
    }

    const startingVersion = version;

    while (version < targetVersion) {
      const migration =
        this.migrations.get(version);

      if (!migration) {
        throw new Error(
          `Missing migration ${version} -> ${version + 1}`
        );
      }

      const result =
        migration.migrate(
          clone(state)
        );

      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        throw new Error(
          `Migration ${version} -> ${migration.toVersion} returned invalid state`
        );
      }

      state = result;

      if (!state.meta) {
        state.meta = {};
      }

      state.meta.schemaVersion =
        migration.toVersion;

      version =
        migration.toVersion;

      eventBus.emit(
        "migration:stepCompleted",
        {
          fromVersion:
            migration.fromVersion,
          toVersion:
            migration.toVersion
        }
      );
    }

    eventBus.emit(
      "migration:completed",
      {
        fromVersion:
          startingVersion,
        toVersion:
          version
      }
    );

    return state;
  }

  migrateSaveRecord(
    record,
    targetVersion = this.currentVersion
  ) {
    if (
      !record ||
      typeof record !== "object" ||
      !record.state
    ) {
      throw new TypeError(
        "Invalid save record"
      );
    }

    const migrated =
      clone(record);

    migrated.state =
      this.migrateState(
        migrated.state,
        targetVersion
      );

    return migrated;
  }

  canMigrate(
    fromVersion,
    targetVersion =
      this.currentVersion
  ) {
    validateVersion(
      fromVersion,
      "From version"
    );

    validateVersion(
      targetVersion,
      "Target version"
    );

    if (fromVersion > targetVersion) {
      return false;
    }

    for (
      let version = fromVersion;
      version < targetVersion;
      version += 1
    ) {
      if (
        !this.migrations.has(version)
      ) {
        return false;
      }
    }

    return true;
  }

  list() {
    return [...this.migrations.values()]
      .map((migration) => ({
        fromVersion:
          migration.fromVersion,
        toVersion:
          migration.toVersion,
        description:
          migration.description
      }))
      .sort(
        (a, b) =>
          a.fromVersion -
          b.fromVersion
      );
  }
}

export const migrationSystem =
  new MigrationSystem({
    currentVersion:
      CURRENT_STATE_SCHEMA_VERSION
  });

migrationSystem.register(
  1,
  2,
  migrateStateV1ToV2,
  {
    description:
      "Normalize runtime/core sections and rebuild persistent counters"
  }
);

export {
  MigrationSystem,
  migrateStateV1ToV2
};
