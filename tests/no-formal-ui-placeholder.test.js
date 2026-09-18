import test from "node:test";
import assert from "node:assert/strict";

import {
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  INTENTIONAL_PLACEHOLDER_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";


test(
  "正式UI与占位页面不能重叠",
  () => {
    const placeholders =
      new Set(
        INTENTIONAL_PLACEHOLDER_PAGE_IDS
      );


    const conflicts =
      FORMAL_RUNTIME_PAGE_IDS
        .filter(
          id =>
            placeholders.has(
              id
            )
        );


    assert.deepEqual(
      conflicts,
      []
    );
  }
);
