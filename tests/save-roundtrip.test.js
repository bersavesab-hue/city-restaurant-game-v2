import test from "node:test";
import assert from "node:assert/strict";

import {
  SaveSystem,
  MemoryStorage
} from "../src/core/SaveSystem.js";

import { gameState } from "../src/core/GameState.js";
import { dataRegistry } from "../src/core/DataRegistry.js";
import { entitySystem } from "../src/core/EntitySystem.js";

test(
  "完整存档恢复：GameState + Entity + DataRegistry",
  () => {
    gameState.reset();
    dataRegistry.clear();

    dataRegistry.register(
      "test_catalog",
      [
        {
          id: "item_a",
          name: "测试数据",
          value: 123
        }
      ]
    );

    const restaurant =
      entitySystem.create(
        "restaurant",
        {
          name: "存档测试店",
          moneyMarker: 999
        }
      );

    gameState.setSection(
      "custom",
      {
        marker:
          "before_save"
      }
    );

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix: "test"
      });

    saves.save("slot1");

    gameState.reset();
    dataRegistry.clear();

    assert.equal(
      entitySystem.count(
        "restaurant"
      ),
      0
    );

    assert.equal(
      dataRegistry.count(
        "test_catalog"
      ),
      0
    );

    const loaded =
      saves.load("slot1");

    assert.ok(loaded);

    assert.equal(
      entitySystem.get(
        "restaurant",
        restaurant.id
      ).name,
      "存档测试店"
    );

    assert.equal(
      dataRegistry.get(
        "test_catalog",
        "item_a"
      ).value,
      123
    );

    assert.equal(
      gameState
        .getSection("custom")
        .marker,
      "before_save"
    );
  }
);

test(
  "高频状态事件不再携带整个游戏快照",
  async () => {
    const {
      eventBus
    } = await import(
      "../src/core/EventBus.js"
    );

    let payload = null;

    const off =
      eventBus.once(
        "state:changed",
        (value) => {
          payload = value;
        }
      );

    gameState.setSection(
      "performance_test",
      { value: 1 }
    );

    off();

    assert.ok(payload);
    assert.equal(
      "state" in payload,
      false
    );

    assert.equal(
      payload.section,
      "performance_test"
    );
  }
);
