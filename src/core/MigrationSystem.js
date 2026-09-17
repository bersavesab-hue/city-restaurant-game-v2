import { eventBus } from "./EventBus.js";

const clone = (value) => structuredClone(value);

function validateVersion(version, name = "Version") {
  if (!Number.isInteger(version) || version < 1) {
    throw new RangeError(
      `${name} must be a positive integer`
    );
  }

  return version;
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
    currentVersion: 1
  });

export { MigrationSystem };
