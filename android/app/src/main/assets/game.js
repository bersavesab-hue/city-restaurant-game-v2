(() => {
  // src/core/EventBus.js
  var EventBus = class {
    constructor() {
      this.events = /* @__PURE__ */ new Map();
    }
    on(eventName, handler) {
      if (typeof handler !== "function") {
        throw new TypeError("Event handler must be a function");
      }
      if (!this.events.has(eventName)) {
        this.events.set(eventName, /* @__PURE__ */ new Set());
      }
      this.events.get(eventName).add(handler);
      return () => this.off(eventName, handler);
    }
    once(eventName, handler) {
      const wrapper = (...args) => {
        this.off(eventName, wrapper);
        handler(...args);
      };
      return this.on(eventName, wrapper);
    }
    off(eventName, handler) {
      const handlers = this.events.get(eventName);
      if (!handlers) {
        return false;
      }
      const removed = handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(eventName);
      }
      return removed;
    }
    emit(eventName, payload) {
      const handlers = this.events.get(eventName);
      if (!handlers) {
        return 0;
      }
      const snapshot = [...handlers];
      for (const handler of snapshot) {
        handler(payload);
      }
      return snapshot.length;
    }
    clear(eventName) {
      if (eventName !== void 0) {
        return this.events.delete(eventName);
      }
      this.events.clear();
      return true;
    }
    listenerCount(eventName) {
      return this.events.get(eventName)?.size ?? 0;
    }
  };
  var eventBus = new EventBus();

  // src/core/GameState.js
  var clone = (value) => structuredClone(value);
  function createInitialState() {
    const now = Date.now();
    return {
      meta: {
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now
      },
      time: {
        day: 1,
        hour: 8,
        minute: 0,
        totalMinutes: 0
      },
      runtime: {
        paused: true,
        speed: 1
      },
      data: {}
    };
  }
  var GameState = class {
    constructor() {
      this.state = createInitialState();
    }
    snapshot() {
      return clone(this.state);
    }
    getSection(section) {
      if (!(section in this.state)) {
        return void 0;
      }
      return clone(this.state[section]);
    }
    selectSection(section, selector) {
      if (typeof selector !== "function") {
        throw new TypeError(
          "Section selector must be a function"
        );
      }
      if (!(section in this.state)) {
        return void 0;
      }
      return clone(
        selector(this.state[section])
      );
    }
    emitChange(section, reason) {
      eventBus.emit("state:changed", {
        section,
        reason,
        updatedAt: this.state.meta?.updatedAt ?? null
      });
    }
    setSection(section, value, reason = "setSection") {
      this.state[section] = clone(value);
      this.touch();
      this.emitChange(section, reason);
      return clone(this.state[section]);
    }
    patchSection(section, changes, reason = "patchSection") {
      const current = this.state[section];
      if (current === null || typeof current !== "object" || Array.isArray(current)) {
        throw new TypeError(
          `State section "${section}" is not patchable`
        );
      }
      this.state[section] = {
        ...current,
        ...clone(changes)
      };
      this.touch();
      this.emitChange(section, reason);
      return clone(this.state[section]);
    }
    mutateSection(section, mutator, reason = "mutateSection") {
      if (typeof mutator !== "function") {
        throw new TypeError(
          "Section mutator must be a function"
        );
      }
      const current = this.state[section];
      if (current === null || typeof current !== "object" || Array.isArray(current)) {
        throw new TypeError(
          `State section "${section}" is not mutable`
        );
      }
      const result = mutator(current);
      this.touch();
      this.emitChange(section, reason);
      return result === void 0 ? void 0 : clone(result);
    }
    replace(nextState, reason = "replace") {
      if (!nextState || typeof nextState !== "object" || Array.isArray(nextState)) {
        throw new TypeError(
          "Game state must be an object"
        );
      }
      this.state = clone(nextState);
      this.touch();
      eventBus.emit(
        "state:replaced",
        {
          reason,
          state: this.snapshot()
        }
      );
      return this.snapshot();
    }
    reset() {
      this.state = createInitialState();
      eventBus.emit(
        "state:reset",
        {
          state: this.snapshot()
        }
      );
      return this.snapshot();
    }
    touch() {
      if (!this.state.meta) {
        this.state.meta = {};
      }
      this.state.meta.updatedAt = Date.now();
    }
  };
  var gameState = new GameState();

  // src/core/DataRegistry.js
  var clone2 = (value) => structuredClone(value);
  var DataRegistry = class {
    constructor() {
      this.collections = /* @__PURE__ */ new Map();
    }
    register(name, records, { overwrite = false } = {}) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new TypeError(
          "Registry name must be a non-empty string"
        );
      }
      if (!Array.isArray(records)) {
        throw new TypeError(
          `Registry "${name}" data must be an array`
        );
      }
      if (this.collections.has(name) && !overwrite) {
        throw new Error(
          `Registry "${name}" already exists`
        );
      }
      const map = /* @__PURE__ */ new Map();
      for (const record of records) {
        if (!record || typeof record !== "object") {
          throw new TypeError(
            `Registry "${name}" contains an invalid record`
          );
        }
        if (typeof record.id !== "string" || record.id.trim() === "") {
          throw new Error(
            `Every record in registry "${name}" must have a string id`
          );
        }
        if (map.has(record.id)) {
          throw new Error(
            `Duplicate id "${record.id}" in registry "${name}"`
          );
        }
        map.set(
          record.id,
          clone2(record)
        );
      }
      this.collections.set(
        name,
        map
      );
      eventBus.emit(
        "data:registered",
        {
          name,
          count: map.size
        }
      );
      return map.size;
    }
    hasCollection(name) {
      return this.collections.has(
        name
      );
    }
    get(name, id) {
      const record = this.collections.get(name)?.get(id);
      return record ? clone2(record) : void 0;
    }
    getAll(name) {
      const collection = this.collections.get(name);
      if (!collection) {
        return [];
      }
      return [
        ...collection.values()
      ].map(clone2);
    }
    has(name, id) {
      return this.collections.get(name)?.has(id) ?? false;
    }
    count(name) {
      return this.collections.get(name)?.size ?? 0;
    }
    listCollections() {
      return [
        ...this.collections.keys()
      ];
    }
    removeCollection(name) {
      const removed = this.collections.delete(name);
      if (removed) {
        eventBus.emit(
          "data:removed",
          { name }
        );
      }
      return removed;
    }
    snapshot() {
      const result = {};
      for (const [name, collection] of this.collections) {
        result[name] = [
          ...collection.values()
        ].map(clone2);
      }
      return result;
    }
    replace(snapshot) {
      if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
        throw new TypeError(
          "Registry snapshot must be an object"
        );
      }
      this.collections.clear();
      for (const [name, records] of Object.entries(snapshot)) {
        this.register(
          name,
          records,
          { overwrite: true }
        );
      }
      eventBus.emit(
        "data:restored",
        {
          collections: this.listCollections(),
          collectionCount: this.collections.size
        }
      );
      return this.snapshot();
    }
    clear() {
      this.collections.clear();
      eventBus.emit(
        "data:cleared"
      );
    }
  };
  var dataRegistry = new DataRegistry();

  // src/core/MigrationSystem.js
  var clone3 = (value) => structuredClone(value);
  function validateVersion(version, name = "Version") {
    if (!Number.isInteger(version) || version < 1) {
      throw new RangeError(
        `${name} must be a positive integer`
      );
    }
    return version;
  }
  var MigrationSystem = class {
    constructor({ currentVersion = 1 } = {}) {
      this.currentVersion = validateVersion(
        currentVersion,
        "Current version"
      );
      this.migrations = /* @__PURE__ */ new Map();
    }
    setCurrentVersion(version) {
      this.currentVersion = validateVersion(
        version,
        "Current version"
      );
      return this.currentVersion;
    }
    register(fromVersion, toVersion, migrate, options = {}) {
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
      if (this.migrations.has(fromVersion) && options.overwrite !== true) {
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
          description: options.description ?? ""
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
      const version = state?.meta?.schemaVersion;
      return validateVersion(
        version,
        "State schema version"
      );
    }
    migrateState(sourceState, targetVersion = this.currentVersion) {
      if (!sourceState || typeof sourceState !== "object" || Array.isArray(sourceState)) {
        throw new TypeError(
          "State must be an object"
        );
      }
      validateVersion(
        targetVersion,
        "Target version"
      );
      let state = clone3(sourceState);
      let version = this.getStateVersion(state);
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
        const migration = this.migrations.get(version);
        if (!migration) {
          throw new Error(
            `Missing migration ${version} -> ${version + 1}`
          );
        }
        const result = migration.migrate(
          clone3(state)
        );
        if (!result || typeof result !== "object" || Array.isArray(result)) {
          throw new Error(
            `Migration ${version} -> ${migration.toVersion} returned invalid state`
          );
        }
        state = result;
        if (!state.meta) {
          state.meta = {};
        }
        state.meta.schemaVersion = migration.toVersion;
        version = migration.toVersion;
        eventBus.emit(
          "migration:stepCompleted",
          {
            fromVersion: migration.fromVersion,
            toVersion: migration.toVersion
          }
        );
      }
      eventBus.emit(
        "migration:completed",
        {
          fromVersion: startingVersion,
          toVersion: version
        }
      );
      return state;
    }
    migrateSaveRecord(record, targetVersion = this.currentVersion) {
      if (!record || typeof record !== "object" || !record.state) {
        throw new TypeError(
          "Invalid save record"
        );
      }
      const migrated = clone3(record);
      migrated.state = this.migrateState(
        migrated.state,
        targetVersion
      );
      return migrated;
    }
    canMigrate(fromVersion, targetVersion = this.currentVersion) {
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
      for (let version = fromVersion; version < targetVersion; version += 1) {
        if (!this.migrations.has(version)) {
          return false;
        }
      }
      return true;
    }
    list() {
      return [...this.migrations.values()].map((migration) => ({
        fromVersion: migration.fromVersion,
        toVersion: migration.toVersion,
        description: migration.description
      })).sort(
        (a, b) => a.fromVersion - b.fromVersion
      );
    }
  };
  var migrationSystem = new MigrationSystem({
    currentVersion: 1
  });

  // src/core/SaveSystem.js
  var MemoryStorage = class {
    constructor() {
      this.data = /* @__PURE__ */ new Map();
    }
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    }
    setItem(key, value) {
      this.data.set(
        key,
        String(value)
      );
    }
    removeItem(key) {
      this.data.delete(key);
    }
  };
  function resolveDefaultStorage() {
    if (typeof globalThis !== "undefined" && globalThis.localStorage && typeof globalThis.localStorage.getItem === "function") {
      return globalThis.localStorage;
    }
    return new MemoryStorage();
  }
  var SaveSystem = class {
    constructor({
      storage = resolveDefaultStorage(),
      prefix = "cityRestaurantGame"
    } = {}) {
      this.storage = storage;
      this.prefix = prefix;
    }
    getKey(slot = "auto") {
      return `${this.prefix}:${slot}`;
    }
    save(slot = "auto") {
      const record = {
        formatVersion: 2,
        savedAt: Date.now(),
        state: gameState.snapshot(),
        registry: dataRegistry.snapshot()
      };
      this.storage.setItem(
        this.getKey(slot),
        JSON.stringify(record)
      );
      eventBus.emit(
        "save:completed",
        {
          slot,
          savedAt: record.savedAt
        }
      );
      return structuredClone(
        record
      );
    }
    load(slot = "auto") {
      const raw = this.storage.getItem(
        this.getKey(slot)
      );
      if (raw === null) {
        return null;
      }
      let record;
      try {
        record = JSON.parse(raw);
      } catch {
        throw new Error(
          `Save slot "${slot}" contains invalid JSON`
        );
      }
      if (!record || ![1, 2].includes(
        record.formatVersion
      ) || !record.state || typeof record.state !== "object") {
        throw new Error(
          `Save slot "${slot}" has an invalid format`
        );
      }
      const migratedState = migrationSystem.migrateState(
        record.state
      );
      if (record.formatVersion >= 2 && record.registry) {
        dataRegistry.replace(
          record.registry
        );
      }
      gameState.replace(
        migratedState,
        "save:load"
      );
      eventBus.emit(
        "save:loaded",
        {
          slot,
          savedAt: record.savedAt,
          schemaVersion: migratedState.meta?.schemaVersion
        }
      );
      return {
        state: gameState.snapshot(),
        registry: dataRegistry.snapshot()
      };
    }
    has(slot = "auto") {
      return this.storage.getItem(
        this.getKey(slot)
      ) !== null;
    }
    remove(slot = "auto") {
      const existed = this.has(slot);
      this.storage.removeItem(
        this.getKey(slot)
      );
      if (existed) {
        eventBus.emit(
          "save:removed",
          { slot }
        );
      }
      return existed;
    }
  };
  var saveSystem = new SaveSystem();

  // src/core/EntitySystem.js
  var clone4 = (value) => structuredClone(value);
  function normalizeType(type) {
    if (typeof type !== "string" || type.trim() === "") {
      throw new TypeError(
        "Entity type must be a non-empty string"
      );
    }
    const normalized = type.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_-]*$/.test(
      normalized
    )) {
      throw new Error(
        `Invalid entity type "${type}"`
      );
    }
    return normalized;
  }
  function ensureData(data) {
    if (!data.entities) {
      data.entities = {};
    }
    if (!data.entityCounters) {
      data.entityCounters = {};
    }
    return data;
  }
  var EntitySystem = class {
    create(type, attributes = {}, options = {}) {
      const entityType = normalizeType(type);
      if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
        throw new TypeError(
          "Entity attributes must be an object"
        );
      }
      return gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);
          if (!data.entities[entityType]) {
            data.entities[entityType] = {};
          }
          if (!data.entityCounters[entityType]) {
            data.entityCounters[entityType] = 0;
          }
          let id = options.id;
          if (id !== void 0) {
            if (typeof id !== "string" || id.trim() === "") {
              throw new TypeError(
                "Custom entity id must be a non-empty string"
              );
            }
            id = id.trim();
          } else {
            data.entityCounters[entityType] += 1;
            id = `${entityType}_${String(
              data.entityCounters[entityType]
            ).padStart(6, "0")}`;
          }
          if (data.entities[entityType][id]) {
            throw new Error(
              `Entity "${entityType}:${id}" already exists`
            );
          }
          const entity = {
            ...clone4(attributes),
            id,
            type: entityType
          };
          data.entities[entityType][id] = entity;
          eventBus.emit(
            "entity:created",
            {
              type: entityType,
              id,
              entity: clone4(entity)
            }
          );
          return entity;
        },
        `entity:create:${entityType}`
      );
    }
    get(type, id) {
      const entityType = normalizeType(type);
      return gameState.selectSection(
        "data",
        (data) => data?.entities?.[entityType]?.[id]
      );
    }
    exists(type, id) {
      return this.get(type, id) !== void 0;
    }
    update(type, id, changes) {
      const entityType = normalizeType(type);
      if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
        throw new TypeError(
          "Entity changes must be an object"
        );
      }
      if ("id" in changes || "type" in changes) {
        throw new Error(
          "Entity id and type cannot be changed"
        );
      }
      return gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);
          const current = data.entities?.[entityType]?.[id];
          if (!current) {
            throw new Error(
              `Entity "${entityType}:${id}" does not exist`
            );
          }
          const updated = {
            ...current,
            ...clone4(changes)
          };
          data.entities[entityType][id] = updated;
          eventBus.emit(
            "entity:updated",
            {
              type: entityType,
              id,
              changes: clone4(changes),
              entity: clone4(updated)
            }
          );
          return updated;
        },
        `entity:update:${entityType}`
      );
    }
    remove(type, id) {
      const entityType = normalizeType(type);
      const result = gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);
          const entity = data.entities?.[entityType]?.[id];
          if (!entity) {
            return {
              removed: false
            };
          }
          delete data.entities[entityType][id];
          return {
            removed: true,
            entity
          };
        },
        `entity:remove:${entityType}`
      );
      if (result.removed) {
        eventBus.emit(
          "entity:removed",
          {
            type: entityType,
            id,
            entity: clone4(result.entity)
          }
        );
      }
      return result.removed;
    }
    removeMany(type, ids) {
      const entityType = normalizeType(type);
      if (!Array.isArray(ids)) {
        throw new TypeError(
          "Entity ids must be an array"
        );
      }
      for (const id of ids) {
        if (typeof id !== "string") {
          throw new TypeError(
            "Entity id must be a string"
          );
        }
      }
      const uniqueIds = [...new Set(ids)];
      if (uniqueIds.length === 0) {
        return 0;
      }
      const removed = gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);
          const collection = data.entities?.[entityType] ?? {};
          let count = 0;
          for (const id of uniqueIds) {
            if (collection[id]) {
              delete collection[id];
              count += 1;
            }
          }
          return count;
        },
        `entity:removeMany:${entityType}`
      );
      if (removed > 0) {
        eventBus.emit(
          "entity:manyRemoved",
          {
            type: entityType,
            count: removed
          }
        );
      }
      return removed;
    }
    filter(type, predicate) {
      const entityType = normalizeType(type);
      if (typeof predicate !== "function") {
        throw new TypeError(
          "Entity predicate must be a function"
        );
      }
      return gameState.selectSection(
        "data",
        (data) => {
          const collection = data?.entities?.[entityType] ?? {};
          const matches = [];
          for (const entity of Object.values(collection)) {
            if (predicate(entity)) {
              matches.push(entity);
            }
          }
          return matches;
        }
      ) ?? [];
    }
    list(type) {
      const entityType = normalizeType(type);
      return gameState.selectSection(
        "data",
        (data) => Object.values(
          data?.entities?.[entityType] ?? {}
        )
      ) ?? [];
    }
    count(type) {
      const entityType = normalizeType(type);
      return gameState.selectSection(
        "data",
        (data) => Object.keys(
          data?.entities?.[entityType] ?? {}
        ).length
      ) ?? 0;
    }
    clearType(type) {
      const entityType = normalizeType(type);
      const count = gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);
          const count2 = Object.keys(
            data.entities?.[entityType] ?? {}
          ).length;
          data.entities[entityType] = {};
          return count2;
        },
        `entity:clear:${entityType}`
      );
      eventBus.emit(
        "entity:typeCleared",
        {
          type: entityType,
          count
        }
      );
      return count;
    }
    listTypes() {
      return gameState.selectSection(
        "data",
        (data) => Object.keys(
          data?.entities ?? {}
        )
      ) ?? [];
    }
  };
  var entitySystem = new EntitySystem();

  // src/systems/RestaurantSystem.js
  var STATUS = Object.freeze({
    CLOSED: "closed",
    OPEN: "open",
    PAUSED: "paused"
  });
  function requireRestaurant(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${id}" does not exist`
      );
    }
    return restaurant;
  }
  var RestaurantSystem = class {
    create({
      name,
      locationId = null
    }) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new TypeError(
          "Restaurant name must be a non-empty string"
        );
      }
      const time = gameState.getSection("time");
      const restaurant = entitySystem.create(
        "restaurant",
        {
          name: name.trim(),
          locationId,
          status: STATUS.CLOSED,
          level: 1,
          reputation: 0,
          customerSatisfaction: 50,
          repeatRate: 0,
          reviewScore: 3,
          totalReviews: 0,
          totalServedGuests: 0,
          totalRejectedGuests: 0,
          experience: 0,
          totalOperatingMinutes: 0,
          totalOperatingDays: 0,
          createdAt: time.totalMinutes,
          openedAt: null,
          closedAt: null
        }
      );
      eventBus.emit(
        "restaurant:created",
        {
          restaurant: structuredClone(
            restaurant
          )
        }
      );
      return restaurant;
    }
    get(id) {
      return requireRestaurant(id);
    }
    list() {
      return entitySystem.list(
        "restaurant"
      );
    }
    count() {
      return entitySystem.count(
        "restaurant"
      );
    }
    rename(id, name) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new TypeError(
          "Restaurant name must be a non-empty string"
        );
      }
      const restaurant = requireRestaurant(id);
      const oldName = restaurant.name;
      const updated = entitySystem.update(
        "restaurant",
        id,
        {
          name: name.trim()
        }
      );
      eventBus.emit(
        "restaurant:renamed",
        {
          id,
          oldName,
          newName: updated.name
        }
      );
      return updated;
    }
    open(id) {
      const restaurant = requireRestaurant(id);
      if (restaurant.status === STATUS.OPEN) {
        throw new Error(
          `Restaurant "${id}" is already open`
        );
      }
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "restaurant",
        id,
        {
          status: STATUS.OPEN,
          openedAt: time.totalMinutes,
          closedAt: null
        }
      );
      eventBus.emit(
        "restaurant:opened",
        {
          id,
          time: time.totalMinutes
        }
      );
      return updated;
    }
    pause(id) {
      const restaurant = requireRestaurant(id);
      if (restaurant.status !== STATUS.OPEN) {
        throw new Error(
          `Restaurant "${id}" is not open`
        );
      }
      const updated = entitySystem.update(
        "restaurant",
        id,
        {
          status: STATUS.PAUSED
        }
      );
      eventBus.emit(
        "restaurant:paused",
        {
          id
        }
      );
      return updated;
    }
    resume(id) {
      const restaurant = requireRestaurant(id);
      if (restaurant.status !== STATUS.PAUSED) {
        throw new Error(
          `Restaurant "${id}" is not paused`
        );
      }
      const updated = entitySystem.update(
        "restaurant",
        id,
        {
          status: STATUS.OPEN
        }
      );
      eventBus.emit(
        "restaurant:resumed",
        {
          id
        }
      );
      return updated;
    }
    close(id) {
      const restaurant = requireRestaurant(id);
      if (restaurant.status === STATUS.CLOSED) {
        return restaurant;
      }
      const time = gameState.getSection("time");
      let operatingMinutes = 0;
      if (restaurant.openedAt !== null) {
        operatingMinutes = Math.max(
          0,
          time.totalMinutes - restaurant.openedAt
        );
      }
      const updated = entitySystem.update(
        "restaurant",
        id,
        {
          status: STATUS.CLOSED,
          totalOperatingMinutes: restaurant.totalOperatingMinutes + operatingMinutes,
          closedAt: time.totalMinutes,
          openedAt: null
        }
      );
      eventBus.emit(
        "restaurant:closed",
        {
          id,
          operatingMinutes
        }
      );
      return updated;
    }
    addExperience(id, amount) {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new RangeError(
          "Experience amount must be positive"
        );
      }
      const restaurant = requireRestaurant(id);
      return entitySystem.update(
        "restaurant",
        id,
        {
          experience: restaurant.experience + amount
        }
      );
    }
    changeReputation(id, amount) {
      if (!Number.isFinite(amount)) {
        throw new TypeError(
          "Reputation change must be a number"
        );
      }
      const restaurant = requireRestaurant(id);
      const reputation = Math.max(
        0,
        restaurant.reputation + amount
      );
      return entitySystem.update(
        "restaurant",
        id,
        {
          reputation
        }
      );
    }
    setLevel(id, level) {
      if (!Number.isInteger(level) || level < 1) {
        throw new RangeError(
          "Restaurant level must be a positive integer"
        );
      }
      return entitySystem.update(
        "restaurant",
        id,
        {
          level
        }
      );
    }
    isOpen(id) {
      return requireRestaurant(id).status === STATUS.OPEN;
    }
  };
  var restaurantSystem = new RestaurantSystem();

  // src/systems/FinanceSystem.js
  var TRANSACTION_TYPE = Object.freeze({
    CAPITAL: "capital",
    INCOME: "income",
    EXPENSE: "expense",
    HOLD: "hold",
    RELEASE: "release",
    APPLY_HOLD: "apply_hold",
    REVERSAL: "reversal"
  });
  var CATEGORY = Object.freeze({
    INITIAL_CAPITAL: "initial_capital",
    SALES: "sales",
    INGREDIENT: "ingredient",
    SALARY: "salary",
    RENT: "rent",
    DEPOSIT: "deposit",
    UTILITIES: "utilities",
    EQUIPMENT: "equipment",
    DECORATION: "decoration",
    MARKETING: "marketing",
    TAX: "tax",
    REFUND: "refund",
    OTHER: "other"
  });
  function requirePositiveAmount(amount) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new RangeError(
        "Money amount must be a positive integer"
      );
    }
  }
  function requireRestaurant2(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${id}" does not exist`
      );
    }
    return restaurant;
  }
  var FinanceSystem = class {
    findAccount(restaurantId2) {
      return entitySystem.list("finance_account").find(
        (account) => account.restaurantId === restaurantId2
      );
    }
    requireAccount(restaurantId2) {
      const account = this.findAccount(restaurantId2);
      if (!account) {
        throw new Error(
          `Finance account for restaurant "${restaurantId2}" does not exist`
        );
      }
      return account;
    }
    createAccount(restaurantId2, initialBalance = 0) {
      requireRestaurant2(restaurantId2);
      if (!Number.isInteger(initialBalance) || initialBalance < 0) {
        throw new RangeError(
          "Initial balance must be non-negative"
        );
      }
      if (this.findAccount(restaurantId2)) {
        throw new Error(
          "Finance account already exists"
        );
      }
      const account = entitySystem.create(
        "finance_account",
        {
          restaurantId: restaurantId2,
          balance: initialBalance,
          capitalContributions: initialBalance,
          lifetimeIncome: 0,
          lifetimeExpense: 0,
          reservedDeposits: 0
        }
      );
      if (initialBalance > 0) {
        this.createTransaction({
          restaurantId: restaurantId2,
          accountId: account.id,
          type: TRANSACTION_TYPE.CAPITAL,
          category: CATEGORY.INITIAL_CAPITAL,
          amount: initialBalance,
          balanceAfter: initialBalance,
          description: "\u521D\u59CB\u8D44\u91D1"
        });
      }
      return account;
    }
    getAccount(restaurantId2) {
      return this.requireAccount(
        restaurantId2
      );
    }
    getBalance(restaurantId2) {
      return this.requireAccount(
        restaurantId2
      ).balance;
    }
    income(restaurantId2, amount, category = CATEGORY.OTHER, description = "") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      const balanceAfter = account.balance + amount;
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          balance: balanceAfter,
          lifetimeIncome: (account.lifetimeIncome ?? 0) + amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.INCOME,
        category,
        amount,
        balanceAfter,
        description
      });
      return {
        account: updated,
        transaction
      };
    }
    expense(restaurantId2, amount, category = CATEGORY.OTHER, description = "") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      if (account.balance < amount) {
        throw new Error(
          `Insufficient funds: balance ${account.balance}, required ${amount}`
        );
      }
      const balanceAfter = account.balance - amount;
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          balance: balanceAfter,
          lifetimeExpense: (account.lifetimeExpense ?? 0) + amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.EXPENSE,
        category,
        amount,
        balanceAfter,
        description
      });
      return {
        account: updated,
        transaction
      };
    }
    refundExpense(restaurantId2, amount, category = CATEGORY.REFUND, description = "\u8D39\u7528\u9000\u6B3E") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      const lifetimeExpense = account.lifetimeExpense ?? 0;
      if (lifetimeExpense < amount) {
        throw new Error(
          "Refund exceeds recorded expense"
        );
      }
      const balanceAfter = account.balance + amount;
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          balance: balanceAfter,
          lifetimeExpense: lifetimeExpense - amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.REVERSAL,
        category,
        amount,
        balanceAfter,
        description
      });
      eventBus.emit(
        "finance:expenseRefunded",
        {
          restaurantId: restaurantId2,
          amount,
          category,
          transactionId: transaction.id
        }
      );
      return {
        account: updated,
        transaction
      };
    }
    holdDeposit(restaurantId2, amount, description = "\u79DF\u8D41\u62BC\u91D1") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      if (account.balance < amount) {
        throw new Error(
          "Insufficient funds for deposit"
        );
      }
      const balanceAfter = account.balance - amount;
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          balance: balanceAfter,
          reservedDeposits: (account.reservedDeposits ?? 0) + amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.HOLD,
        category: CATEGORY.DEPOSIT,
        amount,
        balanceAfter,
        description
      });
      return {
        account: updated,
        transaction
      };
    }
    releaseDeposit(restaurantId2, amount, description = "\u9000\u8FD8\u79DF\u8D41\u62BC\u91D1") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      const reserved = account.reservedDeposits ?? 0;
      if (reserved < amount) {
        throw new Error(
          "Reserved deposit is insufficient"
        );
      }
      const balanceAfter = account.balance + amount;
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          balance: balanceAfter,
          reservedDeposits: reserved - amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.RELEASE,
        category: CATEGORY.DEPOSIT,
        amount,
        balanceAfter,
        description
      });
      return {
        account: updated,
        transaction
      };
    }
    applyHeldDeposit(restaurantId2, amount, category = CATEGORY.RENT, description = "\u62BC\u91D1\u62B5\u6263\u8D39\u7528") {
      requirePositiveAmount(amount);
      const account = this.requireAccount(
        restaurantId2
      );
      const reserved = account.reservedDeposits ?? 0;
      if (reserved < amount) {
        throw new Error(
          "Reserved deposit is insufficient"
        );
      }
      const updated = entitySystem.update(
        "finance_account",
        account.id,
        {
          reservedDeposits: reserved - amount,
          lifetimeExpense: (account.lifetimeExpense ?? 0) + amount
        }
      );
      const transaction = this.createTransaction({
        restaurantId: restaurantId2,
        accountId: account.id,
        type: TRANSACTION_TYPE.APPLY_HOLD,
        category,
        amount,
        balanceAfter: account.balance,
        description
      });
      return {
        account: updated,
        transaction
      };
    }
    createTransaction({
      restaurantId: restaurantId2,
      accountId,
      type,
      category,
      amount,
      balanceAfter,
      description
    }) {
      const time = gameState.getSection("time");
      return entitySystem.create(
        "finance_transaction",
        {
          restaurantId: restaurantId2,
          accountId,
          transactionType: type,
          category,
          amount,
          balanceAfter,
          description: String(description ?? ""),
          createdAt: time.totalMinutes,
          day: time.day,
          hour: time.hour,
          minute: time.minute
        }
      );
    }
    getTransactions(restaurantId2, {
      type = null,
      category = null
    } = {}) {
      requireRestaurant2(restaurantId2);
      return entitySystem.list(
        "finance_transaction"
      ).filter(
        (item) => item.restaurantId === restaurantId2
      ).filter(
        (item) => type === null || item.transactionType === type
      ).filter(
        (item) => category === null || item.category === category
      );
    }
    getSummary(restaurantId2) {
      const account = this.requireAccount(
        restaurantId2
      );
      const income = account.lifetimeIncome ?? 0;
      const expense = account.lifetimeExpense ?? 0;
      const reserved = account.reservedDeposits ?? 0;
      return {
        restaurantId: restaurantId2,
        balance: account.balance,
        reservedDeposits: reserved,
        availableAssets: account.balance + reserved,
        capitalContributions: account.capitalContributions ?? 0,
        lifetimeIncome: income,
        lifetimeExpense: expense,
        lifetimeProfit: income - expense,
        transactionCount: this.getTransactions(
          restaurantId2
        ).length
      };
    }
  };
  var financeSystem = new FinanceSystem();

  // src/systems/DistrictSystem.js
  var COLLECTION = "districts";
  function validateDistrict(item) {
    if (!item || typeof item !== "object") {
      throw new TypeError("District must be an object");
    }
    if (typeof item.id !== "string" || !item.id.trim()) {
      throw new Error("District id is required");
    }
    if (typeof item.name !== "string" || !item.name.trim()) {
      throw new Error("District name is required");
    }
    if (!Number.isInteger(item.trafficIndex) || item.trafficIndex < 0 || item.trafficIndex > 100) {
      throw new Error("trafficIndex must be 0-100");
    }
    if (typeof item.rentMultiplier !== "number" || item.rentMultiplier <= 0) {
      throw new Error("rentMultiplier must be positive");
    }
    if (!Number.isInteger(item.spendingPower) || item.spendingPower < 0 || item.spendingPower > 100) {
      throw new Error("spendingPower must be 0-100");
    }
    if (!Number.isInteger(item.competition) || item.competition < 0 || item.competition > 100) {
      throw new Error("competition must be 0-100");
    }
    if (item.customerMix !== void 0) {
      if (!item.customerMix || typeof item.customerMix !== "object" || Array.isArray(item.customerMix)) {
        throw new Error(
          "customerMix must be an object"
        );
      }
      let totalWeight = 0;
      for (const [
        segmentId,
        weight
      ] of Object.entries(
        item.customerMix
      )) {
        if (!segmentId || !Number.isFinite(weight) || weight < 0) {
          throw new Error(
            "Invalid customerMix"
          );
        }
        totalWeight += weight;
      }
      if (totalWeight <= 0) {
        throw new Error(
          "customerMix must contain positive weight"
        );
      }
    }
    return true;
  }
  var DistrictSystem = class {
    load(records, { overwrite = false } = {}) {
      if (!Array.isArray(records)) {
        throw new TypeError("District records must be an array");
      }
      records.forEach(validateDistrict);
      return dataRegistry.register(
        COLLECTION,
        records,
        { overwrite }
      );
    }
    get(id) {
      return dataRegistry.get(COLLECTION, id);
    }
    getAll() {
      return dataRegistry.getAll(COLLECTION);
    }
    exists(id) {
      return dataRegistry.has(COLLECTION, id);
    }
  };
  var districtSystem = new DistrictSystem();

  // src/systems/PropertySystem.js
  var STATUS2 = Object.freeze({
    AVAILABLE: "available",
    LEASED: "leased",
    LOCKED: "locked"
  });
  function requireProperty(id) {
    const property = entitySystem.get("property", id);
    if (!property) {
      throw new Error(`Property "${id}" does not exist`);
    }
    return property;
  }
  function requirePositiveInteger(value, name) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError(`${name} must be positive`);
    }
  }
  function requireOptionalPositiveNumber(value, name) {
    if (value !== null && value !== void 0) {
      if (!Number.isFinite(value) || value <= 0) {
        throw new RangeError(`${name} must be positive`);
      }
    }
  }
  function getDefaultGridSize(area) {
    const targetCells = Math.max(24, Math.ceil(area / 2));
    const width = Math.max(6, Math.ceil(Math.sqrt(targetCells * 1.5)));
    const height = Math.max(6, Math.ceil(targetCells / width));
    return { width, height };
  }
  function cloneList(value, name) {
    if (value === void 0 || value === null) {
      return [];
    }
    if (!Array.isArray(value)) {
      throw new TypeError(`${name} must be an array`);
    }
    return structuredClone(value);
  }
  function normalizePolygon(polygon, width, height) {
    if (polygon === void 0 || polygon === null) {
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
      ];
    }
    if (!Array.isArray(polygon) || polygon.length < 3) {
      throw new Error("Floor polygon must contain at least 3 points");
    }
    return polygon.map((point) => {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error("Floor polygon contains an invalid point");
      }
      return { x: point.x, y: point.y };
    });
  }
  function normalizeFloor(floor, index, fallbackArea) {
    const area = floor?.area ?? fallbackArea;
    const usableArea = floor?.usableArea ?? area;
    requirePositiveInteger(area, "Floor area");
    requirePositiveInteger(usableArea, "Floor usableArea");
    if (usableArea > area) {
      throw new RangeError("Floor usableArea cannot exceed floor area");
    }
    const defaultGrid = getDefaultGridSize(usableArea);
    const width = floor?.width ?? defaultGrid.width;
    const height = floor?.height ?? defaultGrid.height;
    requirePositiveInteger(width, "Floor width");
    requirePositiveInteger(height, "Floor height");
    const id = String(floor?.id ?? `floor_${index + 1}`);
    const label = String(floor?.label ?? `${index + 1}F`);
    return {
      id,
      label,
      floorNumber: Number.isInteger(floor?.floorNumber) ? floor.floorNumber : index + 1,
      area,
      usableArea,
      width,
      height,
      shape: floor?.shape ?? "rectangle",
      polygon: normalizePolygon(floor?.polygon, width, height),
      entrances: cloneList(floor?.entrances, "entrances"),
      windows: cloneList(floor?.windows, "windows"),
      columns: cloneList(floor?.columns, "columns"),
      fixedStructures: cloneList(
        floor?.fixedStructures,
        "fixedStructures"
      ),
      utilityPoints: cloneList(floor?.utilityPoints, "utilityPoints"),
      notes: floor?.notes ?? null
    };
  }
  function normalizeFloors(area, usableArea, floors) {
    if (floors === void 0 || floors === null) {
      return [
        normalizeFloor(
          {
            id: "floor_1",
            label: "1F",
            floorNumber: 1,
            area,
            usableArea
          },
          0,
          area
        )
      ];
    }
    if (!Array.isArray(floors) || floors.length === 0) {
      throw new Error("floors must be a non-empty array");
    }
    const fallbackArea = Math.max(1, Math.floor(area / floors.length));
    const normalized = floors.map(
      (floor, index) => normalizeFloor(floor, index, fallbackArea)
    );
    const ids = /* @__PURE__ */ new Set();
    for (const floor of normalized) {
      if (ids.has(floor.id)) {
        throw new Error(`Duplicate floor id "${floor.id}"`);
      }
      ids.add(floor.id);
    }
    return normalized;
  }
  var PropertySystem = class {
    create({
      districtId,
      name,
      area,
      usableArea = area,
      baseMonthlyRent,
      seats = 10,
      depositMonths = 2,
      floors = null,
      frontageMeters = null,
      ceilingHeight = null,
      parkingSpaces = 0,
      foodServiceAllowed = true,
      exhaustAllowed = true,
      renovationRules = null,
      tags = []
    }) {
      if (!districtSystem.exists(districtId)) {
        throw new Error(`District "${districtId}" does not exist`);
      }
      if (typeof name !== "string" || !name.trim()) {
        throw new TypeError("Property name is required");
      }
      requirePositiveInteger(area, "Area");
      requirePositiveInteger(usableArea, "Usable area");
      if (usableArea > area) {
        throw new RangeError("Usable area cannot exceed area");
      }
      requirePositiveInteger(baseMonthlyRent, "Monthly rent");
      requirePositiveInteger(seats, "Seats");
      requirePositiveInteger(depositMonths, "Deposit months");
      if (!Number.isInteger(parkingSpaces) || parkingSpaces < 0) {
        throw new RangeError("parkingSpaces must be non-negative");
      }
      requireOptionalPositiveNumber(frontageMeters, "frontageMeters");
      requireOptionalPositiveNumber(ceilingHeight, "ceilingHeight");
      if (!Array.isArray(tags)) {
        throw new TypeError("tags must be an array");
      }
      const normalizedFloors = normalizeFloors(area, usableArea, floors);
      const district = districtSystem.get(districtId);
      const monthlyRent = Math.round(
        baseMonthlyRent * district.rentMultiplier
      );
      const property = entitySystem.create("property", {
        districtId,
        name: name.trim(),
        area,
        usableArea,
        seats,
        baseMonthlyRent,
        monthlyRent,
        depositMonths,
        floorCount: normalizedFloors.length,
        floors: normalizedFloors,
        frontageMeters,
        ceilingHeight,
        parkingSpaces,
        foodServiceAllowed: Boolean(foodServiceAllowed),
        exhaustAllowed: Boolean(exhaustAllowed),
        renovationRules: {
          allowPartitions: true,
          allowWallFinish: true,
          allowFloorFinish: true,
          allowCeilingFinish: true,
          ...renovationRules ?? {}
        },
        tags: [...tags],
        layoutVersion: 1,
        status: STATUS2.AVAILABLE,
        restaurantId: null
      });
      eventBus.emit("property:created", {
        property: structuredClone(property)
      });
      return property;
    }
    get(id) {
      return requireProperty(id);
    }
    getLayout(id) {
      const property = requireProperty(id);
      return {
        propertyId: property.id,
        layoutVersion: property.layoutVersion ?? 1,
        area: property.area,
        usableArea: property.usableArea ?? property.area,
        floorCount: property.floorCount ?? property.floors?.length ?? 1,
        floors: structuredClone(property.floors ?? []),
        renovationRules: structuredClone(property.renovationRules ?? {})
      };
    }
    getFloor(propertyId, floorId = null) {
      const property = requireProperty(propertyId);
      const floors = property.floors ?? [];
      if (floors.length === 0) {
        return null;
      }
      if (floorId === null) {
        return structuredClone(floors[0]);
      }
      const floor = floors.find((item) => item.id === floorId);
      return floor ? structuredClone(floor) : null;
    }
    list({
      districtId = null,
      availableOnly = false
    } = {}) {
      return entitySystem.list("property").filter(
        (item) => districtId === null || item.districtId === districtId
      ).filter(
        (item) => !availableOnly || item.status === STATUS2.AVAILABLE
      );
    }
    markLeased(propertyId, restaurantId2) {
      const property = requireProperty(propertyId);
      if (property.status !== STATUS2.AVAILABLE) {
        throw new Error(`Property "${propertyId}" is not available`);
      }
      return entitySystem.update("property", propertyId, {
        status: STATUS2.LEASED,
        restaurantId: restaurantId2
      });
    }
    release(propertyId) {
      return entitySystem.update("property", propertyId, {
        status: STATUS2.AVAILABLE,
        restaurantId: null
      });
    }
  };
  var propertySystem = new PropertySystem();

  // src/core/RandomSystem.js
  var UINT32_MAX_PLUS_ONE = 4294967296;
  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function normalizeSeed(seed) {
    let value;
    if (typeof seed === "string") {
      value = hashString(seed);
    } else if (Number.isFinite(seed)) {
      value = Math.trunc(seed) >>> 0;
    } else {
      throw new TypeError("Seed must be a finite number or string");
    }
    return value === 0 ? 1831565813 : value;
  }
  var RandomSystem = class {
    ensureState() {
      let randomState = gameState.getSection("random");
      if (!randomState) {
        const seed = normalizeSeed(Date.now());
        randomState = {
          seed,
          state: seed,
          calls: 0
        };
        gameState.setSection(
          "random",
          randomState,
          "random:initialize"
        );
      }
      return randomState;
    }
    setSeed(seed) {
      const normalized = normalizeSeed(seed);
      const randomState = {
        seed: normalized,
        state: normalized,
        calls: 0
      };
      gameState.setSection(
        "random",
        randomState,
        "random:setSeed"
      );
      eventBus.emit("random:seedChanged", {
        seed: normalized
      });
      return normalized;
    }
    getSeed() {
      return this.ensureState().seed;
    }
    getState() {
      return structuredClone(this.ensureState());
    }
    nextUint32() {
      const randomState = this.ensureState();
      let x = randomState.state >>> 0;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      randomState.state = x;
      randomState.calls += 1;
      gameState.setSection(
        "random",
        randomState,
        "random:next"
      );
      return x;
    }
    float() {
      return this.nextUint32() / UINT32_MAX_PLUS_ONE;
    }
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new TypeError("Random integer bounds must be integers");
      }
      if (max < min) {
        throw new RangeError("Maximum must be greater than or equal to minimum");
      }
      return min + Math.floor(
        this.float() * (max - min + 1)
      );
    }
    chance(probability) {
      if (typeof probability !== "number" || probability < 0 || probability > 1) {
        throw new RangeError(
          "Probability must be between 0 and 1"
        );
      }
      return this.float() < probability;
    }
    pick(items) {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Cannot pick from an empty array");
      }
      return items[this.int(0, items.length - 1)];
    }
    weightedPick(items) {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Weighted items must be a non-empty array");
      }
      let totalWeight = 0;
      for (const item of items) {
        if (!item || typeof item.weight !== "number" || item.weight < 0) {
          throw new Error(
            "Every weighted item must contain a non-negative weight"
          );
        }
        totalWeight += item.weight;
      }
      if (totalWeight <= 0) {
        throw new Error("Total weight must be greater than zero");
      }
      let roll = this.float() * totalWeight;
      for (const item of items) {
        roll -= item.weight;
        if (roll < 0) {
          return item.value;
        }
      }
      return items[items.length - 1].value;
    }
    shuffle(items) {
      if (!Array.isArray(items)) {
        throw new TypeError("Shuffle input must be an array");
      }
      const result = structuredClone(items);
      for (let i = result.length - 1; i > 0; i -= 1) {
        const j = this.int(0, i);
        [result[i], result[j]] = [
          result[j],
          result[i]
        ];
      }
      return result;
    }
  };
  var randomSystem = new RandomSystem();

  // src/data/storeProgression.js
  var STORE_LEVELS = Object.freeze([
    {
      level: 1,
      requiredExperience: 0,
      limits: {
        employees: 4,
        menuItems: 8,
        tables: 6,
        kitchenStations: 2
      },
      unlocks: [
        "employee_management",
        "menu_management",
        "basic_inventory"
      ]
    },
    {
      level: 2,
      requiredExperience: 500,
      limits: {
        employees: 6,
        menuItems: 12,
        tables: 8,
        kitchenStations: 3
      },
      unlocks: [
        "supplier_management"
      ]
    },
    {
      level: 3,
      requiredExperience: 1500,
      limits: {
        employees: 8,
        menuItems: 16,
        tables: 10,
        kitchenStations: 4
      },
      unlocks: [
        "marketing"
      ]
    },
    {
      level: 4,
      requiredExperience: 3500,
      limits: {
        employees: 10,
        menuItems: 20,
        tables: 14,
        kitchenStations: 5
      },
      unlocks: [
        "advanced_renovation"
      ]
    },
    {
      level: 5,
      requiredExperience: 7e3,
      limits: {
        employees: 14,
        menuItems: 24,
        tables: 18,
        kitchenStations: 6
      },
      unlocks: [
        "dish_research"
      ]
    },
    {
      level: 6,
      requiredExperience: 12e3,
      limits: {
        employees: 18,
        menuItems: 28,
        tables: 22,
        kitchenStations: 7
      },
      unlocks: [
        "second_store"
      ]
    },
    {
      level: 7,
      requiredExperience: 2e4,
      limits: {
        employees: 24,
        menuItems: 32,
        tables: 28,
        kitchenStations: 8
      },
      unlocks: [
        "membership"
      ]
    },
    {
      level: 8,
      requiredExperience: 32e3,
      limits: {
        employees: 30,
        menuItems: 36,
        tables: 34,
        kitchenStations: 10
      },
      unlocks: [
        "chain_management"
      ]
    },
    {
      level: 9,
      requiredExperience: 5e4,
      limits: {
        employees: 38,
        menuItems: 42,
        tables: 40,
        kitchenStations: 12
      },
      unlocks: [
        "central_kitchen"
      ]
    },
    {
      level: 10,
      requiredExperience: 75e3,
      limits: {
        employees: 48,
        menuItems: 50,
        tables: 48,
        kitchenStations: 14
      },
      unlocks: [
        "regional_expansion"
      ]
    }
  ]);

  // src/systems/StoreProgressSystem.js
  function requireRestaurant3(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${id}" does not exist`
      );
    }
    return restaurant;
  }
  var StoreProgressSystem = class {
    getLevelConfig(level) {
      const config = STORE_LEVELS.find(
        (item) => item.level === level
      );
      if (!config) {
        throw new Error(
          `Store level ${level} is not configured`
        );
      }
      return structuredClone(config);
    }
    getMaxLevel() {
      return STORE_LEVELS[STORE_LEVELS.length - 1].level;
    }
    getProgress(restaurantId2) {
      const restaurant = requireRestaurant3(restaurantId2);
      const current = this.getLevelConfig(
        restaurant.level
      );
      const next = STORE_LEVELS.find(
        (item) => item.level === restaurant.level + 1
      );
      if (!next) {
        return {
          level: restaurant.level,
          experience: restaurant.experience,
          nextLevel: null,
          requiredExperience: null,
          remainingExperience: 0,
          progress: 1,
          maxLevel: true
        };
      }
      const range = next.requiredExperience - current.requiredExperience;
      const gained = restaurant.experience - current.requiredExperience;
      return {
        level: restaurant.level,
        experience: restaurant.experience,
        nextLevel: next.level,
        requiredExperience: next.requiredExperience,
        remainingExperience: Math.max(
          0,
          next.requiredExperience - restaurant.experience
        ),
        progress: Math.max(
          0,
          Math.min(
            1,
            gained / range
          )
        ),
        maxLevel: false
      };
    }
    addExperience(restaurantId2, amount) {
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new RangeError(
          "Experience amount must be a positive integer"
        );
      }
      let restaurant = requireRestaurant3(
        restaurantId2
      );
      const newExperience = restaurant.experience + amount;
      let newLevel = restaurant.level;
      for (const config of STORE_LEVELS) {
        if (newExperience >= config.requiredExperience) {
          newLevel = Math.max(
            newLevel,
            config.level
          );
        }
      }
      const oldLevel = restaurant.level;
      restaurant = entitySystem.update(
        "restaurant",
        restaurantId2,
        {
          experience: newExperience,
          level: newLevel
        }
      );
      eventBus.emit(
        "store:experienceGained",
        {
          restaurantId: restaurantId2,
          amount,
          experience: newExperience
        }
      );
      if (newLevel > oldLevel) {
        for (let level = oldLevel + 1; level <= newLevel; level += 1) {
          eventBus.emit(
            "store:levelUp",
            {
              restaurantId: restaurantId2,
              oldLevel: level - 1,
              newLevel: level,
              unlocks: this.getLevelConfig(
                level
              ).unlocks
            }
          );
        }
      }
      return restaurant;
    }
    getLimits(restaurantId2) {
      const restaurant = requireRestaurant3(
        restaurantId2
      );
      return this.getLevelConfig(
        restaurant.level
      ).limits;
    }
    getUnlockedFeatures(restaurantId2) {
      const restaurant = requireRestaurant3(
        restaurantId2
      );
      const unlocked = /* @__PURE__ */ new Set();
      for (const config of STORE_LEVELS) {
        if (config.level > restaurant.level) {
          break;
        }
        for (const feature of config.unlocks) {
          unlocked.add(feature);
        }
      }
      return [...unlocked];
    }
    isUnlocked(restaurantId2, feature) {
      return this.getUnlockedFeatures(
        restaurantId2
      ).includes(feature);
    }
    getAllLevelConfigs() {
      return structuredClone(
        STORE_LEVELS
      );
    }
  };
  var storeProgressSystem = new StoreProgressSystem();

  // src/data/employeeRoles.js
  var EMPLOYEE_ROLES = Object.freeze({
    chef: {
      id: "chef",
      name: "\u53A8\u5E08",
      baseSalary: 4500,
      primarySkill: "cooking",
      skillProfile: [
        "cooking",
        "speed",
        "quality",
        "innovation",
        "wasteControl",
        "stability"
      ]
    },
    server: {
      id: "server",
      name: "\u670D\u52A1\u5458",
      baseSalary: 3200,
      primarySkill: "service",
      skillProfile: [
        "service",
        "servingSpeed",
        "guestCare",
        "tableTurn",
        "peakPressure"
      ]
    },
    cashier: {
      id: "cashier",
      name: "\u6536\u94F6\u5458",
      baseSalary: 3400,
      primarySkill: "checkout",
      skillProfile: [
        "checkout",
        "accuracy",
        "upselling",
        "compliance",
        "speed"
      ]
    },
    kitchen_assistant: {
      id: "kitchen_assistant",
      name: "\u540E\u53A8\u5E2E\u5DE5",
      baseSalary: 3100,
      primarySkill: "prep",
      skillProfile: [
        "prep",
        "kitchenSpeed",
        "wasteControl",
        "cleanliness",
        "stability"
      ]
    },
    cleaner: {
      id: "cleaner",
      name: "\u4FDD\u6D01\u5458",
      baseSalary: 3e3,
      primarySkill: "cleaning",
      skillProfile: [
        "cleaning",
        "hygiene",
        "efficiency",
        "inspection"
      ]
    },
    delivery: {
      id: "delivery",
      name: "\u914D\u9001\u5458",
      baseSalary: 3600,
      primarySkill: "delivery",
      skillProfile: [
        "delivery",
        "route",
        "punctuality",
        "care",
        "peakPressure"
      ]
    },
    manager: {
      id: "manager",
      name: "\u5E97\u957F",
      baseSalary: 6500,
      primarySkill: "management",
      skillProfile: [
        "management",
        "scheduling",
        "costControl",
        "morale",
        "promotionExecution"
      ]
    }
  });

  // src/systems/EmployeeSystem.js
  var EMPLOYEE_STATUS = Object.freeze({
    ACTIVE: "active",
    RESTING: "resting",
    OFF_DUTY: "off_duty",
    FIRED: "fired"
  });
  function requireRestaurant4(restaurantId2) {
    const restaurant = entitySystem.get("restaurant", restaurantId2);
    if (!restaurant) {
      throw new Error(`Restaurant "${restaurantId2}" does not exist`);
    }
    return restaurant;
  }
  function requireEmployee(employeeId) {
    const employee = entitySystem.get("employee", employeeId);
    if (!employee) {
      throw new Error(`Employee "${employeeId}" does not exist`);
    }
    return employee;
  }
  function requireRole(roleId) {
    const role = EMPLOYEE_ROLES[roleId];
    if (!role) {
      throw new Error(`Unknown employee role "${roleId}"`);
    }
    return role;
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function buildInitialSkills(role) {
    const skills = {};
    const profile = role.skillProfile ?? [role.primarySkill];
    for (const skill of profile) {
      skills[skill] = skill === role.primarySkill ? randomSystem.int(20, 40) : randomSystem.int(10, 28);
    }
    return skills;
  }
  var EmployeeSystem = class {
    listByRestaurant(restaurantId2, { includeFired = false } = {}) {
      requireRestaurant4(restaurantId2);
      return entitySystem.list("employee").filter((employee) => employee.restaurantId === restaurantId2).filter(
        (employee) => includeFired || employee.status !== EMPLOYEE_STATUS.FIRED
      );
    }
    countByRestaurant(restaurantId2) {
      return this.listByRestaurant(restaurantId2).length;
    }
    hire({ restaurantId: restaurantId2, name, roleId, salary = null }) {
      requireRestaurant4(restaurantId2);
      if (typeof name !== "string" || name.trim() === "") {
        throw new TypeError("Employee name must be a non-empty string");
      }
      const role = requireRole(roleId);
      const limits = storeProgressSystem.getLimits(restaurantId2);
      const currentCount = this.countByRestaurant(restaurantId2);
      if (currentCount >= limits.employees) {
        throw new Error(`Employee limit reached: ${limits.employees}`);
      }
      const finalSalary = salary ?? role.baseSalary;
      if (!Number.isInteger(finalSalary) || finalSalary <= 0) {
        throw new RangeError("Salary must be a positive integer");
      }
      const employee = entitySystem.create("employee", {
        restaurantId: restaurantId2,
        name: name.trim(),
        roleId: role.id,
        status: EMPLOYEE_STATUS.ACTIVE,
        level: 1,
        experience: 0,
        careerRankId: "apprentice",
        careerRankOrder: 0,
        promotionCount: 0,
        trainingCount: 0,
        salary: finalSalary,
        fatigue: 0,
        mood: 70,
        loyalty: 50,
        skills: buildInitialSkills(role),
        totalWorkMinutes: 0,
        hiredAt: Date.now(),
        firedAt: null
      });
      eventBus.emit("employee:hired", {
        restaurantId: restaurantId2,
        employee: structuredClone(employee)
      });
      return employee;
    }
    get(employeeId) {
      return requireEmployee(employeeId);
    }
    fire(employeeId) {
      const employee = requireEmployee(employeeId);
      if (employee.status === EMPLOYEE_STATUS.FIRED) {
        return employee;
      }
      const updated = entitySystem.update("employee", employeeId, {
        status: EMPLOYEE_STATUS.FIRED,
        firedAt: Date.now()
      });
      eventBus.emit("employee:fired", {
        restaurantId: employee.restaurantId,
        employeeId
      });
      return updated;
    }
    setSalary(employeeId, salary) {
      if (!Number.isInteger(salary) || salary <= 0) {
        throw new RangeError("Salary must be a positive integer");
      }
      return entitySystem.update("employee", employeeId, { salary });
    }
    addExperience(employeeId, amount) {
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new RangeError("Experience must be a positive integer");
      }
      const employee = requireEmployee(employeeId);
      const experience = employee.experience + amount;
      const level = Math.floor(experience / 1e3) + 1;
      const updated = entitySystem.update("employee", employeeId, {
        experience,
        level
      });
      if (level > employee.level) {
        eventBus.emit("employee:levelUp", {
          employeeId,
          oldLevel: employee.level,
          newLevel: level
        });
      }
      return updated;
    }
    changeFatigue(employeeId, amount) {
      const employee = requireEmployee(employeeId);
      return entitySystem.update("employee", employeeId, {
        fatigue: clamp(employee.fatigue + amount, 0, 100)
      });
    }
    changeMood(employeeId, amount) {
      const employee = requireEmployee(employeeId);
      return entitySystem.update("employee", employeeId, {
        mood: clamp(employee.mood + amount, 0, 100)
      });
    }
    changeLoyalty(employeeId, amount) {
      const employee = requireEmployee(employeeId);
      return entitySystem.update("employee", employeeId, {
        loyalty: clamp((employee.loyalty ?? 50) + amount, 0, 100)
      });
    }
    changeSkill(employeeId, skill, amount) {
      if (typeof skill !== "string" || skill.trim() === "") {
        throw new TypeError("Skill must be a non-empty string");
      }
      const employee = requireEmployee(employeeId);
      const skills = { ...employee.skills };
      skills[skill] = clamp((skills[skill] ?? 0) + amount, 0, 100);
      return entitySystem.update("employee", employeeId, { skills });
    }
    getPayroll(restaurantId2) {
      return this.listByRestaurant(restaurantId2).reduce(
        (total, employee) => total + employee.salary,
        0
      );
    }
    getRole(roleId) {
      return structuredClone(requireRole(roleId));
    }
    getRoles() {
      return Object.values(EMPLOYEE_ROLES).map((role) => structuredClone(role));
    }
  };
  var employeeSystem = new EmployeeSystem();

  // src/data/ingredientRules.js
  var INGREDIENT_CATEGORY = Object.freeze({
    MEAT: "meat",
    POULTRY: "poultry",
    SEAFOOD: "seafood",
    VEGETABLE: "vegetable",
    FRUIT: "fruit",
    GRAIN: "grain",
    BEAN: "bean",
    EGG: "egg",
    DAIRY: "dairy",
    SEASONING: "seasoning",
    OIL: "oil",
    DRY_GOODS: "dry_goods",
    BEVERAGE: "beverage",
    OTHER: "other"
  });
  var INGREDIENT_UNIT = Object.freeze({
    GRAM: "g",
    KILOGRAM: "kg",
    MILLILITER: "ml",
    LITER: "l",
    PIECE: "piece",
    PORTION: "portion"
  });
  var INGREDIENT_QUALITY = Object.freeze({
    COMMON: 1,
    GOOD: 2,
    PREMIUM: 3,
    SUPERIOR: 4,
    RARE: 5
  });
  var STORAGE_TYPE = Object.freeze({
    ROOM: "room",
    CHILLED: "chilled",
    FROZEN: "frozen",
    DRY: "dry"
  });
  var FRESHNESS = Object.freeze({
    FRESH: "fresh",
    NORMAL: "normal",
    AGING: "aging",
    SPOILED: "spoiled"
  });
  var FRESHNESS_THRESHOLDS = Object.freeze({
    FRESH: 80,
    NORMAL: 50,
    AGING: 20,
    SPOILED: 0
  });
  function getFreshnessState(value) {
    if (!Number.isFinite(value)) {
      throw new TypeError("Freshness must be a number");
    }
    if (value < 0 || value > 100) {
      throw new RangeError(
        "Freshness must be between 0 and 100"
      );
    }
    if (value >= FRESHNESS_THRESHOLDS.FRESH) {
      return FRESHNESS.FRESH;
    }
    if (value >= FRESHNESS_THRESHOLDS.NORMAL) {
      return FRESHNESS.NORMAL;
    }
    if (value >= FRESHNESS_THRESHOLDS.AGING) {
      return FRESHNESS.AGING;
    }
    return FRESHNESS.SPOILED;
  }

  // src/systems/IngredientCatalogSystem.js
  var COLLECTION2 = "ingredients";
  var validCategories = new Set(
    Object.values(INGREDIENT_CATEGORY)
  );
  var validUnits = new Set(
    Object.values(INGREDIENT_UNIT)
  );
  var validQualities = new Set(
    Object.values(INGREDIENT_QUALITY)
  );
  var validStorageTypes = new Set(
    Object.values(STORAGE_TYPE)
  );
  function validateIngredient(item) {
    if (!item || typeof item !== "object") {
      throw new TypeError(
        "Ingredient must be an object"
      );
    }
    if (typeof item.id !== "string" || item.id.trim() === "") {
      throw new Error(
        "Ingredient id is required"
      );
    }
    if (typeof item.name !== "string" || item.name.trim() === "") {
      throw new Error(
        `Ingredient "${item.id}" requires a name`
      );
    }
    if (!validCategories.has(item.category)) {
      throw new Error(
        `Ingredient "${item.id}" has invalid category`
      );
    }
    if (!validUnits.has(item.unit)) {
      throw new Error(
        `Ingredient "${item.id}" has invalid unit`
      );
    }
    if (!validQualities.has(item.baseQuality)) {
      throw new Error(
        `Ingredient "${item.id}" has invalid baseQuality`
      );
    }
    if (!validStorageTypes.has(item.storageType)) {
      throw new Error(
        `Ingredient "${item.id}" has invalid storageType`
      );
    }
    if (!Number.isInteger(item.basePurchasePrice) || item.basePurchasePrice < 0) {
      throw new Error(
        `Ingredient "${item.id}" has invalid basePurchasePrice`
      );
    }
    if (!Number.isInteger(item.shelfLifeDays) || item.shelfLifeDays <= 0) {
      throw new Error(
        `Ingredient "${item.id}" has invalid shelfLifeDays`
      );
    }
    if (typeof item.edibleRate !== "number" || item.edibleRate <= 0 || item.edibleRate > 1) {
      throw new Error(
        `Ingredient "${item.id}" has invalid edibleRate`
      );
    }
    if (typeof item.baseWasteRate !== "number" || item.baseWasteRate < 0 || item.baseWasteRate > 1) {
      throw new Error(
        `Ingredient "${item.id}" has invalid baseWasteRate`
      );
    }
    return true;
  }
  var IngredientCatalogSystem = class {
    load(records, { overwrite = false } = {}) {
      if (!Array.isArray(records)) {
        throw new TypeError(
          "Ingredient records must be an array"
        );
      }
      for (const item of records) {
        validateIngredient(item);
      }
      return dataRegistry.register(
        COLLECTION2,
        records,
        { overwrite }
      );
    }
    get(id) {
      return dataRegistry.get(
        COLLECTION2,
        id
      );
    }
    getAll() {
      return dataRegistry.getAll(
        COLLECTION2
      );
    }
    exists(id) {
      return dataRegistry.has(
        COLLECTION2,
        id
      );
    }
    count() {
      return dataRegistry.count(
        COLLECTION2
      );
    }
    getByCategory(category) {
      if (!validCategories.has(category)) {
        throw new Error(
          `Invalid ingredient category "${category}"`
        );
      }
      return this.getAll().filter(
        (item) => item.category === category
      );
    }
    getByStorageType(storageType) {
      if (!validStorageTypes.has(storageType)) {
        throw new Error(
          `Invalid storage type "${storageType}"`
        );
      }
      return this.getAll().filter(
        (item) => item.storageType === storageType
      );
    }
  };
  var ingredientCatalogSystem = new IngredientCatalogSystem();

  // src/systems/SupplierSystem.js
  var SUPPLIER_STATUS = Object.freeze({
    ACTIVE: "active",
    SUSPENDED: "suspended"
  });
  function clamp2(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function requireSupplier(id) {
    const supplier = entitySystem.get("supplier", id);
    if (!supplier) {
      throw new Error(
        `Supplier "${id}" does not exist`
      );
    }
    return supplier;
  }
  var SupplierSystem = class {
    create({
      name,
      relationship = 50,
      reliability = 80
    }) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new TypeError(
          "Supplier name must be a non-empty string"
        );
      }
      if (!Number.isInteger(relationship) || relationship < 0 || relationship > 100) {
        throw new RangeError(
          "Relationship must be between 0 and 100"
        );
      }
      if (!Number.isInteger(reliability) || reliability < 0 || reliability > 100) {
        throw new RangeError(
          "Reliability must be between 0 and 100"
        );
      }
      const supplier = entitySystem.create(
        "supplier",
        {
          name: name.trim(),
          status: SUPPLIER_STATUS.ACTIVE,
          relationship,
          reliability,
          offers: {}
        }
      );
      eventBus.emit(
        "supplier:created",
        {
          supplier: structuredClone(supplier)
        }
      );
      return supplier;
    }
    get(id) {
      return requireSupplier(id);
    }
    list({
      activeOnly = false
    } = {}) {
      return entitySystem.list("supplier").filter(
        (supplier) => !activeOnly || supplier.status === SUPPLIER_STATUS.ACTIVE
      );
    }
    addOffer(supplierId, ingredientId, {
      priceMultiplier = 1,
      priceVolatility = 0.1,
      qualityMin = 1,
      qualityMax = 2,
      deliveryMinutes = 180,
      capacityPerDay = 100,
      minimumOrder = 1
    } = {}) {
      const supplier = requireSupplier(supplierId);
      const ingredient = ingredientCatalogSystem.get(
        ingredientId
      );
      if (!ingredient) {
        throw new Error(
          `Ingredient "${ingredientId}" does not exist`
        );
      }
      if (typeof priceMultiplier !== "number" || priceMultiplier <= 0) {
        throw new RangeError(
          "priceMultiplier must be greater than 0"
        );
      }
      if (typeof priceVolatility !== "number" || priceVolatility < 0 || priceVolatility > 0.5) {
        throw new RangeError(
          "priceVolatility must be between 0 and 0.5"
        );
      }
      if (!Number.isInteger(qualityMin) || !Number.isInteger(qualityMax) || qualityMin < 1 || qualityMax > 5 || qualityMin > qualityMax) {
        throw new RangeError(
          "Quality range must be between 1 and 5"
        );
      }
      if (!Number.isInteger(deliveryMinutes) || deliveryMinutes <= 0) {
        throw new RangeError(
          "deliveryMinutes must be positive"
        );
      }
      if (!Number.isFinite(capacityPerDay) || capacityPerDay <= 0) {
        throw new RangeError(
          "capacityPerDay must be positive"
        );
      }
      if (!Number.isFinite(minimumOrder) || minimumOrder <= 0) {
        throw new RangeError(
          "minimumOrder must be positive"
        );
      }
      const offers = {
        ...supplier.offers
      };
      offers[ingredientId] = {
        ingredientId,
        priceMultiplier,
        priceVolatility,
        qualityMin,
        qualityMax,
        deliveryMinutes,
        capacityPerDay,
        minimumOrder
      };
      const updated = entitySystem.update(
        "supplier",
        supplierId,
        { offers }
      );
      eventBus.emit(
        "supplier:offerAdded",
        {
          supplierId,
          ingredientId
        }
      );
      return updated;
    }
    removeOffer(supplierId, ingredientId) {
      const supplier = requireSupplier(supplierId);
      if (!supplier.offers[ingredientId]) {
        return false;
      }
      const offers = {
        ...supplier.offers
      };
      delete offers[ingredientId];
      entitySystem.update(
        "supplier",
        supplierId,
        { offers }
      );
      eventBus.emit(
        "supplier:offerRemoved",
        {
          supplierId,
          ingredientId
        }
      );
      return true;
    }
    getOffer(supplierId, ingredientId) {
      const supplier = requireSupplier(supplierId);
      const offer = supplier.offers[ingredientId];
      return offer ? structuredClone(offer) : void 0;
    }
    getQuote(supplierId, ingredientId, quantity) {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new RangeError(
          "Quantity must be positive"
        );
      }
      const supplier = requireSupplier(supplierId);
      if (supplier.status !== SUPPLIER_STATUS.ACTIVE) {
        throw new Error(
          `Supplier "${supplierId}" is not active`
        );
      }
      const ingredient = ingredientCatalogSystem.get(
        ingredientId
      );
      if (!ingredient) {
        throw new Error(
          `Ingredient "${ingredientId}" does not exist`
        );
      }
      const offer = supplier.offers[ingredientId];
      if (!offer) {
        throw new Error(
          `Supplier "${supplierId}" does not supply "${ingredientId}"`
        );
      }
      if (quantity < offer.minimumOrder) {
        throw new Error(
          `Minimum order is ${offer.minimumOrder}`
        );
      }
      if (quantity > offer.capacityPerDay) {
        throw new Error(
          `Daily supply capacity is ${offer.capacityPerDay}`
        );
      }
      const relationshipDiscount = 1 - supplier.relationship / 100 * 0.08;
      const volatility = offer.priceVolatility;
      const priceFactor = 1 + (randomSystem.float() * 2 - 1) * volatility;
      const unitPrice = Math.max(
        1,
        Math.round(
          ingredient.basePurchasePrice * offer.priceMultiplier * relationshipDiscount * priceFactor
        )
      );
      const quality = randomSystem.int(
        offer.qualityMin,
        offer.qualityMax
      );
      const totalPrice = Math.round(
        unitPrice * quantity
      );
      const quote = {
        supplierId,
        ingredientId,
        quantity,
        unit: ingredient.unit,
        unitPrice,
        totalPrice,
        quality,
        deliveryMinutes: offer.deliveryMinutes,
        reliability: supplier.reliability
      };
      eventBus.emit(
        "supplier:quoteCreated",
        {
          quote: structuredClone(quote)
        }
      );
      return quote;
    }
    changeRelationship(supplierId, amount) {
      if (!Number.isFinite(amount)) {
        throw new TypeError(
          "Relationship change must be a number"
        );
      }
      const supplier = requireSupplier(supplierId);
      const relationship = clamp2(
        supplier.relationship + amount,
        0,
        100
      );
      return entitySystem.update(
        "supplier",
        supplierId,
        { relationship }
      );
    }
    suspend(supplierId) {
      return entitySystem.update(
        "supplier",
        supplierId,
        {
          status: SUPPLIER_STATUS.SUSPENDED
        }
      );
    }
    activate(supplierId) {
      return entitySystem.update(
        "supplier",
        supplierId,
        {
          status: SUPPLIER_STATUS.ACTIVE
        }
      );
    }
  };
  var supplierSystem = new SupplierSystem();

  // src/systems/LeaseSystem.js
  function requireRestaurant5(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${id}" does not exist`
      );
    }
    return restaurant;
  }
  function requireLease(id) {
    const lease = entitySystem.get("lease", id);
    if (!lease) {
      throw new Error(
        `Lease "${id}" does not exist`
      );
    }
    return lease;
  }
  function requireNonNegativeInteger(value, name) {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError(`${name} must be non-negative`);
    }
  }
  var LeaseSystem = class {
    sign({
      restaurantId: restaurantId2,
      propertyId,
      months = 12,
      commercialTerms = null
    }) {
      requireRestaurant5(restaurantId2);
      if (!Number.isInteger(months) || months <= 0) {
        throw new RangeError(
          "Lease months must be positive"
        );
      }
      const property = propertySystem.get(propertyId);
      if (property.status !== STATUS2.AVAILABLE) {
        throw new Error(
          "Property is not available"
        );
      }
      if (this.getByRestaurant(
        restaurantId2
      )) {
        throw new Error(
          "Restaurant already has an active lease"
        );
      }
      const monthlyRent = commercialTerms?.monthlyRent ?? property.monthlyRent;
      const propertyFeeMonthly = commercialTerms?.propertyFeeMonthly ?? 0;
      const transferFee = commercialTerms?.transferFee ?? 0;
      const rentFreeDays = commercialTerms?.rentFreeDays ?? 0;
      if (!Number.isInteger(monthlyRent) || monthlyRent <= 0) {
        throw new RangeError("Monthly rent must be positive");
      }
      requireNonNegativeInteger(
        propertyFeeMonthly,
        "Property fee"
      );
      requireNonNegativeInteger(
        transferFee,
        "Transfer fee"
      );
      requireNonNegativeInteger(
        rentFreeDays,
        "Rent-free days"
      );
      if (rentFreeDays >= months * 30) {
        throw new RangeError(
          "Rent-free period must be shorter than lease term"
        );
      }
      const deposit = monthlyRent * property.depositMonths;
      const initialRent = rentFreeDays > 0 ? 0 : monthlyRent;
      const upfront = deposit + initialRent + propertyFeeMonthly + transferFee;
      if (financeSystem.getBalance(
        restaurantId2
      ) < upfront) {
        throw new Error(
          "Insufficient funds for lease"
        );
      }
      financeSystem.holdDeposit(
        restaurantId2,
        deposit,
        `\u94FA\u4F4D\u62BC\u91D1 ${property.name}`
      );
      if (transferFee > 0) {
        financeSystem.expense(
          restaurantId2,
          transferFee,
          CATEGORY.OTHER,
          `\u94FA\u4F4D\u8F6C\u8BA9\u8D39 ${property.name}`
        );
      }
      if (propertyFeeMonthly > 0) {
        financeSystem.expense(
          restaurantId2,
          propertyFeeMonthly,
          CATEGORY.UTILITIES,
          `\u9996\u6708\u7269\u4E1A\u8D39 ${property.name}`
        );
      }
      if (initialRent > 0) {
        financeSystem.expense(
          restaurantId2,
          monthlyRent,
          CATEGORY.RENT,
          `\u9996\u6708\u79DF\u91D1 ${property.name}`
        );
      }
      const time = gameState.getSection("time");
      const startDay = time.day;
      const lease = entitySystem.create(
        "lease",
        {
          restaurantId: restaurantId2,
          propertyId,
          monthlyRent,
          propertyFeeMonthly,
          transferFee,
          rentFreeDays,
          offerId: commercialTerms?.offerId ?? null,
          deposit,
          months,
          status: "active",
          startDay,
          nextRentDay: startDay + (rentFreeDays > 0 ? rentFreeDays : 30),
          nextPropertyFeeDay: propertyFeeMonthly > 0 ? startDay + 30 : null,
          endDay: startDay + months * 30,
          rentPayments: initialRent > 0 ? 1 : 0,
          propertyFeePayments: propertyFeeMonthly > 0 ? 1 : 0,
          unpaidRent: 0,
          unpaidPropertyFee: 0,
          renewalCount: 0,
          startedAt: time.totalMinutes,
          lastRentDay: initialRent > 0 ? startDay : null,
          lastPropertyFeeDay: propertyFeeMonthly > 0 ? startDay : null,
          endedAt: null
        }
      );
      propertySystem.markLeased(
        propertyId,
        restaurantId2
      );
      entitySystem.update(
        "restaurant",
        restaurantId2,
        {
          locationId: propertyId
        }
      );
      eventBus.emit(
        "lease:signed",
        {
          lease: structuredClone(
            lease
          )
        }
      );
      return lease;
    }
    get(id) {
      return requireLease(id);
    }
    getByRestaurant(restaurantId2) {
      return entitySystem.list("lease").find(
        (lease) => lease.restaurantId === restaurantId2 && lease.status === "active"
      );
    }
    chargeMonthlyRent(leaseId) {
      const lease = requireLease(leaseId);
      if (lease.status !== "active") {
        throw new Error(
          "Lease is not active"
        );
      }
      const dueDay = lease.nextRentDay;
      const nextRentDay = dueDay + 30;
      if (financeSystem.getBalance(
        lease.restaurantId
      ) >= lease.monthlyRent) {
        financeSystem.expense(
          lease.restaurantId,
          lease.monthlyRent,
          CATEGORY.RENT,
          `\u7B2C${dueDay}\u65E5\u6708\u79DF\u91D1`
        );
        const updated2 = entitySystem.update(
          "lease",
          leaseId,
          {
            lastRentDay: dueDay,
            nextRentDay,
            rentPayments: (lease.rentPayments ?? 0) + 1
          }
        );
        return {
          paid: true,
          lease: updated2
        };
      }
      const updated = entitySystem.update(
        "lease",
        leaseId,
        {
          lastRentDay: dueDay,
          nextRentDay,
          unpaidRent: (lease.unpaidRent ?? 0) + lease.monthlyRent
        }
      );
      eventBus.emit(
        "lease:rentArrears",
        {
          leaseId,
          restaurantId: lease.restaurantId,
          amount: lease.monthlyRent,
          unpaidRent: updated.unpaidRent
        }
      );
      return {
        paid: false,
        lease: updated
      };
    }
    chargePropertyFee(leaseId) {
      const lease = requireLease(leaseId);
      if (lease.status !== "active") {
        throw new Error("Lease is not active");
      }
      if ((lease.propertyFeeMonthly ?? 0) <= 0) {
        return {
          paid: true,
          lease
        };
      }
      const dueDay = lease.nextPropertyFeeDay;
      if (!Number.isInteger(dueDay)) {
        return {
          paid: true,
          lease
        };
      }
      const nextPropertyFeeDay = dueDay + 30;
      if (financeSystem.getBalance(lease.restaurantId) >= lease.propertyFeeMonthly) {
        financeSystem.expense(
          lease.restaurantId,
          lease.propertyFeeMonthly,
          CATEGORY.UTILITIES,
          `\u7B2C${dueDay}\u65E5\u7269\u4E1A\u8D39`
        );
        return {
          paid: true,
          lease: entitySystem.update("lease", leaseId, {
            lastPropertyFeeDay: dueDay,
            nextPropertyFeeDay,
            propertyFeePayments: (lease.propertyFeePayments ?? 0) + 1
          })
        };
      }
      const updated = entitySystem.update("lease", leaseId, {
        lastPropertyFeeDay: dueDay,
        nextPropertyFeeDay,
        unpaidPropertyFee: (lease.unpaidPropertyFee ?? 0) + lease.propertyFeeMonthly
      });
      eventBus.emit("lease:propertyFeeArrears", {
        leaseId,
        restaurantId: lease.restaurantId,
        amount: lease.propertyFeeMonthly,
        unpaidPropertyFee: updated.unpaidPropertyFee
      });
      return {
        paid: false,
        lease: updated
      };
    }
    renew(leaseId, {
      months = 12,
      monthlyRent = null,
      propertyFeeMonthly = null
    } = {}) {
      const lease = requireLease(leaseId);
      if (lease.status !== "active") {
        throw new Error("Lease is not active");
      }
      if (!Number.isInteger(months) || months <= 0) {
        throw new RangeError("Renewal months must be positive");
      }
      const nextMonthlyRent = monthlyRent ?? lease.monthlyRent;
      const nextPropertyFee = propertyFeeMonthly ?? lease.propertyFeeMonthly ?? 0;
      if (!Number.isInteger(nextMonthlyRent) || nextMonthlyRent <= 0) {
        throw new RangeError("Renewal monthly rent must be positive");
      }
      requireNonNegativeInteger(
        nextPropertyFee,
        "Renewal property fee"
      );
      const property = propertySystem.get(lease.propertyId);
      const newDeposit = nextMonthlyRent * property.depositMonths;
      const depositDifference = newDeposit - lease.deposit;
      if (depositDifference > 0) {
        financeSystem.holdDeposit(
          lease.restaurantId,
          depositDifference,
          "\u7EED\u79DF\u8865\u8DB3\u62BC\u91D1"
        );
      } else if (depositDifference < 0) {
        financeSystem.releaseDeposit(
          lease.restaurantId,
          Math.abs(depositDifference),
          "\u7EED\u79DF\u9000\u8FD8\u591A\u4F59\u62BC\u91D1"
        );
      }
      const updated = entitySystem.update(
        "lease",
        leaseId,
        {
          monthlyRent: nextMonthlyRent,
          propertyFeeMonthly: nextPropertyFee,
          deposit: newDeposit,
          months: lease.months + months,
          endDay: lease.endDay + months * 30,
          renewalCount: (lease.renewalCount ?? 0) + 1,
          lastRenewedDay: gameState.getSection("time").day
        }
      );
      eventBus.emit("lease:renewed", {
        leaseId,
        restaurantId: lease.restaurantId,
        months,
        monthlyRent: nextMonthlyRent,
        propertyFeeMonthly: nextPropertyFee,
        endDay: updated.endDay
      });
      return updated;
    }
    processDay(currentDay4) {
      const leases = entitySystem.list("lease").filter(
        (lease) => lease.status === "active"
      );
      for (const original of leases) {
        let lease = original;
        while (lease.status === "active" && lease.nextRentDay < lease.endDay && currentDay4 >= lease.nextRentDay) {
          lease = this.chargeMonthlyRent(
            lease.id
          ).lease;
        }
        while (lease.status === "active" && Number.isInteger(lease.nextPropertyFeeDay) && lease.nextPropertyFeeDay < lease.endDay && currentDay4 >= lease.nextPropertyFeeDay) {
          lease = this.chargePropertyFee(lease.id).lease;
        }
        if (lease.status === "active" && currentDay4 >= lease.endDay) {
          this.terminate(
            lease.id,
            {
              reason: "contract_expired"
            }
          );
        }
      }
    }
    terminate(leaseId, {
      reason = "manual"
    } = {}) {
      const lease = requireLease(leaseId);
      if (lease.status !== "active") {
        return lease;
      }
      let remainingDeposit = lease.deposit;
      let remainingRentArrears = lease.unpaidRent ?? 0;
      let remainingPropertyFeeArrears = lease.unpaidPropertyFee ?? 0;
      let remainingArrears = remainingRentArrears + remainingPropertyFeeArrears;
      let depositApplied = 0;
      if (remainingArrears > 0 && remainingDeposit > 0) {
        depositApplied = Math.min(
          remainingDeposit,
          remainingArrears
        );
        financeSystem.applyHeldDeposit(
          lease.restaurantId,
          depositApplied,
          CATEGORY.RENT,
          "\u62BC\u91D1\u62B5\u6263\u79DF\u8D41\u6B20\u6B3E"
        );
        remainingDeposit -= depositApplied;
        let remainingApplied = depositApplied;
        const rentApplied = Math.min(
          remainingRentArrears,
          remainingApplied
        );
        remainingRentArrears -= rentApplied;
        remainingApplied -= rentApplied;
        remainingPropertyFeeArrears = Math.max(
          0,
          remainingPropertyFeeArrears - remainingApplied
        );
        remainingArrears = remainingRentArrears + remainingPropertyFeeArrears;
      }
      if (remainingDeposit > 0) {
        financeSystem.releaseDeposit(
          lease.restaurantId,
          remainingDeposit,
          "\u9000\u8FD8\u94FA\u4F4D\u62BC\u91D1"
        );
      }
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "lease",
        leaseId,
        {
          status: "terminated",
          terminationReason: reason,
          endedAt: time.totalMinutes,
          depositApplied,
          depositRefunded: remainingDeposit,
          unpaidRent: remainingRentArrears,
          unpaidPropertyFee: remainingPropertyFeeArrears,
          unpaidLeaseCharges: remainingArrears
        }
      );
      propertySystem.release(
        lease.propertyId
      );
      entitySystem.update(
        "restaurant",
        lease.restaurantId,
        {
          locationId: null
        }
      );
      eventBus.emit(
        "lease:terminated",
        {
          leaseId,
          reason
        }
      );
      return updated;
    }
  };
  var leaseSystem = new LeaseSystem();

  // src/systems/PropertyFloorplanSystem.js
  function pointOnSegment(point, a, b) {
    const cross = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y);
    if (Math.abs(cross) > 1e-9) {
      return false;
    }
    const dot = (point.x - a.x) * (point.x - b.x) + (point.y - a.y) * (point.y - b.y);
    return dot <= 1e-9;
  }
  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[j];
      const b = polygon[i];
      if (pointOnSegment(point, a, b)) {
        return true;
      }
      const intersects = a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
      if (intersects) {
        inside = !inside;
      }
    }
    return inside;
  }
  function rectanglesOverlap(a, b) {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
  }
  function normalizeObstacle(item, fallbackSize = 1) {
    if (!item || !Number.isFinite(item.x) || !Number.isFinite(item.y)) {
      return null;
    }
    return {
      id: item.id ?? null,
      type: item.type ?? "structure",
      x: item.x,
      y: item.y,
      width: Number.isFinite(item.width) && item.width > 0 ? item.width : fallbackSize,
      height: Number.isFinite(item.height) && item.height > 0 ? item.height : fallbackSize
    };
  }
  var PropertyFloorplanSystem = class {
    getFloor(propertyId, floorId = null) {
      const floor = propertySystem.getFloor(propertyId, floorId);
      if (!floor) {
        throw new Error(`Floor "${floorId ?? "default"}" does not exist`);
      }
      return floor;
    }
    getObstacles(propertyId, floorId = null) {
      const floor = this.getFloor(propertyId, floorId);
      return [
        ...(floor.columns ?? []).map((item) => ({
          ...item,
          type: item.type ?? "column"
        })),
        ...floor.fixedStructures ?? []
      ].map((item) => normalizeObstacle(item)).filter(Boolean);
    }
    isRectangleInsideFloor(propertyId, floorId, rectangle) {
      const floor = this.getFloor(propertyId, floorId);
      const polygon = floor.polygon ?? [];
      if (!rectangle || !Number.isFinite(rectangle.x) || !Number.isFinite(rectangle.y) || !Number.isFinite(rectangle.width) || !Number.isFinite(rectangle.height) || rectangle.width <= 0 || rectangle.height <= 0) {
        return false;
      }
      const corners = [
        { x: rectangle.x, y: rectangle.y },
        { x: rectangle.x + rectangle.width, y: rectangle.y },
        { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
        { x: rectangle.x, y: rectangle.y + rectangle.height }
      ];
      return corners.every((point) => pointInPolygon(point, polygon));
    }
    findObstacleCollision(propertyId, floorId, rectangle) {
      return this.getObstacles(propertyId, floorId).find(
        (obstacle) => rectanglesOverlap(rectangle, obstacle)
      ) ?? null;
    }
    validatePlacement(propertyId, floorId, rectangle) {
      const floor = this.getFloor(propertyId, floorId);
      if (!this.isRectangleInsideFloor(propertyId, floor.id, rectangle)) {
        throw new Error("Placement is outside the rented floorplan");
      }
      const obstacle = this.findObstacleCollision(
        propertyId,
        floor.id,
        rectangle
      );
      if (obstacle) {
        throw new Error(
          `Placement collides with fixed structure "${obstacle.id ?? obstacle.type}"`
        );
      }
      return true;
    }
    getEditingMode(propertyId) {
      const property = propertySystem.get(propertyId);
      const usableArea = property.usableArea ?? property.area;
      if (usableArea <= 120 && (property.floorCount ?? 1) === 1) {
        return {
          mode: "direct",
          minimap: false,
          zoneNavigator: false,
          floorSelector: false
        };
      }
      if (usableArea <= 1e3 && (property.floorCount ?? 1) === 1) {
        return {
          mode: "overview_edit",
          minimap: true,
          zoneNavigator: true,
          floorSelector: false
        };
      }
      return {
        mode: "floor_zone",
        minimap: true,
        zoneNavigator: true,
        floorSelector: (property.floorCount ?? 1) > 1
      };
    }
  };
  var propertyFloorplanSystem = new PropertyFloorplanSystem();

  // src/systems/RenovationSystem.js
  var FURNITURE = Object.freeze({
    table_2: {
      id: "table_2",
      name: "\u53CC\u4EBA\u684C",
      type: "table",
      width: 2,
      height: 1,
      cost: 900,
      seats: 2
    },
    table_4: {
      id: "table_4",
      name: "\u56DB\u4EBA\u684C",
      type: "table",
      width: 2,
      height: 2,
      cost: 1600,
      seats: 4
    },
    booth_4: {
      id: "booth_4",
      name: "\u56DB\u4EBA\u5361\u5EA7",
      type: "table",
      width: 3,
      height: 2,
      cost: 2800,
      seats: 4,
      appeal: 0.01,
      requiresFeature: "advanced_renovation"
    },
    kitchen_station: {
      id: "kitchen_station",
      name: "\u57FA\u7840\u7076\u53F0",
      type: "kitchen",
      width: 2,
      height: 2,
      cost: 4500,
      kitchenStations: 1
    },
    prep_counter: {
      id: "prep_counter",
      name: "\u5907\u9910\u53F0",
      type: "kitchen_support",
      width: 2,
      height: 1,
      cost: 2600,
      kitchenEfficiency: 0.08,
      maxCount: 3,
      requiresFeature: "advanced_renovation"
    },
    cashier_counter: {
      id: "cashier_counter",
      name: "\u6536\u94F6\u53F0",
      type: "service",
      width: 2,
      height: 1,
      cost: 1800,
      serviceEfficiency: 0.08,
      maxCount: 2
    },
    waiting_bench: {
      id: "waiting_bench",
      name: "\u7B49\u5019\u957F\u6905",
      type: "service",
      width: 2,
      height: 1,
      cost: 1200,
      queueEfficiency: 0.08,
      maxCount: 3
    },
    decor_plant: {
      id: "decor_plant",
      name: "\u7EFF\u690D\u88C5\u9970",
      type: "decor",
      width: 1,
      height: 1,
      cost: 500,
      appeal: 0.01,
      maxCount: 8
    },
    decor_feature: {
      id: "decor_feature",
      name: "\u4E3B\u9898\u88C5\u9970",
      type: "decor",
      width: 2,
      height: 2,
      cost: 4200,
      appeal: 0.04,
      maxCount: 3,
      requiresFeature: "advanced_renovation"
    }
  });
  function clamp3(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function requireInteger(value, name) {
    if (!Number.isInteger(value)) {
      throw new TypeError(`${name} must be an integer`);
    }
  }
  var RenovationSystem = class {
    getFurnitureDefinition(id) {
      const definition = FURNITURE[id];
      if (!definition) {
        throw new Error(`Unknown furniture "${id}"`);
      }
      return structuredClone(definition);
    }
    getCatalog(restaurantId2 = null) {
      return Object.values(FURNITURE).map((item) => ({
        ...structuredClone(item),
        unlocked: !item.requiresFeature || restaurantId2 === null || storeProgressSystem.isUnlocked(
          restaurantId2,
          item.requiresFeature
        )
      }));
    }
    findLayout(restaurantId2) {
      return entitySystem.list("renovation_layout").find((item) => item.restaurantId === restaurantId2);
    }
    getLayout(restaurantId2) {
      restaurantSystem.get(restaurantId2);
      return this.findLayout(restaurantId2) ?? null;
    }
    getGridSize(area) {
      const targetCells = Math.max(24, Math.ceil(area / 2));
      const width = Math.max(
        6,
        Math.ceil(Math.sqrt(targetCells * 1.5))
      );
      const height = Math.max(
        6,
        Math.ceil(targetCells / width)
      );
      return { width, height };
    }
    getLayoutFloors(layout) {
      if (Array.isArray(layout.floors) && layout.floors.length > 0) {
        return layout.floors;
      }
      return [
        {
          id: "floor_1",
          label: "1F",
          floorNumber: 1,
          area: layout.width * layout.height,
          usableArea: layout.width * layout.height,
          width: layout.width,
          height: layout.height,
          shape: "rectangle",
          polygon: [
            { x: 0, y: 0 },
            { x: layout.width, y: 0 },
            { x: layout.width, y: layout.height },
            { x: 0, y: layout.height }
          ],
          entrances: [],
          windows: [],
          columns: [],
          fixedStructures: [],
          utilityPoints: []
        }
      ];
    }
    getFloor(layout, floorId = null) {
      const floors = this.getLayoutFloors(layout);
      const resolvedId = floorId ?? layout.activeFloorId ?? floors[0]?.id ?? null;
      const floor = floors.find((item) => item.id === resolvedId);
      if (!floor) {
        throw new Error(`Renovation floor "${resolvedId}" does not exist`);
      }
      return floor;
    }
    getPlacementFloorId(layout, placement) {
      return placement.floorId ?? layout.activeFloorId ?? this.getLayoutFloors(layout)[0]?.id ?? "floor_1";
    }
    initialize(restaurantId2) {
      const restaurant = restaurantSystem.get(restaurantId2);
      if (this.findLayout(restaurantId2)) {
        return this.findLayout(restaurantId2);
      }
      if (!restaurant.locationId) {
        throw new Error("Restaurant requires a leased property before renovation");
      }
      const property = propertySystem.get(restaurant.locationId);
      const propertyLayout = propertySystem.getLayout(property.id);
      const fallbackGrid = this.getGridSize(property.usableArea ?? property.area);
      const floors = propertyLayout.floors?.length ? structuredClone(propertyLayout.floors) : [
        {
          id: "floor_1",
          label: "1F",
          floorNumber: 1,
          area: property.area,
          usableArea: property.usableArea ?? property.area,
          width: fallbackGrid.width,
          height: fallbackGrid.height,
          shape: "rectangle",
          polygon: [
            { x: 0, y: 0 },
            { x: fallbackGrid.width, y: 0 },
            { x: fallbackGrid.width, y: fallbackGrid.height },
            { x: 0, y: fallbackGrid.height }
          ],
          entrances: [],
          windows: [],
          columns: [],
          fixedStructures: [],
          utilityPoints: []
        }
      ];
      const defaultFloor = floors[0];
      const time = gameState.getSection("time");
      const layout = entitySystem.create("renovation_layout", {
        restaurantId: restaurantId2,
        propertyId: property.id,
        propertyLayoutVersion: propertyLayout.layoutVersion ?? 1,
        floorCount: floors.length,
        floors,
        activeFloorId: defaultFloor.id,
        width: defaultFloor.width,
        height: defaultFloor.height,
        active: false,
        revision: 1,
        placements: [],
        nextPlacementNumber: 1,
        totalSpent: 0,
        createdDay: time.day,
        updatedDay: time.day,
        activatedDay: null
      });
      eventBus.emit("renovation:initialized", {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        propertyId: property.id,
        floorCount: floors.length,
        activeFloorId: defaultFloor.id
      });
      return layout;
    }
    requireLayout(restaurantId2) {
      return this.findLayout(restaurantId2) ?? this.initialize(restaurantId2);
    }
    setActiveFloor(restaurantId2, floorId) {
      const layout = this.requireLayout(restaurantId2);
      const floor = this.getFloor(layout, floorId);
      return entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          activeFloorId: floor.id,
          width: floor.width,
          height: floor.height,
          revision: (layout.revision ?? 0) + 1,
          updatedDay: gameState.getSection("time").day
        }
      );
    }
    getSize(definition, rotation) {
      if (![0, 90].includes(rotation)) {
        throw new RangeError("Rotation must be 0 or 90");
      }
      return rotation === 90 ? { width: definition.height, height: definition.width } : { width: definition.width, height: definition.height };
    }
    rectanglesOverlap(a, b) {
      return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }
    validatePlacement(layout, placement, ignorePlacementId = null) {
      const definition = this.getFurnitureDefinition(placement.furnitureId);
      const size = this.getSize(definition, placement.rotation ?? 0);
      const floorId = this.getPlacementFloorId(layout, placement);
      const floor = this.getFloor(layout, floorId);
      requireInteger(placement.x, "x");
      requireInteger(placement.y, "y");
      if (placement.x < 0 || placement.y < 0) {
        throw new RangeError("Furniture position cannot be negative");
      }
      const rectangle = {
        x: placement.x,
        y: placement.y,
        width: size.width,
        height: size.height
      };
      if (layout.propertyId && Array.isArray(layout.floors)) {
        propertyFloorplanSystem.validatePlacement(
          layout.propertyId,
          floor.id,
          rectangle
        );
      } else if (placement.x + size.width > floor.width || placement.y + size.height > floor.height) {
        throw new Error("Furniture is outside renovation bounds");
      }
      for (const current of layout.placements ?? []) {
        if (current.id === ignorePlacementId) {
          continue;
        }
        if (this.getPlacementFloorId(layout, current) !== floor.id) {
          continue;
        }
        const currentDefinition = this.getFurnitureDefinition(
          current.furnitureId
        );
        const currentSize = this.getSize(
          currentDefinition,
          current.rotation ?? 0
        );
        if (this.rectanglesOverlap(rectangle, {
          x: current.x,
          y: current.y,
          width: currentSize.width,
          height: currentSize.height
        })) {
          throw new Error("Furniture overlaps an existing placement");
        }
      }
      return true;
    }
    countByType(layout, type) {
      return (layout.placements ?? []).filter((placement) => {
        return this.getFurnitureDefinition(placement.furnitureId).type === type;
      }).length;
    }
    countFurniture(layout, furnitureId) {
      return (layout.placements ?? []).filter(
        (placement) => placement.furnitureId === furnitureId
      ).length;
    }
    validateLimits(restaurantId2, layout, definition) {
      const limits = storeProgressSystem.getLimits(restaurantId2);
      if (definition.type === "table" && this.countByType(layout, "table") >= limits.tables) {
        throw new Error(`Table limit reached: ${limits.tables}`);
      }
      if (definition.kitchenStations && this.getOperationalModifiersFromLayout(layout).kitchenStations >= limits.kitchenStations) {
        throw new Error(
          `Kitchen station limit reached: ${limits.kitchenStations}`
        );
      }
      if (definition.maxCount && this.countFurniture(layout, definition.id) >= definition.maxCount) {
        throw new Error(
          `Furniture limit reached for "${definition.id}": ${definition.maxCount}`
        );
      }
    }
    placeItem({
      restaurantId: restaurantId2,
      furnitureId,
      x,
      y,
      rotation = 0,
      floorId = null
    }) {
      const layout = this.requireLayout(restaurantId2);
      const definition = this.getFurnitureDefinition(furnitureId);
      if (definition.requiresFeature && !storeProgressSystem.isUnlocked(
        restaurantId2,
        definition.requiresFeature
      )) {
        throw new Error(`Furniture "${furnitureId}" is not unlocked`);
      }
      this.validateLimits(restaurantId2, layout, definition);
      const placement = {
        id: `placement_${layout.nextPlacementNumber ?? 1}`,
        furnitureId,
        floorId: floorId ?? layout.activeFloorId ?? this.getLayoutFloors(layout)[0].id,
        x,
        y,
        rotation
      };
      this.validatePlacement(layout, placement);
      financeSystem.expense(
        restaurantId2,
        definition.cost,
        definition.type === "decor" ? CATEGORY.DECORATION : CATEGORY.EQUIPMENT,
        `\u88C5\u4FEE\u8D2D\u7F6E\uFF1A${definition.name}`
      );
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          placements: [...layout.placements ?? [], placement],
          nextPlacementNumber: (layout.nextPlacementNumber ?? 1) + 1,
          totalSpent: (layout.totalSpent ?? 0) + definition.cost,
          revision: (layout.revision ?? 0) + 1,
          updatedDay: time.day
        }
      );
      eventBus.emit("renovation:itemPlaced", {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        placement: structuredClone(placement)
      });
      return updated;
    }
    moveItem({
      restaurantId: restaurantId2,
      placementId,
      x,
      y,
      rotation = null,
      floorId = null
    }) {
      const layout = this.requireLayout(restaurantId2);
      const current = (layout.placements ?? []).find(
        (item) => item.id === placementId
      );
      if (!current) {
        throw new Error(`Placement "${placementId}" does not exist`);
      }
      const moved = {
        ...current,
        floorId: floorId ?? current.floorId ?? layout.activeFloorId ?? this.getLayoutFloors(layout)[0].id,
        x,
        y,
        rotation: rotation ?? current.rotation ?? 0
      };
      this.validatePlacement(layout, moved, placementId);
      const time = gameState.getSection("time");
      const placements = layout.placements.map(
        (item) => item.id === placementId ? moved : item
      );
      return entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          placements,
          revision: (layout.revision ?? 0) + 1,
          updatedDay: time.day
        }
      );
    }
    removeItem(restaurantId2, placementId) {
      const layout = this.requireLayout(restaurantId2);
      const exists = (layout.placements ?? []).some(
        (item) => item.id === placementId
      );
      if (!exists) {
        throw new Error(`Placement "${placementId}" does not exist`);
      }
      const time = gameState.getSection("time");
      return entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          placements: layout.placements.filter(
            (item) => item.id !== placementId
          ),
          active: false,
          revision: (layout.revision ?? 0) + 1,
          updatedDay: time.day
        }
      );
    }
    getOperationalModifiersFromLayout(layout) {
      const result = {
        seats: 0,
        tables: 0,
        kitchenStations: 0,
        kitchenEfficiency: 1,
        serviceEfficiency: 1,
        queueEfficiency: 1,
        appealMultiplier: 1
      };
      for (const placement of layout.placements ?? []) {
        const item = this.getFurnitureDefinition(placement.furnitureId);
        result.seats += item.seats ?? 0;
        result.tables += item.type === "table" ? 1 : 0;
        result.kitchenStations += item.kitchenStations ?? 0;
        result.kitchenEfficiency += item.kitchenEfficiency ?? 0;
        result.serviceEfficiency += item.serviceEfficiency ?? 0;
        result.queueEfficiency += item.queueEfficiency ?? 0;
        result.appealMultiplier += item.appeal ?? 0;
      }
      result.kitchenEfficiency = clamp3(result.kitchenEfficiency, 1, 1.3);
      result.serviceEfficiency = clamp3(result.serviceEfficiency, 1, 1.2);
      result.queueEfficiency = clamp3(result.queueEfficiency, 1, 1.25);
      result.appealMultiplier = clamp3(result.appealMultiplier, 1, 1.15);
      return result;
    }
    getOperationalModifiers(restaurantId2) {
      const layout = this.findLayout(restaurantId2);
      if (!layout || !layout.active) {
        return {
          active: false,
          seats: null,
          tables: null,
          kitchenStations: null,
          kitchenEfficiency: 1,
          serviceEfficiency: 1,
          queueEfficiency: 1,
          appealMultiplier: 1
        };
      }
      return {
        active: true,
        ...this.getOperationalModifiersFromLayout(layout)
      };
    }
    activateLayout(restaurantId2) {
      const layout = this.requireLayout(restaurantId2);
      const modifiers = this.getOperationalModifiersFromLayout(layout);
      if (modifiers.seats < 2) {
        throw new Error("Active renovation requires at least 2 seats");
      }
      if (modifiers.kitchenStations < 1) {
        throw new Error("Active renovation requires at least 1 kitchen station");
      }
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          active: true,
          activatedDay: time.day,
          updatedDay: time.day,
          revision: (layout.revision ?? 0) + 1
        }
      );
      eventBus.emit("renovation:activated", {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        modifiers
      });
      return updated;
    }
    deactivateLayout(restaurantId2) {
      const layout = this.requireLayout(restaurantId2);
      return entitySystem.update(
        "renovation_layout",
        layout.id,
        {
          active: false,
          revision: (layout.revision ?? 0) + 1,
          updatedDay: gameState.getSection("time").day
        }
      );
    }
    getKitchenCapacityPerHour(restaurantId2) {
      const modifiers = this.getOperationalModifiers(restaurantId2);
      if (!modifiers.active) {
        return Infinity;
      }
      return Math.max(
        1,
        Math.floor(
          modifiers.kitchenStations * 8 * modifiers.kitchenEfficiency
        )
      );
    }
    getSummary(restaurantId2) {
      const layout = this.findLayout(restaurantId2);
      if (!layout) {
        return {
          restaurantId: restaurantId2,
          initialized: false,
          active: false,
          placements: 0,
          totalSpent: 0,
          modifiers: this.getOperationalModifiers(restaurantId2)
        };
      }
      let editingMode = null;
      if (layout.propertyId) {
        try {
          editingMode = propertyFloorplanSystem.getEditingMode(layout.propertyId);
        } catch {
          editingMode = null;
        }
      }
      return {
        restaurantId: restaurantId2,
        initialized: true,
        active: layout.active,
        layoutId: layout.id,
        propertyId: layout.propertyId ?? null,
        propertyLayoutVersion: layout.propertyLayoutVersion ?? 1,
        floorCount: layout.floorCount ?? this.getLayoutFloors(layout).length,
        activeFloorId: layout.activeFloorId ?? this.getLayoutFloors(layout)[0]?.id ?? null,
        floors: structuredClone(this.getLayoutFloors(layout)),
        width: layout.width,
        height: layout.height,
        placements: layout.placements.length,
        totalSpent: layout.totalSpent ?? 0,
        revision: layout.revision ?? 1,
        editingMode,
        modifiers: layout.active ? this.getOperationalModifiers(restaurantId2) : {
          active: false,
          ...this.getOperationalModifiersFromLayout(layout)
        }
      };
    }
  };
  var renovationSystem = new RenovationSystem();

  // src/systems/DishCatalogSystem.js
  var COLLECTION3 = "dishes";
  var CUSTOM_TYPE = "custom_dish";
  function validateDish(dish) {
    if (!dish || typeof dish !== "object") {
      throw new TypeError(
        "Dish must be an object"
      );
    }
    if (typeof dish.id !== "string" || !dish.id.trim()) {
      throw new Error(
        "Dish id is required"
      );
    }
    if (typeof dish.name !== "string" || !dish.name.trim()) {
      throw new Error(
        `Dish "${dish.id}" requires a name`
      );
    }
    if (typeof dish.category !== "string" || !dish.category.trim()) {
      throw new Error(
        `Dish "${dish.id}" requires a category`
      );
    }
    if (!Number.isInteger(
      dish.basePrice
    ) || dish.basePrice <= 0) {
      throw new Error(
        `Dish "${dish.id}" has invalid basePrice`
      );
    }
    return true;
  }
  var DishCatalogSystem = class {
    load(records, {
      overwrite = false
    } = {}) {
      if (!Array.isArray(records)) {
        throw new TypeError(
          "Dish records must be an array"
        );
      }
      records.forEach(
        validateDish
      );
      return dataRegistry.register(
        COLLECTION3,
        records,
        {
          overwrite
        }
      );
    }
    get(id) {
      return dataRegistry.get(
        COLLECTION3,
        id
      ) ?? entitySystem.get(
        CUSTOM_TYPE,
        id
      );
    }
    getAll() {
      return [
        ...dataRegistry.getAll(
          COLLECTION3
        ),
        ...entitySystem.list(
          CUSTOM_TYPE
        )
      ];
    }
    exists(id) {
      return dataRegistry.has(
        COLLECTION3,
        id
      ) || entitySystem.exists(
        CUSTOM_TYPE,
        id
      );
    }
    count() {
      return dataRegistry.count(
        COLLECTION3
      ) + entitySystem.count(
        CUSTOM_TYPE
      );
    }
    getByCategory(category) {
      return this.getAll().filter(
        (dish) => dish.category === category
      );
    }
    getCustomByRestaurant(restaurantId2) {
      return entitySystem.filter(
        CUSTOM_TYPE,
        (item) => item.ownerRestaurantId === restaurantId2
      );
    }
  };
  var dishCatalogSystem = new DishCatalogSystem();

  // src/systems/RecipeSystem.js
  var COLLECTION4 = "recipes";
  var CUSTOM_TYPE2 = "custom_recipe";
  function validateRecipe(recipe) {
    if (!recipe || typeof recipe !== "object") {
      throw new TypeError(
        "Recipe must be an object"
      );
    }
    if (typeof recipe.id !== "string" || !recipe.id.trim()) {
      throw new Error(
        "Recipe id is required"
      );
    }
    if (!dishCatalogSystem.exists(
      recipe.dishId
    )) {
      throw new Error(
        `Recipe "${recipe.id}" references unknown dish "${recipe.dishId}"`
      );
    }
    if (!Array.isArray(
      recipe.ingredients
    ) || recipe.ingredients.length === 0) {
      throw new Error(
        `Recipe "${recipe.id}" requires ingredients`
      );
    }
    const used = /* @__PURE__ */ new Set();
    for (const item of recipe.ingredients) {
      if (!item || typeof item.ingredientId !== "string" || !ingredientCatalogSystem.exists(
        item.ingredientId
      )) {
        throw new Error(
          `Recipe "${recipe.id}" contains unknown ingredient`
        );
      }
      if (used.has(
        item.ingredientId
      )) {
        throw new Error(
          `Recipe "${recipe.id}" contains duplicate ingredient "${item.ingredientId}"`
        );
      }
      used.add(
        item.ingredientId
      );
      if (!Number.isFinite(
        item.quantity
      ) || item.quantity <= 0) {
        throw new Error(
          `Recipe "${recipe.id}" has invalid quantity`
        );
      }
    }
    if (!Number.isInteger(
      recipe.difficulty
    ) || recipe.difficulty < 1 || recipe.difficulty > 100) {
      throw new Error(
        `Recipe "${recipe.id}" difficulty must be 1-100`
      );
    }
    if (!Number.isInteger(
      recipe.cookingMinutes
    ) || recipe.cookingMinutes <= 0) {
      throw new Error(
        `Recipe "${recipe.id}" has invalid cookingMinutes`
      );
    }
    return true;
  }
  var RecipeSystem = class {
    load(records, {
      overwrite = false
    } = {}) {
      if (!Array.isArray(records)) {
        throw new TypeError(
          "Recipe records must be an array"
        );
      }
      records.forEach(
        validateRecipe
      );
      return dataRegistry.register(
        COLLECTION4,
        records,
        {
          overwrite
        }
      );
    }
    get(id) {
      return dataRegistry.get(
        COLLECTION4,
        id
      ) ?? entitySystem.get(
        CUSTOM_TYPE2,
        id
      );
    }
    getAll() {
      return [
        ...dataRegistry.getAll(
          COLLECTION4
        ),
        ...entitySystem.list(
          CUSTOM_TYPE2
        )
      ];
    }
    exists(id) {
      return dataRegistry.has(
        COLLECTION4,
        id
      ) || entitySystem.exists(
        CUSTOM_TYPE2,
        id
      );
    }
    getByDish(dishId) {
      return this.getAll().filter(
        (recipe) => recipe.dishId === dishId
      );
    }
  };
  var recipeSystem = new RecipeSystem();

  // src/systems/DishGrowthSystem.js
  function clamp4(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }
  function getGrade(score) {
    if (score >= 90) {
      return {
        grade: "SS",
        level: 5,
        rarity: "rare"
      };
    }
    if (score >= 80) {
      return {
        grade: "S",
        level: 4,
        rarity: "superior"
      };
    }
    if (score >= 68) {
      return {
        grade: "A",
        level: 3,
        rarity: "premium"
      };
    }
    if (score >= 55) {
      return {
        grade: "B",
        level: 2,
        rarity: "good"
      };
    }
    return {
      grade: "C",
      level: 1,
      rarity: "common"
    };
  }
  var MASTERY_THRESHOLDS = [
    0,
    25,
    80,
    180,
    360
  ];
  var IMPROVEMENTS = Object.freeze({
    quality: {
      id: "quality",
      name: "\u54C1\u8D28\u6539\u826F",
      requiredLevel: 2,
      baseCost: 1800
    },
    speed: {
      id: "speed",
      name: "\u6D41\u7A0B\u4F18\u5316",
      requiredLevel: 3,
      baseCost: 2200
    },
    cost: {
      id: "cost",
      name: "\u6210\u672C\u4F18\u5316",
      requiredLevel: 3,
      baseCost: 2600
    }
  });
  var DishGrowthSystem = class {
    getMasteryLevel(xp) {
      let level = 1;
      for (let index = 1; index < MASTERY_THRESHOLDS.length; index += 1) {
        if (xp >= MASTERY_THRESHOLDS[index]) {
          level = index + 1;
        }
      }
      return level;
    }
    getPrestigeTitle(masteryLevel, qualityScore) {
      if (masteryLevel >= 5 && qualityScore >= 80) {
        return "\u9547\u5E97\u83DC";
      }
      if (masteryLevel >= 4 && qualityScore >= 68) {
        return "\u62DB\u724C\u83DC";
      }
      if (masteryLevel >= 3) {
        return "\u4EBA\u6C14\u83DC";
      }
      if (masteryLevel >= 2) {
        return "\u719F\u7EC3\u83DC";
      }
      return "\u65B0\u7814\u53D1";
    }
    getMasteryQualityBonus(level) {
      return [
        0,
        1,
        2,
        4,
        6
      ][clamp4(
        level,
        1,
        5
      ) - 1];
    }
    recordSale({
      menuItemId,
      quantity,
      revenue
    }) {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }
      const menuItem = entitySystem.get(
        "menu_item",
        menuItemId
      );
      if (!menuItem) {
        return null;
      }
      const dish = entitySystem.get(
        "custom_dish",
        menuItem.dishId
      );
      if (!dish) {
        return null;
      }
      const oldLevel = dish.masteryLevel ?? 1;
      const masteryXp = (dish.masteryXp ?? 0) + quantity;
      const masteryLevel = this.getMasteryLevel(
        masteryXp
      );
      const prestigeTitle = this.getPrestigeTitle(
        masteryLevel,
        dish.qualityScore ?? 50
      );
      const updated = entitySystem.update(
        "custom_dish",
        dish.id,
        {
          masteryXp,
          masteryLevel,
          masteryQualityBonus: this.getMasteryQualityBonus(
            masteryLevel
          ),
          prestigeTitle,
          lifetimeSold: (dish.lifetimeSold ?? 0) + quantity,
          lifetimeRevenue: (dish.lifetimeRevenue ?? 0) + (revenue ?? 0),
          lastSoldDay: gameState.getSection(
            "time"
          ).day
        }
      );
      if (masteryLevel > oldLevel) {
        eventBus.emit(
          "dish:masteryLeveled",
          {
            dishId: dish.id,
            restaurantId: dish.ownerRestaurantId,
            oldLevel,
            masteryLevel,
            prestigeTitle
          }
        );
      }
      return updated;
    }
    getRestaurantAppealMultiplier(restaurantId2) {
      const dishes = entitySystem.filter(
        "custom_dish",
        (item) => item.ownerRestaurantId === restaurantId2
      );
      let multiplier = 1;
      for (const dish of dishes) {
        if (dish.prestigeTitle === "\u9547\u5E97\u83DC") {
          multiplier = Math.max(
            multiplier,
            1.08
          );
        } else if (dish.prestigeTitle === "\u62DB\u724C\u83DC") {
          multiplier = Math.max(
            multiplier,
            1.04
          );
        } else if (dish.prestigeTitle === "\u4EBA\u6C14\u83DC") {
          multiplier = Math.max(
            multiplier,
            1.02
          );
        }
      }
      return multiplier;
    }
    improveRecipe({
      restaurantId: restaurantId2,
      dishId,
      focus
    }) {
      restaurantSystem.get(
        restaurantId2
      );
      const definition = IMPROVEMENTS[focus];
      if (!definition) {
        throw new Error(
          "Invalid improvement focus"
        );
      }
      const dish = entitySystem.get(
        "custom_dish",
        dishId
      );
      if (!dish || dish.ownerRestaurantId !== restaurantId2) {
        throw new Error(
          "Custom dish does not belong to restaurant"
        );
      }
      const masteryLevel = dish.masteryLevel ?? 1;
      if (masteryLevel < definition.requiredLevel) {
        throw new Error(
          `Dish mastery level ${definition.requiredLevel} required`
        );
      }
      const recipe = entitySystem.get(
        "custom_recipe",
        dish.recipeId
      );
      if (!recipe) {
        throw new Error(
          "Custom recipe does not exist"
        );
      }
      const attempts = dish.improvementAttempts ?? 0;
      const cost = Math.round(
        definition.baseCost + attempts * 250 + (dish.qualityLevel ?? 1) * 300
      );
      if (financeSystem.getBalance(
        restaurantId2
      ) < cost) {
        throw new Error(
          "Insufficient funds for recipe improvement"
        );
      }
      financeSystem.expense(
        restaurantId2,
        cost,
        CATEGORY.OTHER,
        `${definition.name}\uFF1A${dish.name}`
      );
      const qualityScore = dish.qualityScore ?? 50;
      const successChance = clamp4(
        0.72 + masteryLevel * 0.04 - qualityScore / 350 - attempts * 0.01,
        0.25,
        0.85
      );
      const success = randomSystem.chance(
        successChance
      );
      let nextQuality = qualityScore;
      const recipeChanges = {};
      if (success) {
        if (focus === "quality") {
          nextQuality = clamp4(
            qualityScore + randomSystem.int(
              2,
              4
            ),
            1,
            100
          );
        }
        if (focus === "speed") {
          recipeChanges.cookingMinutes = Math.max(
            5,
            recipe.cookingMinutes - randomSystem.int(
              1,
              3
            )
          );
        }
        if (focus === "cost") {
          const current = Number.isFinite(
            recipe.ingredientEfficiency
          ) ? recipe.ingredientEfficiency : 1;
          recipeChanges.ingredientEfficiency = Number(
            Math.max(
              0.85,
              current - 0.03
            ).toFixed(2)
          );
        }
      } else {
        nextQuality = clamp4(
          qualityScore - randomSystem.int(
            1,
            2
          ),
          1,
          100
        );
      }
      const grade = getGrade(
        nextQuality
      );
      const time = gameState.getSection(
        "time"
      );
      const history = [
        ...dish.improvementHistory ?? [],
        {
          day: time.day,
          focus,
          success,
          cost,
          qualityBefore: qualityScore,
          qualityAfter: nextQuality
        }
      ];
      if (history.length > 10) {
        history.splice(
          0,
          history.length - 10
        );
      }
      const nextTitle = this.getPrestigeTitle(
        masteryLevel,
        nextQuality
      );
      const updatedDish = entitySystem.update(
        "custom_dish",
        dish.id,
        {
          qualityScore: nextQuality,
          qualityGrade: grade.grade,
          qualityLevel: grade.level,
          rarity: grade.rarity,
          prestigeTitle: nextTitle,
          improvementAttempts: attempts + 1,
          successfulImprovements: (dish.successfulImprovements ?? 0) + (success ? 1 : 0),
          improvementHistory: history
        }
      );
      const updatedRecipe = entitySystem.update(
        "custom_recipe",
        recipe.id,
        {
          ...recipeChanges,
          improvementAttempts: (recipe.improvementAttempts ?? 0) + 1
        }
      );
      eventBus.emit(
        "dish:recipeImproved",
        {
          restaurantId: restaurantId2,
          dishId,
          focus,
          success,
          cost,
          qualityScore: nextQuality
        }
      );
      return {
        success,
        successChance: Number(
          successChance.toFixed(3)
        ),
        cost,
        dish: updatedDish,
        recipe: updatedRecipe
      };
    }
    getStatus(dishId) {
      const dish = entitySystem.get(
        "custom_dish",
        dishId
      );
      if (!dish) {
        return null;
      }
      return {
        dishId: dish.id,
        name: dish.name,
        masteryXp: dish.masteryXp ?? 0,
        masteryLevel: dish.masteryLevel ?? 1,
        prestigeTitle: dish.prestigeTitle ?? "\u65B0\u7814\u53D1",
        masteryQualityBonus: dish.masteryQualityBonus ?? 0,
        qualityScore: dish.qualityScore,
        qualityGrade: dish.qualityGrade,
        lifetimeSold: dish.lifetimeSold ?? 0,
        lifetimeRevenue: dish.lifetimeRevenue ?? 0,
        improvementAttempts: dish.improvementAttempts ?? 0,
        improvementHistory: dish.improvementHistory ?? []
      };
    }
    getAvailableImprovements() {
      return Object.values(
        IMPROVEMENTS
      );
    }
  };
  var dishGrowthSystem = new DishGrowthSystem();

  // src/systems/MenuSystem.js
  function requireRestaurant6(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(`Restaurant "${id}" does not exist`);
    }
    return restaurant;
  }
  function requireMenuItem(id) {
    const item = entitySystem.get("menu_item", id);
    if (!item) {
      throw new Error(`Menu item "${id}" does not exist`);
    }
    return item;
  }
  var MenuSystem = class {
    addItem({ restaurantId: restaurantId2, dishId, recipeId = null, price = null }) {
      requireRestaurant6(restaurantId2);
      const dish = dishCatalogSystem.get(dishId);
      if (!dish) {
        throw new Error(`Dish "${dishId}" does not exist`);
      }
      if (this.listByRestaurant(restaurantId2).some((item2) => item2.dishId === dishId)) {
        throw new Error(`Dish "${dishId}" is already on the menu`);
      }
      const finalRecipeId = recipeId ?? recipeSystem.getByDish(dishId)[0]?.id;
      const recipe = recipeSystem.get(finalRecipeId);
      if (!recipe || recipe.dishId !== dishId) {
        throw new Error("Invalid recipe for dish");
      }
      const limits = storeProgressSystem.getLimits(restaurantId2);
      if (this.listByRestaurant(restaurantId2).length >= limits.menuItems) {
        throw new Error(
          `Menu item limit reached: ${limits.menuItems}`
        );
      }
      const finalPrice = price ?? dish.basePrice;
      if (!Number.isInteger(finalPrice) || finalPrice <= 0) {
        throw new RangeError(
          "Menu price must be positive"
        );
      }
      const item = entitySystem.create("menu_item", {
        restaurantId: restaurantId2,
        dishId,
        recipeId: finalRecipeId,
        price: finalPrice,
        active: true,
        soldCount: 0,
        totalRevenue: 0
      });
      eventBus.emit("menu:itemAdded", {
        item: structuredClone(item)
      });
      return item;
    }
    get(id) {
      return requireMenuItem(id);
    }
    listByRestaurant(restaurantId2, { activeOnly = false } = {}) {
      requireRestaurant6(restaurantId2);
      return entitySystem.list("menu_item").filter(
        (item) => item.restaurantId === restaurantId2
      ).filter(
        (item) => !activeOnly || item.active
      );
    }
    setPrice(id, price) {
      if (!Number.isInteger(price) || price <= 0) {
        throw new RangeError(
          "Menu price must be positive"
        );
      }
      return entitySystem.update(
        "menu_item",
        id,
        { price }
      );
    }
    setActive(id, active) {
      return entitySystem.update(
        "menu_item",
        id,
        { active: Boolean(active) }
      );
    }
    recordSale(id, quantity, revenue) {
      const item = requireMenuItem(id);
      const updated = entitySystem.update(
        "menu_item",
        id,
        {
          soldCount: item.soldCount + quantity,
          totalRevenue: item.totalRevenue + revenue
        }
      );
      dishGrowthSystem.recordSale({
        menuItemId: id,
        quantity,
        revenue
      });
      return updated;
    }
  };
  var menuSystem = new MenuSystem();

  // src/systems/OperatingScheduleSystem.js
  function requireRestaurant7(id) {
    const restaurant = entitySystem.get("restaurant", id);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${id}" does not exist`
      );
    }
    return restaurant;
  }
  var OperatingScheduleSystem = class {
    find(restaurantId2) {
      return entitySystem.list("operating_schedule").find(
        (item) => item.restaurantId === restaurantId2
      );
    }
    create({
      restaurantId: restaurantId2,
      openHour = 9,
      closeHour = 22
    }) {
      requireRestaurant7(restaurantId2);
      if (!Number.isInteger(openHour) || !Number.isInteger(closeHour) || openHour < 0 || openHour > 23 || closeHour < 1 || closeHour > 24 || openHour >= closeHour) {
        throw new RangeError(
          "Invalid operating hours"
        );
      }
      if (this.find(restaurantId2)) {
        throw new Error(
          "Operating schedule already exists"
        );
      }
      return entitySystem.create(
        "operating_schedule",
        {
          restaurantId: restaurantId2,
          openHour,
          closeHour,
          enabled: true
        }
      );
    }
    get(restaurantId2) {
      return this.find(restaurantId2);
    }
    processHour(restaurantId2, hour) {
      const schedule = this.find(restaurantId2);
      if (!schedule || !schedule.enabled) {
        return;
      }
      if (hour === schedule.openHour && !restaurantSystem.isOpen(
        restaurantId2
      )) {
        restaurantSystem.open(
          restaurantId2
        );
        eventBus.emit(
          "operations:autoOpened",
          { restaurantId: restaurantId2, hour }
        );
      }
      const closingHour = schedule.closeHour === 24 ? 0 : schedule.closeHour;
      if (hour === closingHour && restaurantSystem.isOpen(
        restaurantId2
      )) {
        restaurantSystem.close(
          restaurantId2
        );
        eventBus.emit(
          "operations:autoClosed",
          { restaurantId: restaurantId2, hour }
        );
      }
    }
  };
  var operatingScheduleSystem = new OperatingScheduleSystem();

  // src/systems/OpeningPermitSystem.js
  var PERMIT_DEFINITIONS = Object.freeze([
    {
      permitKind: "business_registration",
      name: "\u7ECF\u8425\u767B\u8BB0",
      description: "\u786E\u8BA4\u7ECF\u8425\u5730\u5740\u4E0E\u79DF\u8D41\u5173\u7CFB"
    },
    {
      permitKind: "food_service",
      name: "\u9910\u996E\u7ECF\u8425\u8BB8\u53EF",
      description: "\u786E\u8BA4\u623F\u6E90\u53EF\u5F00\u5C55\u9910\u996E\u7ECF\u8425"
    },
    {
      permitKind: "fire_safety",
      name: "\u6D88\u9632\u4E0E\u8425\u4E1A\u5B89\u5168\u68C0\u67E5",
      description: "\u786E\u8BA4\u88C5\u4FEE\u548C\u57FA\u7840\u7ECF\u8425\u7A7A\u95F4\u8FBE\u5230\u5F00\u4E1A\u6761\u4EF6"
    },
    {
      permitKind: "exhaust",
      name: "\u6392\u70DF\u6761\u4EF6\u5907\u6848",
      description: "\u6D89\u53CA\u70ED\u53A8\u83DC\u54C1\u65F6\u68C0\u67E5\u623F\u6E90\u6392\u70DF\u6761\u4EF6"
    }
  ]);
  var EXHAUST_METHODS = /* @__PURE__ */ new Set([
    "stir_fry",
    "fry",
    "bake",
    "stew"
  ]);
  function evaluatePermitRequirements({
    hasLocation,
    foodServiceAllowed,
    renovationActive,
    seats,
    kitchenStations,
    requiresExhaust,
    exhaustAllowed
  }) {
    return [
      {
        permitKind: "business_registration",
        required: true,
        ready: Boolean(
          hasLocation
        ),
        reason: hasLocation ? "\u7ECF\u8425\u5730\u5740\u5DF2\u786E\u5B9A" : "\u5C1A\u672A\u5B8C\u6210\u9009\u5740\u7B7E\u7EA6"
      },
      {
        permitKind: "food_service",
        required: true,
        ready: Boolean(
          hasLocation && foodServiceAllowed !== false
        ),
        reason: foodServiceAllowed === false ? "\u8BE5\u623F\u6E90\u4E0D\u5141\u8BB8\u9910\u996E\u7ECF\u8425" : hasLocation ? "\u623F\u6E90\u5141\u8BB8\u9910\u996E\u7ECF\u8425" : "\u5C1A\u672A\u786E\u5B9A\u7ECF\u8425\u623F\u6E90"
      },
      {
        permitKind: "fire_safety",
        required: true,
        ready: Boolean(
          renovationActive && seats >= 2 && kitchenStations >= 1
        ),
        reason: renovationActive ? seats >= 2 && kitchenStations >= 1 ? "\u88C5\u4FEE\u5DF2\u7ECF\u9A8C\u6536\u5E76\u8FBE\u5230\u57FA\u7840\u7ECF\u8425\u8981\u6C42" : "\u9910\u4F4D\u6216\u53A8\u623F\u5DE5\u4F4D\u4E0D\u8DB3" : "\u88C5\u4FEE\u5C1A\u672A\u5B8C\u5DE5\u9A8C\u6536"
      },
      {
        permitKind: "exhaust",
        required: Boolean(
          requiresExhaust
        ),
        ready: !requiresExhaust || exhaustAllowed !== false,
        reason: !requiresExhaust ? "\u5F53\u524D\u83DC\u5355\u6682\u4E0D\u8981\u6C42\u70ED\u53A8\u6392\u70DF\u5907\u6848" : exhaustAllowed === false ? "\u5F53\u524D\u83DC\u5355\u6D89\u53CA\u70ED\u53A8\uFF0C\u4F46\u623F\u6E90\u4E0D\u5141\u8BB8\u6392\u70DF" : "\u70ED\u53A8\u6392\u70DF\u6761\u4EF6\u5141\u8BB8"
      }
    ];
  }
  var OpeningPermitSystem = class {
    listByRestaurant(restaurantId2) {
      return entitySystem.list(
        "operating_permit"
      ).filter(
        (item) => item.restaurantId === restaurantId2
      );
    }
    getIssuedMap(restaurantId2) {
      return new Map(
        this.listByRestaurant(
          restaurantId2
        ).filter(
          (item) => item.status === "issued"
        ).map(
          (item) => [
            item.permitKind,
            item
          ]
        )
      );
    }
    menuRequiresExhaust(restaurantId2) {
      const items = menuSystem.listByRestaurant(
        restaurantId2,
        {
          activeOnly: true
        }
      );
      return items.some(
        (item) => {
          const recipe = recipeSystem.get(
            item.recipeId
          );
          return recipe && EXHAUST_METHODS.has(
            recipe.method
          );
        }
      );
    }
    getStatus(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      let property = null;
      if (restaurant.locationId) {
        try {
          property = propertySystem.get(
            restaurant.locationId
          );
        } catch {
          property = null;
        }
      }
      const renovation = renovationSystem.getSummary(
        restaurantId2
      );
      const requiresExhaust = this.menuRequiresExhaust(
        restaurantId2
      );
      const requirements = evaluatePermitRequirements({
        hasLocation: Boolean(
          restaurant.locationId
        ),
        foodServiceAllowed: property?.foodServiceAllowed,
        renovationActive: Boolean(
          renovation.active
        ),
        seats: renovation.modifiers?.seats ?? 0,
        kitchenStations: renovation.modifiers?.kitchenStations ?? 0,
        requiresExhaust,
        exhaustAllowed: property?.exhaustAllowed
      });
      const issued = this.getIssuedMap(
        restaurantId2
      );
      const permits = PERMIT_DEFINITIONS.map(
        (definition) => {
          const requirement = requirements.find(
            (item) => item.permitKind === definition.permitKind
          );
          const record = issued.get(
            definition.permitKind
          ) ?? null;
          return {
            ...definition,
            ...requirement,
            issued: Boolean(
              record
            ),
            record
          };
        }
      );
      const required = permits.filter(
        (item) => item.required
      );
      return {
        restaurantId: restaurantId2,
        property,
        requiresExhaust,
        permits,
        requiredCount: required.length,
        issuedCount: required.filter(
          (item) => item.issued
        ).length,
        allRequirementsReady: required.every(
          (item) => item.ready
        ),
        complete: required.every(
          (item) => item.ready && item.issued
        )
      };
    }
    issueAll(restaurantId2) {
      const status = this.getStatus(
        restaurantId2
      );
      const blocked = status.permits.filter(
        (item) => item.required && !item.ready
      );
      if (blocked.length > 0) {
        throw new Error(
          "\u8BB8\u53EF\u6761\u4EF6\u672A\u6EE1\u8DB3\uFF1A" + blocked.map(
            (item) => item.name
          ).join("\u3001")
        );
      }
      const day = gameState.getSection(
        "time"
      )?.day ?? 1;
      const issuedMap = this.getIssuedMap(
        restaurantId2
      );
      const created = [];
      for (const permit of status.permits) {
        if (!permit.required || issuedMap.has(
          permit.permitKind
        )) {
          continue;
        }
        created.push(
          entitySystem.create(
            "operating_permit",
            {
              restaurantId: restaurantId2,
              permitKind: permit.permitKind,
              name: permit.name,
              status: "issued",
              issuedDay: day
            }
          )
        );
      }
      return {
        created,
        status: this.getStatus(
          restaurantId2
        )
      };
    }
  };
  var openingPermitSystem = new OpeningPermitSystem();

  // src/systems/InventorySystem.js
  var BATCH_STATUS = Object.freeze({
    ACTIVE: "active",
    DEPLETED: "depleted",
    DISCARDED: "discarded"
  });
  function requireRestaurant8(restaurantId2) {
    const restaurant = entitySystem.get("restaurant", restaurantId2);
    if (!restaurant) {
      throw new Error(
        `Restaurant "${restaurantId2}" does not exist`
      );
    }
    return restaurant;
  }
  function requireIngredient(ingredientId) {
    const ingredient = ingredientCatalogSystem.get(ingredientId);
    if (!ingredient) {
      throw new Error(
        `Ingredient "${ingredientId}" does not exist`
      );
    }
    return ingredient;
  }
  function requirePositiveQuantity(quantity) {
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
      throw new RangeError(
        "Quantity must be a positive number"
      );
    }
  }
  var InventorySystem = class {
    getCurrentMinute() {
      return gameState.getSection("time").totalMinutes;
    }
    calculateFreshness(batch) {
      const now = this.getCurrentMinute();
      if (now >= batch.expiresAt) {
        return 0;
      }
      const lifetime = batch.expiresAt - batch.receivedAt;
      if (lifetime <= 0) {
        return 0;
      }
      const remaining = batch.expiresAt - now;
      return Math.max(
        0,
        Math.min(
          100,
          Math.round(
            remaining / lifetime * 100
          )
        )
      );
    }
    decorateBatch(batch) {
      const freshness = this.calculateFreshness(batch);
      return {
        ...structuredClone(batch),
        freshness,
        freshnessState: getFreshnessState(freshness),
        spoiled: freshness === 0
      };
    }
    addBatch({
      restaurantId: restaurantId2,
      ingredientId,
      quantity,
      quality = null,
      shelfLifeDays = null,
      sourceType = "manual",
      sourceId = null,
      unitCost = null,
      storageType = null
    }) {
      requireRestaurant8(restaurantId2);
      const ingredient = requireIngredient(ingredientId);
      requirePositiveQuantity(quantity);
      const finalQuality = quality ?? ingredient.baseQuality;
      if (!Number.isInteger(finalQuality) || finalQuality < 1 || finalQuality > 5) {
        throw new RangeError(
          "Ingredient quality must be between 1 and 5"
        );
      }
      const finalShelfLife = shelfLifeDays ?? ingredient.shelfLifeDays;
      if (!Number.isInteger(finalShelfLife) || finalShelfLife <= 0) {
        throw new RangeError(
          "Shelf life must be a positive integer"
        );
      }
      const finalUnitCost = unitCost ?? ingredient.basePurchasePrice;
      if (typeof finalUnitCost !== "number" || !Number.isFinite(finalUnitCost) || finalUnitCost < 0) {
        throw new RangeError(
          "Unit cost must be non-negative"
        );
      }
      const receivedAt = this.getCurrentMinute();
      const expiresAt = receivedAt + finalShelfLife * 1440;
      const batch = entitySystem.create(
        "inventory_batch",
        {
          restaurantId: restaurantId2,
          ingredientId,
          quantity,
          originalQuantity: quantity,
          unit: ingredient.unit,
          quality: finalQuality,
          storageType: storageType ?? ingredient.storageType,
          receivedAt,
          expiresAt,
          sourceType,
          sourceId,
          unitCost: finalUnitCost,
          status: BATCH_STATUS.ACTIVE
        }
      );
      eventBus.emit(
        "inventory:batchAdded",
        {
          restaurantId: restaurantId2,
          ingredientId,
          batch: this.decorateBatch(batch)
        }
      );
      return this.decorateBatch(batch);
    }
    getBatch(batchId) {
      const batch = entitySystem.get(
        "inventory_batch",
        batchId
      );
      if (!batch) {
        throw new Error(
          `Inventory batch "${batchId}" does not exist`
        );
      }
      return this.decorateBatch(batch);
    }
    getBatches(restaurantId2, ingredientId = null, {
      activeOnly = true,
      includeSpoiled = true
    } = {}) {
      requireRestaurant8(restaurantId2);
      if (ingredientId !== null) {
        requireIngredient(ingredientId);
      }
      const batches = entitySystem.filter(
        "inventory_batch",
        (batch) => batch.restaurantId === restaurantId2 && (ingredientId === null || batch.ingredientId === ingredientId) && (!activeOnly || batch.status === BATCH_STATUS.ACTIVE && batch.quantity > 0)
      );
      let result = batches.map(
        (batch) => this.decorateBatch(batch)
      );
      if (!includeSpoiled) {
        result = result.filter(
          (batch) => !batch.spoiled
        );
      }
      return result.sort(
        (a, b) => a.expiresAt - b.expiresAt || a.receivedAt - b.receivedAt
      );
    }
    getAvailableQuantity(restaurantId2, ingredientId) {
      return this.getBatches(
        restaurantId2,
        ingredientId,
        {
          activeOnly: true,
          includeSpoiled: false
        }
      ).reduce(
        (total, batch) => total + batch.quantity,
        0
      );
    }
    consume(restaurantId2, ingredientId, quantity) {
      requirePositiveQuantity(quantity);
      const batches = this.getBatches(
        restaurantId2,
        ingredientId,
        {
          activeOnly: true,
          includeSpoiled: false
        }
      );
      const available = batches.reduce(
        (total, batch) => total + batch.quantity,
        0
      );
      if (available < quantity) {
        throw new Error(
          `Insufficient inventory for "${ingredientId}": available ${available}, required ${quantity}`
        );
      }
      let remaining = quantity;
      const consumed = [];
      for (const batch of batches) {
        if (remaining <= 0) {
          break;
        }
        const used = Math.min(
          batch.quantity,
          remaining
        );
        const newQuantity = batch.quantity - used;
        entitySystem.update(
          "inventory_batch",
          batch.id,
          {
            quantity: newQuantity,
            status: newQuantity <= 0 ? BATCH_STATUS.DEPLETED : BATCH_STATUS.ACTIVE,
            depletedAt: newQuantity <= 0 ? this.getCurrentMinute() : null
          }
        );
        consumed.push({
          batchId: batch.id,
          quantity: used,
          quality: batch.quality,
          freshness: batch.freshness
        });
        remaining -= used;
      }
      eventBus.emit(
        "inventory:consumed",
        {
          restaurantId: restaurantId2,
          ingredientId,
          quantity,
          consumed: structuredClone(consumed)
        }
      );
      return {
        ingredientId,
        requestedQuantity: quantity,
        consumed,
        remainingQuantity: this.getAvailableQuantity(
          restaurantId2,
          ingredientId
        )
      };
    }
    discardBatch(batchId, reason = "manual") {
      const batch = this.getBatch(batchId);
      if (batch.status !== BATCH_STATUS.ACTIVE) {
        return batch;
      }
      const discardedQuantity = batch.quantity;
      const updated = entitySystem.update(
        "inventory_batch",
        batchId,
        {
          quantity: 0,
          status: BATCH_STATUS.DISCARDED,
          discardedAt: this.getCurrentMinute(),
          discardReason: reason
        }
      );
      eventBus.emit(
        "inventory:discarded",
        {
          restaurantId: batch.restaurantId,
          ingredientId: batch.ingredientId,
          batchId,
          quantity: discardedQuantity,
          reason
        }
      );
      return this.decorateBatch(
        updated
      );
    }
    discardSpoiled(restaurantId2) {
      const spoiled = this.getBatches(
        restaurantId2,
        null,
        {
          activeOnly: true,
          includeSpoiled: true
        }
      ).filter(
        (batch) => batch.spoiled
      );
      let totalBatches = 0;
      let totalQuantity = 0;
      for (const batch of spoiled) {
        totalBatches += 1;
        totalQuantity += batch.quantity;
        this.discardBatch(
          batch.id,
          "spoiled"
        );
      }
      return {
        totalBatches,
        totalQuantity
      };
    }
    pruneInactive(restaurantId2, retentionDays = 30) {
      requireRestaurant8(
        restaurantId2
      );
      const cutoff = this.getCurrentMinute() - retentionDays * 1440;
      const removable = entitySystem.filter(
        "inventory_batch",
        (batch) => {
          if (batch.restaurantId !== restaurantId2 || batch.status === BATCH_STATUS.ACTIVE) {
            return false;
          }
          const inactiveAt = batch.discardedAt ?? batch.depletedAt ?? batch.expiresAt ?? batch.receivedAt;
          return inactiveAt <= cutoff;
        }
      );
      return entitySystem.removeMany(
        "inventory_batch",
        removable.map(
          (batch) => batch.id
        )
      );
    }
    getSummary(restaurantId2) {
      const batches = this.getBatches(
        restaurantId2,
        null,
        {
          activeOnly: true,
          includeSpoiled: true
        }
      );
      const summary = {};
      for (const batch of batches) {
        if (!summary[batch.ingredientId]) {
          summary[batch.ingredientId] = {
            ingredientId: batch.ingredientId,
            totalQuantity: 0,
            usableQuantity: 0,
            spoiledQuantity: 0,
            batches: 0
          };
        }
        const item = summary[batch.ingredientId];
        item.totalQuantity += batch.quantity;
        item.batches += 1;
        if (batch.spoiled) {
          item.spoiledQuantity += batch.quantity;
        } else {
          item.usableQuantity += batch.quantity;
        }
      }
      return Object.values(summary);
    }
  };
  var inventorySystem = new InventorySystem();

  // src/core/SchedulerSystem.js
  var clone5 = (value) => structuredClone(value);
  var SchedulerSystem = class {
    constructor() {
      eventBus.on("time:advanced", () => {
        this.processDueTasks();
      });
    }
    ensureState() {
      let scheduler = gameState.getSection("scheduler");
      if (!scheduler) {
        scheduler = {
          nextId: 1,
          tasks: []
        };
        gameState.setSection(
          "scheduler",
          scheduler,
          "scheduler:initialize"
        );
      }
      return scheduler;
    }
    getCurrentTime() {
      return gameState.getSection("time").totalMinutes;
    }
    scheduleAfter(delayMinutes, action, payload = {}, options = {}) {
      if (!Number.isInteger(delayMinutes) || delayMinutes < 0) {
        throw new RangeError(
          "Delay minutes must be a non-negative integer"
        );
      }
      return this.scheduleAt(
        this.getCurrentTime() + delayMinutes,
        action,
        payload,
        options
      );
    }
    scheduleAt(dueAt, action, payload = {}, options = {}) {
      if (!Number.isInteger(dueAt) || dueAt < 0) {
        throw new RangeError(
          "Due time must be a non-negative integer"
        );
      }
      if (typeof action !== "string" || action.trim() === "") {
        throw new TypeError(
          "Scheduled action must be a non-empty string"
        );
      }
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError(
          "Scheduled payload must be an object"
        );
      }
      const repeatEvery = options.repeatEvery ?? null;
      if (repeatEvery !== null && (!Number.isInteger(repeatEvery) || repeatEvery <= 0)) {
        throw new RangeError(
          "repeatEvery must be a positive integer"
        );
      }
      const scheduler = this.ensureState();
      const id = `task_${String(scheduler.nextId).padStart(6, "0")}`;
      scheduler.nextId += 1;
      const task = {
        id,
        action: action.trim(),
        payload: clone5(payload),
        dueAt,
        repeatEvery,
        runCount: 0,
        createdAt: this.getCurrentTime()
      };
      scheduler.tasks.push(task);
      scheduler.tasks.sort(
        (a, b) => a.dueAt - b.dueAt
      );
      gameState.setSection(
        "scheduler",
        scheduler,
        "scheduler:schedule"
      );
      eventBus.emit("scheduler:scheduled", {
        task: clone5(task)
      });
      return clone5(task);
    }
    cancel(taskId) {
      const scheduler = this.ensureState();
      const index = scheduler.tasks.findIndex(
        (task2) => task2.id === taskId
      );
      if (index === -1) {
        return false;
      }
      const [task] = scheduler.tasks.splice(index, 1);
      gameState.setSection(
        "scheduler",
        scheduler,
        "scheduler:cancel"
      );
      eventBus.emit("scheduler:cancelled", {
        task: clone5(task)
      });
      return true;
    }
    processDueTasks() {
      const scheduler = this.ensureState();
      const now = this.getCurrentTime();
      const dueTasks = scheduler.tasks.filter((task) => task.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
      if (dueTasks.length === 0) {
        return [];
      }
      const triggered = [];
      for (const dueTask of dueTasks) {
        const index = scheduler.tasks.findIndex(
          (task2) => task2.id === dueTask.id
        );
        if (index === -1) {
          continue;
        }
        const task = scheduler.tasks[index];
        task.runCount += 1;
        const result = clone5(task);
        triggered.push(result);
        eventBus.emit("scheduler:triggered", {
          task: result,
          currentTime: now
        });
        if (task.repeatEvery !== null) {
          do {
            task.dueAt += task.repeatEvery;
          } while (task.dueAt <= now);
        } else {
          scheduler.tasks.splice(index, 1);
        }
      }
      scheduler.tasks.sort(
        (a, b) => a.dueAt - b.dueAt
      );
      gameState.setSection(
        "scheduler",
        scheduler,
        "scheduler:process"
      );
      return triggered;
    }
    get(taskId) {
      const scheduler = this.ensureState();
      const task = scheduler.tasks.find(
        (item) => item.id === taskId
      );
      return task ? clone5(task) : void 0;
    }
    list() {
      return this.ensureState().tasks.map(clone5);
    }
    count() {
      return this.ensureState().tasks.length;
    }
    clear() {
      const scheduler = this.ensureState();
      const count = scheduler.tasks.length;
      scheduler.tasks = [];
      gameState.setSection(
        "scheduler",
        scheduler,
        "scheduler:clear"
      );
      eventBus.emit("scheduler:cleared", {
        count
      });
      return count;
    }
  };
  var schedulerSystem = new SchedulerSystem();

  // src/systems/ProcurementSystem.js
  var ORDER_STATUS = Object.freeze({
    PENDING: "pending",
    DELIVERED: "delivered",
    CANCELLED: "cancelled"
  });
  function requireOrder(orderId) {
    const order = entitySystem.get(
      "procurement_order",
      orderId
    );
    if (!order) {
      throw new Error(
        `Procurement order "${orderId}" does not exist`
      );
    }
    return order;
  }
  var ProcurementSystem = class {
    constructor() {
      eventBus.on(
        "scheduler:triggered",
        ({ task }) => {
          if (task.action === "procurement:deliver") {
            this.receive(
              task.payload.orderId
            );
          }
        }
      );
    }
    getOrderedQuantityForDay(supplierId, ingredientId, day) {
      return entitySystem.filter(
        "procurement_order",
        (order) => order.supplierId === supplierId && order.ingredientId === ingredientId && order.status !== ORDER_STATUS.CANCELLED && order.orderDay === day
      ).reduce(
        (sum, order) => sum + order.quantity,
        0
      );
    }
    getRemainingDailyCapacity(supplierId, ingredientId, day = null) {
      const offer = supplierSystem.getOffer(supplierId, ingredientId);
      if (!offer) return 0;
      const currentDay4 = day ?? gameState.getSection("time").day;
      return Math.max(
        0,
        offer.capacityPerDay - this.getOrderedQuantityForDay(
          supplierId,
          ingredientId,
          currentDay4
        )
      );
    }
    calculateDeliveryMinutes(baseMinutes, reliability) {
      if (reliability >= 100) {
        return {
          delayed: false,
          delayMinutes: 0,
          deliveryMinutes: baseMinutes
        };
      }
      const onTime = randomSystem.int(1, 100) <= reliability;
      if (onTime) {
        return {
          delayed: false,
          delayMinutes: 0,
          deliveryMinutes: baseMinutes
        };
      }
      const delayMinutes = randomSystem.int(60, 360);
      return {
        delayed: true,
        delayMinutes,
        deliveryMinutes: baseMinutes + delayMinutes
      };
    }
    purchase({
      restaurantId: restaurantId2,
      supplierId,
      ingredientId,
      quantity,
      quoteOverride = null,
      paymentTerms = null
    }) {
      const time = gameState.getSection("time");
      const remainingCapacity = this.getRemainingDailyCapacity(
        supplierId,
        ingredientId,
        time.day
      );
      if (quantity > remainingCapacity) {
        throw new Error(
          `Remaining daily supply capacity is ${remainingCapacity}`
        );
      }
      const quote = quoteOverride ?? supplierSystem.getQuote(
        supplierId,
        ingredientId,
        quantity
      );
      if (quote.supplierId !== supplierId || quote.ingredientId !== ingredientId || quote.quantity !== quantity) {
        throw new Error(
          "Procurement quote does not match order"
        );
      }
      const delivery = this.calculateDeliveryMinutes(
        quote.deliveryMinutes,
        quote.reliability
      );
      const creditDays = paymentTerms?.creditDays ?? 0;
      if (!Number.isInteger(creditDays) || creditDays < 0) {
        throw new RangeError(
          "creditDays must be a non-negative integer"
        );
      }
      let payment = null;
      let payable = null;
      if (creditDays === 0) {
        const balance = financeSystem.getBalance(
          restaurantId2
        );
        if (balance < quote.totalPrice) {
          throw new Error(
            `Insufficient funds: balance ${balance}, required ${quote.totalPrice}`
          );
        }
        payment = financeSystem.expense(
          restaurantId2,
          quote.totalPrice,
          CATEGORY.INGREDIENT,
          `\u91C7\u8D2D ${ingredientId} \xD7 ${quantity}`
        );
      } else {
        payable = entitySystem.create(
          "supplier_payable",
          {
            restaurantId: restaurantId2,
            supplierId,
            ingredientId,
            amount: quote.totalPrice,
            status: "open",
            createdDay: time.day,
            dueDay: time.day + creditDays,
            paidDay: null,
            transactionId: null,
            orderId: null,
            lastPenaltyDay: null
          }
        );
      }
      const order = entitySystem.create(
        "procurement_order",
        {
          restaurantId: restaurantId2,
          supplierId,
          ingredientId,
          quantity: quote.quantity,
          unit: quote.unit,
          unitPrice: quote.unitPrice,
          totalPrice: quote.totalPrice,
          quality: quote.quality,
          reliability: quote.reliability,
          baseDeliveryMinutes: delivery.deliveryMinutes,
          deliveryMinutes: delivery.deliveryMinutes,
          delayed: delivery.delayed,
          delayMinutes: delivery.delayMinutes,
          orderDay: time.day,
          status: ORDER_STATUS.PENDING,
          orderedAt: time.totalMinutes,
          expectedAt: time.totalMinutes + quote.deliveryMinutes,
          deliveredAt: null,
          transactionId: payment?.transaction?.id ?? null,
          payableId: payable?.id ?? null,
          paymentMode: creditDays > 0 ? "credit" : "cash",
          creditDays,
          inventoryBatchId: null,
          schedulerTaskId: null
        }
      );
      const task = schedulerSystem.scheduleAfter(
        quote.deliveryMinutes,
        "procurement:deliver",
        {
          orderId: order.id
        }
      );
      if (payable) {
        entitySystem.update(
          "supplier_payable",
          payable.id,
          {
            orderId: order.id
          }
        );
      }
      const updated = entitySystem.update(
        "procurement_order",
        order.id,
        {
          schedulerTaskId: task.id
        }
      );
      eventBus.emit(
        "procurement:ordered",
        {
          order: structuredClone(
            updated
          )
        }
      );
      return updated;
    }
    receive(orderId) {
      const order = requireOrder(orderId);
      if (order.status === ORDER_STATUS.DELIVERED) {
        return order;
      }
      if (order.status !== ORDER_STATUS.PENDING) {
        throw new Error(
          `Order "${orderId}" cannot be delivered from status "${order.status}"`
        );
      }
      const batch = inventorySystem.addBatch({
        restaurantId: order.restaurantId,
        ingredientId: order.ingredientId,
        quantity: order.quantity,
        quality: order.quality,
        sourceType: "procurement",
        sourceId: order.id,
        unitCost: order.unitPrice
      });
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "procurement_order",
        order.id,
        {
          status: ORDER_STATUS.DELIVERED,
          deliveredAt: time.totalMinutes,
          inventoryBatchId: batch.id
        }
      );
      eventBus.emit(
        "procurement:delivered",
        {
          order: structuredClone(
            updated
          ),
          batch: structuredClone(
            batch
          )
        }
      );
      return updated;
    }
    cancel(orderId) {
      const order = requireOrder(orderId);
      if (order.status !== ORDER_STATUS.PENDING) {
        throw new Error(
          `Only pending orders can be cancelled`
        );
      }
      if (order.schedulerTaskId) {
        schedulerSystem.cancel(
          order.schedulerTaskId
        );
      }
      let refundTransactionId = null;
      if (order.payableId) {
        const payable = entitySystem.get(
          "supplier_payable",
          order.payableId
        );
        if (payable && [
          "open",
          "overdue"
        ].includes(
          payable.status
        )) {
          entitySystem.update(
            "supplier_payable",
            payable.id,
            {
              status: "cancelled",
              cancelledDay: gameState.getSection("time").day
            }
          );
        }
      } else {
        const refund = financeSystem.refundExpense(
          order.restaurantId,
          order.totalPrice,
          CATEGORY.REFUND,
          `\u53D6\u6D88\u91C7\u8D2D\u9000\u6B3E ${order.ingredientId}`
        );
        refundTransactionId = refund.transaction.id;
      }
      const time = gameState.getSection("time");
      const updated = entitySystem.update(
        "procurement_order",
        order.id,
        {
          status: ORDER_STATUS.CANCELLED,
          cancelledAt: time.totalMinutes,
          refundTransactionId
        }
      );
      eventBus.emit(
        "procurement:cancelled",
        {
          orderId
        }
      );
      return updated;
    }
    getPendingQuantity(restaurantId2, ingredientId) {
      return this.listByRestaurant(
        restaurantId2,
        ORDER_STATUS.PENDING
      ).filter(
        (order) => order.ingredientId === ingredientId
      ).reduce(
        (total, order) => total + order.quantity,
        0
      );
    }
    pruneHistory(restaurantId2, retentionDays = 30) {
      const cutoff = gameState.getSection("time").totalMinutes - retentionDays * 1440;
      const removable = entitySystem.filter(
        "procurement_order",
        (order) => {
          if (order.restaurantId !== restaurantId2 || order.status === ORDER_STATUS.PENDING) {
            return false;
          }
          const finishedAt = order.deliveredAt ?? order.cancelledAt ?? order.orderedAt;
          if (finishedAt > cutoff) {
            return false;
          }
          if (order.inventoryBatchId && entitySystem.get(
            "inventory_batch",
            order.inventoryBatchId
          )) {
            return false;
          }
          return true;
        }
      );
      return entitySystem.removeMany(
        "procurement_order",
        removable.map(
          (order) => order.id
        )
      );
    }
    listPayables(restaurantId2, status = null) {
      return entitySystem.list(
        "supplier_payable"
      ).filter(
        (payable) => payable.restaurantId === restaurantId2 && (status === null || payable.status === status)
      ).sort(
        (a, b) => a.dueDay - b.dueDay
      );
    }
    settlePayables(restaurantId2, day = gameState.getSection("time").day) {
      const result = {
        paid: 0,
        overdue: 0,
        paidAmount: 0,
        overdueAmount: 0
      };
      const payables = this.listPayables(
        restaurantId2
      ).filter(
        (payable) => [
          "open",
          "overdue"
        ].includes(
          payable.status
        ) && payable.dueDay <= day
      );
      for (const payable of payables) {
        const balance = financeSystem.getBalance(
          restaurantId2
        );
        if (balance >= payable.amount) {
          const payment = financeSystem.expense(
            restaurantId2,
            payable.amount,
            CATEGORY.INGREDIENT,
            `\u4F9B\u5E94\u5546\u8D26\u671F\u4ED8\u6B3E ${payable.ingredientId}`
          );
          entitySystem.update(
            "supplier_payable",
            payable.id,
            {
              status: "paid",
              paidDay: day,
              transactionId: payment.transaction.id
            }
          );
          supplierSystem.changeRelationship(
            payable.supplierId,
            1
          );
          result.paid += 1;
          result.paidAmount += payable.amount;
        } else {
          const shouldPenalty = payable.lastPenaltyDay !== day;
          entitySystem.update(
            "supplier_payable",
            payable.id,
            {
              status: "overdue",
              lastPenaltyDay: shouldPenalty ? day : payable.lastPenaltyDay
            }
          );
          if (shouldPenalty) {
            supplierSystem.changeRelationship(
              payable.supplierId,
              -2
            );
          }
          result.overdue += 1;
          result.overdueAmount += payable.amount;
        }
      }
      return result;
    }
    get(orderId) {
      return requireOrder(orderId);
    }
    listByRestaurant(restaurantId2, status = null) {
      return entitySystem.filter(
        "procurement_order",
        (order) => order.restaurantId === restaurantId2 && (status === null || order.status === status)
      );
    }
  };
  var procurementSystem = new ProcurementSystem();

  // src/systems/OpeningInventorySystem.js
  var DEFAULT_STARTER_SERVINGS = 12;
  function roundQuantity(value) {
    return Number(
      Number(
        value
      ).toFixed(
        3
      )
    );
  }
  function buildStarterRequirementMap(recipes, targetServings = DEFAULT_STARTER_SERVINGS) {
    const map = /* @__PURE__ */ new Map();
    for (const recipe of recipes) {
      for (const item of recipe.ingredients ?? []) {
        const quantity = item.quantity * targetServings;
        const current = map.get(
          item.ingredientId
        ) ?? 0;
        map.set(
          item.ingredientId,
          current + quantity
        );
      }
    }
    return [
      ...map.entries()
    ].map(
      ([
        ingredientId,
        requiredQuantity
      ]) => ({
        ingredientId,
        requiredQuantity: roundQuantity(
          requiredQuantity
        )
      })
    );
  }
  var OpeningInventorySystem = class {
    getActiveRecipes(restaurantId2) {
      return menuSystem.listByRestaurant(
        restaurantId2,
        {
          activeOnly: true
        }
      ).map(
        (item) => recipeSystem.get(
          item.recipeId
        )
      ).filter(Boolean);
    }
    findSupplierOptions(ingredientId) {
      const ingredient = ingredientCatalogSystem.get(
        ingredientId
      );
      return supplierSystem.list({
        activeOnly: true
      }).map(
        (supplier) => {
          let offer = null;
          try {
            offer = supplierSystem.getOffer(
              supplier.id,
              ingredientId
            );
          } catch {
            offer = null;
          }
          if (!offer) {
            return null;
          }
          const expectedUnitPrice = ingredient.basePurchasePrice * offer.priceMultiplier * (1 - supplier.relationship / 100 * 0.08);
          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            reliability: supplier.reliability,
            minimumOrder: offer.minimumOrder,
            capacityPerDay: offer.capacityPerDay,
            deliveryMinutes: offer.deliveryMinutes,
            expectedUnitPrice
          };
        }
      ).filter(Boolean).sort(
        (a, b) => a.expectedUnitPrice - b.expectedUnitPrice || b.reliability - a.reliability
      );
    }
    getStatus(restaurantId2, targetServings = DEFAULT_STARTER_SERVINGS) {
      const recipes = this.getActiveRecipes(
        restaurantId2
      );
      const requirements = buildStarterRequirementMap(
        recipes,
        targetServings
      );
      const items = requirements.map(
        (requirement) => {
          const ingredient = ingredientCatalogSystem.get(
            requirement.ingredientId
          );
          const available = inventorySystem.getAvailableQuantity(
            restaurantId2,
            requirement.ingredientId
          );
          const pending = procurementSystem.getPendingQuantity(
            restaurantId2,
            requirement.ingredientId
          );
          const missing = Math.max(
            0,
            requirement.requiredQuantity - available
          );
          const effectiveMissing = Math.max(
            0,
            requirement.requiredQuantity - available - pending
          );
          const suppliers = this.findSupplierOptions(
            requirement.ingredientId
          );
          return {
            ...requirement,
            name: ingredient.name,
            unit: ingredient.unit,
            available: roundQuantity(
              available
            ),
            pending: roundQuantity(
              pending
            ),
            missing: roundQuantity(
              missing
            ),
            effectiveMissing: roundQuantity(
              effectiveMissing
            ),
            ready: available >= requirement.requiredQuantity,
            hasSupplier: suppliers.length > 0,
            recommendedSupplier: suppliers[0] ?? null,
            suppliers
          };
        }
      );
      return {
        restaurantId: restaurantId2,
        targetServings,
        recipeCount: recipes.length,
        ingredientCount: items.length,
        items,
        stockedCount: items.filter(
          (item) => item.ready
        ).length,
        pendingCount: items.filter(
          (item) => !item.ready && item.pending > 0
        ).length,
        missingSupplierCount: items.filter(
          (item) => !item.ready && !item.hasSupplier
        ).length,
        complete: items.length > 0 && items.every(
          (item) => item.ready
        )
      };
    }
    purchaseMissing(restaurantId2, targetServings = DEFAULT_STARTER_SERVINGS) {
      const status = this.getStatus(
        restaurantId2,
        targetServings
      );
      if (status.recipeCount === 0) {
        throw new Error(
          "\u5F53\u524D\u6CA1\u6709\u8425\u4E1A\u83DC\u54C1\uFF0C\u65E0\u6CD5\u751F\u6210\u9996\u6279\u91C7\u8D2D\u8BA1\u5212"
        );
      }
      const noSupplier = status.items.filter(
        (item) => item.effectiveMissing > 0 && !item.hasSupplier
      );
      if (noSupplier.length > 0) {
        throw new Error(
          "\u4EE5\u4E0B\u98DF\u6750\u6CA1\u6709\u53EF\u7528\u4F9B\u5E94\u5546\uFF1A" + noSupplier.map(
            (item) => item.name
          ).join("\u3001")
        );
      }
      const orders = [];
      for (const item of status.items) {
        let missing = item.effectiveMissing;
        if (missing <= 0) {
          continue;
        }
        for (const supplier of item.suppliers) {
          if (missing <= 0) {
            break;
          }
          const capacity = procurementSystem.getRemainingDailyCapacity(
            supplier.supplierId,
            item.ingredientId
          );
          if (capacity < supplier.minimumOrder) {
            continue;
          }
          let quantity = Math.max(
            missing,
            supplier.minimumOrder
          );
          quantity = Math.min(
            quantity,
            capacity
          );
          if (quantity < supplier.minimumOrder) {
            continue;
          }
          const order = procurementSystem.purchase({
            restaurantId: restaurantId2,
            supplierId: supplier.supplierId,
            ingredientId: item.ingredientId,
            quantity: roundQuantity(
              quantity
            )
          });
          orders.push(
            order
          );
          missing = Math.max(
            0,
            missing - quantity
          );
        }
      }
      return {
        orders,
        status: this.getStatus(
          restaurantId2,
          targetServings
        )
      };
    }
  };
  var openingInventorySystem = new OpeningInventorySystem();

  // src/systems/OpeningFlowSystem.js
  function validateHours(openHour, closeHour) {
    if (!Number.isInteger(
      openHour
    ) || !Number.isInteger(
      closeHour
    ) || openHour < 0 || openHour > 23 || closeHour < 1 || closeHour > 24 || openHour >= closeHour) {
      throw new RangeError(
        "Invalid operating hours"
      );
    }
  }
  var OpeningFlowSystem = class {
    getStatus(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      const lease = leaseSystem.getByRestaurant(
        restaurantId2
      ) ?? null;
      const renovation = renovationSystem.getSummary(
        restaurantId2
      );
      const employees = employeeSystem.listByRestaurant(
        restaurantId2
      );
      const availableChefs = employees.filter(
        (employee) => employee.roleId === "chef" && employee.status === "active" && (employee.fatigue ?? 0) < 95
      );
      const activeServers = employees.filter(
        (employee) => employee.roleId === "server" && employee.status === "active"
      );
      const activeMenu = menuSystem.listByRestaurant(
        restaurantId2,
        {
          activeOnly: true
        }
      );
      const schedule = operatingScheduleSystem.get(
        restaurantId2
      ) ?? null;
      const permits = openingPermitSystem.getStatus(
        restaurantId2
      );
      const starterStock = openingInventorySystem.getStatus(
        restaurantId2
      );
      const hasLease = Boolean(
        lease && restaurant.locationId
      );
      const hasRenovation = Boolean(
        renovation.initialized && renovation.active && (renovation.modifiers?.seats ?? 0) >= 2 && (renovation.modifiers?.kitchenStations ?? 0) >= 1
      );
      const hasChef = availableChefs.length > 0;
      const hasMenu = activeMenu.length > 0;
      const hasPermits = permits.complete;
      const hasStarterStock = starterStock.complete;
      const hasSchedule = Boolean(
        schedule && schedule.enabled
      );
      const preparationReady = hasLease && hasRenovation && hasPermits && hasChef && hasMenu && hasStarterStock && hasSchedule;
      const hasOpened = restaurant.status === "open" || restaurant.status === "paused" || restaurant.openedAt !== null || (restaurant.totalOperatingMinutes ?? 0) > 0 || (restaurant.totalOperatingDays ?? 0) > 0;
      const rawSteps = [
        {
          id: "lease",
          label: "\u9009\u5740\u7B7E\u7EA6",
          description: hasLease ? "\u7ECF\u8425\u623F\u6E90\u5DF2\u7ECF\u786E\u5B9A" : "\u9009\u62E9\u5546\u5708\u4E0E\u5177\u4F53\u623F\u6E90\u5E76\u5B8C\u6210\u7B7E\u7EA6",
          complete: hasLease,
          target: "properties",
          icon: "1"
        },
        {
          id: "renovation",
          label: "\u88C5\u4FEE\u9A8C\u6536",
          description: hasRenovation ? `${renovation.modifiers?.seats ?? 0}\u4E2A\u9910\u4F4D \xB7 ${renovation.modifiers?.kitchenStations ?? 0}\u4E2A\u53A8\u623F\u5DE5\u4F4D` : "\u5B8C\u6210\u88C5\u4FEE\u65BD\u5DE5\u5E76\u6B63\u5F0F\u9A8C\u6536\u542F\u7528",
          complete: hasRenovation,
          target: "renovation",
          icon: "2"
        },
        {
          id: "permits",
          label: "\u8BC1\u7167\u8BB8\u53EF",
          description: hasPermits ? `${permits.issuedCount}/${permits.requiredCount}\u9879\u5FC5\u8981\u8BB8\u53EF\u5DF2\u5B8C\u6210` : permits.allRequirementsReady ? "\u7ECF\u8425\u6761\u4EF6\u7B26\u5408\u8981\u6C42\uFF0C\u53EF\u4EE5\u5B8C\u6210\u5F00\u4E1A\u8BB8\u53EF\u68C0\u67E5" : "\u90E8\u5206\u8BB8\u53EF\u6761\u4EF6\u4ECD\u672A\u6EE1\u8DB3",
          complete: hasPermits,
          target: "opening-setup",
          action: "permits",
          icon: "3"
        },
        {
          id: "staff",
          label: "\u62DB\u8058\u5458\u5DE5",
          description: hasChef ? `\u53EF\u5DE5\u4F5C\u53A8\u5E08${availableChefs.length}\u4EBA \xB7 \u670D\u52A1\u5458${activeServers.length}\u4EBA` : "\u81F3\u5C11\u9700\u89811\u540D\u5F53\u524D\u53EF\u5DE5\u4F5C\u7684\u53A8\u5E08",
          complete: hasChef,
          target: "employees",
          icon: "4"
        },
        {
          id: "menu",
          label: "\u8BBE\u7F6E\u83DC\u5355",
          description: hasMenu ? `\u5F53\u524D${activeMenu.length}\u9053\u8425\u4E1A\u83DC\u54C1` : "\u81F3\u5C11\u8BBE\u7F6E1\u9053\u542F\u7528\u72B6\u6001\u7684\u83DC\u54C1",
          complete: hasMenu,
          target: "dishes",
          icon: "5"
        },
        {
          id: "stock",
          label: "\u9996\u6279\u91C7\u8D2D",
          description: hasStarterStock ? `${starterStock.ingredientCount}\u79CD\u5FC5\u8981\u98DF\u6750\u5DF2\u7ECF\u5907\u9F50` : starterStock.pendingCount > 0 ? `${starterStock.pendingCount}\u79CD\u98DF\u6750\u6B63\u5728\u914D\u9001` : hasMenu ? `\u8FD8\u9700\u51C6\u5907${starterStock.items.filter((item) => !item.ready).length}\u79CD\u98DF\u6750` : "\u5148\u8BBE\u7F6E\u83DC\u5355\u540E\u751F\u6210\u91C7\u8D2D\u9700\u6C42",
          complete: hasStarterStock,
          target: "supply",
          action: "stock",
          icon: "6"
        },
        {
          id: "schedule",
          label: "\u8425\u4E1A\u65F6\u95F4",
          description: hasSchedule ? `${String(schedule.openHour).padStart(2, "0")}:00\u2013${String(schedule.closeHour).padStart(2, "0")}:00` : "\u5C1A\u672A\u8BBE\u7F6E\u6B63\u5F0F\u8425\u4E1A\u65F6\u95F4",
          complete: hasSchedule,
          target: "opening-setup",
          action: "schedule",
          icon: "7"
        },
        {
          id: "inspection",
          label: "\u5F00\u4E1A\u68C0\u67E5",
          description: preparationReady ? "\u623F\u6E90\u3001\u88C5\u4FEE\u3001\u8BB8\u53EF\u3001\u5458\u5DE5\u3001\u83DC\u5355\u3001\u5E93\u5B58\u548C\u8425\u4E1A\u65F6\u95F4\u5168\u90E8\u901A\u8FC7" : "\u5B8C\u6210\u5168\u90E8\u524D\u7F6E\u51C6\u5907\u540E\u81EA\u52A8\u901A\u8FC7\u5F00\u4E1A\u68C0\u67E5",
          complete: preparationReady,
          target: "opening-setup",
          icon: "8"
        },
        {
          id: "opening",
          label: "\u6B63\u5F0F\u8425\u4E1A",
          description: hasOpened ? "\u95E8\u5E97\u5DF2\u7ECF\u6B63\u5F0F\u5F00\u59CB\u7ECF\u8425" : preparationReady ? "\u5168\u90E8\u51C6\u5907\u5B8C\u6210\uFF0C\u53EF\u4EE5\u6B63\u5F0F\u5F00\u4E1A" : "\u4ECD\u6709\u5F00\u4E1A\u6761\u4EF6\u672A\u5B8C\u6210",
          complete: hasOpened,
          target: "restaurant",
          action: "open",
          icon: "9"
        }
      ];
      let foundCurrent = false;
      const steps = rawSteps.map(
        (step) => {
          let state = "pending";
          if (step.complete) {
            state = "complete";
          } else if (!foundCurrent) {
            state = "current";
            foundCurrent = true;
          }
          return {
            ...step,
            state
          };
        }
      );
      const preparationSteps = steps.slice(
        0,
        8
      );
      const completedPreparation = preparationSteps.filter(
        (step) => step.complete
      ).length;
      return {
        restaurant,
        lease,
        renovation,
        employees,
        availableChefs,
        activeServers,
        activeMenu,
        schedule,
        permits,
        starterStock,
        steps,
        preparation: {
          complete: completedPreparation,
          total: preparationSteps.length,
          percent: Math.round(
            completedPreparation / preparationSteps.length * 100
          )
        },
        canOpen: preparationReady,
        hasOpened,
        nextAction: steps.find(
          (step) => !step.complete
        ) ?? steps[steps.length - 1]
      };
    }
    configureSchedule(restaurantId2, {
      openHour = 9,
      closeHour = 22
    } = {}) {
      restaurantSystem.get(
        restaurantId2
      );
      validateHours(
        openHour,
        closeHour
      );
      const existing = operatingScheduleSystem.get(
        restaurantId2
      );
      if (!existing) {
        return operatingScheduleSystem.create({
          restaurantId: restaurantId2,
          openHour,
          closeHour
        });
      }
      return entitySystem.update(
        "operating_schedule",
        existing.id,
        {
          openHour,
          closeHour,
          enabled: true
        }
      );
    }
    completePermits(restaurantId2) {
      return openingPermitSystem.issueAll(
        restaurantId2
      );
    }
    purchaseStarterStock(restaurantId2) {
      return openingInventorySystem.purchaseMissing(
        restaurantId2
      );
    }
    openRestaurant(restaurantId2) {
      const status = this.getStatus(
        restaurantId2
      );
      if (!status.canOpen) {
        const missing = status.steps.slice(
          0,
          8
        ).filter(
          (step) => !step.complete
        ).map(
          (step) => step.label
        ).join("\u3001");
        throw new Error(
          `\u5F00\u4E1A\u51C6\u5907\u5C1A\u672A\u5B8C\u6210\uFF1A${missing}`
        );
      }
      const restaurant = status.restaurant;
      if (restaurant.status === "open") {
        return restaurant;
      }
      if (restaurant.status === "paused") {
        return restaurantSystem.resume(
          restaurantId2
        );
      }
      return restaurantSystem.open(
        restaurantId2
      );
    }
    getRecommendedPage(restaurantId2) {
      return this.getStatus(
        restaurantId2
      ).hasOpened ? "restaurant" : "opening-setup";
    }
  };
  var openingFlowSystem = new OpeningFlowSystem();

  // src/systems/PropertyMarketSystem.js
  var DEFAULT_TARGET = 18;
  var REFRESH_DAYS = 7;
  var AREA_PROFILES = Object.freeze({
    micro: { id: "micro", min: 30, max: 80, label: "\u8857\u89D2\u5C0F\u94FA" },
    small: { id: "small", min: 81, max: 180, label: "\u793E\u533A\u5E95\u5546" },
    medium: { id: "medium", min: 181, max: 500, label: "\u4E34\u8857\u9910\u996E\u94FA" },
    large: { id: "large", min: 501, max: 1200, label: "\u5546\u4E1A\u8857\u5927\u94FA" },
    flagship: { id: "flagship", min: 1201, max: 3e3, label: "\u9910\u996E\u65D7\u8230\u94FA" },
    complex: { id: "complex", min: 3001, max: 1e4, label: "\u9910\u996E\u7EFC\u5408\u4F53" }
  });
  var PROFILE_CYCLE = Object.freeze([
    "micro",
    "small",
    "small",
    "medium",
    "micro",
    "medium",
    "large",
    "small",
    "medium",
    "flagship",
    "small",
    "large",
    "micro",
    "medium",
    "complex",
    "small",
    "large",
    "medium"
  ]);
  function clamp5(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function currentDay() {
    return gameState.getSection("time")?.day ?? 1;
  }
  function hashString2(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function createRng(seed) {
    let state = seed >>> 0;
    return () => {
      state += 1831565813;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  function splitArea(total, count) {
    const base = Math.floor(total / count);
    const remainder = total % count;
    return Array.from(
      { length: count },
      (_, index) => base + (index < remainder ? 1 : 0)
    );
  }
  function getFloorCount(area, rng) {
    if (area <= 800) {
      return 1;
    }
    if (area <= 1800) {
      return rng() < 0.32 ? 2 : 1;
    }
    if (area <= 4e3) {
      return rng() < 0.72 ? 2 : 1;
    }
    if (area <= 7e3) {
      return randomInt(rng, 2, 3);
    }
    return randomInt(rng, 2, 4);
  }
  function buildPolygon(width, height, rng) {
    if (width < 8 || height < 8 || rng() > 0.36) {
      return {
        shape: "rectangle",
        polygon: [
          { x: 0, y: 0 },
          { x: width, y: 0 },
          { x: width, y: height },
          { x: 0, y: height }
        ],
        safeWidth: width,
        safeHeight: height
      };
    }
    const cutX = clamp5(
      Math.floor(width * (0.56 + rng() * 0.18)),
      4,
      width - 2
    );
    const cutY = clamp5(
      Math.floor(height * (0.5 + rng() * 0.2)),
      4,
      height - 2
    );
    return {
      shape: "l_shape",
      polygon: [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: cutY },
        { x: cutX, y: cutY },
        { x: cutX, y: height },
        { x: 0, y: height }
      ],
      safeWidth: cutX,
      safeHeight: cutY
    };
  }
  function buildFloor({
    propertySequence,
    floorIndex,
    floorArea,
    usableArea,
    floorCount,
    rng,
    foodServiceAllowed,
    exhaustAllowed
  }) {
    const grid = getDefaultGridSize(usableArea);
    const width = grid.width;
    const height = grid.height;
    const geometry = buildPolygon(width, height, rng);
    const floorId = `market_${propertySequence}_f${floorIndex + 1}`;
    const entranceX = clamp5(Math.floor(width * 0.25), 1, width - 2);
    const windows = [
      {
        id: `${floorId}_window_1`,
        x: clamp5(Math.floor(width * 0.55), 1, width - 1),
        y: 0,
        side: "north",
        length: Math.max(1, Math.min(3, Math.floor(width / 5)))
      }
    ];
    if (width >= 12) {
      windows.push({
        id: `${floorId}_window_2`,
        x: 0,
        y: clamp5(Math.floor(height * 0.45), 1, height - 1),
        side: "west",
        length: 2
      });
    }
    const columnCount = clamp5(
      Math.floor(usableArea / 650),
      0,
      8
    );
    const columns = [];
    for (let index = 0; index < columnCount; index += 1) {
      const x = clamp5(
        2 + index * 4 % Math.max(2, geometry.safeWidth - 3),
        1,
        Math.max(1, geometry.safeWidth - 2)
      );
      const y = clamp5(
        2 + Math.floor(index / Math.max(1, Math.floor(geometry.safeWidth / 4))) * 4,
        1,
        Math.max(1, geometry.safeHeight - 2)
      );
      columns.push({
        id: `${floorId}_column_${index + 1}`,
        type: "column",
        x,
        y,
        width: 1,
        height: 1
      });
    }
    const fixedStructures = [];
    if (floorCount > 1) {
      fixedStructures.push({
        id: `${floorId}_stair`,
        type: "stair",
        x: 1,
        y: clamp5(height - 3, 1, height - 2),
        width: 2,
        height: 2
      });
    }
    if (floorCount >= 3 && width >= 10) {
      fixedStructures.push({
        id: `${floorId}_elevator`,
        type: "elevator",
        x: 4,
        y: clamp5(height - 3, 1, height - 2),
        width: 2,
        height: 2
      });
    }
    const utilityPoints = [
      {
        id: `${floorId}_power`,
        type: "power",
        x: 1,
        y: 1
      }
    ];
    if (foodServiceAllowed) {
      utilityPoints.push(
        {
          id: `${floorId}_water`,
          type: "water",
          x: clamp5(width - 2, 1, width - 1),
          y: 1
        },
        {
          id: `${floorId}_drain`,
          type: "drain",
          x: clamp5(width - 3, 1, width - 1),
          y: 1
        }
      );
      if (floorIndex === 0) {
        utilityPoints.push({
          id: `${floorId}_gas`,
          type: "gas",
          x: clamp5(width - 4, 1, width - 1),
          y: 1
        });
      }
    }
    if (exhaustAllowed) {
      utilityPoints.push({
        id: `${floorId}_exhaust`,
        type: "exhaust",
        x: clamp5(width - 2, 1, width - 1),
        y: 2
      });
    }
    return {
      id: floorId,
      label: `${floorIndex + 1}F`,
      floorNumber: floorIndex + 1,
      area: floorArea,
      usableArea,
      width,
      height,
      shape: geometry.shape,
      polygon: geometry.polygon,
      entrances: [
        {
          id: `${floorId}_main`,
          type: floorIndex === 0 ? "main" : "stair_lobby",
          x: entranceX,
          y: 0,
          side: "north",
          width: 2
        }
      ],
      windows,
      columns,
      fixedStructures,
      utilityPoints
    };
  }
  var PropertyMarketSystem = class {
    getState(districtId) {
      return entitySystem.list("property_market").find((item) => item.districtId === districtId) ?? null;
    }
    ensureState(districtId, { target = DEFAULT_TARGET, day = currentDay() } = {}) {
      if (!districtSystem.exists(districtId)) {
        throw new Error(`District "${districtId}" does not exist`);
      }
      if (!Number.isInteger(target) || target <= 0) {
        throw new RangeError("Property market target must be positive");
      }
      const existing = this.getState(districtId);
      if (existing) {
        if (existing.target !== target) {
          return entitySystem.update("property_market", existing.id, {
            target
          });
        }
        return existing;
      }
      return entitySystem.create("property_market", {
        districtId,
        target,
        nextSequence: 1,
        createdDay: day,
        lastRefreshDay: null,
        nextRefreshDay: day + REFRESH_DAYS
      });
    }
    listGenerated(districtId = null, { availableOnly = false } = {}) {
      return entitySystem.list("property").filter((item) => item.source === "market").filter((item) => districtId === null || item.districtId === districtId).filter(
        (item) => !availableOnly || item.status === STATUS2.AVAILABLE
      );
    }
    createListing(districtId, sequence, day = currentDay()) {
      const district = districtSystem.get(districtId);
      if (!district) {
        throw new Error(`District "${districtId}" does not exist`);
      }
      const seed = hashString2(`${districtId}:${sequence}:${day}`);
      const rng = createRng(seed);
      const cycleOffset = hashString2(districtId) % PROFILE_CYCLE.length;
      const profileId = PROFILE_CYCLE[(sequence - 1 + cycleOffset) % PROFILE_CYCLE.length];
      const profile = AREA_PROFILES[profileId];
      const area = randomInt(rng, profile.min, profile.max);
      const floorCount = getFloorCount(area, rng);
      const floorAreas = splitArea(area, floorCount);
      const usableRatio = 0.8 + rng() * 0.14;
      const floorUsableAreas = floorAreas.map(
        (value) => Math.max(1, Math.min(value, Math.floor(value * usableRatio)))
      );
      const usableArea = floorUsableAreas.reduce((sum, value) => sum + value, 0);
      const foodServiceAllowed = sequence % 9 !== 0;
      const exhaustAllowed = foodServiceAllowed && sequence % 6 !== 0;
      const floors = floorAreas.map(
        (floorArea, floorIndex) => buildFloor({
          propertySequence: `${hashString2(districtId).toString(36)}_${sequence}`,
          floorIndex,
          floorArea,
          usableArea: floorUsableAreas[floorIndex],
          floorCount,
          rng,
          foodServiceAllowed,
          exhaustAllowed
        })
      );
      const districtRate = 28 + district.trafficIndex * 0.28 + district.spendingPower * 0.22 + district.competition * 0.06;
      const profileRate = {
        micro: 1.18,
        small: 1.08,
        medium: 1,
        large: 0.92,
        flagship: 0.84,
        complex: 0.76
      }[profileId];
      const variance = 0.88 + rng() * 0.28;
      const baseMonthlyRent = Math.max(
        1200,
        Math.round(area * districtRate * profileRate * variance)
      );
      const frontageMeters = Number(
        clamp5(
          Math.sqrt(area) * (0.42 + rng() * 0.18),
          2.5,
          36
        ).toFixed(1)
      );
      const ceilingHeight = Number(
        clamp5(2.8 + rng() * (area > 1200 ? 2.4 : 1.3), 2.8, 5.8).toFixed(1)
      );
      const parkingSpaces = area < 500 ? rng() < 0.18 ? randomInt(rng, 1, 5) : 0 : clamp5(Math.floor(area / randomInt(rng, 90, 180)), 0, 160);
      const depositMonths = randomInt(rng, 1, 3);
      const listingLife = randomInt(rng, 14, 42);
      const qualityScore = clamp5(
        Math.round(
          38 + district.trafficIndex * 0.22 + district.spendingPower * 0.2 + frontageMeters * 0.8 + (exhaustAllowed ? 6 : 0) + Math.min(8, parkingSpaces * 0.2)
        ),
        35,
        96
      );
      const tags = [profile.label];
      if (floorCount > 1) {
        tags.push(`${floorCount}\u5C42`);
      }
      if (exhaustAllowed) {
        tags.push("\u53EF\u6392\u70DF");
      }
      if (parkingSpaces > 0) {
        tags.push("\u6709\u505C\u8F66\u4F4D");
      }
      if (floors.some((floor) => floor.shape !== "rectangle")) {
        tags.push("\u5F02\u5F62\u6237\u578B");
      }
      const created = propertySystem.create({
        districtId,
        name: `${district.name}\xB7${profile.label}${String(sequence).padStart(2, "0")}`,
        area,
        usableArea,
        baseMonthlyRent,
        seats: Math.max(2, Math.floor(usableArea / 4.2)),
        depositMonths,
        floors,
        frontageMeters,
        ceilingHeight,
        parkingSpaces,
        foodServiceAllowed,
        exhaustAllowed,
        renovationRules: {
          allowPartitions: area >= 80,
          allowWallFinish: true,
          allowFloorFinish: true,
          allowCeilingFinish: ceilingHeight >= 3
        },
        tags
      });
      const property = entitySystem.update("property", created.id, {
        source: "market",
        propertyType: profileId,
        listedDay: day,
        expiresDay: day + listingLife,
        marketMeta: {
          profileId,
          qualityScore,
          seed,
          listingLife
        }
      });
      eventBus.emit("propertyMarket:listed", {
        districtId,
        property: structuredClone(property)
      });
      return property;
    }
    pruneExpired(day = currentDay(), { districtId = null } = {}) {
      const expired = this.listGenerated(districtId, { availableOnly: true }).filter((item) => Number.isInteger(item.expiresDay) && item.expiresDay <= day).map((item) => item.id);
      const removed = entitySystem.removeMany("property", expired);
      if (removed > 0) {
        eventBus.emit("propertyMarket:expired", {
          districtId,
          day,
          removed
        });
      }
      return removed;
    }
    rotateListings(districtId, day = currentDay(), count = null) {
      const state = this.ensureState(districtId, { day });
      const available = this.listGenerated(districtId, { availableOnly: true }).filter((item) => (item.listedDay ?? day) <= day - REFRESH_DAYS).sort((a, b) => (a.listedDay ?? 0) - (b.listedDay ?? 0));
      const rotateCount = count ?? Math.max(1, Math.floor(state.target * 0.12));
      const ids = available.slice(0, rotateCount).map((item) => item.id);
      return entitySystem.removeMany("property", ids);
    }
    ensureDistrictStock(districtId, { target = DEFAULT_TARGET, day = currentDay() } = {}) {
      let state = this.ensureState(districtId, { target, day });
      this.pruneExpired(day, { districtId });
      const availableBefore = this.listGenerated(
        districtId,
        { availableOnly: true }
      );
      const needed = Math.max(0, state.target - availableBefore.length);
      const created = [];
      let sequence = state.nextSequence ?? 1;
      for (let index = 0; index < needed; index += 1) {
        created.push(this.createListing(districtId, sequence, day));
        sequence += 1;
      }
      state = entitySystem.update("property_market", state.id, {
        nextSequence: sequence,
        lastEnsuredDay: day
      });
      return {
        districtId,
        target: state.target,
        created: created.length,
        availableGenerated: this.listGenerated(
          districtId,
          { availableOnly: true }
        ).length,
        nextRefreshDay: state.nextRefreshDay,
        properties: created
      };
    }
    ensureAllDistricts({ target = DEFAULT_TARGET, day = currentDay() } = {}) {
      return districtSystem.getAll().map(
        (district) => this.ensureDistrictStock(district.id, { target, day })
      );
    }
    processDay(day = currentDay()) {
      const states = entitySystem.list("property_market");
      let removed = 0;
      let created = 0;
      let refreshed = 0;
      for (const state of states) {
        if (day < (state.nextRefreshDay ?? day)) {
          continue;
        }
        removed += this.pruneExpired(day, {
          districtId: state.districtId
        });
        removed += this.rotateListings(state.districtId, day);
        const result = this.ensureDistrictStock(
          state.districtId,
          { target: state.target ?? DEFAULT_TARGET, day }
        );
        created += result.created;
        refreshed += 1;
        entitySystem.update("property_market", state.id, {
          lastRefreshDay: day,
          nextRefreshDay: day + REFRESH_DAYS
        });
      }
      if (refreshed > 0) {
        eventBus.emit("propertyMarket:refreshed", {
          day,
          refreshed,
          removed,
          created
        });
      }
      return {
        day,
        refreshed,
        removed,
        created
      };
    }
    getSummary(districtId) {
      const state = this.getState(districtId);
      const generated = this.listGenerated(districtId);
      const available = generated.filter(
        (item) => item.status === STATUS2.AVAILABLE
      );
      return {
        districtId,
        active: Boolean(state),
        target: state?.target ?? 0,
        totalGenerated: generated.length,
        availableGenerated: available.length,
        nextRefreshDay: state?.nextRefreshDay ?? null,
        areaRange: available.length > 0 ? {
          min: Math.min(...available.map((item) => item.area)),
          max: Math.max(...available.map((item) => item.area))
        } : null
      };
    }
  };
  var propertyMarketSystem = new PropertyMarketSystem();

  // src/systems/PropertyLeaseMarketSystem.js
  var OFFER_VALID_DAYS = 2;
  var CLAIM_RETENTION_DAYS = 45;
  var SURNAMES = Object.freeze([
    "\u9648",
    "\u6797",
    "\u5468",
    "\u5434",
    "\u8D75",
    "\u8BB8",
    "\u90D1",
    "\u5F90",
    "\u5B59",
    "\u4F55",
    "\u9AD8",
    "\u6881"
  ]);
  var GIVEN_NAMES = Object.freeze([
    "\u5EFA\u56FD",
    "\u660E\u8FDC",
    "\u5FD7\u6210",
    "\u6D77\u5CF0",
    "\u6587\u534E",
    "\u745E\u5B89",
    "\u96C5\u7434",
    "\u79C0\u5170",
    "\u56FD\u5F3A",
    "\u632F\u534E"
  ]);
  function clamp6(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function currentDay2() {
    return gameState.getSection("time")?.day ?? 1;
  }
  function hashString3(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function random01(seed, salt = 0) {
    let value = seed + Math.imul(salt + 1, 2654435761) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 2146121005);
    value ^= value >>> 15;
    value = Math.imul(value, 2221713035);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967296;
  }
  function safeBalance(restaurantId2) {
    if (!restaurantId2) {
      return null;
    }
    try {
      return financeSystem.getBalance(restaurantId2);
    } catch {
      return null;
    }
  }
  var PropertyLeaseMarketSystem = class {
    buildGeneratedTerms(property) {
      const district = districtSystem.get(property.districtId);
      const seed = property.marketMeta?.seed ?? hashString3(property.id);
      const quality = property.marketMeta?.qualityScore ?? 55;
      const listedDay = property.listedDay ?? currentDay2();
      const landlordIsCompany = random01(seed, 1) > 0.72;
      const landlordName = landlordIsCompany ? `${district?.name ?? "\u57CE\u5E02"}\u7F6E\u4E1A${1 + Math.floor(random01(seed, 2) * 9)}\u53F7\u4E1A\u4E3B` : `${SURNAMES[Math.floor(random01(seed, 3) * SURNAMES.length)]}${GIVEN_NAMES[Math.floor(random01(seed, 4) * GIVEN_NAMES.length)]}`;
      const maxDiscountRate = Number(
        (0.03 + random01(seed, 5) * 0.07).toFixed(3)
      );
      const rentFreeMaxDays = property.area >= 1200 ? 7 + Math.floor(random01(seed, 6) * 24) : property.area >= 300 ? Math.floor(random01(seed, 6) * 16) : Math.floor(random01(seed, 6) * 8);
      const propertyFeeMonthly = Math.max(
        0,
        Math.round(
          property.area * (0.8 + random01(seed, 7) * 2.6)
        )
      );
      const transferFee = random01(seed, 8) > 0.58 ? Math.round(
        property.monthlyRent * (0.4 + random01(seed, 9) * 1.6)
      ) : 0;
      const renewalIncreaseRate = Number(
        (0.03 + random01(seed, 10) * 0.07).toFixed(3)
      );
      const competitorDemand = clamp6(
        Math.round(
          22 + quality * 0.55 + (district?.competition ?? 50) * 0.23 + (property.exhaustAllowed ? 5 : 0) + Math.min(7, (property.frontageMeters ?? 0) * 0.35)
        ),
        15,
        98
      );
      const competitorClaimDay = quality >= 76 && competitorDemand >= 62 ? listedDay + 5 + Math.floor(random01(seed, 11) * 18) : null;
      return {
        landlord: {
          type: landlordIsCompany ? "company" : "individual",
          name: landlordName
        },
        leaseTerms: {
          minMonths: property.area >= 3e3 ? 24 : 6,
          maxMonths: property.area >= 1200 ? 60 : 36,
          propertyFeeMonthly,
          transferFee,
          rentFreeMaxDays,
          maxDiscountRate,
          renewalIncreaseRate,
          negotiable: true,
          competitorDemand,
          competitorClaimDay
        }
      };
    }
    buildManualTerms(property) {
      return {
        landlord: {
          type: "individual",
          name: "\u4E1A\u4E3B"
        },
        leaseTerms: {
          minMonths: 1,
          maxMonths: 60,
          propertyFeeMonthly: 0,
          transferFee: 0,
          rentFreeMaxDays: 0,
          maxDiscountRate: 0,
          renewalIncreaseRate: 0.05,
          negotiable: false,
          competitorDemand: 0,
          competitorClaimDay: null
        }
      };
    }
    ensureTerms(propertyId) {
      const property = propertySystem.get(propertyId);
      if (property.landlord && property.leaseTerms) {
        return property;
      }
      const generated = property.source === "market" ? this.buildGeneratedTerms(property) : this.buildManualTerms(property);
      return entitySystem.update("property", property.id, {
        landlord: property.landlord ?? generated.landlord,
        leaseTerms: {
          ...generated.leaseTerms,
          ...property.leaseTerms ?? {}
        }
      });
    }
    getTerms(propertyId) {
      const property = this.ensureTerms(propertyId);
      return {
        landlord: structuredClone(property.landlord),
        leaseTerms: structuredClone(property.leaseTerms)
      };
    }
    validateMonths(property, months) {
      const terms = property.leaseTerms;
      if (!Number.isInteger(months)) {
        throw new RangeError("Lease months must be an integer");
      }
      if (months < terms.minMonths || months > terms.maxMonths) {
        throw new RangeError(
          `Lease months must be ${terms.minMonths}-${terms.maxMonths}`
        );
      }
    }
    getOffer(offerId) {
      const offer = entitySystem.get("lease_offer", offerId);
      if (!offer) {
        throw new Error(`Lease offer "${offerId}" does not exist`);
      }
      return offer;
    }
    getActiveOffer(restaurantId2, propertyId) {
      const day = currentDay2();
      return entitySystem.list("lease_offer").filter(
        (item) => item.restaurantId === restaurantId2 && item.propertyId === propertyId && ["accepted", "countered"].includes(item.status) && item.expiresDay >= day
      ).sort((a, b) => b.createdDay - a.createdDay)[0] ?? null;
    }
    getQuote({
      propertyId,
      restaurantId: restaurantId2 = null,
      months = 12,
      offerId = null
    }) {
      const property = this.ensureTerms(propertyId);
      this.validateMonths(property, months);
      let monthlyRent = property.monthlyRent;
      let rentFreeDays = 0;
      let offer = null;
      if (offerId) {
        offer = this.getOffer(offerId);
        if (offer.propertyId !== propertyId || offer.restaurantId !== restaurantId2) {
          throw new Error("Lease offer does not match property or restaurant");
        }
        if (offer.status !== "accepted") {
          throw new Error("Lease offer is not accepted");
        }
        if (offer.expiresDay < currentDay2()) {
          throw new Error("Lease offer has expired");
        }
        monthlyRent = offer.monthlyRent;
        rentFreeDays = offer.rentFreeDays;
      }
      const propertyFeeMonthly = property.leaseTerms.propertyFeeMonthly ?? 0;
      const transferFee = property.leaseTerms.transferFee ?? 0;
      const deposit = monthlyRent * property.depositMonths;
      const initialRent = rentFreeDays > 0 ? 0 : monthlyRent;
      const upfront = deposit + initialRent + propertyFeeMonthly + transferFee;
      const balance = safeBalance(restaurantId2);
      return {
        months,
        monthlyRent,
        askMonthlyRent: property.monthlyRent,
        depositMonths: property.depositMonths,
        deposit,
        rentFreeDays,
        initialRent,
        propertyFeeMonthly,
        transferFee,
        upfront,
        totalContractRent: monthlyRent * months,
        totalContractPropertyFee: propertyFeeMonthly * months,
        balance,
        affordable: balance === null ? null : balance >= upfront,
        offerId: offer?.id ?? null
      };
    }
    negotiate({
      restaurantId: restaurantId2,
      propertyId,
      months = 12,
      requestedRent = null,
      requestedRentFreeDays = 0
    }) {
      const property = this.ensureTerms(propertyId);
      this.validateMonths(property, months);
      if (property.status !== STATUS2.AVAILABLE) {
        throw new Error("Property is not available");
      }
      const terms = property.leaseTerms;
      if (!terms.negotiable) {
        throw new Error("This landlord does not accept negotiation");
      }
      const day = currentDay2();
      const ask = property.monthlyRent;
      const requested = Math.round(
        requestedRent ?? ask * 0.96
      );
      if (!Number.isInteger(requested) || requested <= 0) {
        throw new RangeError("Requested rent must be positive");
      }
      if (!Number.isInteger(requestedRentFreeDays) || requestedRentFreeDays < 0) {
        throw new RangeError("Requested rent-free days must be non-negative");
      }
      const ageDays = Math.max(0, day - (property.listedDay ?? day));
      const ageBonus = Math.min(0.02, ageDays / 1200);
      const maxDiscountRate = Math.min(
        0.12,
        (terms.maxDiscountRate ?? 0) + ageBonus
      );
      const minimumRent = Math.round(
        ask * (1 - maxDiscountRate)
      );
      const maximumRentFreeDays = (terms.rentFreeMaxDays ?? 0) + (ageDays >= 21 ? 7 : 0);
      const accepted = requested >= minimumRent && requestedRentFreeDays <= maximumRentFreeDays;
      const monthlyRent = accepted ? requested : Math.max(
        minimumRent,
        Math.round((ask + requested) / 2)
      );
      const rentFreeDays = accepted ? requestedRentFreeDays : Math.min(
        requestedRentFreeDays,
        maximumRentFreeDays
      );
      const offer = entitySystem.create("lease_offer", {
        restaurantId: restaurantId2,
        propertyId,
        months,
        status: accepted ? "accepted" : "countered",
        askMonthlyRent: ask,
        requestedRent: requested,
        requestedRentFreeDays,
        monthlyRent,
        rentFreeDays,
        landlord: structuredClone(property.landlord),
        createdDay: day,
        expiresDay: day + OFFER_VALID_DAYS
      });
      eventBus.emit("leaseMarket:negotiated", {
        offer: structuredClone(offer)
      });
      return offer;
    }
    acceptCounter(offerId) {
      const offer = this.getOffer(offerId);
      if (offer.status !== "countered") {
        throw new Error("Only countered offers can be accepted");
      }
      if (offer.expiresDay < currentDay2()) {
        throw new Error("Lease offer has expired");
      }
      return entitySystem.update("lease_offer", offer.id, {
        status: "accepted",
        acceptedDay: currentDay2()
      });
    }
    signLease({
      restaurantId: restaurantId2,
      propertyId,
      months = 12,
      offerId = null
    }) {
      const property = this.ensureTerms(propertyId);
      const quote = this.getQuote({
        propertyId,
        restaurantId: restaurantId2,
        months,
        offerId
      });
      const lease = leaseSystem.sign({
        restaurantId: restaurantId2,
        propertyId,
        months,
        commercialTerms: {
          monthlyRent: quote.monthlyRent,
          propertyFeeMonthly: quote.propertyFeeMonthly,
          transferFee: quote.transferFee,
          rentFreeDays: quote.rentFreeDays,
          offerId
        }
      });
      if (offerId) {
        entitySystem.update("lease_offer", offerId, {
          status: "signed",
          signedDay: currentDay2(),
          leaseId: lease.id
        });
      }
      eventBus.emit("leaseMarket:signed", {
        propertyId,
        restaurantId: restaurantId2,
        leaseId: lease.id,
        landlord: structuredClone(property.landlord)
      });
      return lease;
    }
    getRenewalQuote(leaseId, months = 12) {
      const lease = leaseSystem.get(leaseId);
      const property = this.ensureTerms(lease.propertyId);
      this.validateMonths(property, months);
      const increaseRate = property.leaseTerms.renewalIncreaseRate ?? 0.05;
      const monthlyRent = Math.max(
        1,
        Math.round(
          lease.monthlyRent * (1 + increaseRate)
        )
      );
      return {
        leaseId,
        propertyId: property.id,
        months,
        currentMonthlyRent: lease.monthlyRent,
        monthlyRent,
        increaseRate,
        propertyFeeMonthly: lease.propertyFeeMonthly ?? property.leaseTerms.propertyFeeMonthly ?? 0,
        newEndDay: lease.endDay + months * 30
      };
    }
    renewLease({ leaseId, months = 12 }) {
      const quote = this.getRenewalQuote(leaseId, months);
      return leaseSystem.renew(leaseId, {
        months,
        monthlyRent: quote.monthlyRent,
        propertyFeeMonthly: quote.propertyFeeMonthly
      });
    }
    processDay(day = currentDay2()) {
      let expiredOffers = 0;
      let claimed = 0;
      let pruned = 0;
      for (const offer of entitySystem.list("lease_offer")) {
        if (["accepted", "countered"].includes(offer.status) && offer.expiresDay < day) {
          entitySystem.update("lease_offer", offer.id, {
            status: "expired",
            expiredDay: day
          });
          expiredOffers += 1;
        }
      }
      for (const original of entitySystem.list("property")) {
        if (original.source !== "market" || original.status !== STATUS2.AVAILABLE) {
          continue;
        }
        const property = this.ensureTerms(original.id);
        const claimDay = property.leaseTerms?.competitorClaimDay;
        if (!Number.isInteger(claimDay) || claimDay > day) {
          continue;
        }
        const protectedOffer = entitySystem.list("lease_offer").some(
          (offer) => offer.propertyId === property.id && offer.status === "accepted" && offer.expiresDay >= day
        );
        if (protectedOffer) {
          continue;
        }
        entitySystem.update("property", property.id, {
          status: STATUS2.LOCKED,
          marketMeta: {
            ...property.marketMeta ?? {},
            claimedByNpc: true,
            claimedDay: day
          }
        });
        claimed += 1;
        eventBus.emit("leaseMarket:npcClaimed", {
          propertyId: property.id,
          districtId: property.districtId,
          day
        });
      }
      const oldClaims = entitySystem.list("property").filter(
        (property) => property.source === "market" && property.status === STATUS2.LOCKED && property.marketMeta?.claimedByNpc && Number.isInteger(property.marketMeta?.claimedDay) && property.marketMeta.claimedDay <= day - CLAIM_RETENTION_DAYS
      ).map((property) => property.id);
      if (oldClaims.length > 0) {
        pruned = entitySystem.removeMany("property", oldClaims);
      }
      return {
        day,
        expiredOffers,
        claimed,
        pruned
      };
    }
  };
  var propertyLeaseMarketSystem = new PropertyLeaseMarketSystem();

  // src/ui/registry/PageRegistry.js
  var PageRegistry = class {
    constructor() {
      this.pages = /* @__PURE__ */ new Map();
    }
    register(definition) {
      if (!definition || typeof definition !== "object") {
        throw new TypeError("Page definition must be an object");
      }
      const id = String(definition.id ?? "").trim();
      const title = String(definition.title ?? "").trim();
      if (!id) {
        throw new Error("Page id is required");
      }
      if (!title) {
        throw new Error(`Page "${id}" requires a title`);
      }
      if (this.pages.has(id)) {
        throw new Error(`Page "${id}" is already registered`);
      }
      const page = Object.freeze({
        id,
        title,
        parent: definition.parent ?? null,
        layout: definition.layout ?? "management",
        nav: definition.nav ?? null,
        order: Number.isFinite(definition.order) ? definition.order : 100,
        unlock: definition.unlock ?? null,
        component: definition.component ?? null,
        metadata: Object.freeze({ ...definition.metadata ?? {} })
      });
      this.pages.set(id, page);
      return page;
    }
    has(id) {
      return this.pages.has(id);
    }
    get(id) {
      const page = this.pages.get(id);
      if (!page) {
        throw new Error(`Unknown page "${id}"`);
      }
      return page;
    }
    list() {
      return [...this.pages.values()].sort((a, b) => a.order - b.order);
    }
    children(parentId) {
      return this.list().filter((page) => page.parent === parentId);
    }
    mainNavigation() {
      return this.list().filter((page) => page.nav === "main");
    }
    isUnlocked(id, unlockResolver = null) {
      const page = this.get(id);
      if (!page.unlock) {
        return true;
      }
      if (typeof unlockResolver !== "function") {
        return false;
      }
      return Boolean(unlockResolver(page.unlock, page));
    }
  };
  var pageRegistry = new PageRegistry();

  // src/ui/pages/city/CityPropertyPageSystem.js
  function safeBalance2(restaurantId2) {
    if (!restaurantId2) {
      return null;
    }
    try {
      return financeSystem.getBalance(restaurantId2);
    } catch {
      return null;
    }
  }
  function getDistrict(property) {
    return districtSystem.get(property.districtId) ?? null;
  }
  function buildFloorSummary(property) {
    return (property.floors ?? []).map((floor) => ({
      id: floor.id,
      label: floor.label,
      floorNumber: floor.floorNumber,
      area: floor.area,
      usableArea: floor.usableArea,
      width: floor.width,
      height: floor.height,
      shape: floor.shape,
      entranceCount: floor.entrances?.length ?? 0,
      windowCount: floor.windows?.length ?? 0,
      columnCount: floor.columns?.length ?? 0,
      fixedStructureCount: floor.fixedStructures?.length ?? 0,
      utilityPointCount: floor.utilityPoints?.length ?? 0
    }));
  }
  var CityPropertyPageSystem = class {
    getLeaseQuote(property, restaurantId2 = null, months = 12, offerId = null) {
      return propertyLeaseMarketSystem.getQuote({
        propertyId: property.id,
        restaurantId: restaurantId2,
        months,
        offerId
      });
    }
    buildPropertyCard(property, restaurantId2 = null) {
      const enriched = propertyLeaseMarketSystem.ensureTerms(property.id);
      const district = getDistrict(enriched);
      const defaultMonths = Math.max(
        12,
        enriched.leaseTerms?.minMonths ?? 12
      );
      const quote = this.getLeaseQuote(
        enriched,
        restaurantId2,
        Math.min(
          defaultMonths,
          enriched.leaseTerms?.maxMonths ?? defaultMonths
        )
      );
      const day = gameState.getSection("time")?.day ?? 1;
      return {
        id: enriched.id,
        name: enriched.name,
        districtId: enriched.districtId,
        districtName: district?.name ?? enriched.districtId,
        area: enriched.area,
        usableArea: enriched.usableArea ?? enriched.area,
        floorCount: enriched.floorCount ?? enriched.floors?.length ?? 1,
        seats: enriched.seats,
        monthlyRent: enriched.monthlyRent,
        depositMonths: enriched.depositMonths,
        status: enriched.status,
        available: enriched.status === "available",
        frontageMeters: enriched.frontageMeters ?? null,
        ceilingHeight: enriched.ceilingHeight ?? null,
        parkingSpaces: enriched.parkingSpaces ?? 0,
        foodServiceAllowed: enriched.foodServiceAllowed !== false,
        exhaustAllowed: enriched.exhaustAllowed !== false,
        tags: [...enriched.tags ?? []],
        floors: buildFloorSummary(enriched),
        source: enriched.source ?? "manual",
        propertyType: enriched.propertyType ?? null,
        qualityScore: enriched.marketMeta?.qualityScore ?? null,
        landlord: structuredClone(enriched.landlord ?? null),
        leaseTerms: structuredClone(enriched.leaseTerms ?? null),
        competition: {
          demandScore: enriched.leaseTerms?.competitorDemand ?? 0,
          claimDay: enriched.leaseTerms?.competitorClaimDay ?? null,
          daysUntilPossibleClaim: Number.isInteger(enriched.leaseTerms?.competitorClaimDay) ? Math.max(
            0,
            enriched.leaseTerms.competitorClaimDay - day
          ) : null
        },
        listing: {
          listedDay: enriched.listedDay ?? null,
          expiresDay: enriched.expiresDay ?? null,
          remainingDays: Number.isInteger(enriched.expiresDay) ? Math.max(0, enriched.expiresDay - day) : null
        },
        quote,
        district: district ? {
          trafficIndex: district.trafficIndex,
          spendingPower: district.spendingPower,
          competition: district.competition,
          customerMix: district.customerMix ?? null
        } : null
      };
    }
    getMarketplace({
      restaurantId: restaurantId2 = null,
      districtId = null,
      minArea = null,
      maxArea = null,
      maxRent = null,
      availableOnly = true,
      foodServiceOnly = false,
      exhaustRequired = false,
      generateListings = true,
      marketTarget = 18
    } = {}) {
      const districts = districtSystem.getAll();
      if (generateListings) {
        if (districtId !== null) {
          propertyMarketSystem.ensureDistrictStock(
            districtId,
            { target: marketTarget }
          );
        } else {
          for (const district of districts) {
            propertyMarketSystem.ensureDistrictStock(
              district.id,
              { target: marketTarget }
            );
          }
        }
      }
      const properties = propertySystem.list({ districtId, availableOnly }).filter((item) => minArea === null || item.area >= minArea).filter((item) => maxArea === null || item.area <= maxArea).filter((item) => maxRent === null || item.monthlyRent <= maxRent).filter(
        (item) => !foodServiceOnly || item.foodServiceAllowed !== false
      ).filter(
        (item) => !exhaustRequired || item.exhaustAllowed !== false
      ).map((item) => this.buildPropertyCard(item, restaurantId2)).sort((a, b) => {
        const qualityA = a.qualityScore ?? 50;
        const qualityB = b.qualityScore ?? 50;
        if (qualityA !== qualityB) {
          return qualityB - qualityA;
        }
        return a.monthlyRent - b.monthlyRent;
      });
      const activeLease = restaurantId2 ? leaseSystem.getByRestaurant(restaurantId2) ?? null : null;
      const marketDistricts = districtId === null ? districts : districts.filter((item) => item.id === districtId);
      return {
        pageId: "properties",
        title: "\u57CE\u5E02\u4E0E\u623F\u6E90",
        districts: districts.map((item) => ({
          id: item.id,
          name: item.name,
          trafficIndex: item.trafficIndex,
          spendingPower: item.spendingPower,
          competition: item.competition,
          customerMix: item.customerMix ?? null,
          propertyCount: properties.filter(
            (property) => property.districtId === item.id
          ).length
        })),
        properties,
        filters: {
          districtId,
          minArea,
          maxArea,
          maxRent,
          availableOnly,
          foodServiceOnly,
          exhaustRequired
        },
        market: {
          dynamicListings: generateListings,
          targetPerDistrict: marketTarget,
          districts: marketDistricts.map(
            (item) => propertyMarketSystem.getSummary(item.id)
          )
        },
        activeLease,
        balance: safeBalance2(restaurantId2),
        navigation: pageRegistry.mainNavigation().map((item) => ({
          ...item,
          active: item.id === "city"
        }))
      };
    }
    getPropertyDetail(propertyId, restaurantId2 = null, months = 12, offerId = null) {
      const property = propertyLeaseMarketSystem.ensureTerms(propertyId);
      const district = getDistrict(property);
      const normalizedMonths = Math.min(
        Math.max(
          months,
          property.leaseTerms.minMonths
        ),
        property.leaseTerms.maxMonths
      );
      const quote = this.getLeaseQuote(
        property,
        restaurantId2,
        normalizedMonths,
        offerId
      );
      const activeLease = restaurantId2 ? leaseSystem.getByRestaurant(restaurantId2) ?? null : null;
      const activeOffer = restaurantId2 ? propertyLeaseMarketSystem.getActiveOffer(
        restaurantId2,
        propertyId
      ) : null;
      const layout = propertySystem.getLayout(propertyId);
      return {
        pageId: "property_detail",
        property: this.buildPropertyCard(property, restaurantId2),
        district,
        layout,
        landlord: structuredClone(property.landlord),
        leaseTerms: structuredClone(property.leaseTerms),
        activeOffer,
        suitability: {
          foodServiceAllowed: property.foodServiceAllowed !== false,
          exhaustAllowed: property.exhaustAllowed !== false,
          frontageMeters: property.frontageMeters ?? null,
          ceilingHeight: property.ceilingHeight ?? null,
          parkingSpaces: property.parkingSpaces ?? 0,
          renovationRules: structuredClone(property.renovationRules ?? {}),
          tags: [...property.tags ?? []]
        },
        quote,
        leaseState: {
          hasActiveLease: Boolean(activeLease),
          canNegotiate: property.status === "available" && !activeLease && property.leaseTerms.negotiable === true,
          canSign: property.status === "available" && !activeLease && quote.affordable !== false && property.foodServiceAllowed !== false && (!offerId || activeOffer?.status === "accepted"),
          activeLease
        },
        nextAfterLease: "renovation"
      };
    }
    negotiateLease({
      restaurantId: restaurantId2,
      propertyId,
      months = 12,
      requestedRent = null,
      requestedRentFreeDays = 0
    }) {
      restaurantSystem.get(restaurantId2);
      const offer = propertyLeaseMarketSystem.negotiate({
        restaurantId: restaurantId2,
        propertyId,
        months,
        requestedRent,
        requestedRentFreeDays
      });
      return {
        offer,
        detail: this.getPropertyDetail(
          propertyId,
          restaurantId2,
          months,
          offer.status === "accepted" ? offer.id : null
        )
      };
    }
    acceptCounter(offerId) {
      return propertyLeaseMarketSystem.acceptCounter(offerId);
    }
    signLease({
      restaurantId: restaurantId2,
      propertyId,
      months = 12,
      offerId = null
    }) {
      restaurantSystem.get(restaurantId2);
      const property = propertySystem.get(propertyId);
      if (property.foodServiceAllowed === false) {
        throw new Error("Property does not allow food service");
      }
      const lease = propertyLeaseMarketSystem.signLease({
        restaurantId: restaurantId2,
        propertyId,
        months,
        offerId
      });
      return {
        lease,
        restaurant: restaurantSystem.get(restaurantId2),
        property: propertySystem.get(propertyId),
        propertyLayout: propertySystem.getLayout(propertyId),
        nextPage: "renovation",
        signedAtDay: gameState.getSection("time").day
      };
    }
    getRenewalQuote(restaurantId2, months = 12) {
      const lease = leaseSystem.getByRestaurant(restaurantId2);
      if (!lease) {
        return null;
      }
      return propertyLeaseMarketSystem.getRenewalQuote(
        lease.id,
        months
      );
    }
    renewLease(restaurantId2, months = 12) {
      const lease = leaseSystem.getByRestaurant(restaurantId2);
      if (!lease) {
        throw new Error("Restaurant does not have an active lease");
      }
      return propertyLeaseMarketSystem.renewLease({
        leaseId: lease.id,
        months
      });
    }
  };
  var cityPropertyPageSystem = new CityPropertyPageSystem();

  // src/ui/components/GameClockModel.js
  var WEEKDAYS = Object.freeze(["\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D", "\u5468\u65E5"]);
  function pad2(value) {
    return String(value).padStart(2, "0");
  }
  function toCalendarDate(day) {
    if (!Number.isInteger(day) || day < 1) {
      throw new RangeError("day must be a positive integer");
    }
    const zeroBased = day - 1;
    const year = Math.floor(zeroBased / 360) + 1;
    const dayOfYear = zeroBased % 360;
    const month = Math.floor(dayOfYear / 30) + 1;
    const dayOfMonth = dayOfYear % 30 + 1;
    const weekday = WEEKDAYS[zeroBased % 7];
    return { year, month, dayOfMonth, weekday };
  }
  function buildGameClockModel(time, runtime = {}) {
    const calendar = toCalendarDate(time.day);
    const speed = [1, 2, 4].includes(runtime.speed) ? runtime.speed : 1;
    const paused = Boolean(runtime.paused);
    return {
      ...calendar,
      hour: time.hour,
      minute: time.minute,
      clockText: `${pad2(time.hour)}:${pad2(time.minute)}`,
      dateText: `\u7B2C${calendar.year}\u5E74 ${calendar.month}\u6708${calendar.dayOfMonth}\u65E5 ${calendar.weekday}`,
      speed,
      paused,
      speedOptions: [1, 2, 4],
      statusText: paused ? "\u5DF2\u6682\u505C" : `${speed}\xD7`
    };
  }

  // src/ui/components/GlobalChromeModel.js
  function safeName(value, fallback) {
    const text = String(value ?? "").trim();
    return text || fallback;
  }
  function buildGlobalTopBarModel({
    restaurantName,
    brandName = null,
    balance = 0,
    storeLevel = 1,
    reputation = null,
    time,
    runtime,
    weather = null,
    currentStoreId = null
  }) {
    const clock = buildGameClockModel(time, runtime);
    return {
      restaurantName: safeName(restaurantName, "\u672A\u547D\u540D\u9910\u5385"),
      brandName: brandName ? safeName(brandName, null) : null,
      currentStoreId,
      balance,
      storeLevel,
      reputation,
      clock,
      weather: weather ? {
        icon: weather.icon ?? null,
        label: weather.label ?? null,
        temperature: weather.temperature ?? null
      } : null,
      actions: {
        canRename: true,
        canSwitchStore: true,
        canPause: true,
        speeds: clock.speedOptions
      }
    };
  }
  function buildNoticeTickerModel(notices = []) {
    const normalized = notices.filter(Boolean).map((notice, index) => ({
      id: notice.id ?? `notice_${index + 1}`,
      type: notice.type ?? "info",
      title: notice.title ?? "\u7ECF\u8425\u901A\u62A5",
      message: String(notice.message ?? ""),
      timeLabel: notice.timeLabel ?? null,
      priority: Number.isFinite(notice.priority) ? notice.priority : 0,
      unread: notice.unread !== false,
      action: notice.action ?? null
    })).sort((a, b) => b.priority - a.priority);
    return {
      current: normalized[0] ?? null,
      unreadCount: normalized.filter((item) => item.unread).length,
      items: normalized.slice(0, 50)
    };
  }

  // src/ui/pages/city/CityMapDashboardSystem.js
  var FALLBACK_POSITIONS = Object.freeze([
    { x: 20, y: 26 },
    { x: 48, y: 18 },
    { x: 73, y: 28 },
    { x: 30, y: 50 },
    { x: 58, y: 47 },
    { x: 82, y: 54 },
    { x: 18, y: 74 },
    { x: 46, y: 78 },
    { x: 72, y: 76 },
    { x: 88, y: 80 }
  ]);
  function safeBalance3(restaurantId2) {
    if (!restaurantId2) {
      return 0;
    }
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return 0;
    }
  }
  function safeRestaurant(restaurantId2) {
    if (!restaurantId2) {
      return null;
    }
    try {
      return restaurantSystem.get(
        restaurantId2
      );
    } catch {
      return null;
    }
  }
  function normalizeMix(mix) {
    if (!mix || typeof mix !== "object") {
      return [];
    }
    const entries = Object.entries(
      mix
    );
    const total = entries.reduce(
      (sum, [
        ,
        value
      ]) => sum + (Number(value) || 0),
      0
    );
    if (total <= 0) {
      return [];
    }
    return entries.map(
      ([
        id,
        value
      ]) => ({
        id,
        value: Number(value) || 0,
        percent: Math.round(
          (Number(value) || 0) / total * 100
        )
      })
    ).sort(
      (a, b) => b.percent - a.percent
    );
  }
  var CityMapDashboardSystem = class {
    getDistrictPosition(district, index) {
      const custom = district.mapPosition ?? district.uiMapPosition ?? null;
      if (custom && Number.isFinite(
        custom.x
      ) && Number.isFinite(
        custom.y
      )) {
        return {
          x: Math.max(
            6,
            Math.min(
              94,
              custom.x
            )
          ),
          y: Math.max(
            8,
            Math.min(
              92,
              custom.y
            )
          ),
          source: "district"
        };
      }
      const fallback = FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length];
      return {
        ...fallback,
        source: "layout-fallback"
      };
    }
    getDistricts(marketplace) {
      const raw = districtSystem.getAll();
      return marketplace.districts.map(
        (district, index) => {
          const source = raw.find(
            (item) => item.id === district.id
          ) ?? district;
          const position = this.getDistrictPosition(
            source,
            index
          );
          const properties = marketplace.properties.filter(
            (item) => item.districtId === district.id
          );
          const averageRent = properties.length > 0 ? Math.round(
            properties.reduce(
              (sum, item) => sum + (item.monthlyRent ?? 0),
              0
            ) / properties.length
          ) : 0;
          return {
            ...district,
            position,
            averageRent,
            customerMix: normalizeMix(
              district.customerMix
            ),
            recommendedPropertyId: properties[0]?.id ?? null,
            recommendedPropertyName: properties[0]?.name ?? null
          };
        }
      );
    }
    getRecommendedProperties(marketplace, limit = 4) {
      return marketplace.properties.slice(
        0,
        limit
      ).map(
        (property) => ({
          id: property.id,
          name: property.name,
          districtId: property.districtId,
          districtName: property.districtName,
          area: property.area,
          usableArea: property.usableArea,
          monthlyRent: property.monthlyRent,
          qualityScore: property.qualityScore,
          trafficIndex: property.district?.trafficIndex ?? 0,
          spendingPower: property.district?.spendingPower ?? 0,
          competition: property.district?.competition ?? 0,
          affordable: property.quote?.affordable !== false,
          upfront: property.quote?.upfront ?? null,
          foodServiceAllowed: property.foodServiceAllowed !== false,
          exhaustAllowed: property.exhaustAllowed !== false,
          imageSlot: `property-${property.id}`
        })
      );
    }
    getCitySummary(districts, marketplace) {
      const totalProperties = marketplace.properties.length;
      const averageTraffic = districts.length > 0 ? Math.round(
        districts.reduce(
          (sum, item) => sum + (item.trafficIndex ?? 0),
          0
        ) / districts.length
      ) : 0;
      const averageSpending = districts.length > 0 ? Math.round(
        districts.reduce(
          (sum, item) => sum + (item.spendingPower ?? 0),
          0
        ) / districts.length
      ) : 0;
      const averageCompetition = districts.length > 0 ? Math.round(
        districts.reduce(
          (sum, item) => sum + (item.competition ?? 0),
          0
        ) / districts.length
      ) : 0;
      return {
        districtCount: districts.length,
        propertyCount: totalProperties,
        averageTraffic,
        averageSpending,
        averageCompetition
      };
    }
    getPage({
      restaurantId: restaurantId2 = null,
      selectedDistrictId = null
    } = {}) {
      const marketplace = cityPropertyPageSystem.getMarketplace({
        restaurantId: restaurantId2,
        districtId: null,
        availableOnly: true,
        generateListings: true
      });
      const districts = this.getDistricts(
        marketplace
      );
      const selectedDistrict = districts.find(
        (item) => item.id === selectedDistrictId
      ) ?? districts[0] ?? null;
      const recommended = this.getRecommendedProperties(
        marketplace,
        4
      );
      const restaurant = safeRestaurant(
        restaurantId2
      );
      const time = gameState.getSection(
        "time"
      );
      const runtime = gameState.getSection(
        "runtime"
      );
      const balance = safeBalance3(
        restaurantId2
      );
      const urgentProperties = marketplace.properties.filter(
        (property) => Number.isInteger(
          property.competition?.daysUntilPossibleClaim
        ) && property.competition.daysUntilPossibleClaim <= 3
      );
      const notices = [];
      if (urgentProperties.length > 0) {
        notices.push({
          id: "city_hot_property",
          type: "warning",
          title: "\u623F\u6E90\u52A8\u6001",
          message: `${urgentProperties.length}\u5957\u70ED\u95E8\u94FA\u4F4D\u5C06\u57283\u5929\u5185\u9762\u4E34\u62A2\u79DF\u98CE\u9669`,
          priority: 100,
          action: "properties"
        });
      }
      notices.push({
        id: "city_market",
        type: "info",
        title: "\u57CE\u5E02\u5E02\u573A",
        message: `\u5F53\u524D\u5F00\u653E${districts.length}\u4E2A\u5546\u5708\uFF0C\u5171${marketplace.properties.length}\u5957\u53EF\u79DF\u623F\u6E90`,
        priority: 30,
        action: "properties"
      });
      const summary = this.getCitySummary(
        districts,
        marketplace
      );
      return {
        pageId: "city",
        topBar: buildGlobalTopBarModel({
          restaurantName: restaurant?.name ?? "\u57CE\u5E02\u9910\u996E\u521B\u4E1A",
          balance,
          storeLevel: restaurant?.level ?? 1,
          reputation: restaurant?.reputation ?? 0,
          time,
          runtime,
          currentStoreId: restaurantId2
        }),
        noticeTicker: buildNoticeTickerModel(
          notices
        ),
        map: {
          imageSlot: "city-main-map",
          selectedDistrictId: selectedDistrict?.id ?? null,
          districts
        },
        citySummary: summary,
        selectedDistrict,
        recommendedProperties: recommended,
        filters: {
          areaMin: 30,
          areaMax: 1e4,
          rentMax: null,
          foodService: false,
          exhaust: false
        },
        imageSlots: [
          {
            id: "city-main-map",
            type: "city-map",
            static: true
          },
          ...recommended.map(
            (property) => ({
              id: property.imageSlot,
              type: "property",
              static: true,
              entityId: property.id
            })
          )
        ],
        navigation: marketplace.navigation.map(
          (item) => ({
            id: item.id,
            title: item.title,
            active: item.id === "city"
          })
        )
      };
    }
  };
  var cityMapDashboardSystem = new CityMapDashboardSystem();

  // src/ui/components/GameChromeView.js
  function escapeHtml(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function iconText(icon) {
    const map = {
      city: "\u57CE",
      store: "\u5E97",
      restaurant: "\u5E97",
      operations: "\u8425",
      employees: "\u5458",
      more: "\xB7\xB7\xB7"
    };
    return map[icon] ?? "\u25A1";
  }
  function renderGameTopBar(model, {
    subtitle = null,
    locationLabel = null,
    showSpeedControls = false
  } = {}) {
    const clock = model?.clock ?? {};
    const level = model?.storeLevel ?? model?.level ?? 1;
    const speeds = model?.actions?.speeds ?? clock.speedOptions ?? [
      1,
      2,
      4
    ];
    return `
    <header class="rg-topbar">

      <section class="rg-topbar__identity">

        <div
          class="rg-topbar__avatar"
          data-image-slot="restaurant-avatar"
        >
          \u5E97
        </div>

        <div class="rg-topbar__identity-copy">

          <strong>
            ${escapeHtml(
      model?.restaurantName ?? "\u672A\u547D\u540D\u9910\u5385"
    )}
          </strong>

          <span>
            ${escapeHtml(
      subtitle ?? locationLabel ?? model?.brandName ?? "\u9910\u996E\u7ECF\u8425"
    )}
          </span>

        </div>

      </section>


      <section class="rg-topbar__clock">

        <span>
          ${model?.weather?.label ? escapeHtml(
      model.weather.label
    ) : "\u7ECF\u8425\u65F6\u95F4"}
        </span>

        <strong>
          ${escapeHtml(
      clock.clockText ?? "--:--"
    )}
        </strong>

        <small>
          ${escapeHtml(
      clock.dateText ?? ""
    )}
        </small>

      </section>


      <section class="rg-topbar__money">

        <span>
          \u5F53\u524D\u8D44\u91D1
        </span>

        <strong>
          ${money(
      model?.balance
    )}
        </strong>

      </section>


      <section class="rg-topbar__level">

        <span>
          \u95E8\u5E97\u7B49\u7EA7
        </span>

        <strong>
          Lv.${level}
        </strong>

        <small>
          \u58F0\u671B
          ${model?.reputation ?? 0}
        </small>

      </section>


      ${showSpeedControls ? `
            <section class="rg-topbar__speed">

              <button
                type="button"
                data-action="pause"
              >
                ${clock.paused ? "\u25B6" : "\u2161"}
              </button>

              ${speeds.map(
      (speed) => `
                      <button
                        type="button"
                        data-action="speed"
                        data-speed="${speed}"
                        class="${!clock.paused && clock.speed === speed ? "is-active" : ""}"
                      >
                        ${speed}\xD7
                      </button>
                    `
    ).join("")}

            </section>
          ` : ""}

    </header>
  `;
  }
  function renderNoticeTicker(model) {
    const current = model?.current ?? model?.items?.[0] ?? null;
    return `
    <button
      type="button"
      class="
        rg-notice
        rg-notice--${current?.type ?? "info"}
      "
      ${current?.action ? `data-page-target="${escapeHtml(
      current.action
    )}"` : ""}
    >

      <b class="rg-notice__badge">
        \u516C\u544A
      </b>

      <strong>
        ${escapeHtml(
      current?.title ?? "\u7ECF\u8425\u901A\u62A5"
    )}
      </strong>

      <span>
        ${escapeHtml(
      current?.message ?? "\u5F53\u524D\u6CA1\u6709\u65B0\u7684\u7ECF\u8425\u63D0\u9192"
    )}
      </span>

      ${(model?.unreadCount ?? 0) > 0 ? `
            <i>
              ${Math.min(
      99,
      model.unreadCount
    )}
            </i>
          ` : ""}

    </button>
  `;
  }
  function renderPageTitle({
    title,
    subtitle = null,
    backTarget = null,
    helpLabel = null,
    helpTarget = null,
    rightHtml = ""
  } = {}) {
    return `
    <section class="rg-page-title">

      <div class="rg-page-title__left">

        ${backTarget ? `
              <button
                type="button"
                class="rg-back-button"
                data-page-target="${escapeHtml(
      backTarget
    )}"
              >
                \u2039 \u8FD4\u56DE
              </button>
            ` : ""}


        <div>

          <strong>
            ${escapeHtml(
      title ?? ""
    )}
          </strong>

          ${subtitle ? `
                <span>
                  ${escapeHtml(
      subtitle
    )}
                </span>
              ` : ""}

        </div>

      </div>


      <div class="rg-page-title__right">

        ${rightHtml}

        ${helpLabel ? `
              <button
                type="button"
                class="rg-help-button"
                ${helpTarget ? `data-page-target="${escapeHtml(
      helpTarget
    )}"` : ""}
              >
                ${escapeHtml(
      helpLabel
    )}
              </button>
            ` : ""}

      </div>

    </section>
  `;
  }
  function renderBottomNavigation(items = []) {
    return `
    <nav class="rg-bottom-nav">

      ${items.map(
      (item) => {
        const target = item.target ?? item.id;
        const label = item.label ?? item.title ?? target;
        const badge = Math.max(
          0,
          Number(
            item.badge
          ) || 0
        );
        return `
              <button
                type="button"
                class="${item.active ? "is-active" : ""}"
                data-page-target="${escapeHtml(
          target
        )}"
              >

                <span class="rg-bottom-nav__icon">
                  ${escapeHtml(
          iconText(
            item.icon ?? target
          )
        )}

                  ${badge > 0 ? `
                        <b class="rg-nav-badge">
                          ${badge > 99 ? "99+" : badge}
                        </b>
                      ` : ""}

                </span>

                <strong>
                  ${escapeHtml(
          label
        )}
                </strong>

              </button>
            `;
      }
    ).join("")}

    </nav>
  `;
  }

  // src/ui/registry/defaultPages.js
  var CORE_PAGES = [
    { id: "city", title: "\u57CE\u5E02", nav: "main", order: 10, layout: "workspace" },
    { id: "restaurant", title: "\u95E8\u5E97", nav: "main", order: 20, layout: "management" },
    { id: "operations", title: "\u7ECF\u8425", nav: "main", order: 30, layout: "management" },
    { id: "employees", title: "\u5458\u5DE5", nav: "main", order: 40, layout: "management" },
    { id: "more", title: "\u66F4\u591A", nav: "main", order: 50, layout: "management" },
    { id: "properties", title: "\u5546\u5708\u4E0E\u623F\u6E90", parent: "city", order: 110, layout: "workspace" },
    { id: "property_detail", title: "\u623F\u6E90\u8BE6\u60C5", parent: "city", order: 120, layout: "management" },
    { id: "lease", title: "\u79DF\u7EA6\u7BA1\u7406", parent: "restaurant", order: 210, layout: "management" },
    { id: "renovation", title: "\u88C5\u4FEE\u5E03\u5C40", parent: "restaurant", order: 220, layout: "workspace" },
    { id: "renovation_construction", title: "\u88C5\u4FEE\u65BD\u5DE5", parent: "restaurant", order: 225, layout: "management" },
    { id: "opening-setup", title: "\u5F00\u5E97\u51C6\u5907", parent: "restaurant", order: 230, layout: "management" },
    { id: "dishes", title: "\u83DC\u54C1\u4E2D\u5FC3", parent: "operations", order: 310, layout: "management" },
    { id: "supply", title: "\u4F9B\u5E94\u94FE", parent: "operations", order: 320, layout: "management" },
    { id: "analytics", title: "\u7ECF\u8425\u6570\u636E", parent: "operations", order: 330, layout: "dashboard" },
    { id: "finance", title: "\u8D22\u52A1", parent: "operations", order: 340, layout: "dashboard" },
    { id: "employee_roster", title: "\u5458\u5DE5\u7BA1\u7406", parent: "employees", order: 410, layout: "management" },
    { id: "employee_training", title: "\u57F9\u8BAD", parent: "employees", order: 420, layout: "management" },
    { id: "employee_promotion", title: "\u5458\u5DE5\u664B\u5347", parent: "employees", order: 430, layout: "management", unlock: "employee_promotion" },
    { id: "members", title: "\u4F1A\u5458", parent: "more", order: 510, layout: "management", unlock: "membership" },
    { id: "chain", title: "\u8FDE\u9501\u7BA1\u7406", parent: "more", order: 520, layout: "management", unlock: "chain_management" },
    { id: "settings", title: "\u8BBE\u7F6E", parent: "more", order: 590, layout: "management" }
  ];
  function registerDefaultPages(registry = pageRegistry) {
    for (const page of CORE_PAGES) {
      if (!registry.has(page.id)) {
        registry.register(page);
      }
    }
    return registry;
  }
  registerDefaultPages();

  // src/systems/LayoutFlowSystem.js
  function clamp7(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  var LayoutFlowSystem = class {
    getPlacementGeometry(layout, placement) {
      const definition = renovationSystem.getFurnitureDefinition(
        placement.furnitureId
      );
      const size = renovationSystem.getSize(
        definition,
        placement.rotation ?? 0
      );
      return {
        placement,
        definition,
        floorId: renovationSystem.getPlacementFloorId(
          layout,
          placement
        ),
        width: size.width,
        height: size.height,
        centerX: placement.x + size.width / 2,
        centerY: placement.y + size.height / 2,
        area: size.width * size.height
      };
    }
    getGeometries(layout) {
      return (layout.placements ?? []).map(
        (placement) => this.getPlacementGeometry(
          layout,
          placement
        )
      );
    }
    getDistance(a, b) {
      if (a.floorId !== b.floorId) {
        return Infinity;
      }
      return Math.abs(
        a.centerX - b.centerX
      ) + Math.abs(
        a.centerY - b.centerY
      );
    }
    getAverageNearestDistance(sources, targets) {
      if (sources.length === 0 || targets.length === 0) {
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
      return matched > 0 ? total / matched : null;
    }
    getTotalCells(layout) {
      const floors = renovationSystem.getLayoutFloors(
        layout
      );
      return Math.max(
        1,
        floors.reduce(
          (sum, floor) => sum + floor.width * floor.height,
          0
        )
      );
    }
    getDistanceNormalizer(layout) {
      const floors = renovationSystem.getLayoutFloors(
        layout
      );
      return Math.max(
        1,
        ...floors.map(
          (floor) => floor.width + floor.height
        )
      );
    }
    calculate(layout) {
      const geometries = this.getGeometries(layout);
      const tables = geometries.filter(
        (item) => item.definition.type === "table"
      );
      const kitchens = geometries.filter(
        (item) => item.definition.type === "kitchen"
      );
      const prep = geometries.filter(
        (item) => item.placement.furnitureId === "prep_counter"
      );
      const cashiers = geometries.filter(
        (item) => item.placement.furnitureId === "cashier_counter"
      );
      const waiting = geometries.filter(
        (item) => item.placement.furnitureId === "waiting_bench"
      );
      const decor = geometries.filter(
        (item) => item.definition.type === "decor"
      );
      const totalCells = this.getTotalCells(layout);
      const occupiedCells = geometries.reduce(
        (sum, item) => sum + item.area,
        0
      );
      const density = clamp7(
        occupiedCells / totalCells,
        0,
        1
      );
      const normalizer = this.getDistanceNormalizer(
        layout
      );
      const kitchenTargets = prep.length > 0 ? prep : cashiers.length > 0 ? cashiers : tables;
      const kitchenDistance = this.getAverageNearestDistance(
        kitchens,
        kitchenTargets
      );
      const serviceDistance = this.getAverageNearestDistance(
        cashiers,
        tables
      );
      const normalizedKitchenDistance = kitchenDistance === null ? null : kitchenDistance / normalizer;
      const normalizedServiceDistance = serviceDistance === null ? null : serviceDistance / normalizer;
      const aisleEfficiency = density <= 0.35 ? 1.03 : clamp7(
        1.03 - (density - 0.35) * 0.9,
        0.72,
        1.03
      );
      let kitchenFlowEfficiency;
      if (kitchens.length === 0) {
        kitchenFlowEfficiency = 0;
      } else if (normalizedKitchenDistance === null) {
        kitchenFlowEfficiency = 0.78;
      } else {
        kitchenFlowEfficiency = clamp7(
          1.08 - normalizedKitchenDistance * 0.65,
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
        serviceFlowEfficiency = clamp7(
          1.06 - normalizedServiceDistance * 0.55,
          0.8,
          1.06
        );
      }
      const kitchenMultiplier = kitchens.length > 0 ? clamp7(
        kitchenFlowEfficiency * aisleEfficiency,
        0.6,
        1.08
      ) : 0;
      const serviceMultiplier = tables.length > 0 ? clamp7(
        serviceFlowEfficiency * aisleEfficiency,
        0.65,
        1.08
      ) : 0;
      const crowdingPenalty = Math.max(
        0,
        density - 0.5
      ) * 0.5;
      const comfortMultiplier = clamp7(
        1.02 + Math.min(
          0.06,
          decor.length * 0.01
        ) - crowdingPenalty,
        0.85,
        1.08
      );
      const waitingSupport = waiting.length > 0 ? clamp7(
        1 + Math.min(
          0.15,
          waiting.length * 0.06
        ),
        1,
        1.15
      ) : 0.88;
      const queuePatienceMultiplier = clamp7(
        waitingSupport * comfortMultiplier,
        0.75,
        1.2
      );
      const comfortScore = Math.round(
        clamp7(
          80 + (comfortMultiplier - 1) * 250,
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
      if (normalizedKitchenDistance !== null && normalizedKitchenDistance > 0.35) {
        issues.push("kitchen_route_too_long");
      }
      if (normalizedServiceDistance !== null && normalizedServiceDistance > 0.35) {
        issues.push("service_route_too_long");
      }
      const flowScore = Math.round(
        clamp7(
          (kitchenMultiplier * 0.4 + serviceMultiplier * 0.4 + aisleEfficiency * 0.2) / 1.03 * 100,
          0,
          100
        )
      );
      return {
        width: layout.width,
        height: layout.height,
        floorCount: renovationSystem.getLayoutFloors(layout).length,
        occupiedCells,
        totalCells,
        density: Number(
          density.toFixed(3)
        ),
        tableCount: tables.length,
        kitchenCount: kitchens.length,
        prepCount: prep.length,
        cashierCount: cashiers.length,
        waitingCount: waiting.length,
        decorCount: decor.length,
        kitchenDistance: kitchenDistance === null ? null : Number(
          kitchenDistance.toFixed(2)
        ),
        serviceDistance: serviceDistance === null ? null : Number(
          serviceDistance.toFixed(2)
        ),
        normalizedKitchenDistance: normalizedKitchenDistance === null ? null : Number(
          normalizedKitchenDistance.toFixed(3)
        ),
        normalizedServiceDistance: normalizedServiceDistance === null ? null : Number(
          normalizedServiceDistance.toFixed(3)
        ),
        aisleEfficiency: Number(
          aisleEfficiency.toFixed(3)
        ),
        kitchenFlowEfficiency: Number(
          kitchenFlowEfficiency.toFixed(3)
        ),
        serviceFlowEfficiency: Number(
          serviceFlowEfficiency.toFixed(3)
        ),
        kitchenMultiplier: Number(
          kitchenMultiplier.toFixed(3)
        ),
        serviceMultiplier: Number(
          serviceMultiplier.toFixed(3)
        ),
        comfortMultiplier: Number(
          comfortMultiplier.toFixed(3)
        ),
        queuePatienceMultiplier: Number(
          queuePatienceMultiplier.toFixed(3)
        ),
        comfortScore,
        flowScore,
        issues
      };
    }
    getAnalysis(restaurantId2) {
      const layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout) {
        return {
          restaurantId: restaurantId2,
          initialized: false,
          active: false,
          comfortScore: 80,
          flowScore: 100,
          issues: []
        };
      }
      return {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        initialized: true,
        active: Boolean(layout.active),
        ...this.calculate(layout)
      };
    }
    getOperationalEffects(restaurantId2) {
      const layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout || !layout.active) {
        return {
          active: false,
          kitchenMultiplier: 1,
          serviceMultiplier: 1,
          comfortMultiplier: 1,
          queuePatienceMultiplier: 1,
          comfortScore: 80,
          kitchenCapacityPerHour: Infinity,
          flowScore: 100,
          issues: []
        };
      }
      const analysis = this.calculate(layout);
      const baseKitchenCapacity = renovationSystem.getKitchenCapacityPerHour(
        restaurantId2
      );
      return {
        active: true,
        kitchenMultiplier: analysis.kitchenMultiplier,
        serviceMultiplier: analysis.serviceMultiplier,
        comfortMultiplier: analysis.comfortMultiplier,
        queuePatienceMultiplier: analysis.queuePatienceMultiplier,
        comfortScore: analysis.comfortScore,
        kitchenCapacityPerHour: Math.max(
          1,
          Math.floor(
            baseKitchenCapacity * analysis.kitchenMultiplier
          )
        ),
        flowScore: analysis.flowScore,
        issues: [...analysis.issues]
      };
    }
  };
  var layoutFlowSystem = new LayoutFlowSystem();

  // src/systems/EmployeeWorkSystem.js
  function clamp8(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  var EmployeeWorkSystem = class {
    listAvailableByRole(restaurantId2, roleId) {
      return employeeSystem.listByRestaurant(restaurantId2).filter(
        (employee) => employee.roleId === roleId && employee.status === EMPLOYEE_STATUS.ACTIVE && employee.fatigue < 95
      );
    }
    getEffectiveSkill(employee, skillName) {
      const base = employee.skills?.[skillName] ?? 0;
      const moodBonus = (employee.mood - 50) * 0.15;
      const fatiguePenalty = employee.fatigue * 0.35;
      return clamp8(
        Math.round(base + moodBonus - fatiguePenalty),
        1,
        100
      );
    }
    getBestChef(restaurantId2) {
      const chefs = this.listAvailableByRole(restaurantId2, "chef");
      if (chefs.length === 0) {
        return null;
      }
      return chefs.map((employee) => ({
        employee,
        effectiveSkill: this.getEffectiveSkill(employee, "cooking")
      })).sort((a, b) => b.effectiveSkill - a.effectiveSkill)[0];
    }
    requireChef(restaurantId2, employeeId = null) {
      if (employeeId !== null) {
        const employee = employeeSystem.get(employeeId);
        if (employee.restaurantId !== restaurantId2 || employee.roleId !== "chef" || employee.status !== EMPLOYEE_STATUS.ACTIVE || employee.fatigue >= 95) {
          throw new Error("Selected chef is not available");
        }
        return {
          employee,
          effectiveSkill: this.getEffectiveSkill(employee, "cooking")
        };
      }
      const chef = this.getBestChef(restaurantId2);
      if (!chef) {
        const error = new Error("No available chef");
        error.code = "NO_CHEF_AVAILABLE";
        throw error;
      }
      return chef;
    }
    getServiceCapacity(restaurantId2) {
      const servers = this.listAvailableByRole(restaurantId2, "server");
      let baseCapacity;
      if (servers.length === 0) {
        baseCapacity = 1;
      } else {
        baseCapacity = servers.reduce((capacity, employee) => {
          const skill = this.getEffectiveSkill(employee, "service");
          return capacity + 2 + Math.floor(skill / 25);
        }, 0);
      }
      const renovation = renovationSystem.getOperationalModifiers(restaurantId2);
      const renovationMultiplier = renovation.active ? renovation.serviceEfficiency : 1;
      const flow = layoutFlowSystem.getOperationalEffects(restaurantId2);
      const serviceCapacity = Math.max(
        1,
        Math.floor(
          baseCapacity * renovationMultiplier * flow.serviceMultiplier
        )
      );
      if (!Number.isFinite(flow.kitchenCapacityPerHour)) {
        return serviceCapacity;
      }
      return Math.max(
        1,
        Math.min(serviceCapacity, flow.kitchenCapacityPerHour)
      );
    }
    getCapacityBreakdown(restaurantId2) {
      const renovation = renovationSystem.getOperationalModifiers(restaurantId2);
      const flow = layoutFlowSystem.getOperationalEffects(restaurantId2);
      return {
        restaurantId: restaurantId2,
        effectiveCapacity: this.getServiceCapacity(restaurantId2),
        renovation,
        flow
      };
    }
    recordWork(employeeId, minutes) {
      if (!Number.isInteger(minutes) || minutes <= 0) {
        throw new RangeError("Work minutes must be positive");
      }
      const employee = employeeSystem.get(employeeId);
      const oldWorkMinutes = employee.totalWorkMinutes ?? 0;
      const totalWorkMinutes = oldWorkMinutes + minutes;
      const fatigueGain = Math.max(1, Math.ceil(minutes / 15));
      const fatigue = clamp8(employee.fatigue + fatigueGain, 0, 100);
      const mood = fatigue >= 80 ? clamp8(employee.mood - 1, 0, 100) : employee.mood;
      const oldExperienceBlocks = Math.floor(oldWorkMinutes / 120);
      const newExperienceBlocks = Math.floor(totalWorkMinutes / 120);
      const experienceGain = Math.max(
        0,
        (newExperienceBlocks - oldExperienceBlocks) * 40
      );
      const oldSkillBlocks = Math.floor(oldWorkMinutes / 240);
      const newSkillBlocks = Math.floor(totalWorkMinutes / 240);
      const skillGain = Math.max(0, newSkillBlocks - oldSkillBlocks);
      const role = employeeSystem.getRole(employee.roleId);
      const skills = { ...employee.skills ?? {} };
      if (skillGain > 0) {
        skills[role.primarySkill] = clamp8(
          (skills[role.primarySkill] ?? 0) + skillGain,
          0,
          100
        );
      }
      const experience = (employee.experience ?? 0) + experienceGain;
      return entitySystem.update("employee", employeeId, {
        fatigue,
        mood,
        totalWorkMinutes,
        experience,
        level: Math.floor(experience / 1e3) + 1,
        skills
      });
    }
    recoverHour(restaurantId2) {
      const employees = employeeSystem.listByRestaurant(restaurantId2);
      for (const employee of employees) {
        if (employee.status === EMPLOYEE_STATUS.FIRED) {
          continue;
        }
        entitySystem.update("employee", employee.id, {
          fatigue: clamp8(employee.fatigue - 6, 0, 100),
          mood: clamp8(employee.mood + 1, 0, 100)
        });
      }
    }
  };
  var employeeWorkSystem = new EmployeeWorkSystem();

  // src/systems/StaffingRecommendationSystem.js
  function clamp9(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  function countRoles(employees) {
    const result = {};
    for (const employee of employees) {
      result[employee.roleId] = (result[employee.roleId] ?? 0) + 1;
    }
    return result;
  }
  var StaffingRecommendationSystem = class {
    getRecentDemand(restaurantId2, days = 7) {
      const currentDay4 = gameState.getSection(
        "time"
      )?.day ?? 1;
      const startDay = Math.max(
        1,
        currentDay4 - days + 1
      );
      const orders = entitySystem.list(
        "customer_order"
      ).filter(
        (order) => order.restaurantId === restaurantId2 && order.status === "completed" && (order.day ?? currentDay4) >= startDay
      );
      const observedDays = Math.max(
        1,
        Math.min(
          days,
          currentDay4 - startDay + 1
        )
      );
      const deliveryOrders = orders.filter(
        (order) => {
          const source = String(
            order.channelId ?? order.channel ?? order.source ?? ""
          ).toLowerCase();
          return source.includes(
            "delivery"
          ) || source.includes(
            "\u5916\u5356"
          );
        }
      ).length;
      return {
        totalOrders: orders.length,
        observedDays,
        averageDailyOrders: Number(
          (orders.length / observedDays).toFixed(
            1
          )
        ),
        deliveryOrders,
        deliveryRatio: orders.length > 0 ? deliveryOrders / orders.length : 0
      };
    }
    getAverageEffectiveSkill(restaurantId2, roleId, skill) {
      const employees = employeeWorkSystem.listAvailableByRole(
        restaurantId2,
        roleId
      );
      if (employees.length === 0) {
        return 50;
      }
      return Math.round(
        employees.reduce(
          (sum, employee) => sum + employeeWorkSystem.getEffectiveSkill(
            employee,
            skill
          ),
          0
        ) / employees.length
      );
    }
    calculatePlan(context, currentCounts = {}) {
      const seats = Math.max(
        0,
        context.seats ?? 0
      );
      if (seats === 0) {
        return [];
      }
      const hours = Math.max(
        1,
        context.operatingHours ?? 10
      );
      const observedDemand = Math.max(
        0,
        context.averageDailyOrders ?? 0
      );
      const baselineDemand = Math.ceil(
        seats * Math.max(
          0.75,
          hours / 12
        )
      );
      const expectedDailyOrders = Math.max(
        observedDemand,
        baselineDemand
      );
      const peakOrdersPerHour = Math.max(
        1,
        Math.ceil(
          expectedDailyOrders / hours * 1.9
        )
      );
      const chefEfficiency = clamp9(
        (context.averageChefSkill ?? 50) / 50 * (context.kitchenEfficiency ?? 1),
        0.7,
        1.35
      );
      const serverEfficiency = clamp9(
        (context.averageServerSkill ?? 50) / 50 * (context.serviceEfficiency ?? 1),
        0.7,
        1.35
      );
      const rawChef = Math.max(
        1,
        Math.ceil(
          seats / 28
        ),
        Math.ceil(
          peakOrdersPerHour / 7
        )
      );
      const chef = Math.max(
        1,
        Math.ceil(
          rawChef / chefEfficiency
        )
      );
      const rawServer = Math.max(
        1,
        Math.ceil(
          seats / 16
        ),
        Math.ceil(
          peakOrdersPerHour / 4
        )
      );
      const server = Math.max(
        1,
        Math.ceil(
          rawServer / serverEfficiency
        )
      );
      const cashier = seats >= 70 || peakOrdersPerHour >= 16 ? 2 : 1;
      const kitchenAssistant = chef >= 2 || seats >= 30 ? Math.max(
        1,
        Math.ceil(
          chef / 2
        )
      ) : 0;
      const cleaner = Math.max(
        1,
        Math.ceil(
          seats / 50
        )
      );
      const manager = seats >= 60 || expectedDailyOrders >= 90 ? 1 : 0;
      const delivery = (context.deliveryRatio ?? 0) >= 0.15 ? Math.max(
        1,
        Math.ceil(
          (context.deliveryAverageDaily ?? 0) / 35
        )
      ) : 0;
      const definitions = [
        {
          roleId: "chef",
          name: "\u53A8\u5E08",
          recommended: chef,
          reason: `${seats}\u9910\u4F4D \xB7 \u5CF0\u503C\u7EA6${peakOrdersPerHour}\u5355/\u5C0F\u65F6`
        },
        {
          roleId: "server",
          name: "\u670D\u52A1\u5458",
          recommended: server,
          reason: `\u9910\u4F4D\u4E0E\u670D\u52A1\u6548\u7387\u52A8\u6001\u8BA1\u7B97`
        },
        {
          roleId: "cashier",
          name: "\u6536\u94F6\u5458",
          recommended: cashier,
          reason: peakOrdersPerHour >= 16 ? "\u9AD8\u5CF0\u8BA2\u5355\u91CF\u8F83\u9AD8" : "\u9996\u5E97\u57FA\u7840\u6536\u94F6\u914D\u7F6E"
        },
        {
          roleId: "kitchen_assistant",
          name: "\u540E\u53A8\u5E2E\u5DE5",
          recommended: kitchenAssistant,
          reason: chef >= 2 ? "\u8F85\u52A9\u53A8\u5E08\u5907\u9910" : "\u5F53\u524D\u89C4\u6A21\u6682\u975E\u5FC5\u8981"
        },
        {
          roleId: "cleaner",
          name: "\u4FDD\u6D01\u5458",
          recommended: cleaner,
          reason: `${seats}\u9910\u4F4D\u536B\u751F\u7EF4\u62A4`
        },
        {
          roleId: "delivery",
          name: "\u914D\u9001\u5458",
          recommended: delivery,
          reason: delivery > 0 ? "\u5916\u5356\u8BA2\u5355\u5360\u6BD4\u8FBE\u5230\u914D\u7F6E\u9608\u503C" : "\u5F53\u524D\u5916\u5356\u9700\u6C42\u4E0D\u8DB3"
        },
        {
          roleId: "manager",
          name: "\u5E97\u957F",
          recommended: manager,
          reason: manager > 0 ? "\u95E8\u5E97\u89C4\u6A21\u8FBE\u5230\u7BA1\u7406\u5C97\u4F4D\u9700\u6C42" : "\u5F53\u524D\u89C4\u6A21\u53EF\u7531\u8001\u677F\u76F4\u63A5\u7BA1\u7406"
        }
      ];
      return definitions.map(
        (item) => {
          const current = currentCounts[item.roleId] ?? 0;
          return {
            ...item,
            current,
            shortage: Math.max(
              0,
              item.recommended - current
            ),
            surplus: Math.max(
              0,
              current - item.recommended
            ),
            state: current < item.recommended ? "shortage" : current > item.recommended ? "surplus" : "balanced"
          };
        }
      );
    }
    getRecommendation(restaurantId2) {
      const employees = employeeSystem.listByRestaurant(
        restaurantId2
      );
      const currentCounts = countRoles(
        employees
      );
      const renovation = renovationSystem.getSummary(
        restaurantId2
      );
      const schedule = operatingScheduleSystem.get(
        restaurantId2
      );
      const operatingHours = schedule?.enabled ? schedule.closeHour - schedule.openHour : 10;
      const demand = this.getRecentDemand(
        restaurantId2
      );
      const seats = renovation.modifiers?.seats ?? 0;
      const context = {
        seats,
        kitchenStations: renovation.modifiers?.kitchenStations ?? 0,
        kitchenEfficiency: renovation.modifiers?.kitchenEfficiency ?? 1,
        serviceEfficiency: renovation.modifiers?.serviceEfficiency ?? 1,
        operatingHours,
        scheduleConfigured: Boolean(
          schedule?.enabled
        ),
        averageDailyOrders: demand.averageDailyOrders,
        averageChefSkill: this.getAverageEffectiveSkill(
          restaurantId2,
          "chef",
          "cooking"
        ),
        averageServerSkill: this.getAverageEffectiveSkill(
          restaurantId2,
          "server",
          "service"
        ),
        deliveryRatio: demand.deliveryRatio,
        deliveryAverageDaily: demand.deliveryOrders / demand.observedDays
      };
      const roles = this.calculatePlan(
        context,
        currentCounts
      );
      const recommendedTotal = roles.reduce(
        (sum, item) => sum + item.recommended,
        0
      );
      const currentTotal = employees.length;
      const totalShortage = roles.reduce(
        (sum, item) => sum + item.shortage,
        0
      );
      return {
        restaurantId: restaurantId2,
        basis: {
          seats,
          operatingHours,
          scheduleConfigured: context.scheduleConfigured,
          averageDailyOrders: demand.averageDailyOrders,
          estimatedPeakOrdersPerHour: seats > 0 ? Math.max(
            1,
            Math.ceil(
              Math.max(
                demand.averageDailyOrders,
                Math.ceil(
                  seats * Math.max(
                    0.75,
                    operatingHours / 12
                  )
                )
              ) / operatingHours * 1.9
            )
          ) : 0,
          averageChefSkill: context.averageChefSkill,
          averageServerSkill: context.averageServerSkill
        },
        roles,
        currentTotal,
        recommendedTotal,
        totalShortage,
        balanced: totalShortage === 0
      };
    }
  };
  var staffingRecommendationSystem = new StaffingRecommendationSystem();

  // src/ui/components/GameChromeSystem.js
  var MAIN_ICONS = Object.freeze({
    city: "city",
    restaurant: "store",
    operations: "operations",
    employees: "employees",
    more: "more"
  });
  var BACK_OVERRIDES = Object.freeze({
    properties: "city",
    property_detail: "properties",
    lease: "restaurant",
    renovation: "restaurant",
    renovation_construction: "renovation",
    "opening-setup": "restaurant",
    dishes: "operations",
    supply: "operations",
    analytics: "operations",
    finance: "operations",
    employee_roster: "employees",
    employee_training: "employee_roster",
    employee_promotion: "employee_roster",
    employee_detail: "employee_roster",
    employee_recruitment: "employee_roster",
    members: "more",
    chain: "more",
    settings: "more"
  });
  function clampBadge(value) {
    const number = Math.max(
      0,
      Math.floor(
        Number(value) || 0
      )
    );
    return Math.min(
      99,
      number
    );
  }
  function resolveMainRoot(pageId, registry = pageRegistry) {
    if (!pageId) {
      return null;
    }
    let currentId = pageId;
    const visited = /* @__PURE__ */ new Set();
    while (currentId && !visited.has(
      currentId
    )) {
      visited.add(
        currentId
      );
      let page;
      try {
        page = registry.get(
          currentId
        );
      } catch {
        return null;
      }
      if (page.nav === "main") {
        return page.id;
      }
      currentId = page.parent;
    }
    return null;
  }
  function buildNavigationItems(mainPages, activeRoot, badges = {}) {
    return mainPages.map(
      (page) => ({
        id: page.id,
        target: page.id,
        label: page.title,
        title: page.title,
        icon: MAIN_ICONS[page.id] ?? page.id,
        active: page.id === activeRoot,
        badge: clampBadge(
          badges[page.id] ?? 0
        )
      })
    );
  }
  var GameChromeSystem = class {
    getBadges(restaurantId2) {
      const badges = {
        city: 0,
        restaurant: 0,
        operations: 0,
        employees: 0,
        more: 0
      };
      if (!restaurantId2) {
        return badges;
      }
      try {
        const opening = openingFlowSystem.getStatus(
          restaurantId2
        );
        if (!opening.hasOpened) {
          if (!opening.lease) {
            badges.city += 1;
          }
          if (!opening.renovation.active) {
            badges.restaurant += 1;
          }
          if (!opening.permits.complete) {
            badges.restaurant += 1;
          }
          if (opening.activeMenu.length === 0) {
            badges.operations += 1;
          }
          if (opening.activeMenu.length > 0 && !opening.starterStock.complete) {
            badges.operations += Math.max(
              1,
              opening.starterStock.items.filter(
                (item) => !item.ready
              ).length
            );
          }
          if (opening.availableChefs.length === 0) {
            badges.employees += 1;
          }
        }
      } catch {
      }
      try {
        const staffing = staffingRecommendationSystem.getRecommendation(
          restaurantId2
        );
        badges.employees += staffing.totalShortage;
      } catch {
      }
      for (const key of Object.keys(
        badges
      )) {
        badges[key] = clampBadge(
          badges[key]
        );
      }
      return badges;
    }
    getNavigation({
      restaurantId: restaurantId2 = null,
      activePageId = null
    } = {}) {
      const root2 = resolveMainRoot(
        activePageId
      ) ?? activePageId;
      return buildNavigationItems(
        pageRegistry.mainNavigation(),
        root2,
        this.getBadges(
          restaurantId2
        )
      );
    }
    getBackTarget(pageId) {
      if (BACK_OVERRIDES[pageId]) {
        return BACK_OVERRIDES[pageId];
      }
      try {
        return pageRegistry.get(
          pageId
        ).parent ?? null;
      } catch {
        return null;
      }
    }
    getMainRoot(pageId) {
      return resolveMainRoot(
        pageId
      );
    }
  };
  var gameChromeSystem = new GameChromeSystem();

  // src/ui/pages/city/CityMapView.js
  function escapeHtml2(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money2(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function scoreClass(value) {
    const score = Number(value) || 0;
    if (score >= 80) {
      return "is-high";
    }
    if (score >= 60) {
      return "is-good";
    }
    if (score >= 40) {
      return "is-normal";
    }
    return "is-low";
  }
  function renderImageSlot(id, label, className = "") {
    return `
    <div
      class="
        city-image-slot
        ${className}
      "
      data-image-slot="${escapeHtml2(
      id
    )}"
    >

      <div class="city-image-slot__placeholder">

        <span>
          \u25A6
        </span>

        <strong>
          ${escapeHtml2(
      label
    )}
        </strong>

        <small>
          \u56FE\u7247\u69FD\u4F4D
        </small>

      </div>

    </div>
  `;
  }
  var CityMapView = class {
    constructor({
      root: root2,
      restaurantId: restaurantId2 = null,
      pageSystem = cityMapDashboardSystem,
      onNavigate = null
    }) {
      if (!root2) {
        throw new Error(
          "CityMapView requires a root element"
        );
      }
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.selectedDistrictId = null;
      this.page = null;
      this.boundClick = (event) => this.handleClick(
        event
      );
    }
    mount() {
      this.refresh();
      this.root.addEventListener(
        "click",
        this.boundClick
      );
      return this;
    }
    destroy() {
      this.root.removeEventListener(
        "click",
        this.boundClick
      );
      this.root.innerHTML = "";
    }
    refresh() {
      this.page = this.pageSystem.getPage({
        restaurantId: this.restaurantId,
        selectedDistrictId: this.selectedDistrictId
      });
      this.selectedDistrictId = this.page.map.selectedDistrictId;
      this.render();
      return this.page;
    }
    renderTopbar(page) {
      return renderGameTopBar(
        page.topBar,
        {
          subtitle: "\u57CE\u5E02\u9009\u5740\u4E2D\u5FC3"
        }
      );
    }
    renderNotice(page) {
      const current = page.noticeTicker.current;
      return `
      <button
        type="button"
        class="
          city-notice
          city-notice--${current?.type ?? "info"}
        "
        ${current?.action ? `data-action="navigate" data-page-id="${escapeHtml2(
        current.action
      )}"` : ""}
      >

        <b>
          \u57CE\u5E02\u5FEB\u62A5
        </b>

        <strong>
          ${escapeHtml2(
        current?.title ?? "\u5E02\u573A\u52A8\u6001"
      )}
        </strong>

        <span>
          ${escapeHtml2(
        current?.message ?? "\u5F53\u524D\u6682\u65E0\u65B0\u7684\u57CE\u5E02\u7ECF\u8425\u4FE1\u606F"
      )}
        </span>

      </button>
    `;
    }
    renderTitle() {
      return `
      <section class="city-page-title">

        <div>
          <strong>
            \u5546\u5708\u4E0E\u623F\u6E90
          </strong>

          <span>
            \u5148\u770B\u57CE\u5E02\uFF0C\u518D\u51B3\u5B9A\u628A\u7B2C\u4E00\u5BB6\u5E97\u5F00\u5728\u54EA\u91CC
          </span>
        </div>

        <button
          type="button"
          data-action="navigate"
          data-page-id="properties"
        >
          \u623F\u6E90\u5217\u8868
        </button>

      </section>
    `;
    }
    renderSummary(page) {
      const summary = page.citySummary;
      return `
      <section class="city-summary">

        <article>
          <span>
            \u5F00\u653E\u5546\u5708
          </span>

          <strong>
            ${summary.districtCount}
          </strong>

          <small>
            \u4E2A
          </small>
        </article>


        <article>
          <span>
            \u53EF\u79DF\u623F\u6E90
          </span>

          <strong>
            ${summary.propertyCount}
          </strong>

          <small>
            \u5957
          </small>
        </article>


        <article>
          <span>
            \u5E73\u5747\u5BA2\u6D41
          </span>

          <strong>
            ${summary.averageTraffic}
          </strong>

          <small>
            /100
          </small>
        </article>


        <article>
          <span>
            \u5E73\u5747\u6D88\u8D39\u529B
          </span>

          <strong>
            ${summary.averageSpending}
          </strong>

          <small>
            /100
          </small>
        </article>


        <article>
          <span>
            \u5E73\u5747\u7ADE\u4E89
          </span>

          <strong>
            ${summary.averageCompetition}
          </strong>

          <small>
            /100
          </small>
        </article>

      </section>
    `;
    }
    renderMap(page) {
      return `
      <section class="city-map-panel">

        <div class="city-map-panel__canvas">

          ${renderImageSlot(
        "city-main-map",
        "\u57CE\u5E02\u5730\u56FE\u5E95\u56FE",
        "city-image-slot--map"
      )}


          <div class="city-map-pins">

            ${page.map.districts.map(
        (district) => `
                    <button
                      type="button"
                      class="
                        city-map-pin
                        ${page.map.selectedDistrictId === district.id ? "is-active" : ""}
                      "
                      data-action="select-district"
                      data-district-id="${escapeHtml2(
          district.id
        )}"
                      style="
                        left:${district.position.x}%;
                        top:${district.position.y}%;
                      "
                    >

                      <span class="city-map-pin__dot">
                        \u25CF
                      </span>

                      <strong>
                        ${escapeHtml2(
          district.name
        )}
                      </strong>

                      <small>
                        ${district.propertyCount}\u5957
                      </small>

                    </button>
                  `
      ).join("")}

          </div>


          <div class="city-map-legend">

            <span>
              <i class="is-active"></i>
              \u5F53\u524D\u5546\u5708
            </span>

            <span>
              <i></i>
              \u53EF\u9009\u5546\u5708
            </span>

          </div>

        </div>


        ${this.renderDistrictDetail(
        page.selectedDistrict
      )}

      </section>
    `;
    }
    renderDistrictDetail(district) {
      if (!district) {
        return `
        <aside class="city-district-detail">

          <div class="city-district-empty">
            \u5F53\u524D\u6CA1\u6709\u53EF\u7528\u5546\u5708
          </div>

        </aside>
      `;
      }
      return `
      <aside class="city-district-detail">

        <header>

          <div>
            <span>
              \u5F53\u524D\u5546\u5708
            </span>

            <strong>
              ${escapeHtml2(
        district.name
      )}
            </strong>
          </div>

          <b>
            ${district.propertyCount}\u5957
          </b>

        </header>


        <section class="city-district-scores">

          <article
            class="${scoreClass(
        district.trafficIndex
      )}"
          >

            <span>
              \u5BA2\u6D41
            </span>

            <strong>
              ${district.trafficIndex}
            </strong>

            <div>
              <i
                style="
                  width:${district.trafficIndex}%;
                "
              ></i>
            </div>

          </article>


          <article
            class="${scoreClass(
        district.spendingPower
      )}"
          >

            <span>
              \u6D88\u8D39\u529B
            </span>

            <strong>
              ${district.spendingPower}
            </strong>

            <div>
              <i
                style="
                  width:${district.spendingPower}%;
                "
              ></i>
            </div>

          </article>


          <article
            class="${scoreClass(
        district.competition
      )}"
          >

            <span>
              \u7ADE\u4E89
            </span>

            <strong>
              ${district.competition}
            </strong>

            <div>
              <i
                style="
                  width:${district.competition}%;
                "
              ></i>
            </div>

          </article>

        </section>


        <section class="city-district-economy">

          <article>
            <span>
              \u5E73\u5747\u623F\u79DF
            </span>

            <strong>
              ${district.averageRent > 0 ? money2(
        district.averageRent
      ) : "--"}
            </strong>
          </article>

          <article>
            <span>
              \u53EF\u79DF\u623F\u6E90
            </span>

            <strong>
              ${district.propertyCount}\u5957
            </strong>
          </article>

        </section>


        <section class="city-customer-mix">

          <header>
            \u5BA2\u7FA4\u7ED3\u6784
          </header>

          ${district.customerMix.length ? district.customerMix.slice(
        0,
        4
      ).map(
        (item) => `
                      <article>

                        <span>
                          ${escapeHtml2(
          item.id
        )}
                        </span>

                        <div>
                          <i
                            style="
                              width:${item.percent}%;
                            "
                          ></i>
                        </div>

                        <strong>
                          ${item.percent}%
                        </strong>

                      </article>
                    `
      ).join("") : `
                <div class="city-customer-mix__empty">
                  \u6682\u65E0\u5BA2\u7FA4\u7EC6\u5206\u6570\u636E
                </div>
              `}

        </section>


        ${district.recommendedPropertyId ? `
              <section class="city-district-recommend">

                <span>
                  \u63A8\u8350\u5173\u6CE8
                </span>

                <strong>
                  ${escapeHtml2(
        district.recommendedPropertyName
      )}
                </strong>

              </section>
            ` : ""}


        <button
          type="button"
          class="city-district-main-action"
          data-action="open-district-properties"
          data-district-id="${escapeHtml2(
        district.id
      )}"
        >
          \u67E5\u770B\u672C\u5546\u5708\u623F\u6E90
        </button>

      </aside>
    `;
    }
    renderFilters() {
      return `
      <section class="city-filter-panel">

        <header>
          <strong>
            \u5FEB\u901F\u7B5B\u9009
          </strong>

          <span>
            \u623F\u6E90\u9762\u79EF\u8303\u56F4 30\u201310000\u33A1
          </span>
        </header>


        <div class="city-filter-grid">

          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            <span>
              \u9762\u79EF
            </span>

            <strong>
              30\u2013150\u33A1
            </strong>

            <small>
              \u5C0F\u5E97\u8D77\u6B65
            </small>
          </button>


          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            <span>
              \u9762\u79EF
            </span>

            <strong>
              151\u2013500\u33A1
            </strong>

            <small>
              \u6807\u51C6\u9910\u5385
            </small>
          </button>


          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            <span>
              \u9762\u79EF
            </span>

            <strong>
              500\u33A1\u4EE5\u4E0A
            </strong>

            <small>
              \u5927\u578B\u95E8\u5E97
            </small>
          </button>


          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            <span>
              \u6761\u4EF6
            </span>

            <strong>
              \u53EF\u505A\u9910\u996E
            </strong>

            <small>
              \u4F18\u5148\u7B5B\u9009
            </small>
          </button>


          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            <span>
              \u6761\u4EF6
            </span>

            <strong>
              \u53EF\u6392\u70DF
            </strong>

            <small>
              \u70ED\u53A8\u5FC5\u5907
            </small>
          </button>

        </div>

      </section>
    `;
    }
    renderRecommended(page) {
      return `
      <section class="city-property-recommend">

        <header>

          <div>
            <strong>
              \u4ECA\u65E5\u63A8\u8350\u623F\u6E90
            </strong>

            <span>
              \u6839\u636E\u623F\u6E90\u54C1\u8D28\u3001\u79DF\u91D1\u548C\u5546\u5708\u6307\u6807\u52A8\u6001\u6392\u5E8F
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="properties"
          >
            \u5168\u90E8\u623F\u6E90 \u203A
          </button>

        </header>


        <div class="city-property-grid">

          ${page.recommendedProperties.length ? page.recommendedProperties.map(
        (property) => `
                      <article class="city-property-card">

                        ${renderImageSlot(
          property.imageSlot,
          "\u623F\u6E90\u5B9E\u666F",
          "city-image-slot--property"
        )}


                        <div class="city-property-card__body">

                          <header>

                            <div>
                              <strong>
                                ${escapeHtml2(
          property.name
        )}
                              </strong>

                              <span>
                                ${escapeHtml2(
          property.districtName
        )}
                              </span>
                            </div>

                            ${property.qualityScore !== null && property.qualityScore !== void 0 ? `
                                  <b>
                                    \u2605
                                    ${property.qualityScore}
                                  </b>
                                ` : ""}

                          </header>


                          <section class="city-property-main-info">

                            <article>
                              <span>
                                \u9762\u79EF
                              </span>

                              <strong>
                                ${property.area}\u33A1
                              </strong>
                            </article>

                            <article>
                              <span>
                                \u6708\u79DF
                              </span>

                              <strong>
                                ${money2(
          property.monthlyRent
        )}
                              </strong>
                            </article>

                            <article>
                              <span>
                                \u5BA2\u6D41
                              </span>

                              <strong>
                                ${property.trafficIndex}
                              </strong>
                            </article>

                          </section>


                          <div class="city-property-tags">

                            ${property.foodServiceAllowed ? `
                                  <span class="is-good">
                                    \u53EF\u9910\u996E
                                  </span>
                                ` : `
                                  <span class="is-bad">
                                    \u9910\u996E\u53D7\u9650
                                  </span>
                                `}

                            ${property.exhaustAllowed ? `
                                  <span class="is-good">
                                    \u53EF\u6392\u70DF
                                  </span>
                                ` : `
                                  <span class="is-bad">
                                    \u4E0D\u53EF\u6392\u70DF
                                  </span>
                                `}

                            ${property.affordable ? `
                                  <span class="is-gold">
                                    \u8D44\u91D1\u53EF\u627F\u62C5
                                  </span>
                                ` : `
                                  <span class="is-bad">
                                    \u9996\u4ED8\u4E0D\u8DB3
                                  </span>
                                `}

                          </div>


                          <button
                            type="button"
                            data-action="open-property"
                            data-property-id="${escapeHtml2(
          property.id
        )}"
                          >
                            \u67E5\u770B\u623F\u6E90\u8BE6\u60C5
                          </button>

                        </div>

                      </article>
                    `
      ).join("") : `
                <div class="city-property-empty">
                  \u5F53\u524D\u6CA1\u6709\u63A8\u8350\u623F\u6E90
                </div>
              `}

        </div>

      </section>
    `;
    }
    renderBottomNav(page) {
      return renderBottomNavigation(
        gameChromeSystem.getNavigation({
          restaurantId: this.restaurantId,
          activePageId: "city"
        })
      );
    }
    renderMarkup(page) {
      return `
      <main class="city-map-game">

        ${this.renderTopbar(
        page
      )}

        ${this.renderNotice(
        page
      )}

        ${this.renderTitle()}

        ${this.renderSummary(
        page
      )}

        ${this.renderMap(
        page
      )}

        ${this.renderFilters()}

        ${this.renderRecommended(
        page
      )}

        ${this.renderBottomNav(
        page
      )}

      </main>
    `;
    }
    render() {
      if (!this.page) {
        return;
      }
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
    }
    handleClick(event) {
      const target = event.target.closest?.(
        "[data-action]"
      );
      if (!target || !this.root.contains(
        target
      )) {
        return;
      }
      const action = target.dataset.action;
      if (action === "select-district") {
        this.selectedDistrictId = target.dataset.districtId;
        this.refresh();
        return;
      }
      if (action === "open-district-properties") {
        const districtId = target.dataset.districtId;
        this.onNavigate?.(
          "properties",
          this.restaurantId,
          {
            districtId
          }
        );
        return;
      }
      if (action === "open-property") {
        this.onNavigate?.(
          "property_detail",
          this.restaurantId,
          {
            propertyId: target.dataset.propertyId
          }
        );
        return;
      }
      if (action === "navigate") {
        const pageId = target.dataset.pageId;
        if (pageId && typeof this.onNavigate === "function") {
          this.onNavigate(
            pageId,
            this.restaurantId
          );
        }
      }
    }
  };

  // src/ui/pages/city/PropertyDetailDashboardSystem.js
  function safeBalance4(restaurantId2) {
    if (!restaurantId2) {
      return null;
    }
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return null;
    }
  }
  function safeRestaurant2(restaurantId2) {
    if (!restaurantId2) {
      return null;
    }
    try {
      return restaurantSystem.get(
        restaurantId2
      );
    } catch {
      return null;
    }
  }
  function textOf(item) {
    if (!item || typeof item !== "object") {
      return "";
    }
    return [
      item.type,
      item.kind,
      item.name,
      item.label,
      item.category,
      item.subtype
    ].filter(Boolean).join(" ").toLowerCase();
  }
  function countMatch(list, patterns) {
    return list.filter(
      (item) => {
        const text = textOf(item);
        return patterns.some(
          (pattern) => text.includes(
            pattern
          )
        );
      }
    ).length;
  }
  function clamp10(value, min = 0, max = 100) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  var PropertyDetailDashboardSystem = class {
    getStructureSummary(layout) {
      const floors = layout?.floors ?? [];
      const entrances = floors.flatMap(
        (floor) => floor.entrances ?? []
      );
      const windows = floors.flatMap(
        (floor) => floor.windows ?? []
      );
      const columns = floors.flatMap(
        (floor) => floor.columns ?? []
      );
      const fixedStructures = floors.flatMap(
        (floor) => floor.fixedStructures ?? []
      );
      const utilityPoints = floors.flatMap(
        (floor) => floor.utilityPoints ?? []
      );
      return {
        floorCount: floors.length,
        entrances: entrances.length,
        windows: windows.length,
        columns: columns.length,
        fixedStructures: fixedStructures.length,
        utilityPoints: utilityPoints.length,
        waterPoints: countMatch(
          utilityPoints,
          [
            "water",
            "\u7ED9\u6C34",
            "\u6392\u6C34",
            "\u6C34\u70B9"
          ]
        ),
        powerPoints: countMatch(
          utilityPoints,
          [
            "power",
            "electric",
            "electricity",
            "\u7535\u529B",
            "\u7535\u6E90",
            "\u5F3A\u7535"
          ]
        ),
        gasPoints: countMatch(
          utilityPoints,
          [
            "gas",
            "\u71C3\u6C14",
            "\u7164\u6C14"
          ]
        ),
        exhaustPoints: countMatch(
          utilityPoints,
          [
            "exhaust",
            "\u70DF\u9053",
            "\u6392\u70DF"
          ]
        ),
        restroomCount: countMatch(
          [
            ...fixedStructures,
            ...utilityPoints
          ],
          [
            "restroom",
            "toilet",
            "wc",
            "bathroom",
            "\u536B\u751F\u95F4",
            "\u5395\u6240"
          ]
        ),
        stairs: countMatch(
          fixedStructures,
          [
            "stair",
            "stairs",
            "\u697C\u68AF"
          ]
        ),
        elevators: countMatch(
          fixedStructures,
          [
            "elevator",
            "lift",
            "\u7535\u68AF"
          ]
        )
      };
    }
    getAssessment(detail) {
      const property = detail.property;
      const district = detail.district;
      const traffic = district?.trafficIndex ?? 50;
      const spending = district?.spendingPower ?? 50;
      const competition = district?.competition ?? 50;
      const frontageBonus = Math.min(
        8,
        (property.frontageMeters ?? 0) * 0.7
      );
      const parkingBonus = Math.min(
        5,
        (property.parkingSpaces ?? 0) * 0.7
      );
      const licenseBonus = property.foodServiceAllowed ? 8 : 0;
      const exhaustBonus = property.exhaustAllowed ? 7 : 0;
      const score = clamp10(
        Math.round(
          traffic * 0.26 + spending * 0.22 + (100 - competition) * 0.18 + frontageBonus + parkingBonus + licenseBonus + exhaustBonus + 8
        )
      );
      const usableArea = property.usableArea ?? property.area ?? 1;
      const rentPerSqm = usableArea > 0 ? Number(
        (property.monthlyRent / usableArea).toFixed(1)
      ) : null;
      let level = "\u4E00\u822C";
      if (score >= 82) {
        level = "\u4F18\u79C0";
      } else if (score >= 70) {
        level = "\u826F\u597D";
      } else if (score >= 58) {
        level = "\u53EF\u7ECF\u8425";
      }
      return {
        score,
        level,
        traffic,
        spending,
        competition,
        rentPerSqm
      };
    }
    getRisks(detail) {
      const property = detail.property;
      const district = detail.district;
      const risks = [];
      if (property.foodServiceAllowed === false) {
        risks.push({
          id: "food_service",
          level: "danger",
          title: "\u9910\u996E\u8BB8\u53EF\u53D7\u9650",
          description: "\u5F53\u524D\u623F\u6E90\u4E0D\u5141\u8BB8\u76F4\u63A5\u5F00\u5C55\u9910\u996E\u7ECF\u8425\u3002"
        });
      }
      if (property.exhaustAllowed === false) {
        risks.push({
          id: "exhaust",
          level: "danger",
          title: "\u6392\u70DF\u6761\u4EF6\u4E0D\u8DB3",
          description: "\u70ED\u53A8\u3001\u7092\u5236\u7B49\u54C1\u7C7B\u4F1A\u53D7\u5230\u660E\u663E\u9650\u5236\u3002"
        });
      }
      if ((district?.competition ?? 0) >= 75) {
        risks.push({
          id: "competition",
          level: "warning",
          title: "\u5546\u5708\u7ADE\u4E89\u8F83\u9AD8",
          description: `\u5F53\u524D\u7ADE\u4E89\u6307\u6570${district.competition}/100\u3002`
        });
      }
      if (Number.isInteger(
        property.competition?.daysUntilPossibleClaim
      ) && property.competition.daysUntilPossibleClaim <= 3) {
        risks.push({
          id: "claim",
          level: "danger",
          title: "\u5B58\u5728\u62A2\u79DF\u98CE\u9669",
          description: `\u9884\u8BA1${property.competition.daysUntilPossibleClaim}\u5929\u5185\u53EF\u80FD\u88AB\u5176\u4ED6\u7ECF\u8425\u8005\u7B7E\u8D70\u3002`
        });
      }
      if (property.quote?.affordable === false) {
        risks.push({
          id: "funds",
          level: "danger",
          title: "\u7B7E\u7EA6\u8D44\u91D1\u4E0D\u8DB3",
          description: "\u5F53\u524D\u73B0\u91D1\u65E0\u6CD5\u8986\u76D6\u7B7E\u7EA6\u9996\u4ED8\u3002"
        });
      }
      if (Number.isFinite(
        property.frontageMeters
      ) && property.frontageMeters < 4) {
        risks.push({
          id: "frontage",
          level: "warning",
          title: "\u95E8\u9762\u5BBD\u5EA6\u504F\u5C0F",
          description: `\u5F53\u524D\u95E8\u9762\u7EA6${property.frontageMeters}\u7C73\u3002`
        });
      }
      if (Number.isInteger(
        property.listing?.remainingDays
      ) && property.listing.remainingDays <= 3) {
        risks.push({
          id: "expiry",
          level: "warning",
          title: "\u623F\u6E90\u5373\u5C06\u4E0B\u67B6",
          description: `\u6302\u724C\u5269\u4F59${property.listing.remainingDays}\u5929\u3002`
        });
      }
      if (risks.length === 0) {
        risks.push({
          id: "normal",
          level: "success",
          title: "\u6682\u672A\u53D1\u73B0\u660E\u663E\u786C\u4F24",
          description: "\u4ECD\u9700\u7ED3\u5408\u54C1\u7C7B\u3001\u88C5\u4FEE\u6210\u672C\u548C\u4F9B\u5E94\u94FE\u5224\u65AD\u3002"
        });
      }
      return risks;
    }
    getFacilities(detail, structures) {
      const property = detail.property;
      const rules = detail.suitability.renovationRules ?? {};
      return [
        {
          id: "food",
          label: "\u9910\u996E\u8BB8\u53EF",
          value: property.foodServiceAllowed ? "\u5141\u8BB8" : "\u53D7\u9650",
          state: property.foodServiceAllowed ? "good" : "bad"
        },
        {
          id: "exhaust",
          label: "\u6392\u70DF\u8BB8\u53EF",
          value: property.exhaustAllowed ? "\u5141\u8BB8" : "\u53D7\u9650",
          state: property.exhaustAllowed ? "good" : "bad"
        },
        {
          id: "water",
          label: "\u6C34\u70B9",
          value: `${structures.waterPoints}\u4E2A`,
          state: structures.waterPoints > 0 ? "good" : "neutral"
        },
        {
          id: "power",
          label: "\u7535\u529B\u70B9\u4F4D",
          value: `${structures.powerPoints}\u4E2A`,
          state: structures.powerPoints > 0 ? "good" : "neutral"
        },
        {
          id: "gas",
          label: "\u71C3\u6C14\u70B9\u4F4D",
          value: structures.gasPoints > 0 ? `${structures.gasPoints}\u4E2A` : "\u672A\u8BB0\u5F55",
          state: structures.gasPoints > 0 ? "good" : "neutral"
        },
        {
          id: "restroom",
          label: "\u536B\u751F\u95F4",
          value: structures.restroomCount > 0 ? `${structures.restroomCount}\u5904` : "\u672A\u8BB0\u5F55",
          state: structures.restroomCount > 0 ? "good" : "neutral"
        },
        {
          id: "partition",
          label: "\u9694\u65AD\u6539\u9020",
          value: rules.allowPartitions === false ? "\u4E0D\u5141\u8BB8" : "\u5141\u8BB8",
          state: rules.allowPartitions === false ? "warning" : "good"
        },
        {
          id: "open_flame",
          label: "\u660E\u706B\u6761\u4EF6",
          value: rules.allowOpenFlame === true ? "\u5141\u8BB8" : rules.allowOpenFlame === false ? "\u7981\u6B62" : "\u672A\u8BB0\u5F55",
          state: rules.allowOpenFlame === true ? "good" : rules.allowOpenFlame === false ? "bad" : "neutral"
        }
      ];
    }
    getPage(propertyId, restaurantId2 = null, months = 12, offerId = null) {
      const detail = cityPropertyPageSystem.getPropertyDetail(
        propertyId,
        restaurantId2,
        months,
        offerId
      );
      const restaurant = safeRestaurant2(
        restaurantId2
      );
      const balance = safeBalance4(
        restaurantId2
      );
      const time = gameState.getSection(
        "time"
      );
      const structures = this.getStructureSummary(
        detail.layout
      );
      const assessment = this.getAssessment(
        detail
      );
      const risks = this.getRisks(
        detail
      );
      const facilities = this.getFacilities(
        detail,
        structures
      );
      return {
        pageId: "property_detail",
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          level: restaurant.level,
          reputation: restaurant.reputation
        } : null,
        topBar: {
          restaurantName: restaurant?.name ?? "\u57CE\u5E02\u9910\u996E\u521B\u4E1A",
          balance,
          level: restaurant?.level ?? 1,
          reputation: restaurant?.reputation ?? 0,
          day: time?.day ?? 1,
          hour: time?.hour ?? 0,
          minute: time?.minute ?? 0
        },
        property: detail.property,
        district: detail.district,
        landlord: detail.landlord,
        leaseTerms: detail.leaseTerms,
        quote: detail.quote,
        activeOffer: detail.activeOffer,
        leaseState: detail.leaseState,
        layout: detail.layout,
        structures,
        facilities,
        assessment,
        risks,
        media: {
          defaultTab: "exterior",
          tabs: [
            {
              id: "exterior",
              label: "\u95E8\u5934\u5B9E\u62CD",
              slot: `property-exterior-${propertyId}`
            },
            {
              id: "street",
              label: "\u8857\u666F",
              slot: `property-street-${propertyId}`
            },
            {
              id: "surroundings",
              label: "\u5468\u8FB9\u73AF\u5883",
              slot: `property-surroundings-${propertyId}`
            },
            {
              id: "floorplan",
              label: "\u6237\u578B\u5E73\u9762",
              slot: `property-floorplan-${propertyId}`
            }
          ]
        },
        floorTabs: (detail.layout?.floors ?? []).map(
          (floor) => ({
            id: floor.id,
            label: floor.label,
            area: floor.area,
            usableArea: floor.usableArea,
            imageSlot: `property-floorplan-overlay-${floor.id}`
          })
        ),
        imageSlots: [
          `property-exterior-${propertyId}`,
          `property-street-${propertyId}`,
          `property-surroundings-${propertyId}`,
          `property-floorplan-${propertyId}`,
          ...(detail.layout?.floors ?? []).map(
            (floor) => `property-floorplan-overlay-${floor.id}`
          )
        ],
        nextPage: detail.nextAfterLease
      };
    }
    negotiate({
      restaurantId: restaurantId2,
      propertyId,
      months,
      requestedRent,
      requestedRentFreeDays
    }) {
      return cityPropertyPageSystem.negotiateLease({
        restaurantId: restaurantId2,
        propertyId,
        months,
        requestedRent,
        requestedRentFreeDays
      });
    }
    acceptCounter(offerId) {
      return cityPropertyPageSystem.acceptCounter(
        offerId
      );
    }
    signLease({
      restaurantId: restaurantId2,
      propertyId,
      months,
      offerId = null
    }) {
      return cityPropertyPageSystem.signLease({
        restaurantId: restaurantId2,
        propertyId,
        months,
        offerId
      });
    }
  };
  var propertyDetailDashboardSystem = new PropertyDetailDashboardSystem();

  // src/ui/pages/city/PropertyDetailView.js
  function escapeHtml3(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money3(value) {
    if (value === null || value === void 0) {
      return "--";
    }
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function renderSlot(id, label) {
    return `
    <div
      class="property-media-slot"
      data-image-slot="${escapeHtml3(
      id
    )}"
    >
      <div>
        <span>\u25A3</span>

        <strong>
          ${escapeHtml3(
      label
    )}
        </strong>

        <small>
          \u56FE\u7247\u69FD\u4F4D
        </small>
      </div>
    </div>
  `;
  }
  function pointsString(floor) {
    const polygon = floor?.polygon ?? [];
    if (polygon.length < 3) {
      return "";
    }
    return polygon.map(
      (point) => `${Number(point.x) || 0},${Number(point.y) || 0}`
    ).join(" ");
  }
  function markerCircle(item, className) {
    if (!Number.isFinite(
      item?.x
    ) || !Number.isFinite(
      item?.y
    )) {
      return "";
    }
    return `
    <circle
      class="${className}"
      cx="${item.x}"
      cy="${item.y}"
      r="0.38"
    ></circle>
  `;
  }
  var PropertyDetailView = class {
    constructor({
      root: root2,
      restaurantId: restaurantId2 = null,
      propertyId,
      pageSystem = propertyDetailDashboardSystem,
      onNavigate = null
    }) {
      if (!root2) {
        throw new Error(
          "PropertyDetailView requires a root element"
        );
      }
      if (!propertyId) {
        throw new Error(
          "PropertyDetailView requires propertyId"
        );
      }
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.propertyId = propertyId;
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.months = 12;
      this.offerId = null;
      this.mediaTab = "exterior";
      this.floorId = null;
      this.message = "";
      this.page = null;
      this.boundClick = (event) => this.handleClick(
        event
      );
    }
    mount() {
      this.root.addEventListener(
        "click",
        this.boundClick
      );
      this.refresh();
      return this;
    }
    destroy() {
      this.root.removeEventListener(
        "click",
        this.boundClick
      );
      this.root.innerHTML = "";
    }
    refresh() {
      this.page = this.pageSystem.getPage(
        this.propertyId,
        this.restaurantId,
        this.months,
        this.offerId
      );
      if (!this.floorId) {
        this.floorId = this.page.layout?.floors?.[0]?.id ?? null;
      }
      this.render();
      return this.page;
    }
    getActiveFloor() {
      return this.page.layout?.floors?.find(
        (floor) => floor.id === this.floorId
      ) ?? this.page.layout?.floors?.[0] ?? null;
    }
    renderTopbar(page) {
      const top = page.topBar;
      return `
      <header class="property-detail-hud">

        <div>
          <strong>
            ${escapeHtml3(
        top.restaurantName
      )}
          </strong>

          <span>
            \u623F\u6E90\u8003\u5BDF\u4E2D\u5FC3
          </span>
        </div>

        <section>
          <span>
            \u7B2C${top.day}\u5929
          </span>

          <strong>
            ${String(
        top.hour
      ).padStart(
        2,
        "0"
      )}:${String(
        top.minute
      ).padStart(
        2,
        "0"
      )}
          </strong>
        </section>

        <section>
          <span>
            \u5F53\u524D\u8D44\u91D1
          </span>

          <strong>
            ${money3(
        top.balance
      )}
          </strong>
        </section>

        <section>
          <span>
            \u95E8\u5E97\u7B49\u7EA7
          </span>

          <strong>
            Lv.${top.level}
          </strong>

          <small>
            \u58F0\u671B${top.reputation}
          </small>
        </section>

      </header>
    `;
    }
    renderTitle(page) {
      return `
      <section class="property-detail-title">

        <button
          type="button"
          data-action="back"
        >
          \u2039 \u8FD4\u56DE\u623F\u6E90
        </button>

        <div>
          <span>
            ${escapeHtml3(
        page.property.districtName
      )}
          </span>

          <strong>
            ${escapeHtml3(
        page.property.name
      )}
          </strong>
        </div>

        <b>
          ${page.property.qualityScore !== null && page.property.qualityScore !== void 0 ? `\u2605 ${page.property.qualityScore}` : "\u623F\u6E90\u8003\u5BDF"}
        </b>

      </section>
    `;
    }
    renderMedia(page) {
      const active = page.media.tabs.find(
        (item) => item.id === this.mediaTab
      ) ?? page.media.tabs[0];
      return `
      <section class="property-media-panel">

        <nav class="property-media-tabs">

          ${page.media.tabs.map(
        (tab) => `
                  <button
                    type="button"
                    class="${tab.id === this.mediaTab ? "is-active" : ""}"
                    data-action="media"
                    data-media-id="${tab.id}"
                  >
                    ${escapeHtml3(
          tab.label
        )}
                  </button>
                `
      ).join("")}

        </nav>


        ${this.mediaTab === "floorplan" ? this.renderFloorplan(
        page
      ) : renderSlot(
        active.slot,
        active.label
      )}

      </section>
    `;
    }
    renderFloorplan(page) {
      const floor = this.getActiveFloor();
      if (!floor) {
        return `
        <div class="property-floor-empty">
          \u5F53\u524D\u623F\u6E90\u6CA1\u6709\u6237\u578B\u6570\u636E
        </div>
      `;
      }
      const width = Math.max(
        1,
        floor.width ?? 10
      );
      const height = Math.max(
        1,
        floor.height ?? 10
      );
      return `
      <section class="property-floor-area">

        <nav class="property-floor-tabs">

          ${page.floorTabs.map(
        (item) => `
                  <button
                    type="button"
                    class="${item.id === floor.id ? "is-active" : ""}"
                    data-action="floor"
                    data-floor-id="${escapeHtml3(
          item.id
        )}"
                  >
                    <strong>
                      ${escapeHtml3(
          item.label
        )}
                    </strong>

                    <span>
                      ${item.usableArea}\u33A1
                    </span>
                  </button>
                `
      ).join("")}

        </nav>


        <div class="property-floor-svg-wrap">

          <svg
            class="property-floor-svg"
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="xMidYMid meet"
          >

            <polygon
              class="property-floor-shell"
              points="${pointsString(
        floor
      )}"
            ></polygon>

            ${(floor.windows ?? []).map(
        (item) => markerCircle(
          item,
          "property-floor-window"
        )
      ).join("")}

            ${(floor.entrances ?? []).map(
        (item) => markerCircle(
          item,
          "property-floor-entrance"
        )
      ).join("")}

            ${(floor.columns ?? []).map(
        (item) => markerCircle(
          item,
          "property-floor-column"
        )
      ).join("")}

            ${(floor.utilityPoints ?? []).map(
        (item) => markerCircle(
          item,
          "property-floor-utility"
        )
      ).join("")}

          </svg>


          <div
            class="property-floor-overlay-slot"
            data-image-slot="property-floorplan-overlay-${escapeHtml3(
        floor.id
      )}"
          >
            \u6237\u578B\u88C5\u9970\u8986\u76D6\u5C42\u69FD\u4F4D
          </div>

        </div>


        <div class="property-floor-legend">

          <span class="is-entry">
            \u25CF \u5165\u53E3
          </span>

          <span class="is-window">
            \u25CF \u7A97\u6237
          </span>

          <span class="is-column">
            \u25CF \u67F1\u4F53
          </span>

          <span class="is-utility">
            \u25CF \u6C34\u7535\u71C3\u6C14\u70B9\u4F4D
          </span>

        </div>

      </section>
    `;
    }
    renderBasicInfo(page) {
      const p = page.property;
      return `
      <section class="property-info-grid">

        <article>
          <span>
            \u5EFA\u7B51\u9762\u79EF
          </span>
          <strong>
            ${p.area}\u33A1
          </strong>
        </article>

        <article>
          <span>
            \u53EF\u7528\u9762\u79EF
          </span>
          <strong>
            ${p.usableArea}\u33A1
          </strong>
        </article>

        <article>
          <span>
            \u697C\u5C42
          </span>
          <strong>
            ${p.floorCount}\u5C42
          </strong>
        </article>

        <article>
          <span>
            \u95E8\u9762
          </span>
          <strong>
            ${p.frontageMeters ?? "--"}m
          </strong>
        </article>

        <article>
          <span>
            \u5C42\u9AD8
          </span>
          <strong>
            ${p.ceilingHeight ?? "--"}m
          </strong>
        </article>

        <article>
          <span>
            \u505C\u8F66\u4F4D
          </span>
          <strong>
            ${p.parkingSpaces ?? 0}\u4E2A
          </strong>
        </article>

      </section>
    `;
    }
    renderStructures(page) {
      const s = page.structures;
      return `
      <section class="property-panel">

        <header>
          <strong>
            \u623F\u5C4B\u7ED3\u6784
          </strong>

          <span>
            \u6765\u81EA\u771F\u5B9E\u623F\u6E90\u6237\u578B\u6570\u636E
          </span>
        </header>


        <div class="property-structure-grid">

          <article>
            <strong>
              ${s.entrances}
            </strong>
            <span>
              \u51FA\u5165\u53E3
            </span>
          </article>

          <article>
            <strong>
              ${s.windows}
            </strong>
            <span>
              \u7A97\u6237
            </span>
          </article>

          <article>
            <strong>
              ${s.columns}
            </strong>
            <span>
              \u67F1\u4F53
            </span>
          </article>

          <article>
            <strong>
              ${s.fixedStructures}
            </strong>
            <span>
              \u56FA\u5B9A\u7ED3\u6784
            </span>
          </article>

          <article>
            <strong>
              ${s.utilityPoints}
            </strong>
            <span>
              \u57FA\u7840\u70B9\u4F4D
            </span>
          </article>

          <article>
            <strong>
              ${s.stairs}
            </strong>
            <span>
              \u697C\u68AF
            </span>
          </article>

          <article>
            <strong>
              ${s.elevators}
            </strong>
            <span>
              \u7535\u68AF
            </span>
          </article>

        </div>

      </section>
    `;
    }
    renderFacilities(page) {
      return `
      <section class="property-panel">

        <header>
          <strong>
            \u9910\u996E\u7ECF\u8425\u6761\u4EF6
          </strong>

          <span>
            \u6CA1\u6709\u5E95\u5C42\u8BB0\u5F55\u7684\u6570\u636E\u4E0D\u4F1A\u4F2A\u9020
          </span>
        </header>


        <div class="property-facility-grid">

          ${page.facilities.map(
        (item) => `
                  <article
                    class="
                      property-facility
                      is-${item.state}
                    "
                  >
                    <span>
                      ${escapeHtml3(
          item.label
        )}
                    </span>

                    <strong>
                      ${escapeHtml3(
          item.value
        )}
                    </strong>
                  </article>
                `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderAssessment(page) {
      const a = page.assessment;
      return `
      <section class="property-panel">

        <header>
          <strong>
            \u7ECF\u8425\u9002\u914D\u8BC4\u4F30
          </strong>

          <span>
            \u4E0D\u76F4\u63A5\u9884\u6D4B\u865A\u5047\u7684\u8425\u4E1A\u6536\u5165
          </span>
        </header>


        <div class="property-assessment">

          <div class="property-assessment-score">

            <strong>
              ${a.score}
            </strong>

            <span>
              ${a.level}
            </span>

          </div>


          <div class="property-assessment-bars">

            <article>
              <span>
                \u5BA2\u6D41
              </span>

              <div>
                <i
                  style="
                    width:${a.traffic}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.traffic}
              </strong>
            </article>

            <article>
              <span>
                \u6D88\u8D39\u529B
              </span>

              <div>
                <i
                  style="
                    width:${a.spending}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.spending}
              </strong>
            </article>

            <article>
              <span>
                \u7ADE\u4E89
              </span>

              <div>
                <i
                  style="
                    width:${a.competition}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.competition}
              </strong>
            </article>

          </div>


          <div class="property-rent-efficiency">

            <span>
              \u5355\u4F4D\u9762\u79EF\u6708\u79DF
            </span>

            <strong>
              ${a.rentPerSqm === null ? "--" : `${money3(
        a.rentPerSqm
      )}/\u33A1`}
            </strong>

          </div>

        </div>

      </section>
    `;
    }
    renderRisks(page) {
      return `
      <section class="property-panel">

        <header>
          <strong>
            \u98CE\u9669\u63D0\u793A
          </strong>

          <span>
            \u968F\u623F\u6E90\u548C\u5E02\u573A\u72B6\u6001\u52A8\u6001\u53D8\u5316
          </span>
        </header>


        <div class="property-risk-list">

          ${page.risks.map(
        (risk) => `
                  <article
                    class="
                      property-risk
                      property-risk--${risk.level}
                    "
                  >

                    <span>
                      ${risk.level === "danger" ? "!" : risk.level === "warning" ? "\u25B3" : "\u2713"}
                    </span>

                    <div>
                      <strong>
                        ${escapeHtml3(
          risk.title
        )}
                      </strong>

                      <small>
                        ${escapeHtml3(
          risk.description
        )}
                      </small>
                    </div>

                  </article>
                `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderLease(page) {
      const terms = page.leaseTerms;
      const quote = page.quote;
      const offer = page.activeOffer;
      return `
      <aside class="property-lease-card">

        <header>
          <div>
            <span>
              \u623F\u4E1C
            </span>

            <strong>
              ${escapeHtml3(
        page.landlord?.name ?? "\u4E1A\u4E3B"
      )}
            </strong>
          </div>

          ${terms.negotiable ? `
                <b>
                  \u53EF\u8BAE\u4EF7
                </b>
              ` : ""}

        </header>


        <section class="property-lease-price">

          <span>
            \u6708\u79DF
          </span>

          <strong>
            ${money3(
        quote.monthlyRent
      )}
          </strong>

          <small>
            \u6302\u724C
            ${money3(
        quote.askMonthlyRent
      )}
          </small>

        </section>


        <section class="property-lease-details">

          <article>
            <span>
              \u79DF\u671F\u8303\u56F4
            </span>

            <strong>
              ${terms.minMonths}\u2013${terms.maxMonths}\u4E2A\u6708
            </strong>
          </article>

          <article>
            <span>
              \u62BC\u91D1
            </span>

            <strong>
              ${money3(
        quote.deposit
      )}
            </strong>
          </article>

          <article>
            <span>
              \u7269\u4E1A\u8D39/\u6708
            </span>

            <strong>
              ${money3(
        quote.propertyFeeMonthly
      )}
            </strong>
          </article>

          <article>
            <span>
              \u8F6C\u8BA9\u8D39
            </span>

            <strong>
              ${money3(
        quote.transferFee
      )}
            </strong>
          </article>

          <article>
            <span>
              \u5F53\u524D\u514D\u79DF
            </span>

            <strong>
              ${quote.rentFreeDays}\u5929
            </strong>
          </article>

          <article>
            <span>
              \u6700\u5927\u514D\u79DF\u7A7A\u95F4
            </span>

            <strong>
              ${terms.rentFreeMaxDays ?? 0}\u5929
            </strong>
          </article>

        </section>


        <label class="property-lease-months">

          <span>
            \u79DF\u7EA6\u6708\u6570
          </span>

          <input
            type="number"
            min="${terms.minMonths}"
            max="${terms.maxMonths}"
            step="1"
            value="${quote.months}"
            data-lease-months
          />

          <button
            type="button"
            data-action="apply-months"
          >
            \u91CD\u65B0\u62A5\u4EF7
          </button>

        </label>


        ${terms.negotiable && !offer ? `
              <section class="property-negotiate-box">

                <header>
                  \u81EA\u4E3B\u8BAE\u4EF7
                </header>

                <label>
                  <span>
                    \u671F\u671B\u6708\u79DF
                  </span>

                  <input
                    type="number"
                    min="1"
                    value="${Math.round(
        quote.askMonthlyRent * 0.97
      )}"
                    data-request-rent
                  />
                </label>

                <label>
                  <span>
                    \u514D\u79DF\u5929\u6570
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="${terms.rentFreeMaxDays ?? 0}"
                    value="0"
                    data-request-free-days
                  />
                </label>

                <button
                  type="button"
                  data-action="negotiate"
                >
                  \u4E0E\u623F\u4E1C\u8BAE\u4EF7
                </button>

              </section>
            ` : ""}


        ${offer ? `
              <section
                class="
                  property-offer
                  property-offer--${offer.status}
                "
              >

                <span>
                  ${offer.status === "countered" ? "\u623F\u4E1C\u8FD8\u4EF7" : "\u8BAE\u4EF7\u5DF2\u63A5\u53D7"}
                </span>

                <strong>
                  ${money3(
        offer.monthlyRent
      )}/\u6708
                </strong>

                <small>
                  \u514D\u79DF
                  ${offer.rentFreeDays ?? 0}
                  \u5929
                </small>

                ${offer.status === "countered" ? `
                      <button
                        type="button"
                        data-action="accept-counter"
                      >
                        \u63A5\u53D7\u623F\u4E1C\u8FD8\u4EF7
                      </button>
                    ` : ""}

              </section>
            ` : ""}


        <section class="property-sign-cost">

          <span>
            \u7B7E\u7EA6\u9996\u4ED8
          </span>

          <strong>
            ${money3(
        quote.upfront
      )}
          </strong>

          <small>
            ${quote.affordable === false ? "\u5F53\u524D\u8D44\u91D1\u4E0D\u8DB3" : quote.affordable === true ? "\u5F53\u524D\u8D44\u91D1\u53EF\u627F\u62C5" : "\u672A\u7ED1\u5B9A\u95E8\u5E97\u8D44\u91D1\u8D26\u6237"}
          </small>

        </section>


        <button
          type="button"
          class="property-sign-button"
          data-action="sign"
          ${!this.restaurantId || !page.leaseState.canSign || offer?.status === "countered" ? "disabled" : ""}
        >
          ${page.leaseState.hasActiveLease ? "\u95E8\u5E97\u5DF2\u6709\u79DF\u7EA6" : "\u786E\u8BA4\u7B7E\u7EA6\u5E76\u8FDB\u5165\u88C5\u4FEE"}
        </button>

      </aside>
    `;
    }
    renderMarkup(page) {
      return `
      <main class="property-detail-game">

        ${this.renderTopbar(
        page
      )}

        ${this.renderTitle(
        page
      )}


        ${this.message ? `
              <div class="property-detail-message">
                ${escapeHtml3(
        this.message
      )}
              </div>
            ` : ""}


        ${this.renderMedia(
        page
      )}

        ${this.renderBasicInfo(
        page
      )}


        <section class="property-detail-content">

          <div class="property-detail-content__main">

            ${this.renderStructures(
        page
      )}

            ${this.renderFacilities(
        page
      )}

            ${this.renderAssessment(
        page
      )}

            ${this.renderRisks(
        page
      )}

          </div>


          ${this.renderLease(
        page
      )}

        </section>

      </main>
    `;
    }
    render() {
      if (!this.page) {
        return;
      }
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
    }
    handleClick(event) {
      const target = event.target.closest?.(
        "[data-action]"
      );
      if (!target || !this.root.contains(
        target
      )) {
        return;
      }
      const action = target.dataset.action;
      if (action === "back") {
        this.onNavigate?.(
          "properties",
          this.restaurantId
        );
        return;
      }
      if (action === "media") {
        this.mediaTab = target.dataset.mediaId;
        this.render();
        return;
      }
      if (action === "floor") {
        this.floorId = target.dataset.floorId;
        this.render();
        return;
      }
      if (action === "apply-months") {
        const input = this.root.querySelector(
          "[data-lease-months]"
        );
        const months = Number(
          input?.value
        );
        if (Number.isInteger(
          months
        )) {
          this.months = months;
          this.offerId = null;
          try {
            this.message = "\u79DF\u8D41\u62A5\u4EF7\u5DF2\u91CD\u65B0\u8BA1\u7B97";
            this.refresh();
          } catch (error) {
            this.message = error.message;
            this.render();
          }
        }
        return;
      }
      if (action === "negotiate") {
        const rent = Number(
          this.root.querySelector(
            "[data-request-rent]"
          )?.value
        );
        const freeDays = Number(
          this.root.querySelector(
            "[data-request-free-days]"
          )?.value
        );
        try {
          const result = this.pageSystem.negotiate({
            restaurantId: this.restaurantId,
            propertyId: this.propertyId,
            months: this.months,
            requestedRent: Math.round(
              rent
            ),
            requestedRentFreeDays: Math.round(
              freeDays
            )
          });
          if (result.offer.status === "accepted") {
            this.offerId = result.offer.id;
            this.message = "\u623F\u4E1C\u63A5\u53D7\u4E86\u4F60\u7684\u62A5\u4EF7";
          } else {
            this.message = "\u623F\u4E1C\u6CA1\u6709\u76F4\u63A5\u63A5\u53D7\uFF0C\u5E76\u7ED9\u51FA\u4E86\u8FD8\u4EF7";
          }
          this.refresh();
        } catch (error) {
          this.message = error.message;
          this.render();
        }
        return;
      }
      if (action === "accept-counter") {
        try {
          const offer = this.pageSystem.acceptCounter(
            this.page.activeOffer.id
          );
          this.offerId = offer.id;
          this.message = "\u5DF2\u63A5\u53D7\u623F\u4E1C\u8FD8\u4EF7";
          this.refresh();
        } catch (error) {
          this.message = error.message;
          this.render();
        }
        return;
      }
      if (action === "sign") {
        try {
          const activeOffer = this.page.activeOffer;
          const offerId = activeOffer?.status === "accepted" ? activeOffer.id : this.offerId;
          const result = this.pageSystem.signLease({
            restaurantId: this.restaurantId,
            propertyId: this.propertyId,
            months: this.months,
            offerId
          });
          this.message = "\u7B7E\u7EA6\u6210\u529F";
          this.onNavigate?.(
            result.nextPage,
            this.restaurantId,
            result
          );
        } catch (error) {
          this.message = error.message;
          this.render();
        }
      }
    }
  };

  // src/core/TimeSystem.js
  var TimeSystem = class {
    advance(minutes = 1) {
      if (!Number.isInteger(minutes) || minutes <= 0) {
        throw new RangeError("Minutes must be a positive integer");
      }
      const previous = gameState.getSection("time");
      const previousAbsolute = (previous.day - 1) * 1440 + previous.hour * 60 + previous.minute;
      const nextAbsolute = previousAbsolute + minutes;
      const day = Math.floor(nextAbsolute / 1440) + 1;
      const minutesOfDay = nextAbsolute % 1440;
      const hour = Math.floor(minutesOfDay / 60);
      const minute = minutesOfDay % 60;
      const next = {
        day,
        hour,
        minute,
        totalMinutes: previous.totalMinutes + minutes
      };
      gameState.setSection("time", next, "time:advance");
      const hoursCrossed = Math.floor(nextAbsolute / 60) - Math.floor(previousAbsolute / 60);
      const daysCrossed = day - previous.day;
      const payload = {
        minutesAdvanced: minutes,
        hoursCrossed,
        daysCrossed,
        previous,
        current: next
      };
      eventBus.emit("time:advanced", payload);
      if (hoursCrossed > 0) {
        eventBus.emit("time:hourChanged", payload);
      }
      if (daysCrossed > 0) {
        eventBus.emit("time:dayChanged", payload);
      }
      return next;
    }
    tick(baseMinutes = 1) {
      if (!Number.isInteger(baseMinutes) || baseMinutes <= 0) {
        throw new RangeError("Base minutes must be a positive integer");
      }
      const runtime = gameState.getSection("runtime");
      if (runtime.paused) {
        return gameState.getSection("time");
      }
      return this.advance(baseMinutes * runtime.speed);
    }
    pause() {
      gameState.patchSection(
        "runtime",
        { paused: true },
        "time:pause"
      );
    }
    resume() {
      gameState.patchSection(
        "runtime",
        { paused: false },
        "time:resume"
      );
    }
    setSpeed(speed) {
      const allowedSpeeds = [1, 2, 4];
      if (!allowedSpeeds.includes(speed)) {
        throw new RangeError("Speed must be 1, 2, or 4");
      }
      gameState.patchSection(
        "runtime",
        { speed },
        "time:setSpeed"
      );
      return speed;
    }
    getTime() {
      return gameState.getSection("time");
    }
  };
  var timeSystem = new TimeSystem();

  // src/systems/CustomerSegmentSystem.js
  var COLLECTION5 = "customer_segments";
  function validatePercent(value, name) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new Error(
        `${name} must be 0-100`
      );
    }
  }
  function validateSegment(item) {
    if (!item || typeof item !== "object") {
      throw new TypeError(
        "Customer segment must be an object"
      );
    }
    if (typeof item.id !== "string" || !item.id.trim()) {
      throw new Error(
        "Customer segment id is required"
      );
    }
    if (typeof item.name !== "string" || !item.name.trim()) {
      throw new Error(
        "Customer segment name is required"
      );
    }
    validatePercent(
      item.spendingPower,
      "spendingPower"
    );
    validatePercent(
      item.priceSensitivity,
      "priceSensitivity"
    );
    validatePercent(
      item.qualitySensitivity,
      "qualitySensitivity"
    );
    validatePercent(
      item.speedSensitivity,
      "speedSensitivity"
    );
    if (!Number.isInteger(
      item.averageDiningMinutes
    ) || item.averageDiningMinutes <= 0) {
      throw new Error(
        "averageDiningMinutes must be positive"
      );
    }
    if (!Number.isInteger(
      item.queuePatienceMinutes
    ) || item.queuePatienceMinutes < 0) {
      throw new Error(
        "queuePatienceMinutes must be non-negative"
      );
    }
    if (item.categoryPreferences !== void 0) {
      if (!item.categoryPreferences || typeof item.categoryPreferences !== "object" || Array.isArray(
        item.categoryPreferences
      )) {
        throw new Error(
          "categoryPreferences must be an object"
        );
      }
      for (const weight of Object.values(
        item.categoryPreferences
      )) {
        if (!Number.isFinite(weight) || weight < 0) {
          throw new Error(
            "Invalid category preference"
          );
        }
      }
    }
    if (!item.hourWeights || typeof item.hourWeights !== "object" || Array.isArray(
      item.hourWeights
    )) {
      throw new Error(
        "hourWeights is required"
      );
    }
    for (const [hour, weight] of Object.entries(
      item.hourWeights
    )) {
      const numericHour = Number(hour);
      if (!Number.isInteger(
        numericHour
      ) || numericHour < 0 || numericHour > 23) {
        throw new Error(
          "Invalid hourWeights hour"
        );
      }
      if (!Number.isFinite(weight) || weight < 0) {
        throw new Error(
          "Invalid hour weight"
        );
      }
    }
    return true;
  }
  var CustomerSegmentSystem = class {
    load(records, {
      overwrite = false
    } = {}) {
      if (!Array.isArray(records)) {
        throw new TypeError(
          "Customer segments must be an array"
        );
      }
      records.forEach(
        validateSegment
      );
      return dataRegistry.register(
        COLLECTION5,
        records,
        { overwrite }
      );
    }
    get(id) {
      return dataRegistry.get(
        COLLECTION5,
        id
      );
    }
    getAll() {
      return dataRegistry.getAll(
        COLLECTION5
      );
    }
    exists(id) {
      return dataRegistry.has(
        COLLECTION5,
        id
      );
    }
    getHourWeight(id, hour) {
      const segment = this.get(id);
      if (!segment) {
        return 0;
      }
      return segment.hourWeights?.[hour] ?? 0;
    }
  };
  var customerSegmentSystem = new CustomerSegmentSystem();

  // src/systems/SeatingSystem.js
  var SeatingSystem = class {
    getSeatCount(restaurantId2) {
      const renovation = renovationSystem.getOperationalModifiers(
        restaurantId2
      );
      if (renovation.active && Number.isInteger(
        renovation.seats
      )) {
        return Math.max(
          0,
          renovation.seats
        );
      }
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      if (!restaurant.locationId) {
        return 10;
      }
      try {
        const property = propertySystem.get(
          restaurant.locationId
        );
        return property.seats ?? 10;
      } catch {
        return 10;
      }
    }
    getCustomerBehavior(demand) {
      const records = demand?.segments?.filter(
        (item) => item.expectedVisitors > 0
      ) ?? [];
      const totalWeight = records.reduce(
        (sum, item) => sum + item.expectedVisitors,
        0
      );
      if (totalWeight <= 0) {
        return {
          averageDiningMinutes: 40,
          queuePatienceMinutes: 12
        };
      }
      let dining = 0;
      let patience = 0;
      for (const item of records) {
        const segment = customerSegmentSystem.get(
          item.segmentId
        );
        if (!segment) {
          continue;
        }
        const weight = item.expectedVisitors / totalWeight;
        dining += segment.averageDiningMinutes * weight;
        patience += segment.queuePatienceMinutes * weight;
      }
      return {
        averageDiningMinutes: Math.max(1, dining),
        queuePatienceMinutes: Math.max(0, patience)
      };
    }
    getHourlyCapacity(restaurantId2, demand) {
      const seats = this.getSeatCount(
        restaurantId2
      );
      const behavior = this.getCustomerBehavior(
        demand
      );
      const renovation = renovationSystem.getOperationalModifiers(
        restaurantId2
      );
      const flow = layoutFlowSystem.getOperationalEffects(
        restaurantId2
      );
      const queueEfficiency = renovation.active ? renovation.queueEfficiency : 1;
      const queuePatienceMultiplier = flow.active ? flow.queuePatienceMultiplier : 1;
      const effectiveQueuePatience = Math.max(
        0,
        behavior.queuePatienceMinutes * queuePatienceMultiplier
      );
      const turnsPerHour = Math.max(
        1,
        60 / behavior.averageDiningMinutes
      );
      const theoreticalCapacity = Math.max(
        seats,
        Math.floor(
          seats * turnsPerHour
        )
      );
      const queueCapacity = Math.max(
        0,
        Math.floor(
          seats * (effectiveQueuePatience / behavior.averageDiningMinutes) * turnsPerHour * queueEfficiency
        )
      );
      const capacity = Math.max(
        seats,
        Math.min(
          theoreticalCapacity,
          seats + queueCapacity
        )
      );
      return {
        seats,
        averageDiningMinutes: behavior.averageDiningMinutes,
        baseQueuePatienceMinutes: behavior.queuePatienceMinutes,
        queuePatienceMinutes: effectiveQueuePatience,
        queuePatienceMultiplier,
        queueEfficiency,
        turnsPerHour,
        theoreticalCapacity,
        queueCapacity,
        capacity
      };
    }
    getHourFlow(restaurantId2, incomingVisitors, demand) {
      const info = this.getHourlyCapacity(
        restaurantId2,
        demand
      );
      const acceptedVisitors = Math.min(
        incomingVisitors,
        info.capacity
      );
      const immediateVisitors = Math.min(
        incomingVisitors,
        info.seats
      );
      const queuedVisitors = Math.max(
        0,
        acceptedVisitors - immediateVisitors
      );
      const queueAbandoned = Math.max(
        0,
        incomingVisitors - acceptedVisitors
      );
      return {
        ...info,
        incomingVisitors,
        immediateVisitors,
        queuedVisitors,
        acceptedVisitors,
        queueAbandoned,
        turnoverRate: info.seats > 0 ? acceptedVisitors / info.seats : 0
      };
    }
  };
  var seatingSystem = new SeatingSystem();

  // src/systems/RenovationPlanningSystem.js
  function clamp11(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function round(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }
  var TEMPLATES = Object.freeze({
    balanced: {
      id: "balanced",
      name: "\u5747\u8861\u5C0F\u5E97",
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
      name: "\u5FEB\u9910\u9AD8\u5468\u8F6C",
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
      name: "\u5BB6\u5EAD\u6B63\u9910",
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
  var RenovationPlanningSystem = class {
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
        (item) => structuredClone(item)
      );
    }
    getGeometry(placement) {
      const definition = renovationSystem.getFurnitureDefinition(
        placement.furnitureId
      );
      const size = renovationSystem.getSize(
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
        area: size.width * size.height
      };
    }
    getZoneId(geometry) {
      const id = geometry.placement.furnitureId;
      if (geometry.definition.type === "table") {
        return "dining";
      }
      if (geometry.definition.type === "kitchen" || geometry.definition.type === "kitchen_support") {
        return "kitchen";
      }
      if (id === "waiting_bench") {
        return "waiting";
      }
      if (geometry.definition.type === "service") {
        return "service";
      }
      if (geometry.definition.type === "decor") {
        return "decor";
      }
      return "other";
    }
    scoreBand(value, minimum, maximum) {
      if (value >= minimum && value <= maximum) {
        return 100;
      }
      if (value < minimum) {
        if (minimum <= 0) {
          return 100;
        }
        return Math.round(
          clamp11(
            value / minimum * 100,
            35,
            100
          )
        );
      }
      return Math.round(
        clamp11(
          100 - (value - maximum) * 300,
          35,
          100
        )
      );
    }
    getZoneAnalysis(layout) {
      const geometries = (layout.placements ?? []).map(
        (item) => this.getGeometry(item)
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
        cells[this.getZoneId(geometry)] += geometry.area;
      }
      const totalCells = Math.max(
        1,
        layout.width * layout.height
      );
      const occupiedCells = Object.values(cells).reduce(
        (sum, value) => sum + value,
        0
      );
      const openCells = Math.max(
        0,
        totalCells - occupiedCells
      );
      const ratios = Object.fromEntries(
        Object.entries(cells).map(
          ([key, value]) => [
            key,
            round(
              value / totalCells
            )
          ]
        )
      );
      ratios.open = round(
        openCells / totalCells
      );
      const scores = {
        dining: this.scoreBand(
          ratios.dining,
          0.12,
          0.48
        ),
        kitchen: this.scoreBand(
          ratios.kitchen,
          0.06,
          0.28
        ),
        service: this.scoreBand(
          ratios.service,
          0.02,
          0.16
        ),
        waiting: this.scoreBand(
          ratios.waiting,
          0,
          0.12
        ),
        open: this.scoreBand(
          ratios.open,
          0.3,
          0.78
        )
      };
      const zoningScore = Math.round(
        scores.dining * 0.32 + scores.kitchen * 0.28 + scores.service * 0.15 + scores.waiting * 0.1 + scores.open * 0.15
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
        a.x - (b.x + b.width),
        b.x - (a.x + a.width)
      );
      const dy = Math.max(
        0,
        a.y - (b.y + b.height),
        b.y - (a.y + a.height)
      );
      return Math.sqrt(
        dx * dx + dy * dy
      );
    }
    getTableSpacing(layout) {
      const tables = (layout.placements ?? []).map(
        (item) => this.getGeometry(item)
      ).filter(
        (item) => item.definition.type === "table"
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
      for (let index = 0; index < tables.length; index += 1) {
        let best = Infinity;
        for (let other = 0; other < tables.length; other += 1) {
          if (index === other) {
            continue;
          }
          const gap = this.getRectangleGap(
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
      const averageNearestGap = nearest.reduce(
        (sum, value) => sum + value,
        0
      ) / nearest.length;
      let spacingScore = 100;
      if (averageNearestGap < 0.5) {
        spacingScore = 60;
      } else if (averageNearestGap < 1) {
        spacingScore = 78;
      } else if (averageNearestGap < 1.5) {
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
        averageNearestGap: round(
          averageNearestGap,
          2
        ),
        minimumGap: round(
          minimumGap,
          2
        ),
        spacingScore,
        issues
      };
    }
    getCompletenessScore(layout) {
      const geometries = (layout.placements ?? []).map(
        (item) => this.getGeometry(item)
      );
      const hasTable = geometries.some(
        (item) => item.definition.type === "table"
      );
      const hasKitchen = geometries.some(
        (item) => item.definition.type === "kitchen"
      );
      const hasCashier = geometries.some(
        (item) => item.placement.furnitureId === "cashier_counter"
      );
      const hasWaiting = geometries.some(
        (item) => item.placement.furnitureId === "waiting_bench"
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
      return clamp11(
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
    getAnalysis(restaurantId2) {
      const layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout) {
        return {
          restaurantId: restaurantId2,
          initialized: false,
          active: false,
          score: 0,
          grade: "D",
          issues: [
            "layout_not_initialized"
          ]
        };
      }
      const flow = layoutFlowSystem.getAnalysis(
        restaurantId2
      );
      const zoning = this.getZoneAnalysis(layout);
      const spacing = this.getTableSpacing(layout);
      const completenessScore = this.getCompletenessScore(
        layout
      );
      const flowScore = flow.flowScore ?? 0;
      const comfortScore = flow.comfortScore ?? Math.round(
        clamp11(
          (flow.comfortMultiplier ?? 1) * 80,
          0,
          100
        )
      );
      const score = Math.round(
        clamp11(
          flowScore * 0.32 + comfortScore * 0.23 + zoning.zoningScore * 0.2 + spacing.spacingScore * 0.1 + completenessScore * 0.15,
          0,
          100
        )
      );
      const issues = [
        ...flow.issues ?? [],
        ...zoning.issues,
        ...spacing.issues
      ];
      return {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        initialized: true,
        active: Boolean(layout.active),
        score,
        grade: this.getGrade(score),
        scores: {
          flow: flowScore,
          comfort: comfortScore,
          zoning: zoning.zoningScore,
          spacing: spacing.spacingScore,
          completeness: completenessScore
        },
        zoning,
        spacing,
        issues: [...new Set(issues)]
      };
    }
    overlaps(candidate, placements) {
      const candidateDefinition = renovationSystem.getFurnitureDefinition(
        candidate.furnitureId
      );
      const candidateSize = renovationSystem.getSize(
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
        (placement) => {
          const definition = renovationSystem.getFurnitureDefinition(
            placement.furnitureId
          );
          const size = renovationSystem.getSize(
            definition,
            placement.rotation ?? 0
          );
          return renovationSystem.rectanglesOverlap(
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
    getCandidateCoordinates(layout, furnitureId) {
      const definition = renovationSystem.getFurnitureDefinition(
        furnitureId
      );
      const size = renovationSystem.getSize(
        definition,
        0
      );
      const coordinates = [];
      const push = (x, y) => {
        if (x < 0 || y < 0 || x + size.width > layout.width || y + size.height > layout.height) {
          return;
        }
        const key = `${x}:${y}`;
        if (coordinates.some(
          (item) => item.key === key
        )) {
          return;
        }
        coordinates.push({
          key,
          x,
          y
        });
      };
      const right = layout.width - size.width;
      const bottom = layout.height - size.height;
      if (definition.type === "kitchen" || definition.type === "kitchen_support") {
        push(right, 0);
        push(right, 2);
      } else if (furnitureId === "waiting_bench") {
        push(right, bottom);
        push(0, bottom);
      } else if (furnitureId === "cashier_counter") {
        push(right, 2);
        push(
          Math.max(
            0,
            right - 1
          ),
          0
        );
      }
      for (let y = 0; y <= bottom; y += 1) {
        for (let x = 0; x <= right; x += 1) {
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
    buildTemplatePreview(restaurantId2, templateId) {
      const template = this.getTemplate(
        templateId
      );
      const layout = renovationSystem.requireLayout(
        restaurantId2
      );
      const catalog = new Map(
        renovationSystem.getCatalog(
          restaurantId2
        ).map(
          (item) => [
            item.id,
            item
          ]
        )
      );
      const limits = storeProgressSystem.getLimits(
        restaurantId2
      );
      const planned = [];
      let tableCount = 0;
      let kitchenStations = 0;
      let totalCost = 0;
      for (const furnitureId of template.items) {
        const definition = catalog.get(
          furnitureId
        );
        if (!definition || !definition.unlocked) {
          continue;
        }
        if (definition.type === "table" && tableCount >= limits.tables) {
          continue;
        }
        if (definition.kitchenStations && kitchenStations + definition.kitchenStations > limits.kitchenStations) {
          continue;
        }
        const candidate = this.getCandidateCoordinates(
          layout,
          furnitureId
        ).find(
          (item) => !this.overlaps(
            item,
            [
              ...layout.placements ?? [],
              ...planned
            ]
          )
        );
        if (!candidate) {
          continue;
        }
        planned.push(candidate);
        totalCost += definition.cost;
        if (definition.type === "table") {
          tableCount += 1;
        }
        kitchenStations += definition.kitchenStations ?? 0;
      }
      const hasTable = planned.some(
        (item) => renovationSystem.getFurnitureDefinition(
          item.furnitureId
        ).type === "table"
      );
      const hasKitchen = planned.some(
        (item) => renovationSystem.getFurnitureDefinition(
          item.furnitureId
        ).type === "kitchen"
      );
      const hasCashier = planned.some(
        (item) => item.furnitureId === "cashier_counter"
      );
      return {
        restaurantId: restaurantId2,
        templateId: template.id,
        templateName: template.name,
        canApply: (layout.placements ?? []).length === 0 && hasTable && hasKitchen && hasCashier,
        totalCost,
        placements: planned,
        skippedCount: template.items.length - planned.length,
        availableBalance: financeSystem.getBalance(
          restaurantId2
        )
      };
    }
    applyTemplate(restaurantId2, templateId, {
      activate = true
    } = {}) {
      const layout = renovationSystem.requireLayout(
        restaurantId2
      );
      if ((layout.placements ?? []).length > 0) {
        throw new Error(
          "Layout template can only be applied to an empty layout"
        );
      }
      const preview = this.buildTemplatePreview(
        restaurantId2,
        templateId
      );
      if (!preview.canApply) {
        throw new Error(
          "Template cannot produce a complete layout for this property"
        );
      }
      if (preview.availableBalance < preview.totalCost) {
        throw new Error(
          "Insufficient funds for renovation template"
        );
      }
      for (const placement of preview.placements) {
        renovationSystem.placeItem({
          restaurantId: restaurantId2,
          ...placement
        });
      }
      if (activate) {
        renovationSystem.activateLayout(
          restaurantId2
        );
      }
      return {
        templateId,
        totalCost: preview.totalCost,
        layout: renovationSystem.getLayout(
          restaurantId2
        ),
        analysis: this.getAnalysis(
          restaurantId2
        )
      };
    }
  };
  var renovationPlanningSystem = new RenovationPlanningSystem();

  // src/ui/pages/restaurant/RestaurantHomePageSystem.js
  function average(values, fallback = 0) {
    const valid = values.filter(Number.isFinite);
    if (valid.length === 0) {
      return fallback;
    }
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }
  function safeBalance5(restaurantId2) {
    try {
      return financeSystem.getBalance(restaurantId2);
    } catch {
      return 0;
    }
  }
  var RestaurantHomePageSystem = class {
    getTodayOrders(restaurantId2) {
      const day = gameState.getSection("time").day;
      const orders = entitySystem.filter(
        "customer_order",
        (item) => item.restaurantId === restaurantId2 && item.day === day
      );
      return {
        day,
        orders: orders.length,
        revenue: orders.reduce(
          (sum, item) => sum + (item.totalRevenue ?? 0),
          0
        ),
        ingredientCost: orders.reduce(
          (sum, item) => sum + (item.ingredientCost ?? 0),
          0
        ),
        averageQuality: Math.round(
          average(orders.map((item) => item.averageQuality), 0)
        )
      };
    }
    getEmployeeSummary(restaurantId2) {
      const employees = employeeSystem.listByRestaurant(restaurantId2);
      const active = employees.filter((item) => item.status === "active");
      return {
        total: employees.length,
        active: active.length,
        tired: active.filter((item) => (item.fatigue ?? 0) >= 75).length,
        averageMood: Math.round(
          average(active.map((item) => item.mood), 0)
        )
      };
    }
    getInventorySummary(restaurantId2) {
      const batches = inventorySystem.getBatches(
        restaurantId2,
        null,
        { activeOnly: true, includeSpoiled: true }
      );
      return {
        activeBatches: batches.length,
        spoiledBatches: batches.filter((item) => item.spoiled).length,
        lowFreshnessBatches: batches.filter(
          (item) => !item.spoiled && item.freshness <= 25
        ).length,
        ingredientKinds: new Set(batches.map((item) => item.ingredientId)).size
      };
    }
    getProperty(restaurant) {
      if (!restaurant.locationId) {
        return null;
      }
      try {
        return propertySystem.get(restaurant.locationId);
      } catch {
        return null;
      }
    }
    getRenovation(restaurantId2) {
      const summary = renovationSystem.getSummary(restaurantId2);
      let score = null;
      let grade = null;
      if (summary.initialized) {
        try {
          const analysis = renovationPlanningSystem.getAnalysis(restaurantId2);
          score = analysis.score;
          grade = analysis.grade;
        } catch {
          score = null;
          grade = null;
        }
      }
      return {
        ...summary,
        score,
        grade
      };
    }
    buildNotices({
      restaurant,
      property,
      employees,
      inventory,
      renovation,
      today
    }) {
      const notices = [];
      const time = gameState.getSection("time");
      const timeLabel = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
      if (!property) {
        notices.push({
          id: "no_property",
          type: "warning",
          title: "\u9009\u5740\u63D0\u9192",
          message: "\u5F53\u524D\u95E8\u5E97\u5C1A\u672A\u79DF\u8D41\u623F\u6E90\uFF0C\u8BF7\u5148\u524D\u5F80\u57CE\u5E02\u5730\u56FE\u9009\u5740",
          priority: 100,
          timeLabel,
          action: "properties"
        });
      }
      if (restaurant.status === "closed") {
        notices.push({
          id: "store_closed",
          type: "info",
          title: "\u8425\u4E1A\u72B6\u6001",
          message: "\u95E8\u5E97\u5F53\u524D\u5904\u4E8E\u95ED\u5E97\u72B6\u6001",
          priority: 90,
          timeLabel
        });
      }
      if (inventory.spoiledBatches > 0) {
        notices.push({
          id: "inventory_spoiled",
          type: "danger",
          title: "\u5E93\u5B58\u9884\u8B66",
          message: `${inventory.spoiledBatches} \u6279\u98DF\u6750\u5DF2\u7ECF\u53D8\u8D28\uFF0C\u9700\u8981\u5C3D\u5FEB\u5904\u7406`,
          priority: 88,
          timeLabel,
          action: "supply"
        });
      }
      if (employees.total === 0) {
        notices.push({
          id: "no_employees",
          type: "warning",
          title: "\u4EBA\u5458\u63D0\u9192",
          message: "\u5F53\u524D\u95E8\u5E97\u8FD8\u6CA1\u6709\u5458\u5DE5",
          priority: 82,
          timeLabel,
          action: "employee_roster"
        });
      } else if (employees.tired > 0) {
        notices.push({
          id: "tired_employees",
          type: "warning",
          title: "\u5458\u5DE5\u72B6\u6001",
          message: `${employees.tired} \u540D\u5458\u5DE5\u75B2\u52B3\u5EA6\u8F83\u9AD8`,
          priority: 72,
          timeLabel,
          action: "employee_roster"
        });
      }
      if (inventory.lowFreshnessBatches > 0) {
        notices.push({
          id: "low_freshness",
          type: "warning",
          title: "\u98DF\u6750\u65B0\u9C9C\u5EA6",
          message: `${inventory.lowFreshnessBatches} \u6279\u98DF\u6750\u5373\u5C06\u8FDB\u5165\u9AD8\u635F\u8017\u533A\u95F4`,
          priority: 65,
          timeLabel,
          action: "supply"
        });
      }
      if (property && !renovation.active) {
        notices.push({
          id: "renovation_inactive",
          type: "info",
          title: "\u88C5\u4FEE\u5E03\u5C40",
          message: "\u5F53\u524D\u623F\u6E90\u5C1A\u672A\u542F\u7528\u6B63\u5F0F\u88C5\u4FEE\u5E03\u5C40",
          priority: 45,
          timeLabel,
          action: "renovation"
        });
      }
      if (restaurant.reviewScore < 3) {
        notices.push({
          id: "review_low",
          type: "warning",
          title: "\u987E\u5BA2\u8BC4\u4EF7",
          message: `\u5F53\u524D\u7EFC\u5408\u8BC4\u5206 ${Number(restaurant.reviewScore).toFixed(1)}\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u7ECF\u8425\u95EE\u9898`,
          priority: 70,
          timeLabel,
          action: "analytics"
        });
      }
      if (notices.length === 0) {
        notices.push({
          id: "normal_operation",
          type: "success",
          title: "\u7ECF\u8425\u901A\u62A5",
          message: `\u4ECA\u65E5\u5DF2\u5B8C\u6210 ${today.orders} \u5355\uFF0C\u95E8\u5E97\u8FD0\u884C\u6B63\u5E38`,
          priority: 10,
          timeLabel
        });
      }
      return notices;
    }
    getPage(restaurantId2) {
      const restaurant = restaurantSystem.get(restaurantId2);
      const property = this.getProperty(restaurant);
      const today = this.getTodayOrders(restaurantId2);
      const employees = this.getEmployeeSummary(restaurantId2);
      const inventory = this.getInventorySummary(restaurantId2);
      const renovation = this.getRenovation(restaurantId2);
      const time = gameState.getSection("time");
      const runtime = gameState.getSection("runtime");
      const balance = safeBalance5(restaurantId2);
      const notices = this.buildNotices({
        restaurant,
        property,
        employees,
        inventory,
        renovation,
        today
      });
      const seats = property ? seatingSystem.getSeatCount(restaurantId2) : 0;
      return {
        pageId: "restaurant",
        topBar: buildGlobalTopBarModel({
          restaurantName: restaurant.name,
          balance,
          storeLevel: restaurant.level,
          reputation: restaurant.reputation,
          time,
          runtime,
          currentStoreId: restaurantId2
        }),
        noticeTicker: buildNoticeTickerModel(notices),
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          status: restaurant.status,
          level: restaurant.level,
          reputation: restaurant.reputation,
          reviewScore: restaurant.reviewScore,
          satisfaction: restaurant.customerSatisfaction,
          repeatRate: restaurant.repeatRate
        },
        scene: {
          propertyId: property?.id ?? null,
          propertyName: property?.name ?? "\u5C1A\u672A\u79DF\u8D41\u623F\u6E90",
          area: property?.area ?? 0,
          seats,
          renovationActive: Boolean(renovation.active),
          renovationScore: renovation.score,
          renovationGrade: renovation.grade
        },
        today,
        employees,
        inventory,
        keyMetrics: [
          { id: "revenue", label: "\u4ECA\u65E5\u8425\u6536", value: today.revenue, format: "money" },
          { id: "orders", label: "\u4ECA\u65E5\u8BA2\u5355", value: today.orders, format: "number" },
          { id: "satisfaction", label: "\u987E\u5BA2\u6EE1\u610F", value: Math.round(restaurant.customerSatisfaction), format: "percent" },
          { id: "rating", label: "\u95E8\u5E97\u8BC4\u5206", value: Number(restaurant.reviewScore.toFixed(1)), format: "score" }
        ],
        quickActions: [
          { id: "renovation", label: "\u88C5\u4FEE\u5E03\u5C40", pageId: "renovation", enabled: Boolean(property) },
          { id: "dishes", label: "\u83DC\u54C1\u4E2D\u5FC3", pageId: "dishes", enabled: true },
          { id: "employees", label: "\u5458\u5DE5\u7BA1\u7406", pageId: "employee_roster", enabled: true },
          { id: "supply", label: "\u91C7\u8D2D\u5E93\u5B58", pageId: "supply", enabled: true },
          { id: "analytics", label: "\u7ECF\u8425\u6570\u636E", pageId: "analytics", enabled: true },
          { id: "lease", label: "\u79DF\u7EA6\u4FE1\u606F", pageId: "lease", enabled: Boolean(property) }
        ],
        navigation: pageRegistry.mainNavigation().map((page) => ({
          id: page.id,
          title: page.title,
          active: page.id === "restaurant"
        })),
        actions: {
          canOpen: restaurant.status === "closed" && Boolean(property),
          canClose: restaurant.status !== "closed",
          canRename: true,
          canPauseTime: !runtime.paused,
          canResumeTime: runtime.paused,
          speeds: [1, 2, 4]
        }
      };
    }
    rename(restaurantId2, name) {
      restaurantSystem.rename(restaurantId2, name);
      return this.getPage(restaurantId2);
    }
    pauseTime(restaurantId2) {
      timeSystem.pause();
      return this.getPage(restaurantId2);
    }
    resumeTime(restaurantId2) {
      timeSystem.resume();
      return this.getPage(restaurantId2);
    }
    setSpeed(restaurantId2, speed) {
      timeSystem.setSpeed(speed);
      return this.getPage(restaurantId2);
    }
    toggleBusiness(restaurantId2) {
      const restaurant = restaurantSystem.get(restaurantId2);
      if (restaurant.status === "closed") {
        restaurantSystem.open(restaurantId2);
      } else {
        restaurantSystem.close(restaurantId2);
      }
      return this.getPage(restaurantId2);
    }
  };
  var restaurantHomePageSystem = new RestaurantHomePageSystem();

  // src/ui/pages/restaurant/RestaurantHomeDashboardSystem.js
  function safeDish(dishId) {
    try {
      return dishCatalogSystem.get(
        dishId
      );
    } catch {
      return null;
    }
  }
  var RestaurantHomeDashboardSystem = class {
    getOrders(restaurantId2) {
      return entitySystem.list(
        "customer_order"
      ).filter(
        (item) => item.restaurantId === restaurantId2 && item.status === "completed"
      );
    }
    getTrend(restaurantId2) {
      const day = gameState.getSection(
        "time"
      ).day;
      const orders = this.getOrders(
        restaurantId2
      );
      return Array.from(
        {
          length: 7
        },
        (_, index) => {
          const targetDay = day - 6 + index;
          const dayOrders = orders.filter(
            (item) => item.day === targetDay
          );
          return {
            day: targetDay,
            revenue: dayOrders.reduce(
              (sum, item) => sum + (item.totalRevenue ?? 0),
              0
            ),
            grossProfit: dayOrders.reduce(
              (sum, item) => sum + (item.grossProfit ?? (item.totalRevenue ?? 0) - (item.ingredientCost ?? 0)),
              0
            ),
            orders: dayOrders.length
          };
        }
      );
    }
    getTopDishes(restaurantId2) {
      const orders = this.getOrders(
        restaurantId2
      );
      const map = /* @__PURE__ */ new Map();
      for (const order of orders) {
        for (const item of order.items ?? []) {
          const current = map.get(
            item.dishId
          ) ?? {
            dishId: item.dishId,
            sold: 0,
            revenue: 0,
            qualityTotal: 0,
            qualityCount: 0
          };
          current.sold += item.quantity ?? 0;
          current.revenue += item.revenue ?? 0;
          if (Number.isFinite(
            item.qualityScore
          )) {
            current.qualityTotal += item.qualityScore * (item.quantity ?? 1);
            current.qualityCount += item.quantity ?? 1;
          }
          map.set(
            item.dishId,
            current
          );
        }
      }
      return [
        ...map.values()
      ].map(
        (item) => {
          const dish = safeDish(
            item.dishId
          );
          return {
            ...item,
            name: dish?.name ?? "\u672A\u547D\u540D\u83DC\u54C1",
            category: dish?.category ?? null,
            quality: item.qualityCount > 0 ? Math.round(
              item.qualityTotal / item.qualityCount
            ) : null,
            imageSlot: `dish-${item.dishId}`
          };
        }
      ).sort(
        (a, b) => b.sold - a.sold
      ).slice(
        0,
        3
      );
    }
    getOperatingPeriods(restaurantId2) {
      const time = gameState.getSection(
        "time"
      );
      const schedule = operatingScheduleSystem.get(
        restaurantId2
      );
      const hour = time.hour;
      const periods = [
        {
          id: "breakfast",
          label: "\u65E9\u9910",
          start: 6,
          end: 10
        },
        {
          id: "lunch",
          label: "\u5348\u5E02",
          start: 10,
          end: 15
        },
        {
          id: "dinner",
          label: "\u665A\u9910",
          start: 17,
          end: 22
        },
        {
          id: "late",
          label: "\u591C\u5BB5",
          start: 22,
          end: 24
        }
      ];
      return {
        schedule,
        scheduledHours: schedule?.enabled ? schedule.closeHour - schedule.openHour : 0,
        periods: periods.map(
          (period) => ({
            ...period,
            current: hour >= period.start && hour < period.end,
            enabled: Boolean(
              schedule?.enabled && period.end > schedule.openHour && period.start < schedule.closeHour
            )
          })
        )
      };
    }
    getLease(restaurantId2) {
      const time = gameState.getSection(
        "time"
      );
      const lease = leaseSystem.getByRestaurant(
        restaurantId2
      ) ?? null;
      if (!lease) {
        return null;
      }
      return {
        ...lease,
        remainingDays: Math.max(
          0,
          (lease.endDay ?? time.day) - time.day
        )
      };
    }
    getPage(restaurantId2) {
      const base = restaurantHomePageSystem.getPage(
        restaurantId2
      );
      const trend = this.getTrend(
        restaurantId2
      );
      const topDishes = this.getTopDishes(
        restaurantId2
      );
      const lease = this.getLease(
        restaurantId2
      );
      const operating = this.getOperatingPeriods(
        restaurantId2
      );
      const grossProfit = (base.today.revenue ?? 0) - (base.today.ingredientCost ?? 0);
      const profitMargin = base.today.revenue > 0 ? Math.round(
        grossProfit / base.today.revenue * 100
      ) : 0;
      const orderPerSeat = base.scene.seats > 0 ? Number(
        (base.today.orders / base.scene.seats).toFixed(
          1
        )
      ) : 0;
      return {
        ...base,
        hero: {
          imageSlot: "restaurant-hero",
          liveImageSlot: "restaurant-live",
          title: base.scene.propertyName,
          area: base.scene.area,
          seats: base.scene.seats
        },
        lease: lease ? {
          monthlyRent: lease.monthlyRent,
          remainingDays: lease.remainingDays,
          nextRentDay: lease.nextRentDay,
          months: lease.months
        } : null,
        operating,
        dashboardMetrics: [
          {
            id: "revenue",
            label: "\u4ECA\u65E5\u8425\u4E1A\u989D",
            value: base.today.revenue,
            format: "money"
          },
          {
            id: "profit",
            label: "\u4ECA\u65E5\u6BDB\u5229",
            value: grossProfit,
            format: "money",
            sub: `\u6BDB\u5229\u7387 ${profitMargin}%`
          },
          {
            id: "orders",
            label: "\u4ECA\u65E5\u8BA2\u5355",
            value: base.today.orders,
            format: "number"
          },
          {
            id: "seat_efficiency",
            label: "\u5355\u91CF/\u9910\u4F4D",
            value: orderPerSeat,
            format: "decimal",
            sub: `${base.scene.seats}\u4E2A\u9910\u4F4D`
          },
          {
            id: "rating",
            label: "\u987E\u5BA2\u8BC4\u5206",
            value: base.restaurant.reviewScore,
            format: "rating"
          }
        ],
        trend,
        topDishes,
        reminders: base.noticeTicker.items.slice(
          0,
          3
        ),
        imageSlots: [
          {
            id: "restaurant-hero",
            type: "store",
            static: true
          },
          {
            id: "restaurant-live",
            type: "store-live",
            static: true
          },
          ...Array.from(
            {
              length: 3
            },
            (_, index) => ({
              id: `signature-dish-${index + 1}`,
              type: "dish",
              static: true
            })
          )
        ]
      };
    }
    rename(restaurantId2, name) {
      restaurantHomePageSystem.rename(
        restaurantId2,
        name
      );
      return this.getPage(
        restaurantId2
      );
    }
    pauseTime(restaurantId2) {
      restaurantHomePageSystem.pauseTime(
        restaurantId2
      );
      return this.getPage(
        restaurantId2
      );
    }
    resumeTime(restaurantId2) {
      restaurantHomePageSystem.resumeTime(
        restaurantId2
      );
      return this.getPage(
        restaurantId2
      );
    }
    setSpeed(restaurantId2, speed) {
      restaurantHomePageSystem.setSpeed(
        restaurantId2,
        speed
      );
      return this.getPage(
        restaurantId2
      );
    }
    toggleBusiness(restaurantId2) {
      restaurantHomePageSystem.toggleBusiness(
        restaurantId2
      );
      return this.getPage(
        restaurantId2
      );
    }
  };
  var restaurantHomeDashboardSystem = new RestaurantHomeDashboardSystem();

  // src/ui/pages/restaurant/RestaurantHomeView.js
  function escapeHtml4(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money4(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function metricValue(metric) {
    if (metric.format === "money") {
      return money4(
        metric.value
      );
    }
    if (metric.format === "rating") {
      return Number(
        metric.value ?? 0
      ).toFixed(
        1
      ) + "\u2605";
    }
    if (metric.format === "decimal") {
      return String(
        metric.value ?? 0
      );
    }
    return Number(
      metric.value ?? 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function statusText(status) {
    if (status === "open") {
      return "\u8425\u4E1A\u4E2D";
    }
    if (status === "paused") {
      return "\u6682\u505C\u8425\u4E1A";
    }
    return "\u5DF2\u95ED\u5E97";
  }
  function renderImageSlot2({
    id,
    label,
    className = ""
  }) {
    return `
    <div
      class="
        restaurant-image-slot
        ${className}
      "
      data-image-slot="${escapeHtml4(
      id
    )}"
    >

      <div class="restaurant-image-slot__placeholder">

        <span class="restaurant-image-slot__icon">
          \u25A3
        </span>

        <strong>
          ${escapeHtml4(
      label
    )}
        </strong>

        <small>
          \u56FE\u7247\u69FD\u4F4D
        </small>

      </div>

    </div>
  `;
  }
  var RestaurantHomeView = class {
    constructor({
      root: root2,
      restaurantId: restaurantId2,
      pageSystem = restaurantHomeDashboardSystem,
      onNavigate = null,
      onRename = null
    }) {
      if (!root2) {
        throw new Error(
          "Restaurant home view requires a root element"
        );
      }
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.onRename = onRename;
      this.page = null;
      this.boundClick = (event) => this.handleClick(
        event
      );
    }
    mount() {
      this.page = this.pageSystem.getPage(
        this.restaurantId
      );
      this.root.addEventListener(
        "click",
        this.boundClick
      );
      this.render();
      return this;
    }
    destroy() {
      this.root.removeEventListener(
        "click",
        this.boundClick
      );
      this.root.innerHTML = "";
    }
    refresh(page = null) {
      this.page = page ?? this.pageSystem.getPage(
        this.restaurantId
      );
      this.render();
      return this.page;
    }
    renderTopbar(page) {
      return renderGameTopBar(
        page.topBar,
        {
          subtitle: "\u95E8\u5E97\u8425\u4E1A\u603B\u89C8",
          showSpeedControls: true
        }
      );
    }
    renderNotice(page) {
      const notice = page.noticeTicker.current;
      return `
      <button
        type="button"
        class="
          store-notice
          store-notice--${notice?.type ?? "info"}
        "
        data-action="notice"
        ${notice?.action ? `data-page-id="${escapeHtml4(
        notice.action
      )}"` : ""}
      >

        <span class="store-notice__label">
          \u516C\u544A
        </span>

        <strong>
          ${notice ? escapeHtml4(
        notice.title
      ) : "\u7ECF\u8425\u901A\u62A5"}
        </strong>

        <span class="store-notice__text">
          ${notice ? escapeHtml4(
        notice.message
      ) : "\u5F53\u524D\u6CA1\u6709\u65B0\u7684\u7ECF\u8425\u63D0\u9192"}
        </span>

        <b>
          ${page.noticeTicker.unreadCount}
        </b>

      </button>
    `;
    }
    renderHero(page) {
      return `
      <section class="store-hero">

        <div class="store-hero__image">

          ${renderImageSlot2({
        id: "restaurant-hero",
        label: "\u95E8\u5E97\u5B9E\u666F\u4E3B\u56FE",
        className: "restaurant-image-slot--hero"
      })}

          <div class="store-hero__overlay">

            <strong>
              ${escapeHtml4(
        page.restaurant.name
      )}
            </strong>

            <span>
              ${escapeHtml4(
        page.scene.propertyName
      )}
            </span>

          </div>

        </div>


        <aside class="store-hero__summary">

          <header>
            <strong>
              \u95E8\u5E97\u6982\u51B5
            </strong>

            <span
              class="
                store-status
                store-status--${page.restaurant.status}
              "
            >
              ${statusText(
        page.restaurant.status
      )}
            </span>
          </header>


          <div class="store-summary-grid">

            <article>
              <span>
                \u5EFA\u7B51\u9762\u79EF
              </span>

              <strong>
                ${page.scene.area ? `${page.scene.area}\u33A1` : "\u672A\u9009\u5740"}
              </strong>
            </article>

            <article>
              <span>
                \u5F53\u524D\u9910\u4F4D
              </span>

              <strong>
                ${page.scene.seats}\u4E2A
              </strong>
            </article>

            <article>
              <span>
                \u88C5\u4FEE\u72B6\u6001
              </span>

              <strong>
                ${page.scene.renovationActive ? `${page.scene.renovationGrade ?? "-"}\u7EA7 \xB7 ${page.scene.renovationScore ?? "-"}\u5206` : "\u672A\u542F\u7528"}
              </strong>
            </article>

            <article>
              <span>
                \u6708\u79DF
              </span>

              <strong>
                ${page.lease ? money4(
        page.lease.monthlyRent
      ) : "--"}
              </strong>
            </article>

            <article>
              <span>
                \u79DF\u7EA6\u5269\u4F59
              </span>

              <strong>
                ${page.lease ? `${page.lease.remainingDays}\u5929` : "--"}
              </strong>
            </article>

            <article>
              <span>
                \u4ECA\u65E5\u8425\u4E1A\u8BA1\u5212
              </span>

              <strong>
                ${page.operating.schedule?.enabled ? `${page.operating.scheduledHours}\u5C0F\u65F6` : "\u672A\u8BBE\u7F6E"}
              </strong>
            </article>

          </div>


          <div class="store-hero__buttons">

            <button
              type="button"
              data-action="navigate"
              data-page-id="renovation"
              ${page.scene.propertyId ? "" : "disabled"}
            >
              \u88C5\u4FEE\u5E03\u5C40
            </button>

            <button
              type="button"
              data-action="navigate"
              data-page-id="lease"
              ${page.scene.propertyId ? "" : "disabled"}
            >
              \u79DF\u7EA6\u7BA1\u7406
            </button>

          </div>

        </aside>

      </section>
    `;
    }
    renderPeriods(page) {
      const schedule = page.operating.schedule;
      return `
      <section class="store-period-panel">

        <header>
          <div>
            <strong>
              \u4ECA\u65E5\u8425\u4E1A\u65F6\u6BB5
            </strong>

            <span>
              ${schedule?.enabled ? `${String(
        schedule.openHour
      ).padStart(
        2,
        "0"
      )}:00\u2013${String(
        schedule.closeHour
      ).padStart(
        2,
        "0"
      )}:00` : "\u5C1A\u672A\u8BBE\u7F6E\u8425\u4E1A\u65F6\u95F4"}
            </span>
          </div>

          <b>
            ${statusText(
        page.restaurant.status
      )}
          </b>
        </header>


        <div class="store-periods">

          ${page.operating.periods.map(
        (item) => `
                  <article
                    class="
                      ${item.enabled ? "is-enabled" : ""}
                      ${item.current ? "is-current" : ""}
                    "
                  >

                    <span>
                      ${item.label}
                    </span>

                    <strong>
                      ${String(
          item.start
        ).padStart(
          2,
          "0"
        )}:00
                    </strong>

                    <small>
                      ${item.current ? "\u5F53\u524D\u65F6\u6BB5" : item.enabled ? "\u8425\u4E1A\u8BA1\u5212" : "\u672A\u8986\u76D6"}
                    </small>

                  </article>
                `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderMetrics(page) {
      return `
      <section class="store-kpis">

        ${page.dashboardMetrics.map(
        (metric) => `
                <article>

                  <span>
                    ${escapeHtml4(
          metric.label
        )}
                  </span>

                  <strong>
                    ${escapeHtml4(
          metricValue(
            metric
          )
        )}
                  </strong>

                  <small>
                    ${escapeHtml4(
          metric.sub ?? "\u5B9E\u65F6\u6570\u636E"
        )}
                  </small>

                </article>
              `
      ).join("")}

      </section>
    `;
    }
    renderTrend(page) {
      const max = Math.max(
        1,
        ...page.trend.map(
          (item) => item.revenue
        )
      );
      return `
      <section class="store-panel store-trend-panel">

        <header class="store-panel__title">
          <div>
            <strong>
              \u8FD17\u65E5\u9500\u552E\u8D8B\u52BF
            </strong>

            <span>
              \u6839\u636E\u771F\u5B9E\u5B8C\u6210\u8BA2\u5355\u7EDF\u8BA1
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="analytics"
          >
            \u7ECF\u8425\u6570\u636E \u203A
          </button>
        </header>


        <div class="store-trend-chart">

          ${page.trend.map(
        (item) => {
          const height = Math.max(
            5,
            Math.round(
              item.revenue / max * 100
            )
          );
          return `
                    <article>

                      <strong>
                        ${item.revenue > 0 ? money4(
            item.revenue
          ) : "\xA50"}
                      </strong>

                      <div class="store-trend-bar">

                        <i
                          style="
                            height:${height}%;
                          "
                        ></i>

                      </div>

                      <span>
                        \u7B2C${item.day}\u5929
                      </span>

                    </article>
                  `;
        }
      ).join("")}

        </div>

      </section>
    `;
    }
    renderLiveAndReminders(page) {
      return `
      <section class="store-middle-grid">

        <section class="store-panel">

          <header class="store-panel__title">
            <div>
              <strong>
                \u95E8\u5E97\u8425\u4E1A\u73B0\u573A
              </strong>

              <span>
                \u540E\u7EED\u63A5\u5165\u52A8\u6001\u95E8\u5E97\u573A\u666F\u56FE
              </span>
            </div>
          </header>


          ${renderImageSlot2({
        id: "restaurant-live",
        label: "\u8425\u4E1A\u573A\u666F\u56FE",
        className: "restaurant-image-slot--live"
      })}


          <div class="store-live-stats">

            <span>
              \u5458\u5DE5
              <b>
                ${page.employees.active}
                /
                ${page.employees.total}
              </b>
            </span>

            <span>
              \u5E93\u5B58\u98DF\u6750
              <b>
                ${page.inventory.ingredientKinds}\u79CD
              </b>
            </span>

            <span>
              \u5E73\u5747\u51FA\u54C1
              <b>
                ${page.today.averageQuality || "-"}
              </b>
            </span>

          </div>

        </section>


        <section class="store-panel">

          <header class="store-panel__title">
            <div>
              <strong>
                \u4ECA\u65E5\u7ECF\u8425\u63D0\u9192
              </strong>

              <span>
                \u98CE\u9669\u548C\u5F85\u529E\u5B9E\u65F6\u53D8\u5316
              </span>
            </div>
          </header>


          <div class="store-reminder-list">

            ${page.reminders.length ? page.reminders.map(
        (item) => `
                        <button
                          type="button"
                          class="
                            store-reminder
                            store-reminder--${item.type}
                          "
                          ${item.action ? `data-action="navigate" data-page-id="${escapeHtml4(
          item.action
        )}"` : ""}
                        >

                          <span>
                            ${escapeHtml4(
          item.title
        )}
                          </span>

                          <strong>
                            ${escapeHtml4(
          item.message
        )}
                          </strong>

                        </button>
                      `
      ).join("") : `
                  <div class="store-reminder-empty">
                    \u5F53\u524D\u6CA1\u6709\u9700\u8981\u5904\u7406\u7684\u7ECF\u8425\u95EE\u9898
                  </div>
                `}

          </div>

        </section>

      </section>
    `;
    }
    renderTopDishes(page) {
      const dishes = [
        0,
        1,
        2
      ].map(
        (index) => page.topDishes[index] ?? null
      );
      return `
      <section class="store-panel store-signature-panel">

        <header class="store-panel__title">

          <div>
            <strong>
              \u672C\u5E97\u62DB\u724C\u83DC
            </strong>

            <span>
              \u6309\u7D2F\u8BA1\u9500\u91CF\u52A8\u6001\u6392\u5E8F
            </span>
          </div>

          <button
            type="button"
            data-action="navigate"
            data-page-id="dishes"
          >
            \u83DC\u54C1\u4E2D\u5FC3 \u203A
          </button>

        </header>


        <div class="store-signature-grid">

          ${dishes.map(
        (dish, index) => `
                <article
                  class="
                    store-signature-card
                    ${dish ? "" : "is-empty"}
                  "
                >

                  ${renderImageSlot2({
          id: `signature-dish-${index + 1}`,
          label: dish?.name ?? `\u62DB\u724C\u83DC${index + 1}`,
          className: "restaurant-image-slot--dish"
        })}

                  <div class="store-signature-card__body">

                    <span class="store-signature-rank">
                      TOP
                      ${index + 1}
                    </span>

                    <strong>
                      ${escapeHtml4(
          dish?.name ?? "\u7B49\u5F85\u4EA7\u751F\u9500\u91CF"
        )}
                    </strong>

                    <div>

                      <span>
                        \u9500\u91CF
                        <b>
                          ${dish?.sold ?? 0}
                        </b>
                      </span>

                      <span>
                        \u8425\u6536
                        <b>
                          ${money4(
          dish?.revenue ?? 0
        )}
                        </b>
                      </span>

                      <span>
                        \u54C1\u8D28
                        <b>
                          ${dish?.quality ?? "-"}
                        </b>
                      </span>

                    </div>

                  </div>

                </article>
              `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderBusinessStatus(page) {
      return `
      <section class="store-business-panel">

        <div>

          <span>
            \u5F53\u524D\u7ECF\u8425\u72B6\u6001
          </span>

          <strong>
            ${statusText(
        page.restaurant.status
      )}
          </strong>

          <small>
            ${page.scene.propertyId ? `${page.scene.seats}\u4E2A\u9910\u4F4D \xB7 ${page.employees.active}\u540D\u5458\u5DE5\u5728\u5C97` : "\u5C1A\u672A\u5B8C\u6210\u9009\u5740"}
          </small>

        </div>


        <div class="store-business-actions">

          <button
            type="button"
            data-action="navigate"
            data-page-id="analytics"
          >
            \u7ECF\u8425\u62A5\u8868
          </button>

          <button
            type="button"
            class="
              store-business-main
              ${page.restaurant.status === "open" ? "is-open" : ""}
            "
            data-action="business"
            ${page.actions.canOpen || page.actions.canClose ? "" : "disabled"}
          >
            ${page.restaurant.status === "closed" ? "\u5F00\u59CB\u8425\u4E1A" : "\u7ED3\u675F\u8425\u4E1A"}
          </button>

        </div>

      </section>
    `;
    }
    renderBottomNav(page) {
      return renderBottomNavigation(
        gameChromeSystem.getNavigation({
          restaurantId: this.restaurantId,
          activePageId: "restaurant"
        })
      );
    }
    renderMarkup(page) {
      return `
      <main class="restaurant-home-game">

        ${this.renderTopbar(
        page
      )}

        ${this.renderNotice(
        page
      )}

        ${this.renderHero(
        page
      )}

        ${this.renderPeriods(
        page
      )}

        ${this.renderMetrics(
        page
      )}

        ${this.renderTrend(
        page
      )}

        ${this.renderLiveAndReminders(
        page
      )}

        ${this.renderTopDishes(
        page
      )}

        ${this.renderBusinessStatus(
        page
      )}

        ${this.renderBottomNav(
        page
      )}

      </main>
    `;
    }
    render() {
      if (!this.page) {
        return;
      }
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
    }
    handleClick(event) {
      const target = event.target.closest?.(
        "[data-action]"
      );
      if (!target || !this.root.contains(
        target
      )) {
        return;
      }
      const action = target.dataset.action;
      if (action === "navigate" || action === "notice") {
        const pageId = target.dataset.pageId;
        if (pageId && typeof this.onNavigate === "function") {
          this.onNavigate(
            pageId,
            this.restaurantId
          );
        }
        return;
      }
      if (action === "rename") {
        if (typeof this.onRename === "function") {
          this.onRename(
            this.page.restaurant.name,
            (nextName) => {
              if (nextName) {
                this.refresh(
                  this.pageSystem.rename(
                    this.restaurantId,
                    nextName
                  )
                );
              }
            }
          );
        }
        return;
      }
      if (action === "pause") {
        this.refresh(
          this.page.topBar.clock.paused ? this.pageSystem.resumeTime(
            this.restaurantId
          ) : this.pageSystem.pauseTime(
            this.restaurantId
          )
        );
        return;
      }
      if (action === "speed") {
        this.refresh(
          this.pageSystem.setSpeed(
            this.restaurantId,
            Number(
              target.dataset.speed
            )
          )
        );
        return;
      }
      if (action === "business") {
        this.refresh(
          this.pageSystem.toggleBusiness(
            this.restaurantId
          )
        );
      }
    }
  };

  // src/ui/pages/opening/OpeningSetupPageSystem.js
  function safeBalance6(restaurantId2) {
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return 0;
    }
  }
  var OpeningSetupPageSystem = class {
    getLocation(status) {
      if (!status.restaurant.locationId) {
        return {
          name: "\u5C1A\u672A\u9009\u62E9\u623F\u6E90",
          area: null,
          district: null
        };
      }
      try {
        const property = propertySystem.get(
          status.restaurant.locationId
        );
        return {
          name: property.name,
          area: property.usableArea ?? property.area,
          district: property.districtName ?? property.districtId ?? null
        };
      } catch {
        return {
          name: "\u5F53\u524D\u7ECF\u8425\u623F\u6E90",
          area: null,
          district: null
        };
      }
    }
    getPage(restaurantId2) {
      const status = openingFlowSystem.getStatus(
        restaurantId2
      );
      const restaurant = status.restaurant;
      const location2 = this.getLocation(
        status
      );
      const time = gameState.getSection(
        "time"
      );
      const runtime = gameState.getSection(
        "runtime"
      );
      const next = status.nextAction;
      const notices = [
        {
          id: "opening_next",
          type: status.canOpen ? "success" : "info",
          title: status.canOpen ? "\u5F00\u4E1A\u68C0\u67E5\u901A\u8FC7" : "\u5F00\u5E97\u4EFB\u52A1",
          message: status.canOpen ? "\u5168\u90E8\u5F00\u4E1A\u6761\u4EF6\u5DF2\u6EE1\u8DB3\uFF0C\u53EF\u4EE5\u6B63\u5F0F\u8425\u4E1A" : `\u4E0B\u4E00\u6B65\uFF1A${next.label} \xB7 ${next.description}`,
          priority: 100,
          action: next.target
        }
      ];
      return {
        pageId: "opening-setup",
        topBar: buildGlobalTopBarModel({
          restaurantName: restaurant.name,
          balance: safeBalance6(
            restaurantId2
          ),
          storeLevel: restaurant.level,
          reputation: restaurant.reputation,
          time,
          runtime,
          currentStoreId: restaurantId2
        }),
        noticeTicker: buildNoticeTickerModel(
          notices
        ),
        location: location2,
        status,
        permits: status.permits,
        stock: status.starterStock,
        metrics: [
          {
            label: "\u51C6\u5907\u8FDB\u5EA6",
            value: `${status.preparation.percent}%`
          },
          {
            label: "\u5FC5\u8981\u8BB8\u53EF",
            value: `${status.permits.issuedCount}/${status.permits.requiredCount}`
          },
          {
            label: "\u9996\u6279\u98DF\u6750",
            value: `${status.starterStock.stockedCount}/${status.starterStock.ingredientCount}`
          },
          {
            label: "\u53EF\u5DE5\u4F5C\u53A8\u5E08",
            value: `${status.availableChefs.length}\u4EBA`
          },
          {
            label: "\u8425\u4E1A\u83DC\u54C1",
            value: `${status.activeMenu.length}\u9053`
          }
        ],
        bottomNavigation: [
          {
            label: "\u57CE\u5E02",
            target: "city",
            icon: "city"
          },
          {
            label: "\u95E8\u5E97",
            target: "restaurant",
            icon: "store",
            active: true
          },
          {
            label: "\u7ECF\u8425",
            target: "operations",
            icon: "operations"
          },
          {
            label: "\u5458\u5DE5",
            target: "employees",
            icon: "employees"
          },
          {
            label: "\u66F4\u591A",
            target: "more",
            icon: "more"
          }
        ]
      };
    }
    completePermits(restaurantId2) {
      const result = openingFlowSystem.completePermits(
        restaurantId2
      );
      return {
        result,
        page: this.getPage(
          restaurantId2
        )
      };
    }
    purchaseStarterStock(restaurantId2) {
      const result = openingFlowSystem.purchaseStarterStock(
        restaurantId2
      );
      return {
        result,
        page: this.getPage(
          restaurantId2
        )
      };
    }
    configureSchedule(restaurantId2, options = {}) {
      openingFlowSystem.configureSchedule(
        restaurantId2,
        options
      );
      return this.getPage(
        restaurantId2
      );
    }
    openRestaurant(restaurantId2) {
      const restaurant = openingFlowSystem.openRestaurant(
        restaurantId2
      );
      return {
        restaurant,
        page: this.getPage(
          restaurantId2
        ),
        nextPage: "restaurant"
      };
    }
  };
  var openingSetupPageSystem = new OpeningSetupPageSystem();

  // src/ui/pages/opening/OpeningSetupView.js
  function escapeHtml5(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  var OpeningSetupView = class {
    constructor({
      pageSystem = openingSetupPageSystem,
      onNavigate = null
    } = {}) {
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.root = null;
      this.restaurantId = null;
      this.page = null;
      this.message = "";
    }
    mount(root2, {
      restaurantId: restaurantId2
    }) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.render();
      return this;
    }
    renderSteps(status) {
      return `
      <section class="opening-flow-panel">

        <header>
          <strong>
            \u5F00\u4E1A\u51C6\u5907\u6D41\u7A0B
          </strong>

          <span>
            8\u9879\u51C6\u5907 + \u6B63\u5F0F\u8425\u4E1A
          </span>
        </header>


        <div class="opening-step-line opening-step-line--nine">

          ${status.steps.map(
        (step, index) => `
                  <article
                    class="
                      opening-flow-step
                      opening-flow-step--${step.state}
                    "
                  >

                    <div class="opening-flow-step__number">
                      ${step.complete ? "\u2713" : index + 1}
                    </div>

                    <div class="opening-flow-step__copy">

                      <small>
                        STEP ${index + 1}
                      </small>

                      <strong>
                        ${escapeHtml5(
          step.label
        )}
                      </strong>

                      <span>
                        ${escapeHtml5(
          step.description
        )}
                      </span>

                    </div>

                    <b
                      class="
                        opening-step-status
                        ${step.complete ? "is-complete" : step.state === "current" ? "is-current" : ""}
                      "
                    >
                      ${step.complete ? "\u5DF2\u5B8C\u6210" : step.state === "current" ? "\u5F53\u524D\u4EFB\u52A1" : "\u5F85\u5B8C\u6210"}
                    </b>

                  </article>
                `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderPermitPanel(page) {
      return `
      <section class="opening-detail-panel">

        <header>
          <div>
            <strong>
              \u8BC1\u7167\u4E0E\u5F00\u4E1A\u8BB8\u53EF
            </strong>

            <span>
              \u6839\u636E\u623F\u6E90\u3001\u88C5\u4FEE\u4E0E\u83DC\u5355\u81EA\u52A8\u5224\u65AD\u5FC5\u8981\u9879\u76EE
            </span>
          </div>

          <b>
            ${page.permits.issuedCount}
            /
            ${page.permits.requiredCount}
          </b>
        </header>


        <div class="opening-permit-list">

          ${page.permits.permits.map(
        (permit) => `
                  <article
                    class="
                      ${!permit.required ? "is-optional" : permit.issued ? "is-complete" : permit.ready ? "is-ready" : "is-blocked"}
                    "
                  >

                    <span>
                      ${permit.issued ? "\u2713" : permit.required ? "\u2022" : "\u2014"}
                    </span>

                    <div>
                      <strong>
                        ${escapeHtml5(
          permit.name
        )}
                      </strong>

                      <small>
                        ${escapeHtml5(
          permit.reason
        )}
                      </small>
                    </div>

                  </article>
                `
      ).join("")}

        </div>


        <button
          type="button"
          class="opening-sub-action"
          data-opening-action="permits"
          ${page.permits.complete || !page.permits.allRequirementsReady ? "disabled" : ""}
        >
          ${page.permits.complete ? "\u8BB8\u53EF\u68C0\u67E5\u5DF2\u5B8C\u6210" : "\u5B8C\u6210\u5F00\u4E1A\u8BB8\u53EF\u68C0\u67E5"}
        </button>

      </section>
    `;
    }
    renderStockPanel(page) {
      return `
      <section class="opening-detail-panel">

        <header>
          <div>
            <strong>
              \u9996\u6279\u98DF\u6750\u51C6\u5907
            </strong>

            <span>
              \u6309\u5F53\u524D\u8425\u4E1A\u83DC\u5355\u51C6\u5907\u7EA6${page.stock.targetServings}\u4EFD\u57FA\u7840\u5E93\u5B58
            </span>
          </div>

          <b>
            ${page.stock.stockedCount}
            /
            ${page.stock.ingredientCount}
          </b>
        </header>


        <div class="opening-stock-list">

          ${page.stock.items.length ? page.stock.items.map(
        (item) => `
                      <article
                        class="${item.ready ? "is-complete" : item.pending > 0 ? "is-pending" : "is-missing"}"
                      >

                        <div>
                          <strong>
                            ${escapeHtml5(
          item.name
        )}
                          </strong>

                          <small>
                            \u9700\u8981
                            ${item.requiredQuantity}
                            ${escapeHtml5(
          item.unit
        )}
                          </small>
                        </div>

                        <span>
                          \u5E93\u5B58
                          ${item.available}
                        </span>

                        <span>
                          \u5728\u9014
                          ${item.pending}
                        </span>

                      </article>
                    `
      ).join("") : `
                <div class="opening-stock-empty">
                  \u8BBE\u7F6E\u8425\u4E1A\u83DC\u5355\u540E\u81EA\u52A8\u751F\u6210\u9996\u6279\u91C7\u8D2D\u9700\u6C42
                </div>
              `}

        </div>


        <button
          type="button"
          class="opening-sub-action"
          data-opening-action="stock"
          ${page.stock.complete || page.stock.recipeCount === 0 ? "disabled" : ""}
        >
          ${page.stock.complete ? "\u9996\u6279\u98DF\u6750\u5DF2\u5907\u9F50" : page.stock.pendingCount > 0 ? "\u8865\u5145\u4ECD\u7F3A\u5C11\u7684\u98DF\u6750" : "\u91C7\u8D2D\u9996\u6279\u98DF\u6750"}
        </button>

      </section>
    `;
    }
    renderMarkup(page) {
      const status = page.status;
      const next = status.nextAction;
      return `
      <main class="rg-screen opening-setup-page">

        ${renderGameTopBar(
        page.topBar,
        {
          locationLabel: page.location.district ?? "\u9996\u5E97\u7B79\u5907",
          subtitle: "\u4ECE\u7B2C\u4E00\u5BB6\u5C0F\u5E97\u5F00\u59CB"
        }
      )}

        ${renderNoticeTicker(
        page.noticeTicker
      )}

        ${renderPageTitle({
        title: "\u5F00\u5E97\u51C6\u5907",
        backTarget: "restaurant",
        helpLabel: "\u5F00\u5E97\u6307\u5357"
      })}


        ${this.message ? `
              <section class="opening-message">
                ${escapeHtml5(
        this.message
      )}
              </section>
            ` : ""}


        <section class="opening-hero-panel">

          <div class="opening-hero-copy">

            <span>
              \u5F00\u4E1A\u51C6\u5907\u5B8C\u6210\u5EA6
            </span>

            <strong>
              ${status.preparation.percent}%
            </strong>

            <small>
              ${status.preparation.complete}
              /
              ${status.preparation.total}
              \u9879\u51C6\u5907\u5DF2\u7ECF\u5B8C\u6210
            </small>

          </div>


          <div class="opening-progress-ring">

            <div
              style="
                --opening-progress:${status.preparation.percent}%;
              "
            >
              <strong>
                ${status.preparation.percent}
              </strong>

              <span>%</span>
            </div>

          </div>

        </section>


        <section class="opening-metrics">

          ${page.metrics.map(
        (metric) => `
                  <article class="opening-metric">

                    <span>
                      ${escapeHtml5(
          metric.label
        )}
                    </span>

                    <strong>
                      ${escapeHtml5(
          metric.value
        )}
                    </strong>

                  </article>
                `
      ).join("")}

        </section>


        ${this.renderSteps(
        status
      )}


        <section class="opening-readiness-grid">

          ${this.renderPermitPanel(
        page
      )}

          ${this.renderStockPanel(
        page
      )}

        </section>


        <section class="opening-current-task">

          <header>

            <span>
              \u5F53\u524D\u6700\u91CD\u8981\u4EFB\u52A1
            </span>

            <strong>
              ${escapeHtml5(
        next.label
      )}
            </strong>

          </header>


          <div class="opening-current-task__body">

            <div class="opening-current-task__icon">
              ${escapeHtml5(
        next.icon
      )}
            </div>

            <div>
              <strong>
                ${escapeHtml5(
        next.description
      )}
              </strong>

              <span>
                \u5FC5\u987B\u5B8C\u6210\u5F53\u524D\u6761\u4EF6\u540E\uFF0C\u4E0B\u4E00\u9636\u6BB5\u624D\u4F1A\u89E3\u9501\u3002
              </span>
            </div>

          </div>


          ${next.id === "permits" ? `
                <button
                  type="button"
                  class="opening-main-action"
                  data-opening-action="permits"
                  ${page.permits.allRequirementsReady ? "" : "disabled"}
                >
                  \u5B8C\u6210\u8BB8\u53EF\u68C0\u67E5
                </button>
              ` : next.id === "stock" ? `
                  <button
                    type="button"
                    class="opening-main-action"
                    data-opening-action="stock"
                    ${page.stock.recipeCount > 0 ? "" : "disabled"}
                  >
                    \u91C7\u8D2D\u9996\u6279\u98DF\u6750
                  </button>
                ` : next.id === "schedule" ? `
                    <button
                      type="button"
                      class="opening-main-action"
                      data-opening-action="schedule"
                    >
                      \u8BBE\u7F6E09:00\u201322:00\u8425\u4E1A
                    </button>
                  ` : next.id === "inspection" ? `
                      <button
                        type="button"
                        class="opening-main-action"
                        disabled
                      >
                        \u6B63\u5728\u7B49\u5F85\u5168\u90E8\u6761\u4EF6\u901A\u8FC7
                      </button>
                    ` : next.id === "opening" ? `
                        <button
                          type="button"
                          class="opening-main-action opening-main-action--gold"
                          data-opening-action="open"
                          ${status.canOpen ? "" : "disabled"}
                        >
                          \u2605 \u6B63\u5F0F\u8425\u4E1A
                        </button>
                      ` : `
                        <button
                          type="button"
                          class="opening-main-action"
                          data-page-target="${escapeHtml5(
        next.target
      )}"
                        >
                          \u53BB\u5B8C\u6210 \xB7
                          ${escapeHtml5(
        next.label
      )}
                        </button>
                      `}

        </section>


        ${renderBottomNavigation(
        gameChromeSystem.getNavigation({
          restaurantId: this.restaurantId,
          activePageId: "opening-setup"
        })
      )}

      </main>
    `;
    }
    render() {
      this.page = this.pageSystem.getPage(
        this.restaurantId
      );
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
      this.bind();
      return this.page;
    }
    bind() {
      this.root.querySelectorAll(
        "[data-page-target]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset.pageTarget,
                this.restaurantId
              );
            }
          );
        }
      );
      this.root.querySelectorAll(
        '[data-opening-action="permits"]'
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem.completePermits(
                  this.restaurantId
                );
                this.message = "\u5F00\u4E1A\u8BB8\u53EF\u68C0\u67E5\u5DF2\u7ECF\u5B8C\u6210";
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      this.root.querySelectorAll(
        '[data-opening-action="stock"]'
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              try {
                const result = this.pageSystem.purchaseStarterStock(
                  this.restaurantId
                );
                const count = result.result.orders.length;
                this.message = count > 0 ? `\u5DF2\u521B\u5EFA${count}\u5F20\u9996\u6279\u91C7\u8D2D\u5355\uFF0C\u98DF\u6750\u9001\u8FBE\u540E\u81EA\u52A8\u901A\u8FC7\u5E93\u5B58\u68C0\u67E5` : "\u5F53\u524D\u7F3A\u5C11\u7684\u98DF\u6750\u5DF2\u7ECF\u5728\u914D\u9001\u4E2D";
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      this.root.querySelector(
        '[data-opening-action="schedule"]'
      )?.addEventListener(
        "click",
        () => {
          this.pageSystem.configureSchedule(
            this.restaurantId,
            {
              openHour: 9,
              closeHour: 22
            }
          );
          this.message = "\u8425\u4E1A\u65F6\u95F4\u5DF2\u7ECF\u8BBE\u7F6E";
          this.render();
        }
      );
      this.root.querySelector(
        '[data-opening-action="open"]'
      )?.addEventListener(
        "click",
        () => {
          try {
            const result = this.pageSystem.openRestaurant(
              this.restaurantId
            );
            this.onNavigate?.(
              result.nextPage,
              this.restaurantId,
              result
            );
          } catch (error) {
            this.message = error.message;
            this.render();
          }
        }
      );
    }
  };
  var openingSetupView = new OpeningSetupView();

  // src/data/employeeCareer.js
  var EMPLOYEE_CAREER_RANKS = Object.freeze([
    {
      id: "apprentice",
      name: "\u5B66\u5F92",
      order: 0,
      minExperience: 0,
      minWorkMinutes: 0,
      minPrimarySkill: 0,
      minLoyalty: 0,
      salaryMultiplier: 1
    },
    {
      id: "skilled",
      name: "\u719F\u624B",
      order: 1,
      minExperience: 400,
      minWorkMinutes: 1200,
      minPrimarySkill: 35,
      minLoyalty: 35,
      salaryMultiplier: 1.08
    },
    {
      id: "core",
      name: "\u9AA8\u5E72",
      order: 2,
      minExperience: 1200,
      minWorkMinutes: 6e3,
      minPrimarySkill: 50,
      minLoyalty: 45,
      salaryMultiplier: 1.18
    },
    {
      id: "expert",
      name: "\u540D\u624B",
      order: 3,
      minExperience: 2800,
      minWorkMinutes: 18e3,
      minPrimarySkill: 68,
      minLoyalty: 55,
      salaryMultiplier: 1.35
    },
    {
      id: "master",
      name: "\u5927\u5E08",
      order: 4,
      minExperience: 5200,
      minWorkMinutes: 42e3,
      minPrimarySkill: 82,
      minLoyalty: 65,
      salaryMultiplier: 1.6
    }
  ]);
  var EMPLOYEE_TRAINING_PROGRAMS = Object.freeze({
    basic_training: {
      id: "basic_training",
      name: "\u57FA\u7840\u5C97\u4F4D\u8BAD\u7EC3",
      cost: 600,
      experience: 120,
      primarySkillGain: 4,
      secondarySkillGain: 1,
      fatigueGain: 6,
      moodGain: 1,
      loyaltyGain: 0,
      minRank: "apprentice"
    },
    role_drill: {
      id: "role_drill",
      name: "\u5C97\u4F4D\u5F3A\u5316\u8BAD\u7EC3",
      cost: 1200,
      experience: 220,
      primarySkillGain: 6,
      secondarySkillGain: 2,
      fatigueGain: 10,
      moodGain: 1,
      loyaltyGain: 1,
      minRank: "apprentice"
    },
    advanced_workshop: {
      id: "advanced_workshop",
      name: "\u9AD8\u7EA7\u6280\u80FD\u7814\u4FEE",
      cost: 2600,
      experience: 420,
      primarySkillGain: 8,
      secondarySkillGain: 4,
      fatigueGain: 14,
      moodGain: 2,
      loyaltyGain: 2,
      minRank: "core"
    }
  });

  // src/systems/EmployeeCareerSystem.js
  function clamp12(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function requireRank(rankId) {
    const rank = EMPLOYEE_CAREER_RANKS.find((item) => item.id === rankId);
    if (!rank) {
      throw new Error(`Unknown employee career rank "${rankId}"`);
    }
    return rank;
  }
  function requireTraining(programId) {
    const program = EMPLOYEE_TRAINING_PROGRAMS[programId];
    if (!program) {
      throw new Error(`Unknown training program "${programId}"`);
    }
    return program;
  }
  var EmployeeCareerSystem = class {
    getRank(employeeOrId) {
      const employee = typeof employeeOrId === "string" ? employeeSystem.get(employeeOrId) : employeeOrId;
      return structuredClone(
        requireRank(employee.careerRankId ?? "apprentice")
      );
    }
    getNextRank(employeeOrId) {
      const current = this.getRank(employeeOrId);
      const next = EMPLOYEE_CAREER_RANKS.find(
        (item) => item.order === current.order + 1
      );
      return next ? structuredClone(next) : null;
    }
    getRecommendedSalary(employeeOrId, rankId = null) {
      const employee = typeof employeeOrId === "string" ? employeeSystem.get(employeeOrId) : employeeOrId;
      const role = employeeSystem.getRole(employee.roleId);
      const rank = rankId ? requireRank(rankId) : this.getRank(employee);
      return Math.round(role.baseSalary * rank.salaryMultiplier);
    }
    getSalarySatisfaction(employeeOrId) {
      const employee = typeof employeeOrId === "string" ? employeeSystem.get(employeeOrId) : employeeOrId;
      const recommended = this.getRecommendedSalary(employee);
      const ratio = employee.salary / Math.max(1, recommended);
      const score = clamp12(
        Math.round(55 + (ratio - 1) * 150),
        0,
        100
      );
      return {
        score,
        recommended,
        actual: employee.salary,
        ratio: Number(ratio.toFixed(3)),
        state: score >= 80 ? "satisfied" : score >= 55 ? "stable" : score >= 35 ? "unhappy" : "critical"
      };
    }
    getPromotionStatus(employeeId) {
      const employee = employeeSystem.get(employeeId);
      const current = this.getRank(employee);
      const next = this.getNextRank(employee);
      const role = employeeSystem.getRole(employee.roleId);
      const primarySkill = employee.skills?.[role.primarySkill] ?? 0;
      if (!next) {
        return {
          employeeId,
          current,
          next: null,
          eligible: false,
          maxRank: true,
          requirements: []
        };
      }
      const requirements = [
        {
          id: "experience",
          label: "\u7ECF\u9A8C",
          current: employee.experience ?? 0,
          required: next.minExperience,
          met: (employee.experience ?? 0) >= next.minExperience
        },
        {
          id: "workMinutes",
          label: "\u5DE5\u4F5C\u65F6\u957F",
          current: employee.totalWorkMinutes ?? 0,
          required: next.minWorkMinutes,
          met: (employee.totalWorkMinutes ?? 0) >= next.minWorkMinutes
        },
        {
          id: "primarySkill",
          label: "\u5C97\u4F4D\u4E3B\u6280\u80FD",
          current: primarySkill,
          required: next.minPrimarySkill,
          met: primarySkill >= next.minPrimarySkill
        },
        {
          id: "loyalty",
          label: "\u5FE0\u8BDA\u5EA6",
          current: employee.loyalty ?? 50,
          required: next.minLoyalty,
          met: (employee.loyalty ?? 50) >= next.minLoyalty
        }
      ];
      return {
        employeeId,
        current,
        next,
        eligible: requirements.every((item) => item.met),
        maxRank: false,
        requirements,
        recommendedSalaryAfterPromotion: this.getRecommendedSalary(employee, next.id)
      };
    }
    promote(employeeId) {
      const employee = employeeSystem.get(employeeId);
      const status = this.getPromotionStatus(employeeId);
      if (!status.next) {
        throw new Error("Employee is already at the highest career rank");
      }
      if (!status.eligible) {
        const missing = status.requirements.filter((item) => !item.met).map((item) => item.label).join("\u3001");
        throw new Error(`Promotion requirements not met: ${missing}`);
      }
      const salary = Math.max(
        employee.salary,
        status.recommendedSalaryAfterPromotion
      );
      const updated = entitySystem.update("employee", employeeId, {
        careerRankId: status.next.id,
        careerRankOrder: status.next.order,
        promotionCount: (employee.promotionCount ?? 0) + 1,
        salary,
        mood: clamp12((employee.mood ?? 70) + 8, 0, 100),
        loyalty: clamp12((employee.loyalty ?? 50) + 5, 0, 100)
      });
      eventBus.emit("employee:promoted", {
        employeeId,
        restaurantId: employee.restaurantId,
        oldRank: status.current.id,
        newRank: status.next.id,
        salary
      });
      return updated;
    }
    getTrainingPrograms(employeeId) {
      const employee = employeeSystem.get(employeeId);
      const currentRank = this.getRank(employee);
      return Object.values(EMPLOYEE_TRAINING_PROGRAMS).map((program) => {
        const minRank = requireRank(program.minRank);
        return {
          ...structuredClone(program),
          unlocked: currentRank.order >= minRank.order
        };
      });
    }
    train(employeeId, programId) {
      const employee = employeeSystem.get(employeeId);
      const program = requireTraining(programId);
      const currentRank = this.getRank(employee);
      const minRank = requireRank(program.minRank);
      if (currentRank.order < minRank.order) {
        throw new Error(`Training requires rank ${minRank.name}`);
      }
      if (employee.fatigue >= 90) {
        throw new Error("Employee is too fatigued for training");
      }
      financeSystem.expense(
        employee.restaurantId,
        program.cost,
        CATEGORY.OTHER,
        `\u5458\u5DE5\u57F9\u8BAD ${employee.name} \xB7 ${program.name}`
      );
      const role = employeeSystem.getRole(employee.roleId);
      const skills = { ...employee.skills ?? {} };
      const skillProfile = role.skillProfile ?? [role.primarySkill];
      for (const skill of skillProfile) {
        const gain = skill === role.primarySkill ? program.primarySkillGain : program.secondarySkillGain;
        skills[skill] = clamp12((skills[skill] ?? 0) + gain, 0, 100);
      }
      const updated = entitySystem.update("employee", employeeId, {
        experience: (employee.experience ?? 0) + program.experience,
        level: Math.floor(((employee.experience ?? 0) + program.experience) / 1e3) + 1,
        skills,
        fatigue: clamp12((employee.fatigue ?? 0) + program.fatigueGain, 0, 100),
        mood: clamp12((employee.mood ?? 70) + program.moodGain, 0, 100),
        loyalty: clamp12((employee.loyalty ?? 50) + program.loyaltyGain, 0, 100),
        trainingCount: (employee.trainingCount ?? 0) + 1
      });
      eventBus.emit("employee:trained", {
        employeeId,
        restaurantId: employee.restaurantId,
        programId,
        cost: program.cost
      });
      return {
        employee: updated,
        program: structuredClone(program),
        promotion: this.getPromotionStatus(employeeId)
      };
    }
    getProfile(employeeId) {
      const employee = employeeSystem.get(employeeId);
      const role = employeeSystem.getRole(employee.roleId);
      return {
        employee: structuredClone(employee),
        role,
        rank: this.getRank(employee),
        nextRank: this.getNextRank(employee),
        promotion: this.getPromotionStatus(employeeId),
        salarySatisfaction: this.getSalarySatisfaction(employee),
        trainingPrograms: this.getTrainingPrograms(employeeId),
        state: {
          fatigue: employee.fatigue ?? 0,
          mood: employee.mood ?? 70,
          loyalty: employee.loyalty ?? 50,
          salary: employee.salary,
          primarySkill: employee.skills?.[role.primarySkill] ?? 0
        }
      };
    }
  };
  var employeeCareerSystem = new EmployeeCareerSystem();

  // src/systems/EmployeeDynamicsSystem.js
  var AVATAR_COUNTS = Object.freeze({
    chef: 24,
    server: 30,
    cashier: 16,
    kitchen_assistant: 20,
    cleaner: 16,
    delivery: 18,
    manager: 16
  });
  var TRAINING_MILESTONES = Object.freeze([
    1,
    3,
    6,
    10,
    15,
    21,
    28,
    36
  ]);
  function clamp13(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  function hashString4(value) {
    let hash = 2166136261;
    for (let index = 0; index < String(value).length; index += 1) {
      hash ^= String(value).charCodeAt(
        index
      );
      hash = Math.imul(
        hash,
        16777619
      );
    }
    return hash >>> 0;
  }
  var EmployeeDynamicsSystem = class {
    getAvatarId(employee) {
      if (employee.avatarId) {
        return employee.avatarId;
      }
      const count = AVATAR_COUNTS[employee.roleId] ?? 16;
      const number = hashString4(
        `${employee.id}:${employee.roleId}`
      ) % count + 1;
      return `${employee.roleId}_` + String(
        number
      ).padStart(
        2,
        "0"
      );
    }
    getAvatarPath(employee) {
      const avatarId = this.getAvatarId(
        employee
      );
      return "assets/images/ui/employees/avatars/" + avatarId + ".webp";
    }
    calculateSatisfaction(employee) {
      const salary = employeeCareerSystem.getSalarySatisfaction(
        employee
      );
      const mood = clamp13(
        employee.mood ?? 70,
        0,
        100
      );
      const loyalty = clamp13(
        employee.loyalty ?? 50,
        0,
        100
      );
      const fatigue = clamp13(
        employee.fatigue ?? 0,
        0,
        100
      );
      const fatigueComfort = 100 - fatigue;
      const rawScore = Math.round(
        salary.score * 0.35 + mood * 0.25 + loyalty * 0.25 + fatigueComfort * 0.15
      );
      let state = "stable";
      let label = "\u7A33\u5B9A";
      if (rawScore >= 85) {
        state = "excellent";
        label = "\u975E\u5E38\u6EE1\u610F";
      } else if (rawScore >= 70) {
        state = "good";
        label = "\u6EE1\u610F";
      } else if (rawScore >= 55) {
        state = "stable";
        label = "\u4E00\u822C";
      } else if (rawScore >= 40) {
        state = "warning";
        label = "\u4E0D\u6EE1";
      } else {
        state = "critical";
        label = "\u5F3A\u70C8\u4E0D\u6EE1";
      }
      return {
        score: clamp13(
          rawScore,
          0,
          100
        ),
        state,
        label,
        components: {
          salary: salary.score,
          mood,
          loyalty,
          fatigueComfort
        },
        salaryState: salary.state,
        recommendedSalary: salary.recommended,
        actualSalary: salary.actual
      };
    }
    getTrainingProgress(employee) {
      const count = Math.max(
        0,
        employee.trainingCount ?? 0
      );
      const next = TRAINING_MILESTONES.find(
        (value) => value > count
      );
      if (!next) {
        return {
          count,
          previousTarget: TRAINING_MILESTONES[TRAINING_MILESTONES.length - 1],
          nextTarget: null,
          percent: 100,
          complete: true,
          label: "\u57F9\u8BAD\u8D44\u5386\u5145\u5206"
        };
      }
      const previous = [
        ...TRAINING_MILESTONES
      ].reverse().find(
        (value) => value <= count
      ) ?? 0;
      const span = Math.max(
        1,
        next - previous
      );
      const percent = Math.round(
        (count - previous) / span * 100
      );
      return {
        count,
        previousTarget: previous,
        nextTarget: next,
        percent: clamp13(
          percent,
          0,
          100
        ),
        complete: false,
        label: `${count}/${next}\u6B21\u57F9\u8BAD`
      };
    }
    ensureEmployeeProfile(employeeId) {
      let employee = employeeSystem.get(
        employeeId
      );
      const avatarId = this.getAvatarId(
        employee
      );
      const satisfaction = this.calculateSatisfaction(
        employee
      );
      const day = gameState.getSection(
        "time"
      )?.day ?? 1;
      const patch = {};
      if (!employee.avatarId) {
        patch.avatarId = avatarId;
      }
      if (!Number.isFinite(
        employee.satisfaction
      )) {
        patch.satisfaction = satisfaction.score;
        patch.satisfactionUpdatedDay = day;
      }
      if (Object.keys(
        patch
      ).length > 0) {
        employee = entitySystem.update(
          "employee",
          employee.id,
          patch
        );
      }
      return employee;
    }
    refreshEmployee(employeeId, {
      force = false
    } = {}) {
      let employee = this.ensureEmployeeProfile(
        employeeId
      );
      const day = gameState.getSection(
        "time"
      )?.day ?? 1;
      if (!force && employee.satisfactionUpdatedDay === day) {
        return {
          employee,
          satisfaction: this.calculateSatisfaction(
            employee
          ),
          training: this.getTrainingProgress(
            employee
          )
        };
      }
      const calculated = this.calculateSatisfaction(
        employee
      );
      const previous = Number.isFinite(
        employee.satisfaction
      ) ? employee.satisfaction : calculated.score;
      const smoothed = clamp13(
        Math.round(
          previous * 0.6 + calculated.score * 0.4
        ),
        0,
        100
      );
      employee = entitySystem.update(
        "employee",
        employee.id,
        {
          avatarId: employee.avatarId ?? this.getAvatarId(
            employee
          ),
          satisfaction: smoothed,
          satisfactionUpdatedDay: day
        }
      );
      return {
        employee,
        satisfaction: {
          ...calculated,
          score: smoothed
        },
        training: this.getTrainingProgress(
          employee
        )
      };
    }
    refreshRestaurant(restaurantId2, options = {}) {
      return employeeSystem.listByRestaurant(
        restaurantId2
      ).map(
        (employee) => this.refreshEmployee(
          employee.id,
          options
        )
      );
    }
    getProfile(employeeId) {
      const refreshed = this.refreshEmployee(
        employeeId
      );
      return {
        employee: refreshed.employee,
        avatarId: refreshed.employee.avatarId,
        avatarPath: this.getAvatarPath(
          refreshed.employee
        ),
        satisfaction: refreshed.satisfaction,
        training: refreshed.training
      };
    }
  };
  var employeeDynamicsSystem = new EmployeeDynamicsSystem();

  // src/ui/pages/employees/EmployeeManagementPageSystem.js
  var SKILL_LABELS = Object.freeze({
    cooking: "\u70F9\u996A",
    speed: "\u901F\u5EA6",
    quality: "\u54C1\u8D28",
    innovation: "\u521B\u65B0",
    wasteControl: "\u635F\u8017\u63A7\u5236",
    stability: "\u7A33\u5B9A",
    service: "\u670D\u52A1",
    servingSpeed: "\u4E0A\u83DC\u901F\u5EA6",
    guestCare: "\u987E\u5BA2\u7167\u987E",
    tableTurn: "\u7FFB\u53F0",
    peakPressure: "\u9AD8\u5CF0\u5E94\u5BF9",
    checkout: "\u6536\u94F6",
    accuracy: "\u51C6\u786E\u7387",
    upselling: "\u63A8\u8350\u9500\u552E",
    compliance: "\u89C4\u8303",
    prep: "\u5907\u9910",
    kitchenSpeed: "\u540E\u53A8\u901F\u5EA6",
    cleanliness: "\u6574\u6D01",
    cleaning: "\u4FDD\u6D01",
    hygiene: "\u536B\u751F",
    efficiency: "\u6548\u7387",
    inspection: "\u5DE1\u68C0",
    delivery: "\u914D\u9001",
    route: "\u8DEF\u7EBF",
    punctuality: "\u51C6\u65F6",
    care: "\u8D27\u54C1\u4FDD\u62A4",
    management: "\u7BA1\u7406",
    scheduling: "\u6392\u73ED",
    costControl: "\u6210\u672C\u63A7\u5236",
    morale: "\u56E2\u961F\u58EB\u6C14",
    promotionExecution: "\u664B\u5347\u6267\u884C"
  });
  function safeBalance7(restaurantId2) {
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return 0;
    }
  }
  function clamp14(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  function average2(values) {
    if (values.length === 0) {
      return 0;
    }
    return Math.round(
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
    );
  }
  var EmployeeManagementPageSystem = class {
    getStatus(employee) {
      if (employee.fatigue >= 90) {
        return {
          label: "\u9AD8\u75B2\u52B3",
          tone: "danger"
        };
      }
      if (employee.status === "resting") {
        return {
          label: "\u4F11\u606F",
          tone: "warning"
        };
      }
      if (employee.status === "off_duty") {
        return {
          label: "\u4E0B\u73ED",
          tone: "neutral"
        };
      }
      return {
        label: "\u5728\u5C97",
        tone: "success"
      };
    }
    getShift(employee) {
      const shifts = entitySystem.list(
        "workforce_shift"
      ).filter(
        (item) => item.employeeId === employee.id
      );
      const latest = shifts.at(
        -1
      );
      if (latest) {
        return {
          label: latest.label ?? latest.shiftName ?? "\u5DF2\u6392\u73ED",
          startHour: latest.startHour ?? null,
          endHour: latest.endHour ?? null
        };
      }
      return {
        label: employee.status === "off_duty" ? "\u5F53\u524D\u4F11\u606F" : "\u5E38\u89C4\u73ED",
        startHour: null,
        endHour: null
      };
    }
    getPromotionReadiness(promotion) {
      if (promotion.maxRank) {
        return 100;
      }
      if (!promotion.requirements?.length) {
        return 0;
      }
      const values = promotion.requirements.map(
        (item) => {
          if (item.required <= 0) {
            return 100;
          }
          return clamp14(
            Math.round(
              item.current / item.required * 100
            ),
            0,
            100
          );
        }
      );
      return average2(
        values
      );
    }
    getEmployeeView(employee) {
      const dynamic = employeeDynamicsSystem.getProfile(
        employee.id
      );
      const current = dynamic.employee;
      const career = employeeCareerSystem.getProfile(
        current.id
      );
      const role = career.role;
      const skills = Object.entries(
        current.skills ?? {}
      ).map(
        ([
          id,
          value
        ]) => ({
          id,
          label: SKILL_LABELS[id] ?? id,
          value
        })
      ).sort(
        (a, b) => b.value - a.value
      );
      const levelProgress = (current.experience ?? 0) % 1e3 / 10;
      const satisfaction = dynamic.satisfaction;
      return {
        id: current.id,
        name: current.name,
        roleId: current.roleId,
        roleName: role.name,
        avatarId: dynamic.avatarId,
        avatar: dynamic.avatarPath,
        level: current.level,
        levelProgress: Math.round(
          levelProgress
        ),
        experience: current.experience ?? 0,
        rank: career.rank,
        nextRank: career.nextRank,
        promotion: career.promotion,
        promotionReadiness: this.getPromotionReadiness(
          career.promotion
        ),
        salary: current.salary,
        salarySatisfaction: career.salarySatisfaction,
        satisfaction,
        satisfactionScore: satisfaction.score,
        mood: current.mood ?? 70,
        loyalty: current.loyalty ?? 50,
        fatigue: current.fatigue ?? 0,
        status: this.getStatus(
          current
        ),
        shift: this.getShift(
          current
        ),
        skills,
        topSkills: skills.slice(
          0,
          2
        ),
        primarySkill: {
          id: role.primarySkill,
          label: SKILL_LABELS[role.primarySkill] ?? role.primarySkill,
          value: current.skills?.[role.primarySkill] ?? 0
        },
        training: dynamic.training,
        trainingCount: current.trainingCount ?? 0,
        totalWorkMinutes: current.totalWorkMinutes ?? 0
      };
    }
    getScheduleSummary(employees) {
      return {
        active: employees.filter(
          (item) => item.status.label === "\u5728\u5C97"
        ).length,
        resting: employees.filter(
          (item) => item.status.label === "\u4F11\u606F"
        ).length,
        offDuty: employees.filter(
          (item) => item.status.label === "\u4E0B\u73ED"
        ).length,
        fatigued: employees.filter(
          (item) => item.fatigue >= 80
        ).length
      };
    }
    getPage(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      employeeDynamicsSystem.refreshRestaurant(
        restaurantId2
      );
      const employees = employeeSystem.listByRestaurant(
        restaurantId2
      ).map(
        (employee) => this.getEmployeeView(
          employee
        )
      );
      const staffing = staffingRecommendationSystem.getRecommendation(
        restaurantId2
      );
      const satisfactionAverage = average2(
        employees.map(
          (employee) => employee.satisfactionScore
        )
      );
      const payroll = employeeSystem.getPayroll(
        restaurantId2
      );
      const scheduleSummary = this.getScheduleSummary(
        employees
      );
      const vacancies = staffing.roles.filter(
        (item) => item.shortage > 0
      );
      const promotionCandidates = employees.filter(
        (employee) => !employee.promotion.maxRank
      ).sort(
        (a, b) => b.promotionReadiness - a.promotionReadiness
      ).slice(
        0,
        5
      );
      const trainingEmployees = [
        ...employees
      ].sort(
        (a, b) => b.training.percent - a.training.percent
      ).slice(
        0,
        5
      );
      const limits = storeProgressSystem.getLimits(
        restaurantId2
      );
      const time = gameState.getSection(
        "time"
      );
      const runtime = gameState.getSection(
        "runtime"
      );
      const notices = [];
      if (staffing.totalShortage > 0) {
        notices.push({
          id: "staff_shortage",
          type: "warning",
          title: "\u4EBA\u5458\u7F3A\u53E3",
          message: `\u6309\u5F53\u524D\u95E8\u5E97\u7ECF\u8425\u89C4\u6A21\u5EFA\u8BAE\u8865\u5145${staffing.totalShortage}\u540D\u5458\u5DE5`,
          priority: 100,
          action: "employees"
        });
      }
      const unhappy = employees.filter(
        (employee) => employee.satisfactionScore < 50
      );
      if (unhappy.length > 0) {
        notices.push({
          id: "employee_satisfaction",
          type: "warning",
          title: "\u5458\u5DE5\u6EE1\u610F\u5EA6",
          message: `${unhappy.length}\u540D\u5458\u5DE5\u6EE1\u610F\u5EA6\u4F4E\u4E8E50\uFF0C\u9700\u8981\u5904\u7406\u5DE5\u8D44\u3001\u75B2\u52B3\u6216\u58EB\u6C14\u95EE\u9898`,
          priority: 80,
          action: "employees"
        });
      }
      return {
        pageId: "employees",
        topBar: buildGlobalTopBarModel({
          restaurantName: restaurant.name,
          balance: safeBalance7(
            restaurantId2
          ),
          storeLevel: restaurant.level,
          reputation: restaurant.reputation,
          time,
          runtime,
          currentStoreId: restaurantId2
        }),
        noticeTicker: buildNoticeTickerModel(
          notices
        ),
        metrics: [
          {
            label: "\u5458\u5DE5\u603B\u6570",
            value: `${employees.length}/${limits.employees}`,
            tone: "primary"
          },
          {
            label: "\u5F53\u524D\u5728\u5C97",
            value: `${scheduleSummary.active}\u4EBA`,
            tone: "success"
          },
          {
            label: "\u5E73\u5747\u6EE1\u610F\u5EA6",
            value: `${satisfactionAverage}`,
            suffix: "/100",
            tone: satisfactionAverage >= 70 ? "success" : satisfactionAverage >= 50 ? "warning" : "danger"
          },
          {
            label: "\u6708\u5DE5\u8D44",
            value: `\xA5${payroll.toLocaleString("zh-CN")}`,
            tone: "primary"
          },
          {
            label: "\u5EFA\u8BAE\u7F3A\u5458",
            value: `${staffing.totalShortage}\u4EBA`,
            tone: staffing.totalShortage === 0 ? "success" : "warning"
          }
        ],
        employees,
        scheduleSummary,
        staffing,
        vacancies,
        trainingEmployees,
        promotionCandidates,
        careerRanks: [
          ...EMPLOYEE_CAREER_RANKS
        ],
        staffCap: limits.employees,
        bottomNavigation: [
          {
            label: "\u57CE\u5E02",
            target: "city",
            icon: "city"
          },
          {
            label: "\u95E8\u5E97",
            target: "restaurant",
            icon: "store"
          },
          {
            label: "\u7ECF\u8425",
            target: "operations",
            icon: "operations"
          },
          {
            label: "\u5458\u5DE5",
            target: "employees",
            icon: "employees",
            active: true
          },
          {
            label: "\u66F4\u591A",
            target: "more",
            icon: "more"
          }
        ]
      };
    }
  };
  var employeeManagementPageSystem = new EmployeeManagementPageSystem();

  // src/ui/pages/employees/EmployeeManagementView.js
  function escapeHtml6(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money5(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function renderAvatar(employee) {
    return `
    <div
      class="
        employee-avatar-slot
        employee-avatar-slot--${escapeHtml6(
      employee.roleId
    )}
      "
      data-image-slot="employee-avatar-${escapeHtml6(
      employee.avatarId
    )}"
      data-avatar-id="${escapeHtml6(
      employee.avatarId
    )}"
    >

      <span>
        ${escapeHtml6(
      employee.name.slice(
        0,
        1
      )
    )}
      </span>

      <small>
        \u5934\u50CF\u69FD\u4F4D
      </small>

    </div>
  `;
  }
  var EmployeeManagementView = class {
    constructor({
      root: root2 = null,
      restaurantId: restaurantId2 = null,
      pageSystem = employeeManagementPageSystem,
      onNavigate = null
    } = {}) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.page = null;
      this.tab = "all";
    }
    mount(root2 = this.root, {
      restaurantId: restaurantId2 = this.restaurantId
    } = {}) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.render();
      return this;
    }
    getEmployees() {
      const employees = this.page.employees;
      if (this.tab === "all") {
        return employees;
      }
      return employees.filter(
        (employee) => employee.roleId === this.tab
      );
    }
    renderMetrics() {
      return `
      <section class="employee-metrics">

        ${this.page.metrics.map(
        (metric) => `
                <article
                  class="employee-metric employee-metric--${metric.tone}"
                >

                  <span>
                    ${escapeHtml6(
          metric.label
        )}
                  </span>

                  <strong>
                    ${escapeHtml6(
          metric.value
        )}
                  </strong>

                  ${metric.suffix ? `
                        <small>
                          ${escapeHtml6(
          metric.suffix
        )}
                        </small>
                      ` : ""}

                </article>
              `
      ).join("")}

      </section>
    `;
    }
    renderEmployeeTable() {
      const employees = this.getEmployees();
      return `
      <section class="employee-panel employee-list-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              \u5458\u5DE5\u5217\u8868
            </strong>

            <span>
              \u6EE1\u610F\u5EA6\u3001\u75B2\u52B3\u3001\u6280\u80FD\u4E0E\u664B\u5347\u72B6\u6001\u5747\u5B9E\u65F6\u53D8\u5316
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_recruitment"
          >
            \uFF0B \u62DB\u8058\u5458\u5DE5
          </button>

        </header>


        <nav class="employee-role-tabs">

          ${[
        [
          "all",
          "\u5168\u90E8"
        ],
        [
          "chef",
          "\u53A8\u5E08"
        ],
        [
          "server",
          "\u670D\u52A1\u5458"
        ],
        [
          "cashier",
          "\u6536\u94F6"
        ],
        [
          "kitchen_assistant",
          "\u540E\u53A8"
        ]
      ].map(
        ([
          id,
          label
        ]) => `
                  <button
                    type="button"
                    class="${this.tab === id ? "is-active" : ""}"
                    data-employee-tab="${id}"
                  >
                    ${label}
                  </button>
                `
      ).join("")}

        </nav>


        <div class="employee-table-head">

          <span>
            \u5458\u5DE5
          </span>

          <span>
            \u7B49\u7EA7
          </span>

          <span>
            \u5C97\u4F4D\u6280\u80FD
          </span>

          <span>
            \u72B6\u6001
          </span>

          <span>
            \u6708\u85AA
          </span>

          <span>
            \u6EE1\u610F\u5EA6
          </span>

          <span>
            \u64CD\u4F5C
          </span>

        </div>


        <div class="employee-list">

          ${employees.length ? employees.map(
        (employee) => `
                      <article class="employee-row">

                        <div class="employee-row__person">

                          ${renderAvatar(
          employee
        )}

                          <div>
                            <strong>
                              ${escapeHtml6(
          employee.name
        )}
                            </strong>

                            <span>
                              ${escapeHtml6(
          employee.roleName
        )}
                              \xB7
                              ${escapeHtml6(
          employee.rank.name
        )}
                            </span>
                          </div>

                        </div>


                        <div class="employee-level">

                          <strong>
                            Lv.${employee.level}
                          </strong>

                          <div>
                            <i
                              style="
                                width:${employee.levelProgress}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <div class="employee-skill">

                          <strong>
                            ${escapeHtml6(
          employee.primarySkill.label
        )}
                          </strong>

                          <span>
                            ${employee.primarySkill.value}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.primarySkill.value}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <div
                          class="
                            employee-status
                            employee-status--${employee.status.tone}
                          "
                        >
                          <strong>
                            ${escapeHtml6(
          employee.status.label
        )}
                          </strong>

                          <small>
                            \u75B2\u52B3
                            ${employee.fatigue}
                          </small>
                        </div>


                        <div class="employee-salary">

                          <strong>
                            ${money5(
          employee.salary
        )}
                          </strong>

                          <small>
                            ${employee.salarySatisfaction.score}\u5206\u5DE5\u8D44\u611F\u53D7
                          </small>

                        </div>


                        <div class="employee-satisfaction">

                          <strong>
                            ${employee.satisfactionScore}
                          </strong>

                          <span>
                            ${escapeHtml6(
          employee.satisfaction.label
        )}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.satisfactionScore}%;
                              "
                            ></i>
                          </div>

                        </div>


                        <button
                          type="button"
                          class="employee-detail-button"
                          data-employee-id="${employee.id}"
                          data-page-target="employee_detail"
                        >
                          \u8BE6\u60C5
                        </button>

                      </article>
                    `
      ).join("") : `
                <div class="employee-empty">
                  \u5F53\u524D\u5206\u7C7B\u6CA1\u6709\u5458\u5DE5
                </div>
              `}

        </div>

      </section>
    `;
    }
    renderStaffing() {
      const staffing = this.page.staffing;
      return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              \u52A8\u6001\u63A8\u8350\u7F16\u5236
            </strong>

            <span>
              \u4E0D\u662F\u56FA\u5B9A\u4EBA\u6570\uFF0C\u6309\u9910\u4F4D\u3001\u8425\u4E1A\u65F6\u95F4\u3001\u8BA2\u5355\u91CF\u548C\u5458\u5DE5\u6548\u7387\u8BA1\u7B97
            </span>
          </div>

          <b
            class="${staffing.balanced ? "is-good" : "is-warning"}"
          >
            ${staffing.balanced ? "\u7F16\u5236\u5E73\u8861" : `\u7F3A${staffing.totalShortage}\u4EBA`}
          </b>

        </header>


        <div class="staffing-basis">

          <article>
            <span>
              \u9910\u4F4D
            </span>

            <strong>
              ${staffing.basis.seats}
            </strong>
          </article>

          <article>
            <span>
              \u8425\u4E1A\u65F6\u957F
            </span>

            <strong>
              ${staffing.basis.operatingHours}h
            </strong>
          </article>

          <article>
            <span>
              \u65E5\u5747\u8BA2\u5355
            </span>

            <strong>
              ${staffing.basis.averageDailyOrders}
            </strong>
          </article>

          <article>
            <span>
              \u9884\u8BA1\u5CF0\u503C
            </span>

            <strong>
              ${staffing.basis.estimatedPeakOrdersPerHour}/h
            </strong>
          </article>

          <article>
            <span>
              \u53A8\u5E08\u6548\u7387
            </span>

            <strong>
              ${staffing.basis.averageChefSkill}
            </strong>
          </article>

          <article>
            <span>
              \u670D\u52A1\u6548\u7387
            </span>

            <strong>
              ${staffing.basis.averageServerSkill}
            </strong>
          </article>

        </div>


        <div class="staffing-table">

          <div class="staffing-table-head">
            <span>\u5C97\u4F4D</span>
            <span>\u5F53\u524D</span>
            <span>\u5EFA\u8BAE</span>
            <span>\u7F3A\u53E3</span>
            <span>\u4F9D\u636E</span>
          </div>

          ${staffing.roles.map(
        (role) => `
                  <article
                    class="
                      staffing-row
                      staffing-row--${role.state}
                    "
                  >

                    <strong>
                      ${escapeHtml6(
          role.name
        )}
                    </strong>

                    <span>
                      ${role.current}
                    </span>

                    <span>
                      ${role.recommended}
                    </span>

                    <b>
                      ${role.shortage > 0 ? `\u7F3A${role.shortage}` : role.surplus > 0 ? `\u591A${role.surplus}` : "\u6B63\u5E38"}
                    </b>

                    <small>
                      ${escapeHtml6(
          role.reason
        )}
                    </small>

                  </article>
                `
      ).join("")}

        </div>

      </section>
    `;
    }
    renderTraining() {
      return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              \u57F9\u8BAD\u6210\u957F
            </strong>

            <span>
              \u8FD9\u91CC\u7EDF\u8BA1\u771F\u5B9E\u57F9\u8BAD\u6B21\u6570\uFF0C\u4E0D\u518D\u62FF\u6280\u80FD\u503C\u5192\u5145\u57F9\u8BAD\u8FDB\u5EA6
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_training"
          >
            \u57F9\u8BAD\u4E2D\u5FC3
          </button>

        </header>


        <div class="employee-training-list">

          ${this.page.trainingEmployees.length ? this.page.trainingEmployees.map(
        (employee) => `
                      <article>

                        <div>
                          <strong>
                            ${escapeHtml6(
          employee.name
        )}
                          </strong>

                          <span>
                            ${escapeHtml6(
          employee.roleName
        )}
                          </span>
                        </div>

                        <div class="employee-training-progress">

                          <span>
                            ${escapeHtml6(
          employee.training.label
        )}
                          </span>

                          <div>
                            <i
                              style="
                                width:${employee.training.percent}%;
                              "
                            ></i>
                          </div>

                        </div>

                        <strong>
                          ${employee.trainingCount}\u6B21
                        </strong>

                      </article>
                    `
      ).join("") : `
                <div class="employee-empty">
                  \u6682\u65E0\u57F9\u8BAD\u8BB0\u5F55
                </div>
              `}

        </div>

      </section>
    `;
    }
    renderPromotion() {
      return `
      <section class="employee-panel">

        <header class="employee-panel-title">

          <div>
            <strong>
              \u664B\u5347\u5019\u9009\u4EBA
            </strong>

            <span>
              \u6839\u636E\u7ECF\u9A8C\u3001\u5DE5\u65F6\u3001\u4E3B\u6280\u80FD\u3001\u5FE0\u8BDA\u5EA6\u7EFC\u5408\u5224\u65AD
            </span>
          </div>

          <button
            type="button"
            data-page-target="employee_promotion"
          >
            \u664B\u5347\u4E2D\u5FC3
          </button>

        </header>


        <div class="employee-promotion-list">

          ${this.page.promotionCandidates.length ? this.page.promotionCandidates.map(
        (employee) => `
                      <article>

                        ${renderAvatar(
          employee
        )}

                        <div>
                          <strong>
                            ${escapeHtml6(
          employee.name
        )}
                          </strong>

                          <span>
                            ${escapeHtml6(
          employee.rank.name
        )}
                            \u2192
                            ${escapeHtml6(
          employee.nextRank?.name ?? "\u6700\u9AD8\u804C\u7EA7"
        )}
                          </span>
                        </div>

                        <div class="promotion-readiness">

                          <span>
                            \u664B\u5347\u51C6\u5907\u5EA6
                          </span>

                          <strong>
                            ${employee.promotionReadiness}%
                          </strong>

                          <div>
                            <i
                              style="
                                width:${employee.promotionReadiness}%;
                              "
                            ></i>
                          </div>

                        </div>

                      </article>
                    `
      ).join("") : `
                <div class="employee-empty">
                  \u5F53\u524D\u6CA1\u6709\u53EF\u664B\u5347\u5019\u9009\u4EBA
                </div>
              `}

        </div>

      </section>
    `;
    }
    renderMarkup(page) {
      this.page = page;
      return `
      <main class="rg-screen employee-management-page">

        ${renderGameTopBar(
        page.topBar,
        {
          subtitle: "\u4EBA\u5458 \xB7 \u6392\u73ED \xB7 \u57F9\u8BAD \xB7 \u664B\u5347"
        }
      )}

        ${renderNoticeTicker(
        page.noticeTicker
      )}

        ${renderPageTitle({
        title: "\u5458\u5DE5\u4E0E\u664B\u5347",
        backTarget: "restaurant",
        helpLabel: "\u5458\u5DE5\u8BF4\u660E"
      })}

        ${this.renderMetrics()}


        <section class="employee-management-grid">

          <div class="employee-management-main">

            ${this.renderEmployeeTable()}

            ${this.renderStaffing()}

          </div>


          <aside class="employee-management-side">

            ${this.renderPromotion()}

            ${this.renderTraining()}

          </aside>

        </section>


        ${renderBottomNavigation(
        gameChromeSystem.getNavigation({
          restaurantId: this.restaurantId,
          activePageId: "employees"
        })
      )}

      </main>
    `;
    }
    render() {
      this.page = this.pageSystem.getPage(
        this.restaurantId
      );
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
      this.bind();
      return this.page;
    }
    bind() {
      this.root.querySelectorAll(
        "[data-employee-tab]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.tab = button.dataset.employeeTab;
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-page-target]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset.pageTarget,
                this.restaurantId,
                {
                  employeeId: button.dataset.employeeId ?? null
                }
              );
            }
          );
        }
      );
    }
  };
  var employeeManagementView = new EmployeeManagementView();

  // src/systems/DishResearchSystem.js
  function clamp15(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  var CATEGORIES = Object.freeze([
    "rice",
    "noodle",
    "fast_food",
    "stir_fry",
    "hotpot",
    "dessert"
  ]);
  var METHODS = Object.freeze({
    stir_fry: {
      id: "stir_fry",
      name: "\u7092\u5236",
      baseMinutes: 12,
      difficultyBonus: 15,
      techniqueScore: 76,
      defaultCategory: "stir_fry"
    },
    steam: {
      id: "steam",
      name: "\u84B8\u5236",
      baseMinutes: 18,
      difficultyBonus: 10,
      techniqueScore: 80,
      defaultCategory: "rice"
    },
    boil: {
      id: "boil",
      name: "\u716E\u5236",
      baseMinutes: 15,
      difficultyBonus: 8,
      techniqueScore: 72,
      defaultCategory: "noodle"
    },
    stew: {
      id: "stew",
      name: "\u7096\u716E",
      baseMinutes: 35,
      difficultyBonus: 20,
      techniqueScore: 82,
      defaultCategory: "hotpot"
    },
    fry: {
      id: "fry",
      name: "\u70B8\u5236",
      baseMinutes: 12,
      difficultyBonus: 18,
      techniqueScore: 74,
      defaultCategory: "fast_food"
    },
    cold_mix: {
      id: "cold_mix",
      name: "\u51C9\u62CC",
      baseMinutes: 8,
      difficultyBonus: 5,
      techniqueScore: 70,
      defaultCategory: "stir_fry"
    },
    bake: {
      id: "bake",
      name: "\u70E4\u5236",
      baseMinutes: 25,
      difficultyBonus: 20,
      techniqueScore: 79,
      defaultCategory: "fast_food"
    }
  });
  function getGrade2(score) {
    if (score >= 90) {
      return {
        grade: "SS",
        level: 5,
        rarity: "rare"
      };
    }
    if (score >= 80) {
      return {
        grade: "S",
        level: 4,
        rarity: "superior"
      };
    }
    if (score >= 68) {
      return {
        grade: "A",
        level: 3,
        rarity: "premium"
      };
    }
    if (score >= 55) {
      return {
        grade: "B",
        level: 2,
        rarity: "good"
      };
    }
    return {
      grade: "C",
      level: 1,
      rarity: "common"
    };
  }
  var DishResearchSystem = class {
    validateIngredients(ingredients) {
      if (!Array.isArray(
        ingredients
      ) || ingredients.length < 2 || ingredients.length > 6) {
        throw new Error(
          "Research requires 2-6 ingredients"
        );
      }
      const used = /* @__PURE__ */ new Set();
      for (const item of ingredients) {
        if (!item || typeof item.ingredientId !== "string" || !ingredientCatalogSystem.exists(
          item.ingredientId
        )) {
          throw new Error(
            "Research contains unknown ingredient"
          );
        }
        if (used.has(
          item.ingredientId
        )) {
          throw new Error(
            "Research ingredients cannot repeat"
          );
        }
        if (!Number.isFinite(
          item.quantity
        ) || item.quantity <= 0) {
          throw new Error(
            "Invalid research ingredient quantity"
          );
        }
        used.add(
          item.ingredientId
        );
      }
    }
    analyze({
      ingredients,
      method
    }) {
      this.validateIngredients(
        ingredients
      );
      const methodRule = METHODS[method];
      if (!methodRule) {
        throw new Error(
          `Unknown cooking method "${method}"`
        );
      }
      let totalQuantity = 0;
      let qualityTotal = 0;
      let estimatedCost = 0;
      const categories = /* @__PURE__ */ new Set();
      for (const item of ingredients) {
        const ingredient = ingredientCatalogSystem.get(
          item.ingredientId
        );
        totalQuantity += item.quantity;
        qualityTotal += ingredient.baseQuality * item.quantity;
        estimatedCost += ingredient.basePurchasePrice * item.quantity;
        categories.add(
          ingredient.category
        );
      }
      const averageQuality = qualityTotal / totalQuantity;
      const ingredientScore = clamp15(
        30 + averageQuality / 5 * 70,
        30,
        100
      );
      const diversityScore = clamp15(
        40 + categories.size * 15,
        40,
        100
      );
      const inspirationScore = randomSystem.int(
        35,
        100
      );
      const qualityScore = Math.round(
        ingredientScore * 0.5 + diversityScore * 0.2 + methodRule.techniqueScore * 0.15 + inspirationScore * 0.15
      );
      const difficulty = Math.round(
        clamp15(
          15 + ingredients.length * 7 + categories.size * 4 + methodRule.difficultyBonus,
          1,
          100
        )
      );
      const cookingMinutes = Math.max(
        5,
        Math.round(
          methodRule.baseMinutes + ingredients.length * 2
        )
      );
      const grade = getGrade2(
        qualityScore
      );
      const researchCost = Math.max(
        500,
        Math.round(
          700 + ingredients.length * 250 + difficulty * 12
        )
      );
      const markup = 2.1 + grade.level * 0.28;
      const suggestedPrice = Math.max(
        1,
        Math.round(
          estimatedCost * markup
        )
      );
      return {
        qualityScore,
        ...grade,
        ingredientScore: Math.round(
          ingredientScore
        ),
        diversityScore: Math.round(
          diversityScore
        ),
        inspirationScore,
        difficulty,
        cookingMinutes,
        estimatedCost: Math.round(
          estimatedCost
        ),
        researchCost,
        suggestedPrice
      };
    }
    research({
      restaurantId: restaurantId2,
      name,
      category,
      method,
      ingredients
    }) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      if (typeof name !== "string" || !name.trim()) {
        throw new Error(
          "Dish name is required"
        );
      }
      if (!CATEGORIES.includes(
        category
      )) {
        throw new Error(
          "Invalid dish category"
        );
      }
      if (!METHODS[method]) {
        throw new Error(
          "Invalid cooking method"
        );
      }
      const existing = entitySystem.filter(
        "custom_dish",
        (item) => item.ownerRestaurantId === restaurantId2
      );
      if (existing.length >= 60) {
        throw new Error(
          "Custom dish limit reached"
        );
      }
      const analysis = this.analyze({
        ingredients,
        method
      });
      financeSystem.getAccount(
        restaurantId2
      );
      if (financeSystem.getBalance(
        restaurantId2
      ) < analysis.researchCost) {
        throw new Error(
          "Insufficient funds for dish research"
        );
      }
      financeSystem.expense(
        restaurantId2,
        analysis.researchCost,
        CATEGORY.OTHER,
        `\u7814\u53D1\u83DC\u54C1\uFF1A${name.trim()}`
      );
      const time = gameState.getSection(
        "time"
      );
      let dish = entitySystem.create(
        "custom_dish",
        {
          ownerRestaurantId: restaurantId2,
          name: name.trim(),
          category,
          basePrice: analysis.suggestedPrice,
          custom: true,
          qualityScore: analysis.qualityScore,
          qualityGrade: analysis.grade,
          qualityLevel: analysis.level,
          rarity: analysis.rarity,
          researchCost: analysis.researchCost,
          estimatedIngredientCost: analysis.estimatedCost,
          method,
          createdDay: time.day,
          recipeId: null,
          masteryXp: 0,
          masteryLevel: 1,
          masteryQualityBonus: 0,
          prestigeTitle: "\u65B0\u7814\u53D1",
          lifetimeSold: 0,
          lifetimeRevenue: 0,
          improvementAttempts: 0,
          successfulImprovements: 0,
          improvementHistory: []
        }
      );
      const recipe = entitySystem.create(
        "custom_recipe",
        {
          ownerRestaurantId: restaurantId2,
          dishId: dish.id,
          ingredients: structuredClone(
            ingredients
          ),
          difficulty: analysis.difficulty,
          cookingMinutes: analysis.cookingMinutes,
          method,
          researchQuality: analysis.qualityScore,
          ingredientEfficiency: 1,
          improvementAttempts: 0,
          createdDay: time.day
        }
      );
      dish = entitySystem.update(
        "custom_dish",
        dish.id,
        {
          recipeId: recipe.id
        }
      );
      const history = [
        ...restaurant.dishResearchHistory ?? [],
        {
          day: time.day,
          dishId: dish.id,
          name: dish.name,
          grade: dish.qualityGrade,
          level: dish.qualityLevel,
          score: dish.qualityScore,
          cost: analysis.researchCost
        }
      ];
      if (history.length > 20) {
        history.splice(
          0,
          history.length - 20
        );
      }
      entitySystem.update(
        "restaurant",
        restaurantId2,
        {
          dishResearchHistory: history
        }
      );
      eventBus.emit(
        "dish:researched",
        {
          restaurantId: restaurantId2,
          dish: structuredClone(
            dish
          ),
          recipe: structuredClone(
            recipe
          )
        }
      );
      return {
        dish,
        recipe,
        analysis
      };
    }
    getRandomQuantity(ingredient) {
      switch (ingredient.unit) {
        case "g":
          return randomSystem.int(
            5,
            30
          ) * 10;
        case "kg":
          return randomSystem.int(
            1,
            5
          ) / 10;
        case "ml":
          return randomSystem.int(
            2,
            20
          ) * 10;
        case "l":
          return randomSystem.int(
            1,
            5
          ) / 10;
        case "piece":
          return randomSystem.int(
            1,
            3
          );
        default:
          return randomSystem.int(
            1,
            2
          );
      }
    }
    researchRandom({
      restaurantId: restaurantId2,
      name = null,
      category = null,
      method = null
    }) {
      const ingredients = ingredientCatalogSystem.getAll();
      if (ingredients.length < 2) {
        throw new Error(
          "Not enough ingredients for random research"
        );
      }
      const ingredientCount = Math.min(
        ingredients.length,
        randomSystem.int(
          2,
          4
        )
      );
      const selected = randomSystem.shuffle(
        ingredients
      ).slice(
        0,
        ingredientCount
      );
      const selectedMethod = method ?? randomSystem.pick(
        Object.keys(
          METHODS
        )
      );
      const methodRule = METHODS[selectedMethod];
      const selectedCategory = category ?? methodRule.defaultCategory;
      const first = selected[0];
      const second = selected[1];
      const generatedName = name ?? `${methodRule.name}${first.name}${second.name}`;
      return this.research({
        restaurantId: restaurantId2,
        name: generatedName,
        category: selectedCategory,
        method: selectedMethod,
        ingredients: selected.map(
          (ingredient) => ({
            ingredientId: ingredient.id,
            quantity: this.getRandomQuantity(
              ingredient
            )
          })
        )
      });
    }
    listByRestaurant(restaurantId2) {
      return entitySystem.filter(
        "custom_dish",
        (item) => item.ownerRestaurantId === restaurantId2
      );
    }
    getResearchSummary(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      const dishes = this.listByRestaurant(
        restaurantId2
      );
      const byGrade = {
        C: 0,
        B: 0,
        A: 0,
        S: 0,
        SS: 0
      };
      for (const dish of dishes) {
        if (dish.qualityGrade in byGrade) {
          byGrade[dish.qualityGrade] += 1;
        }
      }
      const best = [...dishes].sort(
        (a, b) => b.qualityScore - a.qualityScore
      )[0] ?? null;
      return {
        restaurantId: restaurantId2,
        total: dishes.length,
        byGrade,
        bestDish: best,
        recent: restaurant.dishResearchHistory ?? []
      };
    }
    getAvailableMethods() {
      return Object.values(
        METHODS
      );
    }
    getAvailableCategories() {
      return [
        ...CATEGORIES
      ];
    }
  };
  var dishResearchSystem = new DishResearchSystem();

  // src/systems/DishResearchPreviewSystem.js
  var METHOD_RULES = Object.freeze({
    stir_fry: {
      id: "stir_fry",
      name: "\u7092\u5236",
      baseMinutes: 12,
      difficultyBonus: 15,
      techniqueScore: 76
    },
    steam: {
      id: "steam",
      name: "\u84B8\u5236",
      baseMinutes: 18,
      difficultyBonus: 10,
      techniqueScore: 80
    },
    boil: {
      id: "boil",
      name: "\u716E\u5236",
      baseMinutes: 15,
      difficultyBonus: 8,
      techniqueScore: 72
    },
    stew: {
      id: "stew",
      name: "\u7096\u716E",
      baseMinutes: 35,
      difficultyBonus: 20,
      techniqueScore: 82
    },
    fry: {
      id: "fry",
      name: "\u70B8\u5236",
      baseMinutes: 12,
      difficultyBonus: 18,
      techniqueScore: 74
    },
    cold_mix: {
      id: "cold_mix",
      name: "\u51C9\u62CC",
      baseMinutes: 8,
      difficultyBonus: 5,
      techniqueScore: 70
    },
    bake: {
      id: "bake",
      name: "\u70E4\u5236",
      baseMinutes: 25,
      difficultyBonus: 20,
      techniqueScore: 79
    }
  });
  var QUANTITY_RULES = Object.freeze({
    g: {
      min: 10,
      max: 1e3,
      step: 10,
      defaultValue: 150
    },
    kg: {
      min: 0.05,
      max: 5,
      step: 0.05,
      defaultValue: 0.2
    },
    ml: {
      min: 10,
      max: 2e3,
      step: 10,
      defaultValue: 100
    },
    l: {
      min: 0.05,
      max: 5,
      step: 0.05,
      defaultValue: 0.2
    },
    piece: {
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 1
    }
  });
  function clamp16(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  function getGrade3(score) {
    if (score >= 90) {
      return {
        grade: "SS",
        level: 5
      };
    }
    if (score >= 80) {
      return {
        grade: "S",
        level: 4
      };
    }
    if (score >= 68) {
      return {
        grade: "A",
        level: 3
      };
    }
    if (score >= 55) {
      return {
        grade: "B",
        level: 2
      };
    }
    return {
      grade: "C",
      level: 1
    };
  }
  function calculateResolvedPreview({
    ingredients,
    method
  }) {
    const methodRule = METHOD_RULES[method];
    if (!methodRule) {
      throw new Error(
        `Unknown cooking method "${method}"`
      );
    }
    if (!Array.isArray(
      ingredients
    ) || ingredients.length < 2 || ingredients.length > 6) {
      throw new Error(
        "Research requires 2-6 ingredients"
      );
    }
    let totalQuantity = 0;
    let qualityTotal = 0;
    let estimatedCost = 0;
    const categories = /* @__PURE__ */ new Set();
    for (const item of ingredients) {
      if (!item.ingredient || !Number.isFinite(
        item.quantity
      ) || item.quantity <= 0) {
        throw new Error(
          "Invalid research ingredient"
        );
      }
      const ingredient = item.ingredient;
      totalQuantity += item.quantity;
      qualityTotal += ingredient.baseQuality * item.quantity;
      estimatedCost += ingredient.basePurchasePrice * item.quantity;
      categories.add(
        ingredient.category
      );
    }
    const averageQuality = qualityTotal / totalQuantity;
    const ingredientScore = clamp16(
      30 + averageQuality / 5 * 70,
      30,
      100
    );
    const diversityScore = clamp16(
      40 + categories.size * 15,
      40,
      100
    );
    const fixedQualityPart = ingredientScore * 0.5 + diversityScore * 0.2 + methodRule.techniqueScore * 0.15;
    const minQuality = clamp16(
      Math.round(
        fixedQualityPart + 35 * 0.15
      ),
      1,
      100
    );
    const maxQuality = clamp16(
      Math.round(
        fixedQualityPart + 100 * 0.15
      ),
      1,
      100
    );
    const difficulty = Math.round(
      clamp16(
        15 + ingredients.length * 7 + categories.size * 4 + methodRule.difficultyBonus,
        1,
        100
      )
    );
    const cookingMinutes = Math.max(
      5,
      Math.round(
        methodRule.baseMinutes + ingredients.length * 2
      )
    );
    const researchCost = Math.max(
      500,
      Math.round(
        700 + ingredients.length * 250 + difficulty * 12
      )
    );
    const minGrade = getGrade3(
      minQuality
    );
    const maxGrade = getGrade3(
      maxQuality
    );
    const roundedCost = Math.round(
      estimatedCost
    );
    const minSuggestedPrice = Math.max(
      1,
      Math.round(
        estimatedCost * (2.1 + minGrade.level * 0.28)
      )
    );
    const maxSuggestedPrice = Math.max(
      1,
      Math.round(
        estimatedCost * (2.1 + maxGrade.level * 0.28)
      )
    );
    return {
      ingredientCount: ingredients.length,
      categoryCount: categories.size,
      totalQuantity,
      averageQuality: Number(
        averageQuality.toFixed(
          2
        )
      ),
      ingredientScore: Math.round(
        ingredientScore
      ),
      diversityScore: Math.round(
        diversityScore
      ),
      difficulty,
      cookingMinutes,
      estimatedCost: roundedCost,
      researchCost,
      qualityRange: {
        min: minQuality,
        max: maxQuality
      },
      gradeRange: {
        min: minGrade.grade,
        max: maxGrade.grade
      },
      suggestedPriceRange: {
        min: minSuggestedPrice,
        max: maxSuggestedPrice
      }
    };
  }
  var DishResearchPreviewSystem = class {
    getMethodRules() {
      return structuredClone(
        METHOD_RULES
      );
    }
    getQuantityRule(unit) {
      return structuredClone(
        QUANTITY_RULES[unit] ?? {
          min: 0.1,
          max: 100,
          step: 0.1,
          defaultValue: 1
        }
      );
    }
    getDefaultQuantity(ingredient) {
      return this.getQuantityRule(
        ingredient.unit
      ).defaultValue;
    }
    preview({
      ingredients,
      method,
      balance = null
    }) {
      if (!Array.isArray(
        ingredients
      )) {
        throw new Error(
          "Research ingredients are required"
        );
      }
      const used = /* @__PURE__ */ new Set();
      const resolved = ingredients.map(
        (item) => {
          if (!item || typeof item.ingredientId !== "string" || used.has(
            item.ingredientId
          )) {
            throw new Error(
              "Invalid or duplicate research ingredient"
            );
          }
          const ingredient = ingredientCatalogSystem.get(
            item.ingredientId
          );
          if (!ingredient) {
            throw new Error(
              "Unknown research ingredient"
            );
          }
          const rule = this.getQuantityRule(
            ingredient.unit
          );
          const quantity = Number(
            item.quantity
          );
          if (!Number.isFinite(
            quantity
          ) || quantity < rule.min || quantity > rule.max) {
            throw new Error(
              `${ingredient.name}\u7528\u91CF\u5FC5\u987B\u5728${rule.min}\u2013${rule.max}${ingredient.unit}`
            );
          }
          used.add(
            item.ingredientId
          );
          return {
            ingredient,
            quantity
          };
        }
      );
      const result = calculateResolvedPreview({
        ingredients: resolved,
        method
      });
      return {
        ...result,
        affordable: balance === null || balance === void 0 ? null : balance >= result.researchCost,
        balance
      };
    }
  };
  var dishResearchPreviewSystem = new DishResearchPreviewSystem();

  // src/ui/pages/dishes/DishCenterPageSystem.js
  var CATEGORY_LABELS = Object.freeze({
    rice: "\u7C73\u996D\u4E3B\u98DF",
    noodle: "\u9762\u98DF",
    fast_food: "\u5FEB\u6377\u9910\u98DF",
    stir_fry: "\u7092\u83DC",
    hotpot: "\u9505\u7269",
    dessert: "\u751C\u54C1"
  });
  var METHOD_OPTIONS = Object.freeze([
    {
      id: "stir_fry",
      name: "\u7092\u5236",
      icon: "\u7092",
      description: "\u7206\u7092\u5FEB\u51FA\u9910"
    },
    {
      id: "steam",
      name: "\u84B8\u5236",
      icon: "\u84B8",
      description: "\u7A33\u5B9A\u4FDD\u7559\u98DF\u6750\u54C1\u8D28"
    },
    {
      id: "boil",
      name: "\u716E\u5236",
      icon: "\u716E",
      description: "\u9002\u5408\u6C64\u9762\u4E0E\u4E3B\u98DF"
    },
    {
      id: "stew",
      name: "\u7096\u716E",
      icon: "\u7096",
      description: "\u8017\u65F6\u8F83\u957F\uFF0C\u54C1\u8D28\u6F5C\u529B\u9AD8"
    },
    {
      id: "fry",
      name: "\u70B8\u5236",
      icon: "\u70B8",
      description: "\u9AD8\u6548\u7387\u9AD8\u9999\u6C14"
    },
    {
      id: "cold_mix",
      name: "\u51C9\u62CC",
      icon: "\u62CC",
      description: "\u5FEB\u901F\u5236\u4F5C"
    },
    {
      id: "bake",
      name: "\u70E4\u5236",
      icon: "\u70E4",
      description: "\u98CE\u5473\u7A81\u51FA"
    }
  ]);
  function safeBalance8(restaurantId2) {
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return 0;
    }
  }
  function categoryLabel(id) {
    return CATEGORY_LABELS[id] ?? id ?? "\u5176\u4ED6";
  }
  function gradeFromDish(dish) {
    if (dish.qualityGrade) {
      return dish.qualityGrade;
    }
    const score = Number(
      dish.qualityScore
    );
    if (Number.isFinite(score)) {
      if (score >= 90) {
        return "SS";
      }
      if (score >= 80) {
        return "S";
      }
      if (score >= 68) {
        return "A";
      }
      if (score >= 55) {
        return "B";
      }
      return "C";
    }
    return "\u57FA\u7840";
  }
  function getDishImage(dish) {
    return dish.image ?? dish.coverImage ?? `assets/images/ui/dishes/${dish.id}.webp`;
  }
  var DishCenterPageSystem = class {
    getDishView(dish, menuItem = null) {
      const recipes = recipeSystem.getByDish(
        dish.id
      );
      const recipe = recipes[0] ?? null;
      const ingredientCost = dish.estimatedIngredientCost ?? null;
      const menuPrice = menuItem?.price ?? dish.basePrice ?? 0;
      const grossMargin = Number.isFinite(
        ingredientCost
      ) && menuPrice > 0 ? Math.round(
        (1 - ingredientCost / menuPrice) * 100
      ) : null;
      return {
        id: dish.id,
        name: dish.name,
        category: dish.category,
        categoryLabel: categoryLabel(
          dish.category
        ),
        basePrice: dish.basePrice ?? 0,
        custom: Boolean(
          dish.custom
        ),
        qualityScore: dish.qualityScore ?? null,
        grade: gradeFromDish(
          dish
        ),
        qualityLevel: dish.qualityLevel ?? 1,
        rarity: dish.rarity ?? "common",
        prestigeTitle: dish.prestigeTitle ?? (dish.custom ? "\u65B0\u7814\u53D1" : "\u7ECF\u5178\u83DC"),
        masteryLevel: dish.masteryLevel ?? 1,
        masteryXp: dish.masteryXp ?? 0,
        lifetimeSold: dish.lifetimeSold ?? menuItem?.soldCount ?? 0,
        lifetimeRevenue: dish.lifetimeRevenue ?? menuItem?.totalRevenue ?? 0,
        researchCost: dish.researchCost ?? null,
        ingredientCost,
        grossMargin,
        method: dish.method ?? recipe?.method ?? null,
        difficulty: recipe?.difficulty ?? null,
        cookingMinutes: recipe?.cookingMinutes ?? null,
        ingredientCount: recipe?.ingredients?.length ?? 0,
        recipeId: recipe?.id ?? dish.recipeId ?? null,
        hasRecipe: Boolean(
          recipe
        ),
        image: getDishImage(
          dish
        ),
        onMenu: Boolean(
          menuItem
        ),
        menuItemId: menuItem?.id ?? null,
        active: menuItem?.active ?? false,
        menuPrice,
        soldCount: menuItem?.soldCount ?? 0,
        totalRevenue: menuItem?.totalRevenue ?? 0
      };
    }
    getIngredients() {
      return ingredientCatalogSystem.getAll().map(
        (ingredient) => {
          const quantityRule = dishResearchPreviewSystem.getQuantityRule(
            ingredient.unit
          );
          return {
            id: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            unit: ingredient.unit,
            quality: ingredient.baseQuality,
            purchasePrice: ingredient.basePurchasePrice,
            shelfLifeDays: ingredient.shelfLifeDays,
            quantityRule
          };
        }
      );
    }
    getPage(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      const menu = menuSystem.listByRestaurant(
        restaurantId2
      );
      const menuMap = new Map(
        menu.map(
          (item) => [
            item.dishId,
            item
          ]
        )
      );
      const allDishes = dishCatalogSystem.getAll();
      const customDishes = dishCatalogSystem.getCustomByRestaurant(
        restaurantId2
      );
      const menuViews = menu.map(
        (item) => {
          const dish = dishCatalogSystem.get(
            item.dishId
          );
          return this.getDishView(
            dish,
            item
          );
        }
      );
      const catalog = allDishes.filter(
        (dish) => !dish.custom || dish.ownerRestaurantId === restaurantId2
      ).map(
        (dish) => this.getDishView(
          dish,
          menuMap.get(
            dish.id
          ) ?? null
        )
      );
      const availableCatalog = catalog.filter(
        (dish) => !dish.onMenu && dish.hasRecipe
      );
      const activeMenu = menuViews.filter(
        (item) => item.active
      );
      const categories = [
        {
          id: "all",
          label: "\u5168\u90E8",
          count: catalog.length
        },
        ...Object.entries(
          CATEGORY_LABELS
        ).map(
          ([
            id,
            label
          ]) => ({
            id,
            label,
            count: catalog.filter(
              (dish) => dish.category === id
            ).length
          })
        ).filter(
          (item) => item.count > 0
        )
      ];
      const time = gameState.getSection(
        "time"
      );
      const runtime = gameState.getSection(
        "runtime"
      );
      const balance = safeBalance8(
        restaurantId2
      );
      const limits = storeProgressSystem.getLimits(
        restaurantId2
      );
      const notices = [];
      if (activeMenu.length === 0) {
        notices.push({
          id: "no_active_menu",
          type: "warning",
          title: "\u83DC\u5355\u63D0\u9192",
          message: "\u5F53\u524D\u6CA1\u6709\u8425\u4E1A\u4E2D\u7684\u83DC\u54C1\uFF0C\u95E8\u5E97\u65E0\u6CD5\u6B63\u5E38\u63A5\u5355",
          priority: 100
        });
      }
      if (customDishes.length === 0) {
        notices.push({
          id: "research_tip",
          type: "info",
          title: "\u7814\u53D1\u63D0\u793A",
          message: "\u53EF\u4EE5\u81EA\u7531\u642D\u914D\u98DF\u6750\u7814\u53D1\u7B2C\u4E00\u9053\u81EA\u521B\u83DC",
          priority: 70
        });
      }
      return {
        pageId: "dishes",
        topBar: buildGlobalTopBarModel({
          restaurantName: restaurant.name,
          balance,
          storeLevel: restaurant.level,
          reputation: restaurant.reputation,
          time,
          runtime,
          currentStoreId: restaurantId2
        }),
        noticeTicker: buildNoticeTickerModel(
          notices
        ),
        metrics: [
          {
            label: "\u83DC\u5355\u83DC\u54C1",
            value: `${menuViews.length}/${limits.menuItems}`,
            caption: "\u5F53\u524D/\u4E0A\u9650"
          },
          {
            label: "\u8425\u4E1A\u83DC\u54C1",
            value: `${activeMenu.length}\u9053`,
            caption: activeMenu.length > 0 ? "\u53EF\u6B63\u5E38\u63A5\u5355" : "\u9700\u8981\u81F3\u5C111\u9053"
          },
          {
            label: "\u81EA\u521B\u83DC",
            value: `${customDishes.length}\u9053`,
            caption: "\u7814\u53D1\u4E0A\u965060\u9053"
          },
          {
            label: "\u7D2F\u8BA1\u83DC\u54C1\u8425\u6536",
            value: `\xA5${Math.round(
              menuViews.reduce(
                (sum, item) => sum + (item.totalRevenue ?? 0),
                0
              )
            ).toLocaleString(
              "zh-CN"
            )}`,
            caption: "\u5386\u53F2\u7D2F\u8BA1"
          }
        ],
        menu: menuViews,
        activeMenuCount: activeMenu.length,
        catalog,
        availableCatalog,
        customDishes: customDishes.map(
          (dish) => this.getDishView(
            dish,
            menuMap.get(
              dish.id
            ) ?? null
          )
        ),
        categories,
        ingredients: this.getIngredients(),
        research: {
          methods: METHOD_OPTIONS,
          categories: Object.entries(
            CATEGORY_LABELS
          ).map(
            ([
              id,
              label
            ]) => ({
              id,
              label
            })
          ),
          minIngredients: 2,
          maxIngredients: 6,
          balance,
          customCount: customDishes.length,
          limit: 60
        },
        bottomNavigation: [
          {
            label: "\u57CE\u5E02",
            target: "city",
            icon: "city"
          },
          {
            label: "\u95E8\u5E97",
            target: "restaurant",
            icon: "store"
          },
          {
            label: "\u88C5\u4FEE",
            target: "renovation",
            icon: "renovation"
          },
          {
            label: "\u4EBA\u5458",
            target: "employees",
            icon: "employees"
          },
          {
            label: "\u5E02\u573A",
            target: "channels",
            icon: "analytics"
          },
          {
            label: "\u7814\u53D1",
            target: "dishes",
            icon: "dishes",
            active: true
          },
          {
            label: "\u66F4\u591A",
            target: "more",
            icon: "more"
          }
        ]
      };
    }
    addToMenu(restaurantId2, dishId, price = null) {
      const dish = dishCatalogSystem.get(
        dishId
      );
      if (!dish) {
        throw new Error(
          "Dish does not exist"
        );
      }
      const recipe = recipeSystem.getByDish(
        dishId
      )[0];
      if (!recipe) {
        throw new Error(
          "\u8BE5\u83DC\u54C1\u8FD8\u6CA1\u6709\u6709\u6548\u914D\u65B9"
        );
      }
      return menuSystem.addItem({
        restaurantId: restaurantId2,
        dishId,
        recipeId: recipe.id,
        price: price ?? dish.basePrice
      });
    }
    setPrice(menuItemId, price) {
      return menuSystem.setPrice(
        menuItemId,
        price
      );
    }
    toggleMenuItem(menuItemId) {
      const item = menuSystem.get(
        menuItemId
      );
      return menuSystem.setActive(
        menuItemId,
        !item.active
      );
    }
    previewResearch({
      restaurantId: restaurantId2,
      method,
      ingredients
    }) {
      return dishResearchPreviewSystem.preview({
        ingredients,
        method,
        balance: safeBalance8(
          restaurantId2
        )
      });
    }
    researchRandom(restaurantId2) {
      return dishResearchSystem.researchRandom({
        restaurantId: restaurantId2
      });
    }
    researchCustom({
      restaurantId: restaurantId2,
      name,
      category,
      method,
      ingredients
    }) {
      return dishResearchSystem.research({
        restaurantId: restaurantId2,
        name,
        category,
        method,
        ingredients
      });
    }
  };
  var dishCenterPageSystem = new DishCenterPageSystem();

  // src/ui/pages/dishes/DishResearchLab.js
  function escapeHtml7(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money6(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function gradeClass(grade) {
    return "dish-preview-grade-" + String(
      grade ?? "C"
    ).toLowerCase();
  }
  var DishResearchLab = class {
    constructor({
      pageSystem,
      restaurantId: restaurantId2
    }) {
      this.pageSystem = pageSystem;
      this.restaurantId = restaurantId2;
      this.category = "stir_fry";
      this.method = "stir_fry";
      this.quantities = /* @__PURE__ */ new Map();
      this.selected = /* @__PURE__ */ new Set();
      this.preview = null;
    }
    syncPage(page) {
      this.page = page;
      for (const ingredient of page.ingredients) {
        if (!this.quantities.has(
          ingredient.id
        )) {
          this.quantities.set(
            ingredient.id,
            ingredient.quantityRule?.defaultValue ?? 1
          );
        }
      }
    }
    getSelectedIngredients() {
      return [
        ...this.selected
      ].map(
        (ingredientId) => ({
          ingredientId,
          quantity: Number(
            this.quantities.get(
              ingredientId
            )
          )
        })
      );
    }
    calculatePreview() {
      const ingredients = this.getSelectedIngredients();
      if (ingredients.length < 2 || ingredients.length > 6) {
        this.preview = null;
        return null;
      }
      try {
        this.preview = this.pageSystem.previewResearch({
          restaurantId: this.restaurantId,
          method: this.method,
          ingredients
        });
      } catch {
        this.preview = null;
      }
      return this.preview;
    }
    renderPreview() {
      const preview = this.preview;
      if (!preview) {
        return `
        <section class="dish-research-preview is-empty">

          <header>
            <strong>
              \u7814\u53D1\u9884\u4F30
            </strong>

            <span>
              \u5148\u9009\u62E92\u20136\u79CD\u98DF\u6750
            </span>
          </header>

          <div class="dish-preview-empty">

            <b>
              ?
            </b>

            <strong>
              \u7B49\u5F85\u914D\u65B9
            </strong>

            <span>
              \u8C03\u6574\u98DF\u6750\u548C\u7528\u91CF\u540E\u4F1A\u5B9E\u65F6\u663E\u793A\u6210\u672C\u3001\u96BE\u5EA6\u548C\u54C1\u8D28\u8303\u56F4\u3002
            </span>

          </div>

        </section>
      `;
      }
      return `
      <section class="dish-research-preview">

        <header>

          <div>
            <strong>
              \u7814\u53D1\u9884\u4F30
            </strong>

            <span>
              \u968F\u673A\u7075\u611F\u5C1A\u672A\u62BD\u53D6\uFF0C\u56E0\u6B64\u54C1\u8D28\u53EA\u663E\u793A\u53EF\u80FD\u533A\u95F4
            </span>
          </div>

          <b
            class="${preview.affordable === false ? "is-danger" : "is-good"}"
          >
            ${preview.affordable === false ? "\u8D44\u91D1\u4E0D\u8DB3" : "\u53EF\u4EE5\u7814\u53D1"}
          </b>

        </header>


        <div class="dish-preview-quality">

          <div class="dish-preview-quality__score">

            <span>
              \u54C1\u8D28\u533A\u95F4
            </span>

            <strong>
              ${preview.qualityRange.min}
              \u2013
              ${preview.qualityRange.max}
            </strong>

          </div>


          <div class="dish-preview-quality__grade">

            <span
              class="${gradeClass(
        preview.gradeRange.min
      )}"
            >
              ${preview.gradeRange.min}
            </span>

            <i>
              \u2192
            </i>

            <span
              class="${gradeClass(
        preview.gradeRange.max
      )}"
            >
              ${preview.gradeRange.max}
            </span>

          </div>

        </div>


        <div class="dish-preview-grid">

          <article>
            <span>
              \u98DF\u6750\u6210\u672C
            </span>

            <strong>
              ${money6(
        preview.estimatedCost
      )}
            </strong>
          </article>

          <article>
            <span>
              \u7814\u53D1\u8D39\u7528
            </span>

            <strong>
              ${money6(
        preview.researchCost
      )}
            </strong>
          </article>

          <article>
            <span>
              \u51FA\u9910\u65F6\u95F4
            </span>

            <strong>
              ${preview.cookingMinutes}\u5206\u949F
            </strong>
          </article>

          <article>
            <span>
              \u5236\u4F5C\u96BE\u5EA6
            </span>

            <strong>
              ${preview.difficulty}/100
            </strong>
          </article>

          <article>
            <span>
              \u98DF\u6750\u54C1\u8D28
            </span>

            <strong>
              ${preview.ingredientScore}/100
            </strong>
          </article>

          <article>
            <span>
              \u642D\u914D\u591A\u6837\u6027
            </span>

            <strong>
              ${preview.diversityScore}/100
            </strong>
          </article>

        </div>


        <section class="dish-preview-price">

          <span>
            \u5EFA\u8BAE\u552E\u4EF7\u533A\u95F4
          </span>

          <strong>
            ${money6(
        preview.suggestedPriceRange.min
      )}
            \u2013
            ${money6(
        preview.suggestedPriceRange.max
      )}
          </strong>

          <small>
            \u6700\u7EC8\u5EFA\u8BAE\u552E\u4EF7\u4F1A\u6839\u636E\u5B9E\u9645\u7814\u53D1\u54C1\u8D28\u786E\u5B9A
          </small>

        </section>

      </section>
    `;
    }
    render() {
      this.calculatePreview();
      return `
      <section class="dish-research-v2">

        <section class="dish-panel dish-research-workbench">

          <header class="dish-panel-title">

            <div>
              <strong>
                \u81EA\u4E3B\u7814\u53D1\u5B9E\u9A8C\u53F0
              </strong>

              <span>
                \u81EA\u7531\u7EC4\u5408\u98DF\u6750\u5E76\u7CBE\u786E\u8C03\u6574\u6BCF\u4EFD\u7528\u91CF
              </span>
            </div>

            <b>
              \u5DF2\u7814\u53D1
              ${this.page.research.customCount}
              /
              ${this.page.research.limit}
            </b>

          </header>


          <section class="dish-research-name">

            <label>
              \u83DC\u54C1\u540D\u79F0
            </label>

            <input
              type="text"
              maxlength="20"
              placeholder="\u8F93\u5165\u539F\u521B\u83DC\u540D"
              data-research-name
            />

          </section>


          <section class="dish-research-section">

            <header>
              <strong>
                \u2460 \u83DC\u54C1\u7C7B\u578B
              </strong>
            </header>


            <div class="dish-research-options">

              ${this.page.research.categories.map(
        (category) => `
                      <button
                        type="button"
                        class="${this.category === category.id ? "is-active" : ""}"
                        data-research-category="${category.id}"
                      >
                        ${escapeHtml7(
          category.label
        )}
                      </button>
                    `
      ).join("")}

            </div>

          </section>


          <section class="dish-research-section">

            <header>
              <strong>
                \u2461 \u70F9\u996A\u65B9\u5F0F
              </strong>
            </header>


            <div class="dish-method-grid">

              ${this.page.research.methods.map(
        (method) => `
                      <button
                        type="button"
                        class="${this.method === method.id ? "is-active" : ""}"
                        data-research-method="${method.id}"
                      >

                        <b>
                          ${method.icon}
                        </b>

                        <strong>
                          ${escapeHtml7(
          method.name
        )}
                        </strong>

                        <small>
                          ${escapeHtml7(
          method.description
        )}
                        </small>

                      </button>
                    `
      ).join("")}

            </div>

          </section>


          <section class="dish-research-section">

            <header>

              <div>
                <strong>
                  \u2462 \u98DF\u6750\u4E0E\u7528\u91CF
                </strong>

                <span>
                  \u5DF2\u9009
                  ${this.selected.size}
                  /6\u79CD
                </span>
              </div>

              <small>
                \u7814\u53D1\u7ED3\u679C\u4F1A\u4FDD\u5B58\u4F60\u8BBE\u7F6E\u7684\u771F\u5B9E\u7528\u91CF
              </small>

            </header>


            <div class="dish-ingredient-v2-grid">

              ${this.page.ingredients.map(
        (ingredient) => {
          const selected = this.selected.has(
            ingredient.id
          );
          const quantity = this.quantities.get(
            ingredient.id
          ) ?? ingredient.quantityRule.defaultValue;
          return `
                        <article
                          class="
                            dish-ingredient-v2
                            ${selected ? "is-selected" : ""}
                          "
                          data-ingredient-card="${ingredient.id}"
                        >

                          <button
                            type="button"
                            class="dish-ingredient-select"
                            data-research-ingredient-toggle="${ingredient.id}"
                          >

                            <span
                              class="dish-ingredient-checkbox"
                            >
                              ${selected ? "\u2713" : "+"}
                            </span>

                            <div>

                              <strong>
                                ${escapeHtml7(
            ingredient.name
          )}
                              </strong>

                              <small>
                                \u54C1\u8D28
                                ${ingredient.quality}
                                \xB7
                                ${money6(
            ingredient.purchasePrice
          )}
                                /
                                ${escapeHtml7(
            ingredient.unit
          )}
                              </small>

                            </div>

                          </button>


                          <div class="dish-quantity-control">

                            <button
                              type="button"
                              data-quantity-minus="${ingredient.id}"
                              ${selected ? "" : "disabled"}
                            >
                              \u2212
                            </button>

                            <label>

                              <input
                                type="number"
                                min="${ingredient.quantityRule.min}"
                                max="${ingredient.quantityRule.max}"
                                step="${ingredient.quantityRule.step}"
                                value="${quantity}"
                                data-ingredient-quantity="${ingredient.id}"
                                ${selected ? "" : "disabled"}
                              />

                              <span>
                                ${escapeHtml7(
            ingredient.unit
          )}
                              </span>

                            </label>

                            <button
                              type="button"
                              data-quantity-plus="${ingredient.id}"
                              ${selected ? "" : "disabled"}
                            >
                              \uFF0B
                            </button>

                          </div>

                        </article>
                      `;
        }
      ).join("")}

            </div>

          </section>


          <section class="dish-research-actions">

            <button
              type="button"
              class="dish-random-research"
              data-research-action="random"
            >
              \u27F3 \u5B8C\u5168\u968F\u673A\u7814\u53D1
            </button>

            <button
              type="button"
              class="dish-custom-research"
              data-research-action="custom"
              ${this.selected.size >= 2 && this.selected.size <= 6 && this.preview?.affordable !== false ? "" : "disabled"}
            >
              \u2605 \u6309\u5F53\u524D\u914D\u65B9\u7814\u53D1
            </button>

          </section>

        </section>


        <aside class="dish-research-v2-side">

          ${this.renderPreview()}


          <section class="dish-panel">

            <header class="dish-panel-title">
              <strong>
                \u54C1\u8D28\u89C4\u5219
              </strong>
            </header>

            <div class="dish-grade-list">

              <article class="grade-ss">
                <b>SS</b>
                <span>90\u2013100</span>
                <strong>\u73CD\u7A00\u54C1\u8D28</strong>
              </article>

              <article class="grade-s">
                <b>S</b>
                <span>80\u201389</span>
                <strong>\u5353\u8D8A\u54C1\u8D28</strong>
              </article>

              <article class="grade-a">
                <b>A</b>
                <span>68\u201379</span>
                <strong>\u4F18\u8D28</strong>
              </article>

              <article class="grade-b">
                <b>B</b>
                <span>55\u201367</span>
                <strong>\u826F\u597D</strong>
              </article>

              <article class="grade-c">
                <b>C</b>
                <span>55\u4EE5\u4E0B</span>
                <strong>\u666E\u901A</strong>
              </article>

            </div>

          </section>

        </aside>

      </section>
    `;
    }
    toggleIngredient(ingredientId) {
      if (this.selected.has(
        ingredientId
      )) {
        this.selected.delete(
          ingredientId
        );
        return;
      }
      if (this.selected.size >= 6) {
        throw new Error(
          "\u6700\u591A\u53EA\u80FD\u9009\u62E96\u79CD\u98DF\u6750"
        );
      }
      this.selected.add(
        ingredientId
      );
    }
    setQuantity(ingredientId, value) {
      const ingredient = this.page.ingredients.find(
        (item) => item.id === ingredientId
      );
      if (!ingredient) {
        return;
      }
      const rule = ingredient.quantityRule;
      const quantity = Math.max(
        rule.min,
        Math.min(
          rule.max,
          Number(value) || rule.defaultValue
        )
      );
      this.quantities.set(
        ingredientId,
        quantity
      );
    }
    adjustQuantity(ingredientId, direction) {
      const ingredient = this.page.ingredients.find(
        (item) => item.id === ingredientId
      );
      if (!ingredient) {
        return;
      }
      const rule = ingredient.quantityRule;
      const current = Number(
        this.quantities.get(
          ingredientId
        )
      ) || rule.defaultValue;
      const next = current + rule.step * direction;
      const decimals = String(
        rule.step
      ).includes(".") ? String(
        rule.step
      ).split(".")[1].length : 0;
      this.setQuantity(
        ingredientId,
        Number(
          next.toFixed(
            decimals
          )
        )
      );
    }
  };

  // src/ui/pages/dishes/DishCenterView.js
  function escapeHtml8(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money7(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function renderDishImage(dish) {
    return `
    <div
      class="
        dish-image
        dish-grade-${escapeHtml8(
      dish.grade
    )}
      "
      style="
        --dish-image:
          url('${escapeHtml8(
      dish.image
    )}');
      "
    >
      <span class="dish-grade-badge">
        ${escapeHtml8(
      dish.grade
    )}
      </span>

      ${dish.custom ? `
            <b class="dish-custom-badge">
              \u81EA\u7814
            </b>
          ` : ""}
    </div>
  `;
  }
  var DishCenterView = class {
    constructor({
      pageSystem = dishCenterPageSystem,
      onNavigate = null
    } = {}) {
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.root = null;
      this.restaurantId = null;
      this.page = null;
      this.tab = "menu";
      this.category = "all";
      this.message = "";
      this.researchMethod = "stir_fry";
      this.researchCategory = "stir_fry";
      this.researchLab = new DishResearchLab({
        pageSystem: this.pageSystem,
        restaurantId: this.restaurantId
      });
    }
    mount(root2, {
      restaurantId: restaurantId2
    }) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.render();
      return this;
    }
    getFilteredCatalog() {
      if (this.category === "all") {
        return this.page.catalog;
      }
      return this.page.catalog.filter(
        (dish) => dish.category === this.category
      );
    }
    renderMetrics() {
      return `
      <section class="dish-metrics">

        ${this.page.metrics.map(
        (metric) => `
                <article>

                  <span>
                    ${escapeHtml8(
          metric.label
        )}
                  </span>

                  <strong>
                    ${escapeHtml8(
          metric.value
        )}
                  </strong>

                  <small>
                    ${escapeHtml8(
          metric.caption
        )}
                  </small>

                </article>
              `
      ).join("")}

      </section>
    `;
    }
    renderTabs() {
      const tabs = [
        [
          "menu",
          "\u5F53\u524D\u83DC\u5355",
          this.page.menu.length
        ],
        [
          "catalog",
          "\u83DC\u54C1\u5E93",
          this.page.catalog.length
        ],
        [
          "research",
          "\u81EA\u4E3B\u7814\u53D1",
          this.page.customDishes.length
        ]
      ];
      return `
      <nav class="dish-main-tabs">

        ${tabs.map(
        ([
          id,
          label,
          count
        ]) => `
              <button
                type="button"
                class="${this.tab === id ? "is-active" : ""}"
                data-dish-tab="${id}"
              >
                <strong>
                  ${label}
                </strong>

                <span>
                  ${count}
                </span>
              </button>
            `
      ).join("")}

      </nav>
    `;
    }
    renderMenu() {
      return `
      <section class="dish-panel">

        <header class="dish-panel-title">

          <div>
            <strong>
              \u8425\u4E1A\u83DC\u5355
            </strong>

            <span>
              \u542F\u7528\u83DC\u54C1\u4F1A\u8FDB\u5165\u987E\u5BA2\u5B9E\u9645\u70B9\u5355\u6C60
            </span>
          </div>

          <b>
            \u8425\u4E1A\u4E2D
            ${this.page.activeMenuCount}
            \u9053
          </b>

        </header>


        <div class="dish-menu-grid">

          ${this.page.menu.length ? this.page.menu.map(
        (dish) => `
                      <article
                        class="
                          dish-menu-card
                          ${dish.active ? "is-active" : "is-disabled"}
                        "
                      >

                        ${renderDishImage(
          dish
        )}


                        <div class="dish-menu-card__main">

                          <header>

                            <div>
                              <strong>
                                ${escapeHtml8(
          dish.name
        )}
                              </strong>

                              <span>
                                ${escapeHtml8(
          dish.categoryLabel
        )}
                                \xB7
                                ${escapeHtml8(
          dish.prestigeTitle
        )}
                              </span>
                            </div>

                            <button
                              type="button"
                              class="
                                dish-state-toggle
                                ${dish.active ? "is-on" : ""}
                              "
                              data-menu-toggle="${dish.menuItemId}"
                            >
                              ${dish.active ? "\u8425\u4E1A\u4E2D" : "\u5DF2\u505C\u552E"}
                            </button>

                          </header>


                          <section class="dish-card-stats">

                            <article>
                              <span>
                                \u5DF2\u552E
                              </span>

                              <strong>
                                ${dish.soldCount}
                              </strong>
                            </article>

                            <article>
                              <span>
                                \u8425\u6536
                              </span>

                              <strong>
                                ${money7(
          dish.totalRevenue
        )}
                              </strong>
                            </article>

                            <article>
                              <span>
                                \u719F\u7EC3
                              </span>

                              <strong>
                                Lv.${dish.masteryLevel}
                              </strong>
                            </article>

                            <article>
                              <span>
                                \u6BDB\u5229
                              </span>

                              <strong>
                                ${dish.grossMargin === null ? "--" : `${dish.grossMargin}%`}
                              </strong>
                            </article>

                          </section>


                          <div class="dish-price-row">

                            <label>
                              \u552E\u4EF7
                            </label>

                            <span>
                              \xA5
                            </span>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value="${dish.menuPrice}"
                              data-price-input="${dish.menuItemId}"
                            />

                            <button
                              type="button"
                              data-price-save="${dish.menuItemId}"
                            >
                              \u4FDD\u5B58\u4EF7\u683C
                            </button>

                          </div>

                        </div>

                      </article>
                    `
      ).join("") : `
                <div class="dish-empty-state">

                  <strong>
                    \u5F53\u524D\u83DC\u5355\u8FD8\u662F\u7A7A\u7684
                  </strong>

                  <span>
                    \u524D\u5F80\u83DC\u54C1\u5E93\u9009\u62E9\u83DC\u54C1\uFF0C\u6216\u8005\u81EA\u4E3B\u7814\u53D1\u7B2C\u4E00\u9053\u83DC\u3002
                  </span>

                  <button
                    type="button"
                    data-dish-tab-jump="catalog"
                  >
                    \u53BB\u9009\u62E9\u83DC\u54C1
                  </button>

                </div>
              `}

        </div>

      </section>
    `;
    }
    renderCatalog() {
      const dishes = this.getFilteredCatalog();
      return `
      <section class="dish-panel">

        <header class="dish-panel-title">

          <div>
            <strong>
              \u83DC\u54C1\u5E93
            </strong>

            <span>
              \u9009\u62E9\u9002\u5408\u9996\u5E97\u5B9A\u4F4D\u7684\u83DC\u54C1\u52A0\u5165\u83DC\u5355
            </span>
          </div>

          <button
            type="button"
            class="dish-research-shortcut"
            data-dish-tab-jump="research"
          >
            \uFF0B \u81EA\u4E3B\u7814\u53D1
          </button>

        </header>


        <nav class="dish-category-tabs">

          ${this.page.categories.map(
        (category) => `
                  <button
                    type="button"
                    class="${this.category === category.id ? "is-active" : ""}"
                    data-dish-category="${category.id}"
                  >
                    ${escapeHtml8(
          category.label
        )}

                    <small>
                      ${category.count}
                    </small>
                  </button>
                `
      ).join("")}

        </nav>


        <div class="dish-catalog-grid">

          ${dishes.length ? dishes.map(
        (dish) => `
                    <article
                      class="
                        dish-catalog-card
                        ${dish.onMenu ? "is-on-menu" : ""}
                      "
                    >

                      ${renderDishImage(
          dish
        )}


                      <div class="dish-catalog-card__body">

                        <header>
                          <strong>
                            ${escapeHtml8(
          dish.name
        )}
                          </strong>

                          <span>
                            ${escapeHtml8(
          dish.categoryLabel
        )}
                          </span>
                        </header>


                        <div class="dish-quality-line">

                          <span>
                            \u54C1\u8D28
                          </span>

                          <strong>
                            ${escapeHtml8(
          dish.grade
        )}
                          </strong>

                          ${dish.qualityScore !== null ? `
                                <small>
                                  ${dish.qualityScore}\u5206
                                </small>
                              ` : ""}

                        </div>


                        <div class="dish-catalog-info">

                          <span>
                            ${dish.cookingMinutes ? `${dish.cookingMinutes}\u5206\u949F` : "\u6807\u51C6\u51FA\u9910"}
                          </span>

                          <span>
                            ${dish.ingredientCount ? `${dish.ingredientCount}\u79CD\u98DF\u6750` : "\u7ECF\u5178\u914D\u65B9"}
                          </span>

                          <span>
                            \u57FA\u7840\u4EF7
                            ${money7(
          dish.basePrice
        )}
                          </span>

                        </div>


                        ${dish.onMenu ? `
                              <button
                                type="button"
                                class="is-added"
                                disabled
                              >
                                \u2713 \u5DF2\u5728\u83DC\u5355
                              </button>
                            ` : dish.hasRecipe ? `
                                <button
                                  type="button"
                                  data-menu-add="${dish.id}"
                                >
                                  \uFF0B \u52A0\u5165\u83DC\u5355
                                </button>
                              ` : `
                                <button
                                  type="button"
                                  disabled
                                >
                                  \u6682\u65E0\u53EF\u7528\u914D\u65B9
                                </button>
                              `}

                      </div>

                    </article>
                  `
      ).join("") : `
                <div class="dish-empty-state">
                  \u5F53\u524D\u5206\u7C7B\u6682\u65E0\u83DC\u54C1
                </div>
              `}

        </div>

      </section>
    `;
    }
    renderResearch() {
      if (!this.researchLab) {
        this.researchLab = new DishResearchLab({
          pageSystem: this.pageSystem,
          restaurantId: this.restaurantId
        });
      }
      this.researchLab.syncPage(
        this.page
      );
      return this.researchLab.render();
    }
    renderMarkup(page) {
      this.page = page;
      let content = "";
      if (this.tab === "catalog") {
        content = this.renderCatalog();
      } else if (this.tab === "research") {
        content = this.renderResearch();
      } else {
        content = this.renderMenu();
      }
      return `
      <main class="rg-screen dish-center-page">

        ${renderGameTopBar(
        page.topBar,
        {
          subtitle: "\u83DC\u5355\u7ECF\u8425 \xB7 \u81EA\u4E3B\u7814\u53D1"
        }
      )}

        ${renderNoticeTicker(
        page.noticeTicker
      )}

        ${renderPageTitle({
        title: "\u83DC\u54C1\u4E0E\u7814\u53D1",
        backTarget: "opening-setup",
        helpLabel: "\u7814\u53D1\u8BF4\u660E"
      })}


        ${this.renderMetrics()}

        ${this.renderTabs()}


        ${this.message ? `
              <section class="dish-result-message">
                ${escapeHtml8(
        this.message
      )}
              </section>
            ` : ""}


        <section class="dish-center-content">
          ${content}
        </section>


        ${renderBottomNavigation(
        gameChromeSystem.getNavigation({
          restaurantId: this.restaurantId,
          activePageId: "dishes"
        })
      )}

      </main>
    `;
    }
    render() {
      this.page = this.pageSystem.getPage(
        this.restaurantId
      );
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
      this.bind();
      return this.page;
    }
    bind() {
      this.root.querySelectorAll(
        "[data-dish-tab]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.tab = button.dataset.dishTab;
              this.message = "";
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-dish-tab-jump]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.tab = button.dataset.dishTabJump;
              this.message = "";
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-dish-category]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.category = button.dataset.dishCategory;
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-menu-add]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem.addToMenu(
                  this.restaurantId,
                  button.dataset.menuAdd
                );
                this.message = "\u83DC\u54C1\u5DF2\u7ECF\u52A0\u5165\u8425\u4E1A\u83DC\u5355";
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-menu-toggle]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem.toggleMenuItem(
                  button.dataset.menuToggle
                );
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-price-save]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              const id = button.dataset.priceSave;
              const input = this.root.querySelector(
                `[data-price-input="${id}"]`
              );
              try {
                this.pageSystem.setPrice(
                  id,
                  Number(
                    input?.value
                  )
                );
                this.message = "\u83DC\u54C1\u552E\u4EF7\u5DF2\u7ECF\u66F4\u65B0";
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      if (this.tab === "research") {
        this.bindResearchLab();
      }
      this.root.querySelectorAll(
        "[data-page-target]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset.pageTarget
              );
            }
          );
        }
      );
    }
    bindResearchLab() {
      const lab = this.researchLab;
      this.root.querySelectorAll(
        "[data-research-category]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              lab.category = button.dataset.researchCategory;
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-research-method]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              lab.method = button.dataset.researchMethod;
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-research-ingredient-toggle]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              try {
                lab.toggleIngredient(
                  button.dataset.researchIngredientToggle
                );
                this.message = "";
                this.render();
              } catch (error) {
                this.message = error.message;
                this.render();
              }
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-ingredient-quantity]"
      ).forEach(
        (input) => {
          input.addEventListener(
            "change",
            () => {
              lab.setQuantity(
                input.dataset.ingredientQuantity,
                input.value
              );
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-quantity-minus]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              lab.adjustQuantity(
                button.dataset.quantityMinus,
                -1
              );
              this.render();
            }
          );
        }
      );
      this.root.querySelectorAll(
        "[data-quantity-plus]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              lab.adjustQuantity(
                button.dataset.quantityPlus,
                1
              );
              this.render();
            }
          );
        }
      );
      this.root.querySelector(
        '[data-research-action="random"]'
      )?.addEventListener(
        "click",
        () => {
          try {
            const result = this.pageSystem.researchRandom(
              this.restaurantId
            );
            this.message = `\u7814\u53D1\u6210\u529F\uFF1A${result.dish.name} \xB7 ${result.dish.qualityGrade}\u7EA7 \xB7 \u54C1\u8D28${result.dish.qualityScore}`;
            this.render();
          } catch (error) {
            this.message = error.message;
            this.render();
          }
        }
      );
      this.root.querySelector(
        '[data-research-action="custom"]'
      )?.addEventListener(
        "click",
        () => {
          const name = this.root.querySelector(
            "[data-research-name]"
          )?.value?.trim();
          const ingredients = lab.getSelectedIngredients();
          if (ingredients.length < 2 || ingredients.length > 6) {
            this.message = "\u81EA\u4E3B\u7814\u53D1\u5FC5\u987B\u9009\u62E92\u20136\u79CD\u98DF\u6750";
            this.render();
            return;
          }
          try {
            const result = this.pageSystem.researchCustom({
              restaurantId: this.restaurantId,
              name,
              category: lab.category,
              method: lab.method,
              ingredients
            });
            this.message = `\u7814\u53D1\u6210\u529F\uFF1A${result.dish.name} \xB7 ${result.dish.qualityGrade}\u7EA7 \xB7 \u54C1\u8D28${result.dish.qualityScore} \xB7 \u5EFA\u8BAE\u552E\u4EF7${money7(result.dish.basePrice)}`;
            lab.selected.clear();
            this.render();
          } catch (error) {
            this.message = error.message;
            this.render();
          }
        }
      );
    }
  };
  var dishCenterView = new DishCenterView();

  // src/systems/RenovationEditorSystem.js
  var CATEGORY_LABELS2 = Object.freeze({
    dining: "\u684C\u6905",
    kitchen: "\u53A8\u623F",
    service: "\u670D\u52A1",
    waiting: "\u7B49\u5019",
    decor: "\u88C5\u9970"
  });
  var ISSUE_LABELS = Object.freeze({
    no_dining_tables: "\u7F3A\u5C11\u5C31\u9910\u684C\u6905",
    no_kitchen_station: "\u7F3A\u5C11\u53A8\u623F\u7076\u53F0",
    no_cashier_counter: "\u7F3A\u5C11\u6536\u94F6\u53F0",
    no_waiting_area: "\u7F3A\u5C11\u7B49\u5019\u533A",
    plain_environment: "\u73AF\u5883\u88C5\u9970\u4E0D\u8DB3",
    layout_too_crowded: "\u5E03\u5C40\u8FC7\u4E8E\u62E5\u6324",
    low_comfort: "\u73AF\u5883\u8212\u9002\u5EA6\u504F\u4F4E",
    kitchen_route_too_long: "\u53A8\u623F\u51FA\u9910\u52A8\u7EBF\u8FC7\u957F",
    service_route_too_long: "\u524D\u5385\u670D\u52A1\u52A8\u7EBF\u8FC7\u957F",
    missing_dining_zone: "\u7F3A\u5C11\u5C31\u9910\u533A",
    missing_kitchen_zone: "\u7F3A\u5C11\u53A8\u623F\u533A",
    missing_service_zone: "\u7F3A\u5C11\u670D\u52A1\u533A",
    missing_waiting_zone: "\u7F3A\u5C11\u7B49\u5019\u533A",
    insufficient_open_space: "\u5F00\u653E\u901A\u9053\u7A7A\u95F4\u4E0D\u8DB3",
    dining_zone_overpacked: "\u5C31\u9910\u533A\u5360\u7528\u8FC7\u9AD8",
    kitchen_zone_too_small: "\u53A8\u623F\u533A\u9762\u79EF\u4E0D\u8DB3",
    tables_too_close: "\u9910\u684C\u95F4\u8DDD\u8FC7\u5C0F"
  });
  function clone6(value) {
    return structuredClone(value);
  }
  var RenovationEditorSystem = class {
    constructor() {
      this.sessions = /* @__PURE__ */ new Map();
    }
    getCategory(definition) {
      if (definition.type === "table") {
        return "dining";
      }
      if (definition.type === "kitchen" || definition.type === "kitchen_support") {
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
      const floor = session.floors.find((item) => item.id === id);
      if (!floor) {
        throw new Error(`Renovation floor "${id}" does not exist`);
      }
      return floor;
    }
    open(restaurantId2) {
      restaurantSystem.get(restaurantId2);
      const layout = renovationSystem.requireLayout(
        restaurantId2
      );
      const floors = clone6(
        renovationSystem.getLayoutFloors(layout)
      );
      const activeFloorId = layout.activeFloorId ?? floors[0].id;
      const activeFloor = floors.find(
        (item) => item.id === activeFloorId
      ) ?? floors[0];
      const session = {
        restaurantId: restaurantId2,
        layoutId: layout.id,
        propertyId: layout.propertyId ?? null,
        baselineRevision: layout.revision ?? 1,
        originalActive: Boolean(layout.active),
        floors,
        activeFloorId: activeFloor.id,
        width: activeFloor.width,
        height: activeFloor.height,
        placements: clone6(layout.placements ?? []),
        nextDraftNumber: 1,
        openedAt: gameState.getSection("time").totalMinutes
      };
      this.sessions.set(
        restaurantId2,
        session
      );
      return this.getPageState(
        restaurantId2
      );
    }
    hasSession(restaurantId2) {
      return this.sessions.has(
        restaurantId2
      );
    }
    requireSession(restaurantId2) {
      const session = this.sessions.get(
        restaurantId2
      );
      if (!session) {
        throw new Error(
          "Renovation editor session is not open"
        );
      }
      return session;
    }
    setActiveFloor(restaurantId2, floorId) {
      const session = this.requireSession(restaurantId2);
      const floor = this.getSessionFloor(session, floorId);
      session.activeFloorId = floor.id;
      session.width = floor.width;
      session.height = floor.height;
      return this.getPageState(restaurantId2);
    }
    getDraftLayout(restaurantId2) {
      const session = this.requireSession(
        restaurantId2
      );
      return {
        id: session.layoutId,
        restaurantId: restaurantId2,
        propertyId: session.propertyId,
        floors: clone6(session.floors),
        floorCount: session.floors.length,
        activeFloorId: session.activeFloorId,
        width: session.width,
        height: session.height,
        active: false,
        placements: clone6(session.placements)
      };
    }
    getCatalog(restaurantId2) {
      const balance = financeSystem.getBalance(
        restaurantId2
      );
      const groups = {
        dining: [],
        kitchen: [],
        service: [],
        waiting: [],
        decor: []
      };
      for (const item of renovationSystem.getCatalog(
        restaurantId2
      )) {
        const category = this.getCategory(item);
        groups[category].push({
          ...item,
          category,
          categoryLabel: CATEGORY_LABELS2[category],
          affordable: balance >= item.cost
        });
      }
      return Object.entries(groups).map(
        ([id, items]) => ({
          id,
          name: CATEGORY_LABELS2[id],
          items
        })
      );
    }
    validateDraft(restaurantId2, placements) {
      const session = this.requireSession(
        restaurantId2
      );
      const limits = storeProgressSystem.getLimits(
        restaurantId2
      );
      const temporary = {
        propertyId: session.propertyId,
        floors: clone6(session.floors),
        floorCount: session.floors.length,
        activeFloorId: session.activeFloorId,
        width: session.width,
        height: session.height,
        placements: []
      };
      let tableCount = 0;
      let kitchenStations = 0;
      const furnitureCounts = /* @__PURE__ */ new Map();
      for (const placement of placements) {
        const definition = renovationSystem.getFurnitureDefinition(
          placement.furnitureId
        );
        if (definition.requiresFeature && !storeProgressSystem.isUnlocked(
          restaurantId2,
          definition.requiresFeature
        )) {
          throw new Error(
            `Furniture "${definition.id}" is not unlocked`
          );
        }
        if (definition.type === "table") {
          tableCount += 1;
        }
        kitchenStations += definition.kitchenStations ?? 0;
        const count = (furnitureCounts.get(
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
        if (kitchenStations > limits.kitchenStations) {
          throw new Error(
            `Kitchen station limit reached: ${limits.kitchenStations}`
          );
        }
        if (definition.maxCount && count > definition.maxCount) {
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
    addItem(restaurantId2, furnitureId, {
      x,
      y,
      rotation = 0,
      floorId = null
    }) {
      const session = this.requireSession(
        restaurantId2
      );
      const targetFloor = this.getSessionFloor(
        session,
        floorId ?? session.activeFloorId
      );
      const placement = {
        id: `draft_${session.nextDraftNumber}`,
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
        restaurantId2,
        next
      );
      session.nextDraftNumber += 1;
      session.placements = next;
      return this.getPageState(
        restaurantId2
      );
    }
    moveItem(restaurantId2, placementId, x, y) {
      const session = this.requireSession(
        restaurantId2
      );
      let found = false;
      const next = session.placements.map(
        (item) => {
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
        restaurantId2,
        next
      );
      session.placements = next;
      return this.getPageState(
        restaurantId2
      );
    }
    moveItemToFloor(restaurantId2, placementId, floorId, x, y) {
      const session = this.requireSession(restaurantId2);
      const floor = this.getSessionFloor(session, floorId);
      let found = false;
      const next = session.placements.map((item) => {
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
      this.validateDraft(restaurantId2, next);
      session.placements = next;
      return this.getPageState(restaurantId2);
    }
    rotateItem(restaurantId2, placementId) {
      const session = this.requireSession(
        restaurantId2
      );
      let found = false;
      const next = session.placements.map(
        (item) => {
          if (item.id !== placementId) {
            return item;
          }
          found = true;
          return {
            ...item,
            rotation: (item.rotation ?? 0) === 0 ? 90 : 0
          };
        }
      );
      if (!found) {
        throw new Error(
          `Placement "${placementId}" does not exist`
        );
      }
      this.validateDraft(
        restaurantId2,
        next
      );
      session.placements = next;
      return this.getPageState(
        restaurantId2
      );
    }
    removeItem(restaurantId2, placementId) {
      const session = this.requireSession(
        restaurantId2
      );
      const before = session.placements.length;
      session.placements = session.placements.filter(
        (item) => item.id !== placementId
      );
      if (session.placements.length === before) {
        throw new Error(
          `Placement "${placementId}" does not exist`
        );
      }
      return this.getPageState(
        restaurantId2
      );
    }
    reset(restaurantId2) {
      const session = this.requireSession(
        restaurantId2
      );
      const layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout) {
        throw new Error(
          "Renovation layout does not exist"
        );
      }
      const floors = clone6(
        renovationSystem.getLayoutFloors(layout)
      );
      const activeFloorId = layout.activeFloorId ?? floors[0].id;
      const activeFloor = floors.find(
        (item) => item.id === activeFloorId
      ) ?? floors[0];
      session.propertyId = layout.propertyId ?? null;
      session.floors = floors;
      session.activeFloorId = activeFloor.id;
      session.width = activeFloor.width;
      session.height = activeFloor.height;
      session.baselineRevision = layout.revision ?? 1;
      session.originalActive = Boolean(layout.active);
      session.placements = clone6(layout.placements ?? []);
      session.nextDraftNumber = 1;
      return this.getPageState(
        restaurantId2
      );
    }
    buildTemplatePlacements(restaurantId2, templateId) {
      const session = this.requireSession(
        restaurantId2
      );
      const template = renovationPlanningSystem.getTemplate(templateId);
      const catalog = new Map(
        renovationSystem.getCatalog(restaurantId2).map((item) => [
          item.id,
          item
        ])
      );
      const offFloor = session.placements.filter(
        (item) => (item.floorId ?? session.floors[0].id) !== session.activeFloorId
      );
      const planned = [];
      let draftNumber = 1;
      const workingLayout = {
        propertyId: session.propertyId,
        floors: clone6(session.floors),
        activeFloorId: session.activeFloorId,
        width: session.width,
        height: session.height,
        placements: []
      };
      for (const furnitureId of template.items) {
        const definition = catalog.get(furnitureId);
        if (!definition || !definition.unlocked) {
          continue;
        }
        const candidates = renovationPlanningSystem.getCandidateCoordinates(
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
              restaurantId2,
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
        restaurantId2,
        combined
      );
      return combined;
    }
    previewTemplate(restaurantId2, templateId) {
      const placements = this.buildTemplatePlacements(
        restaurantId2,
        templateId
      );
      return {
        template: renovationPlanningSystem.getTemplate(templateId),
        placements: clone6(placements),
        budget: this.getBudgetForPlacements(
          restaurantId2,
          placements
        ),
        analysis: this.getAnalysisForPlacements(
          restaurantId2,
          placements
        )
      };
    }
    applyTemplate(restaurantId2, templateId) {
      const session = this.requireSession(
        restaurantId2
      );
      session.placements = this.buildTemplatePlacements(
        restaurantId2,
        templateId
      );
      session.nextDraftNumber = session.placements.length + 1;
      return this.getPageState(
        restaurantId2
      );
    }
    getBudgetForPlacements(restaurantId2, placements) {
      let equipment = 0;
      let decoration = 0;
      for (const placement of placements) {
        if (!placement.draftNew) {
          continue;
        }
        const definition = renovationSystem.getFurnitureDefinition(
          placement.furnitureId
        );
        if (definition.type === "decor") {
          decoration += definition.cost;
        } else {
          equipment += definition.cost;
        }
      }
      const purchaseCost = equipment + decoration;
      const balance = financeSystem.getBalance(
        restaurantId2
      );
      return {
        balance,
        equipment,
        decoration,
        purchaseCost,
        remaining: balance - purchaseCost,
        affordable: balance >= purchaseCost
      };
    }
    getBudget(restaurantId2) {
      return this.getBudgetForPlacements(
        restaurantId2,
        this.requireSession(
          restaurantId2
        ).placements
      );
    }
    getAnalysisForPlacements(restaurantId2, placements) {
      const session = this.requireSession(
        restaurantId2
      );
      const layout = {
        id: session.layoutId,
        restaurantId: restaurantId2,
        propertyId: session.propertyId,
        floors: clone6(session.floors),
        floorCount: session.floors.length,
        activeFloorId: session.activeFloorId,
        width: session.width,
        height: session.height,
        active: false,
        placements: clone6(placements)
      };
      const flow = layoutFlowSystem.calculate(
        layout
      );
      const zoning = renovationPlanningSystem.getZoneAnalysis(layout);
      const spacing = renovationPlanningSystem.getTableSpacing(layout);
      const completeness = renovationPlanningSystem.getCompletenessScore(
        layout
      );
      const score = Math.round(
        flow.flowScore * 0.32 + flow.comfortScore * 0.23 + zoning.zoningScore * 0.2 + spacing.spacingScore * 0.1 + completeness * 0.15
      );
      const issues = [
        ...flow.issues ?? [],
        ...zoning.issues ?? [],
        ...spacing.issues ?? []
      ];
      return {
        score,
        grade: renovationPlanningSystem.getGrade(score),
        scores: {
          flow: flow.flowScore,
          comfort: flow.comfortScore,
          zoning: zoning.zoningScore,
          spacing: spacing.spacingScore,
          completeness
        },
        zoning,
        spacing,
        issues: [...new Set(issues)].map(
          (id) => ({
            id,
            label: ISSUE_LABELS[id] ?? id
          })
        )
      };
    }
    getAnalysis(restaurantId2) {
      return this.getAnalysisForPlacements(
        restaurantId2,
        this.requireSession(
          restaurantId2
        ).placements
      );
    }
    getPageState(restaurantId2) {
      const session = this.requireSession(
        restaurantId2
      );
      const activeFloor = this.getSessionFloor(session);
      const activePlacements = session.placements.filter(
        (item) => (item.floorId ?? session.floors[0].id) === session.activeFloorId
      );
      const analysis = this.getAnalysis(restaurantId2);
      return {
        restaurantId: restaurantId2,
        layout: {
          id: session.layoutId,
          propertyId: session.propertyId,
          width: session.width,
          height: session.height,
          floorCount: session.floors.length,
          activeFloorId: session.activeFloorId,
          activeFloor: clone6(activeFloor),
          floors: clone6(session.floors),
          placements: clone6(activePlacements),
          totalPlacements: session.placements.length,
          baselineRevision: session.baselineRevision,
          originallyActive: session.originalActive
        },
        catalog: this.getCatalog(
          restaurantId2
        ),
        budget: this.getBudget(
          restaurantId2
        ),
        analysis,
        templates: renovationPlanningSystem.getTemplates(),
        actions: {
          canSave: true,
          canSwitchFloor: session.floors.length > 1,
          canActivate: analysis.scores.completeness === 100
        }
      };
    }
    save(restaurantId2, {
      activate = false
    } = {}) {
      const session = this.requireSession(
        restaurantId2
      );
      const liveLayout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!liveLayout) {
        throw new Error(
          "Renovation layout does not exist"
        );
      }
      if ((liveLayout.revision ?? 1) !== session.baselineRevision) {
        throw new Error(
          "Renovation layout changed outside editor; reopen editor"
        );
      }
      this.validateDraft(
        restaurantId2,
        session.placements
      );
      const budget = this.getBudget(
        restaurantId2
      );
      if (!budget.affordable) {
        throw new Error(
          "Insufficient funds for renovation draft"
        );
      }
      const previewLayout = {
        ...liveLayout,
        floors: clone6(session.floors),
        activeFloorId: session.activeFloorId,
        width: session.width,
        height: session.height,
        placements: session.placements
      };
      const modifiers = renovationSystem.getOperationalModifiersFromLayout(
        previewLayout
      );
      if (activate) {
        if (modifiers.seats < 2) {
          throw new Error(
            "Active renovation requires at least 2 seats"
          );
        }
        if (modifiers.kitchenStations < 1) {
          throw new Error(
            "Active renovation requires at least 1 kitchen station"
          );
        }
      }
      if (budget.equipment > 0) {
        financeSystem.expense(
          restaurantId2,
          budget.equipment,
          CATEGORY.EQUIPMENT,
          "\u88C5\u4FEE\u7F16\u8F91\u5668\uFF1A\u8BBE\u5907\u8D2D\u7F6E"
        );
      }
      if (budget.decoration > 0) {
        financeSystem.expense(
          restaurantId2,
          budget.decoration,
          CATEGORY.DECORATION,
          "\u88C5\u4FEE\u7F16\u8F91\u5668\uFF1A\u88C5\u9970\u8D2D\u7F6E"
        );
      }
      let nextNumber = liveLayout.nextPlacementNumber ?? 1;
      const defaultFloorId = session.floors[0].id;
      const placements = session.placements.map(
        (item) => {
          const clean = {
            furnitureId: item.furnitureId,
            floorId: item.floorId ?? defaultFloorId,
            x: item.x,
            y: item.y,
            rotation: item.rotation ?? 0
          };
          if (item.draftNew) {
            clean.id = `placement_${nextNumber}`;
            nextNumber += 1;
          } else {
            clean.id = item.id;
          }
          return clean;
        }
      );
      const time = gameState.getSection("time");
      const activeFloor = this.getSessionFloor(session);
      const updated = entitySystem.update(
        "renovation_layout",
        liveLayout.id,
        {
          floors: clone6(session.floors),
          floorCount: session.floors.length,
          activeFloorId: session.activeFloorId,
          width: activeFloor.width,
          height: activeFloor.height,
          placements,
          nextPlacementNumber: nextNumber,
          totalSpent: (liveLayout.totalSpent ?? 0) + budget.purchaseCost,
          active: Boolean(activate),
          activatedDay: activate ? time.day : liveLayout.activatedDay ?? null,
          revision: (liveLayout.revision ?? 0) + 1,
          updatedDay: time.day
        }
      );
      eventBus.emit(
        "renovation:editorSaved",
        {
          restaurantId: restaurantId2,
          layoutId: updated.id,
          activate: Boolean(activate),
          purchaseCost: budget.purchaseCost,
          floorCount: session.floors.length
        }
      );
      this.sessions.delete(
        restaurantId2
      );
      return {
        layout: updated,
        budget,
        analysis: renovationPlanningSystem.getAnalysis(
          restaurantId2
        )
      };
    }
    discard(restaurantId2) {
      const existed = this.sessions.delete(
        restaurantId2
      );
      return {
        restaurantId: restaurantId2,
        discarded: existed
      };
    }
  };
  var renovationEditorSystem = new RenovationEditorSystem();

  // src/systems/RenovationConstructionSystem.js
  var STATUS3 = Object.freeze({
    BUILDING: "building",
    READY: "ready_for_inspection",
    COMPLETED: "completed"
  });
  function clamp17(value, min, max) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }
  function currentDay3() {
    return gameState.getSection(
      "time"
    )?.day ?? 1;
  }
  var RenovationConstructionSystem = class {
    listByRestaurant(restaurantId2) {
      return entitySystem.list(
        "renovation_construction"
      ).filter(
        (item) => item.restaurantId === restaurantId2
      ).sort(
        (a, b) => (b.startDay ?? 0) - (a.startDay ?? 0)
      );
    }
    getCurrent(restaurantId2) {
      return this.listByRestaurant(
        restaurantId2
      ).find(
        (item) => [
          STATUS3.BUILDING,
          STATUS3.READY
        ].includes(
          item.status
        )
      ) ?? null;
    }
    getLatest(restaurantId2) {
      return this.listByRestaurant(
        restaurantId2
      )[0] ?? null;
    }
    estimateDurationDays({
      area,
      placements
    }) {
      const safeArea = Math.max(
        1,
        Number(area) || 1
      );
      const safePlacements = Math.max(
        1,
        Number(placements) || 1
      );
      return clamp17(
        1 + Math.ceil(
          safeArea / 500
        ) + Math.ceil(
          safePlacements / 20
        ),
        3,
        10
      );
    }
    getProgressModel(construction, day = currentDay3()) {
      if (!construction) {
        return {
          progress: 0,
          elapsedDays: 0,
          remainingDays: 0,
          phase: "none",
          phaseLabel: "\u6682\u65E0\u65BD\u5DE5"
        };
      }
      if (construction.status === STATUS3.COMPLETED) {
        return {
          progress: 100,
          elapsedDays: construction.durationDays,
          remainingDays: 0,
          phase: "completed",
          phaseLabel: "\u5DF2\u5B8C\u5DE5\u542F\u7528"
        };
      }
      const elapsedDays = clamp17(
        day - construction.startDay,
        0,
        construction.durationDays
      );
      const progress = clamp17(
        Math.floor(
          elapsedDays / construction.durationDays * 100
        ),
        0,
        100
      );
      const remainingDays = Math.max(
        0,
        construction.endDay - day
      );
      if (construction.status === STATUS3.READY || progress >= 100) {
        return {
          progress: 100,
          elapsedDays: construction.durationDays,
          remainingDays: 0,
          phase: "inspection",
          phaseLabel: "\u7B49\u5F85\u5B8C\u5DE5\u9A8C\u6536"
        };
      }
      let phase = "base";
      let phaseLabel = "\u57FA\u7840\u65BD\u5DE5";
      if (progress >= 75) {
        phase = "finishing";
        phaseLabel = "\u6536\u5C3E\u6E05\u6D01";
      } else if (progress >= 45) {
        phase = "installation";
        phaseLabel = "\u8BBE\u5907\u4E0E\u5BB6\u5177\u5B89\u88C5";
      } else if (progress >= 20) {
        phase = "utilities";
        phaseLabel = "\u6C34\u7535\u4E0E\u53A8\u623F\u65BD\u5DE5";
      }
      return {
        progress,
        elapsedDays,
        remainingDays,
        phase,
        phaseLabel
      };
    }
    validateDraft(restaurantId2) {
      const page = renovationEditorSystem.getPageState(
        restaurantId2
      );
      if (!page.actions.canActivate) {
        throw new Error(
          "\u88C5\u4FEE\u5E03\u5C40\u5C1A\u672A\u8FBE\u5230\u65BD\u5DE5\u8981\u6C42"
        );
      }
      const draft = renovationEditorSystem.getDraftLayout(
        restaurantId2
      );
      const modifiers = renovationSystem.getOperationalModifiersFromLayout(
        draft
      );
      if (modifiers.seats < 2) {
        throw new Error(
          "\u65BD\u5DE5\u65B9\u6848\u81F3\u5C11\u9700\u89812\u4E2A\u9910\u4F4D"
        );
      }
      if (modifiers.kitchenStations < 1) {
        throw new Error(
          "\u65BD\u5DE5\u65B9\u6848\u81F3\u5C11\u9700\u89811\u4E2A\u53A8\u623F\u5DE5\u4F4D"
        );
      }
      return {
        page,
        draft,
        modifiers
      };
    }
    startFromEditor(restaurantId2) {
      if (this.getCurrent(
        restaurantId2
      )) {
        throw new Error(
          "\u5F53\u524D\u5DF2\u7ECF\u6709\u88C5\u4FEE\u65BD\u5DE5\u4EFB\u52A1"
        );
      }
      const preview = this.validateDraft(
        restaurantId2
      );
      const saved = renovationEditorSystem.save(
        restaurantId2,
        {
          activate: false
        }
      );
      const started = this.startSavedLayout(
        restaurantId2,
        {
          projectCost: saved.budget.purchaseCost,
          analysis: saved.analysis,
          expectedModifiers: preview.modifiers
        }
      );
      return {
        ...saved,
        construction: started,
        constructionStarted: true,
        nextPage: "renovation_construction"
      };
    }
    startSavedLayout(restaurantId2, {
      projectCost = 0,
      analysis = null,
      expectedModifiers = null
    } = {}) {
      if (this.getCurrent(
        restaurantId2
      )) {
        throw new Error(
          "\u5F53\u524D\u5DF2\u7ECF\u6709\u88C5\u4FEE\u65BD\u5DE5\u4EFB\u52A1"
        );
      }
      let layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout) {
        throw new Error(
          "\u88C5\u4FEE\u5E03\u5C40\u4E0D\u5B58\u5728"
        );
      }
      const modifiers = expectedModifiers ?? renovationSystem.getOperationalModifiersFromLayout(
        layout
      );
      if (modifiers.seats < 2) {
        throw new Error(
          "\u65BD\u5DE5\u65B9\u6848\u81F3\u5C11\u9700\u89812\u4E2A\u9910\u4F4D"
        );
      }
      if (modifiers.kitchenStations < 1) {
        throw new Error(
          "\u65BD\u5DE5\u65B9\u6848\u81F3\u5C11\u9700\u89811\u4E2A\u53A8\u623F\u5DE5\u4F4D"
        );
      }
      if (layout.active) {
        layout = renovationSystem.deactivateLayout(
          restaurantId2
        );
      }
      const floors = renovationSystem.getLayoutFloors(
        layout
      );
      const area = floors.reduce(
        (sum, floor) => sum + (floor.usableArea ?? floor.area ?? 0),
        0
      );
      const placements = layout.placements?.length ?? 0;
      const durationDays = this.estimateDurationDays({
        area,
        placements
      });
      const startDay = currentDay3();
      const construction = entitySystem.create(
        "renovation_construction",
        {
          restaurantId: restaurantId2,
          layoutId: layout.id,
          layoutRevision: layout.revision ?? 1,
          propertyId: layout.propertyId ?? null,
          status: STATUS3.BUILDING,
          startDay,
          endDay: startDay + durationDays,
          durationDays,
          area,
          placements,
          projectCost: Math.max(
            0,
            Number(
              projectCost
            ) || 0
          ),
          expectedModifiers: structuredClone(
            modifiers
          ),
          analysis: analysis ? structuredClone(
            analysis
          ) : null,
          readyDay: null,
          inspectedDay: null,
          completedDay: null
        }
      );
      eventBus.emit(
        "renovationConstruction:started",
        {
          restaurantId: restaurantId2,
          constructionId: construction.id,
          durationDays,
          endDay: construction.endDay
        }
      );
      return construction;
    }
    synchronize(construction, day = currentDay3()) {
      if (!construction || construction.status !== STATUS3.BUILDING) {
        return construction;
      }
      if (day < construction.endDay) {
        return construction;
      }
      const updated = entitySystem.update(
        "renovation_construction",
        construction.id,
        {
          status: STATUS3.READY,
          readyDay: day
        }
      );
      eventBus.emit(
        "renovationConstruction:ready",
        {
          restaurantId: construction.restaurantId,
          constructionId: construction.id,
          day
        }
      );
      return updated;
    }
    getStatus(restaurantId2) {
      const current = this.getCurrent(
        restaurantId2
      );
      if (current) {
        const construction = this.synchronize(
          current
        );
        return {
          construction,
          progress: this.getProgressModel(
            construction
          )
        };
      }
      const latest = this.getLatest(
        restaurantId2
      );
      return {
        construction: latest,
        progress: this.getProgressModel(
          latest
        )
      };
    }
    processDay(day = currentDay3()) {
      let completedWork = 0;
      const jobs = entitySystem.list(
        "renovation_construction"
      ).filter(
        (item) => item.status === STATUS3.BUILDING
      );
      for (const construction of jobs) {
        const updated = this.synchronize(
          construction,
          day
        );
        if (updated.status === STATUS3.READY) {
          completedWork += 1;
        }
      }
      return {
        day,
        checked: jobs.length,
        ready: completedWork
      };
    }
    inspect(restaurantId2) {
      const current = this.getCurrent(
        restaurantId2
      );
      if (!current) {
        throw new Error(
          "\u5F53\u524D\u6CA1\u6709\u5F85\u9A8C\u6536\u7684\u88C5\u4FEE\u5DE5\u7A0B"
        );
      }
      const construction = this.synchronize(
        current
      );
      if (construction.status !== STATUS3.READY) {
        throw new Error(
          "\u88C5\u4FEE\u5DE5\u7A0B\u5C1A\u672A\u5B8C\u5DE5"
        );
      }
      const layout = renovationSystem.getLayout(
        restaurantId2
      );
      if (!layout) {
        throw new Error(
          "\u88C5\u4FEE\u5E03\u5C40\u4E0D\u5B58\u5728"
        );
      }
      if ((layout.revision ?? 1) !== construction.layoutRevision) {
        throw new Error(
          "\u65BD\u5DE5\u671F\u95F4\u5E03\u5C40\u53D1\u751F\u53D8\u5316\uFF0C\u5FC5\u987B\u91CD\u65B0\u786E\u8BA4\u65BD\u5DE5\u65B9\u6848"
        );
      }
      const activated = renovationSystem.activateLayout(
        restaurantId2
      );
      const day = currentDay3();
      const completed = entitySystem.update(
        "renovation_construction",
        construction.id,
        {
          status: STATUS3.COMPLETED,
          inspectedDay: day,
          completedDay: day,
          activatedLayoutRevision: activated.revision
        }
      );
      eventBus.emit(
        "renovationConstruction:completed",
        {
          restaurantId: restaurantId2,
          constructionId: completed.id,
          layoutId: activated.id,
          day
        }
      );
      return {
        construction: completed,
        layout: activated,
        modifiers: renovationSystem.getOperationalModifiers(
          restaurantId2
        )
      };
    }
  };
  var renovationConstructionSystem = new RenovationConstructionSystem();

  // src/ui/renovation/RenovationWorkspaceModel.js
  var WORKSPACE_MODE = Object.freeze({
    DIRECT: "direct",
    ZOOM: "zoom",
    ZONE: "zone"
  });
  var MODE_LABELS = Object.freeze({
    [WORKSPACE_MODE.DIRECT]: "\u6574\u5E97\u7F16\u8F91",
    [WORKSPACE_MODE.ZOOM]: "\u7F29\u653E\u7F16\u8F91",
    [WORKSPACE_MODE.ZONE]: "\u5206\u533A\u7F16\u8F91"
  });
  function clamp18(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function getFloorArea(floor) {
    if (!floor) {
      return 0;
    }
    if (Number.isFinite(floor.usableArea)) {
      return floor.usableArea;
    }
    if (Number.isFinite(floor.area)) {
      return floor.area;
    }
    return Math.max(0, (floor.width ?? 0) * (floor.height ?? 0));
  }
  function getWorkspaceMode(floor) {
    const area = getFloorArea(floor);
    if (area <= 120) {
      return WORKSPACE_MODE.DIRECT;
    }
    if (area <= 1e3) {
      return WORKSPACE_MODE.ZOOM;
    }
    return WORKSPACE_MODE.ZONE;
  }
  function getZoomConfig(mode) {
    if (mode === WORKSPACE_MODE.DIRECT) {
      return {
        min: 1,
        max: 1,
        step: 0,
        defaultValue: 1
      };
    }
    if (mode === WORKSPACE_MODE.ZOOM) {
      return {
        min: 1,
        max: 2.5,
        step: 0.25,
        defaultValue: 1
      };
    }
    return {
      min: 1,
      max: 3,
      step: 0.25,
      defaultValue: 1
    };
  }
  function normalizeZoom(value, mode) {
    const config = getZoomConfig(mode);
    const numeric = Number.isFinite(value) ? value : config.defaultValue;
    if (config.step === 0) {
      return config.defaultValue;
    }
    const stepped = Math.round(numeric / config.step) * config.step;
    return Number(clamp18(stepped, config.min, config.max).toFixed(2));
  }
  function buildWorkspaceZones(floor) {
    if (!floor) {
      return [];
    }
    const width = Math.max(1, Math.round(floor.width ?? 1));
    const height = Math.max(1, Math.round(floor.height ?? 1));
    const area = getFloorArea(floor);
    if (area <= 1e3) {
      return [
        {
          id: "zone_all",
          label: "\u5168\u5C42",
          x: 0,
          y: 0,
          width,
          height,
          row: 0,
          column: 0
        }
      ];
    }
    const desired = clamp18(Math.ceil(area / 800), 2, 16);
    const aspect = width / Math.max(1, height);
    const columns = clamp18(
      Math.ceil(Math.sqrt(desired * aspect)),
      1,
      6
    );
    const rows = clamp18(Math.ceil(desired / columns), 1, 6);
    const zoneWidth = Math.ceil(width / columns);
    const zoneHeight = Math.ceil(height / rows);
    const zones = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = column * zoneWidth;
        const y = row * zoneHeight;
        if (x >= width || y >= height) {
          continue;
        }
        const letter = String.fromCharCode(65 + row);
        zones.push({
          id: `zone_${row + 1}_${column + 1}`,
          label: `${letter}${column + 1}\u533A`,
          x,
          y,
          width: Math.min(zoneWidth, width - x),
          height: Math.min(zoneHeight, height - y),
          row,
          column
        });
      }
    }
    return zones;
  }
  function getViewBounds(floor, mode, zones = [], activeZoneId = null) {
    const full = {
      x: 0,
      y: 0,
      width: Math.max(1, Math.round(floor?.width ?? 1)),
      height: Math.max(1, Math.round(floor?.height ?? 1))
    };
    if (mode !== WORKSPACE_MODE.ZONE) {
      return full;
    }
    const zone = zones.find((item) => item.id === activeZoneId) ?? zones[0] ?? null;
    return zone ? {
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height
    } : full;
  }
  function placementIntersectsBounds(placement, bounds) {
    const width = Math.max(1, placement.width ?? 1);
    const height = Math.max(1, placement.height ?? 1);
    return !(placement.x + width <= bounds.x || placement.y + height <= bounds.y || placement.x >= bounds.x + bounds.width || placement.y >= bounds.y + bounds.height);
  }
  function buildMinimapModel({
    floor,
    placements = [],
    viewBounds
  }) {
    const width = Math.max(1, floor?.width ?? 1);
    const height = Math.max(1, floor?.height ?? 1);
    return {
      width,
      height,
      polygon: structuredClone(floor?.polygon ?? []),
      placements: placements.map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        width: item.width ?? 1,
        height: item.height ?? 1,
        type: item.type ?? null
      })),
      viewport: {
        x: viewBounds.x / width,
        y: viewBounds.y / height,
        width: viewBounds.width / width,
        height: viewBounds.height / height
      }
    };
  }

  // src/ui/renovation/RenovationMobilePageSystem.js
  var DEFAULT_CATEGORY = "dining";
  var RenovationMobilePageSystem = class {
    constructor() {
      this.uiState = /* @__PURE__ */ new Map();
    }
    open(restaurantId2) {
      const editor = renovationEditorSystem.open(restaurantId2);
      this.uiState.set(restaurantId2, {
        activeCategory: DEFAULT_CATEGORY,
        selectedFurnitureId: null,
        selectedPlacementId: null,
        pendingRotation: 0,
        issuesExpanded: false,
        templatesExpanded: false,
        drawerExpanded: true,
        minimapExpanded: false,
        zoom: 1,
        activeZoneByFloor: {}
      });
      return this.getPage(restaurantId2, editor);
    }
    requireUiState(restaurantId2) {
      const state = this.uiState.get(restaurantId2);
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
          (candidate) => candidate.id === furnitureId
        );
        if (item) {
          return item;
        }
      }
      return null;
    }
    getPage(restaurantId2, editorState = null) {
      const ui = this.requireUiState(restaurantId2);
      const editor = editorState ?? renovationEditorSystem.getPageState(restaurantId2);
      const category = editor.catalog.find((item) => item.id === ui.activeCategory) ?? editor.catalog[0] ?? null;
      const selectedPlacement = ui.selectedPlacementId ? editor.layout.placements.find(
        (item) => item.id === ui.selectedPlacementId
      ) ?? null : null;
      const selectedFurniture = ui.selectedFurnitureId ? this.findCatalogItem(editor, ui.selectedFurnitureId) : null;
      const activeFloor = editor.layout.activeFloor ?? {
        id: editor.layout.activeFloorId ?? "floor_1",
        label: "1F",
        width: editor.layout.width,
        height: editor.layout.height,
        area: editor.layout.width * editor.layout.height,
        usableArea: editor.layout.width * editor.layout.height,
        polygon: []
      };
      const mode = getWorkspaceMode(activeFloor);
      const zoomConfig = getZoomConfig(mode);
      ui.zoom = normalizeZoom(ui.zoom, mode);
      const zones = buildWorkspaceZones(activeFloor);
      if (mode === "zone" && !ui.activeZoneByFloor[activeFloor.id]) {
        ui.activeZoneByFloor[activeFloor.id] = zones[0]?.id ?? null;
      }
      const activeZoneId = mode === "zone" ? ui.activeZoneByFloor[activeFloor.id] ?? zones[0]?.id ?? null : null;
      const viewBounds = getViewBounds(
        activeFloor,
        mode,
        zones,
        activeZoneId
      );
      const floorPlacements = editor.layout.placements.map(
        (item) => this.getPlacementView(item)
      );
      const visiblePlacements = floorPlacements.filter(
        (item) => placementIntersectsBounds(item, viewBounds)
      );
      const minimap = buildMinimapModel({
        floor: activeFloor,
        placements: floorPlacements,
        viewBounds
      });
      return {
        restaurantId: restaurantId2,
        header: {
          balance: editor.budget.balance,
          currentCost: editor.budget.purchaseCost,
          remaining: editor.budget.remaining,
          affordable: editor.budget.affordable,
          score: editor.analysis.score,
          grade: editor.analysis.grade
        },
        workspace: {
          width: viewBounds.width,
          height: viewBounds.height,
          floorWidth: activeFloor.width,
          floorHeight: activeFloor.height,
          floorCount: editor.layout.floorCount ?? 1,
          floors: structuredClone(editor.layout.floors ?? []),
          activeFloorId: editor.layout.activeFloorId ?? null,
          activeFloor: structuredClone(activeFloor),
          totalPlacements: editor.layout.totalPlacements ?? editor.layout.placements.length,
          floorPlacementCount: floorPlacements.length,
          placements: visiblePlacements,
          floorPlacements,
          selectedPlacementId: ui.selectedPlacementId,
          mode,
          modeLabel: MODE_LABELS[mode] ?? mode,
          zoom: ui.zoom,
          zoomMin: zoomConfig.min,
          zoomMax: zoomConfig.max,
          zoomStep: zoomConfig.step,
          canZoom: zoomConfig.max > zoomConfig.min,
          viewBounds,
          zones,
          activeZoneId,
          minimap: {
            ...minimap,
            enabled: mode !== "direct" || (editor.layout.floorCount ?? 1) > 1,
            expanded: ui.minimapExpanded
          }
        },
        drawer: {
          expanded: ui.drawerExpanded,
          activeCategory: category?.id ?? null,
          categories: editor.catalog.map((item) => ({
            id: item.id,
            name: item.name,
            count: item.items.length
          })),
          items: category?.items ?? [],
          selectedFurnitureId: ui.selectedFurnitureId,
          pendingRotation: ui.pendingRotation
        },
        selection: {
          placement: selectedPlacement ? this.getPlacementView(selectedPlacement) : null,
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
          canActivate: editor.actions.canActivate && editor.budget.affordable,
          canSwitchFloor: Boolean(editor.actions.canSwitchFloor)
        }
      };
    }
    switchFloor(restaurantId2, floorId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.setActiveFloor(
        restaurantId2,
        floorId
      );
      ui.selectedPlacementId = null;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      ui.zoom = 1;
      return this.getPage(restaurantId2, editor);
    }
    selectZone(restaurantId2, zoneId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      const floor = editor.layout.activeFloor;
      const mode = getWorkspaceMode(floor);
      const zones = buildWorkspaceZones(floor);
      if (mode !== "zone") {
        throw new Error("Active floor does not require zone navigation");
      }
      if (!zones.some((item) => item.id === zoneId)) {
        throw new Error(`Unknown renovation zone "${zoneId}"`);
      }
      ui.activeZoneByFloor[floor.id] = zoneId;
      ui.selectedPlacementId = null;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      ui.zoom = 1;
      return this.getPage(restaurantId2, editor);
    }
    setZoom(restaurantId2, value) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      const mode = getWorkspaceMode(editor.layout.activeFloor);
      ui.zoom = normalizeZoom(value, mode);
      return this.getPage(restaurantId2, editor);
    }
    zoomIn(restaurantId2) {
      const page = this.getPage(restaurantId2);
      return this.setZoom(
        restaurantId2,
        page.workspace.zoom + page.workspace.zoomStep
      );
    }
    zoomOut(restaurantId2) {
      const page = this.getPage(restaurantId2);
      return this.setZoom(
        restaurantId2,
        page.workspace.zoom - page.workspace.zoomStep
      );
    }
    resetZoom(restaurantId2) {
      return this.setZoom(restaurantId2, 1);
    }
    toggleMinimap(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      ui.minimapExpanded = !ui.minimapExpanded;
      return this.getPage(restaurantId2);
    }
    selectCategory(restaurantId2, categoryId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      if (!editor.catalog.some((item) => item.id === categoryId)) {
        throw new Error(`Unknown renovation category "${categoryId}"`);
      }
      ui.activeCategory = categoryId;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      return this.getPage(restaurantId2, editor);
    }
    selectFurniture(restaurantId2, furnitureId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      const exists = editor.catalog.some(
        (group) => group.items.some((item) => item.id === furnitureId && item.unlocked)
      );
      if (!exists) {
        throw new Error(`Furniture "${furnitureId}" is not available`);
      }
      ui.selectedFurnitureId = furnitureId;
      ui.selectedPlacementId = null;
      ui.pendingRotation = 0;
      return this.getPage(restaurantId2, editor);
    }
    selectPlacement(restaurantId2, placementId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      if (!editor.layout.placements.some((item) => item.id === placementId)) {
        throw new Error(`Placement "${placementId}" does not exist on active floor`);
      }
      ui.selectedPlacementId = placementId;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      return this.getPage(restaurantId2, editor);
    }
    clearSelection(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      ui.selectedPlacementId = null;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      return this.getPage(restaurantId2);
    }
    previewPlacement(restaurantId2, x, y, rotation = null) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.getPageState(restaurantId2);
      const draft = renovationEditorSystem.getDraftLayout(restaurantId2);
      let candidate = null;
      let placements = draft.placements;
      let mode = null;
      if (ui.selectedFurnitureId) {
        mode = "place";
        candidate = {
          id: "preview_new",
          furnitureId: ui.selectedFurnitureId,
          floorId: editor.layout.activeFloorId,
          x,
          y,
          rotation: rotation ?? ui.pendingRotation,
          draftNew: true
        };
        placements = [...placements, candidate];
      } else if (ui.selectedPlacementId) {
        mode = "move";
        const current = placements.find(
          (item) => item.id === ui.selectedPlacementId
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
        placements = placements.map(
          (item) => item.id === current.id ? candidate : item
        );
      } else {
        throw new Error("No furniture or placement selected");
      }
      try {
        renovationEditorSystem.validateDraft(
          restaurantId2,
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
    placeSelected(restaurantId2, x, y, rotation = null) {
      const ui = this.requireUiState(restaurantId2);
      if (!ui.selectedFurnitureId) {
        throw new Error("No furniture selected");
      }
      const editor = renovationEditorSystem.addItem(
        restaurantId2,
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
      return this.getPage(restaurantId2, editor);
    }
    moveSelected(restaurantId2, x, y) {
      const ui = this.requireUiState(restaurantId2);
      if (!ui.selectedPlacementId) {
        throw new Error("No placement selected");
      }
      const editor = renovationEditorSystem.moveItem(
        restaurantId2,
        ui.selectedPlacementId,
        x,
        y
      );
      return this.getPage(restaurantId2, editor);
    }
    rotateSelected(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      if (ui.selectedPlacementId) {
        const editor = renovationEditorSystem.rotateItem(
          restaurantId2,
          ui.selectedPlacementId
        );
        return this.getPage(restaurantId2, editor);
      }
      if (ui.selectedFurnitureId) {
        ui.pendingRotation = ui.pendingRotation === 0 ? 90 : 0;
        return this.getPage(restaurantId2);
      }
      throw new Error("No furniture or placement selected");
    }
    deleteSelected(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      if (!ui.selectedPlacementId) {
        throw new Error("No placement selected");
      }
      const editor = renovationEditorSystem.removeItem(
        restaurantId2,
        ui.selectedPlacementId
      );
      ui.selectedPlacementId = null;
      return this.getPage(restaurantId2, editor);
    }
    previewTemplate(restaurantId2, templateId) {
      this.requireUiState(restaurantId2);
      return renovationEditorSystem.previewTemplate(restaurantId2, templateId);
    }
    applyTemplate(restaurantId2, templateId) {
      const ui = this.requireUiState(restaurantId2);
      const editor = renovationEditorSystem.applyTemplate(
        restaurantId2,
        templateId
      );
      ui.selectedPlacementId = null;
      ui.selectedFurnitureId = null;
      ui.pendingRotation = 0;
      ui.templatesExpanded = false;
      return this.getPage(restaurantId2, editor);
    }
    toggleIssues(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      ui.issuesExpanded = !ui.issuesExpanded;
      return this.getPage(restaurantId2);
    }
    toggleTemplates(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      ui.templatesExpanded = !ui.templatesExpanded;
      return this.getPage(restaurantId2);
    }
    toggleDrawer(restaurantId2) {
      const ui = this.requireUiState(restaurantId2);
      ui.drawerExpanded = !ui.drawerExpanded;
      return this.getPage(restaurantId2);
    }
    save(restaurantId2, { activate = false } = {}) {
      this.requireUiState(restaurantId2);
      const result = activate ? renovationConstructionSystem.startFromEditor(
        restaurantId2
      ) : renovationEditorSystem.save(
        restaurantId2,
        { activate: false }
      );
      this.uiState.delete(
        restaurantId2
      );
      return result;
    }
    discard(restaurantId2) {
      renovationEditorSystem.discard(restaurantId2);
      const existed = this.uiState.delete(restaurantId2);
      return { restaurantId: restaurantId2, discarded: existed };
    }
  };
  var renovationMobilePageSystem = new RenovationMobilePageSystem();

  // src/ui/renovation/RenovationMobileView.js
  function escapeHtml9(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function formatMoney(value) {
    return Number(value ?? 0).toLocaleString("zh-CN");
  }
  function placementStyle(placement, layoutWidth, layoutHeight, offsetX = 0, offsetY = 0) {
    return [
      `left:${(placement.x - offsetX) / layoutWidth * 100}%`,
      `top:${(placement.y - offsetY) / layoutHeight * 100}%`,
      `width:${placement.width / layoutWidth * 100}%`,
      `height:${placement.height / layoutHeight * 100}%`
    ].join(";");
  }
  function gridPointFromClient(rect, layoutWidth, layoutHeight, clientX, clientY, offsetX = 0, offsetY = 0) {
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    const cellWidth = rect.width / layoutWidth;
    const cellHeight = rect.height / layoutHeight;
    return {
      x: offsetX + Math.min(
        layoutWidth - 1,
        Math.max(0, Math.floor((clientX - rect.left) / cellWidth))
      ),
      y: offsetY + Math.min(
        layoutHeight - 1,
        Math.max(0, Math.floor((clientY - rect.top) / cellHeight))
      )
    };
  }
  function normalizedRectStyle(rect, width, height) {
    return [
      `left:${rect.x / width * 100}%`,
      `top:${rect.y / height * 100}%`,
      `width:${rect.width / width * 100}%`,
      `height:${rect.height / height * 100}%`
    ].join(";");
  }
  var RenovationMobileView = class {
    constructor({
      root: root2,
      restaurantId: restaurantId2,
      pageSystem = renovationMobilePageSystem,
      onSaved = null,
      onClose = null
    }) {
      if (!root2) {
        throw new Error("Renovation mobile view requires a root element");
      }
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.pageSystem = pageSystem;
      this.onSaved = onSaved;
      this.onClose = onClose;
      this.page = null;
      this.drag = null;
      this.preview = null;
      this.templatePreview = null;
      this.message = null;
      this.boundClick = (event) => this.handleClick(event);
      this.boundPointerDown = (event) => this.handlePointerDown(event);
      this.boundPointerMove = (event) => this.handlePointerMove(event);
      this.boundPointerUp = (event) => this.handlePointerUp(event);
    }
    mount() {
      this.page = this.pageSystem.open(this.restaurantId);
      this.root.addEventListener("click", this.boundClick);
      this.root.addEventListener("pointerdown", this.boundPointerDown);
      if (typeof window !== "undefined") {
        window.addEventListener("pointermove", this.boundPointerMove);
        window.addEventListener("pointerup", this.boundPointerUp);
        window.addEventListener("pointercancel", this.boundPointerUp);
      }
      this.render();
      return this;
    }
    destroy({ discard = false } = {}) {
      this.root.removeEventListener("click", this.boundClick);
      this.root.removeEventListener("pointerdown", this.boundPointerDown);
      if (typeof window !== "undefined") {
        window.removeEventListener("pointermove", this.boundPointerMove);
        window.removeEventListener("pointerup", this.boundPointerUp);
        window.removeEventListener("pointercancel", this.boundPointerUp);
      }
      if (discard && this.page) {
        try {
          this.pageSystem.discard(this.restaurantId);
        } catch {
        }
      }
      this.drag = null;
      this.preview = null;
    }
    refresh(page = null) {
      this.page = page ?? this.pageSystem.getPage(this.restaurantId);
      this.render();
      return this.page;
    }
    getViewport() {
      return this.page.workspace.viewBounds ?? {
        x: 0,
        y: 0,
        width: this.page.workspace.width,
        height: this.page.workspace.height
      };
    }
    renderPlacement(item, extraClass = "") {
      const selected = item.id === this.page.workspace.selectedPlacementId;
      const viewport = this.getViewport();
      return `
      <button
        type="button"
        class="renovation-item renovation-item-${escapeHtml9(item.type)} ${selected ? "is-selected" : ""} ${extraClass}"
        style="${placementStyle(
        item,
        viewport.width,
        viewport.height,
        viewport.x,
        viewport.y
      )}"
        data-placement-id="${escapeHtml9(item.id)}"
        aria-label="${escapeHtml9(item.name)}"
      >
        <span>${escapeHtml9(item.name)}</span>
      </button>
    `;
    }
    isVisibleInViewport(item) {
      const viewport = this.getViewport();
      const floorId = item.floorId ?? this.page.workspace.activeFloorId;
      if (floorId !== this.page.workspace.activeFloorId) {
        return false;
      }
      return !(item.x + item.width <= viewport.x || item.y + item.height <= viewport.y || item.x >= viewport.x + viewport.width || item.y >= viewport.y + viewport.height);
    }
    renderTemplatePreview() {
      if (!this.templatePreview) {
        return "";
      }
      return this.templatePreview.placements.map((item) => this.pageSystem.getPlacementView(item)).filter((item) => this.isVisibleInViewport(item)).map((item) => this.renderPlacement(item, "is-template-preview")).join("");
    }
    renderStructureMarkers() {
      const floor = this.page.workspace.activeFloor;
      const viewport = this.getViewport();
      const structures = [];
      for (const column of floor?.columns ?? []) {
        const item = {
          x: column.x ?? 0,
          y: column.y ?? 0,
          width: column.width ?? 1,
          height: column.height ?? 1
        };
        if (item.x + item.width <= viewport.x || item.y + item.height <= viewport.y || item.x >= viewport.x + viewport.width || item.y >= viewport.y + viewport.height) {
          continue;
        }
        structures.push(`
        <div
          class="renovation-structure renovation-column"
          style="${placementStyle(
          item,
          viewport.width,
          viewport.height,
          viewport.x,
          viewport.y
        )}"
          title="\u56FA\u5B9A\u67F1\u4F53"
        ></div>
      `);
      }
      for (const entrance of floor?.entrances ?? []) {
        const x = entrance.x ?? 0;
        const y = entrance.y ?? 0;
        if (x < viewport.x || y < viewport.y || x > viewport.x + viewport.width || y > viewport.y + viewport.height) {
          continue;
        }
        structures.push(`
        <div
          class="renovation-entrance"
          style="left:${(x - viewport.x) / viewport.width * 100}%;top:${(y - viewport.y) / viewport.height * 100}%"
          title="\u5165\u53E3"
        >\u95E8</div>
      `);
      }
      return structures.join("");
    }
    renderWorkspaceToolbar() {
      const workspace = this.page.workspace;
      const floorTabs = workspace.floors.length > 1 ? `
        <nav class="renovation-floor-tabs" aria-label="\u697C\u5C42\u9009\u62E9">
          ${workspace.floors.map((floor) => `
            <button
              type="button"
              class="renovation-floor-tab ${floor.id === workspace.activeFloorId ? "is-active" : ""}"
              data-action="floor"
              data-floor-id="${escapeHtml9(floor.id)}"
            >
              <b>${escapeHtml9(floor.label)}</b>
              <span>${escapeHtml9(floor.usableArea ?? floor.area ?? "-")}\u33A1</span>
            </button>
          `).join("")}
        </nav>
      ` : "";
      const zoneTabs = workspace.mode === "zone" ? `
        <nav class="renovation-zone-tabs" aria-label="\u5206\u533A\u9009\u62E9">
          ${workspace.zones.map((zone) => `
            <button
              type="button"
              class="renovation-zone-tab ${zone.id === workspace.activeZoneId ? "is-active" : ""}"
              data-action="zone"
              data-zone-id="${escapeHtml9(zone.id)}"
            >${escapeHtml9(zone.label)}</button>
          `).join("")}
        </nav>
      ` : "";
      return `
      <div class="renovation-workspace-toolbar">
        <div class="renovation-workspace-toolbar-main">
          <div class="renovation-mode-badge">
            <b>${escapeHtml9(workspace.modeLabel)}</b>
            <span>${escapeHtml9(workspace.activeFloor?.label ?? "1F")} \xB7 ${escapeHtml9(workspace.activeFloor?.usableArea ?? workspace.activeFloor?.area ?? "-")}\u33A1</span>
          </div>

          <div class="renovation-zoom-controls">
            <button type="button" data-action="zoom-out" ${workspace.canZoom && workspace.zoom > workspace.zoomMin ? "" : "disabled"}>\uFF0D</button>
            <button type="button" data-action="zoom-reset" ${workspace.canZoom ? "" : "disabled"}>${Math.round(workspace.zoom * 100)}%</button>
            <button type="button" data-action="zoom-in" ${workspace.canZoom && workspace.zoom < workspace.zoomMax ? "" : "disabled"}>\uFF0B</button>
            ${workspace.minimap.enabled ? `<button type="button" data-action="toggle-minimap">\u5C0F\u5730\u56FE</button>` : ""}
          </div>
        </div>
        ${floorTabs}
        ${zoneTabs}
      </div>
    `;
    }
    renderMinimap() {
      const workspace = this.page.workspace;
      const minimap = workspace.minimap;
      if (!minimap.enabled || !minimap.expanded) {
        return "";
      }
      const viewportStyle = [
        `left:${minimap.viewport.x * 100}%`,
        `top:${minimap.viewport.y * 100}%`,
        `width:${minimap.viewport.width * 100}%`,
        `height:${minimap.viewport.height * 100}%`
      ].join(";");
      return `
      <aside class="renovation-minimap">
        <div class="renovation-minimap-header">
          <b>${escapeHtml9(workspace.activeFloor?.label ?? "\u697C\u5C42")}</b>
          <span>${workspace.floorPlacementCount}\u4EF6</span>
        </div>
        <div class="renovation-minimap-canvas">
          ${minimap.placements.map((item) => `
            <span
              class="renovation-minimap-item"
              style="${normalizedRectStyle(item, minimap.width, minimap.height)}"
            ></span>
          `).join("")}
          <span class="renovation-minimap-viewport" style="${viewportStyle}"></span>
        </div>
      </aside>
    `;
    }
    render() {
      const page = this.page;
      if (!page) {
        return;
      }
      const selectionTools = page.selection.canRotate ? `
        <div class="renovation-floating-tools">
          <button type="button" class="renovation-tool-button" data-action="rotate">\u65CB\u8F6C</button>
          ${page.selection.canDelete ? `<button type="button" class="renovation-tool-button danger" data-action="delete">\u5220\u9664</button>` : ""}
          <button type="button" class="renovation-tool-button" data-action="clear-selection">\u53D6\u6D88\u9009\u62E9</button>
        </div>
      ` : "";
      const issuesPanel = page.analysis.issuesExpanded ? `
        <section class="renovation-collapsible-panel" data-panel="issues">
          <div class="renovation-panel-title">\u5E03\u5C40\u8BCA\u65AD</div>
          <div class="renovation-score-grid">
            ${Object.entries(page.analysis.scores).map(
        ([key, value]) => `<span>${escapeHtml9(key)} <b>${escapeHtml9(value)}</b></span>`
      ).join("")}
          </div>
          <div class="renovation-issue-list">
            ${page.analysis.issues.length > 0 ? page.analysis.issues.map((issue) => `<div>${escapeHtml9(issue.label ?? issue.id ?? issue)}</div>`).join("") : "<div>\u5F53\u524D\u6CA1\u6709\u660E\u663E\u5E03\u5C40\u95EE\u9898</div>"}
          </div>
        </section>
      ` : "";
      const templatesPanel = page.templates.expanded ? `
        <section class="renovation-collapsible-panel renovation-template-panel" data-panel="templates">
          <div class="renovation-panel-title">\u5FEB\u901F\u5E03\u5C40</div>
          ${page.templates.items.map((template) => `
              <div class="renovation-template-row">
                <span>${escapeHtml9(template.name)}</span>
                <div>
                  <button type="button" data-action="preview-template" data-template-id="${escapeHtml9(template.id)}">\u9884\u89C8</button>
                  <button type="button" data-action="apply-template" data-template-id="${escapeHtml9(template.id)}">\u5957\u7528</button>
                </div>
              </div>
            `).join("")}
          ${this.templatePreview ? `<div class="renovation-template-summary">\u9884\u89C8\uFF1A${escapeHtml9(this.templatePreview.template.name)} \xB7 \xA5${formatMoney(this.templatePreview.budget.purchaseCost)} \xB7 ${this.templatePreview.placements.length}\u4EF6</div>` : ""}
        </section>
      ` : "";
      const viewport = this.getViewport();
      const zoomPercent = Math.round(page.workspace.zoom * 100);
      const zoomMax = Math.round(560 * page.workspace.zoom);
      this.root.innerHTML = `
      <main class="renovation-page">
        <header class="renovation-topbar">
          <div class="renovation-stat"><span class="renovation-stat-label">\u8D44\u91D1</span><span class="renovation-stat-value">\xA5${formatMoney(page.header.balance)}</span></div>
          <div class="renovation-stat"><span class="renovation-stat-label">\u672C\u6B21\u82B1\u8D39</span><span class="renovation-stat-value">\xA5${formatMoney(page.header.currentCost)}</span></div>
          <div class="renovation-stat"><span class="renovation-stat-label">\u5269\u4F59</span><span class="renovation-stat-value">\xA5${formatMoney(page.header.remaining)}</span></div>
          <button type="button" class="renovation-stat renovation-score-button" data-action="toggle-issues">
            <span class="renovation-stat-label">\u5E03\u5C40\u8BC4\u5206</span>
            <span class="renovation-stat-value">${escapeHtml9(page.header.grade)} \xB7 ${escapeHtml9(page.header.score)}</span>
          </button>
        </header>

        <section class="renovation-workspace">
          ${this.renderWorkspaceToolbar()}
          <div class="renovation-canvas-scroll">
            <div class="renovation-canvas-wrap">
              <div
                class="renovation-canvas"
                data-renovation-canvas
                style="--layout-width:${viewport.width};--layout-height:${viewport.height};--zoom-width:${zoomPercent}%;--zoom-max:${zoomMax}px;"
              >
                ${this.renderStructureMarkers()}
                ${page.workspace.placements.map((item) => this.renderPlacement(item)).join("")}
                ${this.renderTemplatePreview()}
              </div>
            </div>
          </div>
          ${selectionTools}
          ${this.renderMinimap()}
          <div class="renovation-workspace-actions">
            <button type="button" data-action="toggle-templates">\u6A21\u677F</button>
            <button type="button" data-action="toggle-issues">\u8BCA\u65AD</button>
          </div>
          ${this.message ? `<div class="renovation-toast">${escapeHtml9(this.message)}</div>` : ""}
        </section>

        <section class="renovation-bottom-sheet ${page.drawer.expanded ? "is-expanded" : "is-collapsed"}">
          <button type="button" class="renovation-sheet-toggle" data-action="toggle-drawer" aria-label="\u5C55\u5F00\u6216\u6536\u8D77\u5BB6\u5177\u680F">
            <span class="renovation-sheet-handle"></span>
          </button>

          <div class="renovation-drawer-content">
            <nav class="renovation-category-tabs">
              ${page.drawer.categories.map((category) => `
                  <button
                    type="button"
                    class="renovation-category-tab ${category.id === page.drawer.activeCategory ? "is-active" : ""}"
                    data-action="category"
                    data-category-id="${escapeHtml9(category.id)}"
                  >${escapeHtml9(category.name)}</button>
                `).join("")}
            </nav>

            <div class="renovation-furniture-strip">
              ${page.drawer.items.map((item) => `
                  <button
                    type="button"
                    class="renovation-furniture-card ${item.unlocked ? "" : "is-locked"} ${item.affordable ? "" : "is-unaffordable"} ${item.id === page.drawer.selectedFurnitureId ? "is-selected" : ""}"
                    data-action="furniture"
                    data-furniture-id="${escapeHtml9(item.id)}"
                    ${item.unlocked ? "" : "disabled"}
                  >
                    <b>${escapeHtml9(item.name)}</b>
                    <span>${item.width}\xD7${item.height}</span>
                    <span>\xA5${formatMoney(item.cost)}</span>
                  </button>
                `).join("")}
            </div>
          </div>

          <div class="renovation-sheet-actions">
            <button type="button" class="renovation-secondary-button" data-action="save" ${page.actions.canSave ? "" : "disabled"}>\u4FDD\u5B58\u8349\u7A3F</button>
            <button type="button" class="renovation-primary-button" data-action="activate" ${page.actions.canActivate ? "" : "disabled"}>\u786E\u8BA4\u9884\u7B97\u5E76\u65BD\u5DE5</button>
          </div>
        </section>

        ${issuesPanel}
        ${templatesPanel}
      </main>
    `;
    }
    handleClick(event) {
      const target = event.target.closest?.("[data-action]");
      if (!target || !this.root.contains(target)) {
        return;
      }
      const action = target.dataset.action;
      try {
        if (action === "floor") {
          this.templatePreview = null;
          this.refresh(
            this.pageSystem.switchFloor(
              this.restaurantId,
              target.dataset.floorId
            )
          );
        } else if (action === "zone") {
          this.templatePreview = null;
          this.refresh(
            this.pageSystem.selectZone(
              this.restaurantId,
              target.dataset.zoneId
            )
          );
        } else if (action === "zoom-in") {
          this.refresh(this.pageSystem.zoomIn(this.restaurantId));
        } else if (action === "zoom-out") {
          this.refresh(this.pageSystem.zoomOut(this.restaurantId));
        } else if (action === "zoom-reset") {
          this.refresh(this.pageSystem.resetZoom(this.restaurantId));
        } else if (action === "toggle-minimap") {
          this.refresh(this.pageSystem.toggleMinimap(this.restaurantId));
        } else if (action === "category") {
          this.templatePreview = null;
          this.refresh(
            this.pageSystem.selectCategory(
              this.restaurantId,
              target.dataset.categoryId
            )
          );
        } else if (action === "furniture") {
          this.templatePreview = null;
          this.refresh(
            this.pageSystem.selectFurniture(
              this.restaurantId,
              target.dataset.furnitureId
            )
          );
        } else if (action === "rotate") {
          this.refresh(this.pageSystem.rotateSelected(this.restaurantId));
        } else if (action === "delete") {
          this.refresh(this.pageSystem.deleteSelected(this.restaurantId));
        } else if (action === "clear-selection") {
          this.refresh(this.pageSystem.clearSelection(this.restaurantId));
        } else if (action === "toggle-issues") {
          this.refresh(this.pageSystem.toggleIssues(this.restaurantId));
        } else if (action === "toggle-templates") {
          this.refresh(this.pageSystem.toggleTemplates(this.restaurantId));
        } else if (action === "toggle-drawer") {
          this.refresh(this.pageSystem.toggleDrawer(this.restaurantId));
        } else if (action === "preview-template") {
          this.templatePreview = this.pageSystem.previewTemplate(
            this.restaurantId,
            target.dataset.templateId
          );
          this.message = `\u6A21\u677F\u9884\u89C8 \xA5${formatMoney(this.templatePreview.budget.purchaseCost)}`;
          this.render();
        } else if (action === "apply-template") {
          this.templatePreview = null;
          this.refresh(
            this.pageSystem.applyTemplate(
              this.restaurantId,
              target.dataset.templateId
            )
          );
        } else if (action === "save") {
          this.commit(false);
        } else if (action === "activate") {
          this.commit(true);
        }
      } catch (error) {
        this.message = error instanceof Error ? error.message : String(error);
        this.render();
      }
    }
    handlePointerDown(event) {
      const furnitureCard = event.target.closest?.("[data-furniture-id]");
      const placement = event.target.closest?.("[data-placement-id]");
      const canvas = event.target.closest?.("[data-renovation-canvas]");
      if (furnitureCard && !furnitureCard.disabled) {
        try {
          this.page = this.pageSystem.selectFurniture(
            this.restaurantId,
            furnitureCard.dataset.furnitureId
          );
          this.drag = {
            pointerId: event.pointerId,
            mode: "place"
          };
          this.templatePreview = null;
          this.render();
        } catch (error) {
          this.message = error instanceof Error ? error.message : String(error);
          this.render();
        }
        return;
      }
      if (placement && !placement.classList.contains("is-template-preview")) {
        try {
          this.page = this.pageSystem.selectPlacement(
            this.restaurantId,
            placement.dataset.placementId
          );
          this.drag = {
            pointerId: event.pointerId,
            mode: "move"
          };
          this.templatePreview = null;
          this.render();
        } catch (error) {
          this.message = error instanceof Error ? error.message : String(error);
          this.render();
        }
        return;
      }
      if (canvas && this.page.drawer.selectedFurnitureId) {
        this.drag = {
          pointerId: event.pointerId,
          mode: "place"
        };
        this.handlePointerMove(event);
      }
    }
    handlePointerMove(event) {
      if (!this.drag || this.drag.pointerId !== event.pointerId) {
        return;
      }
      const canvas = this.root.querySelector("[data-renovation-canvas]");
      if (!canvas) {
        return;
      }
      const viewport = this.getViewport();
      const point = gridPointFromClient(
        canvas.getBoundingClientRect(),
        viewport.width,
        viewport.height,
        event.clientX,
        event.clientY,
        viewport.x,
        viewport.y
      );
      if (!point) {
        this.preview = null;
        this.renderDropPreview();
        return;
      }
      try {
        this.preview = this.pageSystem.previewPlacement(
          this.restaurantId,
          point.x,
          point.y
        );
        this.renderDropPreview();
      } catch (error) {
        this.preview = null;
        this.message = error instanceof Error ? error.message : String(error);
      }
    }
    handlePointerUp(event) {
      if (!this.drag || this.drag.pointerId !== event.pointerId) {
        return;
      }
      const drag = this.drag;
      const preview = this.preview;
      this.drag = null;
      this.preview = null;
      if (!preview || !preview.valid) {
        this.message = preview?.reason ?? null;
        this.render();
        return;
      }
      try {
        if (drag.mode === "place") {
          this.page = this.pageSystem.placeSelected(
            this.restaurantId,
            preview.placement.x,
            preview.placement.y,
            preview.placement.rotation
          );
        } else {
          this.page = this.pageSystem.moveSelected(
            this.restaurantId,
            preview.placement.x,
            preview.placement.y
          );
        }
        this.message = null;
        this.render();
      } catch (error) {
        this.message = error instanceof Error ? error.message : String(error);
        this.render();
      }
    }
    renderDropPreview() {
      const canvas = this.root.querySelector("[data-renovation-canvas]");
      if (!canvas) {
        return;
      }
      canvas.querySelector(".renovation-drop-preview")?.remove();
      if (!this.preview) {
        return;
      }
      const viewport = this.getViewport();
      const node = document.createElement("div");
      node.className = `renovation-drop-preview ${this.preview.valid ? "is-valid" : "is-invalid"}`;
      node.style.cssText = placementStyle(
        this.preview.placement,
        viewport.width,
        viewport.height,
        viewport.x,
        viewport.y
      );
      node.textContent = this.preview.placement.name;
      canvas.appendChild(node);
    }
    commit(activate) {
      const result = this.pageSystem.save(
        this.restaurantId,
        { activate }
      );
      const constructionStarted = Boolean(
        result?.constructionStarted
      );
      this.destroy();
      this.root.innerHTML = `
      <div class="renovation-finished">
        ${constructionStarted ? "\u88C5\u4FEE\u65B9\u6848\u5DF2\u786E\u8BA4\uFF0C\u65BD\u5DE5\u5DF2\u7ECF\u5F00\u59CB" : "\u88C5\u4FEE\u8349\u7A3F\u5DF2\u4FDD\u5B58"}
      </div>
    `;
      this.onSaved?.(
        result
      );
      this.onClose?.({
        saved: true,
        activate,
        constructionStarted,
        nextPage: result?.nextPage ?? null
      });
    }
  };

  // src/ui/renovation/RenovationFloorplanVisualModel.js
  var UTILITY_META = Object.freeze({
    water: { label: "\u6C34", color: "#2f80ed" },
    drain: { label: "\u6392", color: "#5b6b7a" },
    gas: { label: "\u6C14", color: "#e67e22" },
    power: { label: "\u7535", color: "#d4a72c" },
    exhaust: { label: "\u70DF", color: "#8e6bb8" },
    grease_trap: { label: "\u9694", color: "#7b6f5b" },
    fire: { label: "\u6D88", color: "#c94747" }
  });
  var STRUCTURE_META = Object.freeze({
    column: { label: "\u67F1", color: "#55616d" },
    load_bearing_wall: { label: "\u627F\u91CD\u5899", color: "#39434d" },
    wall: { label: "\u5899", color: "#5f6973" },
    stair: { label: "\u697C\u68AF", color: "#7d6b55" },
    elevator: { label: "\u7535\u68AF", color: "#566c82" },
    toilet: { label: "\u536B\u751F\u95F4", color: "#6b7f8c" },
    shaft: { label: "\u7BA1\u4E95", color: "#68757f" },
    structure: { label: "\u56FA\u5B9A", color: "#5f6973" }
  });
  function isFiniteNumber(value) {
    return Number.isFinite(value);
  }
  function normalizeBounds(floor, bounds = null) {
    const width = Math.max(1, Number(floor?.width ?? 1));
    const height = Math.max(1, Number(floor?.height ?? 1));
    if (!bounds) {
      return { x: 0, y: 0, width, height };
    }
    return {
      x: Number(bounds.x ?? 0),
      y: Number(bounds.y ?? 0),
      width: Math.max(1, Number(bounds.width ?? width)),
      height: Math.max(1, Number(bounds.height ?? height))
    };
  }
  function normalizeRect(item, fallbackWidth = 1, fallbackHeight = 1) {
    if (!item || !isFiniteNumber(item.x) || !isFiniteNumber(item.y)) {
      return null;
    }
    return {
      ...structuredClone(item),
      x: item.x,
      y: item.y,
      width: isFiniteNumber(item.width) && item.width > 0 ? item.width : fallbackWidth,
      height: isFiniteNumber(item.height) && item.height > 0 ? item.height : fallbackHeight
    };
  }
  function rectIntersectsBounds(rect, bounds) {
    return !(rect.x + rect.width <= bounds.x || rect.y + rect.height <= bounds.y || rect.x >= bounds.x + bounds.width || rect.y >= bounds.y + bounds.height);
  }
  function pointInBounds(point, bounds) {
    return point.x >= bounds.x && point.y >= bounds.y && point.x <= bounds.x + bounds.width && point.y <= bounds.y + bounds.height;
  }
  function getPolygon(floor) {
    if (Array.isArray(floor?.polygon) && floor.polygon.length >= 3) {
      return structuredClone(floor.polygon);
    }
    const width = Math.max(1, Number(floor?.width ?? 1));
    const height = Math.max(1, Number(floor?.height ?? 1));
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
  }
  function getUtilityMeta(type) {
    return UTILITY_META[type] ?? {
      label: "\u70B9",
      color: "#65727e"
    };
  }
  function getStructureMeta(type) {
    return STRUCTURE_META[type] ?? STRUCTURE_META.structure;
  }
  function buildFloorplanVisualModel(floor, viewBounds = null) {
    const bounds = normalizeBounds(floor, viewBounds);
    const polygon = getPolygon(floor);
    const columns = (floor?.columns ?? []).map((item) => normalizeRect({ ...item, type: item.type ?? "column" })).filter(Boolean).filter((item) => rectIntersectsBounds(item, bounds)).map((item) => ({
      ...item,
      meta: getStructureMeta(item.type)
    }));
    const fixedStructures = (floor?.fixedStructures ?? []).map((item) => normalizeRect(item)).filter(Boolean).filter((item) => rectIntersectsBounds(item, bounds)).map((item) => ({
      ...item,
      meta: getStructureMeta(item.type ?? "structure")
    }));
    const windows = (floor?.windows ?? []).map((item) => normalizeRect(item, 0.9, 0.18)).filter(Boolean).filter((item) => rectIntersectsBounds(item, bounds));
    const entrances = (floor?.entrances ?? []).filter((item) => item && isFiniteNumber(item.x) && isFiniteNumber(item.y)).filter((item) => pointInBounds(item, bounds)).map((item) => structuredClone(item));
    const utilityPoints = (floor?.utilityPoints ?? []).filter((item) => item && isFiniteNumber(item.x) && isFiniteNumber(item.y)).filter((item) => pointInBounds(item, bounds)).map((item) => ({
      ...structuredClone(item),
      meta: getUtilityMeta(item.type)
    }));
    const legend = [];
    if (entrances.length > 0) {
      legend.push({ id: "entrance", label: "\u5165\u53E3", color: "#c8752b" });
    }
    if (windows.length > 0) {
      legend.push({ id: "window", label: "\u7A97", color: "#4b9fc6" });
    }
    if (columns.length > 0) {
      legend.push({ id: "column", label: "\u67F1", color: STRUCTURE_META.column.color });
    }
    for (const item of fixedStructures) {
      const id = `structure:${item.type ?? "structure"}`;
      if (!legend.some((entry) => entry.id === id)) {
        legend.push({
          id,
          label: item.meta.label,
          color: item.meta.color
        });
      }
    }
    for (const item of utilityPoints) {
      const id = `utility:${item.type ?? "unknown"}`;
      if (!legend.some((entry) => entry.id === id)) {
        legend.push({
          id,
          label: item.meta.label,
          color: item.meta.color
        });
      }
    }
    return {
      floorId: floor?.id ?? null,
      floorLabel: floor?.label ?? null,
      bounds,
      viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`,
      polygon,
      polygonPoints: polygon.map((point) => `${point.x},${point.y}`).join(" "),
      columns,
      fixedStructures,
      windows,
      entrances,
      utilityPoints,
      legend
    };
  }

  // src/ui/renovation/RenovationFloorplanMobileView.js
  function escapeHtml10(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function clamp19(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function renderRect(item, className, { label = null, fill = "#66717c" } = {}) {
    const safeFill = escapeHtml10(fill);
    const text = label ? `<text x="${item.x + item.width / 2}" y="${item.y + item.height / 2}" text-anchor="middle" dominant-baseline="central" font-size="0.42" font-weight="700" fill="#24313a">${escapeHtml10(label)}</text>` : "";
    return `
    <g class="${escapeHtml10(className)}">
      <rect
        x="${item.x}"
        y="${item.y}"
        width="${item.width}"
        height="${item.height}"
        rx="0.08"
        fill="${safeFill}"
        fill-opacity="0.34"
        stroke="${safeFill}"
        stroke-width="0.12"
        vector-effect="non-scaling-stroke"
      ></rect>
      ${text}
    </g>
  `;
  }
  function renderFloorplanLayer(workspace, viewport = null) {
    const floor = workspace?.activeFloor;
    if (!floor) {
      return "";
    }
    const model = buildFloorplanVisualModel(
      floor,
      viewport ?? workspace.viewBounds ?? null
    );
    const markerScale = clamp19(
      Math.min(model.bounds.width, model.bounds.height) * 0.025,
      0.24,
      0.75
    );
    const entranceRadius = markerScale * 0.72;
    const utilityRadius = markerScale * 0.62;
    const windows = model.windows.map((item) => renderRect(
      item,
      "renovation-floor-window",
      { fill: "#4b9fc6" }
    )).join("");
    const columns = model.columns.map((item) => renderRect(
      item,
      "renovation-floor-column",
      {
        label: item.meta.label,
        fill: item.meta.color
      }
    )).join("");
    const fixedStructures = model.fixedStructures.map((item) => renderRect(
      item,
      `renovation-floor-fixed renovation-floor-fixed-${item.type ?? "structure"}`,
      {
        label: item.meta.label,
        fill: item.meta.color
      }
    )).join("");
    const entrances = model.entrances.map((item) => `
      <g class="renovation-floor-entrance">
        <circle
          cx="${item.x}"
          cy="${item.y}"
          r="${entranceRadius}"
          fill="#f0a34b"
          stroke="#a95d16"
          stroke-width="0.12"
          vector-effect="non-scaling-stroke"
        ></circle>
        <text
          x="${item.x}"
          y="${item.y}"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="${markerScale * 0.78}"
          font-weight="800"
          fill="#4b2b0e"
        >\u95E8</text>
      </g>
    `).join("");
    const utilityPoints = model.utilityPoints.map((item) => `
      <g class="renovation-floor-utility renovation-floor-utility-${escapeHtml10(item.type ?? "unknown")}">
        <circle
          cx="${item.x}"
          cy="${item.y}"
          r="${utilityRadius}"
          fill="${escapeHtml10(item.meta.color)}"
          stroke="#ffffff"
          stroke-width="0.12"
          vector-effect="non-scaling-stroke"
        ></circle>
        <text
          x="${item.x}"
          y="${item.y}"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="${markerScale * 0.72}"
          font-weight="800"
          fill="#ffffff"
        >${escapeHtml10(item.meta.label)}</text>
      </g>
    `).join("");
    const legend = model.legend.length > 0 ? `
      <div
        class="renovation-floor-legend"
        style="position:absolute;left:8px;bottom:8px;z-index:2;display:flex;flex-wrap:wrap;gap:4px;max-width:72%;padding:5px 7px;border-radius:9px;background:rgba(255,255,255,.88);box-shadow:0 3px 10px rgba(0,0,0,.08);pointer-events:none;font-size:10px;color:#34414b"
      >
        ${model.legend.map((item) => `
          <span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">
            <i style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${escapeHtml10(item.color)}"></i>
            ${escapeHtml10(item.label)}
          </span>
        `).join("")}
      </div>
    ` : "";
    return `
    <svg
      class="renovation-floorplan-layer"
      viewBox="${escapeHtml10(model.viewBox)}"
      preserveAspectRatio="none"
      aria-hidden="true"
      style="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;border-radius:inherit"
    >
      <rect
        x="${model.bounds.x}"
        y="${model.bounds.y}"
        width="${model.bounds.width}"
        height="${model.bounds.height}"
        fill="#dfe3e5"
        fill-opacity="0.48"
      ></rect>
      <polygon
        points="${escapeHtml10(model.polygonPoints)}"
        fill="#fffdf8"
        fill-opacity="0.86"
        stroke="#34424c"
        stroke-width="0.16"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      ></polygon>
      ${windows}
      ${fixedStructures}
      ${columns}
      ${entrances}
      ${utilityPoints}
    </svg>
    ${legend}
  `;
  }
  var RenovationFloorplanMobileView = class extends RenovationMobileView {
    renderStructureMarkers() {
      return renderFloorplanLayer(
        this.page?.workspace,
        this.getViewport()
      );
    }
  };

  // src/ui/renovation/RenovationConstructionPageSystem.js
  if (!pageRegistry.has(
    "renovation_construction"
  )) {
    pageRegistry.register({
      id: "renovation_construction",
      title: "\u88C5\u4FEE\u65BD\u5DE5",
      parent: "restaurant",
      order: 215,
      layout: "management",
      metadata: {
        renovation: true
      }
    });
  }
  function safeBalance9(restaurantId2) {
    try {
      return financeSystem.getBalance(
        restaurantId2
      );
    } catch {
      return 0;
    }
  }
  var RenovationConstructionPageSystem = class {
    getTimeline(progress, construction) {
      const current = progress.progress;
      const steps = [
        {
          id: "confirmed",
          label: "\u65B9\u6848\u786E\u8BA4",
          threshold: 0
        },
        {
          id: "base",
          label: "\u57FA\u7840\u65BD\u5DE5",
          threshold: 1
        },
        {
          id: "utilities",
          label: "\u6C34\u7535\u53A8\u623F",
          threshold: 20
        },
        {
          id: "installation",
          label: "\u8BBE\u5907\u5B89\u88C5",
          threshold: 45
        },
        {
          id: "finishing",
          label: "\u6536\u5C3E\u6E05\u6D01",
          threshold: 75
        },
        {
          id: "inspection",
          label: "\u5B8C\u5DE5\u9A8C\u6536",
          threshold: 100
        }
      ];
      return steps.map(
        (step) => {
          let state = "pending";
          if (step.id === "confirmed") {
            state = "complete";
          } else if (current >= step.threshold) {
            state = step.id === "inspection" && construction?.status !== "completed" ? "current" : "complete";
          } else if (step.id === progress.phase) {
            state = "current";
          }
          return {
            ...step,
            state
          };
        }
      );
    }
    getPage(restaurantId2) {
      const restaurant = restaurantSystem.get(
        restaurantId2
      );
      const status = renovationConstructionSystem.getStatus(
        restaurantId2
      );
      const summary = renovationSystem.getSummary(
        restaurantId2
      );
      const construction = status.construction;
      const progress = status.progress;
      const time = gameState.getSection(
        "time"
      );
      const modifiers = construction?.expectedModifiers ?? summary.modifiers;
      return {
        pageId: "renovation_construction",
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          level: restaurant.level,
          reputation: restaurant.reputation
        },
        topBar: {
          balance: safeBalance9(
            restaurantId2
          ),
          day: time.day,
          hour: time.hour,
          minute: time.minute
        },
        construction,
        progress,
        timeline: construction ? this.getTimeline(
          progress,
          construction
        ) : [],
        project: construction ? {
          area: construction.area,
          placements: construction.placements,
          projectCost: construction.projectCost,
          startDay: construction.startDay,
          endDay: construction.endDay,
          durationDays: construction.durationDays,
          seats: modifiers?.seats ?? 0,
          kitchenStations: modifiers?.kitchenStations ?? 0,
          score: construction.analysis?.score ?? null,
          grade: construction.analysis?.grade ?? null
        } : null,
        actions: {
          canInspect: construction?.status === "ready_for_inspection",
          completed: construction?.status === "completed",
          hasConstruction: Boolean(
            construction
          )
        },
        imageSlots: [
          {
            id: "renovation-construction-site",
            type: "construction-site"
          },
          {
            id: "renovation-construction-preview",
            type: "layout-preview"
          }
        ]
      };
    }
    inspect(restaurantId2) {
      const result = renovationConstructionSystem.inspect(
        restaurantId2
      );
      return {
        ...result,
        page: this.getPage(
          restaurantId2
        ),
        nextPage: "opening-setup"
      };
    }
  };
  var renovationConstructionPageSystem = new RenovationConstructionPageSystem();

  // src/ui/renovation/RenovationConstructionView.js
  function escapeHtml11(value) {
    return String(
      value ?? ""
    ).replaceAll(
      "&",
      "&amp;"
    ).replaceAll(
      "<",
      "&lt;"
    ).replaceAll(
      ">",
      "&gt;"
    ).replaceAll(
      '"',
      "&quot;"
    ).replaceAll(
      "'",
      "&#039;"
    );
  }
  function money8(value) {
    return "\xA5" + Math.round(
      Number(value) || 0
    ).toLocaleString(
      "zh-CN"
    );
  }
  function renderSlot2(id, label) {
    return `
    <div
      class="construction-image-slot"
      data-image-slot="${escapeHtml11(
      id
    )}"
    >
      <span>
        \u25A6
      </span>

      <strong>
        ${escapeHtml11(
      label
    )}
      </strong>

      <small>
        \u56FE\u7247\u69FD\u4F4D
      </small>
    </div>
  `;
  }
  var RenovationConstructionView = class {
    constructor({
      root: root2 = null,
      restaurantId: restaurantId2 = null,
      pageSystem = renovationConstructionPageSystem,
      onNavigate = null
    } = {}) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.pageSystem = pageSystem;
      this.onNavigate = onNavigate;
      this.page = null;
      this.message = "";
    }
    mount(root2 = this.root, {
      restaurantId: restaurantId2 = this.restaurantId
    } = {}) {
      this.root = root2;
      this.restaurantId = restaurantId2;
      this.refresh();
      return this;
    }
    refresh() {
      this.page = this.pageSystem.getPage(
        this.restaurantId
      );
      this.render();
      return this.page;
    }
    renderMarkup(page) {
      const construction = page.construction;
      const progress = page.progress;
      return `
      <main class="construction-page">

        <header class="construction-hud">

          <div>
            <strong>
              ${escapeHtml11(
        page.restaurant.name
      )}
            </strong>

            <span>
              \u88C5\u4FEE\u5DE5\u7A0B\u4E2D\u5FC3
            </span>
          </div>

          <section>
            <span>
              \u5F53\u524D\u65F6\u95F4
            </span>

            <strong>
              \u7B2C${page.topBar.day}\u5929
            </strong>
          </section>

          <section>
            <span>
              \u5F53\u524D\u8D44\u91D1
            </span>

            <strong>
              ${money8(
        page.topBar.balance
      )}
            </strong>
          </section>

          <section>
            <span>
              \u95E8\u5E97\u7B49\u7EA7
            </span>

            <strong>
              Lv.${page.restaurant.level}
            </strong>
          </section>

        </header>


        <section class="construction-title">

          <button
            type="button"
            data-page-target="restaurant"
          >
            \u2039 \u95E8\u5E97
          </button>

          <div>
            <strong>
              \u88C5\u4FEE\u65BD\u5DE5
            </strong>

            <span>
              \u65BD\u5DE5\u671F\u95F4\u65B0\u5E03\u5C40\u4E0D\u4F1A\u63D0\u524D\u4EA7\u751F\u7ECF\u8425\u80FD\u529B
            </span>
          </div>

          ${construction ? `
                <b>
                  ${construction.status === "building" ? "\u65BD\u5DE5\u4E2D" : construction.status === "ready_for_inspection" ? "\u5F85\u9A8C\u6536" : "\u5DF2\u5B8C\u5DE5"}
                </b>
              ` : ""}

        </section>


        ${this.message ? `
              <div class="construction-message">
                ${escapeHtml11(
        this.message
      )}
              </div>
            ` : ""}


        ${construction ? `
              <section class="construction-hero">

                ${renderSlot2(
        "renovation-construction-site",
        "\u65BD\u5DE5\u73B0\u573A"
      )}

                <aside>

                  <span>
                    \u5F53\u524D\u8FDB\u5EA6
                  </span>

                  <strong>
                    ${progress.progress}%
                  </strong>

                  <div class="construction-progress">
                    <i
                      style="
                        width:${progress.progress}%;
                      "
                    ></i>
                  </div>

                  <b>
                    ${escapeHtml11(
        progress.phaseLabel
      )}
                  </b>

                  <small>
                    ${progress.remainingDays > 0 ? `\u9884\u8BA1\u8FD8\u9700${progress.remainingDays}\u5929` : construction.status === "ready_for_inspection" ? "\u5DE5\u7A0B\u5DF2\u5B8C\u6210\uFF0C\u7B49\u5F85\u9A8C\u6536" : "\u65BD\u5DE5\u5DF2\u5B8C\u6210"}
                  </small>

                </aside>

              </section>


              <section class="construction-timeline">

                ${page.timeline.map(
        (step, index) => `
                        <article
                          class="
                            construction-step
                            construction-step--${step.state}
                          "
                        >

                          <span>
                            ${step.state === "complete" ? "\u2713" : index + 1}
                          </span>

                          <strong>
                            ${escapeHtml11(
          step.label
        )}
                          </strong>

                          <small>
                            ${step.state === "complete" ? "\u5B8C\u6210" : step.state === "current" ? "\u8FDB\u884C\u4E2D" : "\u5F85\u5F00\u59CB"}
                          </small>

                        </article>
                      `
      ).join("")}

              </section>


              <section class="construction-main-grid">

                <section class="construction-panel">

                  <header>
                    <strong>
                      \u5DE5\u7A0B\u4FE1\u606F
                    </strong>
                  </header>

                  <div class="construction-project-grid">

                    <article>
                      <span>
                        \u88C5\u4FEE\u9762\u79EF
                      </span>

                      <strong>
                        ${page.project.area}\u33A1
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u5BB6\u5177\u8BBE\u65BD
                      </span>

                      <strong>
                        ${page.project.placements}\u4EF6
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u65BD\u5DE5\u5468\u671F
                      </span>

                      <strong>
                        ${page.project.durationDays}\u5929
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u5F00\u59CB\u65E5\u671F
                      </span>

                      <strong>
                        \u7B2C${page.project.startDay}\u5929
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u9884\u8BA1\u5B8C\u5DE5
                      </span>

                      <strong>
                        \u7B2C${page.project.endDay}\u5929
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u672C\u6B21\u65B0\u589E\u6295\u5165
                      </span>

                      <strong>
                        ${money8(
        page.project.projectCost
      )}
                      </strong>
                    </article>

                  </div>

                </section>


                <section class="construction-panel">

                  <header>
                    <strong>
                      \u5B8C\u5DE5\u540E\u7ECF\u8425\u80FD\u529B
                    </strong>
                  </header>

                  <div class="construction-capacity">

                    <article>
                      <span>
                        \u9910\u4F4D
                      </span>

                      <strong>
                        ${page.project.seats}\u4E2A
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u53A8\u623F\u5DE5\u4F4D
                      </span>

                      <strong>
                        ${page.project.kitchenStations}\u4E2A
                      </strong>
                    </article>

                    <article>
                      <span>
                        \u5E03\u5C40\u8BC4\u5206
                      </span>

                      <strong>
                        ${page.project.grade ?? "-"}
                        \xB7
                        ${page.project.score ?? "-"}
                      </strong>
                    </article>

                  </div>

                </section>

              </section>


              <section class="construction-preview">

                <header>
                  <strong>
                    \u65BD\u5DE5\u65B9\u6848\u9884\u89C8
                  </strong>

                  <span>
                    \u540E\u7EED\u53EF\u7ED1\u5B9A\u65BD\u5DE5\u6548\u679C\u56FE
                  </span>
                </header>

                ${renderSlot2(
        "renovation-construction-preview",
        "\u88C5\u4FEE\u65B9\u6848\u9884\u89C8"
      )}

              </section>


              <section class="construction-actions">

                ${page.actions.canInspect ? `
                      <button
                        type="button"
                        class="construction-inspect"
                        data-construction-action="inspect"
                      >
                        \u2713 \u5B8C\u5DE5\u9A8C\u6536\u5E76\u6B63\u5F0F\u542F\u7528
                      </button>
                    ` : page.actions.completed ? `
                        <button
                          type="button"
                          class="construction-next"
                          data-page-target="opening-setup"
                        >
                          \u88C5\u4FEE\u5DF2\u5B8C\u6210 \xB7 \u7EE7\u7EED\u5F00\u5E97\u51C6\u5907
                        </button>
                      ` : `
                        <button
                          type="button"
                          class="construction-wait"
                          disabled
                        >
                          \u65BD\u5DE5\u4E2D \xB7 \u968F\u6E38\u620F\u65F6\u95F4\u81EA\u52A8\u63A8\u8FDB
                        </button>
                      `}

              </section>
            ` : `
              <section class="construction-empty">

                <strong>
                  \u5F53\u524D\u6CA1\u6709\u88C5\u4FEE\u65BD\u5DE5\u4EFB\u52A1
                </strong>

                <span>
                  \u5148\u5B8C\u6210\u88C5\u4FEE\u5E03\u5C40\u548C\u9884\u7B97\u786E\u8BA4\u3002
                </span>

                <button
                  type="button"
                  data-page-target="renovation"
                >
                  \u8FD4\u56DE\u88C5\u4FEE\u5E03\u5C40
                </button>

              </section>
            `}

      </main>
    `;
    }
    render() {
      if (!this.root) {
        return;
      }
      this.root.innerHTML = this.renderMarkup(
        this.page
      );
      this.bind();
    }
    bind() {
      this.root?.querySelectorAll(
        "[data-page-target]"
      ).forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset.pageTarget,
                this.restaurantId
              );
            }
          );
        }
      );
      this.root?.querySelector(
        '[data-construction-action="inspect"]'
      )?.addEventListener(
        "click",
        () => {
          try {
            const result = this.pageSystem.inspect(
              this.restaurantId
            );
            this.message = "\u88C5\u4FEE\u9A8C\u6536\u5B8C\u6210\uFF0C\u65B0\u5E03\u5C40\u5DF2\u7ECF\u6B63\u5F0F\u542F\u7528";
            this.refresh();
            return result;
          } catch (error) {
            this.message = error.message;
            this.render();
          }
        }
      );
    }
  };
  var renovationConstructionView = new RenovationConstructionView();

  // src/ui/runtime/AndroidPlaytestEntry.js
  var root = document.getElementById(
    "app"
  );
  var restaurantId = null;
  var currentView = null;
  function seedDistricts() {
    if (districtSystem.getAll().length > 0) {
      return;
    }
    districtSystem.load(
      [
        {
          id: "east_gate",
          name: "\u4E1C\u57CE\u5546\u5708",
          trafficIndex: 82,
          rentMultiplier: 1.15,
          spendingPower: 76,
          competition: 63,
          customerMix: {
            office: 45,
            family: 30,
            student: 15,
            tourist: 10
          },
          mapPosition: {
            x: 30,
            y: 34
          }
        },
        {
          id: "university",
          name: "\u5B66\u5E9C\u5546\u5708",
          trafficIndex: 78,
          rentMultiplier: 0.88,
          spendingPower: 58,
          competition: 52,
          customerMix: {
            student: 62,
            office: 18,
            family: 12,
            tourist: 8
          },
          mapPosition: {
            x: 68,
            y: 28
          }
        },
        {
          id: "residential",
          name: "\u65B0\u57CE\u793E\u533A",
          trafficIndex: 64,
          rentMultiplier: 0.78,
          spendingPower: 66,
          competition: 38,
          customerMix: {
            family: 61,
            office: 19,
            student: 12,
            tourist: 8
          },
          mapPosition: {
            x: 38,
            y: 72
          }
        },
        {
          id: "commercial",
          name: "\u4E2D\u592E\u5546\u4E1A\u8857",
          trafficIndex: 92,
          rentMultiplier: 1.42,
          spendingPower: 88,
          competition: 82,
          customerMix: {
            office: 35,
            tourist: 30,
            family: 20,
            student: 15
          },
          mapPosition: {
            x: 74,
            y: 68
          }
        }
      ],
      {
        overwrite: true
      }
    );
  }
  function seedProperties() {
    if (propertySystem.list().length > 0) {
      return;
    }
    const properties = [
      [
        "east_gate",
        "\u4E1C\u57CE\u4E34\u8857\u5C0F\u94FA",
        86,
        78,
        6800
      ],
      [
        "east_gate",
        "\u4E1C\u57CE\u5341\u5B57\u8DEF\u53E3\u94FA",
        142,
        128,
        10500
      ],
      [
        "university",
        "\u5B66\u5E9C\u8DEF\u9910\u996E\u94FA",
        96,
        90,
        5200
      ],
      [
        "university",
        "\u5927\u5B66\u57CE\u4E8C\u5C42\u5546\u94FA",
        180,
        162,
        7600
      ],
      [
        "residential",
        "\u65B0\u57CE\u793E\u533A\u5165\u53E3\u94FA",
        118,
        108,
        4800
      ],
      [
        "residential",
        "\u793E\u533A\u4E2D\u5FC3\u9910\u996E\u94FA",
        165,
        150,
        6500
      ],
      [
        "commercial",
        "\u4E2D\u592E\u5546\u4E1A\u8857\u65FA\u94FA",
        128,
        116,
        13800
      ],
      [
        "commercial",
        "\u5546\u4E1A\u8857\u65D7\u8230\u5E97",
        260,
        235,
        22800
      ]
    ];
    for (const [
      districtId,
      name,
      area,
      usableArea,
      rent
    ] of properties) {
      propertySystem.create({
        districtId,
        name,
        area,
        usableArea,
        baseMonthlyRent: rent,
        seats: Math.max(
          10,
          Math.floor(
            usableArea / 4
          )
        ),
        depositMonths: 2,
        frontageMeters: Math.max(
          4,
          Math.round(
            area / 20
          )
        ),
        ceilingHeight: 3.6,
        parkingSpaces: districtId === "residential" ? 8 : 3,
        foodServiceAllowed: true,
        exhaustAllowed: true,
        floors: [
          {
            id: "floor_1",
            label: "1F",
            area,
            usableArea,
            width: 16,
            height: 10,
            entrances: [
              {
                x: 1,
                y: 9
              }
            ],
            windows: [
              {
                x: 4,
                y: 0
              },
              {
                x: 9,
                y: 0
              }
            ],
            columns: [
              {
                x: 7,
                y: 5,
                width: 1,
                height: 1
              }
            ],
            utilityPoints: [
              {
                type: "water",
                x: 14,
                y: 8
              },
              {
                type: "power",
                x: 13,
                y: 8
              },
              {
                type: "exhaust",
                x: 15,
                y: 4
              }
            ]
          }
        ]
      });
    }
  }
  function seedIngredients() {
    if (ingredientCatalogSystem.count() > 0) {
      return;
    }
    ingredientCatalogSystem.load(
      [
        {
          id: "pork",
          name: "\u732A\u8089",
          category: "meat",
          unit: "g",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 1,
          shelfLifeDays: 4,
          edibleRate: 0.9,
          baseWasteRate: 0.08
        },
        {
          id: "chicken",
          name: "\u9E21\u8089",
          category: "poultry",
          unit: "g",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 1,
          shelfLifeDays: 4,
          edibleRate: 0.88,
          baseWasteRate: 0.08
        },
        {
          id: "egg",
          name: "\u9E21\u86CB",
          category: "egg",
          unit: "piece",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 2,
          shelfLifeDays: 12,
          edibleRate: 0.95,
          baseWasteRate: 0.02
        },
        {
          id: "tomato",
          name: "\u756A\u8304",
          category: "vegetable",
          unit: "g",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 1,
          shelfLifeDays: 6,
          edibleRate: 0.92,
          baseWasteRate: 0.06
        },
        {
          id: "pepper",
          name: "\u9752\u6912",
          category: "vegetable",
          unit: "g",
          baseQuality: 3,
          storageType: "chilled",
          basePurchasePrice: 1,
          shelfLifeDays: 6,
          edibleRate: 0.9,
          baseWasteRate: 0.07
        },
        {
          id: "rice",
          name: "\u5927\u7C73",
          category: "grain",
          unit: "g",
          baseQuality: 3,
          storageType: "dry",
          basePurchasePrice: 1,
          shelfLifeDays: 180,
          edibleRate: 1,
          baseWasteRate: 0.01
        },
        {
          id: "soy_sauce",
          name: "\u9171\u6CB9",
          category: "seasoning",
          unit: "ml",
          baseQuality: 3,
          storageType: "room",
          basePurchasePrice: 1,
          shelfLifeDays: 180,
          edibleRate: 1,
          baseWasteRate: 0
        },
        {
          id: "oil",
          name: "\u98DF\u7528\u6CB9",
          category: "oil",
          unit: "ml",
          baseQuality: 3,
          storageType: "room",
          basePurchasePrice: 1,
          shelfLifeDays: 180,
          edibleRate: 1,
          baseWasteRate: 0
        }
      ],
      {
        overwrite: true
      }
    );
  }
  function seedSupplier() {
    if (supplierSystem.list().length > 0) {
      return;
    }
    const supplier = supplierSystem.create({
      name: "\u65B0\u57CE\u519C\u526F\u4EA7\u54C1\u914D\u9001",
      relationship: 55,
      reliability: 90
    });
    for (const ingredient of ingredientCatalogSystem.getAll()) {
      supplierSystem.addOffer(
        supplier.id,
        ingredient.id,
        {
          priceMultiplier: 1,
          priceVolatility: 0.08,
          qualityMin: 2,
          qualityMax: 4,
          deliveryMinutes: 120,
          capacityPerDay: 5e3,
          minimumOrder: ingredient.unit === "piece" ? 5 : 50
        }
      );
    }
  }
  function ensureRestaurant() {
    let restaurant = restaurantSystem.list()[0] ?? null;
    if (!restaurant) {
      restaurant = restaurantSystem.create({
        name: "\u65B0\u57CE\u5C0F\u9986"
      });
    }
    if (!financeSystem.findAccount(
      restaurant.id
    )) {
      financeSystem.createAccount(
        restaurant.id,
        12e4
      );
    }
    if (employeeSystem.listByRestaurant(
      restaurant.id
    ).length === 0) {
      employeeSystem.hire({
        restaurantId: restaurant.id,
        name: "\u5468\u5E08\u5085",
        roleId: "chef"
      });
      employeeSystem.hire({
        restaurantId: restaurant.id,
        name: "\u6797\u5C0F\u96E8",
        roleId: "server"
      });
    }
    return restaurant.id;
  }
  function firstLaunch() {
    let loaded = false;
    try {
      if (saveSystem.has(
        "auto"
      )) {
        saveSystem.load(
          "auto"
        );
        loaded = true;
      }
    } catch (error) {
      console.warn(
        "\u5B58\u6863\u8F7D\u5165\u5931\u8D25",
        error
      );
    }
    seedDistricts();
    seedProperties();
    seedIngredients();
    seedSupplier();
    restaurantId = ensureRestaurant();
    if (!loaded) {
      try {
        saveSystem.save(
          "auto"
        );
      } catch {
      }
    }
  }
  function saveNow() {
    try {
      saveSystem.save(
        "auto"
      );
    } catch (error) {
      console.warn(
        "\u81EA\u52A8\u5B58\u6863\u5931\u8D25",
        error
      );
    }
  }
  function destroyCurrent() {
    if (currentView && typeof currentView.destroy === "function") {
      try {
        currentView.destroy();
      } catch {
      }
    }
    currentView = null;
    root.innerHTML = "";
  }
  function errorPage(error) {
    root.innerHTML = `
    <main
      style="
        min-height:100vh;
        padding:24px;
        color:#174f7e;
        background:#eaf7fd;
        font-family:sans-serif;
      "
    >
      <h2>
        V2\u6D4B\u8BD5\u5305\u8FD0\u884C\u9519\u8BEF
      </h2>

      <pre
        style="
          white-space:pre-wrap;
          padding:12px;
          border-radius:8px;
          background:#fff;
        "
      >${String(
      error?.stack ?? error
    )}</pre>

      <button
        id="return-city"
        style="
          min-height:42px;
          margin-right:8px;
        "
      >
        \u8FD4\u56DE\u57CE\u5E02
      </button>

      <button
        id="clear-save"
        style="
          min-height:42px;
        "
      >
        \u6E05\u9664\u6D4B\u8BD5\u5B58\u6863
      </button>
    </main>
  `;
    document.getElementById(
      "return-city"
    )?.addEventListener(
      "click",
      () => navigate(
        "city"
      )
    );
    document.getElementById(
      "clear-save"
    )?.addEventListener(
      "click",
      () => {
        saveSystem.remove(
          "auto"
        );
        location.reload();
      }
    );
  }
  function placeholderPage(title, description) {
    const navigation = gameChromeSystem.getNavigation({
      restaurantId,
      activePageId: "more"
    });
    root.innerHTML = `
    <main
      class="rg-screen"
      style="
        padding-top:20px;
      "
    >
      <section
        style="
          margin:8px;
          padding:18px;
          border:1px solid #62c9f6;
          border-radius:9px;
          background:white;
        "
      >
        <h2
          style="
            margin:0;
            color:#115486;
          "
        >
          ${title}
        </h2>

        <p
          style="
            color:#71869a;
          "
        >
          ${description}
        </p>
      </section>

      ${renderBottomNavigation(
      navigation
    )}
    </main>
  `;
    root.querySelectorAll(
      "[data-page-target]"
    ).forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => navigate(
            button.dataset.pageTarget
          )
        );
      }
    );
  }
  function navigate(pageId, passedRestaurantId = restaurantId, params = {}) {
    restaurantId = passedRestaurantId ?? restaurantId;
    saveNow();
    destroyCurrent();
    try {
      if (pageId === "properties") {
        pageId = "city";
      }
      if (pageId === "restaurant") {
        try {
          pageId = openingFlowSystem.getRecommendedPage(
            restaurantId
          );
        } catch {
          pageId = "opening-setup";
        }
      }
      if (pageId === "city") {
        currentView = new CityMapView({
          root,
          restaurantId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "property_detail") {
        if (!params.propertyId) {
          navigate(
            "city"
          );
          return;
        }
        currentView = new PropertyDetailView({
          root,
          restaurantId,
          propertyId: params.propertyId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "opening-setup") {
        currentView = new OpeningSetupView({
          onNavigate: navigate
        });
        currentView.mount(
          root,
          {
            restaurantId
          }
        );
        return;
      }
      if (pageId === "renovation") {
        currentView = new RenovationFloorplanMobileView({
          root,
          restaurantId,
          onSaved: (result) => {
            saveNow();
            if (result?.nextPage) {
              navigate(
                result.nextPage
              );
            }
          },
          onClose: (result) => {
            saveNow();
            navigate(
              result?.nextPage ?? "opening-setup"
            );
          }
        });
        currentView.mount();
        return;
      }
      if (pageId === "renovation_construction") {
        currentView = new RenovationConstructionView({
          root,
          restaurantId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "employees" || pageId === "employee_roster") {
        currentView = new EmployeeManagementView({
          root,
          restaurantId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "operations" || pageId === "dishes") {
        currentView = new DishCenterView({
          root,
          restaurantId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "restaurant_home") {
        currentView = new RestaurantHomeView({
          root,
          restaurantId,
          onNavigate: navigate
        });
        currentView.mount();
        return;
      }
      if (pageId === "more") {
        placeholderPage(
          "\u66F4\u591A\u529F\u80FD",
          "\u5F53\u524DAPK\u4E3B\u8981\u7528\u4E8E\u6D4B\u8BD5\u9009\u5740\u3001\u623F\u6E90\u3001\u88C5\u4FEE\u3001\u5F00\u5E97\u3001\u5458\u5DE5\u3001\u83DC\u54C1\u548C\u7EDF\u4E00UI\u3002"
        );
        return;
      }
      if ([
        "supply",
        "analytics",
        "finance",
        "lease",
        "employee_training",
        "employee_promotion",
        "employee_detail",
        "employee_recruitment"
      ].includes(
        pageId
      )) {
        placeholderPage(
          "\u6D4B\u8BD5\u5165\u53E3",
          `\u9875\u9762 ${pageId} \u7684\u6B63\u5F0F\u8FD0\u884C\u5165\u53E3\u8FD8\u5728\u6574\u5408\uFF0C\u672C\u6B21\u5148\u6D4B\u8BD5\u5DF2\u7ECF\u5B8C\u6210\u7684\u6838\u5FC3\u9875\u9762\u3002`
        );
        return;
      }
      placeholderPage(
        "\u9875\u9762\u5C1A\u672A\u63A5\u5165",
        `\u5F53\u524D\u6D4B\u8BD5APK\u6682\u672A\u63A5\u5165\uFF1A${pageId}`
      );
    } catch (error) {
      console.error(
        error
      );
      errorPage(
        error
      );
    }
  }
  window.addEventListener(
    "error",
    (event) => {
      console.error(
        event.error ?? event.message
      );
    }
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") {
        saveNow();
      }
    }
  );
  setInterval(
    saveNow,
    5e3
  );
  firstLaunch();
  navigate(
    "opening-setup"
  );
})();
