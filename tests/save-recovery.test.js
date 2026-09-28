import test from "node:test";
import assert from "node:assert/strict";

import {
  SaveSystem,
  MemoryStorage
} from "../src/core/SaveSystem.js";

import {
  CURRENT_SAVE_FORMAT_VERSION
} from "../src/core/SaveSchema.js";

import {
  gameState
} from "../src/core/GameState.js";

import {
  dataRegistry
} from "../src/core/DataRegistry.js";


test(
  "second save keeps the previous valid record as rolling backup",
  () => {
    gameState.reset();
    dataRegistry.clear();

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "recovery-test"
      });

    gameState.setSection(
      "marker",
      {
        value:
          "first"
      }
    );

    saves.save(
      "auto"
    );

    gameState.setSection(
      "marker",
      {
        value:
          "second"
      }
    );

    saves.save(
      "auto"
    );

    assert.equal(
      saves.hasBackup(
        "auto"
      ),
      true
    );

    storage.setItem(
      saves.getKey(
        "auto"
      ),
      "{broken-json"
    );

    gameState.setSection(
      "marker",
      {
        value:
          "runtime"
      }
    );

    const loaded =
      saves.load(
        "auto"
      );

    assert.equal(
      loaded.source,
      "backup"
    );

    assert.equal(
      gameState
        .getSection(
          "marker"
        )
        .value,
      "first"
    );

    assert.doesNotThrow(
      () =>
        JSON.parse(
          storage.getItem(
            saves.getKey(
              "auto"
            )
          )
        )
    );
  }
);


test(
  "future-format primary save is never replaced by an older backup",
  () => {
    gameState.reset();
    dataRegistry.clear();

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "future-guard"
      });

    gameState.setSection(
      "marker",
      {
        value:
          "backup"
      }
    );

    saves.save(
      "auto"
    );

    storage.setItem(
      saves.getBackupKey(
        "auto"
      ),
      storage.getItem(
        saves.getKey(
          "auto"
        )
      )
    );

    const future =
      JSON.parse(
        storage.getItem(
          saves.getKey(
            "auto"
          )
        )
      );

    future.formatVersion =
      CURRENT_SAVE_FORMAT_VERSION +
      1;

    storage.setItem(
      saves.getKey(
        "auto"
      ),
      JSON.stringify(
        future
      )
    );

    gameState.setSection(
      "marker",
      {
        value:
          "current"
      }
    );

    assert.throws(
      () =>
        saves.load(
          "auto"
        ),
      /future format version/
    );

    assert.equal(
      gameState
        .getSection(
          "marker"
        )
        .value,
      "current"
    );
  }
);


test(
  "removing a save clears primary and backup together",
  () => {
    gameState.reset();
    dataRegistry.clear();

    const storage =
      new MemoryStorage();

    const saves =
      new SaveSystem({
        storage,
        prefix:
          "remove-test"
      });

    saves.save(
      "auto"
    );

    gameState.setSection(
      "marker",
      {
        value:
          "next"
      }
    );

    saves.save(
      "auto"
    );

    assert.equal(
      saves.hasBackup(
        "auto"
      ),
      true
    );

    assert.equal(
      saves.remove(
        "auto"
      ),
      true
    );

    assert.equal(
      saves.has(
        "auto"
      ),
      false
    );

    assert.equal(
      saves.hasBackup(
        "auto"
      ),
      false
    );
  }
);
