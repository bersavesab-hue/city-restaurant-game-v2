import test from "node:test";
import assert from "node:assert/strict";

import {
  CURRENT_STATE_SCHEMA_VERSION,
  CURRENT_SAVE_FORMAT_VERSION
} from "../src/core/SaveSchema.js";

import {
  migrationSystem
} from "../src/core/MigrationSystem.js";

import {
  SaveSystem,
  MemoryStorage
} from "../src/core/SaveSystem.js";

import {
  gameState
} from "../src/core/GameState.js";

import {
  dataRegistry
} from "../src/core/DataRegistry.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";


function createLegacyState({
  withSchemaVersion = true
} = {}) {
  return {
    meta:
      withSchemaVersion
        ? {
            schemaVersion: 1,
            createdAt: 100,
            updatedAt: 200
          }
        : {
            createdAt: 100,
            updatedAt: 200
          },

    time: {
      day: 12,
      hour: 9,
      minute: 30,
      totalMinutes: 16000
    },

    runtime: {
      paused: false,
      speed: 4
    },

    data: {
      entities: {
        restaurant: {
          restaurant_000042: {
            id:
              "restaurant_000042",
            type:
              "restaurant",
            name:
              "V1老存档餐厅"
          }
        },

        member_profile: {
          member_profile_000007: {
            id:
              "member_profile_000007",
            type:
              "member_profile",
            restaurantId:
              "restaurant_000042"
          }
        }
      },

      entityCounters: {
        restaurant: 3
      }
    },

    legacyMarker: {
      keep:
        "必须保留"
    }
  };
}


test(
  "V1状态可迁移到V2并重建实体计数器与核心运行区",
  () => {
    const migrated =
      migrationSystem
        .migrateState(
          createLegacyState()
        );

    assert.equal(
      migrated.meta
        .schemaVersion,
      CURRENT_STATE_SCHEMA_VERSION
    );

    assert.equal(
      migrated.data
        .entityCounters
        .restaurant,
      42
    );

    assert.equal(
      migrated.data
        .entityCounters
        .member_profile,
      7
    );

    assert.deepEqual(
      migrated.scheduler,
      {
        nextId: 1,
        tasks: []
      }
    );

    assert.deepEqual(
      migrated.simulation,
      {
        processedMinutes: 0,
        processedHours: 0,
        processedDays: 0,
        ticks: 0
      }
    );

    assert.equal(
      migrated.legacyMarker
        .keep,
      "必须保留"
    );

    assert.equal(
      migrationSystem
        .canMigrate(
          1
        ),
      true
    );
  }
);


test(
  "formatVersion 1无schemaVersion老存档可加载且不会覆盖当前静态数据注册表",
  () => {
    gameState.reset();
    dataRegistry.clear();

    dataRegistry.register(
      "current_catalog",
      [
        {
          id:
            "current_item",
          value: 99
        }
      ]
    );

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "legacy-format-1"
      });

    storage.setItem(
      saves.getKey(
        "slot1"
      ),
      JSON.stringify({
        formatVersion: 1,
        savedAt: 123,
        state:
          createLegacyState({
            withSchemaVersion:
              false
          })
      })
    );

    const loaded =
      saves.load(
        "slot1"
      );

    assert.ok(loaded);

    assert.equal(
      gameState
        .getSection("meta")
        .schemaVersion,
      CURRENT_STATE_SCHEMA_VERSION
    );

    assert.equal(
      dataRegistry.get(
        "current_catalog",
        "current_item"
      ).value,
      99
    );

    const next =
      entitySystem.create(
        "restaurant",
        {
          name:
            "迁移后新餐厅"
        }
      );

    assert.equal(
      next.id,
      "restaurant_000043"
    );
  }
);


test(
  "formatVersion 2的V1状态会迁移并恢复随存档保存的数据注册表",
  () => {
    gameState.reset();
    dataRegistry.clear();

    dataRegistry.register(
      "current_catalog",
      [
        {
          id:
            "before_load",
          value: 1
        }
      ]
    );

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "legacy-format-2"
      });

    storage.setItem(
      saves.getKey(
        "slot1"
      ),
      JSON.stringify({
        formatVersion: 2,
        savedAt: 456,
        state:
          createLegacyState(),

        registry: {
          legacy_catalog: [
            {
              id:
                "legacy_item",
              value: 7
            }
          ]
        }
      })
    );

    saves.load(
      "slot1"
    );

    assert.equal(
      gameState
        .getSection("meta")
        .schemaVersion,
      CURRENT_STATE_SCHEMA_VERSION
    );

    assert.equal(
      dataRegistry.hasCollection(
        "current_catalog"
      ),
      false
    );

    assert.equal(
      dataRegistry.get(
        "legacy_catalog",
        "legacy_item"
      ).value,
      7
    );
  }
);


test(
  "坏存档加载失败时自动回滚当前GameState和DataRegistry",
  () => {
    gameState.reset();
    dataRegistry.clear();

    gameState.setSection(
      "currentSession",
      {
        marker:
          "keep_me"
      }
    );

    dataRegistry.register(
      "current_catalog",
      [
        {
          id:
            "safe_item",
          value: 88
        }
      ]
    );

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "rollback-test"
      });

    storage.setItem(
      saves.getKey(
        "broken"
      ),
      JSON.stringify({
        formatVersion: 2,
        savedAt: 789,
        state:
          createLegacyState(),

        registry: {
          broken_catalog: [
            {
              id:
                "duplicate"
            },
            {
              id:
                "duplicate"
            }
          ]
        }
      })
    );

    assert.throws(
      () =>
        saves.load(
          "broken"
        ),
      /Duplicate id/
    );

    assert.equal(
      gameState
        .getSection(
          "currentSession"
        )
        .marker,
      "keep_me"
    );

    assert.equal(
      dataRegistry.get(
        "current_catalog",
        "safe_item"
      ).value,
      88
    );

    assert.equal(
      dataRegistry.hasCollection(
        "broken_catalog"
      ),
      false
    );
  }
);


test(
  "未来版本存档拒绝降级且不会污染当前会话",
  () => {
    gameState.reset();
    dataRegistry.clear();

    gameState.setSection(
      "currentSession",
      {
        marker:
          "future_guard"
      }
    );

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "future-save"
      });

    const futureState =
      createLegacyState();

    futureState.meta
      .schemaVersion =
      CURRENT_STATE_SCHEMA_VERSION +
      1;

    storage.setItem(
      saves.getKey(
        "future"
      ),
      JSON.stringify({
        formatVersion:
          CURRENT_SAVE_FORMAT_VERSION,

        savedAt: 999,
        state:
          futureState,

        registry: {}
      })
    );

    assert.throws(
      () =>
        saves.load(
          "future"
        ),
      /Cannot downgrade state/
    );

    assert.equal(
      gameState
        .getSection(
          "currentSession"
        )
        .marker,
      "future_guard"
    );
  }
);


test(
  "新存档固定写入当前formatVersion和schemaVersion",
  () => {
    gameState.reset();
    dataRegistry.clear();

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "current-save"
      });

    const record =
      saves.save(
        "slot1"
      );

    assert.equal(
      record.formatVersion,
      CURRENT_SAVE_FORMAT_VERSION
    );

    assert.equal(
      record.state.meta
        .schemaVersion,
      CURRENT_STATE_SCHEMA_VERSION
    );
  }
);
