import {
  spawnSync
} from "node:child_process";


const tests = [
  "tests/foundation-v2-smoke.test.js",
  "tests/gameplay-navigation.test.js",
  "tests/game-chrome-unified.test.js",

  "tests/city-property-game-ui.test.js",
  "tests/property-lease-market.test.js",
  "tests/lease-flow.test.js",

  "tests/renovation-planning.test.js",
  "tests/renovation-editor.test.js",
  "tests/renovation-mobile-page.test.js",
  "tests/renovation-construction-ui.test.js",

  "tests/opening-readiness.test.js",
  "tests/opening-flow-ui.test.js",
  "tests/opening-live-refresh.test.js",
  "tests/opening-journey-e2e.test.js",

  "tests/restaurant-home-ui.test.js",
  "tests/restaurant-home-formal-ui.test.js",

  "tests/operating-command-center.test.js",
  "tests/operating-cycle.test.js",
  "tests/operating-analytics.test.js",
  "tests/business-analytics-ui.test.js",

  "tests/dish-center-ui.test.js",
  "tests/dish-management-system.test.js",
  "tests/supply-management.test.js",
  "tests/employee-management-ui.test.js"
];


console.log(
  "========================================"
);

console.log(
  " 第二阶段 V0.1 可玩流程 Gate"
);

console.log(
  "========================================"
);


const result =
  spawnSync(
    process.execPath,
    [
      "--test",
      ...tests
    ],
    {
      stdio:
        "inherit"
    }
  );


process.exit(
  result.status ??
  1
);
