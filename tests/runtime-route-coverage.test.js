import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  CORE_PAGES
} from "../src/ui/registry/defaultPages.js";

import {
  GAMEPLAY_PAGES
} from "../src/ui/registry/gameplayPages.js";

import {
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS,
  LEGACY_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";


const androidSource =
  fs.readFileSync(
    new URL(
      "../src/ui/runtime/AndroidPlaytestEntry.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "所有正式注册页面都有明确运行时归属",
  () => {
    const registered =
      new Set(
        [
          ...CORE_PAGES,
          ...GAMEPLAY_PAGES
        ].map(
          item =>
            item.id
        )
      );


    const covered =
      new Set([
        ...MAIN_ROOT_PAGE_IDS,
        ...NATIVE_RUNTIME_PAGE_IDS,
        ...FORMAL_RUNTIME_PAGE_IDS,
        ...INTENTIONAL_PLACEHOLDER_PAGE_IDS
      ]);


    const missing =
      [...registered]
        .filter(
          id =>
            !covered.has(
              id
            )
        )
        .sort();


    assert.deepEqual(
      missing,
      [],
      `存在未接入运行时的页面：${missing.join(", ")}`
    );
  }
);


test(
  "正式页面不会重新掉回旧ID",
  () => {
    for (
      const legacy
      of LEGACY_PAGE_IDS
    ) {
      assert.equal(
        androidSource.includes(
          `"${legacy}"`
        ),
        false,
        `Android runtime 仍存在旧ID：${legacy}`
      );
    }
  }
);


test(
  "主导航落地页保持唯一",
  () => {
    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "city"
        ),
      "properties"
    );


    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "restaurant"
        ),
      "operating-command-center"
    );


    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "operations"
        ),
      "operations-home"
    );


    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "employees"
        ),
      "employee_roster"
    );


    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "more"
        ),
      "more-home"
    );
  }
);


test(
  "经营主页不再错误直达菜品页",
  () => {
    assert.match(
      androidSource,
      /pageId\s*===\s*"operations"[\s\S]{0,180}"operations-home"/
    );
  }
);


test(
  "正式运行时挂载器已接入Android入口",
  () => {
    assert.match(
      androidSource,
      /formalPageRuntime\.has/
    );

    assert.match(
      androidSource,
      /formalPageRuntime\.mount/
    );
  }
);
