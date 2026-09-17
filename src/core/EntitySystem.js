import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

const clone = (value) =>
  structuredClone(value);

function normalizeType(type) {
  if (
    typeof type !== "string" ||
    type.trim() === ""
  ) {
    throw new TypeError(
      "Entity type must be a non-empty string"
    );
  }

  const normalized =
    type.trim().toLowerCase();

  if (
    !/^[a-z][a-z0-9_-]*$/.test(
      normalized
    )
  ) {
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

class EntitySystem {
  create(
    type,
    attributes = {},
    options = {}
  ) {
    const entityType =
      normalizeType(type);

    if (
      !attributes ||
      typeof attributes !== "object" ||
      Array.isArray(attributes)
    ) {
      throw new TypeError(
        "Entity attributes must be an object"
      );
    }

    return gameState.mutateSection(
      "data",
      (data) => {
        ensureData(data);

        if (
          !data.entities[entityType]
        ) {
          data.entities[entityType] = {};
        }

        if (
          !data.entityCounters[
            entityType
          ]
        ) {
          data.entityCounters[
            entityType
          ] = 0;
        }

        let id = options.id;

        if (id !== undefined) {
          if (
            typeof id !== "string" ||
            id.trim() === ""
          ) {
            throw new TypeError(
              "Custom entity id must be a non-empty string"
            );
          }

          id = id.trim();
        } else {
          data.entityCounters[
            entityType
          ] += 1;

          id =
            `${entityType}_${String(
              data.entityCounters[
                entityType
              ]
            ).padStart(6, "0")}`;
        }

        if (
          data.entities[
            entityType
          ][id]
        ) {
          throw new Error(
            `Entity "${entityType}:${id}" already exists`
          );
        }

        const entity = {
          ...clone(attributes),
          id,
          type: entityType
        };

        data.entities[
          entityType
        ][id] = entity;

        eventBus.emit(
          "entity:created",
          {
            type: entityType,
            id,
            entity: clone(entity)
          }
        );

        return entity;
      },
      `entity:create:${entityType}`
    );
  }

  get(type, id) {
    const entityType =
      normalizeType(type);

    return gameState.selectSection(
      "data",
      (data) =>
        data?.entities?.[
          entityType
        ]?.[id]
    );
  }

  exists(type, id) {
    return (
      this.get(type, id) !==
      undefined
    );
  }

  update(type, id, changes) {
    const entityType =
      normalizeType(type);

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      throw new TypeError(
        "Entity changes must be an object"
      );
    }

    if (
      "id" in changes ||
      "type" in changes
    ) {
      throw new Error(
        "Entity id and type cannot be changed"
      );
    }

    return gameState.mutateSection(
      "data",
      (data) => {
        ensureData(data);

        const current =
          data.entities?.[
            entityType
          ]?.[id];

        if (!current) {
          throw new Error(
            `Entity "${entityType}:${id}" does not exist`
          );
        }

        const updated = {
          ...current,
          ...clone(changes)
        };

        data.entities[
          entityType
        ][id] = updated;

        eventBus.emit(
          "entity:updated",
          {
            type: entityType,
            id,
            changes:
              clone(changes),
            entity:
              clone(updated)
          }
        );

        return updated;
      },
      `entity:update:${entityType}`
    );
  }

  remove(type, id) {
    const entityType =
      normalizeType(type);

    const result =
      gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);

          const entity =
            data.entities?.[
              entityType
            ]?.[id];

          if (!entity) {
            return {
              removed: false
            };
          }

          delete data.entities[
            entityType
          ][id];

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
          entity:
            clone(result.entity)
        }
      );
    }

    return result.removed;
  }

  list(type) {
    const entityType =
      normalizeType(type);

    return (
      gameState.selectSection(
        "data",
        (data) =>
          Object.values(
            data?.entities?.[
              entityType
            ] ?? {}
          )
      ) ?? []
    );
  }

  count(type) {
    const entityType =
      normalizeType(type);

    return (
      gameState.selectSection(
        "data",
        (data) =>
          Object.keys(
            data?.entities?.[
              entityType
            ] ?? {}
          ).length
      ) ?? 0
    );
  }

  clearType(type) {
    const entityType =
      normalizeType(type);

    const count =
      gameState.mutateSection(
        "data",
        (data) => {
          ensureData(data);

          const count =
            Object.keys(
              data.entities?.[
                entityType
              ] ?? {}
            ).length;

          data.entities[
            entityType
          ] = {};

          return count;
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
    return (
      gameState.selectSection(
        "data",
        (data) =>
          Object.keys(
            data?.entities ?? {}
          )
      ) ?? []
    );
  }
}

export const entitySystem =
  new EntitySystem();

export { EntitySystem };
