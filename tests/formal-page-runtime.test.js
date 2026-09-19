import test from "node:test";
import assert from "node:assert/strict";

import {
  formalPageRuntime,
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  pageRegistry
} from "../src/ui/registry/PageRegistry.js";

import "../src/ui/registry/defaultPages.js";
import "../src/ui/registry/gameplayPages.js";


const EXPECTED = [
  "supply",
  "finance",
  "employee_recruitment",
  "employee_detail",
  "employee_training",
  "employee_promotion",
  "workforce-capacity",
  "operating-command-center",
  "capacity",
  "reputation",
  "channels",
  "compliance-center",
  "menu-optimization",
  "menu-engineering",
  "equipment-management",
  "equipment-maintenance",
  "customers",
  "member-marketing",
  "operations-home",
  "ranking-center",
  "awards-center",
  "honor-hall",
  "award-ceremony",
  "more-home",
  "market-strategy",
  "store-progress",
  "chain",
  "lease",
  "settings",
  "brand-investments"
];


test(
  "第二阶段正式页面全部进入统一运行时",
  () => {
    assert.deepEqual(
      [...FORMAL_RUNTIME_PAGE_IDS]
        .sort(),
      [...EXPECTED]
        .sort()
    );


    for (
      const pageId
      of EXPECTED
    ) {
      assert.equal(
        formalPageRuntime.has(
          pageId
        ),
        true,
        `运行时缺少 ${pageId}`
      );


      assert.equal(
        pageRegistry.has(
          pageId
        ),
        true,
        `PageRegistry 缺少 ${pageId}`
      );
    }
  }
);
