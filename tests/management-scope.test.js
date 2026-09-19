import test from "node:test";
import assert from "node:assert/strict";

import {
  ManagementScopeSystem
} from "../src/ui/components/ManagementScopeSystem.js";

test("一家门店固定为单店作用域", () => {
  const system = new ManagementScopeSystem();
  system.setGroup("store_1");

  assert.deepEqual(
    system.normalize([{ id: "store_1", name: "东门小馆" }], "store_1"),
    { type: "store", storeId: "store_1" }
  );
});

test("两家门店后允许保留集团作用域并切换门店", () => {
  const system = new ManagementScopeSystem();
  const stores = [
    { id: "store_1", name: "东门小馆" },
    { id: "store_2", name: "滨河店" }
  ];

  system.setGroup("store_1");
  assert.equal(system.normalize(stores, "store_1").type, "group");

  assert.deepEqual(
    system.setStore("store_2"),
    { type: "store", storeId: "store_2" }
  );
});
