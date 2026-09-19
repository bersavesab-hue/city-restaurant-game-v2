import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/new-player-full-journey-e2e.test.js",
  "tests/phase7-ux-integration.test.js",
  "tests/award-ceremony.test.js",
  "tests/formal-page-module-load.test.js",
  "tests/pre-release-playtest-acceptance.test.js",
  "tests/runtime-route-coverage.test.js",
  "tests/no-formal-ui-placeholder.test.js",
  "tests/phase8-release-integration.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 发布前试玩验收 Gate"
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
        "inherit",
      env: {
        ...process.env
      }
    }
  );

process.exit(
  result.status ??
  1
);
